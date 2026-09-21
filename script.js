const botaoTema = document.getElementById("temaEscuro");

function atualizarTema(escuro) {
    document.body.classList.toggle("dark-mode", escuro);
    document.documentElement.classList.toggle("dark-mode", escuro);
    botaoTema.setAttribute("aria-pressed", String(!escuro));
    botaoTema.setAttribute("aria-label", escuro ? "Ativar tema escuro" : "Ativar tema claro");
    const metaTema = document.querySelector('meta[name="theme-color"]');
    if (metaTema) metaTema.setAttribute("content", escuro ? "#ffd9a0" : "#0e0524");
}

const temaSalvo = localStorage.getItem("tema");
if (temaSalvo) {
    atualizarTema(temaSalvo === "escuro");
} else {
    // Sem preferência salva ainda: sugere um tema com base no horário local (7h-18h = claro).
    // O toggle manual sempre tem prioridade assim que a pessoa escolher.
    const horaAtual = new Date().getHours();
    atualizarTema(horaAtual >= 7 && horaAtual < 18);
}

botaoTema.addEventListener("click", () => {
    const escuro = !document.body.classList.contains("dark-mode");
    atualizarTema(escuro);
    localStorage.setItem("tema", escuro ? "escuro" : "claro");
});

document.getElementById("ano").textContent = new Date().getFullYear();

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

/* Efeito de digitação no texto do hero, na primeira carga */
const heroTexto = document.querySelector(".hero-texto");
if (heroTexto && !prefereMenosMovimento) {
    const textoCompletoHero = heroTexto.textContent;
    heroTexto.textContent = "";
    let indiceCharHero = 0;
    setTimeout(function digitarHero() {
        heroTexto.textContent = textoCompletoHero.slice(0, indiceCharHero);
        indiceCharHero++;
        if (indiceCharHero <= textoCompletoHero.length) setTimeout(digitarHero, 18);
    }, 320);
}

const numerosContaveis = document.querySelectorAll("[data-contar]");

if (!prefereMenosMovimento) {
    numerosContaveis.forEach((el) => {
        const alvo = Number(el.dataset.contar);
        const sufixo = el.dataset.sufixo || "";
        const pad2 = el.dataset.formato === "pad2";
        const duracao = 1200;
        let inicio = null;

        function passo(tempo) {
            if (inicio === null) inicio = tempo;
            const progresso = Math.min((tempo - inicio) / duracao, 1);
            const facilitado = 1 - Math.pow(1 - progresso, 3);
            const valor = Math.round(alvo * facilitado);
            el.textContent = (pad2 ? String(valor).padStart(2, "0") : String(valor)) + sufixo;
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
    linkFavicon.href = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%235df4d0'/%3E%3C/svg%3E";
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

/* Terminal interativo */
const terminalForm = document.getElementById("terminalForm");
const terminalInput = document.getElementById("terminalInput");
const terminalSaida = document.getElementById("terminalSaida");

function imprimirNoTerminal(texto, classe) {
    const p = document.createElement("p");
    if (classe) p.className = classe;
    p.textContent = texto;
    terminalSaida.appendChild(p);
    terminalSaida.scrollTop = terminalSaida.scrollHeight;
}

/* Boot sequence no terminal, antes de liberar o prompt */
if (terminalSaida) {
    const linhasBoot = ["Iniciando sessão...", "Carregando módulos: html, css, javascript...", "Pronto."];
    if (prefereMenosMovimento) {
        terminalSaida.innerHTML = '<p>Digite <span class="terminal-prompt">help</span> para conhecer os comandos disponíveis.</p>';
    } else {
        terminalSaida.innerHTML = "";
        linhasBoot.forEach((linha, indice) => {
            setTimeout(() => imprimirNoTerminal(linha, "terminal-echo"), indice * 320);
        });
        setTimeout(() => {
            const p = document.createElement("p");
            p.innerHTML = 'Digite <span class="terminal-prompt">help</span> para conhecer os comandos disponíveis.';
            terminalSaida.appendChild(p);
        }, linhasBoot.length * 320);
    }
}

const comandosTerminal = {
    help: () => "Comandos: whoami, skills, projetos, orcamento, contato, clear",
    whoami: () => "Samuel Mickael — estudante de ADS (4º semestre), dev front-end & back-end. Buscando a primeira oportunidade em T.I.",
    skills: () => "Python · Flask · SQLAlchemy · JavaScript · HTML · CSS · Git · pytest",
    projetos() {
        document.getElementById("projetos").scrollIntoView({ behavior: prefereMenosMovimento ? "auto" : "smooth" });
        return "Abrindo a seção de projetos ↓";
    },
    contato() {
        document.getElementById("contato").scrollIntoView({ behavior: prefereMenosMovimento ? "auto" : "smooth" });
        return "Abrindo a seção de contato ↓";
    },
    orcamento() {
        document.getElementById("orcamento")?.scrollIntoView({ behavior: prefereMenosMovimento ? "auto" : "smooth" });
        return "Abrindo o orçamento ↓";
    },
    clear() {
        terminalSaida.innerHTML = "";
        return null;
    },
};
comandosTerminal.projects = comandosTerminal.projetos;
comandosTerminal.contact = comandosTerminal.contato;
comandosTerminal["orçamento"] = comandosTerminal.orcamento;
comandosTerminal.budget = comandosTerminal.orcamento;
comandosTerminal.limpar = comandosTerminal.clear;

if (terminalForm) {
    terminalForm.addEventListener("submit", (evento) => {
        evento.preventDefault();
        const valor = terminalInput.value.trim();
        if (!valor) return;
        imprimirNoTerminal("$ " + valor, "terminal-echo");
        const comando = comandosTerminal[valor.toLowerCase()];
        if (comando) {
            const resposta = comando();
            if (resposta) imprimirNoTerminal(resposta);
        } else {
            imprimirNoTerminal(`comando não encontrado: "${valor}". digite "help".`, "terminal-erro");
        }
        terminalInput.value = "";
    });
}

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

async function carregarStatsGithub() {
    try {
        const resposta = await fetch("https://api.github.com/users/SamueldevmI/repos?per_page=100&type=owner");
        if (!resposta.ok) return;
        const repos = await resposta.json();
        if (!Array.isArray(repos)) return;

        const maisRecente = repos.filter((r) => !r.fork).sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))[0];
        const trabalhandoEl = document.getElementById("trabalhandoAgora");
        if (maisRecente && trabalhandoEl) {
            trabalhandoEl.innerHTML = `🔨 Trabalhando agora em: <strong>${maisRecente.name}</strong>`;
            trabalhandoEl.hidden = false;
        }
    } catch {
        /* API do GitHub indisponível ou limite de requisições atingido: sem "trabalhando agora em" nesta visita */
    }
}
carregarStatsGithub();

/* Cross-highlight: passar o mouse numa competência destaca os projetos relacionados */
const habilidadesItens = document.querySelectorAll(".habilidades li[data-tecnologia]");
const listaProjetosEl = document.getElementById("lista-projetos");

function destacarProjetosPorTecnologia(tecnologia) {
    if (!listaProjetosEl) return;
    listaProjetosEl.classList.add("tem-destaque");
    cardsProjeto.forEach((card) => {
        const tecnologias = (card.dataset.tecnologias || "").split(" ");
        card.classList.toggle("card-destacado", tecnologias.includes(tecnologia));
    });
}

function limparDestaqueProjetos() {
    if (!listaProjetosEl) return;
    listaProjetosEl.classList.remove("tem-destaque");
    cardsProjeto.forEach((card) => card.classList.remove("card-destacado"));
}

habilidadesItens.forEach((item) => {
    item.addEventListener("mouseenter", () => destacarProjetosPorTecnologia(item.dataset.tecnologia));
    item.addEventListener("mouseleave", limparDestaqueProjetos);
    item.addEventListener("focus", () => destacarProjetosPorTecnologia(item.dataset.tecnologia));
    item.addEventListener("blur", limparDestaqueProjetos);
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

/* Aba reativa: chama atenção quando o visitante troca de aba */
const tituloOriginal = document.title;
document.addEventListener("visibilitychange", () => {
    document.title = document.hidden ? "👀 Volte aqui! — Samuel Mickael" : tituloOriginal;
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

/* Cursor: a seta vira um bloco de terminal (só CSS, sem atraso). Sobre o que clica, um anel nasce na
   ponta do mouse e abraça o elemento, deslizando de um para o outro. */
if (suportaHover && !prefereMenosMovimento) {
    const CLICAVEL = "a[href], button:not(:disabled), summary, select, .switch, .chip-filtro, .orc-opcao, .habilidades li, [role='button']";
    const FOLGA = 5;           // o anel fica alguns pixels para fora do elemento
    const ALTURA_MAXIMA = 260; // elementos muito altos ficam só com o cursor ">"
    const abraco = document.createElement("div");
    abraco.className = "cursor-abraco";
    abraco.setAttribute("aria-hidden", "true");
    document.body.appendChild(abraco);

    let mouseX = -100;
    let mouseY = -100;
    let alvo = null;
    let quadro = 0;
    let fimDoDeslize = 0;
    let saida = 0;
    let ultima = "";

    /* Caixa do elemento; num link quebrado em várias linhas, só o pedaço que está sob o mouse */
    const medir = (el) => {
        const partes = el.getClientRects();
        let r = el.getBoundingClientRect();
        if (partes.length > 1) {
            r = [...partes].find((p) => mouseX >= p.left - 2 && mouseX <= p.right + 2 && mouseY >= p.top - 2 && mouseY <= p.bottom + 2) || partes[0];
        }
        if (!r.width || !r.height || r.height > ALTURA_MAXIMA) return null;
        const raioCss = getComputedStyle(el).borderTopLeftRadius;
        let raio = parseFloat(raioCss) || 0;
        if (raioCss.includes("%")) raio = (raio / 100) * Math.min(r.width, r.height);
        const w = r.width + FOLGA * 2;
        const h = r.height + FOLGA * 2;
        return { x: r.left - FOLGA, y: r.top - FOLGA, w, h, r: Math.min(raio + FOLGA, Math.min(w, h) / 2) };
    };
    const naPonta = () => ({ x: mouseX - 5, y: mouseY - 5, w: 10, h: 10, r: 5 });
    const aplicar = (c) => {
        const chave = [c.x, c.y, c.w, c.h, c.r].map((n) => Math.round(n * 10)).join(",");
        if (chave === ultima) return;
        ultima = chave;
        abraco.style.transform = "translate(" + c.x + "px," + c.y + "px)";
        abraco.style.width = c.w + "px";
        abraco.style.height = c.h + "px";
        abraco.style.borderRadius = c.r + "px";
    };
    const terminarDeslize = () => {
        clearTimeout(fimDoDeslize);
        fimDoDeslize = setTimeout(() => abraco.classList.remove("cursor-abraco-desliza"), 320);
    };

    function esconder() {
        clearTimeout(saida);
        cancelAnimationFrame(quadro);
        alvo = null;
        abraco.classList.remove("cursor-abraco-ativo", "cursor-abraco-clique");
        abraco.classList.add("cursor-abraco-desliza");
        aplicar(naPonta()); // encolhe de volta para a ponta do mouse enquanto some
        terminarDeslize();
    }
    /* Enquanto o mouse está num elemento, o anel acompanha ele (rolagem, botão magnético etc.) */
    function seguir() {
        if (!alvo) return;
        const caixa = alvo.isConnected ? medir(alvo) : null;
        if (!caixa) { esconder(); return; }
        aplicar(caixa);
        quadro = requestAnimationFrame(seguir);
    }
    function mostrar() {
        const caixa = medir(alvo);
        if (!caixa) { esconder(); return; }
        if (!abraco.classList.contains("cursor-abraco-ativo")) {
            /* nasce na ponta do mouse, sem animação, e só então cresce até o elemento */
            abraco.classList.remove("cursor-abraco-desliza");
            ultima = "";
            aplicar(naPonta());
            void abraco.offsetWidth;
        }
        abraco.classList.add("cursor-abraco-desliza", "cursor-abraco-ativo");
        aplicar(caixa);
        terminarDeslize();
        cancelAnimationFrame(quadro);
        quadro = requestAnimationFrame(seguir);
    }

    document.addEventListener("mousemove", (evento) => {
        mouseX = evento.clientX;
        mouseY = evento.clientY;
    }, { passive: true });
    document.addEventListener("mouseover", (evento) => {
        mouseX = evento.clientX;
        mouseY = evento.clientY;
        const novo = evento.target.closest ? evento.target.closest(CLICAVEL) : null;
        if (novo) {
            clearTimeout(saida);
            if (novo !== alvo) { alvo = novo; mostrar(); }
        } else if (alvo) {
            /* uma pausa curta: passando de um botão para o vizinho, o anel desliza em vez de sumir */
            clearTimeout(saida);
            saida = setTimeout(esconder, 90);
        }
    });
    document.documentElement.addEventListener("mouseleave", () => { if (alvo) esconder(); });
    window.addEventListener("blur", () => { if (alvo) esconder(); });
    window.addEventListener("mousedown", () => { if (alvo) abraco.classList.add("cursor-abraco-clique"); });
    window.addEventListener("mouseup", () => abraco.classList.remove("cursor-abraco-clique"));
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

/* Botão "Me surpreenda" */
const botaoSurpresa = document.getElementById("botaoSurpresa");

function surpreenderProjeto() {
    const visiveis = Array.from(cardsProjeto).filter((card) => !card.classList.contains("card-oculto"));
    if (!visiveis.length) return;
    const escolhido = visiveis[Math.floor(Math.random() * visiveis.length)];
    escolhido.scrollIntoView({ behavior: prefereMenosMovimento ? "instant" : "smooth", block: "center" });
    cardsProjeto.forEach((card) => card.classList.remove("card-em-foco"));
    escolhido.classList.add("card-em-foco");
    setTimeout(() => escolhido.classList.remove("card-em-foco"), 2200);
}

botaoSurpresa?.addEventListener("click", surpreenderProjeto);

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
    } else if (acao === "tema") {
        botaoTema.click();
    } else if (acao === "surpresa") {
        surpreenderProjeto();
    }
}

if (botaoBusca && paletaOverlay) {
    botaoBusca.addEventListener("click", abrirPaleta);
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

    // Links com ?origem=instagram e ?tipo=app (só valores conhecidos entram na mensagem)
    const ORIGENS = { instagram: "Instagram", whatsapp: "WhatsApp", linkedin: "LinkedIn", github: "GitHub", facebook: "Facebook", google: "Google" };
    const PARAMETROS = new URLSearchParams(location.search);
    const ORIGEM = ORIGENS[(PARAMETROS.get("origem") || "").toLowerCase()] || "";

    const TIPOS = {
        site: {
            rotulo: "Site ou página de vendas",
            perguntas: [
                { id: "dominio", modo: "escolha", pergunta: "Você já tem um endereço na internet (domínio)?", opcoes: ["Sim", "Ainda não", "Não sei o que é isso"], rotuloMsg: "Já tem domínio" },
                { id: "identidade", modo: "escolha", pergunta: "Você já tem logo e cores da sua marca?", opcoes: ["Sim, tenho os dois", "Só o logo", "Ainda não tenho", "Não sei"], rotuloMsg: "Logo e cores" },
            ],
            recursos: ["Botão de WhatsApp", "Formulário de contato", "Galeria de fotos", "Loja online", "Agendamento", "Blog ou novidades"],
        },
        sistema: {
            rotulo: "Sistema web (cadastro, controle, painel)",
            perguntas: [
                { id: "usuarios", modo: "escolha", pergunta: "Quantas pessoas vão usar o sistema?", opcoes: ["Só eu", "2 a 5 pessoas", "6 a 20 pessoas", "Mais de 20"], rotuloMsg: "Quantas pessoas vão usar" },
                { id: "hoje", modo: "escolha", pergunta: "Como você controla isso hoje?", opcoes: ["Planilha", "Caderno ou papel", "Outro sistema", "Ainda não controlo"], rotuloMsg: "Como controla hoje" },
            ],
            recursos: ["Login de usuários", "Painel com gráficos", "Cadastro de clientes", "Relatórios em PDF ou Excel", "Avisos por WhatsApp ou e-mail", "Pagamento online"],
        },
        app: {
            rotulo: "Aplicativo de celular",
            perguntas: [
                { id: "aparelho", modo: "escolha", pergunta: "Para qual celular?", opcoes: ["Android", "iPhone", "Os dois", "Não sei"], rotuloMsg: "Celular" },
                { id: "offline", modo: "escolha", pergunta: "Ele precisa funcionar sem internet?", opcoes: ["Sim", "Não", "Não sei"], rotuloMsg: "Funcionar sem internet" },
            ],
            recursos: ["Login de usuários", "Notificações", "Câmera e fotos", "Mapa e localização", "Pagamento online", "Painel para administrar"],
        },
        automacao: {
            rotulo: "Automação (acabar com tarefa repetitiva)",
            perguntas: [
                { id: "tarefa", modo: "texto", longo: true, max: 240, pergunta: "Qual tarefa você repete todo dia ou toda semana?", dica: "Ex.: copiar os dados dos e-mails para uma planilha", rotuloMsg: "Tarefa que se repete" },
                { id: "frequencia", modo: "escolha", pergunta: "Com que frequência ela acontece?", opcoes: ["Todo dia", "Toda semana", "Todo mês", "Não sei"], rotuloMsg: "Frequência" },
            ],
            recursos: ["Planilhas (Excel ou Google)", "E-mail", "WhatsApp", "Relatórios prontos", "Ler PDFs e documentos", "Avisos automáticos"],
        },
        naosei: {
            rotulo: "Ainda não sei o que preciso",
            perguntas: [
                { id: "problema", modo: "texto", longo: true, max: 240, pergunta: "Qual problema você quer resolver ou o que quer melhorar?", dica: "Ex.: perco muito tempo respondendo as mesmas perguntas", rotuloMsg: "O que quer resolver" },
            ],
            recursos: null,
        },
    };
    const ORDEM = ["site", "sistema", "app", "automacao", "naosei"];

    const PASSO_TIPO = { id: "tipo", modo: "escolha", pergunta: "Que tipo de projeto você quer?", opcoes: ORDEM.map((id) => ({ valor: id, texto: TIPOS[id].rotulo })) };
    const PASSO_NEGOCIO = { id: "negocio", modo: "texto", opcional: true, max: 160, pergunta: "O que você faz ou vende?", dica: "Ex.: sou dentista e atendo em Campo Grande", rotuloMsg: "Sobre o negócio" };
    const PASSO_PRAZO = { id: "prazo", modo: "escolha", opcional: true, pergunta: "Para quando você precisa?", opcoes: ["O quanto antes", "Em cerca de 1 mês", "Sem pressa", "Ainda não sei"], rotuloMsg: "Prazo" };
    const PASSO_CONTATO = { id: "contato", modo: "contato", pergunta: "Como posso te chamar?" };
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
                lista.push({ id: "recursos", modo: "varias", opcional: true, pergunta: "O que o projeto precisa ter?", ajuda: "Marque o que quiser. Pode pular.", opcoes: tipo.recursos, rotuloMsg: "Precisa ter" });
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
        pai.append(rotuloNome, nome, rotuloObs, obs, erro);

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
        const titulo = criar("h3", "orc-pergunta", passo.pergunta);
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
        const titulo = criar("h3", "orc-pergunta", "Sua mensagem está pronta");
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

        enviar.classList.add("orc-pulso");
        const acoes = criar("div", "orc-acoes");
        acoes.append(enviar, copiar);

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
        const atualizar = () => botaoFixo.classList.toggle("is-visivel", !visivel.hero && !visivel.orcamento && !visivel.contato);
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
