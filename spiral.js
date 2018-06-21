const N = 3;
let arr = [];

const min = 0;
const max = 100;

function randomInt(min, max) {
    var rand = min - 0.5 + Math.random() * (max - min + 1)
    rand = Math.round(rand);
    return rand;
}

for (let i = 0; i < (2*N - 1); i++) {
    let line = [];
    for (let j = 0; j < (2*N - 1); j++) {
        line[j] = randomInt(10, 99);
    }
    arr[i] = line;
    console.log(arr[i]);
}

const x_dir = [-1, 0, 1, 0];
const y_dir = [0, 1, 0, -1];

let data = {
    x:          N-1,
    y:          N-1,
    direction:  0,
    straight:   1,
    count:      1,
    total:      (N*2 - 1) * (N*2 - 1),
    isRepeated: false,

    unwrap:     function(arr) {
        let res = [arr[this.y][this.x]];
        while (this.count < this.total) {
            for (let i = 0; i < this.straight; i++) {
                this.x += x_dir[this.direction];
                this.y += y_dir[this.direction];
                res.push(arr[this.y][this.x]);
                this.count++;
                if (this.count == this.total) {
                    return res
                }
            }
            this.direction = (this.direction < 3)? this.direction+1 : 0;
            if (this.isRepeated) {
                this.straight++;
            }
            this.isRepeated = !this.isRepeated;
        }
    }
};

let resultArr = data.unwrap(arr);

let result = [resultArr[0]];
for (let i = 1; i < resultArr.length; i++ ) {
    result += (' ' + resultArr[i]);
}

console.log(result);

