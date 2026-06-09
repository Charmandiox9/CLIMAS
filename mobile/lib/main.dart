import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'screens/login_screen.dart';
import 'screens/attendance_screen.dart';
import 'screens/history_screen.dart';
import 'screens/profile_selection_screen.dart';
import 'screens/admin_dashboard.dart';
import 'screens/doctor_dashboard.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Cargar variables de entorno (URL de la API y BSSID del Wi-Fi)
  await dotenv.load(fileName: ".env");
  
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
