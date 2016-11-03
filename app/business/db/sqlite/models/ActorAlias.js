var Sequelize = require('../sequelize');


var ActorAlias = Sequelize.sequelize.define('ActorAlias', {
    name: {type: Sequelize.Sequelize.STRING, allowNull: false, unique: true},
    is_exempt_from_one_word_search:{type: Sequelize.Sequelize.BOOLEAN, allowNull: false, defaultValue: false }

});

var Actor = require('./Actor.js');
ActorAlias.belongsTo(Actor);

module.exports = ActorAlias;