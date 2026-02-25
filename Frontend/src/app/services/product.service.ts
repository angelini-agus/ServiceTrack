import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = 'http://192.168.100.222:5000/api/Products';

  constructor(private http: HttpClient) { }

  getProducts(): Observable<any[]> { return this.http.get<any[]>(this.apiUrl); }
  createProduct(product: any): Observable<any> { return this.http.post(this.apiUrl, product); }
  deleteProduct(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/${id}`); }
}