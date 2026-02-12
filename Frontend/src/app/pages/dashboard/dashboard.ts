import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // <--- 1. IMPORTAR ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div class="container mt-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1>📋 Mis Tareas ({{ tasks.length }})</h1> <button class="btn btn-success">+ Nueva Tarea</button>
      </div>

      <div class="alert alert-info" *ngIf="tasks.length > 0">
        Datos recibidos: {{ tasks[0].title }}
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
              </tr>
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
              </tr>
            </tbody>
          </table>
          
          <div *ngIf="tasks.length === 0" class="p-4 text-center text-muted">
            No hay tareas asignadas todavía.
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  tasks: any[] = [];

  // 2. INYECTAR cdr (ChangeDetectorRef)
  constructor(private taskService: TaskService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getTasks().subscribe({
      next: (data) => {
        console.log('¡DATOS LLEGANDO!', data); // Mira la consola negra
        this.tasks = data;
        
        // 3. OBLIGAR A ACTUALIZAR LA PANTALLA
        this.cdr.detectChanges(); 
      },
      error: (error) => {
        console.error('Error al cargar tareas:', error);
      }
    });
  }
}