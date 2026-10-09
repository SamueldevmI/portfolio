/* Depoimentos de clientes. Chegou um pelo depoimento.html (ele vem pro seu WhatsApp)?
   Cole aqui e publique: aparece sozinho na página inicial (em Serviços) e, se for da Eclipse
   (projeto: "eclipse"), também no case. Só cole quem marcou "Pode publicar com meu nome". */
window.DEPOIMENTOS = [
    // { texto: "O site mudou tudo…", autor: "Elizabeth", negocio: "Eclipse Studio", projeto: "eclipse", nota: 5 },
];

(function () {
    "use strict";
    const lista = (window.DEPOIMENTOS || []).filter((d) => d && d.texto && d.autor);
    if (!lista.length) return;
    const assinatura = (d) => `— ${d.autor}${d.negocio ? ", " + d.negocio : ""}`;

    /* página inicial: até 3, logo depois dos serviços */
    const caixa = document.getElementById("depoimentos");
    if (caixa) {
        caixa.innerHTML = '<p class="eyebrow-mini">QUEM JÁ CONTRATOU</p><div class="depoimentos-lista"></div>';
        lista.slice(0, 3).forEach((d) => {
            const bloco = document.createElement("blockquote");
            bloco.className = "depoimento";
            const estrelas = document.createElement("span");
            estrelas.className = "depoimento-estrelas";
            const nota = Math.max(1, Math.min(5, Number(d.nota) || 5));
            estrelas.textContent = "★".repeat(nota);
            estrelas.setAttribute("aria-label", `${nota} de 5`);
            const texto = document.createElement("p");
            texto.textContent = `“${d.texto}”`;
            const rodape = document.createElement("footer");
            rodape.textContent = assinatura(d);
            bloco.append(estrelas, texto, rodape);
            caixa.lastElementChild.appendChild(bloco);
        });
        caixa.hidden = false;
    }

    /* case da Eclipse: o depoimento dela */
    const caso = document.getElementById("casoDepoimento");
    const daEclipse = lista.find((d) => d.projeto === "eclipse");
    if (caso && daEclipse) {
        document.getElementById("casoDepoTexto").textContent = `“${daEclipse.texto}”`;
        document.getElementById("casoDepoAutor").textContent = assinatura(daEclipse);
        caso.hidden = false;
    }

    /* Contracapa: os mesmos depoimentos, estilo "cartas dos leitores" de gibi antigo */
    const ccCartas = document.getElementById("ccCartas");
    const ccLista = document.getElementById("ccCartasLista");
    if (ccCartas && ccLista) {
        lista.slice(0, 3).forEach((d) => {
            const carta = document.createElement("blockquote");
            carta.className = "cc-carta";
            carta.style.setProperty("--giro", (Math.random() * 4 - 2).toFixed(1) + "deg");
            const texto = document.createElement("p");
            texto.textContent = `“${d.texto}”`;
            const rodape = document.createElement("footer");
            rodape.textContent = assinatura(d);
            carta.append(texto, rodape);
            ccLista.appendChild(carta);
        });
        ccCartas.hidden = false;
    }
})();
