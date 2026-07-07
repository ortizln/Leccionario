import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStore {
  static const _tokenKey = 'auth_token';
  static const _refreshTokenKey = 'refresh_token';
  static const _tokenExpiryKey = 'token_expiry';
  static const _usernameKey = 'username';

  final FlutterSecureStorage _storage;

  SecureStore()
      : _storage = const FlutterSecureStorage(
          aOptions: AndroidOptions(encryptedSharedPreferences: true),
          iOptions: IOSOptions(
            accessibility: KeychainAccessibility.first_unlock_this_device,
          ),
        );

  Future<void> saveToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }

  Future<String?> readToken() async {
    return _storage.read(key: _tokenKey);
  }

  Future<void> deleteToken() async {
    await _storage.delete(key: _tokenKey);
  }

  Future<void> saveRefreshToken(String token) async {
    await _storage.write(key: _refreshTokenKey, value: token);
  }

  Future<String?> readRefreshToken() async {
    return _storage.read(key: _refreshTokenKey);
  }

  Future<void> deleteRefreshToken() async {
    await _storage.delete(key: _refreshTokenKey);
  }

  Future<void> saveTokenExpiry(DateTime expiry) async {
    await _storage.write(key: _tokenExpiryKey, value: expiry.toIso8601String());
  }

  Future<DateTime?> readTokenExpiry() async {
    final value = await _storage.read(key: _tokenExpiryKey);
    if (value == null) return null;
    return DateTime.tryParse(value);
  }

  Future<void> saveUsername(String username) async {
    await _storage.write(key: _usernameKey, value: username);
  }

  Future<String?> readUsername() async {
    return _storage.read(key: _usernameKey);
  }

  Future<void> deleteUsername() async {
    await _storage.delete(key: _usernameKey);
  }

  Future<bool> hasValidToken() async {
    final token = await readToken();
    if (token == null || token.isEmpty) return false;

    final expiry = await readTokenExpiry();
    if (expiry == null) return true;

    return DateTime.now().isBefore(expiry);
  }

  Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
