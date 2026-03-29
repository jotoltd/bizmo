import SwiftUI

// MARK: - Invite Team Member Sheet
struct InviteTeamMemberSheet: View {
    let businessID: String
    @Binding var inviteEmail: String
    @Binding var inviteRole: String
    let onInvite: () -> Void
    @Environment(\.dismiss) private var dismiss
    
    let roles = ["admin", "member"]
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.biznoBackground.ignoresSafeArea()
                
                VStack(spacing: 24) {
                    // Email Field
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Email Address")
                            .font(.biznoSmall)
                            .foregroundColor(.biznoSecondaryText)
                        
                        TextField("Enter email address", text: $inviteEmail)
                            .textFieldStyle(BiznoTextFieldStyle())
                            .textContentType(.emailAddress)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)
                    }
                    
                    // Role Picker
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Role")
                            .font(.biznoSmall)
                            .foregroundColor(.biznoSecondaryText)
                        
                        VStack(spacing: 8) {
                            ForEach(roles, id: \.self) { role in
                                Button {
                                    inviteRole = role
                                } label: {
                                    HStack(spacing: 12) {
                                        Image(systemName: role == "admin" ? "shield.fill" : "person.fill")
                                            .font(.system(size: 20))
                                            .foregroundColor(inviteRole == role ? .biznoElectric : .biznoTertiaryText)
                                            .frame(width: 40, height: 40)
                                            .background(
                                                RoundedRectangle(cornerRadius: 10)
                                                    .fill(inviteRole == role ? Color.biznoElectric.opacity(0.15) : Color.biznoElevatedBackground)
                                            )
                                        
                                        VStack(alignment: .leading, spacing: 2) {
                                            Text(role.capitalized)
                                                .font(.biznoBody)
                                                .foregroundColor(.biznoPrimaryText)
                                            
                                            Text(role == "admin" ? "Full access to manage the business" : "Can view and complete tasks")
                                                .font(.biznoCaption)
                                                .foregroundColor(.biznoSecondaryText)
                                        }
                                        
                                        Spacer()
                                        
                                        if inviteRole == role {
                                            Image(systemName: "checkmark.circle.fill")
                                                .foregroundColor(.biznoElectric)
                                                .font(.system(size: 22))
                                        }
                                    }
                                    .padding(12)
                                    .background(
                                        RoundedRectangle(cornerRadius: 12)
                                            .fill(inviteRole == role ? Color.biznoCardBackground : Color.clear)
                                            .overlay(
                                                RoundedRectangle(cornerRadius: 12)
                                                    .stroke(inviteRole == role ? Color.biznoElectric.opacity(0.3) : Color.clear, lineWidth: 1)
                                            )
                                    )
                                }
                                .buttonStyle(PlainButtonStyle())
                            }
                        }
                    }
                    
                    Spacer()
                    
                    // Send Button
                    Button {
                        onInvite()
                    } label: {
                        Text("Send Invitation")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.dynamicPrimary)
                    .disabled(inviteEmail.isEmpty)
                    .opacity(inviteEmail.isEmpty ? 0.6 : 1)
                }
                .padding(20)
            }
            .navigationTitle("Invite Member")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundColor(.biznoSecondaryText)
                }
            }
            .toolbarBackground(.visible, for: .navigationBar)
            .toolbarBackground(Color.biznoBackground, for: .navigationBar)
        }
    }
}

// MARK: - Pending Invitation Row
struct PendingInvitationRow: View {
    let invitation: Invitation
    let onCancel: (Invitation) -> Void
    
    var body: some View {
        HStack(spacing: 12) {
            // Icon
            Image(systemName: "envelope.badge.clock")
                .font(.system(size: 20))
                .foregroundColor(.biznoWarning)
                .frame(width: 40, height: 40)
                .background(
                    RoundedRectangle(cornerRadius: 10)
                        .fill(Color.biznoWarning.opacity(0.15))
                )
            
            // Content
            VStack(alignment: .leading, spacing: 4) {
                Text(invitation.invitedByEmail)
                    .font(.biznoBody)
                    .foregroundColor(.biznoPrimaryText)
                    .lineLimit(1)
                
                Text("Invited as \(invitation.role.capitalized)")
                    .font(.biznoCaption)
                    .foregroundColor(.biznoSecondaryText)
                
                Text("Sent \(invitation.createdAt.formatted(date: .abbreviated, time: .omitted))")
                    .font(.system(size: 11))
                    .foregroundColor(.biznoTertiaryText)
            }
            
            Spacer()
            
            // Cancel Button
            Button {
                onCancel(invitation)
            } label: {
                Image(systemName: "xmark.circle.fill")
                    .font(.system(size: 22))
                    .foregroundColor(.biznoTertiaryText)
            }
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.biznoCardBackground)
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color.biznoWarning.opacity(0.3), lineWidth: 1)
                )
        )
    }
}

#Preview {
    InviteTeamMemberSheet(
        businessID: "test",
        inviteEmail: .constant("test@example.com"),
        inviteRole: .constant("member"),
        onInvite: {}
    )
}
