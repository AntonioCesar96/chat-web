import { StatusMensagem } from 'src/app/_common/models/status-mensagem.enum';
import { Mensagem } from 'src/app/_common/models/mensagem.model';
import { Resultado } from 'src/app/_common/models/resultado.model';
import { UltimaConversa } from '../../_common/models/ultima-conversa.model';
import { Injectable } from '@angular/core';
import { Contato } from 'src/app/_common/models/contato.model';

@Injectable({ providedIn: 'root' })
export class ConversaService {
  private ultimasConversas: Resultado<UltimaConversa>;

  constructor() {
    this.ultimasConversas = new Resultado<UltimaConversa>();
    this.ultimasConversas.lista = [];
    this.ultimasConversas.total = 0;
  }

  obterUltimasConversas(): Resultado<UltimaConversa> {
    return this.ultimasConversas;
  }

  obterUltimasConversasLista(): UltimaConversa[] {
    return this.ultimasConversas.lista;
  }

  obterConversaPorId(conversaId: number): UltimaConversa {
    return this.ultimasConversas.lista.find(x => x.conversaId === conversaId);
  }

  obterConversaPorContatoAmigoId(contatoAmigoId: number): UltimaConversa {
    return this.ultimasConversas.lista.find(x => x.contatoAmigoId === contatoAmigoId);
  }

  existeConversas() {
    return this.ultimasConversas.lista.length > 0;
  }

  atualizarVariavelUltimasConversas(ultimasConversas: Resultado<UltimaConversa>) {
    this.ultimasConversas = ultimasConversas;
    this.fecharConversas();
  }

  fecharConversas() {
    this.ultimasConversas.lista.forEach(conversa => conversa.conversaAberta = false);
  }

  adicionarConversa(conversa: UltimaConversa) {
    this.ultimasConversas.lista.push(conversa);
    this.ultimasConversas.total++;
    this.ordenarConversas();
  }

  ordenarConversas() {
    this.ultimasConversas.lista.sort((n1,n2) =>
      new Date(n2.dataEnvio).getTime() - new Date(n1.dataEnvio).getTime());
  }
}
