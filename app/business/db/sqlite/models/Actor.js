var Sequelize = require('../sequelize.js');




var Actor = Sequelize.sequelize.define('Actor', {
    name: {type: Sequelize.Sequelize.STRING, allowNull: false, unique: true},
    gender: {type: Sequelize.Sequelize.ENUM, values: ['Male','Female','Trans']},
    description: Sequelize.Sequelize.TEXT,
    thumbnail: {type: Sequelize.Sequelize.STRING, length: 500},
    imdb_id: Sequelize.Sequelize.STRING,
    tmdb_id: Sequelize.Sequelize.STRING,
    official_pages: Sequelize.Sequelize.TEXT,
    ethnicity: Sequelize.Sequelize.STRING,
    country_of_origin: Sequelize.Sequelize.STRING,
    tattoos: Sequelize.Sequelize.STRING,
    measurements: Sequelize.Sequelize.STRING,

    weight: Sequelize.Sequelize.INTEGER,
    height: Sequelize.Sequelize.INTEGER,
    rating: Sequelize.Sequelize.INTEGER,
    play_count: Sequelize.Sequelize.INTEGER,


    is_fav: {type: Sequelize.Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    is_runner_up:{type: Sequelize.Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    is_exempt_from_one_word_search:{type: Sequelize.Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    is_mainstream: {type: Sequelize.Sequelize.BOOLEAN, allowNull: false, defaultValue: false },

    date_fav: {type: Sequelize.Sequelize.DATE, defaultValue: null},
    date_runner_up:{type: Sequelize.Sequelize.DATE, defaultValue: null},
    date_of_birth:{type: Sequelize.Sequelize.DATE, defaultValue: null},
    date_last_lookup:{type: Sequelize.Sequelize.DATE, defaultValue: null}


});



module.exports = Actor;


var ActorAlias = require('./ActorAlias.js');
var Tag = require('./Tag.js');
var Website = require('./Website.js');
var Scene = require('./Scene.js');
var Picture = require('./Picture.js');



Actor.hasMany(ActorAlias, {as: 'alias'});

Actor.belongsToMany( Tag, {
    as: 'tags',
    through: 'Actor_tag',
    foreignKey: 'Actor_id'
});

Actor.belongsToMany( Website, {
    as: 'websites',
    through: 'Website_actor',
    foreignKey: 'Actor_id'
});

Actor.belongsToMany( Scene, {
    as: 'scenes',
    through: 'Scene_actor',
    foreignKey: 'Actor_id'
});

Actor.belongsToMany( Picture, {
    as: 'pictures',
    through: 'Picture_actor',
    foreignKey: 'Actor_id'
});