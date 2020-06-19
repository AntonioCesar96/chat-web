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

  atualizarVariavelUltimasConversas(ultimasConversas: Resultado<UltimaConversa>) {
    this.ultimasConversas = ultimasConversas;
    this.fecharConversas();
  }

  fecharConversas() {
    this.ultimasConversas.lista.forEach(conversa => conversa.conversaAberta = false);
  }

  marcarMensagemComoLida(mensagem: Mensagem) {
    const amigo = this.ultimasConversas.lista.find(x => x.conversaId === mensagem.conversaId);
    if(!amigo) { return; }

    amigo.statusUltimaMensagem = StatusMensagem.Lida;
    amigo.qtdMensagensNovas = 0;
    amigo.mostrarMensagensNovas = false;
  }

  validarContatoQueEstaDigitando(res) {
    const amigo = this.ultimasConversas.lista.find(x => x.contatoAmigoId === res.contatoQueEstaDigitandoId)
    if(!amigo) { return; }

    amigo.estaDigitando = res.estaDigitando;
  }

  criarConversaPrimeiraMensagem(mensagem: Mensagem, contatoLogado: Contato) {
    const souORemetente = contatoLogado.contatoId === mensagem.contatoRemetenteId;

    const conversaNova = new UltimaConversa();
    conversaNova.contatoAmigoId = souORemetente
      ? mensagem.contatoDestinatarioId : mensagem.contatoRemetenteId;
    conversaNova.conversaId = mensagem.conversaId;
    conversaNova.contatoRemetenteId = mensagem.contatoRemetenteId;
    conversaNova.contatoDestinatarioId = mensagem.contatoDestinatarioId;
    conversaNova.nome = souORemetente ? mensagem.nomeDestinatario : mensagem.nomeRemetente;
    conversaNova.email = souORemetente ? mensagem.emailDestinatario : mensagem.emailRemetente;
    conversaNova.fotoUrl = souORemetente ? mensagem.fotoUrlDestinatario : mensagem.fotoUrlRemetente;
    conversaNova.ultimaMensagem = mensagem.mensagemEnviada;
    conversaNova.dataEnvio = mensagem.dataEnvio;
    conversaNova.statusUltimaMensagem = mensagem.statusMensagem;

    if(!souORemetente) {
      conversaNova.qtdMensagensNovas = 1;
      conversaNova.mostrarMensagensNovas = true;
    }

    return conversaNova;
  }

  adicionarConversa(conversa: UltimaConversa) {
    this.ultimasConversas.lista.push(conversa);
    this.ultimasConversas.total++;
  }

  ordenarConversas() {
    this.ultimasConversas.lista.sort((n1,n2) =>
      new Date(n2.dataEnvio).getTime() - new Date(n1.dataEnvio).getTime());
  }

  receberMensagem(mensagem: Mensagem, contatoLogado: Contato) {
    const conversa = this.ultimasConversas.lista.find(x => x.conversaId === mensagem.conversaId);
    if(!conversa) { return; }

    this.atualizarUltimaConversa(conversa, mensagem, contatoLogado);
    this.ordenarConversas();
  }

  atualizarUltimaConversa(conversa: UltimaConversa, mensagem: Mensagem, contatoLogado: Contato) {
    conversa.ultimaMensagem = mensagem.mensagemEnviada;
    conversa.dataEnvio = mensagem.dataEnvio;
    conversa.statusUltimaMensagem = mensagem.statusMensagem;
    conversa.contatoRemetenteId = mensagem.contatoRemetenteId;
    conversa.contatoDestinatarioId = mensagem.contatoDestinatarioId;
    if(!conversa.conversaAberta) {
      conversa.qtdMensagensNovas++;
      conversa.mostrarMensagensNovas = mensagem.contatoDestinatarioId === contatoLogado.contatoId;
    }
  }
}
