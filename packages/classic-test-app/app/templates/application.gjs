import pageTitle from 'ember-page-title/helpers/page-title';
import Counter from '../components/counter';

<template>
  {{pageTitle "ClassicTestApp"}}

  <Counter @clicks={{1}} />

  {{outlet}}
</template>
