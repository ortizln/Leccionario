class TeacherCourse {
  final int courseId;
  final String courseName;
  final String? parallel;
  final String? level;
  final String? section;
  final String? subLevel;
  final int? grade;
  final List<String> subjectNames;
  final int scheduleCount;

  const TeacherCourse({
    required this.courseId,
    required this.courseName,
    this.parallel,
    this.level,
    this.section,
    this.subLevel,
    this.grade,
    this.subjectNames = const [],
    this.scheduleCount = 0,
  });

  factory TeacherCourse.fromJson(Map<String, dynamic> json) {
    return TeacherCourse(
      courseId: json['courseId'] as int,
      courseName: json['courseName'] as String? ?? '',
      parallel: json['parallel'] as String?,
      level: json['level'] as String?,
      section: json['section'] as String?,
      subLevel: json['subLevel'] as String?,
      grade: json['grade'] as int?,
      subjectNames: (json['subjectNames'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      scheduleCount: json['scheduleCount'] as int? ?? 0,
    );
  }

  String get displayName => '$courseName ${parallel ?? ''}'.trim();
  String get levelDisplay =>
      [section, grade != null ? 'Grado $grade' : null, subLevel]
          .where((e) => e != null && e.isNotEmpty)
          .join(' · ');
}

class ScheduleEntry {
  final int id;
  final int courseId;
  final String courseName;
  final int periodId;
  final String periodName;
  final int scheduleBlockId;
  final String scheduleLabel;
  final int subjectId;
  final String subjectName;
  final int teacherId;
  final String teacherName;
  final int weekday;
  final String startTime;
  final String endTime;
  final String? classroom;

  const ScheduleEntry({
    required this.id,
    required this.courseId,
    required this.courseName,
    required this.periodId,
    required this.periodName,
    required this.scheduleBlockId,
    required this.scheduleLabel,
    required this.subjectId,
    required this.subjectName,
    required this.teacherId,
    required this.teacherName,
    required this.weekday,
    required this.startTime,
    required this.endTime,
    this.classroom,
  });

  factory ScheduleEntry.fromJson(Map<String, dynamic> json) {
    return ScheduleEntry(
      id: json['id'] as int,
      courseId: json['courseId'] as int,
      courseName: json['courseName'] as String? ?? '',
      periodId: json['periodId'] as int,
      periodName: json['periodName'] as String? ?? '',
      scheduleBlockId: json['scheduleBlockId'] as int,
      scheduleLabel: json['scheduleLabel'] as String? ?? '',
      subjectId: json['subjectId'] as int,
      subjectName: json['subjectName'] as String? ?? '',
      teacherId: json['teacherId'] as int,
      teacherName: json['teacherName'] as String? ?? '',
      weekday: json['weekday'] as int,
      startTime: json['startTime'] as String? ?? '',
      endTime: json['endTime'] as String? ?? '',
      classroom: json['classroom'] as String?,
    );
  }

  String get timeRange {
    if (startTime.isEmpty || endTime.isEmpty) return scheduleLabel;
    return '$startTime - $endTime';
  }
}

class TeacherStudent {
  final int id;
  final int userId;
  final String username;
  final String? identification;
  final String firstName;
  final String lastName;
  final String fullName;
  final String? email;
  final bool enabled;
  final int? courseId;
  final String? courseName;
  final String? enrollmentNumber;
  final String? birthDate;
  final String? gender;

  const TeacherStudent({
    required this.id,
    required this.userId,
    required this.username,
    this.identification,
    required this.firstName,
    required this.lastName,
    required this.fullName,
    this.email,
    this.enabled = true,
    this.courseId,
    this.courseName,
    this.enrollmentNumber,
    this.birthDate,
    this.gender,
  });

  factory TeacherStudent.fromJson(Map<String, dynamic> json) {
    return TeacherStudent(
      id: json['id'] as int,
      userId: json['userId'] as int,
      username: json['username'] as String? ?? '',
      identification: json['identification'] as String?,
      firstName: json['firstName'] as String? ?? '',
      lastName: json['lastName'] as String? ?? '',
      fullName: json['fullName'] as String? ?? '',
      email: json['email'] as String?,
      enabled: json['enabled'] as bool? ?? true,
      courseId: json['courseId'] as int?,
      courseName: json['courseName'] as String?,
      enrollmentNumber: json['enrollmentNumber'] as String?,
      birthDate: json['birthDate'] as String?,
      gender: json['gender'] as String?,
    );
  }

  String get initials {
    final f = firstName.isNotEmpty ? firstName[0] : '';
    final l = lastName.isNotEmpty ? lastName[0] : '';
    return '$f$l'.toUpperCase();
  }
}

class WeeklyJournal {
  final String teacherName;
  final String periodName;
  final String weekStart;
  final List<JournalDay> days;

  const WeeklyJournal({
    required this.teacherName,
    required this.periodName,
    required this.weekStart,
    required this.days,
  });

  factory WeeklyJournal.fromJson(Map<String, dynamic> json) {
    return WeeklyJournal(
      teacherName: json['teacherName'] as String? ?? '',
      periodName: json['periodName'] as String? ?? '',
      weekStart: json['weekStart'] as String? ?? '',
      days: (json['days'] as List<dynamic>?)
              ?.map((e) => JournalDay.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}

class JournalDay {
  final int weekday;
  final String weekdayLabel;
  final String logDate;
  final List<JournalEntry> entries;

  const JournalDay({
    required this.weekday,
    required this.weekdayLabel,
    required this.logDate,
    required this.entries,
  });

  factory JournalDay.fromJson(Map<String, dynamic> json) {
    return JournalDay(
      weekday: json['weekday'] as int,
      weekdayLabel: json['weekdayLabel'] as String? ?? '',
      logDate: json['logDate'] as String? ?? '',
      entries: (json['entries'] as List<dynamic>?)
              ?.map((e) => JournalEntry.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}

class JournalEntry {
  final int dailyLogId;
  final int entryId;
  final String courseName;
  final String scheduleLabel;
  final String startTime;
  final String endTime;
  final String subjectName;
  final String teacherName;
  final String blockType;
  final String? didacticUnit;
  final String? topic;
  final String? specificNotes;
  final String? generalNotes;
  final String teacherSignatureStatus;
  final String? closeToken;

  const JournalEntry({
    required this.dailyLogId,
    required this.entryId,
    required this.courseName,
    required this.scheduleLabel,
    required this.startTime,
    required this.endTime,
    required this.subjectName,
    required this.teacherName,
    required this.blockType,
    this.didacticUnit,
    this.topic,
    this.specificNotes,
    this.generalNotes,
    required this.teacherSignatureStatus,
    this.closeToken,
  });

  factory JournalEntry.fromJson(Map<String, dynamic> json) {
    return JournalEntry(
      dailyLogId: json['dailyLogId'] as int,
      entryId: json['entryId'] as int,
      courseName: json['courseName'] as String? ?? '',
      scheduleLabel: json['scheduleLabel'] as String? ?? '',
      startTime: json['startTime'] as String? ?? '',
      endTime: json['endTime'] as String? ?? '',
      subjectName: json['subjectName'] as String? ?? '',
      teacherName: json['teacherName'] as String? ?? '',
      blockType: json['blockType'] as String? ?? '',
      didacticUnit: json['didacticUnit'] as String?,
      topic: json['topic'] as String?,
      specificNotes: json['specificNotes'] as String?,
      generalNotes: json['generalNotes'] as String?,
      teacherSignatureStatus: json['teacherSignatureStatus'] as String? ?? 'PENDING',
      closeToken: json['closeToken'] as String?,
    );
  }

  bool get isClosed => teacherSignatureStatus == 'CLOSED' || teacherSignatureStatus == 'SIGNED';
  bool get hasContent => didacticUnit != null && didacticUnit!.isNotEmpty;

  String get timeRange {
    if (startTime.isEmpty || endTime.isEmpty) return scheduleLabel;
    return '$startTime - $endTime';
  }
}
