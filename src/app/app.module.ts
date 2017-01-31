import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { BallVsWildPage } from '../pages/ball-vs-wild/ball-vs-wild';
import { ItemDetailsPage } from '../pages/item-details/item-details';
import { ListPage } from '../pages/list/list';
import { PressDirective } from '../directives/press.gesture.directive.ts';

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
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}]
})
export class AppModule {}
