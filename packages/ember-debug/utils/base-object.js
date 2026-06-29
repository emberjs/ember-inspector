function safeAssign(target, source) {
  if (!source) {
    return target;
  }
  for (let key of Object.keys(source)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    target[key] = source[key];
  }
  return target;
}

export default class BaseObject {
  isDestroyed = false;
  constructor(data) {
    safeAssign(this, data);
    this.init();
  }

  init() {}
  willDestroy() {
    this.isDestroying = true;
  }

  destroy() {
    this.willDestroy();
    this.isDestroyed = true;
  }

  reopen(data) {
    safeAssign(this, data);
  }
}
