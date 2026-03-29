import SwiftUI

// MARK: - Auth View (Themed)
struct AuthView: View {
    @EnvironmentObject private var store: AppSessionStore
    @State private var mode: AuthMode = .signIn
    @State private var email = ""
    @State private var password = ""
    @State private var isAnimating = false

    var body: some View {
        NavigationStack {
            ZStack {
                // Background
                Color.biznoBackground
                    .ignoresSafeArea()
                
                // Decorative glow - adaptive opacity
                Circle()
                    .fill(Color.biznoElectric.opacity(ThemeManager.shared.isDarkMode ? 0.1 : 0.05))
                    .frame(width: 300, height: 300)
                    .blur(radius: 80)
                    .offset(x: 150, y: -200)
                
                Circle()
                    .fill(Color.biznoPurple.opacity(ThemeManager.shared.isDarkMode ? 0.1 : 0.05))
                    .frame(width: 250, height: 250)
                    .blur(radius: 60)
                    .offset(x: -150, y: 200)
                
                ScrollView {
                    VStack(spacing: 24) {
                        // Header
                        VStack(spacing: 12) {
                            Image(systemName: "bolt.fill")
                                .font(.system(size: 48))
                                .foregroundColor(.biznoElectric)
                                .glow(color: .biznoElectric, radius: 20)
                            
                            Text("Bizno")
                                .font(.biznoDisplay)
                                .foregroundColor(.biznoPrimaryText)
                            
                            Text(mode == .signIn ? "Welcome back" : "Create your account")
                                .font(.biznoBody)
                                .foregroundColor(.biznoSecondaryText)
                        }
                        .padding(.top, 40)
                        .opacity(isAnimating ? 1 : 0)
                        .offset(y: isAnimating ? 0 : 20)
                        
                        // Form Card
                        VStack(spacing: 20) {
                            // Mode Picker
                            Picker("Mode", selection: $mode) {
                                ForEach(AuthMode.allCases, id: \.self) { mode in
                                    Text(mode.rawValue).tag(mode)
                                }
                            }
                            .pickerStyle(.segmented)
                            .colorMultiply(.biznoElectric)
                            
                            // Email Field
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Email")
                                    .font(.biznoSmall)
                                    .foregroundColor(.biznoSecondaryText)
                                
                                TextField("you@example.com", text: $email)
                                    .textFieldStyle(BiznoTextFieldStyle())
                                    .keyboardType(.emailAddress)
                                    .textInputAutocapitalization(.never)
                                    .autocorrectionDisabled()
                            }
                            
                            // Password Field
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Password")
                                    .font(.biznoSmall)
                                    .foregroundColor(.biznoSecondaryText)
                                
                                SecureField("••••••••", text: $password)
                                    .textFieldStyle(BiznoTextFieldStyle())
                            }
                            
                            // Submit Button
                            Button {
                                Task {
                                    switch mode {
                                    case .signIn:
                                        await store.signIn(email: email.trimmingCharacters(in: .whitespacesAndNewlines), password: password)
                                    case .signUp:
                                        await store.signUp(email: email.trimmingCharacters(in: .whitespacesAndNewlines), password: password)
                                    }
                                }
                            } label: {
                                HStack {
                                    if store.isBusy {
                                        ProgressView()
                                            .tint(.biznoTextInverse)
                                    }
                                    Text(mode.rawValue)
                                }
                                .frame(maxWidth: .infinity)
                            }
                            .buttonStyle(.dynamicPrimary)
                            .disabled(store.isBusy || email.isEmpty || password.count < 6)
                            .opacity(store.isBusy || email.isEmpty || password.count < 6 ? 0.6 : 1)
                        }
                        .dynamicGlassCard(elevated: true, padding: 24)
                        .opacity(isAnimating ? 1 : 0)
                        .offset(y: isAnimating ? 0 : 30)
                        
                        // Status Message
                        if let message = store.message {
                            HStack(spacing: 8) {
                                Image(systemName: "info.circle.fill")
                                    .foregroundColor(.biznoWarning)
                                Text(message)
                                    .font(.biznoCaption)
                            }
                            .foregroundColor(.biznoSecondaryText)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 12)
                            .background(
                                RoundedRectangle(cornerRadius: 8)
                                    .fill(Color.biznoWarning.opacity(0.1))
                            )
                            .transition(.opacity.combined(with: .move(edge: .bottom)))
                        }
                        
                        if !AppConfig.isConfigured {
                            VStack(spacing: 8) {
                                Image(systemName: "exclamationmark.triangle.fill")
                                    .foregroundColor(.biznoWarning)
                                Text("Set your Supabase anon key in AppConfig.swift before sign in.")
                                    .font(.biznoCaption)
                                    .foregroundColor(.biznoWarning)
                                    .multilineTextAlignment(.center)
                            }
                            .padding(.top, 16)
                        }
                        
                        Spacer()
                    }
                    .padding(.horizontal, 20)
                }
            }
            .onAppear {
                withAnimation(.biznoEase.delay(0.1)) {
                    isAnimating = true
                }
            }
        }
    }
}

// MARK: - Custom Text Field Style
struct BiznoTextFieldStyle: TextFieldStyle {
    func _body(configuration: TextField<_Label>) -> some View {
        configuration
            .padding(14)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.biznoElevatedBackground)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color.biznoBorderDynamic, lineWidth: 1)
                    )
            )
            .foregroundColor(.biznoPrimaryText)
    }
}

// MARK: - Main Tab View (Themed)
struct MainTabView: View {
    @EnvironmentObject private var store: AppSessionStore

    var body: some View {
        TabView {
            DashboardView()
                .tabItem {
                    Label("Dashboard", systemImage: "rectangle.grid.2x2.fill")
                }

            BusinessesListView()
                .tabItem {
                    Label("Businesses", systemImage: "briefcase.fill")
                }

            NotificationsView()
                .tabItem {
                    Label("Notifications", systemImage: "bell.fill")
                }
                .badge(store.unreadCount > 0 ? store.unreadCount : 0)

            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gearshape.fill")
                }
        }
        .tint(.biznoElectric)
            .onAppear {
            let appearance = UITabBarAppearance()
            appearance.configureWithOpaqueBackground()
            appearance.backgroundColor = UIColor(Color.biznoCardBackground)
            
            appearance.stackedLayoutAppearance.normal.iconColor = UIColor(Color.biznoTertiaryText)
            appearance.stackedLayoutAppearance.normal.titleTextAttributes = [.foregroundColor: UIColor(Color.biznoTertiaryText)]
            appearance.stackedLayoutAppearance.selected.iconColor = UIColor(Color.biznoElectric)
            appearance.stackedLayoutAppearance.selected.titleTextAttributes = [.foregroundColor: UIColor(Color.biznoElectric)]
            
            UITabBar.appearance().standardAppearance = appearance
            UITabBar.appearance().scrollEdgeAppearance = appearance
        }
        .task {
            if store.notifications.isEmpty {
                await store.refreshAll()
            }
        }
    }
}

// MARK: - Dashboard View (Themed)
struct DashboardView: View {
    @EnvironmentObject private var store: AppSessionStore
    @State private var isAnimating = false
    @State private var searchText = ""
    
    var filteredBusinesses: [Business] {
        if searchText.isEmpty {
            return store.businesses
        }
        return store.businesses.filter { business in
            business.name.localizedCaseInsensitiveContains(searchText) ||
            business.type.localizedCaseInsensitiveContains(searchText)
        }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Color.biznoBackground
                    .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 20) {
                        // Hero Card
                        heroCard
                            .opacity(isAnimating ? 1 : 0)
                            .offset(y: isAnimating ? 0 : 20)
                        
                        // Pending Invitations Section
                        if !store.pendingInvitations.isEmpty {
                            pendingInvitationsSection
                                .opacity(isAnimating ? 1 : 0)
                                .offset(y: isAnimating ? 0 : 20)
                        }
                        
                        // Search Bar
                        if !store.businesses.isEmpty {
                            HStack {
                                Image(systemName: "magnifyingglass")
                                    .foregroundColor(.biznoSecondaryText)
                                TextField("Search businesses...", text: $searchText)
                                    .textFieldStyle(PlainTextFieldStyle())
                                    .foregroundColor(.biznoPrimaryText)
                                if !searchText.isEmpty {
                                    Button {
                                        searchText = ""
                                    } label: {
                                        Image(systemName: "xmark.circle.fill")
                                            .foregroundColor(.biznoTertiaryText)
                                    }
                                }
                            }
                            .padding(12)
                            .background(
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(Color.biznoCardBackground)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 12)
                                            .stroke(Color.biznoBorderDynamic, lineWidth: 1)
                                    )
                            )
                            .padding(.horizontal, 16)
                        }
                        
                        // My Businesses Section
                        businessesSection
                            .opacity(isAnimating ? 1 : 0)
                            .offset(y: isAnimating ? 0 : 20)
                        
                        // Quick Actions
                        SectionHeader(title: "Quick Actions", icon: "bolt.fill")
                            .opacity(isAnimating ? 1 : 0)
                            .offset(y: isAnimating ? 0 : 20)
                        
                        actionsGrid
                            .opacity(isAnimating ? 1 : 0)
                            .offset(y: isAnimating ? 0 : 20)
                        
                        // Status
                        if let message = store.message {
                            statusCard(message: message)
                                .transition(.opacity.combined(with: .move(edge: .bottom)))
                        }
                        
                        Spacer(minLength: 40)
                    }
                    .padding(16)
                }
                .padding(16)
            }
            .refreshable {
                await RealtimeSyncManager.shared.manualRefresh()
            }
            .withRealtimeSync()
            .navigationTitle("Dashboard")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Sign Out") {
                        store.signOut()
                    }
                    .font(.biznoCaption)
                    .foregroundColor(.biznoSecondaryText)
                }
            }
            .toolbarBackground(.visible, for: .navigationBar)
            .toolbarBackground(Color.biznoBackground, for: .navigationBar)
            .onAppear {
                withAnimation(.biznoEase.delay(0.1)) {
                    isAnimating = true
                }
            }
        }
    }
    
    private var heroCard: some View {
        VStack(spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Your readiness HQ")
                        .font(.biznoCaption)
                        .foregroundColor(.biznoSecondaryText)
                    
                    Text("Let's get every business digital-ready")
                        .font(.biznoHeadline)
                        .foregroundColor(.biznoPrimaryText)
                        .lineLimit(2)
                }
                
                Spacer()
                
                BiznoAvatar(
                    initials: String(store.session?.user.email?.prefix(2).uppercased() ?? "U"),
                    size: 48,
                    color: .biznoElectric
                )
            }
            
            BiznoDivider()
            
            // Business Statistics
            let stats = calculateBusinessStats()
            VStack(spacing: 12) {
                HStack(spacing: 16) {
                    businessStatItem(
                        value: "\(stats.activeBusinesses)",
                        label: "Active businesses",
                        helper: "Create as many businesses as you need"
                    )
                    
                    Spacer()
                    
                    businessStatItem(
                        value: stats.hasBusinesses ? "\(stats.averageCompletion)%" : "—",
                        label: "Avg. readiness",
                        helper: stats.hasBusinesses ? "Across every active business" : "Start your first roadmap"
                    )
                }
                
                HStack(spacing: 16) {
                    businessStatItem(
                        value: "\(stats.totalCompletedTasks)",
                        label: "Tasks shipped",
                        helper: stats.totalTasks > 0 ? "\(stats.totalCompletedTasks)/\(stats.totalTasks) tasks finished" : "Checklist progress will appear here"
                    )
                    
                    Spacer()
                    
                    if let highlightBusiness = store.businesses.first {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Latest checkpoint")
                                .font(.biznoCaption)
                                .foregroundColor(.biznoTertiaryText)
                            
                            Text(highlightBusiness.name)
                                .font(.biznoBody)
                                .foregroundColor(.biznoPrimaryText)
                                .lineLimit(1)
                            
                            Text("\(highlightBusiness.completedTasks.count) tasks complete")
                                .font(.biznoCaption)
                                .foregroundColor(.biznoSecondaryText)
                        }
                    }
                }
            }
        }
        .dynamicGlassCard(elevated: true, padding: 20)
    }
    
    private func calculateBusinessStats() -> (activeBusinesses: Int, averageCompletion: Int, totalCompletedTasks: Int, totalTasks: Int, hasBusinesses: Bool) {
        let activeBusinesses = store.businesses.count
        let hasBusinesses = activeBusinesses > 0
        
        guard hasBusinesses else {
            return (0, 0, 0, 0, false)
        }
        
        // For now, assume each business has 12 tasks (from roadmap)
        // In a real implementation, you'd fetch the actual roadmap
        let totalTasksPerBusiness = 12
        let totalTasks = activeBusinesses * totalTasksPerBusiness
        
        let totalCompletedTasks = store.businesses.reduce(0) { total, business in
            total + business.completedTasks.count
        }
        
        let averageCompletion = totalTasks > 0 ? (totalCompletedTasks * 100) / totalTasks : 0
        
        return (activeBusinesses, averageCompletion, totalCompletedTasks, totalTasks, true)
    }
    
    private func businessStatItem(value: String, label: String, helper: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(value)
                .font(.biznoTitle)
                .foregroundColor(.biznoPrimaryText)
            
            Text(label)
                .font(.biznoCaption)
                .foregroundColor(.biznoTertiaryText)
            
            Text(helper)
                .font(.biznoCaption)
                .foregroundColor(.biznoSecondaryText)
                .lineLimit(2)
        }
    }
    
    private func statItem(value: String, label: String, icon: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 20))
                .foregroundColor(.biznoElectric)
                .frame(width: 44, height: 44)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.biznoElectricMuted)
                )
            
            VStack(alignment: .leading, spacing: 2) {
                Text(value)
                    .font(.biznoHeadline)
                    .foregroundColor(.biznoPrimaryText)
                Text(label)
                    .font(.biznoSmall)
                    .foregroundColor(.biznoTertiaryText)
            }
        }
    }
    
    private var actionsGrid: some View {
        VStack(spacing: 12) {
            actionButton(
                icon: "arrow.clockwise",
                title: "Refresh Data",
                color: .biznoInfo,
                action: { Task { await store.refreshAll() } },
                isDisabled: store.isBusy
            )
        }
    }
    
    private func actionButton(icon: String, title: String, color: Color, action: @escaping () -> Void, isDisabled: Bool) -> some View {
        Button(action: action) {
            HStack(spacing: 16) {
                Image(systemName: icon)
                    .font(.system(size: 18))
                    .foregroundColor(color)
                    .frame(width: 40, height: 40)
                    .background(
                        RoundedRectangle(cornerRadius: 10)
                            .fill(color.opacity(0.15))
                    )
                
                Text(title)
                    .font(.biznoBody)
                    .foregroundColor(.biznoPrimaryText)
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.biznoTertiaryText)
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
        .disabled(isDisabled)
        .opacity(isDisabled ? 0.5 : 1)
    }
    
    private func statusCard(message: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: "info.circle.fill")
                .foregroundColor(.biznoInfo)
            Text(message)
                .font(.biznoCaption)
                .foregroundColor(.biznoSecondaryText)
            Spacer()
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.biznoInfo.opacity(0.1))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color.biznoInfo.opacity(0.3), lineWidth: 1)
                )
        )
    }

    private var pendingInvitationsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: "Pending Invitations", icon: "envelope.badge.fill")
            
            VStack(spacing: 12) {
                ForEach(store.pendingInvitations.prefix(3)) { invitation in
                    InvitationCard(invitation: invitation)
                }
            }
        }
    }

    private var businessesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                SectionHeader(title: "My Businesses", icon: "briefcase.fill")
                Spacer()
                NavigationLink(destination: BusinessesListView()) {
                    Text("See All")
                        .font(.biznoCaption)
                        .foregroundColor(.biznoElectric)
                }
            }
            
            if filteredBusinesses.isEmpty {
                VStack(spacing: 12) {
                    Image(systemName: searchText.isEmpty ? "briefcase" : "magnifyingglass")
                        .font(.system(size: 40))
                        .foregroundColor(.biznoTertiaryText)
                    Text(searchText.isEmpty ? "No businesses yet" : "No matching businesses")
                        .font(.biznoBody)
                        .foregroundColor(.biznoSecondaryText)
                    if searchText.isEmpty {
                        NavigationLink(destination: CreateBusinessView()) {
                            Text("Create Business")
                                .font(.biznoCaption)
                                .foregroundColor(.biznoElectric)
                        }
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 40)
                .dynamicGlassCard()
            } else {
                VStack(spacing: 12) {
                    ForEach(filteredBusinesses.prefix(3)) { business in
                        NavigationLink(destination: BusinessDetailView(business: business)) {
                            BusinessCard(business: business)
                        }
                        .buttonStyle(PlainButtonStyle())
                    }
                    
                    if filteredBusinesses.count > 3 {
                        NavigationLink(destination: BusinessesListView()) {
                            HStack {
                                Spacer()
                                Text("View all \(filteredBusinesses.count) businesses")
                                    .font(.biznoCaption)
                                    .foregroundColor(.biznoElectric)
                                Spacer()
                            }
                            .padding(.vertical, 8)
                        }
                        .buttonStyle(PlainButtonStyle())
                    }
                }
            }
        }
    }
}

// MARK: - Invitation Card
struct InvitationCard: View {
    @EnvironmentObject private var store: AppSessionStore
    let invitation: Invitation

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "envelope.fill")
                    .font(.system(size: 24))
                    .foregroundColor(.biznoElectric)
                    .frame(width: 48, height: 48)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color.biznoElectric.opacity(0.15))
                    )
                
                VStack(alignment: .leading, spacing: 4) {
                    Text("Join Business")
                        .font(.biznoHeadline)
                        .foregroundColor(.biznoPrimaryText)
                    Text("From: \(invitation.invitedByEmail)")
                        .font(.biznoCaption)
                        .foregroundColor(.biznoSecondaryText)
                }
                
                Spacer()
            }
            
            HStack(spacing: 12) {
                Button {
                    Task { await store.respondToInvitation(invitation, accept: true) }
                } label: {
                    Text("Accept")
                        .font(.biznoCaption)
                        .fontWeight(.semibold)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(
                            RoundedRectangle(cornerRadius: 8)
                                .fill(Color.biznoSuccess)
                        )
                }
                
                Button {
                    Task { await store.respondToInvitation(invitation, accept: false) }
                } label: {
                    Text("Decline")
                        .font(.biznoCaption)
                        .fontWeight(.semibold)
                        .foregroundColor(.biznoSecondaryText)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(
                            RoundedRectangle(cornerRadius: 8)
                                .fill(Color.biznoCardBackground)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 8)
                                        .stroke(Color.biznoBorderDynamic, lineWidth: 1)
                                )
                        )
                }
            }
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.biznoCardBackground)
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color.biznoElectric.opacity(0.3), lineWidth: 1)
                )
        )
    }
}

// MARK: - Business Card
struct BusinessCard: View {
    let business: Business
    
    private let totalTasksPerBusiness = 12 // From roadmap
    private var completedTasks: Int { business.completedTasks.count }
    private var completionPercentage: Int {
        totalTasksPerBusiness > 0 ? (completedTasks * 100) / totalTasksPerBusiness : 0
    }

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 16) {
                Image(systemName: business.typeIcon)
                    .font(.system(size: 24))
                    .foregroundColor(.biznoElectric)
                    .frame(width: 48, height: 48)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color.biznoElectricMuted)
                    )
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(business.name)
                        .font(.biznoHeadline)
                        .foregroundColor(.biznoPrimaryText)
                        .lineLimit(1)
                    
                    Text(business.type.capitalized)
                        .font(.biznoCaption)
                        .foregroundColor(.biznoSecondaryText)
                    
                    // Progress info
                    HStack(spacing: 8) {
                        Text("\(completedTasks)/\(totalTasksPerBusiness) tasks complete")
                            .font(.biznoCaption)
                            .foregroundColor(.biznoSecondaryText)
                        
                        Spacer()
                        
                        Text("\(completionPercentage)% readiness")
                            .font(.biznoCaption)
                            .fontWeight(.semibold)
                            .foregroundColor(completionPercentage > 50 ? .biznoSuccess : .biznoElectric)
                    }
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.system(size: 16))
                    .foregroundColor(.biznoTertiaryText)
            }
            .padding(16)
            
            // Progress bar
            VStack(spacing: 0) {
                BiznoProgressBar(value: Double(completionPercentage) / 100.0)
                    .padding(.horizontal, 16)
                    .padding(.bottom, 16)
            }
        }
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.biznoCardBackground)
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color.biznoBorderDynamic, lineWidth: 1)
                )
        )
    }
}

extension Business {
    var businessType: BusinessType {
        BusinessType(rawValue: type) ?? .other
    }

    var typeIcon: String {
        businessType.icon
    }

    var typeDisplayName: String {
        businessType.displayName
    }

    var completionPercentage: Double {
        return min(Double(completedTasks.count) / 10.0 * 100, 100)
    }
}

// MARK: - Businesses List View
struct BusinessesListView: View {
    @EnvironmentObject private var store: AppSessionStore
    @State private var isAnimating = false

    var filteredBusinesses: [Business] {
        switch store.selectedBusinessFilter {
        case .all:
            return store.businesses
        case .inProgress:
            return store.businesses.filter { $0.completionPercentage < 100 }
        case .completed:
            return store.businesses.filter { $0.completionPercentage == 100 }
        }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Color.biznoBackground.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 16) {
                        // Filter Picker
                        Picker("Filter", selection: $store.selectedBusinessFilter) {
                            ForEach(BusinessFilter.allCases) { filter in
                                Text(filter.rawValue).tag(filter)
                            }
                        }
                        .pickerStyle(.segmented)
                        .colorMultiply(.biznoElectric)
                        .padding(.horizontal, 16)
                        .padding(.top, 8)

                        if filteredBusinesses.isEmpty {
                            VStack(spacing: 16) {
                                Image(systemName: "briefcase")
                                    .font(.system(size: 60))
                                    .foregroundColor(.biznoTertiaryText)
                                Text("No businesses found")
                                    .font(.biznoHeadline)
                                    .foregroundColor(.biznoSecondaryText)
                            }
                            .padding(.top, 80)
                        } else {
                            LazyVStack(spacing: 12) {
                                ForEach(Array(filteredBusinesses.enumerated()), id: \.element.id) { index, business in
                                    NavigationLink(destination: BusinessDetailView(business: business)) {
                                        BusinessCard(business: business)
                                            .opacity(isAnimating ? 1 : 0)
                                            .offset(y: isAnimating ? 0 : 20)
                                            .animation(.biznoEase.delay(Double(index) * 0.05), value: isAnimating)
                                    }
                                    .buttonStyle(PlainButtonStyle())
                                }
                            }
                            .padding(.horizontal, 16)
                        }
                    }
                }
            }
            .navigationTitle("Businesses")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    NavigationLink(destination: CreateBusinessView()) {
                        Image(systemName: "plus.circle.fill")
                            .font(.system(size: 24))
                            .foregroundColor(.biznoElectric)
                    }
                }
            }
            .toolbarBackground(.visible, for: .navigationBar)
            .toolbarBackground(Color.biznoBackground, for: .navigationBar)
            .onAppear {
                withAnimation(.biznoEase.delay(0.1)) {
                    isAnimating = true
                }
            }
        }
    }

}

// MARK: - Create Business View
struct CreateBusinessView: View {
    @EnvironmentObject private var store: AppSessionStore
    @Environment(\.dismiss) private var dismiss
    @State private var name = ""
    @State private var selectedType: BusinessType = .limitedCompany
    @State private var isAnimating = false

    var body: some View {
        NavigationStack {
            ZStack {
                Color.biznoBackground.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 24) {
                        // Name Field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Business Name")
                                .font(.biznoSmall)
                                .foregroundColor(.biznoSecondaryText)
                            TextField("Enter business name", text: $name)
                                .textFieldStyle(BiznoTextFieldStyle())
                        }

                        // Type Picker
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Business Type")
                                .font(.biznoSmall)
                                .foregroundColor(.biznoSecondaryText)

                            ForEach(BusinessType.allCases, id: \.self) { type in
                                Button {
                                    withAnimation(.easeInOut(duration: 0.2)) {
                                        selectedType = type
                                    }
                                } label: {
                                    HStack(spacing: 12) {
                                        Image(systemName: type.icon)
                                            .font(.system(size: 20))
                                            .foregroundColor(selectedType == type ? .biznoElectric : .biznoTertiaryText)
                                            .frame(width: 40, height: 40)
                                            .background(
                                                RoundedRectangle(cornerRadius: 10)
                                                    .fill(selectedType == type ? Color.biznoElectric.opacity(0.15) : Color.biznoElevatedBackground)
                                            )

                                        VStack(alignment: .leading, spacing: 2) {
                                            Text(type.displayName)
                                                .font(.biznoBody)
                                                .foregroundColor(.biznoPrimaryText)
                                            Text(type.rawValue.replacingOccurrences(of: "_", with: " ").capitalized)
                                                .font(.biznoCaption)
                                                .foregroundColor(.biznoTertiaryText)
                                        }

                                        Spacer()

                                        if selectedType == type {
                                            Image(systemName: "checkmark.circle.fill")
                                                .foregroundColor(.biznoElectric)
                                                .font(.system(size: 22))
                                        }
                                    }
                                    .padding(12)
                                    .background(
                                        RoundedRectangle(cornerRadius: 12)
                                            .fill(selectedType == type ? Color.biznoCardBackground : Color.clear)
                                            .overlay(
                                                RoundedRectangle(cornerRadius: 12)
                                                    .stroke(selectedType == type ? Color.biznoElectric.opacity(0.3) : Color.clear, lineWidth: 1)
                                            )
                                    )
                                }
                                .buttonStyle(PlainButtonStyle())
                            }
                        }

                        // Create Button
                        Button {
                            Task {
                                await store.createBusiness(name: name, type: selectedType)
                                if store.message == "Business created successfully." {
                                    await MainActor.run {
                                        dismiss()
                                    }
                                }
                            }
                        } label: {
                            Text("Create Business")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.dynamicPrimary)
                        .disabled(name.isEmpty || store.isBusy)
                        .opacity(name.isEmpty || store.isBusy ? 0.6 : 1)
                        .padding(.top, 16)

                        Spacer(minLength: 40)
                    }
                    .padding(16)
                }
            }
            .navigationTitle("Create Business")
            .navigationBarTitleDisplayMode(.large)
            .toolbarBackground(.visible, for: .navigationBar)
            .toolbarBackground(Color.biznoBackground, for: .navigationBar)
            .onAppear {
                withAnimation(.biznoEase.delay(0.1)) {
                    isAnimating = true
                }
            }
        }
    }
}

// MARK: - Business Detail View
struct BusinessDetailView: View {
    @EnvironmentObject private var store: AppSessionStore
    let business: Business
    @State private var steps: [RoadmapStep] = []
    @State private var teamMembers: [TeamMember] = []
    @State private var pendingInvitations: [Invitation] = []
    @State private var activityLog: [BusinessActivity] = []
    @State private var isLoading = false
    @State private var selectedTab = 0
    @State private var viewMode: ViewMode = .checklist
    @State private var wizardIndex = 0
    @State private var showingInviteSheet = false
    @State private var inviteEmail = ""
    @State private var inviteRole = "member"
    @State private var showingEditSheet = false
    @State private var editBusinessName = ""
    @State private var editBusinessType: BusinessType = .limitedCompany
    @State private var showingOnboarding = false
    
    enum ViewMode: String, CaseIterable {
        case checklist = "checklist"
        case wizard = "wizard"
        
        var displayName: String {
            switch self {
            case .checklist: return "Checklist"
            case .wizard: return "Wizard"
            }
        }
        
        var icon: String {
            switch self {
            case .checklist: return "list.bullet"
            case .wizard: return "wand.and.rays"
            }
        }
    }

    var body: some View {
        ZStack {
            Color.biznoBackground.ignoresSafeArea()

            ScrollView {
                VStack(spacing: 20) {
                    // Header Card
                    headerCard

                    // Tab Picker
                    Picker("Tab", selection: $selectedTab) {
                        Text("Setup Steps").tag(0)
                        Text("Team").tag(1)
                        Text("Activity").tag(2)
                    }
                    .pickerStyle(.segmented)
                    .colorMultiply(.biznoElectric)
                    .padding(.horizontal, 16)

                    // Content
                    switch selectedTab {
                    case 0:
                        stepsSection
                    case 1:
                        teamSection
                    case 2:
                        activitySection
                    default:
                        stepsSection
                    }

                    Spacer(minLength: 40)
                }
                .padding(.vertical, 16)
            }
        }
        .navigationTitle(business.name)
        .navigationBarTitleDisplayMode(.large)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    editBusinessName = business.name
                    editBusinessType = business.businessType
                    showingEditSheet = true
                } label: {
                    Image(systemName: "pencil")
                        .foregroundColor(.biznoElectric)
                }
            }
        }
        .sheet(isPresented: $showingEditSheet) {
            EditBusinessSheet(
                business: business,
                businessName: $editBusinessName,
                businessType: $editBusinessType,
                onSave: saveBusinessChanges
            )
        }
        .sheet(isPresented: $showingOnboarding) {
            OnboardingSheet(business: business)
        }
        .toolbarBackground(.visible, for: .navigationBar)
        .toolbarBackground(Color.biznoBackground, for: .navigationBar)
        .refreshable {
            await loadData()
        }
        .onAppear {
            checkAndShowOnboarding()
            RealtimeSyncManager.shared.startBusinessSync(businessId: business.id)
        }
        .onDisappear {
            RealtimeSyncManager.shared.stopBusinessSync()
        }
        .task {
            await loadData()
        }
    }
    
    private func checkAndShowOnboarding() {
        // Show onboarding if business was created in the last 5 minutes
        let fiveMinutesAgo = Date().addingTimeInterval(-300)
        if business.createdAt > fiveMinutesAgo && business.completedTasks.isEmpty {
            showingOnboarding = true
        }
    }

    private var headerCard: some View {
        VStack(spacing: 16) {
            businessInfoSection
            progressSection
            viewModeToggle
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(Color.biznoCardBackground)
        )
    }
    
    private var businessInfoSection: some View {
        HStack(spacing: 16) {
            Image(systemName: business.typeIcon)
                .font(.system(size: 32))
                .foregroundColor(.biznoElectric)
                .frame(width: 64, height: 64)
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color.biznoElectricMuted)
                )

            VStack(alignment: .leading, spacing: 4) {
                Text(business.name)
                    .font(.biznoHeadline)
                    .foregroundColor(.biznoPrimaryText)

                Text(business.typeDisplayName)
                    .font(.biznoCaption)
                    .foregroundColor(.biznoSecondaryText)
            }

            Spacer()
        }
    }
    
    private var progressSection: some View {
        Group {
            if business.completionPercentage > 0 {
                VStack(spacing: 8) {
                    HStack {
                        Text("Setup Progress")
                            .font(.biznoCaption)
                            .foregroundColor(.biznoSecondaryText)
                        Spacer()
                        Text("\(Int(business.completionPercentage))%")
                            .font(.biznoCaption)
                            .fontWeight(.semibold)
                            .foregroundColor(.biznoElectric)
                    }

                    DynamicBiznoProgressBar(value: business.completionPercentage / 100.0)
                        .frame(height: 8)
                }
            }
        }
    }
    
    private var viewModeToggle: some View {
        HStack {
            Text("View Mode")
                .font(.biznoCaption)
                .foregroundColor(.biznoSecondaryText)
            
            Spacer()
            
            HStack(spacing: 0) {
                ForEach(ViewMode.allCases, id: \.self) { mode in
                    Button {
                        withAnimation(.biznoEase) {
                            viewMode = mode
                            if mode == .wizard {
                                // Find first incomplete step
                                wizardIndex = steps.firstIndex { step in
                                    !business.completedTasks.contains(step.id)
                                } ?? 0
                            }
                        }
                    } label: {
                        HStack(spacing: 6) {
                            Image(systemName: mode.icon)
                                .font(.system(size: 12))
                            Text(mode.displayName)
                                .font(.biznoCaption)
                                .fontWeight(.medium)
                        }
                        .foregroundColor(viewMode == mode ? .white : .biznoSecondaryText)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(
                            RoundedRectangle(cornerRadius: 8)
                                .fill(viewMode == mode ? Color.biznoElectric : Color.clear)
                        )
                    }
                }
            }
            .padding(2)
            .background(
                RoundedRectangle(cornerRadius: 10)
                    .fill(Color.biznoElevatedBackground)
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(Color.biznoBorderDynamic, lineWidth: 1)
                    )
            )
        }
    }
    
    private var stepsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            if isLoading {
                HStack {
                    Spacer()
                    ProgressView()
                        .scaleEffect(1.2)
                        .tint(.biznoElectric)
                    Spacer()
                }
                .padding(.vertical, 40)
            } else if steps.isEmpty {
                VStack(spacing: 12) {
                    Image(systemName: "checkmark.circle")
                        .font(.system(size: 40))
                        .foregroundColor(.biznoTertiaryText)
                    Text("No setup steps yet")
                        .font(.biznoBody)
                        .foregroundColor(.biznoSecondaryText)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 40)
            } else {
                if viewMode == .checklist {
                    LazyVStack(spacing: 12) {
                        ForEach(steps) { step in
                            StepRow(step: step, business: business)
                        }
                    }
                    .padding(.horizontal, 16)
                } else {
                    // Wizard view
                    WizardView(
                        steps: steps,
                        business: business,
                        currentIndex: $wizardIndex
                    )
                }
            }
        }
    }

    private var teamSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Invite Button
            Button {
                showingInviteSheet = true
            } label: {
                HStack(spacing: 12) {
                    Image(systemName: "person.badge.plus")
                        .font(.system(size: 20))
                        .foregroundColor(.biznoElectric)
                        .frame(width: 40, height: 40)
                        .background(
                            RoundedRectangle(cornerRadius: 10)
                                .fill(Color.biznoElectricMuted)
                        )

                    Text("Invite Team Member")
                        .font(.biznoBody)
                        .foregroundColor(.biznoPrimaryText)

                    Spacer()

                    Image(systemName: "chevron.right")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.biznoTertiaryText)
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
            .padding(.horizontal, 16)
            .sheet(isPresented: $showingInviteSheet) {
                InviteTeamMemberSheet(
                    businessID: business.id,
                    inviteEmail: $inviteEmail,
                    inviteRole: $inviteRole,
                    onInvite: sendInvitation
                )
            }

            // Pending Invitations
            if !pendingInvitations.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Pending Invitations")
                        .font(.biznoSmall)
                        .fontWeight(.semibold)
                        .foregroundColor(.biznoSecondaryText)
                        .padding(.horizontal, 16)
                    
                    LazyVStack(spacing: 8) {
                        ForEach(pendingInvitations) { invitation in
                            PendingInvitationRow(
                                invitation: invitation,
                                onCancel: cancelPendingInvitation
                            )
                        }
                    }
                    .padding(.horizontal, 16)
                }
            }

            // Team Members List
            if teamMembers.isEmpty {
                VStack(spacing: 12) {
                    Image(systemName: "person.2")
                        .font(.system(size: 40))
                        .foregroundColor(.biznoTertiaryText)
                    Text("No team members yet")
                        .font(.biznoBody)
                        .foregroundColor(.biznoSecondaryText)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 40)
            } else {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Team Members")
                        .font(.biznoSmall)
                        .fontWeight(.semibold)
                        .foregroundColor(.biznoSecondaryText)
                        .padding(.horizontal, 16)
                    
                    LazyVStack(spacing: 12) {
                        ForEach(teamMembers) { member in
                            TeamMemberRow(member: member, onRemove: removeTeamMember)
                        }
                    }
                    .padding(.horizontal, 16)
                }
            }
        }
    }
    
    private func sendInvitation() {
        guard let session = store.session else { return }
        Task {
            do {
                try await store.api.inviteTeamMember(
                    businessID: business.id,
                    email: inviteEmail,
                    role: inviteRole,
                    accessToken: session.accessToken
                )
                await store.refreshAll()
                await loadInvitations(session: session)
                showingInviteSheet = false
                inviteEmail = ""
                store.message = "Invitation sent successfully"
            } catch {
                store.message = error.localizedDescription
            }
        }
    }
    
    private func cancelPendingInvitation(_ invitation: Invitation) {
        guard let session = store.session else { return }
        Task {
            do {
                try await store.api.cancelInvitation(
                    invitationID: invitation.id,
                    accessToken: session.accessToken
                )
                await loadInvitations(session: session)
                store.message = "Invitation cancelled"
            } catch {
                store.message = error.localizedDescription
            }
        }
    }
    
    private func removeTeamMember(_ member: TeamMember) {
        guard let session = store.session else { return }
        Task {
            do {
                try await store.api.removeTeamMember(
                    membershipID: member.id,
                    accessToken: session.accessToken
                )
                await loadTeam(session: session)
                store.message = "Team member removed"
            } catch {
                store.message = error.localizedDescription
            }
        }
    }
    
    private func saveBusinessChanges() {
        guard let session = store.session else { return }
        Task {
            do {
                try await store.api.updateBusiness(
                    businessID: business.id,
                    name: editBusinessName,
                    type: editBusinessType.rawValue,
                    accessToken: session.accessToken
                )
                await store.refreshAll()
                showingEditSheet = false
                store.message = "Business updated successfully"
            } catch {
                store.message = error.localizedDescription
            }
        }
    }

    private var activitySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            if isLoading {
                HStack {
                    Spacer()
                    ProgressView()
                        .scaleEffect(1.2)
                        .tint(.biznoElectric)
                    Spacer()
                }
                .padding(.vertical, 40)
            } else if activityLog.isEmpty {
                VStack(spacing: 12) {
                    Image(systemName: "clock")
                        .font(.system(size: 40))
                        .foregroundColor(.biznoTertiaryText)
                    Text("No activity yet")
                        .font(.biznoBody)
                        .foregroundColor(.biznoSecondaryText)
                    Text("Task completions and changes will appear here")
                        .font(.biznoCaption)
                        .foregroundColor(.biznoTertiaryText)
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 40)
            } else {
                LazyVStack(spacing: 8) {
                    ForEach(activityLog) { activity in
                        ActivityRow(activity: activity)
                    }
                }
                .padding(.horizontal, 16)
            }
        }
    }

    private func loadData() async {
        guard let session = store.session else { return }
        isLoading = true

        async let stepsTask: () = loadSteps(session: session)
        async let teamTask: () = loadTeam(session: session)
        async let activityTask: () = loadActivity(session: session)
        async let invitationsTask: () = loadInvitations(session: session)
        _ = await (stepsTask, teamTask, activityTask, invitationsTask)

        isLoading = false
    }

    private func loadSteps(session: SupabaseSession) async {
        do {
            steps = try await store.api.fetchBusinessSteps(accessToken: session.accessToken)
        } catch {
        }
    }

    private func loadTeam(session: SupabaseSession) async {
        do {
            teamMembers = try await store.api.fetchTeamMembers(businessID: business.id, accessToken: session.accessToken)
        } catch {
            print("Failed to load team: \(error)")
        }
    }
    
    private func loadActivity(session: SupabaseSession) async {
        do {
            activityLog = try await store.api.fetchBusinessActivityLog(businessID: business.id, accessToken: session.accessToken)
        } catch {
            print("Failed to load activity log: \(error)")
        }
    }
    
    private func loadInvitations(session: SupabaseSession) async {
        do {
            pendingInvitations = try await store.api.fetchBusinessPendingInvitations(businessID: business.id, accessToken: session.accessToken)
        } catch {
            print("Failed to load pending invitations: \(error)")
        }
    }
}

// MARK: - Loading View
struct LoadingView: View {
    var body: some View {
        BiznoLoadingView()
    }
}

// MARK: - Notification Card
struct NotificationCard: View {
    let notification: UserNotification
    let isNavigable: Bool

    init(notification: UserNotification, isNavigable: Bool = false) {
        self.notification = notification
        self.isNavigable = isNavigable
    }

    var body: some View {
        HStack(spacing: 16) {
            // Icon
            ZStack {
                Circle()
                    .fill(iconColor.opacity(0.15))
                    .frame(width: 44, height: 44)

                Image(systemName: iconName)
                    .font(.system(size: 20))
                    .foregroundColor(iconColor)
            }

            // Content
            VStack(alignment: .leading, spacing: 4) {
                Text(notification.title)
                    .font(.biznoBody)
                    .foregroundColor(.biznoPrimaryText)

                if let body = notification.body, !body.isEmpty {
                    Text(body)
                        .font(.biznoCaption)
                        .foregroundColor(.biznoSecondaryText)
                        .lineLimit(2)
                }

                if let contextLine {
                    Text(contextLine)
                        .font(.system(size: 11))
                        .foregroundColor(.biznoTertiaryText)
                }

                Text(notification.createdAt.formatted(date: .abbreviated, time: .shortened))
                    .font(.system(size: 11))
                    .foregroundColor(.biznoTertiaryText)
            }

            Spacer()

            // Unread indicator
            if !notification.read {
                Circle()
                    .fill(Color.biznoElectric)
                    .frame(width: 8, height: 8)
            }

            if isNavigable {
                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(.biznoTertiaryText)
            }
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

    private var contextLine: String? {
        let actor = notification.data?.actorEmail ?? notification.data?.inviterEmail
        let context = [
            actor.map { "By \($0)" },
            notification.data?.businessName.map { "Business: \($0)" }
        ]
        .compactMap { $0 }

        if context.isEmpty {
            return nil
        }

        return context.joined(separator: " • ")
    }

    private var iconName: String {
        switch notification.type {
        case "deadline_approaching":
            return "clock.badge.exclamationmark"
        case "invitation":
            return "envelope.badge.fill"
        case "task_completed":
            return "checkmark.circle.fill"
        default:
            return "bell.fill"
        }
    }

    private var iconColor: Color {
        switch notification.type {
        case "deadline_approaching":
            return .biznoWarning
        case "invitation":
            return .biznoSuccess
        case "task_completed":
            return .biznoSuccess
        default:
            return .biznoElectric
        }
    }
}

// MARK: - Notifications View
struct NotificationsView: View {
    @EnvironmentObject private var store: AppSessionStore
    @State private var isAnimating = false

    var body: some View {
        NavigationStack {
            ZStack {
                Color.biznoBackground.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 16) {
                        if store.notifications.isEmpty {
                            VStack(spacing: 16) {
                                Image(systemName: "bell.slash")
                                    .font(.system(size: 60))
                                    .foregroundColor(.biznoTertiaryText)
                                Text("No notifications")
                                    .font(.biznoHeadline)
                                    .foregroundColor(.biznoSecondaryText)
                            }
                            .padding(.top, 80)
                        } else {
                            LazyVStack(spacing: 12) {
                                ForEach(Array(store.notifications.enumerated()), id: \.element.id) { index, notification in
                                    Group {
                                        if let businessID = notification.data?.businessID,
                                           let business = store.businesses.first(where: { $0.id == businessID }) {
                                            NavigationLink(destination: BusinessDetailView(business: business)) {
                                                NotificationCard(notification: notification, isNavigable: true)
                                            }
                                            .buttonStyle(PlainButtonStyle())
                                        } else {
                                            NotificationCard(notification: notification)
                                        }
                                    }
                                    .opacity(isAnimating ? 1 : 0)
                                    .offset(y: isAnimating ? 0 : 20)
                                    .animation(.biznoEase.delay(Double(index) * 0.05), value: isAnimating)
                                }
                            }
                            .padding(.horizontal, 16)
                        }
                    }
                }
            }
            .navigationTitle("Notifications")
            .navigationBarTitleDisplayMode(.large)
            .toolbarBackground(.visible, for: .navigationBar)
            .toolbarBackground(Color.biznoBackground, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Mark all read") {
                        Task { await store.markNotificationsRead() }
                    }
                    .disabled(store.isBusy || store.unreadCount == 0)
                }
            }
            .onAppear {
                withAnimation(.biznoEase.delay(0.1)) {
                    isAnimating = true
                }
            }
        }
    }
}

// MARK: - Settings View
struct SettingsView: View {
    @EnvironmentObject private var store: AppSessionStore
    @Environment(ThemeManager.self) private var themeManager
    @State private var isAnimating = false

    var body: some View {
        NavigationStack {
            ZStack {
                Color.biznoBackground.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 24) {
                        // Theme Section
                        VStack(alignment: .leading, spacing: 12) {
                            SectionHeader(title: "Appearance", icon: "paintbrush.fill")

                            VStack(spacing: 8) {
                                ForEach(ThemeManager.Theme.allCases, id: \.self) { theme in
                                    Button {
                                        withAnimation(.easeInOut(duration: 0.2)) {
                                            themeManager.currentTheme = theme
                                        }
                                    } label: {
                                        HStack(spacing: 12) {
                                            Image(systemName: theme.icon)
                                                .font(.system(size: 20))
                                                .foregroundColor(themeManager.currentTheme == theme ? .biznoElectric : .biznoTertiaryText)
                                                .frame(width: 40, height: 40)
                                                .background(
                                                    RoundedRectangle(cornerRadius: 10)
                                                        .fill(themeManager.currentTheme == theme ? Color.biznoElectric.opacity(0.15) : Color.biznoElevatedBackground)
                                                )

                                            Text(theme.rawValue)
                                                .font(.biznoBody)
                                                .foregroundColor(.biznoPrimaryText)

                                            Spacer()

                                            if themeManager.currentTheme == theme {
                                                Image(systemName: "checkmark.circle.fill")
                                                    .foregroundColor(.biznoElectric)
                                                    .font(.system(size: 22))
                                            }
                                        }
                                        .padding(12)
                                        .background(
                                            RoundedRectangle(cornerRadius: 12)
                                                .fill(themeManager.currentTheme == theme ? Color.biznoCardBackground : Color.clear)
                                                .overlay(
                                                    RoundedRectangle(cornerRadius: 12)
                                                        .stroke(themeManager.currentTheme == theme ? Color.biznoElectric.opacity(0.3) : Color.clear, lineWidth: 1)
                                                )
                                        )
                                    }
                                    .buttonStyle(PlainButtonStyle())
                                }
                            }
                        }

                        // Sign Out Button
                        Button {
                            Task { await store.signOut() }
                        } label: {
                            Text("Sign Out")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.dynamicSecondary)
                        .padding(.top, 16)

                        Spacer(minLength: 40)
                    }
                    .padding(16)
                }
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.large)
            .toolbarBackground(.visible, for: .navigationBar)
            .toolbarBackground(Color.biznoBackground, for: .navigationBar)
            .onAppear {
                withAnimation(.biznoEase.delay(0.1)) {
                    isAnimating = true
                }
            }
        }
    }
}

// MARK: - Step Row
struct StepRow: View {
    @EnvironmentObject private var store: AppSessionStore
    let step: RoadmapStep
    let business: Business
    @State private var isToggling = false
    
    private var isCompleted: Bool {
        business.completedTasks.contains(step.id)
    }

    var body: some View {
        HStack(spacing: 16) {
            // Checkbox button
            Button {
                toggleStep()
            } label: {
                ZStack {
                    Circle()
                        .stroke(isCompleted ? Color.biznoSuccess : Color.biznoBorderDynamic, lineWidth: 2)
                        .frame(width: 28, height: 28)

                    if isCompleted {
                        Circle()
                            .fill(Color.biznoSuccess)
                            .frame(width: 28, height: 28)

                        Image(systemName: "checkmark")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.white)
                    }
                }
            }
            .buttonStyle(PlainButtonStyle())
            .disabled(isToggling || store.isBusy)
            .opacity(isToggling ? 0.6 : 1)

            // Content
            VStack(alignment: .leading, spacing: 4) {
                Text(step.title)
                    .font(.biznoBody)
                    .foregroundColor(isCompleted ? .biznoTertiaryText : .biznoPrimaryText)
                    .strikethrough(isCompleted)

                if let description = step.description, !description.isEmpty {
                    Text(description)
                        .font(.biznoCaption)
                        .foregroundColor(.biznoSecondaryText)
                        .lineLimit(2)
                }
                
                if let affiliateLink = step.affiliateLink, !affiliateLink.isEmpty,
                   let affiliateName = step.affiliateName, !affiliateName.isEmpty {
                    Link(destination: URL(string: affiliateLink)!) {
                        HStack(spacing: 4) {
                            Image(systemName: "link.circle.fill")
                                .font(.system(size: 12))
                            Text(affiliateName)
                                .font(.system(size: 12, weight: .medium))
                        }
                        .foregroundColor(.biznoElectric)
                    }
                }
            }

            Spacer()
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(isCompleted ? Color.biznoElevatedBackground : Color.biznoCardBackground)
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(isCompleted ? Color.biznoBorderDynamic : Color.biznoElectric.opacity(0.2), lineWidth: 1)
                )
        )
    }

    private func toggleStep() {
        guard let session = store.session else {
            return
        }
        isToggling = true
        let newCompletionState = !isCompleted
        Task {
            do {
                try await store.api.toggleStepComplete(
                    businessID: business.id,
                    stepID: step.id,
                    isCompleted: newCompletionState,
                    accessToken: session.accessToken
                )
                // Refresh businesses to get updated state
                await store.refreshAll()
                isToggling = false
            } catch {
                isToggling = false
                store.message = error.localizedDescription
            }
        }
    }
}

// MARK: - Team Member Row
struct TeamMemberRow: View {
    let member: TeamMember
    let onRemove: ((TeamMember) -> Void)?

    var body: some View {
        HStack(spacing: 16) {
            // Avatar
            BiznoAvatar(
                initials: String(member.email.prefix(2).uppercased()),
                size: 44,
                color: .biznoPurple
            )

            // Info
            VStack(alignment: .leading, spacing: 4) {
                Text(member.email)
                    .font(.biznoBody)
                    .foregroundColor(.biznoPrimaryText)
                    .lineLimit(1)

                Text(member.role.capitalized)
                    .font(.biznoCaption)
                    .foregroundColor(.biznoSecondaryText)
            }

            Spacer()
            
            // Remove button (if callback provided)
            if let onRemove = onRemove {
                Button {
                    onRemove(member)
                } label: {
                    Image(systemName: "person.badge.minus")
                        .font(.system(size: 20))
                        .foregroundColor(.biznoWarning)
                }
            }

            // Joined date
            Text(member.createdAt.formatted(date: .abbreviated, time: .omitted))
                .font(.system(size: 11))
                .foregroundColor(.biznoTertiaryText)
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
