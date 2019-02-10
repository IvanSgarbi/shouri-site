var dk = {
    atualizar: function () {
        var cont;
        var propriedade;
        var lista;
        var cont_l;
        var conteudo;
        var indice;
        var elementos = document.querySelectorAll("[dk]");
        for (cont = 0; cont < elementos.length; cont++) {
            propriedade = elementos[cont].getAttribute("dk").split(":");
            if (propriedade[1]) {
                propriedade[0] = propriedade[0].replace(/ /g, '');
                propriedade[1] = propriedade[1].replace(/ /g, '');
                console.log(propriedade);
                if (propriedade[0] == "cada" && dk[propriedade[1]]) {
                    conteudo = elementos[cont].innerHTML;
                    console.log("Conteudo do loop: ");
                    console.log(conteudo);
                    elementos[cont].innerHTML = "";
                    lista = dk[propriedade[1]];                    
                    for (cont_l = 0; cont_l < lista.length; cont_l++) {
                        elementos[cont].innerHTML = elementos[cont].innerHTML +
                         conteudo.replace(/dk=/g, "indice='" + propriedade[1] + ":" + cont_l + "' dk=")
                         + "<br>";
                    }
                }
            }
        }
        elementos = document.querySelectorAll("[dk]");
        for (cont = 0; cont < elementos.length; cont++) {
            propriedade = elementos[cont].getAttribute("dk").split(":");
            if (propriedade[1]) {
                propriedade[0] = propriedade[0].replace(/ /g, '');
                propriedade[1] = propriedade[1].replace(/ /g, '');
                switch (propriedade[0]) {
                    case "valor":
                        if (dk[propriedade[1]]) {
                            if (!elementos[cont].hasAttribute("indice")) {
                                elementos[cont].value = dk[propriedade[1]];
                            } else {
                                indice = elementos[cont].getAttribute("indice").split(":");
                                lista = indice[0].replace(/ /g, '');
                                indice = indice[1].replace(/ /g, '');
                                elementos[cont].value = dk[lista][indice][propriedade[1]];
                            }
                        }
                        break;
                    case "texto":
                        if (!elementos[cont].hasAttribute("indice")) {
                            elementos[cont].innerHTML = dk[propriedade[1]];
                        } else {
                            indice = elementos[cont].getAttribute("indice").split(":");
                            lista = indice[0].replace(/ /g, '');
                            indice = indice[1].replace(/ /g, '');
                            elementos[cont].innerHTML = dk[lista][indice][propriedade[1]];
                        }
                        break;
                    case "se":
                        if (!elementos[cont].hasAttribute("indice")) {
                            if (!dk[propriedade[1]]) {
                                elementos[cont].style.display = "none";
                            } else {
                                elementos[cont].style.display = "";
                            }
                        } else {
                            indice = elementos[cont].getAttribute("indice").split(":");
                            lista = indice[0].replace(/ /g, '');
                            indice = indice[1].replace(/ /g, '');
                            if (!dk[lista][indice][propriedade[1]]) {
                                elementos[cont].style.display = "none";
                            } else {
                                elementos[cont].style.display = "";
                            }
                        }
                        break;

                    default:
                }
            }
        }
    }
}
       