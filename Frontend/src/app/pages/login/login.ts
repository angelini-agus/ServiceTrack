import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule], // Importante: HttpClientModule
  template: `
    <div class="container d-flex justify-content-center align-items-center vh-100">
      <div class="card p-4 shadow-lg" style="width: 350px;">
        <h2 class="text-center mb-4">CleanCheck</h2>
        
        <div class="mb-3">
          <label>Email o Usuario</label>
          <input type="text" class="form-control" [(ngModel)]="loginObj.email" placeholder="ej: final@limpieza.com">
        </div>
        
        <div class="mb-3">
          <label>Contraseña</label>
          <input type="password" class="form-control" [(ngModel)]="loginObj.password" placeholder="******">
        </div>

        <button class="btn btn-primary w-100" (click)="onLogin()">Ingresar</button>
        
        <p *ngIf="errorMessage" class="text-danger mt-3 text-center small">{{ errorMessage }}</p>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  
  // Objeto que coincide con UserDto del Backend (Email, Password)
  loginObj: any = {
    email: '',
    password: ''
  };

  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  onLogin() {
    // 1. Limpiamos errores previos
    this.errorMessage = '';

    // 2. Enviamos al Backend
    //this.http.post('https://localhost:7023/api/Auth/login', this.loginObj).subscribe({
    // OJO: Es http (sin la 's') y puerto 5000
    this.http.post('http://192.168.100.222:5000/api/Auth/login', this.loginObj).subscribe({
      next: (res: any) => {
        // SI TODO SALE BIEN:
        console.log('Respuesta del Login:', res);
        
        // Guardamos la sesión (Token falso por ahora)
        localStorage.setItem('currentUser', JSON.stringify(res));
        
        // Vamos al Dashboard
        this.router.navigateByUrl('dashboard');
      },
      error: (error) => {
        // SI FALLA: Mostramos el mensaje exacto que manda el Backend
        console.error('Error de login:', error);
        if (error.error && typeof error.error === 'string') {
            this.errorMessage = error.error; // Ej: "Usuario no encontrado"
        } else {
            this.errorMessage = "Error de conexión o credenciales incorrectas.";
        }
      }
    });
  }
}