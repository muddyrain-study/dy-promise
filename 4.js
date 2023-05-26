const mockjs = require('mockjs');

// 女神的名字数组
const beautyGirls = Array.from({ length: 40 }).map(_ => mockjs.Random.cname());

// 向某位女生发送一则表白短信
// name: 女神的姓名
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
        // 成功，调用 onFulffiled，并传递女神的回复
        resolve(`${name} -> 雷哥：我是九，你是三，除了你还是你😘`);
      } else {
        // 失败，调用 onRejected，并传递女神的回复
        reject(`${name} -> 雷哥：你是个好人😜`);
      }
    }, 1000);
  });
}

// 批量表白的程序
async function proposal() {
  let isSuccess = false;
  for (const girl of beautyGirls) {
    try {
      const reply = await sendMessage(girl);
      console.log(reply);
      console.log('表白成功!');
      isSuccess = true;
      break;
    } catch (reply) {
      console.log(reply);
      console.log('表白失败');
    }
  }
  if (!isSuccess) {
    console.log('雷哥注定孤独一生');
  }
}
proposal();
