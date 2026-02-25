# Sistema de Gestion de Consorcios y Control de Asistencia

Plataforma integral ERP para la administracion de servicios de limpieza en edificios, control de personal mediante validacion geografica y gestion de suministros.

## Descripcion del Proyecto

Este sistema fue desarrollado para optimizar la coordinacion entre la administracion y el personal operativo. Permite el seguimiento en tiempo real de las tareas de mantenimiento, garantizando la presencia del personal en el lugar asignado a traves de herramientas de geolocalizacion y escaneo de codigos QR.

## Capturas de Pantalla

A continuacion se presentan las interfaces principales del sistema:

### Vista del Dashboard (Panel de Control)
![Dashboard Screenshot](screenshots/admin1.png)
*Descripcion: Vista principal del administrador con la matriz de horarios semanal.*

### Liquidacion de Horas
![Liquidacion Screenshot](screenshots/admin2.png)
*Descripcion: Modulo de calculo automatico de haberes basado en horas registradas.*

### Gestion de Insumos
![Insumos Screenshot](screenshots/admin3.png)
*Descripcion: Listado de pedidos y catalogo de articulos de limpieza.*

### Interfaz Mobile (Perspectiva del Empleado)

La aplicacion esta diseñada bajo una filosofia Mobile-First para facilitar el uso del personal en los edificios.

| Escaneo de QR y GPS | Control de horas personal | Pedidos de Insumos |
| :---: | :---: | :---: |
| ![Mobile 1](screenshots/user1.png) | ![Mobile 2](screenshots/user2.png) | ![Mobile 3](screenshots/user3.png) |
| *Validacion de presencia en sitio* | *Control de horas personal* | *Gestion de stock desde el edificio* |

## Funcionalidades Principales

* **Autenticacion:** Diferenciacion de perfiles (Administrador / Empleado) con persistencia en localStorage.
* **Matriz de Horarios:** Visualizacion de cronogramas asignados por empleado y dia de la semana.
* **Geofencing:** Validacion de fichaje solo si el usuario se encuentra en un radio menor a 200 metros del edificio.
* **Gestion de Pedidos:** Sistema de solicitud de materiales con agrupacion por edificio para facilitar la logistica.
* **Modo Adaptativo:** Implementacion de temas claro y oscuro basado en preferencias del usuario.

## Tecnologías Utilizadas

* **Frontend:** Angular 17+ (TypeScript)
* **Backend:** .NET 8.0 / ASP.NET Core (C#)
* **Base de Datos:** SQL Server / Entity Framework Core
* **Estilos:** Bootstrap 5 con diseño Glassmorphism personalizado
* **Validación:** Geolocalización mediante Web API y códigos QR

## Requisitos Técnicos

* **SDK de .NET 8.0** (Para ejecutar el Backend)
* **Node.js 18.x** (Necesario únicamente como entorno de ejecución para el CLI de Angular)
* **SQL Server LocalDB** o una instancia activa de base de datos.

## Instalacion

1. Clonar el repositorio:
   git clone https://github.com/angelini-agus/ServiceTrack

2. Instalar las dependencias de npm:
   npm install

3. Iniciar el servidor de desarrollo:
   ng serve

4. Acceder en el navegador a:
   http://localhost:4200

## Licencia

Este proyecto es para uso educativo y profesional. Consulte el archivo LICENSE para mas detalles.