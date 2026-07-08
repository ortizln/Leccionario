import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:dio/dio.dart';

import '../../core/network/api_client.dart';
import '../../core/storage/local_store.dart';
import '../auth/auth_repository.dart';
import 'models.dart';

class DailyLogRepository {
  DailyLogRepository({
    required this.authRepository,
    required this.localStore,
  });

  final AuthRepository authRepository;
  final LocalStore localStore;

  Future<MobileTodayResponse> fetchToday({
    String? workDate,
    bool forceRemote = false,
  }) async {
    final targetDate = workDate ?? _todayIso();
    final session = await authRepository.readSession();
    if (session?.isOfflineLocalAdmin ?? false) {
      if (forceRemote) {
        throw Exception(
            'El usuario admin local solo funciona en modo offline.');
      }
      return MobileTodayResponse(
        username: session!.username,
        fullName: session.fullName,
        workDate: targetDate,
        entries: const [],
      );
    }

    final online = await _isOnline();
    if (online) {
      final remote = await _fetchRemoteToday(targetDate);
      await localStore.cacheEntries(
          targetDate, remote.entries.map((item) => item.toJson()).toList());
      return remote;
    }

    if (forceRemote) {
      throw Exception('No hay conexion disponible para sincronizar.');
    }

    final cached = await localStore.readCachedEntries(targetDate);
    return MobileTodayResponse(
      username: session?.username ?? 'offline',
      fullName: session?.fullName ?? 'Modo offline',
      workDate: targetDate,
      entries: cached.map(MobileTodayEntry.fromJson).toList(),
    );
  }

  Future<void> syncPending() async {
    final session = await authRepository.readSession();
    if (session == null) return;
    if (session.isOfflineLocalAdmin) return;
    if (!await _isOnline()) return;

    await _syncQueue(
      table: 'pending_entry_updates',
      pathBuilder: (item) =>
          '/daily-logs/${item.dailyLogId}/entries/${item.entryId}',
      token: session.token,
    );
    await _syncQueue(
      table: 'pending_absence_updates',
      pathBuilder: (item) =>
          '/daily-logs/${item.dailyLogId}/entries/${item.entryId}/absences',
      token: session.token,
    );
    await _syncQueue(
      table: 'pending_incident_updates',
      pathBuilder: (item) =>
          '/daily-logs/${item.dailyLogId}/entries/${item.entryId}/incidents',
      token: session.token,
    );
  }

  Future<void> saveEntryFields(MobileTodayEntry entry) async {
    await _replaceCachedEntry(entry);
    await localStore.queueUpdate(
      table: 'pending_entry_updates',
      entryId: entry.id,
      dailyLogId: entry.dailyLogId,
      payload: {
        'didacticUnit': entry.didacticUnit,
        'curricularSkill': entry.curricularSkill,
        'topic': entry.topic,
        'specificNotes': entry.specificNotes,
        'generalNotes': entry.generalNotes,
        'signed': entry.teacherSignatureStatus == 'SIGNED',
      },
    );
  }

  Future<void> saveAbsences(MobileTodayEntry entry) async {
    await _replaceCachedEntry(entry);
    await localStore.queueUpdate(
      table: 'pending_absence_updates',
      entryId: entry.id,
      dailyLogId: entry.dailyLogId,
      payload: {
        'absences': entry.absences
            .map((item) => {
                  'studentId': item.studentId,
                  'absenceType': item.absenceType,
                  'notes': item.notes,
                })
            .toList(),
      },
    );
  }

  Future<void> saveIncidents(MobileTodayEntry entry) async {
    await _replaceCachedEntry(entry);
    await localStore.queueUpdate(
      table: 'pending_incident_updates',
      entryId: entry.id,
      dailyLogId: entry.dailyLogId,
      payload: {
        'incidents': entry.incidents
            .map((item) => {
                  'studentId': item.studentId,
                  'demeritId': item.demeritId,
                  'category': item.category,
                  'notes': item.notes,
                })
            .toList(),
      },
    );
  }

  MobileCloseAction parseQrPayload(String rawValue) {
    final value = rawValue.trim();
    final normalized = value.startsWith('http') ? Uri.parse(value).path : value;

    final signatureMatch = RegExp(r'/mobile/log-signature/([^/]+)/([^/]+)$')
            .firstMatch(normalized) ??
        RegExp(r'^mobile/log-signature/([^/]+)/([^/]+)$')
            .firstMatch(normalized);
    if (signatureMatch != null) {
      return MobileCloseAction(
        mode: MobileCloseMode.signature,
        token: signatureMatch.group(1)!,
        signatureType: signatureMatch.group(2)!.toUpperCase(),
      );
    }

    final entryMatch =
        RegExp(r'/mobile/entry-close/([^/]+)$').firstMatch(normalized) ??
            RegExp(r'^mobile/entry-close/([^/]+)$').firstMatch(normalized);
    if (entryMatch != null) {
      return MobileCloseAction(
        mode: MobileCloseMode.entry,
        token: entryMatch.group(1)!,
      );
    }

    final logMatch =
        RegExp(r'/mobile/log-close/([^/]+)$').firstMatch(normalized) ??
            RegExp(r'^mobile/log-close/([^/]+)$').firstMatch(normalized);
    if (logMatch != null) {
      return MobileCloseAction(
        mode: MobileCloseMode.log,
        token: logMatch.group(1)!,
      );
    }

    throw Exception('El QR no corresponde a un cierre valido del leccionario.');
  }

  Future<MobileCloseSummary> fetchCloseSummary(MobileCloseAction action) async {
    final response = await ApiClient.instance.get(
      _closePath(action),
    );
    final json = response.data as Map<String, dynamic>;
    return MobileCloseSummary.fromJson(action.mode, json);
  }

  Future<MobileCloseSummary> submitCloseAction({
    required MobileCloseAction action,
    required String username,
    required String code,
    String? notes,
  }) async {
    final response = await ApiClient.instance.post(
      _closePath(action, submit: true),
      data: {
        'username': username.trim(),
        'code': code.trim(),
        'notes': notes?.trim().isEmpty ?? true ? null : notes!.trim(),
      },
    );

    final json = response.data as Map<String, dynamic>;
    return MobileCloseSummary.fromJson(action.mode, json);
  }

  Future<MobileTodayResponse> _fetchRemoteToday(String workDate) async {
    final session = await authRepository.readSession();
    if (session == null) {
      throw Exception('No existe una sesion activa');
    }

    final response = await ApiClient.instance.get(
      '/daily-logs/mobile/today',
      queryParameters: {'workDate': workDate},
    );

    final json = response.data as Map<String, dynamic>;
    return MobileTodayResponse.fromJson(json);
  }

  Future<void> _syncQueue({
    required String table,
    required String Function(PendingUpdate item) pathBuilder,
    required String token,
  }) async {
    final items = await localStore.readPending(table);
    for (final item in items) {
      try {
        await ApiClient.instance.put(
          pathBuilder(item),
          data: item.payload,
        );
        await localStore.removePending(table, item.entryId);
      } on DioException catch (e) {
        if (e.response?.statusCode != null &&
            e.response!.statusCode! < 400) {
          await localStore.removePending(table, item.entryId);
        }
      }
    }
  }

  Future<void> _replaceCachedEntry(MobileTodayEntry updated) async {
    final entries = await localStore.readCachedEntries(updated.logDate);
    final exists = entries.any((json) => json['id'] == updated.id);
    final next = entries
        .map((json) => json['id'] == updated.id ? updated.toJson() : json)
        .toList();
    if (!exists) {
      next.add(updated.toJson());
    }
    await localStore.cacheEntries(updated.logDate, next);
  }

  String _closePath(MobileCloseAction action, {bool submit = false}) {
    switch (action.mode) {
      case MobileCloseMode.entry:
        return submit
            ? '/daily-logs/mobile/entries/${action.token}/close'
            : '/daily-logs/mobile/entries/${action.token}';
      case MobileCloseMode.signature:
        final signatureType = action.signatureType ?? 'TEACHER_TUTOR';
        return submit
            ? '/daily-logs/mobile/logs/${action.token}/signatures/$signatureType'
            : '/daily-logs/mobile/logs/${action.token}/signatures/$signatureType';
      case MobileCloseMode.log:
        return submit
            ? '/daily-logs/mobile/logs/${action.token}/close'
            : '/daily-logs/mobile/logs/${action.token}';
    }
  }

  String _todayIso() => DateTime.now().toIso8601String().split('T').first;

  Future<bool> _isOnline() async {
    final connectivity = await Connectivity().checkConnectivity();
    return !connectivity.contains(ConnectivityResult.none);
  }
}
