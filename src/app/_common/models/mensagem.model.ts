import { StatusMensagem } from './status-mensagem.enum';
export class Mensagem {
  mensagemId: number;
  conversaId: number;
  contatoRemetenteId: number;
  contatoDestinatarioId: number;
  mensagemEnviada: string;
  dataEnvio: string;
  statusMensagem: StatusMensagem;

  emailRemetente: string;
  nomeRemetente: string;
  descricaoRemetente: string;
  fotoUrlRemetente: string;
  emailDestinatario: string;
  nomeDestinatario: string;
  descricaoDestinatario: string;
  fotoUrlDestinatario: string;

  qtdMensagensNovas: number;
  qtdMensagensNovasDescricao: string;
  dataDescricao: string;
}
