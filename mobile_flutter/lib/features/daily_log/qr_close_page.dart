import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../auth/auth_repository.dart';
import 'daily_log_repository.dart';
import 'models.dart';

class QrClosePage extends StatefulWidget {
  const QrClosePage({
    super.key,
    required this.repository,
    required this.authRepository,
  });

  final DailyLogRepository repository;
  final AuthRepository authRepository;

  @override
  State<QrClosePage> createState() => _QrClosePageState();
}

class _QrClosePageState extends State<QrClosePage> {
  final MobileScannerController _scannerController = MobileScannerController();
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _codeController = TextEditingController();
  final TextEditingController _notesController = TextEditingController();

  MobileCloseAction? _action;
  MobileCloseSummary? _summary;
  bool _loading = false;
  bool _submitting = false;
  String? _message;
  bool _success = false;

  @override
  void initState() {
    super.initState();
    _loadSession();
  }

  Future<void> _loadSession() async {
    final session = await widget.authRepository.readSession();
    if (!mounted) return;
    setState(() {
      _usernameController.text = session?.username ?? '';
    });
  }

  @override
  void dispose() {
    _scannerController.dispose();
    _usernameController.dispose();
    _codeController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _handleScan(String rawValue) async {
    if (_action != null || _loading) {
      return;
    }

    setState(() {
      _loading = true;
      _message = null;
      _success = false;
    });

    try {
      await _scannerController.stop();
      final action = widget.repository.parseQrPayload(rawValue);
      final summary = await widget.repository.fetchCloseSummary(action);
      if (!mounted) return;
      setState(() {
        _action = action;
        _summary = summary;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _message = error.toString().replaceFirst('Exception: ', '');
      });
      await _scannerController.start();
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _submit() async {
    final action = _action;
    if (action == null) {
      return;
    }

    setState(() {
      _submitting = true;
      _message = null;
      _success = false;
    });

    try {
      final summary = await widget.repository.submitCloseAction(
        action: action,
        username: _usernameController.text,
        code: _codeController.text,
        notes: _notesController.text,
      );
      if (!mounted) return;
      setState(() {
        _summary = summary;
        _success = true;
        _message = _successLabel(summary.mode);
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _message = error.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (mounted) {
        setState(() => _submitting = false);
      }
    }
  }

  Future<void> _resetScanner() async {
    setState(() {
      _action = null;
      _summary = null;
      _message = null;
      _success = false;
      _codeController.clear();
      _notesController.clear();
    });
    await _scannerController.start();
  }

  Color _messageColor() {
    return _success ? const Color(0xFF18794E) : const Color(0xFFB42318);
  }

  Color _summaryAccent(MobileCloseSummary summary) {
    return summary.isCompleted ? const Color(0xFF18794E) : const Color(0xFFB54708);
  }

  @override
  Widget build(BuildContext context) {
    final summary = _summary;
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Validación con QR'),
        actions: [
          if (_action != null) IconButton(onPressed: _resetScanner, icon: const Icon(Icons.qr_code_scanner)),
        ],
      ),
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
                  'Cierres y firmas',
                  style: theme.textTheme.headlineSmall?.copyWith(color: Colors.white),
                ),
                const SizedBox(height: 8),
                Text(
                  'Escanea el código del bloque o del leccionario para validar el cierre desde el móvil.',
                  style: theme.textTheme.bodyLarge?.copyWith(color: const Color(0xFFDDF4EF)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          if (_message != null)
            Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: _messageColor().withValues(alpha: 0.10),
                borderRadius: BorderRadius.circular(18),
              ),
              child: Text(_message!, style: TextStyle(color: _messageColor(), fontWeight: FontWeight.w600)),
            ),
          if (_action == null) ...[
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(24),
                      child: SizedBox(
                        height: 320,
                        child: MobileScanner(
                          controller: _scannerController,
                          onDetect: (capture) {
                            final rawValue = capture.barcodes.first.rawValue;
                            if (rawValue != null) {
                              _handleScan(rawValue);
                            }
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Row(
                      children: [
                        Icon(Icons.qr_code_2_rounded, color: Color(0xFF0F766E)),
                        SizedBox(width: 10),
                        Expanded(
                          child: Text('Apunta la cámara al QR de cierre de clase, firma o cierre diario.'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ] else if (summary != null) ...[
            Card(
              child: Padding(
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: _summaryAccent(summary).withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Icon(
                            summary.isCompleted ? Icons.verified_rounded : Icons.timelapse_rounded,
                            color: _summaryAccent(summary),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(summary.courseName, style: theme.textTheme.titleLarge),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    const SizedBox(height: 4),
                    Text('Fecha: ${DateFormat('dd/MM/yyyy').format(DateTime.parse(summary.logDate))}'),
                    if (summary.scheduleLabel != null) ...[
                      const SizedBox(height: 8),
                      Text('${summary.scheduleLabel} - ${summary.subjectName ?? 'Sin asignatura'}'),
                    ],
                    if (summary.teacherName != null) ...[
                      const SizedBox(height: 4),
                      Text(summary.teacherName!),
                    ],
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                      decoration: BoxDecoration(
                        color: _summaryAccent(summary).withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        _statusLabel(summary),
                        style: TextStyle(
                          color: _summaryAccent(summary),
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            if (!summary.isCompleted) ...[
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(18),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Validar identidad', style: theme.textTheme.titleMedium),
                      const SizedBox(height: 14),
                      TextField(
                        controller: _usernameController,
                        decoration: const InputDecoration(
                          labelText: 'Usuario',
                          prefixIcon: Icon(Icons.person_outline),
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _codeController,
                        decoration: const InputDecoration(
                          labelText: 'Código institucional',
                          prefixIcon: Icon(Icons.password_rounded),
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _notesController,
                        minLines: 2,
                        maxLines: 4,
                        decoration: const InputDecoration(
                          labelText: 'Observación',
                          prefixIcon: Icon(Icons.notes_outlined),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: _submitting ? null : _submit,
                child: _submitting
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : Text(_actionLabel(summary.mode)),
              ),
            ] else
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      const Icon(Icons.verified_rounded, color: Color(0xFF18794E)),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Este cierre ya fue completado anteriormente.',
                          style: theme.textTheme.bodyLarge,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ],
      ),
    );
  }

  String _statusLabel(MobileCloseSummary summary) {
    switch (summary.mode) {
      case MobileCloseMode.entry:
        return summary.teacherSignatureStatus == 'SIGNED'
            ? 'Estado: clase cerrada'
            : 'Estado: pendiente de cierre docente';
      case MobileCloseMode.signature:
        return summary.signedAt != null
            ? 'Estado: firma registrada'
            : 'Estado: firma pendiente';
      case MobileCloseMode.log:
        return summary.status == 'CLOSED' || summary.status == 'SIGNED'
            ? 'Estado: leccionario cerrado'
            : 'Estado: pendiente de cierre';
    }
  }

  String _actionLabel(MobileCloseMode mode) {
    switch (mode) {
      case MobileCloseMode.entry:
        return 'Cerrar clase';
      case MobileCloseMode.signature:
        return 'Registrar firma';
      case MobileCloseMode.log:
        return 'Cerrar leccionario';
    }
  }

  String _successLabel(MobileCloseMode mode) {
    switch (mode) {
      case MobileCloseMode.entry:
        return 'La clase se cerro correctamente.';
      case MobileCloseMode.signature:
        return 'La firma se registro correctamente.';
      case MobileCloseMode.log:
        return 'El leccionario se cerro correctamente.';
    }
  }
}
