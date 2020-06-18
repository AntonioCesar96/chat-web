import { UltimaConversa } from '../../_common/models/ultima-conversa.model';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class ConversaService {
  conversaSelecionadaSubject = new Subject<UltimaConversa>();
  pesquisaConversasSubject = new Subject<any>();
  pesquisaContatosSubject = new Subject<any>();

  constructor() { }

  public conversaSelecionada(): Observable<UltimaConversa> {
    return this.conversaSelecionadaSubject.asObservable();
  }

  public selecionarConversa(conversa: UltimaConversa) {
    this.conversaSelecionadaSubject.next(conversa);
  }

  public receberPesquisaConversas(): Observable<any> {
    return this.pesquisaConversasSubject.asObservable();
  }

  public pesquisarConversas(conversa: any) {
    this.pesquisaConversasSubject.next(conversa);
  }

  public receberPesquisaContatos(): Observable<any> {
    return this.pesquisaContatosSubject.asObservable();
  }

  public pesquisarContatos(conversa: any) {
    this.pesquisaContatosSubject.next(conversa);
  }
}
