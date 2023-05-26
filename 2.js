// 向某位女生发送一则表白短信
// name: 女神的姓名
// onFulffiled: 成功后的回调
// onRejected: 失败后的回调
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

sendMessage('张三')
  .catch(reply => {
    // 失败，继续
    console.log(reply);
    return sendMessage('李四');
  })
  .catch(reply => {
    // 失败，继续
    console.log(reply);
    return sendMessage('坤坤');
  })
  .catch(reply => {
    // 失败，继续
    console.log(reply);
    return sendMessage('俊哥');
  })
  .then(
    reply => {
      // 成功，结束
      console.log(reply);
      console.log('雷哥终于找到了自己的伴侣');
    },
    reply => {
      // 最后一个也失败了
      console.log(reply);
      console.log('雷哥命犯天煞孤星，无伴终老，孤独一生');
    }
  );
