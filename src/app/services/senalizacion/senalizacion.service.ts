import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { RouterLinkActive, ActivatedRoute, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SenalizacionService {

  configuration: Object;
  peerConnection: RTCPeerConnection;

  mediaDevices: any;
  navigator: any;

  estatusLabel: string;
  clave: string;

  sala: string;
  link: string;
  status: number;
  // Para lbl consola 
  estatusConexion: string;

  constructor(private socket: Socket, private routerActive: ActivatedRoute) { 
    // Inicializar valores de conexión
    // this.configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
    
    this.configuration = {
      iceServers: [{
              urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
          }
      ],
    };
    this.routerActive.params.subscribe( (data: any) => {
      this.clave = data.clave;
    });
    
    this.peerConnection = new RTCPeerConnection();
    this.agregarEscuchadores();
    this.obtenerDispositivosConectados();
    
  }


  obtenerVideoLocal(videoLocal: any){

    // Lugar originarl 
    // this.escucharCandidatos();

    console.log('Obteniendo video local..');
    this.estatusLabel = 'Obteniendo video...';
    const constraints = { 'audio': true, 'video': false};
    navigator.mediaDevices.getUserMedia(constraints).then( (stream: MediaStream) => {
      this.estatusLabel = 'Ya conseguí stream';
      // console.log(stream);
      videoLocal.srcObject = stream;
  
      // ADD TRACK FORMA I
      // stream.getTracks().forEach( track => {
      //   this.peerConnection.addTrack(track, stream);
      // });

      // ADD TRACK FORMA II
      // for (const track of stream.getTracks()) {
      //   console.log('AGREGANDO TRACKS');
      //   this.peerConnection.addTrack(track, stream);
      // }
    
    }).catch( (error) => {
      this.estatusLabel = '==> CATCH <==';
      console.log(error.name);
      if (error.name === 'PermissionDeniedError') {
       alert('No se han otorgado permisos para usar su cámara y '+
       'micrófono, debe permitir que la página acceda a sus dispositivos en' +
       'orden.');
      } else if (error.name === 'NotFoundError'){
        alert('No hay un dispositivo de audio conectado');
      } else {
        alert(error.name);
      }
      console.error(error);
    });

  }

// async 
  emitirOferta(sala: string, link: string, status: number){
    this.sala = sala;
    this.link = link;
    this.status = status;

    var constraintsOffer = { offerToReceiveVideo: false, offerToReceiveAudio: true };
    this.peerConnection.createOffer(constraintsOffer)
    .then( offer => {
      this.peerConnection.setLocalDescription(offer);
      // console.log('Offer: ', offer);
    })
    .then( () => {
      var data = {
        offer: this.peerConnection.localDescription,
        sala: this.sala,
        link: this.link,
        status: this.status
      }
      this.socket.emit('ofertaPaciente', data, (err: any, respuesta: any) => {
          if(err){
            console.log(err);
          } else {
            console.log(respuesta);
          }
        })
      }
    )
    
    console.log('Generé y emití mi oferta');
    this.escucharRespuesta(link);
  }

  async escucharRespuesta(link: string) {
    try {
      this.socket.on(`esperarRespuesta${link}`, (answer: any) => {

        // console.log('Recibí una aparente respuesta: ');
        // console.log(respuesta);
        if (answer.type === 'answer') {
          
          console.log('El medico envió una respuesta válida');
          this.guardarSesionRemota(answer)
          .then( () => {
            console.log('Se guardó');
          })
          .catch( (err) => {
            console.log('No se guardó sesión remota, con error:');
            console.log(err);
          })
        } else {
          console.log('El médico NO envió una respuesta válida');
        }
      });

    } catch (error) {
      console.log('Ocurrió un error escuchar la respuesta del medico');
      console.log(error);
    }
  }

  async guardarSesionRemota(answer: any){
    // console.log('El answer es');
    // console.log(answer);
      const remoteDesc = new RTCSessionDescription(answer);
      await this.peerConnection.setRemoteDescription(remoteDesc);
  }

 //Escuche a los candidatos locales de ICE en la RTCPeerConnection local
  agregarEscuchadores(){
    try {
      
      this.peerConnection.addEventListener('icecandidate', (event: RTCPeerConnectionIceEvent) => {
        console.log(':::::::CANDIDATO:::::: ');
        if(event.candidate){
          const objetoCandidato ={
            isTrusted: event.isTrusted ,
            candidate: event.candidate ,
            type: event.type ,
            target: event.target ,
            currentTarget: event.currentTarget ,
            eventPhase: event.eventPhase,
            bubbles: event.bubbles ,
            cancelable: event.cancelable ,
            defaultPrevented: event.defaultPrevented ,
            composed: event.composed ,
            timeStamp: event.timeStamp ,
            srcElement: event.srcElement ,
            returnValue: event.returnValue ,
            cancelBubble: event.cancelBubble
            // path: event.path
          }
          this.socket.emit('candidatoPaciente', objetoCandidato);
          console.log('----> Tengo un nuevo ICE CANDIDATE Local que ya emití');
          // console.log(event.candidate);
        } else {
          console.log('<---- Ya no tengo candidatos locales');
        }
      });


      this.peerConnection.oniceconnectionstatechange = e => {
        console.info('El estado cambió: ', this.peerConnection.iceConnectionState);
      if(this.peerConnection.iceConnectionState === 'connected'){
        this.estatusConexion = 'Peer conectado';
      }
      }
      this.peerConnection.addEventListener('connectionstatechange', event => {
        console.info('El estatus es: ', this.peerConnection.connectionState);
        // if (peerConnection.connectionState === 'connected') {
            // Peers connected!
        // }
      });

      
    } catch (error) {
      console.log('Error al escuchar candidatos');
      console.log(error);
    }
    
  }
  
  agregarCandidato(candidato){
    this.agregarCandidatoRemoto(candidato).then( (data ) => {
      console.log(':)))) Según se agregó candidato remoto');
    }).catch( (err) => {
      console.log(':(((( Hubo un error al agregar candidato remoto');
      console.error(err);
    });
  }

  async agregarCandidatoRemoto(candidato){
    // console.log('Candidato recibido');
    // console.log(candidato);

    // console.log(this.peerConnection);
    // console.log(this.peerConnection.remoteDescription.type);
    console.log('---> Candidato REMOTO a agregar <---');
    // console.log(candidato);
    // if(!this.peerConnection){ //|| !this.peerConnection.remoteDescription.type
      console.log(':)))) XXXXXXXXXXXXXXXXXXXX');
      const cand = new RTCIceCandidate(candidato.candidate);
      console.log('cand remoto', cand);
      var hasRemote:Boolean = false;
      if(this.peerConnection.remoteDescription){
        hasRemote = true;
      }
      console.error('remote description: ', hasRemote);
      await this.peerConnection.addIceCandidate(cand);
    // } else {
    //   console.log(':(((( Cayó aquí');
    // }
    

  }

  obtenerDispositivosConectados(){
    if (navigator.mediaDevices === undefined) {
      this.mediaDevices = {};
      this.mediaDevices = navigator.mediaDevices;
      this.navigator = navigator;
      this.mediaDevices.getUserMedia = function(constraintObj) {
          let getUserMedia = this.navigator.webkitGetUserMedia || this.navigator.mozGetUserMedia;
          if (!getUserMedia) {
              return Promise.reject(new Error('getUserMedia no está implementado en este navegador'));
          }
          return new Promise(function(resolve, reject) {
              getUserMedia.call(this.navigator, constraintObj, resolve, reject);
          });
      }
    } else {
        console.log('----> Mis dispositivos conectados son: ');
        this.navigator = navigator;
        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                devices.forEach(device => {
                    // console.log(device);
                    console.log(device.kind.toUpperCase() + ' -X- '+  device.label);
                    //, device.deviceId
                })
                console.log('----------------------------------');
            })
            .catch(err => {
                console.log(err.name, err.message);
            });

    }
  }
}
