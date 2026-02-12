import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  // Asegúrate de que el puerto sea el mismo (7023)
  private apiUrl = 'https://localhost:7023/api/ServiceTasks'; 

  constructor(private http: HttpClient) { }

  // Método para pedir la lista completa
  getTasks(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}