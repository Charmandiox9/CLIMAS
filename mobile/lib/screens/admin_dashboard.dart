import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'attendance_screen.dart';

class AdminDashboard extends StatefulWidget {
  const AdminDashboard({super.key});

  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard> {
  int _currentIndex = 0;
  bool _hasMultipleRoles = false;

  @override
  void initState() {
    super.initState();
    _checkRoles();
  }

  Future<void> _checkRoles() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token != null) {
      Map<String, dynamic> decoded = JwtDecoder.decode(token);
      List<dynamic> roles = decoded['roles'] ?? [];
      if (roles.length > 1) {
        if (mounted) setState(() => _hasMultipleRoles = true);
      }
    }
  }

  final List<Widget> _views = [
    const Center(child: Text('Métricas Generales\n(En construcción)', textAlign: TextAlign.center, style: TextStyle(fontSize: 20))),
    const AttendanceScreen(),
    const Center(child: Text('Citas Globales\n(En construcción)', textAlign: TextAlign.center, style: TextStyle(fontSize: 20))),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: _currentIndex == 1 ? null : AppBar(
        title: const Text('Panel de Administración'),
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
        actions: [
          if (_hasMultipleRoles)
            IconButton(
              icon: const Icon(Icons.swap_horiz),
              tooltip: 'Cambiar Perfil',
              onPressed: () => Navigator.pushReplacementNamed(context, '/profile_selection'),
            ),
        ],
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: _views,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        selectedItemColor: Colors.indigo,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: 'Métricas'),
          BottomNavigationBarItem(icon: Icon(Icons.fingerprint), label: 'Asistencia'),
          BottomNavigationBarItem(icon: Icon(Icons.calendar_month), label: 'Citas'),
        ],
      ),
    );
  }
}
