import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../auth/auth_repository.dart';
import 'daily_log_repository.dart';
import 'entry_page.dart';
import 'models.dart';
import 'qr_close_page.dart';

class TodayPage extends StatefulWidget {
  const TodayPage({
    super.key,
    required this.authRepository,
    required this.dailyLogRepository,
    required this.onLogout,
    required this.onOpenSettings,
  });

  final AuthRepository authRepository;
  final DailyLogRepository dailyLogRepository;
  final VoidCallback onLogout;
  final Function(BuildContext) onOpenSettings;

  @override
  State<TodayPage> createState() => _TodayPageState();
}

class _TodayPageState extends State<TodayPage> {
  MobileTodayResponse? _today;
  bool _loading = true;
  String? _error;
  DateTime _selectedDate = DateTime.now();

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load({bool forceRemote = false}) async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await widget.dailyLogRepository.syncPending();
      final today = await widget.dailyLogRepository.fetchToday(
        workDate: _formatIso(_selectedDate),
        forceRemote: forceRemote,
      );
      setState(() => _today = today);
    } catch (error) {
      setState(() => _error = error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now().subtract(const Duration(days: 30)),
      lastDate: DateTime.now().add(const Duration(days: 30)),
    );
    if (picked == null) return;
    setState(() => _selectedDate = picked);
    await _load(forceRemote: true);
  }

  MobileTodayEntry? _nextEntry(MobileTodayResponse today) {
    if (today.entries.isEmpty) {
      return null;
    }

    final workDate = DateTime.parse(today.workDate);
    final now = DateTime.now();
    final isToday = workDate.year == now.year && workDate.month == now.month && workDate.day == now.day;

    if (!isToday) {
      return today.entries.first;
    }

    for (final entry in today.entries) {
      final start = _parseDateTime(today.workDate, entry.startTime);
      final end = _parseDateTime(today.workDate, entry.endTime);
      if (now.isBefore(end)) {
        return now.isBefore(start) ? entry : entry;
      }
    }

    return null;
  }

  DateTime _parseDateTime(String date, String time) {
    final pieces = time.split(':');
    return DateTime.parse(date).copyWith(
      hour: int.parse(pieces[0]),
      minute: int.parse(pieces[1]),
    );
  }

  String _formatIso(DateTime date) => date.toIso8601String().split('T').first;

  String _statusLabel(MobileTodayEntry entry) {
    return entry.teacherSignatureStatus == 'SIGNED' ? 'Cerrado' : 'Abierto';
  }

  Color _statusColor(MobileTodayEntry entry) {
    return entry.teacherSignatureStatus == 'SIGNED'
        ? const Color(0xFF18794E)
        : const Color(0xFFB54708);
  }

  @override
  Widget build(BuildContext context) {
    final today = _today;
    final nextEntry = today != null ? _nextEntry(today) : null;
    final closedCount = today?.entries.where((entry) => entry.teacherSignatureStatus == 'SIGNED').length ?? 0;
    final openCount = today != null ? today.entries.length - closedCount : 0;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mi jornada'),
        actions: [
          IconButton(onPressed: _pickDate, icon: const Icon(Icons.calendar_month)),
          IconButton(
            onPressed: () async {
              await Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => QrClosePage(
                    repository: widget.dailyLogRepository,
                    authRepository: widget.authRepository,
                  ),
                ),
              );
              await _load(forceRemote: true);
            },
            icon: const Icon(Icons.qr_code_scanner),
          ),
          IconButton(
            onPressed: () => widget.onOpenSettings(context),
            icon: const Icon(Icons.settings_outlined),
          ),
          IconButton(onPressed: () => _load(forceRemote: true), icon: const Icon(Icons.sync)),
          IconButton(onPressed: widget.onLogout, icon: const Icon(Icons.logout)),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Padding(padding: const EdgeInsets.all(24), child: Text(_error!)))
              : today == null
                  ? const Center(child: Text('No hay datos disponibles.'))
                  : RefreshIndicator(
                      onRefresh: () => _load(forceRemote: true),
                      child: ListView(
                        padding: const EdgeInsets.all(16),
                        children: [
                          Container(
                            padding: const EdgeInsets.fromLTRB(22, 22, 22, 18),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFF103A34), Color(0xFF0F766E)],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              borderRadius: BorderRadius.circular(30),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  today.fullName,
                                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(color: Colors.white),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  DateFormat("EEEE, dd 'de' MMMM", 'es').format(DateTime.parse(today.workDate)),
                                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: const Color(0xFFD6EFEA)),
                                ),
                                const SizedBox(height: 18),
                                Wrap(
                                  spacing: 12,
                                  runSpacing: 12,
                                  children: [
                                    _HeroMetric(label: 'Bloques', value: '${today.entries.length}'),
                                    _HeroMetric(label: 'Abiertos', value: '$openCount'),
                                    _HeroMetric(label: 'Cerrados', value: '$closedCount'),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),
                          Card(
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        width: 42,
                                        height: 42,
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFE8F4F1),
                                          borderRadius: BorderRadius.circular(14),
                                        ),
                                        child: const Icon(Icons.schedule, color: Color(0xFF0F766E)),
                                      ),
                                      const SizedBox(width: 12),
                                      const Text('Siguiente clase', style: TextStyle(fontWeight: FontWeight.w700)),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  if (nextEntry != null) ...[
                                    Text(nextEntry.courseName, style: Theme.of(context).textTheme.titleMedium),
                                    const SizedBox(height: 4),
                                    Text('${nextEntry.scheduleLabel} - ${nextEntry.subjectName ?? 'Sin asignatura'}'),
                                    const SizedBox(height: 4),
                                    Text('${nextEntry.startTime} - ${nextEntry.endTime}'),
                                  ] else
                                    const Text('No tienes mas bloques pendientes para esta fecha.'),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),
                          Text('Bloques asignados', style: Theme.of(context).textTheme.titleLarge),
                          const SizedBox(height: 10),
                          if (today.entries.isEmpty)
                            const Card(
                              child: Padding(
                                padding: EdgeInsets.all(20),
                                child: Text('No tienes bloques asignados para esta fecha.'),
                              ),
                            ),
                          ...today.entries.map(
                            (entry) => Card(
                              child: InkWell(
                                borderRadius: BorderRadius.circular(28),
                                onTap: () async {
                                  await Navigator.of(context).push(
                                    MaterialPageRoute(
                                      builder: (_) => EntryPage(entry: entry, repository: widget.dailyLogRepository),
                                    ),
                                  );
                                  await _load();
                                },
                                child: Padding(
                                  padding: const EdgeInsets.all(18),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Expanded(
                                            child: Text(
                                              '${entry.scheduleLabel} · ${entry.courseName}',
                                              style: Theme.of(context).textTheme.titleMedium,
                                            ),
                                          ),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                            decoration: BoxDecoration(
                                              color: _statusColor(entry).withValues(alpha: 0.12),
                                              borderRadius: BorderRadius.circular(999),
                                            ),
                                            child: Text(
                                              _statusLabel(entry),
                                              style: TextStyle(
                                                color: _statusColor(entry),
                                                fontWeight: FontWeight.w700,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 10),
                                      Text(
                                        entry.subjectName ?? 'Sin asignatura',
                                        style: Theme.of(context).textTheme.bodyLarge,
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        '${entry.startTime} - ${entry.endTime}',
                                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                          color: const Color(0xFF667A72),
                                        ),
                                      ),
                                      const SizedBox(height: 14),
                                      Row(
                                        children: [
                                          Icon(Icons.edit_note_rounded, size: 18, color: _statusColor(entry)),
                                          const SizedBox(width: 8),
                                          Text(
                                            entry.teacherSignatureStatus == 'SIGNED'
                                                ? 'Bloque registrado'
                                                : 'Listo para completar',
                                            style: TextStyle(
                                              color: _statusColor(entry),
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                          const Spacer(),
                                          const Icon(Icons.chevron_right_rounded),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
    );
  }
}

class _HeroMetric extends StatelessWidget {
  const _HeroMetric({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 96,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            value,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(color: Colors.white),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: const Color(0xFFD6EFEA)),
          ),
        ],
      ),
    );
  }
}
