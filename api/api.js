var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var fs = require('fs');
app = express();
port = process.env.PORT || 666;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//INICIAR SITE ----------------
app.get("/", function (req, response) {
    log("Foi o html");
    var caminho = __dirname.replace("\\api", "");
    response.sendFile(path.join(caminho + "/index.html"));
});
app.get("*.*", function (req, response) {
    var tipo = req._parsedUrl.path.split(".");
    tipo = tipo[tipo.length - 1];
    log(tipo);
    if (tipo == "css" || tipo == "js") {
        fs.readFile(".." + req._parsedUrl.path, function (erro, dados) {
            if (erro) {
                response.send(erro);
            } else {
                if (tipo == "css") {
                    response.writeHead(200, { 'Content-Type': 'text/css' });
                }
                response.write(dados);
                response.end();

            }
        });
    } else {
        response.write("não foi não, q pena :/");
        response.end();
    }

});

app.listen(port);

function log(mensagem) {
    console.log(mensagem);
}