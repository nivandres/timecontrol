let time = 0;
let multiplier = 1;
let fixed: number | null | false | undefined;
let speed = 1;
let last: number = Date.now();

type Time = Date | string | number;

export function ms(ms: number = 0, m: number = multiplier) {
  install();
  return (time += ms * m);
}

export function setTime(time: Time) {
  return ms(new Date(time).getTime() - Date.now(), 1);
}

export function fixTime(time: Time = Date.now()) {
  install();
  return (fixed = new Date(time).getTime());
}

export const set = setTime;
export const fix = fixTime;

export function unfix() {
  return (fixed = null);
}

export const realTimeout = setTimeout;

export function restoreTimeout() {
  try {
    // @ts-ignore
    setTimeout = realTimeout;
  } catch {}
}

export function pauseTime<T extends number | undefined>(
  t?: T
): undefined extends T ? number : Promise<number | null> {
  fix();
  return (
    t
      ? new Promise((resolve) =>
          realTimeout(() => {
            resolve(unpauseTime());
          }, t * multiplier)
        )
      : fixed
  ) as any;
}
export function unpauseTime() {
  const n = fixed;
  unfix();
  if (typeof n === "number") setTime(n);
}

export const pause = pauseTime;
export const unpause = unpauseTime;

const units = ["ms", "s", "m", "h", "d", "w", "y"] as const;
type Unit = (typeof units)[number];

export function switchUnit(unit?: Unit) {
  switch (unit) {
    case "ms":
      multiplier = 1;
      break;
    case "s":
      multiplier = 1000;
      break;
    case "m":
      multiplier = 60000;
      break;
    case "h":
      multiplier = 3600000;
      break;
    case "d":
      multiplier = 86400000;
      break;
    case "w":
      multiplier = 604800000;
      break;
    case "y":
      multiplier = 31556736000;
      break;
    default:
      multiplier = multiplier;
      break;
  }
  return multiplier;
}

export function advance(time?: number) {
  return ms(time);
}

export function back(time: number) {
  return ms(-time);
}

export function sleep(
  time: number = 0,
  real: number = time
): Promise<number | false> {
  const current = advance(time);
  return new Promise((resolve) =>
    realTimeout(
      () => resolve(current === ms() && back(real)),
      real * multiplier
    )
  );
}

export const fakeSleep = sleep;

export async function rest(
  time: number = 0,
  real: number = time
): Promise<number | false> {
  const current = ms();
  return new Promise((resolve) =>
    realTimeout(() => {
      resolve(current === ms() && back(time));
    }, real * multiplier)
  );
}

export const off = rest;

export function restore() {
  speed = 1;
  fixed = null;
  time = 0;
}

export const reset = restore;

export function timeout<F extends unknown>(
  fn: () => F,
  time: number,
  real?: number
): Promise<F> {
  if (real)
    return new Promise(async (resolve) => {
      await sleep(time, real);
      resolve(fn());
    });
  return new Promise(async (resolve) => {
    advance(time);
    resolve(fn());
  });
}

export const doTimeout = timeout;

export function modifyTimeout() {
  try {
    // @ts-ignore
    setTimeout = timeout;
  } catch {}
}

export function timeSpeed(s: number) {
  install();
  speed = s;
}

export function increaseTimeSpeed(s: number) {
  timeSpeed(speed * s);
}

export function decreaseTimeSpeed(s: number) {
  timeSpeed(speed / s);
}

export const now = Date.now;
export const fakeNow = () => Date.now();
export const realNow = now();

export async function install() {
  if (Date.now !== now) return;
  Date.now = () => {
    const t = now();
    const n =
      typeof fixed === "number" ? fixed : last + (t - last) * speed + ms();
    last = t;
    return n;
  };
  modifyTimeout();
  // @ts-ignore
  Date = FakeDate;
}

export const setup = install;

export function uninstall() {
  Date.now = now;
}

class FakeDate extends Date {
  public faked: boolean | number = false;
  constructor(time?: Date | number | string) {
    super(time === undefined ? Date.now() : time);
  }
  realTime() {
    if (this.faked) return Number(this.faked);
    return this.getTime();
  }
}
