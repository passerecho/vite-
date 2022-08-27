const mockJS = require("mockjs");

const userList = mockJS.mock({
  "data|100": [{
    name: "@cname", // 表示生成不同的中文名
    // ename: mockJS.Random.name(), // 生成不同的英文名
    "id|+1": 1, // 
    time: "@time",
    date: "@date"
  }]
})

module.exports = [
  {
    method: "post",
    url: "/api/users",
    response: ({ body }) => {
      // body -> 请求体 
      // page pageSize body
      return {
        code: 200,
        msg: "success",
        data: userList
      };
    }
  },

]

