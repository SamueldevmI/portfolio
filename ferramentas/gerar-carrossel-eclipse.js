#!/usr/bin/env node
/* Carrossel do Instagram com as peças novas da Eclipse Studio (1080x1350): capa "Chegou no drop", um slide por
   peça (foto, nome, preço e código) e o fim com "link na bio". Sai em eclipse-studio/kit/drop/ com a legenda.
       NODE_PATH=$(npm root -g) node ferramentas/gerar-carrossel-eclipse.js            (peças novas com foto)
       NODE_PATH=$(npm root -g) node ferramentas/gerar-carrossel-eclipse.js --todas    (todas com foto)
   Peça sem foto fica de fora (o carrossel é pra mostrar a peça de verdade). Enquanto a loja estiver em modo
   demonstração (LOJA.demo = true), não grava nada: --teste <pasta> monta um de mentira, fora do site, pra conferir o visual. */
"use strict";
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const { carregarCatalogo, urlDaFoto, arquivoDaFoto, PASTA } = require("./catalogo-eclipse.js");

const ARGS = process.argv.slice(2);
const TESTE = ARGS.includes("--teste") ? ARGS[ARGS.indexOf("--teste") + 1] : null;
const TODAS = ARGS.includes("--todas");
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const brl = (c) => (c == null ? "sob consulta" : (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));
const imagem = (f) => {
    const arq = arquivoDaFoto(f);
    if (arq && fs.existsSync(arq)) return `data:image/${/\.png$/i.test(arq) ? "png" : "jpeg"};base64,${fs.readFileSync(arq).toString("base64")}`;
    return urlDaFoto(f);
};

const CSS = `* { box-sizing: border-box; margin: 0; }
body { width: 1080px; height: 1350px; overflow: hidden; background: radial-gradient(60% 40% at 10% 0%, rgba(160,110,230,.35), transparent 70%), radial-gradient(50% 35% at 100% 100%, rgba(255,184,217,.2), transparent 70%), #150c1f; color: #f6eeff; font-family: "Quicksand", sans-serif; }
.moldura { position: absolute; inset: 36px; border: 2px solid rgba(205,180,255,.45); border-radius: 28px; padding: 70px 64px; }
.marca { font: 400 56px/1 "UnifrakturMaguntia", serif; color: #cdb4ff; }
.num { position: absolute; right: 60px; top: 58px; font: 700 34px "Quicksand"; color: #cfc0e6; }
h1 { margin-top: 70px; font: 700 150px/.95 "Cormorant Garamond", serif; }
h1 em { font-style: italic; background: linear-gradient(90deg, #cdb4ff, #ffb8d9 60%, #aef0d6); -webkit-background-clip: text; background-clip: text; color: transparent; }
.sub { margin-top: 36px; font: 600 46px/1.3 "Quicksand"; color: #cfc0e6; }
.lua { position: absolute; right: 90px; bottom: 150px; width: 260px; height: 260px; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #fff8e7, #e9c46a 70%); box-shadow: 0 0 120px rgba(233,196,106,.5); }
.foto { display: block; width: 100%; height: 820px; margin-top: 40px; border-radius: 22px; object-fit: cover; border: 2px solid rgba(205,180,255,.4); }
h2 { margin-top: 34px; font: 700 78px/1 "Cormorant Garamond", serif; }
.linha { display: flex; justify-content: space-between; align-items: baseline; margin-top: 18px; }
.preco { font: 700 60px "Quicksand"; color: #ffb8d9; }
.cod { font: 600 32px "Quicksand"; color: #cfc0e6; }
.unica { display: inline-block; margin-top: 14px; padding: 6px 18px; border-radius: 999px; background: rgba(233,196,106,.18); color: #e9c46a; font: 700 30px "Quicksand"; }
.rodape { position: absolute; left: 64px; right: 64px; bottom: 56px; font: 600 32px "Quicksand"; color: #cfc0e6; }`;
const pagina = (miolo, n, total) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,700;1,700&family=Quicksand:wght@600;700&family=UnifrakturMaguntia&display=block">
<style>${CSS}</style></head><body><div class="moldura"><p class="marca">Eclipse Studio</p><p class="num">${n}/${total}</p>${miolo}</div></body></html>`;

(async () => {
    const { loja, produtos } = await carregarCatalogo();
    let pecas = produtos.filter((p) => !p.secreto && p.id !== "caixa" && !p.vendida && !p.esgotada && (TODAS || p.novo));
    let destino = path.join(PASTA, "kit", "drop");
    if (TESTE) {
        // visual de mentira: as peças de exemplo com a foto do kit no lugar, gravado fora do site
        pecas = pecas.slice(0, 4).map((p) => ({ ...p, fotos: ["kit/card-camiseta.jpg"] }));
        destino = path.resolve(TESTE);
    } else {
        if (loja.demo) { console.log("A loja ainda está em modo demonstração (LOJA.demo = true): nada foi gravado. Pra ver o visual: --teste <pasta>"); return; }
        pecas = pecas.filter((p) => p.fotos.length);
        if (!pecas.length) { console.log(TODAS ? "Nenhuma peça com foto ainda." : "Nenhuma peça nova com foto. Use --todas pra incluir as outras."); return; }
    }
    pecas = pecas.slice(0, 8); // o Instagram aceita até 10 slides: capa + 8 peças + fim
    fs.rmSync(destino, { recursive: true, force: true });
    fs.mkdirSync(destino, { recursive: true });
    const total = pecas.length + 2;
    const slides = [
        `<h1>Chegou no <em>drop</em></h1><p class="sub">${pecas.length} ${pecas.length === 1 ? "peça nova" : "peças novas"} na loja 🌕<br>arrasta pro lado →</p><div class="lua"></div>`,
        ...pecas.map((p) => `<img class="foto" src="${imagem(p.fotos[0])}" alt=""><h2>${esc(p.nome)}</h2><div class="linha"><span class="preco">${brl(p.preco)}</span><span class="cod">${p.unica ? '<span class="unica">🕯 peça única</span>' : ""}</span></div>`),
        `<h1>Pede pelo <em>link</em> da bio</h1><p class="sub">Monta a sacola no site e o pedido chega pronto no WhatsApp 🖤</p><p class="rodape">@eclipse_studiocg · Campo Grande - MS</p><div class="lua"></div>`,
    ];
    const navegador = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ["--ignore-certificate-errors"] });
    const aba = await navegador.newPage({ viewport: { width: 1080, height: 1350 } });
    for (let i = 0; i < slides.length; i++) {
        await aba.setContent(pagina(slides[i], i + 1, total), { waitUntil: "networkidle" });
        await aba.evaluate(() => document.fonts.ready);
        await aba.screenshot({ path: path.join(destino, String(i + 1).padStart(2, "0") + ".jpg"), type: "jpeg", quality: 86 });
    }
    await navegador.close();
    const legenda = `Chegou no drop 🌕 ${pecas.map((p) => p.nome).join(", ")}.\n\nMonta a sacola pelo link da bio e o pedido chega pronto no WhatsApp 🖤\n\n#modaalternativa #goth #pastelgoth #campogrande #campograndems`;
    fs.writeFileSync(path.join(destino, "legenda.txt"), legenda + "\n");
    console.log(`gerado: ${path.relative(process.cwd(), destino)} (${total} slides + legenda)`);
})().catch((e) => { console.error(e.message); process.exit(1); });
