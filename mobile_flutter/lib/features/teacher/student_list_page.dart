import 'package:flutter/material.dart';

import 'models.dart';
import 'teacher_repository.dart';

class StudentListPage extends StatefulWidget {
  final TeacherRepository repo;
  final TeacherCourse course;

  const StudentListPage({
    super.key,
    required this.repo,
    required this.course,
  });

  @override
  State<StudentListPage> createState() => _StudentListPageState();
}

class _StudentListPageState extends State<StudentListPage> {
  List<TeacherStudent> _students = [];
  bool _loading = true;
  String? _error;
  String _search = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final students = await widget.repo.fetchCourseStudents(widget.course.courseId);
      if (mounted) setState(() { _students = students; _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = e.toString(); _loading = false; });
    }
  }

  List<TeacherStudent> get _filtered {
    if (_search.isEmpty) return _students;
    final q = _search.toLowerCase();
    return _students.where((s) =>
      s.fullName.toLowerCase().contains(q) ||
      (s.enrollmentNumber?.toLowerCase().contains(q) ?? false) ||
      (s.identification?.toLowerCase().contains(q) ?? false)
    ).toList();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    final tt = theme.textTheme;

    final students = _filtered;
    final maleCount = _students.where((s) => s.gender == 'MASCULINO').length;
    final femaleCount = _students.where((s) => s.gender == 'FEMENINO').length;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          _buildHeader(cs, tt, maleCount, femaleCount),
          _buildSearchBar(cs),
          if (_loading)
            const SliverFillRemaining(child: Center(child: CircularProgressIndicator()))
          else if (_error != null)
            SliverFillRemaining(child: _buildError(cs))
          else if (students.isEmpty && _search.isNotEmpty)
            SliverFillRemaining(child: _buildNoResults(cs, tt))
          else if (students.isEmpty)
            SliverFillRemaining(child: _buildEmpty(cs, tt))
          else
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (ctx, i) => _buildStudentCard(students[i], i, cs, tt),
                  childCount: students.length,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildHeader(ColorScheme cs, TextTheme tt, int maleCount, int femaleCount) {
    return SliverToBoxAdapter(
      child: Container(
        margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF606C56), Color(0xFF3B4436)],
          ),
          borderRadius: BorderRadius.circular(24),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
                  style: IconButton.styleFrom(
                    backgroundColor: Colors.white.withValues(alpha: 0.15),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.course.displayName,
                        style: tt.titleLarge?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (widget.course.levelDisplay.isNotEmpty)
                        Text(
                          widget.course.levelDisplay,
                          style: tt.bodySmall?.copyWith(
                            color: Colors.white.withValues(alpha: 0.8),
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                _buildMetricChip(Icons.people_rounded, '${_students.length} estudiantes', Colors.white),
                const SizedBox(width: 8),
                if (maleCount > 0)
                  _buildMetricChip(Icons.male_rounded, '$maleCount', Colors.white),
                if (maleCount > 0 && femaleCount > 0) const SizedBox(width: 8),
                if (femaleCount > 0)
                  _buildMetricChip(Icons.female_rounded, '$femaleCount', Colors.white),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricChip(IconData icon, String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(text, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: color)),
        ],
      ),
    );
  }

  Widget _buildSearchBar(ColorScheme cs) {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
        child: TextField(
          onChanged: (v) => setState(() => _search = v),
          decoration: InputDecoration(
            hintText: 'Buscar por nombre o matrícula...',
            prefixIcon: const Icon(Icons.search_rounded, size: 20),
            suffixIcon: _search.isNotEmpty
                ? IconButton(
                    onPressed: () => setState(() => _search = ''),
                    icon: const Icon(Icons.clear_rounded, size: 18),
                  )
                : null,
            filled: true,
            fillColor: cs.surfaceContainerHighest.withValues(alpha: 0.5),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide.none,
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide.none,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStudentCard(TeacherStudent student, int index, ColorScheme cs, TextTheme tt) {
    final genderColor = student.gender == 'MASCULINO'
        ? const Color(0xFF3D405B)
        : student.gender == 'FEMENINO'
            ? const Color(0xFFE07A5F)
            : cs.outline;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: cs.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cs.outlineVariant.withValues(alpha: 0.4)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [genderColor, genderColor.withValues(alpha: 0.7)],
                ),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Center(
                child: Text(
                  student.initials,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    student.fullName,
                    style: tt.bodyLarge?.copyWith(fontWeight: FontWeight.w600),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      if (student.enrollmentNumber != null && student.enrollmentNumber!.isNotEmpty) ...[
                        Icon(Icons.badge_rounded, size: 12, color: cs.onSurfaceVariant),
                        const SizedBox(width: 3),
                        Text(
                          student.enrollmentNumber!,
                          style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant, fontSize: 11),
                        ),
                        const SizedBox(width: 8),
                      ],
                      if (student.identification != null && student.identification!.isNotEmpty) ...[
                        Icon(Icons.credit_card_rounded, size: 12, color: cs.onSurfaceVariant),
                        const SizedBox(width: 3),
                        Text(
                          student.identification!,
                          style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant, fontSize: 11),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: student.enabled ? const Color(0xFF81B29A) : cs.error,
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
            const Text('Error al cargar estudiantes', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
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
            Icon(Icons.group_off_rounded, size: 64, color: cs.outline),
            const SizedBox(height: 16),
            Text('Sin estudiantes', style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Text('No hay estudiantes matriculados en este curso', style: tt.bodyMedium?.copyWith(color: cs.onSurfaceVariant)),
          ],
        ),
      ),
    );
  }

  Widget _buildNoResults(ColorScheme cs, TextTheme tt) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.search_off_rounded, size: 64, color: cs.outline),
            const SizedBox(height: 16),
            Text('Sin resultados', style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Text('No se encontraron estudiantes para "$_search"', style: tt.bodyMedium?.copyWith(color: cs.onSurfaceVariant)),
          ],
        ),
      ),
    );
  }
}
