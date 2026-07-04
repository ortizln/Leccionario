class AnnouncementScheduleItem {
  final int scheduleBlockId;
  final String blockLabel;
  final String startTime;
  final String endTime;
  final int weekday;
  final String weekdayLabel;

  const AnnouncementScheduleItem({
    required this.scheduleBlockId,
    required this.blockLabel,
    required this.startTime,
    required this.endTime,
    required this.weekday,
    required this.weekdayLabel,
  });

  factory AnnouncementScheduleItem.fromJson(Map<String, dynamic> json) {
    return AnnouncementScheduleItem(
      scheduleBlockId: json['scheduleBlockId'] as int,
      blockLabel: json['blockLabel'] as String? ?? '',
      startTime: json['startTime'] as String? ?? '',
      endTime: json['endTime'] as String? ?? '',
      weekday: json['weekday'] as int,
      weekdayLabel: json['weekdayLabel'] as String? ?? '',
    );
  }
}

class Announcement {
  final int id;
  final String title;
  final String description;
  final String type;
  final String priority;
  final String? eventDate;
  final String? eventEndDate;
  final int? courseId;
  final String? courseName;
  final String createdByName;
  final String createdAt;
  final int recipientCount;
  final bool read;
  final List<AnnouncementScheduleItem> schedules;

  const Announcement({
    required this.id,
    required this.title,
    required this.description,
    required this.type,
    required this.priority,
    this.eventDate,
    this.eventEndDate,
    this.courseId,
    this.courseName,
    required this.createdByName,
    required this.createdAt,
    required this.recipientCount,
    required this.read,
    this.schedules = const [],
  });

  factory Announcement.fromJson(Map<String, dynamic> json) {
    return Announcement(
      id: json['id'] as int,
      title: json['title'] as String? ?? '',
      description: json['description'] as String? ?? '',
      type: json['type'] as String? ?? 'EVENT',
      priority: json['priority'] as String? ?? 'NORMAL',
      eventDate: json['eventDate'] as String?,
      eventEndDate: json['eventEndDate'] as String?,
      courseId: json['courseId'] as int?,
      courseName: json['courseName'] as String?,
      createdByName: json['createdByName'] as String? ?? '',
      createdAt: json['createdAt'] as String? ?? '',
      recipientCount: json['recipientCount'] as int? ?? 0,
      read: json['read'] as bool? ?? false,
      schedules: (json['schedules'] as List<dynamic>?)
              ?.map((e) => AnnouncementScheduleItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );
  }

  String get typeLabel {
    switch (type) {
      case 'EVENT':
        return 'Evento';
      case 'TASK':
        return 'Tarea';
      case 'ALERT':
        return 'Alerta';
      default:
        return type;
    }
  }

  String get priorityLabel {
    switch (priority) {
      case 'LOW':
        return 'Baja';
      case 'NORMAL':
        return 'Normal';
      case 'HIGH':
        return 'Alta';
      case 'URGENT':
        return 'Urgente';
      default:
        return priority;
    }
  }
}
