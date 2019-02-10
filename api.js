var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var fs = require('fs');
var app = express();
var port = process.env.PORT || 666;
var URLs_livres = ["login"];
var server;
var funcoes = require('./scripts/funcoes');
var log = funcoes.log;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//INICIAR SITE -----------------------------------------------
app.get("/", function (req, resposta) {
    log("Foi o html da home");
    var caminho = __dirname;
    resposta.sendFile(path.join(caminho + "/paginas/index.html"));
});

//LOGIN -------------------------------------------------------
app.post("/login", function (dados, resposta) {
    log("POST DE LOGIN RECEBIDO:");
    //log(dados);
    var cont;
    dados = dados.body;
    var senha = dados.senha + dados.id + dados.senha + dados.id.length + dados.senha.length;
    senha = senha + senha.length;
    var usuario;
    var token;
    var caminho = path.join(__dirname + "/dados/usuarios.json");
    fs.readFile(caminho, function (erro, arquivo) {
        arquivo = JSON.parse(arquivo);
        if (erro) {
            resposta.send("Falha no login: " + erro);
        } else {
            for (cont = 0; cont < arquivo.usuarios.length; cont++) {
                usuario = arquivo.usuarios[cont];
                if (usuario.id == dados.id && senha == usuario.senha) {
                    token = funcoes.gerarToken();
                    funcoes.gravarToken(usuario.id, token);
                    resposta.write(token);
                    resposta.end();
                    return;
                }
            }
            resposta.write("Falha");
            resposta.end();
        }
    });
});
//ACESSAR QUALQUER AREA SOMENTE PARA USUARIOS -------------------------
app.get("/*", function (req, resposta) {

    log("GET DE AUTENTICAÇÃO");
    log(req._parsedUrl.path);
    //log(req.rawHeaders);
    var pagina = req._parsedUrl.path.split("/");
    pagina = pagina[pagina.length - 1];
    if (pagina.indexOf(".") > 0) {
        log("Arquivo solicitado");
        funcoes.enviar_arquivo(req, resposta);
        return;
    } else if (URLs_livres.includes(pagina)) {
        log("Endpoint de acesso livre: " + pagina);
        var caminho = __dirname;
        resposta.sendFile(path.join(caminho + "/paginas/" + pagina + ".html"));
        return;
    } else {
        log("endpoint de acessso restrito: " + pagina);
        log("Verificar Credenciais");
        if (req.headers["shouri-user"] && req.headers["shouri-token"]
            && req.headers["shouri-user"] != "null" && req.headers["shouri-token"] != "null") {
            log("Credenciais existentes, verificar token");
            var user = {
                id: req.headers["shouri-user"],
                token: req.headers["shouri-token"]
            }
            if (funcoes.checar_token(user)) {
                log("sucesso! Redirecionanado para a página!");
                funcoes.localizar_pagina(req, resposta, pagina);
            } else {
                log("Erro na requisição do token, enviando para login");
                funcoes.redirecionar(resposta, "login");
            }

        } else if (req.headers["shouri-user"] == "null" || req.headers["shouri-token"] == "null") {
            log("Erro na requisição do token, enviando para login");
            funcoes.redirecionar(resposta, "login");
        } else {
            log("Sem credenciais, Enviando solicitação");
            funcoes.solicitar_token(resposta, pagina);
        }
    }
});
//ENVIAR ARQUIVOS DE SESSÃO ---------------------------------------
app.post("/sessoes/consultar", function (req, res) {
    log("POST DE CONSULTA");
    log("post de detalhes de sessões recebido");
    var user = req.body;
    log(user);
    if (funcoes.checar_token(user)) {
        funcoes.solicitar_sessoes(res);
    }
});
//ENVIAR ARQUIVOS DE USUÁRIOS -------------------------------------
app.post("/usuarios/consultar", function (req, res) {
    var usuarios;
    log("POST DE CONSULTA", "amarelo");
    log("post de detalhes de usuários recebido", "amarelo");
    var user = req.body;
    log(user);
    if (funcoes.checar_token(user)) {
        funcoes.solicitar_usuarios(user,res);
        
    } else {
        funcoes.redirecionar(res, "login");
    }
});

server = app.listen(port);
server.timeout = 3000;
