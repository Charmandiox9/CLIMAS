import 'package:flutter/material.dart';
import 'attendance_screen.dart';

class DoctorDashboard extends StatefulWidget {
  const DoctorDashboard({super.key});

  @override
  State<DoctorDashboard> createState() => _DoctorDashboardState();
}

class _DoctorDashboardState extends State<DoctorDashboard> {
  int _currentIndex = 0;

  final List<Widget> _views = [
    const Center(child: Text('Mis Pacientes de Hoy\n(En construcción)', textAlign: TextAlign.center, style: TextStyle(fontSize: 20))),
    const Center(child: Text('Mi Agenda\n(En construcción)', textAlign: TextAlign.center, style: TextStyle(fontSize: 20))),
    const AttendanceScreen(), 
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _views[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        selectedItemColor: Colors.indigo,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Mi Día'),
          BottomNavigationBarItem(icon: Icon(Icons.calendar_today), label: 'Agenda'),
          BottomNavigationBarItem(icon: Icon(Icons.fingerprint), label: 'Asistencia'),
        ],
      ),
    );
  }
}
