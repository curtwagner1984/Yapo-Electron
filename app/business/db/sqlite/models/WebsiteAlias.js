var Sequelize = require('../sequelize');


var WebsiteAlias = Sequelize.sequelize.define('WebsiteAlias', {
    name: {type: Sequelize.Sequelize.STRING, allowNull: false, unique: true},
    is_exempt_from_one_word_search:{type: Sequelize.Sequelize.BOOLEAN, allowNull: false, defaultValue: false }

});

var Website = require('./Website.js');
WebsiteAlias.belongsTo(Website);

module.exports = WebsiteAlias;