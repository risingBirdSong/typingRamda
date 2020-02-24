// following along to the wonderful 
// https://www.freecodecamp.org/news/typescript-curry-ramda-types-f747e99744ab/

import R from 'ramda'

type __ = typeof R.__

type myTestTuple = [string, number, boolean];

const myTestFunc = (args: myTestTuple) => { };
myTestFunc(["he", 3, true])

const fn00 = (name: string, age: number, single: boolean) => true;
type test07 = Parameters<typeof fn00>


//rewriting the built in Parameters function
type Params<F extends (...args: any[]) => any> = F extends ((...args: infer A) => any)
  ? A
  : never;

type test08 = Params<typeof fn00>;


type Head<T extends any[]> = T extends [any, ...any[]]
  ? T[0]
  : never

//correctly gets the type of the head
type test9 = Head<[4, 3, "goose", true]>
type test10 = Head<Params<typeof fn00>>

type Tail<T extends any[]> = ((...t: T) => any) extends ((_: any, ...tail: infer TT) => any) ?
  TT
  : never;


//and sure enough it infers the tail type
type test11 = Tail<[4, 3, "goose", true]>
type test12 = Tail<test11>
type test13 = Tail<test12>

type HasTail<T extends any[]> = T extends ([] | [any]) ? false : true;

type paramsAA = [true, "done", 3];
type test14 = HasTail<paramsAA>; // true, it has a tail
type test15 = HasTail<Tail<paramsAA>> // true, it has a tail
type test16 = HasTail<Tail<Tail<paramsAA>>> // false, no tail

type ObjectInfer<O> = O extends { a: infer A } ? A : never;
const testObj1 = { a: "hello" };
type test17 = ObjectInfer<typeof testObj1>

type FunctionInfer<F> = F extends (...args: infer A) => infer R ? [A, R] : never;

const fn01 = (a: number, b: string, c: boolean) => "greetings";
type test19 = FunctionInfer<typeof fn01>;

type ClassInfer<I> = I extends Promise<infer G> ? G : never;

const myPromise = new Promise<string>(() => { });
type test20 = ClassInfer<typeof myPromise>;

type ArrayInfer<T> = T extends (infer U)[] ? U : never;

const arrayTestA = ['test', 2, true, "experiemtn"];
type test21 = ArrayInfer<typeof arrayTestA>


type TupleInfer<T> = T extends [infer A, ...(infer B)[]]
  ? [A, B] :
  never;

//why is this never?
const myTestTuple1 = ["test", "hi"];
type myTestTupleType1 = typeof myTestTuple1;
//infers correctly like this...
type test22 = TupleInfer<[string, number]>
//but thinks never in this case...
type test22a = TupleInfer<myTestTupleType1>
//ah this may be because of the limitation he refers to


const toCurry01 = (name: string, age: number, single: boolean) => true;
const curried01 = (name: string) => (age: number) => (single: boolean) => true;

//remember P for parameters, R for return

type CurryV0<P extends any[], R> =
  //a classic curry takes only single argument at a time
  (arg: Head<P>) => HasTail<P> extends true
    //if we did not reach the end of the parameters recurse the types
    ? CurryV0<Tail<P>, R>
    // otherwise infer return type of curry :)
    : R

declare function curryV0<P extends any[], R>(f: (...args: P) => R): CurryV0<P, R>
const curryTest = curryV0(toCurry01);

// sure! We got type hinting and error detection!
let firstArg = curryTest("hi")
let secondArg = firstArg(4);
let thirdArg = secondArg(true)

console.log(thirdArg);

console.log("hurray!");

// Curry V1
// Nice, but we forgot to handle the scenario where we pass a rest parameter:


//ok so how about working with rest parameters?

const toCurry06 = (name: string, age: number, ...nicknames: string[]) => true;
const curried06 = curryV0(toCurry06);

// curried06("hi")(23)("hi" )

type CurryV1<P extends any[], R> = (arg0: Head<P>, ...rest: Tail<Partial<P>>) =>
  HasTail<P> extends true ?
  CurryV1<Tail<P>, R>
  : never;

// notice that toCurry07 is the exact same, just useful to have a new version for the progress of the tutorial
declare function curryV1<P extends any[], R>(f: (...args: P) => R): CurryV1<P, R>

const toCurry07 = (name: string, age: number, nicknames: string[]) => true;
const curried07 = curryV1(toCurry07);

//works with any amount of string nicknames! But big problem you can call it like with the (5) below! That should be an erro!
const test27 = curried07("jamie", 134, ["jj", "jamester"])(5)

type CurryV2<P extends any[], R> = <T extends any[]> (...args: T) => HasTail<P> extends true ?
  CurryV2<Tail<T>, R> :
  R

// We want to use a constrained generic T, but currently it's broken because the constraint is any[]...
// also Tail is broken because it was written to only accept one argument at a time and T in any[];

//the solution : more tools!

//Recursive Types
// the following tools will help us determine the next parameters to be consumed.
//how? By tracking the consumed parameters with T we should be able to guess what's left. 


//Last -> powerful but complex type

type Last<T extends any[]> = {
  0: Last<Tail<T>>
  1: Head<T>
}[
  HasTail<T> extends true
  ? 0
  : 1
]

// let's test it

type lastTest = Last<[1, 2, 3, 4]>; //4

// this example demonstrates the power of conditional types when used as an indexed type's accessor

// this technique is ideal for recursion like we just did, but also a nice way to organize complex conditional types

type Length<T extends any[]> = T["length"];

type test3 = Length<["gloop", true]>;

//It adds a type E at the top of a tuple T by using our first TS trick:



type Prepend<E, T extends any[]> = ((head: E, ...args: T) => any) extends ((...args: infer U) => any) ?
  U :
  T;


type test34 = Prepend<number, [string, false]>

//In Length’s examples, we manually increased a counter. So Prepend is the ideal candidate to be the base of a counter. Let’s see how it would work:

type test36 = [any, any, any]
type test37 = Length<test36>;
type test38 = Length<Prepend<any, test36>>

// The Drop type will recurse until Length<;I> matches the value of N that we passed. In other words, the type of index 0 is chosen by the conditional accessor until that condition is met. And we used Prepend&lt;any, I> so that we can increase a counter like we would do in a loop. Thus, Length<I> is used as a recursion counter, and it is a way to freely iterate with TS.

type Drop<N extends number, T extends any[], I extends any[] = []> = {
  0: Drop<N, Tail<T>, Prepend<any, I>>
  1: T
}[
  Length<I> extends N
  ? 1
  : 0
]

type test30 = Drop<3, [number, string, boolean, boolean, string, number]> // boolean, string, number

type parameterExample = [any, any, string, boolean, number, string]
type consumedExample = [any, any];

//an example of tracking the types left to consume...
type toConsume = Drop<Length<consumedExample>, parameterExample>

type curryV3<P extends any[], R> = <T extends any[]> (...args: T) =>
  Length<Drop<Length<T>, P>> extends 0
  ? R
  : CurryV2<Drop<Length<T>, P>, R>

type Cast<X, Y> = X extends Y ? X : Y


// Cast is a way to get TS to recheck types
type test41 = Cast<[string, string, "hi"], string[]>;


// type curryV4<P extends any[], R> =
//   <T extends any[]>(...args: Cast<T, Partial<P>>) =>
//     Length<Drop<Length<T>, P> extends infer DT ? Cast<DT, any[]> : never> extends 0
//     ? R
//     : curryV4<Drop<Length<T>, P> extends infer DT ? Cast<DT, any[]> : never, R>


type CurryV4<P extends any[], R> = <T extends any[]>(...args: Cast<T, Partial<P>>) =>
  Length<Drop<Length<T>, P> extends infer DT ? Cast<DT, any[]> : never> extends 0
  ? R
  : CurryV4<Drop<Length<T>, P> extends infer DT ? Cast<DT, any[]> : never, R>

declare function curryV4<P extends any[], R>(f: (...args: P) => R): CurryV4<P, R>


const toCurry08 = (name: string, age: number, single: boolean) => true;
const curried08 = curryV4(toCurry08);

const test43 = curried08("jane")(4)(true);
const test44 = curried08("jim", 5)(false);

//to be able to accept rest parameters

type CurryV5<P extends any[], R> = <T extends any[]>(...args: Cast<T, Partial<P>>) =>
  Drop<Length<T>, P> extends [any, ...any[]]
  ? CurryV5<Drop<Length<T>, P> extends infer DT ? Cast<DT, any[]> : never, R>
  : R

declare function curryV5<P extends any[], R>(f: (...args: P) => R): CurryV5<P, R>;

const toCurry09 = (name: string, age: number, nicknames: string[]) => true;
const curried09 = curryV5(toCurry09);

curried09("gary", 33, ["aa", "bb"]);


//Iterator type

//Posistion type - where are we located in our iteration
type Pos<I extends any[]> = Length<I>;
// Next - increase our pos in iteration
type Next<I extends any[]> = Prepend<any, I>;

type Prev<I extends any[]> = Tail<I>;

type iterator = [any, any, any];

type posTest = Pos<iterator>;
type prevTest = Pos<Prev<iterator>>
type nextTest = Pos<Next<iterator>>;

type Iterator<Index extends number = 0, From extends any[] = [], I extends any[] = []> = {
  0: Iterator<Index, Next<From>, Next<I>>
  1: From
}[
  Pos<I> extends Index
  ? 1
  : 0
]


type test53 = Iterator<2> // [any, any]
type test54 = Iterator<10, test53>;

type Reverse<T extends any[], R extends any[] = [], I extends any[] = []> = {
  0: Reverse<T, Prepend<T[Pos<I>], R>, Next<I>>
  1: R
}[
  Pos<I> extends Length<T>
  ? 1
  : 0
]

type test57 = Reverse<[1, 2, 3]>;
type test58 = Reverse<test57>;

// CONCAT

// And from `Reverse`, `Concat` was born. It simply takes a tuple `T1` and
// merges it with another tuple `T2`. It's kind of what we did in `test59`:

type Concat<T1 extends any[], T2 extends any[]> =
  Reverse<Reverse<T1> extends infer R ? Cast<R, any[]> : never, T2>

type test59 = Concat<[1, 2], [3, 4]>

type Append<E, T extends any[]> = Concat<T, [E]>;

type test60 = Append<5, [3, 4]>

//////////////////////////////////////////////////////////////////////////////////////////
// GAP ANALYSIS //////////////////////////////////////////////////////////////////////////

type GapOf<T1 extends any[], T2 extends any[], TN extends any[], I extends any[]> =
  T1[Pos<I>] extends __
  ? Append<T2[Pos<I>], TN>
  : TN

type test62 = GapOf<[__, __], [number, string, boolean], [], Iterator<0>>
type test63 = GapOf<[__, __], [number, string, boolean], [], Iterator<1>>
type test64 = GapOf<[__, __], [number, string, boolean], [], Iterator<2>>

// type GapsOf<T1 extends any[], T2 extends any[], TN extends any[] = [], I extends any[] = []> = {
//   0: GapsOf<T1, T2, GapOf<T1, T2, TN, I> extends infer G ? Cast<G, any[]> : never, Next<I>>
//   1: Concat<TN, Drop<Pos<I>, T2> extends infer D ? Cast<D, any[]> : never>
// }[
//   Pos<I> extends Length<T1>
//   ? 1 
//   : 0
// ]

type GapsOf<T1 extends any[], T2 extends any[], TN extends any[] = [], I extends any[] = []> = {
  0: GapsOf<T1, T2, GapOf<T1, T2, TN, I> extends infer G ? Cast<G, any[]> : never, Next<I>>
  1: Concat<TN, Drop<Pos<I>, T2> extends infer D ? Cast<D, any[]> : never>
}[
  Pos<I> extends Length<T1>
  ? 1
  : 0
]

type test65 = GapsOf<[__, any, __], [string, number, boolean, "aaa", "bbb"]>
type test66 = GapsOf<[any, __, any], [number, string, object, string[]]> // [string, string[]]

type PartiaGaps<T extends any[]> = {
  [K in keyof T]?: T[K] | __
}

type test67 = PartiaGaps<[number, string]>

type CleanGaps<T extends any[]> = {
  [K in keyof T]: NonNullable<T[K]>
}


type Gaps<T extends any[]> = CleanGaps<PartiaGaps<T>>

type test68 = Gaps<[number, string, boolean]>

// type CurryV6<P extends any[], R> =
//     <T extends any[]>(...args: Cast<T, Gaps<P>>) =>
//         GapsOf<T, P> extends [any, ...any[]]
//         ? CurryV6<GapsOf<T, P> extends infer G ? Cast<G, any[]> : never, R>
//         : R

// // Let's test it:
// declare function curryV6<P extends any[], R>(f: (...args: P) => R): CurryV6<P, R>

type CurryV6<P extends any[], R> =
  <T extends any[]> (...args: Cast<T, Gaps<P>>) =>
    GapsOf<T, P> extends [any, ...any[]]
    ? CurryV6<GapsOf<T, P> extends infer G ? Cast<G, any[]> : never, R>
    : R

declare function curryV6<P extends any[], R>(f: (...args: P) => R): CurryV6<P, R>;

const toCurry10 = (name: string, age: number, single: boolean) => true;
const curried10 = curryV6(toCurry10);

//damn that's slick
// curried10("hi")(6)(true);

// This is very cute, but we have one last problem to solve: parameter hints. I
// don't know for you, but I use parameter hints a lot. It is very useful to
// know the names of the parameters that you're dealing with. The version above
// does not allow for these kind of hints. Here is the fix: 


// export type Curry<F extends ((...args: any) => any)> =
//   <T extends any[]>(...args: Cast<Cast<T, Gaps<Parameters<F>>>, any[]>) =>
//     GapsOf<T, Parameters<F>> extends [any, ...any[]]
//     ? Curry<(...args: GapsOf<T, Parameters<F>> extends infer G ? Cast<G, any[]> : never) => ReturnType<F>>
//     : ReturnType<F>

// declare function curry<F extends (...args: any) => any>(f: F): Curry<F>




type Curry<F extends ((...args: any) => any)> =
  <T extends any[]>(...args: Cast<Cast<T, Gaps<Parameters<F>>>, any[]>) =>
    GapsOf<T, Parameters<F>> extends [any, ...any[]]
    ? Curry<(...args: GapsOf<T, Parameters<F>> extends infer G ? Cast<G, any[]> : never) => ReturnType<F>>
    : ReturnType<F>

declare function curry<F extends (...args: any) => any>(f: F): Curry<F>;

const toCurryLast = (name: string, surname: string, age: number, single: boolean, faveTeam: string) => true;
const curriedLast = curry(toCurryLast);

curriedLast("steve")("jonisy")(34)(true)("local soccer club");