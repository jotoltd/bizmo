import SwiftUI

// MARK: - Wizard View
struct WizardView: View {
    let steps: [RoadmapStep]
    let business: Business
    @Binding var currentIndex: Int
    @EnvironmentObject private var store: AppSessionStore
    @State private var isAnimating = false
    
    private var currentStep: RoadmapStep? {
        guard currentIndex < steps.count else { return nil }
        return steps[currentIndex]
    }
    
    private var progress: Double {
        guard !steps.isEmpty else { return 0 }
        let stepCount = Double(steps.count)
        let currentStep = Double(currentIndex + 1)
        return currentStep / stepCount
    }
    
    var body: some View {
        VStack(spacing: 24) {
            progressIndicator
            stepContent
        }
    }
    
    private var progressIndicator: some View {
        VStack(spacing: 12) {
            HStack {
                Text("Step \(currentIndex + 1) of \(steps.count)")
                    .font(.biznoCaption)
                    .foregroundColor(.biznoSecondaryText)
                Spacer()
                Text("\(Int(progress * 100))%")
                    .font(.biznoCaption)
                    .fontWeight(.semibold)
                    .foregroundColor(.biznoElectric)
            }
            
            BiznoProgressBar(value: progress)
        }
        .padding(.horizontal, 16)
    }
    
    private var stepContent: some View {
        Group {
            if let step = currentStep {
                // Step card
                VStack(spacing: 20) {
                    // Step header
                    stepHeader(step: step)
                    
                    // Action buttons
                    actionButtons(step: step)
                }
                .padding(20)
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color.biznoCardBackground)
                        .overlay(
                            RoundedRectangle(cornerRadius: 16)
                                .stroke(Color.biznoBorderDynamic, lineWidth: 1)
                        )
                )
                .padding(.horizontal, 16)
                .scaleEffect(isAnimating ? 0.95 : 1.0)
                .opacity(isAnimating ? 0.8 : 1.0)
                .onAppear {
                    withAnimation(.biznoEase) {
                        isAnimating = false
                    }
                }
                .onChange(of: currentIndex) { _, _ in
                    withAnimation(.biznoEase) {
                        isAnimating = true
                    }
                    
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                        withAnimation(.biznoEase) {
                            isAnimating = false
                        }
                    }
                }
            } else {
                Text("No steps available")
                    .font(.biznoBody)
                    .foregroundColor(.biznoSecondaryText)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
    }
    
    private func stepHeader(step: RoadmapStep) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: step.mandatory ? "exclamationmark.triangle.fill" : "checkmark.circle")
                    .font(.system(size: 24))
                    .foregroundColor(step.mandatory ? .biznoWarning : .biznoSuccess)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(step.title)
                        .font(.biznoHeadline)
                        .foregroundColor(.biznoPrimaryText)
                    
                    Text(step.mandatory ? "Required step" : "Optional step")
                        .font(.biznoCaption)
                        .foregroundColor(step.mandatory ? .biznoWarning : .biznoSuccess)
                }
                
                Spacer()
            }
            
            if let description = step.description {
                Text(description)
                    .font(.biznoBody)
                    .foregroundColor(.biznoSecondaryText)
                    .lineLimit(nil)
            }
        }
    }
    
    private func actionButtons(step: RoadmapStep) -> some View {
        HStack(spacing: 12) {
            // Previous button
            Button {
                withAnimation(.biznoEase) {
                    if currentIndex > 0 {
                        currentIndex -= 1
                    }
                }
            } label: {
                HStack {
                    Image(systemName: "chevron.left")
                    Text("Previous")
                }
                .font(.biznoCaption)
                .fontWeight(.medium)
                .foregroundColor(currentIndex > 0 ? .biznoPrimaryText : .biznoTertiaryText)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(
                    RoundedRectangle(cornerRadius: 8)
                        .fill(currentIndex > 0 ? Color.biznoElevatedBackground : Color.biznoCardBackground)
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(Color.biznoBorderDynamic, lineWidth: 1)
                        )
                )
            }
            .disabled(currentIndex == 0)
            
            // Complete/Next button
            Button {
                let isCompleted = business.completedTasks.contains(step.id)
                
                Task {
                    do {
                        try await store.api.toggleStepComplete(
                            businessID: business.id,
                            stepID: step.id,
                            isCompleted: !isCompleted,
                            accessToken: store.session?.accessToken ?? ""
                        )
                        await store.refreshAll()
                        
                        await MainActor.run {
                            withAnimation(.biznoEase) {
                                if currentIndex < steps.count - 1 {
                                    currentIndex += 1
                                }
                            }
                        }
                    } catch {
                        await MainActor.run {
                            store.message = error.localizedDescription
                        }
                    }
                }
            } label: {
                HStack {
                    if business.completedTasks.contains(step.id) {
                        Image(systemName: "checkmark")
                        Text("Completed")
                    } else {
                        Text("Mark Complete")
                        if currentIndex < steps.count - 1 {
                            Image(systemName: "chevron.right")
                        }
                    }
                }
                .font(.biznoCaption)
                .fontWeight(.semibold)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(
                    RoundedRectangle(cornerRadius: 8)
                        .fill(business.completedTasks.contains(step.id) ? Color.biznoSuccess : Color.biznoElectric)
                )
            }
        }
    }
}
