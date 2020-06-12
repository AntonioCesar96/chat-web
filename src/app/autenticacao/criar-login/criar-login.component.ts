import { AlertaService } from '../../_common/services/alerta.service';
import { AutenticacaoService } from '../../_common/services/autenticacao.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Erro } from 'src/app/_common/models/erro.model';
import { Contato } from 'src/app/_common/models/contato.model';
import { LoginService } from '../login.service';
import { StringResources } from 'src/app/string-resources';

@Component({
  selector: 'app-criar-login',
  templateUrl: './criar-login.component.html'
})
export class CriarLoginComponent implements OnInit {
  form: FormGroup;
  erro: Erro;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private loginService: LoginService,
    private autenticacaoService: AutenticacaoService,
    private alertaService: AlertaService,
  ) { }

  ngOnInit() {
    this.criarForm();
  }

  criarForm() {
    this.form = this.fb.group({
      nome: [''],
      email: [''],
      senha: [''],
    });
  }

  criarConta() {
    if (this.validarSeExisteErroNosCampos()) { return; }
    this.criar();
  }

  private criar() {
    const contato = this.criarObjetoContato();
    this.loginService.criarConta(contato)
      .subscribe(res => this.tratarRetornoCriacaoContato(res));
  }

  criarObjetoContato() {
    const contato = new Contato();
    contato.nome = this.form.value.nome;
    contato.email = this.form.value.email;
    contato.senha = this.form.value.senha;
    return contato;
  }

  tratarRetornoCriacaoContato(res) {
    if (res.erros) {
      this.erro = res as Erro;
      return;
    }

    this.autenticacaoService.setContatoCriado(res as Contato);
    this.alertarSucesso();
  }

  alertarSucesso() {
    this.alertaService.alertarSucessoComRetorno(
      StringResources.MSG_CONTA_CRIADA,
      '',
      StringResources.MSG_ENTRAR,
      (result) => {
        this.router.navigate([`/entrar`]);
    });
  }

  validarSeExisteErroNosCampos() {
    this.erro = new Erro();

    if (!this.form.value.nome) {
      this.addErro(StringResources.MSG_NOME_DEVE_SER_INFORMADO);
    }

    if (!this.form.value.email) {
      this.addErro(StringResources.MSG_EMAIL_DEVE_SER_INFORMADO);
    }

    if (!this.form.value.senha) {
      this.addErro(StringResources.MSG_SENHA_DEVE_SER_INFORMADO);
    }

    return this.existeErros();
  }

  addErro(msg: string) {
    this.erro.erros.push(msg);
  }

  existeErros() {
    return !!this.erro && this.erro.erros.length > 0;
  }
}
