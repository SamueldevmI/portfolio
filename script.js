/* O tema (vermelho ou azul) é escolhido no <head> do index.html; a troca fica no fim deste arquivo.
   Limpa o "dark-mode" de quem visitou antes do tema único. */
document.body.classList.remove("dark-mode");
document.documentElement.classList.remove("dark-mode");

document.getElementById("ano").textContent = new Date().getFullYear();

/* Link personalizado de prospecção: ?para=Pizzaria do João&ramo=pizzaria (&previa=1 abre a prévia do site).
   Gerado em prospeccao.html. O nome e o ramo vão pro comparador, pra calculadora e pras demos (ficam
   guardados como se a pessoa tivesse digitado), a saudação do topo chama pelo nome e aparece um convite pra
   ver a prévia do site dela. O nome só entra na página como texto (nunca como HTML). */
const LINK_PERSONALIZADO = (function () {
    const p = new URLSearchParams(location.search);
    const para = (p.get("para") || "").replace(/\s+/g, " ").trim().slice(0, 40);
    const RAMOS = { pizzaria: "pizzaria", barbearia: "barbearia", loja: "loja de roupa", "loja de roupa": "loja de roupa", salao: "salão", "salão": "salão", academia: "academia", clinica: "clínica", "clínica": "clínica" };
    const ramo = RAMOS[(p.get("ramo") || "").trim().toLowerCase()] || "";
    if (!para && !ramo) return null;
    try {
        if (para) localStorage.setItem("portfolio-nome-negocio", para);
        if (ramo) localStorage.setItem("portfolio-tipo-negocio", ramo);
    } catch (e) { /* sem armazenamento: vale só nesta visita */ }
    const campoProjetos = document.getElementById("nomeNegocio");
    if (campoProjetos && para) campoProjetos.value = para;
    if (para) {
        // "Olá! Me chamo…" vira "Olá, Pizzaria do João! Me chamo…" (o acabamento.js depois troca o "Olá" por "Bom dia")
        const linha = document.querySelector(".hero-ola");
        const texto = linha && linha.firstChild;
        if (texto && texto.nodeType === Node.TEXT_NODE) texto.textContent = texto.textContent.replace("Olá!", `Olá, ${para}!`);
        document.title = `${para} × Samuel Mickael | Sites e sistemas`;
        // convite logo acima da saudação
        const convite = document.createElement("p");
        convite.className = "link-convite";
        const oi = document.createElement("span");
        oi.append("👋 Preparei essa página pra ");
        const b = document.createElement("b"); b.textContent = para; oi.append(b, ".");
        const ver = document.createElement("button");
        ver.type = "button";
        ver.textContent = "ver como ficaria o seu site →";
        ver.addEventListener("click", () => window.abrirPreviaSite && window.abrirPreviaSite(ramo || undefined, para));
        convite.append(oi, ver);
        (linha?.closest(".hero-quem") || linha)?.before(convite);
    }
    if (para) window.ESTATISTICAS?.contar(`/link/${window.ESTATISTICAS.slug(para)}`, `abriu o link: ${para}`, true);
    return { para, ramo, previa: p.get("previa") === "1", slug: para && window.ESTATISTICAS ? window.ESTATISTICAS.slug(para) : "" };
})();
/* As seções de baixo usam content-visibility (o navegador só monta quando chegam perto), o que deixa a abertura
   bem mais leve. Mas pulos por link interno precisam da altura real: no primeiro clique que leva pra uma seção,
   monta tudo antes de rolar. Também vale pra quem já chega com #algo no endereço. */
{
    const montarSecoes = () => document.documentElement.classList.add("secoes-montadas");
    if (location.hash.length > 1) montarSecoes();
    // se a rolagem terminar longe do alvo (seções que mudam de tamanho no caminho), completa o pulo uma vez
    const corrigirPulo = (alvo) => {
        let feito = false;
        const conferir = () => {
            if (feito) return; feito = true;
            const margem = parseFloat(getComputedStyle(alvo).scrollMarginTop) || 0;
            if (Math.abs(alvo.getBoundingClientRect().top - margem) > 40) alvo.scrollIntoView({ behavior: prefereMenosMovimento ? "auto" : "smooth" });
        };
        window.addEventListener("scrollend", conferir, { once: true });
        setTimeout(conferir, 1800);
    };
    document.addEventListener("click", (e) => {
        if (!e.target.closest('a[href^="#"], a[href^="./#"], [data-orcamento-tipo], .cmp-querer, .previa-quero, .cmp-testar')) return;
        montarSecoes();
        const link = e.target.closest('a[href^="#"]');
        const id = link && link.getAttribute("href").slice(1);
        const alvo = id && document.getElementById(id);
        if (alvo) corrigirPulo(alvo);
    }, true);
    window.addEventListener("hashchange", montarSecoes);
}
window.ESTATISTICAS?.contar("/", "Portfólio", true);
// qualquer toque num botão que leve pro meu WhatsApp (o fim do funil no painel)
document.addEventListener("click", (evento) => {
    if (evento.target.closest('a[href*="wa.me/5567996034205"], [data-orcamento-tipo], .cmp-querer, .previa-quero')) window.ESTATISTICAS?.contar("/evento/whatsapp", "tocou no WhatsApp/orçamento", true);
}, true);
// quem veio pelo link personalizado e tocou em WhatsApp ou orçamento (o sinal mais quente pra prospecção)
if (LINK_PERSONALIZADO && LINK_PERSONALIZADO.slug) document.addEventListener("click", (evento) => {
    if (evento.target.closest('a[href*="wa.me/"], [data-orcamento-tipo], .cmp-querer, .previa-quero, .botao-principal')) {
        window.ESTATISTICAS?.contar(`/link/${LINK_PERSONALIZADO.slug}/whatsapp`, `chamou/pediu orçamento: ${LINK_PERSONALIZADO.para}`, true);
    }
}, true);

/* ---------- Ícones próprios (em vez de emoji nativo, que muda de cara em cada aparelho) ----------
   Cada um é um <path> só, no mesmo traço fino das tech badges (.ic-linha): assim o mesmo desenho
   serve tanto pra HTML (svgIcone) quanto pra dentro do <canvas> do cartão-resumo (mobile.js lê
   window.IconesTema.CAMINHOS direto). Emoji de verdade continua nos toasts e nas mensagens que vão
   pro WhatsApp, porque aí precisa render igual no aparelho de quem recebe. */
const ICONES_TEMA_CAMINHOS = {
    instalar: "M6.5 2.5h11v19h-11z M9 5.5h6 M12 8v6.5 M9.2 11.7 12 14.5l2.8-2.8 M10 18h4",
    socio: "M18 5a2.3 2.3 0 1 1 0 4.6A2.3 2.3 0 0 1 18 5z M6 9.7a2.3 2.3 0 1 1 0 4.6 2.3 2.3 0 0 1 0-4.6z M18 14.4a2.3 2.3 0 1 1 0 4.6 2.3 2.3 0 0 1 0-4.6z M8 11l7.9-3.7 M8 13l7.9 3.7",
    resumo: "M3.5 6.5h13v13h-13z M7.5 2.5h13v13",
    dado: "M4.5 4.5h15v15h-15z M8.3 8.3h.01 M12 12h.01 M15.7 15.7h.01",
    pulso: "M12 12m-1.6 0a1.6 1.6 0 1 0 3.2 0 1.6 1.6 0 1 0-3.2 0 M8.3 8.3a5.2 5.2 0 0 1 7.4 0 M5.6 5.6a9 9 0 0 1 12.8 0",
    sparkle: "M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9z",
    pino: "M12 3a6 6 0 0 1 6 6c0 4.7-6 12-6 12s-6-7.3-6-12a6 6 0 0 1 6-6z M12 6.8a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4z",
    frasco: "M9.5 3h5 M10.2 3v6l-4.7 8.3a2 2 0 0 0 1.8 3h9.4a2 2 0 0 0 1.8-3l-4.7-8.3V3 M7.3 15h9.4",
    coracao: "M12 19.5s-7-4.3-9.4-8.8C.9 7.3 2.6 4 6 4c2 0 3.4 1 4 2.2C10.6 5 12 4 14 4c3.4 0 5.1 3.3 3.4 6.7-2.4 4.5-9.4 8.8-9.4 8.8z",
    camadas: "M12 3.5 20.5 8 12 12.5 3.5 8z M6 11l6 3.2L18 11 M6 14.5l6 3.2 6-3.2",
    relogio: "M9.5 2.5h5 M12 5v2 M12 22a7.8 7.8 0 1 0 0-15.6 7.8 7.8 0 0 0 0 15.6z M12 9.6v4.6l3.2 1.9",
};
function svgIcone(nome, classe) {
    const d = ICONES_TEMA_CAMINHOS[nome];
    if (!d) return "";
    return `<svg class="ic-linha${classe ? " " + classe : ""}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`;
}
window.IconesTema = { CAMINHOS: ICONES_TEMA_CAMINHOS, svg: svgIcone };

// Troca o emoji nativo (varia de cara em cada aparelho) pelo ícone do site nos botões fixos do HTML
{
    const BOTOES_ICONE = { botaoInstalar: ["instalar", "Instalar o portfólio"], botaoSocio: ["socio", "Mandar pro seu sócio"], botaoResumo: ["resumo", "Meu resumo da visita"], botaoSurpresa: ["dado", "Qual é a sua cara?"] };
    Object.entries(BOTOES_ICONE).forEach(([id, [icone, texto]]) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = svgIcone(icone, "ic-mini") + texto;
    });
}

const elementosRevelar = document.querySelectorAll(".card-projeto, .lista-jornada article, .lista-servicos article, .sobre-conteudo > div:nth-child(2) > p");
const prefereMenosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

elementosRevelar.forEach((el) => el.classList.add("reveal"));

if (prefereMenosMovimento || !("IntersectionObserver" in window)) {
    elementosRevelar.forEach((el) => el.classList.add("is-visible"));
} else {
    const observador = new IntersectionObserver(
        (entradas) => {
            entradas.forEach((entrada) => {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add("is-visible");
                    observador.unobserve(entrada.target);
                }
            });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    elementosRevelar.forEach((el) => observador.observe(el));
}

/* Efeito de digitação no texto do hero, na primeira carga. Usa o idioma já detectado no
   <head> (document.documentElement.dataset.idioma) pra digitar o texto certo desde o início —
   senão a digitação, que lê o texto original em português, apagaria a tradução do idioma.js. */
const heroTexto = document.querySelector(".hero-texto");
if (heroTexto && !prefereMenosMovimento) {
    // o resto do texto fica lá, invisível, guardando o espaço: o parágrafo não muda de altura e nada abaixo pula
    const textoCompletoHero = document.documentElement.dataset.idioma === "es"
        ? "Sitio y sistema a medida para tu negocio: aparece en Google, responde en WhatsApp solo y funciona en el celular."
        : heroTexto.textContent;
    const digitado = document.createElement("span");
    const falta = document.createElement("span");
    falta.style.visibility = "hidden";
    falta.setAttribute("aria-hidden", "true");
    falta.textContent = textoCompletoHero;
    heroTexto.textContent = "";
    heroTexto.append(digitado, falta);
    let indiceCharHero = 0;
    setTimeout(function digitarHero() {
        digitado.textContent = textoCompletoHero.slice(0, indiceCharHero);
        falta.textContent = textoCompletoHero.slice(indiceCharHero);
        indiceCharHero++;
        if (indiceCharHero <= textoCompletoHero.length) setTimeout(digitarHero, 14);
        else heroTexto.textContent = textoCompletoHero;
    }, 320);
}

// o número de projetos acompanha os cards da página (entrou projeto novo, o número sobe sozinho)
const statProjetos = document.getElementById("statProjetos");
const totalProjetos = document.querySelectorAll(".card-projeto").length;
if (statProjetos && totalProjetos) { statProjetos.dataset.contar = totalProjetos; statProjetos.textContent = totalProjetos; }

const numerosContaveis = document.querySelectorAll("[data-contar]");

if (!prefereMenosMovimento) {
    numerosContaveis.forEach((el) => {
        const alvo = Number(el.dataset.contar);
        const prefixo = el.dataset.prefixo || "";
        const sufixo = el.dataset.sufixo || "";
        const pad2 = el.dataset.formato === "pad2";
        const duracao = 1200;
        let inicio = null;

        function passo(tempo) {
            if (inicio === null) inicio = tempo;
            const progresso = Math.min((tempo - inicio) / duracao, 1);
            const facilitado = 1 - Math.pow(1 - progresso, 3);
            const valor = Math.round(alvo * facilitado);
            el.textContent = prefixo + (pad2 ? String(valor).padStart(2, "0") : String(valor)) + sufixo;
            if (progresso < 1) requestAnimationFrame(passo);
        }

        requestAnimationFrame(passo);
    });
}

/* Toast de feedback */
const toastEl = document.getElementById("toast");
let toastTimeout;

function mostrarToast(mensagem) {
    if (!toastEl) return;
    toastEl.textContent = mensagem;
    toastEl.classList.add("mostrar");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toastEl.classList.remove("mostrar"), 2600);
}

/* Favicon "vivo": pisca por alguns segundos em momentos de destaque */
function favIconTemporario(duracaoMs) {
    const linkFavicon = document.querySelector('link[rel="icon"]');
    if (!linkFavicon) return;
    const original = linkFavicon.href;
    const cor = getComputedStyle(document.documentElement).getPropertyValue("--cyan").trim() || "#ff2a3d"; // cor do tema atual
    linkFavicon.href = "data:image/svg+xml," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' fill='${cor}'/></svg>`);
    setTimeout(() => { linkFavicon.href = original; }, duracaoMs);
}

/* Ripple ao clicar nos botões */
document.querySelectorAll(".botao").forEach((botao) => {
    botao.addEventListener("click", (evento) => {
        if (prefereMenosMovimento) return;
        const rect = botao.getBoundingClientRect();
        const tamanho = Math.max(rect.width, rect.height);
        const ripple = document.createElement("span");
        ripple.className = "ripple";
        ripple.style.width = ripple.style.height = tamanho + "px";
        ripple.style.left = evento.clientX - rect.left - tamanho / 2 + "px";
        ripple.style.top = evento.clientY - rect.top - tamanho / 2 + "px";
        botao.appendChild(ripple);
        ripple.addEventListener("animationend", () => ripple.remove());
    });
});

/* Comparador "sem site × com site" no topo: os dois lados rodando ao mesmo tempo (lado a lado no
   computador, um embaixo do outro no celular). A pessoa escolhe o tipo de negócio (e, se quiser, digita o
   nome) e a cena se adapta: Google, WhatsApp e pedidos/agenda/loja daquele ramo. Cada lado tem o seu
   placar, a calculadora mostra quanto se perde por mês e o botão do fim fala a dor da cena (abre o
   orçamento já preenchido). Roda sozinho, cena a cena, até a pessoa mexer. O nome é o mesmo do campo
   "Nome do seu negócio" dos projetos (os dois ficam iguais). */
(function comparadorSemCom() {
    const raiz = document.getElementById("comparador");
    if (!raiz) return;
    // com o antes × depois (antes-depois.js) as cenas antigas ficam escondidas: aqui sobram os ramos,
    // a calculadora, a prévia e o nome do negócio
    const modoAntesDepois = raiz.classList.contains("cmp-ad");
    const $ = (sel) => raiz.querySelector(sel);
    const tiposEl = $(".cmp-tipos"), abas = $(".cmp-abas"), testar = $(".cmp-testar"), querer = $(".cmp-querer");
    const palco = { sem: $('.cmp-palco[data-lado="sem"]'), com: $('.cmp-palco[data-lado="com"]') };
    const placar = { sem: $('.cmp-metricas[data-lado="sem"]'), com: $('.cmp-metricas[data-lado="com"]') };
    const campoNome = $(".cmp-nome input"), campoNomeProjetos = document.getElementById("nomeNegocio");
    const semMovimento = prefereMenosMovimento;
    const espera = (ms) => new Promise((r) => setTimeout(r, semMovimento ? 0 : ms));
    const ler = (k) => { try { return localStorage.getItem(k) || ""; } catch (e) { return ""; } };
    const gravar = (k, v) => { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch (e) { /* sem armazenamento */ } };
    const formatoReais = new Intl.NumberFormat("pt-BR"); // um só (criar a cada número é caro)
    const reais = (n) => "R$ " + formatoReais.format(Math.round(n));

    // Cada ramo tem as conversas dele, do jeito que chegam no WhatsApp de verdade (com um pouco de zoeira).
    // whats: o que o cliente manda / o que o site responde sozinho. extra: a terceira cena (pedidos, loja ou
    // agenda). ticket e mensagens: ponto de partida da calculadora.
    const NEGOCIOS = {
        pizzaria: { emoji: "🍕", exemplo: "Sua Pizzaria", busca: "pizzaria", extra: "pedidos", ticket: 60, mensagens: 60,
            concorrentes: ["Pizzaria Bella Massa · ⭐ 4,8 · cardápio · WhatsApp", "Forno & Cia · ⭐ 4,6 · pedir online"],
            whats: {
                sem: ["boa noite, ainda tá aberto?", "quanto tá a grande de calabresa?", "entrega no Jardim dos Estados?", "tem pizza de brigadeiro com bacon?", "???"],
                alerta: "você viu às 23h47, de chinelo 🩴. ele já tá comendo a do concorrente",
                com: [["“ainda tá aberto?” → Até 23h30 🍕", "na hora"], ["“quanto tá a grande?” → cardápio com preço e foto", "sem digitar nada"], ["“entrega no Jardim dos Estados?” → Entrega! Taxa R$ 5", "na hora"]],
                fim: "e você? tirando pizza do forno em paz 🔥",
            } },
        barbearia: { emoji: "💈", exemplo: "Sua Barbearia", busca: "barbearia", extra: "agenda", ticket: 40, mensagens: 40,
            concorrentes: ["Barbearia Navalha · ⭐ 4,9 · agenda online", "Corte Fino · ⭐ 4,7 · WhatsApp"],
            whats: {
                sem: ["fala mano, tem horário hoje?", "e amanhã cedo?", "quanto tá corte + barba?", "faz o corte do Neymar?", "??"],
                alerta: "você com a máquina na mão, respondendo com o cotovelo 💈",
                com: [["“tem horário hoje?” → 16h30 ou 18h, escolhe no link", "na hora"], ["“corte + barba?” → R$ 55, tá na tela", "sem digitar nada"], ["“faz o do Neymar?” → Faz! Tem foto de referência no site 😎", "na hora"]],
                fim: "e você? só na tesoura, sem largar o cliente ✂️",
            },
            agenda: {
                sem: ["mano, tem como 15h?", "ah não, 15h eu não consigo", "16h então?", "vou ver aqui e te falo", "e aí, tem?"],
                alerta: "📅 marcou o Zé e o Pedro no mesmo horário. os dois de cara feia 😬",
                com: [["Zé escolheu sábado, 15h", "sozinho"], ["lembrete no WhatsApp 1h antes", "automático"], ["Pedro viu que 15h tava ocupado e pegou 16h", "sem briga"]],
                fim: "cadeira cheia e zero “e aí, tem?” ✓",
            } },
        "loja de roupa": { emoji: "👕", exemplo: "Sua Loja", busca: "loja de roupa", extra: "loja", ticket: 150, mensagens: 50,
            concorrentes: ["Estilo Urbano · ⭐ 4,8 · loja online", "Vitrine Store · ⭐ 4,6 · entrega"],
            whats: {
                sem: ["oii, esse vestido ainda tem?", "tem no M?", "e na cor preta?", "quanto fica o frete pra Dourados?", "vou pensar e te aviso 🙃"],
                alerta: "📸 23 fotos no direct e ela ainda vai pensar",
                com: [["“ainda tem?” → estoque na tela, sempre atualizado", "na hora"], ["“tem no M?” → P, M e G, é só escolher", "sem digitar nada"], ["“frete pra Dourados?” → calculado no carrinho", "sozinho"]],
                fim: "e você? embalando pedido, não respondendo direct 📦",
            } },
        "salão": { emoji: "💇", exemplo: "Seu Salão", busca: "salão de beleza", extra: "agenda", ticket: 90, mensagens: 40,
            concorrentes: ["Studio Bella · ⭐ 4,9 · agenda online", "Espaço Glamour · ⭐ 4,7 · WhatsApp"],
            whats: {
                sem: ["amiga, tem horário pra escova hoje?", "quanto tá a progressiva?", "faz unha junto?", "dá pra fazer luzes em 20 minutos?", "??"],
                alerta: "você com a mão cheia de tinta, tentando responder com o nariz 💇",
                com: [["“escova hoje?” → 14h ou 16h, escolhe no link", "na hora"], ["“progressiva?” → a partir de R$ 180, tá na tela", "sem digitar nada"], ["“faz unha junto?” → marca os dois no mesmo horário", "sozinho"]],
                fim: "e você? fazendo cabelo, não virando secretária ✨",
            },
            agenda: {
                sem: ["tem sábado?", "de manhã", "ah, de manhã não dá", "e se eu levar minha irmã?", "vou ver e te falo"],
                alerta: "📅 três clientes às 9h de sábado. boa sorte 😬",
                com: [["escova + unha, sábado 10h", "marcou sozinha"], ["a irmã pegou 10h30 no link", "sem mensagem"], ["lembrete no WhatsApp 1 dia antes", "automático"]],
                fim: "agenda cheia e você nem pegou no celular ✓",
            } },
        academia: { emoji: "💪", exemplo: "Sua Academia", busca: "academia", extra: "agenda", ticket: 100, mensagens: 30,
            concorrentes: ["Academia Força Total · ⭐ 4,8 · planos online", "Fit Center · ⭐ 4,6 · aula experimental"],
            whats: {
                sem: ["quanto tá a mensalidade?", "tem plano anual?", "abre domingo?", "dá pra ficar monstro até sexta?", "segunda eu começo 😅"],
                alerta: "ele disse “segunda eu começo”. faz 3 anos 🥲",
                com: [["“mensalidade?” → planos a partir de R$ 89, na tela", "sem digitar nada"], ["“abre domingo?” → Domingo das 8h às 12h", "na hora"], ["“tem aula experimental?” → marca no link", "sozinho"]],
                fim: "e você? dando treino, não respondendo preço 💪",
            },
            agenda: {
                sem: ["quero fazer aula experimental", "pode ser hoje?", "hoje não dá, amanhã?", "amanhã tenho coisa...", "sexta então"],
                alerta: "📅 sexta ele sumiu. “segunda eu começo” 🥲",
                com: [["aula experimental: quinta, 19h", "marcou sozinho"], ["lembrete no WhatsApp 2h antes", "automático"], ["ele veio. e voltou na segunda", "milagre"]],
                fim: "aluno novo matriculado sem você largar o treino ✓",
            } },
        "clínica": { emoji: "🩺", exemplo: "Sua Clínica", busca: "clínica", extra: "agenda", ticket: 200, mensagens: 30,
            concorrentes: ["Clínica Vida · ⭐ 4,9 · agendamento online", "Centro Médico Saúde · ⭐ 4,7 · convênios"],
            whats: {
                sem: ["bom dia, atende Unimed?", "tem horário essa semana?", "quanto é a consulta particular?", "o doutor atende por áudio?", "alô??"],
                alerta: "a recepção respondendo 80 mensagens com o telefone tocando 📞",
                com: [["“atende Unimed?” → convênios aceitos, na tela", "na hora"], ["“horário essa semana?” → quinta 9h ou sexta 15h, no link", "sozinho"], ["“consulta particular?” → valor e o que inclui, na tela", "sem digitar nada"]],
                fim: "e a recepção? atendendo quem tá na sala 🩺",
            },
            agenda: {
                sem: ["tem horário quinta?", "de manhã, antes do trabalho", "ah, 8h não dá", "vou ver e te ligo", "(uma semana depois) oi, ainda tem vaga?"],
                alerta: "📅 paciente faltou sem avisar. horário vazio 🫠",
                com: [["paciente marcou quinta, 9h", "sozinho"], ["lembrete 1 dia antes: “confirma?”", "automático"], ["desmarcou pelo link, horário liberado", "sem furo"]],
                fim: "agenda cheia e zero falta sem aviso ✓",
            } },
    };

    // demos que servem de "testar" (se o card existir na página)
    const cards = [...document.querySelectorAll(".card-projeto")];
    const demo = (nome, texto) => {
        const card = cards.find((c) => c.querySelector(".projeto-nome")?.textContent.trim() === nome);
        const href = card?.querySelector(".link-projeto")?.getAttribute("href");
        return href ? { href, texto, novaAba: true } : { href: "#projetos", texto: "ver projetos parecidos ↓" };
    };

    // Linhas: [tipo, texto, detalhe]. msg = mensagem chegando; busca/resultado = Google; alerta = deu ruim;
    // ok = resolvido (com ✓); fim = fecho. metricas: [rótulo, sem, com].
    function cenas(tipo, nome) {
        const n = NEGOCIOS[tipo];
        const marca = nome || n.exemplo;
        const lista = [
            {
                aba: "Google", tipoOrc: "site", cta: "quero aparecer no Google →", testar: { href: "#projetos", texto: "ver sites que eu fiz ↓" },
                sem: nome
                    ? [["busca", nome], ["resultado", "Nenhum resultado. Você quis dizer: concorrente?"], ["msg", "“será que fechou?” 🤔"], ["msg", "“deve ser golpe” 🧐"], ["alerta", "fechou nada, só não tem site 🥲"]]
                    : [["busca", `${n.busca} perto de mim`], ["resultado", n.concorrentes[0]], ["resultado", n.concorrentes[1]], ["resultado", "…página 7 do Google: nem sinal de você 👻"], ["alerta", "cliente foi no concorrente. o concorrente agradece 🙏"]],
                com: [["busca", nome || `${n.busca} perto de mim`], ["ok", `${marca} · horário · endereço · WhatsApp`, "apareceu bonitão"], ["ok", "cliente tocou em “Chamar no WhatsApp”", "sem ligar, sem sofrer"], ["fim", "cliente novo chegando e você nem penteou o cabelo 😎"]],
                metricas: [["No Google", "fantasma 👻", "aparece ✨"], ["Horário e preço", "segredo de Estado", "na tela, 24h"], ["Cliente novo", "vai pro vizinho", "chama você"]],
            },
            {
                aba: "WhatsApp", tipoOrc: "automacao", cta: "quero parar de responder a mesma coisa →", testar: demo("Fatia Nobre", "testar um atendimento automático ↗"),
                sem: [...n.whats.sem.map((m) => ["msg", m]), ["alerta", n.whats.alerta]],
                com: [...n.whats.com.map(([t, d]) => ["ok", t, d]), ["fim", n.whats.fim]],
                metricas: [["Tempo de resposta", "quando der 🐢", "na hora ⚡"], ["Mesma pergunta", "47ª vez hoje", "respondida sozinha"], ["Seu celular", "não para de apitar 📳", "em paz 🧘"]],
            },
        ];
        if (n.extra === "pedidos") lista.push({
            aba: "pedidos", tipoOrc: "site", cta: "quero receber pedido pronto →", testar: demo("Glitch District", "testar uma loja com pedido no WhatsApp ↗"),
            sem: [["msg", "quero uma calabresa grande"], ["msg", "não, média"], ["msg", "meia calabresa meia frango"], ["msg", "e uma coca... não, guaraná"], ["msg", "ah, sem cebola. na metade de frango. acho"], ["alerta", "📝 anotou errado. de novo. 🤡"]],
            com: [["ok", "🍕 Média · ½ calabresa, ½ frango sem cebola", "R$ 52"], ["ok", "🥤 Guaraná 2L", "R$ 12"], ["ok", "✏️ obs: sem cebola na metade de frango", "anotado certinho"], ["fim", "pedido chegou certinho, sem telefone sem fio ✓"]],
            metricas: [["Pra fechar um pedido", "15 mensagens", "1 toque"], ["Pedido errado", "toda sexta 🤡", "zero"], ["Paciência do cliente", "no limite", "intacta"]],
        });
        if (n.extra === "loja") lista.push({
            aba: "loja", tipoOrc: "site", cta: "quero uma loja que vende sozinha →", testar: demo("Glitch District", "testar a loja ↗"),
            sem: [["msg", "manda foto do moletom preto"], ["msg", "agora de costas"], ["msg", "e com luz natural?"], ["msg", "tem M?"], ["msg", "vou pensar 🙃"], ["alerta", "📸 você virou modelo, fotógrafo e vendedor… e ele vai pensar"]],
            com: [["ok", "🛒 Moletom preto · M", "R$ 189"], ["ok", "🛒 Boné preto", "R$ 79"], ["ok", "📏 tabela de medidas na tela", "zero “tem M?”"], ["fim", "pedido de R$ 268 no WhatsApp e você nem tirou foto ✓"]],
            metricas: [["Pra fechar um pedido", "20 mensagens", "1 toque"], ["Fotos no direct", "o dia todo", "nenhuma"], ["“Vou pensar” 🙃", "toda hora", "raridade"]],
        });
        if (n.extra === "agenda") lista.push({
            aba: "agenda", tipoOrc: "sistema", cta: "quero uma agenda que se preenche sozinha →", testar: { href: "#projetos", texto: "ver sistemas que eu fiz ↓" },
            sem: [...n.agenda.sem.map((m) => ["msg", m]), ["alerta", n.agenda.alerta]],
            com: [...n.agenda.com.map(([t, d]) => ["ok", t, d]), ["fim", n.agenda.fim]],
            metricas: [["Pra marcar horário", "10 mensagens", "2 toques"], ["Horário furado", "acontece 😬", "raridade"], ["A agenda fica", "no caderno (molhado)", "no celular"]],
        });
        return lista;
    }

    // O comparador fica lá no topo: se ele muda de altura enquanto a pessoa lê mais embaixo, a página
    // inteira pula (no iPhone o navegador não compensa). Então ele só troca de cena quando está na tela,
    // e os dois lados nunca encolhem de uma cena pra outra (a altura só cresce até a maior cena).
    let naTela = true;
    if ("IntersectionObserver" in window) new IntersectionObserver((e) => { naTela = e.some((x) => x.isIntersecting); }).observe(raiz);
    const quandoNaTela = () => new Promise((ok) => { (function ver() { if (naTela && !document.hidden) ok(); else setTimeout(ver, 500); })(); });
    const segurarAltura = () => ["sem", "com"].forEach((lado) => { const el = palco[lado]; el.style.minHeight = Math.max(el.offsetHeight, parseFloat(el.style.minHeight) || 0) + "px"; });
    let larguraAntes = innerWidth;
    addEventListener("resize", () => { if (innerWidth === larguraAntes) return; larguraAntes = innerWidth; palco.sem.style.minHeight = palco.com.style.minHeight = ""; });

    let tipo = NEGOCIOS[ler("portfolio-tipo-negocio")] ? ler("portfolio-tipo-negocio") : "pizzaria";
    let lista = [], atual = 0, rodada = 0, automatico = true;
    const nome = () => (campoNome?.value || "").trim().slice(0, 40);
    const pararAuto = () => { automatico = false; raiz.classList.add("cmp-manual"); raiz.classList.remove("cmp-contando"); };

    // chips de tipo de negócio
    Object.entries(NEGOCIOS).forEach(([chaveTipo, n]) => {
        const b = document.createElement("button");
        b.type = "button"; b.dataset.tipo = chaveTipo; b.textContent = `${n.emoji} ${chaveTipo}`;
        b.addEventListener("click", () => { tipo = chaveTipo; gravar("portfolio-tipo-negocio", tipo); pararAuto(); montar(); mostrar(0); calcular(true); window.ESTATISTICAS?.contar(`/evento/ramo-${window.ESTATISTICAS.slug(tipo)}`, `ramo escolhido: ${tipo}`, true); });
        tiposEl.appendChild(b);
    });

    function montar() {
        lista = cenas(tipo, nome());
        [...tiposEl.children].forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tipo === tipo)));
        abas.replaceChildren(...lista.map((c, i) => {
            const b = document.createElement("button");
            b.type = "button"; b.textContent = c.aba; b.setAttribute("aria-pressed", "false");
            b.addEventListener("click", () => { pararAuto(); mostrar(i); });
            return b;
        }));
        if (campoNome) campoNome.placeholder = `nome da sua ${tipo} (opcional)`.replace("sua salão", "seu salão").replace("sua loja de roupa", "sua loja");
    }

    function linha(lado, t, texto, detalhe) {
        const el = document.createElement("div");
        el.className = "cmp-linha cmp-" + t;
        const s = document.createElement("span"); s.textContent = texto; el.appendChild(s);
        if (detalhe) { const d = document.createElement("small"); d.textContent = detalhe; el.appendChild(d); }
        if (t === "msg") el.style.setProperty("--giro", (Math.random() * 4 - 2).toFixed(1) + "deg");
        palco[lado].appendChild(el);
        return el;
    }

    function montarPlacar(c) {
        ["sem", "com"].forEach((lado) => placar[lado].replaceChildren(...c.metricas.map(([rotulo, sem, com]) => {
            const m = document.createElement("div");
            m.className = "cmp-metrica";
            m.innerHTML = "<small></small><b></b>";
            m.querySelector("small").textContent = rotulo;
            m.querySelector("b").textContent = lado === "sem" ? sem : com;
            return m;
        })));
    }
    async function acenderPlacar() {
        for (const lado of ["sem", "com"]) for (const [i, m] of [...placar[lado].children].entries()) {
            m.classList.add("aceso");
            if (lado === "com" && window.musicaSite && window.musicaSite.pode()) window.musicaSite.nota(79 + i * 4, 0.5);
            await espera(110);
        }
    }

    const botaoPrevia = $(".cmp-previa");
    botaoPrevia?.addEventListener("click", () => { pararAuto(); window.abrirPreviaSite && window.abrirPreviaSite(tipo, nome()); });
    function acertarRodape(c) {
        if (botaoPrevia) botaoPrevia.querySelector("b").textContent = nome() || NEGOCIOS[tipo].exemplo;
        if (modoAntesDepois) return; // o rodapé fica com o texto fixo do HTML
        querer.textContent = c.cta;
        querer.dataset.orcamentoTipo = c.tipoOrc;
        querer.dataset.orcamentoRef = `${nome() || tipo} — ${c.cta.replace(" →", "")}`.slice(0, 80);
        testar.href = c.testar.href; testar.textContent = c.testar.texto;
        if (c.testar.novaAba) { testar.target = "_blank"; testar.rel = "noopener noreferrer"; } else { testar.removeAttribute("target"); testar.removeAttribute("rel"); }
    }

    // Mostra uma cena: as linhas dos dois lados vão entrando intercaladas (o "sem" bagunçado, o "com" em ordem)
    async function mostrar(i) {
        const minha = ++rodada;
        const vivo = () => minha === rodada;
        const c = lista[i];
        atual = i;
        [...abas.children].forEach((b, j) => b.setAttribute("aria-pressed", String(j === i)));
        acertarRodape(c);
        montarPlacar(c);
        raiz.classList.add("cmp-trocando");
        await espera(180);
        if (!vivo()) return false;
        raiz.classList.remove("cmp-trocando");
        segurarAltura();
        palco.sem.innerHTML = ""; palco.com.innerHTML = "";
        // todas as linhas da cena entram de uma vez, escondidas, e vão aparecendo uma a uma: assim o
        // comparador já nasce do tamanho final e não empurra a página enquanto as mensagens chegam
        const passos = Math.max(c.sem.length, c.com.length);
        const fila = [];
        for (let p = 0; p < passos; p++) {
            if (c.sem[p]) fila.push([linha("sem", ...c.sem[p]), c.sem[p][0] === "alerta" ? 500 : 380]);
            if (c.com[p]) fila.push([linha("com", ...c.com[p]), 380]);
        }
        if (!semMovimento) fila.forEach(([el]) => el.classList.add("cmp-esperando"));
        for (const [el, tempo] of fila) {
            if (!vivo()) return false;
            el.classList.remove("cmp-esperando");
            await espera(tempo);
        }
        if (!vivo()) return false;
        await acenderPlacar();
        return vivo();
    }

    async function rodarSozinho(i) {
        if (!automatico) return;
        if (!(await mostrar(i)) || semMovimento) return;
        raiz.classList.remove("cmp-contando"); void raiz.offsetWidth; raiz.classList.add("cmp-contando");
        await espera(5000);
        raiz.classList.remove("cmp-contando");
        await quandoNaTela();
        if (automatico) rodarSozinho((i + 1) % lista.length);
    }

    // nome: o mesmo do campo dos projetos, nos dois sentidos
    if (campoNome) {
        campoNome.value = ler("portfolio-nome-negocio");
        let atraso = 0;
        campoNome.addEventListener("input", () => {
            clearTimeout(atraso);
            atraso = setTimeout(() => {
                if (campoNomeProjetos) { campoNomeProjetos.value = campoNome.value; campoNomeProjetos.dispatchEvent(new Event("input")); }
                else gravar("portfolio-nome-negocio", nome());
                pararAuto();
                lista = cenas(tipo, nome());
                mostrar(0);
            }, 350);
        });
        campoNome.addEventListener("focus", pararAuto);
    }
    campoNomeProjetos?.addEventListener("input", () => {
        if (document.activeElement === campoNome) return;
        campoNome.value = campoNomeProjetos.value;
        lista = cenas(tipo, nome());
        acertarRodape(lista[atual]);
    });

    /* Calculadora: quanto some por mês sem resposta rápida (estimativa: 1 em cada 5 desiste) */
    const calc = $(".cmp-calc"), faixa = $(".cmp-calc input[type=range]"), ticketEl = $(".cmp-calc input[type=number]");
    const saidaMsgs = $(".cmp-calc-msgs"), saidaClientes = $(".cmp-calc-clientes"), saidaPerda = $(".cmp-calc-perda"), saidaAno = $(".cmp-calc-ano");
    let perdaMostrada = 0, quadroCalc = 0;
    function calcular(reiniciar) {
        if (!calc) return;
        const n = NEGOCIOS[tipo];
        if (reiniciar) { faixa.value = n.mensagens; ticketEl.value = n.ticket; }
        const msgs = Number(faixa.value) || 0, ticket = Math.max(0, Number(ticketEl.value) || 0);
        const clientes = Math.round((msgs * 4.3) / 5);
        const perda = clientes * ticket;
        saidaMsgs.textContent = msgs;
        saidaClientes.textContent = clientes;
        saidaAno.textContent = reais(perda * 12);
        faixa.style.setProperty("--p", ((msgs - faixa.min) / (faixa.max - faixa.min) * 100).toFixed(1) + "%");
        cancelAnimationFrame(quadroCalc);
        if (reiniciar === "inicio") { perdaMostrada = perda; saidaPerda.textContent = reais(perda); return; } // na abertura: sem animar nem forçar layout
        const de = perdaMostrada, inicio = performance.now();
        const passo = (agora) => {
            const t = semMovimento ? 1 : Math.min((agora - inicio) / 500, 1);
            perdaMostrada = de + (perda - de) * (1 - Math.pow(1 - t, 3));
            saidaPerda.textContent = reais(perdaMostrada);
            if (t < 1) quadroCalc = requestAnimationFrame(passo);
        };
        quadroCalc = requestAnimationFrame(passo);
        saidaPerda.classList.remove("pulou"); void saidaPerda.offsetWidth; saidaPerda.classList.add("pulou");
    }
    faixa?.addEventListener("input", () => calcular(false));
    ticketEl?.addEventListener("input", () => calcular(false));

    // monta as cenas quando o processador estiver livre: a primeira tela aparece antes
    // as abas entram na hora (senão a fileira aparece depois e empurra a página); a calculadora, que fica
    // fechada num "abrir", só é preenchida quando o processador estiver livre
    montar();
    let montado = false;
    const montarJa = () => { if (montado) return; montado = true; calcular("inicio"); };
    (window.requestIdleCallback || ((f) => setTimeout(f, 200)))(montarJa, { timeout: 1500 });
    let comecou = false;
    const comecar = () => { if (comecou) return; comecou = true; montarJa(); if (modoAntesDepois) { automatico = false; acertarRodape(lista[0]); } else if (semMovimento) { automatico = false; mostrar(0); } else rodarSozinho(0); };
    // A primeira cena já entra escondida no carregamento: o comparador nasce do tamanho final, em vez de
    // crescer quando aparece na tela (o que empurrava a página no celular)
    (function reservarEspaco() {
        if (modoAntesDepois) return;
        const c = cenas(tipo, nome())[0];
        if (!c) return;
        montarPlacar(c);
        c.sem.forEach((x) => linha("sem", ...x).classList.add("cmp-esperando"));
        c.com.forEach((x) => linha("com", ...x).classList.add("cmp-esperando"));
    })();
    if ("IntersectionObserver" in window) {
        const obs = new IntersectionObserver((e) => { if (e.some((x) => x.isIntersecting)) { obs.disconnect(); comecar(); } });
        obs.observe(raiz);
    } else comecar();
})();

/* Filtro de projetos por tecnologia */
const chipsFiltro = document.querySelectorAll(".chip-filtro");
const cardsProjeto = document.querySelectorAll(".card-projeto");

chipsFiltro.forEach((chip) => {
    chip.addEventListener("click", () => {
        chipsFiltro.forEach((c) => c.classList.remove("is-ativo"));
        chip.classList.add("is-ativo");
        const filtro = chip.dataset.filtro;
        cardsProjeto.forEach((card) => {
            const tecnologias = (card.dataset.tecnologias || "").split(" ");
            const mostrar = filtro === "todos" || tecnologias.includes(filtro);
            card.classList.toggle("card-oculto", !mostrar);
            if (mostrar && !prefereMenosMovimento) {
                card.classList.remove("card-filtrado");
                void card.offsetWidth;
                card.classList.add("card-filtrado");
            }
        });
    });
});

/* Modal (demo embutida em iframe + case study em texto) */
const modalOverlay = document.getElementById("modalOverlay");
const modalTitulo = document.getElementById("modalTitulo");
const modalCorpo = document.getElementById("modalCorpo");
const modalFechar = document.getElementById("modalFechar");
let focoAntesDoModal = null;

function abrirModal(titulo, conteudoHtml) {
    modalTitulo.textContent = titulo;
    modalCorpo.innerHTML = conteudoHtml;
    modalOverlay.hidden = false;
    document.body.style.overflow = "hidden";
    focoAntesDoModal = document.activeElement;
    modalFechar.focus();
}

function fecharModal() {
    modalOverlay.hidden = true;
    modalCorpo.innerHTML = "";
    document.body.style.overflow = "";
    if (focoAntesDoModal) focoAntesDoModal.focus();
}

if (modalOverlay) {
    modalFechar.addEventListener("click", fecharModal);
    modalOverlay.addEventListener("click", (evento) => {
        if (evento.target === modalOverlay) fecharModal();
    });
    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape" && !modalOverlay.hidden) fecharModal();
    });

    document.querySelectorAll("[data-demo]").forEach((botao) => {
        botao.addEventListener("click", () => {
            const src = botao.getAttribute("data-demo");
            const titulo = botao.getAttribute("data-demo-titulo") || "Demonstração";
            abrirModal(titulo, `<iframe src="${src}" title="Demonstração — ${titulo}" loading="lazy"></iframe>`);
        });
    });

    document.querySelectorAll("[data-caso]").forEach((botao) => {
        botao.addEventListener("click", () => {
            abrirModal("Decisões técnicas — Controle de Gastos API", `
                <ul class="lista-decisoes">
                    <li><strong>Lógica de negócio separada da API.</strong> A camada que valida e salva um gasto não sabe nada sobre HTTP, JSON ou request — só recebe dados e devolve dados. Isso permitiu escrever os testes sem simular requisição nenhuma.</li>
                    <li><strong>CORS restrito.</strong> A API aceita chamadas só do domínio do portfólio, não "*" — um detalhe que mostra atenção a quem pode consumir a API.</li>
                    <li><strong>Validação com erro 400 claro.</strong> Se falta descrição ou o valor é negativo, a API explica o motivo em vez de deixar o banco quebrar sozinho.</li>
                    <li><strong>CI no GitHub Actions.</strong> A cada push, os testes automatizados rodam sozinhos antes de qualquer coisa ir pro ar.</li>
                </ul>
                <p class="modal-nota">Publicado originalmente como <a href="https://www.linkedin.com/in/samuelrondon-dev/" target="_blank" rel="noopener noreferrer">post no LinkedIn</a>.</p>
            `);
        });
    });
}

/* Copiar link do LinkedIn */
const botaoCopiarLink = document.getElementById("botaoCopiarLink");

botaoCopiarLink?.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText("https://www.linkedin.com/in/samuelrondon-dev/");
        mostrarToast("Link do LinkedIn copiado!");
    } catch {
        mostrarToast("Não foi possível copiar. Copie manualmente.");
    }
});

/* Easter egg — código Konami */
const sequenciaKonami = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
let progressoKonami = 0;

document.addEventListener("keydown", (evento) => {
    const tecla = evento.key.toLowerCase();
    if (tecla === sequenciaKonami[progressoKonami]) {
        progressoKonami++;
        if (progressoKonami === sequenciaKonami.length) {
            progressoKonami = 0;
            ativarEasterEgg();
        }
    } else {
        progressoKonami = tecla === sequenciaKonami[0] ? 1 : 0;
    }
});

function ativarEasterEgg() {
    mostrarToast("🕹️ Easter egg encontrado! Modo dev ativado.");
    favIconTemporario(4000);
    if (prefereMenosMovimento) return;
    const emojis = ["💻", "🚀", "✨", "🐍", "⚡"];
    for (let i = 0; i < 24; i++) {
        const span = document.createElement("span");
        span.className = "confete";
        span.textContent = emojis[i % emojis.length];
        span.style.left = Math.random() * 100 + "vw";
        span.style.animationDuration = 2.4 + Math.random() * 1.6 + "s";
        span.style.animationDelay = Math.random() * 0.4 + "s";
        document.body.appendChild(span);
        span.addEventListener("animationend", () => span.remove());
    }
}

/* Barra de progresso de leitura */
const barraProgresso = document.getElementById("barraProgresso");

function atualizarBarraProgresso() {
    if (!barraProgresso) return;
    const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
    const progresso = alturaTotal > 0 ? (window.scrollY / alturaTotal) * 100 : 0;
    barraProgresso.style.width = progresso + "%";
}

/* Nav vira camada de vidro flutuante ao rolar + fundo com parallax mais lento que o conteúdo */
const navEl = document.querySelector(".nav");

function atualizarCamadasScroll() {
    atualizarBarraProgresso();
    if (navEl) navEl.classList.toggle("nav-flutuante", window.scrollY > 40);
    if (!prefereMenosMovimento && !document.documentElement.classList.contains("modo-leve")) {
        document.body.style.setProperty("--scroll-parallax", Math.min(window.scrollY * 0.04, 40) + "px");
    }
}

/* Pontinhos do fundo: sem grade, cada um nasce num lugar aleatório, anda numa direção própria
   (nunca fixa) e some — não fica voltando pro início como um loop de posição. A geração em si
   é que fica em loop (espalhando pontinhos novos aos poucos), com 3 trajetos diferentes pra
   nunca parecer o mesmo padrão se repetindo. */
if (!prefereMenosMovimento) {
    const camadaPontos = document.createElement("div");
    camadaPontos.className = "pontos-fundo";
    camadaPontos.setAttribute("aria-hidden", "true");
    document.body.prepend(camadaPontos);
    const MAX_PONTOS = window.matchMedia("(pointer: coarse)").matches ? 8 : 16;
    let pontosNaTela = 0;
    function espalharPonto() {
        if (pontosNaTela < MAX_PONTOS) {
            pontosNaTela++;
            const p = document.createElement("span");
            const variante = 1 + Math.floor(Math.random() * 3);
            p.className = "ponto-fundo ponto-" + variante;
            const angulo = Math.random() * Math.PI * 2;
            const distancia = 40 + Math.random() * 90;
            p.style.setProperty("--px", (Math.random() * 100).toFixed(2) + "%");
            p.style.setProperty("--py", (Math.random() * 100).toFixed(2) + "%");
            p.style.setProperty("--dx", (Math.cos(angulo) * distancia).toFixed(1) + "px");
            p.style.setProperty("--dy", (Math.sin(angulo) * distancia).toFixed(1) + "px");
            p.style.setProperty("--ptam", (2 + Math.random() * 2.4).toFixed(1) + "px");
            p.style.setProperty("--pop", (.35 + Math.random() * .45).toFixed(2));
            p.style.setProperty("--pdur", (13 + Math.random() * 11).toFixed(1) + "s");
            p.addEventListener("animationend", () => { p.remove(); pontosNaTela--; }, { once: true });
            camadaPontos.appendChild(p);
        }
        setTimeout(espalharPonto, 500 + Math.random() * 700);
    }
    espalharPonto();
}

/* Intensidade do fundo: um nível base conforme a seção visível (mais vivo nas seções de
   conversão, mais calmo nas de leitura) + um arranco suave quando você rola rápido. Roda a
   cada ~150ms (não a cada quadro) e só escreve quando o valor muda de verdade — o fundo tem
   camadas pesadas (ruído, blur) e repintar isso 60x/s a toa foi o que travava a página. */
if (!prefereMenosMovimento) {
    const NIVEL_SECAO = { comparador: .3, "sobre-mim": .25, projetos: .55, "mais-projetos": .4, servicos: .45, orcamento: .55, jornada: .3, contato: .6 };
    let nivelBaseFundo = .3;
    const secoesFundo = document.querySelectorAll("main .secao[id]");
    if (secoesFundo.length) {
        const obsFundo = new IntersectionObserver((entradas) => {
            entradas.forEach((entrada) => {
                if (entrada.isIntersecting && entrada.intersectionRatio > .4) {
                    nivelBaseFundo = NIVEL_SECAO[entrada.target.id] ?? .35;
                }
            });
        }, { threshold: [0, .4, .6, 1] });
        secoesFundo.forEach((secao) => obsFundo.observe(secao));
    }

    // a posição de rolagem vem do evento de scroll (ler scrollY dentro do timer forçava o navegador a recalcular a página)
    let yAtualFundo = window.scrollY;
    window.addEventListener("scroll", () => { yAtualFundo = window.scrollY; }, { passive: true });
    let velocSuaveFundo = 0, ultimoYFundo = yAtualFundo, ultimoTempoFundo = performance.now(), ultimaIntensidade = -1;
    setInterval(() => {
        const agora = performance.now();
        const dt = Math.max(16, agora - ultimoTempoFundo);
        const veloc = Math.min(1, (Math.abs(yAtualFundo - ultimoYFundo) / dt * 16) / 40);
        ultimoYFundo = yAtualFundo;
        ultimoTempoFundo = agora;
        velocSuaveFundo += (veloc - velocSuaveFundo) * .18;
        const intensidade = Math.min(1, nivelBaseFundo + velocSuaveFundo * .4);
        const arredondado = Math.round(intensidade * 50) / 50; // passos de 0.02: suave o bastante, sem escrever à toa
        if (arredondado !== ultimaIntensidade) {
            document.body.style.setProperty("--fundo-intensidade", arredondado.toFixed(3));
            ultimaIntensidade = arredondado;
        }
    }, 150);
}

let ticandoBarra = false;
window.addEventListener("scroll", () => {
    if (ticandoBarra) return;
    ticandoBarra = true;
    requestAnimationFrame(() => {
        atualizarCamadasScroll();
        ticandoBarra = false;
    });
});
atualizarCamadasScroll();

/* "Trabalhando agora em": o nome do projeto mais recente fica guardado no aparelho.
   A API do GitHub só deixa 60 consultas por hora por endereço de rede, e no celular várias pessoas dividem o mesmo
   endereço da operadora: sem guardar, a linha sumia sem aviso. Guardamos só o nome e a hora em que o guardamos. */
const CHAVE_TRABALHANDO = "gh-trabalhando-v1";
const VALIDADE_TRABALHANDO_MS = 30 * 60 * 1000;          // dentro desse prazo nem pergunta ao GitHub
const MAXIMO_TRABALHANDO_MS = 14 * 24 * 60 * 60 * 1000;   // mais velho que isso, o nome guardado já não vale mostrar

function lerTrabalhando() {
    try {
        const salvo = JSON.parse(localStorage.getItem(CHAVE_TRABALHANDO) || "null");
        if (!salvo || salvo.v !== 1 || typeof salvo.em !== "number") return null;
        return {
            em: salvo.em,
            nome: typeof salvo.nome === "string" ? salvo.nome : null,
            ate: typeof salvo.ate === "number" ? salvo.ate : 0
        };
    } catch {
        return null;
    }
}

function guardarTrabalhando(dados) {
    try {
        localStorage.setItem(CHAVE_TRABALHANDO, JSON.stringify({ v: 1, em: dados.em, nome: dados.nome, ate: dados.ate || 0 }));
    } catch {
        /* sem armazenamento: só não guarda */
    }
}

function mostrarTrabalhando(nome) {
    const trabalhandoEl = document.getElementById("trabalhandoAgora");
    // Nomes de repositório só têm letras, números, ponto, hífen e sublinhado: qualquer outra coisa vinda do aparelho é ignorada.
    if (!trabalhandoEl || typeof nome !== "string" || !/^[\w.-]{1,100}$/.test(nome)) return;
    const forte = document.createElement("strong");
    forte.textContent = nome;
    trabalhandoEl.innerHTML = svgIcone("pulso", "ic-mini") + "Trabalhando agora em: ";
    trabalhandoEl.appendChild(forte);
    trabalhandoEl.hidden = false;
}

async function carregarStatsGithub() {
    const agora = Date.now();
    const guardado = lerTrabalhando();
    // O que estiver guardado aparece na hora, sem esperar a rede.
    if (guardado && guardado.nome && agora - guardado.em < MAXIMO_TRABALHANDO_MS) mostrarTrabalhando(guardado.nome);
    if (guardado && guardado.ate > agora) return;                                                // o GitHub pediu para esperar: não insiste
    if (guardado && guardado.nome && agora - guardado.em < VALIDADE_TRABALHANDO_MS) return;      // guardado há pouco: nem pergunta
    const anterior = guardado ? { em: guardado.em, nome: guardado.nome } : { em: 0, nome: null };
    try {
        const resposta = await fetch("https://api.github.com/users/SamueldevmI/repos?per_page=100&type=owner");
        if (!resposta.ok) {
            // Limite atingido (403/429) ou erro do servidor: guarda "não insista até..." e segue com o nome que já tínhamos.
            const reinicio = Number(resposta.headers.get("x-ratelimit-reset")) * 1000;
            const limite = resposta.status === 403 || resposta.status === 429;
            const espera = limite ? 30 : 5;
            const ate = limite && reinicio > Date.now() ? Math.min(reinicio, Date.now() + 2 * 60 * 60 * 1000) : Date.now() + espera * 60 * 1000;
            guardarTrabalhando({ em: anterior.em, nome: anterior.nome, ate });
            return;
        }
        const repos = await resposta.json();
        if (!Array.isArray(repos)) return;

        const proprios = repos.filter((r) => !r.fork);
        const maisRecente = proprios.sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))[0];
        if (maisRecente) {
            guardarTrabalhando({ em: Date.now(), nome: maisRecente.name });
            mostrarTrabalhando(maisRecente.name);
        }

        // Estrelas e forks somados: aproveita esta mesma busca (a paginação já pediu 100 repositórios),
        // sem gastar mais uma chamada contra o limite da API. Guardado à parte pra aparecer na hora,
        // mesmo nas visitas em que o "trabalhando agora em" está em cache e nem chega até aqui.
        const estrelas = proprios.reduce((soma, r) => soma + (r.stargazers_count || 0), 0);
        const forks = proprios.reduce((soma, r) => soma + (r.forks_count || 0), 0);
        try { localStorage.setItem("gh-estrelas-v1", JSON.stringify({ estrelas, forks })); } catch { /* sem armazenamento */ }
        window.mostrarEstrelasGithub?.(estrelas, forks);
    } catch {
        /* sem rede ou API fora do ar: fica o nome guardado, se houver */
    }
}
carregarStatsGithub();

/* Calculadora rápida de orçamento na hero: dá uma estimativa na hora, pelo tipo de projeto
   e complexidade, só pra matar a curiosidade antes mesmo de chegar no formulário de orçamento. */
(function calculadoraRapida() {
    const raiz = document.querySelector(".calc-rapida");
    if (!raiz) return;
    const botoesTipo = raiz.querySelectorAll(".calc-tipo");
    const slider = raiz.querySelector("#calcComplexidade");
    const rotuloComplexidade = raiz.querySelector("#calcComplexidadeRotulo");
    const valorEl = raiz.querySelector("#calcValor");
    const cta = raiz.querySelector("#calcCta");
    const niveis = [
        { nome: "Simples", mult: 1 },
        { nome: "Médio", mult: 1.5 },
        { nome: "Avançado", mult: 2.2 },
    ];

    function atualizar() {
        const tipoEl = raiz.querySelector(".calc-tipo.is-ativo");
        const base = Number(tipoEl.dataset.base);
        const nivel = niveis[Number(slider.value)];
        rotuloComplexidade.textContent = nivel.nome;
        slider.setAttribute("aria-valuetext", nivel.nome);
        if (nivel.mult === 1) {
            valorEl.textContent = `a partir de R$ ${base}`;
        } else {
            const preco = Math.round((base * nivel.mult) / 5) * 5;
            valorEl.textContent = `por volta de R$ ${preco}`;
        }
        cta.dataset.orcamentoTipo = tipoEl.dataset.tipo;
    }

    botoesTipo.forEach((botao) => {
        botao.addEventListener("click", () => {
            botoesTipo.forEach((b) => b.classList.remove("is-ativo"));
            botao.classList.add("is-ativo");
            atualizar();
        });
    });
    slider?.addEventListener("input", atualizar);
    atualizar();
})();

/* Cross-highlight: passar o mouse (ou focar com Tab) numa competência destaca os projetos relacionados.
   Clicar ou tocar FIXA o destaque (no celular não existe "passar o mouse"); clicar de novo tira. */
const habilidadesItens = document.querySelectorAll(".habilidades li[data-tecnologia]");
const listaProjetosEl = document.getElementById("lista-projetos");
const listaMiniEl = document.querySelector(".lista-mini-projetos");
const miniProjetos = document.querySelectorAll(".mini-projeto[data-tecnologias]");
let tecnologiaFixa = null;

function destacarProjetosPorTecnologia(tecnologia) {
    if (!listaProjetosEl) return;
    listaProjetosEl.classList.add("tem-destaque");
    cardsProjeto.forEach((card) => {
        const tecnologias = (card.dataset.tecnologias || "").split(" ");
        card.classList.toggle("card-destacado", tecnologias.includes(tecnologia));
    });
    listaMiniEl?.classList.add("tem-destaque");
    miniProjetos.forEach((item) => {
        const tecnologias = (item.dataset.tecnologias || "").split(" ");
        item.classList.toggle("mini-destacado", tecnologias.includes(tecnologia));
    });
}

function limparDestaqueProjetos() {
    if (tecnologiaFixa) { destacarProjetosPorTecnologia(tecnologiaFixa); return; }
    if (!listaProjetosEl) return;
    listaProjetosEl.classList.remove("tem-destaque");
    cardsProjeto.forEach((card) => card.classList.remove("card-destacado"));
    listaMiniEl?.classList.remove("tem-destaque");
    miniProjetos.forEach((item) => item.classList.remove("mini-destacado"));
}

habilidadesItens.forEach((item) => {
    const tecnologia = item.dataset.tecnologia;
    item.addEventListener("mouseenter", () => destacarProjetosPorTecnologia(tecnologia));
    item.addEventListener("mouseleave", limparDestaqueProjetos);
    item.addEventListener("focusin", () => destacarProjetosPorTecnologia(tecnologia));
    item.addEventListener("focusout", limparDestaqueProjetos);
    item.querySelector("button")?.addEventListener("click", () => {
        tecnologiaFixa = tecnologiaFixa === tecnologia ? null : tecnologia;
        habilidadesItens.forEach((outro) => {
            const fixa = outro.dataset.tecnologia === tecnologiaFixa;
            outro.classList.toggle("habilidade-ativa", fixa);
            outro.querySelector("button")?.setAttribute("aria-pressed", String(fixa));
        });
        destacarProjetosPorTecnologia(tecnologiaFixa ?? tecnologia);
    });
});

/* Flip nos cards de projeto: mostra a stack completa no verso */
document.querySelectorAll(".botao-flip").forEach((botao) => {
    botao.addEventListener("click", (evento) => {
        evento.stopPropagation();
        const virado = botao.closest(".projeto-visual")?.classList.toggle("visual-virado");
        botao.setAttribute("aria-pressed", String(!!virado));
    });
});

/* Compartilhar projeto (Web Share API, com fallback pra copiar o link) */
document.querySelectorAll("[data-compartilhar]").forEach((botao) => {
    botao.addEventListener("click", async (evento) => {
        evento.stopPropagation();
        const caminho = botao.getAttribute("data-compartilhar");
        const titulo = botao.getAttribute("data-compartilhar-titulo") || "Projeto";
        const url = new URL(caminho, window.location.href).href;
        if (navigator.share) {
            try {
                await navigator.share({ title: `${titulo} — Samuel Mickael`, url });
            } catch {
                /* usuário cancelou o compartilhamento */
            }
        } else {
            try {
                await navigator.clipboard.writeText(url);
                mostrarToast(`Link de "${titulo}" copiado!`);
            } catch {
                mostrarToast("Não foi possível copiar. Copie manualmente.");
            }
        }
    });
});

/* Copiar exemplo de request da API */
document.querySelectorAll("[data-copiar-codigo]").forEach((botao) => {
    botao.addEventListener("click", async () => {
        const codigo = botao.getAttribute("data-copiar-codigo");
        try {
            await navigator.clipboard.writeText(codigo);
            mostrarToast("Exemplo de request copiado!");
        } catch {
            mostrarToast("Não foi possível copiar. Copie manualmente.");
        }
    });
});

/* Tour guiado */
const botaoTour = document.getElementById("botaoTour");
const tourOverlay = document.getElementById("tourOverlay");
const tourRealce = document.getElementById("tourRealce");
const tourCaixa = document.getElementById("tourCaixa");
const tourPassoEl = document.getElementById("tourPasso");
const tourTituloEl = document.getElementById("tourTitulo");
const tourTextoEl = document.getElementById("tourTexto");
const tourAnterior = document.getElementById("tourAnterior");
const tourProximo = document.getElementById("tourProximo");
const tourPular = document.getElementById("tourPular");

const passosTour = [
    { seletor: "#sobre-mim .titulo-secao", titulo: "Quem sou", texto: "Um resumo rápido sobre mim, minha formação e minhas competências principais." },
    { seletor: "#projetos .titulo-secao", titulo: "Projetos em destaque", texto: "Os trabalhos que representam meu aprendizado — dá pra filtrar por tecnologia e testar as demos direto aqui." },
    { seletor: "#servicos .titulo-secao", titulo: "Como posso ajudar", texto: "Os tipos de projeto que eu topo desenvolver: sites, aplicações web e automações em Python." },
    { seletor: "#orcamento .orcamento-caixa", titulo: "Peça seu orçamento", texto: "Responda algumas perguntas e a mensagem já vai pronta para o meu WhatsApp." },
    { seletor: "#contato .contato-acoes", titulo: "Vamos conversar", texto: "Se tiver uma vaga, projeto ou só quiser trocar uma ideia, é por aqui." },
];
let passoAtualTour = 0;

function posicionarTour() {
    const passo = passosTour[passoAtualTour];
    const alvo = document.querySelector(passo.seletor);
    if (!alvo || !tourRealce || !tourCaixa) return;

    // Scroll instantâneo e cálculo síncrono, na mesma execução: elimina qualquer corrida entre a
    // animação do scroll e a leitura de getBoundingClientRect (scrollend/timeout se mostraram pouco
    // confiáveis para distâncias grandes). Importante: "instant" e não "auto" — o CSS global tem
    // scroll-behavior:smooth em html, e "auto" herda isso (continua animando). O visual continua
    // suave porque .tour-caixa e .tour-realce já têm transition de top/left no CSS.
    alvo.scrollIntoView({ behavior: "instant", block: "center" });

    const rect = alvo.getBoundingClientRect();
    const folga = 10;
    tourRealce.style.top = Math.max(rect.top - folga, 0) + "px";
    tourRealce.style.left = Math.max(rect.left - folga, 0) + "px";
    tourRealce.style.width = rect.width + folga * 2 + "px";
    tourRealce.style.height = rect.height + folga * 2 + "px";

    const espacoAbaixo = window.innerHeight - rect.bottom;
    const caixaAcimaDoAlvo = espacoAbaixo < 220;
    const topoCaixa = caixaAcimaDoAlvo ? Math.max(rect.top - 190, 12) : Math.min(rect.bottom + 12, window.innerHeight - 200);
    tourCaixa.style.top = Math.max(topoCaixa, 12) + "px";
    tourCaixa.style.left = Math.min(Math.max(rect.left, 16), window.innerWidth - 356) + "px";

    tourPassoEl.textContent = `Passo ${passoAtualTour + 1} de ${passosTour.length}`;
    tourTituloEl.textContent = passo.titulo;
    tourTextoEl.textContent = passo.texto;
    tourAnterior.disabled = passoAtualTour === 0;
    tourProximo.textContent = passoAtualTour === passosTour.length - 1 ? "Concluir" : "Próximo";
}

function abrirTour() {
    passoAtualTour = 0;
    tourOverlay.hidden = false;
    posicionarTour();
}

function fecharTour() {
    tourOverlay.hidden = true;
}

botaoTour?.addEventListener("click", abrirTour);
tourPular?.addEventListener("click", fecharTour);
tourAnterior?.addEventListener("click", () => {
    if (passoAtualTour > 0) {
        passoAtualTour--;
        posicionarTour();
    }
});
tourProximo?.addEventListener("click", () => {
    if (passoAtualTour < passosTour.length - 1) {
        passoAtualTour++;
        posicionarTour();
    } else {
        fecharTour();
    }
});
document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && tourOverlay && !tourOverlay.hidden) fecharTour();
});

const suportaHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* Parallax sutil no círculo do hero (scroll + mouse) */
const heroConteudo = document.querySelector(".hero-conteudo");
if (heroConteudo && !prefereMenosMovimento) {
    window.addEventListener("scroll", () => {
        heroConteudo.style.setProperty("--parallax", Math.min(window.scrollY * 0.15, 160) + "px");
    });
    heroConteudo.addEventListener("mousemove", (evento) => {
        const relativoX = evento.clientX / window.innerWidth - 0.5;
        heroConteudo.style.setProperty("--parallax-x", relativoX * -28 + "px");
        const rect = heroConteudo.getBoundingClientRect();
        heroConteudo.style.setProperty("--spot-x", evento.clientX - rect.left + "px");
        heroConteudo.style.setProperty("--spot-y", evento.clientY - rect.top + "px");
    });
}

/* Título de seção "afunda" numa camada mais distante ao passar do topo */
const titulosSecao = document.querySelectorAll(".titulo-secao");
if (titulosSecao.length && !prefereMenosMovimento && "IntersectionObserver" in window) {
    const observadorTitulos = new IntersectionObserver(
        (entradas) => {
            entradas.forEach((entrada) => {
                const passouDoTopo = !entrada.isIntersecting && entrada.boundingClientRect.top < 0;
                entrada.target.classList.toggle("titulo-passado", passouDoTopo);
            });
        },
        { threshold: 0, rootMargin: "-1px 0px -85% 0px" }
    );
    titulosSecao.forEach((el) => observadorTitulos.observe(el));
}

/* Tilt 3D nos cards de projeto */
if (suportaHover && !prefereMenosMovimento) {
    document.body.classList.add("tem-tilt");
    cardsProjeto.forEach((card) => {
        if (card.hasAttribute("data-largo")) return; // a faixa de largura total não inclina: a borda dela se afastaria demais do mouse
        card.addEventListener("mousemove", (evento) => {
            /* sobre link ou botão o card fica parado: o que está sob o mouse não foge, e o anel do cursor não desalinha */
            if (evento.target.closest("a, button, summary")) return;
            const rect = card.getBoundingClientRect();
            const centroX = rect.width / 2;
            const centroY = rect.height / 2;
            const x = evento.clientX - rect.left;
            const y = evento.clientY - rect.top;
            const rotY = ((x - centroX) / centroX) * 6;
            const rotX = ((centroY - y) / centroY) * 6;
            card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-7px)`;
        });
        card.addEventListener("mouseleave", () => {
            card.style.transform = "";
        });
    });
}

/* Botões magnéticos: deslizam levemente na direção do mouse */
if (suportaHover && !prefereMenosMovimento) {
    document.querySelectorAll(".botao").forEach((botao) => {
        botao.addEventListener("mousemove", (evento) => {
            const rect = botao.getBoundingClientRect();
            const x = evento.clientX - rect.left - rect.width / 2;
            const y = evento.clientY - rect.top - rect.height / 2;
            botao.style.transform = `translate(${x * 0.22}px, ${y * 0.35 - 3}px)`;
        });
        botao.addEventListener("mouseleave", () => {
            botao.style.transform = "";
        });
    });
}

/* Indicador de seção (scroll-spy) */
const linksSecao = document.querySelectorAll(".indicador-secoes a");
if (linksSecao.length) {
    const observadorSecoes = new IntersectionObserver(
        (entradas) => {
            entradas.forEach((entrada) => {
                if (!entrada.isIntersecting) return;
                const linkAtivo = document.querySelector(`.indicador-secoes a[href="#${entrada.target.id}"]`);
                if (!linkAtivo) return;
                linksSecao.forEach((link) => link.classList.remove("secao-ativa"));
                linkAtivo.classList.add("secao-ativa");
            });
        },
        { rootMargin: "-45% 0px -45% 0px" }
    );
    linksSecao.forEach((link) => {
        const secao = document.querySelector(link.getAttribute("href"));
        if (secao) observadorSecoes.observe(secao);
    });
}

/* Botão "Qual é a sua cara?": mostra o tipo de projeto e pula pro que combina.
   O atalho da paleta de comandos (Ctrl+K) continua chamando surpreenderProjeto()
   direto, pulando pra qualquer um visível — sem abrir os chips. */
const botaoSurpresa = document.getElementById("botaoSurpresa");
const opcoesSurpresa = document.getElementById("surpresaOpcoes");

function visiveisAgora() {
    return Array.from(cardsProjeto).filter((card) => !card.classList.contains("card-oculto"));
}

function destacarProjeto(escolhido) {
    if (!escolhido) return;
    escolhido.scrollIntoView({ behavior: prefereMenosMovimento ? "instant" : "smooth", block: "center" });
    cardsProjeto.forEach((card) => { card.classList.remove("card-em-foco"); card.querySelector(".combina-selo")?.remove(); });
    escolhido.classList.add("card-em-foco");
    const selo = document.createElement("span");
    selo.className = "combina-selo";
    selo.innerHTML = svgIcone("sparkle", "ic-mini ic-preenchido") + "É essa!";
    escolhido.appendChild(selo);
    requestAnimationFrame(() => selo.classList.add("mostrar"));
    setTimeout(() => {
        escolhido.classList.remove("card-em-foco");
        selo.remove();
    }, 2400);
}

function surpreenderProjeto() {
    const visiveis = visiveisAgora();
    if (!visiveis.length) return;
    destacarProjeto(visiveis[Math.floor(Math.random() * visiveis.length)]);
}

function escolherPorTipo(tipo) {
    const visiveis = visiveisAgora();
    const combinam = tipo === "qualquer" ? visiveis : visiveis.filter((card) => card.querySelector(".card-orcamento")?.dataset.orcamentoTipo === tipo);
    const lista = combinam.length ? combinam : visiveis;
    if (!lista.length) return;
    destacarProjeto(lista[Math.floor(Math.random() * lista.length)]);
}

if (botaoSurpresa && opcoesSurpresa) {
    botaoSurpresa.addEventListener("click", () => {
        const abrir = opcoesSurpresa.hidden;
        opcoesSurpresa.hidden = !abrir;
        botaoSurpresa.setAttribute("aria-expanded", String(abrir));
        botaoSurpresa.classList.toggle("is-ativo", abrir);
    });
    opcoesSurpresa.querySelectorAll("[data-tipo]").forEach((chip) => {
        chip.addEventListener("click", () => {
            escolherPorTipo(chip.dataset.tipo);
            opcoesSurpresa.hidden = true;
            botaoSurpresa.setAttribute("aria-expanded", "false");
            botaoSurpresa.classList.remove("is-ativo");
        });
    });
}

/* Recompensa por tempo de permanência */
setTimeout(() => {
    mostrarToast("🎉 Você já está por aqui há um tempinho — obrigado por explorar o portfólio!");
    favIconTemporario(4000);
}, 90000);

/* Paleta de comandos (Ctrl+K) */
const botaoBusca = document.getElementById("botaoBusca");
const paletaOverlay = document.getElementById("paletaOverlay");
const paletaInput = document.getElementById("paletaInput");
const paletaLista = document.getElementById("paletaLista");
const paletaVazio = document.getElementById("paletaVazio");
const itensPaleta = paletaLista ? Array.from(paletaLista.querySelectorAll("button")) : [];

function itensVisiveisPaleta() {
    return itensPaleta.filter((botao) => !botao.closest("li").hidden);
}

function filtrarPaleta(termo) {
    const termoNormalizado = termo.trim().toLowerCase();
    itensPaleta.forEach((botao) => {
        const textoBusca = (botao.textContent + " " + (botao.dataset.busca || "")).toLowerCase();
        const visivel = textoBusca.includes(termoNormalizado);
        botao.closest("li").hidden = !visivel;
        botao.classList.remove("paleta-selecionado");
    });
    const visiveis = itensVisiveisPaleta();
    paletaVazio.hidden = visiveis.length > 0;
    if (visiveis.length) visiveis[0].classList.add("paleta-selecionado");
}

function moverSelecaoPaleta(direcao) {
    const visiveis = itensVisiveisPaleta();
    if (!visiveis.length) return;
    const atual = visiveis.findIndex((botao) => botao.classList.contains("paleta-selecionado"));
    visiveis.forEach((botao) => botao.classList.remove("paleta-selecionado"));
    let proximo = atual + direcao;
    if (proximo < 0) proximo = visiveis.length - 1;
    if (proximo >= visiveis.length) proximo = 0;
    visiveis[proximo].classList.add("paleta-selecionado");
    visiveis[proximo].scrollIntoView({ block: "nearest" });
}

function abrirPaleta() {
    if (!paletaOverlay) return;
    paletaOverlay.hidden = false;
    paletaInput.value = "";
    filtrarPaleta("");
    paletaInput.focus();
}

function fecharPaleta() {
    if (!paletaOverlay) return;
    paletaOverlay.hidden = true;
}

function executarComandoPaleta(botao) {
    const acao = botao.dataset.acao;
    const alvo = botao.dataset.alvo;
    fecharPaleta();
    if (acao === "scroll") {
        document.querySelector(alvo)?.scrollIntoView({ behavior: prefereMenosMovimento ? "instant" : "smooth", block: "start" });
    } else if (acao === "link") {
        window.open(alvo, alvo.startsWith("http") ? "_blank" : "_self");
    } else if (acao === "tour") {
        abrirTour();
    } else if (acao === "surpresa") {
        surpreenderProjeto();
    }
}

if (paletaOverlay) {
    botaoBusca?.addEventListener("click", abrirPaleta); // o botão saiu do topo; a paleta segue no atalho de teclado
    paletaInput.addEventListener("input", () => filtrarPaleta(paletaInput.value));
    paletaOverlay.addEventListener("click", (evento) => {
        if (evento.target === paletaOverlay) fecharPaleta();
    });
    itensPaleta.forEach((botao) => botao.addEventListener("click", () => executarComandoPaleta(botao)));

    document.addEventListener("keydown", (evento) => {
        if ((evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === "k") {
            evento.preventDefault();
            if (paletaOverlay.hidden) abrirPaleta();
            else fecharPaleta();
            return;
        }
        if (paletaOverlay.hidden) return;
        if (evento.key === "Escape") {
            fecharPaleta();
        } else if (evento.key === "ArrowDown") {
            evento.preventDefault();
            moverSelecaoPaleta(1);
        } else if (evento.key === "ArrowUp") {
            evento.preventDefault();
            moverSelecaoPaleta(-1);
        } else if (evento.key === "Enter") {
            const selecionado = itensPaleta.find((botao) => botao.classList.contains("paleta-selecionado"));
            if (selecionado) {
                evento.preventDefault();
                executarComandoPaleta(selecionado);
            }
        }
    });
}

/* Orçamento em passos: as respostas viram uma mensagem pronta para o WhatsApp */
(() => {
    const raiz = document.getElementById("orcamentoApp");
    const linkDireto = document.querySelector('#orcamento a[href^="https://wa.me/"]');
    if (!raiz || !linkDireto) return;

    // O número vem do link "falar direto" da própria seção: um único lugar para trocar.
    const numero = new URL(linkDireto.href).pathname.replace(/\//g, "");
    const CHAVE = "orcamento-rascunho";
    const VALIDADE_MS = 14 * 24 * 60 * 60 * 1000;

    // Fica fora da caixa do orçamento de propósito: na impressão, ".orcamento-caixa" inteira some
    // (regra já existente do site), e um elemento dentro de algo com display:none não tem como aparecer.
    const impresso = document.createElement("pre");
    impresso.className = "orc-impresso";
    impresso.setAttribute("aria-hidden", "true");
    document.body.append(impresso);

    // Links com ?origem=instagram e ?tipo=app (só valores conhecidos entram na mensagem)
    const ORIGENS = { link: "link que você me mandou", instagram: "Instagram", whatsapp: "WhatsApp", linkedin: "LinkedIn", github: "GitHub", facebook: "Facebook", google: "Google" };
    const PARAMETROS = new URLSearchParams(location.search);
    const ORIGEM = ORIGENS[(PARAMETROS.get("origem") || "").toLowerCase()] || "";

    const ICONES_TIPO = { site: "🌐", sistema: "🖥️", app: "📱", automacao: "⚙️", naosei: "🧭" };

    const TIPOS = {
        site: {
            rotulo: "Site ou página de vendas",
            perguntas: [
                { id: "dominio", modo: "escolha", icone: "🔗", pergunta: "Você já tem um endereço na internet (domínio)?", opcoes: ["Sim", "Ainda não", "Não sei o que é isso"], rotuloMsg: "Já tem domínio" },
                { id: "identidade", modo: "escolha", icone: "🎨", pergunta: "Você já tem logo e cores da sua marca?", opcoes: ["Sim, tenho os dois", "Só o logo", "Ainda não tenho", "Não sei"], rotuloMsg: "Logo e cores" },
            ],
            recursos: ["Botão de WhatsApp", "Formulário de contato", "Galeria de fotos", "Loja online", "Agendamento", "Blog ou novidades"],
        },
        sistema: {
            rotulo: "Sistema web (cadastro, controle, painel)",
            perguntas: [
                { id: "usuarios", modo: "escolha", icone: "👥", pergunta: "Quantas pessoas vão usar o sistema?", opcoes: ["Só eu", "2 a 5 pessoas", "6 a 20 pessoas", "Mais de 20"], rotuloMsg: "Quantas pessoas vão usar" },
                { id: "hoje", modo: "escolha", icone: "📋", pergunta: "Como você controla isso hoje?", opcoes: ["Planilha", "Caderno ou papel", "Outro sistema", "Ainda não controlo"], rotuloMsg: "Como controla hoje" },
            ],
            recursos: ["Login de usuários", "Painel com gráficos", "Cadastro de clientes", "Relatórios em PDF ou Excel", "Avisos por WhatsApp ou e-mail", "Pagamento online"],
        },
        app: {
            rotulo: "Aplicativo de celular",
            perguntas: [
                { id: "aparelho", modo: "escolha", icone: "📲", pergunta: "Para qual celular?", opcoes: ["Android", "iPhone", "Os dois", "Não sei"], rotuloMsg: "Celular" },
                { id: "offline", modo: "escolha", icone: "📶", pergunta: "Ele precisa funcionar sem internet?", opcoes: ["Sim", "Não", "Não sei"], rotuloMsg: "Funcionar sem internet" },
            ],
            recursos: ["Login de usuários", "Notificações", "Câmera e fotos", "Mapa e localização", "Pagamento online", "Painel para administrar"],
        },
        automacao: {
            rotulo: "Automação (acabar com tarefa repetitiva)",
            perguntas: [
                { id: "tarefa", modo: "texto", longo: true, max: 240, icone: "🔁", pergunta: "Qual tarefa você repete todo dia ou toda semana?", dica: "Ex.: copiar os dados dos e-mails para uma planilha", rotuloMsg: "Tarefa que se repete" },
                { id: "frequencia", modo: "escolha", icone: "🗓️", pergunta: "Com que frequência ela acontece?", opcoes: ["Todo dia", "Toda semana", "Todo mês", "Não sei"], rotuloMsg: "Frequência" },
            ],
            recursos: ["Planilhas (Excel ou Google)", "E-mail", "WhatsApp", "Relatórios prontos", "Ler PDFs e documentos", "Avisos automáticos"],
        },
        naosei: {
            rotulo: "Ainda não sei o que preciso",
            perguntas: [
                { id: "problema", modo: "texto", longo: true, max: 240, icone: "❓", pergunta: "Qual problema você quer resolver ou o que quer melhorar?", dica: "Ex.: perco muito tempo respondendo as mesmas perguntas", rotuloMsg: "O que quer resolver" },
            ],
            recursos: null,
        },
    };
    const ORDEM = ["site", "sistema", "app", "automacao", "naosei"];

    const PASSO_TIPO = { id: "tipo", modo: "escolha", icone: "🎯", pergunta: "Que tipo de projeto você quer?", opcoes: ORDEM.map((id) => ({ valor: id, texto: TIPOS[id].rotulo })) };
    const PASSO_NEGOCIO = { id: "negocio", modo: "texto", opcional: true, max: 160, icone: "💼", pergunta: "O que você faz ou vende?", dica: "Ex.: sou dentista e atendo em Campo Grande", rotuloMsg: "Sobre o negócio" };
    const PASSO_PRAZO = { id: "prazo", modo: "escolha", opcional: true, icone: "⏱️", pergunta: "Para quando você precisa?", opcoes: ["O quanto antes", "Em cerca de 1 mês", "Sem pressa", "Ainda não sei"], rotuloMsg: "Prazo" };
    const PASSO_CONTATO = { id: "contato", modo: "contato", icone: "👋", pergunta: "Como posso te chamar?" };
    const TOTAL_TIPICO = 7;

    let resp = {};
    let indice = 0;
    let retomado = false;
    let larguraAnterior = 0;
    let bloqueado = false;

    const criar = (tag, classe, texto) => {
        const elemento = document.createElement(tag);
        if (classe) elemento.className = classe;
        if (texto !== undefined) elemento.textContent = texto;
        return elemento;
    };

    const tipoAtual = () => TIPOS[resp.tipo];

    function passos() {
        const tipo = tipoAtual();
        const lista = [PASSO_TIPO, PASSO_NEGOCIO];
        if (tipo) {
            lista.push(...tipo.perguntas.map((pergunta) => ({ ...pergunta, opcional: true })));
            if (tipo.recursos) {
                lista.push({ id: "recursos", modo: "varias", opcional: true, icone: "🧩", pergunta: "O que o projeto precisa ter?", ajuda: "Marque o que quiser. Pode pular.", opcoes: tipo.recursos, rotuloMsg: "Precisa ter" });
            }
        }
        lista.push(PASSO_PRAZO, PASSO_CONTATO);
        return lista;
    }

    const totalDePerguntas = () => (tipoAtual() ? passos().length : TOTAL_TIPICO);

    function limparDoTipo() {
        const antigo = tipoAtual();
        if (antigo) antigo.perguntas.forEach((pergunta) => delete resp[pergunta.id]);
        delete resp.recursos;
    }

    /* Rascunho guardado só neste aparelho */
    function carregar() {
        try {
            const salvo = JSON.parse(localStorage.getItem(CHAVE) || "null");
            if (!salvo || salvo.v !== 1 || Date.now() - salvo.em > VALIDADE_MS || !salvo.resp || typeof salvo.resp !== "object") return;
            Object.entries(salvo.resp).forEach(([chave, valor]) => {
                if (typeof valor === "string") resp[chave] = valor.slice(0, 600);
                else if (Array.isArray(valor)) resp[chave] = valor.filter((item) => typeof item === "string").slice(0, 12);
            });
            indice = Number.isInteger(salvo.indice) ? salvo.indice : 0;
            retomado = Object.keys(resp).length > 0;
        } catch (erro) {
            /* sem armazenamento: segue sem rascunho */
        }
    }

    function salvar() {
        try {
            if (Object.keys(resp).length === 0) localStorage.removeItem(CHAVE);
            else localStorage.setItem(CHAVE, JSON.stringify({ v: 1, em: Date.now(), indice, resp }));
        } catch (erro) {
            /* sem armazenamento: o formulário continua funcionando */
        }
    }

    /* Mensagem final */
    function compor() {
        const tipo = tipoAtual();
        const nome = typeof resp.nome === "string" ? resp.nome.trim() : "";
        const abertura = `Oi, Samuel! ${nome ? `Me chamo ${nome}. ` : ""}${ORIGEM ? `Vim pelo ${ORIGEM}` : "Vi seu portfólio"} e quero pedir um orçamento.`;
        const linhas = [abertura, ""];
        if (tipo) linhas.push(`Projeto: ${tipo.rotulo}`);
        if (resp.ref) linhas.push(`Referência: projeto ${resp.ref}`);
        passos().forEach((passo) => {
            if (passo.id === "tipo" || passo.id === "contato") return;
            const valor = passo.id === "recursos"
                ? (Array.isArray(resp.recursos) ? resp.recursos.filter((item) => passo.opcoes.includes(item)).join(", ") : "")
                : resp[passo.id];
            if (valor) linhas.push(`${passo.rotuloMsg}: ${valor}`);
        });
        if (resp.siteAtual) linhas.push(`Site/rede social atual: ${resp.siteAtual}`);
        if (resp.obs) linhas.push(`Mais detalhes: ${resp.obs}`);
        return linhas.join("\n");
    }

    async function copiarTexto(campo) {
        try {
            await navigator.clipboard.writeText(campo.value);
            mostrarToast("Resumo copiado!");
        } catch (erro) {
            campo.select();
            const copiou = typeof document.execCommand === "function" && document.execCommand("copy");
            mostrarToast(copiou ? "Resumo copiado!" : "Não deu para copiar. Selecione o texto e copie.");
        }
    }

    /* Navegação entre passos */
    function ir(novo) {
        retomado = false;
        const direcao = novo >= indice ? 1 : -1;
        indice = Math.max(0, Math.min(novo, passos().length));
        desenhar(true, direcao);
        const caixa = raiz.closest(".orcamento-caixa");
        if (caixa && caixa.getBoundingClientRect().top < 0) {
            caixa.scrollIntoView({ block: "start", behavior: prefereMenosMovimento ? "instant" : "smooth" });
        }
    }

    function recomecar() {
        resp = {};
        indice = 0;
        retomado = false;
        larguraAnterior = 0;
        desenhar(true);
    }

    function escolher(passo, valor, grade, botao) {
        if (bloqueado) return;
        if (passo.id === "tipo" && resp.tipo && resp.tipo !== valor) limparDoTipo();
        resp[passo.id] = valor;
        grade.querySelectorAll(".orc-opcao").forEach((item) => item.setAttribute("aria-pressed", String(item === botao)));
        salvar();
        bloqueado = true;
        const de = indice;
        setTimeout(() => {
            bloqueado = false;
            if (indice === de) ir(de + 1);
        }, prefereMenosMovimento ? 0 : 200);
    }

    /* Desenho */
    function criarProgresso(feitos, total, pronto) {
        const caixa = criar("div", "orc-progresso");
        caixa.append(criar("p", "orc-etapa", pronto ? "Tudo certo!" : `Pergunta ${feitos + 1} de ${total}`));
        const trilho = criar("div", "orc-trilho");
        trilho.setAttribute("role", "progressbar");
        trilho.setAttribute("aria-label", "Progresso do orçamento");
        trilho.setAttribute("aria-valuemin", "0");
        trilho.setAttribute("aria-valuemax", String(total));
        trilho.setAttribute("aria-valuenow", String(feitos));
        const barra = criar("span");
        const largura = Math.round((feitos / total) * 100);
        barra.style.width = largura + "%";
        barra.style.setProperty("--de", larguraAnterior + "%");
        larguraAnterior = largura;
        trilho.append(barra);
        caixa.append(trilho);
        return caixa;
    }

    function criarNotaRetomado() {
        const nota = criar("p", "orc-retomado", "Continuamos de onde você parou. ");
        const botao = criar("button", "orc-link", "Recomeçar do zero");
        botao.type = "button";
        botao.addEventListener("click", recomecar);
        nota.append(botao);
        return nota;
    }

    function criarNavegacao(pai, principal, secundario) {
        const nav = criar("div", "orc-nav");
        if (indice > 0) {
            const voltar = criar("button", "orc-link", "← Voltar");
            voltar.type = "button";
            voltar.addEventListener("click", () => ir(indice - 1));
            nav.append(voltar);
        }
        const fim = criar("div", "orc-nav-fim");
        if (secundario) {
            const botao = criar("button", "orc-link", secundario.texto);
            botao.type = "button";
            botao.addEventListener("click", secundario.acao);
            fim.append(botao);
        }
        let botaoPrincipal = null;
        if (principal) {
            botaoPrincipal = criar("button", "botao botao-principal", principal.texto);
            botaoPrincipal.type = "button";
            botaoPrincipal.addEventListener("click", principal.acao);
            fim.append(botaoPrincipal);
        }
        nav.append(fim);
        pai.append(nav);
        return botaoPrincipal;
    }

    function criarEscolha(pai, passo) {
        const grade = criar("div", "orc-opcoes");
        grade.setAttribute("role", "group");
        grade.setAttribute("aria-labelledby", "orcPergunta");
        const textos = passo.opcoes.map((opcao) => (typeof opcao === "string" ? opcao : opcao.texto));
        if (textos.every((texto) => texto.length <= 22)) grade.classList.add("orc-opcoes--duas");
        passo.opcoes.forEach((opcao) => {
            const valor = typeof opcao === "string" ? opcao : opcao.valor;
            const texto = typeof opcao === "string" ? opcao : opcao.texto;
            const botao = criar("button", "orc-opcao", texto);
            botao.type = "button";
            botao.setAttribute("aria-pressed", String(resp[passo.id] === valor));
            botao.addEventListener("click", () => escolher(passo, valor, grade, botao));
            grade.append(botao);
        });
        pai.append(grade);
        if (resp[passo.id] !== undefined) {
            criarNavegacao(pai, { texto: "Próximo", acao: () => ir(indice + 1) });
        } else {
            criarNavegacao(pai, null, passo.opcional ? { texto: "Pular", acao: () => ir(indice + 1) } : null);
        }
    }

    function criarVarias(pai, passo) {
        const marcados = new Set((Array.isArray(resp.recursos) ? resp.recursos : []).filter((item) => passo.opcoes.includes(item)));
        const grade = criar("div", "orc-opcoes orc-opcoes--duas");
        grade.setAttribute("role", "group");
        grade.setAttribute("aria-labelledby", "orcPergunta");
        let principal = null;
        const atualizar = () => {
            const lista = passo.opcoes.filter((item) => marcados.has(item));
            if (lista.length) resp.recursos = lista;
            else delete resp.recursos;
            if (principal) principal.textContent = lista.length ? "Próximo" : "Pular";
            salvar();
        };
        passo.opcoes.forEach((opcao) => {
            const botao = criar("button", "orc-opcao", opcao);
            botao.type = "button";
            botao.setAttribute("aria-pressed", String(marcados.has(opcao)));
            botao.addEventListener("click", () => {
                if (marcados.has(opcao)) marcados.delete(opcao);
                else marcados.add(opcao);
                botao.setAttribute("aria-pressed", String(marcados.has(opcao)));
                atualizar();
            });
            grade.append(botao);
        });
        pai.append(grade);
        principal = criarNavegacao(pai, { texto: marcados.size ? "Próximo" : "Pular", acao: () => ir(indice + 1) });
    }

    function criarTexto(pai, passo) {
        const campo = criar(passo.longo ? "textarea" : "input", "orc-campo");
        if (passo.longo) campo.rows = 3;
        else campo.type = "text";
        campo.value = typeof resp[passo.id] === "string" ? resp[passo.id] : "";
        campo.placeholder = passo.dica || "";
        campo.maxLength = passo.max || 160;
        campo.autocomplete = "off";
        campo.setAttribute("aria-labelledby", "orcPergunta");
        pai.append(campo);
        let principal = null;
        campo.addEventListener("input", () => {
            const texto = campo.value.trim();
            if (texto) resp[passo.id] = texto;
            else delete resp[passo.id];
            if (principal) principal.textContent = texto ? "Próximo" : "Pular";
            salvar();
        });
        if (!passo.longo) {
            campo.addEventListener("keydown", (evento) => {
                if (evento.key === "Enter") {
                    evento.preventDefault();
                    ir(indice + 1);
                }
            });
        }
        principal = criarNavegacao(pai, { texto: campo.value.trim() ? "Próximo" : "Pular", acao: () => ir(indice + 1) });
    }

    function criarContato(pai) {
        const rotuloNome = criar("label", "orc-rotulo", "Seu nome");
        rotuloNome.htmlFor = "orcNome";
        const nome = criar("input", "orc-campo");
        nome.id = "orcNome";
        nome.type = "text";
        nome.maxLength = 60;
        nome.autocomplete = "given-name";
        nome.placeholder = "Ex.: Ana";
        nome.value = typeof resp.nome === "string" ? resp.nome : "";
        const rotuloSite = criar("label", "orc-rotulo", "Já tem site ou rede social do negócio? (opcional)");
        rotuloSite.htmlFor = "orcSiteAtual";
        const site = criar("input", "orc-campo");
        site.id = "orcSiteAtual";
        site.type = "text";
        site.maxLength = 200;
        site.inputMode = "url";
        site.placeholder = "Ex.: instagram.com/seunegocio";
        site.value = typeof resp.siteAtual === "string" ? resp.siteAtual : "";
        const rotuloObs = criar("label", "orc-rotulo", "Quer acrescentar algo? (opcional)");
        rotuloObs.htmlFor = "orcObs";
        const obs = criar("textarea", "orc-campo");
        obs.id = "orcObs";
        obs.rows = 3;
        obs.maxLength = 500;
        obs.placeholder = "Ex.: link de um site que você gosta, ou algo importante que eu deva saber";
        obs.value = typeof resp.obs === "string" ? resp.obs : "";
        const erro = criar("p", "orc-erro", "Escreva seu nome para eu saber com quem estou falando.");
        erro.setAttribute("role", "alert");
        erro.hidden = true;
        pai.append(rotuloNome, nome, rotuloSite, site, rotuloObs, obs, erro);

        const seguir = () => {
            if (nome.value.trim().length < 2) {
                erro.hidden = false;
                nome.focus();
                return;
            }
            ir(indice + 1);
        };
        nome.addEventListener("input", () => {
            const texto = nome.value.trim();
            if (texto) resp.nome = texto;
            else delete resp.nome;
            if (texto.length >= 2) erro.hidden = true;
            salvar();
        });
        nome.addEventListener("keydown", (evento) => {
            if (evento.key === "Enter") {
                evento.preventDefault();
                seguir();
            }
        });
        site.addEventListener("input", () => {
            const texto = site.value.trim();
            if (texto) resp.siteAtual = texto;
            else delete resp.siteAtual;
            salvar();
        });
        obs.addEventListener("input", () => {
            const texto = obs.value.trim();
            if (texto) resp.obs = texto;
            else delete resp.obs;
            salvar();
        });
        criarNavegacao(pai, { texto: "Ver minha mensagem", acao: seguir });
    }

    function criarPasso(passo) {
        const caixa = criar("div", "orc-passo");
        const titulo = criar("h3", "orc-pergunta");
        if (passo.icone) {
            const icone = criar("span", "orc-pergunta-icone", passo.icone);
            icone.setAttribute("aria-hidden", "true");
            titulo.append(icone);
        }
        titulo.append(document.createTextNode(passo.pergunta));
        titulo.id = "orcPergunta";
        titulo.tabIndex = -1;
        titulo.dataset.foco = "";
        caixa.append(titulo);
        if (passo.ajuda) caixa.append(criar("p", "orc-ajuda", passo.ajuda));
        if (passo.modo === "escolha") criarEscolha(caixa, passo);
        else if (passo.modo === "varias") criarVarias(caixa, passo);
        else if (passo.modo === "texto") criarTexto(caixa, passo);
        else criarContato(caixa);
        return caixa;
    }

    function criarFinal() {
        const caixa = criar("div", "orc-passo");
        const titulo = criar("h3", "orc-pergunta");
        const icone = criar("span", "orc-pergunta-icone", "✅");
        icone.setAttribute("aria-hidden", "true");
        titulo.append(icone, document.createTextNode("Sua mensagem está pronta"));
        titulo.tabIndex = -1;
        titulo.dataset.foco = "";
        caixa.append(titulo, criar("p", "orc-ajuda", "Confira e mude o que quiser. Ao clicar em enviar, o WhatsApp abre com este texto. Falta só apertar enviar por lá."));

        const campo = criar("textarea", "orc-campo orc-mensagem");
        campo.rows = 10;
        campo.maxLength = 1500;
        campo.setAttribute("aria-label", "Mensagem para o WhatsApp");
        campo.value = compor();

        const enviar = criar("a", "botao botao-principal", "Enviar pelo WhatsApp");
        enviar.target = "_blank";
        enviar.rel = "noopener noreferrer";
        const ajustarLink = () => { enviar.href = `https://wa.me/${numero}?text=${encodeURIComponent(campo.value)}`; };
        ajustarLink();
        campo.addEventListener("input", ajustarLink);

        const copiar = criar("button", "botao botao-secundario", "Copiar resumo");
        copiar.type = "button";
        copiar.addEventListener("click", () => copiarTexto(campo));

        // "Baixar em PDF": usa a caixa de impressão do próprio navegador (sem depender de nada externo).
        // No celular, a tela de impressão do Android/iPhone já tem a opção "Salvar como PDF".
        const baixarPdf = criar("button", "botao botao-secundario", "Baixar em PDF");
        baixarPdf.type = "button";
        baixarPdf.addEventListener("click", () => {
            impresso.textContent = campo.value;
            document.body.classList.add("imprimindo-resumo");
            window.print();
        });

        enviar.classList.add("orc-pulso");
        const acoes = criar("div", "orc-acoes");
        acoes.append(enviar, copiar, baixarPdf);

        // O navegador de dentro do Instagram/Facebook nem sempre abre o WhatsApp: oferece outro caminho.
        let avisoApp = null;
        if (/Instagram|FBAN|FBAV|FB_IAB/i.test(navigator.userAgent)) {
            avisoApp = criar("p", "orc-aviso-app", "Você está no navegador do Instagram. Se o WhatsApp não abrir, toque em Copiar resumo e me chame por lá.");
            if (typeof navigator.share === "function") {
                const compartilhar = criar("button", "botao botao-secundario", "Compartilhar");
                compartilhar.type = "button";
                compartilhar.addEventListener("click", () => navigator.share({ text: campo.value }).catch(() => {}));
                acoes.append(compartilhar);
            }
        }

        const nav = criar("div", "orc-nav");
        const voltar = criar("button", "orc-link", "← Voltar e mudar respostas");
        voltar.type = "button";
        voltar.addEventListener("click", () => ir(indice - 1));
        const refazer = criar("button", "orc-link", "Recomeçar");
        refazer.type = "button";
        refazer.addEventListener("click", recomecar);
        nav.append(voltar, refazer);

        caixa.append(campo, acoes, ...(avisoApp ? [avisoApp] : []), nav);
        return caixa;
    }
    // Uma vez só: tira a marca de "imprimindo" quando a caixa de impressão fecha (cancelar ou salvar).
    window.addEventListener("afterprint", () => document.body.classList.remove("imprimindo-resumo"));

    function desenhar(foco, direcao = 0) {
        const lista = passos();
        if (indice > lista.length) indice = lista.length;
        const pronto = indice === lista.length;
        const total = totalDePerguntas();
        raiz.replaceChildren(criarProgresso(pronto ? total : indice, total, pronto));
        if (retomado) raiz.append(criarNotaRetomado());
        const passoEl = pronto ? criarFinal() : criarPasso(lista[indice]);
        raiz.append(passoEl);
        if (direcao && !prefereMenosMovimento && typeof passoEl.animate === "function") {
            passoEl.animate(
                [{ opacity: 0, transform: `translateX(${direcao * 18}px)` }, { opacity: 1, transform: "translateX(0)" }],
                { duration: 240, easing: "cubic-bezier(.2,.7,.2,1)" }
            );
        }
        if (foco) raiz.querySelector("[data-foco]")?.focus({ preventScroll: true });
        salvar();
    }

    carregar();
    if (resp.tipo && !TIPOS[resp.tipo]) {
        resp = {};
        indice = 0;
        retomado = false;
    }
    indice = Math.max(0, Math.min(indice, passos().length));
    desenhar(false);

    /* Botões "Quero um assim" (projetos) e "Pedir orçamento disso" (serviços) */
    function rolarAteOrcamento(comFoco) {
        const caixa = raiz.closest(".orcamento-caixa");
        caixa?.scrollIntoView({ block: "start", behavior: prefereMenosMovimento ? "instant" : "smooth" });
        if (comFoco) setTimeout(() => raiz.querySelector("[data-foco]")?.focus({ preventScroll: true }), prefereMenosMovimento ? 0 : 500);
    }

    function preencher(tipo, referencia) {
        if (!TIPOS[tipo]) return false;
        const mudou = resp.tipo !== tipo;
        if (mudou) limparDoTipo();
        resp.tipo = tipo;
        if (referencia !== undefined) {
            if (referencia) resp.ref = String(referencia).slice(0, 80);
            else delete resp.ref;
        }
        retomado = false;
        if (mudou || indice === 0) indice = 1;
        indice = Math.min(indice, passos().length);
        desenhar(false);
        return true;
    }

    document.addEventListener("click", (evento) => {
        const gatilho = evento.target.closest("[data-orcamento-tipo]");
        if (!gatilho) return;
        if (preencher(gatilho.dataset.orcamentoTipo, gatilho.dataset.orcamentoRef || "")) rolarAteOrcamento(true);
    });

    // Link já com o tipo escolhido: .../portfolio/?tipo=app
    if (preencher((PARAMETROS.get("tipo") || "").toLowerCase(), undefined)) {
        const rolar = () => rolarAteOrcamento(false);
        if (document.readyState === "complete") rolar();
        else window.addEventListener("load", rolar, { once: true });
    }

    /* Botão fixo "Pedir orçamento" no celular: aparece depois do topo e some quando o orçamento ou o contato estão na tela */
    const botaoFixo = document.querySelector(".orcamento-fixo");
    if (botaoFixo && "IntersectionObserver" in window) {
        const visivel = { hero: true, orcamento: false, contato: false };
        // no orçamento ele continua na tela: o mobile.js troca o texto pra "Tirar dúvida" e manda pro WhatsApp
        const atualizar = () => botaoFixo.classList.toggle("is-visivel", !visivel.hero && !visivel.contato);
        [["hero", ".hero"], ["orcamento", "#orcamento"], ["contato", "#contato"]].forEach(([chave, seletor]) => {
            const alvo = document.querySelector(seletor);
            if (!alvo) {
                visivel[chave] = false;
                return;
            }
            new IntersectionObserver(([entrada]) => {
                visivel[chave] = entrada.isIntersecting;
                atualizar();
            }).observe(alvo);
        });
    }
})();

/* Esqueleto brilhante no lugar do gráfico do GitHub enquanto ele carrega */
(() => {
    const grafico = document.querySelector(".github-atividade img");
    if (!grafico || grafico.complete) return;
    grafico.classList.add("esqueleto");
    const terminou = () => grafico.classList.remove("esqueleto");
    grafico.addEventListener("load", terminou, { once: true });
    grafico.addEventListener("error", terminou, { once: true });
    setTimeout(terminou, 15000); // se o serviço do gráfico não responder, não deixa o esqueleto brilhando para sempre
})();

/* Troca de tema (vermelho <-> azul): carrega a outra folha de estilo e só tira a antiga quando a nova
   chegou, pra página não ficar sem estilo no meio da troca. A escolha fica guardada neste aparelho. */
(function () {
    const botao = document.getElementById("botaoTema");
    if (!botao) return;
    const raiz = document.documentElement;
    const atualizarBotao = () => {
        const azul = raiz.dataset.tema === "azul";
        botao.setAttribute("aria-label", azul ? "Trocar para o tema vermelho" : "Trocar para o tema azul");
        botao.title = azul ? "Tema vermelho" : "Tema azul";
    };
    // O que não vem da folha de estilo: selo de visitas (cor no link da imagem). Avisa os outros scripts
    // (ex.: anéis dos stories no celular) com o evento "temaTrocado".
    const pintarExtras = () => {
        const azul = raiz.dataset.tema === "azul";
        const selo = document.querySelector(".selo-visitas");
        if (selo) selo.src = selo.src.replace(/color=[0-9a-f]{6}/i, "color=" + (azul ? "1a3e8b" : "8b1a1a"));
    };
    if (raiz.dataset.tema === "azul") pintarExtras();
    atualizarBotao();
    let trocando = false;
    botao.addEventListener("click", () => {
        if (trocando) return;
        const atual = document.getElementById("folhaTema");
        if (!atual) return;
        trocando = true;
        const novoTema = raiz.dataset.tema === "azul" ? "vermelho" : "azul";
        const nova = document.createElement("link");
        nova.rel = "stylesheet";
        nova.href = atual.href.replace(/style(-azul)?\.css/, novoTema === "azul" ? "style-azul.css" : "style.css");
        nova.onload = () => {
            atual.remove();
            nova.id = "folhaTema";
            raiz.dataset.tema = novoTema;
            const cor = document.querySelector('meta[name="theme-color"]');
            if (cor) cor.content = novoTema === "azul" ? "#0e1422" : "#161616";
            try { localStorage.setItem("portfolio-tema", novoTema); } catch (e) { /* sem armazenamento: só não lembra */ }
            atualizarBotao();
            pintarExtras();
            document.dispatchEvent(new CustomEvent("temaTrocado", { detail: novoTema }));
            trocando = false;
            if (window.musicaSite && window.musicaSite.pode()) window.musicaSite.curtir();
        };
        nova.onerror = () => { nova.remove(); trocando = false; mostrarToast("Não deu pra trocar o tema agora. Tente de novo."); };
        atual.after(nova);
    });
})();

/* ---------- Prévia do site do cliente ----------
   "Veja como ficaria o SEU site": um celular com um mini-site montado na hora, com o nome do negócio e
   o conteúdo do ramo (cardápio, serviços, produtos, planos...). As cores ficam aqui no JS de propósito:
   são as do ramo do cliente, não as do tema do portfólio (o gerador do tema azul não mexe nelas).
   Abre pelo comparador, pelo convite do link personalizado ou direto com ?previa=1. */
(function previaDoSite() {
    const { RAMOS, esc, endereco, iniciais, celular } = window.PreviaCelular; // previa-celular.js
    const ler = (k) => { try { return localStorage.getItem(k) || ""; } catch (e) { return ""; } };

    function montar(ramo, nome) {
        const r = RAMOS[ramo];
        const marca = nome || r.exemplo;
        return `
            <div class="previa">
                <div class="previa-ramos" role="group" aria-label="Trocar o ramo da prévia">${Object.keys(RAMOS).map((k) => `<button type="button" data-ramo="${esc(k)}" aria-pressed="${k === ramo}">${esc(RAMOS[k].rotulo)}</button>`).join("")}</div>
${celular(ramo, marca)}
                <div class="previa-lado">
                    <p class="previa-titulo">Esse poderia ser o site da <b>${esc(marca)}</b>.</p>
                    <p>Isso é uma prévia rápida. O seu vem com a sua cara: suas fotos, seus preços, seu jeito de falar. Funciona no celular, aparece no Google e o botão cai direto no seu WhatsApp.</p>
                    <button type="button" class="botao botao-principal previa-quero" data-orcamento-tipo="site" data-orcamento-ref="${esc(`Prévia do site: ${marca} (${r.rotulo})`.slice(0, 80))}">quero esse site →</button>
                    <button type="button" class="previa-mandar">mandar essa prévia pro sócio 📲</button>
                </div>
            </div>`;
    }

    function abrir(ramo, nome) {
        ramo = RAMOS[ramo] ? ramo : (RAMOS[ler("portfolio-tipo-negocio")] ? ler("portfolio-tipo-negocio") : "pizzaria");
        nome = (nome ?? ler("portfolio-nome-negocio")).trim().slice(0, 40);
        const marca = nome || RAMOS[ramo].exemplo;
        window.ESTATISTICAS?.contar(`/evento/previa-${window.ESTATISTICAS.slug(ramo)}`, `prévia aberta: ${RAMOS[ramo].rotulo}`, true);
        if (typeof LINK_PERSONALIZADO !== "undefined" && LINK_PERSONALIZADO && LINK_PERSONALIZADO.slug) window.ESTATISTICAS?.contar(`/link/${LINK_PERSONALIZADO.slug}/previa`, `viu a prévia: ${LINK_PERSONALIZADO.para}`, true);
        abrirModal(`👀 Prévia: o site da ${marca}`, montar(ramo, nome));
        document.querySelector(".modal-caixa")?.classList.add("modal-previa");
        const raiz = modalCorpo.querySelector(".previa");
        const aviso = raiz.querySelector(".previa-aviso");
        let tempoAviso = 0;
        // tocar em qualquer coisa do mini-site mostra o que aconteceria no site de verdade
        raiz.querySelector(".previa-site").addEventListener("click", (e) => {
            const alvo = e.target.closest("button, .previa-whats");
            if (!alvo) return;
            alvo.classList.remove("apertou"); void alvo.offsetWidth; alvo.classList.add("apertou");
            aviso.textContent = alvo.closest(".previa-chips") ? "✓ no site de verdade, isso já marca/escolhe sozinho" : `✓ no site de verdade, isso abre o WhatsApp da ${marca}`;
            aviso.classList.add("visivel");
            clearTimeout(tempoAviso); tempoAviso = setTimeout(() => aviso.classList.remove("visivel"), 2200);
            if (window.musicaSite && window.musicaSite.pode()) window.musicaSite.curtir();
        });
        raiz.querySelectorAll(".previa-ramos button").forEach((b) => b.addEventListener("click", () => abrir(b.dataset.ramo, nome)));
        // "quero esse site": fecha a prévia e só DEPOIS manda pro orçamento. Fechar o modal devolve a entrada do
        // histórico (acabamento.js, botão voltar do celular) e o navegador restaura a posição antiga da página,
        // o que desfazia a rolagem até o formulário; por isso espera esse "voltar" terminar.
        const quero = raiz.querySelector(".previa-quero");
        quero.addEventListener("click", (e) => {
            e.stopPropagation();
            const gatilho = document.createElement("button");
            gatilho.type = "button"; gatilho.hidden = true;
            gatilho.dataset.orcamentoTipo = quero.dataset.orcamentoTipo;
            gatilho.dataset.orcamentoRef = quero.dataset.orcamentoRef;
            focoAntesDoModal = null;
            let foi = false;
            const seguir = () => { if (foi) return; foi = true; document.body.append(gatilho); gatilho.click(); gatilho.remove(); };
            window.addEventListener("popstate", () => setTimeout(seguir, 30), { once: true });
            setTimeout(seguir, 450); // se não houver "voltar" nenhum
            fecharModal();
        });
        raiz.querySelector(".previa-mandar").addEventListener("click", async () => {
            const url = new URL(location.href.split("?")[0].split("#")[0]);
            if (nome) url.searchParams.set("para", nome);
            url.searchParams.set("ramo", ramo);
            url.searchParams.set("previa", "1");
            const texto = `Olha como ficaria o site da ${marca}: ${url.toString()}`;
            try {
                if (navigator.share) await navigator.share({ title: `Prévia: o site da ${marca}`, text: texto });
                else { await navigator.clipboard.writeText(texto); mostrarToast("Link da prévia copiado! É só colar no WhatsApp."); }
            } catch (e) { /* a pessoa cancelou o compartilhamento */ }
        });
    }
    window.abrirPreviaSite = abrir;

    // Vitrine do topo: o mesmo celular, trocando de ramo sozinho (pizzaria → barbearia → loja...). Rola devagar
    // pelo mini-site pra mostrar que tem conteúdo, pausa com o mouse em cima e fora da tela; clicar abre a prévia.
    (function vitrine() {
        const caixa = document.querySelector(".hero-vitrine");
        if (!caixa) return;
        const ordem = Object.keys(RAMOS);
        const salvo = ler("portfolio-tipo-negocio");
        const filme = !prefereMenosMovimento && window.FilmeCelular; // filme-celular.js: o cliente comprando de madrugada
        let i = Math.max(0, ordem.indexOf(salvo)), pausado = false, visivel = true, relogio = 0, rolagem = 0, cena = null, geracao = 0;
        const LEGENDA = "digite o nome do seu negócio aqui embaixo, ou toque no celular pra prévia completa 👆";
        caixa.innerHTML = `
            <div class="vitrine-ramos" role="group" aria-label="Ver exemplo de outro ramo">${ordem.map((k) => `<button type="button" data-ramo="${esc(k)}">${esc(RAMOS[k].rotulo)}</button>`).join("")}</div>
            <div class="vitrine-palco" role="button" tabindex="0" aria-label="Abrir a prévia do site deste exemplo"></div>
            <p class="vitrine-legenda">${LEGENDA}</p>
            <label class="vitrine-nome"><span aria-hidden="true">✏️</span><input type="text" maxlength="40" placeholder="Digite o nome do seu negócio" autocomplete="organization" enterkeyhint="done" aria-label="Nome do seu negócio, pra ver no celular"></label>`;
        const palco = caixa.querySelector(".vitrine-palco");
        const legenda = caixa.querySelector(".vitrine-legenda");
        const campoNome = caixa.querySelector(".vitrine-nome input");
        const botoes = [...caixa.querySelectorAll(".vitrine-ramos button")];
        campoNome.value = ler("portfolio-nome-negocio").trim().slice(0, 40);
        const nomeAtual = () => campoNome.value.trim() || RAMOS[ordem[i]].exemplo;
        function mostrar(n, animar) {
            i = (n + ordem.length) % ordem.length;
            const ramo = ordem[i];
            const minha = ++geracao;
            cena?.cancelar();
            palco.innerHTML = celular(ramo, nomeAtual());
            palco.dataset.ramo = ramo;
            if (animar && !prefereMenosMovimento) { palco.classList.remove("trocou"); void palco.offsetWidth; palco.classList.add("trocou"); }
            botoes.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.ramo === ramo)));
            clearTimeout(rolagem);
            const site = palco.querySelector(".previa-site");
            if (filme) {
                // terminou a história: passa pro próximo ramo quando a vitrine estiver livre (sem mouse, na tela)
                const proximo = () => { if (minha !== geracao) return; if (pausado || !visivel || document.hidden) relogio = setTimeout(proximo, 600); else mostrar(i + 1, true); };
                cena = filme.rodar(palco, ramo, { marca: nomeAtual, ativo: () => visivel && !document.hidden, legenda: (html) => { legenda.innerHTML = html; }, fim: proximo });
            } else if (site && !prefereMenosMovimento) {
                // desce devagar pelo mini-site e volta, pra mostrar que tem cardápio/serviços lá embaixo
                rolagem = setTimeout(() => site.scrollTo({ top: 170, behavior: "smooth" }), 1600);
            }
        }
        function agendar() {
            clearTimeout(relogio);
            if (prefereMenosMovimento || filme) return;
            relogio = setTimeout(() => { if (!pausado && visivel && !document.hidden) mostrar(i + 1, true); agendar(); }, 4600);
        }
        // o nome digitado aparece na hora no celular (site, conversa e notificações) e fica guardado pra prévia
        let guardar = 0;
        campoNome.addEventListener("input", () => {
            const nome = nomeAtual();
            const ini = iniciais(nome);
            palco.querySelectorAll(".previa-topo b, .filme-zap-topo b, .filme-aviso b").forEach((el) => { el.textContent = nome; });
            palco.querySelectorAll(".previa-logo, .filme-zap-logo, .filme-aviso-logo").forEach((el) => { el.textContent = ini; });
            const url = palco.querySelector(".previa-url");
            if (url && url.lastChild) url.lastChild.textContent = endereco(nome);
            const marcaLegenda = legenda.querySelector("b[data-marca]");
            if (marcaLegenda) marcaLegenda.textContent = nome;
            clearTimeout(guardar);
            guardar = setTimeout(() => { try { localStorage.setItem("portfolio-nome-negocio", campoNome.value.trim().slice(0, 40)); } catch (e) { /* sem armazenamento */ } }, 400);
        });
        campoNome.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); campoNome.blur(); } });
        botoes.forEach((b) => b.addEventListener("click", () => { mostrar(ordem.indexOf(b.dataset.ramo), true); agendar(); }));
        palco.addEventListener("click", () => abrir(palco.dataset.ramo, campoNome.value));
        palco.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(palco.dataset.ramo, campoNome.value); } });
        caixa.addEventListener("mouseenter", () => { pausado = true; });
        caixa.addEventListener("mouseleave", () => { pausado = false; });
        caixa.addEventListener("focusin", () => { pausado = true; });
        caixa.addEventListener("focusout", () => { pausado = false; });
        if ("IntersectionObserver" in window) new IntersectionObserver((e) => { visivel = e.some((x) => x.isIntersecting); }).observe(caixa);
        mostrar(i, false);
        agendar();
    })();

    // o modal é compartilhado com as demos: tira a marca da prévia quando fecha
    modalOverlay?.addEventListener("click", () => { if (modalOverlay.hidden) document.querySelector(".modal-caixa")?.classList.remove("modal-previa"); });
    new MutationObserver(() => { if (modalOverlay.hidden) document.querySelector(".modal-caixa")?.classList.remove("modal-previa"); }).observe(modalOverlay, { attributes: true, attributeFilter: ["hidden"] });

    // link personalizado com &previa=1: abre sozinha depois que a página aparece
    if (typeof LINK_PERSONALIZADO !== "undefined" && LINK_PERSONALIZADO && LINK_PERSONALIZADO.previa) {
        const abrirDepois = () => setTimeout(() => abrir(LINK_PERSONALIZADO.ramo || undefined, LINK_PERSONALIZADO.para), 900);
        if (document.readyState === "complete") abrirDepois(); else window.addEventListener("load", abrirDepois, { once: true });
    }
})();

/* Indique e ganhe: quem já é cliente gera o próprio link (?indicou=Nome). Os valores vêm do servicos.js. */
(function indiqueEGanhe() {
    const S = window.SERVICOS;
    const form = document.getElementById("indiqueForm");
    if (!S || !form) return;
    document.querySelectorAll("[data-indicacao]").forEach((b) => { b.textContent = S.INDICACAO[b.dataset.indicacao] || b.textContent; });
    const campo = document.getElementById("indiqueNome");
    const saida = document.getElementById("indiqueLink");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nome = campo.value.trim();
        if (!nome) { campo.focus(); return; }
        const link = new URL(location.href.split("#")[0].split("?")[0]);
        link.searchParams.set("indicou", nome);
        saida.hidden = false;
        saida.textContent = link.toString();
        const texto = `Conheço um cara que faz site pra negócio aqui em Campo Grande. Pelo meu link você ganha ${S.INDICACAO.amigo}: ${link}`;
        try {
            if (navigator.share) await navigator.share({ title: "Site pro seu negócio", text: texto });
            else { await navigator.clipboard.writeText(texto); mostrarToast("Link copiado! É só mandar pra quem precisa de site."); }
        } catch (erro) { /* a pessoa cancelou */ }
        window.ESTATISTICAS?.contar(`/evento/indicacao-gerou`, "gerou link de indicação", true);
    });
})();
