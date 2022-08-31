const redis = require("redis");
const client = redis.createClient();

async function redisSetValue(key, value){
    return new Promise((resolve, reject) => {
        client.set(key, value, function(err, reply) {
            if (err) {
                reject(err);
            }
            return resolve(reply);
        });
    });
}

async function redisGetValue(key){
    return new Promise((resolve, reject) => {
        client.get(key, function(err, reply) {
            if (err) {
                reject(err);
            }
            return resolve(reply);
        });
    });
}

async function redisExecMulti(multi){
    return new Promise((resolve, reject) => {
        multi.exec((err, replies) => {
            if (err) {
                reject(err);
            }
            return resolve(replies);
        });
    });
}

module.exports = {
    client,
    redisSetValue,
    redisGetValue,
    redisExecMulti
}