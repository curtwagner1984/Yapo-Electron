var auxFunc = require('../../util/auxFunctions');
var Sequelize = require('./sequelize');

var sequelize = new Sequelize(undefined,undefined,undefined, {
        dialect: 'sqlite',
        storage: auxFunc.appRootDir + '/yapoDb.sqlite'
    }
);

var Actor = sequelize.define('actor', {
    name: {type: Sequelize.STRING, allowNull: false, unique: true},
    gender: {type: Sequelize.ENUM, values: ['Male','Female','Trans']},
    description: Sequelize.TEXT,
    thumbnail: {type: Sequelize.STRING, length: 500},
    imdb_id: Sequelize.STRING,
    tmdb_id: Sequelize.STRING,
    official_pages: Sequelize.TEXT,
    ethnicity: Sequelize.STRING,
    country_of_origin: Sequelize.STRING,
    tattoos: Sequelize.STRING,
    measurements: Sequelize.STRING,

    weight: Sequelize.INTEGER,
    height: Sequelize.INTEGER,
    rating: Sequelize.INTEGER,
    play_count: Sequelize.INTEGER,


    is_fav: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    is_runner_up:{type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    is_exempt_from_one_word_search:{type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    is_mainstream: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },

    date_fav: {type: Sequelize.DATE, defaultValue: null},
    date_runner_up:{type: Sequelize.DATE, defaultValue: null},
    date_of_birth:{type: Sequelize.DATE, defaultValue: null},
    date_last_lookup:{type: Sequelize.DATE, defaultValue: null}

    
});



var ActorAlias = sequelize.define('actor_alias', {
    name: {type: Sequelize.STRING, allowNull: false, unique: true},
    is_exempt_from_one_word_search:{type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false }
    
});




var Tag = sequelize.define('tag', {
    name: {type: Sequelize.STRING, allowNull: false, unique: true},
    description: Sequelize.TEXT,
    thumbnail: {type: Sequelize.STRING, length: 500},


    weight: Sequelize.INTEGER,
    height: Sequelize.INTEGER,
    rating: Sequelize.INTEGER,
    play_count: Sequelize.INTEGER,


    is_fav: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    is_runner_up:{type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    is_exempt_from_one_word_search:{type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    is_mainstream: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },

    date_fav: {type: Sequelize.DATE, defaultValue: null},
    date_runner_up:{type: Sequelize.DATE, defaultValue: null},
    date_of_birth:{type: Sequelize.DATE, defaultValue: null},
    date_last_lookup:{type: Sequelize.DATE, defaultValue: null}


});






module.exports.Actor = Actor;
module.exports.ActorAlias = ActorAlias;