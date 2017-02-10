import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { BallVsWildPage } from '../pages/ball-vs-wild/ball-vs-wild';
import { ItemDetailsPage } from '../pages/item-details/item-details';
import { ListPage } from '../pages/list/list';
import { PressDirective } from '../directives/press.gesture.directive.ts';
import { Storage } from '@ionic/storage';
// import {HTTP_PROVIDERS} from 'angular2/http';

@NgModule({
  declarations: [
    MyApp,
    BallVsWildPage,
    ItemDetailsPage,
    ListPage,
    PressDirective
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    BallVsWildPage,
    ItemDetailsPage,
    ListPage
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Storage,
    // HTTP_PROVIDERS
  ]
})
export class AppModule {}
