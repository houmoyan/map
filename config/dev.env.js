'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
	NODE_ENV: '"development"',
	api_map: '"http://192.168.0.100:8081"', //崔延峰本地
	// api_map: '"http://nq.dtwl360.com:8081"', //测试
	
	
})