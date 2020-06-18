import { Contato } from 'src/app/_common/models/contato.model';
import { ConversaService } from './../../services/conversa.service';
import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';

@Component({
  selector: 'app-pesquisa',
  templateUrl: './pesquisa.component.html'
})
export class PesquisaComponent implements OnInit {
  @ViewChild('pesquisa') pesquisa: ElementRef;
  @Input() contatoLogado: Contato;
  textoPesquisa: string;

  constructor(private conversaService: ConversaService) { }

  ngOnInit(): void {
  }

  pesquisar() {
    this.textoPesquisa = this.pesquisa.nativeElement.innerText.trim();
    if(!this.textoPesquisa) { return; }

    this.conversaService.pesquisarConversas(this.obterFiltroDaPesquisa());
  }

  obterFiltroDaPesquisa() {
    return {
      contatoLogadoId: this.contatoLogado.contatoId,
      textoPesquisa: this.textoPesquisa
    };
  }
}
