import 'package:flutter/material.dart';

import 'models.dart';
import 'teacher_repository.dart';

class JournalPage extends StatefulWidget {
  final TeacherRepository repo;
  const JournalPage({super.key, required this.repo});

  @override
  State<JournalPage> createState() => _JournalPageState();
}

class _JournalPageState extends State<JournalPage> {
  WeeklyJournal? _journal;
  bool _loading = true;
  String? _error;
  int _weekOffset = 0;
  int _selectedDayIndex = 0;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final journal = await widget.repo.fetchWeeklyJournal(weekOffset: _weekOffset);
      if (mounted) {
        setState(() {
          _journal = journal;
          _loading = false;
          _selectedDayIndex = 0;
        });
      }
    } catch (e) {
      if (mounted) setState(() { _error = e.toString(); _loading = false; });
    }
  }

  void _prevWeek() { setState(() { _weekOffset--; _loading = true; }); _load(); }
  void _nextWeek() { setState(() { _weekOffset++; _loading = true; }); _load(); }
  void _goToday() { setState(() { _weekOffset = 0; _loading = true; }); _load(); }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    final tt = theme.textTheme;

    final days = _journal?.days ?? [];
    final selectedDay = days.isNotEmpty && _selectedDayIndex < days.length
        ? days[_selectedDayIndex]
        : null;

    return CustomScrollView(
      slivers: [
        _buildHeader(cs, tt),
        _buildWeekNav(cs, tt, days),
        if (_loading)
          const SliverFillRemaining(child: Center(child: CircularProgressIndicator()))
        else if (_error != null)
          SliverFillRemaining(child: _buildError(cs))
        else if (days.isEmpty)
          SliverFillRemaining(child: _buildEmpty(cs, tt))
        else ...[
          _buildDayTabs(cs, tt, days),
          if (selectedDay != null)
            if (selectedDay.entries.isEmpty)
              SliverToBoxAdapter(child: _buildEmptyDay(cs, tt, selectedDay))
            else
              SliverList(
                delegate: SliverChildBuilderDelegate(
                  (ctx, i) => _buildEntryCard(selectedDay.entries[i], cs, tt),
                  childCount: selectedDay.entries.length,
                ),
              ),
        ],
        const SliverToBoxAdapter(child: SizedBox(height: 24)),
      ],
    );
  }

  Widget _buildHeader(ColorScheme cs, TextTheme tt) {
    return SliverToBoxAdapter(
      child: Container(
        margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF3D405B), Color(0xFF3B4436)],
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
                  child: const Icon(Icons.menu_book_rounded, color: Colors.white, size: 28),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Leccionario',
                        style: tt.headlineSmall?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        _journal?.periodName ?? 'Cargando...',
                        style: tt.bodyMedium?.copyWith(
                          color: Colors.white.withValues(alpha: 0.8),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWeekNav(ColorScheme cs, TextTheme tt, List<JournalDay> days) {
    final weekLabel = days.isNotEmpty && days.first.logDate.isNotEmpty
        ? '${days.first.logDate} - ${days.last.logDate}'
        : 'Semana';

    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
        child: Row(
          children: [
            IconButton.filledTonal(
              onPressed: _prevWeek,
              icon: const Icon(Icons.chevron_left_rounded, size: 20),
              style: IconButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                children: [
                  Text(weekLabel, style: tt.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 2),
                  if (_weekOffset != 0)
                    TextButton(
                      onPressed: _goToday,
                      style: TextButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 0)),
                      child: Text('Hoy', style: TextStyle(fontSize: 12, color: cs.primary)),
                    )
                  else
                    const SizedBox(height: 20),
                ],
              ),
            ),
            const SizedBox(width: 8),
            IconButton.filledTonal(
              onPressed: _nextWeek,
              icon: const Icon(Icons.chevron_right_rounded, size: 20),
              style: IconButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDayTabs(ColorScheme cs, TextTheme tt, List<JournalDay> days) {
    return SliverToBoxAdapter(
      child: SizedBox(
        height: 80,
        child: ListView.builder(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          itemCount: days.length,
          itemBuilder: (ctx, i) {
            final day = days[i];
            final selected = i == _selectedDayIndex;
            final hasEntries = day.entries.isNotEmpty;
            final now = DateTime.now();
            final isToday = day.logDate == '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';

            return GestureDetector(
              onTap: () => setState(() => _selectedDayIndex = i),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: 72,
                margin: const EdgeInsets.only(right: 8),
                decoration: BoxDecoration(
                  color: selected
                      ? cs.primary
                      : isToday
                          ? cs.primaryContainer
                          : cs.surfaceContainerHighest.withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(16),
                  border: isToday && !selected
                      ? Border.all(color: cs.primary.withValues(alpha: 0.4), width: 1.5)
                      : null,
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      day.weekdayLabel.substring(0, 3).toUpperCase(),
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: selected ? Colors.white : cs.onSurfaceVariant,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      day.logDate.length >= 10 ? day.logDate.substring(8, 10) : '--',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: selected ? Colors.white : cs.onSurface,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(
                        day.entries.length.clamp(0, 4),
                        (j) => Container(
                          width: 6,
                          height: 6,
                          margin: const EdgeInsets.symmetric(horizontal: 1),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: selected
                                ? Colors.white.withValues(alpha: 0.8)
                                : hasEntries
                                    ? cs.primary
                                    : cs.outline.withValues(alpha: 0.3),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildEmptyDay(ColorScheme cs, TextTheme tt, JournalDay day) {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          children: [
            Icon(Icons.event_note_rounded, size: 48, color: cs.outline),
            const SizedBox(height: 12),
            Text(
              'Sin clases este día',
              style: tt.bodyLarge?.copyWith(fontWeight: FontWeight.w500, color: cs.onSurfaceVariant),
            ),
            const SizedBox(height: 4),
            Text(
              '${day.weekdayLabel} no tiene bloques asignados',
              style: tt.bodySmall?.copyWith(color: cs.outline),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEntryCard(JournalEntry entry, ColorScheme cs, TextTheme tt) {
    final statusColor = entry.isClosed ? const Color(0xFF81B29A) : const Color(0xFFE07A5F);
    final statusText = entry.isClosed ? 'Registrado' : 'Pendiente';
    final statusIcon = entry.isClosed ? Icons.check_circle_rounded : Icons.schedule_rounded;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Container(
        decoration: BoxDecoration(
          color: cs.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: cs.outlineVariant.withValues(alpha: 0.5)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: statusColor.withValues(alpha: 0.08),
                borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              ),
              child: Row(
                children: [
                  Icon(statusIcon, size: 16, color: statusColor),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      entry.courseName,
                      style: TextStyle(fontWeight: FontWeight.w600, color: cs.onSurface, fontSize: 14),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      statusText,
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: statusColor),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.subject_rounded, size: 16, color: cs.primary),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(entry.subjectName, style: tt.bodyMedium?.copyWith(fontWeight: FontWeight.w500)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Icon(Icons.access_time_rounded, size: 16, color: cs.onSurfaceVariant),
                      const SizedBox(width: 8),
                      Text('${entry.scheduleLabel} · ${entry.timeRange}', style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant)),
                    ],
                  ),
                  if (entry.hasContent) ...[
                    const SizedBox(height: 12),
                    const Divider(height: 1),
                    const SizedBox(height: 12),
                    if (entry.didacticUnit != null && entry.didacticUnit!.isNotEmpty)
                      _buildDetailRow(Icons.flag_rounded, 'Unidad', entry.didacticUnit!, cs, tt),
                    if (entry.topic != null && entry.topic!.isNotEmpty)
                      _buildDetailRow(Icons.topic_rounded, 'Tema', entry.topic!, cs, tt),
                    if (entry.specificNotes != null && entry.specificNotes!.isNotEmpty)
                      _buildDetailRow(Icons.note_rounded, 'Notas', entry.specificNotes!, cs, tt),
                  ] else
                    Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Text(
                        'Sin planificación registrada',
                        style: tt.bodySmall?.copyWith(color: cs.outline, fontStyle: FontStyle.italic),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value, ColorScheme cs, TextTheme tt) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 14, color: cs.onSurfaceVariant),
          const SizedBox(width: 8),
          Expanded(
            child: RichText(
              text: TextSpan(
                children: [
                  TextSpan(
                    text: '$label: ',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: cs.onSurfaceVariant),
                  ),
                  TextSpan(
                    text: value,
                    style: TextStyle(fontSize: 13, color: cs.onSurface),
                  ),
                ],
              ),
            ),
          ),
        ],
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
            const Text('Error al cargar leccionario', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
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
            Icon(Icons.menu_book_outlined, size: 64, color: cs.outline),
            const SizedBox(height: 16),
            Text('Sin leccionario', style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Text('No hay bloques para esta semana', style: tt.bodyMedium?.copyWith(color: cs.onSurfaceVariant)),
          ],
        ),
      ),
    );
  }
}
