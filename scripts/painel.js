
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
            preencherTabela(sessoes);
        }else{
            console.log(this.responseText);
            document.getElementsByClassName("dados")[0].innerText = "";
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
        }else{
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
            }else{
                document.getElementById("info-sessoes").innerText = "";
            }
        }
    }
}
function preencherTabela(sessoes) {
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
        td.append(botao);
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
        document.querySelector(".tabela-sessoes .dados").innerHTML = "";
        document.querySelector(".tabela-sessoes .dados").append(
            tr[0], tr[1], tr[2], tr[3]
        );
    }

}