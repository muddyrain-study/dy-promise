// 记录 promise 的 三种状态
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

/**
 * 运行一个微队列任务
 * 把传递的函数放到微队列中
 * @param {Function} callback
 */
function runMicroFunction(callback) {
  // 判断 node 环境
  if (process && process.nextTick) {
    process.nextTick(callback);
  } else if (MutationObserver) {
    const p = document.createElement('p');
    const observer = new MutationObserver(callback);
    observer.observe(p, {
      childList: true,
    });
    p.innerHTML = '1';
  } else {
    setTimeout(callback, 0);
  }
}

class MyPromise {
  /**
   * 创建一个 promise
   * @param {*} executor 任务执行器
   */
  constructor(executor) {
    // 状态
    this.state = PENDING;
    // 数据
    this.value = undefined;
    // 处理函数形成的队列
    this._handlers = [];
    try {
      executor(this.resolve.bind(this), this.reject.bind(this));
    } catch (error) {
      this._changeState(REJECTED, error);
    }
  }

  /**
   *
   * @param {String} newState 新状态
   * @param {*} value 相关数据
   */
  _changeState(newState, value) {
    if (this.state !== PENDING) {
      // 目前状态以及更改
      return;
    }
    this.state = newState;
    this.value = value;
  }

  /**
   * 向处理队列中添加一个函数
   * @param {Function} executor 添加的函数
   * @param {String} state 该函数什么状态下执行
   * @param {*} resolve 让then函数返回的promise 成功
   * @param {*} reject 让then函数返回的promise 失败
   */
  _pushHandlers(executor, state, resolve, reject) {
    this._handlers.push({
      executor,
      state,
    });
  }

  /**
   *
   * @param {*} onFulfilled
   * @param {*} onRejected
   */
  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      this._pushHandlers(onFulfilled, FULFILLED, resolve, reject);
      this._pushHandlers(onRejected, REJECTED, resolve, reject);
    });
  }

  /**
   * 标记当前任务完成
   * @param {any} data 任务完成的相关数据
   */
  resolve(data) {
    // 改变状态和数据
    this._changeState(FULFILLED, data);
  }
  /**
   * 标记当前任务失败
   * @param {any} reason 任务失败的相关数据
   */
  reject(reason) {
    // 改变状态和数据
    this._changeState(REJECTED, reason);
  }
}

const pro1 = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(1);
    console.log(pro1);
  }, 1000);
});

pro1.then(function A1() {});
pro1.then(
  function B1() {},
  function B2() {}
);
