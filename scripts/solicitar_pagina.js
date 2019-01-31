
var conexao = new XMLHttpRequest();
conexao.open("GET", location.pathname, true);
conexao.setRequestHeader("shouri-token", localStorage.getItem("shouri-token"));
conexao.setRequestHeader("shouri-user", localStorage.getItem("shouri-user"));
conexao.send();
conexao.onreadystatechange = function () {
    if (this.response && this.readyState == 4) {
        window.document.write(this.responseText);
        window.document.close();
    }
};