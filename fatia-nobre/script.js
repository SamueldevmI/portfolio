"use strict";

/* Demo com o nome do negócio de quem está vendo: o portfólio abre o chat com ?nome=Pizzaria do João */
const NOME_VISITANTE = (new URLSearchParams(location.search).get("nome") || "").trim().slice(0, 40);
const comNome = (texto) => (NOME_VISITANTE ? texto.split("Fatia Nobre").join(NOME_VISITANTE) : texto);

/* idioma: lido do atributo que o idioma.js já define (deferred, roda antes deste script,
   que também é deferred e carregado depois dele no HTML) */
function idiomaAtual() { return document.documentElement.lang === "es" ? "es" : "pt"; }

/* ===== o "cérebro" do atendimento, em português e espanhol: é só trocar essa lista pra virar
   o de outro negócio. As palavras-chave (gatilhos) do espanhol são as que uma pessoa de verdade
   digitaria em espanhol — não é só a tradução literal das do português. ===== */
const DADOS = {
    pt: {
        perguntas: [
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
        ],
        chips: [
            { rotulo: "Horário", texto: "Que horas vocês abrem?" },
            { rotulo: "Endereço", texto: "Qual o endereço?" },
            { rotulo: "Cardápio", texto: "Quais os sabores e o preço?" },
            { rotulo: "Fazer pedido", texto: "Quero fazer um pedido" },
        ],
        mensagemInicial: "Oi! 🍕 Aqui é o atendimento automático da Fatia Nobre. Escolha um assunto abaixo ou digite sua pergunta.",
        semResposta: "Hmm, não entendi essa 🤔 Mas posso ajudar com um desses assuntos:",
        digitando: "digitando…",
        online: "online",
        locale: "pt-BR",
    },
    es: {
        perguntas: [
            { id: "saudacao", gatilhos: ["hola", "buenas", "buenos dias", "buenas tardes", "buenas noches", "que tal", "ola"],
                resposta: "¡Hola! 🍕 Bienvenido a Fatia Nobre. Puedo ayudarte con horario, dirección, entrega, menú, pago o pedido — ¡solo pregunta!" },
            { id: "horario", gatilhos: ["horario", "hora", "abren", "cierran", "abierto", "atienden"],
                resposta: "Atendemos de martes a domingo, de 18h a 23:30h. Los lunes descansamos 😴" },
            { id: "endereco", gatilhos: ["direccion", "donde", "ubicacion", "calle", "como llegar"],
                resposta: "Estamos en la Rua das Oliveiras, 240 — Jardim Itália, Campo Grande (MS)." },
            { id: "entrega", gatilhos: ["entrega", "entregan", "delivery", "envio", "barrio", "costo de envio"],
                resposta: "¡Sí entregamos! Envío gratis hasta 5 km de la tienda; más de eso son R$ 6. Tiempo promedio: 35 a 45 minutos." },
            { id: "cardapio", gatilhos: ["menu", "sabor", "sabores", "precio", "precios", "cuanto cuesta", "valor"],
                resposta: "Sabores más pedidos: Margherita (R$ 42), Calabresa (R$ 45), Cuatro Quesos (R$ 48) y Portuguesa (R$ 47). Todas grandes, 8 porciones." },
            { id: "pagamento", gatilhos: ["pago", "pagar", "pix", "tarjeta", "efectivo", "cambio"],
                resposta: "Aceptamos Pix, tarjeta (débito y crédito) y efectivo. Si es en efectivo, avísame el cambio que necesitas 🙂" },
            { id: "promocao", gatilhos: ["promocion", "descuento", "combo", "oferta"],
                resposta: "Hoy: en la compra de 2 pizzas grandes, el refresco de 2L es gratis 🥤" },
            { id: "pedido", gatilhos: ["pedido", "pedir", "encargar", "hacer un pedido", "quiero una pizza", "quiero pedir"],
                resposta: "¡Genial! Dime el sabor, el tamaño y la dirección de entrega que ya confirmo todo por aquí mismo." },
            { id: "despedida", gatilhos: ["gracias", "genial", "chau", "hasta luego", "nos vemos", "adios"],
                resposta: "¡De nada! Cualquier cosa, solo pregunta. ¡Hasta pronto! 🍕" },
        ],
        chips: [
            { rotulo: "Horario", texto: "¿A qué hora abren?" },
            { rotulo: "Dirección", texto: "¿Cuál es la dirección?" },
            { rotulo: "Menú", texto: "¿Cuáles son los sabores y el precio?" },
            { rotulo: "Hacer pedido", texto: "Quiero hacer un pedido" },
        ],
        mensagemInicial: "¡Hola! 🍕 Aquí está la atención automática de Fatia Nobre. Elige un tema abajo o escribe tu pregunta.",
        semResposta: "Hmm, no entendí eso 🤔 Pero puedo ayudarte con uno de estos temas:",
        digitando: "escribiendo…",
        online: "en línea",
        locale: "es-ES",
    },
};

if (NOME_VISITANTE) {
    document.querySelectorAll("[data-nome-negocio]").forEach((el) => { el.textContent = NOME_VISITANTE; });
    document.title = NOME_VISITANTE + " — Atendimento automático (demonstração)";
}

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
    for (const pergunta of DADOS[idiomaAtual()].perguntas) {
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
    return new Date().toLocaleTimeString(DADOS[idiomaAtual()].locale, { hour: "2-digit", minute: "2-digit" });
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
    const d = DADOS[idiomaAtual()];
    status.textContent = d.digitando;
    const bolha = document.createElement("div");
    bolha.className = "digitando";
    bolha.innerHTML = "<i></i><i></i><i></i>";
    corpo.appendChild(bolha);
    corpo.scrollTop = corpo.scrollHeight;

    const atraso = 650 + Math.random() * 700; // parece mais natural que responder instantâneo
    setTimeout(() => {
        bolha.remove();
        status.textContent = d.online;
        ocupado = false;
        const achada = encontrarResposta(mensagemDoUsuario);
        if (achada) {
            adicionarMensagem(comNome(achada.resposta), "bot");
            chipsEl.innerHTML = "";
        } else {
            adicionarMensagem(d.semResposta, "bot");
            mostrarChips(d.chips);
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
    const d = DADOS[idiomaAtual()];
    corpo.innerHTML = "";
    chipsEl.innerHTML = "";
    status.textContent = d.online;
    ocupado = false;
    adicionarMensagem(comNome(d.mensagemInicial), "bot");
    mostrarChips(d.chips);
}

botaoReiniciar.addEventListener("click", iniciarConversa);
document.addEventListener("idiomaMudou", iniciarConversa);

iniciarConversa();
