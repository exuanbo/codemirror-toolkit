import type { RangeValue } from '@codemirror/state'
import { RangeSet } from '@codemirror/state'

export type AnyRangeSet = RangeSet<RangeValue>

/**
 * @param a new `RangeSet`
 * @param b old `RangeSet`
 */
export function rangeSetsEqual(a: AnyRangeSet, b: AnyRangeSet): boolean {
  return RangeSet.eq([b], [a])
}

export type RangeValueCallback<T extends RangeValue, U> = (value: T, from: number, to: number) => U

export function mapRangeSetToArray<T extends RangeValue, U>(
  rangeSet: RangeSet<T>,
  callbackfn: RangeValueCallback<T, U>,
): U[] {
  const values = new Array<U>(rangeSet.size)
  if (values.length) {
    let index = 0
    for (const cursor = rangeSet.iter(); cursor.value !== null; cursor.next()) {
      values[index++] = callbackfn(cursor.value, cursor.from, cursor.to)
    }
  }
  return values
}

export type RangeValueReduceCallback<T extends RangeValue, U extends {}> = (
  previousValue: U,
  currentValue: T,
  from: number,
  to: number,
) => U

export function reduceRangeSet<T extends RangeValue>(
  rangeSet: RangeSet<T>,
  callbackfn: RangeValueReduceCallback<T, T>,
): T

export function reduceRangeSet<T extends RangeValue, U extends {}>(
  rangeSet: RangeSet<T>,
  callbackfn: RangeValueReduceCallback<T, U>,
  initialValue: U,
): U

export function reduceRangeSet<T extends RangeValue, U extends {}>(
  rangeSet: RangeSet<T>,
  callbackfn: RangeValueReduceCallback<T, T | U>,
  initialValue?: U,
): T | U {
  if (!rangeSet.size) {
    if (initialValue == null) {
      throw new TypeError('Reduce of empty RangeSet with no initial value')
    }
    return initialValue
  }
  const cursor = rangeSet.iter()
  let accumulator: T | U
  if (initialValue == null) {
    // rangeSet.size is already checked
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    accumulator = cursor.value!
    cursor.next()
  } else {
    accumulator = initialValue
  }
  for (; cursor.value !== null; cursor.next()) {
    accumulator = callbackfn(accumulator, cursor.value, cursor.from, cursor.to)
  }
  return accumulator
}
