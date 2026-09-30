const API = "https://gastos-api-z0dt.onrender.com";
const listaEl = document.getElementById("lista-gastos");
const statusEl = document.getElementById("status-lista");
const totalEl = document.getElementById("resumo-total");
const qtdEl = document.getElementById("resumo-qtd");
const formEl = document.getElementById("form-gasto");
const botaoEl = document.getElementById("botao-salvar");
const erroEl = document.getElementById("erro-form");

function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(iso) {
    const [ano, mes, dia] = iso.split("-");
    return `${dia}/${mes}/${ano}`;
}

async function carregarResumo() {
    const resposta = await fetch(`${API}/gastos/resumo`);
    const dados = await resposta.json();
    totalEl.textContent = formatarMoeda(dados.total);
    qtdEl.textContent = dados.quantidade;
    totalEl.classList.remove("esqueleto-valor");
    qtdEl.classList.remove("esqueleto-valor");
}

async function carregarLista() {
    statusEl.hidden = false;
    statusEl.textContent = "Carregando... (pode levar um tempo se a API estava dormindo)";
    listaEl.innerHTML = '<li class="esqueleto-linha" aria-hidden="true"></li>'.repeat(3);
    totalEl.classList.add("esqueleto-valor");
    qtdEl.classList.add("esqueleto-valor");
    const inicio = Date.now();
    const relogio = setInterval(() => {
        const segundos = Math.round((Date.now() - inicio) / 1000);
        statusEl.textContent = `Carregando... ${segundos} s (a API grátis pode levar até 50 s para acordar)`;
    }, 1000);

    try {
        const resposta = await fetch(`${API}/gastos`);
        const gastos = await resposta.json();
        clearInterval(relogio);
        listaEl.innerHTML = "";

        if (gastos.length === 0) {
            statusEl.textContent = "Nenhum gasto cadastrado ainda. Adicione o primeiro ao lado.";
            statusEl.hidden = false;
        } else {
            statusEl.hidden = true;
            for (const gasto of gastos) {
                // Tudo que vem da API entra como texto, nunca como HTML: a API é pública e qualquer
                // pessoa pode gravar um gasto com "<img onerror=...>" na descrição.
                const item = document.createElement("li");
                item.className = "demo-item";
                item.innerHTML = `
                    <div>
                        <span class="demo-descricao"></span>
                        <small></small>
                    </div>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <b></b>
                        <button class="demo-remover" title="Remover">✕</button>
                    </div>`;
                item.querySelector(".demo-descricao").textContent = gasto.descricao;
                item.querySelector("small").textContent = `${gasto.categoria} · ${formatarData(String(gasto.data))}`;
                item.querySelector("b").textContent = formatarMoeda(Number(gasto.valor));
                item.querySelector(".demo-remover").dataset.id = String(Number(gasto.id));
                listaEl.appendChild(item);
            }
        }

        await carregarResumo();
    } catch (erro) {
        clearInterval(relogio);
        listaEl.innerHTML = "";
        totalEl.classList.remove("esqueleto-valor");
        qtdEl.classList.remove("esqueleto-valor");
        statusEl.hidden = false;
        statusEl.textContent = "Não foi possível carregar os dados agora. Tente novamente em instantes.";
    }
}

listaEl.addEventListener("click", async (evento) => {
    const botao = evento.target.closest(".demo-remover");
    if (!botao) return;
    botao.disabled = true;
    await fetch(`${API}/gastos/${botao.dataset.id}`, { method: "DELETE" });
    carregarLista();
});

formEl.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    erroEl.hidden = true;
    botaoEl.disabled = true;
    botaoEl.textContent = "Salvando...";

    const corpo = {
        descricao: document.getElementById("campo-descricao").value,
        valor: parseFloat(document.getElementById("campo-valor").value),
        categoria: document.getElementById("campo-categoria").value,
    };

    try {
        const resposta = await fetch(`${API}/gastos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(corpo),
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(erro.erro || "Erro ao salvar.");
        }

        formEl.reset();
        await carregarLista();
    } catch (erro) {
        erroEl.textContent = erro.message;
        erroEl.hidden = false;
    } finally {
        botaoEl.disabled = false;
        botaoEl.textContent = "Adicionar gasto";
    }
});

carregarLista();
