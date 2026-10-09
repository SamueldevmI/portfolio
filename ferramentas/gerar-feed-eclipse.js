#!/usr/bin/env node
/* Gera eclipse-studio/produtos.xml: a lista de produtos que o Google Merchant Center aceita pra mostrar a loja
   de graça nos resultados de compra do Google (Google Shopping).
       node ferramentas/gerar-feed-eclipse.js
   Só roda com a loja de verdade: LOJA.demo = false. Peça sem foto ou sem preço fica de fora (o Google recusa).
   Depois de gerar e publicar, a Elizabeth cadastra o link
   https://samueldevmi.github.io/portfolio/eclipse-studio/produtos.xml no Merchant Center (Produtos › Feeds). */
"use strict";
const fs = require("fs");
const path = require("path");
const { carregarCatalogo, urlDaFoto, BASE, PASTA } = require("./catalogo-eclipse.js");

const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]));

(async () => {
    const { loja, produtos, origem } = await carregarCatalogo();
    if (loja.demo) {
        console.log("A loja ainda está em modo demonstração (LOJA.demo = true no eclipse-studio/script.js).");
        console.log("O feed só é gerado com as peças reais: peça de exemplo não pode ir pro Google. Nada foi gravado.");
        return;
    }
    const validas = produtos.filter((p) => !p.secreto && p.id !== "caixa" && p.preco != null && p.fotos.length);
    const fora = produtos.length - validas.length;
    const itens = validas.map((p) => `    <item>
      <g:id>${esc(p.id)}</g:id>
      <g:title>${esc(p.nome)}</g:title>
      <g:description>${esc(p.desc || p.resumo || p.nome)}</g:description>
      <g:link>${esc(`${BASE}?de=google#peca-${encodeURIComponent(p.id)}`)}</g:link>
      <g:image_link>${esc(urlDaFoto(p.fotos[0]))}</g:image_link>
${p.fotos.slice(1, 10).map((f) => `      <g:additional_image_link>${esc(urlDaFoto(f))}</g:additional_image_link>`).join("\n")}
      <g:availability>${p.vendida || p.esgotada ? "out_of_stock" : "in_stock"}</g:availability>
      <g:price>${(p.preco / 100).toFixed(2)} BRL</g:price>
      <g:condition>${p.unica ? "used" : "new"}</g:condition>
      <g:brand>${esc(loja.nome)}</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
      <g:product_type>${esc(p.cat)}</g:product_type>
    </item>`.replace(/\n\n/g, "\n")).join("\n");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Gerado por ferramentas/gerar-feed-eclipse.js a partir do catálogo (${origem}): não edite à mão. -->
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${esc(loja.nome)}</title>
    <link>${BASE}</link>
    <description>Moda alternativa em Campo Grande - MS</description>
${itens}
  </channel>
</rss>
`;
    fs.writeFileSync(path.join(PASTA, "produtos.xml"), xml);
    console.log(`gerado: eclipse-studio/produtos.xml (${validas.length} peças; ${fora} de fora por não ter foto ou preço, ou por ser secreta)`);
})().catch((e) => { console.error(e.message); process.exit(1); });
