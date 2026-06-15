import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class StaffDetailScreen extends StatelessWidget {
  final Map<String, dynamic> staff;

  const StaffDetailScreen({super.key, required this.staff});

  @override
  Widget build(BuildContext context) {
    final user = staff['user'];
    final name = user != null ? '${user['firstName']} ${user['lastName']}' : 'Desconocido';
    final roles = user != null && user['roles'] != null ? user['roles'].join(', ') : 'Sin rol';
    final email = user != null ? user['email'] : 'Sin correo';
    final date = DateTime.parse(staff['date']).toLocal();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Perfil del Personal'),
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            const CircleAvatar(
              radius: 50,
              backgroundColor: Colors.indigo,
              child: Icon(Icons.person, size: 50, color: Colors.white),
            ),
            const SizedBox(height: 16),
            Text(name, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            Text(roles, style: const TextStyle(fontSize: 16, color: Colors.grey)),
            Text(email, style: const TextStyle(fontSize: 16, color: Colors.grey)),
            const SizedBox(height: 24),
            Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Registro del Día', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.indigo)),
                    const Divider(),
                    ListTile(
                      leading: const Icon(Icons.calendar_today, color: Colors.indigo),
                      title: Text(DateFormat('dd/MM/yyyy').format(date)),
                      subtitle: const Text('Fecha actual'),
                    ),
                    ListTile(
                      leading: Icon(Icons.login, color: staff['entryTime'] != null ? Colors.green : Colors.grey),
                      title: const Text('Hora de Entrada'),
                      subtitle: Text(staff['entryTime'] != null ? DateFormat('HH:mm').format(DateTime.parse(staff['entryTime']).toLocal()) : 'No registrada'),
                    ),
                    ListTile(
                      leading: Icon(Icons.logout, color: staff['exitTime'] != null ? Colors.red : Colors.grey),
                      title: const Text('Hora de Salida'),
                      subtitle: Text(staff['exitTime'] != null ? DateFormat('HH:mm').format(DateTime.parse(staff['exitTime']).toLocal()) : 'No registrada'),
                    ),
                  ],
                ),
              ),
            )
          ],
        ),
      ),
    );
  }
}
