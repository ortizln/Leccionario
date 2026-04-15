import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

import '../storage/local_store.dart';

class AppConfig {
  static const String _configuredBaseUrl =
      String.fromEnvironment('API_BASE_URL', defaultValue: '');
  static const int _defaultThemeIndex = 0;

  static late final LocalStore _localStore;
  static String _runtimeBaseUrl = '';
  static int _themeIndex = _defaultThemeIndex;
  static String _institutionCode = '';
  static InstitutionBranding? _branding;
  static bool _initialized = false;

  static Future<void> load(LocalStore localStore) async {
    _localStore = localStore;
    final json = await localStore.readSingleton('app_settings');
    _runtimeBaseUrl = json?['apiBaseUrl'] as String? ?? '';
    _themeIndex = json?['themeIndex'] as int? ?? _defaultThemeIndex;
    _institutionCode = json?['institutionCode'] as String? ?? '';
    if (_themeIndex < 0 || _themeIndex >= themes.length) {
      _themeIndex = _defaultThemeIndex;
    }
    _initialized = true;
  }

  static String get apiBaseUrl {
    if (_runtimeBaseUrl.isNotEmpty) {
      return _runtimeBaseUrl;
    }
    if (_configuredBaseUrl.isNotEmpty) {
      return _configuredBaseUrl;
    }

    if (kIsWeb) {
      return 'http://localhost:1080/api';
    }

    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return 'http://10.0.2.2:1080/api';
      case TargetPlatform.iOS:
      case TargetPlatform.macOS:
      case TargetPlatform.windows:
      case TargetPlatform.linux:
        return 'http://localhost:1080/api';
      case TargetPlatform.fuchsia:
        return 'http://localhost:1080/api';
    }
  }

  static int get themeIndex {
    if (!_initialized) {
      throw StateError('AppConfig debe cargarse antes de usarse');
    }
    return _themeIndex;
  }

  static String get institutionCode => _institutionCode;

  static InstitutionBranding? get branding => _branding;

  static Future<void> setApiBaseUrl(String value) async {
    _runtimeBaseUrl = _normalizeBaseUrl(value);
    await _saveSettings();
  }

  static Future<void> setThemeIndex(int index) async {
    _themeIndex = index.clamp(0, themes.length - 1);
    await _saveSettings();
  }

  static Future<void> setInstitutionCode(String value) async {
    _institutionCode = value.trim();
    await _saveSettings();
  }

  static Future<void> resetDefaults() async {
    _runtimeBaseUrl = '';
    _themeIndex = _defaultThemeIndex;
    _institutionCode = '';
    _branding = null;
    await _saveSettings();
  }

  static Future<List<InstitutionOption>> fetchInstitutions() async {
    final response = await http
        .get(Uri.parse('$apiBaseUrl/public/institutions'))
        .timeout(const Duration(seconds: 8));
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('No se pudo cargar la lista de instituciones.');
    }
    final jsonList = jsonDecode(response.body) as List<dynamic>;
    return jsonList
        .map((item) => InstitutionOption.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  static Future<InstitutionBranding> refreshBranding(
      [String? institutionCode]) async {
    final selectedCode = (institutionCode ?? _institutionCode).trim();
    final query = selectedCode.isEmpty
        ? ''
        : '?institutionCode=${Uri.encodeQueryComponent(selectedCode)}';
    final response = await http
        .get(Uri.parse('$apiBaseUrl/public/branding$query'))
        .timeout(const Duration(seconds: 8));
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('No se pudo cargar la apariencia institucional.');
    }
    final branding = InstitutionBranding.fromJson(
        jsonDecode(response.body) as Map<String, dynamic>);
    _branding = branding;
    _institutionCode = branding.institutionCode;
    await _saveSettings();
    return branding;
  }

  static Future<ServerConnectionResult> validateServerConnection(
      String value) async {
    final serverUrl = serverBaseUrlForInput(value);
    final healthUri = Uri.parse('$serverUrl/actuator/health');

    try {
      final response =
          await http.get(healthUri).timeout(const Duration(seconds: 6));
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return ServerConnectionResult(
          ok: true,
          message: 'Conexion correcta con $serverUrl.',
          resolvedApiBaseUrl: _normalizeBaseUrl(value),
        );
      }

      return ServerConnectionResult(
        ok: false,
        message: 'El servidor respondio con estado ${response.statusCode}.',
        resolvedApiBaseUrl: _normalizeBaseUrl(value),
      );
    } catch (_) {
      return ServerConnectionResult(
        ok: false,
        message: 'No fue posible conectar con $serverUrl.',
        resolvedApiBaseUrl: _normalizeBaseUrl(value),
      );
    }
  }

  static Future<void> _saveSettings() async {
    await _localStore.saveSingleton('app_settings', {
      'apiBaseUrl': _runtimeBaseUrl,
      'themeIndex': _themeIndex,
      'institutionCode': _institutionCode,
    });
  }

  static String _normalizeBaseUrl(String value) {
    final trimmed = value.trim();
    if (trimmed.isEmpty) return '';
    var candidate = trimmed;
    if (!candidate.startsWith(RegExp(r'https?://'))) {
      candidate = 'http://$candidate';
    }
    final uri = Uri.parse(candidate);
    final scheme = uri.scheme;
    final host = uri.host;
    final port = uri.hasPort ? ':${uri.port}' : '';
    var path = uri.path;
    if (path.isEmpty || path == '/') {
      path = '/api';
    }
    if (!path.endsWith('/api')) {
      path = path.replaceAll(RegExp(r'/+$'), '');
      if (!path.endsWith('/api')) {
        path = '$path/api';
      }
    }
    return '$scheme://$host$port$path';
  }

  static String serverBaseUrlForInput(String value) {
    final normalizedApiBaseUrl =
        value.trim().isEmpty ? apiBaseUrl : _normalizeBaseUrl(value);
    final uri = Uri.parse(normalizedApiBaseUrl);
    final port = uri.hasPort ? ':${uri.port}' : '';
    return '${uri.scheme}://${uri.host}$port';
  }

  static ThemeData themeData([int index = 0]) {
    final branding = _branding;
    if (branding != null) {
      return ThemeData(
        colorScheme: ColorScheme.fromSeed(
            seedColor: branding.primaryColor, brightness: Brightness.light),
        useMaterial3: true,
        scaffoldBackgroundColor: branding.backgroundColor,
        textTheme: const TextTheme(
          headlineLarge: TextStyle(fontSize: 34, fontWeight: FontWeight.w800),
          headlineMedium: TextStyle(fontSize: 28, fontWeight: FontWeight.w700),
          headlineSmall: TextStyle(fontSize: 24, fontWeight: FontWeight.w700),
          titleLarge: TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
          titleMedium: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          bodyLarge: TextStyle(fontSize: 16, height: 1.35),
          bodyMedium: TextStyle(fontSize: 14, height: 1.35),
        ),
        cardTheme: CardThemeData(
          elevation: 0,
          color: branding.surfaceColor,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(28),
            side: BorderSide(
                color: branding.primaryColor.withValues(alpha: 0.18)),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 18, vertical: 18),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(22),
            borderSide: BorderSide(
                color: branding.primaryColor.withValues(alpha: 0.18)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(22),
            borderSide: BorderSide(
                color: branding.primaryColor.withValues(alpha: 0.18)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(22),
            borderSide: BorderSide(color: branding.primaryColor, width: 1.4),
          ),
        ),
        filledButtonTheme: FilledButtonThemeData(
          style: FilledButton.styleFrom(
            backgroundColor: branding.primaryColor,
            foregroundColor: Colors.white,
            minimumSize: const Size.fromHeight(56),
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
            textStyle:
                const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
          ),
        ),
      );
    }

    final theme = themes[index.clamp(0, themes.length - 1)];
    return ThemeData(
      colorScheme: ColorScheme.fromSeed(
          seedColor: theme.seedColor, brightness: Brightness.light),
      useMaterial3: true,
      scaffoldBackgroundColor: theme.backgroundColor,
      textTheme: const TextTheme(
        headlineLarge: TextStyle(
            fontSize: 34, fontWeight: FontWeight.w800, letterSpacing: -1.1),
        headlineMedium: TextStyle(
            fontSize: 28, fontWeight: FontWeight.w700, letterSpacing: -0.8),
        headlineSmall: TextStyle(
            fontSize: 24, fontWeight: FontWeight.w700, letterSpacing: -0.6),
        titleLarge: TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
        titleMedium: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        bodyLarge: TextStyle(fontSize: 16, height: 1.35),
        bodyMedium: TextStyle(fontSize: 14, height: 1.35),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        color: theme.cardColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(28),
          side: BorderSide(color: theme.borderColor),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: theme.inputFillColor,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 18, vertical: 18),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(22),
          borderSide: BorderSide(color: theme.borderColor),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(22),
          borderSide: BorderSide(color: theme.borderColor),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(22),
          borderSide: BorderSide(color: theme.seedColor, width: 1.4),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: theme.seedColor,
          foregroundColor: Colors.white,
          minimumSize: const Size.fromHeight(56),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
          textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
        ),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        foregroundColor: theme.seedColor,
      ),
    );
  }

  static List<AppTheme> get themes => _themes;

  static List<Map<String, String>> get themeDataList => _themeDataList;

  static final List<Map<String, String>> _themeDataList = [
    {'name': 'Esmeralda', 'description': 'Verde institucional'},
    {'name': 'Amanecer', 'description': 'Rojo suave'},
    {'name': 'Cielo', 'description': 'Azul limpio'},
    {'name': 'Noche', 'description': 'Gris profundo'},
    {'name': 'Bosque', 'description': 'Verde intenso'},
    {'name': 'Arena', 'description': 'Tonos calidos'},
    {'name': 'Lavanda', 'description': 'Violeta claro'},
    {'name': 'Oceano', 'description': 'Azul turquesa'},
    {'name': 'Carbon', 'description': 'Grafito sobrio'},
    {'name': 'Menta', 'description': 'Verde fresco'},
  ];

  static final List<AppTheme> _themes = [
    const AppTheme(
      name: 'Esmeralda',
      description: 'Verde institucional',
      seedColor: Color(0xFF0F766E),
      backgroundColor: Color(0xFFF4F7F3),
      cardColor: Colors.white,
      borderColor: Color(0xFFE2E8E2),
      inputFillColor: Colors.white,
    ),
    const AppTheme(
      name: 'Amanecer',
      description: 'Rojo suave',
      seedColor: Color(0xFFBE123C),
      backgroundColor: Color(0xFFFEF2F2),
      cardColor: Colors.white,
      borderColor: Color(0xFFF5C2C7),
      inputFillColor: Colors.white,
    ),
    const AppTheme(
      name: 'Cielo',
      description: 'Azul limpio',
      seedColor: Color(0xFF2563EB),
      backgroundColor: Color(0xFFEFF6FF),
      cardColor: Colors.white,
      borderColor: Color(0xFF93C5FD),
      inputFillColor: Colors.white,
    ),
    const AppTheme(
      name: 'Noche',
      description: 'Gris profundo',
      seedColor: Color(0xFF1E293B),
      backgroundColor: Color(0xFFF8FAFC),
      cardColor: Colors.white,
      borderColor: Color(0xFFD1D5DB),
      inputFillColor: Colors.white,
    ),
    const AppTheme(
      name: 'Bosque',
      description: 'Verde intenso',
      seedColor: Color(0xFF166534),
      backgroundColor: Color(0xFFF0FDF4),
      cardColor: Colors.white,
      borderColor: Color(0xFFBBF7D0),
      inputFillColor: Colors.white,
    ),
    const AppTheme(
      name: 'Arena',
      description: 'Tonos calidos',
      seedColor: Color(0xFF92400E),
      backgroundColor: Color(0xFFFFF7ED),
      cardColor: Colors.white,
      borderColor: Color(0xFFFCD9A6),
      inputFillColor: Colors.white,
    ),
    const AppTheme(
      name: 'Lavanda',
      description: 'Violeta claro',
      seedColor: Color(0xFF7C3AED),
      backgroundColor: Color(0xFFF5F3FF),
      cardColor: Colors.white,
      borderColor: Color(0xFFE9D5FF),
      inputFillColor: Colors.white,
    ),
    const AppTheme(
      name: 'Oceano',
      description: 'Azul turquesa',
      seedColor: Color(0xFF0E7490),
      backgroundColor: Color(0xFFE0F2FE),
      cardColor: Colors.white,
      borderColor: Color(0xFF7DD3FC),
      inputFillColor: Colors.white,
    ),
    const AppTheme(
      name: 'Carbon',
      description: 'Grafito sobrio',
      seedColor: Color(0xFF334155),
      backgroundColor: Color(0xFFF8FAFC),
      cardColor: Colors.white,
      borderColor: Color(0xFFCBD5E1),
      inputFillColor: Colors.white,
    ),
    const AppTheme(
      name: 'Menta',
      description: 'Verde fresco',
      seedColor: Color(0xFF0F766E),
      backgroundColor: Color(0xFFEFF6F7),
      cardColor: Colors.white,
      borderColor: Color(0xFFBAE6FD),
      inputFillColor: Colors.white,
    ),
  ];
}

class InstitutionOption {
  const InstitutionOption({
    required this.id,
    required this.code,
    required this.name,
  });

  factory InstitutionOption.fromJson(Map<String, dynamic> json) {
    return InstitutionOption(
      id: json['id'] as int,
      code: json['code'] as String,
      name: json['name'] as String,
    );
  }

  final int id;
  final String code;
  final String name;
}

class InstitutionBranding {
  const InstitutionBranding({
    required this.institutionCode,
    required this.displayName,
    required this.loginBadgeText,
    required this.loginTitle,
    required this.loginSubtitle,
    required this.loginHelperText,
    required this.mobileTitle,
    required this.mobileSubtitle,
    required this.logoUrl,
    required this.loginLogoUrl,
    required this.primaryColor,
    required this.secondaryColor,
    required this.accentColor,
    required this.backgroundColor,
    required this.surfaceColor,
    required this.textColor,
  });

  factory InstitutionBranding.fromJson(Map<String, dynamic> json) {
    return InstitutionBranding(
      institutionCode: json['institutionCode'] as String,
      displayName: json['displayName'] as String,
      loginBadgeText: json['loginBadgeText'] as String,
      loginTitle: json['loginTitle'] as String,
      loginSubtitle: json['loginSubtitle'] as String,
      loginHelperText: json['loginHelperText'] as String,
      mobileTitle: json['mobileTitle'] as String,
      mobileSubtitle: json['mobileSubtitle'] as String,
      logoUrl: json['logoUrl'] as String?,
      loginLogoUrl: json['loginLogoUrl'] as String?,
      primaryColor: _parseHexColor(json['primaryColor'] as String),
      secondaryColor: _parseHexColor(json['secondaryColor'] as String),
      accentColor: _parseHexColor(json['accentColor'] as String),
      backgroundColor: _parseHexColor(json['backgroundColor'] as String),
      surfaceColor: _parseHexColor(json['surfaceColor'] as String),
      textColor: _parseHexColor(json['textColor'] as String),
    );
  }

  final String institutionCode;
  final String displayName;
  final String loginBadgeText;
  final String loginTitle;
  final String loginSubtitle;
  final String loginHelperText;
  final String mobileTitle;
  final String mobileSubtitle;
  final String? logoUrl;
  final String? loginLogoUrl;
  final Color primaryColor;
  final Color secondaryColor;
  final Color accentColor;
  final Color backgroundColor;
  final Color surfaceColor;
  final Color textColor;
}

Color _parseHexColor(String value) {
  final normalized = value.replaceAll('#', '');
  return Color(int.parse('FF$normalized', radix: 16));
}

class AppTheme {
  const AppTheme({
    required this.name,
    required this.description,
    required this.seedColor,
    required this.backgroundColor,
    required this.cardColor,
    required this.borderColor,
    required this.inputFillColor,
  });

  final String name;
  final String description;
  final Color seedColor;
  final Color backgroundColor;
  final Color cardColor;
  final Color borderColor;
  final Color inputFillColor;
}

class ServerConnectionResult {
  const ServerConnectionResult({
    required this.ok,
    required this.message,
    required this.resolvedApiBaseUrl,
  });

  final bool ok;
  final String message;
  final String resolvedApiBaseUrl;
}
