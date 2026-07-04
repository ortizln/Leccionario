import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'core/config/app_config.dart';
import 'core/storage/local_store.dart';
import 'core/websocket/web_socket_service.dart';
import 'features/auth/auth_repository.dart';
import 'features/auth/login_page.dart';
import 'features/daily_log/daily_log_repository.dart';
import 'features/daily_log/today_page.dart';
import 'features/settings/settings_page.dart';
import 'features/teacher/teacher_entry.dart';

class LeccionarioMobileApp extends StatefulWidget {
  const LeccionarioMobileApp({super.key});

  @override
  State<LeccionarioMobileApp> createState() => _LeccionarioMobileAppState();
}

class _LeccionarioMobileAppState extends State<LeccionarioMobileApp> {
  late final LocalStore _localStore;
  late final AuthRepository _authRepository;
  late final DailyLogRepository _dailyLogRepository;
  WebSocketService? _webSocketService;
  StreamSubscription<Map<String, dynamic>>? _globalSubscription;
  StreamSubscription<Map<String, dynamic>>? _personalSubscription;
  bool _ready = false;
  bool _loggedIn = false;
  bool _isTeacher = false;
  int _themeIndex = 0;
  String? _initError;

  int _unreadCount = 0;

  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  @override
  void dispose() {
    _globalSubscription?.cancel();
    _personalSubscription?.cancel();
    _webSocketService?.dispose();
    super.dispose();
  }

  Future<void> _bootstrap() async {
    try {
      _localStore = LocalStore();
      await _localStore.init();
      await AppConfig.load(_localStore);
      try {
        await AppConfig.refreshBranding();
      } catch (_) {}
      _themeIndex = AppConfig.themeIndex;
      _authRepository = AuthRepository(localStore: _localStore);
      _dailyLogRepository = DailyLogRepository(
        authRepository: _authRepository,
        localStore: _localStore,
      );
      final session = await _authRepository.readSession();
      final loggedIn = session != null;
      setState(() {
        _loggedIn = loggedIn;
        _isTeacher = session?.primaryRole == 'ROLE_DOCENTE';
        _ready = true;
        _initError = null;
      });
      if (loggedIn) {
        _connectWebSocket();
      }
    } catch (error, stackTrace) {
      debugPrint('Error durante inicializacion: $error');
      debugPrintStack(stackTrace: stackTrace);
      setState(() {
        _ready = true;
        _initError = error.toString();
      });
    }
  }

  void _connectWebSocket() {
    _globalSubscription?.cancel();
    _personalSubscription?.cancel();
    _webSocketService?.dispose();

    _webSocketService = WebSocketService(auth: _authRepository);

    _globalSubscription = _webSocketService!.notifications.listen(_onGlobalNotification);
    _personalSubscription = _webSocketService!.personalNotifications.listen(_onPersonalNotification);

    _webSocketService!.connect();
  }

  void _disconnectWebSocket() {
    _globalSubscription?.cancel();
    _personalSubscription?.cancel();
    _webSocketService?.dispose();
    _webSocketService = null;
  }

  void _onGlobalNotification(Map<String, dynamic> message) {
    final type = message['type'] as String?;
    final event = message['event'] as String?;
    final data = message['data'] as Map<String, dynamic>?;

    if (type == 'ANNOUNCEMENT' && mounted) {
      final title = data?['title'] as String? ?? 'Sin titulo';
      String body;
      IconData icon;
      Color bgColor;

      switch (event) {
        case 'CREATED':
          body = 'Nuevo anuncio: $title';
          icon = Icons.campaign_outlined;
          bgColor = const Color(0xFF81B29A);
        case 'UPDATED':
          body = 'Anuncio actualizado: $title';
          icon = Icons.edit_outlined;
          bgColor = const Color(0xFFF2CC8F);
        case 'DELETED':
          body = 'Anuncio eliminado: $title';
          icon = Icons.delete_outline;
          bgColor = const Color(0xFFE07A5F);
        default:
          body = 'Anuncio modificado: $title';
          icon = Icons.info_outline;
          bgColor = const Color(0xFF3B4436);
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              Icon(icon, color: Colors.white, size: 20),
              const SizedBox(width: 12),
              Expanded(child: Text(body)),
            ],
          ),
          backgroundColor: bgColor,
          duration: const Duration(seconds: 4),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    }
  }

  void _onPersonalNotification(Map<String, dynamic> message) {
    final type = message['type'] as String?;
    final event = message['event'] as String?;
    final data = message['data'] as Map<String, dynamic>?;

    if (type == 'ANNOUNCEMENT' && event == 'READ' && mounted) {
      final newUnreadCount = (data?['unreadCount'] as num?)?.toInt() ?? 0;
      setState(() => _unreadCount = newUnreadCount);
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
            } catch (_) {}
            setState(() {
              _themeIndex = themeIndex;
            });
            if (_loggedIn) {
              _connectWebSocket();
            }
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
                    'Error de inicializacion',
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
          ? _isTeacher
              ? TeacherEntryPoint(
                  authRepository: _authRepository,
                  onLogout: () async {
                    _disconnectWebSocket();
                    await _authRepository.logout();
                    setState(() { _loggedIn = false; _isTeacher = false; });
                  },
                  onOpenSettings: _openSettings,
                  unreadCount: _unreadCount,
                )
              : TodayPage(
                  authRepository: _authRepository,
                  dailyLogRepository: _dailyLogRepository,
                  onLogout: () async {
                    _disconnectWebSocket();
                    await _authRepository.logout();
                    setState(() => _loggedIn = false);
                  },
                  onOpenSettings: _openSettings,
                )
          : LoginPage(
              authRepository: _authRepository,
              onLoggedIn: () {
                setState(() => _loggedIn = true);
                _connectWebSocket();
              },
              onOpenSettings: _openSettings,
              onBrandingChanged: () => setState(() {}),
            ),
    );
  }
}
