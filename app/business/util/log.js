var colors = {
    colorWarn: 'background: #FFF7AE; color: #231D1D',
    colorError: 'background: #8C2425; color: #F6FAF8',
    colorSuccess: 'background: #33E83F; color: #020202',
    colorOther: 'background: #8A8F8A; color: #000000'

};


var LOG_LEVEL = 4;


var log = function (log_level, log_message, color) {

    if (log_level <= LOG_LEVEL) {
        if (color in colors){
            console.log('%c' + log_message, colors[color]);    
        }else{
            console.log('%c' + log_message, color);
        }
        
    }

};

module.exports.log = log;