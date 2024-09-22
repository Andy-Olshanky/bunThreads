self.onmessage = (message) => {
    console.log("Worker received message!");
    const trials = message.data;
    let sum = 0;

    for (let i = 0; i < trials; i++) {
        sum++;
    }

    self.postMessage(sum);
}