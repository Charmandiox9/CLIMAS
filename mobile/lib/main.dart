import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'screens/login_screen.dart';
import 'screens/attendance_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Cargar variables de entorno (URL de la API y BSSID del Wi-Fi)
  await dotenv.load(fileName: ".env");
  
  // Revisar si el usuario ya inicio sesion
  final prefs = await SharedPreferences.getInstance();
  final token = prefs.getString('token');

  runApp(MyApp(initialRoute: token != null ? '/attendance' : '/login'));
}

class MyApp extends StatelessWidget {
  final String initialRoute;

  const MyApp({super.key, required this.initialRoute});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CLIMAS Asistencia',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      initialRoute: initialRoute,
      routes: {
        '/login': (context) => const LoginScreen(),
        '/attendance': (context) => const AttendanceScreen(),
      },
      debugShowCheckedModeBanner: false,
    );
  }
}
