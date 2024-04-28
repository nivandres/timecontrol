# Time Control

Fake the javascript time for your projects.

```js
import { sleep, setTime } from "timecontrol";

setTime(0); // It's 1970

console.log(Date.now()); // 0

sleep(6000); // Instantly fakes 6000 milliseconds

console.log(new Date().getTime()); // 6000

await sleep(2000); // Also if you await sleep, it works such a normal sleep function

console.log(Date.now()); // 8000
```

Also there are a lot of functions to manipulate time, from modify time speed to stop the time.

```js
import * as time from "timecontrol";

time.set(0); // It's 1970

time.increaseSpeed(2); // speed *= 2

const promise = new Promise((resolve) =>
  setTimeout(() => {
    resolve(Date.now());
  }, 2000)
);

console.log(await promise); // 4000, the time goes x2

time.pause(); // stop the time, now always be fixed to the current 4000 time.

const { sleep } = time;

await sleep(1000);
console.log(Date.now()); // 4000

time.unpause();

await sleep(1000, 100);
// first param, the time that will be advanced
// second param, the real time that sleep function will do

time.restore(); // It also reverts time speed

time.switchUnit("y"); // now time is on year unit.

time.advance(5); // time will advance 5 years

console.log(Date.now()); // From now 5 years on future

time.back(100); // 95 years from now to the past
```
