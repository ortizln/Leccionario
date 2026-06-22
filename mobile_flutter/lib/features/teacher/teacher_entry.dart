import 'package:flutter/material.dart';

import '../auth/auth_repository.dart';
import 'teacher_shell.dart';

class TeacherEntryPoint extends StatelessWidget {
  final AuthRepository authRepository;
  final VoidCallback onLogout;
  final void Function(BuildContext) onOpenSettings;

  const TeacherEntryPoint({
    super.key,
    required this.authRepository,
    required this.onLogout,
    required this.onOpenSettings,
  });

  @override
  Widget build(BuildContext context) {
    return TeacherShell(
      authRepository: authRepository,
      onLogout: onLogout,
      onOpenSettings: onOpenSettings,
    );
  }
}
