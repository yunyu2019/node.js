
var redis = require('redis');
var logger = require('./logger');
var config = require('../config/web');
var redis_config=config.redis;

var client=redis.createClient({
	port: redis_config.port,
  	host: redis_config.host,
  	db: redis_config.db,
  	password: redis_config.auth
});

client.on('error', function (err) {
  if (err) {
    logger.errors.error('connect to redis error, check your redis config', err);
    process.exit(1);
  }
})

exports = module.exports = client;