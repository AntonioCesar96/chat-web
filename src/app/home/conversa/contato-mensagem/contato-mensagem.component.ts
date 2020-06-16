import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Contato } from 'src/app/_common/models/contato.model';
import { UltimaConversa } from 'src/app/_common/models/ultima-conversa.model';
import { Subscription } from 'rxjs';
import { ConversaService } from '../../services/conversa.service';
import * as moment from 'moment';

@Component({
  selector: 'app-contato-mensagem',
  templateUrl: './contato-mensagem.component.html'
})
export class ContatoMensagemComponent implements OnInit, OnDestroy {
  @Input() contatoLogado: Contato;
  ultimaConversa: UltimaConversa;
  conversaSubscription: Subscription;
  contatoDigitandoSubscription: Subscription;

  constructor(
    private conversaService: ConversaService) { }

  ngOnInit() {
    this.inicializar();
  }

  ngOnDestroy() {
    if (!this.conversaSubscription) { return; }
    this.conversaSubscription.unsubscribe();
  }

  inicializar() {
    this.conversaSubscription = this.conversaService
      .conversaSelecionada()
      .subscribe((conversa) => {
        this.ultimaConversa = conversa;
    });
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
}
