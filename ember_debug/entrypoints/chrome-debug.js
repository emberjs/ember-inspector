import loadEmberDebugInWebpage from '../lib/load-ember-debug-in-webpage';
import { onEmberReady, startInspector } from '../lib/start-inspector';

import adapter from '../adapters/chrome';

loadEmberDebugInWebpage(() => onEmberReady(startInspector(adapter)));
