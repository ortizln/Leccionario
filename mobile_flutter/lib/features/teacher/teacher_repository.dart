import '../../core/network/api_client.dart';
import '../auth/auth_repository.dart';
import '../auth/auth_session.dart';
import 'models.dart';

class TeacherRepository {
  final AuthRepository _auth;

  TeacherRepository({required AuthRepository auth}) : _auth = auth;

  Future<AuthSession?> get _session async => _auth.readSession();

  Future<T> _get<T>(String path, T Function(dynamic) parse) async {
    final session = await _session;
    if (session == null) throw Exception('Sesion no encontrada');

    final response = await ApiClient.instance.dio.get(path);
    if (response.statusCode == 200) {
      return parse(response.data);
    }
    throw Exception('Error ${response.statusCode}');
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
