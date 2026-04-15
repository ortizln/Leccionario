import 'package:flutter/material.dart';

import '../../core/config/app_config.dart';
import 'auth_repository.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({
    super.key,
    required this.authRepository,
    required this.onLoggedIn,
    required this.onOpenSettings,
    required this.onBrandingChanged,
  });

  final AuthRepository authRepository;
  final VoidCallback onLoggedIn;
  final Function(BuildContext) onOpenSettings;
  final VoidCallback onBrandingChanged;

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  List<InstitutionOption> _institutions = const [];
  String _selectedInstitutionCode = '';
  bool _loading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _selectedInstitutionCode = AppConfig.institutionCode;
    _loadInstitutions();
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      await widget.authRepository.login(
        username: _usernameController.text,
        password: _passwordController.text,
      );
      widget.onLoggedIn();
    } catch (error) {
      setState(() => _error = error.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _loadInstitutions() async {
    try {
      final institutions = await AppConfig.fetchInstitutions();
      if (!mounted) {
        return;
      }
      setState(() {
        _institutions = institutions;
        _selectedInstitutionCode = _selectedInstitutionCode.isNotEmpty
            ? _selectedInstitutionCode
            : (institutions.isNotEmpty ? institutions.first.code : '');
      });
      if (_selectedInstitutionCode.isNotEmpty) {
        await _applyInstitution(_selectedInstitutionCode);
      }
    } catch (_) {
      // Mantiene el login operativo aun si no se puede leer branding.
    }
  }

  Future<void> _applyInstitution(String code) async {
    await AppConfig.setInstitutionCode(code);
    await AppConfig.refreshBranding(code);
    if (mounted) {
      setState(() => _selectedInstitutionCode = code);
    }
    widget.onBrandingChanged();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final branding = AppConfig.branding;
    final logoUrl = branding?.loginLogoUrl ?? branding?.logoUrl;

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              branding?.backgroundColor ?? const Color(0xFFF5F8F2),
              branding?.accentColor.withValues(alpha: 0.45) ??
                  const Color(0xFFE3F0E8),
              branding?.surfaceColor ?? const Color(0xFFD8E7E3)
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SafeArea(
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(28),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Container(
                          width: 72,
                          height: 72,
                          decoration: BoxDecoration(
                            color: branding?.primaryColor ??
                                const Color(0xFF0F766E),
                            borderRadius: BorderRadius.circular(24),
                          ),
                          child: logoUrl != null && logoUrl.isNotEmpty
                              ? ClipRRect(
                                  borderRadius: BorderRadius.circular(24),
                                  child:
                                      Image.network(logoUrl, fit: BoxFit.cover),
                                )
                              : const Icon(Icons.menu_book_rounded,
                                  color: Colors.white, size: 34),
                        ),
                        const SizedBox(height: 20),
                        Text(branding?.mobileTitle ?? 'Leccionario Mobile',
                            style: theme.textTheme.headlineSmall),
                        const SizedBox(height: 8),
                        Text(
                          branding?.mobileSubtitle ??
                              'Consulta tu horario, registra novedades y cierra cada bloque desde una sola vista.',
                          style: theme.textTheme.bodyLarge?.copyWith(
                              color:
                                  branding?.textColor.withValues(alpha: 0.78) ??
                                      const Color(0xFF4D635A)),
                        ),
                        if (_institutions.length > 1) ...[
                          const SizedBox(height: 20),
                          DropdownButtonFormField<String>(
                            initialValue: _selectedInstitutionCode.isNotEmpty
                                ? _selectedInstitutionCode
                                : null,
                            items: _institutions
                                .map((institution) => DropdownMenuItem(
                                      value: institution.code,
                                      child: Text(institution.name),
                                    ))
                                .toList(),
                            onChanged: (value) {
                              if (value != null) {
                                _applyInstitution(value);
                              }
                            },
                            decoration: const InputDecoration(
                              labelText: 'Unidad educativa',
                              prefixIcon: Icon(Icons.apartment_outlined),
                            ),
                          ),
                        ],
                        const SizedBox(height: 24),
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: (branding?.accentColor ??
                                    const Color(0xFFEAF4EE))
                                .withValues(alpha: 0.32),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            children: [
                              Icon(Icons.verified_user_outlined,
                                  color: branding?.primaryColor ??
                                      const Color(0xFF0F766E)),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  branding?.loginHelperText ??
                                      'Usa tu cuenta institucional.',
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),
                        TextField(
                          controller: _usernameController,
                          decoration: const InputDecoration(
                            labelText: 'Usuario',
                            prefixIcon: Icon(Icons.person_outline),
                          ),
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          controller: _passwordController,
                          obscureText: true,
                          decoration: const InputDecoration(
                            labelText: 'Contraseña',
                            prefixIcon: Icon(Icons.lock_outline),
                          ),
                        ),
                        if (_error != null) ...[
                          const SizedBox(height: 16),
                          Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFEBEE),
                              borderRadius: BorderRadius.circular(18),
                            ),
                            child: Text(_error!,
                                style:
                                    const TextStyle(color: Color(0xFFB42318))),
                          ),
                        ],
                        const SizedBox(height: 24),
                        FilledButton(
                          onPressed: _loading ? null : _submit,
                          child: _loading
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                      strokeWidth: 2, color: Colors.white),
                                )
                              : const Text('Entrar al módulo'),
                        ),
                        const SizedBox(height: 12),
                        TextButton.icon(
                          onPressed: () => widget.onOpenSettings(context),
                          icon: const Icon(Icons.settings_outlined),
                          label: const Text('Configuración'),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
