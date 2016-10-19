var Actor = require(__dirname + '/business/db/models/Actor.js');

var actor = new Actor ({
    id: "2",
    name: "Angelina Jolie",
    rating: 8,
    thumbnail: 'http://img.wennermedia.com/article-leads-vertical-300/1351182578_angelina-jolie-290.jpg'
});

actor.save("Actor").then(function (result) {
    console.log(result);
}).error(function (error) {
    console.log(error);
});

