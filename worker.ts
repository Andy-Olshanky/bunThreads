self.onmessage = (event) => {
    if (event.data === 'stop') {
        self.postMessage('stopped');
        return;
    }

    const { trials, randomAmount } = event.data;
    
    for (let i = 0; i < trials; i++) {
        let num = 5;
        while (num !== 0) {
            num = Math.floor(Math.random() * randomAmount);
        }
    }

    self.postMessage('done');
}