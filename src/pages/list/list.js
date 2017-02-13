var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
var ListPage = (function () {
    function ListPage(navCtrl, navParams) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        // If we navigated to this page, we will have an item available as a nav param
        this.selectedItem = navParams.get('item');
        this.icons = ['heart', 'heart-outline', 'color-wand', 'brush', 'book', 'bulb',
            'cafe', 'chatbubbles', 'restaurant', 'pizza', 'color-wand'];
        this.items = [];
        var numWands = 0;
        var numFoods = 0;
        while (this.icons.length > 0) {
            //for(let i = 1; i < 11; i++) {
            var randomIndex = Math.floor(Math.random() * this.icons.length);
            var randomIcon = this.icons[randomIndex];
            this.icons.splice(randomIndex, 1);
            var ititle = 'None';
            var inote = 'None';
            switch (randomIcon) {
                case 'heart':
                    ititle = 'Love';
                    inote = 'she is my Goo';
                    break;
                case 'heart-outline':
                    ititle = 'Love';
                    inote = 'She is my Special';
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
                    inote = 'nice to be around her :)';
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
    ListPage.prototype.itemTapped = function (event, item) {
        // this.navCtrl.push(ItemDetailsPage, {
        //   item: item
        // });
    };
    return ListPage;
}());
ListPage = __decorate([
    Component({
        selector: 'page-list',
        templateUrl: 'list.html'
    }),
    __metadata("design:paramtypes", [NavController, NavParams])
], ListPage);
export { ListPage };
//# sourceMappingURL=list.js.map