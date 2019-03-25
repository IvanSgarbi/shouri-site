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
    var teste = req.query.teste;
    res.write(teste);
    res.end();

    // res.sendFile(path.join(caminho + "/paginas/teste.html"));
});
//LISTAGEM DE TODAS AS POSTAGENS --------------------------------
app.get("/feed", function (req, res) {
    log("FEED REQUISITADO");
    var pagina = req.query.pagina;
    funcoes.feed(res,pagina);
});
//CATEGORIAS -------------------------------------------------
app.get("/categorias", function (req, res) {
    funcoes.listar_categorias(res);
});
//LOGIN ------------------------------------------------------
app.post("/login", function (dados, res) {
    log("POST DE LOGIN RECEBIDO:");
    dados = dados.body;
    log(dados);
    funcoes.logar(dados.id, dados.senha, res);

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
            if (funcoes.checar_token(user)) {
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
    if (funcoes.checar_token(user) && funcoes.checar_admin(user)) {
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
    var admin = funcoes.checar_admin(user);
    log("Permissão lida: " + permissao, "amarelo");
    if (permissao && admin) {
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
    var admin = funcoes.checar_admin(user);
    if (permissao && admin) {
        funcoes.apagar_sessoes(res, user.nome);
    } else {
        res.status(401);
        res.write("ERRO: Usuario não autenticado", "vermelho");
        res.end();
    }
});
//CRIAR POST ----------------------------------------------------
app.post("/post/criar", function (req, res) {
    var post = req.body;
    var user = post.user;
    log(user);
    var permissao = funcoes.checar_token(user);
    log("Permissão lida: " + permissao, "amarelo");
    if (permissao) {
        funcoes.registrar_post(post, res);
    } else {
        res.status(401);
        res.write("ERRO: Usuario não autenticado", "vermelho");
        res.end();
    }
});
//DELETAR POST ----------------------------------------------------
app.post("/post/apagar/:post", function (req, res) {
    var post = req.params.post;
    var user = req.body;
    log(user);
    var permissao = funcoes.checar_token(user);
    log("Permissão lida: " + permissao, "amarelo");
    var admin = funcoes.checar_admin(user);
    if (permissao && admin) {
        log("Apagando a postagem: " + post);
        funcoes.apagar_postagem(post, res);
    } else {
        res.status(401);
        res.write("ERRO: Usuario não autenticado", "vermelho");
        res.end();
    }
});
//EDITAR POST -------------------------------------------------------
app.post("/post/editar", function (req, res) {
    var user = req.body.user;
    log(user);
    var post = req.body.post;
    var permissao = funcoes.checar_token(user);
    log("Permissão lida: " + permissao, "amarelo");
    if (permissao) {
        log("Editando a postagem: " + post.id);
        funcoes.editar_postagem(post, res, user);
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
        var admin = funcoes.checar_admin(user);
        log("Permissão lida: " + permissao, "amarelo");
        if (permissao && admin) {
            log("A categoria " + categoria + " será deletada");
            funcoes.apagar_categoria(categoria, res);
        } else {
            res.status(401);
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
        var admin = funcoes.checar_admin(user);
        log("Permissão lida: " + permissao, "amarelo");
        if (permissao && admin) {
            log("A categoria " + categoria + " será criada");
            funcoes.criar_categoria(categoria, res);
        } else {
            res.status(401);
            res.write("Acesso negado");
            res.end();
        }
    }
);
log("Iniciando servidor na porta: " + port);
funcoes.iniciar(server, port, app);
setInterval(function () {
    funcoes.verificar_sessoes();
}, 60000);