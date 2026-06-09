import 'package:flutter/material.dart';

class AdminDashboard extends StatefulWidget {
  const AdminDashboard({super.key});

  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard> {
  int _currentIndex = 0;

  final List<Widget> _views = [
    const Center(child: Text('Métricas Generales\n(En construcción)', textAlign: TextAlign.center, style: TextStyle(fontSize: 20))),
    const Center(child: Text('Asistencia del Personal\n(En construcción)', textAlign: TextAlign.center, style: TextStyle(fontSize: 20))),
    const Center(child: Text('Citas Globales\n(En construcción)', textAlign: TextAlign.center, style: TextStyle(fontSize: 20))),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Panel de Administración'),
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
      ),
      body: _views[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        selectedItemColor: Colors.indigo,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: 'Métricas'),
          BottomNavigationBarItem(icon: Icon(Icons.people), label: 'Staff'),
          BottomNavigationBarItem(icon: Icon(Icons.calendar_month), label: 'Citas'),
        ],
      ),
    );
  }
}
