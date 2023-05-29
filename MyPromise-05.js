const { resolve } = require('path');

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

/**
 * 判断一个数据是否是 promise
 * @param {*} obj
 * @returns
 */
function isPromise(obj) {
  return !!(obj && typeof obj === 'object' && typeof obj.then === 'function');
}

class MyPromise {
  /**
   * 创建一个 promise
   * @param {*} executor 任务执行器
   */
  constructor(executor) {
    // 状态
    this._state = PENDING;
    // 数据
    this._value = undefined;
    // 处理函数形成的队列
    this._handlers = [];
    try {
      executor(this._resolve.bind(this), this._reject.bind(this));
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
    if (this._state !== PENDING) {
      // 目前状态以及更改
      return;
    }
    this._state = newState;
    this._value = value;
    // 状态变化 执行队列
    this._runHandlers();
  }

  /**
   * 向处理队列中添加一个函数
   * @param {Function} executor 添加的函数
   * @param {String} _state 该函数什么状态下执行
   * @param {*} resolve 让then函数返回的promise 成功
   * @param {*} reject 让then函数返回的promise 失败
   */
  _pushHandlers(executor, state, resolve, reject) {
    this._handlers.push({
      executor,
      state,
      resolve,
      reject,
    });
  }

  /**
   * 根据实际情况，执行队列
   */
  _runHandlers() {
    if (this._state === PENDING) {
      // 目前任务仍在挂起
      return;
    }
    while (this._handlers[0]) {
      const handler = this._handlers[0];
      this._runOneHandler(handler);
      this._handlers.shift();
    }
  }
  /**
   * 处理一个handler
   * @param {Object} handler
   */

  _runOneHandler({ executor, state, resolve, reject }) {
    runMicroFunction(() => {
      if (this._state !== state) {
        // 状态不匹配 不予匹配
        return;
      }
      if (typeof executor !== 'function') {
        // 传递的后续处理并非一个函数
        this._state === FULFILLED ? resolve(this._value) : reject(this._value);
      }

      try {
        const result = executor(this._value);
        if (isPromise(result)) {
          result.then(resolve, reject);
        } else {
          resolve(result);
        }
      } catch (error) {
        reject(error);
      }
    });
  }
  /**
   *
   * @param {*} onFulfilled
   * @param {*} onRejected·
   */
  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      this._pushHandlers(onFulfilled, FULFILLED, resolve, reject);
      this._pushHandlers(onRejected, REJECTED, resolve, reject);
      this._runHandlers(); // 执行队列
    });
  }

  /**
   * 标记当前任务完成
   * @param {any} data 任务完成的相关数据
   */
  _resolve(data) {
    // 改变状态和数据
    this._changeState(FULFILLED, data);
  }
  /**
   * 标记当前任务失败
   * @param {any} reason 任务失败的相关数据
   */
  _reject(reason) {
    // 改变状态和数据
    this._changeState(REJECTED, reason);
  }
}

// 互操作
const pro1 = new Promise((resolve, reject) => {
  resolve(1);
});

pro1
  .then(data => {
    console.log(data);
    return new MyPromise(resolve => {
      resolve(2);
    });
  })
  .then(data => {
    console.log(data);
  });

function delay(duration) {
  return new MyPromise(resolve => {
    setTimeout(resolve, duration);
  });
}
(async function () {
  await delay(2000);
  console.log('ok');
})();
