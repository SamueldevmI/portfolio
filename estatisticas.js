/* Estatística de visitas com o GoatCounter (grátis, sem cookie, sem aviso de LGPD chato).
   Fica DESLIGADA até colocar o código da conta em CODIGO. Pra ligar:
     1. crie a conta em https://www.goatcounter.com (o código é o "samueldevmi" de samueldevmi.goatcounter.com);
     2. em Settings, marque "Allow adding visitor counts on your website" (é o que deixa a prospeccao.html
        mostrar quem abriu o link);
     3. coloque o código aqui embaixo e publique.
   O que é contado (só caminhos, nada de dado pessoal de quem visita):
     /                        visitas no portfólio
     /link/<negocio>          alguém abriu o link personalizado daquele negócio
     /link/<negocio>/previa   ...e viu a prévia do site
     /link/<negocio>/whatsapp ...e tocou num botão de WhatsApp ou de orçamento
     /evento/...              prévia aberta e ramo escolhido no comparador (de todo mundo)
   Visitas no localhost e links com &teste=1 (o "Testar" da prospeccao.html) não contam. */
window.ESTATISTICAS = (function () {
    "use strict";
    const CODIGO = "samueldevmi";

    const teste = /(^|[?&])teste=1(&|$)/.test(location.search);
    const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.protocol === "file:";
    const ligado = Boolean(CODIGO) && !teste && !local;

    // "Pizzaria do João" -> "pizzaria-do-joao" (o mesmo nos dois lados: site e prospeccao.html)
    const slug = (texto) => String(texto || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
        .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "sem-nome";

    const jaContado = new Set();
    // Conta uma visita/evento num caminho. "umaVez": não repete o mesmo caminho na mesma visita à página.
    function contar(caminho, titulo, umaVez) {
        if (!ligado) return;
        if (umaVez) { if (jaContado.has(caminho)) return; jaContado.add(caminho); }
        const url = `https://${CODIGO}.goatcounter.com/count?p=${encodeURIComponent(caminho)}&t=${encodeURIComponent(titulo || caminho)}&r=${encodeURIComponent(document.referrer || "")}&rnd=${Math.random().toString(36).slice(2)}`;
        const pixel = new Image();
        pixel.src = url;
    }

    // Quantas vezes um caminho foi contado (precisa do "Allow adding visitor counts" ligado no GoatCounter).
    // null = não deu pra saber (desligado, sem rede); 0 = ninguém ainda.
    // Se o GoatCounter responder 403, é a opção do contador que está desmarcada: fica em "bloqueado".
    const estado = { bloqueado: false };
    async function quantos(caminho) {
        if (!CODIGO) return null;
        try {
            const resposta = await fetch(`https://${CODIGO}.goatcounter.com/counter/${encodeURIComponent(caminho)}.json`);
            if (resposta.status === 404) return 0;
            if (resposta.status === 403) { estado.bloqueado = true; return null; }
            if (!resposta.ok) return null;
            const dados = await resposta.json();
            return Number(String(dados.count).replace(/\D/g, "")) || 0;
        } catch (erro) {
            return null;
        }
    }

    return { codigo: CODIGO, configurado: Boolean(CODIGO), ligado, slug, contar, quantos, estado };
})();
