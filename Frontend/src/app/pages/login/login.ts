import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router'; // <--- 1. NUEVO: Importar Router
import { AuthService } from '../../services/auth'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  // 2. NUEVO: Agregamos 'private router: Router' al constructor
  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    const credentials = {
      email: this.email,
      passwordHash: this.password 
    };

    // ... dentro de onLogin()
    this.authService.login(credentials).subscribe({
      next: (response: any) => {
        // 1. GUARDAMOS EL USUARIO EN EL NAVEGADOR
        localStorage.setItem('currentUser', JSON.stringify(response));
        
        // 2. Redirigimos
        this.router.navigate(['/dashboard']);
      },
      error: (error: any) => {
        console.error('Error:', error);
        alert('Error: Usuario o contraseña incorrectos');
      }
    });
  }
}