enum MobileCloseMode { entry, signature, log }

class MobileTodayResponse {
  const MobileTodayResponse({
    required this.username,
    required this.fullName,
    required this.workDate,
    required this.entries,
  });

  factory MobileTodayResponse.fromJson(Map<String, dynamic> json) {
    return MobileTodayResponse(
      username: json['username'] as String,
      fullName: json['fullName'] as String,
      workDate: json['workDate'] as String,
      entries: (json['entries'] as List<dynamic>)
          .map((item) => MobileTodayEntry.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
  }

  final String username;
  final String fullName;
  final String workDate;
  final List<MobileTodayEntry> entries;
}

class MobileTodayEntry {
  const MobileTodayEntry({
    required this.id,
    required this.dailyLogId,
    required this.logCloseToken,
    required this.entryCloseToken,
    required this.courseId,
    required this.courseName,
    required this.logDate,
    required this.periodName,
    required this.scheduleLabel,
    required this.startTime,
    required this.endTime,
    required this.subjectName,
    required this.teacherName,
    required this.didacticUnit,
    required this.curricularSkill,
    required this.topic,
    required this.specificNotes,
    required this.generalNotes,
    required this.teacherSignatureStatus,
    required this.demerits,
    required this.students,
    required this.absences,
    required this.incidents,
  });

  factory MobileTodayEntry.fromJson(Map<String, dynamic> json) {
    return MobileTodayEntry(
      id: json['id'] as int,
      dailyLogId: json['dailyLogId'] as int,
      logCloseToken: json['logCloseToken'] as String,
      entryCloseToken: json['entryCloseToken'] as String,
      courseId: json['courseId'] as int,
      courseName: json['courseName'] as String,
      logDate: json['logDate'] as String,
      periodName: json['periodName'] as String,
      scheduleLabel: json['scheduleLabel'] as String,
      startTime: json['startTime'] as String,
      endTime: json['endTime'] as String,
      subjectName: json['subjectName'] as String?,
      teacherName: json['teacherName'] as String?,
      didacticUnit: json['didacticUnit'] as String?,
      curricularSkill: json['curricularSkill'] as String?,
      topic: json['topic'] as String?,
      specificNotes: json['specificNotes'] as String?,
      generalNotes: json['generalNotes'] as String?,
      teacherSignatureStatus: json['teacherSignatureStatus'] as String,
      demerits: (json['demerits'] as List<dynamic>)
          .map((item) => DemeritOption.fromJson(item as Map<String, dynamic>))
          .toList(),
      students: (json['students'] as List<dynamic>)
          .map((item) => StudentOption.fromJson(item as Map<String, dynamic>))
          .toList(),
      absences: (json['absences'] as List<dynamic>)
          .map((item) => AbsenceItem.fromJson(item as Map<String, dynamic>))
          .toList(),
      incidents: (json['incidents'] as List<dynamic>)
          .map((item) => IncidentItem.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
  }

  final int id;
  final int dailyLogId;
  final String logCloseToken;
  final String entryCloseToken;
  final int courseId;
  final String courseName;
  final String logDate;
  final String periodName;
  final String scheduleLabel;
  final String startTime;
  final String endTime;
  final String? subjectName;
  final String? teacherName;
  final String? didacticUnit;
  final String? curricularSkill;
  final String? topic;
  final String? specificNotes;
  final String? generalNotes;
  final String teacherSignatureStatus;
  final List<DemeritOption> demerits;
  final List<StudentOption> students;
  final List<AbsenceItem> absences;
  final List<IncidentItem> incidents;

  Map<String, dynamic> toJson() => {
        'id': id,
        'dailyLogId': dailyLogId,
        'logCloseToken': logCloseToken,
        'entryCloseToken': entryCloseToken,
        'courseId': courseId,
        'courseName': courseName,
        'logDate': logDate,
        'periodName': periodName,
        'scheduleLabel': scheduleLabel,
        'startTime': startTime,
        'endTime': endTime,
        'subjectName': subjectName,
        'teacherName': teacherName,
        'didacticUnit': didacticUnit,
        'curricularSkill': curricularSkill,
        'topic': topic,
        'specificNotes': specificNotes,
        'generalNotes': generalNotes,
        'teacherSignatureStatus': teacherSignatureStatus,
        'demerits': demerits.map((item) => item.toJson()).toList(),
        'students': students.map((item) => item.toJson()).toList(),
        'absences': absences.map((item) => item.toJson()).toList(),
        'incidents': incidents.map((item) => item.toJson()).toList(),
      };

  MobileTodayEntry copyWith({
    String? didacticUnit,
    String? curricularSkill,
    String? topic,
    String? specificNotes,
    String? generalNotes,
    String? teacherSignatureStatus,
    List<AbsenceItem>? absences,
    List<IncidentItem>? incidents,
  }) {
    return MobileTodayEntry(
      id: id,
      dailyLogId: dailyLogId,
      logCloseToken: logCloseToken,
      entryCloseToken: entryCloseToken,
      courseId: courseId,
      courseName: courseName,
      logDate: logDate,
      periodName: periodName,
      scheduleLabel: scheduleLabel,
      startTime: startTime,
      endTime: endTime,
      subjectName: subjectName,
      teacherName: teacherName,
      didacticUnit: didacticUnit ?? this.didacticUnit,
      curricularSkill: curricularSkill ?? this.curricularSkill,
      topic: topic ?? this.topic,
      specificNotes: specificNotes ?? this.specificNotes,
      generalNotes: generalNotes ?? this.generalNotes,
      teacherSignatureStatus: teacherSignatureStatus ?? this.teacherSignatureStatus,
      demerits: demerits,
      students: students,
      absences: absences ?? this.absences,
      incidents: incidents ?? this.incidents,
    );
  }
}

class MobileCloseAction {
  const MobileCloseAction({
    required this.mode,
    required this.token,
    this.signatureType,
  });

  final MobileCloseMode mode;
  final String token;
  final String? signatureType;
}

class MobileCloseSummary {
  const MobileCloseSummary({
    required this.mode,
    required this.closeToken,
    required this.courseName,
    required this.logDate,
    this.status,
    this.scheduleLabel,
    this.subjectName,
    this.teacherName,
    this.teacherSignatureStatus,
    this.teacherClosedAt,
    this.signatureType,
    this.signerName,
    this.signedAt,
    this.closedAt,
  });

  factory MobileCloseSummary.fromJson(
    MobileCloseMode mode,
    Map<String, dynamic> json,
  ) {
    return MobileCloseSummary(
      mode: mode,
      closeToken: json['closeToken'] as String,
      courseName: json['courseName'] as String,
      logDate: json['logDate'] as String,
      status: json['status'] as String?,
      scheduleLabel: json['scheduleLabel'] as String?,
      subjectName: json['subjectName'] as String?,
      teacherName: json['teacherName'] as String?,
      teacherSignatureStatus: json['teacherSignatureStatus'] as String?,
      teacherClosedAt: json['teacherClosedAt'] as String?,
      signatureType: json['signatureType'] as String?,
      signerName: json['signerName'] as String?,
      signedAt: json['signedAt'] as String?,
      closedAt: json['closedAt'] as String?,
    );
  }

  final MobileCloseMode mode;
  final String closeToken;
  final String courseName;
  final String logDate;
  final String? status;
  final String? scheduleLabel;
  final String? subjectName;
  final String? teacherName;
  final String? teacherSignatureStatus;
  final String? teacherClosedAt;
  final String? signatureType;
  final String? signerName;
  final String? signedAt;
  final String? closedAt;

  bool get isCompleted {
    switch (mode) {
      case MobileCloseMode.entry:
        return teacherSignatureStatus == 'SIGNED';
      case MobileCloseMode.signature:
        return signedAt != null;
      case MobileCloseMode.log:
        return status == 'CLOSED' || status == 'SIGNED';
    }
  }
}

class StudentOption {
  const StudentOption({
    required this.id,
    required this.enrollmentNumber,
    required this.fullName,
  });

  factory StudentOption.fromJson(Map<String, dynamic> json) {
    return StudentOption(
      id: json['id'] as int,
      enrollmentNumber: json['enrollmentNumber'] as String,
      fullName: json['fullName'] as String,
    );
  }

  final int id;
  final String enrollmentNumber;
  final String fullName;

  Map<String, dynamic> toJson() => {
        'id': id,
        'enrollmentNumber': enrollmentNumber,
        'fullName': fullName,
      };
}

class DemeritOption {
  const DemeritOption({
    required this.id,
    required this.code,
    required this.category,
    required this.description,
    required this.score,
  });

  factory DemeritOption.fromJson(Map<String, dynamic> json) {
    return DemeritOption(
      id: json['id'] as int,
      code: json['code'] as String?,
      category: json['category'] as String,
      description: json['description'] as String,
      score: json['score'] as int,
    );
  }

  final int id;
  final String? code;
  final String category;
  final String description;
  final int score;

  Map<String, dynamic> toJson() => {
        'id': id,
        'code': code,
        'category': category,
        'description': description,
        'score': score,
      };

  String get label {
    final codePart = code == null || code!.isEmpty ? '' : '$code · ';
    return '$codePart$category · $score pts';
  }
}

class AbsenceItem {
  const AbsenceItem({
    required this.studentId,
    required this.studentName,
    required this.enrollmentNumber,
    required this.absenceType,
    required this.notes,
  });

  factory AbsenceItem.fromJson(Map<String, dynamic> json) {
    return AbsenceItem(
      studentId: json['studentId'] as int,
      studentName: json['studentName'] as String,
      enrollmentNumber: json['enrollmentNumber'] as String,
      absenceType: json['absenceType'] as String,
      notes: json['notes'] as String?,
    );
  }

  final int studentId;
  final String studentName;
  final String enrollmentNumber;
  final String absenceType;
  final String? notes;

  Map<String, dynamic> toJson() => {
        'studentId': studentId,
        'studentName': studentName,
        'enrollmentNumber': enrollmentNumber,
        'absenceType': absenceType,
        'notes': notes,
      };
}

class IncidentItem {
  const IncidentItem({
    required this.studentId,
    required this.studentName,
    required this.enrollmentNumber,
    required this.demeritId,
    required this.demeritCode,
    required this.demeritCategory,
    required this.demeritDescription,
    required this.demeritScore,
    required this.category,
    required this.notes,
  });

  factory IncidentItem.fromJson(Map<String, dynamic> json) {
    return IncidentItem(
      studentId: json['studentId'] as int,
      studentName: json['studentName'] as String,
      enrollmentNumber: json['enrollmentNumber'] as String,
      demeritId: json['demeritId'] as int?,
      demeritCode: json['demeritCode'] as String?,
      demeritCategory: json['demeritCategory'] as String?,
      demeritDescription: json['demeritDescription'] as String?,
      demeritScore: json['demeritScore'] as int?,
      category: json['category'] as String,
      notes: json['notes'] as String?,
    );
  }

  final int studentId;
  final String studentName;
  final String enrollmentNumber;
  final int? demeritId;
  final String? demeritCode;
  final String? demeritCategory;
  final String? demeritDescription;
  final int? demeritScore;
  final String category;
  final String? notes;

  Map<String, dynamic> toJson() => {
        'studentId': studentId,
        'studentName': studentName,
        'enrollmentNumber': enrollmentNumber,
        'demeritId': demeritId,
        'demeritCode': demeritCode,
        'demeritCategory': demeritCategory,
        'demeritDescription': demeritDescription,
        'demeritScore': demeritScore,
        'category': category,
        'notes': notes,
      };
}
