import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:jwt_decoder/jwt_decoder.dart';

class ProfileSelectionScreen extends StatefulWidget {
  const ProfileSelectionScreen({super.key});

  @override
  State<ProfileSelectionScreen> createState() => _ProfileSelectionScreenState();
}

class _ProfileSelectionScreenState extends State<ProfileSelectionScreen> {
  List<String> _roles = [];

  @override
  void initState() {
    super.initState();
    _loadRoles();
  }

  Future<void> _loadRoles() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token != null) {
      Map<String, dynamic> decodedToken = JwtDecoder.decode(token);
      setState(() {
        _roles = List<String>.from(decodedToken['roles'] ?? []);
      });
    }
  }

  void _selectProfile(String role) {
    if (role == 'ADMIN') {
      Navigator.pushReplacementNamed(context, '/admin');
    } else if (role == 'DOCTOR') {
      Navigator.pushReplacementNamed(context, '/doctor');
    } else {
      Navigator.pushReplacementNamed(context, '/attendance');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.indigo.shade50,
      body: SafeArea(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                '¿Con qué perfil deseas ingresar?',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.indigo),
              ),
              const SizedBox(height: 40),
              if (_roles.contains('ADMIN'))
                _buildProfileCard('Administrador', Icons.admin_panel_settings, 'ADMIN'),
              if (_roles.contains('DOCTOR'))
                _buildProfileCard('Doctor', Icons.medical_services, 'DOCTOR'),
              if (_roles.contains('WORKER'))
                _buildProfileCard('Personal General', Icons.badge, 'WORKER'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProfileCard(String title, IconData icon, String role) {
    return GestureDetector(
      onTap: () => _selectProfile(role),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 40, vertical: 10),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 5)),
          ],
        ),
        child: Row(
          children: [
            Icon(icon, size: 40, color: Colors.indigo),
            const SizedBox(width: 20),
            Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const Spacer(),
            const Icon(Icons.arrow_forward_ios, color: Colors.grey, size: 16),
          ],
        ),
      ),
    );
  }
}
