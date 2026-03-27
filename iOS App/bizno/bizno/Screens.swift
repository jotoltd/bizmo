import SwiftUI

struct AuthView: View {
    @EnvironmentObject private var store: AppSessionStore
    @State private var mode: AuthMode = .signIn
    @State private var email = ""
    @State private var password = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("Account") {
                    Picker("Mode", selection: $mode) {
                        ForEach(AuthMode.allCases, id: \.self) { mode in
                            Text(mode.rawValue).tag(mode)
                        }
                    }
                    .pickerStyle(.segmented)

                    TextField("Email", text: $email)
                        .keyboardType(.emailAddress)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()

                    SecureField("Password", text: $password)
                }

                Section {
                    Button(mode.rawValue) {
                        Task {
                            switch mode {
                            case .signIn:
                                await store.signIn(email: email.trimmingCharacters(in: .whitespacesAndNewlines), password: password)
                            case .signUp:
                                await store.signUp(email: email.trimmingCharacters(in: .whitespacesAndNewlines), password: password)
                            }
                        }
                    }
                    .disabled(store.isBusy || email.isEmpty || password.count < 6)
                }

                if let message = store.message {
                    Section("Status") {
                        Text(message)
                            .font(.footnote)
                    }
                }

                if !AppConfig.isConfigured {
                    Section("Setup Required") {
                        Text("Set your Supabase anon key in AppConfig.swift before sign in.")
                            .font(.footnote)
                            .foregroundStyle(.orange)
                    }
                }
            }
            .navigationTitle("Bizno")
        }
    }
}

struct MainTabView: View {
    @EnvironmentObject private var store: AppSessionStore

    var body: some View {
        TabView {
            DashboardView()
                .tabItem {
                    Label("Dashboard", systemImage: "rectangle.grid.2x2")
                }

            NotificationsView()
                .tabItem {
                    Label("Notifications", systemImage: "bell")
                }
                .badge(store.unreadCount)

            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gearshape")
                }
        }
        .task {
            if store.notifications.isEmpty {
                await store.refreshAll()
            }
        }
    }
}

struct DashboardView: View {
    @EnvironmentObject private var store: AppSessionStore

    var body: some View {
        NavigationStack {
            List {
                Section("Account") {
                    LabeledContent("Email", value: store.session?.user.email ?? "Unknown")
                    LabeledContent("Unread notifications", value: "\(store.unreadCount)")
                }

                Section("Actions") {
                    Button("Refresh data") {
                        Task { await store.refreshAll() }
                    }
                    .disabled(store.isBusy)

                    Button("Mark all notifications as read") {
                        Task { await store.markNotificationsRead() }
                    }
                    .disabled(store.isBusy || store.unreadCount == 0)
                }

                if let message = store.message {
                    Section("Status") {
                        Text(message)
                            .font(.footnote)
                    }
                }
            }
            .navigationTitle("Dashboard")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Sign Out") {
                        store.signOut()
                    }
                }
            }
        }
    }
}

struct NotificationsView: View {
    @EnvironmentObject private var store: AppSessionStore

    var body: some View {
        NavigationStack {
            List {
                Section {
                    Picker("Filter", selection: $store.selectedFilter) {
                        ForEach(NotificationFilter.allCases) { filter in
                            Text(filter.rawValue).tag(filter)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                if store.filteredNotifications.isEmpty {
                    ContentUnavailableView(
                        "No notifications",
                        systemImage: "bell.slash",
                        description: Text("You’ll see task and team updates here.")
                    )
                } else {
                    ForEach(store.filteredNotifications) { notification in
                        VStack(alignment: .leading, spacing: 6) {
                            HStack {
                                Text(notification.title)
                                    .font(.headline)
                                if !notification.read {
                                    Circle()
                                        .fill(.blue)
                                        .frame(width: 8, height: 8)
                                }
                            }
                            if let body = notification.body, !body.isEmpty {
                                Text(body)
                                    .font(.subheadline)
                            }
                            Text(notification.createdAt.formatted(date: .abbreviated, time: .shortened))
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        .padding(.vertical, 4)
                    }
                }
            }
            .navigationTitle("Notifications")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Refresh") {
                        Task { await store.refreshAll() }
                    }
                    .disabled(store.isBusy)
                }
            }
        }
    }
}

struct SettingsView: View {
    @EnvironmentObject private var store: AppSessionStore

    var body: some View {
        NavigationStack {
            List {
                if let preferences = store.emailPreferences {
                    Section("Email Preferences") {
                        Toggle("Invitation emails", isOn: Binding(
                            get: { preferences.invitationEmails },
                            set: { _ in
                                Task { await store.togglePreference(\.invitationEmails) }
                            }
                        ))

                        Toggle("Invitation response emails", isOn: Binding(
                            get: { preferences.invitationResponseEmails },
                            set: { _ in
                                Task { await store.togglePreference(\.invitationResponseEmails) }
                            }
                        ))

                        Toggle("Activity emails", isOn: Binding(
                            get: { preferences.activityEmails },
                            set: { _ in
                                Task { await store.togglePreference(\.activityEmails) }
                            }
                        ))

                        Toggle("Announcement emails", isOn: Binding(
                            get: { preferences.announcementEmails },
                            set: { _ in
                                Task { await store.togglePreference(\.announcementEmails) }
                            }
                        ))
                    }
                } else {
                    Section {
                        Text("No email preference record found yet.")
                            .foregroundStyle(.secondary)
                    }
                }

                if let message = store.message {
                    Section("Status") {
                        Text(message)
                            .font(.footnote)
                    }
                }
            }
            .navigationTitle("Settings")
        }
    }
}
