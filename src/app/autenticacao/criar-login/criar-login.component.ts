import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-criar-login',
  templateUrl: './criar-login.component.html',
  styleUrls: ['./criar-login.component.scss']
})
export class CriarLoginComponent implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
  }

  criarConta() {
    this.router.navigate([`/entrar`]);
  }
}
