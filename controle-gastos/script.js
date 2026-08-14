const API = "https://gastos-api-z0dt.onrender.com";

const form = document.getElementById("formTransacao");
const botaoSalvar = form.querySelector('button[type="submit"]');
const lista = document.getElementById("listaTransacoes");
const estadoVazio = document.getElementById("estadoVazio");
const filtro = document.getElementById("filtro");
const formatoMoeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const formatoData = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });

let transacoes = [];
let carregando = true;
let erroConexao = false;

async function api(caminho, opcoes = {}) {
    const resposta = await fetch(`${API}${caminho}`, {
        headers: opcoes.body ? { "Content-Type": "application/json" } : undefined,
        ...opcoes,
    });
    if (!resposta.ok) {
        let mensagem = `Erro ${resposta.status} ao falar com a API.`;
        try {
            const corpo = await resposta.json();
            if (corpo?.erro) mensagem = corpo.erro;
        } catch {
            // resposta sem corpo JSON (ex.: 204) — mantém mensagem padrão
        }
        throw new Error(mensagem);
    }
    return resposta.status === 204 ? null : resposta.json();
}

function mostrarToast(mensagem) {
    const toast = document.getElementById("toast");
    toast.textContent = mensagem;
    toast.classList.add("visivel");
    setTimeout(() => toast.classList.remove("visivel"), 2500);
}

function atualizarResumo() {
    const receitas = transacoes.filter(item => item.tipo === "receita").reduce((total, item) => total + item.valor, 0);
    const despesas = transacoes.filter(item => item.tipo === "despesa").reduce((total, item) => total + item.valor, 0);
    const saldo = receitas - despesas;

    document.getElementById("totalReceitas").textContent = formatoMoeda.format(receitas);
    document.getElementById("totalDespesas").textContent = formatoMoeda.format(despesas);
    document.getElementById("saldo").textContent = formatoMoeda.format(saldo);
    document.getElementById("mensagemSaldo").textContent = transacoes.length === 0 ? "Comece adicionando uma transação." : saldo >= 0 ? "Você está no positivo." : "Atenção: saldo negativo.";
}

function atualizarCategorias() {
    const despesas = transacoes.filter(item => item.tipo === "despesa");
    const total = despesas.reduce((soma, item) => soma + item.valor, 0);
    const totais = despesas.reduce((resultado, item) => {
        resultado[item.categoria] = (resultado[item.categoria] || 0) + item.valor;
        return resultado;
    }, {});
    const categorias = document.getElementById("categorias");
    categorias.innerHTML = "";
    document.getElementById("categoriasVazias").hidden = despesas.length > 0;

    Object.entries(totais).sort(([, a], [, b]) => b - a).forEach(([categoria, valor]) => {
        const percentual = (valor / total) * 100;
        const linha = document.createElement("div");
        linha.className = "categoria-linha";
        linha.innerHTML = `<span>${categoria}</span><div class="barra" aria-label="${percentual.toFixed(0)}% das despesas"><i></i></div><strong>${formatoMoeda.format(valor)}</strong>`;
        linha.querySelector("i").style.width = `${percentual}%`;
        categorias.appendChild(linha);
    });
}

function renderizar() {
    if (carregando) {
        lista.innerHTML = "";
        estadoVazio.hidden = false;
        estadoVazio.textContent = "Carregando transações da API… (pode levar até 50s se ela estava dormindo)";
        return;
    }

    if (erroConexao) {
        lista.innerHTML = "";
        estadoVazio.hidden = false;
        estadoVazio.textContent = "Não foi possível conectar com a API agora. Tente recarregar a página em instantes.";
        return;
    }

    const tipoFiltro = filtro.value;
    const itens = transacoes.filter(item => tipoFiltro === "todos" || item.tipo === tipoFiltro);
    lista.innerHTML = "";
    estadoVazio.hidden = itens.length > 0;
    estadoVazio.textContent = "Nenhuma transação por aqui. Adicione a primeira ao lado.";

    itens.slice().reverse().forEach(item => {
        const linha = document.createElement("article");
        linha.className = `transacao ${item.tipo}`;
        const icone = item.tipo === "receita" ? "↗" : "↘";
        const sinal = item.tipo === "receita" ? "+" : "−";
        linha.innerHTML = `<span class="icone" aria-hidden="true">${icone}</span><div><p class="nome"></p><p class="categoria"></p></div><strong class="valor-transacao">${sinal} ${formatoMoeda.format(item.valor)}</strong><button class="excluir" type="button" aria-label="Excluir ${item.descricao}" data-id="${item.id}">×</button>`;
        linha.querySelector(".nome").textContent = item.descricao;
        const data = item.data ? formatoData.format(new Date(`${item.data}T12:00:00`)) : "Sem data";
        linha.querySelector(".categoria").textContent = `${item.categoria} · ${data}`;
        lista.appendChild(linha);
    });
    atualizarResumo();
    atualizarCategorias();
}

async function carregarTransacoes() {
    try {
        transacoes = await api("/gastos");
        erroConexao = false;
    } catch (erro) {
        erroConexao = true;
        mostrarToast(erro.message);
    } finally {
        carregando = false;
        renderizar();
    }
}

form.addEventListener("submit", async event => {
    event.preventDefault();
    const dados = new FormData(form);
    const valor = Number(dados.get("valor"));
    if (!Number.isFinite(valor) || valor <= 0) return;

    const payload = {
        descricao: dados.get("descricao").trim(),
        valor,
        categoria: dados.get("categoria"),
        tipo: dados.get("tipo"),
        data: dados.get("data"),
    };

    botaoSalvar.disabled = true;
    botaoSalvar.textContent = "Salvando…";
    try {
        await api("/gastos", { method: "POST", body: JSON.stringify(payload) });
        form.reset();
        document.getElementById("data").value = new Date().toISOString().slice(0, 10);
        await carregarTransacoes();
        mostrarToast("Transação adicionada com sucesso.");
    } catch (erro) {
        mostrarToast(erro.message);
    } finally {
        botaoSalvar.disabled = false;
        botaoSalvar.textContent = "Adicionar transação";
    }
});

lista.addEventListener("click", async event => {
    const botao = event.target.closest(".excluir");
    if (!botao) return;
    botao.disabled = true;
    try {
        await api(`/gastos/${botao.dataset.id}`, { method: "DELETE" });
        await carregarTransacoes();
        mostrarToast("Transação removida.");
    } catch (erro) {
        botao.disabled = false;
        mostrarToast(erro.message);
    }
});

filtro.addEventListener("change", renderizar);

document.getElementById("limparTudo").addEventListener("click", async () => {
    if (!transacoes.length || !confirm("Deseja apagar todas as transações?")) return;
    try {
        await Promise.all(transacoes.map(item => api(`/gastos/${item.id}`, { method: "DELETE" })));
        await carregarTransacoes();
        mostrarToast("Dados removidos.");
    } catch (erro) {
        mostrarToast(erro.message);
    }
});

document.getElementById("carregarExemplo").addEventListener("click", async () => {
    if (transacoes.length && !confirm("Isso vai substituir suas transações pelos dados de exemplo. Continuar?")) return;
    const hoje = new Date().toISOString().slice(0, 10);
    const exemplos = [
        { descricao: "Salário", valor: 3200, categoria: "Trabalho", tipo: "receita", data: hoje },
        { descricao: "Freelance", valor: 450, categoria: "Trabalho", tipo: "receita", data: hoje },
        { descricao: "Supermercado", valor: 385.90, categoria: "Alimentação", tipo: "despesa", data: hoje },
        { descricao: "Aluguel", valor: 900, categoria: "Moradia", tipo: "despesa", data: hoje },
        { descricao: "Internet", valor: 99.90, categoria: "Moradia", tipo: "despesa", data: hoje },
        { descricao: "Uber", valor: 42.50, categoria: "Transporte", tipo: "despesa", data: hoje },
    ];

    try {
        await Promise.all(transacoes.map(item => api(`/gastos/${item.id}`, { method: "DELETE" })));
        await Promise.all(exemplos.map(item => api("/gastos", { method: "POST", body: JSON.stringify(item) })));
        await carregarTransacoes();
        mostrarToast("Dados de exemplo carregados.");
    } catch (erro) {
        mostrarToast(erro.message);
    }
});

const botaoTema = document.getElementById("botaoTema");
function aplicarTema(escuro) {
    document.body.classList.toggle("dark-mode", escuro);
    botaoTema.textContent = escuro ? "🌙" : "☀️";
    botaoTema.setAttribute("aria-pressed", String(escuro));
    botaoTema.setAttribute("aria-label", escuro ? "Ativar tema claro" : "Ativar tema escuro");
}
aplicarTema(localStorage.getItem("granaEmDiaTema") === "escuro");
botaoTema.addEventListener("click", () => {
    const escuro = !document.body.classList.contains("dark-mode");
    aplicarTema(escuro);
    localStorage.setItem("granaEmDiaTema", escuro ? "escuro" : "claro");
});

document.getElementById("data").value = new Date().toISOString().slice(0, 10);
renderizar();
carregarTransacoes();
