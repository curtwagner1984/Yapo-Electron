var thinky = require('../util/thinky.js');
var type = thinky.type;

var MediaFolder = thinky.createModel("MediaFolder", {

    name:type.string().required(),
    path_to_folder: type.string().required(),
    media_type: type.string().enum(['Video','Picture','Both']).required(),
    date_added:type.date().default(function () {
        return new Date();
    })




});

module.exports = MediaFolder;


