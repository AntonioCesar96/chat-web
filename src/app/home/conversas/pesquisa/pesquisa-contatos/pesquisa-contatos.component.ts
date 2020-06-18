import { UltimaConversa } from 'src/app/_common/models/ultima-conversa.model';
import { ConversaService } from '../../../services/conversa.service';
import { SignalRService } from '../../../../_common/services/signalr.service';
import { Resultado } from 'src/app/_common/models/resultado.model';
import { Contato } from 'src/app/_common/models/contato.model';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-pesquisa-contatos',
  templateUrl: './pesquisa-contatos.component.html'
})
export class PesquisaContatosComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  @Input() contatoLogado: Contato;
  filtro: any;
  resultado: Resultado<any>;

  constructor(
    private signalRService: SignalRService,
    private conversaService: ConversaService) { }

  ngOnInit() {
    this.inicializar();
  }

  inicializar() {
    this.signalRService
      .receberContatosAmigosPesquisa()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => this.receberContatosAmigosPesquisa(res));

    this.conversaService
      .receberPesquisaContatos()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => this.receberPesquisa(res));
  }

  receberPesquisa(res) {
    this.filtro = {
      contatoPrincipalId: res.contatoLogadoId,
      nomeAmigo: res.textoPesquisa,
      contatosIdsParaIgnorar: res.contatosIdsParaIgnorar
    };
    this.signalRService.obterContatosAmigosPesquisa(this.filtro);
  }

  receberContatosAmigosPesquisa(res: Resultado<any>) {
    this.resultado = res;
    this.resultado.lista.forEach(conversa => conversa.conversaAberta = false);
  }

  existeContatos() {
    return !!this.resultado && this.resultado.lista.length > 0;
  }

  ordenarConversas() {
    this.resultado.lista.sort((n1,n2) =>
      new Date(n2.dataEnvio).getTime() - new Date(n1.dataEnvio).getTime());
  }

  public selecionarContato(contato: any) {
    const conversa = new UltimaConversa();
    conversa.conversaId = 0;
    conversa.qtdMensagensNovas = 0;
    conversa.contatoRemetenteId = this.contatoLogado.contatoId;
    conversa.contatoDestinatarioId = contato.contatoAmigoId;
    conversa.contatoAmigoId = contato.contatoAmigoId;
    conversa.nome = contato.nomeAmigo;
    conversa.email = contato.emailAmigo;
    conversa.fotoUrl = contato.fotoUrl;

    this.resultado.lista.forEach(x => x.conversaAberta = false);
    this.conversaService.selecionarConversa(conversa);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
