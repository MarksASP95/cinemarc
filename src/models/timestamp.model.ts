export declare abstract class FieldValue {
  private constructor();
  /** Compares `FieldValue`s for equality. */
  abstract isEqual(other: FieldValue): boolean;
}

export declare class Timestamp {
  readonly seconds: number;
  readonly nanoseconds: number;
  static now(): Timestamp;
  static fromDate(date: Date): Timestamp;
  static fromMillis(milliseconds: number): Timestamp;
  constructor(
      seconds: number, 
      nanoseconds: number
  );
  toDate(): Date;
  toMillis(): number;
  isEqual(other: Timestamp): boolean;
  toString(): string;
  toJSON(): {
      seconds: number;
      nanoseconds: number;
  };
  valueOf(): string;
}

export type FirestoreTimestamp = Timestamp;
export type FirestoreFieldValue = FieldValue;
export type RichTimestamp = 
  | FirestoreTimestamp
  | FirestoreFieldValue
  | Date;