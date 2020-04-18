import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  constructor( private socket: Socket) { }

  emitirLoginConsulta(data, callback?: Function){
    this.socket.emit('loginConsulta', data, callback);
  }


}
