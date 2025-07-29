import loadEmberDebugInWebpage from '../lib/load-ember-debug-in-webpage';
import { onEmberReady, startInspector } from '../lib/start-inspector';

import adapter from '../adapters/bookmarklet';

loadEmberDebugInWebpage(() => onEmberReady(startInspector(adapter)));
