import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Asegúrate de que este puerto sea el de tu Swagger (7023)
  private apiUrl = 'http://192.168.100.222:5000/api/Auth';
  //private apiUrl = 'https://localhost:7023/api/Auth';
  constructor(private http: HttpClient) { }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }
}