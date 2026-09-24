"use strict";

/* ===== Configuração da loja: é só trocar aqui quando ela for de verdade ===== */
const LOJA = {
    nome: "GLITCH//DISTRICT",
    whatsapp: "5567996034205", // só números: 55 + DDD + número
    demo: true,                // true = a mensagem avisa que veio da loja de demonstração
};

/* Demo com o nome do negócio de quem está vendo: o portfólio abre a loja com ?nome=Loja da Maria */
const NOME_VISITANTE = (new URLSearchParams(location.search).get("nome") || "").trim().slice(0, 40);
if (NOME_VISITANTE) {
    LOJA.nome = NOME_VISITANTE.toUpperCase();
    document.title = NOME_VISITANTE + " — Loja online (demonstração)";
    const icone = document.querySelector(".logo-icone");
    if (icone) icone.textContent = NOME_VISITANTE.charAt(0).toUpperCase();
    document.querySelector(".logo")?.setAttribute("aria-label", NOME_VISITANTE + ", início");
}

/* ===== Catálogo (preço em centavos). Fotos do Pexels (licença livre); "pos" e "zoom" enquadram a peça no quadrado ===== */
const ROUPA = ["P", "M", "G", "GG"];
const CALCADO = ["38", "39", "40", "41", "42", "43", "44"];
const CATEGORIAS = ["Casacos", "Camisetas", "Camadas", "Calças", "Calçados", "Acessórios"];

const PRODUTOS = [
    {
        id: "vx7", nome: "Parka VX-7", cat: "Casacos", preco: 28990, tam: ROUPA, img: "fotos/vx7.webp", pos: "50% 52%", zoom: 1.9,
        alt: "Parka preta acolchoada pendurada numa arara",
        resumo: "Acolchoada · capuz · bolsos fundos",
        desc: "Parka acolchoada que segura o frio de verdade, com capuz e bolsos fundos pra esquentar a mão. Vai do joelho pra cima e combina com tudo da coleção.",
        itens: ["Enchimento leve e quente", "Capuz fixo", "Bolsos laterais fundos", "Zíper e botões de pressão"],
        busca: "jaqueta casaco parka frio puffer acolchoado",
    },
    {
        id: "nexus", nome: "Jaqueta Puffer Nexus", cat: "Casacos", preco: 24990, tam: ROUPA, img: "fotos/nexus.webp", pos: "50% 78%", zoom: 1.1,
        alt: "Jaqueta puffer preta de gola alta vestida por uma modelo",
        resumo: "Puffer curta · gola alta",
        desc: "Puffer curta de gomos largos e gola alta que fecha até o queixo. Leve pra carregar, quente pra usar à noite.",
        itens: ["Gomos largos acolchoados", "Gola alta", "Punho com elástico", "Bolsos com zíper"],
        busca: "jaqueta casaco puffer frio acolchoado",
    },
    {
        id: "ghost", nome: "Moletom Ghost", cat: "Casacos", preco: 19990, tam: ROUPA, img: "fotos/ghost.webp", pos: "50% 50%", zoom: 1,
        alt: "Moletom preto de capuz com cordão branco e bolso canguru",
        resumo: "Capuz · cordão contrastante",
        desc: "Moletom de capuz em algodão felpado, com cordão branco contrastante e bolso canguru. O básico que vai com tudo.",
        itens: ["Algodão felpado por dentro", "Capuz com cordão branco", "Bolso canguru", "Punho e barra de ribana"],
        busca: "moletom blusa capuz hoodie frio",
    },
    {
        id: "rig3", nome: "Colete Puffer Rig-3", cat: "Casacos", preco: 15990, tam: ROUPA, img: "fotos/rig3.webp", pos: "50% 48%", zoom: 1.5,
        alt: "Colete puffer preto sem mangas por cima de camisa branca",
        resumo: "Sem manga · acolchoado",
        desc: "Colete acolchoado pra usar por cima de camisa, moletom ou jaqueta leve. Esquenta o tronco sem prender os braços.",
        itens: ["Acolchoado leve", "Gola alta", "Zíper central", "Bolsos laterais"],
        busca: "colete puffer vest sem manga acolchoado",
    },
    {
        id: "blackout", nome: "Trench Blackout", cat: "Casacos", preco: 39990, tam: ROUPA, img: "fotos/blackout.webp", pos: "50% 52%", zoom: 1.9, novo: true,
        alt: "Homem de trench coat preto comprido em frente a um prédio claro",
        resumo: "Comprido · abotoado · elegante",
        desc: "Trench coat preto comprido, com gola larga e abotoamento duplo. Deixa qualquer roupa com cara de \"vou num lugar importante\".",
        itens: ["Comprimento abaixo do joelho", "Abotoamento duplo", "Gola larga", "Forro leve"],
        busca: "trench coat casaco sobretudo comprido",
    },
    {
        id: "olho", nome: "Camiseta Void", cat: "Camisetas", preco: 8990, tam: ROUPA, img: "fotos/olho.webp", pos: "50% 50%", zoom: 1.05,
        alt: "Camiseta preta lisa pendurada num cabide contra uma parede clara",
        resumo: "Básica · algodão pesado",
        desc: "A camiseta preta perfeita: algodão pesado que não fica transparente, gola que não laceia e caimento reto.",
        itens: ["Algodão 100% fio 30", "Gola em ribana reforçada", "Caimento reto", "Não desbota na lavagem"],
        busca: "camiseta tshirt basica lisa preta",
    },
    {
        id: "sol", nome: "Camiseta Oversized Grid", cat: "Camisetas", preco: 8990, tam: ROUPA, img: "fotos/sol.webp", pos: "45% 50%", zoom: 1.15,
        alt: "Homem de camiseta preta oversized com estampa tom sobre tom",
        resumo: "Oversized · estampa tom sobre tom",
        desc: "Camiseta de modelagem ampla com estampa em preto sobre preto, que só aparece quando bate a luz. Discreta de longe, detalhe de perto.",
        itens: ["Modelagem oversized", "Estampa tom sobre tom", "Algodão pesado", "Ombro caído"],
        busca: "camiseta tshirt oversized estampa",
    },
    {
        id: "nyx", nome: "Blusa Gola Alta Nyx", cat: "Camadas", preco: 13990, tam: ROUPA, img: "fotos/nyx.webp", pos: "50% 45%", zoom: 1,
        alt: "Homem de blusa preta de gola alta com os braços cruzados",
        resumo: "Justa · gola alta · manga longa",
        desc: "Blusa de gola alta em malha canelada, justa no corpo. Funciona sozinha ou por baixo do trench e da parka.",
        itens: ["Malha canelada", "Gola alta dobrada", "Manga longa", "Caimento justo"],
        busca: "blusa gola alta turtleneck manga longa segunda pele",
    },
    {
        id: "circuit", nome: "Manga Longa Circuit", cat: "Camadas", preco: 10990, tam: ROUPA, img: "fotos/circuit.webp", pos: "50% 40%", zoom: 1,
        alt: "Homem de camiseta preta de manga longa justa",
        resumo: "Manga longa · justa",
        desc: "Camiseta de manga longa em malha com elastano, justa sem apertar. Primeira camada pra dias frios e boa sozinha nos mornos.",
        itens: ["Malha com elastano", "Gola careca", "Manga longa", "Caimento justo"],
        busca: "camiseta manga longa blusa justa",
    },
    {
        id: "onyx", nome: "Calça Cargo Onyx", cat: "Calças", preco: 21990, tam: ROUPA, img: "fotos/onyx.webp", pos: "52% 80%", zoom: 1.9,
        alt: "Homem de calça cargo preta larga e moletom branco",
        resumo: "Cargo larga · 6 bolsos",
        desc: "Calça cargo de modelagem larga em sarja resistente, com bolsos laterais grandes e barra que cai por cima do tênis.",
        itens: ["Sarja resistente", "6 bolsos", "Modelagem larga", "Cós com passante"],
        busca: "calca cargo bolsos larga preta",
    },
    {
        id: "jogger", nome: "Calça Cargo Stone", cat: "Calças", preco: 18990, tam: ROUPA, img: "fotos/jogger.webp", pos: "55% 72%", zoom: 1.35,
        alt: "Homem de calça cargo cinza-chumbo larga em estúdio claro",
        resumo: "Cargo · lavagem stone",
        desc: "A irmã cinza-chumbo da Onyx: mesma modelagem larga, em jeans com lavagem stone que fica com cara de usada desde o primeiro dia.",
        itens: ["Jeans com lavagem stone", "Bolsos cargo laterais", "Modelagem larga", "Barra desfiada"],
        busca: "calca cargo jeans cinza larga",
    },
    {
        id: "reflect", nome: "Calça Wide Reflect", cat: "Calças", preco: 23990, tam: ROUPA, img: "fotos/reflect.webp", pos: "35% 60%", zoom: 1.25,
        alt: "Modelo de roupa preta com calça larga posando numa cadeira",
        resumo: "Larga · cintura alta",
        desc: "Calça de alfaiataria larga e de cintura alta, em tecido que não amassa. Fica bem com tênis, bota ou salto.",
        itens: ["Tecido que não amassa", "Cintura alta", "Perna larga", "Bolsos faca"],
        busca: "calca wide larga alfaiataria cintura alta",
    },
    {
        id: "nightwalker", nome: "Bota Nightwalker", cat: "Calçados", preco: 34990, tam: CALCADO, img: "fotos/nightwalker.webp", pos: "50% 62%", zoom: 1.15,
        alt: "Bota coturno preta pisando numa poça",
        resumo: "Coturno · sola tratorada",
        desc: "Coturno de cano médio em couro, com sola tratorada que segura bem na chuva. Feito pra durar anos.",
        itens: ["Couro legítimo", "Sola tratorada", "Cadarço e ilhoses de metal", "Palmilha acolchoada"],
        busca: "bota coturno couro calcado",
    },
    {
        id: "volt", nome: "Tênis Cano Alto Volt", cat: "Calçados", preco: 26990, tam: CALCADO, img: "fotos/volt.webp", pos: "50% 50%", zoom: 1.05,
        alt: "Par de tênis pretos de cano alto em lona com sola branca",
        resumo: "Lona · cano alto",
        desc: "Tênis de cano alto em lona, com biqueira e sola de borracha branca. O clássico que vai com a coleção inteira.",
        itens: ["Lona resistente", "Sola de borracha", "Cano alto", "Ilhoses laterais de ventilação"],
        busca: "tenis sneaker cano alto lona calcado",
    },
    {
        id: "static", nome: "Bota Verniz Static", cat: "Calçados", preco: 27990, tam: CALCADO, img: "fotos/static.webp", pos: "50% 55%", zoom: 1.05,
        alt: "Par de botas pretas de verniz com cadarço e sola tratorada em fundo branco",
        resumo: "Verniz · sola tratorada",
        desc: "Bota de verniz com cadarço, zíper lateral e sola tratorada alta. Brilha na medida certa e dá uns 4 cm de altura.",
        itens: ["Verniz sintético", "Zíper lateral", "Sola tratorada de 4 cm", "Cadarço encerado"],
        busca: "bota verniz coturno calcado",
    },
    {
        id: "filterx", nome: "Máscara Filter-X", cat: "Acessórios", preco: 7990, tam: null, img: "fotos/filterx.webp", pos: "55% 45%", zoom: 1.2,
        alt: "Pessoa de moletom preto com capuz e máscara preta de tecido",
        resumo: "Tecido duplo · lavável",
        desc: "Máscara de tecido duplo com ajuste no nariz e elástico macio atrás da orelha. Lava na máquina e não perde a forma.",
        itens: ["Tecido duplo", "Ajuste no nariz", "Elástico macio", "Lavável"],
        busca: "mascara rosto tecido acessorio",
    },
    {
        id: "pulse", nome: "Óculos Pulse", cat: "Acessórios", preco: 11990, tam: null, img: "fotos/pulse.webp", pos: "52% 50%", zoom: 1.35,
        alt: "Óculos escuros aviador de lente escura apoiados numa superfície",
        resumo: "Aviador · lente escura",
        desc: "Óculos aviador de armação metálica fina e lente escura com proteção UV400. Vem com estojo rígido.",
        itens: ["Armação metálica", "Lente com proteção UV400", "Plaquetas ajustáveis", "Estojo rígido"],
        busca: "oculos sol aviador acessorio",
    },
    {
        id: "cross", nome: "Boné Cross", cat: "Acessórios", preco: 9990, tam: null, img: "fotos/cross.webp", pos: "50% 22%", zoom: 1.1,
        alt: "Homem de boné preto e óculos escuros",
        resumo: "Aba curva · ajuste atrás",
        desc: "Boné de aba curva em sarja preta, com ajuste de metal atrás. Sem logo gigante: só o bordado pequeno na lateral.",
        itens: ["Sarja de algodão", "Aba curva", "Fecho de metal ajustável", "Bordado discreto"],
        busca: "bone cap chapeu acessorio",
    },
    {
        id: "sling", nome: "Mochila Null", cat: "Acessórios", preco: 12990, tam: null, img: "fotos/sling.webp", pos: "50% 55%", zoom: 1.2,
        alt: "Mochila preta de couro sintético segurada pela alça",
        resumo: "Couro sintético · 15 L",
        desc: "Mochila compacta de 15 litros em couro sintético, com bolso interno pra notebook de até 14 polegadas.",
        itens: ["Couro sintético impermeável", "Bolso pra notebook 14\"", "Alças acolchoadas", "Bolso frontal com zíper"],
        busca: "mochila bolsa bag acessorio",
    },
];

/* ===== Looks prontos: combos de peças que já combinam entre si, um clique adiciona tudo ===== */
const LOOKS = [
    {
        id: "nightwalker-set", nome: "Look Nightwalker",
        desc: "Bota, calça e colete pra sair sem pensar duas vezes.",
        itens: [{ id: "nightwalker", tam: "41" }, { id: "onyx", tam: "M" }, { id: "rig3", tam: "M" }],
    },
    {
        id: "ghost-run-set", nome: "Look Ghost Run",
        desc: "Moletom, óculos e mochila pra andar leve.",
        itens: [{ id: "ghost", tam: "M" }, { id: "pulse", tam: "" }, { id: "sling", tam: "" }],
    },
    {
        id: "blackout-set", nome: "Look Blackout",
        desc: "O trench novo com o tênis de cano alto e a máscara.",
        itens: [{ id: "blackout", tam: "M" }, { id: "volt", tam: "40" }, { id: "filterx", tam: "" }],
    },
];

/* ===== Utilidades ===== */
const $ = (seletor) => document.querySelector(seletor);
const produto = (id) => PRODUTOS.find((p) => p.id === id);
const esc = (texto) => String(texto).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const brl = (centavos) => (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }).replace(/\u00a0/g, " ");
const normalizar = (texto) => String(texto).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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
const looksEl = $("#looks");
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

/* Enquadramento da foto no quadrado: onde focar e quanto aproximar */
function fotoEstilo(p) {
    return `style="object-position:${p.pos || "50% 50%"};--zoom:${p.zoom || 1};transform-origin:${p.pos || "50% 50%"}"`;
}

function cardHtml(p, indice) {
    return `<li class="card" data-id="${p.id}" data-cat="${esc(p.cat)}" style="--i:${indice}">
        <button class="card-imagem" type="button" data-abrir="${p.id}" aria-label="Ver detalhes de ${esc(p.nome)}${p.novo ? ", peça nova" : ""}">
            <img src="produtos/${p.img}" alt="" width="400" height="400" loading="lazy" decoding="async" ${fotoEstilo(p)}>
            ${p.novo ? '<span class="selo-novo">Novo</span>' : ""}
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

/* ===== Looks prontos na tela ===== */
const lookPrecoTotal = (look) => look.itens.reduce((soma, i) => soma + produto(i.id).preco, 0);

function lookHtml(look) {
    const imagens = look.itens.map((i) => `<img src="produtos/${produto(i.id).img}" alt="${esc(produto(i.id).nome)}" width="90" height="90" loading="lazy" ${fotoEstilo(produto(i.id))}>`).join("");
    const nomes = look.itens.map((i) => produto(i.id).nome).join(" + ");
    return `<li class="look-card">
        <div class="look-imagens">${imagens}</div>
        <div class="look-corpo">
            <h3>${esc(look.nome)}</h3>
            <p class="look-desc">${esc(look.desc)}</p>
            <p class="look-pecas">${esc(nomes)}</p>
            <p class="card-preco">${brl(lookPrecoTotal(look))}</p>
            <button class="botao botao-neon botao-cheio" type="button" data-look-add="${look.id}">Adicionar look completo</button>
        </div>
    </li>`;
}

function renderLooks() {
    if (!looksEl) return;
    looksEl.innerHTML = LOOKS.map(lookHtml).join("");
}

function adicionarLook(lookId) {
    const look = LOOKS.find((l) => l.id === lookId);
    if (!look) return;
    let algumNoMaximo = false;
    look.itens.forEach((i) => {
        const existente = carrinho.find((x) => x.id === i.id && x.tam === i.tam);
        if (existente) {
            if (existente.qtd < MAX_POR_ITEM) existente.qtd += 1; else algumNoMaximo = true;
        } else {
            carrinho.push({ id: i.id, tam: i.tam, qtd: 1 });
        }
    });
    renderCarrinho();
    botaoCarrinho.classList.remove("bump");
    void botaoCarrinho.offsetWidth;
    botaoCarrinho.classList.add("bump");
    const rotulo = `Look adicionado: ${look.itens.length} peças${algumNoMaximo ? " (uma já estava no máximo por peça)" : ""}`;
    avisar(rotulo, { rotulo: "Ver carrinho", fazer: () => dlgCarrinho.showModal() });
}

/* ===== Produto em detalhe ===== */
function abrirProduto(id) {
    const p = produto(id);
    if (!p) return;
    dlgProduto.innerHTML = `<div class="dp">
        <button class="fechar" type="button" data-fechar aria-label="Fechar">×</button>
        <div class="dp-imagem"><img src="produtos/${p.img}" alt="${esc(p.alt)}" width="400" height="400" ${fotoEstilo(p)}></div>
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
    linhas.push("", `*Total estimado: ${brl(totalCentavos())}*`);
    const nome = campoNome.value.trim();
    const obs = campoObs.value.trim();
    if (nome) linhas.push(`Nome: ${nome}`);
    if (obs) linhas.push(`Obs.: ${obs}`);
    linhas.push("", "Podemos combinar o valor final, o frete e o pagamento por aqui?");
    if (LOJA.demo) linhas.push("", "_(Pedido de teste da loja de demonstração do portfólio)_");
    return linhas.join("\n");
}

function itemHtml(i) {
    const p = produto(i.id);
    const nomeCompleto = `${p.nome}, ${rotuloTam(i)}`;
    return `<li class="item" data-chave="${chaveDe(i)}">
        <img src="produtos/${p.img}" alt="" width="72" height="72" ${fotoEstilo(p)}>
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

    const addLook = e.target.closest("[data-look-add]");
    if (addLook) { adicionarLook(addLook.dataset.lookAdd); return; }

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
renderLooks();
