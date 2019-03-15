var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var fs = require('fs');
var app = express();
var port = process.env.PORT || 666;
var URLs_livres = ["login"];
var server;
var funcoes = require('./scripts/funcoes');
var log = require('./scripts/log');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//INICIAR SITE -----------------------------------------------
app.get("/", function (req, res) {
    log("Foi o html da home");
    var caminho = __dirname;
    res.sendFile(path.join(caminho + "/paginas/index.html"));
});
//ENDPOINT DE TESTES -----------------------------------------

app.get("/teste", function (req, res) {
    log("Foi o html de teste", "amarelo");
    var caminho = __dirname;
    res.sendFile(path.join(caminho + "/paginas/teste.html"));
});
//CATEGORIAS --------------------------------------------------
app.get("/categorias", function (req, res) {
    funcoes.listar_categorias(res);
});
//LOGIN -------------------------------------------------------
app.post("/login", function (dados, res) {
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
            res.send("Falha no login: " + erro);
        } else {
            for (cont = 0; cont < arquivo.usuarios.length; cont++) {
                usuario = arquivo.usuarios[cont];
                if (usuario.id == dados.id && senha == usuario.senha) {
                    token = funcoes.gerarToken();
                    funcoes.gravar_token(usuario.id, res, token);
                    return;
                }
            }
            res.write("Falha");
            res.end();
        }
    });
});
//ACESSAR POST --------------------------------------------------------
app.get("/post/:id", function (req, res) {
    log("O post id=" + req.params.id + " foi solicitado", "amarelo");
    funcoes.post_id(req.params.id, res);
});
//LISTAR POSTS POR CATEGORIA ------------------------------------------
app.get("/posts/:categoria", function (req, res) {
    log("A categoria " + req.params.categoria + " foi solicitada", "amarelo");
    funcoes.posts_cat(req.params.categoria, res);
});
//ACESSAR QUALQUER AREA SOMENTE PARA USUARIOS -------------------------
app.get("/*", function (req, res) {
    log("GET DE AUTENTICAÇÃO", "amarelo");
    log(req._parsedUrl.path, "azul");
    //log(req.rawHeaders);
    var pagina = req._parsedUrl.path.split("/");
    pagina = pagina[pagina.length - 1];
    if (pagina.includes(".")) {
        log("Arquivo solicitado", "verde");
        funcoes.enviar_arquivo(req, res);
        return;
    } else if (URLs_livres.includes(pagina)) {
        log("Endpoint de acesso livre: " + pagina, "verde");
        var caminho = __dirname;
        res.sendFile(path.join(caminho + "/paginas/" + pagina + ".html"));
        return;
    } else {
        log("endpoint de acessso restrito: " + pagina, "amarelo");
        log("Verificar Credenciais", "amarelo");
        if (req.headers["shouri-user"] && req.headers["shouri-token"]
            && req.headers["shouri-user"] != "null" && req.headers["shouri-token"] != "null") {
            log("Credenciais existentes, verificar token", "verde");
            var user = {
                id: req.headers["shouri-user"],
                token: req.headers["shouri-token"]
            }
            if (funcoes.checar_token(user) == "permitido") {
                log("sucesso! Redirecionanado para a página!", "verde");
                funcoes.localizar_pagina(req, res, pagina);
            } else {
                log("Erro na requisição do token, enviando para login", "vermelho");
                funcoes.redirecionar(res, "login");
            }
        } else if (req.headers["shouri-user"] == "null" || req.headers["shouri-token"] == "null") {
            log("Erro na requisição do token, enviando para login", "vermelho");
            funcoes.redirecionar(res, "login");
        } else {
            log("Sem credenciais, Enviando solicitação", "vermelho");
            funcoes.solicitar_token(res, pagina);
        }
    }
});
//ENVIAR ARQUIVOS DE SESSÃO ---------------------------------------
app.post("/sessoes/consultar", function (req, res) {
    log("POST DE CONSULTA", "amarelo");
    log("post de detalhes de sessões recebido", "amarelo");
    var user = req.body;
    log(user);
    if (funcoes.checar_token(user) == "permitido") {
        funcoes.solicitar_sessoes(res);
    } else {
        res.status(401);
        res.write("ERRO: Usuario não autenticado", "vermelho");
        res.end();
    }
});
//ENVIAR ARQUIVOS DE USUÁRIOS -------------------------------------
app.post("/usuarios/consultar", function (req, res) {
    log("POST DE CONSULTA", "amarelo");
    log("post de detalhes de usuários recebido", "amarelo");
    var user = req.body;
    log(JSON.stringify(user), "azul");
    var permissao = funcoes.checar_token(user);
    log("Permissão lida: " + permissao, "amarelo");
    if (permissao == "permitido") {
        funcoes.solicitar_usuarios(user, res);
    } else {
        res.status(401);
        res.write("ERRO: Usuario não autenticado", "vermelho");
        res.end();
    }
});
//MATAR SESSÃO ------------------------------------------------------
app.post("/sessoes/apagar", function (req, res) {
    log("POST DE MORTE DE SESSÃO", "amarelo");
    log("post de morte de sessões recebido", "amarelo");
    var user = req.body;
    log(user);
    var permissao = funcoes.checar_token(user);
    log("Permissão lida: " + permissao, "amarelo");
    if (permissao == "permitido") {
        funcoes.apagar_sessoes(res, user.nome);
    } else {
        res.status(401);
        res.write("ERRO: Usuario não autenticado", "vermelho");
        res.end();
    }
});
//ADICIONAR POST ----------------------------------------------------
app.post("/post/criar", function (req, res) {
    var post = req.body;
    var user = post.user;
    log(user);
    var permissao = funcoes.checar_token(user);
    log("Permissão lida: " + permissao, "amarelo");
    if (permissao == "permitido") {
        funcoes.registrar_post(post, res);
    } else {
        res.status(401);
        res.write("ERRO: Usuario não autenticado", "vermelho");
        res.end();
    }
});
//APAGAR CATEGORIA --------------------------------------------------
app.post("/categoria/apagar/:cat",
    function (req, res) {
        var categoria = req.params.cat;
        var user = req.body;
        log(user);
        var permissao = funcoes.checar_token(user);
        log("Permissão lida: " + permissao, "amarelo");
        if (permissao == "permitido") {
            log("A categoria " + categoria + " será deletada");
            funcoes.apagar_categoria(categoria,res);
        } else {
            res.status = 401;
            res.write("Acesso negado");
            res.end();
        }
    }
);
//CRIAR CATEGORIA --------------------------------------------------
app.post("/categoria/criar/:cat",
    function (req, res) {
        var categoria = req.params.cat;
        var user = req.body;
        log(user);
        var permissao = funcoes.checar_token(user);
        log("Permissão lida: " + permissao, "amarelo");
        if (permissao == "permitido") {
            log("A categoria " + categoria + " será criada");
            funcoes.criar_categoria(categoria, res);
        } else {
            res.status = 401;
            res.write("Acesso negado");
            res.end();
        }
    }
);
log("Iniciando servidor na porta: " + port);
funcoes.iniciar(server, port, app);
setInterval(function(){
    funcoes.verificar_sessoes();
},60000);