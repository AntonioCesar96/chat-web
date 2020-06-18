export class ConversaFiltro {
  contatoId: number;
  nomeContato: string;
  pagina: number;
  totalPorPagina: number;

  constructor(contatoId: number, nomeContato: string = null) {
    this.contatoId = contatoId;
    this.pagina = 1;
    this.totalPorPagina = 20;
    this.nomeContato = nomeContato;
  }
}
