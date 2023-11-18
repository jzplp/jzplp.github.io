// Person构造函数
function PersonFun(name) {
  this.name = name;
  this.getName = function() {
    return this.name;
  }
}

// 创建实例
const p1 = new PersonFun('jz');
console.log(p1.name, p1.getName());
// 输出结果:
// jz jz