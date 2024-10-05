import { spawn } from "bun";

console.log("Hello via Bun!");

function runSingleThreaded(numTrials: number, randomAmount: number) {
  const flag = numTrials > 500000;
  const check = numTrials / 100;
  const start = performance.now();
  for (let i = 0; i < numTrials; i++) {
    // if (flag && (i + 1) % check === 0) {
    //     console.log(`Completed ${i + 1} single-threaded trials`);
    // }
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
            console.log(`${completedTrials} multi-threaded trials of ${randomAmount} w/ ${numWorkers} workers took ${end - start}ms`);
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

function runMultiProcess(numTrials: number, numProcesses: number, randomAmount: number) {
    const start = performance.now();
    let completedTrials = 0;
    let activeProcesses = numProcesses;
    const batchSize = 100;

    return new Promise<void>((resolve) => {
        const distributeWork = (process: any) => {
            if (completedTrials < numTrials) {
                const remainingTrials = numTrials - completedTrials;
                const trialsToAssign = Math.min(remainingTrials, batchSize);
                process.stdin.write(`${trialsToAssign},${randomAmount}\n`);
                completedTrials += trialsToAssign;
            } else {
                process.stdin.write('stop\n');
            }
        };

        const checkCompletion = () => {
            if (activeProcesses === 0) {
                const end = performance.now();
                console.log(`${completedTrials} multi-process trials of ${randomAmount} w/ ${numProcesses} processes took ${end - start}ms`);
                resolve();
            }
        };

        for (let i = 0; i < numProcesses; i++) {
            const process = spawn(['bun', 'run', 'child.ts'], {
                stdout: 'pipe',
                stdin: 'pipe',
            });

            const reader = process.stdout.getReader();
            const readChunk = async () => {
                const { done, value } = await reader.read();
                if (done) return;

                const message = new TextDecoder().decode(value).trim();
                if (message === 'done') {
                    distributeWork(process);
                } else if (message === 'stopped') {
                    activeProcesses--;
                    checkCompletion();
                }
                readChunk(); // continue the reading
            };
            readChunk();

            distributeWork(process);
        }
    });
}

async function main() {
    const numTrials = 1000000;
    const numWorkers = 32;
    const numProcesses = 32;
    const randomAmount = 10000;

    if (Bun.argv.length > 2) {
        const arg = Bun.argv[2];

        if (arg === "single" || arg === "0") {
            runSingleThreaded(numTrials, randomAmount);
        } else if (arg === "multi" || arg === "1") {
            runMultiThreaded(numTrials, numWorkers, randomAmount);
        } else if (arg === "both" || arg === "2") {
            runSingleThreaded(numTrials, randomAmount);
            runMultiThreaded(numTrials, numWorkers, randomAmount);
        } else if (arg === "process" || arg === "3") {
            runMultiProcess(numTrials, numProcesses, randomAmount);
        }
    } else {
        runSingleThreaded(numTrials, randomAmount);
        runMultiThreaded(numTrials, numWorkers, randomAmount);
        runMultiProcess(numTrials, numProcesses, randomAmount);
    }
}

await main();
