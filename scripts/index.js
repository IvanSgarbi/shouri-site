function gerar_noticias(quantidade) {
    if (!isNaN(quantidade)) {
        var lista = document.getElementById("lista");
        var divs = "";
        for (var cont = 0; cont < quantidade; cont++) {
            divs += "<div class=noticia>" +
                "<div class=imagem></div>" +
                "<div class=text>bla" + cont + "</div></div>";
        }
        lista.innerHTML = divs;
    }
}
gerar_noticias(5);