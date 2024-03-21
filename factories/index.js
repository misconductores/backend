const ErrorsFactory = require('./errors');
const ResponsesFactory = require('./responses');
const EntitiesFactory = require('./entities');
const MongosFactory = require('./MongoFactories');

module.exports = {
  ...ErrorsFactory,
  ...ResponsesFactory,
  ...EntitiesFactory,
  MongosFactory,
};
