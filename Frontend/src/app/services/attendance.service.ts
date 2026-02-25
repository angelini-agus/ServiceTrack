import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private apiUrl = 'http://192.168.100.222:5000/api/Attendance';

  constructor(private http: HttpClient) { }

  getLogs(): Observable<any[]> { return this.http.get<any[]>(this.apiUrl); }
  registerScan(data: any): Observable<any> { return this.http.post(this.apiUrl, data); }
}