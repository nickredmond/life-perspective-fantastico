import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';


@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  selectedItem: any;
  icons: string[];
  items: Array<{title: string, note: string, icon: string}>;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    // If we navigated to this page, we will have an item available as a nav param
    this.selectedItem = navParams.get('item');

    this.icons = ['heart', 'heart-outline', 'color-wand', 'brush', 'book', 'bulb',
    'cafe', 'chatbubbles', 'restaurant', 'pizza', 'color-wand'];
    this.items = [];

    let numWands = 0;
    let numFoods = 0;
    while (this.icons.length > 0) {
    //for(let i = 1; i < 11; i++) {
      let randomIndex = Math.floor(Math.random() * this.icons.length);
      let randomIcon = this.icons[randomIndex];
      this.icons.splice(randomIndex, 1);
      let ititle = 'None';
      let inote = 'None';

      switch (randomIcon) {
      case 'heart':
        ititle = 'Love';
        inote = 'she is my Goo';
        break;
      case 'heart-outline':
        ititle = 'Love';
        inote = 'She is my Special'
        break;
      case 'color-wand':
        ititle = 'Harry Potter';
        inote = 'she ' + 'really '.repeat(numWands) + 'likes him';
        numWands++;
        break;
      case 'brush':
        ititle = 'Art';
        inote = 'we both like art';
        break;
      case 'book':
        ititle = 'Books';
        inote = 'we both like reading';
        break;
      case 'cafe':
        ititle = 'Talking';
        inote = 'nice to be around her :)'
        break;
      case 'pizza':
        ititle = 'Food';
        inote = 'omg we ' + 'really '.repeat(numFoods) + 'love it';
        numFoods++;
        break;
      case 'restaurant':
        ititle = 'Food';
        inote = 'omg we ' + 'really '.repeat(numFoods) + 'love it';
        numFoods++;
        break;
      case 'chatbubbles':
        ititle = 'Talking';
        inote = 'if only we were politicians';
        break;
      case 'bulb':
        ititle = 'Critical Thinking';
        inote = 'together, we make a whole';
        break;
      }

      this.items.push({
        title: ititle,
        note: inote,
        icon: randomIcon
      });
    }
  }

  itemTapped(event, item) {
    // this.navCtrl.push(ItemDetailsPage, {
    //   item: item
    // });
  }
}
