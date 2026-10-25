import { pageTitle } from 'ember-page-title';
import { LinkTo } from '@ember/routing';
import Counter from '../components/counter';
import DeprecationButton from '../components/deprecation-button';

<template>
  {{pageTitle "ViteTestApp"}}

  <h1>vite-test-app</h1>

  <nav>
    <LinkTo @route="index">Home</LinkTo>
    <LinkTo @route="about">About</LinkTo>
  </nav>

  <Counter @clicks={{1}} />
  <DeprecationButton />

  {{outlet}}
</template>
