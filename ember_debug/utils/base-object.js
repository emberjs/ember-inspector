export default class BaseObject {
  isDestroyed = false;
  constructor(data) {
    Object.assign(this, data || {});
    this.init();
  }

  init() {}
  willDestroy() {}

  destroy() {
    this.willDestroy();
    this.isDestroyed = true;
  }

  reopen(data) {
    Object.assign(this, data);
  }
}
