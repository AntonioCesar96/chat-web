import { AutenticacaoService } from '../services/autenticacao.service';
import { StringResources } from './../../string-resources';
import { Erro } from '../../_common/models/erro.model';
import { Contato } from '../../_common/models/contato.model';
import { LoginService } from '../services/login.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  erro: Erro;
  criouContaAgora = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private loginService: LoginService,
    private autenticacaoService: AutenticacaoService,
  ) { }

  ngOnInit() {
    this.criarForm();
    this.preencherCamposSeCriouContaAgora();
  }

  criarForm() {
    this.form = this.fb.group({
      email: [''],
      senha: [''],
    });
  }

  preencherCamposSeCriouContaAgora() {
    const contato = this.autenticacaoService.getContatoCriado();
    if (!contato) { return; }

    this.autenticacaoService.limparContatoCriado();
    this.preencherCampos(contato);
    this.criouContaAgora = true;
  }

  preencherCampos(contato: Contato) {
    this.form.get('email').setValue(contato.email);
    this.form.get('senha').setValue(contato.senha);
  }

  entrar() {
    if (this.validarSeExisteErroNosCampos()) { return; }
    this.autenticar();
  }

  private autenticar() {
    this.loginService.autenticar(this.form.value.email, this.form.value.senha)
      .subscribe(res => this.tratarRetornoAutenticao(res));
  }

  tratarRetornoAutenticao(res) {
    if (res.erros) {
      this.erro = res as Erro;
      return;
    }

    localStorage.setItem('access_token', res.token);
    this.autenticacaoService.setContatoLogado(res.contato as Contato);
    this.router.navigate([`/home`]);
  }

  validarSeExisteErroNosCampos() {
    this.erro = new Erro();

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
