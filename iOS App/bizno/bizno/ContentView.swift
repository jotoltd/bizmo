//
//  ContentView.swift
//  bizno
//
//  Created by Rate My Plate on 25/03/2026.
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var store: AppSessionStore
    @State private var showLaunchScreen = true

    var body: some View {
        ZStack {
            // Main content
            Group {
                switch store.screenState {
                case .loading:
                    LoadingView()
                case .signedOut:
                    AuthView()
                case .signedIn:
                    MainTabView()
                }
            }
            
            // Launch screen overlay
            if showLaunchScreen {
                LaunchScreen()
                    .transition(.opacity)
                    .zIndex(100)
            }
        }
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                withAnimation(.easeOut(duration: 0.3)) {
                    showLaunchScreen = false
                }
            }
        }
    }
}

// MARK: - Launch Screen
struct LaunchScreen: View {
    @State private var scale = 0.8
    @State private var opacity = 0.0
    
    var body: some View {
        ZStack {
            Color.biznoDark1
                .ignoresSafeArea()
            
            VStack(spacing: 20) {
                ZStack {
                    Circle()
                        .fill(Color.biznoElectric.opacity(0.2))
                        .frame(width: 120, height: 120)
                        .blur(radius: 20)
                    
                    Image(systemName: "bolt.fill")
                        .font(.system(size: 56, weight: .bold))
                        .foregroundColor(.biznoElectric)
                        .glow(color: .biznoElectric, radius: 15)
                }
                
                Text("Bizno")
                    .font(.system(size: 40, weight: .bold, design: .rounded))
                    .foregroundColor(.biznoTextPrimary)
                
                Text("Launch without chaos")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.biznoTextSecondary)
            }
            .scaleEffect(scale)
            .opacity(opacity)
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.5)) {
                scale = 1.0
                opacity = 1.0
            }
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(AppSessionStore())
}
