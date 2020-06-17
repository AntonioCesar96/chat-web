import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Contato } from 'src/app/_common/models/contato.model';
import { UltimaConversa } from 'src/app/_common/models/ultima-conversa.model';
import { ConversaService } from '../../services/conversa.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';

@Component({
  selector: 'app-contato-mensagem',
  templateUrl: './contato-mensagem.component.html'
})
export class ContatoMensagemComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() contatoLogado: Contato;
  ultimaConversa: UltimaConversa;

  constructor(
    private conversaService: ConversaService) { }

  ngOnInit() {
    this.inicializar();
  }

  inicializar() {
    this.conversaService
      .conversaSelecionada()
      .pipe(takeUntil(this.destroy$))
      .subscribe((conversa) => this.ultimaConversa = conversa);
  }

  ultimoStatus() {
    if(this.ultimaConversa.online) {
      return 'On-line';
    }

    if(this.ultimaConversa.dataRegistroOnline) {
      return moment(this.ultimaConversa.dataRegistroOnline).calendar();
    }
    return '';
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
