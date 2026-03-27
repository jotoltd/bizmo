import Foundation

enum AppConfig {
    static let supabaseURLString = "https://mpanxvxifbazbazevtfz.supabase.co"
    static let supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wYW54dnhpZmJhemJhemV2dGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NjAyNDksImV4cCI6MjA4OTQzNjI0OX0.c_CKG6qCafPwt0W35zKx865MN8kr07B651_1UcaI-SQ"

    static var supabaseURL: URL {
        guard let url = URL(string: supabaseURLString) else {
            fatalError("Invalid Supabase URL")
        }
        return url
    }

    static var isConfigured: Bool {
        !supabaseAnonKey.isEmpty && !supabaseAnonKey.contains("REPLACE_WITH")
    }
}
