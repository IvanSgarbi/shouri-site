'use strict';
var path = require('path');
var fs = require('fs');
var cores = require('./cores');
var diretorio = require('../diretorio');
module.exports = {
    //LOG ----------------------------------------------------------
    log: function (mensagem, cor) {
        if (cor && cores[cor]) {
            console.log(cores[cor] + " " + mensagem + " " + cores.resetar);
        } else {
            console.log(mensagem);
        }

    },
    //ENVIAR ARQUIVOS NECESSÁRIOS DA PÁGINA----------------------------
    enviar_arquivo: function (req, resposta) {
        var log = this.log;
        var nome_arquivo = req._parsedUrl.path.split("/");
        nome_arquivo = nome_arquivo[nome_arquivo.length - 1];
        var tipo = req._parsedUrl.path.split(".");
        tipo = tipo[tipo.length - 1];
        var caminho = path.join(diretorio + req._parsedUrl.path);
        var permitidos = ["css", "js", "ico", "png"];
        var bloqueados = ["api.js", "funcoes.js","diretorio.js"];
        log("enviando um arquivo tipo: " + tipo, "amarelo");
        if (permitidos.includes(tipo) && !bloqueados.includes(nome_arquivo)) {
            log("caminho do arquivo: " + caminho, "amarelo");
            fs.readFile(caminho, function (erro, dados) {
                if (erro) {
                    resposta.send(erro);
                    resposta.end();
                    log("ERRO: Arquivo não enviado", "vermelho");
                } else {
                    if (tipo == "css") {
                        resposta.writeHead(200, { 'Content-Type': 'text/css' });
                    }
                    resposta.write(dados);
                    resposta.end();
                    log("Arquivo enviado", "azul_claro");
                }
            });
        } else {
            log("Erro ao enviar arquivo: Tipo de arquivo inválido! " + tipo);
            resposta.write("Erro ao enviar arquivo: Tipo de arquivo inválido! " + tipo);
            resposta.end();
        }

    },
    //CHECAR TOKEN-----------------------------------------------
    checar_token: function (user) {
        var log = this.log;
        log("lendo dados de forma sincrona","amarelo");
        var arquivo = fs.readFileSync(path.join(diretorio + "/dados/sessoes.json"));
        arquivo = JSON.parse(arquivo);
        if (arquivo.sessoes[user.id]) {
            if (arquivo.sessoes[user.id].token == user.token) {
                log("token encontrado! Autorizando acesso a pagina","azul");
                return true;
            } else {
                log("usuario encontrado, porém o token não é válido","vermelho");
                return false;
            }
        } else {
            log("Usuário não encontrado no arquivo de sessoes","vermelho");
            return false;
        }
    },
    //ENVIAR DADOS DE USUARIOS ADMIN-------------------------------------------
    solicitar_usuarios: function (usuario,res) {
        var log = this.log;
        log("Cheacando ADMIN do usuário " + usuario.id);
        var cont;
        var admin = false;
        var caminho = path.join(diretorio + "/dados/usuarios.json");
        fs.readFile(caminho, function (erro, arquivo) {
            if (erro) {
                log(erro, "vermelho");
            }
            arquivo = JSON.parse(arquivo);
            for (cont = 0; cont < arquivo.usuarios.length; cont++) {
                delete arquivo.usuarios[cont].senha;
                if (arquivo.usuarios[cont].id == usuario.id && arquivo.usuarios[cont].admin) {
                    log("O usuário " + usuario.id + " é ADMIN!", "verde");
                    admin = true;
                }
            }
            if (admin) {
                log("Enviando lista de usuários!", "azul");
                log(arquivo.usuarios,"vermelho");
                res.write(JSON.stringify(arquivo.usuarios));
                res.end();
            } else {
                log("O usuário " + usuario.id + " não é ADMIN!", "vermelho");
                res.status = 401;
                res.write("Não autorizado");
                res.end();
            }
        })
    },
    //SOLICITAR TOKEN-----------------------------------------
    solicitar_token: function (resposta, pagina) {
        var log = this.log;
        var requisitar_token = "";
        fs.readFile(path.join(diretorio + "/paginas/requisitar_token.html"), function (erro, dados) {
            if (erro) {
                log(erro, "vermelho");
                resposta.writeHead(666, { 'Content-Type': 'text/html' });
                resposta.write("ERRO");
                resposta.end();
            } else {
                requisitar_token = dados.toString();
                requisitar_token = requisitar_token.replace("{pagina}", pagina);
                resposta.writeHead(200, { 'Content-Type': 'text/html' });
                resposta.write(requisitar_token);
                resposta.end();
            }
        });
    },
    //REDIRECIONAR POR URL----------------------------------------------
    redirecionar: function (resposta, pagina) {
        var log = this.log;
        var redirecionar = "";
        fs.readFile(path.join(diretorio + "/paginas/redirecionar.html"), function (erro, dados) {
            if (erro) {
                log(erro, "vermelho");
                resposta.writeHead(666, { 'Content-Type': 'text/html' });
                resposta.write("ERRO");
                resposta.end();
            } else {
                redirecionar = dados.toString();
                redirecionar = redirecionar.replace("{pagina}", pagina);
                resposta.writeHead(200, { 'Content-Type': 'text/html' });
                resposta.write(redirecionar);
                resposta.end();
            }
        });
    },
    //VERIFICAR SE PAGINA EXISTE E ENVIAR A PAGINA OU ERRO 404 ------------------------------
    localizar_pagina: function (req, resposta, pagina) {
        var log = this.log;
        var caminho = path.join(diretorio + req._parsedUrl.path);
        log("Localizar página");
        resposta.setHeader('Content-Type', 'text/html');
        fs.readFile(path.join(diretorio + "/dados/paginas.json"), function (erro, arquivo) {
            if (erro) {
                log("Arquivo de páginas não encontrado");
                resposta.sendFile(path.join(diretorio + "/paginas/404.html"));
            } else {
                arquivo = JSON.parse(arquivo);
                if (arquivo.paginas.includes(pagina)) {
                    log("Pagina encontrada!");
                    resposta.sendFile(path.join(diretorio + "/paginas/" + pagina + ".html"));
                } else {
                    log("Pagina não encontrada!");
                    resposta.sendFile(path.join(diretorio + "/paginas/404.html"));
                }
            }
        });

    },


    gerarToken: function () {
        var log = this.log;
        var token = new Date().getMilliseconds() ** 5;
        return token.toString();
    },

    //SALVAR TOKEN ----------------------------------------------------
    gravarToken: function (id, token) {
        var log = this.log;
        var agora = new Date().getTime();
        fs.readFile(path.join(diretorio + "/dados/sessoes.json"), function (erro, arquivo) {
            arquivo = JSON.parse(arquivo);
            if (erro) {
                return "Falha na leitura do arquivo de sessoes: " + erro;
            } else {
                log(arquivo);
                arquivo.sessoes[id] = {
                    token: token,
                    vida: agora + 120000000
                }
                fs.writeFile(path.join(diretorio + "/dados/sessoes.json"), JSON.stringify(arquivo), function (erro) {
                    if (erro) {
                        log("Erro ao Gravar arquivo");
                    } else {
                        log("Sucesso ao gravar arquivo");
                    }
                });
            }
        });
    },

    solicitar_sessoes: function (resposta) {
        var log = this.log;
        var cont;
        log("")
        fs.readFile(path.join(diretorio + "/dados/sessoes.json"), function (erro, arquivo) {
            if (erro) {
                resposta.write(erro);
            } else {
                resposta.write(arquivo);
                var arquivo = JSON.parse(arquivo);
            }
            resposta.end();
        });
    }

}