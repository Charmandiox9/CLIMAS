import 'package:flutter/material.dart';
import 'package:local_auth/local_auth.dart';
import 'package:network_info_plus/network_info_plus.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';

class AttendanceScreen extends StatefulWidget {
  const AttendanceScreen({super.key});

  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  final ApiService _apiService = ApiService();
  final LocalAuthentication _auth = LocalAuthentication();
  final NetworkInfo _networkInfo = NetworkInfo();
  
  bool _isLoading = true;
  Map<String, dynamic>? _todayRecord;

  @override
  void initState() {
    super.initState();
    _fetchTodayAttendance();
  }

  Future<void> _fetchTodayAttendance() async {
    setState(() => _isLoading = true);
    try {
      final history = await _apiService.getHistory();
      if (history.isNotEmpty) {
        final firstRecord = history[0];
        final recordDate = DateTime.parse(firstRecord['date']).toLocal();
        final now = DateTime.now();
        if (recordDate.year == now.year && recordDate.month == now.month && recordDate.day == now.day) {
          _todayRecord = firstRecord;
        } else {
          _todayRecord = null;
        }
      }
    } catch (e) {
      print('Error fetching attendance: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _logout() async {
    await _apiService.logout();
    if (mounted) Navigator.pushReplacementNamed(context, '/login');
  }

  Future<void> _verifySecurity() async {
    final requiredBssid = dotenv.env['CLINIC_WIFI_BSSID'];
    if (requiredBssid != null && requiredBssid.isNotEmpty && requiredBssid != '00:00:00:00:00:00') {
      final currentBssid = await _networkInfo.getWifiBSSID();
      if (currentBssid == null || currentBssid.toLowerCase() != requiredBssid.toLowerCase()) {
        throw Exception('Red no autorizada. Conéctate al Wi-Fi de la clínica.');
      }
    }

    final canCheckBiometrics = await _auth.canCheckBiometrics;
    final isDeviceSupported = await _auth.isDeviceSupported();
    
    if (canCheckBiometrics && isDeviceSupported) {
      final didAuthenticate = await _auth.authenticate(
        localizedReason: 'Identifícate para registrar tu asistencia',
        options: const AuthenticationOptions(
          biometricOnly: false,
          useErrorDialogs: true,
          stickyAuth: true,
        ),
      );
      if (!didAuthenticate) {
        throw Exception('Autenticación biométrica fallida o cancelada.');
      }
    }
  }

  void _markAttendance() async {
    if (_todayRecord != null && _todayRecord!['exitTime'] != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Ya completaste todas tus marcas de hoy.'), backgroundColor: Colors.orange),
      );
      return;
    }

    setState(() => _isLoading = true);
    try {
      await _verifySecurity();
      await _apiService.markAttendance();
      await _fetchTodayAttendance();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Asistencia registrada exitosamente'), 
            backgroundColor: Colors.green
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceAll('Exception: ', '')), 
            backgroundColor: Colors.red
          ),
        );
        setState(() => _isLoading = false);
      }
    }
  }

  Widget _buildStepCard(String title, String? timeString, IconData icon, bool isLast) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isDone = timeString != null;
    final formattedTime = isDone ? DateFormat('HH:mm').format(DateTime.parse(timeString).toLocal()) : '--:--';

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: isDone ? Colors.green : (isDark ? Colors.grey.shade800 : Colors.grey.shade300),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: Colors.white, size: 24),
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 40,
                color: isDone ? Colors.green : (isDark ? Colors.grey.shade800 : Colors.grey.shade300),
              )
          ],
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.only(top: 8.0, bottom: 24.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(title, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: isDark ? Colors.white : Colors.black87)),
                Text(formattedTime, style: TextStyle(fontSize: 18, color: isDone ? Colors.green : Colors.grey, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mi Jornada'),
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.history),
            tooltip: 'Ver Historial',
            onPressed: () => Navigator.pushNamed(context, '/history'),
          ),
          IconButton(
            icon: const Icon(Icons.logout), 
            tooltip: 'Cerrar Sesión',
            onPressed: _logout,
          ),
        ],
      ),
      body: _isLoading && _todayRecord == null
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchTodayAttendance,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  children: [
                    Text(
                      DateFormat('EEEE, d MMMM yyyy', 'es').format(DateTime.now()).toUpperCase(),
                      style: TextStyle(fontSize: 16, color: Colors.grey.shade600, fontWeight: FontWeight.bold, letterSpacing: 1),
                    ),
                    const SizedBox(height: 30),
                    
                    // Timeline
                    _buildStepCard('Entrada', _todayRecord?['entryTime'], Icons.login, false),
                    _buildStepCard('Inicio Colación', _todayRecord?['lunchStartTime'], Icons.restaurant, false),
                    _buildStepCard('Fin Colación', _todayRecord?['lunchEndTime'], Icons.restaurant_menu, false),
                    _buildStepCard('Salida', _todayRecord?['exitTime'], Icons.logout, true),

                    const SizedBox(height: 40),
                    
                    // Botón Central
                    GestureDetector(
                      onTap: _isLoading ? null : _markAttendance,
                      child: Container(
                        height: 200,
                        width: 200,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isDark ? Colors.indigo.shade800 : Colors.white,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.indigo.withOpacity(0.3),
                              blurRadius: 30,
                              spreadRadius: 10,
                            )
                          ],
                        ),
                        child: _isLoading 
                            ? const Center(child: CircularProgressIndicator()) 
                            : Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.fingerprint, size: 80, color: isDark ? Colors.indigoAccent : Colors.indigo),
                                  const SizedBox(height: 10),
                                  Text(
                                    _todayRecord?['exitTime'] != null ? 'Completado' : 'Registrar',
                                    style: TextStyle(
                                      color: isDark ? Colors.white : Colors.indigo, 
                                      fontSize: 20, 
                                      fontWeight: FontWeight.bold
                                    ),
                                  )
                                ],
                              ),
                      ),
                    ),
                    const SizedBox(height: 30),
                    const Text('Ubica tu dedo o usa tu rostro para validar', style: TextStyle(color: Colors.grey)),
                  ],
                ),
              ),
            ),
    );
  }
}
