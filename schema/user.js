// 导入验证规则的包

// const joi = require('@hapi/joi')
const joi = require("joi");

// 用户名和密码的验证规则
const username = joi.string().min(1).max(10).required();
const phonenum = joi
  .string()
  .min(11)
  .max(12)
  .pattern(/^[\S]{3,12}$/)
  .required();
const password = joi.string().pattern(/^[\S]{3,12}$/); //非空字符，3-12位

// 定义验证注册和登录表单数据的规则对象

exports.reg_login_schema = {
  body: {
    username,
    password,
  },
};
exports.reg_register_schema = {
  body: {
    username,
    phonenum,
    password,
  },
};
