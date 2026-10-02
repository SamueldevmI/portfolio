/* Contador de visitas da Eclipse Studio, com o GoatCounter (grátis, sem cookie, sem guardar dado de quem visita).
   Fica DESLIGADO até colocar o código da conta em CODIGO. Pra ligar:
     1. crie a conta grátis em https://www.goatcounter.com (ex.: código "eclipsestudio" → eclipsestudio.goatcounter.com);
     2. em Settings, marque "Allow adding visitor counts on your website" (é o que deixa o painel/ mostrar os números);
     3. coloque o código aqui embaixo e publique.
   O que é contado (só caminhos, nada pessoal):
     /eclipse/              visita na loja
     /eclipse/peca/<id>     alguém abriu aquela peça
     /eclipse/sacola/<id>   alguém pôs aquela peça na sacola
     /eclipse/pedido        alguém tocou em "Enviar pedido pelo WhatsApp"
   Visitas no localhost e com ?teste=1 não contam. */
window.CONTADOR_ECLIPSE = (function () {
    "use strict";
    const CODIGO = ""; // ex.: "eclipsestudio"

    const teste = /(^|[?&])teste=1(&|$)/.test(location.search);
    const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.protocol === "file:";
    const ligado = Boolean(CODIGO) && !teste && !local;
    const jaContado = new Set();

    function contar(caminho, titulo) {
        if (!ligado || jaContado.has(caminho)) return;
        jaContado.add(caminho);
        const pixel = new Image();
        pixel.src = `https://${CODIGO}.goatcounter.com/count?p=${encodeURIComponent(caminho)}&t=${encodeURIComponent(titulo || caminho)}&r=${encodeURIComponent(document.referrer || "")}&rnd=${Math.random().toString(36).slice(2)}`;
    }
    /* quantas vezes um caminho foi contado: null = não deu pra saber, 0 = ninguém ainda */
    async function quantos(caminho) {
        if (!CODIGO) return null;
        try {
            const resposta = await fetch(`https://${CODIGO}.goatcounter.com/counter/${encodeURIComponent(caminho)}.json`);
            if (resposta.status === 404) return 0;
            if (!resposta.ok) return null;
            const dados = await resposta.json();
            return Number(String(dados.count).replace(/\D/g, "")) || 0;
        } catch (erro) {
            return null;
        }
    }
    return { codigo: CODIGO, configurado: Boolean(CODIGO), ligado, contar, quantos };
})();
