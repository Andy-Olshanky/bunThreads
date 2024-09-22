console.log("Hello via Bun!");

const numWorkers = 8;
const numTrials = 10000000000;
const trialsPerWorker = Math.floor(numTrials / numWorkers);

const start = performance.now();

const workers = [];
for (let i = 0; i < numWorkers; i++) {
    console.log("Creating worker!", i);
    const worker = new Worker('./worker.ts');
    workers.push(worker);
}

let completedWorkers = 0;
let totalSum = 0;

for (const worker of workers) {
    worker.postMessage(trialsPerWorker);

    worker.onmessage = (message) => {
        totalSum += message.data;
        completedWorkers++;

        if (completedWorkers === numWorkers) {
            const end = performance.now();
            console.log(`Trials: ${numTrials}, Sum: ${totalSum}, Time: ${end - start}ms`);
            process.exit(0);
        }
    }
}