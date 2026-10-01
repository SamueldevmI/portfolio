"use strict";
/* Encantos da Eclipse Studio: horóscopo alt do dia, porta secreta dos close friends, o grimório
   que folheia e o clima sonoro (com a varinha no cursor). Roda depois do script.js e do magia.js. */

/* ========== 1. Horóscopo alt: muda todo dia, igual pra todo mundo do mesmo signo ========== */
const SIGNOS = [
    { id: "aries", nome: "Áries", glifo: "♈", elemento: "fogo", datas: "21/3 – 19/4" },
    { id: "touro", nome: "Touro", glifo: "♉", elemento: "terra", datas: "20/4 – 20/5" },
    { id: "gemeos", nome: "Gêmeos", glifo: "♊", elemento: "ar", datas: "21/5 – 20/6" },
    { id: "cancer", nome: "Câncer", glifo: "♋", elemento: "agua", datas: "21/6 – 22/7" },
    { id: "leao", nome: "Leão", glifo: "♌", elemento: "fogo", datas: "23/7 – 22/8" },
    { id: "virgem", nome: "Virgem", glifo: "♍", elemento: "terra", datas: "23/8 – 22/9" },
    { id: "libra", nome: "Libra", glifo: "♎", elemento: "ar", datas: "23/9 – 22/10" },
    { id: "escorpiao", nome: "Escorpião", glifo: "♏", elemento: "agua", datas: "23/10 – 21/11" },
    { id: "sagitario", nome: "Sagitário", glifo: "♐", elemento: "fogo", datas: "22/11 – 21/12" },
    { id: "capricornio", nome: "Capricórnio", glifo: "♑", elemento: "terra", datas: "22/12 – 19/1" },
    { id: "aquario", nome: "Aquário", glifo: "♒", elemento: "ar", datas: "20/1 – 18/2" },
    { id: "peixes", nome: "Peixes", glifo: "♓", elemento: "agua", datas: "19/2 – 20/3" },
];
const GLIFO_TEXTO = "︎"; // mostra o símbolo do signo como letra, não como emoji colorido
const ELEMENTO_VIBE = { fogo: "tradgoth", terra: "vitoriana", ar: "pastel", agua: "bruxinha" };
const ABERTURAS = {
    fogo: ["Hoje sua energia está em brasa:", "O fogo do seu signo anda inquieto:", "Tem faísca no ar pra você:", "Seu brilho não cabe em meia-luz hoje:"],
    terra: ["Hoje o dia pede raiz e ritual:", "Seu signo quer algo que dure:", "A terra sussurra paciência:", "Hoje você merece conforto com um pé no macabro:"],
    ar: ["Hoje as ideias voam feito morcego ao entardecer:", "O vento traz novidade pro seu lado:", "Sua cabeça está nas nuvens (e as nuvens estão roxas):", "Hoje a conversa flui, e o estilo também:"],
    agua: ["Hoje sua intuição está afiada:", "As águas do seu signo andam profundas:", "Tem mistério rondando você hoje:", "Seu sexto sentido está no máximo:"],
};
const CONSELHOS = [
    "aposte numa peça que ninguém espera de você.", "use preto como quem veste armadura.", "um detalhe de renda resolve o dia inteiro.",
    "deixe o delineado mais afiado que a língua.", "combine algo fofo com algo que assusta.", "prata ou dourado? Os dois. Hoje pode.",
    "tire aquela peça do fundo do armário e dê uma chance.", "menos explicação, mais presença.", "um choker no pescoço e o mundo te respeita.",
    "coloque a playlist mais dramática que você tem.", "saia na rua como se fosse capa de revista antiga.", "acenda uma vela e peça algo com fé.",
];
const CORES_DO_DIA = [["lilás", "#cdb4ff"], ["vinho", "#a3203f"], ["preto veludo", "#1a1024"], ["menta", "#aef0d6"], ["marfim", "#f4ead6"], ["rosa bebê", "#ffb8d9"], ["dourado", "#e9c46a"]];
const CHAVE_SIGNO = "es-signo";

/* sorteio com semente: o mesmo signo no mesmo dia sempre tira a mesma previsão */
function sorteioComSemente(texto) {
    let h = 1779033703 ^ texto.length;
    for (let i = 0; i < texto.length; i++) { h = Math.imul(h ^ texto.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    return () => {
        h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909);
        return ((h ^= h >>> 16) >>> 0) / 4294967296;
    };
}
const hojeChave = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };

function fraseDaLua(fase) {
    if (/cheia/i.test(fase)) return `Com a ${fase.toLowerCase()}, tudo fica mais intenso, até o look.`;
    if (/nova/i.test(fase)) return `Com a ${fase.toLowerCase()}, é dia de começar algo do zero.`;
    if (/crescente/i.test(fase)) return `Com a lua ${fase.toLowerCase().replace("lua ", "")}, o que você plantar hoje cresce rápido.`;
    return `Com a lua ${fase.toLowerCase().replace("lua ", "")}, é hora de desapegar do que não te veste mais.`;
}

function previsaoDoDia(signo) {
    const sorte = sorteioComSemente(`${hojeChave()}|${signo.id}`);
    const pega = (lista) => lista[Math.floor(sorte() * lista.length)];
    const pecas = PRODUTOS.filter((p) => naVitrine(p) && disponivel(p) && p.estilos.includes(ELEMENTO_VIBE[signo.elemento]));
    const [cor, corHex] = pega(CORES_DO_DIA);
    return {
        texto: `${pega(ABERTURAS[signo.elemento])} ${pega(CONSELHOS)}`,
        lua: fraseDaLua(LUA.fase(Date.now())),
        cor, corHex,
        numero: 1 + Math.floor(sorte() * 33),
        peca: pega(pecas),
    };
}

(function horoscopo() {
    const grupo = document.getElementById("signos");
    const caixa = document.getElementById("previsao");
    const dataEl = document.getElementById("horoscopoData");
    if (!grupo) return;
    const hojeLonga = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
    dataEl.textContent = `Previsão de ${hojeLonga}. Muda todo dia: volta amanhã ✦`;
    let atual = null;

    grupo.innerHTML = SIGNOS.map((s) => `<button type="button" class="signo" data-signo="${s.id}" aria-pressed="false"><span class="signo-glifo" aria-hidden="true">${s.glifo}${GLIFO_TEXTO}</span><span class="signo-nome">${s.nome}</span><small>${s.datas}</small></button>`).join("");

    function mostrar(id, rolar) {
        const signo = SIGNOS.find((s) => s.id === id);
        if (!signo) return;
        atual = { signo, ...previsaoDoDia(signo) };
        guardar(CHAVE_SIGNO, id);
        grupo.querySelectorAll(".signo").forEach((b) => b.setAttribute("aria-pressed", b.dataset.signo === id));
        const { peca } = atual;
        caixa.innerHTML = `<div class="previsao-topo"><span class="previsao-glifo" aria-hidden="true">${signo.glifo}${GLIFO_TEXTO}</span>
                <div><h3>${signo.nome}</h3><p>${hojeLonga}</p></div></div>
            <p class="previsao-texto">${esc(atual.texto)}</p>
            <p class="previsao-lua">${LUA.desenho(Date.now())}<span>${esc(atual.lua)}</span></p>
            <dl class="previsao-dados">
                <div><dt>Cor do dia</dt><dd><i style="background:${atual.corHex}"></i>${atual.cor}</dd></div>
                <div><dt>Número da sorte</dt><dd>${atual.numero}</dd></div>
            </dl>
            <div class="previsao-peca">
                <button type="button" class="previsao-arte tom-${peca.tom}" data-abrir="${peca.id}" aria-label="Ver ${esc(peca.nome)}">${arte(peca)}</button>
                <div><p class="previsao-rotulo">Peça do dia</p><p class="previsao-nome">${esc(peca.nome)}</p><p class="previsao-preco">${precoTexto(peca)}</p>
                <button class="botao botao-linha" type="button" data-abrir="${peca.id}">Ver a peça</button></div>
            </div>
            <div class="previsao-acoes"><button class="botao" type="button" data-horoscopo-story>Salvar pro story</button></div>`;
        caixa.hidden = false;
        if (rolar) caixa.scrollIntoView({ behavior: semMovimento ? "auto" : "smooth", block: "nearest" });
    }

    grupo.addEventListener("click", (e) => {
        const b = e.target.closest("[data-signo]");
        if (b) mostrar(b.dataset.signo, true);
    });
    caixa.addEventListener("click", (e) => {
        const b = e.target.closest("[data-horoscopo-story]");
        if (b) storyDoHoroscopo(atual, b);
    });
    const salvo = ler(CHAVE_SIGNO, "");
    if (salvo) mostrar(salvo, false);
})();

async function storyDoHoroscopo(h, botao) {
    if (!h) return;
    const textoOriginal = botao.textContent;
    botao.disabled = true;
    botao.textContent = "Preparando a imagem…";
    try {
        await Promise.all(FONTES_STORY.map((f) => document.fonts.load(f)));
        const W = 1080, H = 1920;
        const tela = document.createElement("canvas");
        tela.width = W; tela.height = H;
        const ctx = tela.getContext("2d");
        pintarFundoStory(ctx, W, H);

        ctx.fillStyle = "#e9c46a"; ctx.font = '700 34px "Quicksand"';
        ctx.fillText("HORÓSCOPO ALT DO DIA", W / 2, 300);
        ctx.fillStyle = "#cfc0e6"; ctx.font = 'italic 600 44px "Cormorant Garamond"';
        ctx.fillText(new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }), W / 2, 360);
        ctx.fillStyle = "#e9c46a"; ctx.font = '260px "Cormorant Garamond", serif';
        ctx.fillText(h.signo.glifo + GLIFO_TEXTO, W / 2, 640);
        ctx.fillStyle = "#f6eeff"; ctx.font = '700 110px "Cormorant Garamond"';
        ctx.fillText(h.signo.nome, W / 2, 790);

        ctx.font = 'italic 700 52px "Cormorant Garamond"';
        let y = 900;
        quebrarLinhas(ctx, h.texto, 900).forEach((l) => { ctx.fillText(l, W / 2, y); y += 66; });
        ctx.fillStyle = "#cfc0e6"; ctx.font = 'italic 600 42px "Cormorant Garamond"';
        y += 14;
        quebrarLinhas(ctx, h.lua, 900).forEach((l) => { ctx.fillText(l, W / 2, y); y += 54; });

        /* peça do dia */
        const top = Math.max(y + 40, 1230), lado = 300, x = W / 2 - lado / 2;
        retanguloRedondo(ctx, x, top, lado, lado, 26);
        const tom = ctx.createLinearGradient(0, top, 0, top + lado);
        tom.addColorStop(0, CORES_TOM[h.peca.tom][0]); tom.addColorStop(1, CORES_TOM[h.peca.tom][1]);
        ctx.fillStyle = tom; ctx.fill();
        ctx.lineWidth = 5; ctx.strokeStyle = "#241a33"; ctx.stroke();
        const img = h.peca.foto ? await carregarImagem(h.peca.foto) : await imagemDaArte(ARTE[h.peca.arte], h.peca.tom);
        ctx.save(); retanguloRedondo(ctx, x, top, lado, lado, 26); ctx.clip();
        if (h.peca.foto) { const l = Math.min(img.naturalWidth, img.naturalHeight); ctx.drawImage(img, (img.naturalWidth - l) / 2, (img.naturalHeight - l) / 2, l, l, x, top, lado, lado); }
        else ctx.drawImage(img, x + 40, top + 40, lado - 80, lado - 80);
        ctx.restore();
        ctx.fillStyle = "#e9c46a"; ctx.font = '700 30px "Quicksand"';
        ctx.fillText("PEÇA DO DIA", W / 2, top + lado + 60);
        ctx.fillStyle = "#ffb8d9"; ctx.font = '700 44px "Quicksand"';
        ctx.fillText(h.peca.nome, W / 2, top + lado + 118);
        ctx.fillStyle = "#cfc0e6"; ctx.font = '500 34px "Quicksand"';
        ctx.fillText(`cor do dia: ${h.cor}  ✦  número da sorte: ${h.numero}`, W / 2, top + lado + 178);

        ctx.fillStyle = "#e9c46a"; ctx.font = '700 40px "Quicksand"';
        ctx.fillText("veja o seu no link da bio ✦ @eclipse_studiocg", W / 2, H - 110);
        await entregarImagem(tela, `horoscopo-${h.signo.id}-eclipse-studio.png`, `Horóscopo alt · ${h.signo.nome}`);
    } catch (erro) {
        avisar("Não consegui montar a imagem agora. Tente de novo ou tire um print.");
    } finally {
        botao.disabled = false;
        botao.textContent = textoOriginal;
    }
}

/* ========== 2. Porta secreta: a palavra dos close friends abre o drop exclusivo ========== */
(function portaSecreta() {
    const form = document.getElementById("portaForm");
    if (!form) return;
    const campo = document.getElementById("palavraMagica");
    const status = document.getElementById("portaStatus");
    const desenho = document.getElementById("portaDesenho");
    const drop = document.getElementById("dropSecreto");
    const grade = document.getElementById("gradeSecreta");
    const CHAVE_PORTA = "es-porta";
    const normalizar = (t) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim().replace(/\s+/g, " ");

    async function hashDe(texto) {
        const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
        return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
    }

    function abrir(comAnimacao) {
        desenho.classList.add("aberta");
        if (!comAnimacao) desenho.classList.add("sem-animacao");
        grade.innerHTML = PRODUTOS.filter((p) => p.secreto).map(cardHtml).join("");
        drop.hidden = false;
        status.textContent = "A porta está aberta ✦ boas-vindas ao drop secreto.";
        form.hidden = true;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const palavra = normalizar(campo.value);
        if (!palavra) { campo.focus(); return; }
        if (!crypto.subtle) { status.textContent = "Seu navegador não abre essa porta. Tente outro navegador."; return; }
        if (await hashDe(palavra) === LOJA.portaSecreta.hash) {
            guardar(CHAVE_PORTA, LOJA.portaSecreta.hash);
            abrir(true);
            document.dispatchEvent(new CustomEvent("encanto:som", { detail: "sino" }));
            setTimeout(() => drop.scrollIntoView({ behavior: semMovimento ? "auto" : "smooth", block: "start" }), semMovimento ? 0 : 900);
        } else {
            desenho.classList.remove("tremendo");
            void desenho.offsetWidth;
            desenho.classList.add("tremendo");
            status.textContent = "A porta não reconheceu essa palavra 🔒 Ela aparece nos close friends do @eclipse_studiocg.";
            campo.select();
        }
    });

    /* quem já abriu continua com a porta aberta, até a Elizabeth trocar a palavra */
    if (ler(CHAVE_PORTA, "") === LOJA.portaSecreta.hash) abrir(false);
})();

/* ========== 3. O grimório: livro que folheia, um capítulo por vibe ========== */
const RECEITAS = {
    vitoriana: "Pegue um espartilho, uma pitada de renda marfim e um camafeu preso na gola. Misture à meia-luz e sirva com olhar de retrato antigo.",
    tradgoth: "Derreta veludo preto em fogo baixo, junte um rosário longo e uma rosa vermelha no pescoço. Deixe descansar até a meia-noite e saia pra rua.",
    bruxinha: "Numa noite de lua, junte uma capa de veludo, uma bola de cristal no peito e um olho que tudo vê no dedo. Mexa três vezes em sentido anti-horário.",
    pastel: "Bata lilás, rosa e menta até ficar fofo. Acrescente uma cruz, um morceguinho e uma gota de trevas. Sirva com laço.",
};

(function grimorio() {
    const livro = document.getElementById("livro");
    if (!livro) return;
    const anterior = document.getElementById("paginaAnterior");
    const proxima = document.getElementById("paginaProxima");
    const rotulo = document.getElementById("livroPagina");
    const NUMERAIS = ["I", "II", "III", "IV"];

    const capa = `<div class="pagina pagina-capa"><div class="capa-moldura">
        <svg class="capa-eclipse" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="11" class="coroa"/><circle cx="18" cy="14.5" r="10" class="disco"/></svg>
        <p class="capa-titulo">Grimório</p><p class="capa-sub">da Eclipse Studio</p><p class="capa-rodape">receitas de estilo ✦ vire a página</p></div></div>`;
    const contracapa = `<div class="pagina pagina-fim"><p class="fim-titulo">Continua na próxima lua cheia…</p>
        ${LUA.desenho(Date.now())}<p>Novas receitas chegam junto com as peças novas.</p>
        <a class="botao botao-linha" href="https://www.instagram.com/eclipse_studiocg/" target="_blank" rel="noopener noreferrer">@eclipse_studiocg</a></div>`;
    const paginas = [capa];
    ESTILOS.forEach((e, i) => {
        const arcano = ARCANOS[e.id];
        const pecas = PRODUTOS.filter((p) => naVitrine(p) && disponivel(p) && p.estilos.includes(e.id)).slice(0, 5);
        paginas.push(`<div class="pagina pagina-receita"><p class="pagina-capitulo">Capítulo ${NUMERAIS[i]}</p><h3>${esc(e.nome)}</h3>
            <span class="pagina-arte tom-${arcano.tom}"><svg class="arte" viewBox="0 0 100 100" aria-hidden="true">${ARTE[arcano.arte]}</svg></span>
            <p class="pagina-texto">${esc(RECEITAS[e.id])}</p></div>`);
        paginas.push(`<div class="pagina pagina-ingredientes"><p class="pagina-capitulo">Ingredientes</p>
            <ul>${pecas.map((p) => `<li><button type="button" data-abrir="${p.id}"><span class="ingrediente-arte tom-${p.tom}">${arte(p)}</span><span class="ingrediente-nome">${esc(p.nome)}</span><span class="ingrediente-preco">${precoTexto(p)}</span></button></li>`).join("")}</ul>
            <button class="pagina-link" type="button" data-estilo="${e.id}">ver tudo da vibe ${esc(e.nome)} →</button></div>`);
    });
    paginas.push(contracapa);

    let viradas = 0, folhas = 0, duplo = false;
    const modoDuplo = matchMedia("(min-width: 860px)");

    function montar() {
        const eraDuplo = duplo;
        duplo = modoDuplo.matches;
        const pagAtual = eraDuplo ? viradas * 2 : viradas; // guarda a página aberta ao trocar de modo
        const pares = [];
        if (duplo) for (let i = 0; i < paginas.length; i += 2) pares.push([paginas[i], paginas[i + 1] || '<div class="pagina"></div>']);
        else paginas.forEach((p) => pares.push([p, '<div class="pagina pagina-verso"></div>']));
        folhas = pares.length;
        viradas = Math.min(duplo ? Math.ceil(pagAtual / 2) : pagAtual, folhas - (duplo ? 0 : 1));
        livro.innerHTML = `<div class="livro-miolo ${duplo ? "duplo" : "simples"}">${pares.map(([frente, tras], i) =>
            `<div class="folha" data-folha="${i}"><div class="face frente">${frente}</div><div class="face tras">${tras}</div></div>`).join("")}</div>`;
        atualizar(false);
    }

    function atualizar(comSom) {
        const miolo = livro.firstElementChild;
        miolo.querySelectorAll(".folha").forEach((f, i) => {
            const virada = i < viradas;
            f.classList.toggle("virada", virada);
            f.style.zIndex = virada ? i + 1 : folhas - i;
            f.inert = duplo ? !(i === viradas || i === viradas - 1) : i !== viradas; // só as páginas à mostra aceitam foco
        });
        miolo.classList.toggle("fechado", viradas === 0);
        miolo.classList.toggle("no-fim", duplo && viradas === folhas);
        const ultima = duplo ? folhas : folhas - 1;
        anterior.disabled = viradas === 0;
        proxima.disabled = viradas >= ultima;
        rotulo.textContent = viradas === 0 ? "capa"
            : duplo ? (viradas === folhas ? "fim" : `páginas ${viradas * 2}–${viradas * 2 + 1}`)
            : `página ${viradas + 1} de ${paginas.length}`;
        if (comSom) document.dispatchEvent(new CustomEvent("encanto:som", { detail: "pagina" }));
    }

    function virar(passo) {
        const ultima = duplo ? folhas : folhas - 1;
        const nova = Math.max(0, Math.min(ultima, viradas + passo));
        if (nova === viradas) return;
        const indice = passo > 0 ? viradas : nova; // a folha que se move
        viradas = nova;
        atualizar(true);
        const folha = livro.querySelectorAll(".folha")[indice];
        folha.style.zIndex = folhas * 3; // enquanto vira, passa por cima de todas
        setTimeout(() => { folha.style.zIndex = indice < viradas ? indice + 1 : folhas - indice; }, semMovimento ? 0 : 800);
    }

    anterior.addEventListener("click", () => virar(-1));
    proxima.addEventListener("click", () => virar(1));
    livro.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); virar(1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); virar(-1); }
    });
    /* tocar nos cantos ou arrastar vira a página (menos quando o toque é numa peça) */
    let inicio = null;
    livro.addEventListener("pointerdown", (e) => { inicio = { x: e.clientX, t: Date.now() }; });
    livro.addEventListener("pointerup", (e) => {
        if (!inicio || e.target.closest("button, a")) { inicio = null; return; }
        const dx = e.clientX - inicio.x;
        if (Math.abs(dx) > 40) virar(dx < 0 ? 1 : -1);
        else if (Date.now() - inicio.t < 400) {
            const r = livro.getBoundingClientRect();
            const pos = (e.clientX - r.left) / r.width;
            if (pos > .75) virar(1); else if (pos < .25) virar(-1);
        }
        inicio = null;
    });
    modoDuplo.addEventListener("change", montar);
    montar();
})();

/* ========== 4. Clima sonoro: chuva macia, lareira e caixinha de música, tudo sintetizado (sem arquivo de áudio) ========== */
const CLIMA = (() => {
    const botao = document.getElementById("botaoSom");
    let ctx = null, mestre = null, eco = null, ligado = false, timers = [];

    /* ruído "rosa" e "marrom": bem mais macios que o branco, soam como chuva de verdade */
    function ruido(segundos, tipo) {
        const buffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * segundos)), ctx.sampleRate);
        const d = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, ultimo = 0;
        for (let i = 0; i < d.length; i++) {
            const branco = Math.random() * 2 - 1;
            if (tipo === "marrom") { ultimo = (ultimo + .02 * branco) / 1.02; d[i] = ultimo * 3.5; }
            else { b0 = .99765 * b0 + branco * .099046; b1 = .963 * b1 + branco * .2965164; b2 = .57 * b2 + branco * 1.0526913; d[i] = (b0 + b1 + b2 + branco * .1848) * .11; }
        }
        return buffer;
    }
    function filtro(tipo, freq, q = .7) {
        const f = ctx.createBiquadFilter(); f.type = tipo; f.frequency.value = freq; f.Q.value = q; return f;
    }
    function rajada(buffer, f, volume, dur, destino = mestre, quando = ctx.currentTime) {
        const fonte = ctx.createBufferSource(); fonte.buffer = buffer;
        const g = ctx.createGain();
        g.gain.setValueAtTime(.0001, quando);
        g.gain.exponentialRampToValueAtTime(volume, quando + Math.min(.02, dur / 4));
        g.gain.exponentialRampToValueAtTime(.0001, quando + dur);
        fonte.connect(f).connect(g).connect(destino);
        fonte.start(quando); fonte.stop(quando + dur + .05);
    }

    function iniciar() {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        mestre = ctx.createGain(); mestre.gain.value = 0; mestre.connect(ctx.destination);
        /* eco suave, só pros sininhos */
        eco = ctx.createDelay(1); eco.delayTime.value = .28;
        const volta = ctx.createGain(); volta.gain.value = .32;
        const abafa = filtro("lowpass", 2200);
        eco.connect(abafa).connect(volta).connect(eco);
        abafa.connect(mestre);

        /* chuva: corpo grave + chiado leve, com rajadas lentas de vento */
        const chuva = ctx.createGain(); chuva.gain.value = 1; chuva.connect(mestre);
        const corpo = ctx.createBufferSource(); corpo.buffer = ruido(8, "marrom"); corpo.loop = true;
        const gCorpo = ctx.createGain(); gCorpo.gain.value = .16;
        corpo.connect(filtro("lowpass", 650)).connect(gCorpo).connect(chuva);
        const chiado = ctx.createBufferSource(); chiado.buffer = ruido(7, "rosa"); chiado.loop = true;
        const gChiado = ctx.createGain(); gChiado.gain.value = .05;
        chiado.connect(filtro("highpass", 500)).connect(filtro("lowpass", 2600)).connect(gChiado).connect(chuva);
        const vento = ctx.createOscillator(); vento.frequency.value = .07;
        const gVento = ctx.createGain(); gVento.gain.value = .18;
        vento.connect(gVento).connect(chuva.gain);
        corpo.start(); chiado.start(); vento.start();
    }

    function agendarLareira() {
        const estalo = ruido(.12, "rosa");
        const crepitar = () => {
            if (!ligado) return;
            const quantos = Math.random() < .25 ? 2 : 1;
            for (let i = 0; i < quantos; i++) {
                rajada(estalo, filtro("bandpass", 700 + Math.random() * 900, 1.2), .05 + Math.random() * .05, .04 + Math.random() * .06, mestre, ctx.currentTime + i * (.05 + Math.random() * .08));
            }
            timers.push(setTimeout(crepitar, 900 + Math.random() * 2600)); // raro: um estalo aqui, outro ali
        };
        timers.push(setTimeout(crepitar, 1200));
    }

    /* caixinha de música: notas da escala pentatônica, sempre bonitas juntas */
    const NOTAS = [880, 987.8, 1174.7, 1318.5, 1568];
    function nota(freq, quando, volume) {
        [[1, 1], [2, .12]].forEach(([mult, peso]) => {
            const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = freq * mult;
            const g = ctx.createGain();
            g.gain.setValueAtTime(.0001, quando);
            g.gain.exponentialRampToValueAtTime(volume * peso, quando + .01);
            g.gain.exponentialRampToValueAtTime(.0001, quando + 1.3);
            o.connect(g); g.connect(mestre); g.connect(eco);
            o.start(quando); o.stop(quando + 1.4);
        });
    }
    function sino(quantas = 2) {
        if (!ligado) return;
        const inicio = Math.floor(Math.random() * (NOTAS.length - quantas));
        for (let i = 0; i < quantas; i++) nota(NOTAS[inicio + i], ctx.currentTime + i * .11, .05);
    }
    function pagina() {
        if (!ligado) return;
        rajada(ruido(.3, "rosa"), filtro("bandpass", 1800, .6), .1, .22);
    }
    function sopro() {
        if (!ligado) return;
        const f = filtro("lowpass", 700);
        f.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + .5);
        rajada(ruido(.6, "marrom"), f, .3, .5);
    }

    function ligar() {
        if (!ctx) iniciar();
        ctx.resume();
        ligado = true;
        mestre.gain.cancelScheduledValues(ctx.currentTime);
        mestre.gain.setTargetAtTime(.5, ctx.currentTime, 1.2); // entra bem devagar
        agendarLareira();
        botao.setAttribute("aria-pressed", "true");
        botao.setAttribute("aria-label", "Desligar o clima sonoro");
    }
    function desligar() {
        ligado = false;
        timers.forEach(clearTimeout); timers = [];
        if (ctx) mestre.gain.setTargetAtTime(0, ctx.currentTime, .3);
        botao.setAttribute("aria-pressed", "false");
        botao.setAttribute("aria-label", "Ligar o clima: chuva e lareira");
    }

    if (botao) {
        botao.setAttribute("aria-label", "Ligar o clima: chuva e lareira");
        botao.addEventListener("click", () => (ligado ? desligar() : ligar()));
        document.addEventListener("visibilitychange", () => { if (ctx && ligado) (document.hidden ? ctx.suspend() : ctx.resume()); });
    }
    document.addEventListener("sacola:caiu", () => sino(2));
    document.addEventListener("encanto:som", (e) => ({ sino: () => sino(3), pagina, sopro }[e.detail] || (() => {}))());
    document.getElementById("apagarVelas")?.addEventListener("click", sopro);
    document.getElementById("gatoUsar")?.addEventListener("click", () => sino(3));
    return { sino };
})();

/* ========== 5. A varinha: no computador, o cursor solta faíscas ========== */
(function varinha() {
    if (semMovimento || !matchMedia("(pointer: fine)").matches) return;
    document.documentElement.classList.add("varinha");
    const CORES = ["rgba(233, 196, 106, .9)", "rgba(255, 227, 154, .9)", "rgba(255, 244, 225, .8)"];
    let ultimo = { x: 0, y: 0, t: 0 }, vivas = 0;
    addEventListener("pointermove", (e) => {
        if (e.pointerType !== "mouse") return;
        const agora = performance.now();
        if (agora - ultimo.t < 45 || Math.hypot(e.clientX - ultimo.x, e.clientY - ultimo.y) < 18 || vivas >= 12) return;
        ultimo = { x: e.clientX, y: e.clientY, t: agora };
        const f = document.createElement("i");
        f.className = "faisca-varinha";
        f.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;--cor:${CORES[Math.floor(Math.random() * CORES.length)]};--dx:${(Math.random() * 12 - 6).toFixed(0)}px;--dy:${(14 + Math.random() * 18).toFixed(0)}px;--tam:${(3 + Math.random() * 3).toFixed(1)}px`;
        f.addEventListener("animationend", () => { f.remove(); vivas--; });
        vivas++;
        document.body.appendChild(f);
    }, { passive: true });
})();
