import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../config/app_config.dart';
import '../storage/secure_store.dart';

class ApiClient {
  static ApiClient? _instance;
  late final Dio _dio;
  final SecureStore _secureStore;

  ApiClient._({required SecureStore secureStore}) : _secureStore = secureStore {
    _dio = Dio(BaseOptions(
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 15),
      sendTimeout: const Duration(seconds: 10),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    _dio.interceptors.add(_AuthInterceptor(_secureStore));

    if (!kReleaseMode) {
      _dio.interceptors.add(LogInterceptor(
        requestBody: true,
        responseBody: true,
        logPrint: (obj) => debugPrint('[API] $obj'),
      ));
    }
  }

  static Future<ApiClient> create({SecureStore? secureStore}) async {
    final store = secureStore ?? SecureStore();
    _instance = ApiClient._(secureStore: store);
    return _instance!;
  }

  static ApiClient get instance {
    if (_instance == null) {
      throw StateError('ApiClient not initialized. Call ApiClient.create() first.');
    }
    return _instance!;
  }

  Dio get dio => _dio;

  String get _baseUrl => AppConfig.apiBaseUrl;

  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) {
    return _dio.get<T>(
      '$_baseUrl$path',
      queryParameters: queryParameters,
      options: options,
    );
  }

  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) {
    return _dio.post<T>(
      '$_baseUrl$path',
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) {
    return _dio.put<T>(
      '$_baseUrl$path',
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
    Options? options,
  }) {
    return _dio.delete<T>(
      '$_baseUrl$path',
      data: data,
      options: options,
    );
  }

  void updateBaseUrl(String baseUrl) {
    _dio.options.baseUrl = baseUrl;
  }
}

class _AuthInterceptor extends Interceptor {
  final SecureStore _secureStore;

  _AuthInterceptor(this._secureStore);

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await _secureStore.readToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (err.response?.statusCode == 401) {
      _secureStore.deleteToken();
      _secureStore.deleteRefreshToken();
    }
    handler.next(err);
  }
}
