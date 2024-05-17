const config = require('config');

module.exports.isEnvProd =
  config.get('env') === config.get('envVariables.prod');

module.exports.isEnvDev = config.get('env') === config.get('envVariables.dev');

module.exports.corsOrigin = this.isEnvProd ? config.get('frontendURL') : true;
