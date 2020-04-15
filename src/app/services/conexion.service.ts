import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConexionService {

  URL = environment.url;

  constructor( private http: HttpClient) { }

  validarClave(clave: string){
    return this.http.post(`${this.URL}/consulta/${clave}`, clave);
  }
}
