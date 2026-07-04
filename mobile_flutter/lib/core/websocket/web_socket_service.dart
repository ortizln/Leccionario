import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

import '../config/app_config.dart';
import '../../features/auth/auth_repository.dart';

class WebSocketService {
  final AuthRepository _auth;
  WebSocketChannel? _channel;
  Timer? _reconnectTimer;
  Timer? _pingTimer;
  bool _intentionalClose = false;
  bool _connected = false;
  String? _username;

  final StreamController<Map<String, dynamic>> _globalController =
      StreamController<Map<String, dynamic>>.broadcast();
  final StreamController<Map<String, dynamic>> _personalController =
      StreamController<Map<String, dynamic>>.broadcast();

  Stream<Map<String, dynamic>> get notifications => _globalController.stream;
  Stream<Map<String, dynamic>> get personalNotifications => _personalController.stream;
  bool get isConnected => _connected;

  WebSocketService({required AuthRepository auth}) : _auth = auth;

  Future<void> connect() async {
    if (_connected || _intentionalClose) return;

    final session = await _auth.readSession();
    if (session == null) return;
    _username = session.username;

    final wsUrl = _buildWsUrl();
    if (wsUrl == null) return;

    try {
      _channel = WebSocketChannel.connect(Uri.parse(wsUrl));
      _connected = true;

      _channel!.stream.listen(
        (data) {
          try {
            final message = jsonDecode(data as String) as Map<String, dynamic>;
            final destination = message['destination'] as String? ?? '';

            if (destination.contains('/user/') && destination.contains('/queue/personal')) {
              final payload = message['payload'];
              if (payload is Map<String, dynamic>) {
                _personalController.add(payload);
              }
            } else if (destination == '/topic/notifications') {
              final payload = message['payload'];
              if (payload is Map<String, dynamic>) {
                _globalController.add(payload);
              }
            } else {
              final payload = message['payload'];
              if (payload is Map<String, dynamic>) {
                _globalController.add(payload);
              }
            }
          } catch (_) {}
        },
        onDone: () {
          _connected = false;
          _scheduleReconnect();
        },
        onError: (_) {
          _connected = false;
          _scheduleReconnect();
        },
      );

      _subscribeToQueues();
      _startPing();
      debugPrint('[WebSocket] Conectado a $wsUrl');
    } catch (e) {
      _connected = false;
      debugPrint('[WebSocket] Error de conexion: $e');
      _scheduleReconnect();
    }
  }

  void _subscribeToQueues() {
    if (_channel == null || _username == null) return;

    final subscribeMsg = jsonEncode({
      'command': 'SUBSCRIBE',
      'id': 'sub-global',
      'destination': '/topic/notifications',
    });
    _channel!.sink.add(subscribeMsg);

    final personalSubscribe = jsonEncode({
      'command': 'SUBSCRIBE',
      'id': 'sub-personal',
      'destination': '/user/$_username/queue/personal',
    });
    _channel!.sink.add(personalSubscribe);

    debugPrint('[WebSocket] Suscrito a /topic/notifications y /user/$_username/queue/personal');
  }

  void disconnect() {
    _intentionalClose = true;
    _reconnectTimer?.cancel();
    _pingTimer?.cancel();
    _channel?.sink.close();
    _connected = false;
    debugPrint('[WebSocket] Desconectado');
  }

  void _scheduleReconnect() {
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(const Duration(seconds: 5), () {
      _intentionalClose = false;
      connect();
    });
  }

  void _startPing() {
    _pingTimer?.cancel();
    _pingTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      if (_connected && _channel != null) {
        try {
          _channel!.sink.add(jsonEncode({'command': 'PING'}));
        } catch (_) {
          _connected = false;
          _scheduleReconnect();
        }
      }
    });
  }

  String? _buildWsUrl() {
    final apiBase = AppConfig.apiBaseUrl;
    if (apiBase.isEmpty) return null;

    final uri = Uri.parse(apiBase);
    final scheme = uri.scheme == 'https' ? 'wss' : 'ws';
    final host = uri.host;
    final port = uri.hasPort ? ':${uri.port}' : '';
    return '$scheme://$host$port/ws';
  }

  void dispose() {
    disconnect();
    _globalController.close();
    _personalController.close();
  }
}
