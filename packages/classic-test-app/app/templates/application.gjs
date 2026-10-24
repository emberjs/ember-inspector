import pageTitle from 'ember-page-title/helpers/page-title';
import { LinkTo } from '@ember/routing';
import Counter from '../components/counter';
import DeprecationButton from '../components/deprecation-button';

<template>
  {{pageTitle "ClassicTestApp"}}

  <h1>classic-test-app</h1>

  <nav>
    <LinkTo @route="index">Home</LinkTo>
    <LinkTo @route="about">About</LinkTo>
  </nav>

  <Counter @clicks={{1}} />
  <DeprecationButton />

  <ul>
    {{#each @model as |post|}}
      <li>{{post.title}}</li>
    {{/each}}
  </ul>

  {{outlet}}
</template>
