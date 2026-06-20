import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:intl/intl.dart';
import 'package:table_calendar/table_calendar.dart';
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
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;

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
      final date = DateTime.parse(c['dateTime']).toLocal();
      if (_selectedDay != null) {
        if (date.year != _selectedDay!.year || date.month != _selectedDay!.month || date.day != _selectedDay!.day) {
          return false;
        }
      }
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
                            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                            leading: CircleAvatar(
                              backgroundColor: Colors.indigo.shade100,
                              child: Text(patientName[0].toUpperCase(), style: const TextStyle(color: Colors.indigo, fontWeight: FontWeight.bold)),
                            ),
                            title: Text(patientName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    const Icon(Icons.access_time, size: 16, color: Colors.grey),
                                    const SizedBox(width: 4),
                                    Text(DateFormat('HH:mm').format(date)),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text('Motivo: ${item['reason'] ?? 'Sin especificar'}', maxLines: 1, overflow: TextOverflow.ellipsis),
                              ],
                            ),
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

  Widget _buildAgendaView() {
    if (_isLoading) return const Center(child: CircularProgressIndicator());
    final allList = _allConsultations;
    
    return SafeArea(
      child: OrientationBuilder(
        builder: (context, orientation) {
          final isLandscape = orientation == Orientation.landscape;
          
          final calendarWidget = TableCalendar(
            firstDay: DateTime.utc(2020, 1, 1),
            lastDay: DateTime.utc(2030, 12, 31),
            focusedDay: _focusedDay,
            selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
            calendarFormat: isLandscape ? CalendarFormat.week : CalendarFormat.month,
            availableCalendarFormats: const {
              CalendarFormat.month: 'Mes',
              CalendarFormat.week: 'Semana',
            },
            onDaySelected: (selectedDay, focusedDay) {
              setState(() {
                if (isSameDay(_selectedDay, selectedDay)) {
                  _selectedDay = null; // deseleccionar
                } else {
                  _selectedDay = selectedDay;
                }
                _focusedDay = focusedDay;
              });
            },
            onPageChanged: (focusedDay) {
              _focusedDay = focusedDay;
            },
          );

          final listWidget = Expanded(
            child: allList.isEmpty
                ? const Center(child: Text('No hay citas para esta fecha.', style: TextStyle(fontSize: 16, color: Colors.grey)))
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
          );

          if (isLandscape) {
            return Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  flex: 1,
                  child: SingleChildScrollView(
                    child: Column(
                      children: [
                        calendarWidget,
                        _buildSearchBar(),
                      ],
                    ),
                  ),
                ),
                listWidget,
              ],
            );
          } else {
            return Column(
              children: [
                calendarWidget,
                _buildSearchBar(),
                listWidget,
              ],
            );
          }
        },
      ),
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
