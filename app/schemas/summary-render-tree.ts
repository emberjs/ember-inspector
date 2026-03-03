/**
 * Summary render performance schema.
 */
export default {
  columns: [
    {
      id: 'name',
      name: 'Component',
      visible: true,
    },
    {
      id: 'initial-render',
      name: 'Initial Render Time (ms)',
      visible: true,
      numeric: true,
    },
    {
      id: 'avg-re-render',
      name: 'Avg Re-Render Time (ms)',
      visible: true,
      numeric: true,
    },
    {
      id: 'render-count',
      name: 'Render Count',
      visible: true,
      numeric: true,
    },
  ],
};
