# CLIMAS Mobile App (Flutter)

Esta es la aplicación móvil oficial para el personal de la clínica, desarrollada en Flutter.

## Requisitos Previos
- **Flutter SDK** (>= 3.0.0)
- **Android Studio** (Con emulador o dispositivo físico)
- Conexión a la API del backend NestJS local o remota.

---

## Configuracion e Instalacion

### 1. Clonar e Instalar
En la terminal (dentro de esta carpeta `/mobile`), descarga las dependencias:
```bash
flutter pub get
```

### 2. Variables de Entorno (.env)
La aplicación utiliza `flutter_dotenv` para manejar la URL del servidor y otras configuraciones. 
1. Crea un archivo llamado `.env` en la raíz de esta carpeta `/mobile`.
2. Copia el formato del archivo `.env.example`:

```env
# URL de la API de NestJS
API_URL=http://10.0.2.2:3000/api
# Nota: Si usas el emulador de Android, '10.0.2.2' apunta al localhost de tu PC.
# Si pruebas en un celular real, pon la IP local de tu PC (ej. http://192.168.1.5:3000/api)

# BSSID (Dirección MAC del Wi-Fi de la clínica) para validación
CLINIC_WIFI_BSSID=00:14:22:01:23:45
```

### 3. Permisos Nativos
Como usamos biometría y escaneo de red, se requiere aceptar permisos en el dispositivo físico. 
*(Estos permisos ya estarán configurados en el código, la app los pedirá automáticamente al iniciar).*

---

## Ejecutar la Aplicacion

Con un emulador abierto o tu teléfono conectado por USB, ejecuta:
```bash
flutter run
```

O simplemente dale al botón "Play" (Run) desde **Android Studio** o **VS Code**.

---

## Estructura del Codigo
- `lib/screens/`: Contiene las vistas de la app (Login, Pantalla de Asistencia).
- `lib/services/`: Lógica pura y llamadas HTTP a tu backend (API Service, Auth Service).
- `lib/utils/`: Funciones compartidas y validadores (chequeo de BSSID, biometría).
