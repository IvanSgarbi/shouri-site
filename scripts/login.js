history.pushState(null,null,"/login");
function log(mensagem) {
    console.log(mensagem);
}
function logar(dados) {
    var conexao = new XMLHttpRequest();
    conexao.open("POST", "/login", true);
    conexao.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    conexao.send(JSON.stringify(dados));
    conexao.onreadystatechange = function () {
        var resposta = this;
        if (resposta.status == 200 && resposta.responseText != "Falha") {
            localStorage.setItem("shouri-token", this.responseText);
            document.getElementById("texto").innerText = "Logado!";
        } else {
            document.getElementById("texto").innerText = "Erro no login!";
        }
    }
}
function form_login(){
    var id = document.getElementById("id").value;
    var senha = document.getElementById("senha").value;
    if (id && senha) {
        var dados = {
            id: id,
            senha: senha
        }
        localStorage.setItem("shouri-user", dados.id);
        logar(dados);
    }
}