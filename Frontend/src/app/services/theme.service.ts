import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  public isDark = false;

  constructor() {
    // Al iniciar, leemos si el usuario ya había elegido el modo oscuro
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.setTheme(true);
    } else {
      this.setTheme(false); // Por defecto claro
    }
  }

  toggleTheme() {
    this.setTheme(!this.isDark);
  }

  private setTheme(isDark: boolean) {
    this.isDark = isDark;
    
    // ¡EL CAMBIO MÁGICO ESTÁ AQUÍ! 
    // Usamos documentElement (que es la etiqueta <html>) en vez de body
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }
}