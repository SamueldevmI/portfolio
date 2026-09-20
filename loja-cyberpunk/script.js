"use strict";

/* ===== Configuração da loja: é só trocar aqui quando ela for de verdade ===== */
const LOJA = {
    nome: "GLITCH//DISTRICT",
    whatsapp: "5567996034205", // só números: 55 + DDD + número
    demo: true,                // true = a mensagem avisa que veio da loja de demonstração
};

/* ===== Catálogo (preço em centavos). Para usar foto real, troque o "img" ===== */
const ROUPA = ["P", "M", "G", "GG"];
const CALCADO = ["38", "39", "40", "41", "42", "43", "44"];
const CATEGORIAS = ["Casacos", "Camisetas", "Calças", "Calçados", "Acessórios"];

const PRODUTOS = [
    {
        id: "vx7", nome: "Corta-vento VX-7", cat: "Casacos", preco: 28990, tam: ROUPA, img: "corta-vento-vx7.svg",
        alt: "Corta-vento preto com capuz e detalhes neon ciano e magenta",
        resumo: "Capuz, 6 bolsos e fita neon",
        desc: "Corta-vento leve que segura vento e chuva fina, com capuz ajustável e zíper com fita neon. Feito pra andar de madrugada sem passar frio.",
        itens: ["Tecido leve que repele chuva fina", "Capuz com cordão de ajuste", "Bolsos com zíper no peito", "Barra ajustável"],
        busca: "jaqueta casaco capuz chuva vento windbreaker",
    },
    {
        id: "nexus", nome: "Bomber Cargo Nexus", cat: "Casacos", preco: 24990, tam: ROUPA, img: "bomber-cargo-nexus.svg",
        alt: "Bomber preta com bolsos cargo nas mangas e zíper amarelo",
        resumo: "Bolsos cargo nas mangas",
        desc: "Bomber curta com gola e barra de ribana, bolsos com aba no peito e um bolso cargo em cada manga pra levar o essencial.",
        itens: ["Zíper amarelo de destaque", "2 bolsos com aba no peito", "Bolso cargo em cada manga", "Gola, punhos e barra de ribana"],
        busca: "jaqueta casaco bomber cargo militar",
    },
    {
        id: "ghost", nome: "Moletom Zip Ghost", cat: "Casacos", preco: 19990, tam: ROUPA, img: "moletom-zip-ghost.svg",
        alt: "Moletom preto com capuz, zíper e listras neon magenta nas mangas",
        resumo: "Zíper, capuz e listras neon",
        desc: "Moletom com zíper inteiro, capuz grande e bolso canguru. As listras tracejadas nas mangas ficam vivas quando bate luz.",
        itens: ["Zíper inteiro na frente", "Bolso canguru", "Capuz com cordões", "Listras neon nas mangas"],
        busca: "moletom blusa capuz hoodie frio",
    },
    {
        id: "rig3", nome: "Colete Tático Rig-3", cat: "Casacos", preco: 15990, tam: ROUPA, img: "colete-tatico-rig3.svg",
        alt: "Colete preto com bolsos frontais e fivelas ciano",
        resumo: "4 bolsos frontais e fivelas",
        desc: "Colete pra usar por cima de tudo: quatro bolsos na frente, fechamento por zíper e fivelas nos ombros. Cabe celular, chaves e o que mais você levar.",
        itens: ["4 bolsos frontais com aba", "Zíper central", "Fivelas nos ombros", "Ajuste lateral"],
        busca: "colete tatico bolsos utilitario vest",
    },
    {
        id: "olho", nome: "Camiseta Olho Digital", cat: "Camisetas", preco: 8990, tam: ROUPA, img: "camiseta-olho.svg",
        alt: "Camiseta preta oversized com um olho neon estampado",
        resumo: "Oversized · estampa neon",
        desc: "Camiseta oversized de algodão com um olho digital estampado em ciano e magenta e barras de sinal embaixo.",
        itens: ["Modelagem oversized", "Algodão", "Estampa neon no peito"],
        busca: "camiseta camisa tshirt olho estampa",
    },
    {
        id: "sol", nome: "Camiseta Sunset Grid", cat: "Camisetas", preco: 8990, tam: ROUPA, img: "camiseta-sol.svg",
        alt: "Camiseta preta oversized com sol neon e grade no peito",
        resumo: "Oversized · sol e grade",
        desc: "Camiseta oversized com o sol retrô em degradê amarelo e rosa sobre uma grade ciano. Clássico do estilo synthwave.",
        itens: ["Modelagem oversized", "Algodão", "Estampa em degradê no peito"],
        busca: "camiseta camisa tshirt sol synthwave retro",
    },
    {
        id: "onyx", nome: "Calça Cargo Onyx", cat: "Calças", preco: 21990, tam: ROUPA, img: "calca-cargo-onyx.svg",
        alt: "Calça cargo preta com tiras amarelas nos joelhos",
        resumo: "Cargo com tiras nos joelhos",
        desc: "Calça cargo de corte reto com bolsos laterais com aba, tiras ajustáveis nos joelhos e uma tira solta na cintura, do jeito techwear.",
        itens: ["Bolsos cargo com aba", "Tiras amarelas nos joelhos", "Tira solta na cintura", "Barra com detalhe neon"],
        busca: "calca cargo tatica bolsos pants",
    },
    {
        id: "nightwalker", nome: "Bota Nightwalker", cat: "Calçados", preco: 34990, tam: CALCADO, img: "bota-nightwalker.svg",
        alt: "Bota tática preta com fivela amarela e cadarço neon magenta",
        resumo: "Cano alto, fivela e sola grossa",
        desc: "Bota de cano alto com cadarço neon, fivela na altura do tornozelo e sola grossa com luz de fundo em ciano.",
        itens: ["Cano alto", "Cadarço neon", "Fivela de ajuste", "Sola grossa antiderrapante"],
        busca: "bota coturno calcado sapato tenis boot",
    },
    {
        id: "filterx", nome: "Máscara Filter-X", cat: "Acessórios", preco: 7990, tam: null, img: "mascara-filter-x.svg",
        alt: "Máscara respirador com dois filtros que brilham em ciano e magenta",
        resumo: "Dois filtros que brilham",
        desc: "Máscara estilo respirador com dois filtros laterais que brilham em ciano e magenta e grade frontal. Vai bem com qualquer jaqueta escura.",
        itens: ["Filtros laterais luminosos", "Tiras elásticas ajustáveis", "Tamanho único"],
        busca: "mascara respirador filtro acessorio",
    },
    {
        id: "pulse", nome: "Viseira Pulse", cat: "Acessórios", preco: 11990, tam: null, img: "viseira-pulse.svg",
        alt: "Viseira curva com lente em degradê ciano e magenta",
        resumo: "Lente em degradê neon",
        desc: "Viseira curva que envolve o rosto, com lente em degradê de ciano pra magenta. O visual mais cyberpunk da coleção.",
        itens: ["Lente curva em degradê", "Hastes ajustáveis", "Tamanho único"],
        busca: "viseira oculos lente visor acessorio",
    },
    {
        id: "cross", nome: "Harness Cross-Strap", cat: "Acessórios", preco: 9990, tam: null, img: "harness-cross.svg",
        alt: "Harness de tiras cruzadas com argola central amarela",
        resumo: "Tiras cruzadas e argola",
        desc: "Harness de tiras cruzadas com argola amarela no centro e fivelas nas pontas. Usa por cima da jaqueta ou da camiseta.",
        itens: ["Tiras cruzadas ajustáveis", "Argola central", "Fivelas de encaixe", "Tamanho único"],
        busca: "harness cinto tiras peitoral acessorio",
    },
    {
        id: "sling", nome: "Bolsa Sling Null", cat: "Acessórios", preco: 12990, tam: null, img: "bolsa-sling-null.svg",
        alt: "Bolsa transversal preta com zíper magenta",
        resumo: "Transversal com zíper neon",
        desc: "Bolsa transversal compacta com zíper magenta, bolso frontal e fivela de encaixe. Leva celular, carteira e fone.",
        itens: ["Alça transversal ajustável", "Bolso frontal", "Zíper neon", "Tamanho único"],
        busca: "bolsa mochila transversal shoulder bag sling acessorio",
    },
];

/* ===== Utilidades ===== */
const $ = (seletor) => document.querySelector(seletor);
const produto = (id) => PRODUTOS.find((p) => p.id === id);
const esc = (texto) => String(texto).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const brl = (centavos) => (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }).replace(/ /g, " ");
const normalizar = (texto) => String(texto).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const codigo = (id) => "GD-" + String(PRODUTOS.findIndex((p) => p.id === id) + 1).padStart(2, "0");

function ler(chave, padrao) {
    try {
        const valor = localStorage.getItem(chave);
        return valor ? JSON.parse(valor) : padrao;
    } catch (erro) {
        return padrao;
    }
}
function guardar(chave, valor) {
    try { localStorage.setItem(chave, JSON.stringify(valor)); } catch (erro) { /* navegador sem armazenamento: segue sem salvar */ }
}

/* ===== Estado ===== */
const CHAVE_CARRINHO = "gd-carrinho-v1";
const CHAVE_NOME = "gd-nome";
const MAX_POR_ITEM = 9;

const itemValido = (i) => {
    const p = i && produto(i.id);
    if (!p) return false;
    const tamOk = p.tam ? p.tam.includes(i.tam) : i.tam === "";
    return tamOk && Number.isInteger(i.qtd) && i.qtd >= 1 && i.qtd <= MAX_POR_ITEM;
};
let carrinho = ler(CHAVE_CARRINHO, []);
carrinho = Array.isArray(carrinho) ? carrinho.filter(itemValido) : [];

const filtro = { cat: "todos", q: "", ordem: "padrao" };

/* ===== Elementos ===== */
const grade = $("#grade");
const chipsEl = $("#chips");
const contagemEl = $("#contagem");
const vazioEl = $("#vazio");
const buscaEl = $("#busca");
const ordemEl = $("#ordem");
const dlgProduto = $("#dialogoProduto");
const dlgCarrinho = $("#carrinho");
const itensEl = $("#itens");
const carrinhoVazioEl = $("#carrinhoVazio");
const carrinhoRodapeEl = $("#carrinhoRodape");
const totalEl = $("#total");
const botaoCarrinho = $("#abrirCarrinho");
const contadorEl = $("#contadorCarrinho");
const campoNome = $("#campoNome");
const campoObs = $("#campoObs");
const previaEl = $("#previa");
const enviarEl = $("#enviarZap");
const notaEl = $("#nota");
const avisosEl = $("#avisos");
const NOTA_PADRAO = notaEl.textContent;

document.querySelectorAll("[data-nome-loja]").forEach((el) => { el.textContent = LOJA.nome; });
campoNome.value = ler(CHAVE_NOME, "");

/* ===== Catálogo na tela ===== */
function tamanhosHtml(p, prefixo) {
    if (!p.tam) return `<p class="tam-unico">Tamanho único</p>`;
    const opcoes = p.tam.map((t) => `<label class="tam"><input type="radio" name="${prefixo}-${p.id}" value="${t}"><span>${t}</span></label>`).join("");
    return `<fieldset class="tamanhos"><legend>Tamanho</legend>${opcoes}</fieldset><p class="dica" role="alert" hidden>Escolha um tamanho.</p>`;
}

function cardHtml(p, indice) {
    return `<li class="card" data-id="${p.id}" style="--i:${indice}">
        <button class="card-imagem" type="button" data-abrir="${p.id}" aria-label="Ver detalhes de ${esc(p.nome)}">
            <img src="produtos/${p.img}" alt="" width="400" height="400" loading="lazy">
            <span class="cod">${codigo(p.id)}</span>
        </button>
        <div class="card-corpo">
            <p class="card-cat">${esc(p.cat)}</p>
            <h3 class="card-nome"><button type="button" class="card-nome-botao" data-abrir="${p.id}">${esc(p.nome)}</button></h3>
            <p class="card-resumo">${esc(p.resumo)}</p>
            <p class="card-preco">${brl(p.preco)}</p>
            ${tamanhosHtml(p, "tam")}
            <button class="botao botao-neon botao-cheio" type="button" data-add="${p.id}">Adicionar</button>
        </div>
    </li>`;
}

function produtosVisiveis() {
    const q = normalizar(filtro.q.trim());
    const lista = PRODUTOS.filter((p) => {
        if (filtro.cat !== "todos" && p.cat !== filtro.cat) return false;
        return !q || normalizar(`${p.nome} ${p.cat} ${p.resumo} ${p.busca}`).includes(q);
    });
    if (filtro.ordem === "menor") lista.sort((a, b) => a.preco - b.preco);
    if (filtro.ordem === "maior") lista.sort((a, b) => b.preco - a.preco);
    if (filtro.ordem === "nome") lista.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    return lista;
}

function renderChips() {
    const nomes = ["todos", ...CATEGORIAS];
    chipsEl.innerHTML = nomes.map((nome) => {
        const total = nome === "todos" ? PRODUTOS.length : PRODUTOS.filter((p) => p.cat === nome).length;
        const rotulo = nome === "todos" ? "Todos" : nome;
        return `<button type="button" class="chip" data-cat="${nome}" aria-pressed="${filtro.cat === nome}">${rotulo}<small>${total}</small></button>`;
    }).join("");
}

function renderGrade() {
    const lista = produtosVisiveis();
    grade.innerHTML = lista.map(cardHtml).join("");
    grade.hidden = lista.length === 0;
    vazioEl.hidden = lista.length !== 0;
    contagemEl.textContent = lista.length === 1 ? "1 produto" : lista.length + " produtos";
}

/* ===== Produto em detalhe ===== */
function abrirProduto(id) {
    const p = produto(id);
    if (!p) return;
    dlgProduto.innerHTML = `<div class="dp">
        <button class="fechar" type="button" data-fechar aria-label="Fechar">×</button>
        <div class="dp-imagem"><img src="produtos/${p.img}" alt="${esc(p.alt)}" width="400" height="400"></div>
        <div class="dp-info" data-escopo>
            <p class="card-cat">${esc(p.cat)} · ${codigo(p.id)}</p>
            <h2 id="produtoTitulo">${esc(p.nome)}</h2>
            <p class="card-preco">${brl(p.preco)}</p>
            <p class="dp-desc">${esc(p.desc)}</p>
            <ul class="dp-itens">${p.itens.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
            ${tamanhosHtml(p, "dlg")}
            <button class="botao botao-neon botao-cheio" type="button" data-add="${p.id}">Adicionar ao carrinho</button>
        </div>
    </div>`;
    dlgProduto.showModal();
}

/* ===== Carrinho ===== */
const chaveDe = (i) => i.id + "|" + i.tam;
const totalCentavos = () => carrinho.reduce((soma, i) => soma + produto(i.id).preco * i.qtd, 0);
const totalItens = () => carrinho.reduce((soma, i) => soma + i.qtd, 0);
const rotuloTam = (i) => (i.tam ? "Tamanho " + i.tam : "Tamanho único");

function montarMensagem() {
    const linhas = [`Olá! Quero fazer este pedido na ${LOJA.nome}:`, ""];
    carrinho.forEach((i) => {
        const p = produto(i.id);
        linhas.push(`• ${i.qtd}x ${p.nome}${i.tam ? " (" + i.tam + ")" : ""} — ${brl(p.preco * i.qtd)}`);
    });
    linhas.push("", `*Total: ${brl(totalCentavos())}*`);
    const nome = campoNome.value.trim();
    const obs = campoObs.value.trim();
    if (nome) linhas.push(`Nome: ${nome}`);
    if (obs) linhas.push(`Obs.: ${obs}`);
    if (LOJA.demo) linhas.push("", "_(Pedido de teste da loja de demonstração do portfólio)_");
    return linhas.join("\n");
}

function itemHtml(i) {
    const p = produto(i.id);
    const nomeCompleto = `${p.nome}, ${rotuloTam(i)}`;
    return `<li class="item" data-chave="${chaveDe(i)}">
        <img src="produtos/${p.img}" alt="" width="72" height="72">
        <div class="item-info">
            <p class="item-nome">${esc(p.nome)}</p>
            <p class="item-tam">${rotuloTam(i)} · ${brl(p.preco)}</p>
            <div class="qtd">
                <button type="button" data-menos aria-label="Diminuir a quantidade: ${esc(nomeCompleto)}"${i.qtd <= 1 ? " disabled" : ""}>−</button>
                <span class="qtd-valor" aria-label="Quantidade">${i.qtd}</span>
                <button type="button" data-mais aria-label="Aumentar a quantidade: ${esc(nomeCompleto)}"${i.qtd >= MAX_POR_ITEM ? " disabled" : ""}>+</button>
            </div>
        </div>
        <div class="item-lado">
            <strong>${brl(p.preco * i.qtd)}</strong>
            <button type="button" class="item-remover" data-remover aria-label="Remover do carrinho: ${esc(nomeCompleto)}">Remover</button>
        </div>
    </li>`;
}

function atualizarLinkPedido() {
    if (!carrinho.length) return;
    const mensagem = montarMensagem();
    previaEl.textContent = mensagem;
    enviarEl.href = `https://wa.me/${LOJA.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}

function renderCarrinho() {
    const vazio = carrinho.length === 0;
    const quantidade = totalItens();
    itensEl.innerHTML = carrinho.map(itemHtml).join("");
    carrinhoVazioEl.hidden = !vazio;
    carrinhoRodapeEl.hidden = vazio;
    totalEl.textContent = brl(totalCentavos());
    contadorEl.hidden = vazio;
    contadorEl.textContent = quantidade;
    botaoCarrinho.setAttribute("aria-label", vazio ? "Abrir carrinho, vazio" : `Abrir carrinho, ${quantidade} ${quantidade === 1 ? "item" : "itens"}`);
    atualizarLinkPedido();
    guardar(CHAVE_CARRINHO, carrinho);
}

function avisar(texto, acao) {
    const aviso = document.createElement("div");
    aviso.className = "aviso";
    const span = document.createElement("span");
    span.textContent = texto;
    aviso.appendChild(span);
    if (acao) {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.textContent = acao.rotulo;
        botao.addEventListener("click", () => { aviso.remove(); acao.fazer(); });
        aviso.appendChild(botao);
    }
    avisosEl.appendChild(aviso);
    while (avisosEl.children.length > 2) avisosEl.firstElementChild.remove();
    setTimeout(() => aviso.remove(), 3600);
}

function pedirTamanho(escopo) {
    const grupo = escopo.querySelector(".tamanhos");
    const dica = escopo.querySelector(".dica");
    grupo.classList.remove("erro");
    void grupo.offsetWidth; // reinicia a animação de tremer
    grupo.classList.add("erro");
    if (dica) dica.hidden = false;
    grupo.querySelector("input").focus();
}

function adicionar(id, escopo) {
    const p = produto(id);
    let tam = "";
    if (p.tam) {
        const marcado = escopo.querySelector("input[type=radio]:checked");
        if (!marcado) { pedirTamanho(escopo); return; }
        tam = marcado.value;
    }
    const existente = carrinho.find((i) => i.id === id && i.tam === tam);
    if (existente && existente.qtd >= MAX_POR_ITEM) {
        if (dlgProduto.open) dlgProduto.close(); // o aviso fica atrás de um diálogo aberto
        avisar(`Máximo de ${MAX_POR_ITEM} por peça. Para mais, combine no WhatsApp.`);
        return;
    }
    if (existente) existente.qtd += 1; else carrinho.push({ id, tam, qtd: 1 });
    if (dlgProduto.open) dlgProduto.close();
    renderCarrinho();
    botaoCarrinho.classList.remove("bump");
    void botaoCarrinho.offsetWidth;
    botaoCarrinho.classList.add("bump");
    avisar(`Adicionado: ${p.nome}${tam ? " (" + tam + ")" : ""}`, { rotulo: "Ver carrinho", fazer: () => dlgCarrinho.showModal() });
}

function mudarQuantidade(chave, delta) {
    const item = carrinho.find((i) => chaveDe(i) === chave);
    if (!item) return;
    item.qtd = Math.min(MAX_POR_ITEM, Math.max(1, item.qtd + delta));
    renderCarrinho();
    const seletor = delta > 0 ? "[data-mais]" : "[data-menos]";
    const alvo = itensEl.querySelector(`[data-chave="${chave}"] ${seletor}`) || itensEl.querySelector(`[data-chave="${chave}"] [data-mais]`);
    if (alvo) alvo.focus();
}

function removerItem(chave) {
    carrinho = carrinho.filter((i) => chaveDe(i) !== chave);
    renderCarrinho();
    const proximo = itensEl.querySelector("[data-remover]") || carrinhoVazioEl.querySelector("button");
    if (proximo) proximo.focus();
}

/* ===== Eventos ===== */
document.addEventListener("click", (e) => {
    const abrir = e.target.closest("[data-abrir]");
    if (abrir) { abrirProduto(abrir.dataset.abrir); return; }

    const add = e.target.closest("[data-add]");
    if (add) {
        const escopo = add.closest("[data-escopo], .card");
        adicionar(add.dataset.add, escopo);
        return;
    }

    const fechar = e.target.closest("[data-fechar]");
    if (fechar) fechar.closest("dialog").close();
});

document.addEventListener("change", (e) => {
    if (!e.target.matches(".tam input")) return;
    const escopo = e.target.closest("[data-escopo], .card");
    const dica = escopo && escopo.querySelector(".dica");
    if (dica) dica.hidden = true;
});

[dlgProduto, dlgCarrinho].forEach((dialogo) => {
    dialogo.addEventListener("click", (e) => { if (e.target === dialogo) dialogo.close(); });
});

botaoCarrinho.addEventListener("click", () => dlgCarrinho.showModal());

chipsEl.addEventListener("click", (e) => {
    const botao = e.target.closest("[data-cat]");
    if (!botao) return;
    filtro.cat = botao.dataset.cat;
    renderChips();
    renderGrade();
    chipsEl.querySelector(`[data-cat="${filtro.cat}"]`).focus();
});
buscaEl.addEventListener("input", () => { filtro.q = buscaEl.value; renderGrade(); });
ordemEl.addEventListener("change", () => { filtro.ordem = ordemEl.value; renderGrade(); });
$("#limparFiltros").addEventListener("click", () => {
    filtro.cat = "todos"; filtro.q = ""; filtro.ordem = "padrao";
    buscaEl.value = ""; ordemEl.value = "padrao";
    renderChips();
    renderGrade();
});

itensEl.addEventListener("click", (e) => {
    const linha = e.target.closest(".item");
    if (!linha) return;
    const chave = linha.dataset.chave;
    if (e.target.closest("[data-mais]")) mudarQuantidade(chave, 1);
    else if (e.target.closest("[data-menos]")) mudarQuantidade(chave, -1);
    else if (e.target.closest("[data-remover]")) removerItem(chave);
});

campoNome.addEventListener("input", () => { guardar(CHAVE_NOME, campoNome.value); atualizarLinkPedido(); });
campoObs.addEventListener("input", atualizarLinkPedido);

$("#esvaziar").addEventListener("click", () => {
    carrinho = [];
    renderCarrinho();
    carrinhoVazioEl.querySelector("button").focus();
});

$("#copiarPedido").addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(montarMensagem());
        notaEl.textContent = "Pedido copiado. Cole na conversa que quiser.";
    } catch (erro) {
        notaEl.textContent = "Não consegui copiar. Abra a mensagem acima e copie manualmente.";
        previaEl.closest("details").open = true;
    }
    setTimeout(() => { notaEl.textContent = NOTA_PADRAO; }, 4000);
});

enviarEl.addEventListener("click", () => {
    notaEl.textContent = "Abrindo o WhatsApp com o pedido pronto…";
    setTimeout(() => { notaEl.textContent = NOTA_PADRAO; }, 4000);
});

/* ===== Início ===== */
renderChips();
renderGrade();
renderCarrinho();
