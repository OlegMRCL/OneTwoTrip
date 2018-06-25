//
// Требуемые модули:
//
// npm install redis
// npm install lorem-ipsum
//

let crypto = require('crypto');
let loremIpsum = require('lorem-ipsum');
let redis = require('redis'),
    client = redis.createClient();

function App () {
    this.id = crypto.randomBytes(8).toString('hex');
    this.isGenerator = false;
    this.time = new Date;
}

//Смотрит на "generator_id" в Redis.
// (1) generator_id == null :   значит нет активного генератора
//                              и нужно попытаться взять его функции на себя.
// (2) generator_id == this.id :    значит приложение является активным генератором
//                                  и нужно обновить его статус.
// (3) generator_id != this.id (&& != null) :   значит активным генератором пока что
//                                              является другое приложение.
App.prototype.checkStatus = function() {
    let obj = this;
    client.get('generator_id', function(err, generator_id) {
        if (err) {
            console.log("Возникла ошибка при провверке статуса генератора!: " + err);
            obj.isGenerator = false;
        } else {
            if (generator_id == null) {
                obj.setStatus();
            } else if (generator_id === obj.id) {
                obj.updateStatus();
            } else {
                obj.isGenerator = false;
            }
        }
    });
};

//Делает попытку установить id приложения в качестве generator_id в Redis
App.prototype.setStatus = function() {
    let obj = this;
    client.set('generator_id', this.id, "EX", 10, "NX", function (err, reply) {
        if (err) {
            console.log("Возникла ошибка при запуске генератора: " + err);
            obj.isGenerator = false;
        } else if (reply == null) {
            console.log("Была попытка стать генератором, но кто-то другой опередил!");
            obj.isGenerator = false;
        } else {
            console.log();
            console.log("Запущен генератор!");
            obj.isGenerator = true;
        }
    });
};

//Обновляет время жизни generator_id, тем самым обновляя статус генератора.
App.prototype.updateStatus = function() {
    let obj = this;
    client.expire('generator_id', 1, function (err, reply) {
        if (err) {
            console.log("Возникла ошибка при обновлении статуса генератора: " + err);
            console.log("Генератор прекратил работу!");
            console.log();
            obj.isGenerator = false;
        }
    });
};

//Генерирует новое сообщение и отправляет его в Redis
App.prototype.sendMessage = function() {
    let obj = this;
    let message = new Message(this.id, this.time);
    let json = JSON.stringify(message);
    client.lpush("messages", json, function (err, reply) {
       if (err) {
           console.log("Ошибка при отпраке сообщения!: " + err);
           console.log("Генератор прекратил работу!");
           obj.isGenerator = false;
       } else {
           console.log("Сгенерировано сообщение: " + json);
       }
    });
};

//Функция с вероятностью 5% отправляет переданное ей сообщение в Redis
function verify(message) {
    if (randomInt(0, 19) === 0) {            //заданная вероятность обнаржуения ошибки 5%
        client.lpush("errors", message, function (err, reply) {
            if (err) {
                console.log("Ошибка при отправке сообщения в список неправильных: " + err);
            } else {
                console.log("Проверено сообщение: " + message);
                console.log("Сообщение отправлено в список неправильных!");
                console.log();
            }
        });

    }else{
        console.log("Проверено сообщение: " + message);
        console.log("Сообщение правильное!");
        console.log();
    }
}

//Берет сообщение из списка messages в Redis и обрабатывает его
App.prototype.verifyMessage = function() {
    client.rpop("messages", function(err, message) {
        if (err) {
            console.log("Ошибка при чтении сообщения обработчиком: " + err);
        } else if (message != null) {
           verify(message);
        }

    });
};

//Берет сообщения из списка errors в Redis и выводит на экран
App.prototype.getErrors = function() {
    let obj = this;
    client.rpop("errors", function(err, message) {
        if (err) {
            console.log("Ошибка при чтении сообщения из списка неправильных: " + err);
        } else if (message) {
            console.log("Неправильное сообщение: " + message);
            obj.getErrors();
        }
    })
};

function Message (id, time) {
    this.genAt = time.toISOString();
    this.genBy = id;
    this.text = loremIpsum({
        count: 1,
        units: 'sentences',
        sentenceLowerBound: 4,
        sentenceUpperBound: 20
    });
}

//Выдает случайное число из диапозона min...max
function randomInt(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    rand = Math.round(rand);
    return rand;
}

//Контроллер приложения
function controller() {
    if (app.isGenerator) {
        app.sendMessage();
        setTimeout(controller, 500);
    }else{
        app.verifyMessage();
        setTimeout(controller, 4);
    }
}

let app = new App();
if (process.argv[2] === "getErrors") {
    app.getErrors();
}else{
    setInterval(() => {app.checkStatus()}, 500);
    controller();
}


