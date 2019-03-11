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
            log("Iniciando sessões...", "amarelo");
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
            log("Iniciando categorias...", "amarelo");
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
            log("Iniciando IDs...", "amarelo");
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
        log("atualizando sessoes...", "amarelo")
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
        log("Verificando sessões", "amarelo");
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
        log("Atualizando IDs...", "amarelo");
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
        log("Iniciando categorias...", "amarelo");
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
        log("enviando um arquivo tipo: " + tipo, "amarelo");
        if (permitidos.includes(tipo) && !bloqueados.includes(nome_arquivo)) {
            log("caminho do arquivo: " + caminho, "amarelo");
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
        var retorno;
        var funcoes = this;
        log("lendo dados da variável de sessoes", "amarelo");
        if (funcoes.sessoes[user.id]) {
            if (funcoes.sessoes[user.id].token == user.token) {
                log("token encontrado! Autorizando acesso", "verde");
                retorno = "permitido";
            } else {
                log("usuario encontrado, porém o token não é válido", "vermelho");
                retorno = "negado";
            }
        } else {
            log("Usuário não encontrado no arquivo de sessoes", "vermelho");
            retorno = "negado";
        }
        return retorno;
    },
    //ENVIAR DADOS DE USUARIOS ADMIN ----------------------------------
    solicitar_usuarios: function (usuario, res) {
        log("Cheacando ADMIN do usuário " + usuario.id, "amarelo");
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
        log("Redirecionando para " + pagina, "amarelo");
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
    gravar_token: function (id, res, token) {
        log("gravando token", "amarelo");
        var funcoes = this;
        var agora = new Date().getTime();
        funcoes.sessoes[id] = {
            token: token,
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
    //ENVIAR AS SESSÕES -----------------------------------------------
    solicitar_sessoes: function (res) {
        var funcoes = this;
        log("Enviando sessoes", "amarelo");
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
        log("Iniciando envio de post", "amarelo");
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
            log("Encontrando a categoria: " + cat, "amarelo");
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
        log("Lendo arquivos para montar a lista.", "amarelo");
        log("Arquivos: ", "amarelo");
        log(arquivos);
        log("posts: ", "amarelo");
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
        log("Montando pagina de post", "amarelo");
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
        log("Verificando em qual arquivo gravar o post", "amarelo");
        var funcoes = this;
        var config = this.config.posts;
        log(post);
        //verificando se o post já existe
        if (!post.id || funcoes.ids[post.id]) {
            log("Post de ID " + post.id + " já existe. Criação cancelada!");
            res.status(400);
            res.write("Bad request");
            res.end();
        } else {
            var arquivo_gravar;
            if (config.posts_por_arquivo > config.posts_ultimo_arquivo) {
                arquivo_gravar = config.ultimo_arquivo;
                log("O post será gravado no arquivo existente: " + arquivo_gravar + ".json", "amarelo");
                funcoes.gravar_post_arquivo_existe(arquivo_gravar, post, res);
            } else {
                arquivo_gravar = (config.ultimo_arquivo + 1);
                log("O post será gravado em um novo arquivo: " + arquivo_gravar + ".json", "amarelo");
                funcoes.gravar_post_novo_arquivo(arquivo_gravar, post, res);
            }
        }
    },
    //GRAVAR EM ARQUIVO EXISTENTE ----------------------------------------------------------
    gravar_post_arquivo_existe: function (arquivo, post, res) {
        var funcoes = this;
        funcoes.config.posts.ultimo_arquivo = arquivo;
        log("iniciando leitura do arquivo de postagens", "amarelo");
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
            log("iniciando gravação do post no arquivo de postagens", "amarelo");
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
        log("iniciando gravação do novo arquivo de postagens", "amarelo");
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
        log("Iniciando mapeamento de ID e de categorias da postagem", "amarelo");
        var funcoes = this;
        log("Sucesso na leitura do arquivo de mapeamento por IDs", "verde");
        var ids = funcoes.ids;
        ids[id] = arquivo + ".json";
        gravar_id(ids);
        function gravar_id(ids) {
            log("Iniciando Gravação do arquivo de mapeamento por IDs", "amarelo");
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
            log("Iniciando leitura do arquivo de mapeamento por categorias", "amarelo");
            var arquivo_categorias = funcoes.categorias;
            log("Array de categorias:", "azul");
            log(categorias);
            //laço para cada uma das categorias da postagem
            for (cont = 0; cont < categorias.length; cont++) {
                if (arquivo_categorias[categorias[cont]]) {
                    log("Categoria " + categorias[cont] + " encontrada no arquivo de categorias", "amarelo");
                    //laço para cada arquivo gravado na categoria
                    arquivo_encontrado = false;
                    for (cont2 = 0; cont2 < arquivo_categorias[categorias[cont]].length; cont2++) {
                        if (arquivo_categorias[categorias[cont]][cont2].arquivo == arquivo + ".json") {
                            log("arquivo " + arquivo + ".json encontrado dentro do mapeamento da categorias: " +
                                categorias[cont], "amarelo");
                            arquivo_categorias[categorias[cont]][cont2].id.push(id);
                            arquivo_encontrado = true;
                            break;
                        }
                    }
                    if (!arquivo_encontrado) {
                        log("arquivo " + arquivo + ".json não encontrado dentro do mapeamento da categoria: " +
                            categorias[cont], "amarelo");
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
            log("Iniciando gravação no arquivo de categorias", "amarelo");
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
    }
}
