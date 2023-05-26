const { cook, wash, sweep } = require('./question2');

/**
 * 雷哥新问题的 解决办法
 */
Promise.allSettled([cook(), wash(), sweep()]).then(result => {
  // 处理汇总结果
  const report = result
    .map(r => (r.status === 'fulfilled' ? r.value : r.reason))
    .join(';');
  console.log(report);
});
