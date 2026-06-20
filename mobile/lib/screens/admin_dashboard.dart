import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:intl/intl.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../services/api_service.dart';
import 'attendance_screen.dart';
import 'consultation_detail_screen.dart';
import 'staff_detail_screen.dart';
import '../widgets/admin_notification_dialog.dart';

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
  List<dynamic> _staff = [];
  bool _isLoading = true;
  String _searchQuery = '';

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
      final staffList = await _apiService.getAllStaff();
      if (mounted) {
        setState(() {
          _attendances = atts;
          _consultations = cons;
          _staff = staffList;
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

  Widget _buildSearchBar(String hint) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: TextField(
        onChanged: (val) => setState(() => _searchQuery = val),
        decoration: InputDecoration(
          hintText: hint,
          prefixIcon: const Icon(Icons.search),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          filled: true,
        ),
      ),
    );
  }

  void _showDailyQrCode() {
    final now = DateTime.now();
    final todayString = "${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}";
    final qrData = "CLIMAS-ATTENDANCE-$todayString";

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('QR de Asistencia (Hoy)', textAlign: TextAlign.center),
        content: SizedBox(
          width: 250,
          height: 250,
          child: QrImageView(
            data: qrData,
            version: QrVersions.auto,
            size: 250.0,
            backgroundColor: Colors.white,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cerrar'),
          ),
        ],
      ),
    );
  }

  void _showNotificationDialog() {
    final titleCtrl = TextEditingController();
    final bodyCtrl = TextEditingController();
    bool isSending = false;

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: const Text('Enviar Notificación Global'),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    controller: titleCtrl,
                    decoration: const InputDecoration(labelText: 'Título', border: OutlineInputBorder()),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: bodyCtrl,
                    decoration: const InputDecoration(labelText: 'Mensaje', border: OutlineInputBorder()),
                    maxLines: 3,
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: isSending ? null : () => Navigator.pop(context),
                  child: const Text('Cancelar'),
                ),
                ElevatedButton(
                  onPressed: isSending ? null : () async {
                    if (titleCtrl.text.isEmpty || bodyCtrl.text.isEmpty) return;
                    setDialogState(() => isSending = true);
                    try {
                      await _apiService.sendGlobalNotification(titleCtrl.text, bodyCtrl.text);
                      if (!mounted) return;
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Notificación enviada a todos.'), backgroundColor: Colors.green));
                    } catch (e) {
                      setDialogState(() => isSending = false);
                      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red));
                    }
                  },
                  child: isSending ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('Enviar a Todos'),
                )
              ],
            );
          }
        );
      },
    );
  }

  Widget _buildMetricsView() {
    if (_isLoading) return const Center(child: CircularProgressIndicator());
    final now = DateTime.now();
    
    final todayConsultations = _consultations.where((c) {
      final date = DateTime.parse(c['dateTime']).toLocal();
      return date.year == now.year && date.month == now.month && date.day == now.day;
    }).toList();

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
          const SizedBox(height: 30),
          ElevatedButton.icon(
            onPressed: _showDailyQrCode,
            icon: const Icon(Icons.qr_code_2, size: 28),
            label: const Text('Mostrar QR de Asistencia del Día'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.indigo,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ),
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
    final Map<String, dynamic> staffMap = {};
    for (var user in _staff) {
      final userId = user['id'];
      if (userId == null) continue;
      
      staffMap[userId] = {
        'userId': userId,
        'user': user,
        'attendances': <dynamic>[],
        'todayAttendance': null,
        'todayConsultationsCount': 0,
      };
      
      // Contar citas de hoy si es doctor
      final now = DateTime.now();
      int count = 0;
      for (var c in _consultations) {
        final docUserId = c['doctor']?['userId'];
        if (docUserId == userId) {
          final cDate = DateTime.parse(c['dateTime']).toLocal();
          if (cDate.year == now.year && cDate.month == now.month && cDate.day == now.day) {
            count++;
          }
        }
      }
      staffMap[userId]['todayConsultationsCount'] = count;
    }
    
    for (var item in _attendances) {
      final userId = item['userId'];
      if (userId == null || !staffMap.containsKey(userId)) continue;
      
      staffMap[userId]['attendances'].add(item);
      
      // Chequear si es de hoy para setearlo
      final date = DateTime.parse(item['date']).toLocal();
      final now = DateTime.now();
      if (date.year == now.year && date.month == now.month && date.day == now.day) {
        staffMap[userId]['todayAttendance'] = item;
      }
    }

    final uniqueStaffList = staffMap.values.where((staff) {
      if (_searchQuery.isEmpty) return true;
      final user = staff['user'];
      final name = user != null ? '${user['firstName']} ${user['lastName']}'.toLowerCase() : '';
      return name.contains(_searchQuery.toLowerCase());
    }).toList();

    return Column(
      children: [
        _buildSearchBar('Buscar empleado...'),
        Expanded(
          child: uniqueStaffList.isEmpty
              ? const Center(child: Text('No hay registros coincidentes.', style: TextStyle(fontSize: 16, color: Colors.grey)))
              : RefreshIndicator(
                  onRefresh: _fetchAdminData,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: uniqueStaffList.length,
                    itemBuilder: (context, index) {
                      final staffGroup = uniqueStaffList[index];
                      final user = staffGroup['user'];
                      final name = user != null ? '${user['firstName']} ${user['lastName']}' : 'Usuario Desconocido';
                      final roles = user != null && user['roles'] != null ? user['roles'].join(', ') : 'Sin rol';
                      
                      final todayAttendance = staffGroup['todayAttendance'];
                      final count = staffGroup['todayConsultationsCount'];
                      
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(12),
                          onTap: () {
                            Navigator.push(context, MaterialPageRoute(builder: (context) => StaffDetailScreen(staffGroup: staffGroup)));
                          },
                          child: ListTile(
                            leading: const CircleAvatar(backgroundColor: Colors.indigo, child: Icon(Icons.badge, color: Colors.white)),
                            title: Text(name, style: const TextStyle(fontWeight: FontWeight.bold)),
                            subtitle: Text('$roles\nCitas hoy: $count'),
                            trailing: todayAttendance != null && todayAttendance['entryTime'] != null 
                                ? Text('Entró: ${DateFormat('HH:mm').format(DateTime.parse(todayAttendance['entryTime']).toLocal())}', style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold))
                                : const Text('Sin entrada hoy', style: TextStyle(color: Colors.red)),
                            isThreeLine: true,
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

  Widget _buildGlobalConsultationsView() {
    if (_isLoading) return const Center(child: CircularProgressIndicator());
    final filtered = _consultations.where((item) {
      if (_searchQuery.isEmpty) return true;
      final patient = item['patient']?['user'];
      final name = patient != null ? '${patient['firstName']} ${patient['lastName']}'.toLowerCase() : '';
      return name.contains(_searchQuery.toLowerCase());
    }).toList();

    return Column(
      children: [
        _buildSearchBar('Buscar paciente...'),
        Expanded(
          child: filtered.isEmpty
              ? const Center(child: Text('No hay citas coincidentes.', style: TextStyle(fontSize: 16, color: Colors.grey)))
              : RefreshIndicator(
                  onRefresh: _fetchAdminData,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) {
                      final item = filtered[index];
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
                        child: InkWell(
                          borderRadius: BorderRadius.circular(10),
                          onTap: () {
                            Navigator.push(context, MaterialPageRoute(builder: (context) => ConsultationDetailScreen(consultation: item)));
                          },
                          child: ListTile(
                            title: Text('Paciente: $patientName', style: const TextStyle(fontWeight: FontWeight.bold)),
                            subtitle: Text('Dr. $doctorName\n${DateFormat('dd/MM/yyyy HH:mm').format(date)} - ${item['status']}'),
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
        onTap: (index) => setState(() {
          _currentIndex = index;
          _searchQuery = ''; // Reset search on tab change
        }),
        selectedItemColor: Colors.indigo,
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: 'Métricas'),
          BottomNavigationBarItem(icon: Icon(Icons.people), label: 'Staff'),
          BottomNavigationBarItem(icon: Icon(Icons.calendar_month), label: 'Citas'),
          BottomNavigationBarItem(icon: Icon(Icons.fingerprint), label: 'Tu Asistencia'),
        ],
      ),
      floatingActionButton: _currentIndex != 3 ? FloatingActionButton.extended(
        onPressed: () {
          showDialog(
            context: context,
            builder: (context) => const AdminNotificationDialog(),
          );
        },
        icon: const Icon(Icons.campaign),
        label: const Text('Notificar'),
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
      ) : null,
    );
  }
}
