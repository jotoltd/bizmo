import SwiftUI

// MARK: - Theme Colors (Matching web CSS variables)
extension Color {
    // Primary brand colors
    static let biznoElectric = Color(hex: "#4DE2FF")
    static let biznoElectricLight = Color(hex: "#7EEDFF")
    static let biznoElectricDark = Color(hex: "#1CB8D8")
    static let biznoElectricMuted = Color(hex: "#4DE2FF").opacity(0.2)
    static let biznoElectricGlow = Color(hex: "#4DE2FF").opacity(0.4)
    
    static let biznoPurple = Color(hex: "#A855F7")
    static let biznoPurpleLight = Color(hex: "#C084FC")
    static let biznoPurpleDark = Color(hex: "#9333EA")
    
    // Semantic colors
    static let biznoSuccess = Color(hex: "#22C55E")
    static let biznoWarning = Color(hex: "#F59E0B")
    static let biznoError = Color(hex: "#EF4444")
    static let biznoInfo = Color(hex: "#3B82F6")
    
    // Dark theme backgrounds (matching web CSS exactly)
    static let biznoDark1 = Color(hex: "#1E293B")           // --dark-1
    static let biznoDark2 = Color(hex: "#0F172A")           // --dark-2  
    static let biznoDark3 = Color(hex: "#0B1221")           // --dark-3
    static let biznoDark4 = Color(hex: "#090E1C")           // --dark-4
    static let biznoDark5 = Color(hex: "#030712")           // --void
    static let biznoVoid = Color(hex: "#030712")            // --void alias
    
    // Panel/Glass backgrounds (static base colors)
    static let biznoPanelBase = Color(hex: "#0D1322")       // --panel base
    static let biznoGlassBase = Color(hex: "#0D1322")       // --glass base
    
    // Text colors (matching web CSS exactly)
    static let biznoTextPrimary = Color(hex: "#F8FAFC")      // --text-primary
    static let biznoTextSecondary = Color(hex: "#94A3B8")    // --text-secondary  
    static let biznoTextTertiary = Color(hex: "#64748B")     // --text-tertiary
    static let biznoTextDisabled = Color(hex: "#475569")     // --text-disabled
    static let biznoTextInverse = Color(hex: "#0F172A")      // --text-inverse
    
    // Border & Divider (matching web CSS exactly)
    static let biznoBorder = Color.white.opacity(0.08)       // --border
    static let biznoBorderStrong = Color.white.opacity(0.12)   // --border-strong
    static let biznoBorderSubtle = Color.white.opacity(0.04)   // --border-subtle
    static let biznoDivider = Color.white.opacity(0.06)        // --divider
    
    // Gradients
    static let biznoGradientElectric = LinearGradient(
        colors: [.biznoElectric, .biznoPurple],
        startPoint: .leading,
        endPoint: .trailing
    )
    
    static let biznoGradientPurple = LinearGradient(
        colors: [.biznoPurple, .biznoElectric],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    // Initialize from hex
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Glass Morphism View Modifier
struct GlassCardModifier: ViewModifier {
    var elevated: Bool = false
    var border: Bool = true
    var padding: CGFloat = 16
    
    func body(content: Content) -> some View {
        content
            .padding(padding)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color.biznoCardBackground)
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(border ? Color.biznoBorder : Color.clear, lineWidth: 1)
                    )
                    .shadow(
                        color: elevated ? Color.biznoElectricGlow : Color.clear,
                        radius: elevated ? 40 : 0,
                        x: 0,
                        y: elevated ? 8 : 0
                    )
            )
    }
}

struct GradientCardModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding(20)
            .background(
                ZStack {
                    // Base dark background
                    RoundedRectangle(cornerRadius: 20)
                        .fill(Color.biznoCardBackground)
                    
                    // Blur glow effect top-right
                    Circle()
                        .fill(Color.biznoElectric.opacity(0.1))
                        .frame(width: 256, height: 256)
                        .blur(radius: 60)
                        .offset(x: 80, y: -80)
                    
                    // Gradient border
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(
                            LinearGradient(
                                colors: [Color.biznoElectric.opacity(0.3), Color.biznoPurple.opacity(0.2)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            lineWidth: 1
                        )
                }
            )
    }
}

struct SolidCardModifier: ViewModifier {
    var padding: CGFloat = 16
    
    func body(content: Content) -> some View {
        content
            .padding(padding)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.biznoDark3)
            )
    }
}

// MARK: - View Extensions
extension View {
    func glassCard(elevated: Bool = false, border: Bool = true, padding: CGFloat = 16) -> some View {
        modifier(GlassCardModifier(elevated: elevated, border: border, padding: padding))
    }
    
    func gradientCard() -> some View {
        modifier(GradientCardModifier())
    }
    
    func solidCard(padding: CGFloat = 16) -> some View {
        modifier(SolidCardModifier(padding: padding))
    }
}

// MARK: - Glow Effects
struct GlowEffect: ViewModifier {
    var color: Color
    var radius: CGFloat
    
    func body(content: Content) -> some View {
        content
            .shadow(color: color.opacity(0.5), radius: radius / 2)
            .shadow(color: color.opacity(0.3), radius: radius)
    }
}

extension View {
    func glow(color: Color = .biznoElectric, radius: CGFloat = 10) -> some View {
        modifier(GlowEffect(color: color, radius: radius))
    }
}

// MARK: - Typography
extension Font {
    static let biznoDisplay = Font.system(size: 32, weight: .semibold, design: .rounded)
    static let biznoTitle = Font.system(size: 24, weight: .semibold, design: .rounded)
    static let biznoHeadline = Font.system(size: 18, weight: .semibold, design: .rounded)
    static let biznoBody = Font.system(size: 16, weight: .regular, design: .default)
    static let biznoCaption = Font.system(size: 14, weight: .regular, design: .default)
    static let biznoSmall = Font.system(size: 12, weight: .medium, design: .default)
}

// MARK: - Animation Extensions
extension Animation {
    static let biznoSpring = Animation.spring(response: 0.4, dampingFraction: 0.8)
    static let biznoEase = Animation.easeInOut(duration: 0.3)
    static let biznoBounce = Animation.spring(response: 0.5, dampingFraction: 0.6)
}

// MARK: - Button Styles
struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 16, weight: .semibold))
            .foregroundColor(.biznoTextInverse)
            .padding(.horizontal, 24)
            .padding(.vertical, 14)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.biznoElectric)
                    .opacity(configuration.isPressed ? 0.8 : 1)
            )
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
            .animation(.biznoEase, value: configuration.isPressed)
    }
}

struct SecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 16, weight: .semibold))
            .foregroundColor(.biznoTextPrimary)
            .padding(.horizontal, 24)
            .padding(.vertical, 14)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.biznoBorder, lineWidth: 1)
                    .fill(Color.biznoDark2.opacity(configuration.isPressed ? 0.8 : 1))
            )
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
            .animation(.biznoEase, value: configuration.isPressed)
    }
}

struct GhostButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 14, weight: .medium))
            .foregroundColor(.biznoTextSecondary)
            .opacity(configuration.isPressed ? 0.6 : 1)
    }
}

extension ButtonStyle where Self == PrimaryButtonStyle {
    static var biznoPrimary: PrimaryButtonStyle { PrimaryButtonStyle() }
}

extension ButtonStyle where Self == SecondaryButtonStyle {
    static var biznoSecondary: SecondaryButtonStyle { SecondaryButtonStyle() }
}

// MARK: - Badge Component
struct BiznoBadge: View {
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
        case .default: return .biznoTextSecondary
        case .success: return .biznoSuccess
        case .warning: return .biznoWarning
        case .error: return .biznoError
        case .info: return .biznoInfo
        case .electric: return .biznoElectric
        }
    }
    
    private var backgroundColor: Color {
        switch style {
        case .default: return .biznoDark3
        case .success: return .biznoSuccess.opacity(0.15)
        case .warning: return .biznoWarning.opacity(0.15)
        case .error: return .biznoError.opacity(0.15)
        case .info: return .biznoInfo.opacity(0.15)
        case .electric: return .biznoElectric.opacity(0.15)
        }
    }
}

// MARK: - Progress Bar
struct BiznoProgressBar: View {
    let value: Double // 0.0 to 1.0
    var color: Color = .biznoElectric
    var height: CGFloat = 8
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .leading) {
                RoundedRectangle(cornerRadius: height / 2)
                    .fill(Color.biznoDark4)
                
                RoundedRectangle(cornerRadius: height / 2)
                    .fill(color)
                    .frame(width: geometry.size.width * CGFloat(value))
                    .animation(.biznoEase, value: value)
            }
        }
        .frame(height: height)
    }
}

// MARK: - Avatar Component
struct BiznoAvatar: View {
    let initials: String
    var size: CGFloat = 40
    var color: Color = .biznoElectric
    
    var body: some View {
        Text(initials)
            .font(.system(size: size * 0.4, weight: .semibold))
            .foregroundColor(color)
            .frame(width: size, height: size)
            .background(
                Circle()
                    .fill(color.opacity(0.15))
            )
    }
}

// MARK: - Divider
struct BiznoDivider: View {
    var body: some View {
        Divider()
            .background(Color.biznoDivider)
    }
}

// MARK: - Section Header
struct SectionHeader: View {
    let title: String
    var icon: String? = nil
    
    var body: some View {
        HStack(spacing: 8) {
            if let icon = icon {
                Image(systemName: icon)
                    .foregroundColor(.biznoElectric)
                    .font(.system(size: 14, weight: .medium))
            }
            Text(title)
                .font(.system(size: 12, weight: .semibold))
                .textCase(.uppercase)
                .tracking(1)
                .foregroundColor(.biznoTextTertiary)
        }
        .padding(.horizontal, 4)
    }
}

// MARK: - Loading State
struct BiznoLoadingView: View {
    var body: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.2)
                .tint(.biznoElectric)
            Text("Loading...")
                .font(.biznoCaption)
                .foregroundColor(.biznoTextSecondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.biznoDark1)
    }
}

// MARK: - Empty State
struct BiznoEmptyState: View {
    let icon: String
    let title: String
    let message: String
    var action: (() -> Void)? = nil
    var actionLabel: String? = nil
    
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 48))
                .foregroundColor(.biznoTextTertiary)
            
            Text(title)
                .font(.biznoHeadline)
                .foregroundColor(.biznoTextPrimary)
            
            Text(message)
                .font(.biznoCaption)
                .foregroundColor(.biznoTextSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
            
            if let action = action, let label = actionLabel {
                Button(action: action) {
                    Text(label)
                }
                .buttonStyle(.biznoPrimary)
                .padding(.top, 8)
            }
        }
        .padding(32)
    }
}
