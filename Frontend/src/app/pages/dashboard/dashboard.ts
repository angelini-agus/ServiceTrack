import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { HttpClientModule } from '@angular/common/http';
import { TaskService } from '../../services/task'; 
import { UserService } from '../../services/user';
import { QRCodeComponent } from 'angularx-qrcode';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import Swal from 'sweetalert2';
import { ThemeService } from '../../services/theme.service'; // IMPORTAMOS EL SERVICIO

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, QRCodeComponent, ZXingScannerModule],
  template: `
    <button class="btn theme-bg theme-border position-fixed top-0 end-0 m-3 rounded-circle shadow" 
            (click)="themeService.toggleTheme()" style="z-index: 1060; width: 45px; height: 45px; border: 1px solid;">
      <i class="bi fs-5" [ngClass]="themeService.isDark ? 'bi-sun-fill text-warning' : 'bi-moon-stars-fill text-dark'"></i>
    </button>

    <div class="container mt-5 pt-3">
      
      <div class="d-flex justify-content-between align-items-center mb-4 glass-header p-3 rounded-4">
        <div class="d-flex align-items-center gap-3">
          <div class="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
            <i class="bi bi-clipboard2-check fs-3"></i>
          </div>
          <div>
            <h2 class="mb-0 theme-text fw-bold" style="letter-spacing: -0.5px;">Mis Servicios</h2>
            <p class="theme-text-muted mb-0 small">Hola, <strong>{{ currentUser?.user }}</strong> ({{ currentUser?.role }})</p>
          </div>
        </div>
        
        <button *ngIf="isAdmin()" class="btn btn-glass-primary shadow-sm" (click)="showForm()">
          <i class="bi bi-plus-lg me-1"></i> Nuevo Servicio
        </button>
        <button *ngIf="!isAdmin()" class="btn btn-glass-primary shadow-sm" (click)="enableScanner()">
          <i class="bi bi-qr-code-scan me-2"></i> Escanear QR
        </button>
      </div>

      <div *ngIf="isFormVisible && isAdmin()" class="card p-4 mb-4 border-0 glass-card">
        <div class="d-flex align-items-center mb-4">
          <i class="bi text-primary fs-4 me-2" [ngClass]="newTask.id ? 'bi-pencil-square' : 'bi-stars'"></i>
          <h4 class="mb-0 fw-bold theme-text">{{ newTask.id ? 'Editar Servicio' : 'Nuevo Servicio' }}</h4>
        </div>
        
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label fw-semibold theme-text-muted small text-uppercase">Título</label>
            <div class="input-group theme-border" style="border: 1px solid; border-radius: 0.375rem;">
              <span class="input-group-text theme-bg border-0"><i class="bi bi-fonts theme-text-muted"></i></span>
              <input type="text" class="form-control border-0 theme-bg" [(ngModel)]="newTask.title" placeholder="Ej: Limpieza General">
            </div>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label fw-semibold theme-text-muted small text-uppercase">Asignar a</label>
            <div class="input-group theme-border" style="border: 1px solid; border-radius: 0.375rem;">
              <span class="input-group-text theme-bg border-0"><i class="bi bi-person theme-text-muted"></i></span>
              <select class="form-select border-0 theme-bg" [(ngModel)]="newTask.assignedUserId">
                <option [ngValue]="null">-- Sin Asignar --</option>
                <option *ngFor="let user of users" [ngValue]="user.id">{{ user.fullName }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label fw-semibold theme-text-muted small text-uppercase">Fecha</label>
            <div class="input-group theme-border" style="border: 1px solid; border-radius: 0.375rem;">
              <span class="input-group-text theme-bg border-0"><i class="bi bi-calendar-event theme-text-muted"></i></span>
              <input type="date" class="form-control border-0 theme-bg" [(ngModel)]="newTask.scheduledDate">
            </div>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label fw-semibold theme-text-muted small text-uppercase">Ubicación</label>
            <div class="input-group theme-border" style="border: 1px solid; border-radius: 0.375rem;">
              <span class="input-group-text theme-bg border-0"><i class="bi bi-building theme-text-muted"></i></span>
              <input type="text" class="form-control border-0 theme-bg" [(ngModel)]="newTask.location" placeholder="Ej: Edificio Central">
            </div>
          </div>
        </div>

        <div class="mb-3 p-3 rounded-4 border theme-border" style="background: var(--glass-border);">
          <label class="form-label fw-bold text-primary mb-3 d-flex align-items-center">
            <i class="bi bi-geo-alt-fill me-2"></i> Coordenadas GPS
          </label>
          <div class="mb-3">
            <input type="text" class="form-control border-0 shadow-sm theme-bg" placeholder="Pegar aquí coordenadas desde Google Maps (-32.95..., -60.62...)" (input)="parseCoordinates($event)">
          </div>
          <div class="d-flex gap-2 align-items-center flex-wrap">
            <div class="input-group shadow-sm" style="width: auto;">
              <span class="input-group-text theme-bg border-0 theme-text-muted small">Lat</span>
              <input type="number" class="form-control border-0 theme-bg" [(ngModel)]="newTask.latitude" placeholder="0.00" style="max-width: 120px;">
            </div>
            <div class="input-group shadow-sm" style="width: auto;">
              <span class="input-group-text theme-bg border-0 theme-text-muted small">Lng</span>
              <input type="number" class="form-control border-0 theme-bg" [(ngModel)]="newTask.longitude" placeholder="0.00" style="max-width: 120px;">
            </div>
            <button class="btn theme-bg shadow-sm ms-2 text-primary fw-semibold" (click)="getCurrentLocationForTask()">
              <i class="bi bi-crosshair"></i> Mi Ubicación
            </button>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label fw-semibold theme-text-muted small text-uppercase">Descripción</label>
          <textarea class="form-control border theme-border theme-bg" rows="2" [(ngModel)]="newTask.description"></textarea>
        </div>
        
        <div class="form-check form-switch mb-4" *ngIf="newTask.id">
          <input class="form-check-input" type="checkbox" role="switch" [(ngModel)]="newTask.isCompleted" id="checkCompleted">
          <label class="form-check-label fw-semibold ms-2 theme-text" for="checkCompleted">Marcar como Finalizada</label>
        </div>

        <div class="d-flex gap-3 justify-content-end mt-2">
          <button class="btn theme-bg px-4 fw-semibold theme-text-muted" style="border: 1px solid var(--border-color);" (click)="hideForm()">Cancelar</button>
          <button class="btn btn-glass-primary px-4 shadow-sm" (click)="saveTask()">
            <i class="bi bi-check2-all me-1"></i> Guardar Servicio
          </button>
        </div>
      </div>

      <div *ngIf="isScanning" class="scanner-overlay">
        <div class="modal-glass text-center" style="width: 100%; max-width: 500px; padding: 1.5rem;">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0 fw-bold theme-text"><i class="bi bi-camera me-2 text-primary"></i> Lector QR</h5>
            <button class="btn-close" [ngClass]="themeService.isDark ? 'btn-close-white' : ''" (click)="disableScanner()"></button>
          </div>
          <div class="rounded-4 overflow-hidden shadow bg-black border border-secondary border-opacity-25">
            <zxing-scanner (scanSuccess)="handleQrCodeResult($event)" [formats]="allowedFormats"></zxing-scanner>
          </div>
          <p class="theme-text-muted mt-3 mb-0 small"><i class="bi bi-info-circle me-1"></i> Centra el código en la pantalla</p>
        </div>
      </div>

      <div class="card glass-card border-0 mb-5">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table align-middle mb-0 custom-table" [ngClass]="themeService.isDark ? 'table-dark text-white' : 'table-hover'">
              <thead class="bg-transparent">
                <tr>
                  <th class="px-4 py-3 theme-text-muted border-bottom theme-border">FECHA</th>
                  <th class="py-3 theme-text-muted border-bottom theme-border">UBICACIÓN</th>
                  <th class="py-3 theme-text-muted border-bottom theme-border">SERVICIO</th>
                  <th class="py-3 theme-text-muted text-center border-bottom theme-border">ESTADO</th>
                  <th class="px-4 py-3 text-end theme-text-muted border-bottom theme-border" *ngIf="isAdmin()">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let task of tasks" [ngStyle]="{'background-color': 'transparent'}">
                  <td class="px-4 theme-text-muted small fw-medium theme-border">{{ task.scheduledDate | date:'dd/MM/yyyy' }}</td>
                  <td class="theme-border">
                    <span *ngIf="task.location" class="theme-text fw-medium">
                      <i class="bi bi-geo-alt text-primary opacity-75 me-1"></i>{{ task.location }}
                    </span>
                  </td>
                  <td class="fw-bold theme-text theme-border">{{ task.title }}</td>
                  <td class="text-center theme-border">
                    <span class="custom-badge" [ngClass]="task.isCompleted ? 'badge-completed' : 'badge-pending'">
                      <i class="bi" [ngClass]="task.isCompleted ? 'bi-check2-circle' : 'bi-hourglass-split'"></i>
                      {{ task.isCompleted ? 'Completado' : 'Pendiente' }}
                    </span>
                  </td>
                  <td class="px-4 text-end theme-border" *ngIf="isAdmin()">
                    <button class="btn btn-action-qr me-2" (click)="openQrModal(task)" title="Imprimir QR">
                      <i class="bi bi-qr-code"></i>
                    </button>
                    <button class="btn btn-action-danger" (click)="deleteTask(task.id)" title="Eliminar">
                      <i class="bi bi-trash3"></i>
                    </button>
                  </td>
                </tr>
                <tr *ngIf="tasks.length === 0">
                  <td colspan="5" class="text-center py-5 theme-text-muted theme-border">
                    <i class="bi bi-inbox fs-1 d-block mb-2 opacity-50"></i>
                    No hay servicios para mostrar.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div *ngIf="showQr" class="qr-overlay">
        <div class="modal-glass text-center">
          <h4 class="fw-bold theme-text mb-4"><i class="bi bi-printer text-primary me-2"></i>Imprimir Código</h4>
          <div class="bg-white p-3 rounded-4 shadow-sm d-inline-block mb-4 border">
             <qrcode [qrdata]="qrDataString" [width]="220" [errorCorrectionLevel]="'M'"></qrcode>
          </div>
          <p class="theme-text-muted small mb-4 theme-bg rounded-pill py-1 px-3 d-inline-block border theme-border">ID: {{qrDataString}}</p>
          <div class="d-flex justify-content-center gap-3">
            <button class="btn theme-bg px-4 fw-semibold theme-text-muted" style="border: 1px solid var(--border-color);" (click)="closeQrModal()">Cerrar</button>
            <button class="btn btn-glass-primary px-4 shadow-sm" (click)="printPage()">
              <i class="bi bi-printer me-1"></i> Imprimir
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .glass-header {
      background: var(--glass-bg);
      backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
      border: 1px solid var(--glass-border);
      transition: background 0.4s ease, border-color 0.4s ease;
    }
    
    .glass-card {
      background: var(--glass-bg);
      backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
      border-radius: 20px; border: 1px solid var(--glass-border);
      box-shadow: 0 4px 15px 0 rgba(0,0,0, 0.1);
      transition: background 0.4s ease, border-color 0.4s ease;
      overflow: hidden;
    }

    .btn { transition: transform 0.1s ease, box-shadow 0.2s ease; border-radius: 12px; }
    .btn:active { transform: scale(0.96); }

    .btn-glass-primary {
      background: linear-gradient(135deg, #8a73ff 0%, #6851d8 100%); color: white; border: none; font-weight: 600;
    }
    .btn-glass-primary:hover { background: linear-gradient(135deg, #7b62f0 0%, #5841c7 100%); color: white; }

    .btn-action-qr { background: rgba(138, 115, 255, 0.15); color: #8a73ff; border: none; border-radius: 10px; padding: 0.4rem 0.8rem; }
    .btn-action-qr:hover { background: rgba(138, 115, 255, 0.3); color: #8a73ff; }

    .btn-action-danger { background: rgba(220, 53, 69, 0.15); color: #dc3545; border: none; border-radius: 10px; padding: 0.4rem 0.8rem; }
    .btn-action-danger:hover { background: rgba(220, 53, 69, 0.25); color: #b02a37; }

    .custom-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 30px; font-size: 0.8rem; font-weight: 700; }
    .badge-pending { background: rgba(253, 126, 20, 0.15); color: #fd7e14; border: 1px solid rgba(253, 126, 20, 0.2); }
    .badge-completed { background: rgba(32, 201, 151, 0.15); color: #20c997; border: 1px solid rgba(32, 201, 151, 0.25); }

    .custom-table th { font-weight: 700; font-size: 0.75rem; letter-spacing: 1px; }
    .table-hover tbody tr:hover td { background-color: var(--hover-bg) !important; }
    /* Fix para modo oscuro en tabla */
    .table-dark { background-color: transparent !important; }

    .form-control:focus, .form-select:focus { box-shadow: 0 0 0 0.25rem rgba(138, 115, 255, 0.15); }

    .qr-overlay, .scanner-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.5); backdrop-filter: blur(5px); z-index: 1050;
      display: flex; justify-content: center; align-items: center; animation: fadeIn 0.2s ease;
    }
    .modal-glass {
      background: var(--glass-panel); border-radius: 24px; border: 1px solid var(--glass-border);
      padding: 2.5rem; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes popIn { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
    ::ng-deep video { width: 100%; height: auto; display: block; }
  `]
})
export class DashboardComponent implements OnInit {
  tasks: any[] = []; users: any[] = []; isFormVisible: boolean = false; currentUser: any = null;
  showQr: boolean = false; qrDataString: string = ''; isScanning: boolean = false; allowedFormats = [ 11 ];
  newTask: any = { title: '', description: '', assignedUserId: null, location: '', scheduledDate: new Date().toISOString().split('T')[0], latitude: 0, longitude: 0 };

  // INYECTAMOS EL SERVICIO DE TEMA
  constructor(private taskService: TaskService, private userService: UserService, private cdr: ChangeDetectorRef, public themeService: ThemeService) {}

  ngOnInit() {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) this.currentUser = JSON.parse(userJson);
    this.loadData();
  }

  isAdmin() { return this.currentUser?.role === 'Admin'; }
  loadData() { this.userService.getUsers().subscribe(u => { this.users = u; this.fetchTasks(); }); }
  fetchTasks() { this.taskService.getTasks().subscribe(t => { this.tasks = this.isAdmin() ? t : t.filter(x => x.assignedUserId === this.currentUser.id); this.cdr.detectChanges(); }); }

  enableScanner() { this.isScanning = true; }
  disableScanner() { this.isScanning = false; }

  handleQrCodeResult(resultString: string) {
    if (resultString.startsWith('SERVICE-')) {
      const taskId = parseInt(resultString.split('-')[1]);
      const task = this.tasks.find(t => t.id === taskId);
      if (task) {
        this.disableScanner(); 
        if (task.latitude === 0 && task.longitude === 0) { this.processCompletion(task); return; }
        Swal.fire({ title: 'Ubicando...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
            const distance = this.getDistanceFromLatLonInMeters(pos.coords.latitude, pos.coords.longitude, task.latitude, task.longitude);
            if (distance <= 50) { Swal.close(); this.processCompletion(task); } 
            else { Swal.fire({ icon: 'error', title: 'Muy lejos', text: `Estás a ${Math.round(distance)}m.`, confirmButtonColor: '#8a73ff' }).then(() => this.enableScanner()); }
          }, () => { Swal.fire('Error GPS', 'Necesitamos tu ubicación.', 'error').then(() => this.enableScanner()); }, { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });
        }
      } else { Swal.fire('Error', 'QR no reconocido.', 'error'); this.disableScanner(); }
    }
  }

  processCompletion(task: any) {
    Swal.fire({ title: 'Ubicación Verificada', html: `¿Completar <b>${task.title}</b>?`, icon: 'success', showCancelButton: true, confirmButtonColor: '#20c997', cancelButtonColor: '#6c757d', confirmButtonText: 'Confirmar' }).then((res) => {
      if (res.isConfirmed) {
        this.taskService.updateTask(task.id, { ...task, isCompleted: true }).subscribe({
          next: () => { Swal.fire('¡Éxito!', 'Servicio registrado.', 'success'); this.loadData(); },
          error: (e) => Swal.fire('Error', e.message, 'error')
        });
      } else { this.enableScanner(); }
    });
  }

  getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; const dLat = (lat2 - lat1) * (Math.PI / 180); const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(lat1*(Math.PI/180))*Math.cos(lat2*(Math.PI/180))*Math.sin(dLon/2)*Math.sin(dLon/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }
  parseCoordinates(event: any) { const i = event.target.value; if (i.includes(',')) { const p = i.split(','); const l1 = parseFloat(p[0]), l2 = parseFloat(p[1]); if (!isNaN(l1) && !isNaN(l2)) { this.newTask.latitude = l1; this.newTask.longitude = l2; event.target.value = ''; Swal.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, icon: 'success', title: 'Capturadas' }); } } }
  getCurrentLocationForTask() { navigator.geolocation?.getCurrentPosition((pos) => { this.newTask.latitude = pos.coords.latitude; this.newTask.longitude = pos.coords.longitude; Swal.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, icon: 'success', title: 'Ubicación guardada' }); }); }

  showForm() { this.isFormVisible = true; this.newTask = { title: '', description: '', assignedUserId: null, location: '', scheduledDate: new Date().toISOString().split('T')[0], latitude: 0, longitude: 0 }; }
  hideForm() { this.isFormVisible = false; }
  saveTask() { this.taskService.createTask(this.newTask).subscribe(() => { this.loadData(); this.hideForm(); Swal.fire('¡Guardado!', '', 'success'); }); }
  deleteTask(id: number) { Swal.fire({ title: '¿Eliminar?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc3545' }).then((r) => { if (r.isConfirmed) { this.taskService.deleteTask(id).subscribe(() => { this.loadData(); Swal.fire('Eliminado', '', 'success'); }); } }); }

  openQrModal(task: any) { this.qrDataString = `SERVICE-${task.id}`; this.showQr = true; }
  closeQrModal() { this.showQr = false; }
  printPage() { window.print(); }
}