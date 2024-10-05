import { stdin, stdout } from 'process';

stdin.on("data", (data: Buffer) => {
    const input = data.toString().trim();

    if (input === 'stop') {
        stdout.write('stopped\n');
        process.exit(0);
    }

    const [trials, randomAmount] = input.split(',').map(Number);

    for (let i = 0; i < trials; i++) {
        let num = 5;
        while (num !== 0) {
            num = Math.floor(Math.random() * randomAmount);
        }
    }

    stdout.write('done\n');
});