import { Resultado } from 'src/app/_common/models/resultado.model';
import { UltimaConversa } from '../../_common/models/ultima-conversa.model';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class ConversaService {
  conversaSelecionadaSubject = new Subject<UltimaConversa>();
  pesquisaConversasSubject = new Subject<any>();
  pesquisaContatosSubject = new Subject<any>();
  esconderResultadosSubject = new Subject<boolean>();
  atualizarResultadosSubject = new Subject<boolean>();
  atualizarListaConversasSubject = new Subject<Resultado<UltimaConversa>>();
  atualizarContatosParaFechadosSubject = new Subject<any>();

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

  public receberEsconderResultados(): Observable<boolean> {
    return this.esconderResultadosSubject.asObservable();
  }

  public esconderResultados(res) {
    this.esconderResultadosSubject.next(res);
  }

  public receberAtualizarResultados(): Observable<any> {
    return this.atualizarResultadosSubject.asObservable();
  }

  public atualizarResultados() {
    this.atualizarResultadosSubject.next();
  }

  public receberAtualizarListaConversas(): Observable<any> {
    return this.atualizarListaConversasSubject.asObservable();
  }

  public atualizarListaConversas(res: Resultado<UltimaConversa>) {
    this.atualizarListaConversasSubject.next(res);
  }

  public receberAtualizarContatosParaFechados(): Observable<any> {
    return this.atualizarContatosParaFechadosSubject.asObservable();
  }

  public atualizarContatosParaFechados() {
    this.atualizarContatosParaFechadosSubject.next();
  }
}
