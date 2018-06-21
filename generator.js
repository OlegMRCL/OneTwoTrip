let crypto = require('crypto');
let redis = require('redis'),
    client = redis.createClient();

function App () {
    this.id = crypto.randomBytes(8).toString('hex');

    this.time = new Date;

    this.checkStatus = function() {
        let generator_id = client.get('generator_id');
        if ((generator_id == this.id) || (generator_id == null)) {
            this.updateStatus();
            return true;
        }
        return false;
    };

    this.updateStatus = function() {
        client.set('generator_id', this.id, 'EX', 1);
    };

    this.Message = function() {
        //создает объект со свойствами: genAt, genBy, text
    };

    this.sendMessage = function() {
        let message = new this.Message();
        let json = JSON.stringify(message);
        client.call()
    };

    this.verifyMessage = function() {
        let message = /*RPOP*/;
        if (randomInt(0, 19) == 0) {
            let key = "ERROR! " + this.time.toISOString();
            client.set(key, message);
        }

    };

}

function randomInt(min, max) {
    var rand = min - 0.5 + Math.random() * (max - min + 1)
    rand = Math.round(rand);
    return rand;
}

let app = new App();
for (;;) {

}