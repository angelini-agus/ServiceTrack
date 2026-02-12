import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // <--- 1. IMPORTAR ESTO

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // <--- 2. AGREGARLO AQUÍ (y quita LoginComponent si estaba)
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'CleanCheck';
}