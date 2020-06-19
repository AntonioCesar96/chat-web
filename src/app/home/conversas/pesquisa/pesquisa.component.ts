import { Contato } from 'src/app/_common/models/contato.model';
import { ConversaSubjectsService } from '../../services/conversa-subjects.service';
import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-pesquisa',
  templateUrl: './pesquisa.component.html'
})
export class PesquisaComponent implements OnInit {
  destroy$: Subject<boolean> = new Subject<boolean>();
  @ViewChild('pesquisa') pesquisa: ElementRef;
  @Input() contatoLogado: Contato;
  textoPesquisa: string;
  esconderResultados = true;

  constructor(private conversaService: ConversaSubjectsService) { }

  ngOnInit() {
    this.conversaService
      .receberEsconderResultados()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.pesquisa.nativeElement.innerText = '';
        this.esconderResultados = res;
      });

    this.conversaService
      .receberAtualizarResultados()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.pesquisar();
      });
  }

  pesquisar() {
    this.textoPesquisa = this.pesquisa.nativeElement.innerText.trim();
    if(!this.textoPesquisa) {
      this.esconderResultados = true;
      return;
    }

    this.esconderResultados = false;
    this.conversaService.pesquisarConversas(this.obterFiltroDaPesquisa());
  }

  obterFiltroDaPesquisa() {
    return {
      contatoLogadoId: this.contatoLogado.contatoId,
      textoPesquisa: this.textoPesquisa
    };
  }
}
