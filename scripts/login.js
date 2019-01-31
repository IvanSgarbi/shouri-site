function log(mensagem){
    console.log(mensagem);
}
function logar(dados) {
    var conexao = new XMLHttpRequest();
    conexao.open("POST", "/login", true);
    conexao.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    conexao.send(JSON.stringify(dados));
    conexao.onreadystatechange = function () {
        var resposta = this;     
        if (resposta.status == 200 && resposta.responseText != "Falha"){
            localStorage.setItem("shouri-token",this.responseText);
            document.getElementById("texto2").innerText = "Logado!";
        }else{
            document.getElementById("texto2").innerText = "Erro no login!";
        }
    };
}
document.onclick = function (evento) {
    if (evento.target == document.getElementById("logar")) {
        var dados = {
            id: document.getElementById("id").value,
            senha: document.getElementById("senha").value
        }
        localStorage.setItem("shouri-user",dados.id);
        logar(dados);
    }
}