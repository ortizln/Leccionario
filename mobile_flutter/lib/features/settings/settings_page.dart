import 'package:flutter/material.dart';

import '../../core/config/app_config.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({
    super.key,
    required this.initialApiBaseUrl,
    required this.initialThemeIndex,
    required this.onSaved,
  });

  final String initialApiBaseUrl;
  final int initialThemeIndex;
  final Future<void> Function(String apiBaseUrl, int themeIndex) onSaved;

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  late final TextEditingController _apiController;
  late int _selectedThemeIndex;
  bool _saving = false;
  bool _testingConnection = false;
  String? _message;
  bool _messageIsError = false;

  @override
  void initState() {
    super.initState();
    _apiController = TextEditingController(text: widget.initialApiBaseUrl);
    _selectedThemeIndex = widget.initialThemeIndex;
  }

  @override
  void dispose() {
    _apiController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() {
      _saving = true;
      _message = null;
      _messageIsError = false;
    });

    try {
      await widget.onSaved(_apiController.text, _selectedThemeIndex);
      setState(() => _message = 'Configuración guardada correctamente.');
    } catch (error) {
      setState(() {
        _message = 'Error al guardar la configuración.';
        _messageIsError = true;
      });
    } finally {
      if (mounted) {
        setState(() => _saving = false);
      }
    }
  }

  Future<void> _testConnection() async {
    setState(() {
      _testingConnection = true;
      _message = null;
      _messageIsError = false;
    });

    final result =
        await AppConfig.validateServerConnection(_apiController.text);
    if (!mounted) return;

    setState(() {
      _testingConnection = false;
      _message = result.ok
          ? '${result.message}\nAPI detectada: ${result.resolvedApiBaseUrl}'
          : result.message;
      _messageIsError = !result.ok;
    });
  }

  void _resetDefaults() {
    setState(() {
      _apiController.text = '';
      _selectedThemeIndex = 0;
      _message = 'Valores por defecto restaurados. Guarda para aplicar.';
      _messageIsError = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Configuración'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text('Red y backend', style: theme.textTheme.titleLarge),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _apiController,
                    keyboardType: TextInputType.url,
                    decoration: const InputDecoration(
                      labelText: 'Dirección del backend',
                      hintText:
                          'Ej. 192.168.0.10:1080 o http://192.168.0.10:1080/api',
                    ),
                  ),
                  const SizedBox(height: 14),
                  OutlinedButton.icon(
                    onPressed: _testingConnection ? null : _testConnection,
                    icon: _testingConnection
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.wifi_find),
                    label: Text(_testingConnection
                        ? 'Validando...'
                        : 'Validar conexión'),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Puedes ingresar solo la IP/puerto o una URL completa. Si dejas el campo vacío, se usará la configuración predeterminada del emulador.',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.onSurface.withValues(alpha: 0.7),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 18),
          Text('Tema de la aplicación', style: theme.textTheme.titleLarge),
          const SizedBox(height: 12),
          DropdownButtonFormField<int>(
            initialValue: _selectedThemeIndex,
            isExpanded: true,
            decoration: const InputDecoration(
              labelText: 'Tema',
              contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            ),
            items: List.generate(AppConfig.themes.length, (index) {
              final t = AppConfig.themes[index];
              return DropdownMenuItem(
                value: index,
                child: Row(
                  children: [
                    Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8),
                        gradient: LinearGradient(
                          colors: [t.seedColor, t.backgroundColor],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Text(t.name),
                  ],
                ),
              );
            }),
            onChanged: (value) {
              if (value != null) setState(() => _selectedThemeIndex = value);
            },
          ),
          const SizedBox(height: 6),
          Text(
            AppConfig.themeDataList[_selectedThemeIndex]['description'] ?? '',
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
            ),
          ),
          const SizedBox(height: 14),
          if (_message != null)
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: (_messageIsError
                        ? theme.colorScheme.error
                        : theme.colorScheme.primary)
                    .withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(18),
              ),
              child: Text(
                _message!,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: _messageIsError ? theme.colorScheme.error : null,
                ),
              ),
            ),
          const SizedBox(height: 14),
          FilledButton(
            onPressed: _saving ? null : _save,
            child: _saving
                ? const CircularProgressIndicator()
                : const Text('Guardar configuración'),
          ),
          const SizedBox(height: 10),
          TextButton(
            onPressed: _resetDefaults,
            child: const Text('Restablecer valores por defecto'),
          ),
        ],
      ),
    );
  }
}
