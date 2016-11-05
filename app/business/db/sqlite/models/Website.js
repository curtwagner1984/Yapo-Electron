var Sequelize = require('../sequelize.js');


var Website = Sequelize.sequelize.define('Website', {
    name: {type: Sequelize.Sequelize.STRING, allowNull: false, unique: true},
    description: Sequelize.Sequelize.TEXT,
    thumbnail: {type: Sequelize.Sequelize.STRING, length: 500},


    rating: Sequelize.Sequelize.INTEGER,
    play_count: Sequelize.Sequelize.INTEGER,


    is_fav: {type: Sequelize.Sequelize.BOOLEAN, allowNull: false, defaultValue: false},
    is_runner_up: {type: Sequelize.Sequelize.BOOLEAN, allowNull: false, defaultValue: false},
    is_exempt_from_one_word_search: {type: Sequelize.Sequelize.BOOLEAN, allowNull: false, defaultValue: false},
    is_mainstream: {type: Sequelize.Sequelize.BOOLEAN, allowNull: false, defaultValue: false},

    date_fav: {type: Sequelize.Sequelize.DATE, defaultValue: null},
    date_runner_up: {type: Sequelize.Sequelize.DATE, defaultValue: null}


});


module.exports = Website;

var WebsiteAlias = require('./WebsiteAlias');
var Tag = require('./Tag.js');
var Actor = require('./Actor.js');
var Scene = require('./Scene.js');
var Picture = require('./Picture.js');

Website.hasMany(WebsiteAlias, {as: 'alias'});

Website.belongsToMany( Tag, {
    as: 'tags',
    through: 'Website_tag',
    foreignKey: 'Website_id'
});

Website.belongsToMany( Actor, {
    as: 'actors',
    through: 'Website_actor',
    foreignKey: 'Website_id'
});

Website.belongsToMany( Scene, {
    as: 'scenes',
    through: 'Scene_website',
    foreignKey: 'Website_id'
});

Website.belongsToMany( Picture, {
    as: 'pictures',
    through: 'Picture_website',
    foreignKey: 'Website_id'
});