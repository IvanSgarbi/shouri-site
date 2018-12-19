$(document).on("click", "#logar", function (evento) {
    var dados = {
        id: document.getElementById("id").value,
        senha: document.getElementById("senha").value
    }
    dados = JSON.stringify(dados);
    $.ajax({
        type: "post",
        url: "/login",
        data: "data",
        dataType: "application/json",
        success: function (response) {
            document.getElementById("texto").innerText = "Foi!";
        },
        error: function (error){
            document.getElementById("texto").innerText = "Não foi!";
        }
    });
});