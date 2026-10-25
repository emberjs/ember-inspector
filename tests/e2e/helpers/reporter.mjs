import { styleText } from 'node:util';

/**
 * A node:test reporter that prints a colored word for each result:
 * PASS, FAIL, SKIP, or TODO.
 *
 * Colors show in a terminal, and in CI when `FORCE_COLOR` is set.
 * Without colors, the words still tell the results apart.
 */
export default async function* reporter(source) {
  let started = [];
  let failures = [];

  for await (let { type, data } of source) {
    switch (type) {
      case 'test:start':
        started.push({ ...data, printed: false });
        break;

      case 'test:pass':
      case 'test:fail': {
        let test = started.pop();
        yield* headers(started);

        let failed = type === 'test:fail';
        let failureType = data.details.error?.failureType;
        let isSuite = data.details.type === 'suite';

        /**
         * A suite that passes already printed its name above its tests.
         */
        if (failed || !isSuite || !test?.printed) {
          yield resultLine(data, failed);
        }

        /**
         * A suite fails with its own error when a hook fails.
         * When only its tests fail, their lines show the errors.
         * A test that its suite cancelled has no error of its own.
         */
        let ownError =
          failed &&
          data.skip === undefined &&
          data.todo === undefined &&
          failureType !== 'subtestsFailed' &&
          failureType !== 'cancelledByParent';

        if (ownError) {
          let path = started.map((parent) => parent.name);
          path.push(data.name);
          failures.push({ ...data, name: path.join(' > ') });
          yield errorLines(data);
        }

        break;
      }

      case 'test:stdout':
      case 'test:stderr':
        yield data.message;
        break;

      case 'test:summary':
        if (data.file === undefined) yield summary(data, failures);
        break;
    }
  }
}

/**
 * Prints the name of each suite before its first result.
 */
function* headers(started) {
  for (let test of started) {
    if (test.printed) continue;

    test.printed = true;
    yield `${indent(test.nesting)}${styleText('bold', test.name)}\n`;
  }
}

function resultLine(data, failed) {
  let { name, nesting, skip, todo, details } = data;
  let label;
  let note = '';

  if (skip !== undefined) {
    label = styleText('gray', 'SKIP');
    if (typeof skip === 'string') note = `: ${skip}`;
  } else if (details.error?.failureType === 'cancelledByParent') {
    label = styleText('gray', 'STOP');
    note = ': did not run, because its suite failed';
  } else if (todo !== undefined) {
    label = styleText('yellow', 'TODO');
    note = `: ${typeof todo === 'string' ? todo : 'known issue'}.`;
    note += failed ? ' It still fails.' : ' It passes now.';
  } else if (failed) {
    label = styleText(['red', 'bold'], 'FAIL');
  } else {
    label = styleText('green', 'PASS');
  }

  let time = styleText('gray', `(${duration(details.duration_ms)})`);

  return `${indent(nesting)}${label}  ${name} ${time}${note}\n`;
}

function errorLines({ nesting, details }) {
  let error = details.error?.cause ?? details.error;
  let text = error?.stack ?? String(error);

  return (
    text
      .split('\n')
      .filter((line) => !/^\s*at .*\bnode:/.test(line))
      .map((line) => `${indent(nesting + 3)}${styleText('red', line)}`)
      .join('\n') + '\n'
  );
}

function summary({ counts, duration_ms }, failures) {
  let lines = [''];

  if (failures.length > 0) {
    lines.push(styleText(['red', 'bold'], 'Failed tests:'));

    for (let failure of failures) {
      lines.push(`  ${failure.name}`);
      lines.push(errorLines({ ...failure, nesting: 0 }).trimEnd());
    }

    lines.push('');
  }

  let parts = [
    styleText('green', `${counts.passed} passed`),
    styleText(counts.failed > 0 ? ['red', 'bold'] : 'gray', `${counts.failed} failed`),
    styleText('gray', `${counts.skipped} skipped`),
    styleText('yellow', `${counts.todo} todo`),
  ];

  if (counts.cancelled > 0) {
    parts.push(styleText('red', `${counts.cancelled} cancelled`));
  }

  lines.push(`${parts.join(', ')} in ${duration(duration_ms)}`);

  return lines.join('\n') + '\n';
}

function duration(ms) {
  return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`;
}

function indent(nesting) {
  return '  '.repeat(nesting);
}
