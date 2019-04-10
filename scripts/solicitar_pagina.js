function requisitar() {
    var shouri_user = localStorage.getItem("shouri-user");
    var shouri_token = localStorage.getItem("shouri-token");
    if(!(shouri_user && shouri_token)){
        redirecionar();
        return;
    }
    var conexao = new XMLHttpRequest();
    conexao.open("GET", location.pathname, true);
    conexao.setRequestHeader("shouri-token", localStorage.getItem("shouri-token"));
    conexao.setRequestHeader("shouri-user", localStorage.getItem("shouri-user"));
    conexao.send();
    conexao.onreadystatechange = function () {
        if (this.response && this.readyState == 4 && this.status == 200) {
            var nova_pagina = this.responseText;
            console.log("substituindo página");            
            document.open();
            document.write(nova_pagina);
            if (!("ActiveXObject" in window)) {
                //alert("NÃO É O ie CHAMANDO DOCUMENT CLOSE");
                document.close();
            }else{
                alert("IE");
            }
        }
    }
}
function redirecionar(){
    window.location.replace("/login");
}