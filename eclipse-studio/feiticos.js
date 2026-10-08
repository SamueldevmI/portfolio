"use strict";
/* Feitiços da Eclipse Studio: "me dá de presente?", caixa misteriosa, coleção de arcanos e a Nyx.
   Roda por último e usa o que script.js, magia.js e encantos.js já deixaram pronto. */

const linkDaLoja = () => location.origin + location.pathname;
const somarNaSacola = (id, tam, qtd = 1) => {
    const existente = sacola.find((i) => i.id === id && i.tam === tam);
    const max = maxDe(produto(id)); // peça única: no máximo 1
    if (existente) existente.qtd = Math.min(max, existente.qtd + qtd); else sacola.push({ id, tam, qtd: Math.min(max, qtd) });
};

/* ========== 1. "Me dá de presente?": a sacola vira uma carta com link pra outra pessoa comprar ========== */
(function presente() {
    const botao = document.getElementById("pedirPresente");
    const dlgPedir = document.getElementById("dialogoPresente");
    const form = document.getElementById("formPresente");
    const campoDe = document.getElementById("presenteDe");
    const campoPara = document.getElementById("presentePara");
    const dlgCarta = document.getElementById("dialogoCarta");
    if (!botao || !dlgCarta) return;

    function montarLink() {
        const itens = sacola.map((i) => [i.id, i.tam, i.qtd].map(encodeURIComponent).join(":")).join(",");
        const q = new URLSearchParams({ presente: itens, de: campoDe.value.trim().slice(0, 40) });
        if (campoPara.value.trim()) q.set("para", campoPara.value.trim().slice(0, 40));
        return `${linkDaLoja()}?${q}`;
    }
    function textoDaCarta() {
        const para = campoPara.value.trim();
        return `${para ? tf("Oi, {nome}!", { nome: para }) : t("Oi!")} 🎁 ${tf("Separei umas peças na {loja} que eu ia amar ganhar de presente 🖤", { loja: LOJA.nome })}\n${t("É só abrir a cartinha:")} ${montarLink()}`;
    }

    botao.addEventListener("click", () => {
        if (!sacola.length) { avisar("Ponha as peças que você quer ganhar na sacola primeiro ✦"); return; }
        campoDe.value = campoDe.value || campoNome.value.trim();
        dlgPedir.showModal();
    });
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!campoDe.value.trim()) { campoDe.focus(); return; }
        window.open(`https://wa.me/?text=${encodeURIComponent(textoDaCarta())}`, "_blank", "noopener");
        dlgPedir.close();
        avisar("🎁 Carta pronta: escolha pra quem mandar no WhatsApp.");
    });
    document.getElementById("copiarCarta").addEventListener("click", async () => {
        if (!campoDe.value.trim()) { campoDe.focus(); return; }
        try { await navigator.clipboard.writeText(textoDaCarta()); avisar("Carta copiada ✦ cola na conversa que quiser."); }
        catch (erro) { prompt("Copie a carta:", textoDaCarta()); }
    });
    dlgPedir.addEventListener("click", (e) => { if (e.target === dlgPedir) dlgPedir.close(); });

    /* quem recebe: abre o link e vê a carta com selo de cera */
    const q = new URLSearchParams(location.search);
    if (!q.has("presente")) return;
    const de = (q.get("de") || t("Alguém")).trim().slice(0, 40);
    const paraBruto = (q.get("para") || "").trim().slice(0, 40);
    const para = paraBruto.charAt(0).toUpperCase() + paraBruto.slice(1);
    const itens = (q.get("presente") || "").split(",").slice(0, 20).map((parte) => {
        const [id, tam, qtd] = parte.split(":").map((x) => decodeURIComponent(x || ""));
        return { id, tam, qtd: Math.max(1, Math.min(MAX_POR_ITEM, parseInt(qtd, 10) || 1)) };
    }).filter(itemValido);
    history.replaceState(null, "", linkDaLoja() + location.hash);
    if (!itens.length) return;

    const total = itens.reduce((s, i) => s + (produto(i.id).preco ?? 0) * i.qtd, 0);
    document.getElementById("cartaTitulo").textContent = tf("{de} te mandou uma carta", { de });
    document.getElementById("cartaTexto").textContent = `${para ? `${para}, ` : ""}${tf("{de} separou estas peças na {loja} e ia amar ganhar de presente:", { de, loja: LOJA.nome })}`;
    document.getElementById("cartaItens").innerHTML = itens.map((i) => {
        const p = produto(i.id);
        return `<li><span class="carta-item-arte tom-${p.tom}">${arte(p)}</span><span>${i.qtd > 1 ? i.qtd + "× " : ""}${esc(t(p.nome))}${i.tam ? ` <small>(${esc(t(i.tam))})</small>` : ""}</span><b>${precoTexto(p, i.qtd)}</b></li>`;
    }).join("");
    document.getElementById("cartaTotal").textContent = `${t("Total estimado:")} ${brl(total)}${itens.some((i) => produto(i.id).preco == null) ? " + " + t("itens a combinar") : ""}`;
    document.getElementById("cartaComprar").addEventListener("click", () => {
        itens.forEach((i) => somarNaSacola(i.id, i.tam, i.qtd));
        campoObs.value = tf("É presente pra {de} 🎁", { de });
        renderSacola();
        caiuNoCaldeirao(itens.map((i) => i.id), dlgCarta.getBoundingClientRect());
        dlgCarta.close();
        avisar(tf("🎁 O presente pra {de} está na sacola", { de }), { rotulo: "Ver sacola", fazer: () => dlgSacola.showModal() });
    });
    dlgCarta.addEventListener("click", (e) => { if (e.target === dlgCarta) dlgCarta.close(); });
    setTimeout(() => {
        dlgCarta.showModal();
        document.getElementById("seloCera").classList.add("quebrando");
        document.dispatchEvent(new CustomEvent("encanto:som", { detail: "pagina" }));
    }, 500);
})();

/* ========== 2. Caixa misteriosa: escolhe a vibe, sacode, abre e vê o que pode vir ========== */
(function caixaMisteriosa() {
    const desenho = document.getElementById("caixaDesenho");
    if (!desenho) return;
    const vibesEl = document.getElementById("caixaVibes");
    const revelacao = document.getElementById("caixaRevelacao");
    const abrir = document.getElementById("caixaAbrir");
    const quero = document.getElementById("caixaQuero");
    const caixa = produto("caixa");
    let vibe = ESTILOS[0];

    const renderVibes = () => {
        document.getElementById("caixaSub").textContent = tf("{n} peças surpresa da vibe que você escolher, por {preco}. Toca na caixa pra sacudir 😉", { n: LOJA.caixa.pecas, preco: brl(caixa.preco) });
        vibesEl.innerHTML = ESTILOS.map((e) => `<button type="button" class="chip" data-caixa-vibe="${e.id}" aria-pressed="${e === vibe}">${esc(t(e.nome))}</button>`).join("");
    };
    document.addEventListener("idiomaMudou", () => { renderVibes(); fechar(); });
    function fechar() {
        desenho.classList.remove("aberta");
        revelacao.innerHTML = "";
        quero.hidden = true;
        abrir.hidden = false;
    }
    vibesEl.addEventListener("click", (e) => {
        const b = e.target.closest("[data-caixa-vibe]");
        if (!b) return;
        vibe = ESTILOS.find((x) => x.id === b.dataset.caixaVibe);
        renderVibes();
        fechar();
    });
    desenho.addEventListener("click", () => {
        if (desenho.classList.contains("aberta")) return;
        desenho.classList.remove("sacudindo");
        void desenho.offsetWidth;
        desenho.classList.add("sacudindo");
        document.dispatchEvent(new CustomEvent("encanto:som", { detail: "pagina" }));
    });
    abrir.addEventListener("click", () => {
        desenho.classList.add("aberta");
        document.dispatchEvent(new CustomEvent("encanto:som", { detail: "sino" }));
        const possiveis = PRODUTOS.filter((p) => naVitrine(p) && disponivel(p) && p.estilos.includes(vibe.id))
            .sort(() => Math.random() - .5).slice(0, 6);
        setTimeout(() => {
            revelacao.innerHTML = `<p>${tf("Numa caixa {vibe} pode vir qualquer uma destas (ou outras da mesma vibe):", { vibe: `<b>${esc(t(vibe.nome))}</b>` })}</p>
                <ul>${possiveis.map((p, i) => `<li style="--i:${i}"><span class="tom-${p.tom}">${arte(p)}</span><small>${esc(t(p.nome))}</small></li>`).join("")}</ul>`;
            abrir.hidden = true;
            quero.hidden = false;
            quero.textContent = `${tf("Quero a caixa {vibe}", { vibe: t(vibe.nome) })} · ${brl(caixa.preco)}`;
        }, semMovimento ? 0 : 700);
    });
    quero.addEventListener("click", () => {
        somarNaSacola("caixa", vibe.nome);
        renderSacola();
        balancarSacola();
        caiuNoCaldeirao(["caixa"], desenho.getBoundingClientRect());
        avisar(`✦ ${tf("Caixa {vibe} no caldeirão", { vibe: t(vibe.nome) })}`, { rotulo: "Ver sacola", fazer: () => dlgSacola.showModal() });
    });
    renderVibes();
})();

/* ========== 3. Coleção de arcanos: uma carta nova por dia de visita, junta as 4 e ganha um código ========== */
const COLECAO = (() => {
    const CHAVE = "es-arcanos";
    const album = document.getElementById("album");
    const sub = document.getElementById("arcanosSub");
    const dlg = document.getElementById("dialogoArcano");
    const ORDEM = Object.keys(ARCANOS);
    const estado = ler(CHAVE, { cartas: [], dia: "" });
    if (!Array.isArray(estado.cartas)) estado.cartas = [];
    estado.cartas = estado.cartas.filter((id) => ARCANOS[id]);
    const completa = () => estado.cartas.length >= ORDEM.length;

    const frente = (id) => {
        const a = ARCANOS[id];
        return `<div class="carta-frente"><span class="carta-num">${a.numero}</span><span class="carta-arte tom-${a.tom}"><svg class="arte" viewBox="0 0 100 100" aria-hidden="true">${ARTE[a.arte]}</svg></span><span class="carta-nome">${esc(t(a.nome))}</span><span class="carta-sub">${esc(t(estilo(id).nome))}</span></div>`;
    };
    function render() {
        if (!album) return;
        const n = estado.cartas.length;
        sub.textContent = completa()
            ? tf("Coleção completa! Seu código {codigo} já vai sozinho no pedido: {premio}.", { codigo: LOJA.colecao.codigo, premio: t(LOJA.colecao.premio) })
            : tf("Cada dia que você visita a loja, ganha uma carta. Junte as {total} e ganhe um código: {premio}. Você tem {n} de {total}.", { total: ORDEM.length, premio: t(LOJA.colecao.premio), n });
        album.innerHTML = ORDEM.map((id) => {
            const tem = estado.cartas.includes(id);
            return `<li class="album-carta${tem ? " tem" : ""}" aria-label="${tem ? t(ARCANOS[id].nome) : t("Carta ainda escondida")}">
                ${tem ? frente(id) : '<div class="carta-verso"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="11" class="coroa"/><circle cx="18" cy="14.5" r="10" class="disco"/></svg><span>' + t("volte amanhã") + '</span></div>'}
            </li>`;
        }).join("") + (completa() ? `<li class="album-codigo"><span>${t("código")}</span><b>${LOJA.colecao.codigo}</b></li>` : "");
    }
    function mostrar(id, primeira) {
        document.getElementById("arcanoAviso").textContent = t(primeira ? "Sua primeira visita trouxe uma carta ✦" : completa() ? "A última carta! Coleção completa ✦" : "Você voltou, e trouxe uma carta nova ✦");
        document.getElementById("arcanoRevelado").innerHTML = `<div class="carta"><div class="carta-dentro"><div class="carta-verso"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="11" class="coroa"/><circle cx="18" cy="14.5" r="10" class="disco"/></svg></div>${frente(id)}</div></div>`;
        document.getElementById("arcanoTitulo").textContent = t(ARCANOS[id].nome);
        document.getElementById("arcanoTexto").textContent = completa()
            ? tf("Seu código é {codigo}: {premio}. Ele já vai sozinho na mensagem do pedido.", { codigo: LOJA.colecao.codigo, premio: t(LOJA.colecao.premio) })
            : tf("{n} de {total} cartas. Volte amanhã pra próxima.", { n: estado.cartas.length, total: ORDEM.length });
        dlg.showModal();
        setTimeout(() => dlg.querySelector(".carta").classList.add("virada"), semMovimento ? 0 : 500);
    }
    dlg?.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
    document.addEventListener("idiomaMudou", render);

    /* visita de hoje: ganha uma carta que ainda não tem */
    let nova = null;
    if (estado.dia !== hojeChave() && !completa()) {
        const faltam = ORDEM.filter((id) => !estado.cartas.includes(id));
        nova = sortear(faltam);
        const primeira = estado.cartas.length === 0;
        estado.cartas.push(nova);
        estado.dia = hojeChave();
        guardar(CHAVE, estado);
        setTimeout(() => {
            avisar(primeira ? "🃏 Você ganhou sua primeira carta de arcano!" : "🃏 Carta nova na sua coleção!", { rotulo: "Ver carta", fazer: () => mostrar(nova, primeira) });
            atualizarLinkPedido();
        }, 2600);
    }
    render();
    return { nova, render };
})();

/* ========== 4. A Nyx: a gata da loja dá dicas, reage à sacola e dorme quando está tudo quieto ========== */
(function nyx() {
    const raiz = document.getElementById("nyx");
    const balao = document.getElementById("nyxBalao");
    const gato = document.getElementById("nyxGato");
    if (!raiz) return;
    const CHAVE_SONECA = "es-nyx-soneca";
    if (ler(CHAVE_SONECA, "") === hojeChave()) return; // mandaram ela cochilar hoje
    let tempoBalao = null, ultimaFala = 0;

    const DICAS = [
        () => tf("Frete grátis acima de {valor} na entrega em Campo Grande. Eu conferi 🐾", { valor: brl(LOJA.freteGratis) }),
        () => "Já tirou o tarô do look? As cartas não mentem (eu às vezes sim).",
        () => "Psiu… apaga as velas lá em cima. Tem um primo meu escondido no escuro.",
        () => tf("Lua de hoje: {fase}. Peça nova chega na lua cheia.", { fase: LUA.fase(Date.now()).toLowerCase() }),
        () => "Dizem que tem uma porta secreta aqui embaixo. A palavra sai nos close friends 👀",
        () => "Quer ganhar de presente? Monta a sacola e toca em “Pedir de presente”.",
        () => "Volta amanhã que tem carta de arcano nova pra você 🃏",
        () => "Já viu seu horóscopo alt de hoje? Muda todo dia.",
    ];
    const AO_CAIR = ["Mrrrau! Caiu no caldeirão ✦", "Boa escolha. Eu aprovo 🐾", "Hmm, essa combina com você.", "Ronronando aqui de felicidade."];

    function falar(texto, ms = 5200) {
        balao.innerHTML = `<span></span><button type="button" class="nyx-calar" aria-label="${t("Mandar a Nyx cochilar hoje")}">zzz</button>`;
        balao.firstElementChild.textContent = t(texto);
        balao.hidden = false;
        ultimaFala = Date.now();
        clearTimeout(tempoBalao);
        tempoBalao = setTimeout(() => { balao.hidden = true; }, ms);
    }
    function pular() {
        raiz.classList.remove("pulando");
        void raiz.offsetWidth;
        raiz.classList.add("pulando");
    }

    balao.addEventListener("click", (e) => {
        if (!e.target.closest(".nyx-calar")) return;
        guardar(CHAVE_SONECA, hojeChave());
        falar("Tá bom, vou cochilar. Até amanhã 😴", 1800);
        setTimeout(() => { raiz.hidden = true; }, 1900);
    });
    let dica = Math.floor(Math.random() * DICAS.length);
    gato.addEventListener("click", () => {
        pular();
        raiz.classList.add("ronrona");
        setTimeout(() => raiz.classList.remove("ronrona"), 1200);
        falar(DICAS[dica++ % DICAS.length]());
    });
    document.addEventListener("sacola:caiu", () => { pular(); falar(sortear(AO_CAIR), 2600); });
    /* fechou uma peça sem levar: a Nyx sugere outra da mesma vibe */
    let vista = null;
    document.addEventListener("click", (e) => { const a = e.target.closest("[data-abrir]"); if (a) vista = a.dataset.abrir; }, true);
    dlgProduto.addEventListener("close", () => {
        const p = vista && produto(vista);
        vista = null;
        if (!p || !p.estilos?.length || sacola.some((i) => i.id === p.id) || Date.now() - ultimaFala < 8000) return;
        const par = PRODUTOS.find((x) => x !== p && naVitrine(x) && disponivel(x) && x.estilos.some((e) => p.estilos.includes(e)) && x.cat !== p.cat);
        if (par) falar(tf("Pensando em {peca}? Combina demais com {par} ✦", { peca: t(p.nome), par: t(par.nome) }));
    });

    setTimeout(() => {
        raiz.hidden = false;
        const conhecida = ler("es-nyx-conhecida", false);
        setTimeout(() => falar(conhecida ? "Voltou! Senti sua falta 🐾" : "Miau. Eu sou a Nyx, a gata da loja 🐈‍⬛ Toca em mim que eu dou dicas."), 700);
        guardar("es-nyx-conhecida", true);
    }, COLECAO.nova ? 6500 : 3500);
    /* quieta por muito tempo: uma dica de vez em quando, sem encher */
    setInterval(() => {
        if (!raiz.hidden && !document.hidden && Date.now() - ultimaFala > 45000 && !document.querySelector("dialog[open]")) falar(DICAS[dica++ % DICAS.length]());
    }, 15000);
})();
