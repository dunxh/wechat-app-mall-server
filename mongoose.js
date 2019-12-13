var mongoose = require('mongoose')
mongoose.connect('mongodb://root:dunxh_mongo1@dds-bp1e94b48f451dd41916-pub.mongodb.rds.aliyuncs.com:3717/admin', { useNewUrlParser: true, useUnifiedTopology: true }) //服务器
mongoose.Promise = global.Promise
module.exports = mongoose
