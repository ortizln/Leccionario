import 'package:flutter/material.dart';

import 'daily_log_repository.dart';
import 'models.dart';

class EntryPage extends StatefulWidget {
  const EntryPage({
    super.key,
    required this.entry,
    required this.repository,
  });

  final MobileTodayEntry entry;
  final DailyLogRepository repository;

  @override
  State<EntryPage> createState() => _EntryPageState();
}

class _EntryPageState extends State<EntryPage> {
  late TextEditingController _didacticUnitController;
  late TextEditingController _skillController;
  late TextEditingController _topicController;
  late TextEditingController _specificNotesController;
  late TextEditingController _generalNotesController;
  late TextEditingController _absenceSearchController;
  late TextEditingController _incidentSearchController;
  late List<AbsenceDraft> _absenceDrafts;
  late List<IncidentDraft> _incidentDrafts;
  int? _selectedAbsenceStudentId;
  int? _selectedIncidentStudentId;
  bool _signed = false;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    final entry = widget.entry;
    _didacticUnitController = TextEditingController(text: entry.didacticUnit ?? '');
    _skillController = TextEditingController(text: entry.curricularSkill ?? '');
    _topicController = TextEditingController(text: entry.topic ?? '');
    _specificNotesController = TextEditingController(text: entry.specificNotes ?? '');
    _generalNotesController = TextEditingController(text: entry.generalNotes ?? '');
    _absenceSearchController = TextEditingController();
    _incidentSearchController = TextEditingController();
    _signed = entry.teacherSignatureStatus == 'SIGNED';
    _absenceDrafts = entry.students.map((student) {
      final existing = entry.absences.where((item) => item.studentId == student.id).firstOrNull;
      return AbsenceDraft(
        studentId: student.id,
        label: '${student.enrollmentNumber} - ${student.fullName}',
        selected: existing != null,
        absenceType: existing?.absenceType ?? 'ABSENT',
        notes: existing?.notes ?? '',
      );
    }).toList();
    _incidentDrafts = entry.students.map((student) {
      final existing = entry.incidents.where((item) => item.studentId == student.id).firstOrNull;
      return IncidentDraft(
        studentId: student.id,
        label: '${student.enrollmentNumber} - ${student.fullName}',
        selected: existing != null,
        demeritId: existing?.demeritId,
        category: existing?.category ?? 'DISCIPLINA',
        notes: existing?.notes ?? '',
      );
    }).toList();
  }

  @override
  void dispose() {
    _didacticUnitController.dispose();
    _skillController.dispose();
    _topicController.dispose();
    _specificNotesController.dispose();
    _generalNotesController.dispose();
    _absenceSearchController.dispose();
    _incidentSearchController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    final updated = widget.entry.copyWith(
      didacticUnit: _nullIfEmpty(_didacticUnitController.text),
      curricularSkill: _nullIfEmpty(_skillController.text),
      topic: _nullIfEmpty(_topicController.text),
      specificNotes: _nullIfEmpty(_specificNotesController.text),
      generalNotes: _nullIfEmpty(_generalNotesController.text),
      teacherSignatureStatus: _signed ? 'SIGNED' : 'PENDING',
      absences: _absenceDrafts
          .where((item) => item.selected)
          .map(
            (item) => AbsenceItem(
              studentId: item.studentId,
              studentName: '',
              enrollmentNumber: '',
              absenceType: item.absenceType,
              notes: _nullIfEmpty(item.notes),
            ),
          )
          .toList(),
      incidents: _incidentDrafts
          .where((item) => item.selected)
          .map(
            (item) => IncidentItem(
              studentId: item.studentId,
              studentName: '',
              enrollmentNumber: '',
              demeritId: item.demeritId,
              demeritCode: _findDemerit(item.demeritId)?.code,
              demeritCategory: _findDemerit(item.demeritId)?.category,
              demeritDescription: _findDemerit(item.demeritId)?.description,
              demeritScore: _findDemerit(item.demeritId)?.score,
              category: item.category,
              notes: _nullIfEmpty(item.notes),
            ),
          )
          .toList(),
    );

    await widget.repository.saveEntryFields(updated);
    await widget.repository.saveAbsences(updated);
    await widget.repository.saveIncidents(updated);

    if (mounted) {
      setState(() => _saving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cambios guardados localmente. Se sincronizaran cuando haya conexion.')),
      );
    }
  }

  Color get _statusColor => _signed ? const Color(0xFF18794E) : const Color(0xFFB54708);

  String get _statusLabel => _signed ? 'Bloque cerrado' : 'Pendiente de cierre';

  List<AbsenceDraft> get _activeAbsenceDrafts => _absenceDrafts.where((item) => item.selected).toList();

  List<IncidentDraft> get _activeIncidentDrafts => _incidentDrafts.where((item) => item.selected).toList();

  List<AbsenceDraft> get _availableAbsenceDrafts =>
      _filterDrafts(_absenceDrafts.where((item) => !item.selected).toList(), _absenceSearchController.text);

  List<IncidentDraft> get _availableIncidentDrafts =>
      _filterDrafts(_incidentDrafts.where((item) => !item.selected).toList(), _incidentSearchController.text);

  List<T> _filterDrafts<T extends _BaseStudentDraft>(List<T> drafts, String query) {
    final normalized = query.trim().toLowerCase();
    if (normalized.isEmpty) {
      return drafts;
    }
    return drafts.where((draft) => draft.label.toLowerCase().contains(normalized)).toList();
  }

  void _addAbsenceDraft() {
    final studentId = _selectedAbsenceStudentId;
    if (studentId == null) return;
    final draft = _absenceDrafts.where((item) => item.studentId == studentId).firstOrNull;
    if (draft == null) return;
    setState(() {
      draft.selected = true;
      _selectedAbsenceStudentId = null;
      _absenceSearchController.clear();
    });
  }

  void _removeAbsenceDraft(AbsenceDraft draft) {
    setState(() {
      draft.selected = false;
      draft.absenceType = 'ABSENT';
      draft.notes = '';
    });
  }

  void _addIncidentDraft() {
    final studentId = _selectedIncidentStudentId;
    if (studentId == null) return;
    final draft = _incidentDrafts.where((item) => item.studentId == studentId).firstOrNull;
    if (draft == null) return;
    setState(() {
      draft.selected = true;
      _selectedIncidentStudentId = null;
      _incidentSearchController.clear();
    });
  }

  void _removeIncidentDraft(IncidentDraft draft) {
    setState(() {
      draft.selected = false;
      draft.demeritId = null;
      draft.category = 'DISCIPLINA';
      draft.notes = '';
    });
  }

  Future<void> _applyIncidentToGroup() async {
    final available = _incidentDrafts.where((d) => !d.selected).toList();
    if (available.isEmpty) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Todos los estudiantes ya tienen novedad registrada.')),
        );
      }
      return;
    }

    final result = await showModalBottomSheet<_GroupIncidentResult>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (context) => _GroupIncidentSheet(
        students: available,
        demerits: widget.entry.demerits,
      ),
    );

    if (result == null || result.studentIds.isEmpty) return;

    setState(() {
      for (final draft in _incidentDrafts) {
        if (result.studentIds.contains(draft.studentId)) {
          draft.selected = true;
          draft.demeritId = result.demeritId;
          draft.category = result.category;
          draft.notes = result.notes;
        }
      }
    });

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Novedad aplicada a ${result.studentIds.length} estudiante(s).')),
      );
    }
  }

  DemeritOption? _findDemerit(int? demeritId) {
    if (demeritId == null) {
      return null;
    }
    return widget.entry.demerits.where((item) => item.id == demeritId).firstOrNull;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Editar bloque')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.fromLTRB(22, 22, 22, 18),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF123C36), Color(0xFF0F766E)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(30),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.entry.courseName,
                  style: theme.textTheme.headlineSmall?.copyWith(color: Colors.white),
                ),
                const SizedBox(height: 8),
                Text(
                  widget.entry.subjectName ?? 'Sin asignatura',
                  style: theme.textTheme.titleMedium?.copyWith(color: const Color(0xFFDDF4EF)),
                ),
                const SizedBox(height: 8),
                Text(
                  '${widget.entry.scheduleLabel} · ${widget.entry.startTime} - ${widget.entry.endTime}',
                  style: theme.textTheme.bodyLarge?.copyWith(color: const Color(0xFFDDF4EF)),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.14),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        _signed ? Icons.verified_rounded : Icons.pending_actions_rounded,
                        color: Colors.white,
                        size: 18,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        _statusLabel,
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          _SectionCard(
            title: 'Planificación',
            icon: Icons.edit_note_rounded,
            child: Column(
              children: [
                TextField(
                  controller: _didacticUnitController,
                  decoration: const InputDecoration(
                    labelText: 'Unidad didáctica',
                    prefixIcon: Icon(Icons.book_outlined),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _skillController,
                  decoration: const InputDecoration(
                    labelText: 'Destreza con criterio',
                    prefixIcon: Icon(Icons.psychology_alt_outlined),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _topicController,
                  decoration: const InputDecoration(
                    labelText: 'Tema',
                    prefixIcon: Icon(Icons.topic_outlined),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _specificNotesController,
                  minLines: 2,
                  maxLines: 4,
                  decoration: const InputDecoration(
                    labelText: 'Observaciones específicas',
                    prefixIcon: Icon(Icons.sticky_note_2_outlined),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _generalNotesController,
                  minLines: 2,
                  maxLines: 4,
                  decoration: const InputDecoration(
                    labelText: 'Observaciones generales',
                    prefixIcon: Icon(Icons.notes_outlined),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          _SectionCard(
            title: 'Cierre del bloque',
            icon: Icons.task_alt_rounded,
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: _statusColor.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(22),
              ),
              child: SwitchListTile(
                contentPadding: EdgeInsets.zero,
                value: _signed,
                title: Text(
                  'Marcar bloque como cerrado',
                  style: theme.textTheme.titleMedium,
                ),
                subtitle: Text(
                  _signed
                      ? 'Este bloque quedará listo para el cierre diario.'
                      : 'Puedes seguir completándolo antes de cerrarlo.',
                ),
                activeThumbColor: const Color(0xFF18794E),
                onChanged: (value) => setState(() => _signed = value),
              ),
            ),
          ),
          const SizedBox(height: 16),
          _SectionCard(
            title: 'Inasistencias',
            icon: Icons.person_off_outlined,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Selecciona un estudiante y completa el registro de inasistencia.',
                  style: theme.textTheme.bodyMedium?.copyWith(color: const Color(0xFF667A72)),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _absenceSearchController,
                  onChanged: (_) => setState(() => _selectedAbsenceStudentId = null),
                  decoration: const InputDecoration(
                    labelText: 'Buscar por matrícula o nombre',
                    prefixIcon: Icon(Icons.search_rounded),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<int>(
                        initialValue: _selectedAbsenceStudentId,
                        decoration: const InputDecoration(
                          labelText: 'Estudiante',
                          prefixIcon: Icon(Icons.people_alt_outlined),
                        ),
                        items: _availableAbsenceDrafts
                            .map(
                              (draft) => DropdownMenuItem<int>(
                                value: draft.studentId,
                                child: Text(draft.label, overflow: TextOverflow.ellipsis),
                              ),
                            )
                            .toList(),
                        onChanged: _availableAbsenceDrafts.isEmpty
                            ? null
                            : (value) => setState(() => _selectedAbsenceStudentId = value),
                      ),
                    ),
                    const SizedBox(width: 12),
                    FilledButton.tonal(
                      onPressed: _selectedAbsenceStudentId == null ? null : _addAbsenceDraft,
                      child: const Text('Agregar'),
                    ),
                  ],
                ),
                if (_activeAbsenceDrafts.isEmpty) ...[
                  const SizedBox(height: 14),
                  const Text('Todavía no hay estudiantes añadidos en inasistencias.'),
                ],
                for (final draft in _activeAbsenceDrafts) ...[
                  const SizedBox(height: 12),
                  _DraftFormCard(
                    title: draft.label,
                    accentColor: const Color(0xFFB54708),
                    onRemove: () => _removeAbsenceDraft(draft),
                    child: Column(
                      children: [
                        DropdownButtonFormField<String>(
                          initialValue: draft.absenceType,
                          decoration: const InputDecoration(labelText: 'Tipo de inasistencia'),
                          items: const [
                            DropdownMenuItem(value: 'ABSENT', child: Text('Inasistencia')),
                            DropdownMenuItem(value: 'LATE', child: Text('Atraso')),
                            DropdownMenuItem(value: 'JUSTIFIED', child: Text('Justificada')),
                          ],
                          onChanged: (value) => setState(() => draft.absenceType = value ?? 'ABSENT'),
                        ),
                        const SizedBox(height: 8),
                        TextFormField(
                          initialValue: draft.notes,
                          decoration: const InputDecoration(labelText: 'Detalle'),
                          onChanged: (value) => draft.notes = value,
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 24),
          _SectionCard(
            title: 'Novedades',
            icon: Icons.campaign_outlined,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Añade solo los estudiantes con una novedad para este bloque.',
                  style: theme.textTheme.bodyMedium?.copyWith(color: const Color(0xFF667A72)),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: _applyIncidentToGroup,
                    icon: const Icon(Icons.group_add_outlined, size: 20),
                    label: const Text('Aplicar novedad a grupo'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      side: const BorderSide(color: Color(0xFF0F766E)),
                      foregroundColor: const Color(0xFF0F766E),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                const Divider(),
                const SizedBox(height: 8),
                Text(
                  'O agrega individualmente:',
                  style: theme.textTheme.bodySmall?.copyWith(color: const Color(0xFF667A72)),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _incidentSearchController,
                  onChanged: (_) => setState(() => _selectedIncidentStudentId = null),
                  decoration: const InputDecoration(
                    labelText: 'Buscar por matrícula o nombre',
                    prefixIcon: Icon(Icons.search_rounded),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<int>(
                        initialValue: _selectedIncidentStudentId,
                        decoration: const InputDecoration(
                          labelText: 'Estudiante',
                          prefixIcon: Icon(Icons.people_alt_outlined),
                        ),
                        items: _availableIncidentDrafts
                            .map(
                              (draft) => DropdownMenuItem<int>(
                                value: draft.studentId,
                                child: Text(draft.label, overflow: TextOverflow.ellipsis),
                              ),
                            )
                            .toList(),
                        onChanged: _availableIncidentDrafts.isEmpty
                            ? null
                            : (value) => setState(() => _selectedIncidentStudentId = value),
                      ),
                    ),
                    const SizedBox(width: 12),
                    FilledButton.tonal(
                      onPressed: _selectedIncidentStudentId == null ? null : _addIncidentDraft,
                      child: const Text('Agregar'),
                    ),
                  ],
                ),
                if (_activeIncidentDrafts.isEmpty) ...[
                  const SizedBox(height: 14),
                  const Text('Todavía no hay estudiantes añadidos en novedades.'),
                ],
                for (final draft in _activeIncidentDrafts) ...[
                  const SizedBox(height: 12),
                  _DraftFormCard(
                    title: draft.label,
                    accentColor: const Color(0xFF0F766E),
                    onRemove: () => _removeIncidentDraft(draft),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (widget.entry.demerits.isNotEmpty) ...[
                          DropdownButtonFormField<int?>(
                            initialValue: draft.demeritId,
                            decoration: const InputDecoration(labelText: 'Demérito'),
                            items: [
                              const DropdownMenuItem<int?>(
                                value: null,
                                child: Text('Sin demérito del catálogo'),
                              ),
                              ...widget.entry.demerits.map(
                                (demerit) => DropdownMenuItem<int?>(
                                  value: demerit.id,
                                  child: Text(demerit.label, overflow: TextOverflow.ellipsis),
                                ),
                              ),
                            ],
                            onChanged: (value) {
                              final selected = _findDemerit(value);
                              setState(() {
                                draft.demeritId = value;
                                if (selected != null) {
                                  draft.category = selected.category;
                                }
                              });
                            },
                          ),
                          if (_findDemerit(draft.demeritId) case final demerit?) ...[
                            const SizedBox(height: 10),
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: const Color(0xFFE8F4F1),
                                borderRadius: BorderRadius.circular(18),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '${demerit.category} · ${demerit.score} puntos',
                                    style: const TextStyle(fontWeight: FontWeight.w700),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(demerit.description),
                                ],
                              ),
                            ),
                          ],
                        ] else
                          TextFormField(
                            initialValue: draft.category,
                            decoration: const InputDecoration(labelText: 'Tipo de novedad'),
                            onChanged: (value) => draft.category = value,
                          ),
                        const SizedBox(height: 8),
                        TextFormField(
                          initialValue: draft.notes,
                          decoration: const InputDecoration(labelText: 'Detalle adicional'),
                          onChanged: (value) => draft.notes = value,
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: _saving ? null : _save,
            child: _saving
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  )
                : const Text('Guardar cambios offline'),
          ),
          const SizedBox(height: 12),
          Text(
            'Los cambios se guardan localmente y se sincronizan cuando vuelva la conexión.',
            textAlign: TextAlign.center,
            style: theme.textTheme.bodyMedium?.copyWith(color: const Color(0xFF667A72)),
          ),
        ],
      ),
    );
  }

  String? _nullIfEmpty(String value) {
    final trimmed = value.trim();
    return trimmed.isEmpty ? null : trimmed;
  }
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({
    required this.title,
    required this.icon,
    required this.child,
  });

  final String title;
  final IconData icon;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
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
                  child: Icon(icon, color: const Color(0xFF0F766E)),
                ),
                const SizedBox(width: 12),
                Text(title, style: Theme.of(context).textTheme.titleLarge),
              ],
            ),
            const SizedBox(height: 16),
            child,
          ],
        ),
      ),
    );
  }
}

class _DraftFormCard extends StatelessWidget {
  const _DraftFormCard({
    required this.title,
    required this.accentColor,
    required this.onRemove,
    required this.child,
  });

  final String title;
  final Color accentColor;
  final VoidCallback onRemove;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Card(
      color: accentColor.withValues(alpha: 0.08),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
                ),
                IconButton(
                  onPressed: onRemove,
                  icon: const Icon(Icons.close_rounded),
                  tooltip: 'Quitar',
                ),
              ],
            ),
            child,
          ],
        ),
      ),
    );
  }
}

class AbsenceDraft extends _BaseStudentDraft {
  AbsenceDraft({
    required super.studentId,
    required super.label,
    required this.selected,
    required this.absenceType,
    required this.notes,
  });

  bool selected;
  String absenceType;
  String notes;
}

class IncidentDraft extends _BaseStudentDraft {
  IncidentDraft({
    required super.studentId,
    required super.label,
    required this.selected,
    required this.demeritId,
    required this.category,
    required this.notes,
  });

  bool selected;
  int? demeritId;
  String category;
  String notes;
}

abstract class _BaseStudentDraft {
  const _BaseStudentDraft({
    required this.studentId,
    required this.label,
  });

  final int studentId;
  final String label;
}

class _GroupIncidentResult {
  _GroupIncidentResult({
    required this.studentIds,
    required this.demeritId,
    required this.category,
    required this.notes,
  });

  final List<int> studentIds;
  final int? demeritId;
  final String category;
  final String notes;
}

class _GroupIncidentSheet extends StatefulWidget {
  const _GroupIncidentSheet({
    required this.students,
    required this.demerits,
  });

  final List<IncidentDraft> students;
  final List<DemeritOption> demerits;

  @override
  State<_GroupIncidentSheet> createState() => _GroupIncidentSheetState();
}

class _GroupIncidentSheetState extends State<_GroupIncidentSheet> {
  final Set<int> _selectedIds = {};
  int? _selectedDemeritId;
  String _category = 'DISCIPLINA';
  final _notesController = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  List<IncidentDraft> get _filteredStudents {
    final q = _searchQuery.trim().toLowerCase();
    if (q.isEmpty) return widget.students;
    return widget.students.where((s) => s.label.toLowerCase().contains(q)).toList();
  }

  void _toggleAll() {
    setState(() {
      if (_selectedIds.length == widget.students.length) {
        _selectedIds.clear();
      } else {
        _selectedIds.addAll(widget.students.map((s) => s.studentId));
      }
    });
  }

  void _submit() {
    final demerit = widget.demerits.cast<DemeritOption?>().firstWhere(
      (d) => d?.id == _selectedDemeritId,
      orElse: () => null,
    );
    Navigator.of(context).pop(_GroupIncidentResult(
      studentIds: _selectedIds.toList(),
      demeritId: _selectedDemeritId,
      category: demerit?.category ?? _category,
      notes: _notesController.text.trim(),
    ));
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final mediaQuery = MediaQuery.of(context);
    final bottomPadding = mediaQuery.viewInsets.bottom;

    return Container(
      height: mediaQuery.size.height * 0.75,
      decoration: BoxDecoration(
        color: theme.scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        children: [
          Container(
            margin: const EdgeInsets.only(top: 12),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: theme.colorScheme.onSurface.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F766E).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.group_add_outlined, color: Color(0xFF0F766E), size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Aplicar novedad a grupo', style: theme.textTheme.titleLarge),
                      Text(
                        '${_selectedIds.length} de ${widget.students.length} seleccionados',
                        style: theme.textTheme.bodySmall?.copyWith(color: const Color(0xFF667A72)),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(Icons.close_rounded),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              children: [
                if (widget.demerits.isNotEmpty) ...[
                  DropdownButtonFormField<int?>(
                    initialValue: _selectedDemeritId,
                    decoration: const InputDecoration(
                      labelText: 'Demérito del catálogo',
                      prefixIcon: Icon(Icons.gavel_outlined),
                    ),
                    items: [
                      const DropdownMenuItem<int?>(
                        value: null,
                        child: Text('Sin demérito del catálogo'),
                      ),
                      ...widget.demerits.map(
                        (d) => DropdownMenuItem<int?>(
                          value: d.id,
                          child: Text(d.label, overflow: TextOverflow.ellipsis),
                        ),
                      ),
                    ],
                    onChanged: (value) {
                      final demerit = widget.demerits.cast<DemeritOption?>().firstWhere(
                        (d) => d?.id == value,
                        orElse: () => null,
                      );
                      setState(() {
                        _selectedDemeritId = value;
                        if (demerit != null) _category = demerit.category;
                      });
                    },
                  ),
                ],
                const SizedBox(height: 12),
                TextField(
                  controller: _notesController,
                  maxLines: 2,
                  decoration: const InputDecoration(
                    labelText: 'Observación (común para todos)',
                    prefixIcon: Icon(Icons.notes_outlined),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: TextField(
              onChanged: (v) => setState(() => _searchQuery = v),
              decoration: const InputDecoration(
                hintText: 'Buscar estudiante...',
                prefixIcon: Icon(Icons.search_rounded),
                isDense: true,
              ),
            ),
          ),
          const SizedBox(height: 4),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: _toggleAll,
                child: Text(
                  _selectedIds.length == widget.students.length
                      ? 'Ninguno'
                      : 'Todos',
                ),
              ),
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: EdgeInsets.fromLTRB(20, 0, 20, bottomPadding + 100),
              itemCount: _filteredStudents.length,
              itemBuilder: (context, index) {
                final student = _filteredStudents[index];
                final isSelected = _selectedIds.contains(student.studentId);
                return CheckboxListTile(
                  value: isSelected,
                  onChanged: (checked) {
                    setState(() {
                      if (checked == true) {
                        _selectedIds.add(student.studentId);
                      } else {
                        _selectedIds.remove(student.studentId);
                      }
                    });
                  },
                  title: Text(
                    student.label,
                    style: const TextStyle(fontSize: 14),
                    overflow: TextOverflow.ellipsis,
                  ),
                  controlAffinity: ListTileControlAffinity.leading,
                  dense: true,
                  contentPadding: EdgeInsets.zero,
                );
              },
            ),
          ),
          Container(
            padding: EdgeInsets.fromLTRB(20, 12, 20, 16 + bottomPadding),
            decoration: BoxDecoration(
              color: theme.scaffoldBackgroundColor,
              border: Border(top: BorderSide(color: theme.dividerColor)),
            ),
            child: SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: _selectedIds.isEmpty ? null : _submit,
                child: Text('Aplicar a ${_selectedIds.length} estudiante(s)'),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

extension _FirstOrNullExtension<T> on Iterable<T> {
  T? get firstOrNull => isEmpty ? null : first;
}
