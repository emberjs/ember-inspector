import loadEmberDebugInWebpage from '../lib/load-ember-debug-in-webpage';
import { onEmberReady, startInspector } from '../lib/start-inspector';

import adapter from '../adapters/basic';

loadEmberDebugInWebpage(() => onEmberReady(startInspector(adapter)));
