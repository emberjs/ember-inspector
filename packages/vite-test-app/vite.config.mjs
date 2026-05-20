import { defineConfig } from 'vite';
import { extensions, ember } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';

export default defineConfig({
  build:{
    rolldownOptions: {
      input: {
        main: 'index.html',
        app: "./app/app.js"
      },
      output: {
        entryFileNames: "[name].js"
      }
    }
  },
  plugins: [
    ember(),
    // extra plugins here
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
  ],
});
