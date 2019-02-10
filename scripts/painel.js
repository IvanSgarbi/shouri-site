
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
        if (this.response && this.readyState == 4) {
            sessoes = JSON.parse(this.response);
            preencherTabela(sessoes.sessoes);
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
        if (this.response && this.readyState == 4) {
            document.getElementById("paragrafo-usuarios").innerText = this.responseText;
        }
    };
}
function preencherTabela(sessoes) {
    var nome;
    var tr;
    var td;
    for (nome in sessoes) {
        tr = document.createElement("tr");
        td = document.createElement("td");
        td.width = 100;
        td.innerText = nome;
        tr.append(td);
        td = document.createElement("td");
        td.width = 200;
        td.innerText = sessoes[nome].token;
        tr.append(td);
        td = document.createElement("td");
        td.width = 200;
        td.innerText = new Date(sessoes[nome].vida).toLocaleString();
        tr.append(td);
        document.querySelector(".tabela-sessoes .dados").innerHTML = "";
        document.querySelector(".tabela-sessoes .dados").append(tr.children[0],tr.children[1],tr.children[2]);
    }

}