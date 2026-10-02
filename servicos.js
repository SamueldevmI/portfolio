/* Dados em comum dos serviços: pacotes, extras, preços, conteúdo de cada ramo e o programa de indicação.
   Usado pelo "Monte seu site" (monte.html), pela apresentação (apresentar.html), pelo teste (teste.html),
   pela proposta (proposta.html), pela prospecção e pelas páginas por ramo (geradas com
   node ferramentas/gerar-paginas-ramo.js). Mudou um preço aqui? Rode o gerador pra atualizar as páginas por ramo.
   Funciona no navegador (window.SERVICOS) e no Node (require). */
(function (raiz, fabrica) {
    const dados = fabrica();
    if (typeof module === "object" && module.exports) module.exports = dados;
    else raiz.SERVICOS = dados;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";
    const WHATS = "5567996034205";
    const SITE = "https://samueldevmi.github.io/portfolio/";

    /* Preço em reais; prazo em dias. Os itens aparecem na proposta, no "Monte seu site" e nas páginas por ramo. */
    const PACOTES = {
        site: { nome: "Site de apresentação", curto: "Site", preco: 250, prazo: 5, resumo: "Uma página com a cara do seu negócio e botão pro WhatsApp.", itens: [
            ["Site com a cara do seu negócio", "logo, cores, fotos e textos seus"],
            ["Funciona no celular e no computador", "a maioria dos clientes vai abrir pelo celular"],
            ["Botão direto pro seu WhatsApp", "o cliente chama já sabendo do que se trata"],
            ["Endereço, mapa e horário de funcionamento", "chega de “onde fica?” e “tá aberto?”"],
            ["Coloco no ar pra você", "com um link pronto pra divulgar"],
        ] },
        pedidos: { nome: "Site + cardápio com pedido no WhatsApp", curto: "Cardápio", preco: 450, prazo: 7, resumo: "Cardápio com foto e preço; o pedido chega pronto no seu WhatsApp.", itens: [
            ["Tudo do site de apresentação", "cara do negócio, celular, WhatsApp, mapa e horário"],
            ["Cardápio/catálogo com fotos e preços", "fácil de trocar quando mudar algo"],
            ["Carrinho que manda o pedido pronto", "itens, quantidades, total e observação direto no seu WhatsApp"],
            ["Coloco no ar pra você", "com um link pronto pra divulgar"],
        ] },
        agenda: { nome: "Site + agendamento pelo WhatsApp", curto: "Agendamento", preco: 450, prazo: 7, resumo: "O cliente escolhe serviço, dia e horário e te manda tudo pronto.", itens: [
            ["Tudo do site de apresentação", "cara do negócio, celular, WhatsApp, mapa e horário"],
            ["Lista de serviços com preço e duração", "o cliente já sabe quanto custa antes de chamar"],
            ["Pedido de horário pronto", "o cliente escolhe serviço, dia e horário e te manda tudo no WhatsApp"],
            ["Coloco no ar pra você", "com um link pronto pra divulgar"],
        ] },
        loja: { nome: "Loja online com pedido no WhatsApp", curto: "Loja", preco: 600, prazo: 10, resumo: "Vitrine com filtro e sacola; o pedido chega no WhatsApp, sem taxa por venda.", itens: [
            ["Tudo do site de apresentação", "cara da marca, celular, WhatsApp e informações"],
            ["Vitrine com filtro por categoria e busca", "a cliente acha a peça rapidinho"],
            ["Sacola que vira pedido no WhatsApp", "peças, tamanhos, total e observação, sem taxa por venda"],
            ["Favoritos e link por peça", "pra cliente salvar e mandar pra amiga"],
            ["Tabela de tamanhos e dúvidas frequentes", "menos pergunta repetida no direct"],
            ["Coloco no ar pra você", "com um link pronto pra divulgar"],
        ] },
    };

    /* preco: o que soma no "Monte seu site" (0 = sem custo). */
    const EXTRAS = {
        dominio: { nome: "Endereço próprio (.com.br)", desc: "configuro o domínio; o registro fica no seu nome (cerca de R$ 40/ano, pago direto no Registro.br)", preco: 50 },
        google: { nome: "Perfil no Google Meu Negócio", desc: "pra aparecer no Google Maps quando procurarem seu ramo na região", preco: 80 },
        kit: { nome: "Kit de lançamento pro Instagram", desc: "post e story anunciando o site", preco: 60 },
        ajustes: { nome: "30 dias de ajustes depois de entregar", desc: "mudou preço, trocou foto? eu arrumo sem custo", preco: 40 },
    };

    /* Cada ramo: o pacote que mais combina, as conversas do “sem site” e o que o site resolve. previa = chave do celular da prévia. */
    const RAMOS = {
        pizzaria: { nome: "pizzaria", titulo: "pizzaria e lanchonete", emoji: "🍕", pacote: "pedidos", previa: "pizzaria", exemplo: "Sua Pizzaria",
            dor: "responder “ainda tá aberto?” a noite toda",
            sem: ["boa noite, ainda tá aberto?", "quanto tá a grande de calabresa?", "entrega no Jardim dos Estados?", "???"],
            alerta: "você viu às 23h47. ele já tá comendo a do concorrente 🩴",
            com: ["Horário, cardápio e taxa de entrega na tela, sem ninguém perguntar", "Pedido chega pronto no WhatsApp: sabor, tamanho, endereço e total", "Aparece no Google quando procuram “pizzaria perto de mim”"],
            faq: [["Preciso pagar taxa por pedido?", "Não. O pedido vai direto pro seu WhatsApp; não tem aplicativo no meio cobrando comissão."], ["Dá pra mudar o cardápio depois?", "Dá. Preço, sabor e foto mudam fácil, e eu te ajudo nas primeiras vezes."], ["Funciona junto com o iFood?", "Funciona. Muita pizzaria usa o site pra quem já é cliente pedir direto, sem a comissão do app."]] },
        barbearia: { nome: "barbearia", titulo: "barbearia", emoji: "💈", pacote: "agenda", previa: "barbearia", exemplo: "Sua Barbearia",
            dor: "responder “tem horário hoje?” com a máquina na mão",
            sem: ["fala mano, tem horário hoje?", "e amanhã cedo?", "quanto tá corte + barba?", "??"],
            alerta: "marcou o Zé e o Pedro no mesmo horário. os dois de cara feia 😬",
            com: ["Serviços e preços na tela: corte, barba, combo", "O cliente escolhe o horário e te manda tudo pronto no WhatsApp", "Fotos dos cortes pra ele já chegar sabendo o que quer"],
            faq: [["O cliente marca sozinho?", "Ele escolhe serviço, dia e horário e te manda o pedido pronto no WhatsApp; você só confirma."], ["E se eu tiver mais de um barbeiro?", "Dá pra separar por barbeiro: cada um com seus horários e serviços."], ["Precisa de mensalidade?", "Não. O site é pagamento único; sem app e sem plano mensal."]] },
        loja: { nome: "loja de roupa", titulo: "loja de roupa", emoji: "👗", pacote: "loja", previa: "loja de roupa", exemplo: "Sua Loja",
            dor: "mandar 23 fotos no direct pra ela “pensar”",
            sem: ["oii, esse vestido ainda tem?", "tem no M?", "e na cor preta?", "vou pensar e te aviso 🙃"],
            alerta: "23 fotos no direct e ela ainda vai pensar 📸",
            com: ["Vitrine com preço, tamanho e foto de cada peça", "Sacola que vira pedido no WhatsApp, sem taxa por venda", "Link de cada peça pra cliente mandar pra amiga"],
            faq: [["Preciso de loja virtual com mensalidade?", "Não. A vitrine é sua, sem mensalidade nem taxa por venda; o pagamento você combina no WhatsApp (Pix ou link do cartão)."], ["Consigo trocar as peças sozinha?", "Consegue: é só me mandar foto, nome e preço, ou eu te ensino a mudar."], ["Tem exemplo pronto?", "Tem: a loja da Eclipse Studio, moda alternativa aqui de Campo Grande."]] },
        salao: { nome: "salão de beleza", titulo: "salão de beleza", masc: true, emoji: "💇‍♀️", pacote: "agenda", previa: "salão", exemplo: "Seu Salão",
            dor: "virar secretária com a mão cheia de tinta",
            sem: ["amiga, tem horário pra escova hoje?", "quanto tá a progressiva?", "faz unha junto?", "??"],
            alerta: "três clientes às 9h de sábado. boa sorte 😬",
            com: ["Serviços com preço e duração na tela", "A cliente escolhe o horário e te manda tudo no WhatsApp", "Fotos dos seus trabalhos pra ela se apaixonar antes de chegar"],
            faq: [["Dá pra marcar dois serviços juntos?", "Dá: escova + unha no mesmo pedido, já com o horário que ela quer."], ["Preciso mexer em computador?", "Não. Tudo chega no WhatsApp que você já usa."], ["Quanto tempo pra ficar pronto?", "Em torno de uma semana depois de você me mandar fotos e preços."]] },
        academia: { nome: "academia", titulo: "academia e estúdio", emoji: "🏋️", pacote: "agenda", previa: "academia", exemplo: "Sua Academia",
            dor: "responder “quanto tá a mensalidade?” o dia inteiro",
            sem: ["quanto tá a mensalidade?", "tem plano anual?", "abre domingo?", "segunda eu começo 😅"],
            alerta: "ele disse “segunda eu começo”. faz 3 anos 🥲",
            com: ["Planos, horários e modalidades na tela", "Aula experimental marcada pelo link", "Aparece no Google quando procuram “academia perto de mim”"],
            faq: [["Dá pra mostrar os planos com preço?", "Dá, com mensal, trimestral e anual lado a lado."], ["E a aula experimental?", "O aluno escolhe dia e horário e te manda no WhatsApp; você só confirma."], ["Precisa de app?", "Não. É um site leve que abre no celular de qualquer um."]] },
        clinica: { nome: "clínica", titulo: "clínica e consultório", emoji: "🩺", pacote: "agenda", previa: "clínica", exemplo: "Sua Clínica",
            dor: "a recepção atendendo 80 mensagens com o telefone tocando",
            sem: ["bom dia, atende Unimed?", "tem horário essa semana?", "quanto é a consulta particular?", "alô??"],
            alerta: "paciente faltou sem avisar. horário vazio 🫠",
            com: ["Especialidades, convênios e valores na tela", "Pedido de consulta pronto no WhatsApp da recepção", "Endereço, mapa e como chegar"],
            faq: [["Mostra os convênios aceitos?", "Mostra, com a lista atualizada sempre que você mudar."], ["Guarda dado de paciente?", "Não. O pedido vai direto pro WhatsApp da recepção; o site não guarda informação de saúde."], ["Serve pra mais de um profissional?", "Serve: cada especialidade ou profissional com seus dias de atendimento."]] },
    };

    /* Indique e ganhe: link ?indicou=Nome. VALORES SUGERIDOS: confirme antes de divulgar. */
    const INDICACAO = { desconto: 0.10, amigo: "10% de desconto no primeiro site", quemIndica: "R$ 50 no Pix pra cada indicação que fechar" };

    const reais = (n) => "R$ " + Number(n).toLocaleString("pt-BR", { minimumFractionDigits: n % 1 ? 2 : 0 });
    const slug = (texto) => String(texto || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
        .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

    /* quem chegou por indicação (guarda no aparelho pra valer nas próximas visitas) */
    function indicacao() {
        if (typeof location === "undefined") return "";
        let nome = "";
        try {
            nome = (new URLSearchParams(location.search).get("indicou") || "").trim().slice(0, 40);
            if (nome) localStorage.setItem("portfolio-indicou", nome);
            else nome = localStorage.getItem("portfolio-indicou") || "";
        } catch (e) { /* sem armazenamento: vale só nesta visita */ }
        return nome;
    }
    /* link do WhatsApp do Samuel, já com a indicação no fim quando houver */
    function linkWhats(texto) {
        const quem = indicacao();
        const final = quem && !/Indicação/.test(texto) ? `${texto}\n\n(Indicação: ${quem})` : texto;
        return `https://wa.me/${WHATS}?text=${encodeURIComponent(final)}`;
    }

    return { WHATS, SITE, PACOTES, EXTRAS, RAMOS, INDICACAO, reais, slug, indicacao, linkWhats };
});

/* Em qualquer página que carregar este arquivo: quem veio por indicação leva o nome de quem indicou
   em todo botão de WhatsApp do Samuel, e vê um aviso discreto do desconto. */
(function () {
    "use strict";
    if (typeof document === "undefined" || !self.SERVICOS) return;
    const S = self.SERVICOS;
    const quem = S.indicacao();
    if (!quem) return;
    document.addEventListener("click", (e) => {
        const a = e.target.closest && e.target.closest(`a[href*="wa.me/${S.WHATS}"]`);
        if (!a) return;
        try {
            const u = new URL(a.href);
            const texto = u.searchParams.get("text") || "";
            if (!/Indicação/.test(texto)) a.href = `${u.origin}${u.pathname}?text=${encodeURIComponent(`${texto}${texto ? "\n\n" : ""}(Indicação: ${quem})`)}`;
        } catch (erro) { /* link fora do padrão: segue como está */ }
    }, true);
    const mostrar = () => {
        if (document.querySelector(".faixa-indicacao") || document.body.dataset.semIndicacao !== undefined) return;
        const faixa = document.createElement("p");
        faixa.className = "faixa-indicacao";
        faixa.setAttribute("role", "status");
        const b = document.createElement("b"); b.textContent = quem;
        faixa.append("🤝 Você veio por indicação de ", b, `: ganha ${S.INDICACAO.amigo}.`);
        const fechar = document.createElement("button");
        fechar.type = "button"; fechar.textContent = "×"; fechar.setAttribute("aria-label", "Fechar aviso");
        fechar.addEventListener("click", () => faixa.remove());
        faixa.append(fechar);
        document.body.prepend(faixa);
        if (self.ESTATISTICAS) self.ESTATISTICAS.contar(`/indicacao/${S.slug(quem)}`, `veio por indicação de ${quem}`, true);
    };
    if (document.body) mostrar(); else document.addEventListener("DOMContentLoaded", mostrar);
})();
