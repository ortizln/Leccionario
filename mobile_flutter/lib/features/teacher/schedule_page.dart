import 'package:flutter/material.dart';

import '../announcements/announcement_repository.dart';
import '../announcements/models.dart';
import 'models.dart';
import 'teacher_repository.dart';

class SchedulePage extends StatefulWidget {
  final TeacherRepository repo;
  final AnnouncementRepository? announcementRepo;
  const SchedulePage({super.key, required this.repo, this.announcementRepo});

  @override
  State<SchedulePage> createState() => _SchedulePageState();
}

class _SchedulePageState extends State<SchedulePage> {
  List<ScheduleEntry> _entries = [];
  List<Announcement> _announcements = [];
  bool _loading = true;
  String? _error;

  static const _weekdayNames = {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado',
  };

  static const _weekdayAbbr = {
    1: 'LUN',
    2: 'MAR',
    3: 'MIÉ',
    4: 'JUE',
    5: 'VIE',
    6: 'SÁB',
  };

  static const _weekdayIcons = {
    1: Icons.wb_sunny_outlined,
    2: Icons.wb_cloudy_outlined,
    3: Icons.water_drop_outlined,
    4: Icons.eco_outlined,
    5: Icons.local_fire_department_outlined,
    6: Icons.star_outline,
  };

  static const _subjectColors = [
    Color(0xFF3B4436),
    Color(0xFF606C56),
    Color(0xFFE07A5F),
    Color(0xFF81B29A),
    Color(0xFFF2CC8F),
    Color(0xFF3D405B),
  ];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final entries = await widget.repo.fetchMySchedule();
      List<Announcement> announcements = [];
      if (widget.announcementRepo != null) {
        try { announcements = await widget.announcementRepo!.fetchMyAnnouncements(); } catch (_) {}
      }
      if (mounted) setState(() { _entries = entries; _announcements = announcements; _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = e.toString(); _loading = false; });
    }
  }

  int _announcementsForWeekday(int weekday) {
    final now = DateTime.now();
    final startOfWeek = now.subtract(Duration(days: now.weekday - weekday));
    final dateStr = startOfWeek.toIso8601String().substring(0, 10);
    return _announcements.where((a) {
      if (a.schedules.isNotEmpty) {
        return a.schedules.any((s) => s.weekday == weekday);
      }
      return a.eventDate != null && a.eventDate == dateStr;
    }).length;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    final tt = theme.textTheme;

    final grouped = <int, List<ScheduleEntry>>{};
    for (final e in _entries) {
      grouped.putIfAbsent(e.weekday, () => []).add(e);
    }

    return CustomScrollView(
      slivers: [
        _buildHeader(cs, tt),
        if (_loading)
          const SliverFillRemaining(
            child: Center(child: CircularProgressIndicator()),
          )
        else if (_error != null)
          SliverFillRemaining(child: _buildError(cs))
        else if (grouped.isEmpty)
          SliverFillRemaining(child: _buildEmpty(cs, tt))
        else
          ...grouped.entries.map((e) => _buildDaySection(e.key, e.value, cs, tt)),
        const SliverToBoxAdapter(child: SizedBox(height: 24)),
      ],
    );
  }

  Widget _buildHeader(ColorScheme cs, TextTheme tt) {
    return SliverToBoxAdapter(
      child: Container(
        margin: const EdgeInsets.fromLTRB(16, 16, 16, 8),
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF3B4436), Color(0xFF606C56)],
          ),
          borderRadius: BorderRadius.circular(24),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Icon(Icons.calendar_today, color: Colors.white, size: 28),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Mi Horario',
                        style: tt.headlineSmall?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${_entries.length} bloques asignados',
                        style: tt.bodyMedium?.copyWith(
                          color: Colors.white.withValues(alpha: 0.8),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.school, color: Colors.white, size: 16),
                  const SizedBox(width: 8),
                  Text(
                    _entries.isNotEmpty ? _entries.first.periodName : 'Periodo activo',
                    style: tt.bodySmall?.copyWith(color: Colors.white),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildError(ColorScheme cs) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.cloud_off_rounded, size: 64, color: cs.error),
            const SizedBox(height: 16),
            Text('Error al cargar horario', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: cs.onSurface)),
            const SizedBox(height: 8),
            Text(_error!, textAlign: TextAlign.center, style: TextStyle(color: cs.onSurfaceVariant)),
            const SizedBox(height: 24),
            FilledButton.icon(onPressed: _load, icon: const Icon(Icons.refresh), label: const Text('Reintentar')),
          ],
        ),
      ),
    );
  }

  Widget _buildEmpty(ColorScheme cs, TextTheme tt) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.event_busy_rounded, size: 64, color: cs.outline),
            const SizedBox(height: 16),
            Text('Sin horario asignado', style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Text('No se encontraron bloques en su horario', style: tt.bodyMedium?.copyWith(color: cs.onSurfaceVariant)),
          ],
        ),
      ),
    );
  }

  Widget _buildDaySection(int weekday, List<ScheduleEntry> entries, ColorScheme cs, TextTheme tt) {
    final color = _subjectColors[(weekday - 1) % _subjectColors.length];
    entries.sort((a, b) => a.scheduleLabel.compareTo(b.scheduleLabel));
    final annCount = _announcementsForWeekday(weekday);

    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(_weekdayIcons[weekday] ?? Icons.calendar_today, color: color, size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            _weekdayNames[weekday] ?? '',
                            style: tt.titleMedium?.copyWith(fontWeight: FontWeight.bold, color: cs.onSurface),
                          ),
                          if (annCount > 0) ...[
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFFE07A5F).withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.notifications_active, size: 12, color: Color(0xFFE07A5F)),
                                  const SizedBox(width: 3),
                                  Text(
                                    '$annCount',
                                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFE07A5F)),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ],
                      ),
                      Text(
                        '${entries.length} ${entries.length == 1 ? 'bloque' : 'bloques'}',
                        style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    _weekdayAbbr[weekday] ?? '',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: color),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            ...entries.map((e) => _buildScheduleCard(e, color, cs, tt)),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  Widget _buildScheduleCard(ScheduleEntry entry, Color dayColor, ColorScheme cs, TextTheme tt) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: cs.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cs.outlineVariant.withValues(alpha: 0.5)),
      ),
      child: IntrinsicHeight(
        child: Row(
          children: [
            Container(
              width: 5,
              decoration: BoxDecoration(
                color: dayColor,
                borderRadius: const BorderRadius.horizontal(left: Radius.circular(16)),
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            entry.subjectName,
                            style: tt.bodyLarge?.copyWith(fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 3),
                          Row(
                            children: [
                              Icon(Icons.class_outlined, size: 14, color: cs.onSurfaceVariant),
                              const SizedBox(width: 4),
                              Text(
                                entry.courseName,
                                style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: dayColor.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            entry.scheduleLabel,
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: dayColor),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          entry.timeRange,
                          style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant, fontSize: 11),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
