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
    let valueIndex = 0
    for (const rangeCursor = rangeSet.iter(); rangeCursor.value !== null; rangeCursor.next()) {
      values[valueIndex++] = callbackfn(rangeCursor.value, rangeCursor.from, rangeCursor.to)
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
  const rangeCursor = rangeSet.iter()
  let accumulator: T | U
  if (initialValue == null) {
    // rangeSet.size is already checked
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    accumulator = rangeCursor.value!
    rangeCursor.next()
  } else {
    accumulator = initialValue
  }
  for (; rangeCursor.value !== null; rangeCursor.next()) {
    accumulator = callbackfn(accumulator, rangeCursor.value, rangeCursor.from, rangeCursor.to)
  }
  return accumulator
}
