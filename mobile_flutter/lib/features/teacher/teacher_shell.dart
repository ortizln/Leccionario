import 'package:flutter/material.dart';

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
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _repo = TeacherRepository(auth: widget.authRepository);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: [
          SchedulePage(repo: _repo),
          JournalPage(repo: _repo),
          CoursesPage(repo: _repo),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (i) => setState(() => _currentIndex = i),
        backgroundColor: cs.surface,
        indicatorColor: cs.primaryContainer,
        height: 72,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.calendar_view_week_outlined),
            selectedIcon: Icon(Icons.calendar_view_week),
            label: 'Horario',
          ),
          NavigationDestination(
            icon: Icon(Icons.menu_book_outlined),
            selectedIcon: Icon(Icons.menu_book),
            label: 'Leccionario',
          ),
          NavigationDestination(
            icon: Icon(Icons.school_outlined),
            selectedIcon: Icon(Icons.school),
            label: 'Cursos',
          ),
        ],
      ),
    );
  }
}
