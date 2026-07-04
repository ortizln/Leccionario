import 'package:flutter/material.dart';

import '../announcements/announcement_repository.dart';
import '../announcements/announcements_page.dart';
import '../auth/auth_repository.dart';
import 'courses_page.dart';
import 'journal_page.dart';
import 'schedule_page.dart';
import 'teacher_repository.dart';

class TeacherShell extends StatefulWidget {
  final AuthRepository authRepository;
  final VoidCallback onLogout;
  final void Function(BuildContext) onOpenSettings;

  const TeacherShell({
    super.key,
    required this.authRepository,
    required this.onLogout,
    required this.onOpenSettings,
  });

  @override
  State<TeacherShell> createState() => _TeacherShellState();
}

class _TeacherShellState extends State<TeacherShell> {
  late final TeacherRepository _repo;
  late final AnnouncementRepository _announcementRepo;
  int _currentIndex = 0;
  int _unreadCount = 0;

  @override
  void initState() {
    super.initState();
    _repo = TeacherRepository(auth: widget.authRepository);
    _announcementRepo = AnnouncementRepository(auth: widget.authRepository);
    _loadUnreadCount();
  }

  Future<void> _loadUnreadCount() async {
    try {
      final count = await _announcementRepo.fetchUnreadCount();
      if (mounted) setState(() => _unreadCount = count);
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: [
          SchedulePage(repo: _repo, announcementRepo: _announcementRepo),
          JournalPage(repo: _repo),
          CoursesPage(repo: _repo),
          AnnouncementsPage(repo: _announcementRepo),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (i) {
          setState(() => _currentIndex = i);
          if (i == 3) _loadUnreadCount();
        },
        backgroundColor: cs.surface,
        indicatorColor: cs.primaryContainer,
        height: 72,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        destinations: [
          const NavigationDestination(
            icon: Icon(Icons.calendar_view_week_outlined),
            selectedIcon: Icon(Icons.calendar_view_week),
            label: 'Horario',
          ),
          const NavigationDestination(
            icon: Icon(Icons.menu_book_outlined),
            selectedIcon: Icon(Icons.menu_book),
            label: 'Leccionario',
          ),
          const NavigationDestination(
            icon: Icon(Icons.school_outlined),
            selectedIcon: Icon(Icons.school),
            label: 'Cursos',
          ),
          NavigationDestination(
            icon: Badge(
              isLabelVisible: _unreadCount > 0,
              label: Text('$_unreadCount', style: const TextStyle(fontSize: 10)),
              child: const Icon(Icons.notifications_outlined),
            ),
            selectedIcon: Badge(
              isLabelVisible: _unreadCount > 0,
              label: Text('$_unreadCount', style: const TextStyle(fontSize: 10)),
              child: const Icon(Icons.notifications),
            ),
            label: 'Anuncios',
          ),
        ],
      ),
    );
  }
}
