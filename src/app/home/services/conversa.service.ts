import { UltimaConversa } from '../../_common/models/ultima-conversa.model';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class ConversaService {
  conversaSelecionadaSubject = new Subject<UltimaConversa>();

  constructor() { }

  public conversaSelecionada(): Observable<UltimaConversa> {
    return this.conversaSelecionadaSubject.asObservable();
  }

  public selecionarConversa(conversa: UltimaConversa) {
    this.conversaSelecionadaSubject.next(conversa);
  }
}
