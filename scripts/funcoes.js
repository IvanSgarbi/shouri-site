'use strict';
var path = require('path');
var fs = require('fs');
var log = require("./log");
var diretorio = require('../diretorio');
module.exports = {
    config: null,
    sessoes: null,
    mapeamento_categorias: null,
    mapeamento_ids: null,
    lista_categorias: null,
    //INICIAR SERVIDOR -------------------------------------------
    iniciar: function (server, port, app) {
        var funcoes = this;
        function iniciar_configuracoes() {
            fs.readFile(
                path.join(diretorio + "/dados/config.json"),
                function (erro, configs) {
                    if (erro) {
                        log("Erro ao ler arquivo de configurações: " + erro, "vermelho");
                        res.status = 500;
                        res.write("Erro interno do servidor");
                        res.end();
                    } else {
                        configs = JSON.parse(configs);
                        funcoes.config = configs;
                        log("Sucesso ao inicializar configs!", "verde");
                        log(JSON.stringify(funcoes.config), "azul");
                        iniciar_sessoes();
                    }
                }
            );
        }
        function iniciar_sessoes() {
            log("Iniciando sessões...");
            fs.readFile(path.join(diretorio + "/dados/sessoes.json"), function (erro, arquivo) {
                if (erro) {
                    log("Erro ao ler arquivo de sessões: " + erro, "vermelho");
                    res.status = 500;
                    res.write("Erro interno do servidor");
                    res.end();
                } else {
                    arquivo = JSON.parse(arquivo);
                    funcoes.sessoes = arquivo;
                    log("Sucesso ao inicializar sessoes!", "verde");
                    log(JSON.stringify(funcoes.sessoes), "azul");
                    iniciar_mapeamento_categorias();
                }
            });
        }
        function iniciar_mapeamento_categorias() {
            log("Iniciando categorias...");
            fs.readFile(
                path.join(diretorio + "/dados/posts/mapa-categorias.json"),
                function (erro, mapa) {
                    if (erro) {
                        log("Erro ao ler arquivo de mapeamento de posts", "vermelho");
                        return;
                    } else {
                        mapa = JSON.parse(mapa);
                        funcoes.categorias = mapa;
                        iniciar_mapeamento_ids();
                    }
                }
            );
        }
        function iniciar_mapeamento_ids() {
            log("Iniciando IDs...");
            fs.readFile(
                path.join(diretorio + "/dados/posts/mapa-id.json"),
                function (erro, ids) {
                    if (erro) {
                        log("Erro ao ler arquivo de mapeamento de posts", "vermelho");
                        return;
                    } else {
                        ids = JSON.parse(ids);
                        funcoes.ids = ids;
                        server = app.listen(port);
                        server.timeout = 3000;
                        log(funcoes.ids);
                        log("INICIANDO SERVIDOR...........", "verde");
                    }
                }
            );
        }
        iniciar_configuracoes();
    },
    //ATUALIZAR SESSOES -----------------------------------------------
    atualizar_sessoes: function () {
        log("atualizando sessoes...")
        var funcoes = this;
        fs.readFile(path.join(diretorio + "/dados/sessoes.json"), function (erro, arquivo) {
            if (erro) {
                log("Erro ao ler arquivo de sessões: " + erro, "vermelho");
                res.status = 500;
                res.write("Erro interno do servidor");
                res.end();
            } else {
                arquivo = JSON.parse(arquivo);
                funcoes.sessoes = arquivo;
                log("Sucesso ao atualizar sessoes!", "verde");
            }
        });
    },
    //VERIFICAR SESSÕES -----------------------------------------------
    verificar_sessoes: function () {
        var agora = new Date().getTime();
        var funcoes = this;
        var user;
        var sessao_deletada = false;
        log("Verificando sessões");
        for (user in funcoes.sessoes) {
            if (funcoes.sessoes[user].vida < agora) {
                log("Sessão do usuário " + user + "expirou e será removida");
                delete funcoes.sessoes[user];
                sessao_deletada = true;
            }
        }
        if (sessao_deletada) {
            funcoes.gravar_sessoes();
        }
    },
    //GRAVAR SESSOES --------------------------------------------------
    gravar_sessoes: function () {
        var funcoes = this;
        fs.writeFile(path.join(diretorio + "/dados/sessoes.json"), JSON.stringify(funcoes.sessoes), function (erro) {
            if (erro) {
                log("Erro ao Gravar arquivo de sessões", "vermelho");
            } else {
                log("Sucesso ao gravar arquivo de sessões", "verde");
            }
        });
    },
    //SALVAR CONFIGURAÇÕES --------------------------------------------
    salvar_config: function () {
        var funcoes = this;
        fs.writeFile(
            path.join(diretorio + "/dados/config.json"),
            JSON.stringify(funcoes.config),
            function (erro) {
                if (erro) {
                    log("erro na gravação do arquivo de configurações!", "vermelho");
                    log(erro);
                } else {
                    log("Sucesso na gravação das configurações, atualizando...", "verde");
                    funcoes.atualizar_config();
                }
            }
        );
    },
    //ATUALIZAR CONFIGURAÇÕES -----------------------------------------
    atualizar_config: function () {
        var funcoes = this;
        fs.readFile(path.join(diretorio + "/dados/config.json"), function (erro, configs) {
            if (erro) {
                log("Erro ao ler arquivo: " + erro, "vermelho");
            } else {
                configs = JSON.parse(configs);
                funcoes.config = configs;
                log("Sucesso ao atualizar configs!", "verde");
                log(funcoes.config);
            }
        });
    },
    //ATUALIZAR MAPEAMENTO DE ID --------------------------------------
    atualizar_mapeamento_id: function () {
        var funcoes = this;
        log("Atualizando IDs...");
        fs.readFile(
            path.join(diretorio + "/dados/posts/mapa-id.json"),
            function (erro, ids) {
                if (erro) {
                    log("Erro ao ler arquivo de mapeamento de posts", "vermelho");
                    return;
                } else {
                    ids = JSON.parse(ids);
                    funcoes.ids = ids;
                    log("IDs Atualizados", "verde");
                }
            }
        );
    },
    //ATUALIZAR MAPEAMENTO DE CATEGORIAS ------------------------------
    atualizar_mapeamento_categorias: function () {
        var funcoes = this;
        log("Iniciando categorias...");
        fs.readFile(
            path.join(diretorio + "/dados/posts/mapa-categorias.json"),
            function (erro, mapa) {
                if (erro) {
                    log("Erro ao ler arquivo de mapeamento de posts", "vermelho");
                    return;
                } else {
                    mapa = JSON.parse(mapa);
                    funcoes.categorias = mapa;
                    log("Categorias atualizadas com sucesso!", "verde");
                }
            }
        );
    },
    //SALVAR CATEGORIAS -----------------------------------------------
    salvar_mapeamento_categorias: function () {
        var funcoes = this;
        fs.writeFile(
            path.join(diretorio + "/dados/posts/mapa-categorias.json"),
            JSON.stringify(funcoes.categorias),
            function (erro) {
                if (erro) {
                    log("erro na gravação do arquivo de CATEGORIAS!", "vermelho");
                    log(erro);
                } else {
                    log("Sucesso na gravação das CATEGORIAS, atualizando...", "verde");
                }
            }
        );
    },
    //SALVAR IDS -----------------------------------------------
    salvar_mapeamento_ids: function () {
        var funcoes = this;
        fs.writeFile(
            path.join(diretorio + "/dados/posts/mapa-id.json"),
            JSON.stringify(funcoes.ids),
            function (erro) {
                if (erro) {
                    log("erro na gravação do arquivo de IDS!", "vermelho");
                    log(erro);
                } else {
                    log("Sucesso na gravação dos IDS, atualizando...", "verde");
                }
            }
        );
    },
    //ENVIAR ARQUIVOS NECESSÁRIOS DA PÁGINA ---------------------------
    enviar_arquivo: function (req, res) {
        var funcoes = this;
        var nome_arquivo = req._parsedUrl.path.split("/");
        nome_arquivo = nome_arquivo[nome_arquivo.length - 1];
        var tipo = req._parsedUrl.path.split(".");
        tipo = tipo[tipo.length - 1];
        var caminho = path.join(diretorio + this.limpar_caminho(req.originalUrl));
        var permitidos = funcoes.config.permissoes_arquivos.permitidos;
        var bloqueados = funcoes.config.permissoes_arquivos.bloqueados;
        log("enviando um arquivo tipo: " + tipo);
        if (permitidos.includes(tipo) && !bloqueados.includes(nome_arquivo)) {
            log("caminho do arquivo: " + caminho);
            fs.readFile(caminho, function (erro, dados) {
                if (erro) {
                    res.send(erro);
                    res.end();
                    log("ERRO: Arquivo não enviado", "vermelho");
                } else {
                    if (tipo == "css") {
                        res.writeHead(200, { 'Content-Type': 'text/css' });
                    }
                    res.write(dados);
                    res.end();
                    log("Arquivo enviado", "verde");
                }
            });
        } else {
            log("Erro ao enviar arquivo: Tipo de arquivo inválido! " + tipo);
            res.write("Erro ao enviar arquivo: Tipo de arquivo inválido! " + tipo);
            res.end();
        }
    },
    //CHECAR TOKEN ----------------------------------------------------
    checar_token: function (user) {
        var funcoes = this;
        log("lendo dados da variável de sessoes");
        if (funcoes.sessoes[user.id]) {
            if (funcoes.sessoes[user.id].token == user.token) {
                log("token encontrado! Autorizando acesso", "verde");
                log("Renovando sessão");
                var agora = new Date().getTime();
                funcoes.sessoes[user.id].vida = agora + 120000000;
                return true;
            } else {
                log("usuario encontrado, porém o token não é válido", "vermelho");
                return false;
            }
        } else {
            log("Usuário não encontrado no arquivo de sessoes", "vermelho");
            return false;
        }
    },
    //CHECAR ADMIN ----------------------------------------------------
    checar_admin: function (user) {
        var funcoes = this;
        log("lendo dados da variável de sessoes");
        if (funcoes.sessoes[user.id]) {
            if (funcoes.sessoes[user.id].token == user.token && funcoes.sessoes[user.id].admin == true) {
                log("Admin Confirmado! Autorizando acesso", "verde");
                return true;
            } else {
                log("Falha na autenticação de ADMIN", "vermelho");
                return false;
            }
        } else {
            log("Usuário não encontrado no arquivo de sessoes", "vermelho");
            return false;
        }
    },
    //ENVIAR DADOS DE USUARIOS ADMIN ----------------------------------
    solicitar_usuarios: function (usuario, res) {
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
                log("Enviando lista de usuários!", "verde");
                log(JSON.stringify(arquivo.usuarios), "azul");
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
    //SOLICITAR TOKEN--------------------------------------------------
    solicitar_token: function (res, pagina) {
        var requisitar_token = "";
        fs.readFile(path.join(diretorio + "/paginas/requisitar_token.html"), function (erro, dados) {
            if (erro) {
                log(erro, "vermelho");
                res.writeHead(666, { 'Content-Type': 'text/html' });
                res.write("ERRO");
                res.end();
            } else {
                requisitar_token = dados.toString();
                requisitar_token = requisitar_token.replace("{pagina}", pagina);
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(requisitar_token);
                res.end();
            }
        });
    },
    //REDIRECIONAR POR URL---------------------------------------------
    redirecionar: function (res, pagina) {
        log("Redirecionando para " + pagina);
        res.redirect("/" + pagina);
    },
    //VERIFICAR SE PAGINA EXISTE E ENVIAR A PAGINA OU ERRO 404 --------
    localizar_pagina: function (req, res, pagina) {
        log("Localizar página");
        res.setHeader('Content-Type', 'text/html');
        fs.readFile(path.join(diretorio + "/dados/paginas.json"), function (erro, arquivo) {
            if (erro) {
                log("Arquivo de páginas não encontrado");
                res.sendFile(path.join(diretorio + "/paginas/404.html"));
            } else {
                arquivo = JSON.parse(arquivo);
                if (arquivo.paginas.includes(pagina)) {
                    log("Pagina encontrada!");
                    res.sendFile(path.join(diretorio + "/paginas/" + pagina + ".html"));
                } else {
                    log("Pagina não encontrada!");
                    res.sendFile(path.join(diretorio + "/paginas/404.html"));
                }
            }
        });
    },
    //GERAR TOKEN -----------------------------------------------------
    gerarToken: function () {
        var random;
        var cont;
        random = Math.floor(Math.random() * 1000 + 1);
        var token = random;
        for (cont = 0; cont < 6; cont++) {
            random = Math.floor(Math.random() * 2000 + 1);
            console.log(random);
            token = token * random;
        }
        return token.toString();
    },
    //SALVAR TOKEN ----------------------------------------------------
    gravar_token: function (id, res, token, admin) {
        log("gravando token");
        var funcoes = this;
        var agora = new Date().getTime();
        funcoes.sessoes[id] = {
            token: token,
            admin: admin,
            vida: agora + 120000000
        }
        fs.writeFile(path.join(diretorio + "/dados/sessoes.json"), JSON.stringify(funcoes.sessoes), function (erro) {
            if (erro) {
                log("Erro ao Gravar arquivo de sessões", "vermelho");
            } else {
                log("Sucesso ao gravar arquivo de sessões", "verde");
                res.write(token);
                res.end();
            }
        });
    },
    //LOGIN ----------------------------------------------------------
    logar: function (id, senha, res) {
        var funcoes = this;
        senha = funcoes.senha(senha);
        var cont;
        var usuario;
        var token;
        var caminho = path.join(diretorio + "/dados/usuarios.json");
        fs.readFile(caminho, function (erro, arquivo) {
            arquivo = JSON.parse(arquivo);
            if (erro) {
                res.send("Falha no login: " + erro);
            } else {
                for (cont = 0; cont < arquivo.usuarios.length; cont++) {
                    usuario = arquivo.usuarios[cont];
                    if (usuario.id == id && senha == usuario.senha) {
                        token = funcoes.gerarToken();
                        funcoes.gravar_token(id, res, token, usuario.admin);
                        return;
                    }
                }
                res.write("Falha");
                res.end();
            }
        });
    },
    //SENHA -----------------------------------------------------------
    senha: function (senha) {
        var num = 1;
        var nova_senha = 0;
        var unicode;
        for (var cont = 0; cont < senha.length; cont++) {
            unicode = senha.charCodeAt(cont)
            num *= (unicode * 2) + (10 + unicode * 3);
            num += cont;
        }
        num = num + "shouri";
        for (cont = 0; cont < num.length; cont++) {
            unicode = num.charCodeAt(cont);
            nova_senha += cont;
            nova_senha *= (unicode * 3);
            log(nova_senha);
            nova_senha = 1 + nova_senha;
            log(nova_senha);
        }
        return nova_senha;
    },
    //ENVIAR AS SESSÕES -----------------------------------------------
    solicitar_sessoes: function (res) {
        var funcoes = this;
        log("Enviando sessoes");
        res.write(JSON.stringify(funcoes.sessoes));
        res.end();
    },
    //APAGAR SESSAO ---------------------------------------------------
    apagar_sessoes: function (res, nome) {
        var mensagem;
        var funcoes = this;
        var arquivo;
        log("Apagando sessão", "verde");
        if (funcoes.sessoes[nome]) {
            delete funcoes.sessoes[nome];
            arquivo = JSON.stringify(funcoes.sessoes);
            fs.writeFile(path.join(diretorio + "/dados/sessoes.json"), arquivo, function (erro) {
                if (erro) {
                    mensagem = "ERRO: Falha na gravação do arquivo de sessoes";
                    log(mensagem, "vermelho");
                    res.write(mensagem);
                    res.end();
                } else {
                    log("Sucesso ao gravar arquivo", "verde");
                    res.write(arquivo);
                    res.end();
                }
            });
        } else {
            log("Sessão não encontrada", "verde");
            res.write(arquivo);
            res.end();
        }
    },
    //LIMPAR SE O CAMINHO FOR COMPOSTO --------------------------------
    limpar_caminho: function (caminho) {
        var cont;
        var barras = [];
        var caminho_inicio;
        for (cont = 0; cont < caminho.length; cont++) {
            if (caminho.charAt(cont) == "/") {
                barras.push(cont);
            }
        }
        if (barras.length > 2) {
            caminho_inicio = caminho.substring(0, barras[barras.length - 2]);
            caminho = caminho.replace(caminho_inicio, "");
        }
        return caminho;
    },
    //LOCALIZAR POST POR ID -------------------------------------------
    post_id: function (id, res) {
        var funcoes = this;
        log("Iniciando envio de post");
        var post;
        var mapa = funcoes.ids;
        if (mapa[id]) {
            log("Arquivo do post encontrado: " + mapa[id], "verde");
            fs.readFile(
                path.join(diretorio + "/dados/posts/" + mapa[id]),
                function (erro, posts) {
                    if (erro) {
                        log("Erro ao ler arquivo do post", "vermelho");
                        res.status = 500;
                        res.write("Erro ao ler arquivo do Post");
                        res.end();
                        return;
                    }
                    log("Sucesso na leitura do arquivo do Post", "verde");
                    posts = JSON.parse(posts);
                    post = posts[id];
                    funcoes.enviar_post(res, post)
                }
            );
        } else {
            log("Post não encontrado", "vermelho");
            res.sendFile(path.join(diretorio + "/paginas/404.html"));
            return;
        }
    },
    //LISTAR AS CATEGORIAS ---------------------------------------------------------------------
    listar_categorias: function (res) {
        var funcoes = this;
        var categorias = Object.keys(funcoes.categorias);
        res.send(categorias);
        res.end();
    },
    //LOCALIZAR POSTS DE CATEGORIA -------------------------------------------------------------
    posts_cat: function (cat, res) {
        var funcoes = this;
        var arquivos = [];
        var posts = {};
        var cont;
        if (cat) {
            log("Encontrando a categoria: " + cat);
            var mapa = funcoes.categorias
            if (mapa[cat]) {
                log("categoria encontrada no mapa", "verde");
                for (cont = 0; cont < mapa[cat].length; cont++) {
                    arquivos.push(mapa[cat][cont].arquivo);
                    posts[mapa[cat][cont].arquivo] = mapa[cat][cont].id;
                }
                funcoes.criar_lista_posts(arquivos, posts, res);
            } else {
                log("Categoria não encontrada", "vermelho");
                res.sendFile(path.join(diretorio + "/paginas/404.html"));
                return;
            }
        } else {
            log("Categoria não especificada", "vermelho");
            res.sendFile(path.join(diretorio + "/paginas/404.html"));
            return;
        }
    },
    //MONTAR LISTA DE POSTS -----------------------------------------------------------------
    criar_lista_posts: function (arquivos, posts, res) {
        var funcoes = this;
        var cont_post;
        var arquivo_atual;
        var lista_posts = [];
        log("Lendo arquivos para montar a lista.");
        log("Arquivos: ");
        log(arquivos);
        log("posts: ");
        log(posts);
        loop_ler_arquivos(0, arquivos.length);
        function loop_ler_arquivos(cont, limite) {
            arquivo_atual = arquivos[cont];
            fs.readFile(path.join(diretorio + "/dados/posts/" + arquivo_atual),
                function (erro, arquivo_post) {
                    if (erro) {
                        log("Erro ao ler arquivo dos posts", "vermelho");
                        res.status = 500;
                        res.write("Erro ao ler arquivo do Post");
                        res.end();
                        return;
                    }
                    log("lendo o arquivo: /dados/posts/" + arquivo_atual, "verde");
                    arquivo_post = JSON.parse(arquivo_post);
                    for (cont_post = 0; cont_post < posts[arquivo_atual].length; cont_post++) {
                        log("Procurando o ID: " + posts[arquivo_atual][cont_post], "verde");
                        if (arquivo_post[posts[arquivo_atual][cont_post]]) {
                            lista_posts.push(arquivo_post[posts[arquivo_atual][cont_post]]);
                            log("POST : " + posts[arquivo_atual][cont_post] + " encontrado e adicionado a lista!", "verde");
                        }
                    }
                    if (cont < limite - 1) {
                        cont++;
                        loop_ler_arquivos(cont, limite);
                    } else {
                        log("Enviando lista de posts: ", "verde");
                        funcoes.ordenar_posts(lista_posts, res);
                    }
                }
            );
        }
    },
    //ORDENAR POSTS -------------------------------------------------------------------------
    ordenar_posts: function (lista_posts, res) {
        var funcoes = this;
        lista_posts.sort(function (a, b) {
            if (a.data < b.data) {
                return -1;
            } else if (a.data > b.data) {
                return 1;
            } else {
                return 0;
            }
        });
        funcoes.enviar_pagina_posts(lista_posts, res);
    },
    //ENVIAR PÁGINA DE POSTS -----------------------------------------------------------------
    enviar_pagina_posts: function (lista_posts, res) {
        lista_posts = JSON.stringify({ posts: lista_posts });
        fs.readFile(
            path.join(diretorio + "/paginas/posts.html"),
            function (erro, pagina) {
                if (erro) {
                    log("Erro ao ler a pagina de posts", "vermelho");
                    res.status(500);
                    res.write("Erro interno do servidor");
                    res.end();
                    return;
                } else {
                    log("Enviando página de post", "verde");
                    pagina = pagina.toString()
                        .replace("lista_postagens", lista_posts);
                    res.send(pagina);
                    res.end();
                }
            });
    },
    //ENVIAR PÁGINA DE POST -----------------------------------------------------------------
    enviar_post: function (res, post) {
        log("Montando pagina de post");
        fs.readFile(
            path.join(diretorio + "/paginas/post.html"),
            function (erro, pagina) {
                if (erro) {
                    log("Erro ao ler a pagina de post", "vermelho");
                    res.status(500);
                    res.write("Erro interno do servidor");
                    res.end();
                    return;
                }
                log("Enviando página de post", "verde");
                pagina = pagina.toString()
                    .replace("{titulo}", post.titulo)
                    .replace("{autor}", post.autor)
                    .replace("{texto}", post.texto)
                    .replace("{data}", post.data);
                res.send(pagina);
                res.end();
            }
        );
    },
    //REGISTRAR POSTAGEM --------------------------------------------------------------------
    registrar_post: function (post, res) {
        log("Verificando em qual arquivo gravar o post");
        var funcoes = this;
        var config = this.config;
        log(post);
        //verificando se o post já existe
        if (!post.id || funcoes.ids[post.id]) {
            log("Post de ID " + post.id + " já existe. Criação cancelada!");
            res.status(400);
            res.write("Bad request");
            res.end();
        } else {
            var arquivo_gravar;
            if (config.posts.posts_por_arquivo > config.posts.posts_ultimo_arquivo) {
                arquivo_gravar = config.posts.ultimo_arquivo;
                log("O post será gravado no arquivo existente: " + arquivo_gravar + ".json");
                funcoes.gravar_post_arquivo_existe(arquivo_gravar, post, res);
            } else {
                config.posts.ultimo_arquivo++
                arquivo_gravar = config.posts.ultimo_arquivo;
                log("O post será gravado em um novo arquivo: " + arquivo_gravar + ".json");
                funcoes.gravar_post_novo_arquivo(arquivo_gravar, post, res);
            }
        }
    },
    //GRAVAR EM ARQUIVO EXISTENTE ----------------------------------------------------------
    gravar_post_arquivo_existe: function (arquivo, post, res) {
        var funcoes = this;
        funcoes.config.posts.ultimo_arquivo = arquivo;
        funcoes.config.posts.posts_ultimo_arquivo++;
        log("iniciando leitura do arquivo de postagens");
        fs.readFile(
            path.join(diretorio + "/dados/posts/" + arquivo + ".json"),
            function (erro, posts) {
                if (erro) {
                    log("Erro ao ler arquivo de postagens", "vermelho");
                    res.status(500);
                    res.write("Erro interno do servidor");
                    res.end();
                    return;
                } else {
                    log("Sucesso na leitura do arquivo de postagens", "verde");
                    posts = JSON.parse(posts);
                    posts[post.id] = {
                        id: post.id,
                        categorias: post.categorias,
                        texto: post.texto,
                        autor: post.user.id,
                        titulo: post.titulo,
                        data: new Date().toLocaleString()
                    }
                    gravar_post(posts);
                }
            }
        );
        function gravar_post(posts) {
            log("iniciando gravação do post no arquivo de postagens");
            fs.writeFile(
                path.join(diretorio + "/dados/posts/" + arquivo + ".json"),
                JSON.stringify(posts),
                function (erro) {
                    if (erro) {
                        log("Erro ao gravar arquivo de postagens", "vermelho");
                        res.status(500);
                        res.write("Erro interno do servidor");
                        res.end();
                        return;
                    } else {
                        log("Sucesso na gravação do post no arquivo de postagens", "verde");
                        funcoes.mapear_postagem(post.id, arquivo, post.categorias, res);
                    }
                }
            );
        }
    },
    gravar_post_novo_arquivo: function (arquivo, post, res) {
        var funcoes = this;
        var posts = {}
        funcoes.config.posts.posts_ultimo_arquivo = 1;
        funcoes.config.posts.ultimo_arquivo = arquivo;
        posts[post.id] = {
            id: post.id,
            categorias: post.categorias,
            texto: post.texto,
            autor: post.user.id,
            titulo: post.titulo,
            data: new Date().toLocaleString()
        }
        log("iniciando gravação do novo arquivo de postagens");
        fs.writeFile(
            path.join(diretorio + "/dados/posts/" + arquivo + ".json"),
            JSON.stringify(posts),
            function (erro) {
                if (erro) {
                    log("Erro ao gravar arquivo de postagens", "vermelho");
                    res.status(500);
                    res.write("Erro interno do servidor");
                    res.end();
                    return;
                } else {
                    log("Sucesso na gravação do post no arquivo de postagens", "verde");
                    funcoes.mapear_postagem(post.id, arquivo, post.categorias, res);
                }
            }
        );
    },
    mapear_postagem: function (id, arquivo, categorias, res) {
        log("Iniciando mapeamento de ID e de categorias da postagem");
        var funcoes = this;
        log("Sucesso na leitura do arquivo de mapeamento por IDs", "verde");
        var ids = funcoes.ids;
        ids[id] = arquivo + ".json";
        gravar_id(ids);
        function gravar_id(ids) {
            log("Iniciando Gravação do arquivo de mapeamento por IDs");
            fs.writeFile(
                path.join(diretorio + "/dados/posts/mapa-id.json"),
                JSON.stringify(ids),
                function (erro) {
                    if (erro) {
                        log("Erro ao Gravar o arquivo de mapeamento por IDs", "vermelho");
                        res.status(500);
                        res.write("Erro interno do servidor");
                        res.end();
                        return;
                    } else {
                        log("Sucesso ao Gravar o arquivo de mapeamento por IDs", "verde");
                        funcoes.atualizar_mapeamento_id();
                        ler_categorias();
                    }
                }
            );
        }
        function ler_categorias() {
            var cont, cont2;
            var arquivo_encontrado = false;
            log("Iniciando leitura do arquivo de mapeamento por categorias");
            var arquivo_categorias = funcoes.categorias;
            log("Array de categorias:", "azul");
            log(categorias);
            //laço para cada uma das categorias da postagem
            for (cont = 0; cont < categorias.length; cont++) {
                if (arquivo_categorias[categorias[cont]]) {
                    log("Categoria " + categorias[cont] + " encontrada no arquivo de categorias");
                    //laço para cada arquivo gravado na categoria
                    arquivo_encontrado = false;
                    for (cont2 = 0; cont2 < arquivo_categorias[categorias[cont]].length; cont2++) {
                        if (arquivo_categorias[categorias[cont]][cont2].arquivo == arquivo + ".json") {
                            log("arquivo " + arquivo + ".json encontrado dentro do mapeamento da categorias: " +
                                categorias[cont]);
                            arquivo_categorias[categorias[cont]][cont2].id.push(id);
                            arquivo_encontrado = true;
                            break;
                        }
                    }
                    if (!arquivo_encontrado) {
                        log("arquivo " + arquivo + ".json não encontrado dentro do mapeamento da categoria: " +
                            categorias[cont]);
                        arquivo_categorias[categorias[cont]].push({
                            arquivo: arquivo + ".json",
                            id: [id]
                        });
                    }
                } else {
                    log("Categoria " + categorias[cont] + " NÃO encontrada no arquivo de categorias");
                    arquivo_categorias[categorias[cont]] = [{
                        arquivo: arquivo + ".json",
                        id: [id]
                    }];
                }
            }
            salvar_categorias(arquivo_categorias);
        }
        function salvar_categorias(arquivo_categorias) {
            log("Iniciando gravação no arquivo de categorias");
            fs.writeFile(
                path.join(diretorio + "/dados/posts/mapa-categorias.json"),
                JSON.stringify(arquivo_categorias),
                function (erro) {
                    if (erro) {
                        log("Erro ao Gravar o arquivo de mapeamento por Categorias", "vermelho");
                        res.status(500);
                        res.write("Erro interno do servidor");
                        res.end();
                        return;
                    } else {
                        log("Sucesso ao Gravar o arquivo de mapeamento por Categorias", "verde");
                        funcoes.salvar_config();
                        funcoes.atualizar_mapeamento_categorias();
                        res.send(
                            {
                                mensagem: "Postagem criada com sucesso.",
                                link: "/post/" + id
                            }
                        );
                        res.end();
                    }
                }
            );
        }
    },
    criar_categoria: function (categoria, res) {
        var funcoes = this;
        log("A categoria: " + categoria + " será criada");
        if (!funcoes.categorias[categoria]) {
            funcoes.categorias[categoria] = [];
            funcoes.salvar_mapeamento_categorias();
            res.write("A categoria " + categoria + " será criada");
            res.end();
        } else {
            log("CATEGORIA EXISTENTE, operação cancelada", "vermelho");
            res.write("categoria existente");
            res.end();
        }
    },
    apagar_categoria: function (categoria, res) {
        var funcoes = this;
        if (funcoes.categorias[categoria]) {
            rastrear_referencias(categoria);
        } else {
            log("CATEGORIA INEXISTENTE, operação cancelada", "vermelho");
            res.write("categoria inexistente");
            res.end();
        }
        function rastrear_referencias(categoria) {
            if (funcoes.categorias[categoria]) {
                if (funcoes.categorias[categoria].length > 0) {
                    var num_referencias = funcoes.categorias[categoria].length;
                    log("Iniciando rastreio de referencias da categoria " + categoria);
                    fila_de_referencias(0, num_referencias, categoria);
                } else {
                    log("Categoria não possuia referencias, deletando....")
                    delete funcoes.categorias[categoria];
                    funcoes.salvar_mapeamento_categorias();
                    res.write("Categoria removida sem erros");
                    res.end();
                }
            } else {
                log("Categoria não encontrada!", "vermelho");
                res.write("Categoria Não existe");
                res.end();
            }
        }
        function fila_de_referencias(posicao, limite, categoria) {
            var arquivo = funcoes.categorias[categoria][posicao].arquivo;
            fs.readFile(
                path.join(diretorio + "/dados/posts/" + arquivo),
                function (erro, posts) {
                    if (erro) {
                        log("Erro ao ler arquivo de postagens: " + arquivo, "vermelho");
                        res.status(500);
                        res.write("Erro interno do servidor");
                        res.end();
                        return;
                    } else {
                        log("Arquivo " + arquivo + " lido com sucesso");
                        var cont;
                        var posicao_categoria;
                        posts = JSON.parse(posts);
                        for (cont = 0; cont < funcoes.categorias[categoria][posicao].id.length; cont++) {
                            posicao_categoria = posts[funcoes.categorias[categoria][posicao].id[cont]].categorias.indexOf(categoria)
                            if (posicao_categoria && posicao_categoria < 0) {
                                log("erro de match entre mapeamentos: Categoria " + categoria + " no post: " + funcoes.categorias[categoria][posicao].id[cont], "vermelho");
                                log("Categorias presentes no post:", "vermelho")
                                log(posts[funcoes.categorias[categoria][posicao].id[cont]].categorias)
                                log("Posição da categoria " + categoria);
                                log(posts[funcoes.categorias[categoria][posicao].id[cont]].categorias.indexOf(categoria));
                                continue;
                            } else {
                                log("Match entre mapeamentos: Categoria " + categoria + " no post: " + funcoes.categorias[categoria][posicao].id[cont] + ". Deletando referencia", "verde");
                                posts[funcoes.categorias[categoria][posicao].id[cont]].categorias.splice(posicao_categoria, 1);
                                log("Categorias após o splice ");
                                log(posts[funcoes.categorias[categoria][posicao].id[cont]].categorias);
                            }
                        }
                        log("Remoção concluída. Iniciando gravação do arquivo " + arquivo);
                        fs.writeFile(
                            path.join(diretorio + "/dados/posts/" + arquivo),
                            JSON.stringify(posts),
                            function (erro) {
                                if (erro) {
                                    log("Erro ao Gravar o arquivo " + arquivo, "vermelho");
                                    res.status(500);
                                    res.write("Erro interno do servidor");
                                    res.end();
                                    return;
                                } else {
                                    log("Arquivo " + arquivo + " gravado com sucesso!");
                                    if (posicao + 1 < limite) {
                                        log("Lendo arquivos adicionais na lista de referencias da categoria...");
                                        posicao++;
                                        fila_de_referencias(posicao, limite, categoria);
                                    } else {
                                        log("Todas as referencias da categoria foram apagadas, apagando categoria " + categoria + " do mapeamento");
                                        delete funcoes.categorias[categoria];
                                        funcoes.salvar_mapeamento_categorias();
                                        res.write("Categoria removida sem erros");
                                        res.end();
                                    }
                                }
                            }
                        )
                    }
                }
            )
        }
    },
    apagar_postagem: function (post_id, res) {
        log("Iniciando exclusão da postagem ID: " + post_id);
        var funcoes = this;
        var arquivo;
        var post_info;
        var post_index;
        if (funcoes.ids[post_id]) {
            arquivo = funcoes.ids[post_id];
            fs.readFile(
                path.join(diretorio + "/dados/posts/" + arquivo),
                function (erro, posts) {
                    if (erro) {
                        log("Erro ao ler arquivo de postagens: " + erro, "vermelho");
                        res.status = 500;
                        res.write("Erro interno do servidor");
                        res.end();
                    } else {
                        log("Arquivo de postagens " + arquivo + " lido com sucesso");
                        posts = JSON.parse(posts);
                        post_info = posts[post_id];
                        for (var cont = 0; cont < post_info.categorias.length; cont++) {
                            log("Apagando o mapeamento da categoria: " + post_info.categorias[cont]);
                            for (var cont2 = 0; cont2 < funcoes.categorias[post_info.categorias[cont]].length; cont2++) {
                                if (funcoes.categorias[post_info.categorias[cont]][cont2].arquivo == arquivo) {
                                    post_index = funcoes.categorias[post_info.categorias[cont]][cont2].id.indexOf(post_id);
                                    funcoes.categorias[post_info.categorias[cont]][cont2].id.splice(post_index, 1);
                                    log(funcoes.categorias[post_info.categorias[cont]][cont2].id);
                                    log("Arquivo " + arquivo + " encontrado dentro da categoria " + post_info.categorias[cont]);
                                    log("A postagem está na posição " + post_index + " do array de postagens do arquivo");
                                }
                            }
                        }
                        log("Postagem apagada de todas as referencias de categorias. Iniciando salvamento do arquivo de postagens");
                        log("iniciando gravação do  no arquivo de postagens");
                        delete posts[post_id];
                        fs.writeFile(
                            path.join(diretorio + "/dados/posts/" + arquivo),
                            JSON.stringify(posts),
                            function (erro) {
                                if (erro) {
                                    log("Erro ao gravar arquivo de postagens", "vermelho");
                                    res.status(500);
                                    res.write("Erro interno do servidor");
                                    res.end();
                                    return;
                                } else {
                                    log("Sucesso na exclusão no post no arquivo de postagens, apagando post do mapeamento de IDs", "verde");
                                    delete funcoes.ids[post_id];
                                    log("salvando categorias");
                                    funcoes.salvar_mapeamento_categorias();
                                    log("salvando IDs");
                                    funcoes.salvar_mapeamento_ids();
                                    res.write(JSON.stringify(post_info));
                                    res.end();
                                }
                            }
                        );
                    }
                }
            );
        } else {
            res.status(404);
            res.write("Postagem não encontrada");
            res.end();
        }
    },
    editar_postagem: function (post, res, autor) {
        var funcoes = this;
        log(post);
        if (funcoes.ids[post.id]) {
            var arquivo = funcoes.ids[post.id];
            log("Postagem encontrada, abrindo arquivo " + arquivo);
            fs.readFile(
                path.join(diretorio + "/dados/posts/" + arquivo),
                function (erro, posts) {
                    if (erro) {
                        log("Erro ao ler arquivo de postagens: " + erro, "vermelho");
                        res.status = 500;
                        res.write("Erro interno do servidor");
                        res.end();
                    } else {
                        posts = JSON.parse(posts);
                        if (posts[post.id].autor == autor.id || funcoes.checar_admin(autor)) {
                            posts[post.id].texto = post.texto;
                            posts[post.id].titulo = post.titulo;
                            fs.writeFile(
                                path.join(diretorio + "/dados/posts/" + arquivo),
                                JSON.stringify(posts),
                                function (erro) {
                                    if (erro) {
                                        log("Erro ao salvar arquivo de postagens: " + erro, "vermelho");
                                        res.status = 500;
                                        res.write("Erro interno do servidor");
                                        res.end();
                                    } else {
                                        res.write("Postagem alterada!");
                                        res.end();
                                    }
                                }
                            );
                        } else {
                            res.status(401);
                            res.write("Usuário não é admin ou autor da postagem");
                            res.end();
                        }
                    }
                }
            );
        } else {
            res.status(404);
            res.write("Postagem não encontrada");
            res.end();
        }
    },
    //FEED DE POSTAGENS --------------------------------------------------
    feed: function (res, pagina) {
        var funcoes = this;
        var total_pag = funcoes.config.posts.ultimo_arquivo;
        var posts_ultimo_arquivo = funcoes.config.posts.posts_ultimo_arquivo;
        var arquivos = [];
        var mensagem = "";
        pagina = Number(pagina);
        if (pagina > total_pag) {
            pagina = total_pag;
        } else if (pagina < 1) {
            pagina = 1;
        }
        arquivos.push({ arquivo: (total_pag - (pagina - 1)), posts: posts_ultimo_arquivo });
        if (posts_ultimo_arquivo < 10 && (total_pag - pagina) > 0) {
            arquivos.push({ arquivo: (total_pag - pagina), posts: (10 - posts_ultimo_arquivo) });
        }
        for (var cont = 0; cont < arquivos.length; cont++) {
            mensagem = mensagem + "O arquivo " + arquivos[cont].arquivo +
                ".json terá " + arquivos[cont].posts + " lidos e adicionados a pagina " + pagina + ";";
        }
        res.write(mensagem);
        res.end();
        //CONTINUAR AQUI -----------------------------------------------------------------------
    }
}
