import Application from '@ember/application';
import setupInspector from '@embroider/legacy-inspector-support/ember-source-4.12';
import setup from './initializers/setup';

import 'normalize.css';
import 'basiccontext/dist/basicContext.min.css';
import 'basiccontext/dist/themes/default.min.css';
import 'flatpickr/dist/flatpickr.css';
import './styles/app.scss';

export default class App extends Application {
  modules = {
    ...import.meta.glob('./router.js', { eager: true }),
    ...import.meta.glob('./routes/**/*.js', { eager: true }),
    ...import.meta.glob('./controllers/**/*.js', { eager: true }),
    ...import.meta.glob('./templates/**/*.gjs', { eager: true }),
    ...import.meta.glob('./services/**/*.js', { eager: true }),
    ...import.meta.glob('./schemas/**/*.js', { eager: true }),
  };

  inspector = setupInspector(this);
}

App.initializer(setup);
