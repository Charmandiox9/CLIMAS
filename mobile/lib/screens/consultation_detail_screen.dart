import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class ConsultationDetailScreen extends StatelessWidget {
  final Map<String, dynamic> consultation;

  const ConsultationDetailScreen({super.key, required this.consultation});

  @override
  Widget build(BuildContext context) {
    final date = DateTime.parse(consultation['dateTime']).toLocal();
    final patient = consultation['patient']?['user'];
    final doctor = consultation['doctor']?['user'];
    
    final patientName = patient != null ? '${patient['firstName']} ${patient['lastName']}' : 'Desconocido';
    final doctorName = doctor != null ? 'Dr. ${doctor['firstName']} ${doctor['lastName']}' : 'Desconocido';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalle de la Cita'),
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildInfoCard(context, 'Información del Paciente', Icons.person, [
              'Nombre: $patientName',
              'Motivo de consulta: ${consultation['reason'] ?? 'No especificado'}',
            ]),
            const SizedBox(height: 16),
            _buildInfoCard(context, 'Detalles de la Cita', Icons.event, [
              'Fecha: ${DateFormat('dd/MM/yyyy').format(date)}',
              'Hora: ${DateFormat('HH:mm').format(date)}',
              'Estado: ${consultation['status']}',
              'Atiende: $doctorName',
            ]),
            const SizedBox(height: 16),
            _buildClinicalHistory(context),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard(BuildContext context, String title, IconData icon, List<String> details) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: isDark ? Colors.indigoAccent : Colors.indigo),
                const SizedBox(width: 8),
                Text(title, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: isDark ? Colors.indigoAccent : Colors.indigo)),
              ],
            ),
            const Divider(),
            ...details.map((d) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 4.0),
              child: Text(d, style: const TextStyle(fontSize: 16)),
            )),
          ],
        ),
      ),
    );
  }

  Widget _buildClinicalHistory(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Card(
      elevation: 2,
      color: isDark ? Colors.indigo.shade900.withOpacity(0.3) : Colors.indigo.shade50,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.medical_information, color: isDark ? Colors.indigoAccent : Colors.indigo.shade700),
                const SizedBox(width: 8),
                Text('Historial Clínico Rápido', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: isDark ? Colors.indigoAccent : Colors.indigo.shade700)),
              ],
            ),
            const Divider(),
            const Text('Evolución y Notas:', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            TextField(
              maxLines: 4,
              decoration: InputDecoration(
                hintText: 'Escriba las notas clínicas aquí...',
                filled: true,
                fillColor: isDark ? Colors.grey.shade800 : Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Historial guardado exitosamente (Mock)')));
                },
                icon: const Icon(Icons.save),
                label: const Text('Guardar Historial'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.indigo,
                  foregroundColor: Colors.white,
                ),
              ),
            )
          ],
        ),
      ),
    );
  }
}
