
angular.module('itemTagger', []).component('itemTagger', {
    // Note: The URL is relative to our `index.html` file
    templateUrl: 'render/angular/common/item-tagger/item-tagger.template.html',
    bindings: {
        taggedItem: '='
    },
    controller: ['$scope', '$location', '$timeout', '$rootScope', 'hotkeys',
        function ItemTaggerController($scope, $location, $timeout, $rootScope, hotkeys) {

            var self = this;
            var models = require(__dirname + '/business/db/sqlite/models/All.js');


            var Sequelize = require(__dirname + '/business/db/sqlite/sequelize.js');
            var _ = require('lodash');

            // hotkeys.bindTo($scope)
            //     .add({
            //         combo: 'enter',
            //         description: 'Search if Search toggle is available',
            //         allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
            //         callback: function () {
            //
            //             self.taggerTest();
            //         }
            //     });

            self.textBoxInput = "";
            self.taggerQueryRes = [];
            
            var matchedTagsArray = [];

            

            function taggerStringParser() {
                var string = self.textBoxInput;
                var stringArray = string.split(',');

                var first = true;
                var ans = "";
                for (let i = 0; i < stringArray.length; i++) {
                    let term = stringArray[i];
                    term = term.trim();
                    term = term.replace(/ /g, '%');
                    term = '%' + term + '%';
                    if (first) {
                        ans = ans + util.format("U.name like '%s'", term);
                        first = false;
                    } else {
                        ans = ans + ' or ' + util.format("U.name like '%s'", term)
                    }
                }
                return ans;


            }
            
                        
            self.addToArray = function (tagToAdd) {
                matchedTagsArray = [];

                var matchObject = {item: self.taggedItem, matchedTag: tagToAdd};

                matchedTagsArray.push(matchObject);

                $rootScope.taggerQueue = $rootScope.taggerQueue.concat(matchedTagsArray);

                $rootScope.$broadcast('taggerUpdated')
                
                
                
                
            };

            self.taggerTest = function () {

                console.log('tagged item ' + self.taggedItem);
                matchedTagsArray = [];

                var queryString = taggerStringParser();
                var rawQuery = util.format("select * from (select t.id, t.name,'Tag' as TableName, (select count(*) from Scene_tag st where st.Tag_id = t.id) as NumberOfScenes, (select count(*) from Picture_tag pt where pt.Tag_id = t.id) as NumberOfPicture, (select count(*) from Actor_tag ac where ac.Tag_id = t.id) as NumberOfActors from Tags t union select w.id, w.name,'Website' as TableName, (select count(*) from Scene_website sw where sw.Website_id = w.id) as NumberOfScenes, (select count(*) from Picture_website pw where pw.Website_id = w.id) as NumberOfPicture, ('0') as NumberOfActors from Websites w union select a.id, a.name, 'Actor' as TableName, (select count(*) from Scene_actor sa where sa.Actor_id = a.id) as NumberOfScenes, (select count(*) from Picture_actor pa where pa.Actor_id = a.id) as NumberOfPicture, ('0') as NumberOfActor from Actors a ) as U where %s order by NumberOfScenes DESC, NumberOfPicture DESC limit 10", queryString);
                // JS has issue with strings and line breaks ... this is how this query looks like 


                // select * from
                // (select t.id, t.name,
                //     (select count(*) from Scene_tag st where st.Tag_id = t.id) as NumberOfScenes,
                //     (select count(*) from Picture_tag pt where pt.Tag_id = t.id) as NumberOfPicture,
                //     (select count(*) from Actor_tag ac where ac.Tag_id = t.id) as NumberOfActors
                // from Tags t
                // union
                // select w.id, w.name,
                //     (select count(*) from Scene_website sw where sw.Website_id = w.id) as NumberOfScenes,
                //     (select count(*) from Picture_website pw where pw.Website_id = w.id) as NumberOfPicture,
                // ('0') as NumberOfActors
                // from Websites w
                // union
                // select a.id, a.name,
                //     (select count(*) from Scene_actor sa where sa.Actor_id = a.id) as NumberOfScenes,
                //     (select count(*) from Picture_actor pa where pa.Actor_id = a.id) as NumberOfPicture,
                // ('0') as NumberOfActor
                // from Actors a
                // ) as U
                // where U.name like '%legs%'
                // order by NumberOfScenes DESC, NumberOfPicture DESC

                console.log(rawQuery);
                

                Sequelize.sequelize.query(rawQuery).then(function (y) {
                    console.log(y);
                    $timeout().then(function () {
                        self.taggerQueryRes = y[0];
                        console.log(self.taggerQueryRes);


                        var string = self.textBoxInput;
                        var stringArray = string.split(',');

                        var CSS_COLOR_NAMES = ["AliceBlue", "AntiqueWhite", "Aqua", "Aquamarine", "Azure", "Beige", "Bisque", "Black", "BlanchedAlmond", "Blue", "BlueViolet", "Brown", "BurlyWood", "CadetBlue", "Chartreuse", "Chocolate", "Coral", "CornflowerBlue", "Cornsilk", "Crimson", "Cyan", "DarkBlue", "DarkCyan", "DarkGoldenRod", "DarkGray", "DarkGrey", "DarkGreen", "DarkKhaki", "DarkMagenta", "DarkOliveGreen", "Darkorange", "DarkOrchid", "DarkRed", "DarkSalmon", "DarkSeaGreen", "DarkSlateBlue", "DarkSlateGray", "DarkSlateGrey", "DarkTurquoise", "DarkViolet", "DeepPink", "DeepSkyBlue", "DimGray", "DimGrey", "DodgerBlue", "FireBrick", "FloralWhite", "ForestGreen", "Fuchsia", "Gainsboro", "GhostWhite", "Gold", "GoldenRod", "Gray", "Grey", "Green", "GreenYellow", "HoneyDew", "HotPink", "IndianRed", "Indigo", "Ivory", "Khaki", "Lavender", "LavenderBlush", "LawnGreen", "LemonChiffon", "LightBlue", "LightCoral", "LightCyan", "LightGoldenRodYellow", "LightGray", "LightGrey", "LightGreen", "LightPink", "LightSalmon", "LightSeaGreen", "LightSkyBlue", "LightSlateGray", "LightSlateGrey", "LightSteelBlue", "LightYellow", "Lime", "LimeGreen", "Linen", "Magenta", "Maroon", "MediumAquaMarine", "MediumBlue", "MediumOrchid", "MediumPurple", "MediumSeaGreen", "MediumSlateBlue", "MediumSpringGreen", "MediumTurquoise", "MediumVioletRed", "MidnightBlue", "MintCream", "MistyRose", "Moccasin", "NavajoWhite", "Navy", "OldLace", "Olive", "OliveDrab", "Orange", "OrangeRed", "Orchid", "PaleGoldenRod", "PaleGreen", "PaleTurquoise", "PaleVioletRed", "PapayaWhip", "PeachPuff", "Peru", "Pink", "Plum", "PowderBlue", "Purple", "Red", "RosyBrown", "RoyalBlue", "SaddleBrown", "Salmon", "SandyBrown", "SeaGreen", "SeaShell", "Sienna", "Silver", "SkyBlue", "SlateBlue", "SlateGray", "SlateGrey", "Snow", "SpringGreen", "SteelBlue", "Tan", "Teal", "Thistle", "Tomato", "Turquoise", "Violet", "Wheat", "White", "WhiteSmoke", "Yellow", "YellowGreen"];

                        for (let i = 0; i < stringArray.length; i++) {
                            let pat = new RegExp(stringArray[i].trim().replace(/ /g, '.*?'), "i");

                            let matches = _.filter(self.taggerQueryRes, function (o) {
                                return pat.test(o.name)
                            });

                            if (matches.length == 1) {
                                matches[0].matched = "Matched to " + stringArray[i];
                                self.textBoxInput = self.textBoxInput.replace(stringArray[i], '');
                                
                                var matchObject = {item: self.taggedItem, matchedTag: matches[0]};
                                
                                matchedTagsArray.push(matchObject);
                            }

                            for (let j = 0; j < matches.length; j++) {
                                matches[j].background = CSS_COLOR_NAMES[i];
                            }


                        }
                        
                        
                        $rootScope.taggerQueue = $rootScope.taggerQueue.concat(matchedTagsArray);

                        $rootScope.$broadcast('taggerUpdated')
                        
                        
                        


                    });


                });


            }
        }]
});
        