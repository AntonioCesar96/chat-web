import { UrlService } from '../../_common/services/url.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpBaseService } from 'src/app/_common/services/base.service';

@Injectable()
export class ConversaService extends HttpBaseService {
  API = 'conversa';

  constructor(
    private http: HttpClient,
    urlService: UrlService
  ) {
    super(urlService);
  }

  obterConversasDoContato(filtro: any): Observable<any> {
    return this.http.get<any>(`${this.URL_BASE}/${this.API}/${this.prepararParametros(filtro)}`);
  }
}
