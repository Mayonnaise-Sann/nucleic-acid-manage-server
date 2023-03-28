module.exports = (app) => {
  const express = require("express");
  const router = express.Router({
    mergeParams: true,
  });
  const userHandler = require("../../router_handler/user");

  // 0. 导入数据库
  const db = require("../../db/config");

  // 1. 导入数据验证的中间件
  const expressJoi = require("@escook/express-joi");
  // 2. 导入需要的验证规则对象
  const {
    reg_login_schema,
    reg_register_schema,
  } = require("../../schema/user");

  // 编写通用CRUD接口，挂在router上

  // 增加
  router.post("/", async (req, res) => {
    console.log(req.body);
    const sqlStr = `insert into ${req.params.resource} set ?;`;
    db.query(sqlStr, req.body, (err, results) => {
      if (err)
        return res.status(401).send({ status: 422, message: err.message });

      if (results.affectedRows !== 1)
        return res.status(422).send({ message: "failed" });
      res.status(200).send({
        status: 200,
        message: "success",
      });
    });
  });

  // 删除
  router.delete("/:id", async (req, res) => {
    const sqlStr = `delete from ${req.params.resource}  where ${req.params.resource}_id =?;`;
    db.query(sqlStr, [req.params.id], (err, results) => {
      if (err) return res.status(422).send({ message: err.message });

      if (results.affectedRows !== 1)
        return res.status(422).send({ message: "failed" });

      res.status(200).send({
        status: 200,
        message: "success",
      });
    });
  });

  // 修改
  router.post("/:id", async (req, res) => {
    console.log("update");
    let updateKey = Object.keys(req.body).join("=?,");
    let updateVal = Object.values(req.body);
    const sqlStr = `update ${req.params.resource} set ${updateKey} =? where ${req.params.resource}_id =?;`;
    console.log(req.params.id);
    db.query(sqlStr, [...updateVal, req.params.id], (err, results) => {
      if (err) return res.status(422).send({ message: err.message });
      if (results.affectedRows !== 1)
        return res.status(401).send({ status: 401, message: "failed" });
      res.send({
        status: 200,
        message: "success",
      });
    });
  });

  // 查询多条或全部
  router.get("/", async (req, res) => {
    const sqlStr = `select * from ${req.params.resource}_view;`;
    db.query(sqlStr, req.params.id, (err, results) => {
      if (err) return res.status(422).send({ message: err.message });
      // console.log(results)
      res.status(200).send({
        status: 200,
        data: results,
      });
    });
  });
  // 查询一条
  router.get("/:id", async (req, res) => {
    const sqlStr = `select * from ${req.params.resource}_view where ${req.params.resource}_id =?;`;
    console.log("findone");
    console.log(sqlStr);
    db.query(sqlStr, req.params.id, (err, results) => {
      if (err) return res.status(422).send({ message: err.message });

      res.status(200).send({
        status: 200,
        data: results[0],
      });
    });
  });

  app.use("/admin/api/rest/:resource", router);

  const routerHome = express.Router({
    mergeParams: true,
  });

  // 按时间段，统计各街道的检测率
  routerHome.get("/testedpercent", async (req, res) => {
    const sqlStr = `call testedpercent_procedure('${req.query.start}', '${req.query.end}');`;
    db.query(sqlStr, (err, results) => {
      if (err) return res.status(422).send({ message: err.message });
      let streetList = [];
      let testedNum = [];
      let untestNum = [];
      let percentage = [];
      const result = results[0];
      result.forEach((element) => {
        streetList.push(element.streetname);
        testedNum.push(element.tested_num);
        untestNum.push(element.total - element.tested_num);
        percentage.push((element.tested_num / element.total).toFixed(4) * 100);
      });
      res.status(200).send({
        status: 200,
        data: {
          streetList,
          testedNum,
          untestNum,
          percentage,
        },
      });
    });
  });

  // 按时间段，统计各街道的阳性、阴性人数
  routerHome.get("/countbyres", async (req, res) => {
    const sqlStr = `call countbyres_procedure('${req.query.start}', '${req.query.end}');`;
    db.query(sqlStr, (err, results) => {
      if (err) return res.status(422).send({ message: err.message });
      let streetList = [];
      let negative = []; // 阴性
      let positive = []; // 阳性
      const result = results[0];
      result.forEach((element) => {
        streetList.push(element.streetname);
        negative.push(element.negative);
        positive.push(element.positive);
      });
      res.status(200).send({
        status: 200,
        data: {
          streetList,
          negative,
          positive,
        },
      });
    });
  });
  app.use("/admin/api", routerHome);

  // 登录注册接口，挂载在app上
  app.post(
    "/admin/api/register",
    expressJoi(reg_register_schema),
    userHandler.regUser
  );
  app.post("/admin/api/login", expressJoi(reg_login_schema), userHandler.login);

  // 错误捕获中间件
  app.use(async (err, req, res, next) => {
    res.status(err.statusCode || 500).send({
      message: err.message,
    });
  });
};
