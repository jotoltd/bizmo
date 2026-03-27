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
                throw APIError.message("Could not parse server response.")
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
                URLQueryItem(name: "select", value: "id,type,title,body,read,created_at"),
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
}
