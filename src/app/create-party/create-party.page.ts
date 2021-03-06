import { Component, OnInit } from '@angular/core';
import {Routes, RouterModule, Router} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';

import { YtService } from '../services/yt/yt.service';

import {AlertController, LoadingController, ToastController} from '@ionic/angular';
import {PartyService} from '../services/party.service';
import { NavController } from '@ionic/angular';
import * as jwt_decode from 'jwt-decode';
import { Observable } from 'rxjs';


@Component({
    selector: 'app-create-party',
    templateUrl: './create-party.page.html',
    styleUrls: ['./create-party.page.scss'],
})
export class CreatePartyPage  {
    Uid: any ;
    playlists: Observable<any[]>;
    playlist: any;
    kw1:any;
    kw2:any;
    idParty: any;  //id Party
    idP: any;



    constructor(
        private router: Router,
        private partyService: PartyService,
        private alertCtrl: AlertController,
        private toastCtrl: ToastController,
        private loadingCtrl: LoadingController,
        private ytService: YtService,
        public navCtrl: NavController
    ) {}

    // tslint:disable-next-line:variable-name
    form_create = new FormGroup({
        name: new FormControl('', [
            Validators.required,
            Validators.minLength(3),
        ]),
        description: new FormControl('', [
            Validators.required,
            Validators.minLength(3),
        ]),
        genre: new FormControl('', [
            Validators.required,

        ]),
        mood: new FormControl('', [
            Validators.required,

        ]),
        user: new FormControl('', [
            Validators.required,
        ]),

    });

    playlist_form = new FormGroup({
        party: new FormControl('', []),
        youtube_p: new FormControl('',[]),
    });

    async onCreate(){

        const loading = await this.loadingCtrl.create({ message: 'Creazione party in corso...' });
        await loading.present();
        this.partyService.create(this.form_create.value).subscribe(
            // If success
            async res => {
                this.idParty=res;
                this.kw1 = this.form_create.value['genre'];
                this.kw2 = this.form_create.value['mood'];

                this.playlists = this.ytService.searchPlaylist(this.kw1, this.kw2);
                this.playlists.subscribe( async data => {
                        this.playlist=data[0].id.playlistId;
                        this.playlist_form.value['youtube_p']=this.playlist;
                        console.log(this.playlist);
                        this.partyService.createP(this.playlist).subscribe();
                        //this.playlist_form.value['party']=this.idParty;

                        const toast = await this.toastCtrl.create({ message: 'Party Creato', duration: 2000, color: 'dark' });
                        await toast.present();
                        loading.dismiss();
                        this.form_create.reset();
                        this.navCtrl.navigateRoot(['/party-playlist/' + this.idParty]);
                    },
                    //If there is an error
                    async () => {
                        const alert = await this.alertCtrl.create({ message: 'There is an error', buttons: ['OK'] });
                        loading.dismiss();
                        await alert.present();
                    }
                );
            });

        //console.log(this.playlist_form.value);


    }

    ionViewDidEnter(){
        const token = localStorage.getItem('token');
        const decoded = jwt_decode(token);
        console.log(decoded);
        this.Uid = decoded['user_id'];
    }

}
