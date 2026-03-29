import SwiftUI

// MARK: - Activity Row
struct ActivityRow: View {
    let activity: BusinessActivity
    
    private var activityIcon: String {
        switch activity.action {
        case "step_completed":
            return "checkmark.circle.fill"
        case "step_uncompleted":
            return "xmark.circle.fill"
        case "business_created":
            return "plus.circle.fill"
        case "team_member_added":
            return "person.badge.plus.fill"
        case "team_member_removed":
            return "person.badge.minus.fill"
        default:
            return "info.circle.fill"
        }
    }
    
    private var activityColor: Color {
        switch activity.action {
        case "step_completed":
            return .biznoSuccess
        case "step_uncompleted":
            return .biznoWarning
        case "business_created":
            return .biznoElectric
        case "team_member_added":
            return .biznoSuccess
        case "team_member_removed":
            return .biznoWarning
        default:
            return .biznoSecondaryText
        }
    }
    
    private var activityTitle: String {
        switch activity.action {
        case "step_completed":
            if let stepTitle = activity.metadata?["step_title"] {
                return "Completed: \(stepTitle)"
            }
            return "Task completed"
        case "step_uncompleted":
            if let stepTitle = activity.metadata?["step_title"] {
                return "Uncompleted: \(stepTitle)"
            }
            return "Task uncompleted"
        case "business_created":
            return "Business created"
        case "team_member_added":
            if let email = activity.metadata?["member_email"] {
                return "Added: \(email)"
            }
            return "Team member added"
        case "team_member_removed":
            if let email = activity.metadata?["member_email"] {
                return "Removed: \(email)"
            }
            return "Team member removed"
        default:
            return activity.action.replacingOccurrences(of: "_", with: " ").capitalized
        }
    }
    
    private var timeAgo: String {
        let formatter = ISO8601DateFormatter()
        guard let date = formatter.date(from: activity.createdAt) else {
            return activity.createdAt
        }
        
        let now = Date()
        let interval = now.timeIntervalSince(date)
        
        if interval < 60 {
            return "just now"
        } else if interval < 3600 {
            let minutes = Int(interval / 60)
            return "\(minutes) minute\(minutes == 1 ? "" : "s") ago"
        } else if interval < 86400 {
            let hours = Int(interval / 3600)
            return "\(hours) hour\(hours == 1 ? "" : "s") ago"
        } else {
            let days = Int(interval / 86400)
            return "\(days) day\(days == 1 ? "" : "s") ago"
        }
    }
    
    var body: some View {
        HStack(spacing: 12) {
            // Icon
            Image(systemName: activityIcon)
                .font(.system(size: 20))
                .foregroundColor(activityColor)
                .frame(width: 40, height: 40)
                .background(
                    RoundedRectangle(cornerRadius: 10)
                        .fill(activityColor.opacity(0.15))
                )
            
            // Content
            VStack(alignment: .leading, spacing: 4) {
                Text(activityTitle)
                    .font(.biznoBody)
                    .foregroundColor(.biznoPrimaryText)
                    .lineLimit(2)
                
                Text(timeAgo)
                    .font(.biznoCaption)
                    .foregroundColor(.biznoTertiaryText)
            }
            
            Spacer()
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.biznoCardBackground)
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color.biznoBorderDynamic, lineWidth: 1)
                )
        )
    }
}

#Preview {
    ActivityRow(
        activity: BusinessActivity(
            id: "1",
            action: "step_completed",
            businessID: "biz-123",
            userID: "user-123",
            metadata: ["step_title": "Register business name"],
            createdAt: "2024-03-29T10:30:00Z"
        )
    )
}
