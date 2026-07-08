import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:path/path.dart' as p;
import 'package:sqflite/sqflite.dart';

class LocalStore {
  Database? _db;
  final bool _isWeb = kIsWeb;
  final Map<String, List<Map<String, dynamic>>> _memoryStore = {};

  Future<void> init() async {
    if (_isWeb) return;

    final databasesPath = await getDatabasesPath();
    final path = p.join(databasesPath, 'leccionario_mobile.db');
    _db = await openDatabase(
      path,
      version: 3,
      onCreate: (db, version) async {
        await _createSchema(db);
      },
      onUpgrade: (db, oldVersion, newVersion) async {
        if (oldVersion < 2) {
          await db.execute('DROP TABLE IF EXISTS session_store');
          await db.execute('DROP TABLE IF EXISTS cached_today_entries');
          await db.execute('DROP TABLE IF EXISTS pending_entry_updates');
          await db.execute('DROP TABLE IF EXISTS pending_absence_updates');
          await db.execute('DROP TABLE IF EXISTS pending_incident_updates');
          await _createSchema(db);
        } else if (oldVersion < 3) {
          await db.execute('CREATE TABLE IF NOT EXISTS app_settings (id INTEGER PRIMARY KEY, payload TEXT NOT NULL)');
        }
      },
    );
  }

  Future<void> _createSchema(Database db) async {
    await db.execute('CREATE TABLE session_store (id INTEGER PRIMARY KEY, payload TEXT NOT NULL)');
    await db.execute(
      'CREATE TABLE cached_today_entries (work_date TEXT NOT NULL, entry_id INTEGER NOT NULL, payload TEXT NOT NULL, PRIMARY KEY(work_date, entry_id))',
    );
    await db.execute(
      'CREATE TABLE pending_entry_updates (entry_id INTEGER PRIMARY KEY, daily_log_id INTEGER NOT NULL, payload TEXT NOT NULL)',
    );
    await db.execute(
      'CREATE TABLE pending_absence_updates (entry_id INTEGER PRIMARY KEY, daily_log_id INTEGER NOT NULL, payload TEXT NOT NULL)',
    );
    await db.execute(
      'CREATE TABLE pending_incident_updates (entry_id INTEGER PRIMARY KEY, daily_log_id INTEGER NOT NULL, payload TEXT NOT NULL)',
    );
    await db.execute('CREATE TABLE app_settings (id INTEGER PRIMARY KEY, payload TEXT NOT NULL)');
  }

  Database get db {
    if (_isWeb) throw StateError('sqflite not available on web');
    final instance = _db;
    if (instance == null) {
      throw StateError('LocalStore no inicializado');
    }
    return instance;
  }

  // --- Singleton (session_store, app_settings) ---

  Future<void> saveSingleton(String table, Map<String, dynamic> payload) async {
    if (_isWeb) {
      _memoryStore[table] = [{'id': 1, 'payload': jsonEncode(payload)}];
      return;
    }
    await db.delete(table);
    await db.insert(table, {'id': 1, 'payload': jsonEncode(payload)});
  }

  Future<Map<String, dynamic>?> readSingleton(String table) async {
    if (_isWeb) {
      final rows = _memoryStore[table];
      if (rows == null || rows.isEmpty) return null;
      return jsonDecode(rows.first['payload'] as String) as Map<String, dynamic>;
    }
    final rows = await db.query(table, limit: 1);
    if (rows.isEmpty) return null;
    return jsonDecode(rows.first['payload'] as String) as Map<String, dynamic>;
  }

  Future<void> clearTable(String table) async {
    if (_isWeb) {
      _memoryStore.remove(table);
      return;
    }
    await db.delete(table);
  }

  // --- Cache entries ---

  Future<void> cacheEntries(String workDate, List<Map<String, dynamic>> entries) async {
    if (_isWeb) {
      _memoryStore['cached_today_entries'] = entries
          .map((e) => {'work_date': workDate, 'entry_id': e['id'], 'payload': jsonEncode(e)})
          .toList();
      return;
    }
    final batch = db.batch();
    batch.delete('cached_today_entries', where: 'work_date = ?', whereArgs: [workDate]);
    for (final entry in entries) {
      batch.insert('cached_today_entries', {
        'work_date': workDate,
        'entry_id': entry['id'],
        'payload': jsonEncode(entry),
      });
    }
    await batch.commit(noResult: true);
  }

  Future<List<Map<String, dynamic>>> readCachedEntries(String workDate) async {
    if (_isWeb) {
      final rows = _memoryStore['cached_today_entries'] ?? [];
      return rows
          .where((r) => r['work_date'] == workDate)
          .map((row) => jsonDecode(row['payload'] as String) as Map<String, dynamic>)
          .toList();
    }
    final rows = await db.query(
      'cached_today_entries',
      where: 'work_date = ?',
      whereArgs: [workDate],
      orderBy: 'entry_id ASC',
    );
    return rows.map((row) => jsonDecode(row['payload'] as String) as Map<String, dynamic>).toList();
  }

  // --- Pending updates queue ---

  Future<void> queueUpdate({
    required String table,
    required int entryId,
    required int dailyLogId,
    required Map<String, dynamic> payload,
  }) async {
    if (_isWeb) {
      final list = _memoryStore[table] ?? [];
      list.removeWhere((r) => r['entry_id'] == entryId);
      list.add({'entry_id': entryId, 'daily_log_id': dailyLogId, 'payload': jsonEncode(payload)});
      _memoryStore[table] = list;
      return;
    }
    await db.insert(
      table,
      {'entry_id': entryId, 'daily_log_id': dailyLogId, 'payload': jsonEncode(payload)},
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<List<PendingUpdate>> readPending(String table) async {
    if (_isWeb) {
      final rows = _memoryStore[table] ?? [];
      return rows
          .map(
            (row) => PendingUpdate(
              entryId: row['entry_id'] as int,
              dailyLogId: row['daily_log_id'] as int,
              payload: jsonDecode(row['payload'] as String) as Map<String, dynamic>,
            ),
          )
          .toList();
    }
    final rows = await db.query(table);
    return rows
        .map(
          (row) => PendingUpdate(
            entryId: row['entry_id'] as int,
            dailyLogId: row['daily_log_id'] as int,
            payload: jsonDecode(row['payload'] as String) as Map<String, dynamic>,
          ),
        )
        .toList();
  }

  Future<void> removePending(String table, int entryId) async {
    if (_isWeb) {
      final list = _memoryStore[table] ?? [];
      list.removeWhere((r) => r['entry_id'] == entryId);
      return;
    }
    await db.delete(table, where: 'entry_id = ?', whereArgs: [entryId]);
  }
}

class PendingUpdate {
  const PendingUpdate({
    required this.entryId,
    required this.dailyLogId,
    required this.payload,
  });

  final int entryId;
  final int dailyLogId;
  final Map<String, dynamic> payload;
}
