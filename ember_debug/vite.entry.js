import main from './main';
import port from './port';
import * as version from './utils/version';
import ember from './utils/ember';
import profileNode from './models/profile-node';
import promise from './models/promise';
import chrome from './adapters/chrome';
import firefox from './adapters/firefox';
import bookmarklet from './adapters/bookmarklet';
import promiseAssembler from './libs/promise-assembler';
define('ember-debug/main', () => ({
  default: main,
}));
define('ember-debug/models/profile-node', () => ({
  default: profileNode,
}));
define('ember-debug/models/promise', () => ({ default: promise }));
define('ember-debug/adapters/chrome', () => ({ default: chrome }));
define('ember-debug/adapters/firefox', () => ({ default: firefox }));
define('ember-debug/adapters/bookmarklet', () => ({ default: bookmarklet }));
define('ember-debug/libs/promise-assembler', () => ({
  default: promiseAssembler,
}));
define('ember-debug/port', () => ({ default: port }));
define('ember-debug/utils/ember', () => ({ default: ember }));
define('ember-debug/utils/version', () => version);
