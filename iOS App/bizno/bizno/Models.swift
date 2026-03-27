import Foundation

struct SupabaseUser: Codable {
    let id: String
    let email: String?
}

struct SupabaseSession: Codable {
    let accessToken: String
    let refreshToken: String
    let user: SupabaseUser

    enum CodingKeys: String, CodingKey {
        case accessToken = "access_token"
        case refreshToken = "refresh_token"
        case user
    }
}

struct SupabaseAuthResponse: Codable {
    let accessToken: String?
    let refreshToken: String?
    let user: SupabaseUser?

    enum CodingKeys: String, CodingKey {
        case accessToken = "access_token"
        case refreshToken = "refresh_token"
        case user
    }

    var session: SupabaseSession? {
        guard let accessToken, let refreshToken, let user else {
            return nil
        }
        return SupabaseSession(accessToken: accessToken, refreshToken: refreshToken, user: user)
    }
}

struct UserNotification: Codable, Identifiable {
    let id: String
    let type: String
    let title: String
    let body: String?
    let read: Bool
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case type
        case title
        case body
        case read
        case createdAt = "created_at"
    }
}

struct UserEmailPreferences: Codable {
    let userId: String
    var invitationEmails: Bool
    var invitationResponseEmails: Bool
    var activityEmails: Bool
    var announcementEmails: Bool
    let updatedAt: Date

    enum CodingKeys: String, CodingKey {
        case userId = "user_id"
        case invitationEmails = "invitation_emails"
        case invitationResponseEmails = "invitation_response_emails"
        case activityEmails = "activity_emails"
        case announcementEmails = "announcement_emails"
        case updatedAt = "updated_at"
    }
}

enum AuthMode: String, CaseIterable {
    case signIn = "Sign In"
    case signUp = "Sign Up"
}

enum NotificationFilter: String, CaseIterable, Identifiable {
    case all = "All"
    case tasks = "Tasks"
    case deadlines = "Deadlines"
    case team = "Team"

    var id: String { rawValue }

    func includes(type: String) -> Bool {
        switch self {
        case .all:
            return true
        case .tasks:
            return ["task_completed", "task_assigned"].contains(type)
        case .deadlines:
            return ["deadline_approaching", "deadline_missed"].contains(type)
        case .team:
            return [
                "invitation_received",
                "invitation_accepted",
                "invitation_rejected",
                "invitation_expired",
                "member_removed",
                "role_changed",
                "ownership_transferred"
            ].contains(type)
        }
    }
}

enum APIError: LocalizedError {
    case missingConfiguration
    case invalidResponse
    case message(String)

    var errorDescription: String? {
        switch self {
        case .missingConfiguration:
            return "Supabase is not configured. Update AppConfig.swift with your anon key."
        case .invalidResponse:
            return "Received an invalid response from the server."
        case .message(let message):
            return message
        }
    }
}
