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

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(store)
        }
    }
}
