import { HttpBaseService } from 'src/app/_common/services/base.service';
import { UrlService } from '../../_common/services/url.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class MensagemService extends HttpBaseService {
  API = 'mensagem';

  constructor(
    private http: HttpClient,
    urlService: UrlService
  ) {
    super(urlService);
  }

  obterMensagens(filtro: any): Observable<any> {
    return this.http.get<any>(`${this.URL_BASE}/${this.API}/${this.prepararParametros(filtro)}`);
  }
}
