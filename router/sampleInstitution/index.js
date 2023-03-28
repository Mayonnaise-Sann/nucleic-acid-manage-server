
module.exports = app => {
    const express = require('express');
    const router = express.Router({
        mergeParams: true
    }) 
    // const userHandler = require('../../router_handler/user')

    // 0. 导入数据库
     const db = require('../../db/config')
    // 查询机构名列表
    router.get('/institutionList', async (req, res) => {
        const sqlStr = `select sample_code,sample_name from sampling_institution;`
        db.query(sqlStr, (err, results) => {
            if (err) return res.status(401).send({ message: err.message })
            res.status(200).send({
                status: 200,
                data: results
            })
        })
    })

    // 查询一条
    router.get('/:id', async (req, res) => {
        const sqlStr = `select * from sampling_institution where sample_code =?;`
        db.query(sqlStr, req.params.id, (err, results) => {
            if (err) return res.status(401).send({message: err.message})
            res.status(200).send({
                status: 200,
                data: results 
            })
        })
    })
   
    app.use('/admin/api/sampling_institution', router) 
    
    // 错误捕获中间件
    app.use(async (err, req, res, next) => {
        res.status(err.statusCode || 500).send({
            message: err.message
        })
    })
}

