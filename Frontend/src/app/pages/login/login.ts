import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ThemeService } from '../../services/theme.service'; // IMPORTAMOS EL SERVICIO

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <button class="btn theme-bg theme-border position-fixed top-0 end-0 m-3 rounded-circle shadow" 
            (click)="themeService.toggleTheme()" style="z-index: 1060; width: 45px; height: 45px; border: 1px solid;">
      <i class="bi fs-5" [ngClass]="themeService.isDark ? 'bi-sun-fill text-warning' : 'bi-moon-stars-fill text-dark'"></i>
    </button>

    <div class="d-flex justify-content-center align-items-center min-vh-100">
      <div class="card glass-card p-5 shadow-lg text-center" style="width: 100%; max-width: 420px; margin: 15px;">
        
        <div class="mb-4">
          <div class="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3 text-primary shadow-sm">
            <i class="bi bi-shield-check" style="font-size: 2.5rem; line-height: 1;"></i>
          </div>
          <h2 class="fw-bold theme-text" style="letter-spacing: -0.5px;">AZ<br>Limpieza</h2>
          <p class="theme-text-muted small">Gestión de Servicios</p>
        </div>

        <form (ngSubmit)="onLogin()">
          <div class="mb-4 text-start">
            <label class="form-label fw-semibold theme-text-muted small text-uppercase">Usuario</label>
            <div class="input-group shadow-sm rounded-3 overflow-hidden theme-border" style="border: 1px solid;">
              <span class="input-group-text theme-bg border-0 px-3"><i class="bi bi-person theme-text-muted fs-5"></i></span>
              <input type="text" class="form-control form-control-lg border-0 theme-bg" 
                     [(ngModel)]="loginObj.username" name="username" placeholder="Ingresa tu usuario" required>
            </div>
          </div>
          
          <div class="mb-5 text-start">
            <label class="form-label fw-semibold theme-text-muted small text-uppercase">Contraseña</label>
            <div class="input-group shadow-sm rounded-3 overflow-hidden theme-border" style="border: 1px solid;">
              <span class="input-group-text theme-bg border-0 px-3"><i class="bi bi-key theme-text-muted fs-5"></i></span>
              <input type="password" class="form-control form-control-lg border-0 theme-bg" 
                     [(ngModel)]="loginObj.password" name="password" placeholder="••••••••" required>
            </div>
          </div>

          <button type="submit" class="btn btn-glass-primary btn-lg w-100 shadow-sm mt-2 d-flex justify-content-center align-items-center gap-2">
            Ingresar a la Plataforma <i class="bi bi-arrow-right-short fs-4"></i>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .glass-card {
      background: var(--glass-bg);
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      border-radius: 24px;
      border: 1px solid var(--glass-border);
      box-shadow: 0 10px 40px rgba(0,0,0, 0.1);
      transition: background 0.4s ease, border-color 0.4s ease;
    }
    .input-group:focus-within { box-shadow: 0 0 0 0.25rem rgba(138, 115, 255, 0.15) !important; }
    .form-control:focus { box-shadow: none !important; }
    .btn-glass-primary {
      background: linear-gradient(135deg, #8a73ff 0%, #6851d8 100%); color: white; border: none; font-weight: 600;
      border-radius: 12px; transition: transform 0.1s ease, box-shadow 0.2s ease;
    }
    .btn-glass-primary:hover { background: linear-gradient(135deg, #7b62f0 0%, #5841c7 100%); color: white; }
    .btn-glass-primary:active { transform: scale(0.97); }
  `]
})
export class LoginComponent {
  loginObj: any = { username: '', password: '' };

  // INYECTAMOS EL SERVICIO DE TEMA (Debe ser public para usarlo en el HTML)
  constructor(private http: HttpClient, private router: Router, public themeService: ThemeService) {}

  onLogin() {
    if (!this.loginObj.username || !this.loginObj.password) {
      Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Ingresa tu usuario y contraseña.', confirmButtonColor: '#8a73ff' });
      return;
    }

    Swal.fire({ title: 'Iniciando sesión', text: 'Conectando...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });

    this.http.post('http://192.168.100.222:5000/api/Auth/login', this.loginObj).subscribe({
      next: (res: any) => {
        localStorage.setItem('currentUser', JSON.stringify(res));
        Swal.fire({ icon: 'success', title: `Bienvenido, ${res.user}`, timer: 1500, showConfirmButton: false }).then(() => {
          this.router.navigate(['/dashboard']);
        });
      },
      error: (err) => {
        Swal.close(); 
        let errorMsg = 'Error de conexión.';
        if (err.status === 400 || err.status === 401) errorMsg = 'Usuario o contraseña incorrectos.';
        Swal.fire({ icon: 'error', title: 'Acceso Denegado', text: errorMsg, confirmButtonColor: '#dc3545' });
      }
    });
  }
}