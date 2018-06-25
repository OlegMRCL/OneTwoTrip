let readline = require('readline');
let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

const min = 10;
const max = 99;

//Выдает случайное число в диапозоне min...max
function randomInt(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    rand = Math.round(rand);
    return rand;
}

const x_dir = [-1, 0, 1, 0];
const y_dir = [0, 1, 0, -1];

function Spiral(N) {
    this.x = N - 1;    // x, y - координаты элемента в матрице, изначально указывают на центральный элемент
    this.y = N - 1;
    this.direction = 0;      // направление движения (0..3), указывает на пару значений x_dir y_dir
    this.straight = 1;      // длина прямого участка, т.е. то сколько елементов мы пройдем пока не сделаем поворот
    this.count = 1;      // количество пройденных элементов матрицы
    this.total = (N * 2 - 1) * (N * 2 - 1);      //общее количество элементов матрицы
    this.repeat = true;       // показывает будет ли длина следующего прямого участка равна длине предыдущего

}

Spiral.prototype.unwrap = function(arr) {
    let res = [arr[this.y][this.x]];

    while (this.count < this.total) {

        //прохождение прямого участка с последовательным занесением пройденных элементов в массив
        for (let i = 0; i < this.straight; i++) {
            this.x += x_dir[this.direction];
            this.y += y_dir[this.direction];
            res.push(arr[this.y][this.x]);
            this.count++;
            if (this.count == this.total) {
                return res
            }
        }

        //поворот
        this.direction = (this.direction < 3)? this.direction + 1 : 0;

        //определяем длину следующего прямого участка
        if (!this.repeat) {
            this.straight++;
        }
        this.repeat = !this.repeat;
    }
};

console.log("Будет создана матрица (2N - 1)x(2N - 1) и заполнена случайными числами.");
console.log("Введите N...");
rl.on('line', function(line) {
    let N = line;
    rl.close();

    let arr = [];
    //заполняем матрицу случайными числами
    for (let i = 0; i < (2*N - 1); i++) {
        let line = [];
        for (let j = 0; j < (2*N - 1); j++) {
            line[j] = randomInt(min, max);
        }
        arr[i] = line;
        console.log(arr[i].toString().replace(/,/g," "));
    }

    let spiral = new Spiral(N);
    let resultArr = spiral.unwrap(arr);

    let result = resultArr.toString().replace(/,/g," ");

    console.log();
    console.log(result);
});



