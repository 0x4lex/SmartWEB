import { Component, OnInit } from '@angular/core';
import { LugaresService } from '../services/lugares.service';
import { ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { switchMap, map, debounceTime } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';
@Component({
  selector: 'app-crear',
  templateUrl: './crear.component.html',
  styleUrls: ['./crear.component.css']
})
export class CrearComponent implements OnInit {
  lugar: any = {};
  id = null;
  results: Observable<any>;
  private searchField: FormControl;

  constructor(
    private lugarService: LugaresService,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
    const url = 'https://maps.google.com/maps/api/geocode/json';

    this.id = this.route.snapshot.params['id'];
    if (this.id !== 'new') {
      this.lugarService
        .getLugar(this.id)
        .valueChanges()
        .subscribe(res => {
          this.lugar = res;
        });
    }

    this.searchField = new FormControl();
    this.results = this.searchField.valueChanges.pipe(
      debounceTime(500),
      switchMap(q => this.http.get<any>(`${url}?address=${q}`)),
      map(res => res.results)
    );
  }

  ngOnInit() {}

  seleccionarDireccion(result) {
    const addressComponents = result.address_components;
    const adrressParams: any = {};

    for (let i = 0, len = addressComponents.length; i < len; i++) {
      const type = addressComponents[i].types[0].toString();
      switch (type) {
        case 'street_number':
          adrressParams.street_number = addressComponents[i].long_name;
          break;
        case 'route':
          adrressParams.route = addressComponents[i].long_name;
          break;
        case 'locality':
          adrressParams.locality = addressComponents[i].long_name;
          break;
        case 'country':
          adrressParams.country = addressComponents[i].long_name;
          break;
      }
    }
    this.lugar.calle = `${adrressParams.route}${adrressParams.street_number}`;
    this.lugar.ciudad = adrressParams.locality;
    this.lugar.pais = adrressParams.country;
  }

  guardarLugar() {
    /*
    let direccion = `${this.lugar.calle}, ${this.lugar.ciudad}, ${this.lugar.pais}`;
    this.lugaresService.obtenerGeoData(direccion)
        .subscribe((result) => {
          this.lugar.lat = result.json().results[0].geometry.location.lat;
          this.lugar.lng = result.json().results[0].geometry.location.lng;
          if (this.id !== 'new') {
            this.lugaresService.editarLugar(this.lugar);
            alert('El negocio se ha editado con éxito');
          } else {
            this.lugar.id = Date.now();
            this.lugaresService.guardarLugar(this.lugar);
            alert('Se ha creado el negocio con éxito');
          }
          this.lugar = {};
        });
        */
       var direccion = this.lugar.calle +','+ this.lugar.ciudad +','+ this.lugar.pais;
       this.lugarService
         .obtenerGeoData(direccion)
           .subscribe( (result:any) => {
             debugger;
             this.lugar.lat = result.results[0].geometry.location.lat;
             this.lugar.lng = result.results[0].geometry.location.lng;
   
             if (this.id != 'new') {
               this.lugarService.guardarLugar(this.lugar)
               // alert('¡Negocio editado con exito!')
               swal({
                 type: 'success',
                 title: 'Indicio editado con exito!',
               })
             } else {
               this.lugar.id = Date.now()
               this.lugarService.guardarLugar(this.lugar)
               // alert('¡Negocio guardado con exito!')
               swal({
                 type: 'success',
                 title: 'Indicio guardado con exito!',
               })
             }
             this.lugar = {}
           })
     }
}
