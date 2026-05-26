import { pageTitle } from 'ember-page-title';
import Counter from '../components/counter';

<template>
  {{pageTitle "ViteTestApp"}}

  <h1>vite-test-app</h1>

  <Counter @clicks={{1}} />

  {{outlet}}
</template>
