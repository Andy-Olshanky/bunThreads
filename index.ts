console.log("Hello via Bun!");

const numTrials = 10000000000;
let num = 0;
const start = performance.now();

for (let i = 0; i < numTrials; i++) {
    num++;
}

const end = performance.now();
console.log(`Trials: ${numTrials}, Sum: ${num}, Time: ${end - start}ms`);