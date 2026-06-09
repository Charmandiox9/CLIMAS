import 'package:flutter/material.dart';
import 'package:local_auth/local_auth.dart';
import 'package:network_info_plus/network_info_plus.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
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
  
  bool _isLoading = false;

  Future<void> _logout() async {
    await _apiService.logout();
    if (mounted) Navigator.pushReplacementNamed(context, '/login');
  }

  Future<void> _verifySecurity() async {
    // Capa 1: Validación de Red Local (BSSID)
    final requiredBssid = dotenv.env['CLINIC_WIFI_BSSID'];
    // Solo valida si se configuro el BSSID en el archivo .env (evita bloqueos si esta vacio o en 00)
    if (requiredBssid != null && requiredBssid.isNotEmpty && requiredBssid != '00:00:00:00:00:00') {
      final currentBssid = await _networkInfo.getWifiBSSID();
      if (currentBssid == null || currentBssid.toLowerCase() != requiredBssid.toLowerCase()) {
        throw Exception('Red no autorizada. Conéctate al Wi-Fi de la clínica.');
      }
    }

    // Capa 2: Validación Biométrica (Huella / Rostro)
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
    setState(() => _isLoading = true);
    try {
      // 1. Pasar filtros de seguridad
      await _verifySecurity();
      
      // 2. Ejecutar petición al backend (NestJS decide qué estado asignar)
      await _apiService.markAttendance();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Asistencia marcada exitosamente', style: TextStyle(color: Colors.white, fontSize: 16)), 
            backgroundColor: Colors.green
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceAll('Exception: ', ''), style: const TextStyle(color: Colors.white, fontSize: 16)), 
            backgroundColor: Colors.red
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mi Jornada'),
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
      body: Center(
        child: _isLoading
            ? const CircularProgressIndicator()
            : Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.blue.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.fingerprint, size: 100, color: Colors.blue),
                  ),
                  const SizedBox(height: 30),
                  const Text(
                    'Registrar Marca',
                    style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 15),
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 40.0),
                    child: Text(
                      'Al presionar el botón, validaremos tu identidad (biometría) y tu ubicación (Wi-Fi local) para registrar tu estado.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.grey, fontSize: 16),
                    ),
                  ),
                  const SizedBox(height: 50),
                  SizedBox(
                    width: 250,
                    height: 60,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                        elevation: 5,
                      ),
                      icon: const Icon(Icons.touch_app, size: 28),
                      label: const Text('MARCAR AHORA', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      onPressed: _markAttendance,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
