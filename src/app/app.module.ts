import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { BallVsWildPage } from '../pages/ball-vs-wild/ball-vs-wild';
import { ListPage } from '../pages/list/list';
import { PressDirective } from '../directives/press.gesture.directive.ts';
import { Storage } from '@ionic/storage';

@NgModule({
  declarations: [
    MyApp,
    BallVsWildPage,
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
    ListPage
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Storage
  ]
})
export class AppModule {}
