import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class SenalizacionService {

  configuration: Object;
  peerConnection: RTCPeerConnection;

  constructor(private socket: Socket) { 
    // Inicializar valores de conexión
    this.configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
    this.peerConnection = new RTCPeerConnection(this.configuration);
  }


  async emitirOferta(sala: string, link: string, status: number){
    console.log('Emitiré mi oferta');
    
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    const data = {
      offer,
      sala,
      link,
      status
    }

    this.socket.emit('ofertaPaciente', data, (err: any, respuesta: any) => {
      if(err){
        console.log(err);
      } else {
        console.log(respuesta);
      }
    });

    this.escucharRespuesta(link);
  }

  async escucharRespuesta(link: string) {
    try {
      this.socket.on(`esperarRespuesta${link}`, (answer: any) => {

        // console.log('Recibí una aparente respuesta: ');
        // console.log(respuesta);
        if (answer.type === 'answer') {
          console.log('El medico envió una respuesta válida');
          this.guardarSesionRemota(answer);
        } else {
          console.log('El médico no envió una respuesta válida');
        }
      });

    } catch (error) {
      console.log('Ocurrió un error escuchar la respuesta del medico');
      console.log(error);
    }
  }

  async guardarSesionRemota(answer: any){
      const remoteDesc = new RTCSessionDescription(answer);
      // console.log('Sesión description: ', remoteDesc);
      await this.peerConnection.setRemoteDescription(remoteDesc);
      
        // .then( resp => {
        //   console.log('SHI');
        //   console.log( resp );
        // })
        // .catch( error => {
        //   console.log('NO');
        //   console.log( error );
        // } );
  }
}
