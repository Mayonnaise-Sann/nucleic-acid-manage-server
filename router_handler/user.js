// const { jwtSecretKey } = require('../config')
const assert = require("http-assert");
// const ok = require('assert')

// 用户注册
exports.regUser = (req, res) => {
  // 导入数据库
  const db = require("../db/config");
  // 导入密码加密包
  const bcrypt = require("bcryptjs");
  const userinfo = req.body;

  const sqlStr = "select * from administrator where username=?;";
  db.query(sqlStr, userinfo.username, (err, results) => {
    if (err) {
      return res.status(422).send({ message: err.message });
    }

    // 检验用户名重名
    if (results.length > 0) {
      return res.send({
        status: 422,
        message: "用户名被占用",
      });
    }

    // 密码散列
    userinfo.password = bcrypt.hashSync(userinfo.password, 10);
    const sql = "insert into administrator set ?";
    db.query(sql, userinfo, (err, results) => {
      if (err) return res.status(422).send({ message: err.message });

      if (results.affectedRows !== 1)
        return res.status(422).send({ message: "注册失败" });
      res.status(200).send({ message: "注册成功" });
    });
  });
};

// 用户登录
exports.login = (req, res) => {
  // 1. 根据用户名找用户
  // 导入数据库
  const db = require("../db/config");
  // 导入密码加密包
  const bcrypt = require("bcryptjs");
  // 导入生成 token 的包
  const jwt = require("jsonwebtoken");
  const { jwtSecretKey, expiresIn } = require("../config");
  const { username, password } = req.body;
  const sqlStr = "select * from administrator where username=?;";
  db.query(sqlStr, username, async (err, results) => {
    if (err) {
      //     return res.send({status: 1,message: err.message})
      assert(err, 422, err.message);
    }
    if (results.length !== 1)
      return res.status(422).send({ message: "用户未注册" });
    // assert.equal(results.length, 1, 422, '用户未注册')
    // 2. 校验密码
    const compareRes = await bcrypt.compare(password, results[0].password);
    if (!compareRes) return res.status(422).send({ message: "密码错误" });
    // assert(compareRes, 422, '密码错误')
    // 3. 返回token
    const user = { ...results[0], password: "" };
    // 生成token
    const token = jwt.sign(user, jwtSecretKey, { expiresIn: expiresIn });
    res.send({
      status: 200,
      message: "登陆成功",
      token: "Bearer " + token,
    });
  });
};

// 把查询用户写成一个中间件
