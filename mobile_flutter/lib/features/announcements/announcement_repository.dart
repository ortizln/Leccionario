import '../../core/network/api_client.dart';
import 'models.dart';

class AnnouncementRepository {
  Future<List<Announcement>> fetchMyAnnouncements() async {
    final response = await ApiClient.instance.dio.get('/announcements/my');
    final data = response.data as List<dynamic>;
    return data.map((e) => Announcement.fromJson(e)).toList();
  }

  Future<int> fetchUnreadCount() async {
    final response = await ApiClient.instance.dio.get('/announcements/unread-count');
    return response.data as int;
  }

  Future<void> markAsRead(int announcementId) async {
    await ApiClient.instance.dio.put('/announcements/$announcementId/read');
  }
}
