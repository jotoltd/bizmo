//
//  ContentView.swift
//  bizno
//
//  Created by Rate My Plate on 25/03/2026.
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var store: AppSessionStore

    var body: some View {
        Group {
            switch store.screenState {
            case .loading:
                ProgressView("Loading")
            case .signedOut:
                AuthView()
            case .signedIn:
                MainTabView()
            }
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(AppSessionStore())
}
