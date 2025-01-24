export default class BaseObject {
  isDestroyed = false;
  constructor(data) {
    Object.assign(this, data || {});
  }

  willDestroy() {
    this.isDestroying = true;
  }

  destroy() {
    this.willDestroy();
    this.isDestroyed = true;
  }

  reopen(data) {
    Object.assign(this, data);
  }
}
