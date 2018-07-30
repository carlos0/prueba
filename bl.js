var logger = require('./logger');

module.exports.prueba = function(){
  logger.log('info', `[${__filename}|prueba]inside the function!!!!!!!`);
}
