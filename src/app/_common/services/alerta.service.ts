import { Injectable } from '@angular/core';
import swal from 'sweetalert2';

@Injectable()
export class AlertaService {
  alertar(titulo: any, tipo: any, time = 1000) {
    swal({ title: titulo, type: tipo, timer: time, showConfirmButton: false, allowOutsideClick: false });
  }

  alertarSucesso(titulo: string) {
    this.alertar(titulo, 'success');
  }

  alertarAviso(titulo: string, timer = 1000) {
    this.alertar(titulo, 'warning', timer);
  }

  informarMensagem(titulo: string, texto: string, tipo: any = 'warning') {
    swal({ title: titulo, text: texto, type: tipo, showConfirmButton: true });
  }

  alertarSucessoComRetorno(titulo: string, texto: string, confirmText: string, callbackFunction: Function) {
    swal({
      title: titulo,
      text: texto,
      type: 'success',
      showCancelButton: false,
      confirmButtonColor: '#3085d6',
      confirmButtonText: confirmText,
      showConfirmButton: true,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then(result => {
      if (result.value) {
        callbackFunction();
      }
    });
  }
}
