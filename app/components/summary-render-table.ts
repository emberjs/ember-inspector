import Component from '@glimmer/component';

import summarySchema from '../schemas/summary-render-tree';

import escapeRegExp from '../utils/escape-reg-exp';

import type { RenderTreeModel } from '../routes/render-tree';

import isEmpty from '@ember/utils/lib/is_empty';

interface SummaryRenderArgs {
  profiles: RenderTreeModel['profiles'];
  searchValue: string;
}

// TODO handle for recursive cases also

export default class SummaryRenderTable extends Component<SummaryRenderArgs> {
  get schema() {
    return summarySchema;
  }

  get escapedSearch() {
    return escapeRegExp(this.args.searchValue?.toLowerCase());
  }

  get rows() {
    const profiles = this.args.profiles ?? [];

    if (profiles.length === 0) {
      return [];
    }

    // Flatten children (actual components)
    const allComponents = profiles.flatMap((p) => p.children ?? []);

    const grouped: Record<
      string,
      {
        initial: number | null;
        reRenders: number[];
      }
    > = {};

    allComponents.forEach((profile) => {
      const name = profile.name;

      const time = profile.time; // precise ms

      if (!grouped[name]) {
        grouped[name] = { initial: null, reRenders: [] };
      }

      if (grouped[name].initial === null) {
        // First time we see this component → initial render
        grouped[name].initial = time;
      } else {
        // All later times → re-renders
        grouped[name].reRenders.push(time);
      }
    });

    return Object.entries(grouped)
      .map(([name, data]) => {
        const avgReRender = data.reRenders.length
          ? data.reRenders.reduce((a, b) => a + b, 0) / data.reRenders.length
          : 0;

        const count = data.reRenders.length + (data.initial ? 1 : 0);
        return {
          name,
          'initial-render': data.initial ? Number(data.initial.toFixed(2)) : 0,
          'avg-re-render': Number(avgReRender.toFixed(2)),
          'render-count': count,
        };
      })
      .filter((item) => {
        if (isEmpty(this.escapedSearch)) {
          return true;
        }

        const regExp = new RegExp(this.escapedSearch as string);
        return !!item.name.toLowerCase().match(regExp);
      })
      .sort((a, b) => b['initial-render'] - a['initial-render'])
      .slice(0, 5);
  }
}
