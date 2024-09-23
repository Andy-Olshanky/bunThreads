console.log("Hello via Bun!");

function runSingleThreaded(numTrials: number, randomAmount: number) {
  const start = performance.now();
  for (let i = 0; i < numTrials; i++) {
    let num = 5;
    while (num !== 0) {
      num = Math.floor(Math.random() * randomAmount);
    }
  }
  const end = performance.now();
  console.log(`${numTrials} single-threaded trials took ${end - start}ms`);
}

function runMultiThreaded(numTrials: number, numWorkers: number, randomAmount: number) {
  const start = performance.now();
  const trialsPerWorker = Math.floor(numTrials / numWorkers);
  let completedWorkers = 0;
  let workers = [];

  return new Promise<void>((resolve) => {
    for (let i = 0; i < numWorkers; i++) {
        const worker = new Worker(new URL('./worker.ts', import.meta.url));
        workers.push(worker);
    }
    for (const worker of workers) {
        worker.postMessage({ trialsPerWorker, randomAmount });

        worker.onmessage = () => {
            completedWorkers++;
            if (completedWorkers === numWorkers) {
                const end = performance.now();
                console.log(`${numTrials} multi-threaded trials took ${end - start}ms`);
                workers.forEach((worker) => worker.terminate());
                resolve();
            }
        };
    }
  });
}

async function main() {
    if (Bun.argv.length > 2) {
    const arg = Bun.argv[2];
    const numTrials = 1000;
    const numWorkers = 32;
    const randomAmount = 10000000;

    if (arg === "single" || arg === "0") {
        runSingleThreaded(numTrials, randomAmount);
    } else if (arg === "multi" || arg === "1") {
        runMultiThreaded(numTrials, numWorkers, randomAmount);
    }
  }
}

await main();
