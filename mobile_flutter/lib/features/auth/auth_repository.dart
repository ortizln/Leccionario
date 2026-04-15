import 'dart:convert';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:http/http.dart' as http;

import '../../core/config/app_config.dart';
import '../../core/storage/local_store.dart';
import 'auth_session.dart';

class AuthRepository {
  AuthRepository({required this.localStore});

  static const String offlineAdminUsername = 'admin';
  static const String offlineAdminPassword = 'Admin123*';

  final LocalStore localStore;

  Future<AuthSession> login({
    required String username,
    required String password,
  }) async {
    final normalizedUsername = username.trim();
    final isOfflineAdmin = _matchesOfflineAdmin(normalizedUsername, password);
    if (isOfflineAdmin) {
      final connectivity = await Connectivity().checkConnectivity();
      final hasNetwork = !connectivity.contains(ConnectivityResult.none);
      if (!hasNetwork) {
        final session = _buildOfflineAdminSession();
        await localStore.saveSingleton('session_store', session.toJson());
        return session;
      }
    }

    try {
      final response = await http
          .post(
            Uri.parse('${AppConfig.apiBaseUrl}/auth/login'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'username': normalizedUsername,
              'password': password,
            }),
          )
          .timeout(const Duration(seconds: 8));

      final json = jsonDecode(response.body) as Map<String, dynamic>;
      if (response.statusCode >= 400) {
        throw Exception(json['message'] ?? 'No se pudo iniciar sesion');
      }

      final session = AuthSession.fromJson(json);
      await localStore.saveSingleton('session_store', session.toJson());
      return session;
    } catch (_) {
      if (isOfflineAdmin) {
        final session = _buildOfflineAdminSession();
        await localStore.saveSingleton('session_store', session.toJson());
        return session;
      }
      rethrow;
    }
  }

  Future<AuthSession?> readSession() async {
    final json = await localStore.readSingleton('session_store');
    if (json == null) return null;
    return AuthSession.fromJson(json);
  }

  Future<void> logout() async {
    await localStore.clearTable('session_store');
    await localStore.clearTable('cached_today_entries');
    await localStore.clearTable('pending_entry_updates');
    await localStore.clearTable('pending_absence_updates');
    await localStore.clearTable('pending_incident_updates');
  }

  bool _matchesOfflineAdmin(String username, String password) {
    return username.toLowerCase() == offlineAdminUsername.toLowerCase() &&
        password == offlineAdminPassword;
  }

  AuthSession _buildOfflineAdminSession() {
    return const AuthSession(
      token: 'offline-local-admin',
      username: offlineAdminUsername,
      fullName: 'Administrador local',
      primaryRole: 'ADMIN',
      isOfflineLocalAdmin: true,
    );
  }
}
