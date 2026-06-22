import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../core/config/app_config.dart';
import '../auth/auth_repository.dart';
import '../auth/auth_session.dart';
import 'models.dart';

class TeacherRepository {
  final AuthRepository _auth;

  TeacherRepository({required AuthRepository auth}) : _auth = auth;

  Future<AuthSession?> get _session async => _auth.readSession();

  Future<Map<String, String>> _headers() async {
    final session = await _session;
    if (session == null) throw Exception('Sesion no encontrada');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ${session.token}',
    };
  }

  Future<T> _get<T>(String path, T Function(dynamic) parse) async {
    final h = await _headers();
    final uri = Uri.parse('${AppConfig.apiBaseUrl}$path');
    final res = await http.get(uri, headers: h).timeout(
      const Duration(seconds: 12),
      onTimeout: () => throw Exception('Tiempo de espera agotado'),
    );
    if (res.statusCode == 200) {
      return parse(json.decode(res.body));
    }
    throw Exception('Error ${res.statusCode}: ${res.body}');
  }

  Future<List<TeacherCourse>> fetchMyCourses() {
    return _get('/api/self/my-courses', (data) {
      return (data as List).map((e) => TeacherCourse.fromJson(e)).toList();
    });
  }

  Future<List<ScheduleEntry>> fetchMySchedule() {
    return _get('/api/self/my-teaching-schedule', (data) {
      return (data as List).map((e) => ScheduleEntry.fromJson(e)).toList();
    });
  }

  Future<List<TeacherStudent>> fetchCourseStudents(int courseId) {
    return _get('/api/self/my-courses/$courseId/students', (data) {
      return (data as List).map((e) => TeacherStudent.fromJson(e)).toList();
    });
  }

  Future<WeeklyJournal> fetchWeeklyJournal({int weekOffset = 0}) {
    return _get('/api/self/my-weekly-journal?weekOffset=$weekOffset', (data) {
      return WeeklyJournal.fromJson(data);
    });
  }
}
