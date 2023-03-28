
/*
@ 引入包
*/
const express = require('express')
const app = express()
const joi = require('joi')
// 支持跨域
app.use(require('cors')())
app.use(express.json())
app.use(express.urlencoded())

// 在路由之前配置解析 token 的中间件
const expressJWT = require('express-jwt')
const {jwtSecretKey} = require('./config')
app.use(expressJWT({ secret: jwtSecretKey }).unless({ path: [/^\/admin/] }));

/*

@@@@ 应用后端路由

*/
// require('./db/config')(app)
require('./router/admin')(app)
require('./router/resident')(app) 
require('./router/street')(app)
require('./router/sampleInstitution')(app)
require('./router/testInstitution')(app)
require('./router/nucleic_info')(app)
 

/*

@@@@ 错误级别中间件

*/

// 在路由后面，错误级别中间件
app.use((err, req, res, next) => {

    // 数据规则校验
    if (err instanceof joi.ValidationError) return res.send({
        status: 1,
        message: err.message
    })
    // 检查 是否有token
    if (err.name == 'UnauthorizedError') return res.send({
        status: 1,
        message: err.message
    })
    res.status(err.statusCode || 500).send({
        message: err.message
    })
})

/*

@@@@ 监听

*/

app.listen(3000, () => {
    console.log('http://localhost:3000')
})