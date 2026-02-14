import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { HttpClientModule } from '@angular/common/http';
import { TaskService } from '../../services/task'; 
import { UserService } from '../../services/user';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
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
      </div>

      <div *ngIf="isFormVisible && isAdmin()" class="card p-4 mb-4 shadow-sm bg-light border-0">
        <h4 class="mb-3">{{ newTask.id ? '✏️ Editar Servicio' : '✨ Nuevo Servicio' }}</h4>
        
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Título:</label>
            <input type="text" class="form-control" [(ngModel)]="newTask.title">
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
            <label class="form-label">Ubicación:</label>
            <input type="text" class="form-control" [(ngModel)]="newTask.location">
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
          <button class="btn btn-primary" (click)="saveTask()">Guardar</button>
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
                <th>Asignado a</th>
                <th>Estado</th>
                <th class="text-end" *ngIf="isAdmin()">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let task of tasks">
                <td>{{ task.scheduledDate | date:'dd/MM/yyyy' }}</td>
                <td><span *ngIf="task.location">📍 {{ task.location }}</span></td>
                <td class="fw-bold">{{ task.title }}</td>
                
                <td>
                  <span *ngIf="task.assignedUserId" class="badge bg-info text-dark border border-info-subtle">
                    👤 {{ getUserName(task.assignedUserId) }}
                  </span>
                  <span *ngIf="!task.assignedUserId" class="badge bg-secondary text-light opacity-50">Sin asignar</span>
                </td>

                <td>
                  <span class="badge rounded-pill" 
                        [ngClass]="task.isCompleted ? 'bg-success' : 'bg-warning text-dark'">
                    {{ task.isCompleted ? 'Completado' : 'Pendiente' }}
                  </span>
                </td>

                <td class="text-end" *ngIf="isAdmin()">
                  <button class="btn btn-sm btn-outline-primary me-2" (click)="editTask(task)">✏️</button>
                  <button class="btn btn-sm btn-outline-danger" (click)="deleteTask(task.id)">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div *ngIf="tasks.length === 0" class="p-5 text-center text-muted">
            <h4>📭 No tienes servicios asignados</h4>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  tasks: any[] = [];
  users: any[] = [];
  isFormVisible: boolean = false;
  currentUser: any = null; // AQUÍ GUARDAMOS QUIÉN ESTÁ LOGUEADO
  
  newTask: any = { 
    title: '', description: '', assignedUserId: null, location: '',
    scheduledDate: new Date().toISOString().split('T')[0]
  };

  constructor(
    private taskService: TaskService, 
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // 1. RECUPERAR USUARIO DEL STORAGE
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      this.currentUser = JSON.parse(userJson);
      console.log('Usuario Logueado:', this.currentUser);
    }
    
    this.loadData();
  }

  // Helper para saber si soy admin (Simplifica el HTML)
  isAdmin(): boolean {
    return this.currentUser && this.currentUser.role === 'Admin';
  }

  loadData() {
    // 1. Primero cargamos los usuarios (Es la lista que necesitamos para los nombres)
    if (this.isAdmin()) {
      this.userService.getUsers().subscribe({
        next: (userData) => {
          this.users = userData;
          // Una vez que tenemos los usuarios, cargamos las tareas
          this.fetchTasks();
        },
        error: (e) => console.error('Error cargando usuarios', e)
      });
    } else {
      // Si es empleado, igual necesitamos los usuarios para ver el nombre propio
      this.userService.getUsers().subscribe({
        next: (userData) => {
          this.users = userData;
          this.fetchTasks();
        }
      });
    }
  }

  // Creamos esta función aparte para limpiar el código
  fetchTasks() {
    this.taskService.getTasks().subscribe({
      next: (taskData) => {
        if (this.isAdmin()) {
          this.tasks = taskData;
        } else {
          this.tasks = taskData.filter(t => t.assignedUserId === this.currentUser.id);
        }
        // FORZAMOS a Angular a que se dé cuenta que ahora sí hay nombres
        this.cdr.detectChanges(); 
      },
      error: (e) => console.error('Error cargando tareas', e)
    });
  }

  getUserName(userId: number): string {
    if (!this.users || this.users.length === 0) return ''; // Quitamos los "..."
    const user = this.users.find(u => u.id === userId);
    return user ? user.fullName : 'Sin asignar';
  }

  showForm() {
    this.isFormVisible = true;
    this.newTask = { 
      title: '', description: '', assignedUserId: null, location: '',
      scheduledDate: new Date().toISOString().split('T')[0]
    };
  }

  hideForm() { this.isFormVisible = false; }

  editTask(task: any) {
    this.newTask = { ...task };
    if (this.newTask.scheduledDate) {
      this.newTask.scheduledDate = this.newTask.scheduledDate.split('T')[0];
    }
    this.isFormVisible = true;
  }

  saveTask() {
    if (!this.newTask.title) return;
    if (this.newTask.id) {
      this.taskService.updateTask(this.newTask.id, this.newTask).subscribe(() => {
        this.loadData();
        this.hideForm();
      });
    } else {
      this.taskService.createTask(this.newTask).subscribe(() => {
        this.loadData();
        this.hideForm();
      });
    }
  }

  deleteTask(id: number) {
    if (confirm('¿Borrar?')) {
      this.taskService.deleteTask(id).subscribe(() => this.loadData());
    }
  }
}