import { Conversa } from './../../_common/models/conversa.model';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class ConversaHandleService {
  conversaSelecionadaSubject = new Subject<Conversa>();

  constructor() { }

  public conversaSelecionada(): Observable<Conversa> {
    return this.conversaSelecionadaSubject.asObservable();
  }

  public selecionarConversa(conversa: Conversa) {
    this.conversaSelecionadaSubject.next(conversa);
  }
}
