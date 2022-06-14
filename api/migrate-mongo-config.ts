const env = require('./config.json');

const config = {
  mongodb: {
    url: env.db.address || 'mongodb://localhost:27017',
    databaseName: env.db.database || 'YOURDATABASENAME',
    options: {
      useNewUrlParser: true, // removes a deprecation warning when connecting
      useUnifiedTopology: true // removes a deprecating warning when connecting
      //   connectTimeoutMS: 3600000, // increase connection timeout to 1 hour
      //   socketTimeoutMS: 3600000, // increase socket timeout to 1 hour
    }
  },
  migrationsDir: 'migrations',
  changelogCollectionName: 'changelog',
  migrationFileExtension: '.ts',
  useFileHash: true,
  moduleSystem: 'commonjs'
};

module.exports = config;
