self.onmessage = (event) => {
    const { trialsPerWorker, randomAmount } = event.data;
    // console.log('Worker received message:', trialsPerWorker, randomAmount);
    
    for (let i = 0; i < trialsPerWorker; i++) {
        let num = 5;
        while (num !== 0) {
            num = Math.floor(Math.random() * randomAmount);
        }
    }

    self.postMessage('done');
}