import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ConsortiumService {
  private apiUrl = 'http://192.168.100.222:5000/api/Consortiums';

  constructor(private http: HttpClient) { }

  getConsortiums(): Observable<any[]> { return this.http.get<any[]>(this.apiUrl); }
  createConsortium(data: any): Observable<any> { return this.http.post(this.apiUrl, data); }
  deleteConsortium(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/${id}`); }
}