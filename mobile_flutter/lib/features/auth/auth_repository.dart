import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:dio/dio.dart';

import '../../core/network/api_client.dart';
import '../../core/storage/local_store.dart';
import '../../core/storage/secure_store.dart';
import 'auth_session.dart';

class AuthRepository {
  AuthRepository({
    required this.localStore,
    required this.secureStore,
  });

  static const String _offlineAdminUsername = 'admin';
  static const String _offlineAdminPassword = 'Admin123*';

  final LocalStore localStore;
  final SecureStore secureStore;

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
        await _persistSession(session);
        return session;
      }
    }

    try {
      final response = await ApiClient.instance.dio.post(
        '/auth/login',
        data: {
          'username': normalizedUsername,
          'password': password,
        },
      );

      final json = response.data as Map<String, dynamic>;
      final session = AuthSession.fromJson(json);
      await _persistSession(session);
      return session;
    } on DioException catch (e) {
      if (isOfflineAdmin) {
        final session = _buildOfflineAdminSession();
        await _persistSession(session);
        return session;
      }

      final message = e.response?.data is Map
          ? (e.response?.data as Map)['message'] as String?
          : null;
      throw Exception(message ?? 'No se pudo iniciar sesion');
    } catch (_) {
      if (isOfflineAdmin) {
        final session = _buildOfflineAdminSession();
        await _persistSession(session);
        return session;
      }
      rethrow;
    }
  }

  Future<AuthSession?> readSession() async {
    final token = await secureStore.readToken();
    if (token == null) return null;

    final json = await localStore.readSingleton('session_store');
    if (json == null) return null;

    return AuthSession.fromJson(json);
  }

  Future<void> logout() async {
    await secureStore.clearAll();
    await localStore.clearTable('session_store');
    await localStore.clearTable('cached_today_entries');
    await localStore.clearTable('pending_entry_updates');
    await localStore.clearTable('pending_absence_updates');
    await localStore.clearTable('pending_incident_updates');
  }

  Future<void> _persistSession(AuthSession session) async {
    await secureStore.saveToken(session.token);
    await secureStore.saveUsername(session.username);
    await localStore.saveSingleton('session_store', session.toJson());
  }

  bool _matchesOfflineAdmin(String username, String password) {
    return username.toLowerCase() == _offlineAdminUsername.toLowerCase() &&
        password == _offlineAdminPassword;
  }

  AuthSession _buildOfflineAdminSession() {
    return const AuthSession(
      token: 'offline-local-admin',
      username: _offlineAdminUsername,
      fullName: 'Administrador local',
      primaryRole: 'ADMIN',
      isOfflineLocalAdmin: true,
    );
  }
}
