import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:jwt_decoder/jwt_decoder.dart';

class ApiService {
  final String baseUrl = dotenv.env['API_URL'] ?? 'http://10.0.2.2:3000/api';

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  Future<bool> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      final data = jsonDecode(response.body);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', data['access_token'] ?? data['token']);
      return true;
    }
    return false;
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
  }

  Future<Map<String, dynamic>> markAttendance() async {
    final token = await _getToken();
    final response = await http.post(
      Uri.parse('$baseUrl/attendance/mark'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['message'] ?? 'Error al marcar asistencia');
    }
  }

  Future<List<dynamic>> getHistory() async {
    final token = await _getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/attendance/history'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    return [];
  }

  Future<List<dynamic>> getMyConsultations() async {
    final token = await _getToken();
    if (token == null) return [];
    
    final decoded = JwtDecoder.decode(token);
    final userId = decoded['sub'];

    final response = await http.get(
      Uri.parse('$baseUrl/consultation/user/$userId'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    return [];
  }

  Future<List<dynamic>> getAllConsultations() async {
    final token = await _getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/consultation'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    return [];
  }

  Future<List<dynamic>> getAllAttendances() async {
    final token = await _getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/attendance/all'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    return [];
  }

  Future<void> updateFcmToken(String token) async {
    try {
      await _patch('/user/me/fcm-token', {'token': token});
    } catch (e) {
      print('Error updating FCM token: $e');
    }
  }

  Future<http.Response> _patch(String endpoint, Map<String, dynamic> body) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    
    return http.patch(
      Uri.parse('$baseUrl$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode(body),
    );
  }

  Future<void> saveMedicalRecord(Map<String, dynamic> payload) async {
    final token = await _getToken();
    final response = await http.post(
      Uri.parse('$baseUrl/medical-record'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode(payload),
    );
    if (response.statusCode != 201 && response.statusCode != 200) {
      throw Exception('Failed to save medical record: ${response.body}');
    }
  }

  Future<void> sendGlobalNotification(String title, String body) async {
    final token = await _getToken();
    final response = await http.post(
      Uri.parse('$baseUrl/notifications/send-global'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'title': title,
        'body': body,
      }),
    );
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('Failed to send notification: ${response.body}');
    }
  Future<List<dynamic>> getAllStaff() async {
    final token = await _getToken();
    if (token == null) return [];
    final response = await http.get(
      Uri.parse('$baseUrl/user/staff'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    return [];
  }
}
