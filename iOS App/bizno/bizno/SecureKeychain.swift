import Foundation
import Security

/// Secure Keychain storage for sensitive data
enum KeychainError: Error {
    case itemNotFound
    case duplicateItem
    case invalidStatus(OSStatus)
    case conversionFailed
}

/// Manages secure storage of sensitive data in iOS Keychain
struct SecureKeychain {
    static let shared = SecureKeychain()
    
    private let service = "com.bizno.app"
    
    // MARK: - Session Storage
    
    func saveSession(_ data: Data, account: String) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        ]
        
        let status = SecItemAdd(query as CFDictionary, nil)
        
        if status == errSecDuplicateItem {
            // Update existing item
            let updateQuery: [String: Any] = [
                kSecClass as String: kSecClassGenericPassword,
                kSecAttrService as String: service,
                kSecAttrAccount as String: account
            ]
            let attributesToUpdate: [String: Any] = [
                kSecValueData as String: data
            ]
            let updateStatus = SecItemUpdate(updateQuery as CFDictionary, attributesToUpdate as CFDictionary)
            if updateStatus != errSecSuccess {
                throw KeychainError.invalidStatus(updateStatus)
            }
        } else if status != errSecSuccess {
            throw KeychainError.invalidStatus(status)
        }
    }
    
    func loadSession(account: String) throws -> Data {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        
        guard status == errSecSuccess else {
            if status == errSecItemNotFound {
                throw KeychainError.itemNotFound
            }
            throw KeychainError.invalidStatus(status)
        }
        
        guard let data = result as? Data else {
            throw KeychainError.conversionFailed
        }
        
        return data
    }
    
    func deleteSession(account: String) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account
        ]
        
        let status = SecItemDelete(query as CFDictionary)
        
        // Item not found is not an error when deleting
        if status != errSecSuccess && status != errSecItemNotFound {
            throw KeychainError.invalidStatus(status)
        }
    }
    
    // MARK: - Secure Storage for Specific Types
    
    func saveAccessToken(_ token: String, userId: String) throws {
        guard let data = token.data(using: .utf8) else {
            throw KeychainError.conversionFailed
        }
        try saveSession(data, account: "access_token_\(userId)")
    }
    
    func loadAccessToken(userId: String) throws -> String {
        let data = try loadSession(account: "access_token_\(userId)")
        guard let token = String(data: data, encoding: .utf8) else {
            throw KeychainError.conversionFailed
        }
        return token
    }
    
    func deleteAccessToken(userId: String) throws {
        try deleteSession(account: "access_token_\(userId)")
    }
    
    func saveRefreshToken(_ token: String, userId: String) throws {
        guard let data = token.data(using: .utf8) else {
            throw KeychainError.conversionFailed
        }
        try saveSession(data, account: "refresh_token_\(userId)")
    }
    
    func loadRefreshToken(userId: String) throws -> String {
        let data = try loadSession(account: "refresh_token_\(userId)")
        guard let token = String(data: data, encoding: .utf8) else {
            throw KeychainError.conversionFailed
        }
        return token
    }
    
    func deleteRefreshToken(userId: String) throws {
        try deleteSession(account: "refresh_token_\(userId)")
    }
    
    // MARK: - Cleanup
    
    func deleteAllSessions() throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service
        ]
        
        let status = SecItemDelete(query as CFDictionary)
        
        // Item not found is not an error when deleting
        if status != errSecSuccess && status != errSecItemNotFound {
            throw KeychainError.invalidStatus(status)
        }
    }
}

// MARK: - Convenience Extension for Session Management

extension SecureKeychain {
    /// Save complete session securely
    func saveSupabaseSession(_ session: SupabaseSession) throws {
        let data = try JSONEncoder().encode(session)
        try saveSession(data, account: "supabase_session_\(session.user.id)")
    }
    
    /// Load complete session securely
    func loadSupabaseSession(userId: String) throws -> SupabaseSession {
        let data = try loadSession(account: "supabase_session_\(userId)")
        return try JSONDecoder().decode(SupabaseSession.self, from: data)
    }
    
    /// Delete specific user session
    func deleteSupabaseSession(userId: String) throws {
        try deleteSession(account: "supabase_session_\(userId)")
    }

    /// Load any available Supabase session (fallback when last user id is unavailable)
    func loadAnySupabaseSession() throws -> SupabaseSession {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecReturnAttributes as String: true,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitAll
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess else {
            if status == errSecItemNotFound {
                throw KeychainError.itemNotFound
            }
            throw KeychainError.invalidStatus(status)
        }

        guard let items = result as? [[String: Any]] else {
            throw KeychainError.conversionFailed
        }

        for item in items {
            guard let account = item[kSecAttrAccount as String] as? String,
                  account.hasPrefix("supabase_session_"),
                  let data = item[kSecValueData as String] as? Data,
                  let session = try? JSONDecoder().decode(SupabaseSession.self, from: data)
            else {
                continue
            }

            return session
        }

        throw KeychainError.itemNotFound
    }
}
