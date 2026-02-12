import { Component } from '@angular/core';
import { LoginComponent } from './pages/login/login';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LoginComponent], // <--- Solo dejamos el Login
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'CleanCheck';
}