
var cores = require('./cores');
module.exports = function (mensagem, cor) {
    if (cor && cores[cor]) {
        console.log(cores[cor] + " " + mensagem + " " + cores.resetar);
    } else {
        console.log(mensagem);
    }
}