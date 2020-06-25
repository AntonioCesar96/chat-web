import { Contato } from '../../_common/models/contato.model';
import { UrlService } from '../../_common/services/url.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class LoginService {
  API = 'contato';
  URL_BASE = '';

  constructor(
    private http: HttpClient,
    private urlService: UrlService
  ) {
      this.URL_BASE = urlService.URL_BASE;
  }

  autenticar(email: string, senha: string): Observable<any> {
    return this.http.post<any>(`${this.URL_BASE}/${this.API}/${email}/${senha}`, {});
  }

  criarConta(contato: Contato): Observable<any> {
    return this.http.post<any>(`${this.URL_BASE}/${this.API}`, contato);
  }

  obterPorEmail(token: string, email: string): Observable<Contato> {
    const headers = this.getHeaders(token);
    return this.http.get<any>(`${this.URL_BASE}/${this.API}/${email}`, { headers } );
  }

  desconectar(token: string): Observable<any> {
    const headers = this.getHeaders(token);
    return this.http.post<any>(`${this.URL_BASE}/${this.API}/desconectar`,{}, { headers } );
  }

  getHeaders(token: string) {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }
}
