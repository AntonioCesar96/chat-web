import { Contato } from '../models/contato.model';
import { Injectable } from '@angular/core';

@Injectable()
export class AutenticacaoService {
  private contatoLogado: Contato;
  private contatoCriado: Contato;

  setContatoCriado(contato: Contato) {
    this.contatoCriado = contato;
  }

  getContatoCriado(): Contato {
    return this.contatoCriado;
  }

  limparContatoCriado() {
    this.contatoCriado = null;
  }

  setContatoLogado(contato: Contato) {
    this.contatoLogado = contato;
  }

  estaLogado(): boolean {
    return !!this.contatoLogado;
  }

  getContatoLogado(): Contato {
    return this.contatoLogado;
  }

  limparContatoLogado() {
    this.contatoLogado = null;
  }
}
