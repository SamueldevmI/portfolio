/* Roda no <head>, antes da página aparecer (por isso não é defer). Fica num arquivo e não dentro do
   index.html porque a política de segurança (CSP) só deixa rodar script que é arquivo do próprio site. */
/* Modo leve: celular, economia de dados ou internet lenta desligam os efeitos mais pesados.
   ?leve=1 força ligado e ?leve=0 força desligado. */
(function () {
    var forcado = new URLSearchParams(location.search).get("leve");
    var conexao = navigator.connection || {};
    var leve = forcado === "1" || (forcado !== "0" && (matchMedia("(pointer:coarse)").matches || conexao.saveData === true || /(^|-)(2g|3g)$/.test(conexao.effectiveType || "")));
    if (leve) document.documentElement.classList.add("modo-leve");
})();
