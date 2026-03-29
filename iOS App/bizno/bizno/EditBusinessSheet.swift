import SwiftUI

// MARK: - Edit Business Sheet
struct EditBusinessSheet: View {
    let business: Business
    @Binding var businessName: String
    @Binding var businessType: BusinessType
    let onSave: () -> Void
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.biznoBackground.ignoresSafeArea()
                
                VStack(spacing: 24) {
                    // Name Field
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Business Name")
                            .font(.biznoSmall)
                            .foregroundColor(.biznoSecondaryText)
                        
                        TextField("Enter business name", text: $businessName)
                            .textFieldStyle(BiznoTextFieldStyle())
                    }
                    
                    // Type Picker
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Business Type")
                            .font(.biznoSmall)
                            .foregroundColor(.biznoSecondaryText)
                        
                        VStack(spacing: 8) {
                            ForEach(BusinessType.allCases, id: \.self) { type in
                                Button {
                                    businessType = type
                                } label: {
                                    HStack(spacing: 12) {
                                        Image(systemName: type.icon)
                                            .font(.system(size: 20))
                                            .foregroundColor(businessType == type ? .biznoElectric : .biznoTertiaryText)
                                            .frame(width: 40, height: 40)
                                            .background(
                                                RoundedRectangle(cornerRadius: 10)
                                                    .fill(businessType == type ? Color.biznoElectric.opacity(0.15) : Color.biznoElevatedBackground)
                                            )
                                        
                                        VStack(alignment: .leading, spacing: 2) {
                                            Text(type.displayName)
                                                .font(.biznoBody)
                                                .foregroundColor(.biznoPrimaryText)
                                        }
                                        
                                        Spacer()
                                        
                                        if businessType == type {
                                            Image(systemName: "checkmark.circle.fill")
                                                .foregroundColor(.biznoElectric)
                                                .font(.system(size: 22))
                                        }
                                    }
                                    .padding(12)
                                    .background(
                                        RoundedRectangle(cornerRadius: 12)
                                            .fill(businessType == type ? Color.biznoCardBackground : Color.clear)
                                            .overlay(
                                                RoundedRectangle(cornerRadius: 12)
                                                    .stroke(businessType == type ? Color.biznoElectric.opacity(0.3) : Color.clear, lineWidth: 1)
                                            )
                                    )
                                }
                                .buttonStyle(PlainButtonStyle())
                            }
                        }
                    }
                    
                    Spacer()
                    
                    // Save Button
                    Button {
                        onSave()
                    } label: {
                        Text("Save Changes")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.dynamicPrimary)
                    .disabled(businessName.isEmpty)
                    .opacity(businessName.isEmpty ? 0.6 : 1)
                }
                .padding(20)
            }
            .navigationTitle("Edit Business")
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

#Preview {
    EditBusinessSheet(
        business: Business(
            id: "test",
            userId: "user-123",
            name: "Test Business",
            type: "limited_company",
            completedTasks: [],
            viewPreference: "checklist",
            status: "active",
            createdAt: Date()
        ),
        businessName: .constant("Test Business"),
        businessType: .constant(.limitedCompany),
        onSave: {}
    )
}
