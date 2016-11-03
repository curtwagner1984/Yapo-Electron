var Sequelize = require('../sequelize');


var TagAlias = Sequelize.sequelize.define('TagAlias', {
    name: {type: Sequelize.Sequelize.STRING, allowNull: false, unique: true},
    is_exempt_from_one_word_search:{type: Sequelize.Sequelize.BOOLEAN, allowNull: false, defaultValue: false }

});

var Tag = require('./Tag.js');
TagAlias.belongsTo(Tag);

module.exports = TagAlias;