import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'core/config/app_config.dart';
import 'core/storage/local_store.dart';
import 'features/auth/auth_repository.dart';
import 'features/auth/login_page.dart';
import 'features/daily_log/daily_log_repository.dart';
import 'features/daily_log/today_page.dart';
import 'features/settings/settings_page.dart';

class LeccionarioMobileApp extends StatefulWidget {
  const LeccionarioMobileApp({super.key});

  @override
  State<LeccionarioMobileApp> createState() => _LeccionarioMobileAppState();
}

class _LeccionarioMobileAppState extends State<LeccionarioMobileApp> {
  late final LocalStore _localStore;
  late final AuthRepository _authRepository;
  late final DailyLogRepository _dailyLogRepository;
  bool _ready = false;
  bool _loggedIn = false;
  int _themeIndex = 0;
  String? _initError;

  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    try {
      _localStore = LocalStore();
      await _localStore.init();
      await AppConfig.load(_localStore);
      try {
        await AppConfig.refreshBranding();
      } catch (_) {
        // Permite que la app use el tema local si el branding no responde.
      }
      _themeIndex = AppConfig.themeIndex;
      _authRepository = AuthRepository(localStore: _localStore);
      _dailyLogRepository = DailyLogRepository(
        authRepository: _authRepository,
        localStore: _localStore,
      );
      final session = await _authRepository.readSession();
      setState(() {
        _loggedIn = session != null;
        _ready = true;
        _initError = null;
      });
    } catch (error, stackTrace) {
      debugPrint('Error durante inicialización: $error');
      debugPrintStack(stackTrace: stackTrace);
      setState(() {
        _ready = true;
        _initError = error.toString();
      });
    }
  }

  void _openSettings(BuildContext context) {
    Navigator.of(context).push<void>(
      MaterialPageRoute(
        builder: (_) => SettingsPage(
          initialApiBaseUrl: AppConfig.apiBaseUrl,
          initialThemeIndex: _themeIndex,
          onSaved: (apiBaseUrl, themeIndex) async {
            await AppConfig.setApiBaseUrl(apiBaseUrl);
            await AppConfig.setThemeIndex(themeIndex);
            try {
              await AppConfig.refreshBranding();
            } catch (_) {
              // Mantiene el guardado aun si el branding no responde.
            }
            setState(() {
              _themeIndex = themeIndex;
            });
          },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (!_ready) {
      return const MaterialApp(
        locale: Locale('es'),
        supportedLocales: [Locale('es'), Locale('en')],
        localizationsDelegates: [
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        home: Scaffold(body: Center(child: CircularProgressIndicator())),
      );
    }

    if (_initError != null) {
      return MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'Leccionario Mobile',
        locale: const Locale('es'),
        supportedLocales: const [Locale('es'), Locale('en')],
        localizationsDelegates: const [
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        theme: AppConfig.themeData(0),
        home: Scaffold(
          body: Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.error_outline,
                      size: 64, color: Color(0xFFB42318)),
                  const SizedBox(height: 16),
                  const Text(
                    'Error de inicialización',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    _initError!,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 14),
                  ),
                  const SizedBox(height: 24),
                  FilledButton(
                    onPressed: () => setState(() {
                      _ready = false;
                      _initError = null;
                      _bootstrap();
                    }),
                    child: const Text('Reintentar'),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Leccionario Mobile',
      locale: const Locale('es'),
      supportedLocales: const [Locale('es'), Locale('en')],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      theme: AppConfig.themeData(_themeIndex),
      home: _loggedIn
          ? TodayPage(
              authRepository: _authRepository,
              dailyLogRepository: _dailyLogRepository,
              onLogout: () async {
                await _authRepository.logout();
                setState(() => _loggedIn = false);
              },
              onOpenSettings: _openSettings,
            )
          : LoginPage(
              authRepository: _authRepository,
              onLoggedIn: () => setState(() => _loggedIn = true),
              onOpenSettings: _openSettings,
              onBrandingChanged: () => setState(() {}),
            ),
    );
  }
}
