export const isNullish = <T>(
  argument: T | undefined | null,
): argument is undefined | null => argument === null || argument === undefined;

export const nonNullish = <T>(
  argument: T | undefined | null,
): argument is NonNullable<T> => !isNullish(argument);
