self.onmessage = (event) => {
    const numTrials = event.data;
    
    for (let i = 0; i < numTrials; i++) {
        let num = 5;
        while (num !== 0) {
            num = Math.floor(Math.random() * 1000);
        }
    }

    self.postMessage('done');
}