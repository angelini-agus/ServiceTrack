import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SupplyRequestService {
  private apiUrl = 'http://192.168.100.222:5000/api/SupplyRequests';

  constructor(private http: HttpClient) { }

  getRequests(): Observable<any[]> { return this.http.get<any[]>(this.apiUrl); }
  createRequest(request: any): Observable<any> { return this.http.post(this.apiUrl, request); }
  markAsDelivered(id: number): Observable<any> { return this.http.put(`${this.apiUrl}/${id}/entregado`, {}); }
}