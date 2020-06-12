export class MensagemFiltro {
  conversaId: number;
  pagina: number;
  totalPorPagina: number;

  constructor(conversaId: number) {
    this.conversaId = conversaId;
    this.pagina = 1;
    this.totalPorPagina = 20;
  }
}
