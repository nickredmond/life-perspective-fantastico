import {Directive, ElementRef, Output, OnInit, OnDestroy, EventEmitter} from '@angular/core';
import {Gesture} from 'ionic-angular/gestures/gesture';

@Directive({
  selector: '[anyPress]'
})
export abstract class PressDirective implements OnInit, OnDestroy {
  el: HTMLElement;
  directiveGesture: Gesture;
  static eventName: string = null;

  @Output()
  longPressGesture: EventEmitter<any> = new EventEmitter();
  @Output()
  panGesture: EventEmitter<any> = new EventEmitter();

  constructor(el: ElementRef) {
    this.el = el.nativeElement;
  }

  static getEventName(): string { return PressDirective.eventName; }
  static setEventName(name: string) { PressDirective.eventName = name; }

  ngOnInit() {
    this.directiveGesture = new Gesture(this.el);
    this.directiveGesture.listen();
    this.directiveGesture.on('pan', e => {
      this.panGesture.emit(e);
    });
    this.directiveGesture.on('press', e => {
      this.longPressGesture.emit(e);
    });
  }

  ngOnDestroy() {
    this.directiveGesture.destroy();
  }
}