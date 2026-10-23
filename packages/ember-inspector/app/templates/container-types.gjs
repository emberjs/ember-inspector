import ItemTypes from 'ember-inspector/components/item-types';
<template>
  <ItemTypes
    @header="Types"
    @sorted={{readonly @controller.sorted}}
    @type="container"
    @width={{180}}
  >
    {{outlet}}
  </ItemTypes>
</template>
