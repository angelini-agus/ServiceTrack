import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router'; 
import { UserService } from '../../services/user';
import { ProductService } from '../../services/product.service'; 
import { SupplyRequestService } from '../../services/supply-request.service'; 
import { ConsortiumService } from '../../services/consortium.service'; 
import { AttendanceService } from '../../services/attendance.service'; 
import { QRCodeComponent } from 'angularx-qrcode';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import Swal from 'sweetalert2';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, QRCodeComponent, ZXingScannerModule],
  template: `
    <button class="btn theme-bg theme-border position-fixed top-0 end-0 m-3 rounded-circle shadow" (click)="themeService.toggleTheme()" style="z-index: 1060; width: 45px; height: 45px; border: 1px solid;"><i class="bi fs-5" [ngClass]="themeService.isDark ? 'bi-sun-fill text-warning' : 'bi-moon-stars-fill text-dark'"></i></button>

    <div class="container mt-5 pt-3">
      <div class="glass-header p-4 rounded-4 mb-4 text-center">
        <h2 class="theme-text fw-bold mb-1" style="letter-spacing: -0.5px;">Panel de Control</h2>
        
        <div class="d-flex justify-content-center align-items-center gap-3 mb-4">
            <p class="theme-text-muted small mb-0">Hola, <strong>{{ currentUser?.user }}</strong> ({{ currentUser?.role }})</p>
            <button class="btn btn-sm text-danger d-flex align-items-center gap-1 rounded-pill px-3" style="background: rgba(220,53,69,0.1); border: 1px solid rgba(220,53,69,0.3); font-weight: 600; transition: all 0.2s;" (click)="logout()">
              <i class="bi bi-box-arrow-right"></i> Salir
            </button>
        </div>
        
        <div class="d-inline-flex p-1 rounded-pill theme-bg theme-border shadow-sm" style="border: 1px solid;">
          <button class="btn rounded-pill px-4 fw-semibold" [ngClass]="currentTab === 'plantillas' ? 'btn-glass-primary' : 'text-muted'" (click)="setTab('plantillas')"><i class="bi bi-building me-1"></i> {{ isAdmin() ? 'Plantillas' : 'Mis Edificios' }}</button>
          <button class="btn rounded-pill px-4 fw-semibold" [ngClass]="currentTab === 'horas' ? 'btn-glass-primary' : 'text-muted'" (click)="setTab('horas')"><i class="bi bi-currency-dollar me-1"></i> {{ isAdmin() ? 'Liquidación' : 'Mis Horas' }}</button>
          <button class="btn rounded-pill px-4 fw-semibold" [ngClass]="currentTab === 'productos' ? 'btn-glass-primary' : 'text-muted'" (click)="setTab('productos')"><i class="bi bi-box-seam me-1"></i> Insumos</button>
        </div>
      </div>

      <div *ngIf="currentTab === 'plantillas'">
        <div class="d-flex justify-content-end mb-3">
          <button *ngIf="isAdmin()" class="btn btn-glass-primary shadow-sm" (click)="showForm()"><i class="bi bi-plus-lg me-1"></i> Nuevo Edificio</button>
          <button *ngIf="!isAdmin()" class="btn btn-glass-primary shadow-sm" (click)="enableScanner()"><i class="bi bi-qr-code-scan me-2"></i> Escanear Consorcio</button>
        </div>

        <div *ngIf="isFormVisible && isAdmin()" class="card p-4 mb-4 border-0 glass-card">
          <div class="d-flex align-items-center mb-4"><i class="bi bi-building-add text-primary fs-4 me-2"></i><h4 class="mb-0 fw-bold theme-text">Alta de Consorcio</h4></div>
          <div class="row">
            <div class="col-md-6 mb-3"><label class="form-label fw-semibold theme-text-muted small">Nombre del Consorcio</label><input type="text" class="form-control theme-bg theme-border" [(ngModel)]="newConsortium.name" placeholder="Ej: Fideicomiso San Martín"></div>
            <div class="col-md-6 mb-3"><label class="form-label fw-semibold theme-text-muted small">Empleado Fijo Asignado</label><select class="form-select theme-bg theme-border" [(ngModel)]="newConsortium.assignedUserId"><option [ngValue]="null">-- Sin Asignar --</option><option *ngFor="let user of users" [ngValue]="user.id">{{ user.fullName }}</option></select></div>
          </div>
          
          <div class="mb-3 p-3 rounded-4 border theme-border" style="background: var(--glass-border);">
            <label class="form-label fw-bold text-primary mb-3"><i class="bi bi-geo-alt-fill me-2"></i> Ubicación GPS</label>
            <div class="mb-3"><input type="text" class="form-control border-0 shadow-sm theme-bg" [(ngModel)]="newConsortium.address" placeholder="Dirección exacta"></div>
            <div class="mb-3"><input type="text" class="form-control border-0 shadow-sm theme-bg border-start border-primary border-4" placeholder="Pegar coordenadas aquí (-32.95, -60.62)" (input)="parseCoordinates($event)"></div>
            <div class="d-flex gap-2 align-items-center flex-wrap">
              <input type="number" class="form-control border-0 theme-bg shadow-sm" [(ngModel)]="newConsortium.latitude" placeholder="Lat" style="max-width: 120px;">
              <input type="number" class="form-control border-0 theme-bg shadow-sm" [(ngModel)]="newConsortium.longitude" placeholder="Lng" style="max-width: 120px;">
              <button class="btn theme-bg shadow-sm ms-2 text-primary fw-semibold" (click)="getCurrentLocationForTask()"><i class="bi bi-crosshair"></i> Mi Ubicación</button>
            </div>
          </div>

          <div class="mb-3 p-3 rounded-4 border theme-border" style="background: var(--glass-border);">
            <label class="form-label fw-bold text-primary mb-3"><i class="bi bi-calendar-week me-2"></i> Plantilla Semanal</label>
            <div class="row g-2 align-items-center mb-2" *ngFor="let day of weekDays">
              <div class="col-3"><div class="form-check"><input class="form-check-input" type="checkbox" [(ngModel)]="day.active"><label class="form-check-label fw-semibold theme-text">{{ day.name }}</label></div></div>
              <div class="col-4" *ngIf="day.active"><div class="input-group input-group-sm"><span class="input-group-text theme-bg border-0">Entrada</span><input type="time" class="form-control theme-bg border-0" [(ngModel)]="day.start"></div></div>
              <div class="col-4" *ngIf="day.active"><div class="input-group input-group-sm"><span class="input-group-text theme-bg border-0">Salida</span><input type="time" class="form-control theme-bg border-0" [(ngModel)]="day.end"></div></div>
            </div>
          </div>

          <div class="d-flex gap-3 justify-content-end mt-4">
            <button class="btn theme-bg px-4 fw-semibold theme-text-muted" style="border: 1px solid var(--border-color);" (click)="hideForm()">Cancelar</button>
            <button class="btn btn-glass-primary px-4 shadow-sm" (click)="saveConsortium()">Guardar Consorcio</button>
          </div>
        </div>

        <div *ngIf="isScanning" class="scanner-overlay">
          <div class="modal-glass text-center" style="width: 100%; max-width: 500px; padding: 1.5rem;">
            <div class="d-flex justify-content-between align-items-center mb-3"><h5 class="mb-0 fw-bold theme-text"><i class="bi bi-camera me-2 text-primary"></i> Lector QR</h5><button class="btn-close" [ngClass]="themeService.isDark ? 'btn-close-white' : ''" (click)="disableScanner()"></button></div>
            <div class="rounded-4 overflow-hidden shadow bg-black border border-secondary border-opacity-25"><zxing-scanner (scanSuccess)="handleQrCodeResult($event)" [formats]="allowedFormats"></zxing-scanner></div>
          </div>
        </div>

        <div class="card glass-card border-0 mb-5" *ngIf="isAdmin()">
          <div class="table-responsive">
            <table class="table table-bordered align-middle mb-0 custom-table" [ngClass]="themeService.isDark ? 'table-dark text-white' : 'table-light'">
              <thead class="bg-transparent text-center">
                <tr><th class="py-3 theme-text-muted theme-border" style="width: 15%">EMPLEADO</th><th class="theme-text-muted theme-border">LUN</th><th class="theme-text-muted theme-border">MAR</th><th class="theme-text-muted theme-border">MIÉ</th><th class="theme-text-muted theme-border">JUE</th><th class="theme-text-muted theme-border">VIE</th><th class="theme-text-muted theme-border">SÁB</th><th class="theme-text-muted theme-border">DOM</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let row of scheduleGrid" [ngStyle]="{'background-color': 'transparent'}">
                  <td class="theme-border fw-bold theme-text text-uppercase">{{ row.employeeName }}</td>
                  <td class="theme-border text-center" *ngFor="let dayNum of [1,2,3,4,5,6,0]">
                    <div *ngFor="let block of row.days[dayNum]" class="mb-2 p-2 rounded-3 theme-bg shadow-sm position-relative group-hover" style="font-size: 0.75rem; border: 1px solid var(--border-color);">
                      <div class="fw-bold text-primary text-truncate">{{ block.consortiumName }}</div>
                      <div class="theme-text-muted">{{ formatTimeDisplay(block.startTime) }} - {{ formatTimeDisplay(block.endTime) }}</div>
                      <div class="position-absolute top-0 end-0 mt-1 me-1 opacity-50">
                        <i class="bi bi-qr-code text-primary ms-1" style="cursor:pointer;" (click)="openQrModal(block.consortiumId, block.consortiumName)" title="Imprimir QR"></i>
                        <i class="bi bi-trash3 text-danger ms-1" style="cursor:pointer;" (click)="deleteConsortium(block.consortiumId)" title="Eliminar Consorcio"></i>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="scheduleGrid.length === 0"><td colspan="8" class="text-center py-5 theme-text-muted theme-border">No hay cronogramas registrados.</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="row" *ngIf="!isAdmin()">
            <div class="col-md-6 col-lg-4 mb-4" *ngFor="let cons of myConsortiums">
                <div class="card glass-card border-0 p-4 h-100">
                    <h5 class="fw-bold theme-text mb-1">{{ cons.name }}</h5>
                    <p class="theme-text-muted small mb-3"><i class="bi bi-geo-alt me-1"></i>{{ cons.address }}</p>
                    <div class="fw-bold text-primary mb-2 small text-uppercase">Tus Horarios:</div>
                    <div *ngFor="let s of cons.schedules" class="d-flex justify-content-between border-bottom theme-border py-1 small theme-text">
                        <span>{{ getDayName(s.dayOfWeek) }}</span>
                        <span class="fw-medium">{{ formatTimeDisplay(s.startTime) }} a {{ formatTimeDisplay(s.endTime) }}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div *ngIf="currentTab === 'horas'">
        <div class="card glass-card p-4 border-0 mb-4">
          <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <h4 class="mb-0 fw-bold theme-text"><i class="bi bi-cash-coin text-success me-2"></i>Liquidación Mensual</h4>
            
            <div class="d-flex gap-2" *ngIf="isAdmin()">
              <select class="form-select theme-bg theme-border" [(ngModel)]="selectedUserId" (change)="calculateHours()" style="width: 200px;">
                <option [ngValue]="null">-- Empleado --</option>
                <option *ngFor="let user of users" [ngValue]="user.id">{{ user.fullName }}</option>
              </select>
              <select class="form-select theme-bg theme-border text-capitalize" [(ngModel)]="selectedMonth" (change)="calculateHours()" style="width: 200px;">
                <option *ngFor="let month of availableMonths" [value]="month">{{ month }}</option>
              </select>
            </div>
            <div *ngIf="!isAdmin()">
               <select class="form-select theme-bg theme-border text-capitalize" [(ngModel)]="selectedMonth" (change)="calculateHours()" style="width: 200px;">
                <option *ngFor="let month of availableMonths" [value]="month">{{ month }}</option>
              </select>
            </div>
          </div>

          <div *ngIf="!selectedUserId && isAdmin()" class="text-center py-5 theme-text-muted">Selecciona un empleado para liquidar su sueldo.</div>
          
          <div class="row align-items-center" *ngIf="selectedUserId || !isAdmin()">
            <div class="col-md-4 mb-3">
              <div class="p-4 rounded-4 theme-bg theme-border text-center h-100" style="border: 1px solid;">
                <p class="text-uppercase fw-bold text-muted small mb-1">Horas en {{ selectedMonth }}</p>
                <h1 class="display-4 fw-bold text-primary mb-0">{{ monthlyHours }} <span class="fs-4 text-muted">hs</span></h1>
                <p class="small text-muted mt-2">Del 1 al último día del mes</p>
              </div>
            </div>

            <div class="col-md-8 mb-3" *ngIf="isAdmin()">
              <div class="p-4 rounded-4 theme-bg theme-border h-100 d-flex flex-column justify-content-center position-relative" style="border: 1px solid;">
                <button class="btn btn-sm btn-action-qr position-absolute top-0 end-0 m-2" (click)="showRateSettings = !showRateSettings" title="Configurar Valores"><i class="bi bi-gear-fill"></i></button>
                <div *ngIf="!showRateSettings" class="row align-items-center mt-2">
                  <div class="col-sm-6 mb-3 mb-sm-0 text-center text-sm-start">
                    <p class="text-uppercase fw-bold text-muted small mb-1">Valor x Hora ({{ getSelectedUserRole() }})</p>
                    <h3 class="fw-bold text-secondary mb-0">$ {{ getCurrentRate() | number:'1.0-0' }}</h3>
                  </div>
                  <div class="col-sm-6 text-center text-sm-end border-start theme-border">
                    <p class="text-uppercase fw-bold text-muted small mb-1">Total a Pagar</p>
                    <h2 class="fw-bold text-success mb-0">$ {{ (monthlyHours * getCurrentRate()) | number:'1.0-0' }}</h2>
                  </div>
                </div>
                <div *ngIf="showRateSettings" class="row align-items-end mt-2">
                   <div class="col-12"><p class="fw-bold theme-text mb-3 small text-uppercase"><i class="bi bi-tag-fill text-primary me-1"></i> Precios por Hora</p></div>
                   <div class="col-sm-5 mb-2"><label class="small text-muted fw-semibold mb-1">Empleado Regular ($)</label><input type="number" class="form-control form-control-sm theme-bg theme-border" [(ngModel)]="employeeRate"></div>
                   <div class="col-sm-5 mb-2"><label class="small text-muted fw-semibold mb-1">Administrador ($)</label><input type="number" class="form-control form-control-sm theme-bg theme-border" [(ngModel)]="adminRate"></div>
                   <div class="col-sm-2 mb-2"><button class="btn btn-sm btn-glass-primary w-100" (click)="saveRates()">Guardar</button></div>
                </div>
              </div>
            </div>
          </div>
          
          <h6 class="fw-bold theme-text mt-4 mb-3" *ngIf="selectedUserId || !isAdmin()">Detalle de Fichadas ({{ selectedMonth }})</h6>
          <div class="table-responsive" *ngIf="selectedUserId || !isAdmin()">
            <table class="table mb-0 custom-table" [ngClass]="themeService.isDark ? 'table-dark text-white' : 'table-hover'">
                <tbody>
                    <tr *ngFor="let log of filteredLogs">
                        <td class="theme-border ps-3 fw-bold theme-text">{{ log.date | date:'dd/MM/yyyy' }}</td>
                        
                        <td class="theme-border theme-text-muted">
                          {{ getConsortiumName(log.consortiumId) }}
                          <span *ngIf="isReplacement(log.consortiumId, log.userId)" class="badge bg-warning text-dark ms-2 fw-bold" style="font-size: 0.65rem;" title="Cubrió el turno de otro compañero"><i class="bi bi-arrow-left-right"></i> Reemplazo</span>
                        </td>
                        <td class="theme-border"><span class="badge bg-success">In: {{ log.entryTime | date:'HH:mm' }}</span></td>
                        <td class="theme-border"><span class="badge" *ngIf="log.exitTime" [ngClass]="log.exitStatus === 'A Tiempo' ? 'bg-success' : 'bg-warning text-dark'">Out: {{ log.exitTime | date:'HH:mm' }}</span></td>
                    </tr>
                    <tr *ngIf="filteredLogs.length === 0"><td colspan="4" class="text-center py-3 text-muted">No hay registros completados este mes.</td></tr>
                </tbody>
            </table>
          </div>
        </div>
      </div>

      <div *ngIf="currentTab === 'productos'">
        <div *ngIf="isAdmin()" class="row">
          <div class="col-md-4 mb-4">
            <div class="card glass-card p-4 border-0 h-100">
              <h5 class="fw-bold theme-text mb-3"><i class="bi bi-plus-circle text-primary me-2"></i>Nuevo Artículo</h5>
              <div class="mb-3"><input type="text" class="form-control theme-bg theme-border" [(ngModel)]="newProductName" placeholder="Ej: Trapo de piso"></div>
              <button class="btn btn-glass-primary w-100" (click)="addProduct()">Guardar Artículo</button>
            </div>
          </div>
          <div class="col-md-8 mb-4">
            <div class="card glass-card p-0 border-0 overflow-hidden h-100">
              <div class="p-3 border-bottom theme-border"><h5 class="fw-bold theme-text mb-0">Catálogo de Limpieza</h5></div>
              <div style="max-height: 200px; overflow-y: auto;">
                <table class="table mb-0" [ngClass]="themeService.isDark ? 'table-dark text-white' : 'table-hover'">
                  <tbody>
                    <tr *ngFor="let prod of realProducts">
                      <td class="theme-border ps-4 align-middle fw-medium">{{ prod.name }}</td>
                      <td class="theme-border text-end pe-4"><button class="btn btn-sm btn-action-danger" (click)="deleteProduct(prod.id)"><i class="bi bi-trash3"></i></button></td>
                    </tr>
                    <tr *ngIf="realProducts.length === 0"><td colspan="2" class="text-center py-4 text-muted">No hay artículos registrados.</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="col-12 mt-2 mb-5">
            <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
              <h4 class="fw-bold theme-text mb-0"><i class="bi bi-box2 text-primary me-2"></i>Pedidos de Insumos</h4>
              <select class="form-select theme-bg theme-border text-capitalize" style="width: 220px;" [(ngModel)]="selectedSupplyMonth" (change)="processSupplyRequests()">
                <option *ngFor="let m of availableSupplyMonths" [value]="m">{{ m }}</option>
              </select>
            </div>

            <div *ngIf="groupedSupplyRequests.length === 0" class="text-center py-5 card glass-card border-0 theme-text-muted">
              <i class="bi bi-inboxes fs-1 mb-2 d-block"></i> No hay pedidos registrados en {{ selectedSupplyMonth }}.
            </div>

            <div class="row">
              <div class="col-md-6 mb-4" *ngFor="let group of groupedSupplyRequests">
                <div class="card glass-card border-0 p-0 overflow-hidden h-100">
                  <div class="p-3 border-bottom theme-border" style="background: rgba(138, 115, 255, 0.05);">
                    <h6 class="fw-bold theme-text mb-0"><i class="bi bi-building text-primary me-2"></i>{{ group.location }}</h6>
                  </div>
                  <div class="table-responsive">
                    <table class="table mb-0 custom-table" [ngClass]="themeService.isDark ? 'table-dark text-white' : 'table-hover'">
                      <thead class="bg-transparent">
                        <tr><th class="px-3 py-2 theme-text-muted theme-border">ARTÍCULO</th><th class="py-2 theme-text-muted theme-border">CANT.</th><th class="py-2 theme-text-muted theme-border">ESTADO</th><th class="px-3 py-2 text-end theme-text-muted theme-border">ACCIÓN</th></tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let req of group.requests">
                          <td class="theme-border px-3 theme-text">{{ req.product?.name }}</td>
                          <td class="theme-border fw-bold">{{ req.quantity }}</td>
                          <td class="theme-border"><span class="custom-badge" [ngClass]="req.status === 'Entregado' ? 'badge-completed' : 'badge-pending'">{{ req.status }}</span></td>
                          <td class="theme-border text-end px-3">
                            <button *ngIf="req.status !== 'Entregado'" class="btn btn-sm btn-glass-primary" style="padding: 2px 8px; font-size: 0.75rem;" (click)="markAsDelivered(req.id)"><i class="bi bi-check2"></i> Listo</button>
                            <span *ngIf="req.status === 'Entregado'" class="text-success small fw-bold"><i class="bi bi-check-all"></i></span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="!isAdmin()" class="row justify-content-center">
          <div class="col-lg-4 mb-4">
            <div class="card glass-card p-4 border-0 h-100">
              <h5 class="mb-4 fw-bold theme-text"><i class="bi bi-cart-plus text-primary me-2"></i>Solicitar Insumo</h5>
              <div class="mb-3">
                <label class="form-label fw-semibold theme-text-muted small">Edificio / Ubicación</label>
                <select class="form-select theme-bg theme-border" [(ngModel)]="newRequest.location">
                  <option [ngValue]="''">-- Seleccionar --</option>
                  <option *ngFor="let cons of myConsortiums" [ngValue]="cons.name">{{ cons.name }}</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold theme-text-muted small">Artículo</label>
                <select class="form-select theme-bg theme-border" [(ngModel)]="newRequest.productId">
                  <option [ngValue]="null">-- Seleccionar --</option>
                  <option *ngFor="let prod of realProducts" [ngValue]="prod.id">{{ prod.name }}</option>
                </select>
              </div>
              <div class="mb-4">
                <label class="form-label fw-semibold theme-text-muted small">Cantidad</label>
                <input type="number" class="form-control theme-bg theme-border" [(ngModel)]="newRequest.qty" min="1">
              </div>
              <button class="btn btn-glass-primary w-100 py-2 mt-auto" (click)="submitRequest()"><i class="bi bi-send-check me-2"></i> Enviar Pedido</button>
            </div>
          </div>

          <div class="col-lg-8 mb-4">
            <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
              <h5 class="fw-bold theme-text mb-0"><i class="bi bi-clock-history text-primary me-2"></i>Mis Pedidos</h5>
              <select class="form-select form-select-sm theme-bg theme-border text-capitalize" style="width: 160px;" [(ngModel)]="selectedSupplyMonth" (change)="processSupplyRequests()">
                <option *ngFor="let m of availableSupplyMonths" [value]="m">{{ m }}</option>
              </select>
            </div>

            <div *ngIf="groupedSupplyRequests.length === 0" class="card glass-card border-0 p-5 text-center theme-text-muted">
              <i class="bi bi-inbox fs-1 mb-2 d-block"></i> No pediste insumos en {{ selectedSupplyMonth }}.
            </div>

            <div class="row">
              <div class="col-md-12 mb-4" *ngFor="let group of groupedSupplyRequests">
                <div class="card glass-card border-0 p-0 overflow-hidden h-100">
                  <div class="p-3 border-bottom theme-border" style="background: rgba(138, 115, 255, 0.05);">
                    <h6 class="fw-bold theme-text mb-0"><i class="bi bi-building text-primary me-2"></i>{{ group.location }}</h6>
                  </div>
                  <div class="table-responsive">
                    <table class="table mb-0 custom-table" [ngClass]="themeService.isDark ? 'table-dark text-white' : 'table-hover'">
                      <thead class="bg-transparent">
                        <tr><th class="px-3 py-2 theme-text-muted theme-border">ARTÍCULO</th><th class="py-2 theme-text-muted theme-border">CANT.</th><th class="px-3 py-2 theme-text-muted theme-border text-end">ESTADO</th></tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let req of group.requests">
                          <td class="theme-border px-3 theme-text">{{ req.product?.name }}</td>
                          <td class="theme-border fw-bold">{{ req.quantity }}</td>
                          <td class="theme-border px-3 text-end"><span class="custom-badge" [ngClass]="req.status === 'Entregado' ? 'badge-completed' : 'badge-pending'">{{ req.status }}</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="showQr" class="qr-overlay">
        <div class="modal-glass text-center">
          <h4 class="fw-bold theme-text mb-4"><i class="bi bi-printer text-primary me-2"></i>QR: {{qrBuildingName}}</h4>
          <div class="bg-white p-3 rounded-4 shadow-sm d-inline-block mb-4 border">
            <qrcode [qrdata]="qrDataString" [width]="220" [errorCorrectionLevel]="'M'"></qrcode>
          </div>
          <p class="theme-text-muted small mb-4 theme-bg rounded-pill py-1 px-3 d-inline-block border theme-border">Pegar en entrada del edificio</p>
          <div class="d-flex justify-content-center gap-3">
            <button class="btn theme-bg px-4 fw-semibold theme-text-muted" style="border: 1px solid var(--border-color);" (click)="closeQrModal()">Cerrar</button>
            <button class="btn btn-glass-primary px-4 shadow-sm" (click)="printPage()">Imprimir</button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .glass-header { background: var(--glass-bg); backdrop-filter: blur(10px); border: 1px solid var(--glass-border); transition: all 0.4s ease; }
    .glass-card { background: var(--glass-bg); backdrop-filter: blur(8px); border-radius: 20px; border: 1px solid var(--glass-border); box-shadow: 0 4px 15px 0 rgba(0,0,0, 0.1); }
    .btn { transition: transform 0.1s ease; border-radius: 12px; } .btn:active { transform: scale(0.96); }
    .btn-glass-primary { background: linear-gradient(135deg, #8a73ff 0%, #6851d8 100%); color: white !important; border: none; font-weight: 600; }
    .btn-action-qr, .btn-action-danger { background: transparent; border: none; padding: 0; opacity: 0.7; transition: opacity 0.2s; } .btn-action-qr:hover, .btn-action-danger:hover { opacity: 1; }
    .custom-badge { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 700;}
    .badge-pending { background: rgba(253, 126, 20, 0.15); color: #fd7e14; border: 1px solid rgba(253, 126, 20, 0.2); } .badge-completed { background: rgba(32, 201, 151, 0.15); color: #20c997; border: 1px solid rgba(32, 201, 151, 0.25); }
    .custom-table th { font-weight: 700; font-size: 0.75rem; letter-spacing: 1px; } .table-dark { background-color: transparent !important; }
    .form-control:focus, .form-select:focus, .form-check-input:focus { box-shadow: 0 0 0 0.25rem rgba(138, 115, 255, 0.15); }
    .qr-overlay, .scanner-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); backdrop-filter: blur(5px); z-index: 1050; display: flex; justify-content: center; align-items: center;}
    .modal-glass { background: var(--glass-panel); border-radius: 24px; border: 1px solid var(--glass-border); padding: 2.5rem; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
    ::ng-deep video { width: 100%; height: auto; display: block; }
  `]
})
export class DashboardComponent implements OnInit {
  currentTab: string = 'plantillas';
  users: any[] = []; currentUser: any = null;
  consortiums: any[] = []; scheduleGrid: any[] = []; myConsortiums: any[] = []; attendanceLogs: any[] = [];
  
  selectedUserId: number | null = null; availableMonths: string[] = []; selectedMonth: string = ''; monthlyHours: number = 0; filteredLogs: any[] = [];
  showRateSettings: boolean = false; employeeRate: number = 0; adminRate: number = 0;
  realProducts: any[] = []; supplyRequests: any[] = []; newProductName: string = ''; newRequest: any = { location: '', productId: null, qty: 1 };
  availableSupplyMonths: string[] = []; selectedSupplyMonth: string = ''; groupedSupplyRequests: { location: string, requests: any[] }[] = [];
  isFormVisible: boolean = false; showQr: boolean = false; qrDataString: string = ''; qrBuildingName: string = ''; isScanning: boolean = false; allowedFormats = [ 11 ];
  newConsortium: any = { name: '', address: '', latitude: 0, longitude: 0, assignedUserId: null, schedules: [] };
  weekDays = [ { id: 1, name: 'Lunes', active: false, start: '07:00', end: '10:00' }, { id: 2, name: 'Martes', active: false, start: '07:00', end: '10:00' }, { id: 3, name: 'Miércoles', active: false, start: '07:00', end: '10:00' }, { id: 4, name: 'Jueves', active: false, start: '07:00', end: '10:00' }, { id: 5, name: 'Viernes', active: false, start: '07:00', end: '10:00' }, { id: 6, name: 'Sábado', active: false, start: '07:00', end: '10:00' }, { id: 0, name: 'Domingo', active: false, start: '07:00', end: '10:00' } ];

  constructor(
    private userService: UserService, 
    private consortiumService: ConsortiumService,
    private attendanceService: AttendanceService,
    private productService: ProductService, 
    private requestService: SupplyRequestService,
    private cdr: ChangeDetectorRef, 
    public themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit() {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) this.currentUser = JSON.parse(userJson);
    if (!this.isAdmin()) this.selectedUserId = this.currentUser.id;
    
    this.selectedMonth = new Date().toLocaleString('es-AR', { month: 'long', year: 'numeric' });
    this.availableMonths = [this.selectedMonth]; 

    const savedEmpRate = localStorage.getItem('employeeRate');
    if (savedEmpRate) this.employeeRate = parseFloat(savedEmpRate);
    const savedAdmRate = localStorage.getItem('adminRate');
    if (savedAdmRate) this.adminRate = parseFloat(savedAdmRate);

    this.loadData();
  }

  logout() {
    Swal.fire({ title: '¿Cerrar sesión?', text: "¿Estás seguro de que deseas salir del sistema?", icon: 'question', showCancelButton: true, confirmButtonColor: '#dc3545', cancelButtonColor: '#6c757d', confirmButtonText: 'Sí, salir', cancelButtonText: 'Cancelar' }).then((result) => {
      if (result.isConfirmed) { localStorage.removeItem('currentUser'); this.router.navigate(['/login']); }
    });
  }

  isAdmin() { return this.currentUser?.role === 'Admin'; }
  setTab(tab: string) { this.currentTab = tab; if(tab === 'horas') this.calculateHours(); }

  loadData() { 
    this.userService.getUsers().subscribe(u => { 
      this.users = u; 
      this.consortiumService.getConsortiums().subscribe(c => { 
        this.consortiums = c; 
        this.myConsortiums = c.filter((x: any) => x.assignedUserId === this.currentUser.id);
        this.generateGrid();
        this.attendanceService.getLogs().subscribe(logs => { this.attendanceLogs = logs; this.extractMonths(logs); this.calculateHours(); this.cdr.detectChanges(); });
      }); 
    });
    this.productService.getProducts().subscribe(p => { this.realProducts = p; this.cdr.detectChanges(); });
    this.requestService.getRequests().subscribe(r => { this.supplyRequests = this.isAdmin() ? r : r.filter((req: any) => req.userId === this.currentUser.id); this.processSupplyRequests(); this.cdr.detectChanges(); });
  }

  extractMonths(logs: any[]) {
      const monthsSet = new Set<string>();
      logs.forEach(l => { const m = new Date(l.date).toLocaleString('es-AR', { month: 'long', year: 'numeric' }); monthsSet.add(m); });
      if(monthsSet.size > 0) { this.availableMonths = Array.from(monthsSet); if (!this.availableMonths.includes(this.selectedMonth)) this.selectedMonth = this.availableMonths[0]; }
  }

  processSupplyRequests() {
      const monthsSet = new Set<string>();
      this.supplyRequests.forEach(r => { if(r.requestMonth) { const m = new Date(r.requestMonth).toLocaleString('es-AR', { month: 'long', year: 'numeric' }); monthsSet.add(m); } });
      const currentMonthStr = new Date().toLocaleString('es-AR', { month: 'long', year: 'numeric' });
      if (monthsSet.size > 0) { this.availableSupplyMonths = Array.from(monthsSet); if (!this.selectedSupplyMonth || !this.availableSupplyMonths.includes(this.selectedSupplyMonth)) { this.selectedSupplyMonth = this.availableSupplyMonths.includes(currentMonthStr) ? currentMonthStr : this.availableSupplyMonths[0]; }
      } else { this.availableSupplyMonths = [currentMonthStr]; this.selectedSupplyMonth = currentMonthStr; }
      const filteredByMonth = this.supplyRequests.filter(r => { if(!r.requestMonth) return false; const logMonth = new Date(r.requestMonth).toLocaleString('es-AR', { month: 'long', year: 'numeric' }); return logMonth === this.selectedSupplyMonth; });
      const groupedObj = filteredByMonth.reduce((acc: any, req: any) => { const loc = req.location || 'Sin Ubicación'; if (!acc[loc]) acc[loc] = []; acc[loc].push(req); return acc; }, {});
      this.groupedSupplyRequests = Object.keys(groupedObj).map(key => ({ location: key, requests: groupedObj[key] }));
  }

  generateGrid() {
      if(!this.isAdmin()) return;
      this.scheduleGrid = this.users.map(u => {
         const row = { employeeName: u.fullName, days: { 0:[], 1:[], 2:[], 3:[], 4:[], 5:[], 6:[] } as any };
         this.consortiums.filter(c => c.assignedUserId === u.id).forEach(c => { c.schedules.forEach((s: any) => { row.days[s.dayOfWeek].push({ consortiumId: c.id, consortiumName: c.name, startTime: s.startTime, endTime: s.endTime }); }); });
         return row;
      }).filter(row => Object.values(row.days).some((arr: any) => arr.length > 0)); 
  }

  saveRates() { localStorage.setItem('employeeRate', this.employeeRate.toString()); localStorage.setItem('adminRate', this.adminRate.toString()); this.showRateSettings = false; Swal.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2500, icon: 'success', title: 'Valores guardados' }); }
  getSelectedUserRole(): string { if (!this.selectedUserId) return ''; const user = this.users.find(u => u.id === this.selectedUserId); return user ? user.role : ''; }
  getCurrentRate(): number { if (!this.selectedUserId) return 0; const user = this.users.find(u => u.id === this.selectedUserId); if (!user) return 0; return user.role === 'Admin' ? this.adminRate : this.employeeRate; }

  calculateHours() {
    if (!this.selectedUserId) { this.monthlyHours = 0; this.filteredLogs = []; return; }
    const userCompletedLogs = this.attendanceLogs.filter(l => l.userId === this.selectedUserId && l.exitTime);
    this.filteredLogs = userCompletedLogs.filter(l => { const logMonth = new Date(l.date).toLocaleString('es-AR', { month: 'long', year: 'numeric' }); return logMonth === this.selectedMonth; }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let monthTotal = 0;
    this.filteredLogs.forEach(log => {
        const cons = this.consortiums.find(c => c.id === log.consortiumId); if(!cons) return;
        const schedule = cons.schedules.find((s:any) => s.dayOfWeek === new Date(log.date).getDay()); if(!schedule) return;
        const start = this.parseTimeStr(schedule.startTime); const end = this.parseTimeStr(schedule.endTime);
        let diffHours = (end.getTime() - start.getTime()) / 3600000; if (diffHours < 0) diffHours += 24; 
        monthTotal += Math.round(diffHours); 
    });
    this.monthlyHours = monthTotal;
  }

  handleQrCodeResult(resultString: string) {
    if (resultString.startsWith('CONSORCIO-')) {
      const consId = parseInt(resultString.split('-')[1]); const cons = this.consortiums.find(c => c.id === consId);
      if (cons) {
        this.disableScanner(); 
        const todayNum = new Date().getDay(); const scheduleToday = cons.schedules.find((s:any) => s.dayOfWeek === todayNum);
        if(!scheduleToday) { Swal.fire('Día Libre', `No hay limpieza programada en ${cons.name} hoy ${this.getDayName(todayNum)}.`, 'warning'); return; }

        if (!cons.latitude || !cons.longitude || (cons.latitude == 0 && cons.longitude == 0)) { this.processScan(cons, scheduleToday); return; }
        Swal.fire({ title: 'Validando GPS...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
            const distance = this.getDistanceFromLatLonInMeters(pos.coords.latitude, pos.coords.longitude, cons.latitude, cons.longitude);
            if (distance <= 200) { Swal.close(); this.processScan(cons, scheduleToday); } else { Swal.fire({ icon: 'error', title: 'Fuera de rango', text: `Estás a ${Math.round(distance)}m del edificio.`, confirmButtonColor: '#8a73ff' }).then(() => this.enableScanner()); }
          }, () => { Swal.fire('Error GPS', 'Necesitamos permisos de ubicación.', 'error').then(() => this.enableScanner()); }, { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });
        }
      } else { Swal.fire('Error', 'Edificio no encontrado.', 'error'); this.disableScanner(); }
    }
  }

  processScan(consortium: any, schedule: any) {
      const now = new Date();
      const existingLog = this.attendanceLogs.find(l => l.consortiumId === consortium.id && l.userId === this.currentUser.id && !l.exitTime);

      if (!existingLog) {
          const start = this.parseTimeStr(schedule.startTime); const diffMins = (now.getTime() - start.getTime()) / 60000; const status = diffMins > 15 ? 'Tardanza' : 'A Tiempo';
          Swal.fire({ title: 'Ingreso a ' + consortium.name, html: `¿Confirmar entrada a las <b>${now.toLocaleTimeString('es-AR', {hour: '2-digit', minute:'2-digit'})}</b>?`, icon: 'question', showCancelButton: true, confirmButtonColor: '#20c997', confirmButtonText: 'Sí, Ingresar' }).then((res) => { 
            if (res.isConfirmed) { const newLog = { id: 0, consortiumId: consortium.id, userId: this.currentUser.id, date: now.toISOString(), entryTime: now.toISOString(), entryStatus: status, exitTime: null, exitStatus: 'Pendiente' }; this.attendanceService.registerScan(newLog).subscribe({ next: () => { Swal.fire('Éxito', 'Ingreso registrado.', 'success'); this.loadData(); }, error: (err) => { Swal.fire('Error', 'Falló el ingreso. Avisá a soporte.', 'error'); this.enableScanner(); } });
            } else { this.enableScanner(); } 
          });
      } else {
          const end = this.parseTimeStr(schedule.endTime); const diffMins = (end.getTime() - now.getTime()) / 60000; const status = diffMins > 10 ? 'Salida Anticipada' : 'A Tiempo';
          Swal.fire({ title: 'Salida de ' + consortium.name, html: `¿Confirmar salida a las <b>${now.toLocaleTimeString('es-AR', {hour: '2-digit', minute:'2-digit'})}</b>?`, icon: 'question', showCancelButton: true, confirmButtonColor: '#dc3545', confirmButtonText: 'Sí, Salir' }).then((res) => { 
            if(res.isConfirmed) { existingLog.exitTime = now.toISOString(); existingLog.exitStatus = status; this.attendanceService.registerScan(existingLog).subscribe({ next: () => { Swal.fire('Éxito', 'Egreso registrado.', 'success'); this.loadData(); }, error: (err) => { Swal.fire('Error', 'Falló la salida.', 'error'); this.enableScanner(); } });
            } else { this.enableScanner(); } 
          });
      }
  }

  parseTimeStr(timeStr: string): Date { if (!timeStr) return new Date(); const parts = timeStr.split(':'); const d = new Date(); d.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0); return d; }
  formatTimeDisplay(timeStr: string): string { if(!timeStr) return '--:--'; return `${timeStr.substring(0,5)}`; }
  getDayName(dayNum: number) { const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']; return days[dayNum]; }
  getConsortiumName(id: number) { const c = this.consortiums.find(x => x.id === id); return c ? c.name : 'Desconocido'; }
  getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) { const R = 6371e3; const dLat = (lat2 - lat1) * (Math.PI / 180); const dLon = (lon2 - lon1) * (Math.PI / 180); const a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(lat1*(Math.PI/180))*Math.cos(lat2*(Math.PI/180))*Math.sin(dLon/2)*Math.sin(dLon/2); return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))); }
  parseCoordinates(event: any) { const input = event.target.value; if (input.includes(',')) { const parts = input.split(','); const lat = parseFloat(parts[0].trim()); const lng = parseFloat(parts[1].trim()); if (!isNaN(lat) && !isNaN(lng)) { this.newConsortium.latitude = lat; this.newConsortium.longitude = lng; event.target.value = ''; this.cdr.detectChanges(); Swal.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, icon: 'success', title: 'Coordenadas capturadas' }); } } }
  getCurrentLocationForTask() { navigator.geolocation?.getCurrentPosition((pos) => { this.newConsortium.latitude = pos.coords.latitude; this.newConsortium.longitude = pos.coords.longitude; this.cdr.detectChanges(); Swal.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, icon: 'success', title: 'Ubicación actual guardada' }); }); }

  showForm() { this.isFormVisible = true; this.newConsortium = { name: '', address: '', latitude: 0, longitude: 0, assignedUserId: null, schedules: [] }; this.weekDays.forEach(d => d.active = false); }
  hideForm() { this.isFormVisible = false; }
  saveConsortium() { this.newConsortium.schedules = this.weekDays.filter(d => d.active).map(d => ({ dayOfWeek: d.id, startTime: d.start + ':00', endTime: d.end + ':00' })); this.consortiumService.createConsortium(this.newConsortium).subscribe(() => { this.loadData(); this.hideForm(); Swal.fire('¡Edificio Guardado!', '', 'success'); }); }
  deleteConsortium(id: number) { Swal.fire({ title: '¿Eliminar Edificio?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc3545' }).then((r) => { if (r.isConfirmed) { this.consortiumService.deleteConsortium(id).subscribe(() => { this.loadData(); Swal.fire('Eliminado', '', 'success'); }); } }); }
  enableScanner() { this.isScanning = true; } disableScanner() { this.isScanning = false; }
  openQrModal(consortiumId: number, name: string) { this.qrDataString = `CONSORCIO-${consortiumId}`; this.qrBuildingName = name; this.showQr = true; } closeQrModal() { this.showQr = false; } printPage() { window.print(); }
  addProduct() { if(!this.newProductName) return; this.productService.createProduct({ name: this.newProductName }).subscribe(() => { this.newProductName = ''; this.loadData(); Swal.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, icon: 'success', title: 'Artículo agregado' }); }); }
  deleteProduct(id: number) { this.productService.deleteProduct(id).subscribe(() => this.loadData()); }
  
  submitRequest() { 
    if(!this.newRequest.location || !this.newRequest.productId) { Swal.fire('Error', 'Completa el edificio y el artículo', 'warning'); return; } 
    const requestData = { userId: this.currentUser.id, location: this.newRequest.location, productId: this.newRequest.productId, quantity: this.newRequest.qty, status: 'Pendiente', requestMonth: new Date().toISOString() }; 
    this.requestService.createRequest(requestData).subscribe({ next: () => { Swal.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, icon: 'success', title: 'Pedido registrado' }); this.newRequest = { location: '', productId: null, qty: 1 }; this.loadData(); }, error: (err) => { console.error("Error:", err); Swal.fire('Error', 'Falló el envío del pedido.', 'error'); } }); 
  }
  
  markAsDelivered(id: number) { this.requestService.markAsDelivered(id).subscribe(() => { Swal.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2500, icon: 'success', title: 'Entregado' }); this.loadData(); }); }

  // ---> NUEVA FUNCIÓN: VALidador de Reemplazos <---
  isReplacement(consortiumId: number, userId: number): boolean {
    const cons = this.consortiums.find(c => c.id === consortiumId);
    // Si el consorcio existe, tiene un empleado fijo, y ese empleado es distinto al que fichó = REEMPLAZO
    return cons && cons.assignedUserId !== null && cons.assignedUserId !== userId;
  }
}