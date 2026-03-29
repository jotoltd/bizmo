//
//  biznoApp.swift
//  bizno
//
//  Created by Rate My Plate on 25/03/2026.
//

import SwiftUI

@main
struct biznoApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    @StateObject private var store = AppSessionStore()
    @State private var themeManager = ThemeManager.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(store)
                .environment(themeManager)
                .preferredColorScheme(themeManager.colorScheme)
        }
    }
}
