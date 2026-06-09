import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import 'attendance_screen.dart';

class AdminDashboard extends StatefulWidget {
  const AdminDashboard({super.key});

  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard> {
  int _currentIndex = 0;
  bool _hasMultipleRoles = false;
  final ApiService _apiService = ApiService();
  
  List<dynamic> _attendances = [];
  List<dynamic> _consultations = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _checkRoles();
    _fetchAdminData();
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

  Future<void> _fetchAdminData() async {
    setState(() => _isLoading = true);
    try {
      final atts = await _apiService.getAllAttendances();
      final cons = await _apiService.getAllConsultations();
      if (mounted) {
        setState(() {
          _attendances = atts;
          _consultations = cons;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error cargando datos: $e')));
      }
    }
  }

  Widget _buildMetricsView() {
    if (_isLoading) return const Center(child: CircularProgressIndicator());
    final now = DateTime.now();
    
    // Calcular citas de hoy
    final todayConsultations = _consultations.where((c) {
      final date = DateTime.parse(c['dateTime']).toLocal();
      return date.year == now.year && date.month == now.month && date.day == now.day;
    }).toList();

    // Calcular staff trabajando hoy (tienen marca de entrada)
    final todayAttendances = _attendances.where((a) {
      final date = DateTime.parse(a['date']).toLocal();
      return date.year == now.year && date.month == now.month && date.day == now.day && a['entryTime'] != null;
    }).toList();

    return RefreshIndicator(
      onRefresh: _fetchAdminData,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Resumen de Hoy', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.indigo)),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: _buildStatCard('Citas Hoy', todayConsultations.length.toString(), Icons.event, Colors.orange),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildStatCard('Staff Activo', todayAttendances.length.toString(), Icons.people, Colors.green),
              ),
            ],
          ),
          const SizedBox(height: 20),
          const Text('Métricas Generales', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.indigo)),
          const SizedBox(height: 20),
          _buildStatCard('Total de Citas Históricas', _consultations.length.toString(), Icons.auto_graph, Colors.blue),
        ],
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Icon(icon, size: 40, color: color),
            const SizedBox(height: 10),
            Text(value, style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: color)),
            const SizedBox(height: 5),
            Text(title, textAlign: TextAlign.center, style: const TextStyle(fontSize: 14, color: Colors.grey)),
          ],
        ),
      ),
    );
  }

  Widget _buildStaffView() {
    if (_isLoading) return const Center(child: CircularProgressIndicator());
    if (_attendances.isEmpty) {
      return const Center(child: Text('No hay registros de asistencia.', style: TextStyle(fontSize: 16, color: Colors.grey)));
    }
    return RefreshIndicator(
      onRefresh: _fetchAdminData,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _attendances.length,
        itemBuilder: (context, index) {
          final item = _attendances[index];
          final date = DateTime.parse(item['date']).toLocal();
          final user = item['user'];
          final name = user != null ? '${user['firstName']} ${user['lastName']}' : 'Usuario Desconocido';
          final roles = user != null && user['roles'] != null ? user['roles'].join(', ') : 'Sin rol';
          
          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: ListTile(
              leading: const CircleAvatar(backgroundColor: Colors.indigo, child: Icon(Icons.badge, color: Colors.white)),
              title: Text(name, style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text('$roles\nFecha: ${DateFormat('dd/MM/yyyy').format(date)}'),
              trailing: item['entryTime'] != null 
                  ? Text('Entró: ${DateFormat('HH:mm').format(DateTime.parse(item['entryTime']).toLocal())}', style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold))
                  : const Text('Sin entrada', style: TextStyle(color: Colors.red)),
              isThreeLine: true,
            ),
          );
        },
      ),
    );
  }

  Widget _buildGlobalConsultationsView() {
    if (_isLoading) return const Center(child: CircularProgressIndicator());
    if (_consultations.isEmpty) {
      return const Center(child: Text('No hay citas registradas.', style: TextStyle(fontSize: 16, color: Colors.grey)));
    }
    return RefreshIndicator(
      onRefresh: _fetchAdminData,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _consultations.length,
        itemBuilder: (context, index) {
          final item = _consultations[index];
          final date = DateTime.parse(item['dateTime']).toLocal();
          final patientName = item['patient']?['user'] != null 
              ? '${item['patient']['user']['firstName']} ${item['patient']['user']['lastName']}' 
              : 'Desconocido';
          final doctorName = item['doctor']?['user'] != null 
              ? '${item['doctor']['user']['firstName']} ${item['doctor']['user']['lastName']}' 
              : 'Desconocido';

          return Card(
            elevation: 1,
            margin: const EdgeInsets.only(bottom: 10),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            child: ListTile(
              title: Text('Paciente: $patientName', style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text('Dr. $doctorName\n${DateFormat('dd/MM/yyyy HH:mm').format(date)} - ${item['status']}'),
              isThreeLine: true,
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: _currentIndex == 3 ? null : AppBar(
        title: const Text('Torre de Control'),
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
        children: [
          _buildMetricsView(),
          _buildStaffView(),
          _buildGlobalConsultationsView(),
          const AttendanceScreen(),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        selectedItemColor: Colors.indigo,
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: 'Métricas'),
          BottomNavigationBarItem(icon: Icon(Icons.people), label: 'Staff'),
          BottomNavigationBarItem(icon: Icon(Icons.calendar_month), label: 'Citas'),
          BottomNavigationBarItem(icon: Icon(Icons.fingerprint), label: 'Tu Asistencia'),
        ],
      ),
    );
  }
}
