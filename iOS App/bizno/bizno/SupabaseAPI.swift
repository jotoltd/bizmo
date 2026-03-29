import Foundation

struct SupabaseAPI {
    private let decoder: JSONDecoder = {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return decoder
    }()

    private let encoder = JSONEncoder()

    private func request(
        path: String,
        method: String = "GET",
        bearer: String? = nil,
        body: Data? = nil,
        extraHeaders: [String: String] = [:],
        queryItems: [URLQueryItem] = []
    ) throws -> URLRequest {
        guard AppConfig.isConfigured else {
            throw APIError.missingConfiguration
        }

        let baseURL = AppConfig.supabaseURL.appending(path: path)
        var components = URLComponents(url: baseURL, resolvingAgainstBaseURL: false)
        if !queryItems.isEmpty {
            components?.queryItems = queryItems
        }

        guard let url = components?.url else {
            throw APIError.invalidResponse
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.httpBody = body
        request.setValue(AppConfig.supabaseAnonKey, forHTTPHeaderField: "apikey")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let bearer {
            request.setValue("Bearer \(bearer)", forHTTPHeaderField: "Authorization")
        }
        for (key, value) in extraHeaders {
            request.setValue(value, forHTTPHeaderField: key)
        }
        return request
    }

    private func perform<T: Decodable>(_ request: URLRequest, as: T.Type) async throws -> T {
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        if (200...299).contains(http.statusCode) {
            do {
                return try decoder.decode(T.self, from: data)
            } catch {
                throw APIError.message("Could not parse server response: \(error.localizedDescription)")
            }
        }

        if http.statusCode == 401 {
            let errorMsg = Self.extractServerMessage(from: data) ?? ""
            if errorMsg.contains("JWT") || errorMsg.contains("token") || errorMsg.contains("expired") {
                throw APIError.tokenExpired
            }
        }

        throw APIError.message(Self.extractServerMessage(from: data) ?? "Request failed with status \(http.statusCode).")
    }

    private func performNoContent(_ request: URLRequest) async throws {
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        guard (200...299).contains(http.statusCode) else {
            throw APIError.message(Self.extractServerMessage(from: data) ?? "Request failed with status \(http.statusCode).")
        }
    }

    private static func extractServerMessage(from data: Data) -> String? {
        guard !data.isEmpty,
              let raw = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
        else {
            return nil
        }

        return raw["msg"] as? String ?? raw["message"] as? String ?? raw["error_description"] as? String
    }

    func signIn(email: String, password: String) async throws -> SupabaseSession {
        let payload = ["email": email, "password": password]
        let body = try encoder.encode(payload)
        let request = try request(
            path: "/auth/v1/token",
            method: "POST",
            body: body,
            queryItems: [URLQueryItem(name: "grant_type", value: "password")]
        )
        let response = try await perform(request, as: SupabaseAuthResponse.self)

        guard let session = response.session else {
            throw APIError.message("Sign in succeeded but no session was returned.")
        }

        return session
    }

    func refreshToken(refreshToken: String) async throws -> SupabaseSession {
        let payload = ["refresh_token": refreshToken]
        let body = try encoder.encode(payload)
        let request = try request(
            path: "/auth/v1/token",
            method: "POST",
            body: body,
            queryItems: [URLQueryItem(name: "grant_type", value: "refresh_token")]
        )
        let response = try await perform(request, as: SupabaseAuthResponse.self)

        guard let session = response.session else {
            throw APIError.message("Token refresh failed.")
        }

        return session
    }

    func signUp(email: String, password: String) async throws -> SupabaseAuthResponse {
        let payload = ["email": email, "password": password]
        let body = try encoder.encode(payload)
        let request = try request(path: "/auth/v1/signup", method: "POST", body: body)
        return try await perform(request, as: SupabaseAuthResponse.self)
    }

    func fetchNotifications(accessToken: String) async throws -> [UserNotification] {
        let request = try request(
            path: "/rest/v1/user_notifications",
            bearer: accessToken,
            queryItems: [
                URLQueryItem(name: "select", value: "id,type,title,body,data,read,created_at"),
                URLQueryItem(name: "order", value: "created_at.desc"),
                URLQueryItem(name: "limit", value: "50")
            ]
        )
        return try await perform(request, as: [UserNotification].self)
    }

    func markAllNotificationsRead(userID: String, accessToken: String) async throws {
        let payload: [String: Any] = [
            "read": true,
            "read_at": ISO8601DateFormatter().string(from: Date())
        ]
        let body = try JSONSerialization.data(withJSONObject: payload)
        let request = try request(
            path: "/rest/v1/user_notifications",
            method: "PATCH",
            bearer: accessToken,
            body: body,
            extraHeaders: ["Prefer": "return=minimal"],
            queryItems: [
                URLQueryItem(name: "user_id", value: "eq.\(userID)"),
                URLQueryItem(name: "read", value: "eq.false")
            ]
        )
        try await performNoContent(request)
    }

    func fetchEmailPreferences(userID: String, accessToken: String) async throws -> UserEmailPreferences? {
        let request = try request(
            path: "/rest/v1/user_email_preferences",
            bearer: accessToken,
            queryItems: [
                URLQueryItem(name: "user_id", value: "eq.\(userID)"),
                URLQueryItem(name: "select", value: "user_id,invitation_emails,invitation_response_emails,activity_emails,announcement_emails,updated_at"),
                URLQueryItem(name: "limit", value: "1")
            ]
        )
        let preferences = try await perform(request, as: [UserEmailPreferences].self)
        return preferences.first
    }

    func updateEmailPreferences(userID: String, accessToken: String, preferences: UserEmailPreferences) async throws {
        let payload: [String: Any] = [
            "user_id": userID,
            "invitation_emails": preferences.invitationEmails,
            "invitation_response_emails": preferences.invitationResponseEmails,
            "activity_emails": preferences.activityEmails,
            "announcement_emails": preferences.announcementEmails
        ]
        let body = try JSONSerialization.data(withJSONObject: payload)
        let request = try request(
            path: "/rest/v1/user_email_preferences",
            method: "POST",
            bearer: accessToken,
            body: body,
            extraHeaders: ["Prefer": "resolution=merge-duplicates,return=minimal"]
        )
        try await performNoContent(request)
    }

    func upsertDeviceToken(userID: String, accessToken: String, deviceToken: String, environment: String) async throws {
        let payload: [String: Any] = [
            "user_id": userID,
            "device_token": deviceToken,
            "platform": "ios",
            "push_provider": "apns",
            "environment": environment,
            "is_active": true,
            "last_seen_at": ISO8601DateFormatter().string(from: Date())
        ]
        let body = try JSONSerialization.data(withJSONObject: payload)
        let request = try request(
            path: "/rest/v1/mobile_device_tokens",
            method: "POST",
            bearer: accessToken,
            body: body,
            extraHeaders: ["Prefer": "resolution=merge-duplicates,return=minimal"],
            queryItems: [
                URLQueryItem(name: "on_conflict", value: "device_token")
            ]
        )
        try await performNoContent(request)
    }

    // MARK: - Businesses

    func fetchBusinesses(accessToken: String, userID: String) async throws -> [Business] {
        let request = try request(
            path: "/rest/v1/businesses",
            bearer: accessToken,
            queryItems: [
                URLQueryItem(name: "select", value: "id,user_id,name,type,completed_tasks,view_preference,status,created_at,business_memberships!inner(user_id)"),
                URLQueryItem(name: "business_memberships.user_id", value: "eq.\(userID)"),
                URLQueryItem(name: "order", value: "created_at.desc")
            ]
        )
        return try await perform(request, as: [Business].self)
    }

    func createBusiness(name: String, type: BusinessType, userID: String, accessToken: String) async throws -> Business {
        let payload: [String: Any] = [
            "name": name,
            "type": type.rawValue,
            "user_id": userID,
            "completed_tasks": []
        ]
        let body = try JSONSerialization.data(withJSONObject: payload)
        let request = try request(
            path: "/rest/v1/businesses",
            method: "POST",
            bearer: accessToken,
            body: body,
            extraHeaders: ["Prefer": "return=representation"]
        )
        let createdBusinesses = try await perform(request, as: [Business].self)
        guard let business = createdBusinesses.first else {
            throw APIError.message("Business created but no record was returned.")
        }
        return business
    }

    func deleteBusiness(businessID: String, accessToken: String) async throws {
        let request = try request(
            path: "/rest/v1/businesses",
            method: "DELETE",
            bearer: accessToken,
            queryItems: [
                URLQueryItem(name: "id", value: "eq.\(businessID)")
            ]
        )
        try await performNoContent(request)
    }

    // MARK: - Business Steps

    func fetchRoadmapPhases(accessToken: String) async throws -> [RoadmapPhase] {
        let request = try request(
            path: "/rest/v1/roadmap_phases",
            bearer: accessToken,
            queryItems: [
                URLQueryItem(name: "select", value: "id,title,description,sort_order"),
                URLQueryItem(name: "status", value: "eq.published"),
                URLQueryItem(name: "order", value: "sort_order.asc")
            ]
        )
        return try await perform(request, as: [RoadmapPhase].self)
    }

    func fetchBusinessSteps(accessToken: String) async throws -> [RoadmapStep] {
        let request = try request(
            path: "/rest/v1/roadmap_steps",
            bearer: accessToken,
            queryItems: [
                URLQueryItem(name: "select", value: "id,phase_id,title,description,why,how,affiliate_link,affiliate_name,mandatory,status,sort_order"),
                URLQueryItem(name: "status", value: "eq.published"),
                URLQueryItem(name: "order", value: "sort_order.asc")
            ]
        )
        return try await perform(request, as: [RoadmapStep].self)
    }

    func toggleStepComplete(businessID: String, stepID: String, isCompleted: Bool, accessToken: String) async throws {
        // Simple struct to decode just completed_tasks
        struct BusinessTasks: Codable {
            let completedTasks: [String]
            
            enum CodingKeys: String, CodingKey {
                case completedTasks = "completed_tasks"
            }
        }
        
        // First, fetch current business to get completed_tasks
        let getRequest = try request(
            path: "/rest/v1/businesses",
            bearer: accessToken,
            queryItems: [
                URLQueryItem(name: "select", value: "completed_tasks"),
                URLQueryItem(name: "id", value: "eq.\(businessID)")
            ]
        )
        
        let businesses = try await perform(getRequest, as: [BusinessTasks].self)
        guard let business = businesses.first else {
            throw APIError.message("Business not found")
        }
        
        // Update completed_tasks array
        var completedTasks = business.completedTasks
        if isCompleted {
            if !completedTasks.contains(stepID) {
                completedTasks.append(stepID)
            }
        } else {
            completedTasks.removeAll { $0 == stepID }
        }
        
        // Update business with new completed_tasks
        let payload: [String: Any] = ["completed_tasks": completedTasks]
        let body = try JSONSerialization.data(withJSONObject: payload)
        let request = try request(
            path: "/rest/v1/businesses",
            method: "PATCH",
            bearer: accessToken,
            body: body,
            extraHeaders: ["Prefer": "return=minimal"],
            queryItems: [
                URLQueryItem(name: "id", value: "eq.\(businessID)")
            ]
        )
        try await performNoContent(request)
    }

    // MARK: - Activity Log
    
    func fetchBusinessActivityLog(businessID: String, accessToken: String) async throws -> [BusinessActivity] {
        let request = try request(
            path: "/rest/v1/business_activity",
            bearer: accessToken,
            queryItems: [
                URLQueryItem(name: "select", value: "id,action,business_id,user_id,metadata,created_at"),
                URLQueryItem(name: "business_id", value: "eq.\(businessID)"),
                URLQueryItem(name: "order", value: "created_at.desc"),
                URLQueryItem(name: "limit", value: "50")
            ]
        )
        return try await perform(request, as: [BusinessActivity].self)
    }
    
    // MARK: - Invitations

    func fetchPendingInvitations(accessToken: String) async throws -> [Invitation] {
        let request = try request(
            path: "/rest/v1/business_invitations",
            bearer: accessToken,
            queryItems: [
                URLQueryItem(name: "status", value: "eq.pending"),
                URLQueryItem(name: "select", value: "id,business_id,invited_email,role,status,created_at,expires_at"),
                URLQueryItem(name: "order", value: "created_at.desc")
            ]
        )
        return try await perform(request, as: [Invitation].self)
    }

    func respondToInvitation(invitationID: String, accept: Bool, accessToken: String) async throws {
        let payload: [String: Any] = [
            "status": accept ? "accepted" : "rejected",
            "responded_at": ISO8601DateFormatter().string(from: Date())
        ]
        let body = try JSONSerialization.data(withJSONObject: payload)
        let request = try request(
            path: "/rest/v1/business_invitations",
            method: "PATCH",
            bearer: accessToken,
            body: body,
            extraHeaders: ["Prefer": "return=minimal"],
            queryItems: [
                URLQueryItem(name: "id", value: "eq.\(invitationID)")
            ]
        )
        try await performNoContent(request)
    }

    func inviteTeamMember(businessID: String, email: String, role: String, accessToken: String) async throws {
        let payload: [String: Any] = [
            "business_id": businessID,
            "invited_email": email,
            "role": role
        ]
        let body = try JSONSerialization.data(withJSONObject: payload)
        let request = try request(
            path: "/rest/v1/business_invitations",
            method: "POST",
            bearer: accessToken,
            body: body,
            extraHeaders: ["Prefer": "return=minimal"]
        )
        try await performNoContent(request)
    }

    // MARK: - Team Members

    func fetchTeamMembers(businessID: String, accessToken: String) async throws -> [TeamMember] {
        // First get memberships
        let membershipsRequest = try request(
            path: "/rest/v1/business_memberships",
            bearer: accessToken,
            queryItems: [
                URLQueryItem(name: "business_id", value: "eq.\(businessID)"),
                URLQueryItem(name: "select", value: "id,user_id,role,invited_by,created_at"),
                URLQueryItem(name: "order", value: "created_at.desc")
            ]
        )
        
        struct Membership: Codable, Identifiable {
            let id: String
            let userId: String
            let role: String
            let invitedBy: String
            let createdAt: Date
            
            enum CodingKeys: String, CodingKey {
                case id
                case userId = "user_id"
                case role
                case invitedBy = "invited_by"
                case createdAt = "created_at"
            }
        }
        
        let memberships = try await perform(membershipsRequest, as: [Membership].self)
        
        // Convert to TeamMember objects with placeholder emails
        return memberships.map { membership in
            TeamMember(
                id: membership.id,
                userId: membership.userId,
                email: "team_member@\(membership.userId)", // Placeholder email
                role: membership.role,
                invitedBy: membership.invitedBy,
                createdAt: membership.createdAt
            )
        }
    }
    
    // MARK: - Team Invitations
    
    func fetchBusinessPendingInvitations(businessID: String, accessToken: String) async throws -> [Invitation] {
        let request = try request(
            path: "/rest/v1/business_invitations",
            bearer: accessToken,
            queryItems: [
                URLQueryItem(name: "status", value: "eq.pending"),
                URLQueryItem(name: "business_id", value: "eq.\(businessID)"),
                URLQueryItem(name: "select", value: "id,business_id,invited_email,role,status,created_at,expires_at"),
                URLQueryItem(name: "order", value: "created_at.desc")
            ]
        )
        return try await perform(request, as: [Invitation].self)
    }
    
    func cancelInvitation(invitationID: String, accessToken: String) async throws {
        let request = try request(
            path: "/rest/v1/business_invitations",
            method: "DELETE",
            bearer: accessToken,
            extraHeaders: ["Prefer": "return=minimal"],
            queryItems: [
                URLQueryItem(name: "id", value: "eq.\(invitationID)")
            ]
        )
        try await performNoContent(request)
    }
    
    func removeTeamMember(membershipID: String, accessToken: String) async throws {
        let request = try request(
            path: "/rest/v1/business_memberships",
            method: "DELETE",
            bearer: accessToken,
            extraHeaders: ["Prefer": "return=minimal"],
            queryItems: [
                URLQueryItem(name: "id", value: "eq.\(membershipID)")
            ]
        )
        try await performNoContent(request)
    }
    
    func updateBusiness(businessID: String, name: String?, type: String?, accessToken: String) async throws {
        var updates: [String: Any] = [:]
        if let name = name {
            updates["name"] = name
        }
        if let type = type {
            updates["type"] = type
        }
        
        let body = try JSONSerialization.data(withJSONObject: updates)
        
        let request = try request(
            path: "/rest/v1/businesses",
            method: "PATCH",
            bearer: accessToken,
            body: body,
            extraHeaders: ["Prefer": "return=minimal"],
            queryItems: [
                URLQueryItem(name: "id", value: "eq.\(businessID)")
            ]
        )
        try await performNoContent(request)
    }
}
