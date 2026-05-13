import { captureRenderTree, getEnv } from './ember.js';

let capture = captureRenderTree;
// Ember 3.14+ comes with debug render tree, but the version in 3.14.0/3.14.1 is buggy
if (captureRenderTree) {
  if (getEnv()._DEBUG_RENDER_TREE) {
    capture = captureRenderTree;
  } else {
    capture = function captureRenderTree() {
      return [];
    };
  }
}
export default capture;
