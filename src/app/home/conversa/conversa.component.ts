import { ListaAmigos } from './../../_common/models/lista-amigos.model';
import { UltimaConversa } from 'src/app/_common/models/ultima-conversa.model';
import { ConversaSubjectsService } from '../services/conversa-subjects.service';
import { Contato } from './../../_common/models/contato.model';
import { AutenticacaoService } from './../../_common/services/autenticacao.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-conversa',
  templateUrl: './conversa.component.html'
})
export class ConversaComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  contatoLogado: Contato;

  constructor(
    private conversaService: ConversaSubjectsService,
    private autenticacaoService: AutenticacaoService) { }

  ngOnInit() {
    if (!this.autenticacaoService.estaLogado()) { return; }
    this.contatoLogado = this.autenticacaoService.getContatoLogado();

    this.inicializar();
  }

  inicializar() {
    this.conversaService
      .receberConversaSelecionada()
      .pipe(takeUntil(this.destroy$))
      .subscribe((conversa) => this.abrirConversaSelecionada(conversa));

    this.conversaService
      .receberContatoSelecionado()
      .pipe(takeUntil(this.destroy$))
      .subscribe((contatoAmigo) => this.abrirContatoSelecionado(contatoAmigo));

    this.conversaService
      .receberPrimeiraConversa()
      .pipe(takeUntil(this.destroy$))
      .subscribe((conversa) => this.abrirPrimeiraConversa(conversa));
  }

  abrirConversaSelecionada(conversa: UltimaConversa) {
    this.conversaService.abrirConversaSelecionadaMensagem(conversa);
    this.conversaService.mostrarDetalhes(false);
  }

  abrirPrimeiraConversa(conversa: UltimaConversa) {
    this.conversaService.abrirPrimeiraConversaMensagem(conversa);
    this.conversaService.mostrarDetalhes(false);
  }

  abrirContatoSelecionado(contatoAmigo: ListaAmigos) {
    const conversa = this.criarConversa(contatoAmigo);
    this.conversaService.abrirContatoSelecionadoMensagem(conversa);
    this.conversaService.mostrarDetalhes(false);
  }

  criarConversa(contatoAmigo: ListaAmigos) {
    const conversa = new UltimaConversa();
    conversa.conversaId = 0;
    conversa.qtdMensagensNovas = 0;
    conversa.contatoRemetenteId = this.contatoLogado.contatoId;
    conversa.contatoDestinatarioId = contatoAmigo.contatoAmigoId;
    conversa.contatoAmigoId = contatoAmigo.contatoAmigoId;
    conversa.nome = contatoAmigo.nomeAmigo;
    conversa.email = contatoAmigo.emailAmigo;
    conversa.fotoUrl = contatoAmigo.fotoUrl;
    conversa.conversaAberta = true;

    return conversa;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
