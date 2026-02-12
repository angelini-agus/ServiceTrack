import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',     // <-- Fíjate que apunte a login.html
  styleUrls: ['./login.css']       // <-- Fíjate que apunte a login.css
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  onLogin() {
    console.log('Datos del formulario:', { email: this.email, password: this.password });
  }
}