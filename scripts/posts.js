dk.postagem = postagens.posts;
dk.atualizar();
console.log("TOTAL de páginas: " + paginas.total);
console.log("Página atual: " + paginas.atual);
document.getElementById("primeira-pagina").setAttribute("href", window.location.pathname + "?pagina=1");
document.getElementById("ultima-pagina").setAttribute("href", window.location.pathname + "?pagina=" + paginas.total);
for (var cont = paginas.atual - 3; cont < paginas.atual + 3; cont++) {
    if (cont > 0 && cont <= paginas.total) {
        document.getElementById("paginacao").innerHTML +=
            "<a href=" + window.location.pathname + "?pagina=" +
            cont + "><button>" + cont + "</button></a>";
    }
}