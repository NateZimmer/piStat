
var influx = {};

console.log('Mocked Influx')

influx.writeInfluxBatch = ()=>{
    return new Promise(resolve=>{
        resolve('done');
    }) 
}

module.exports = influx;