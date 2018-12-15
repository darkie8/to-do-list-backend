//redis lib
const check = require("./checkLib");
const redis = require('redis');
let redisOption = {
    port: 6379, //jbnjknjknkn
    host: '192.168.99.100'
}
let client = redis.createClient(redisOption);

client.on('connect', () => {

    console.log("Redis connection successfully opened");

});

let getAllThingsInAHash = (hashName, callback) => {

    client.HGETALL(hashName, (err, result) => {


        if (err) {

            console.log(err);
            callback(err, null)

        } else if (check.isEmpty(result)) {

            console.log("list is empty");
            console.log(result)

            callback(null, {})

        } else {

            console.log(result);
            callback(null, result)

        }
    });


} // end get all users in a hash

// function to set new online user.
let setThingsInHash = (hashName, key, value, callback) => {

    client.HMSET(hashName, [
        key, value
    ], (err, result) => {
        if (err) {
            console.log(err);
            callback(err, null)
        } else {

            console.log("key,value set in the hash map");
            console.log(result)
            callback(null, result)
        }
    });


} // end set a new online user in hash

let deleteThingsFromHash = (hashName, key) => {

    client.HDEL(hashName, key);
    return true;

} // end delete user from hash

module.exports = {
    getAllThingsInAHash: getAllThingsInAHash,
    setThingsInHash: setThingsInHash,
    deleteThingsFromHash: deleteThingsFromHash
}