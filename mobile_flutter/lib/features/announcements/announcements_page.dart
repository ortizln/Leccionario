import 'package:flutter/material.dart';

import 'announcement_repository.dart';
import 'models.dart';

class AnnouncementsPage extends StatefulWidget {
  final AnnouncementRepository repo;
  const AnnouncementsPage({super.key, required this.repo});

  @override
  State<AnnouncementsPage> createState() => _AnnouncementsPageState();
}

class _AnnouncementsPageState extends State<AnnouncementsPage> {
  List<Announcement> _announcements = [];
  bool _loading = true;
  String? _error;

  static const _typeConfig = {
    'EVENT': {'icon': Icons.event, 'color': Color(0xFF81B29A), 'label': 'Evento'},
    'TASK': {'icon': Icons.assignment, 'color': Color(0xFF3B4436), 'label': 'Tarea'},
    'ALERT': {'icon': Icons.warning_amber, 'color': Color(0xFFE07A5F), 'label': 'Alerta'},
  };

  static const _priorityConfig = {
    'HIGH': {'color': Color(0xFFF2CC8F), 'label': 'Alta'},
    'URGENT': {'color': Color(0xFFE07A5F), 'label': 'Urgente'},
  };

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final list = await widget.repo.fetchMyAnnouncements();
      if (mounted) setState(() { _announcements = list; _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = e.toString(); _loading = false; });
    }
  }

  Future<void> _markRead(Announcement ann) async {
    if (ann.read) return;
    await widget.repo.markAsRead(ann.id);
    setState(() {
        final idx = _announcements.indexWhere((a) => a.id == ann.id);
        if (idx >= 0) {
          _announcements[idx] = Announcement(
            id: ann.id, title: ann.title, description: ann.description,
            type: ann.type, priority: ann.priority, eventDate: ann.eventDate,
            eventEndDate: ann.eventEndDate, courseId: ann.courseId,
            courseName: ann.courseName, createdByName: ann.createdByName,
            createdAt: ann.createdAt, recipientCount: ann.recipientCount, read: true,
            schedules: ann.schedules,
          );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    final tt = theme.textTheme;

    return CustomScrollView(
      slivers: [
        _buildHeader(cs, tt),
        if (_loading)
          const SliverFillRemaining(child: Center(child: CircularProgressIndicator()))
        else if (_error != null)
          SliverFillRemaining(child: _buildError(cs))
        else if (_announcements.isEmpty)
          SliverFillRemaining(child: _buildEmpty(cs, tt))
        else
          ..._announcements.map((a) => _buildAnnouncementCard(a, cs, tt)),
        const SliverToBoxAdapter(child: SizedBox(height: 24)),
      ],
    );
  }

  Widget _buildHeader(ColorScheme cs, TextTheme tt) {
    final unread = _announcements.where((a) => !a.read).length;
    return SliverToBoxAdapter(
      child: Container(
        margin: const EdgeInsets.fromLTRB(16, 16, 16, 8),
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFFE07A5F), Color(0xFF81B29A)],
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
                  child: const Icon(Icons.campaign, color: Colors.white, size: 28),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Anuncios',
                        style: tt.headlineSmall?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${_announcements.length} anuncio(s) · $unread sin leer',
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

  Widget _buildError(ColorScheme cs) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.cloud_off_rounded, size: 64, color: cs.error),
            const SizedBox(height: 16),
            Text('Error al cargar anuncios', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
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
            Icon(Icons.campaign_outlined, size: 64, color: cs.outline),
            const SizedBox(height: 16),
            Text('Sin anuncios', style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Text('No hay anuncios disponibles', style: tt.bodyMedium?.copyWith(color: cs.onSurfaceVariant)),
          ],
        ),
      ),
    );
  }

  Widget _buildAnnouncementCard(Announcement ann, ColorScheme cs, TextTheme tt) {
    final typeCfg = _typeConfig[ann.type] ?? _typeConfig['EVENT']!;
    final priorityCfg = _priorityConfig[ann.priority];

    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        child: GestureDetector(
          onTap: () => _markRead(ann),
          child: Container(
            decoration: BoxDecoration(
              color: cs.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: ann.read
                    ? cs.outlineVariant.withValues(alpha: 0.5)
                    : typeCfg['color'] as Color,
                width: ann.read ? 1 : 2,
              ),
            ),
            child: IntrinsicHeight(
              child: Row(
                children: [
                  Container(
                    width: 5,
                    decoration: BoxDecoration(
                      color: typeCfg['color'] as Color,
                      borderRadius: const BorderRadius.horizontal(left: Radius.circular(16)),
                    ),
                  ),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: (typeCfg['color'] as Color).withValues(alpha: 0.12),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(typeCfg['icon'] as IconData, size: 14, color: typeCfg['color'] as Color),
                                    const SizedBox(width: 4),
                                    Text(
                                      typeCfg['label'] as String,
                                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: typeCfg['color'] as Color),
                                    ),
                                  ],
                                ),
                              ),
                              if (priorityCfg != null) ...[
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: (priorityCfg['color'] as Color).withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    priorityCfg['label'] as String,
                                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: (priorityCfg['color'] as Color)),
                                  ),
                                ),
                              ],
                              if (ann.courseName != null) ...[
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: cs.secondaryContainer,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(ann.courseName!, style: TextStyle(fontSize: 10, color: cs.onSecondaryContainer)),
                                ),
                              ] else ...[
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: cs.tertiaryContainer,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text('General', style: TextStyle(fontSize: 10, color: cs.onTertiaryContainer)),
                                ),
                              ],
                              if (!ann.read) ...[
                                const SizedBox(width: 8),
                                Container(
                                  width: 8,
                                  height: 8,
                                  decoration: const BoxDecoration(
                                    color: Colors.red,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                              ],
                            ],
                          ),
                          const SizedBox(height: 10),
                          Text(
                            ann.title,
                            style: tt.bodyLarge?.copyWith(fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            ann.description,
                            style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 8),
                          _buildScheduleInfo(ann, cs, tt),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              Icon(Icons.person_outline, size: 12, color: cs.onSurfaceVariant),
                              const SizedBox(width: 4),
                              Text(ann.createdByName, style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant, fontSize: 11)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildScheduleInfo(Announcement ann, ColorScheme cs, TextTheme tt) {
    if (ann.schedules.isNotEmpty) {
      final grouped = <int, List<AnnouncementScheduleItem>>{};
      for (final s in ann.schedules) {
        grouped.putIfAbsent(s.weekday, () => []).add(s);
      }
      final sortedKeys = grouped.keys.toList()..sort();
      return Wrap(
        spacing: 6,
        runSpacing: 4,
        children: [
          for (final weekday in sortedKeys)
            ...grouped[weekday]!.map((s) => Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: cs.primaryContainer.withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                '${s.weekdayLabel} ${s.blockLabel}',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: cs.onPrimaryContainer),
              ),
            )),
        ],
      );
    }
    if (ann.eventDate != null) {
      return Row(
        children: [
          Icon(Icons.calendar_today, size: 12, color: cs.onSurfaceVariant),
          const SizedBox(width: 4),
          Text(ann.eventDate!, style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant, fontSize: 11)),
        ],
      );
    }
    return const SizedBox.shrink();
  }
}
