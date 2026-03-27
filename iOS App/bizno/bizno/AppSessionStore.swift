import Foundation
import SwiftUI
import Combine

@MainActor
final class AppSessionStore: ObservableObject {
    enum ScreenState {
        case loading
        case signedOut
        case signedIn
    }

    @Published var screenState: ScreenState = .loading
    @Published var session: SupabaseSession?
    @Published var notifications: [UserNotification] = []
    @Published var emailPreferences: UserEmailPreferences?
    @Published var isBusy = false
    @Published var message: String?
    @Published var selectedFilter: NotificationFilter = .all

    private let api = SupabaseAPI()
    private let notificationService = NotificationService.shared
    private let storageKey = "bizno.session"
    private var seenNotificationIDs = Set<String>()
    private var realtimeTask: Task<Void, Never>?
    private var tokenObserver: NSObjectProtocol?

    var filteredNotifications: [UserNotification] {
        notifications.filter { selectedFilter.includes(type: $0.type) }
    }

    var unreadCount: Int {
        notifications.filter { !$0.read }.count
    }

    init() {
        restoreSession()
        tokenObserver = NotificationCenter.default.addObserver(
            forName: .biznoDeviceTokenDidUpdate,
            object: nil,
            queue: .main
        ) { [weak self] notification in
            guard let self, let token = notification.object as? String else { return }
            Task {
                await self.syncDeviceTokenIfPossible(token: token)
            }
        }

        Task {
            await self.notificationService.configure()
            if self.session != nil {
                try? await self.refreshAllData()
                self.startRealtimeSync()
                await self.notificationService.ensureAuthorizationAndRegisterForRemotePush()
                await self.syncDeviceTokenIfPossible()
            }
        }
    }

    func signIn(email: String, password: String) async {
        await perform {
            let session = try await self.api.signIn(email: email, password: password)
            self.apply(session: session)
            self.message = "Signed in successfully."
            try await self.refreshAllData()
            await self.notificationService.ensureAuthorizationAndRegisterForRemotePush()
            await self.syncDeviceTokenIfPossible()
        }
    }

    func signUp(email: String, password: String) async {
        await perform {
            let response = try await self.api.signUp(email: email, password: password)
            if let session = response.session {
                self.apply(session: session)
                self.message = "Account created and signed in."
                try await self.refreshAllData()
                await self.notificationService.ensureAuthorizationAndRegisterForRemotePush()
                await self.syncDeviceTokenIfPossible()
            } else {
                self.message = "Account created. Check your email to verify before signing in."
            }
        }
    }

    deinit {
        if let tokenObserver {
            NotificationCenter.default.removeObserver(tokenObserver)
        }
        Task { @MainActor in
            stopRealtimeSync()
        }
    }

    func signOut() {
        session = nil
        notifications = []
        emailPreferences = nil
        message = nil
        screenState = .signedOut
        stopRealtimeSync()
        UserDefaults.standard.removeObject(forKey: storageKey)
    }

    func refreshAll() async {
        await perform {
            try await self.refreshAllData()
        }
    }

    func markNotificationsRead() async {
        guard let session else { return }
        await perform {
            try await self.api.markAllNotificationsRead(userID: session.user.id, accessToken: session.accessToken)
            try await self.refreshNotifications()
            self.message = "Marked all notifications as read."
        }
    }

    func togglePreference(_ keyPath: WritableKeyPath<UserEmailPreferences, Bool>) async {
        guard var prefs = emailPreferences, let session else { return }

        prefs[keyPath: keyPath].toggle()
        emailPreferences = prefs

        await perform {
            try await self.api.updateEmailPreferences(
                userID: session.user.id,
                accessToken: session.accessToken,
                preferences: prefs
            )
            self.message = "Preferences updated."
            try await self.refreshPreferences()
        }
    }

    private func refreshAllData() async throws {
        try await refreshNotifications(notifyNew: false)
        try await refreshPreferences()
    }

    private func refreshNotifications(notifyNew: Bool = true) async throws {
        guard let session else { return }
        let fetched = try await api.fetchNotifications(accessToken: session.accessToken)
        notifications = fetched

        let ids = Set(fetched.map { $0.id })
        let newUnread = fetched.filter { !seenNotificationIDs.contains($0.id) && !$0.read }
        seenNotificationIDs = ids

        if notifyNew {
            for notification in newUnread {
                await notificationService.postLocalNotification(
                    id: notification.id,
                    title: notification.title,
                    body: notification.body ?? "You have a new update in Bizno."
                )
            }
        }
    }

    private func refreshPreferences() async throws {
        guard let session else { return }
        emailPreferences = try await api.fetchEmailPreferences(
            userID: session.user.id,
            accessToken: session.accessToken
        )
    }

    private func perform(_ operation: @escaping () async throws -> Void) async {
        message = nil
        isBusy = true
        defer { isBusy = false }

        do {
            try await operation()
        } catch {
            message = error.localizedDescription
        }
    }

    private func apply(session: SupabaseSession) {
        self.session = session
        self.screenState = .signedIn
        persistSession(session)
        startRealtimeSync()
    }

    private func restoreSession() {
        defer {
            if screenState == .loading {
                screenState = session == nil ? .signedOut : .signedIn
            }
        }

        guard let data = UserDefaults.standard.data(forKey: storageKey) else {
            return
        }

        do {
            let decoded = try JSONDecoder().decode(SupabaseSession.self, from: data)
            session = decoded
        } catch {
            UserDefaults.standard.removeObject(forKey: storageKey)
        }
    }

    private func persistSession(_ session: SupabaseSession) {
        do {
            let data = try JSONEncoder().encode(session)
            UserDefaults.standard.set(data, forKey: storageKey)
        } catch {
            message = "Unable to persist session locally."
        }
    }

    private func startRealtimeSync() {
        stopRealtimeSync()

        realtimeTask = Task { [weak self] in
            guard let self else { return }
            while !Task.isCancelled {
                do {
                    try await self.refreshNotifications()
                } catch {
                    await MainActor.run {
                        self.message = error.localizedDescription
                    }
                }

                try? await Task.sleep(for: .seconds(10))
            }
        }
    }

    private func stopRealtimeSync() {
        realtimeTask?.cancel()
        realtimeTask = nil
    }

    private func syncDeviceTokenIfPossible(token: String? = nil) async {
        guard let session else { return }
        guard let resolvedToken = token ?? notificationService.currentDeviceToken else { return }

        #if DEBUG
        let environment = "sandbox"
        #else
        let environment = "production"
        #endif

        do {
            try await api.upsertDeviceToken(
                userID: session.user.id,
                accessToken: session.accessToken,
                deviceToken: resolvedToken,
                environment: environment
            )
        } catch {
            message = error.localizedDescription
        }
    }
}
