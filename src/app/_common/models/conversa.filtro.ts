export class ConversaFiltro {
  contatoId: number;
  pagina: number;
  totalPorPagina: number;

  constructor(contatoId: number) {
    this.contatoId = contatoId;
    this.pagina = 1;
    this.totalPorPagina = 20;
  }
}
