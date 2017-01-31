import {Directive, ElementRef, Input, OnInit, OnDestroy} from '@angular/core';
import {Gesture} from 'ionic-angular/gestures/gesture';

@Directive({
  selector: null // '[longPress]'
})
export abstract class PressDirective implements OnInit, OnDestroy {
  el: HTMLElement;
  pressGesture: Gesture;
  static eventName: string = null;

  @Output()
  gestureEmitter: EventEmitter = new EventEmitter();

  constructor(el: ElementRef) {
    this.el = el.nativeElement;
  }

  static getEventName(): string { return PressDirective.eventName; }
  static setEventName(name: string): { PressDirective.eventName = name; }

  ngOnInit() {
    this.pressGesture = new Gesture(this.el);
    this.pressGesture.listen();
    this.pressGesture.on('pan', e => {
      this.gestureEmitter.emit(e);
      //console.log('more bridging: ' + JSON.stringify(Object.keys(e)));
      //console.log('pressed: (' + e.center.x + ', ' + e.center.y + ') at vel. (' + e.velocityX + ', ' + e.velocityY + ')');
    });
  }

  ngOnDestroy() {
    this.pressGesture.destroy();
  }
}