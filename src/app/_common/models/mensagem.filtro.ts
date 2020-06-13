export class MensagemFiltro {
  conversaId: number;
  pagina: number;
  qtdMensagensPular: number;
  totalPorPagina: number;

  constructor(conversaId: number) {
    this.conversaId = conversaId;
    this.pagina = 1;
    this.totalPorPagina = 40;
    this.qtdMensagensPular = 0;
  }
}
