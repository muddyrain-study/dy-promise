/**
 * 雷哥烦恼解决办法
 */

// 向某位女生发送一则表白短信
// name: 女神的姓名
// 该函数返回一个任务对象
function sendMessage(name) {
  return new Promise((resolve, reject) => {
    // 模拟 发送表白短信
    console.log(
      `雷哥 -> ${name}：最近有谣言说我喜欢你，我要澄清一下，那不是谣言😘`
    );
    console.log(`等待${name}回复......`);
    // 模拟 女神回复需要一段时间
    setTimeout(() => {
      // 模拟 有10%的几率成功
      if (Math.random() <= 0.1) {
        // 成功，调用 resolve，并传递女神的回复
        resolve(`${name} -> 雷哥：我是九，你是三，除了你还是你😘`);
      } else {
        // 失败，调用 reject，并传递女神的回复
        reject(`${name} -> 雷哥：你是个好人😜`);
      }
    }, 1000);
  });
}

sendMessage('毛哥').then(
  reply => {
    // 女神答应了，输出女神的回复
    console.log(reply);
  },
  reason => {
    // 女神拒绝了，输出女神的回复
    console.log(reason);
  }
);
