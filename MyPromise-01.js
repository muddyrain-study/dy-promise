// 记录 promise 的 三种状态
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

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
  throw 123;
});

console.log(pro1);
