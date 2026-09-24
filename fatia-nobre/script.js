"use strict";

/* Demo com o nome do negócio de quem está vendo: o portfólio abre o chat com ?nome=Pizzaria do João */
const NOME_VISITANTE = (new URLSearchParams(location.search).get("nome") || "").trim().slice(0, 40);
const comNome = (texto) => (NOME_VISITANTE ? texto.split("Fatia Nobre").join(NOME_VISITANTE) : texto);

/* ===== o "cérebro" do atendimento: é só trocar essa lista pra virar o de outro negócio ===== */
const PERGUNTAS = [
    { id: "saudacao", gatilhos: ["oi", "ola", "boa noite", "bom dia", "boa tarde", "eae", "opa", "oii"],
        resposta: "Oi! 🍕 Bem-vindo à Fatia Nobre. Posso ajudar com horário, endereço, entrega, cardápio, pagamento ou pedido — é só perguntar!" },
    { id: "horario", gatilhos: ["horario", "hora", "abre", "fecha", "funciona", "aberto", "atende", "atendimento"],
        resposta: "Funcionamos de terça a domingo, das 18h às 23h30. Segunda a gente descansa 😴" },
    { id: "endereco", gatilhos: ["endereco", "onde fica", "localizacao", "rua", "fica onde", "local", "como chegar"],
        resposta: "Ficamos na Rua das Oliveiras, 240 — Jardim Itália, Campo Grande (MS)." },
    { id: "entrega", gatilhos: ["entrega", "entregam", "delivery", "taxa de entrega", "bairro", "frete"],
        resposta: "Entregamos sim! Frete grátis até 5 km da loja; acima disso é R$ 6. Tempo médio: 35 a 45 minutos." },
    { id: "cardapio", gatilhos: ["cardapio", "menu", "sabor", "sabores", "preco", "precos", "quanto custa", "valor", "valores"],
        resposta: "Sabores mais pedidos: Margherita (R$ 42), Calabresa (R$ 45), Quatro Queijos (R$ 48) e Portuguesa (R$ 47). Todas grandes, 8 fatias." },
    { id: "pagamento", gatilhos: ["pagamento", "pagar", "pix", "cartao", "dinheiro", "troco"],
        resposta: "Aceitamos Pix, cartão (débito e crédito) e dinheiro. Se for dinheiro, já me avisa o troco que precisa 🙂" },
    { id: "promocao", gatilhos: ["promocao", "desconto", "combo", "oferta"],
        resposta: "Hoje: na compra de 2 pizzas grandes, o refrigerante de 2L sai de graça 🥤" },
    { id: "pedido", gatilhos: ["pedido", "pedir", "encomendar", "fazer um pedido", "quero uma pizza", "fazer o pedido", "quero pedir"],
        resposta: "Show! Me diz o sabor, o tamanho e o endereço de entrega que eu já confirmo tudo por aqui mesmo." },
    { id: "despedida", gatilhos: ["obrigado", "obrigada", "valeu", "tchau", "ate mais", "falou", "flw"],
        resposta: "Por nada! Qualquer coisa é só chamar. Até já! 🍕" },
];

const CHIPS_INICIAIS = [
    { rotulo: "Horário", texto: "Que horas vocês abrem?" },
    { rotulo: "Endereço", texto: "Qual o endereço?" },
    { rotulo: "Cardápio", texto: "Quais os sabores e o preço?" },
    { rotulo: "Fazer pedido", texto: "Quero fazer um pedido" },
];

const MENSAGEM_INICIAL = comNome("Oi! 🍕 Aqui é o atendimento automático da Fatia Nobre. Escolha um assunto abaixo ou digite sua pergunta.");
PERGUNTAS.forEach((p) => { p.resposta = comNome(p.resposta); });
if (NOME_VISITANTE) {
    document.querySelectorAll("[data-nome-negocio]").forEach((el) => { el.textContent = NOME_VISITANTE; });
    document.title = NOME_VISITANTE + " — Atendimento automático (demonstração)";
}
const SEM_RESPOSTA = "Hmm, não entendi essa 🤔 Mas posso ajudar com um desses assuntos:";

/* tira acento e deixa em minúsculo, pra "Horário?" e "horario" darem o mesmo resultado */
function normalizar(texto) {
    return texto
        .normalize("NFD").replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function encontrarResposta(mensagem) {
    const alvo = normalizar(mensagem);
    if (!alvo) return null;
    for (const pergunta of PERGUNTAS) {
        if (pergunta.gatilhos.some((gatilho) => alvo.includes(gatilho))) return pergunta;
    }
    return null;
}

const corpo = document.getElementById("corpo");
const chipsEl = document.getElementById("chips");
const form = document.getElementById("form");
const campo = document.getElementById("campo");
const status = document.getElementById("status");
const botaoReiniciar = document.getElementById("reiniciar");

function horaAgora() {
    return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function adicionarMensagem(texto, deQuem) {
    const el = document.createElement("div");
    el.className = `msg msg-${deQuem}`;
    const p = document.createElement("span");
    p.textContent = texto;
    const hora = document.createElement("time");
    hora.textContent = horaAgora();
    el.append(p, hora);
    corpo.appendChild(el);
    corpo.scrollTop = corpo.scrollHeight;
}

function mostrarChips(lista) {
    chipsEl.innerHTML = "";
    lista.forEach(({ rotulo, texto }) => {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "chip";
        botao.textContent = rotulo;
        botao.addEventListener("click", () => enviar(texto));
        chipsEl.appendChild(botao);
    });
}

let ocupado = false;

function responderComoBot(mensagemDoUsuario) {
    ocupado = true;
    status.textContent = "digitando…";
    const bolha = document.createElement("div");
    bolha.className = "digitando";
    bolha.innerHTML = "<i></i><i></i><i></i>";
    corpo.appendChild(bolha);
    corpo.scrollTop = corpo.scrollHeight;

    const atraso = 650 + Math.random() * 700; // parece mais natural que responder instantâneo
    setTimeout(() => {
        bolha.remove();
        status.textContent = "online";
        ocupado = false;
        const achada = encontrarResposta(mensagemDoUsuario);
        if (achada) {
            adicionarMensagem(achada.resposta, "bot");
            chipsEl.innerHTML = "";
        } else {
            adicionarMensagem(SEM_RESPOSTA, "bot");
            mostrarChips(CHIPS_INICIAIS);
        }
    }, atraso);
}

function enviar(texto) {
    const mensagem = texto.trim();
    if (!mensagem || ocupado) return;
    adicionarMensagem(mensagem, "eu");
    chipsEl.innerHTML = "";
    responderComoBot(mensagem);
}

form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    enviar(campo.value);
    campo.value = "";
    campo.focus();
});

function iniciarConversa() {
    corpo.innerHTML = "";
    chipsEl.innerHTML = "";
    status.textContent = "online";
    ocupado = false;
    adicionarMensagem(MENSAGEM_INICIAL, "bot");
    mostrarChips(CHIPS_INICIAIS);
}

botaoReiniciar.addEventListener("click", iniciarConversa);

iniciarConversa();
