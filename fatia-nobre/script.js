"use strict";

/* Demo com o nome do negócio de quem está vendo: o portfólio abre o chat com ?nome=Barbearia do Léo.
   As respostas mudam conforme o ramo, que sai do próprio nome ("barbearia", "clínica", "loja"...) ou de
   &ramo=beleza quando o nome não diz (ex.: "Studio Ana"). Uma barbearia não pode responder com sabor de pizza.
   Sem nome, é a Fatia Nobre de sempre, com os mesmos textos de antes. */
const PARAMETROS = new URLSearchParams(location.search);
const NOME_VISITANTE = (PARAMETROS.get("nome") || "").replace(/\s+/g, " ").trim().slice(0, 40);
const NOME = NOME_VISITANTE || "Fatia Nobre";

const semAcento = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/* gatilhos que servem pra quase todo negócio */
const G = {
    saudacao: ["oi", "ola", "boa noite", "bom dia", "boa tarde", "eae", "opa", "oii"],
    horario: ["horario", "hora", "abre", "fecha", "funciona", "aberto", "atende", "atendimento"],
    endereco: ["endereco", "onde fica", "localizacao", "rua", "fica onde", "local", "como chegar"],
    entrega: ["entrega", "entregam", "delivery", "taxa de entrega", "bairro", "frete"],
    preco: ["preco", "precos", "quanto custa", "quanto e", "valor", "valores", "tabela"],
    pagamento: ["pagamento", "pagar", "pix", "cartao", "dinheiro", "troco", "parcela", "parcelar"],
    promocao: ["promocao", "desconto", "combo", "oferta"],
    agenda: ["vaga", "vagas", "agenda", "horario livre", "disponivel", "encaixe", "tem horario", "horario hoje"],
    agendar: ["agendar", "marcar", "reservar", "quero um horario", "quero cortar"],
    despedida: ["obrigado", "obrigada", "valeu", "tchau", "ate mais", "falou", "flw"],
};
const ENDERECO = "Ficamos na Rua das Oliveiras, 240 — Jardim Itália, Campo Grande (MS).";
const PAGAMENTO = "Aceitamos Pix, cartão (débito e crédito) e dinheiro.";

/* ===== o "cérebro" do atendimento: cada ramo é só uma lista de perguntas e respostas =====
   A ordem importa: a primeira pergunta cujo gatilho aparecer na mensagem é a que responde
   (por isso "agendar" e "tem vaga" vêm antes de "horário"). */
const RAMOS = {
    pizzaria: {
        palavras: ["pizza", "pizzaria", "pizzas"],
        emoji: "🍕", assuntos: "horário, endereço, entrega, cardápio, pagamento ou pedido",
        dica: "o horário, o endereço, o cardápio ou como fazer um pedido",
        perguntas: [
            ["horario", G.horario, "Funcionamos de terça a domingo, das 18h às 23h30. Segunda a gente descansa 😴"],
            ["endereco", G.endereco, ENDERECO],
            ["entrega", G.entrega, "Entregamos sim! Frete grátis até 5 km da loja; acima disso é R$ 6. Tempo médio: 35 a 45 minutos."],
            ["cardapio", ["cardapio", "menu", "sabor", "sabores", "preco", "precos", "quanto custa", "valor", "valores"], "Sabores mais pedidos: Margherita (R$ 42), Calabresa (R$ 45), Quatro Queijos (R$ 48) e Portuguesa (R$ 47). Todas grandes, 8 fatias."],
            ["pagamento", ["pagamento", "pagar", "pix", "cartao", "dinheiro", "troco"], "Aceitamos Pix, cartão (débito e crédito) e dinheiro. Se for dinheiro, já me avisa o troco que precisa 🙂"],
            ["promocao", G.promocao, "Hoje: na compra de 2 pizzas grandes, o refrigerante de 2L sai de graça 🥤"],
            ["pedido", ["pedido", "pedir", "encomendar", "fazer um pedido", "quero uma pizza", "fazer o pedido", "quero pedir"], "Show! Me diz o sabor, o tamanho e o endereço de entrega que eu já confirmo tudo por aqui mesmo."],
        ],
        chips: [["Horário", "Que horas vocês abrem?"], ["Endereço", "Qual o endereço?"], ["Cardápio", "Quais os sabores e o preço?"], ["Fazer pedido", "Quero fazer um pedido"]],
    },
    comida: {
        palavras: ["lanchonete", "lanche", "lanches", "hamburgueria", "burger", "burguer", "restaurante", "marmitaria", "marmita", "marmitas", "acai", "doceria", "doces", "confeitaria", "bolos", "padaria", "panificadora", "sorveteria", "cafeteria", "cafe", "bar", "espetinho", "sushi", "temakeria", "pastelaria", "pastel", "cozinha", "salgados", "churrascaria", "food", "delivery", "esfiharia", "cantina"],
        emoji: "🍽️", assuntos: "horário, endereço, entrega, cardápio, pagamento ou pedido",
        dica: "o horário, o endereço, o cardápio ou como fazer um pedido",
        perguntas: [
            ["horario", G.horario, "Abrimos todos os dias, das 11h às 23h. Pelo chat, os pedidos vão até as 22h30."],
            ["endereco", G.endereco, ENDERECO],
            ["entrega", G.entrega, "Entregamos sim! Grátis até 3 km; acima disso é R$ 5. Tempo médio: 30 a 40 minutos."],
            ["cardapio", ["cardapio", "menu", "opcoes", "prato", "pratos", "sabor", "sabores"].concat(G.preco), "Os mais pedidos da semana saem de R$ 18 a R$ 42. Me diz do que você está com vontade que eu mando as opções com preço."],
            ["pagamento", G.pagamento, PAGAMENTO + " Se for dinheiro, já me avisa o troco 🙂"],
            ["promocao", G.promocao, "Hoje tem combo: com mais R$ 5, a bebida vem junto 🥤"],
            ["pedido", ["pedido", "pedir", "encomendar", "encomenda", "fazer um pedido", "quero pedir", "quero um", "quero uma"], "Show! Me diz o que vai querer e o endereço de entrega (ou se vem retirar) que eu já confirmo por aqui."],
        ],
        chips: [["Horário", "Que horas vocês abrem?"], ["Endereço", "Qual o endereço?"], ["Cardápio", "O que tem no cardápio?"], ["Fazer pedido", "Quero fazer um pedido"]],
    },
    barbearia: {
        palavras: ["barbearia", "barber", "barbershop", "barbeiro", "barba"],
        emoji: "💈", assuntos: "horário, preços, vaga na agenda, endereço ou pagamento",
        dica: "o horário, os preços ou se ainda tem vaga hoje",
        perguntas: [
            ["agendar", G.agendar, "Bora! Me diz o serviço, o dia e o horário que prefere que eu confirmo na agenda."],
            ["agenda", G.agenda, "Hoje ainda tem horário às 15h e às 17h30. Quer que eu reserve um pra você?"],
            ["horario", G.horario, "Atendemos de terça a sábado, das 9h às 20h. Domingo e segunda a cadeira descansa 😄"],
            ["endereco", G.endereco, ENDERECO],
            ["servicos", ["corte", "cortar", "barba", "pezinho", "sobrancelha", "servico", "servicos", "degrade"].concat(G.preco), "Corte R$ 40, barba R$ 30, corte + barba R$ 60 e pezinho R$ 15."],
            ["pagamento", G.pagamento, PAGAMENTO],
            ["promocao", G.promocao, "Terça e quarta, corte + barba sai por R$ 50 ✂️"],
        ],
        chips: [["Horário", "Que horas vocês abrem?"], ["Preços", "Quanto custa o corte?"], ["Tem vaga hoje?", "Tem horário hoje?"], ["Agendar", "Quero agendar um horário"]],
    },
    beleza: {
        palavras: ["salao", "cabeleireiro", "cabeleireira", "cabelo", "cabelos", "hair", "estetica", "beleza", "beauty", "manicure", "unhas", "unha", "nail", "nails", "esmalteria", "sobrancelha", "sobrancelhas", "cilios", "lash", "makeup", "maquiagem", "spa", "depilacao", "micropigmentacao"],
        emoji: "💅", assuntos: "horário, serviços, vaga na agenda, endereço ou pagamento",
        dica: "o horário, os serviços ou se ainda tem vaga hoje",
        perguntas: [
            ["agendar", G.agendar, "Bora! Me diz o serviço, o dia e o horário que prefere que eu confirmo na agenda."],
            ["agenda", G.agenda, "Hoje ainda tem horário às 15h e às 17h30. Quer que eu reserve um pra você?"],
            ["horario", G.horario, "Atendemos de terça a sábado, das 9h às 19h."],
            ["endereco", G.endereco, ENDERECO],
            ["servicos", ["servico", "servicos", "corte", "escova", "coloracao", "luzes", "manicure", "pedicure", "unha", "unhas", "sobrancelha", "limpeza de pele"].concat(G.preco), "Temos corte, escova, coloração, manicure e design de sobrancelha, a partir de R$ 30. Me diz o serviço que eu passo o valor certinho."],
            ["pagamento", G.pagamento, PAGAMENTO],
            ["promocao", G.promocao, "Essa semana, pé + mão sai por R$ 50 💅"],
        ],
        chips: [["Horário", "Que horas vocês abrem?"], ["Serviços", "Quais serviços e preços?"], ["Tem vaga hoje?", "Tem horário hoje?"], ["Agendar", "Quero agendar um horário"]],
    },
    saude: {
        palavras: ["clinica", "consultorio", "odonto", "odontologia", "odontologica", "dentista", "dental", "sorriso", "fisio", "fisioterapia", "psicologia", "psicologo", "psicologa", "nutri", "nutricionista", "nutricao", "medico", "medica", "saude", "dermatologia", "pediatria", "laboratorio", "vet", "veterinaria", "veterinario", "terapia", "ortodontia"],
        emoji: "🩺", assuntos: "horário, convênios, valor da consulta, endereço ou agendamento",
        dica: "o horário, os convênios, o valor da consulta ou como agendar",
        perguntas: [
            ["agendar", G.agendar.concat(["agendamento", "consulta marcada"]), "Claro! Me diz seu nome, o melhor dia e o período (manhã ou tarde) que eu vejo a agenda."],
            ["agenda", G.agenda, "Essa semana ainda tem horário na quinta às 14h e na sexta às 9h. Quer reservar um deles?"],
            ["convenio", ["convenio", "convenios", "plano", "unimed", "particular"], "Atendemos particular e alguns convênios. Me diz qual é o seu que eu confirmo se a gente aceita."],
            ["horario", G.horario, "Atendemos de segunda a sexta, das 8h às 18h, e sábado até o meio-dia."],
            ["endereco", G.endereco, ENDERECO],
            ["valores", ["consulta", "exame", "procedimento", "avaliacao"].concat(G.preco), "A consulta particular sai R$ 180, com retorno em até 30 dias sem custo."],
            ["pagamento", G.pagamento, "Aceitamos Pix, cartão (débito e crédito, em até 3x) e dinheiro."],
        ],
        chips: [["Horário", "Que horas vocês atendem?"], ["Convênios", "Vocês aceitam convênio?"], ["Valor", "Quanto custa a consulta?"], ["Agendar", "Quero agendar uma consulta"]],
    },
    academia: {
        palavras: ["academia", "gym", "crossfit", "pilates", "fitness", "funcional", "box", "fit", "danca", "jiu", "muay", "luta", "lutas", "treino", "yoga"],
        emoji: "💪", assuntos: "horário, planos, aula experimental, endereço ou matrícula",
        dica: "o horário, os planos ou como fazer uma aula experimental",
        perguntas: [
            ["experimental", ["experimental", "aula gratis", "testar", "conhecer", "primeira aula"], "A primeira aula é por nossa conta! É só me dizer o melhor dia e horário pra você vir conhecer."],
            ["matricula", ["matricula", "matricular", "inscrever", "inscricao", "quero entrar", "fechar plano", "quero comecar"], "Bora! Me diz seu nome e qual plano prefere que eu já deixo a matrícula encaminhada."],
            ["horario", G.horario, "Abrimos de segunda a sexta, das 5h30 às 22h, e sábado das 8h às 14h."],
            ["endereco", G.endereco, ENDERECO],
            ["planos", ["plano", "planos", "mensalidade", "mensal", "anual"].concat(G.preco), "Plano mensal R$ 99, trimestral R$ 89 por mês e anual R$ 79 por mês."],
            ["pagamento", G.pagamento, PAGAMENTO],
            ["promocao", G.promocao, "Matriculando essa semana, você não paga a taxa de matrícula 💪"],
        ],
        chips: [["Horário", "Que horas vocês abrem?"], ["Planos", "Quais são os planos?"], ["Aula grátis", "Posso fazer uma aula experimental?"], ["Matrícula", "Quero fazer a matrícula"]],
    },
    loja: {
        palavras: ["loja", "lojas", "store", "shop", "moda", "boutique", "roupas", "roupa", "calcados", "sapatos", "otica", "presentes", "acessorios", "bijuterias", "semijoias", "joias", "papelaria", "cosmeticos", "perfumaria", "variedades", "magazine", "modas", "brecho", "outlet", "kids", "fitwear"],
        emoji: "🛍️", assuntos: "horário, endereço, entrega, produtos, pagamento ou pedido",
        dica: "o horário, a entrega, as novidades ou como fazer um pedido",
        perguntas: [
            ["horario", G.horario, "Funcionamos de segunda a sábado, das 9h às 18h. Pelo chat dá pra pedir a qualquer hora."],
            ["endereco", G.endereco, ENDERECO],
            ["entrega", G.entrega, "Entregamos em toda Campo Grande! Frete grátis acima de R$ 150; abaixo disso, R$ 10."],
            ["produtos", ["produto", "produtos", "catalogo", "novidade", "novidades", "modelo", "modelos", "tamanho", "tamanhos", "estoque", "numeracao"].concat(G.preco), "As novidades da semana começam em R$ 39. Me diz o que você procura que eu mando fotos e os tamanhos disponíveis."],
            ["pagamento", G.pagamento, PAGAMENTO + " No cartão, dá pra parcelar em até 3x."],
            ["promocao", G.promocao, "Essa semana tem 10% de desconto no Pix 🛍️"],
            ["pedido", ["pedido", "pedir", "comprar", "quero comprar", "separar", "reservar", "fazer um pedido"], "Me diz o produto, o tamanho (ou a cor) e o endereço de entrega que eu separo pra você."],
        ],
        chips: [["Horário", "Que horas vocês abrem?"], ["Novidades", "Quais as novidades e os preços?"], ["Entrega", "Vocês entregam?"], ["Fazer pedido", "Quero fazer um pedido"]],
    },
    // nome que não diz o ramo e sem &ramo=: respostas que servem pra qualquer negócio, sem inventar produto
    geral: {
        palavras: [],
        emoji: "👋", assuntos: "horário, endereço, valores, pagamento ou como contratar",
        dica: "o horário, o endereço, os valores ou como contratar",
        perguntas: [
            ["horario", G.horario, "Atendemos de segunda a sexta, das 8h às 18h, e sábado até o meio-dia."],
            ["endereco", G.endereco, ENDERECO],
            ["valores", ["servico", "servicos", "orcamento"].concat(G.preco), "Os valores dependem do que você precisa. Me conta rapidinho que eu passo um orçamento ainda hoje."],
            ["pagamento", G.pagamento, PAGAMENTO],
            ["contratar", ["contratar", "pedido", "pedir", "agendar", "marcar", "quero", "encomendar"], "Perfeito! Me diz seu nome e o que você precisa que a gente retorna rapidinho por aqui."],
        ],
        chips: [["Horário", "Que horas vocês atendem?"], ["Endereço", "Qual o endereço?"], ["Valores", "Quanto custa?"], ["Contratar", "Quero contratar"]],
    },
};

const palavrasDoNome = semAcento(NOME_VISITANTE).split(/[^a-z0-9]+/).filter(Boolean);
function descobrirRamo() {
    if (!NOME_VISITANTE) return "pizzaria";
    const pedido = semAcento(PARAMETROS.get("ramo") || "");
    if (RAMOS[pedido]) return pedido;
    // barbearia antes de beleza ("Barbearia" não é salão), pizzaria antes de comida
    const ordem = ["pizzaria", "barbearia", "saude", "academia", "beleza", "comida", "loja"];
    return ordem.find((r) => RAMOS[r].palavras.some((p) => palavrasDoNome.includes(p))) || "geral";
}
const RAMO = RAMOS[descobrirRamo()];

/* "à Barbearia", "ao Salão", ou sem artigo quando não dá pra saber ("Studio Ana", "Zé Lanches") */
const FEMININOS = ["pizzaria", "barbearia", "lanchonete", "hamburgueria", "marmitaria", "doceria", "confeitaria", "padaria", "panificadora", "sorveteria", "cafeteria", "pastelaria", "churrascaria", "esfiharia", "temakeria", "cantina", "clinica", "loja", "boutique", "otica", "academia", "casa", "cozinha", "escola", "oficina", "farmacia", "estetica", "papelaria", "perfumaria", "esmalteria", "floricultura", "agencia", "moda", "fisioterapia", "odontologia", "veterinaria", "barber", "distribuidora"];
const MASCULINOS = ["salao", "restaurante", "consultorio", "studio", "estudio", "espaco", "bar", "cafe", "box", "centro", "instituto", "atelie", "emporio", "acougue", "mercado", "supermercado", "laboratorio", "escritorio", "brecho", "outlet", "pet", "petshop", "shopping", "clube", "sushi", "espetinho"];
function artigoDe(palavra) {
    if (!NOME_VISITANTE) return "a"; // sem nome: "à Fatia Nobre", como sempre foi
    if (!palavra) return "";
    if (FEMININOS.includes(palavra)) return "a";
    if (MASCULINOS.includes(palavra)) return "o";
    // marcenaria, lavanderia, contabilidade, associação: essas terminações quase sempre são femininas
    if (/(aria|eria|dade|cao)$/.test(palavra)) return "a";
    return "";
}
const artigo = artigoDe(palavrasDoNome[0]);
const aoNome = artigo === "a" ? "à " + NOME : artigo === "o" ? "ao " + NOME : NOME;
const doNome = artigo === "a" ? "da " + NOME : artigo === "o" ? "do " + NOME : "de " + NOME;

const PERGUNTAS = [
    { id: "saudacao", gatilhos: G.saudacao,
        resposta: `Oi! ${RAMO.emoji} ${artigo ? "Bem-vindo " + aoNome + "." : "Aqui é " + NOME + "."} Posso ajudar com ${RAMO.assuntos} — é só perguntar!` },
    ...RAMO.perguntas.map(([id, gatilhos, resposta]) => ({ id, gatilhos, resposta })),
    { id: "despedida", gatilhos: G.despedida, resposta: `Por nada! Qualquer coisa é só chamar. Até já! ${RAMO.emoji}` },
];
const CHIPS_INICIAIS = RAMO.chips.map(([rotulo, texto]) => ({ rotulo, texto }));
const MENSAGEM_INICIAL = `Oi! ${RAMO.emoji} Aqui é o atendimento automático ${doNome}. Escolha um assunto abaixo ou digite sua pergunta.`;

if (NOME_VISITANTE) {
    document.querySelectorAll("[data-nome-negocio]").forEach((el) => { el.textContent = NOME_VISITANTE; });
    document.querySelectorAll(".logo-icone, .avatar").forEach((el) => { el.textContent = RAMO.emoji; });
    document.querySelector(".logo")?.setAttribute("aria-label", NOME_VISITANTE + ", início");
    document.title = NOME_VISITANTE + " — Atendimento automático (demonstração)";
    const aviso = document.querySelector(".aviso-demo span");
    if (aviso) aviso.textContent = `Demonstração de atendimento automático com o nome ${NOME_VISITANTE}. Horários, preços e endereço são de exemplo — no de verdade, entram os seus.`;
    const dica = document.querySelector(".explicacao .lead");
    if (dica) dica.textContent = `Pergunte aí em cima ${RAMO.dica}. Quem reconhece a pergunta e responde é um programa, não uma pessoa digitando.`;
    const rodape = document.querySelector(".rodape .miolo");
    if (rodape && rodape.firstChild && rodape.firstChild.nodeType === Node.TEXT_NODE) {
        rodape.firstChild.textContent = "Este atendimento é uma demonstração com o nome " + NOME_VISITANTE + ": as respostas de verdade seriam montadas com as informações do seu negócio. Feito por ";
    }
    // "Quero um desses": a mensagem diz de qual demonstração a pessoa veio
    document.querySelectorAll('a[href^="https://wa.me/"]').forEach((link) => {
        const url = new URL(link.href);
        const texto = url.searchParams.get("text");
        if (texto && texto.includes("(Fatia Nobre)")) link.href = url.origin + url.pathname + "?text=" + encodeURIComponent(texto.replace("(Fatia Nobre)", "(" + NOME_VISITANTE + ")"));
    });
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
