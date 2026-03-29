import SwiftUI
import Observation

// MARK: - Theme Manager
@Observable
final class ThemeManager {
    static let shared = ThemeManager()
    
    var currentTheme: Theme = {
        if let rawValue = UserDefaults.standard.string(forKey: "bizno_theme"),
           let theme = Theme(rawValue: rawValue) {
            return theme
        }
        return .system
    }() {
        didSet {
            UserDefaults.standard.set(currentTheme.rawValue, forKey: "bizno_theme")
        }
    }
    
    enum Theme: String, CaseIterable {
        case light = "Light"
        case dark = "Dark"
        case system = "System"
        
        var icon: String {
            switch self {
            case .light: return "sun.max.fill"
            case .dark: return "moon.fill"
            case .system: return "circle.lefthalf.filled"
            }
        }
    }
    
    var colorScheme: ColorScheme? {
        switch currentTheme {
        case .light: return .light
        case .dark: return .dark
        case .system: return nil
        }
    }
    
    var isDarkMode: Bool {
        if currentTheme == .dark { return true }
        if currentTheme == .light { return false }
        return UITraitCollection.current.userInterfaceStyle == .dark
    }
}

// MARK: - Dynamic Colors
extension Color {
    // Backgrounds
    static var biznoBackground: Color {
        ThemeManager.shared.isDarkMode ? .biznoDark1 : .biznoLight1
    }
    
    static var biznoCardBackground: Color {
        ThemeManager.shared.isDarkMode ? .biznoDark2 : .biznoLight2
    }
    
    static var biznoElevatedBackground: Color {
        ThemeManager.shared.isDarkMode ? .biznoDark3 : .biznoLight3
    }
    
    // Text
    static var biznoPrimaryText: Color {
        ThemeManager.shared.isDarkMode ? .biznoTextPrimary : .biznoLightTextPrimary
    }
    
    static var biznoSecondaryText: Color {
        ThemeManager.shared.isDarkMode ? .biznoTextSecondary : .biznoLightTextSecondary
    }
    
    static var biznoTertiaryText: Color {
        ThemeManager.shared.isDarkMode ? .biznoTextTertiary : .biznoLightTextTertiary
    }
    
    // Borders
    static var biznoBorderDynamic: Color {
        ThemeManager.shared.isDarkMode ? .biznoBorder : .biznoLightBorder
    }
    
    static var biznoDividerDynamic: Color {
        ThemeManager.shared.isDarkMode ? .biznoDivider : .biznoLightDivider
    }
    
    // Light theme colors
    static let biznoLight1 = Color(hex: "#FFFFFF")
    static let biznoLight2 = Color(hex: "#F8FAFC")
    static let biznoLight3 = Color(hex: "#F1F5F9")
    static let biznoLight4 = Color(hex: "#E2E8F0")
    
    static let biznoLightTextPrimary = Color(hex: "#0F172A")
    static let biznoLightTextSecondary = Color(hex: "#475569")
    static let biznoLightTextTertiary = Color(hex: "#94A3B8")
    
    static let biznoLightBorder = Color(hex: "#CBD5E1")
    static let biznoLightDivider = Color(hex: "#E2E8F0")
}

// MARK: - Dynamic View Modifiers
struct DynamicGlassCardModifier: ViewModifier {
    var elevated: Bool = false
    var border: Bool = true
    var padding: CGFloat = 16
    
    func body(content: Content) -> some View {
        content
            .padding(padding)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(ThemeManager.shared.isDarkMode ? Color.biznoDark2.opacity(0.8) : Color.white)
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(border ? Color.biznoBorderDynamic : Color.clear, lineWidth: 1)
                    )
                    .shadow(
                        color: elevated ? Color.biznoElectric.opacity(ThemeManager.shared.isDarkMode ? 0.1 : 0.05) : Color.clear,
                        radius: elevated ? 20 : 0,
                        x: 0,
                        y: elevated ? 8 : 0
                    )
            )
    }
}

struct DynamicGradientCardModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding(20)
            .background(
                RoundedRectangle(cornerRadius: 20)
                    .fill(Color.biznoCardBackground)
                    .overlay(
                        RoundedRectangle(cornerRadius: 20)
                            .stroke(
                                LinearGradient(
                                    colors: [
                                        Color.biznoElectric.opacity(ThemeManager.shared.isDarkMode ? 0.5 : 0.3),
                                        Color.biznoPurple.opacity(ThemeManager.shared.isDarkMode ? 0.3 : 0.2)
                                    ],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ),
                                lineWidth: 1
                            )
                    )
            )
    }
}

struct DynamicSolidCardModifier: ViewModifier {
    var padding: CGFloat = 16
    
    func body(content: Content) -> some View {
        content
            .padding(padding)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.biznoElevatedBackground)
            )
    }
}

extension View {
    func dynamicGlassCard(elevated: Bool = false, border: Bool = true, padding: CGFloat = 16) -> some View {
        modifier(DynamicGlassCardModifier(elevated: elevated, border: border, padding: padding))
    }
    
    func dynamicGradientCard() -> some View {
        modifier(DynamicGradientCardModifier())
    }
    
    func dynamicSolidCard(padding: CGFloat = 16) -> some View {
        modifier(DynamicSolidCardModifier(padding: padding))
    }
}

// MARK: - Dynamic Button Styles
struct DynamicPrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 16, weight: .semibold))
            .foregroundColor(ThemeManager.shared.isDarkMode ? .biznoTextInverse : .white)
            .padding(.horizontal, 24)
            .padding(.vertical, 14)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.biznoElectric)
                    .opacity(configuration.isPressed ? 0.8 : 1)
            )
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
            .animation(.easeInOut(duration: 0.2), value: configuration.isPressed)
    }
}

struct DynamicSecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 16, weight: .semibold))
            .foregroundColor(.biznoPrimaryText)
            .padding(.horizontal, 24)
            .padding(.vertical, 14)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.biznoBorderDynamic, lineWidth: 1)
                    .fill(Color.biznoCardBackground.opacity(configuration.isPressed ? 0.8 : 1))
            )
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
            .animation(.easeInOut(duration: 0.2), value: configuration.isPressed)
    }
}

struct DynamicGhostButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 14, weight: .medium))
            .foregroundColor(.biznoSecondaryText)
            .opacity(configuration.isPressed ? 0.6 : 1)
    }
}

extension ButtonStyle where Self == DynamicPrimaryButtonStyle {
    static var dynamicPrimary: DynamicPrimaryButtonStyle { DynamicPrimaryButtonStyle() }
}

extension ButtonStyle where Self == DynamicSecondaryButtonStyle {
    static var dynamicSecondary: DynamicSecondaryButtonStyle { DynamicSecondaryButtonStyle() }
}

// MARK: - Dynamic Components
struct DynamicBiznoBadge: View {
    enum Style {
        case `default`
        case success
        case warning
        case error
        case info
        case electric
    }
    
    let text: String
    var style: Style = .default
    
    var body: some View {
        Text(text)
            .font(.system(size: 11, weight: .semibold))
            .textCase(.uppercase)
            .tracking(0.5)
            .foregroundColor(foregroundColor)
            .padding(.horizontal, 10)
            .padding(.vertical, 4)
            .background(
                Capsule()
                    .fill(backgroundColor)
            )
    }
    
    private var foregroundColor: Color {
        switch style {
        case .default: return .biznoSecondaryText
        case .success: return ThemeManager.shared.isDarkMode ? .biznoSuccess : Color(hex: "#16A34A")
        case .warning: return ThemeManager.shared.isDarkMode ? .biznoWarning : Color(hex: "#D97706")
        case .error: return ThemeManager.shared.isDarkMode ? .biznoError : Color(hex: "#DC2626")
        case .info: return ThemeManager.shared.isDarkMode ? .biznoInfo : Color(hex: "#2563EB")
        case .electric: return .biznoElectric
        }
    }
    
    private var backgroundColor: Color {
        let baseOpacity = ThemeManager.shared.isDarkMode ? 0.15 : 0.1
        switch style {
        case .default: return Color.biznoElevatedBackground
        case .success: return (ThemeManager.shared.isDarkMode ? Color.biznoSuccess : Color(hex: "#16A34A")).opacity(baseOpacity)
        case .warning: return (ThemeManager.shared.isDarkMode ? Color.biznoWarning : Color(hex: "#D97706")).opacity(baseOpacity)
        case .error: return (ThemeManager.shared.isDarkMode ? Color.biznoError : Color(hex: "#DC2626")).opacity(baseOpacity)
        case .info: return (ThemeManager.shared.isDarkMode ? Color.biznoInfo : Color(hex: "#2563EB")).opacity(baseOpacity)
        case .electric: return Color.biznoElectric.opacity(baseOpacity)
        }
    }
}

// MARK: - Dynamic Progress Bar
struct DynamicBiznoProgressBar: View {
    let value: Double
    var color: Color = .biznoElectric
    var height: CGFloat = 8
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .leading) {
                RoundedRectangle(cornerRadius: height / 2)
                    .fill(Color.biznoDividerDynamic)
                
                RoundedRectangle(cornerRadius: height / 2)
                    .fill(color)
                    .frame(width: geometry.size.width * CGFloat(value))
                    .animation(.easeInOut(duration: 0.3), value: value)
            }
        }
        .frame(height: height)
    }
}
