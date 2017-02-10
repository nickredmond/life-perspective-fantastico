import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { BallVsWildPage } from '../pages/ball-vs-wild/ball-vs-wild';
import { ListPage } from '../pages/list/list';
import { PressDirective } from '../directives/press.gesture.directive.ts';
import { Storage } from '@ionic/storage';

import {
  AngularFireModule,
  AuthMethods,
  AuthProviders
} from "angularfire2";
// import {HTTP_PROVIDERS} from 'angular2/http';

  // Initialize Firebase
  const config = {
    apiKey: "AIzaSyBCOv2gqgib6LRrO01-de-hUlO4vUb3uw0",
    authDomain: "redmond-ionic-bees.firebaseapp.com",
    databaseURL: "https://redmond-ionic-bees.firebaseio.com",
    storageBucket: "redmond-ionic-bees.appspot.com",
    messagingSenderId: "581611933375"
  };

@NgModule({
  declarations: [
    MyApp,
    BallVsWildPage,
    ListPage,
    PressDirective
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(config,{
      provider: AuthProviders.Google,
      method: AuthMethods.Password
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    BallVsWildPage,
    ListPage
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Storage,
    // HTTP_PROVIDERS
  ]
})
export class AppModule {}
