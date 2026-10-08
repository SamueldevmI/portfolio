#!/usr/bin/env node
/* Gera as páginas feitas pra aparecer no Google e trazer gente nova:
     criacao-de-sites-campo-grande/index.html   ("criação de sites em Campo Grande")
     dicas/index.html + artigos curtos (Google Maps, cardápio, preço de site, catálogo do WhatsApp, avaliações, iFood)
   Preço, prazo, extras e garantia vêm do servicos.js: mudou lá, rode de novo.
       node ferramentas/gerar-paginas-conteudo.js            (gera)
       node ferramentas/gerar-paginas-conteudo.js --conferir (só confere se está em dia; usado no CI) */
"use strict";
const fs = require("fs");
const path = require("path");
const RAIZ = path.join(__dirname, "..");
const S = require(path.join(RAIZ, "servicos.js"));
const VERSAO = "20261008";
const BASE = S.SITE; // https://samueldevmi.github.io/portfolio/
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const P = S.PACOTES, R = S.reais;
const RAMOS = [["site-para-pizzaria", "pizzaria e lanchonete"], ["site-para-barbearia", "barbearia"], ["site-para-loja-de-roupa", "loja de roupa"], ["site-para-salao-de-beleza", "salão de beleza"], ["site-para-academia", "academia e estúdio"], ["site-para-clinica", "clínica e consultório"]];

const CSS = `
        .ct { width: min(820px, calc(100% - 32px)); margin: 24px auto 90px; }
        .ct-largo { width: min(1080px, calc(100% - 32px)); }
        .ct-voltar { display: inline-block; margin-bottom: 18px; color: var(--muted); font-size: .9rem; text-decoration: none; }
        .ct-selo { display: inline-block; margin: 0 0 12px; padding: 5px 12px 4px; border: 2px solid #111111; background: #ffe14d; color: #111111; font: 400 1.05rem/1 "Bangers", Impact, sans-serif; letter-spacing: .06em; text-transform: uppercase; box-shadow: 3px 3px 0 #111111; transform: rotate(-1.5deg); }
        .ct h1 { margin: 4px 0 14px; font-size: clamp(2rem, 6vw, 3.3rem); line-height: 1.05; letter-spacing: -.04em; }
        .ct h1 em { color: var(--cyan); font-style: normal; }
        .ct h2 { margin: 46px 0 12px; font-size: clamp(1.4rem, 3.6vw, 1.9rem); letter-spacing: -.03em; }
        .ct h3 { margin: 26px 0 8px; font-size: 1.15rem; }
        .ct p, .ct li { color: var(--muted); line-height: 1.7; font-size: 1.04rem; }
        .ct li { margin-bottom: 8px; }
        .ct b, .ct strong { color: var(--text); }
        .ct a { color: var(--acento-texto); }
        .ct-lead { font-size: 1.15rem !important; }
        .ct-passos { counter-reset: passo; margin: 0; padding: 0; list-style: none; }
        .ct-passos > li { position: relative; padding: 0 0 0 52px; margin: 0 0 22px; }
        .ct-passos > li::before { counter-increment: passo; content: counter(passo); position: absolute; left: 0; top: 0; display: grid; place-items: center; width: 36px; height: 36px; border: 2px solid #111111; border-radius: 50%; background: #ffe14d; color: #111111; font: 400 1.3rem/1 "Bangers", Impact, sans-serif; box-shadow: 2px 2px 0 #111111; }
        .ct-caixa { margin: 26px 0; padding: 18px 20px; border: 3px solid #111111; border-radius: 8px; background: #f3ead6; box-shadow: 5px 5px 0 #111111; }
        .ct-caixa p, .ct-caixa li { color: #2b2b2b !important; }
        .ct-caixa b, .ct-caixa strong { color: #111111 !important; }
        .ct-caixa a { color: #b0222a !important; }
        .ct-tabela { width: 100%; border-collapse: collapse; margin: 14px 0; }
        .ct-tabela th, .ct-tabela td { padding: 12px 10px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; }
        .ct-tabela th { color: var(--text); font-size: .9rem; }
        .ct-tabela td { color: var(--muted); }
        .ct-tabela td b { color: var(--ouro); }
        .ct-pacotes { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin: 18px 0; }
        .ct-pacote { padding: 18px; border: 3px solid #111111; border-radius: 8px; background: #f3ead6; box-shadow: 5px 5px 0 #111111; }
        .ct-pacote h3 { margin: 0 0 6px; color: #111111; }
        .ct-pacote p { margin: 0 0 8px; color: #2b2b2b !important; font-size: .95rem; }
        .ct-pacote strong { display: block; color: #c41f2a !important; font: 400 1.9rem/1 "Bangers", Impact, sans-serif; letter-spacing: .03em; }
        .ct-pacote small { color: #4a4030; }
        .ct-ramos { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; padding: 0; list-style: none; }
        .ct-ramos li { margin: 0; }
        .ct-ramos a { display: inline-block; padding: 7px 14px; border: 1px solid var(--line); border-radius: 999px; color: var(--text); text-decoration: none; }
        .ct-ramos a:hover { border-color: var(--cyan); }
        .ct-fim { margin-top: 54px; padding: 26px; border: 3px solid #111111; border-radius: 10px; background: radial-gradient(circle, rgba(255,42,61,.12) 1.3px, transparent 1.7px) 0 0 / 10px 10px, #1b1b1b; box-shadow: 0 0 0 3px #f2f2f2, 8px 8px 0 3px rgba(255,42,61,.45); text-align: center; }
        .ct-fim p { max-width: 52ch; margin: 0 auto 16px; }
        .ct-acoes { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
        .ct-acoes .botao { cursor: var(--cursor-mao); }
        .ct-artigos { display: grid; gap: 16px; margin: 20px 0; padding: 0; list-style: none; }
        .ct-artigos a { display: block; padding: 18px 20px; border: 3px solid #111111; border-radius: 8px; background: #f3ead6; color: #111111; text-decoration: none; box-shadow: 5px 5px 0 #111111; }
        .ct-artigos a b { display: block; color: #c41f2a; font: 400 1.5rem/1.05 "Bangers", Impact, sans-serif; letter-spacing: .03em; }
        .ct-artigos a span { color: #2b2b2b; }
        .ct-artigos a:hover { background: #fff7d6; }
        .ct-faq details { padding: 14px 0; border-bottom: 1px solid var(--line); }
        .ct-faq summary { color: var(--text); font-weight: 600; cursor: var(--cursor-mao); }
        .ct-faq p { margin: 8px 0 0; }
        .ct-outros { margin-top: 34px; font-size: .92rem; }`;

function pagina({ pasta, titulo, descricao, schemas, corpo, contar, largo, lang }) {
    const url = BASE + pasta + "/";
    return `<!doctype html>
<!-- Gerado por ferramentas/gerar-paginas-conteudo.js a partir do servicos.js: não edite à mão. -->
<html lang="${lang || "pt-BR"}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(titulo)}</title>
    <meta name="description" content="${esc(descricao)}">
    <link rel="canonical" href="${url}">
    <meta property="og:type" content="${schemas.some((s) => s["@type"] === "Article") ? "article" : "website"}">
    <meta property="og:title" content="${esc(titulo.split(" | ")[0])}">
    <meta property="og:description" content="${esc(descricao)}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${BASE}imagem/og/${pasta.replace(/\//g, "-")}.jpg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="icon" href="${"../".repeat(pasta.split("/").length)}favicon.svg" type="image/svg+xml">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bangers&family=DM+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap">
    <script>
        (function () {
            var azul = false;
            try { azul = localStorage.getItem("portfolio-tema") === "azul"; } catch (e) { /* sem armazenamento */ }
            document.documentElement.dataset.tema = azul ? "azul" : "vermelho";
            document.write('<link rel="stylesheet" href="${"../".repeat(pasta.split("/").length)}' + (azul ? "style-azul.css" : "style.css") + '?v=${VERSAO}">');
        })();
    </script>
    <noscript><link rel="stylesheet" href="${"../".repeat(pasta.split("/").length)}style.css"></noscript>
${schemas.map((s) => `    <script type="application/ld+json">${JSON.stringify(s)}</script>`).join("\n")}
    <style>${CSS}
    </style>
</head>
<body>
    <main class="ct${largo ? " ct-largo" : ""}">
${corpo}
    </main>
    <script src="${"../".repeat(pasta.split("/").length)}estatisticas.js?v=${VERSAO}"></script>
    <script>window.ESTATISTICAS && window.ESTATISTICAS.contar("/${pasta}/", ${JSON.stringify(contar)}, true);</script>
</body>
</html>
`;
}

const autor = { "@type": "Person", name: "Samuel Mickael", url: BASE };
const migalhas = (itens) => ({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: itens.map(([nome, item], i) => ({ "@type": "ListItem", position: i + 1, name: nome, item })) });
const artigo = (titulo, descricao, pasta, data) => ({ "@context": "https://schema.org", "@type": "Article", headline: titulo, description: descricao, author: autor, publisher: autor, datePublished: data, dateModified: data, inLanguage: "pt-BR", mainEntityOfPage: BASE + pasta + "/" });
const zap = (texto) => S.linkWhats(texto);
const fim = (texto, mensagem) => `        <section class="ct-fim">
            <p>${texto}</p>
            <div class="ct-acoes">
                <a class="botao botao-principal" href="${esc(zap(mensagem))}" target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>
                <a class="botao botao-secundario" href="${BASE}teste.html">Fazer o diagnóstico grátis</a>
            </div>
        </section>`;
const pacotes = () => `        <div class="ct-pacotes">
${Object.values(P).map((p) => `            <div class="ct-pacote"><h3>${esc(p.nome)}</h3><p>${esc(p.resumo)}</p><strong>a partir de ${R(p.preco)}</strong><small>pronto em ~${p.prazo} dias · pagamento único</small></div>`).join("\n")}
        </div>`;
const garantia = `        <div class="ct-caixa"><p><b>${esc(S.GARANTIA.titulo)}.</b> ${esc(S.GARANTIA.texto)}</p></div>`;
const ramos = (prefixo) => `        <ul class="ct-ramos">
${RAMOS.map(([p, n]) => `            <li><a href="${prefixo}${p}/">Site para ${esc(n)}</a></li>`).join("\n")}
        </ul>`;

/* ---------- Criação de sites em Campo Grande ---------- */
function campoGrande() {
    const pasta = "criacao-de-sites-campo-grande";
    const titulo = "Criação de sites em Campo Grande - MS | Samuel Mickael";
    const descricao = `Criação de sites em Campo Grande - MS: site, cardápio com pedido no WhatsApp, agendamento e loja online. A partir de ${R(P.site.preco)}, pagamento único. Você só paga se gostar da prévia.`;
    const faq = [
        ["Você é de Campo Grande mesmo?", "Sou. Moro e trabalho aqui em Campo Grande - MS, e o atendimento é pelo WhatsApp, então não importa o bairro."],
        ["Tem mensalidade?", "Não. O preço do site é pago uma vez: 50% quando você aprovar a prévia e 50% na entrega."],
        ["Quanto tempo leva?", `Depende do tipo: um site de apresentação fica pronto em torno de ${P.site.prazo} dias, e uma loja online em torno de ${P.loja.prazo} dias, contando a partir de quando você me manda fotos, preços e textos.`],
        ["Consigo aparecer no Google Maps?", `Sim. Dá pra configurar o seu Perfil da Empresa no Google junto com o site (${R(S.EXTRAS.google.preco)} à parte), ou você mesmo pode fazer seguindo este passo a passo: ${BASE}dicas/aparecer-no-google-maps/`],
    ];
    const schemas = [
        { "@context": "https://schema.org", "@type": "ProfessionalService", name: "Samuel Mickael — criação de sites", url: BASE + pasta + "/", areaServed: { "@type": "City", name: "Campo Grande", containedInPlace: { "@type": "State", name: "Mato Grosso do Sul" } }, address: { "@type": "PostalAddress", addressLocality: "Campo Grande", addressRegion: "MS", addressCountry: "BR" }, telephone: "+" + S.WHATS, priceRange: `${R(P.site.preco)} – ${R(P.loja.preco)}+`, founder: autor },
        { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
        migalhas([["Samuel Mickael", BASE], ["Criação de sites em Campo Grande", BASE + pasta + "/"]]),
    ];
    const corpo = `        <a class="ct-voltar" href="../">← portfólio do Samuel</a>
        <p class="ct-selo">Feito aqui em Campo Grande</p>
        <h1>Criação de sites em <em>Campo Grande - MS</em></h1>
        <p class="ct-lead">Sou o Samuel, desenvolvedor aqui de Campo Grande. Faço site, cardápio com pedido no WhatsApp, agendamento e loja online pra negócio local: preço fechado, pagamento único e o cliente chegando no seu WhatsApp já sabendo o que quer.</p>
${garantia}
        <h2>O que eu faço (e quanto custa)</h2>
${pacotes()}
        <p>Dá pra somar extras, como o endereço próprio (.com.br) e o perfil no Google Maps. Quer ver o preço do seu na hora? <a href="../monte.html">Monte o seu site aqui</a>.</p>
        <h2>Pro seu tipo de negócio</h2>
        <p>Cada ramo tem um jeito de vender. Veja como fica pro seu:</p>
${ramos("../")}
        <h2>Um exemplo de verdade</h2>
        <p>A <b>Eclipse Studio</b>, loja de moda alternativa, saiu do "manda foto no direct" pra uma loja online com sacola que fecha o pedido no WhatsApp. <a href="../case-eclipse.html">Veja como ficou</a>.</p>
        <h2>Como funciona</h2>
        <ol class="ct-passos">
            <li><b>Você me conta a ideia</b> pelo WhatsApp ou pelo <a href="../#orcamento">orçamento de 1 minuto</a>.</li>
            <li><b>Eu monto uma prévia</b> com a cara do seu negócio, antes de você pagar qualquer coisa.</li>
            <li><b>Gostou? Eu termino e coloco no ar.</b> ${esc(S.GARANTIA.pagamento)}.</li>
        </ol>
        <h2>Atendo em qualquer bairro</h2>
        <p>O atendimento é pelo WhatsApp, então tanto faz se o seu negócio fica no Centro, no Jardim dos Estados, no Tiradentes, no Coronel Antonino ou nas Moreninhas: o processo é o mesmo, e você acompanha tudo pelo celular.</p>
        <section class="ct-faq" aria-labelledby="ctFaq">
            <h2 id="ctFaq">Perguntas comuns</h2>
${faq.map(([q, a]) => `            <details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("\n")}
        </section>
${fim("Me conta o que você vende que eu te mostro como ficaria o seu site.", "Oi, Samuel! Vi sua página de criação de sites em Campo Grande e queria um orçamento. Meu negócio é: ")}
        <p class="ct-outros">Dicas grátis pra vender mais: <a href="../dicas/">ver todas</a>.</p>`;
    return { arquivo: pasta + "/index.html", html: pagina({ pasta, titulo, descricao, schemas, corpo, contar: "Criação de sites em Campo Grande", largo: true }) };
}

/* ---------- Artigos ---------- */
const ARTIGOS = [
    {
        pasta: "dicas/aparecer-no-google-maps", data: "2026-10-08",
        titulo: "Como aparecer no Google Maps de graça (passo a passo)",
        resumo: "O Perfil da Empresa no Google é grátis e é o primeiro lugar onde o cliente da sua região procura. Veja como criar o seu em 8 passos.",
        corpo: () => `        <p class="ct-lead">Quando alguém pesquisa "pizzaria perto de mim" ou "barbearia no Tiradentes", o Google mostra primeiro um mapa com os negócios da região. Pra aparecer ali você não precisa pagar nada: precisa de um <b>Perfil da Empresa no Google</b> (o antigo "Google Meu Negócio") bem preenchido.</p>
        <h2>Passo a passo</h2>
        <ol class="ct-passos">
            <li><b>Entre em google.com/business</b> com uma conta Google (pode ser o seu Gmail) e toque em "Gerenciar agora".</li>
            <li><b>Digite o nome do seu negócio.</b> Se ele já aparecer na lista, alguém (às vezes o próprio Google) já criou o perfil: escolha ele e peça pra gerenciar. Se não aparecer, crie um novo.</li>
            <li><b>Escolha a categoria mais específica que existir.</b> "Pizzaria" é melhor que "Restaurante"; "Barbearia" é melhor que "Salão de beleza". A categoria pesa muito em quem te encontra.</li>
            <li><b>Informe o endereço</b>, se o cliente vai até você. Se você atende na casa do cliente ou só entrega, dá pra esconder o endereço e mostrar só a área que você atende.</li>
            <li><b>Coloque telefone, WhatsApp e site.</b> Se ainda não tiver site, coloque o link do Instagram por enquanto.</li>
            <li><b>Confirme que o negócio é seu.</b> O Google pede uma verificação e mostra as opções disponíveis pro seu caso (pode ser vídeo, ligação, mensagem ou e-mail). Sem essa etapa o perfil não aparece completo.</li>
            <li><b>Preencha horário e fotos.</b> Horário de funcionamento (inclusive feriados), foto da fachada, dos produtos e do ambiente. Perfil com foto recebe muito mais clique.</li>
            <li><b>Peça avaliações.</b> No painel tem um link pra avaliar: mande pros clientes satisfeitos pelo WhatsApp e responda todas as avaliações, as boas e as ruins.</li>
        </ol>
        <div class="ct-caixa">
            <p><b>Não faça isso:</b> encher o nome do negócio de palavras ("Pizzaria do João Melhor Pizza Barata Campo Grande"). Vai contra as regras do Google e pode derrubar o perfil. Use o nome que está na fachada.</p>
        </div>
        <h2>Depois de criado</h2>
        <p>Mantenha o horário certo (nada pior que o cliente chegar e estar fechado), poste uma foto nova de vez em quando e continue pedindo avaliação. E coloque um site no campo "site" do perfil: quem clica ali já está decidindo se compra de você.</p>
        <p>Se preferir que eu configure o perfil pra você, dá pra incluir junto com o site por <b>${R(S.EXTRAS.google.preco)}</b>.</p>
${fim("Quer saber o que mais está te fazendo perder cliente? O diagnóstico leva 1 minuto e é grátis.", "Oi, Samuel! Li sua dica do Google Maps e queria ajuda com o meu negócio: ")}`,
    },
    {
        pasta: "dicas/cardapio-instagram-ou-site", data: "2026-10-08",
        titulo: "Cardápio no Instagram ou num site: qual vende mais?",
        resumo: "O Instagram é ótimo pra ser descoberto e péssimo pra fazer pedido. Veja onde cada um ganha e por que o melhor é usar os dois juntos.",
        corpo: () => `        <p class="ct-lead">Muita pizzaria, lanchonete e doceria vende só pelo Instagram: posta o cardápio no destaque e recebe pedido no direct. Funciona, mas tem cliente escapando no meio do caminho. A comparação honesta:</p>
        <table class="ct-tabela">
            <thead><tr><th></th><th>Só Instagram</th><th>Site com cardápio</th></tr></thead>
            <tbody>
                <tr><th>Ser descoberto</th><td><b>Ótimo</b>: post, reels e marcação</td><td>Bom: aparece no Google quando procuram o seu ramo</td></tr>
                <tr><th>Ver o preço</th><td>Foto do cardápio, que fica velha quando o preço muda</td><td><b>Sempre atualizado</b>, item por item</td></tr>
                <tr><th>Fazer o pedido</th><td>Pergunta no direct, espera, pergunta de novo…</td><td><b>Carrinho</b>: o pedido chega pronto no seu WhatsApp</td></tr>
                <tr><th>Pedido errado</th><td>Comum: tudo anotado na mão</td><td>Raro: itens, quantidades e observações vêm escritos</td></tr>
                <tr><th>Taxa por pedido</th><td>Nenhuma</td><td>Nenhuma (diferente dos apps de delivery)</td></tr>
            </tbody>
        </table>
        <h2>Então qual escolher?</h2>
        <p><b>Os dois.</b> O Instagram atrai, o site fecha. Coloque o link do cardápio na bio e nos stories ("pede pelo link 👆"), e o cliente que chegou pelo post faz o pedido sozinho, sem ficar esperando você responder no meio do expediente.</p>
        <div class="ct-caixa">
            <p><b>Quanto custa um cardápio com pedido no WhatsApp?</b> ${esc(P.pedidos.resumo)} A partir de <b>${R(P.pedidos.preco)}</b>, pagamento único, pronto em ~${P.pedidos.prazo} dias. <a href="../../site-para-pizzaria/">Veja como fica pra pizzaria</a>.</p>
        </div>
${fim("Me conta o que você vende que eu te mostro como ficaria o seu cardápio.", "Oi, Samuel! Li sua dica sobre cardápio no Instagram e queria um cardápio com pedido no WhatsApp. Meu negócio é: ")}`,
    },
    {
        pasta: "dicas/quanto-custa-um-site", data: "2026-10-08",
        titulo: "Quanto custa um site pro seu negócio em 2026 (e o que entra no preço)",
        resumo: `Os preços que eu cobro em Campo Grande, do site de ${R(P.site.preco)} à loja online, o que muda o valor e os custos que ficam à parte.`,
        corpo: () => `        <p class="ct-lead">"Quanto custa um site?" é igual a "quanto custa uma reforma": depende do que vai ter dentro. Mas dá pra ter uma ideia bem concreta. Estes são os meus preços, aqui em Campo Grande:</p>
        <table class="ct-tabela">
            <thead><tr><th>Tipo</th><th>O que é</th><th>Preço</th><th>Prazo</th></tr></thead>
            <tbody>
${Object.values(P).map((p) => `                <tr><th>${esc(p.nome)}</th><td>${esc(p.resumo)}</td><td><b>a partir de ${R(p.preco)}</b></td><td>~${p.prazo} dias</td></tr>`).join("\n")}
            </tbody>
        </table>
        <p>Todos são <b>pagamento único</b>, sem mensalidade pra mim. ${esc(S.GARANTIA.texto)}</p>
        <h2>O que faz o preço subir ou descer</h2>
        <ul>
            <li><b>Quantidade de coisas pra mostrar:</b> 10 sabores é diferente de 200 peças com tamanho e cor.</li>
            <li><b>O que o site faz sozinho:</b> só mostrar informação é mais simples que montar pedido, agendar horário ou calcular frete.</li>
            <li><b>Se você já tem fotos e textos:</b> material pronto deixa tudo mais rápido.</li>
            <li><b>Sistemas sob medida</b> (cadastro, controle, painel com login) começam em <b>R$ 300</b> e o valor exato vem na proposta.</li>
        </ul>
        <h2>Custos que ficam à parte</h2>
        <ul>
${Object.values(S.EXTRAS).map((e) => `            <li><b>${esc(e.nome)}</b> (${R(e.preco)}): ${esc(e.desc)}.</li>`).join("\n")}
        </ul>
        <div class="ct-caixa"><p><b>Quer o valor exato do seu?</b> <a href="../../monte.html">Monte o seu site</a> e veja o preço na hora, ou me chame no WhatsApp: a proposta sai em até 24h.</p></div>
${fim("Me conta o que você precisa que eu te mando o valor exato, sem compromisso.", "Oi, Samuel! Li quanto custa um site e queria um orçamento. Meu negócio é: ")}`,
    },
    {
        pasta: "dicas/catalogo-whatsapp-ou-site", data: "2026-10-09",
        titulo: "Catálogo do WhatsApp Business ou site: qual usar?",
        resumo: "O catálogo do WhatsApp Business é grátis e já resolve muita coisa. Veja quando ele basta e quando vale ter um site.",
        corpo: () => `        <p class="ct-lead">O WhatsApp Business tem um <b>catálogo grátis</b>: você cadastra produto, foto e preço, e o cliente vê tudo sem sair da conversa. Pra muito negócio isso já é um ótimo começo. A pergunta é: quando ele deixa de ser suficiente?</p>
        <table class="ct-tabela">
            <thead><tr><th></th><th>Catálogo do WhatsApp</th><th>Site com cardápio ou vitrine</th></tr></thead>
            <tbody>
                <tr><th>Preço</th><td><b>Grátis</b></td><td>Pagamento único (a partir de ${R(P.pedidos.preco)} com pedido no WhatsApp)</td></tr>
                <tr><th>Quem encontra</th><td>Quem já está conversando com você</td><td><b>Também quem procura no Google</b> e ainda não te conhece</td></tr>
                <tr><th>Cara da marca</th><td>O visual do WhatsApp, igual pra todo mundo</td><td><b>Suas cores, sua logo</b>, seu jeito</td></tr>
                <tr><th>Organizar muitos itens</th><td>Coleções simples</td><td>Filtro, busca, tamanhos, sabores e adicionais</td></tr>
                <tr><th>Pedido</th><td>Carrinho dentro do WhatsApp</td><td>Carrinho que manda o pedido pronto pro seu WhatsApp</td></tr>
            </tbody>
        </table>
        <h2>Quando o catálogo basta</h2>
        <ul>
            <li>Você tem <b>poucos produtos</b> e quase todo cliente já chega pelo WhatsApp.</li>
            <li>Você está <b>começando</b> e quer testar antes de investir.</li>
        </ul>
        <h2>Quando vale ter um site</h2>
        <ul>
            <li>Você quer ser achado por <b>gente nova</b>, que procura "pizzaria perto de mim" ou "loja de roupa em Campo Grande".</li>
            <li>Tem <b>muita variação</b>: tamanho, cor, sabor, adicional, borda recheada.</li>
            <li>Quer um <b>link bonito</b> pra bio do Instagram, pro Google Maps e pros anúncios, com a cara do seu negócio.</li>
        </ul>
        <div class="ct-caixa">
            <p><b>Dá pra usar os dois.</b> O site atrai e organiza; o pedido chega no mesmo WhatsApp de sempre. Ninguém precisa baixar nada, e você não paga taxa por pedido.</p>
        </div>
${fim("Me conta o que você vende que eu te digo se o catálogo já basta ou se vale um site.", "Oi, Samuel! Li sua dica sobre catálogo do WhatsApp e site. Meu negócio é: ")}`,
    },
    {
        pasta: "dicas/avaliacoes-no-google", data: "2026-10-09",
        titulo: "Como conseguir mais avaliações no Google (sem comprar nenhuma)",
        resumo: "Avaliação é o que faz o cliente escolher você no mapa. Um jeito simples de pedir, a mensagem pronta e o que nunca fazer.",
        corpo: () => `        <p class="ct-lead">Duas pizzarias lado a lado no Google Maps: uma com 4 avaliações, outra com 180. Em qual você pede? Avaliação é a prova de que outras pessoas confiaram em você, e dá pra conseguir mais sem gastar nada.</p>
        <h2>Passo a passo</h2>
        <ol class="ct-passos">
            <li><b>Pegue o seu link de avaliação.</b> No Perfil da Empresa no Google, procure a opção de pedir avaliações e copie o link. Ainda não tem perfil? <a href="../aparecer-no-google-maps/">Veja como criar</a>.</li>
            <li><b>Peça na hora certa:</b> logo depois de um atendimento que deu certo. Pedido entregue e elogiado, corte que o cliente gostou, cliente voltando pela terceira vez.</li>
            <li><b>Mande pelo WhatsApp, com o link.</b> Quanto menos o cliente precisar procurar, mais ele avalia.</li>
            <li><b>Deixe um QR Code no balcão</b> que abre direto a avaliação. Dá pra gerar grátis no <a href="../../qr/">gerador de QR Code</a> (escolha "Cardápio / site" e cole o link de avaliação).</li>
            <li><b>Responda todas</b>, as boas e as ruins. Agradeça pelo nome e, nas ruins, mostre que resolveu. Quem lê a resposta também está decidindo.</li>
        </ol>
        <div class="ct-caixa">
            <p><b>Mensagem pronta:</b> "Oi, [nome]! Que bom que você gostou 😊 Se puder, deixa uma avaliação pra gente no Google? Ajuda muito um negócio pequeno como o nosso: [link]"</p>
        </div>
        <h2>O que nunca fazer</h2>
        <ul>
            <li><b>Comprar avaliação</b> ou pedir pra amigo que nunca foi cliente: vai contra as regras do Google e pode derrubar o perfil.</li>
            <li><b>Dar desconto em troca de avaliação:</b> as regras do Google também não permitem oferecer recompensa por avaliação.</li>
            <li><b>Brigar na resposta.</b> Mesmo quando o cliente exagerou, responda com calma.</li>
        </ul>
${fim("Quer aparecer melhor no Google? O diagnóstico leva 1 minuto e mostra o que mais está te fazendo perder cliente.", "Oi, Samuel! Li sua dica sobre avaliações no Google e queria ajuda com o meu negócio: ")}`,
    },
    {
        pasta: "dicas/site-ou-ifood", data: "2026-10-09",
        titulo: "Site próprio ou iFood: onde a pizzaria lucra mais?",
        resumo: "O app traz cliente novo, mas cobra por pedido. O site não cobra nada por pedido, mas precisa ser divulgado. Como usar cada um a seu favor.",
        corpo: () => `        <p class="ct-lead">App de delivery e site próprio não são inimigos: cada um faz um trabalho diferente. O erro é deixar <b>todo</b> pedido passar pelo app, inclusive o do cliente que já te conhece.</p>
        <table class="ct-tabela">
            <thead><tr><th></th><th>App de delivery</th><th>Site próprio com pedido no WhatsApp</th></tr></thead>
            <tbody>
                <tr><th>Cliente novo</th><td><b>Ótimo</b>: muita gente procura direto no app</td><td>Depende de você divulgar (Instagram, Google Maps, balcão)</td></tr>
                <tr><th>Custo por pedido</th><td>Comissão por pedido, que varia conforme o plano</td><td><b>Nenhum</b></td></tr>
                <tr><th>Contato do cliente</th><td>Fica com o app</td><td><b>Fica com você</b>: dá pra avisar de promoção depois</td></tr>
                <tr><th>Preço</th><td>Muita gente aumenta o preço no app pra cobrir a taxa</td><td>Você pode cobrar o preço de balcão</td></tr>
            </tbody>
        </table>
        <h2>Faça a conta com os seus números</h2>
        <p>Pegue quantos pedidos você faz por mês no app e quanto pagou de comissão no último extrato. Esse é o valor que sai do seu bolso pra vender pra quem, muitas vezes, <b>já era seu cliente</b>. Um exemplo só pra ilustrar: se a comissão fosse de R$ 8 por pedido, 300 pedidos no mês dariam R$ 2.400. Confira as taxas atuais do seu plano direto no portal do app.</p>
        <h2>O jeito que funciona: usar os dois</h2>
        <ul>
            <li><b>No app:</b> pra ser descoberto por quem ainda não te conhece.</li>
            <li><b>No seu canal:</b> divulgue o link do seu cardápio no Instagram, no Google Maps, no balcão e no status do WhatsApp, pra quem já é cliente pedir direto.</li>
            <li><b>Ofereça um motivo:</b> preço de balcão, um brinde ou a borda recheada de graça pra quem pede pelo seu site.</li>
        </ul>
        <div class="ct-caixa">
            <p><b>Cardápio com pedido no WhatsApp:</b> ${esc(P.pedidos.resumo)} A partir de <b>${R(P.pedidos.preco)}</b>, pagamento único, sem taxa por pedido. <a href="../../site-para-pizzaria/">Veja como fica pra pizzaria</a>.</p>
        </div>
${fim("Quer ver como ficaria o cardápio da sua pizzaria? A prévia é por minha conta.", "Oi, Samuel! Li sua dica sobre site e iFood e queria ver como ficaria o meu cardápio. Minha pizzaria é: ")}`,
    },
];

function paginaArtigo(a) {
    const descricao = a.resumo;
    const schemas = [artigo(a.titulo, descricao, a.pasta, a.data), migalhas([["Samuel Mickael", BASE], ["Dicas", BASE + "dicas/"], [a.titulo, BASE + a.pasta + "/"]])];
    const corpo = `        <a class="ct-voltar" href="../">← todas as dicas</a>
        <p class="ct-selo">Dica grátis</p>
        <h1>${esc(a.titulo)}</h1>
${a.corpo()}
        <p class="ct-outros">Mais dicas: ${ARTIGOS.filter((x) => x !== a).map((x) => `<a href="../../${x.pasta}/">${esc(x.titulo)}</a>`).join(" · ")} · <a href="../../">portfólio do Samuel</a></p>`;
    return { arquivo: a.pasta + "/index.html", html: pagina({ pasta: a.pasta, titulo: `${a.titulo} | Samuel Mickael`, descricao, schemas, corpo, contar: a.titulo }) };
}

function indiceDicas() {
    const pasta = "dicas";
    const titulo = "Dicas pra vender mais com o seu negócio | Samuel Mickael";
    const descricao = "Dicas grátis e diretas pra negócio local vender mais: Google Maps, cardápio, preço de site e mais.";
    const corpo = `        <a class="ct-voltar" href="../">← portfólio do Samuel</a>
        <p class="ct-selo">Dicas grátis</p>
        <h1>Dicas pra <em>vender mais</em></h1>
        <p class="ct-lead">Dicas curtas e diretas pra dono de negócio aqui de Campo Grande, sem enrolação e com passo a passo.</p>
        <ul class="ct-artigos">
${ARTIGOS.map((a) => `            <li><a href="../${a.pasta}/"><b>${esc(a.titulo)}</b><span>${esc(a.resumo)}</span></a></li>`).join("\n")}
            <li><a href="../teste.html"><b>Teste de 1 minuto: seu negócio tá pronto pra vender online?</b><span>8 perguntas, nota de 0 a 10 e as 3 coisas que mais estão te fazendo perder cliente.</span></a></li>
            <li><a href="../qr/"><b>Grátis: QR Code do seu WhatsApp ou cardápio</b><span>Gere e baixe um QR Code pronto pra imprimir e colar no balcão.</span></a></li>
        </ul>
${fim("Quer ajuda com o seu? Me chama que eu te digo o que faria primeiro.", "Oi, Samuel! Vi suas dicas e queria ajuda com o meu negócio: ")}`;
    const schemas = [migalhas([["Samuel Mickael", BASE], ["Dicas", BASE + "dicas/"]])];
    return { arquivo: "dicas/index.html", html: pagina({ pasta, titulo, descricao, schemas, corpo, contar: "Dicas" }) };
}

/* ---------- Bastidores: como este site foi feito (pra quem procura dev, não só pra dono de negócio) ---------- */
function comoFoiFeito() {
    const pasta = "como-foi-feito";
    const titulo = "Como este site foi feito | Samuel Mickael";
    const descricao = "Os bastidores do portfólio: trilha sonora tocada pelo navegador, gibi animado sem pesar no celular, páginas geradas de um arquivo de preços e testes automáticos.";
    const schemas = [artigo("Como este site foi feito", descricao, pasta, "2026-10-09"), migalhas([["Samuel Mickael", BASE], ["Como este site foi feito", BASE + pasta + "/"]])];
    const corpo = `        <a class="ct-voltar" href="../">← portfólio do Samuel</a>
        <p class="ct-selo">Bastidores</p>
        <h1>Como este site <em>foi feito</em></h1>
        <p><a href="../how-it-was-built/" lang="en">Read in English</a></p>
        <p class="ct-lead">Por trás do gibi tem bastante engenharia. Se você é dono de negócio, pode pular esta página: ela é pra quem quer saber <b>como</b> eu trabalho por dentro (empresas, recrutadores e outros devs).</p>
        <h2>Sem framework, sem servidor</h2>
        <p>HTML, CSS e JavaScript puros, hospedados de graça no GitHub Pages. Nada pra instalar, nada pra pagar todo mês. É o mesmo jeito que eu entrego os sites dos clientes: rápido de abrir e barato de manter.</p>
        <h2>A trilha sonora é tocada pelo navegador</h2>
        <p>A música "Meia-noite" não é um arquivo de áudio: cada nota do piano, do grave e da batida é gerada na hora com <b>Web Audio</b>. Por isso ela não pesa no carregamento, muda de clima conforme a seção que você está lendo, fica mais lenta à noite e abaixa sozinha quando você começa a digitar. E só toca se você apertar o play.</p>
        <h2>Gibi animado sem travar o celular</h2>
        <ul>
            <li>As animações só mexem em <b>posição e transparência</b>, que o celular faz sem esforço.</li>
            <li>Quem pede "menos movimento" nas configurações do aparelho vê tudo parado.</li>
            <li>As seções de baixo só são montadas quando chegam perto da tela, e os scripts que não precisam pra página aparecer chegam depois.</li>
            <li>A versão em espanhol só é baixada se alguém aperta "ES".</li>
        </ul>
        <h2>Um arquivo de preços manda em tudo</h2>
        <p>Preço, prazo, pacotes e extras ficam num arquivo só. Dele saem as páginas por ramo (pizzaria, barbearia…), as dicas, o "Monte seu site" e a proposta. Mudou um preço? Um comando gera tudo de novo, e um <b>teste automático no GitHub</b> confere, a cada mudança, se nenhuma página ficou com o valor antigo.</p>
        <h2>Ferramentas feitas pra este site</h2>
        <ul>
            <li><b>Tema azul automático:</b> gerado a partir do vermelho, sem copiar estilo à mão.</li>
            <li><b>Imagens de prévia:</b> o cartão que aparece quando você manda um link no WhatsApp é gerado por um script, uma imagem por página.</li>
            <li><b>Foto em quadrinho:</b> feita numa ferramenta própria que roda no navegador.</li>
            <li><b>QR Code grátis:</b> gerado no próprio celular de quem usa; nada do que a pessoa digita sai do aparelho.</li>
        </ul>
        <h2>Em números</h2>
        <p>Mais de 400 alterações salvas desde 5 de agosto de 2026, todas abertas no <a href="https://github.com/SamueldevmI/portfolio" target="_blank" rel="noopener noreferrer">GitHub</a>.</p>
        <section class="ct-fim">
            <p>Quer esse cuidado no seu projeto, ou conversar sobre uma vaga?</p>
            <div class="ct-acoes">
                <a class="botao botao-principal" href="${esc(zap("Oi, Samuel! Vi como seu site foi feito e queria conversar."))}" target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>
                <a class="botao botao-secundario" href="../curriculo.html">Ver o currículo</a>
                <a class="botao botao-secundario" href="https://github.com/SamueldevmI" target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>
        </section>`;
    return { arquivo: pasta + "/index.html", html: pagina({ pasta, titulo, descricao, schemas, corpo, contar: "Como este site foi feito" }) };
}

/* ---------- The same behind-the-scenes page, in English (for remote jobs and clients abroad) ---------- */
function howItWasBuilt() {
    const pasta = "how-it-was-built";
    const titulo = "How this portfolio was built | Samuel Mickael";
    const descricao = "Behind the scenes of the portfolio: a soundtrack played by the browser, a lightweight comic-book look, pages generated from one price file and automated checks.";
    const schemas = [Object.assign(artigo("How this portfolio was built", descricao, pasta, "2026-10-09"), { inLanguage: "en" })];
    const corpo = `        <a class="ct-voltar" href="../como-foi-feito/" lang="pt-BR">Versão em português</a>
        <p class="ct-selo">Behind the scenes</p>
        <h1>How this portfolio <em>was built</em></h1>
        <p class="ct-lead">I'm Samuel Mickael, a web developer from Campo Grande, Brazil. My clients are local businesses, so the portfolio is in Portuguese, but there's a lot of engineering behind the comic-book look. This page is for companies, recruiters and other developers.</p>
        <h2>No framework, no server</h2>
        <p>Plain HTML, CSS and JavaScript, hosted for free on GitHub Pages. Nothing to install and no monthly bill. It's the same way I deliver client sites: fast to open and cheap to maintain.</p>
        <h2>The soundtrack is played by the browser</h2>
        <p>The background track isn't an audio file: every piano note, bass line and beat is generated on the fly with the <b>Web Audio API</b>. It adds nothing to the page weight, changes mood with the section you're reading, slows down at night and ducks when you start typing. It only plays if you press play.</p>
        <h2>An animated comic book that doesn't freeze your phone</h2>
        <ul>
            <li>Animations only touch <b>position and opacity</b>, which phones handle easily.</li>
            <li>People who ask for reduced motion in their device settings get a still page.</li>
            <li>Lower sections are only rendered when they get close to the screen, and scripts the page doesn't need to appear load later.</li>
            <li>The Spanish version is only downloaded if someone taps "ES".</li>
        </ul>
        <h2>One price file drives everything</h2>
        <p>Prices, timelines, packages and add-ons live in a single file. The industry pages, the tips, the price builder and the proposals are generated from it. Changed a price? One command regenerates everything, and an <b>automated check on GitHub</b> makes sure no page keeps an old value.</p>
        <h2>Tools built for this site</h2>
        <ul>
            <li><b>Automatic blue theme:</b> generated from the red one, no hand-copied styles.</li>
            <li><b>Link previews:</b> the card that shows up when a link is shared on WhatsApp is generated by a script, one image per page.</li>
            <li><b>Comic-style photo:</b> made with a small tool of my own that runs in the browser.</li>
            <li><b>Free QR code generator:</b> runs on the visitor's phone; nothing they type leaves the device.</li>
        </ul>
        <h2>By the numbers</h2>
        <p>More than 400 saved changes since August 5, 2026, all public on <a href="https://github.com/SamueldevmI/portfolio" target="_blank" rel="noopener noreferrer">GitHub</a>.</p>
        <section class="ct-fim">
            <p>Want this kind of care in your project, or to talk about a role?</p>
            <div class="ct-acoes">
                <a class="botao botao-principal" href="https://www.linkedin.com/in/samuelrondon-dev/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                <a class="botao botao-secundario" href="../curriculo-en.html">Résumé (English)</a>
                <a class="botao botao-secundario" href="https://github.com/SamueldevmI" target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>
        </section>`;
    return { arquivo: pasta + "/index.html", html: pagina({ pasta, titulo, descricao, schemas, corpo, contar: "How it was built (EN)", lang: "en" }) };
}

/* ---------- Pra agências e freelancers de marketing: terceirizar o desenvolvimento (valor sempre na proposta) ---------- */
function paraAgencias() {
    const pasta = "para-agencias";
    const titulo = "Desenvolvedor parceiro pra agências em Campo Grande | Samuel Mickael";
    const descricao = "Agência de marketing ou social media? Eu desenvolvo o site, a landing page, o cardápio ou a loja dos seus clientes, e você cuida do resto.";
    const faq = [
        ["Como funciona o valor?", "Por projeto, fechado na proposta antes de começar, com prazo e o que está incluso por escrito."],
        ["Dá pra eu falar com o cliente e você só desenvolver?", "Dá. A gente combina caso a caso quem conversa com o cliente e como os ajustes chegam até mim."],
        ["Você faz o design ou eu mando?", "Os dois funcionam: posso seguir a identidade e as artes que vocês já têm, ou montar o layout a partir da marca do cliente."],
        ["Quanto tempo leva?", `Depende do projeto. Como referência, um site de apresentação fica pronto em torno de ${P.site.prazo} dias e uma loja online em torno de ${P.loja.prazo} dias, depois que chega o material.`],
    ];
    const schemas = [
        { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
        migalhas([["Samuel Mickael", BASE], ["Pra agências", BASE + pasta + "/"]]),
    ];
    const corpo = `        <a class="ct-voltar" href="../">← portfólio do Samuel</a>
        <p class="ct-selo">Pra agências</p>
        <h1>Você vende o projeto. <em>Eu desenvolvo.</em></h1>
        <p class="ct-lead">Agência de marketing, social media ou designer: quando o cliente pede um site, uma landing page ou um cardápio com pedido no WhatsApp, você não precisa recusar nem montar equipe. Eu desenvolvo, aqui de Campo Grande, e você continua cuidando da marca e da divulgação.</p>
        <h2>O que eu desenvolvo</h2>
        <ul>
            <li><b>Sites e landing pages</b> rápidos no celular, prontos pra receber o tráfego dos anúncios.</li>
            <li><b>Cardápio e loja com pedido no WhatsApp</b>, sem taxa por pedido pro seu cliente.</li>
            <li><b>Agendamento pelo WhatsApp</b> pra salão, barbearia, clínica e estúdio.</li>
            <li><b>Sistemas sob medida</b>: cadastro, controle e painel com login.</li>
        </ul>
        <h2>Por que dá certo</h2>
        <ul>
            <li><b>Você não perde o cliente</b> pra outra agência que "também faz site".</li>
            <li><b>Projeto fechado por escrito</b>: escopo, prazo e valor antes de começar.</li>
            <li><b>Feito pra converter</b>: botão de WhatsApp, pedido pronto e página leve no celular, que é onde o anúncio cai.</li>
        </ul>
        <h2>Veja o que eu já fiz</h2>
        <p>A <a href="../case-eclipse.html">loja da Eclipse Studio</a>, os <a href="../#projetos">projetos do portfólio</a> e <a href="../como-foi-feito/">como este site foi feito</a>.</p>
        <section class="ct-faq" aria-labelledby="ctFaqAg">
            <h2 id="ctFaqAg">Perguntas comuns</h2>
${faq.map(([q, a]) => `            <details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("\n")}
        </section>
        <section class="ct-fim">
            <p>Tem um cliente precisando de site? Me conta o projeto que eu te mando a proposta.</p>
            <div class="ct-acoes">
                <a class="botao botao-principal" href="${esc(zap("Oi, Samuel! Sou de uma agência e tenho um cliente precisando de site. O projeto é: "))}" target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>
                <a class="botao botao-secundario" href="https://www.linkedin.com/in/samuelrondon-dev/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
        </section>`;
    return { arquivo: pasta + "/index.html", html: pagina({ pasta, titulo, descricao, schemas, corpo, contar: "Pra agências", largo: true }) };
}

const paginas = [campoGrande(), indiceDicas(), ...ARTIGOS.map(paginaArtigo), comoFoiFeito(), howItWasBuilt(), paraAgencias()];
const conferir = process.argv.includes("--conferir");
let desatualizadas = 0;
for (const { arquivo, html } of paginas) {
    const destino = path.join(RAIZ, arquivo);
    if (conferir) {
        const atual = fs.existsSync(destino) ? fs.readFileSync(destino, "utf8") : "";
        if (atual !== html) { desatualizadas++; console.log("desatualizada:", arquivo); }
    } else {
        fs.mkdirSync(path.dirname(destino), { recursive: true });
        fs.writeFileSync(destino, html);
        console.log("gerada:", arquivo);
    }
}
if (conferir) {
    if (desatualizadas) { console.log("rode: node ferramentas/gerar-paginas-conteudo.js"); process.exit(1); }
    console.log("páginas de conteúdo em dia");
}
