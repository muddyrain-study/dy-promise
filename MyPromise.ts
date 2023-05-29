enum State {
  Pending = 'pending',
  Fulfilled = 'fulfilled',
  Rejected = 'rejected',
}

type Resolve = (value: any) => void;
type Reject = (value: any) => void;

interface MyPromiseProps {
  reject: Reject;
  resolve: Resolve;
}

function runMicroTask(callback: Function) {
  // nodejs 环境
  if (process && process.nextTick) {
    process.nextTick(callback);
  } else if (MutationObserver) {
    const p = document.createElement('p');
    new MutationObserver(callback as MutationCallback).observe(document.body, {
      childList: true,
    });
    p.innerHTML = '1';
  } else {
    setTimeout(callback, 0);
  }
}

class MyPromise {
  /**
   * 状态值
   */
  private state: State = State.Pending;
  private value: any;

  /**
   * 构造函数
   */
  constructor(executor: (resolve: Resolve, reject: Reject) => void) {
    executor(this.resolve.bind(this), this.reject.bind(this));
  }

  /**
   * 切换状态值数据
   * @param state 状态
   * @param value 值
   */
  private changeStateValue(state: State, value: any) {
    if (this.state === State.Pending) {
      this.state = state;
      this.value = value;
    }
  }

  /**
   * 成功后调用
   */
  private resolve(value) {
    this.changeStateValue(State.Fulfilled, value);
  }
  /**
   * 失败后调用
   */
  private reject(reason) {
    this.changeStateValue(State.Rejected, reason);
  }

  public then(onFulfill, onReject?) {
    return new MyPromise((resolve, reject) => {
      if (this.state === State.Fulfilled) {
        onFulfill(this.value);
      }
      if (this.state === State.Rejected) {
        onReject(this.value);
      }
    });
  }
}

const pro1 = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(1);
  }, 1000);
});

pro1.then(value => {
  console.log(value);
});
