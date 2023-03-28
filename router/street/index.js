
module.exports = app => {
    const express = require('express');
    const router = express.Router({
        mergeParams: true
    }) 
    // const userHandler = require('../../router_handler/user')

    // 0. 导入数据库
     const db = require('../../db/config')
   

    // 查询一条
    router.get('/:id', async (req, res) => {
        console.log('find-street')
        const sqlStr = `select * from street where streetname =?;`
        db.query(sqlStr, req.params.id, (err, results) => {
            if (err) return res.status(401).send({message: err.message})
            res.status(200).send({
                status: 200,
                data: results
            })
        })
    })
    app.use('/admin/api/street', router) 
    
    // 错误捕获中间件
    app.use(async (err, req, res, next) => {
        res.status(err.statusCode || 500).send({
            message: err.message
        })
    })
}

