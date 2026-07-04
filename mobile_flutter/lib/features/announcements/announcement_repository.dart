import 'dart:convert';
import 'package:http/http.dart' as http;

import '../../core/config/app_config.dart';
import '../../features/auth/auth_repository.dart';
import '../../features/auth/auth_session.dart';
import 'models.dart';

class AnnouncementRepository {
  final AuthRepository _auth;
  AnnouncementRepository({required AuthRepository auth}) : _auth = auth;

  String get _baseUrl => AppConfig.apiBaseUrl;

  Future<AuthSession?> get _session async => _auth.readSession();

  Future<Map<String, String>> get _headers async {
    final session = await _session;
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ${session?.token ?? ''}',
    };
  }

  Future<List<Announcement>> fetchMyAnnouncements() async {
    final response = await http.get(
      Uri.parse('$_baseUrl/announcements/my'),
      headers: await _headers,
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((e) => Announcement.fromJson(e)).toList();
    }
    throw Exception('Error al cargar anuncios');
  }

  Future<int> fetchUnreadCount() async {
    final response = await http.get(
      Uri.parse('$_baseUrl/announcements/unread-count'),
      headers: await _headers,
    );
    if (response.statusCode == 200) {
      return int.parse(response.body);
    }
    return 0;
  }

  Future<void> markAsRead(int announcementId) async {
    await http.put(
      Uri.parse('$_baseUrl/announcements/$announcementId/read'),
      headers: await _headers,
    );
  }
}
