import { StatusMensagem } from './status-mensagem.enum';
export class UltimaConversa {
  conversaId: number;
  contatoAmigoId: number;
  ultimaMensagem: string;
  contatoRemetenteId: number;
  contatoDestinatarioId: number;
  email: string;
  nome: string;
  fotoUrl: string;
  dataEnvio: string;
  statusUltimaMensagem: StatusMensagem;

  estaDigitando: boolean;
  online: boolean;
  dataRegistroOnline: string;
  qtdMensagensNovas: number;
  mostrarMensagensNovas: boolean;
  conversaAberta: boolean;
  conversaNova: boolean;
}
