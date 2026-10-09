#!/usr/bin/env node
/* Teste do site antes de ir pro ar (roda no CI, em Chrome e em Safari/WebKit):
   1. nenhum arquivo com marca de conflito de merge (<<<<<<< / >>>>>>>);
   2. cada página abre sem erro de JavaScript e sem arquivo do próprio site faltando (404);
   3. todo link interno aponta pra um arquivo que existe;
   4. todo link de WhatsApp está bem formado (wa.me/<número>);
   5. na página inicial: o menu de temas abre e troca o tema, e o resumo de 20 segundos abre.
   Requisição pra fora (fontes, GitHub, estatísticas) é bloqueada: o teste não depende de internet.

   Uso: node ferramentas/testar-site.js                       (Chrome)
        node ferramentas/testar-site.js --navegador webkit     (motor do Safari, com iPhone)
   Aqui no ambiente do Claude: NODE_PATH=$(npm root -g) CHROMIUM=/opt/pw-browsers/chromium node ferramentas/testar-site.js */
"use strict";
const fs = require("fs");
const path = require("path");
const http = require("http");
const pw = require("playwright");

const RAIZ = path.join(__dirname, "..");
const PORTA = 8199;
const BASE = `http://localhost:${PORTA}/portfolio/`;
const ARGS = process.argv.slice(2);
const NAVEGADOR = ARGS.includes("--navegador") ? ARGS[ARGS.indexOf("--navegador") + 1] : "chromium";
const IGNORAR = new Set(["node_modules", ".git", "imagem", "instagram"]);
const falhas = [];
const falhar = (onde, oque) => { falhas.push(`${onde}: ${oque}`); };

/* ---------- 1. marcas de conflito ---------- */
(function conflitos(pasta) {
    for (const nome of fs.readdirSync(pasta)) {
        if (IGNORAR.has(nome)) continue;
        const p = path.join(pasta, nome);
        if (fs.statSync(p).isDirectory()) { conflitos(p); continue; }
        if (!/\.(html|js|css|json|xml|md)$/.test(nome)) continue;
        const linhas = fs.readFileSync(p, "utf8").split("\n");
        linhas.forEach((l, i) => { if (/^(<{7} |>{7} )/.test(l)) falhar(path.relative(RAIZ, p), `marca de conflito na linha ${i + 1}`); });
    }
})(RAIZ);

/* ---------- servidor local, igual ao GitHub Pages (/portfolio/...) ---------- */
const TIPOS = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".pdf": "application/pdf", ".xml": "text/xml", ".mp3": "audio/mpeg", ".vcf": "text/vcard" };
const arquivoDe = (url) => {
    let p = decodeURIComponent(new URL(url, BASE).pathname).replace(/^\/portfolio/, "");
    if (p.endsWith("/")) p += "index.html";
    return path.join(RAIZ, p);
};
const servidor = http.createServer((req, res) => {
    const f = arquivoDe(req.url);
    fs.readFile(f, (erro, dados) => {
        if (erro) { res.writeHead(404); return res.end(); }
        res.writeHead(200, { "content-type": TIPOS[path.extname(f)] || "application/octet-stream" });
        res.end(dados);
    });
});

/* ---------- páginas testadas ---------- */
const pastasCom = (dir) => fs.readdirSync(path.join(RAIZ, dir)).filter((n) => fs.existsSync(path.join(RAIZ, dir, n, "index.html"))).map((n) => `${dir}/${n}/`);
const PAGINAS = [
    "", "dicas/", ...pastasCom("dicas"), "criacao-de-sites-campo-grande/", "qr/", "cartao/", "para-agencias/",
    "como-foi-feito/", "how-it-was-built/", "teste.html", "monte.html", "como-trabalho.html", "case-eclipse.html",
    "curriculo.html", "curriculo-en.html", "404.html",
    "eclipse-studio/", "eclipse-studio/?etiquetas", "eclipse-studio/lancamento/", "eclipse-studio/cadastro/",
    ...fs.readdirSync(RAIZ).filter((n) => n.startsWith("site-para-")).map((n) => n + "/"),
];

(async () => {
    await new Promise((ok) => servidor.listen(PORTA, ok));
    const tipo = pw[NAVEGADOR];
    if (!tipo) throw new Error("navegador desconhecido: " + NAVEGADOR);
    const navegador = await tipo.launch(process.env.CHROMIUM && NAVEGADOR === "chromium" ? { executablePath: process.env.CHROMIUM } : {});
    const aparelhos = NAVEGADOR === "webkit"
        ? [["iPhone", pw.devices["iPhone 13"]], ["Mac", { viewport: { width: 1366, height: 860 } }]]
        : [["celular", pw.devices["Pixel 7"]], ["computador", { viewport: { width: 1366, height: 860 } }]];
    for (const [nomeAparelho, opcoes] of aparelhos) {
        const contexto = await navegador.newContext({ ...opcoes, serviceWorkers: "block" });
        await contexto.route((url) => !url.href.startsWith(`http://localhost:${PORTA}/`), (rota) => rota.abort());
        for (const pagina of PAGINAS) {
            const onde = `${NAVEGADOR}/${nomeAparelho} ${pagina || "início"}`;
            const aba = await contexto.newPage();
            aba.on("pageerror", (e) => falhar(onde, "erro de JavaScript: " + e.message.split("\n")[0]));
            aba.on("response", (r) => { if (r.status() === 404 && r.url().startsWith(`http://localhost:${PORTA}/`) && !r.url().endsWith("/favicon.ico")) falhar(onde, "arquivo faltando: " + r.url().replace(BASE, "")); });
            try {
                await aba.goto(BASE + pagina, { waitUntil: "load", timeout: 30000 });
                await aba.waitForTimeout(pagina === "" ? 2500 : 600);
                const links = await aba.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => ({ href: a.href, cru: a.getAttribute("href") })));
                for (const { href, cru } of links) {
                    if (/^(mailto:|tel:|javascript:|blob:|data:)/.test(cru) || cru.startsWith("#")) continue;
                    if (/wa\.me\//.test(href)) {
                        if (!/^https:\/\/wa\.me\/\d{12,13}(\?text=[^\s]*)?$/.test(href) && !/^https:\/\/wa\.me\/?\?text=/.test(href)) falhar(onde, "link de WhatsApp malformado: " + href.slice(0, 80));
                        continue;
                    }
                    if (!href.startsWith(`http://localhost:${PORTA}/portfolio/`)) continue;
                    const f = arquivoDe(href.split("#")[0]);
                    if (!fs.existsSync(f)) falhar(onde, "link quebrado: " + cru);
                }
                if (pagina === "") {
                    // menu de temas: abre, troca pro Neon e grava a escolha
                    await aba.click("#botaoTema");
                    await aba.click('#temaMenu button[data-tema="neon"]');
                    await aba.waitForFunction(() => document.documentElement.dataset.tema === "neon", null, { timeout: 5000 }).catch(() => falhar(onde, "o menu de temas não trocou o tema"));
                    // resumo de 20 segundos
                    await aba.click("#resumo20Abrir");
                    if (!(await aba.evaluate(() => document.getElementById("resumo20").open))) falhar(onde, "o resumo de 20 segundos não abriu");
                    // tem botão de WhatsApp de verdade
                    if (!(await aba.$('a[href^="https://wa.me/5567996034205"]'))) falhar(onde, "nenhum botão de WhatsApp na página");
                }
            } catch (e) {
                falhar(onde, "não abriu: " + e.message.split("\n")[0]);
            }
            await aba.close();
        }
        await contexto.close();
    }
    await navegador.close();
    servidor.close();
    if (falhas.length) {
        console.error(`\n✗ ${falhas.length} problema(s):\n` + [...new Set(falhas)].map((f) => "  - " + f).join("\n"));
        process.exit(1);
    }
    console.log(`✓ ${PAGINAS.length} páginas em ${NAVEGADOR} (${aparelhos.map((a) => a[0]).join(" e ")}): sem marca de conflito, sem erro, sem link quebrado`);
})().catch((e) => { console.error(e); process.exit(1); });
