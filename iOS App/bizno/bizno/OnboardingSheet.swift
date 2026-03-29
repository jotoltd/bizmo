import SwiftUI

// MARK: - Onboarding Sheet
struct OnboardingSheet: View {
    let business: Business
    @Environment(\.dismiss) private var dismiss
    @State private var currentPage = 0
    
    let pages = [
        OnboardingPage(
            title: "Welcome to Your Business Journey",
            description: "Let's get your business digital-ready with our guided setup process.",
            icon: "rocket.fill",
            color: .biznoElectric
        ),
        OnboardingPage(
            title: "Choose Your View",
            description: "Switch between Checklist view for quick task completion, or Wizard view for step-by-step guidance.",
            icon: "list.bullet",
            color: .biznoSuccess
        ),
        OnboardingPage(
            title: "Track Your Progress",
            description: "Monitor your readiness percentage and see how many tasks you've completed.",
            icon: "chart.line.uptrend.xyaxis",
            color: .biznoPurple
        ),
        OnboardingPage(
            title: "Build Your Team",
            description: "Invite team members to collaborate and track activity in the Activity Log.",
            icon: "person.2.fill",
            color: .biznoWarning
        ),
        OnboardingPage(
            title: "Get Recommendations",
            description: "Each step includes recommended tools and services to help you complete tasks faster.",
            icon: "lightbulb.fill",
            color: .biznoElectric
        )
    ]
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.biznoBackground.ignoresSafeArea()
                
                VStack(spacing: 32) {
                    // Progress dots
                    HStack(spacing: 8) {
                        ForEach(0..<pages.count, id: \.self) { index in
                            Circle()
                                .fill(index == currentPage ? Color.biznoElectric : Color.biznoBorderDynamic)
                                .frame(width: 8, height: 8)
                                .scaleEffect(index == currentPage ? 1.2 : 1.0)
                                .animation(.biznoEase, value: currentPage)
                        }
                    }
                    .padding(.top, 20)
                    
                    // Page content
                    TabView(selection: $currentPage) {
                        ForEach(0..<pages.count, id: \.self) { index in
                            let page = pages[index]
                            VStack(spacing: 24) {
                                // Icon
                                ZStack {
                                    Circle()
                                        .fill(page.color.opacity(0.15))
                                        .frame(width: 120, height: 120)
                                    
                                    Image(systemName: page.icon)
                                        .font(.system(size: 50))
                                        .foregroundColor(page.color)
                                }
                                
                                // Title
                                Text(page.title)
                                    .font(.biznoHeadline)
                                    .foregroundColor(.biznoPrimaryText)
                                    .multilineTextAlignment(.center)
                                
                                // Description
                                Text(page.description)
                                    .font(.biznoBody)
                                    .foregroundColor(.biznoSecondaryText)
                                    .multilineTextAlignment(.center)
                                    .padding(.horizontal, 32)
                            }
                            .tag(index)
                        }
                    }
                    .tabViewStyle(.page(indexDisplayMode: .never))
                    .frame(height: 350)
                    
                    Spacer()
                    
                    // Navigation buttons
                    HStack(spacing: 16) {
                        if currentPage > 0 {
                            Button {
                                withAnimation(.biznoEase) {
                                    currentPage -= 1
                                }
                            } label: {
                                Image(systemName: "chevron.left")
                                    .font(.system(size: 20, weight: .semibold))
                                    .foregroundColor(.biznoPrimaryText)
                                    .frame(width: 56, height: 56)
                                    .background(
                                        RoundedRectangle(cornerRadius: 16)
                                            .fill(Color.biznoElevatedBackground)
                                            .overlay(
                                                RoundedRectangle(cornerRadius: 16)
                                                    .stroke(Color.biznoBorderDynamic, lineWidth: 1)
                                            )
                                    )
                            }
                        }
                        
                        Button {
                            if currentPage < pages.count - 1 {
                                withAnimation(.biznoEase) {
                                    currentPage += 1
                                }
                            } else {
                                dismiss()
                            }
                        } label: {
                            HStack(spacing: 8) {
                                Text(currentPage == pages.count - 1 ? "Get Started" : "Next")
                                    .font(.biznoBody)
                                    .fontWeight(.semibold)
                                
                                Image(systemName: currentPage == pages.count - 1 ? "checkmark" : "chevron.right")
                                    .font(.system(size: 16, weight: .semibold))
                            }
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 56)
                            .background(
                                RoundedRectangle(cornerRadius: 16)
                                    .fill(Color.biznoElectric)
                            )
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 32)
                }
            }
            .navigationTitle("")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Skip") {
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

struct OnboardingPage {
    let title: String
    let description: String
    let icon: String
    let color: Color
}

#Preview {
    OnboardingSheet(
        business: Business(
            id: "test",
            userId: "user-123",
            name: "Test Business",
            type: "limited_company",
            completedTasks: [],
            viewPreference: "checklist",
            status: "active",
            createdAt: Date()
        )
    )
}
