import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { HttpClientModule } from '@angular/common/http';
// Asegúrate de que la ruta sea correcta (sin .service)
import { TaskService } from '../../services/task'; 

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  // AQUÍ ESTÁ EL HTML (Dentro de este template)
  template: `
    <div class="container mt-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1>📋 Gestión de Servicios</h1>
        <button class="btn btn-success" (click)="showForm()">+ Nuevo Servicio</button>
      </div>

      <div *ngIf="isFormVisible" class="card p-3 mb-4 shadow-sm bg-light">
        <h4>{{ newTask.id ? 'Editar Servicio' : 'Nuevo Servicio' }}</h4>
        <div class="mb-2">
          <label>Título:</label>
          <input type="text" class="form-control" [(ngModel)]="newTask.title" placeholder="Ej: Limpieza Vidrios">
        </div>
        <div class="mb-2">
          <label>Descripción:</label>
          <textarea class="form-control" [(ngModel)]="newTask.description" placeholder="Detalles..."></textarea>
        </div>
        
        <div class="form-check mb-3" *ngIf="newTask.id">
          <input class="form-check-input" type="checkbox" [(ngModel)]="newTask.isCompleted" id="checkCompleted">
          <label class="form-check-label" for="checkCompleted">
            Marcar como Completada
          </label>
        </div>

        <div class="d-flex gap-2 mt-3">
          <button class="btn btn-primary" (click)="saveTask()">Guardar</button>
          <button class="btn btn-secondary" (click)="hideForm()">Cancelar</button>
        </div>
      </div>

      <div class="card shadow">
        <div class="card-body p-0">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>Tarea</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Acciones</th> </tr>
            </thead>
            <tbody>
              <tr *ngFor="let task of tasks">
                <td>{{ task.id }}</td>
                <td class="fw-bold">{{ task.title }}</td>
                <td>{{ task.description }}</td>
                <td>
                  <span class="badge" 
                        [ngClass]="task.isCompleted ? 'bg-success' : 'bg-warning text-dark'">
                    {{ task.isCompleted ? 'Completada' : 'Pendiente' }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm btn-outline-primary" (click)="editTask(task)">
                    ✏️ Editar
                  </button>
                  <button class="btn btn-sm btn-outline-danger ms-2" (click)="deleteTask(task.id)">
                    🗑️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  tasks: any[] = [];
  isFormVisible: boolean = false;
  newTask: any = { title: '', description: '' };

  constructor(private taskService: TaskService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        this.cdr.detectChanges();
      }
    });
  }

  showForm() {
    this.isFormVisible = true;
    this.newTask = { title: '', description: '' };
  }

  hideForm() {
    this.isFormVisible = false;
  }

  // 1. CARGAR DATOS EN EL FORMULARIO
  editTask(task: any) {
    this.newTask = { ...task }; // Hacemos una copia para editar tranquilo
    this.isFormVisible = true;
  }

  // 2. GUARDAR (INTELIGENTE: CREAR O EDITAR)
  saveTask() {
    if (!this.newTask.title) {
      alert('Por favor escribe un título');
      return;
    }

    if (this.newTask.id) {
      // --- ES UNA EDICIÓN (TIENE ID) ---
      this.taskService.updateTask(this.newTask.id, this.newTask).subscribe({
        next: () => {
          // Buscamos la tarea en la lista y la actualizamos visualmente
          const index = this.tasks.findIndex(t => t.id === this.newTask.id);
          if (index !== -1) {
            this.tasks[index] = this.newTask;
          }
          this.hideForm();
          this.cdr.detectChanges();
        },
        error: (e) => alert('Error al actualizar')
      });

    } else {
      // --- ES UNA TAREA NUEVA (NO TIENE ID) ---
      this.taskService.createTask(this.newTask).subscribe({
        next: (createdTask) => {
          this.tasks.push(createdTask);
          this.hideForm();
          this.cdr.detectChanges();
        },
        error: (e) => alert('Error al crear')
      });
    }
  }

  deleteTask(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      this.taskService.deleteTask(id).subscribe({
        next: () => {
          // Si el backend dice OK, quitamos la tarea de la lista visualmente
          this.tasks = this.tasks.filter(t => t.id !== id);
          this.cdr.detectChanges();
        },
        error: (e) => alert('Error al eliminar')
      });
    }
  }
}