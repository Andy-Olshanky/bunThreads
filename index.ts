console.log("Hello via Bun!");

function runSingleThreaded(numTrials: number) {
    let sum = 0;
    const start = performance.now();
    for (let i = 0; i < numTrials; i++) {
        sum++;
    }
    const end = performance.now();
    console.log(`${numTrials} single-threaded trials took ${end - start}ms`);
}

function runMultiThreaded(numTrials: number, numWorkers: number) {
    const trialsPerWorker = Math.floor(numTrials / numWorkers);
    const workers = [];
    let completedWorkers = 0;
    let totalSum = 0;

    const start = performance.now();
    for (let i = 0; i < numWorkers; i++) {
        const worker = new Worker('./worker.ts');
        workers.push(worker);
    }

    for (const worker of workers) {
        worker.postMessage(trialsPerWorker);

        worker.onmessage = (message) => {
            totalSum += message.data;
            completedWorkers++;

            if (completedWorkers === numWorkers) {
                const end = performance.now();
                console.log(`${numTrials} single-threaded trials took ${end - start}ms`);
                process.exit(0);
            }
        }
    }
}

if (Bun.argv.length > 2) {
    const arg = Bun.argv[2];
    const numTrials = 1000000000;
    const numWorkers = 8;

    if (arg === "single" || arg === "0") {
        runSingleThreaded(numTrials);
    } else if (arg === "multi" || arg === "1") {
        runMultiThreaded(numTrials, numWorkers);
    }
}