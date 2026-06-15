import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import 'attendance_screen.dart';
import 'consultation_detail_screen.dart';

class DoctorDashboard extends StatefulWidget {
  const DoctorDashboard({super.key});

  @override
  State<DoctorDashboard> createState() => _DoctorDashboardState();
}

class _DoctorDashboardState extends State<DoctorDashboard> {
  int _currentIndex = 0;
  bool _hasMultipleRoles = false;
  final ApiService _apiService = ApiService();
  List<dynamic> _consultations = [];
  bool _isLoading = true;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _checkRoles();
    _fetchConsultations();
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

  Future<void> _fetchConsultations() async {
    setState(() => _isLoading = true);
    try {
      final data = await _apiService.getMyConsultations();
      if (mounted) {
        setState(() {
          _consultations = data;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  List<dynamic> get _todayConsultations {
    final now = DateTime.now();
    return _consultations.where((c) {
      final date = DateTime.parse(c['dateTime']).toLocal();
      final isToday = date.year == now.year && date.month == now.month && date.day == now.day;
      if (!isToday) return false;
      
      if (_searchQuery.isEmpty) return true;
      final patient = c['patient']?['user'];
      final name = patient != null ? '${patient['firstName']} ${patient['lastName']}'.toLowerCase() : '';
      return name.contains(_searchQuery.toLowerCase());
    }).toList();
  }

  List<dynamic> get _allConsultations {
    final sorted = List<dynamic>.from(_consultations.where((c) {
      if (_searchQuery.isEmpty) return true;
      final patient = c['patient']?['user'];
      final name = patient != null ? '${patient['firstName']} ${patient['lastName']}'.toLowerCase() : '';
      return name.contains(_searchQuery.toLowerCase());
    }));
    sorted.sort((a, b) => DateTime.parse(a['dateTime']).compareTo(DateTime.parse(b['dateTime'])));
    return sorted;
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: TextField(
        onChanged: (val) => setState(() => _searchQuery = val),
        decoration: InputDecoration(
          hintText: 'Buscar paciente...',
          prefixIcon: const Icon(Icons.search),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          filled: true,
        ),
      ),
    );
  }

  Widget _buildTodayView() {
    if (_isLoading) return const Center(child: CircularProgressIndicator());
    final todayList = _todayConsultations;
    
    return Column(
      children: [
        _buildSearchBar(),
        Expanded(
          child: todayList.isEmpty
              ? const Center(child: Text('No tienes pacientes que coincidan.', style: TextStyle(fontSize: 16, color: Colors.grey)))
              : RefreshIndicator(
                  onRefresh: _fetchConsultations,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: todayList.length,
                    itemBuilder: (context, index) {
                      final item = todayList[index];
                      final date = DateTime.parse(item['dateTime']).toLocal();
                      final patientName = item['patient']?['user'] != null 
                          ? '${item['patient']['user']['firstName']} ${item['patient']['user']['lastName']}' 
                          : 'Paciente Desconocido';
                      return Card(
                        elevation: 2,
                        margin: const EdgeInsets.only(bottom: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(12),
                          onTap: () {
                            Navigator.push(context, MaterialPageRoute(builder: (context) => ConsultationDetailScreen(consultation: item)));
                          },
                          child: ListTile(
                            leading: const CircleAvatar(backgroundColor: Colors.indigo, child: Icon(Icons.person, color: Colors.white)),
                            title: Text(patientName, style: const TextStyle(fontWeight: FontWeight.bold)),
                            subtitle: Text('Motivo: ${item['reason'] ?? 'Sin especificar'}\nEstado: ${item['status']}'),
                            isThreeLine: true,
                            trailing: Text(DateFormat('HH:mm').format(date), style: const TextStyle(color: Colors.indigo, fontWeight: FontWeight.bold, fontSize: 16)),
                          ),
                        ),
                      );
                    },
                  ),
                ),
        ),
      ],
    );
  }

  Widget _buildAgendaView() {
    if (_isLoading) return const Center(child: CircularProgressIndicator());
    final allList = _allConsultations;
    
    return Column(
      children: [
        _buildSearchBar(),
        Expanded(
          child: allList.isEmpty
              ? const Center(child: Text('No hay citas en tu agenda.', style: TextStyle(fontSize: 16, color: Colors.grey)))
              : RefreshIndicator(
                  onRefresh: _fetchConsultations,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: allList.length,
                    itemBuilder: (context, index) {
                      final item = allList[index];
                      final date = DateTime.parse(item['dateTime']).toLocal();
                      final patientName = item['patient']?['user'] != null 
                          ? '${item['patient']['user']['firstName']} ${item['patient']['user']['lastName']}' 
                          : 'Paciente Desconocido';
                      return Card(
                        elevation: 1,
                        margin: const EdgeInsets.only(bottom: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(10),
                          onTap: () {
                            Navigator.push(context, MaterialPageRoute(builder: (context) => ConsultationDetailScreen(consultation: item)));
                          },
                          child: ListTile(
                            title: Text(patientName, style: const TextStyle(fontWeight: FontWeight.bold)),
                            subtitle: Text('${DateFormat('dd/MM/yyyy HH:mm').format(date)}\nEstado: ${item['status']}'),
                            isThreeLine: true,
                            trailing: const Icon(Icons.chevron_right),
                          ),
                        ),
                      );
                    },
                  ),
                ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: _currentIndex == 2 ? null : AppBar(
        title: const Text('Portal Médico'),
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
          _buildTodayView(),
          _buildAgendaView(),
          const AttendanceScreen(),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() {
          _currentIndex = index;
          _searchQuery = ''; // reset search on tab change
        }),
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
