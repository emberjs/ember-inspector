export const isNullish = (argument) =>
  argument === null || argument === undefined;

export const nonNullish = (argument) => !isNullish(argument);
