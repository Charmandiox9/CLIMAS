import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:intl/date_symbol_data_local.dart';

import 'firebase_options.dart';
import 'screens/login_screen.dart';
import 'screens/attendance_screen.dart';
import 'screens/history_screen.dart';
import 'screens/profile_selection_screen.dart';
import 'screens/admin_dashboard.dart';
import 'screens/doctor_dashboard.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  debugPrint("Manejando mensaje en segundo plano: ${message.messageId}");
}

final GlobalKey<ScaffoldMessengerState> scaffoldMessengerKey = GlobalKey<ScaffoldMessengerState>();

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");
  await initializeDateFormatting('es', null);

  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
    
    FirebaseMessaging messaging = FirebaseMessaging.instance;
    await messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      if (message.notification != null) {
        scaffoldMessengerKey.currentState?.showSnackBar(
          SnackBar(
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(message.notification!.title ?? 'Notificación', style: const TextStyle(fontWeight: FontWeight.bold)),
                Text(message.notification!.body ?? ''),
              ],
            ),
            behavior: SnackBarBehavior.floating,
            backgroundColor: Colors.indigo,
            duration: const Duration(seconds: 5),
          ),
        );
      }
    });

  } catch (e) {
    debugPrint("Firebase init error: $e");
  }
  
  // Revisar si el usuario ya inicio sesion
  final prefs = await SharedPreferences.getInstance();
  final token = prefs.getString('token');

  String initialRoute = '/login';

  if (token != null && !JwtDecoder.isExpired(token)) {
    Map<String, dynamic> decodedToken = JwtDecoder.decode(token);
    List<dynamic> roles = decodedToken['roles'] ?? [];
    
    if (roles.length > 1) {
      initialRoute = '/profile_selection';
    } else if (roles.contains('ADMIN')) {
      initialRoute = '/admin';
    } else if (roles.contains('DOCTOR')) {
      initialRoute = '/doctor';
    } else {
      initialRoute = '/attendance'; // WORKER o default
    }
  }

  runApp(MyApp(initialRoute: initialRoute));
}

class MyApp extends StatelessWidget {
  final String initialRoute;

  const MyApp({super.key, required this.initialRoute});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CLIMAS',
      themeMode: ThemeMode.system,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo, brightness: Brightness.light),
        textTheme: GoogleFonts.interTextTheme(ThemeData.light().textTheme),
        useMaterial3: true,
      ),
      darkTheme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo, brightness: Brightness.dark),
        textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme),
        useMaterial3: true,
      ),
      scaffoldMessengerKey: scaffoldMessengerKey,
      initialRoute: initialRoute,
      routes: {
        '/login': (context) => const LoginScreen(),
        '/attendance': (context) => const AttendanceScreen(),
        '/history': (context) => const HistoryScreen(),
        '/profile_selection': (context) => const ProfileSelectionScreen(),
        '/admin': (context) => const AdminDashboard(),
        '/doctor': (context) => const DoctorDashboard(),
      },
      debugShowCheckedModeBanner: false,
    );
  }
}
