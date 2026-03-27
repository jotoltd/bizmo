import Foundation
import UserNotifications
import UIKit

extension Notification.Name {
    static let biznoDeviceTokenDidUpdate = Notification.Name("biznoDeviceTokenDidUpdate")
}

@MainActor
final class NotificationService {
    static let shared = NotificationService()

    private let tokenStorageKey = "bizno.apns.deviceToken"

    private init() {}

    var currentDeviceToken: String? {
        UserDefaults.standard.string(forKey: tokenStorageKey)
    }

    func configure() async {
        UNUserNotificationCenter.current().delegate = NotificationCenterDelegate.shared
    }

    func ensureAuthorizationAndRegisterForRemotePush() async {
        let center = UNUserNotificationCenter.current()
        do {
            let granted = try await center.requestAuthorization(options: [.alert, .sound, .badge])
            guard granted else { return }
            UIApplication.shared.registerForRemoteNotifications()
        } catch {
            print("Notification authorization error: \(error.localizedDescription)")
        }
    }

    func postLocalNotification(id: String, title: String, body: String) async {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default

        let request = UNNotificationRequest(
            identifier: "bizno.local.\(id)",
            content: content,
            trigger: nil
        )

        do {
            try await UNUserNotificationCenter.current().add(request)
        } catch {
            print("Failed to post local notification: \(error.localizedDescription)")
        }
    }

    func storeDeviceToken(_ token: String) {
        UserDefaults.standard.set(token, forKey: tokenStorageKey)
        NotificationCenter.default.post(name: .biznoDeviceTokenDidUpdate, object: token)
    }
}

final class NotificationCenterDelegate: NSObject, UNUserNotificationCenterDelegate {
    static let shared = NotificationCenterDelegate()

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        completionHandler([.banner, .sound, .badge])
    }
}

final class AppDelegate: NSObject, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
    ) {
        let token = deviceToken.map { String(format: "%02x", $0) }.joined()
        print("APNs device token: \(token)")
        Task { @MainActor in
            NotificationService.shared.storeDeviceToken(token)
        }
    }

    func application(
        _ application: UIApplication,
        didFailToRegisterForRemoteNotificationsWithError error: Error
    ) {
        print("Failed to register for remote notifications: \(error.localizedDescription)")
    }
}
