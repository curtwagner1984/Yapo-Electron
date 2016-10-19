var thinky = require('../util/thinky.js');
var type = thinky.type;

var ActorAlias = thinky.createModel("ActorAlias", {

    name:type.string().required(),

    is_exempt_from_one_word_search:type.boolean().default(false),

    date_added:type.date().default(function () {
        return new Date();
    })



});

module.exports = ActorAlias;

var Actor = require(__dirname+ '/Actor.js');
ActorAlias.belongsTo(Actor, "actor", "actorId", "id");