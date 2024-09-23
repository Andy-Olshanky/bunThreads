console.log("Hello via Bun!");

function runSingleThreaded(numTrials: number, randomAmount: number) {
  const flag = numTrials > 500000;
  const check = numTrials / 100;
  const start = performance.now();
  for (let i = 0; i < numTrials; i++) {
    if (flag && (i + 1) % check === 0) {
        console.log(`Completed ${i + 1} single-threaded trials`);
    }
    let num = 5;
    while (num !== 0) {
      num = Math.floor(Math.random() * randomAmount);
    }
  }
  const end = performance.now();
  console.log(`${numTrials} single-threaded trials of ${randomAmount} took ${end - start}ms`);
}

function runMultiThreaded(numTrials: number, numWorkers: number, randomAmount: number) {
  const start = performance.now();
  let completedTrials = 0;
  let activeWorkers = numWorkers;
  const batchSize = 100;
  let workers: Worker[] = [];

  return new Promise<void>((resolve) => {
    const distributeWork = (worker: Worker) => {
        if (completedTrials < numTrials) {
            const remainingTrials = numTrials - completedTrials;
            const trialsToAssign = Math.min(remainingTrials, batchSize);
            worker.postMessage({ trials: trialsToAssign, randomAmount });
            completedTrials += trialsToAssign;
        } else {
            worker.postMessage('stop');
        }
    };

    const checkCompletion = () => {
        if (activeWorkers === 0) {
            const end = performance.now();
            console.log(`${completedTrials} multi-threaded trials of ${randomAmount} took ${end - start}ms`);
            workers.forEach(worker => worker.terminate());
            resolve();
        }
    };

    for (let i = 0; i < numWorkers; i++) {
        const worker = new Worker(new URL("./worker.ts", import.meta.url));
        workers.push(worker);

        worker.onmessage = (event) => {
            if (event.data === 'stopped') {
                activeWorkers--;
                checkCompletion();
            } else {
                distributeWork(worker);
            }
        };

        distributeWork(worker); // Start the worker(s)
    }
  });
}

async function main() {
    const numTrials = 100000;
    const numWorkers = 8;
    const randomAmount = 1000000;

    if (Bun.argv.length > 2) {
        const arg = Bun.argv[2];

        if (arg === "single" || arg === "0") {
            runSingleThreaded(numTrials, randomAmount);
        } else if (arg === "multi" || arg === "1") {
            runMultiThreaded(numTrials, numWorkers, randomAmount);
        } else if (arg === "both" || arg === "2") {
            runSingleThreaded(numTrials, randomAmount);
            runMultiThreaded(numTrials, numWorkers, randomAmount);
        }
    } else {
        runSingleThreaded(numTrials, randomAmount);
        runMultiThreaded(numTrials, numWorkers, randomAmount);
    }
}

await main();
