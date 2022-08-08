'use strict'
module.exports = {
  prod: {
  	NODE_ENV: '"production"',
  	api_map:'"http://nq.dtwl360.com:8081"'
  },
  test: {
  	NODE_ENV: '"testing"',
  	api_map:'"http://192.168.0.100:8081"'
  },
  pre: {
  	NODE_ENV: '"pre-release"',
  	api_map:'"http://nq.dtwl360.com:8081"'
  },
}
