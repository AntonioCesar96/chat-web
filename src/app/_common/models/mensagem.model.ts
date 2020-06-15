import { StatusMensagem } from './status-mensagem.enum';
export class Mensagem {
  mensagemId: number;
  conversaId: number;
  contatoRemetenteId: number;
  contatoDestinatarioId: number;
  mensagemEnviada: string;
  dataEnvio: string;
  statusMensagem: StatusMensagem;

  qtdMensagensNovas: number;
}
