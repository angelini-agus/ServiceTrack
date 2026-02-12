import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // 1. Buscamos si hay un usuario guardado
  const user = localStorage.getItem('currentUser');

  if (user) {
    // Si existe, PASE ADELANTE
    return true;
  } else {
    // Si no existe, ¡FUERA! (Al login)
    router.navigate(['/']);
    return false;
  }
};