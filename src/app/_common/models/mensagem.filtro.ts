export class MensagemFiltro {
  conversaId: number;
  pagina: number;
  qtdMensagensPular: number;
  totalPorPagina: number;
  primeiraBusca: boolean;

  constructor(conversaId: number, qtdMensagensPular: number) {
    this.conversaId = conversaId;
    this.pagina = 1;
    this.totalPorPagina = 40;
    this.qtdMensagensPular = qtdMensagensPular;
    this.primeiraBusca = true;
  }
}
