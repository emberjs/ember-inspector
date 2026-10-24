/**
 * The Render Performance tab of the inspector hides renders under 1 ms.
 * This keeps the render of this route above that.
 */
function slowRender() {
  let end = performance.now() + 5;

  while (performance.now() < end) {
    /* wait */
  }
}

<template>
  <h2>About</h2>
  {{slowRender}}
</template>
