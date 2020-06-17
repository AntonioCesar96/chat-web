import { SignalRService } from '../_common/services/signalr.service';
import { AutenticacaoService } from './../_common/services/autenticacao.service';
import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  @ViewChild('dynamicComponent', { read: ViewContainerRef }) myRef

  constructor(
    private router: Router,
    private location: Location,
    private autenticacaoService: AutenticacaoService,
    private signalRService: SignalRService
  ) { }

  ngOnInit() {
    if (!this.autenticacaoService.estaLogado()) {
      this.router.navigate([`/entrar`]);
      return;
    }

    this.location.replaceState('/');

    const contato = this.autenticacaoService.getContatoLogado();
    this.signalRService.inicializar(contato.contatoId);
  }
}
