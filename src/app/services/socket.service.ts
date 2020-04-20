import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { SenalizacionService } from './senalizacion/senalizacion.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  constructor( private socket: Socket, private _skSenalizacion: SenalizacionService) { }

  emitirLoginConsulta(data, callback?: Function){
    this.socket.emit('loginConsulta', data, callback);
  }

  escucharCandidatos(link: string){
    console.log('Escuchar candidatos de MP', link);
    this.socket.on(`candidatoMP${link}`, (data: any) =>{
      this._skSenalizacion.agregarCandidato(data);
    })
  }

}
