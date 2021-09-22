interface Prompt<T> {
    (): T
}

//#region constructing tuples
type Foo<T extends unknown[]> = [string, ...T, number]
type T1 = Foo<[boolean]>
type T2 = Foo<[number, number]>
type T3 = Foo<[]>

const concat = <T extends unknown[], U extends unknown[]>(t: readonly [...T], u: readonly [...U]): [...T, ...U] => [...t, ...u]
const na = [1, 2, 3, 4]
const ns = [1, 2, 3, 4] as const
const t1 = concat([1, 2], ['hello'])
const t2 = concat([true], na)
const t3 = concat([true], ns)
const t4 = concat([true] as const, na)
//#endregion

//#region fuctions on lists/tuples/arrays
declare function last<T extends unknown[], U> (a: readonly [...T, U]): U
const a = ['hello', 'world', 42];
last(['hello', 'world', 42]);
last(['hello', 'world']);
last(['hello'])
last(a)

type Head<T extends readonly unknown[]> = T[0];
type TH0 = Head<[]>;
type TH1 = Head<[1]>;
type TH5 = Head<[5, 4, 3, 2, 1]>;

type Tail<T extends readonly unknown[]> = T extends [unknown, ...infer U] ? U : [...T];
type TT0 = Tail<[]>
type TT1 = Tail<[1]>
type TT5 = Tail<[1, 2, 3, 4, 5]>

type Init<T extends readonly unknown[]> = T extends [...infer U, unknown] ? U : never; // the latter (never) will never happen, why?
type TI0 = Init<[]> // this is really weird that it returns `unknow[]` while Tail<[]> returns only `[]`
type TI1 = Init<[1]>
type TI5 = Init<[1, 2, 3, 4, 5]>

type Last<T extends readonly unknown[]> = T extends [...infer _, infer U] ? U : never; // the latter (never) will never happen, why?
type TL0 = Last<[]> // same as above this is really weird that it returns `unknow[]` while Tail<[]> returns only `[]`
type TL1 = Last<[1]>
type TL5 = Last<[1, 2, 3, 4, 5]>
//#endregion

//#region Bind and Callback
function bind<T extends unknown[], U extends unknown[], R>(f: (...args: [...T, ...U]) => R, ...a: T): (...b: U) => R {
    return (...b) => f(...a, ...b);
}

const fn1 = (a: number, b: string, c: boolean, d: string[]) => 0
const c0 = bind(fn1)
const c1 = bind(fn1, 1)
const c2 = bind(fn1, 1, 'hello')
const c3 = bind(fn1, 1, 'hello', true)
const c4 = bind(fn1, 1, 'hello', true, ['x', 'y'])

type Callback<A extends unknown[]> = (context: unknown, ...args: [...A]) => void
type CB1 = Callback<[number]>
type CB2 = Callback<[number, string]>
type CB3 = Callback<[x: number, y: string]>
type F1 = (x: number, y: string) => void
type P1 = Parameters<F1>
type CB4 = Callback<P1>

function foo3<T extends unknown[], U extends unknown[]>(t: readonly [...T], u: readonly [...U]) {
    return [1, ...t, 2, ...u, 3] as const
}
const t = foo3(['hello'], [10, true])

declare function fs1(a: number, b: string, c: boolean, ...d: number[]): void
function fs2(t1: [number, string], t2: [boolean], a1: number[]) {
    fs1(1, 'abc', true, 42, 43, 44)
    fs1(1, 'abc', true, 42, 43, 44)
    fs1(...t1, ...t2, ...a1)
    fs1(...t1, 45)
}
//#endregion

//#region Recursive conditional types
type Awaited<T> =
  T extends null | undefined ? T : 
  T extends PromiseLike<infer U> ? Awaited<U> : T
type P01 = Awaited<Promise<string>>
type P02 = Awaited<Promise<Promise<string>>>
type P03 = Awaited<Promise<string | Promise<Promise<number | undefined>>>>

type Awaited2<T> = 
  T extends null | undefined ? T :
  {
      0: T extends PromiseLike<infer U> ? Awaited2<U> : never
      1: T
  }[T extends PromiseLike<infer U> ? 0 : 1]
type P11 = Awaited<Promise<string>>
type P12 = Awaited<Promise<Promise<string>>>
type P13 = Awaited<Promise<string | Promise<Promise<number | undefined>>>>

type ElementType<T> = T extends readonly (infer U)[] ? ElementType<U> : T;
type Flatten<T extends readonly unknown[]> = T extends readonly unknown[] ? ElementType<T>[] : readonly ElementType<T>[]
type A01 = Flatten<string[][][]>
type A02 = Flatten<string[][] | readonly (number [] | boolean [][])[]>

type InfiniteArray<T> = InfiniteArray<T>[];
type E1 = ElementType<InfiniteArray<string>>

type Flatten2<T extends readonly unknown[]> = T extends readonly unknown[] ? ElementType<T>[] : ElementType<T>[] // WTF
type A11 = Flatten2<string[][][]>
type A12 = Flatten2<string[][] | readonly (number [] | boolean [][])[]>

type Flatten3<T extends readonly unknown[]> = ElementType<T>[] // WTF, why is this different from Flatten2 (see A22 vs A12)
type A21 = Flatten2<string[][][]>
type A22 = Flatten2<string[][] | readonly (number [] | boolean [][])[]>
//#endregion

//#region Repeating tuples
type TupleOf<T, N extends number> = 
  N extends N ?  
    number extends N ?  T[] :  _TupleOf<T, N, []> :
    never;
type _TupleOf<T, N extends number, R extends unknown[]> =
  R['length'] extends N ? R : _TupleOf<T, N,  [...R, T]>
type TN1 = TupleOf<string, 3>
type TN2 = TupleOf<number, 0 | 2 | 4>
type TN3 = TupleOf<number, number>
type TN43 = TupleOf<number, 43>
type TN44 = TupleOf<number, 44>
type TN100 = TupleOf<number, 100>
//#endregion

//#region Reversing tuples
type Reverse<T> = 
  T extends [] ? T :
  T extends [infer Head, ...infer Tail] ? [...Reverse<Tail>, Head] :
  T
type TR = Reverse<[string, number, boolean]>
//#endregion

//#region Template literal types
type EventName<T extends string> = `${T}Changed`

type L1 = EventName<`foo`>
type L3 = EventName<`foo` | `bar` | `baz`>

type L4 = `${`top` | `bottom`}-${`left` | `right`}`
type L5 = `${`abc` | 42 | true | -1234n}`

type StringDashString = `${string}-${string}`
type StringDashNumber = `${string}-${number}`

const sds: StringDashString = `hello-world`
const ndn: StringDashNumber = `hello-42`

type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
type FourDigits = `${Digit}${Digit}${Digit}${Digit}`

const fd: FourDigits = `1234`;
//#endregion

//#region Template literal type inference
type MatchPair<S extends string> = S extends `[${infer A},${infer B}]` ? [A, B] : unknown

type MT0 = MatchPair<'[1,2]'>
type MT1 = MatchPair<'[foo,bar]'>
type MT2 = MatchPair<' [1,2]'>
type MT3 = MatchPair<'[123]'>
type MT4 = MatchPair<'[1,2,3,4]'> // matching is non-greedy
//#endregion

//#region Inference with recursive conditional types
type Trim<S extends string> =
  S extends ` ${infer T}` ? Trim<T> :
  S extends `${infer T} ` ? Trim<T> :
  S;

type TR0 = Trim<'     hello   '>
type TR1 = Trim<` hello         `>;

type Join<T extends unknown[], D extends string> =
  T extends [] ? '' :
  T extends [string | number | boolean | bigint] ? `${T[0]}` :
  T extends [string | number | boolean | bigint, ...infer U] ? `${T[0]}${D}${Join<U, D>}` :
  string;

type TJ0 = Join<[1, 2, 3, 4], '.'>
type TJ1 = Join<['foo', 'bar', 'baz'], '-'>
type TJ3 = Join<[], '.'>
type TJ4 = Join<['A', 'B', 'C'], ''>

type Split<S extends string, D extends string> =
  string extends S ? string[] :
  S extends '' ? [] :
  S extends `${infer T}${D}${infer U}` ? [T, ...Split<U, D>] :
  [S]

type TS0 = Split<'foo', '.'>
type TS1 = Split<'foo.bar.baz', '.'>
type TS2 = Split<'foo.bar', ''>
type TS3 = Split<any, '.'>
type TS4 = Split<string, '.'>
type TS5 = Split<'', '.'>
//#endregion

//#region Mapped type 'as' clauses
type OnPropChangedMethods<T> = {
  [P in keyof T & string as `${P}Changed`]: (cb: (newValue: T[P]) => void) => void
}

declare function makeWatchedObject<T>(obj: T): T & OnPropChangedMethods<T>

let homer = makeWatchedObject({
  firstName: "Homer",
  age: 42,
  location: "SpringField"
})

homer.ageChanged((newAge)=> {
  console.log(`The new age is ${newAge}`)
})
//#endregion

//#region Promisify
// type Promisify<T> =
//   T extends (...args: [...infer A, ])
//#endregion

// https://youtu.be/IGw2MRI0YV8?t=3951




