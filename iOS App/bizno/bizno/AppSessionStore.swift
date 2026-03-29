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
    @Published var businesses: [Business] = []
    @Published var pendingInvitations: [Invitation] = []
    @Published var selectedBusinessFilter: BusinessFilter = .all
    @Published var isBusy = false
    @Published var message: String?
    @Published var selectedFilter: NotificationFilter = .all

    let api = SupabaseAPI()
    private let notificationService = NotificationService.shared
    private let storageKey = "bizno.session"
    private var seenNotificationIDs = Set<String>()
    // nonisolated(unsafe) allows access from deinit for cancellation only
    nonisolated(unsafe) private var realtimeTask: Task<Void, Never>?
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
                do {
                    try await self.refreshAllData()
                } catch APIError.tokenExpired {
                    do {
                        _ = try await self.refreshSession()
                        try await self.refreshAllData()
                    } catch {
                        self.message = error.localizedDescription
                    }
                } catch {
                    self.message = error.localizedDescription
                }
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
        realtimeTask?.cancel()
    }

    func signOut() {
        // Clear secure storage
        if let userId = session?.user.id {
            try? SecureKeychain.shared.deleteSupabaseSession(userId: userId)
        }
        UserDefaults.standard.removeObject(forKey: "bizno.lastUserId")
        
        session = nil
        notifications = []
        emailPreferences = nil
        businesses = []
        pendingInvitations = []
        message = nil
        screenState = .signedOut
        stopRealtimeSync()
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
        async let notificationsTask: () = refreshNotifications(notifyNew: false)
        async let preferencesTask: () = refreshPreferences()
        async let businessesTask: () = refreshBusinesses()
        async let invitationsTask: () = refreshInvitations()
        _ = try await (notificationsTask, preferencesTask, businessesTask, invitationsTask)
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

    private func refreshBusinesses() async throws {
        guard let session else { return }
        do {
            businesses = try await api.fetchBusinesses(accessToken: session.accessToken, userID: session.user.id)
        } catch APIError.tokenExpired {
            try await refreshSessionAndRetry()
        }
    }

    private func refreshSessionAndRetry() async throws {
        let refreshed = try await refreshSession()
        businesses = try await api.fetchBusinesses(accessToken: refreshed.accessToken, userID: refreshed.user.id)
    }

    private func refreshSession() async throws -> SupabaseSession {
        guard let session else {
            throw APIError.tokenExpired
        }
        let refreshed = try await api.refreshToken(refreshToken: session.refreshToken)
        apply(session: refreshed)
        return refreshed
    }

    private func refreshInvitations() async throws {
        guard let session else { return }
        pendingInvitations = try await api.fetchPendingInvitations(accessToken: session.accessToken)
    }

    // MARK: - Public Business Methods

    func createBusiness(name: String, type: BusinessType) async {
        guard let session else { return }
        await perform {
            _ = try await self.api.createBusiness(name: name, type: type, userID: session.user.id, accessToken: session.accessToken)
            self.message = "Business created successfully."
            try await self.refreshBusinesses()
        }
    }

    func deleteBusiness(_ business: Business) async {
        guard let session else { return }
        await perform {
            try await self.api.deleteBusiness(businessID: business.id, accessToken: session.accessToken)
            self.message = "Business deleted."
            try await self.refreshBusinesses()
        }
    }

    // MARK: - Public Invitation Methods

    func respondToInvitation(_ invitation: Invitation, accept: Bool) async {
        guard let session else { return }
        await perform {
            try await self.api.respondToInvitation(invitationID: invitation.id, accept: accept, accessToken: session.accessToken)
            self.message = accept ? "Invitation accepted." : "Invitation declined."
            try await self.refreshInvitations()
            try await self.refreshBusinesses()
        }
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
        
        if let lastUserId = UserDefaults.standard.string(forKey: "bizno.lastUserId"),
           let secureSession = try? SecureKeychain.shared.loadSupabaseSession(userId: lastUserId) {
            session = secureSession
            return
        }

        if let anySession = try? SecureKeychain.shared.loadAnySupabaseSession() {
            session = anySession
            UserDefaults.standard.set(anySession.user.id, forKey: "bizno.lastUserId")
            return
        }

        session = nil
    }

    private func persistSession(_ session: SupabaseSession) {
        do {
            // Store session securely in Keychain
            try SecureKeychain.shared.saveSupabaseSession(session)
            // Store only the user ID in UserDefaults (non-sensitive) for session recovery
            UserDefaults.standard.set(session.user.id, forKey: "bizno.lastUserId")
        } catch {
            message = "Unable to persist session securely."
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

    nonisolated private func stopRealtimeSync() {
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
