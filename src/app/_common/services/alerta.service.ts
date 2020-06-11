import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable()
export class AlertaService {
  alertar(titulo: any, icone: any, time = 1000) {
    Swal.fire({
      title: titulo,
      icon: icone,
      timer: time,
      showConfirmButton: false,
      allowOutsideClick: false
    });
  }

  alertarSucesso(titulo: string) {
    this.alertar(titulo, 'success');
  }

  alertarAviso(titulo: string, timer = 1000) {
    this.alertar(titulo, 'warning', timer);
  }

  informarMensagem(titulo: string, texto: string, icone: any = 'warning') {
    Swal.fire({
      title: titulo,
      icon: icone,
      text: texto,
      showConfirmButton: true
    });
  }

  alertarSucessoComRetorno(titulo: string, texto: string, confirmText: string, callbackFunction: any) {
    Swal.fire({
      title: titulo,
      text: texto,
      icon: 'success',
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
