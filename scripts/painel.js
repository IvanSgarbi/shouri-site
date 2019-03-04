
document.getElementById("carregar-sessoes").onclick = function (evento) {
    var credenciais;
    var conexao;
    var sessoes;
    credenciais = {
        "id": localStorage.getItem("shouri-user"),
        "token": localStorage.getItem("shouri-token")
    }
    conexao = new XMLHttpRequest();
    conexao.open("POST", "sessoes/consultar", true);
    conexao.setRequestHeader("content-type", "application/json");
    conexao.send(JSON.stringify(credenciais));
    conexao.onreadystatechange = function () {
        if (this.response && this.readyState == 4 && this.status == 200) {
            sessoes = JSON.parse(this.response);
            preencher_tabela(sessoes);
        } else {
            console.log(this.responseText);
            document.getElementById("dados").innerText = "";
        }
    };
}
document.getElementById("carregar-usuarios").onclick = function (evento) {
    var credenciais;
    var conexao;
    credenciais = {
        "id": localStorage.getItem("shouri-user"),
        "token": localStorage.getItem("shouri-token")
    }
    conexao = new XMLHttpRequest();
    conexao.open("POST", "usuarios/consultar", true);
    conexao.setRequestHeader("content-type", "application/json");
    conexao.send(JSON.stringify(credenciais));
    conexao.onreadystatechange = function () {
        if (this.response && this.readyState == 4 && this.status == 200) {
            document.getElementById("paragrafo-usuarios").innerText = this.responseText;
        } else {
            console.log(this.responseText);
            document.getElementById("paragrafo-usuarios").innerText = "";
        }
    };
}
document.onclick = function (evento) {
    if (evento.target.classList.contains("matar-sessao")) {
        console.log("Clique de deletação");
        var nome = evento.target.getAttribute("sessao");
        var credenciais;
        var conexao;
        credenciais = {
            "id": localStorage.getItem("shouri-user"),
            "token": localStorage.getItem("shouri-token"),
            "nome": nome
        }
        conexao = new XMLHttpRequest();
        conexao.open("POST", "sessoes/apagar", true);
        conexao.setRequestHeader("content-type", "application/json");
        conexao.send(JSON.stringify(credenciais));
        conexao.onreadystatechange = function () {
            if (this.response && this.readyState == 4 && this.status == 200) {
                document.getElementById("info-sessoes").innerText = this.responseText;
            } else {
                document.getElementById("info-sessoes").innerText = "";
            }
        }
    } else if (evento.target == document.getElementById("carregar-categorias")) {
        console.log("foi o certo")
        var conexao = new XMLHttpRequest();
        conexao.open("GET", "categorias", true);
        conexao.send();
        conexao.onreadystatechange = function () {
            if (this.response && this.readyState == 4 && this.status == 200) {
                categorias = this.responseText;
                categorias = JSON.parse(categorias);
                console.log(categorias);
                var tabela = document.getElementById("categorias").children[0];
                tabela.innerHTML = "";
                for (var cont = 0; cont < categorias.length; cont++) {
                    tabela.innerHTML = tabela.innerHTML + "<tr>" +
                        "<td><a href='posts/" + categorias[cont] + "'>" + categorias[cont] + "</a></td>" +
                        "<td><button id='" + categorias[cont] + "' class='apagar-categoria'>Apagar</button></td>" +
                        "</tr>"
                }
            }
        }
    } else if (evento.target.classList.contains("apagar-categoria")) {
        var id = evento.target.getAttribute("id");
        if (confirm("Tem certeza que deseja apagar a categoria '" + id +
            "'? Todas as referencias serão apagadas das postagens e esse processo não possui volta.")) {
            apagar_categoria(id);
        }
    } else if (evento.target.getAttribute("id") == "adicionar-categoria") {
        var nova_categoria = document.getElementById("nova-categoria").value;
        adicionar_categoria(nova_categoria);
    }
}
function preencher_tabela(sessoes) {
    var nome;
    var tr = [];
    var td;
    var botao;
    for (nome in sessoes) {
        botao = document.createElement("button");
        botao.classList.add("matar-sessao");
        botao.innerText = "Apagar";
        botao.setAttribute("sessao", nome);
        td = document.createElement("td");
        td.width = 100;
        td.appendChild(botao);
        tr[0] = td;
        td = document.createElement("td");
        td.width = 100;
        td.innerText = nome;
        tr[1] = td;
        td = document.createElement("td");
        td.width = 200;
        td.innerText = sessoes[nome].token;
        tr[2] = td;
        td = document.createElement("td");
        td.width = 200;
        td.innerText = new Date(sessoes[nome].vida).toLocaleString();
        tr[3] = td;
        document.getElementById("dados").innerHTML = "";
        document.getElementById("dados").append(
            tr[0], tr[1], tr[2], tr[3]
        );
    }
}
function apagar_categoria(id) {
    var credenciais = {
        "id": localStorage.getItem("shouri-user"),
        "token": localStorage.getItem("shouri-token")
    }
    var conexao = new XMLHttpRequest();
    conexao.open("POST", "categoria/apagar/" + id, true);
    conexao.setRequestHeader("content-type", "application/json");
    conexao.send(JSON.stringify(credenciais));
    conexao.onreadystatechange = function () {
        if (this.response && this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
        }
    }
    console.log("teste" + id);
}
function adicionar_categoria(categoria) {
    if (categoria) {
        var credenciais = {
            "id": localStorage.getItem("shouri-user"),
            "token": localStorage.getItem("shouri-token")
        }
        var conexao = new XMLHttpRequest();
        conexao.open("POST", "categoria/criar/" + categoria, true);
        conexao.setRequestHeader("content-type", "application/json");
        conexao.send(JSON.stringify(credenciais));
        conexao.onreadystatechange = function () {
            if (this.response && this.readyState == 4 && this.status == 200) {
                console.log(this.responseText);
            }
        }
    } else {
        alert("preencha o campo de caegoria");
    }
}