var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Directive, ElementRef, Output, EventEmitter } from '@angular/core';
import { Gesture } from 'ionic-angular/gestures/gesture';
var PressDirective = PressDirective_1 = (function () {
    function PressDirective(el) {
        this.longPressEvent = new EventEmitter();
        this.panEvent = new EventEmitter();
        this.tapEvent = new EventEmitter();
        this.doubleTapEvent = new EventEmitter();
        this.el = el.nativeElement;
    }
    PressDirective.getEventName = function () { return PressDirective_1.eventName; };
    PressDirective.setEventName = function (name) { PressDirective_1.eventName = name; };
    PressDirective.prototype.ngOnInit = function () {
        var _this = this;
        this.directiveGesture = new Gesture(this.el);
        this.directiveGesture.listen();
        this.directiveGesture.on('pan', function (e) {
            _this.panEvent.emit(e);
        });
        this.directiveGesture.on('press', function (e) {
            _this.longPressEvent.emit(e);
        });
        this.directiveGesture.on('tap', function (e) {
            _this.tapEvent.emit(e);
        });
        this.doubleTapGesture = new Gesture(this.el, {
            recognizers: [
                [Hammer.Tap, { taps: 2 }]
            ]
        });
        this.doubleTapGesture.listen();
        this.doubleTapGesture.on('tap', function (e) {
            _this.doubleTapEvent.emit(e);
        });
    };
    PressDirective.prototype.ngOnDestroy = function () {
        this.directiveGesture.destroy();
    };
    return PressDirective;
}());
PressDirective.eventName = null;
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], PressDirective.prototype, "longPressEvent", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], PressDirective.prototype, "panEvent", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], PressDirective.prototype, "tapEvent", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], PressDirective.prototype, "doubleTapEvent", void 0);
PressDirective = PressDirective_1 = __decorate([
    Directive({
        selector: '[anyPress]'
    }),
    __metadata("design:paramtypes", [ElementRef])
], PressDirective);
export { PressDirective };
var PressDirective_1;
//# sourceMappingURL=press.gesture.directive.js.map