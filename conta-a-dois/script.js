const API = "https://gastos-api-z0dt.onrender.com";
const CHAVE_SESSAO = "conta-a-dois-sessao";
const INTERVALO_POLL = 4000;

const els = {};
let sessao = null;
let pollTimer = null;
let idsGastosConhecidos = new Set();

function definirElementos() {
    const ids = [
        "telaEntrada", "telaApp", "abaCriar", "abaEntrar", "painelCriar", "painelEntrar",
        "campoNomeCriar", "campoCodigoEntrar", "campoNomeEntrar", "authErro",
        "codigoAtual", "codigoEsperando", "botaoCopiarCodigo", "botaoAbrirParceiro", "botaoSair",
        "listaPessoas", "avisoEsperando", "cartaoSaldo", "carregandoSaldo",
        "formGasto", "campoDescricao", "campoValor", "campoCategoria", "campoData", "gastoErro",
        "listaGastos", "gastosVazio", "statusSincroniza",
    ];
    ids.forEach((id) => { els[id] = document.getElementById(id); });
}

function escaparHtml(texto) {
    const div = document.createElement("div");
    div.textContent = texto == null ? "" : String(texto);
    return div.innerHTML;
}

function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatarData(iso) {
    const partes = String(iso).split("-");
    return partes.length === 3 ? `${partes[2]}/${partes[1]}` : iso;
}

function definirDataHoje() {
    els.campoData.value = new Date().toISOString().slice(0, 10);
}

function salvarSessao(s) {
    sessao = s;
    try { sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(s)); } catch { /* modo privado etc. */ }
}

function limparSessao() {
    sessao = null;
    try { sessionStorage.removeItem(CHAVE_SESSAO); } catch { /* ignora */ }
}

function carregarSessao() {
    try {
        const bruto = sessionStorage.getItem(CHAVE_SESSAO);
        return bruto ? JSON.parse(bruto) : null;
    } catch {
        return null;
    }
}

async function chamarApi(caminho, opcoes = {}) {
    const resposta = await fetch(`${API}${caminho}`, {
        headers: { "Content-Type": "application/json" },
        ...opcoes,
    });
    let corpo = null;
    try { corpo = await resposta.json(); } catch { /* ex.: 204 sem corpo */ }
    if (!resposta.ok) {
        throw new Error((corpo && corpo.erro) || `Não deu pra falar com o servidor (erro ${resposta.status}).`);
    }
    return corpo;
}

function mostrarAba(qual) {
    const criar = qual === "criar";
    els.abaCriar.classList.toggle("is-ativa", criar);
    els.abaEntrar.classList.toggle("is-ativa", !criar);
    els.abaCriar.setAttribute("aria-selected", String(criar));
    els.abaEntrar.setAttribute("aria-selected", String(!criar));
    els.painelCriar.hidden = !criar;
    els.painelEntrar.hidden = criar;
    els.authErro.hidden = true;
}

function mostrarErroAuth(mensagem) {
    els.authErro.textContent = mensagem;
    els.authErro.hidden = false;
}

function corIndex(integranteId, integrantes) {
    const i = integrantes.findIndex((integ) => integ.id === integranteId);
    return i < 0 ? 0 : i;
}

function renderPessoas(integrantes) {
    els.listaPessoas.innerHTML = "";
    integrantes.forEach((integ, i) => {
        const souEu = sessao && integ.id === sessao.integranteId;
        const pill = document.createElement("span");
        pill.className = `pessoa-pill pessoa-cor-${i}${souEu ? " sou-eu" : ""}`;
        pill.innerHTML = `<span class="ponto" aria-hidden="true"></span>${escaparHtml(integ.nome)}` +
            (souEu ? ' <span class="tag-voce">(você)</span>' : "");
        els.listaPessoas.appendChild(pill);
    });

    const esperando = integrantes.length < 2;
    els.avisoEsperando.hidden = !esperando;
    els.botaoAbrirParceiro.hidden = !esperando;
}

function renderSaldo(saldo, integrantes) {
    els.carregandoSaldo.hidden = true;
    if (integrantes.length < 2) {
        els.cartaoSaldo.innerHTML = `<p class="saldo-texto">Assim que seu par entrar, o saldo entre vocês aparece aqui.</p>`;
        return;
    }

    let numero;
    let texto;
    if (saldo.quites) {
        numero = saldo.total > 0 ? "Vocês estão quites 🎉" : "Nenhum gasto ainda";
        texto = saldo.total > 0 ? "Os dois pagaram a mesma parte até agora." : "Lance o primeiro gasto aí embaixo.";
    } else {
        numero = `R$ ${formatarMoeda(saldo.valor_devido)}`;
        texto = `${escaparHtml(saldo.devedor.nome)} deve pra ${escaparHtml(saldo.credor.nome)}`;
    }

    els.cartaoSaldo.innerHTML = `
        <div class="saldo-numero">${numero}</div>
        <div class="saldo-texto">${texto}</div>
        <div class="saldo-total">Total gasto pelo casal: R$ ${formatarMoeda(saldo.total)}</div>
    `;
}

function renderGastos(gastos, integrantes) {
    els.gastosVazio.hidden = gastos.length > 0;
    els.listaGastos.innerHTML = "";

    const idsAtuais = new Set();
    gastos.forEach((g) => {
        idsAtuais.add(g.id);
        const cor = corIndex(g.integrante_id, integrantes);
        const ehNovo = idsGastosConhecidos.size > 0 && !idsGastosConhecidos.has(g.id);

        const li = document.createElement("li");
        li.className = `item-gasto pessoa-cor-${cor}${ehNovo ? " novo" : ""}`;
        li.innerHTML = `
            <div class="item-gasto-info">
                <div class="item-gasto-desc">${escaparHtml(g.descricao)}</div>
                <div class="item-gasto-meta">${escaparHtml(g.integrante_nome)} · ${escaparHtml(g.categoria)} · ${formatarData(g.data)}</div>
            </div>
            <div class="item-gasto-valor">R$ ${formatarMoeda(g.valor)}</div>
            <button type="button" class="item-gasto-remover" aria-label="Remover gasto" data-id="${g.id}">×</button>
        `;
        els.listaGastos.appendChild(li);
    });
    idsGastosConhecidos = idsAtuais;
}

async function atualizarTudo() {
    if (!sessao) return;
    try {
        const [casal, gastos, saldo] = await Promise.all([
            chamarApi(`/casal/${sessao.codigo}`),
            chamarApi(`/casal/${sessao.codigo}/gastos`),
            chamarApi(`/casal/${sessao.codigo}/saldo`),
        ]);
        renderPessoas(casal.integrantes);
        renderSaldo(saldo, casal.integrantes);
        renderGastos(gastos, casal.integrantes);
        els.statusSincroniza.textContent = `Sincronizado às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
    } catch (erro) {
        if (/código não encontrado/i.test(erro.message)) {
            pararPolling();
            limparSessao();
            els.telaApp.hidden = true;
            els.telaEntrada.hidden = false;
            mostrarAba("criar");
            mostrarErroAuth("Essa sessão de demonstração expirou — dados de teste são limpos periodicamente. Comece de novo.");
        } else {
            els.statusSincroniza.textContent = "Não deu pra sincronizar agora, tentando de novo…";
        }
    }
}

function iniciarPolling() {
    pararPolling();
    pollTimer = setInterval(() => {
        if (document.visibilityState === "visible") atualizarTudo();
    }, INTERVALO_POLL);
}

function pararPolling() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
}

function entrarNoApp() {
    els.telaEntrada.hidden = true;
    els.telaApp.hidden = false;
    els.codigoAtual.textContent = sessao.codigo;
    els.codigoEsperando.textContent = sessao.codigo;
    idsGastosConhecidos = new Set();
    atualizarTudo();
    iniciarPolling();
}

function comCarregando(botao, textoCarregando, fn) {
    return async (ev) => {
        ev.preventDefault();
        const original = botao.textContent;
        botao.disabled = true;
        botao.textContent = textoCarregando;
        try {
            await fn();
        } catch (erro) {
            mostrarErroAuth(erro.message);
        } finally {
            botao.disabled = false;
            botao.textContent = original;
        }
    };
}

function ligarEventos() {
    els.abaCriar.addEventListener("click", () => mostrarAba("criar"));
    els.abaEntrar.addEventListener("click", () => mostrarAba("entrar"));

    els.painelCriar.addEventListener("submit", comCarregando(
        els.painelCriar.querySelector("button[type=submit]"),
        "Criando… (pode levar uns segundos)",
        async () => {
            const nome = els.campoNomeCriar.value.trim();
            if (!nome) return;
            els.authErro.hidden = true;
            const dados = await chamarApi("/casal", { method: "POST", body: JSON.stringify({ nome }) });
            salvarSessao({ codigo: dados.codigo, integranteId: dados.integrante_id, nome });
            entrarNoApp();
        },
    ));

    els.painelEntrar.addEventListener("submit", comCarregando(
        els.painelEntrar.querySelector("button[type=submit]"),
        "Entrando… (pode levar uns segundos)",
        async () => {
            const codigo = els.campoCodigoEntrar.value.trim().toUpperCase();
            const nome = els.campoNomeEntrar.value.trim();
            if (!codigo || !nome) return;
            els.authErro.hidden = true;
            const dados = await chamarApi(`/casal/${codigo}/entrar`, { method: "POST", body: JSON.stringify({ nome }) });
            salvarSessao({ codigo: dados.codigo, integranteId: dados.integrante_id, nome });
            entrarNoApp();
        },
    ));

    els.botaoSair.addEventListener("click", () => {
        pararPolling();
        limparSessao();
        els.telaApp.hidden = true;
        els.telaEntrada.hidden = false;
        els.painelCriar.reset();
        els.painelEntrar.reset();
        mostrarAba("criar");
        history.replaceState(null, "", location.pathname);
    });

    els.botaoCopiarCodigo.addEventListener("click", async () => {
        if (!sessao) return;
        try {
            await navigator.clipboard.writeText(sessao.codigo);
        } catch { /* alguns navegadores bloqueiam sem interação recente — o clique já conta como uma */ }
        const original = els.botaoCopiarCodigo.textContent;
        els.botaoCopiarCodigo.textContent = "Copiado!";
        setTimeout(() => { els.botaoCopiarCodigo.textContent = original; }, 1600);
    });

    els.botaoAbrirParceiro.addEventListener("click", () => {
        if (!sessao) return;
        window.open(`${location.pathname}?codigo=${sessao.codigo}`, "_blank", "noopener");
    });

    els.formGasto.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        if (!sessao) return;
        els.gastoErro.hidden = true;
        const botao = els.formGasto.querySelector("button[type=submit]");
        const original = botao.textContent;
        botao.disabled = true;
        botao.textContent = "Adicionando…";
        const categoria = els.campoCategoria.value;
        try {
            const payload = {
                integrante_id: sessao.integranteId,
                descricao: els.campoDescricao.value.trim(),
                valor: els.campoValor.value,
                categoria,
                data: els.campoData.value || undefined,
            };
            const criado = await chamarApi(`/casal/${sessao.codigo}/gastos`, { method: "POST", body: JSON.stringify(payload) });
            idsGastosConhecidos.add(criado.id);
            els.formGasto.reset();
            els.campoCategoria.value = categoria;
            definirDataHoje();
            await atualizarTudo();
        } catch (erro) {
            els.gastoErro.textContent = erro.message;
            els.gastoErro.hidden = false;
        } finally {
            botao.disabled = false;
            botao.textContent = original;
        }
    });

    els.listaGastos.addEventListener("click", async (ev) => {
        const botao = ev.target.closest(".item-gasto-remover");
        if (!botao || !sessao) return;
        const id = Number(botao.dataset.id);
        botao.disabled = true;
        try {
            await chamarApi(`/casal/${sessao.codigo}/gastos/${id}`, { method: "DELETE" });
            idsGastosConhecidos.delete(id);
            await atualizarTudo();
        } catch {
            botao.disabled = false;
        }
    });
}

async function iniciar() {
    definirElementos();
    ligarEventos();
    definirDataHoje();
    mostrarAba("criar");

    const params = new URLSearchParams(location.search);
    const codigoUrl = params.get("codigo");
    if (codigoUrl) {
        mostrarAba("entrar");
        els.campoCodigoEntrar.value = codigoUrl.toUpperCase();
        els.campoNomeEntrar.focus();
    }

    const salva = carregarSessao();
    if (salva && salva.codigo && salva.integranteId) {
        sessao = salva;
        try {
            await chamarApi(`/casal/${sessao.codigo}`);
            entrarNoApp();
        } catch {
            limparSessao();
        }
    }
}

document.addEventListener("DOMContentLoaded", iniciar);
