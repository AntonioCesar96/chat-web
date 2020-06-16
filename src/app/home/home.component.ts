import { ConversaComponent } from './conversa/conversa.component';
import { AppSignalRService } from '../_common/services/signalr.service';
import { AutenticacaoService } from './../_common/services/autenticacao.service';
import { Component, OnInit, ViewContainerRef, ViewChild, ComponentFactoryResolver } from '@angular/core';
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
    private appSignalRService: AppSignalRService,
    private componentFactoryResolver: ComponentFactoryResolver
  ) { }

  ngOnInit() {
    if (!this.autenticacaoService.estaLogado()) {
      this.router.navigate([`/entrar`]);
      return;
    }

    this.location.replaceState('/');

    const contato = this.autenticacaoService.getContatoLogado();
    this.appSignalRService.criarConexao('/chatHub', contato.contatoId);
    this.appSignalRService.iniciarConexao();
    this.appSignalRService.configurarMetodos();
  }

  criarComponente() {
    this.myRef.clear();
    const factory = this.componentFactoryResolver.resolveComponentFactory(ConversaComponent);
    const ref = this.myRef.createComponent(factory);
    ref.changeDetectorRef.detectChanges();
  }
}
