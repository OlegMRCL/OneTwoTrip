let crypto = require('crypto');
let redis = require('redis'),
    client = redis.createClient();

function App () {
    this.id = crypto.randomBytes(8).toString('hex');

    this.time = new Date;


    //Смотрит на "generator_id" в Redis.
    // (1) generator_id == null :   значит нет активного генератора
    //                              и нужно попытаться взять его функции на себя.
    // (2) generator_id == this.id :    значит приложение является активным генератором
    //                                  и нужно обновить его статус.
    // (3) generator_id != this.id (&& != null) : значит активным генератором пока что является другое приложение.
    //  В случаях (1) и (2) вызывается updateStatus и возвращается true.
    //  Иначе (случай (3)) статус не обновляется и возвращается false.
    this.checkStatus = function() {
        let generator_id = client.get('generator_id');
        if ((generator_id == this.id) || (generator_id == null)) {
            this.updateStatus();
            return true;
        }
        return false;
    };

    this.updateStatus = function() {
        client.setex('generator_id', 1, this.id, redis.print);
    };

    let Message = function(id, time) {
        this.genAt = time.toISOString();
        this.genBy = id;
        this.text = crypto.randomBytes(20).toString('hex');
    };

    this.sendMessage = function() {
        let message = new Message(this.id, this.time);
        let json = JSON.stringify(message);
        client.lpush(0, json, redis.print);
    };

    this.verifyMessage = function() {
        let message = client.rpop(0, redis.print);
        if (randomInt(0, 19) == 0) {
            let key = "ERROR! " + this.time.toISOString();
            client.set(key, message);
        }
    };

}
//todo: запуск с параметром 'getErrors'


function randomInt(min, max) {
    var rand = min - 0.5 + Math.random() * (max - min + 1)
    rand = Math.round(rand);
    return rand;
}



let app = new App();

for (;;) {
    while (app.checkStatus()){
        app.sendMessage()

        //TODO: timeout 0.500s

    }
    app.verifyMessage();

}