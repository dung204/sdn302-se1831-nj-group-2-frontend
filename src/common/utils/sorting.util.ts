import type { ColumnSort } from '@tanstack/react-table';
import { z } from 'zod';

type PayloadWithRawSorting = {
  sorting: string | string[];
  [key: string]: unknown;
};

export class SortingUtils {
  public static readonly DEFAULT_SORTING_VALUE = 'createTimestamp:desc';

  /**
   * Generates a Zod schema for validating sorting values.
   *
   * @param allowedFields - An array of allowed field names for sorting. The array **must contain at least 1 value**. The `createTimestamp` field is already included since it's the default sorting field
   * @returns A Zod schema that validates a single sorting value or an array of sorting values.
   *
   * The sorting value must be in the format `field:direction`, where `field` is one of the allowed fields
   * and `direction` is either `asc` or `desc`.
   *
   * @example
   * ```typescript
   * const schema = getSortingValueSchema(['name', 'age']);
   * schema.parse('name:asc'); // Valid
   * schema.parse(['name:asc', 'age:desc']); // Valid
   * schema.parse(['createTimestamp:asc']); // Valid
   * schema.parse('invalid:asc'); // Invalid
   * ```
   */
  public static getSortingValueSchema(allowedFields: [string, ...string[]]) {
    const fields = [...new Set([...allowedFields, 'createTimestamp'])];

    const singleValueSchema = z
      .string()
      .refine((val) =>
        new RegExp(`^(${fields.join('|')})+:(asc|desc)$`, 'g').test(val),
      );

    return singleValueSchema
      .or(z.array(singleValueSchema))
      .default([this.DEFAULT_SORTING_VALUE])
      .catch([this.DEFAULT_SORTING_VALUE]);
  }

  /**
   * Transforms a payload containing a sorting string or array into a structured sorting array.
   *
   * @template TPayload - The type of the payload that extends {@link PayloadWithRawSorting}.
   * @param {TPayload} payload - The payload containing the sorting information.
   * @param {string | string[]} payload.sorting - The sorting information, either as a comma-separated string or an array of strings.
   * @returns The transformed payload with the sorting information structured as an array of {@link ColumnSort} objects.
   */
  public static transformSorting<TPayload extends PayloadWithRawSorting>({
    sorting,
    ...payload
  }: TPayload) {
    const sortingValues =
      typeof sorting === 'string' ? sorting.split(',') : sorting;

    return {
      ...payload,
      sorting: sortingValues.map((val) => {
        const [field, direction] = val.split(':');
        return {
          id: field,
          desc: direction === 'desc',
        } satisfies ColumnSort;
      }),
    };
  }
}
