/* "Em produção agora": o que está saindo do forno esta semana. Atualize aqui e publique.
   etapa: "previa" | "construindo" | "ajustes" | "no-ar". Sem nada na lista, o bloco não aparece. */
window.EM_PRODUCAO = [
    { nome: "Eclipse Studio", oque: "loja online de moda alternativa", etapa: "no-ar", detalhe: "esperando as fotos da coleção nova pra trocar a vitrine", link: "eclipse-studio/" },
    { nome: "Este portfólio", oque: "sempre em obra 🚧", etapa: "construindo", detalhe: "toda semana ganha coisa nova (às vezes de madrugada)" },
];

(function () {
    "use strict";
    const caixa = document.getElementById("producao");
    const lista = (window.EM_PRODUCAO || []).filter((p) => p && p.nome);
    if (!caixa || !lista.length) return;
    const tr = (t) => (window.traduzir ? window.traduzir(t) : t);
    const ETAPAS = [["previa", "prévia"], ["construindo", "construindo"], ["ajustes", "ajustes"], ["no-ar", "no ar"]];
    function desenhar() {
        const ul = document.createElement("ul");
        ul.className = "producao-lista";
        lista.forEach((p) => {
            const atual = Math.max(0, ETAPAS.findIndex(([k]) => k === p.etapa));
            const li = document.createElement("li");
            const topo = document.createElement(p.link ? "a" : "p");
            topo.className = "producao-nome";
            if (p.link) topo.href = p.link;
            topo.textContent = p.nome;
            const oque = document.createElement("span");
            oque.textContent = ` · ${tr(p.oque)}`;
            topo.appendChild(oque);
            const trilho = document.createElement("ol");
            trilho.className = "producao-etapas";
            ETAPAS.forEach(([, rotulo], i) => {
                const e = document.createElement("li");
                e.textContent = tr(rotulo);
                if (i < atual) e.className = "feito";
                if (i === atual) { e.className = "atual"; e.setAttribute("aria-current", "step"); }
                trilho.appendChild(e);
            });
            li.append(topo, trilho);
            if (p.detalhe) { const d = document.createElement("small"); d.textContent = tr(p.detalhe); li.appendChild(d); }
            ul.appendChild(li);
        });
        caixa.replaceChildren(Object.assign(document.createElement("p"), { className: "producao-titulo", textContent: tr("🔨 Em produção agora") }), ul);
        caixa.hidden = false;
    }
    desenhar();
    document.addEventListener("idiomaMudou", desenhar);
})();
