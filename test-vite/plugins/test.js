
let count = 0; // 0 就是未响应的状态

function next() {
  count = 1;
}

setTimeout(() => {
  console.log("!23");
}, 0)

console.log("222");