import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:image_picker/image_picker.dart';
import 'package:gal/gal.dart';
import 'dart:io';
import '../services/api_service.dart';

class ConsultationDetailScreen extends StatefulWidget {
  final Map<String, dynamic> consultation;

  const ConsultationDetailScreen({super.key, required this.consultation});

  @override
  State<ConsultationDetailScreen> createState() => _ConsultationDetailScreenState();
}

class _ConsultationDetailScreenState extends State<ConsultationDetailScreen> {
  final ImagePicker _picker = ImagePicker();
  final List<File> _attachedMedia = [];
  final TextEditingController _notesController = TextEditingController();
  final ApiService _apiService = ApiService();
  bool _isSaving = false;

  Future<void> _takeMedia({required bool isVideo}) async {
    try {
      // Pedimos permiso de galeria/fotos primero para asegurar que Gal puede guardar
      final hasAccess = await Gal.hasAccess(toAlbum: true);
      if (!hasAccess) {
        final request = await Gal.requestAccess(toAlbum: true);
        if (!request) {
          if (!mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Se requieren permisos de almacenamiento para guardar la evidencia.')),
          );
          return;
        }
      }

      final XFile? file = isVideo 
          ? await _picker.pickVideo(source: ImageSource.camera)
          : await _picker.pickImage(source: ImageSource.camera);

      if (file != null) {
        // 1. Guardar localmente en la galería del dispositivo
        if (isVideo) {
          await Gal.putVideo(file.path);
        } else {
          await Gal.putImage(file.path);
        }

        // 2. Mantener referencia para subir a la BD (Firebase/Backend) en el futuro
        setState(() {
          _attachedMedia.add(File(file.path));
        });

        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${isVideo ? "Video" : "Foto"} guardada en el dispositivo y adjuntada a la ficha.'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al capturar evidencia: $e'), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final date = DateTime.parse(widget.consultation['dateTime']).toLocal();
    final patient = widget.consultation['patient']?['user'];
    final doctor = widget.consultation['doctor']?['user'];
    
    final patientName = patient != null ? '${patient['firstName']} ${patient['lastName']}' : 'Desconocido';
    final doctorName = doctor != null ? 'Dr. ${doctor['firstName']} ${doctor['lastName']}' : 'Desconocido';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Ficha Clínica'),
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
              'Motivo de consulta: ${widget.consultation['reason'] ?? 'No especificado'}',
            ]),
            const SizedBox(height: 16),
            _buildInfoCard(context, 'Detalles de la Cita', Icons.event, [
              'Fecha: ${DateFormat('dd/MM/yyyy').format(date)}',
              'Hora: ${DateFormat('HH:mm').format(date)}',
              'Estado: ${widget.consultation['status']}',
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
              controller: _notesController,
              maxLines: 4,
              decoration: InputDecoration(
                hintText: 'Escriba las notas clínicas aquí...',
                filled: true,
                fillColor: isDark ? Colors.grey.shade800 : Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
              ),
            ),
            const SizedBox(height: 16),
            const Text('Evidencia Clínica Adjunta:', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _takeMedia(isVideo: false),
                    icon: const Icon(Icons.camera_alt),
                    label: const Text('Tomar Foto'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _takeMedia(isVideo: true),
                    icon: const Icon(Icons.videocam),
                    label: const Text('Grabar Video'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            if (_attachedMedia.isNotEmpty)
              Wrap(
                spacing: 8,
                children: _attachedMedia.map((file) {
                  final isVideo = file.path.endsWith('.mp4');
                  return Chip(
                    avatar: Icon(isVideo ? Icons.movie : Icons.image, size: 16),
                    label: Text(file.path.split('/').last, overflow: TextOverflow.ellipsis),
                    onDeleted: () {
                      setState(() {
                        _attachedMedia.remove(file);
                      });
                    },
                  );
                }).toList(),
              ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _isSaving ? null : () async {
                  if (_notesController.text.trim().isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Por favor escribe algunas notas clínicas.')),
                    );
                    return;
                  }

                  setState(() => _isSaving = true);
                  
                  try {
                    List<String> localMediaPaths = _attachedMedia.map((file) => file.path).toList();

                    // Enviar al Backend (usando las rutas locales del móvil como referencia, o ninguna si lo dejamos solo local)
                    await _apiService.saveMedicalRecord({
                      'consultationId': widget.consultation['id'],
                      'clinicalNotes': _notesController.text.trim(),
                      'mediaUrls': localMediaPaths,
                    });

                    if (!mounted) return;
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Ficha guardada exitosamente.'), backgroundColor: Colors.green),
                    );
                    Navigator.pop(context);

                  } catch (e) {
                    if (!mounted) return;
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Error al guardar: $e'), backgroundColor: Colors.red),
                    );
                  } finally {
                    if (mounted) setState(() => _isSaving = false);
                  }
                },
                icon: _isSaving 
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Icon(Icons.cloud_upload),
                label: Text(_isSaving ? 'Guardando...' : 'Guardar Historial'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.indigo,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
              ),
            )
          ],
        ),
      ),
    );
  }
}
