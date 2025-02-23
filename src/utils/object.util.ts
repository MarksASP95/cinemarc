export const buildRecord = <T>(
  data: T[],
  indexKey: keyof T
): Record<string, T> => {
  const record: Record<string, T> = {};
  for (const element of data) {
    record[element[indexKey] as any] = element;
  }
  return record;
};

export const buildFixedValueRecord = <T, K>(
  data: T[],
  indexKey: keyof T,
  value: K
): Record<string, K> => {
  const record: Record<string, K> = {};
  for (const element of data) {
    record[element[indexKey] as any] = value;
  }
  return record;
};
