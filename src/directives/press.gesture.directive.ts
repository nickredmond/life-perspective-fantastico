import {Directive, ElementRef, Output, OnInit, OnDestroy, EventEmitter} from '@angular/core';
import {Gesture} from 'ionic-angular/gestures/gesture';
//import { Hammer } from 'hammerjs';
declare var Hammer: any;

@Directive({
  selector: '[anyPress]'
})
export abstract class PressDirective implements OnInit, OnDestroy {
  el: HTMLElement;
  directiveGesture: Gesture;
  doubleTapGesture: Gesture;
  static eventName: string = null;

  @Output()
  longPressEvent: EventEmitter<any> = new EventEmitter();
  @Output()
  panEvent: EventEmitter<any> = new EventEmitter();
  @Output()
  doubleTapEvent: EventEmitter<any> = new EventEmitter();

  constructor(el: ElementRef) {
    this.el = el.nativeElement;
  }

  static getEventName(): string { return PressDirective.eventName; }
  static setEventName(name: string) { PressDirective.eventName = name; }

  ngOnInit() {
    this.directiveGesture = new Gesture(this.el);
    this.directiveGesture.listen();
    this.directiveGesture.on('pan', e => {
      this.panEvent.emit(e);
    });
    this.directiveGesture.on('press', e => {
      this.longPressEvent.emit(e);
    });

    this.doubleTapGesture = new Gesture(this.el, {
      recognizers: [
        [Hammer.Tap, {taps: 2}]
      ]
    });
    this.doubleTapGesture.listen();
    this.doubleTapGesture.on('tap', e => {
      this.doubleTapEvent.emit(e);
    });
  }

  ngOnDestroy() {
    this.directiveGesture.destroy();
  }
}