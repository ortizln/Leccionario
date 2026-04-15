import 'dart:async';

import 'package:flutter/material.dart';
import 'package:intl/date_symbol_data_local.dart';

import 'app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('es');
  
  FlutterError.onError = (FlutterErrorDetails details) {
    FlutterError.presentError(details);
  };

  runZonedGuarded(
    () => runApp(const LeccionarioMobileApp()),
    (error, stackTrace) {
      debugPrint('Uncaught exception: $error');
      debugPrintStack(stackTrace: stackTrace);
    },
  );
}
