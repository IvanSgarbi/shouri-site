console.log("Iniciando JS da pagina de posts");
var categorias_adicionadas = [];
var categorias;
document.onclick = function (ev) {
    if (ev.target.id == "enviar") {
        var titulo = document.getElementById("titulo_postagem").value;
        var texto = document.getElementById("texto_postagem").value;
        var id = document.getElementById("id_postagem").value;
        if (titulo != "" && texto != "" && id != "") {
            var conexao;
            var post = {
                "titulo": titulo,
                "texto": texto,
                "categorias": categorias_adicionadas,
                "id": id,
                "user": {
                    "id": localStorage.getItem("shouri-user"),
                    "token": localStorage.getItem("shouri-token")
                }
            }
            conexao = new XMLHttpRequest();
            conexao.open("POST", "post/criar", true);
            conexao.setRequestHeader("content-type", "application/json");
            conexao.send(JSON.stringify(post));
            conexao.onreadystatechange = function () {
                if (this.response && this.readyState == 4 && this.status == 200) {
                    console.log(this.responseText);
                    var resposta = JSON.parse(this.responseText);
                    window.open(resposta.link);
                } else if (this.status != 200) {
                    document.getElementById("resultado").innerHTML = "Erro";
                }
            }
        }else{
            alert("Existem campos não preenchidos!");
        }
    }
}
document.onchange = function (ev) {
    if (categorias.indexOf(ev.target.value) >= 0) {
        console.log(ev.target.value);
        document.querySelector("option[value=" + ev.target.value + "]").style.display = "none";
        categorias_adicionadas.push(ev.target.value);
        document.getElementById("categorias_selecionadas").innerHTML = categorias_adicionadas;
    }
}
function carregar_categorias() {
    var conexao;
    conexao = new XMLHttpRequest();
    conexao.open("GET", "categorias", true);
    conexao.send();
    conexao.onreadystatechange = function () {
        if (this.response && this.readyState == 4 && this.status == 200) {
            console.log(this);
            categorias = this.responseText;
            categorias = JSON.parse(categorias);
            preencher_lista(categorias);
        }
    }
}
function preencher_lista(categorias) {
    console.log(categorias);
    var cont;
    var lista = "<option value='' selected></option>";
    for (cont = 0; cont < categorias.length; cont++) {
        lista += "<option value=" + categorias[cont] + ">" + categorias[cont] + "</option>"
    }
    document.getElementById("categorias").innerHTML = lista;
}






carregar_categorias();