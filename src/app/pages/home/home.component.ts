import { Component, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { ConexionService } from '../../services/conexion.service';
import { RouterLinkActive, ActivatedRoute, Router } from '@angular/router';
import { SenalizacionService } from '../../services/senalizacion/senalizacion.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {


  message: string;
  namePaciente: string;
  ok: Boolean;
  clave: string;
  constructor(private _sk: SocketService,
     private _conexion: ConexionService, 
     private routerActive: ActivatedRoute,
     private _skSenalizacion: SenalizacionService) {

    this.routerActive.params.subscribe( (data: any) => {
      console.log(data.clave);
      this.clave = data.clave;
      this.enviarClave(data.clave);
    });

   }

  ngOnInit(): void {
    this.message = 'Por favor espere..'
    this.namePaciente = '';
    this.ok = false;
  }

  enviarClave(link: string){
    this._conexion.validarClave(link).subscribe( (resp: any) => {
      this.message = resp.message;
      this.ok = resp.ok;
      if(this.ok){
        this.namePaciente = resp.nombre + ' ' + resp.apellido_pat_paciente + ' ' + resp.apellido_mat_paciente;
        // this.skLoginConsulta();
      }
    });
  }

  comenzar(){
    this._skSenalizacion.emitirOferta('paciente', this.clave, 0);
  }

  skLoginConsulta(){
    const data = {
      sala: 'paciente',
      link: this.clave, 
      status: 0
    };

    this._sk.emitirLoginConsulta(data, function(error, respuesta) {
      if(error){
        alert(error.message);
      } else {
        console.log(respuesta);
      }
    });
  }
}
