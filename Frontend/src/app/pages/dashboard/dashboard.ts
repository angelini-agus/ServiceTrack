import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { HttpClientModule } from '@angular/common/http';
import { TaskService } from '../../services/task'; 
import { UserService } from '../../services/user';
// IMPORTAMOS LOS DOS MÓDULOS DE QR (GENERADOR Y ESCÁNER)
import { QRCodeComponent } from 'angularx-qrcode';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // AGREGAMOS ZXingScannerModule AQUÍ 👇
  imports: [CommonModule, HttpClientModule, FormsModule, QRCodeComponent, ZXingScannerModule],
  template: `
    <div class="container mt-5">
      
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>📋 Mis Servicios</h1>
          <p class="text-muted">Hola, <strong>{{ currentUser?.user }}</strong> ({{ currentUser?.role }})</p>
        </div>
        
        <button *ngIf="isAdmin()" class="btn btn-success" (click)="showForm()">
          + Nuevo Servicio
        </button>

        <button *ngIf="!isAdmin()" class="btn btn-primary" (click)="enableScanner()">
          📷 Escanear QR
        </button>
      </div>

      <div *ngIf="isFormVisible && isAdmin()" class="card p-4 mb-4 shadow-sm bg-light border-0">
        <h4 class="mb-3">{{ newTask.id ? '✏️ Editar Servicio' : '✨ Nuevo Servicio' }}</h4>
        
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Título:</label>
            <input type="text" class="form-control" [(ngModel)]="newTask.title" placeholder="Ej: Limpieza General">
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Asignar a:</label>
            <select class="form-select" [(ngModel)]="newTask.assignedUserId">
              <option [ngValue]="null">-- Sin Asignar --</option>
              <option *ngFor="let user of users" [ngValue]="user.id">
                👤 {{ user.fullName }}
              </option>
            </select>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Fecha:</label>
            <input type="date" class="form-control" [(ngModel)]="newTask.scheduledDate">
          </div>
          
          <div class="col-md-6 mb-3">
            <label class="form-label">Ubicación (Nombre):</label>
            <input type="text" class="form-control" [(ngModel)]="newTask.location" placeholder="Ej: Edificio Central">
          </div>
        </div>

        <div class="mb-3 p-3 border rounded bg-white">
            <label class="form-label fw-bold">📍 Coordenadas del Servicio:</label>

            <div class="mb-3">
              <input type="text" 
                     class="form-control border-primary" 
                     placeholder="Ej: -32.95..., -60.62... (Pegar aquí desde Google Maps)" 
                     (input)="parseCoordinates($event)">
              <small class="text-muted">Tip: Copia los números de Google Maps y pégalos aquí.</small>
            </div>
            
            <div class="d-flex gap-2 align-items-end flex-wrap">
              <div class="input-group" style="width: auto;">
                <span class="input-group-text">Lat</span>
                <input type="number" class="form-control" [(ngModel)]="newTask.latitude" placeholder="0.00" style="min-width: 120px;">
              </div>

              <div class="input-group" style="width: auto;">
                <span class="input-group-text">Lng</span>
                <input type="number" class="form-control" [(ngModel)]="newTask.longitude" placeholder="0.00" style="min-width: 120px;">
              </div>

               <button class="btn btn-outline-primary btn-sm ms-2" (click)="getCurrentLocationForTask()">
                📡 Mi Ubicación
              </button>
            </div>
          </div>
        <div class="mb-3">
          <label class="form-label">Descripción:</label>
          <textarea class="form-control" rows="2" [(ngModel)]="newTask.description"></textarea>
        </div>
        
        <div class="form-check mb-3" *ngIf="newTask.id">
          <input class="form-check-input" type="checkbox" [(ngModel)]="newTask.isCompleted" id="checkCompleted">
          <label class="form-check-label" for="checkCompleted">✅ Marcar como Completada</label>
        </div>

        <div class="d-flex gap-2 justify-content-end">
          <button class="btn btn-secondary" (click)="hideForm()">Cancelar</button>
          <button class="btn btn-primary" (click)="saveTask()">Guardar Servicio</button>
        </div>
      </div>

      <div *ngIf="isScanning" class="scanner-overlay">
        <div class="scanner-modal card shadow-lg">
          <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
            <h5 class="mb-0">📷 Escaneando...</h5>
            <button class="btn-close btn-close-white" (click)="disableScanner()"></button>
          </div>
          <div class="card-body p-0 bg-black">
            <zxing-scanner 
                (scanSuccess)="handleQrCodeResult($event)"
                [formats]="allowedFormats">
            </zxing-scanner>
          </div>
          <div class="card-footer text-center">
            <small class="text-muted">Apunta al código QR del servicio</small>
          </div>
        </div>
      </div>

      <div class="card shadow border-0">
        <div class="card-body p-0">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Fecha</th>
                <th>Ubicación</th>
                <th>Servicio</th>
                <th>Estado</th>
                <th class="text-end" *ngIf="isAdmin()">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let task of tasks" [ngClass]="{'table-success': task.isCompleted}">
                <td>{{ task.scheduledDate | date:'dd/MM/yyyy' }}</td>
                <td><span *ngIf="task.location">📍 {{ task.location }}</span></td>
                <td class="fw-bold">{{ task.title }}</td>
                
                <td>
                  <span class="badge rounded-pill" 
                        [ngClass]="task.isCompleted ? 'bg-success' : 'bg-warning text-dark'">
                    {{ task.isCompleted ? 'Completado' : 'Pendiente' }}
                  </span>
                </td>

                <td class="text-end" *ngIf="isAdmin()">
                  <button class="btn btn-sm btn-dark me-2" (click)="openQrModal(task)">🖨️ QR</button>
                  <button class="btn btn-sm btn-outline-danger" (click)="deleteTask(task.id)">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div *ngIf="showQr" class="qr-overlay">
        <div class="qr-modal card shadow-lg p-4 text-center">
          <h3>🖨️ Imprimir Código</h3>
          <qrcode [qrdata]="qrDataString" [width]="256" [errorCorrectionLevel]="'M'"></qrcode>
          <div class="d-flex justify-content-center gap-2 mt-3">
            <button class="btn btn-secondary" (click)="closeQrModal()">Cerrar</button>
            <button class="btn btn-success" (click)="printPage()">🖨️ Imprimir</button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .qr-overlay, .scanner-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.8); z-index: 1000;
      display: flex; justify-content: center; align-items: center;
    }
    .qr-modal { width: 350px; background: white; border-radius: 10px; }
    .scanner-modal { width: 100%; max-width: 500px; overflow: hidden; }
    ::ng-deep video { width: 100%; height: auto; } /* Ajuste para que el video no se desborde */
  `]
})
export class DashboardComponent implements OnInit {
  tasks: any[] = [];
  users: any[] = [];
  isFormVisible: boolean = false;
  currentUser: any = null;
  
  // VARIABLES QR GENERADOR
  showQr: boolean = false;
  qrDataString: string = '';
  
  // VARIABLES SCANNER
  isScanning: boolean = false;
  allowedFormats = [ 11 ]; // 11 = QR_CODE (Formato estándar)

  newTask: any = { 
    title: '', 
    description: '', 
    assignedUserId: null, 
    location: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    latitude: 0,   // <--- NUEVO
    longitude: 0   // <--- NUEVO
  };

  constructor(
    private taskService: TaskService, 
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) this.currentUser = JSON.parse(userJson);
    this.loadData();
  }

  isAdmin() { return this.currentUser?.role === 'Admin'; }

  loadData() {
    this.userService.getUsers().subscribe(u => {
      this.users = u;
      this.fetchTasks();
    });
  }

  fetchTasks() {
    this.taskService.getTasks().subscribe(t => {
      this.tasks = this.isAdmin() ? t : t.filter(x => x.assignedUserId === this.currentUser.id);
      this.cdr.detectChanges();
    });
  }

  // --- LÓGICA DEL SCANNER (LA MAGIA) ✨ ---
  enableScanner() { this.isScanning = true; }
  disableScanner() { this.isScanning = false; }

  handleQrCodeResult(resultString: string) {
    console.log('Código Escaneado:', resultString);

    if (resultString.startsWith('SERVICE-')) {
      const taskId = parseInt(resultString.split('-')[1]);
      const task = this.tasks.find(t => t.id === taskId);

      if (task) {
        this.disableScanner(); // Pausamos la cámara mientras pensamos

        // 1. VERIFICAMOS SI LA TAREA TIENE COORDENADAS GUARDADAS
        // Si es 0,0 asumimos que no requiere validación GPS (o podrías bloquearlo si prefieres)
        if (task.latitude === 0 && task.longitude === 0) {
            this.processCompletion(task); // Pasa directo
            return;
        }

        // 2. PEDIMOS LA UBICACIÓN ACTUAL (MODO ALTA PRECISIÓN)
        if (navigator.geolocation) {
          
          // Opciones para exigir la mejor ubicación posible
          const options = {
            enableHighAccuracy: true, // <--- ESTO ES CLAVE
            timeout: 5000,            // Esperar máx 5 seg
            maximumAge: 0             // No usar caché vieja
          };

          navigator.geolocation.getCurrentPosition((position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            // DEBUG: Muestra en la consola (F12) qué está comparando
            console.log('📍 MI UBICACIÓN REAL:', userLat, userLng);
            console.log('🎯 DESTINO:', task.latitude, task.longitude);

            // 3. CALCULAMOS LA DISTANCIA
            const distance = this.getDistanceFromLatLonInMeters(
              userLat, userLng, 
              task.latitude, task.longitude
            );
            
            // ... resto del código ...

            console.log(`📏 Distancia al objetivo: ${distance.toFixed(2)} metros.`);

            // 4. VALIDAMOS EL RADIO DE 50 METROS
            const MAX_DISTANCE_METERS = 50; 

            if (distance <= MAX_DISTANCE_METERS) {
              // ESTÁ DENTRO DEL RANGO ✅
              this.processCompletion(task);
            } else {
              // ESTÁ LEJOS ❌
              alert(`⚠️ ESTÁS DEMASIADO LEJOS.\n\nEstás a ${Math.round(distance)} metros del lugar.\nAcércate a menos de ${MAX_DISTANCE_METERS}m para confirmar.`);
              this.enableScanner(); // Que intente de nuevo
            }

          }, (error) => {
            alert('❌ Error: Necesitamos tu ubicación GPS para confirmar el servicio.');
            this.enableScanner();
          });
        } else {
          alert('Tu dispositivo no soporta GPS.');
        }

      } else {
        alert('Código QR no reconocido o tarea no asignada.');
        this.disableScanner();
      }
    }
  }

  // Función auxiliar para no repetir código (Completa la tarea en BD)
  processCompletion(task: any) {
    if (confirm(`✅ ¡Ubicación Verificada!\nServicio: "${task.title}"\n¿Marcar como completado?`)) {
      const updatedTask = { ...task, isCompleted: true };
      this.taskService.updateTask(task.id, updatedTask).subscribe({
        next: () => {
          alert('¡Servicio Completado Exitosamente! 🎉');
          this.loadData();
        },
        error: (e) => alert('Error al actualizar: ' + e.message)
      });
    } else {
        this.enableScanner();
    }
  }

  // --- LÓGICA ADMIN ---
  showForm() { this.isFormVisible = true; }
  hideForm() { this.isFormVisible = false; }
  saveTask() {
     this.taskService.createTask(this.newTask).subscribe(() => { this.loadData(); this.hideForm(); });
  }
  getCurrentLocationForTask() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        // Guardamos las coordenadas en la variable del formulario
        this.newTask.latitude = position.coords.latitude;
        this.newTask.longitude = position.coords.longitude;
        
        // Un mensaje para saber que funcionó
        alert(`📍 Ubicación capturada: ${this.newTask.latitude}, ${this.newTask.longitude}`);
      }, (error) => {
        console.error(error);
        alert('No se pudo obtener la ubicación. Revisa los permisos del navegador.');
      });
    } else {
      alert('Tu navegador no soporta geolocalización.');
    }
  }
  deleteTask(id: number) {
    if(confirm('¿Borrar?')) this.taskService.deleteTask(id).subscribe(() => this.loadData());
  }
  openQrModal(task: any) {
    this.qrDataString = `SERVICE-${task.id}`;
    this.showQr = true;
  }
  closeQrModal() { this.showQr = false; }
  printPage() { window.print(); }

  // Función mágica para separar Latitud y Longitud
  parseCoordinates(event: any) {
    const input = event.target.value; // Lo que pegó el usuario
    
    // Si el texto tiene una coma, intentamos separar
    if (input.includes(',')) {
      const parts = input.split(',');
      
      // Limpiamos los espacios en blanco y convertimos a número
      const lat = parseFloat(parts[0].trim());
      const lng = parseFloat(parts[1].trim());

      // Verificamos si son números válidos
      if (!isNaN(lat) && !isNaN(lng)) {
        this.newTask.latitude = lat;
        this.newTask.longitude = lng;
        
        // Opcional: Limpiamos el campo mágico para que se vea limpio
        event.target.value = ''; 
        
        // Aviso visual (opcional)
        // alert('¡Coordenadas detectadas y separadas! 📍'); 
      }
    }
  }

  // Fórmula de Haversine para calcular distancia en metros
  getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // Radio de la tierra en metros
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distancia en metros
    return d;
  }

  deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }

}