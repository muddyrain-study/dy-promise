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
      console.error(error);
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
   * 仅处理失败
   * @param {Function} obRejected
   */
  catch(obRejected) {
    return this.then(null, obRejected);
  }

  /**
   * 无论成功失败都会执行回调
   * @param {Function} onSettled
   */
  finally(onSettled) {
    return this.then(
      data => {
        onSettled();
        return data;
      },
      reason => {
        onSettled();
        throw reason;
      }
    );
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

  /**
   * 返回一个已完成的 promise
   * 特殊情况:
   * 1、传递的data 本身就是 promise的 对象
   * 2、传递的data 是 promise A+规范的 对象 返回新的 promise 状态保持一致
   * @param {} data
   */
  static resolve(data) {
    if (data instanceof MyPromise) {
      return data;
    }
    return new MyPromise((resolve, reject) => {
      if (isPromise(data)) {
        data.then(resolve, reject);
      } else {
        resolve(data);
      }
    });
  }

  /**
   * 得到一个被拒绝的promise
   * @param {any} reason
   */
  static reject(reason) {
    return new MyPromise((resolve, reject) => {
      reject(reason);
    });
  }

  /**
   * 得到一个新的Promise
   * 该 promise 的状态取决于 proms 的执行
   * proms 是一个迭代器
   * 顺序是数组顺序
   * @param {Iterator} proms
   */
  static all(proms) {
    return new MyPromise((resolve, reject) => {
      try {
        const results = [];
        let count = 0; // 计数
        let fulfilledCount = 0; // 成功的计数
        for (const prom of proms) {
          let i = count;
          count++;
          MyPromise.resolve(prom).then(data => {
            fulfilledCount++;
            results[i] = data;
            if (fulfilledCount === count) {
              // 当前是最后一个prom
              resolve(results);
            }
          }, reject);
        }
        if (count === 0) {
          resolve(results);
        }
      } catch (error) {
        reject(error);
        console.error(error);
      }
    });
  }
  /**
   * 等待所以promise 有结果之后
   * 该方法返回的结果完成
   * @param {Iterator} proms
   */
  static allSettled(proms) {
    const ps = [];
    for (const p of proms) {
      ps.push(
        MyPromise.resolve(p).then(
          value => ({
            status: FULFILLED,
            value,
          }),
          reason => ({
            status: REJECTED,
            reason,
          })
        )
      );
    }
    return MyPromise.all(ps);
  }
}

const pro1 = new MyPromise(resolve => {
  setTimeout(() => {
    resolve(1);
  }, 10);
});
const pro = MyPromise.allSettled([
  pro1,
  MyPromise.reject(2),
  MyPromise.resolve(3),
  4,
])
  .then(data => {
    console.log('成功', data);
  })
  .catch(e => {
    console.log('失败', e);
  });
console.log(pro);
