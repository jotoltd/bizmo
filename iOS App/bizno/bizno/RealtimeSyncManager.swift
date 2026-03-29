import Foundation
import Combine
import SwiftUI

/// Manages real-time data synchronization for the app
/// Uses a combination of:
/// 1. Polling (every 30 seconds when app is active)
/// 2. Manual refresh (pull-to-refresh)
/// 3. Background refresh (when app returns to foreground)
@MainActor
class RealtimeSyncManager: ObservableObject {
    static let shared = RealtimeSyncManager()
    
    @Published var isConnected = false
    @Published var lastSyncTime: Date?
    @Published var isSyncing = false
    
    private var appSessionStore: AppSessionStore?
    private var pollingTimer: Timer?
    private var activeBusinessId: String?
    private var cancellables = Set<AnyCancellable>()
    
    // Polling interval in seconds
    private let pollingInterval: TimeInterval = 30
    private let foregroundRefreshInterval: TimeInterval = 5
    
    private init() {}
    
    // MARK: - Setup
    
    func configure(with store: AppSessionStore) {
        self.appSessionStore = store
        setupAppLifecycleObservers()
    }
    
    // MARK: - App Lifecycle
    
    private func setupAppLifecycleObservers() {
        NotificationCenter.default.publisher(for: UIApplication.didBecomeActiveNotification)
            .sink { [weak self] _ in
                Task { @MainActor in
                    self?.handleAppBecameActive()
                }
            }
            .store(in: &cancellables)
        
        NotificationCenter.default.publisher(for: UIApplication.didEnterBackgroundNotification)
            .sink { [weak self] _ in
                Task { @MainActor in
                    self?.handleAppWentToBackground()
                }
            }
            .store(in: &cancellables)
    }
    
    private func handleAppBecameActive() {
        Task {
            await performSync()
        }
        startPolling()
    }
    
    private func handleAppWentToBackground() {
        stopPolling()
    }
    
    // MARK: - Polling
    
    func startPolling() {
        stopPolling()
        
        pollingTimer = Timer.scheduledTimer(withTimeInterval: pollingInterval, repeats: true) { [weak self] _ in
            Task { @MainActor in
                await self?.performSync()
            }
        }
        
        if let timer = pollingTimer {
            RunLoop.current.add(timer, forMode: .common)
        }
    }
    
    func stopPolling() {
        pollingTimer?.invalidate()
        pollingTimer = nil
    }
    
    // MARK: - Sync Operations
    
    func performSync() async {
        guard let store = appSessionStore else { return }
        guard !isSyncing else { return }
        guard store.screenState == .signedIn else { return }
        
        isSyncing = true
        defer { isSyncing = false }
        
        do {
            await store.refreshAll()
            lastSyncTime = Date()
            isConnected = true
        } catch {
            print("Sync failed: \(error)")
            isConnected = false
        }
    }
    
    // MARK: - Business-Specific Sync
    
    func startBusinessSync(businessId: String) {
        activeBusinessId = businessId
        stopPolling()
        
        pollingTimer = Timer.scheduledTimer(withTimeInterval: foregroundRefreshInterval, repeats: true) { [weak self] _ in
            Task { @MainActor in
                await self?.performBusinessSync(businessId: businessId)
            }
        }
        
        if let timer = pollingTimer {
            RunLoop.current.add(timer, forMode: .common)
        }
        
        Task {
            await performBusinessSync(businessId: businessId)
        }
    }
    
    func stopBusinessSync() {
        activeBusinessId = nil
        startPolling()
    }
    
    private func performBusinessSync(businessId: String) async {
        guard let store = appSessionStore else { return }
        guard !isSyncing else { return }
        
        isSyncing = true
        defer { isSyncing = false }
        
        do {
            await store.refreshAll()
            lastSyncTime = Date()
            isConnected = true
        } catch {
            print("Business sync failed: \(error)")
            isConnected = false
        }
    }
    
    // MARK: - Manual Refresh
    
    func manualRefresh() async {
        await performSync()
    }
    
    // MARK: - Cleanup
    
    func stopAllSync() {
        stopPolling()
        activeBusinessId = nil
        cancellables.removeAll()
    }
}

// MARK: - View Modifier for Real-time Sync

struct RealtimeSyncModifier: ViewModifier {
    @EnvironmentObject private var store: AppSessionStore
    
    func body(content: Content) -> some View {
        content
            .onAppear {
                RealtimeSyncManager.shared.configure(with: store)
                RealtimeSyncManager.shared.startPolling()
            }
            .onDisappear {
                RealtimeSyncManager.shared.stopAllSync()
            }
    }
}

extension View {
    func withRealtimeSync() -> some View {
        modifier(RealtimeSyncModifier())
    }
}

// MARK: - Pull-to-Refresh Support

struct PullToRefreshModifier: ViewModifier {
    let action: () async -> Void
    
    func body(content: Content) -> some View {
        content
            .refreshable {
                await action()
            }
    }
}

extension View {
    func pullToRefresh(action: @escaping () async -> Void) -> some View {
        modifier(PullToRefreshModifier(action: action))
    }
}
