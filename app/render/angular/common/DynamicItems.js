var models = require('../../../business/db/models/all.js');

// In this example, we set up our model using a class.
// Using a plain object works too. All that matters
// is that we implement getItemAtIndex and getLength.
var DynamicItems = function (itemType, sortOrder, searchField, searchString) {


    /**
     * @type {!Object<?Array>} Data pages, keyed by page number (0-index).
     */
    this.loadedPages = {};

    /** @type {number} Total number of items. */
    this.numItems = 0;

    /** @const {number} Number of items to fetch per request. */
    this.PAGE_SIZE = 100;

    this.itemType = itemType;
    this.sortOrder = sortOrder;
    this.searchField = searchField;
    this.searchString = searchString;

    this.fetchNumItems_();


};

// Required.
DynamicItems.prototype.getItemAtIndex = function (index) {
    var pageNumber = Math.floor(index / this.PAGE_SIZE);
    var page = this.loadedPages[pageNumber];

    if (page) {
        return page[index % this.PAGE_SIZE];
    } else if (page !== null) {
        this.fetchPage_(pageNumber);
    }
};

// Required.
DynamicItems.prototype.getLength = function () {
    var ans = 1;
    if (this.numItems == 0){
        return ans;
    }else{
        return this.numItems;
    }


};

DynamicItems.prototype.reset = function () {
    this.loadedPages = {};
    this.numItems = 0;
    this.fetchNumItems_();
};

DynamicItems.prototype.fetchPage_ = function (pageNumber) {
    // Set the page to null so we know it is already being fetched.
    this.loadedPages[pageNumber] = null;

    // For demo purposes, we simulate loading more items with a timed
    // promise. In real code, this function would likely contain an
    // $http request.


    var pageOffset = pageNumber * this.PAGE_SIZE;
    var searchString = "(?i)" + this.searchString;

    var searchField = this.searchField;

    models[this.itemType].orderBy({index: this.sortOrder}).filter(function (scene) {
        return scene(searchField).match(searchString)
    }).slice(pageOffset, pageOffset + this.PAGE_SIZE).getJoin({
        actors: true,
        tags: true,
        websites: true
    }).run().then(angular.bind(this, function (scenes) {
        this.loadedPages[pageNumber] = scenes;

    }));


    // $timeout(angular.noop, 300).then(angular.bind(this, function() {
    //     this.loadedPages[pageNumber] = [];
    //     var pageOffset = pageNumber * this.PAGE_SIZE;
    //     for (var i = pageOffset; i < pageOffset + this.PAGE_SIZE; i++) {
    //         this.loadedPages[pageNumber].push(i);
    //     }
    // }));
};

DynamicItems.prototype.fetchNumItems_ = function () {
    // For demo purposes, we simulate loading the item count with a timed
    // promise. In real code, this function would likely contain an
    // $http request.

    // $timeout(angular.noop, 300).then(angular.bind(this, function () {
    //     this.numItems = 50000;
    // }));

    var searchString = "(?i)" + this.searchString;
    var searchField = this.searchField;


    models[this.itemType].filter(function (scene) {
        return scene(searchField).match(searchString)
    }).count().execute().then(angular.bind(this, function (count, err) {
        this.numItems = count;

        // $timeout().then(angular.bind(this, function() {
        //
        //
        // }));

    }));

    // models[this.itemType].filter(function (scene) {
    //     return scene(this.searchField).match(searchString)
    // }).count().execute().then(angular.bind(this, function (count, err) {
    //     $timeout().then(angular.bind(this, function() {
    //         this.numItems = count;
    //
    //     }));
    //
    // }));

};

module.exports.DynamicItems = DynamicItems;