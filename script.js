const botaoTema = document.getElementById("temaEscuro");

function atualizarTema(escuro) {
    document.body.classList.toggle("dark-mode", escuro);
    botaoTema.setAttribute("aria-pressed", String(!escuro));
    botaoTema.setAttribute("aria-label", escuro ? "Ativar tema escuro" : "Ativar tema claro");
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
    help: () => "Comandos: whoami, skills, projetos, contato, clear",
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
    clear() {
        terminalSaida.innerHTML = "";
        return null;
    },
};
comandosTerminal.projects = comandosTerminal.projetos;
comandosTerminal.contact = comandosTerminal.contato;
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
    if (!prefereMenosMovimento) {
        document.documentElement.style.setProperty("--scroll-parallax", Math.min(window.scrollY * 0.04, 40) + "px");
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

/* Stats do hero "ao vivo" (GitHub API, com fallback silencioso pros valores estáticos) */
function atualizarStatAoVivo(elemento, valor, formato) {
    if (!elemento) return;
    const texto = formato === "pad2" ? String(valor).padStart(2, "0") : String(valor);
    if (elemento.textContent === texto) return;
    elemento.textContent = texto;
    elemento.dataset.contar = String(valor);
    if (!prefereMenosMovimento) {
        elemento.classList.remove("stat-atualizado");
        void elemento.offsetWidth;
        elemento.classList.add("stat-atualizado");
    }
}

const statProjetosEl = document.getElementById("statProjetos");
const statTecnologiasEl = document.getElementById("statTecnologias");
if (!prefereMenosMovimento) {
    statProjetosEl?.classList.add("stat-carregando");
    statTecnologiasEl?.classList.add("stat-carregando");
}

async function carregarStatsGithub() {
    try {
        const resposta = await fetch("https://api.github.com/users/SamueldevmI/repos?per_page=100&type=owner");
        if (!resposta.ok) return;
        const repos = await resposta.json();
        if (!Array.isArray(repos)) return;
        const totalRepos = repos.filter((r) => !r.fork).length;
        const linguagens = new Set(repos.map((r) => r.language).filter(Boolean));
        // Espera a contagem inicial (1200ms) terminar antes de atualizar, senão a animação estática sobrescreve o valor ao vivo.
        if (!prefereMenosMovimento) await new Promise((resolve) => setTimeout(resolve, 1250));
        if (totalRepos > 0) atualizarStatAoVivo(statProjetosEl, totalRepos, "pad2");
        if (linguagens.size > 0) atualizarStatAoVivo(statTecnologiasEl, linguagens.size, "pad2");

        const maisRecente = repos.filter((r) => !r.fork).sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))[0];
        const trabalhandoEl = document.getElementById("trabalhandoAgora");
        if (maisRecente && trabalhandoEl) {
            trabalhandoEl.innerHTML = `🔨 Trabalhando agora em: <strong>${maisRecente.name}</strong>`;
            trabalhandoEl.hidden = false;
        }
    } catch {
        /* API do GitHub indisponível ou limite de requisições atingido: mantém os números estáticos do HTML */
    } finally {
        statProjetosEl?.classList.remove("stat-carregando");
        statTecnologiasEl?.classList.remove("stat-carregando");
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
        botao.closest(".projeto-visual")?.classList.toggle("visual-virado");
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
    let ultimoRastro = 0;
    heroConteudo.addEventListener("mousemove", (evento) => {
        const relativoX = evento.clientX / window.innerWidth - 0.5;
        heroConteudo.style.setProperty("--parallax-x", relativoX * -28 + "px");
        const rect = heroConteudo.getBoundingClientRect();
        heroConteudo.style.setProperty("--spot-x", evento.clientX - rect.left + "px");
        heroConteudo.style.setProperty("--spot-y", evento.clientY - rect.top + "px");

        const agora = Date.now();
        if (agora - ultimoRastro > 90) {
            ultimoRastro = agora;
            const rastro = document.createElement("span");
            rastro.className = "rastro-cursor";
            rastro.style.left = evento.clientX + "px";
            rastro.style.top = evento.clientY + "px";
            document.body.appendChild(rastro);
            rastro.addEventListener("animationend", () => rastro.remove());
        }
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
        card.addEventListener("mousemove", (evento) => {
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

/* Cursor customizado: ponto que vira anel maior perto de elementos clicáveis */
if (suportaHover && !prefereMenosMovimento) {
    document.body.classList.add("tem-cursor-custom");
    const cursorPonto = document.createElement("div");
    cursorPonto.className = "cursor-ponto";
    const cursorAnel = document.createElement("div");
    cursorAnel.className = "cursor-anel";
    document.body.append(cursorPonto, cursorAnel);

    window.addEventListener("mousemove", (evento) => {
        cursorPonto.style.left = evento.clientX + "px";
        cursorPonto.style.top = evento.clientY + "px";
        cursorAnel.style.left = evento.clientX + "px";
        cursorAnel.style.top = evento.clientY + "px";
    });

    document.querySelectorAll("a, button, input, .chip-filtro, li[tabindex]").forEach((el) => {
        el.addEventListener("mouseenter", () => cursorAnel.classList.add("cursor-anel-grande"));
        el.addEventListener("mouseleave", () => cursorAnel.classList.remove("cursor-anel-grande"));
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
