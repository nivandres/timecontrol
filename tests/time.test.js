import { expect, describe, it, afterEach } from "bun:test";
import {
  setTime,
  now,
  sleep,
  advance,
  back,
  fixTime,
  unfix,
  pauseTime,
  unpauseTime,
  switchUnit,
  restore,
  timeout,
  increaseTimeSpeed,
  timeSpeed,
  decreaseTimeSpeed,
} from "../src/control";

afterEach(() => restore());
const p = -1.36;

describe("set time", () => {
  it("simple set time", () => {
    setTime(0);
    expect(Date.now()).toBeCloseTo(0, p);
  });
  it("complex set time", () => {
    const time = Math.round(Math.random() * 10000);
    setTime(time);
    expect(Date.now()).toBeCloseTo(time, p);
  });
  it("multiple set times", () => {
    setTime(0);
    setTime(Date.now() + 1000);
    setTime(Date.now() + 1000);
    setTime(Date.now() + 1000);
    expect(Date.now()).toBeCloseTo(3000, p);
  });
  it("set time + seconds", async () => {
    setTime(1000);
    sleep(100);
    expect(Date.now()).toBeCloseTo(1100, p);
  });
});

describe("real now", () => {
  it("fixing time", () => {
    const current = new Date().getTime();
    setTime(12000);
    expect(now()).toBeCloseTo(current);
  });
});

describe("move on time", () => {
  it("forward", () => {
    setTime(0);
    advance(9000);
    advance(9000);
    advance(9000);
    advance(1000);
    expect(Date.now()).toBeCloseTo(28000, p);
    advance(3000000000);
    expect(Date.now()).toBeCloseTo(3000028000, p);
  });
  it("backward", () => {
    setTime(0);
    back(1000);
    expect(Date.now()).toBeCloseTo(-1000, p);
  });
  it("both directions", () => {
    back(100);
    back(10000);
    advance(20000);
    back(30000);
    advance(40000);
    back(10000);
    back(30000);
    advance(20000);
    advance(100);
    expect(Date.now()).toBeCloseTo(now(), p);
  });
  it("restore time", () => {
    setTime(0);
    advance(9000000);
    restore();
    expect(Date.now()).toBeCloseTo(now(), p);
  });
});

describe("time speed", () => {
  it("increase speed", async () => {
    setTime(0);
    increaseTimeSpeed(2);
    await sleep(10);
    expect(Date.now()).toBeCloseTo(20, p);
    timeSpeed(1);
  });
  it("decrease speed", async () => {
    setTime(0);
    decreaseTimeSpeed(2);
    await sleep(10);
    expect(Date.now()).toBeCloseTo(5, p);
    timeSpeed(1);
  });
});

describe("sleep", () => {
  it("simple sleep", () => {
    const current = Date.now();
    sleep(5000);
    expect(Date.now()).toBeCloseTo(current + 5000, p);
  });
  it("complex sleep", () => {
    setTime(1000);
    sleep(Date.now());
    sleep(Date.now());
    expect(Date.now()).toBeCloseTo(4000, p);
  });
  it("fixes and sleeps", () => {
    setTime(1000);
    sleep(1000);
    setTime(1000);
    sleep(1000);
    setTime(1000);
    sleep(1000);
    setTime(1000);
    sleep(1000);
    sleep(-1000);
    expect(Date.now()).toBeCloseTo(1000, p);
  });
});

describe("fix time", () => {
  it("fix a time", () => {
    fixTime(1000);
    setTime(now());
    advance(10000);
    expect(Date.now()).toBeCloseTo(1000, p);
    unfix();
  });
  it("pause", async () => {
    fixTime(10000);
    await sleep(60);
    expect(Date.now()).toBeCloseTo(10000, p);
    unfix();
    expect(Date.now()).toBeCloseTo(now(), p);
  });
  it("fix and unfix", () => {
    setTime(6000);
    sleep(25);
    fixTime();
    sleep(25);
    expect(Date.now()).toBeCloseTo(6025, p);
    unfix();
    expect(Date.now()).toBeCloseTo(6050, p);
  });
  it("pause and unpause", async () => {
    setTime(100);
    pauseTime();
    sleep(50);
    expect(Date.now()).toBeCloseTo(100, p);
    unpauseTime();
    sleep(50);
    expect(Date.now()).toBeCloseTo(150, p);
  });
  it("timed pause", async () => {
    setTime(100);
    await pauseTime(100);
    expect(Date.now()).toBeCloseTo(100, p);
  });
});

describe("real sleep", () => {
  it("simple real sleep", async () => {
    setTime(0);
    await sleep(100);
    expect(Date.now()).toBeCloseTo(100, p);
  });
  it("fake sleep + real sleep", async () => {
    setTime(0);
    sleep(1000);
    await sleep(100);
    expect(Date.now()).toBeCloseTo(1100, p);
  });
  it("multiple real sleeps", async () => {
    setTime(0);
    await sleep(20);
    await sleep(20);
    await sleep(20);
    await sleep(20);
    sleep(3000);
    await sleep(20);
    expect(Date.now()).toBeCloseTo(3100, p);
    setTime(0);
    sleep(100);
    advance(500);
    await sleep(100);
    back(400);
    expect(Date.now()).toBeCloseTo(300, p);
  });
  it("backward and now", async () => {
    back(1000);
    sleep(900);
    await sleep(100);
    sleep(100);
    expect(Date.now()).toBeCloseTo(now(), p);
  });
});

describe("javascript", () => {
  it("date object", () => {
    setTime(0);
    const d = new Date();
    sleep(1900);
    expect(d.getFullYear()).toBe(1970);
    expect(d.getTime()).toBeCloseTo(0, p);
  });
  it("timeout", async () => {
    setTime(0);
    await sleep(40);
    expect(Date.now()).toBeCloseTo(40, p);
  });
});

describe("timers", () => {
  it("timeout", async () => {
    const current = now();
    setTime(0);
    await timeout(() => {
      expect(now()).toBeCloseTo(current, p);
      expect(Date.now()).toBeCloseTo(1000, p);
    }, 1000);
  });
  it("real timeout", async () => {
    const current = now();
    setTime(0);
    await timeout(
      () => {
        expect(now()).toBeCloseTo(current + 50, p);
        expect(Date.now()).toBeCloseTo(1000, p);
      },
      1000,
      50
    );
  });
});

describe("unit format", () => {
  it("years", () => {
    switchUnit("y");
    setTime(0);
    advance(30);
    expect(new Date().getFullYear()).toBe(2000);
    back(2000);
    expect(new Date().getFullYear()).toBe(0);
    restore();
    expect(Date.now()).toBeCloseTo(now(), p);
  });
  it("seconds", () => {
    switchUnit("s");
    setTime(0);
    advance(9000);
    expect(Date.now()).toBeCloseTo(9000000, p);
  });
});
