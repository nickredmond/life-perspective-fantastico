var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { BallVsWildPage } from '../pages/ball-vs-wild/ball-vs-wild';
import { ListPage } from '../pages/list/list';
import { PressDirective } from '../directives/press.gesture.directive.ts';
import { Storage } from '@ionic/storage';
var AppModule = (function () {
    function AppModule() {
    }
    return AppModule;
}());
AppModule = __decorate([
    NgModule({
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
            { provide: ErrorHandler, useClass: IonicErrorHandler },
            Storage
        ]
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map