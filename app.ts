import { Inflate } from "zlib";

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

type CurrvyV1<P extends any[], R> = (arg0: Head<P>, ...rest: Tail<Partial<P>>) =>
  HasTail<P> extends true ?
  CurrvyV1<Tail<P>, R>
  : never;

// notice that toCurry07 is the exact same, just useful to have a new version for the progress of the tutorial
declare function curryV1<P extends any[], R>(f: (...args: P) => R): CurrvyV1<P, R>

const toCurry07 = (name: string, age: number, nicknames: string[]) => true;
const curried07 = curryV1(toCurry07);
//works with any amount of string nicknames! But big problem you can call it like with the (5) below! That should be an erro!

const test27 = curried07("jamie", 134, ["jj", "jamester"])(5)