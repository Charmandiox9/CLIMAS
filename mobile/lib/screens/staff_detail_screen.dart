import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class StaffDetailScreen extends StatelessWidget {
  final Map<String, dynamic> staffGroup;

  const StaffDetailScreen({super.key, required this.staffGroup});

  @override
  Widget build(BuildContext context) {
    final user = staffGroup['user'];
    final name = user != null ? '${user['firstName']} ${user['lastName']}' : 'Desconocido';
    final roles = user != null && user['roles'] != null ? user['roles'].join(', ') : 'Sin rol';
    final email = user != null ? user['email'] : 'Sin correo';
    final todayAttendance = staffGroup['todayAttendance'];
    final count = staffGroup['todayConsultationsCount'];
    final List<dynamic> history = staffGroup['attendances'] ?? [];

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
                    const Text('Registro de Hoy', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.indigo)),
                    const Divider(),
                    if (todayAttendance != null) ...[
                      ListTile(
                        leading: Icon(Icons.login, color: todayAttendance['entryTime'] != null ? Colors.green : Colors.grey),
                        title: const Text('Hora de Entrada'),
                        subtitle: Text(todayAttendance['entryTime'] != null ? DateFormat('HH:mm').format(DateTime.parse(todayAttendance['entryTime']).toLocal()) : 'No registrada'),
                      ),
                      ListTile(
                        leading: Icon(Icons.logout, color: todayAttendance['exitTime'] != null ? Colors.red : Colors.grey),
                        title: const Text('Hora de Salida'),
                        subtitle: Text(todayAttendance['exitTime'] != null ? DateFormat('HH:mm').format(DateTime.parse(todayAttendance['exitTime']).toLocal()) : 'No registrada'),
                      ),
                    ] else ...[
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 8.0),
                        child: Text('El usuario no ha registrado asistencia hoy.', style: TextStyle(color: Colors.grey)),
                      ),
                    ],
                    const Divider(),
                    ListTile(
                      leading: const Icon(Icons.event_available, color: Colors.orange),
                      title: const Text('Citas Atendidas Hoy'),
                      trailing: Text(count.toString(), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Historial Reciente (Últimas marcas)', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.indigo)),
                    const Divider(),
                    if (history.isEmpty)
                      const Text('No hay historial disponible.', style: TextStyle(color: Colors.grey))
                    else
                      ...history.map((att) {
                        final attDate = DateTime.parse(att['date']).toLocal();
                        final isToday = attDate.year == DateTime.now().year && attDate.month == DateTime.now().month && attDate.day == DateTime.now().day;
                        if (isToday) return const SizedBox.shrink(); // Ya lo mostramos arriba

                        return ListTile(
                          contentPadding: EdgeInsets.zero,
                          leading: const Icon(Icons.history),
                          title: Text(DateFormat('dd/MM/yyyy').format(attDate), style: const TextStyle(fontWeight: FontWeight.bold)),
                          subtitle: Text('Entrada: ${att['entryTime'] != null ? DateFormat('HH:mm').format(DateTime.parse(att['entryTime']).toLocal()) : '--:--'}\nSalida: ${att['exitTime'] != null ? DateFormat('HH:mm').format(DateTime.parse(att['exitTime']).toLocal()) : '--:--'}'),
                        );
                      }).toList(),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
