import 'package:flutter/material.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import '../services/api_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final ApiService _apiService = ApiService();
  bool _isLoading = false;

  void _login() async {
    setState(() => _isLoading = true);
    try {
      final success = await _apiService.login(
        _emailController.text,
        _passwordController.text,
      );
      if (success && mounted) {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString('token');
        if (token != null) {
          Map<String, dynamic> decodedToken = JwtDecoder.decode(token);
          
          // Obtain and update FCM Token
          try {
            final fcmToken = await FirebaseMessaging.instance.getToken();
            if (fcmToken != null) {
              await _apiService.updateFcmToken(fcmToken);
            }
          } catch(e) {
            print("Could not get or send FCM token: $e");
          }

          List<dynamic> roles = decodedToken['roles'] ?? [];
          if (roles.length > 1) {
            Navigator.pushReplacementNamed(context, '/profile_selection');
          } else if (roles.contains('ADMIN')) {
            Navigator.pushReplacementNamed(context, '/admin');
          } else if (roles.contains('DOCTOR')) {
            Navigator.pushReplacementNamed(context, '/doctor');
          } else {
            Navigator.pushReplacementNamed(context, '/attendance');
          }
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Credenciales inválidas'), backgroundColor: Colors.red),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.grey.shade900 : Colors.indigo.shade50,
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
            decoration: BoxDecoration(
              color: isDark ? Colors.grey.shade800 : Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: isDark ? Colors.black26 : Colors.black12,
                  blurRadius: 15,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.local_hospital, size: 80, color: isDark ? Colors.indigoAccent : Colors.indigo),
                const SizedBox(height: 20),
                Text('CLIMAS', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: isDark ? Colors.indigoAccent : Colors.indigo, letterSpacing: 1.5)),
                Text('Portal del Personal', style: TextStyle(fontSize: 16, color: isDark ? Colors.grey.shade400 : Colors.grey)),
                const SizedBox(height: 40),
                TextField(
                  controller: _emailController,
                  style: TextStyle(color: isDark ? Colors.white : Colors.black),
                  decoration: InputDecoration(
                    labelText: 'Correo Electrónico', 
                    labelStyle: TextStyle(color: isDark ? Colors.grey.shade400 : Colors.grey.shade700),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    prefixIcon: Icon(Icons.email_outlined, color: isDark ? Colors.grey.shade400 : Colors.grey.shade700)
                  ),
                  keyboardType: TextInputType.emailAddress,
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _passwordController,
                  style: TextStyle(color: isDark ? Colors.white : Colors.black),
                  decoration: InputDecoration(
                    labelText: 'Contraseña', 
                    labelStyle: TextStyle(color: isDark ? Colors.grey.shade400 : Colors.grey.shade700),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    prefixIcon: Icon(Icons.lock_outline, color: isDark ? Colors.grey.shade400 : Colors.grey.shade700)
                  ),
                  obscureText: true,
                ),
                const SizedBox(height: 30),
                SizedBox(
                  width: double.infinity,
                  height: 55,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isDark ? Colors.indigoAccent : Colors.indigo,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 2,
                    ),
                    onPressed: _isLoading ? null : _login,
                    child: _isLoading 
                        ? const CircularProgressIndicator(color: Colors.white) 
                        : const Text('Iniciar Sesión', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
