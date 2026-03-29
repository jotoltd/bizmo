import Foundation

// MARK: - Business Models
struct Business: Codable, Identifiable {
    let id: String
    let userId: String
    let name: String
    let type: String
    let completedTasks: [String]
    let viewPreference: String?
    let status: String?
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case name
        case type
        case completedTasks = "completed_tasks"
        case viewPreference = "view_preference"
        case status
        case createdAt = "created_at"
    }
}

enum BusinessType: String, Codable, CaseIterable {
    case limitedCompany = "limited_company"
    case soleTrader = "sole_trader"
    case partnership = "partnership"
    case llp = "llp"
    case other = "other"

    var displayName: String {
        switch self {
        case .limitedCompany: return "Limited Company"
        case .soleTrader: return "Sole Trader"
        case .partnership: return "Partnership"
        case .llp: return "LLP"
        case .other: return "Other"
        }
    }

    var icon: String {
        switch self {
        case .limitedCompany: return "building.2.fill"
        case .soleTrader: return "person.fill"
        case .partnership: return "person.2.fill"
        case .llp: return "building.columns.fill"
        case .other: return "briefcase.fill"
        }
    }
}

struct BusinessStep: Codable, Identifiable {
    let id: String
    let businessId: String
    let stepKey: String
    let title: String
    let description: String?
    let isCompleted: Bool
    let completedAt: Date?
    let dueAt: Date?
    let orderIndex: Int
    let metadata: [String: String]?

    enum CodingKeys: String, CodingKey {
        case id
        case businessId = "business_id"
        case stepKey = "step_key"
        case title
        case description
        case isCompleted = "is_completed"
        case completedAt = "completed_at"
        case dueAt = "due_at"
        case orderIndex = "order_index"
        case metadata
    }
}

// MARK: - Business Activity
struct BusinessActivity: Codable, Identifiable {
    let id: String
    let action: String
    let businessID: String
    let userID: String
    let metadata: [String: String]?
    let createdAt: String
    
    enum CodingKeys: String, CodingKey {
        case id, action, metadata
        case businessID = "business_id"
        case userID = "user_id"
        case createdAt = "created_at"
    }
}

// MARK: - Roadmap Step (Template)
struct RoadmapPhase: Codable, Identifiable {
    let id: String
    let title: String
    let description: String
    let sortOrder: Int
    
    enum CodingKeys: String, CodingKey {
        case id, title, description
        case sortOrder = "sort_order"
    }
}

struct RoadmapStep: Codable, Identifiable {
    let id: String
    let phaseId: String
    let title: String
    let description: String?
    let why: String?
    let how: [String]?
    let affiliateLink: String?
    let affiliateName: String?
    let mandatory: Bool
    let status: String
    let sortOrder: Int

    enum CodingKeys: String, CodingKey {
        case id
        case phaseId = "phase_id"
        case title
        case description
        case why
        case how
        case affiliateLink = "affiliate_link"
        case affiliateName = "affiliate_name"
        case mandatory
        case status
        case sortOrder = "sort_order"
    }
}

struct Invitation: Codable, Identifiable {
    let id: String
    let businessId: String
    let invitedByEmail: String
    let role: String
    let status: InvitationStatus
    let createdAt: Date
    let expiresAt: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case businessId = "business_id"
        case invitedByEmail = "invited_email"
        case role
        case status
        case createdAt = "created_at"
        case expiresAt = "expires_at"
    }
}

enum InvitationStatus: String, Codable {
    case pending = "pending"
    case accepted = "accepted"
    case rejected = "rejected"
    case expired = "expired"
}

struct TeamMember: Codable, Identifiable {
    let id: String
    let userId: String
    let email: String
    let role: String
    let invitedBy: String
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case email
        case role
        case invitedBy = "invited_by"
        case createdAt = "created_at"
    }
}

enum BusinessFilter: String, CaseIterable, Identifiable {
    case all = "All"
    case inProgress = "In Progress"
    case completed = "Completed"

    var id: String { rawValue }
}
