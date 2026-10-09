/* Lê o catálogo da Eclipse Studio do mesmo jeito que a loja: da planilha do Google, se estiver ligada
   (PLANILHA em eclipse-studio/planilha.js), ou da lista PRODUTOS do eclipse-studio/script.js.
   Usado pelos geradores de carrossel e de feed do Google (ferramentas/gerar-*-eclipse.js). */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const RAIZ = path.join(__dirname, "..");
const PASTA = path.join(RAIZ, "eclipse-studio");
const BASE = "https://samueldevmi.github.io/portfolio/eclipse-studio/";

// pega "const NOME = <valor>;" de dentro de um arquivo do navegador e avalia só esse pedaço
function trecho(codigo, nome, abre, fecha) {
    const ini = codigo.indexOf(`const ${nome} = ${abre}`);
    if (ini < 0) throw new Error(`não achei ${nome}`);
    let nivel = 0, i = codigo.indexOf(abre, ini);
    for (; i < codigo.length; i++) {
        const c = codigo[i];
        if (c === '"' || c === "'" || c === "`") { const q = c; i++; while (i < codigo.length && codigo[i] !== q) { if (codigo[i] === "\\") i++; i++; } continue; }
        if (c === abre) nivel++;
        else if (c === fecha && --nivel === 0) break;
    }
    return codigo.slice(codigo.indexOf(abre, ini), i + 1);
}
const avaliar = (expr, contexto = {}) => vm.runInNewContext(`(${expr})`, contexto);

function lerCSV(texto) {
    const linhas = [];
    let linha = [], campo = "", aspas = false;
    for (let i = 0; i < texto.length; i++) {
        const c = texto[i];
        if (aspas) { if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; } else if (c === '"') aspas = false; else campo += c; }
        else if (c === '"') aspas = true;
        else if (c === ",") { linha.push(campo); campo = ""; }
        else if (c === "\n" || c === "\r") { if (c === "\r" && texto[i + 1] === "\n") i++; linha.push(campo); linhas.push(linha); linha = []; campo = ""; }
        else campo += c;
    }
    if (campo || linha.length) { linha.push(campo); linhas.push(linha); }
    return linhas.filter((l) => l.some((x) => x.trim()));
}
const chave = (t) => String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "");
const sim = (t) => /^(s|sim|x|yes|true|1|✓|✔)$/i.test(String(t || "").trim());
function centavos(t) {
    const limpo = String(t || "").replace(/[^\d,.]/g, "");
    if (!limpo) return null;
    const n = limpo.includes(",") ? Number(limpo.replace(/\./g, "").replace(",", ".")) : Number(limpo);
    return Number.isFinite(n) ? Math.round(n * 100) : null;
}

async function carregarCatalogo() {
    const script = fs.readFileSync(path.join(PASTA, "script.js"), "utf8");
    const loja = avaliar(trecho(script, "LOJA", "{", "}"));
    const planilhaJs = fs.readFileSync(path.join(PASTA, "planilha.js"), "utf8");
    const url = (planilhaJs.match(/const PLANILHA = "([^"]*)"/) || [])[1];
    if (url) {
        const resposta = await fetch(url);
        if (!resposta.ok) throw new Error("não consegui baixar a planilha: " + resposta.status);
        const [cabeca, ...linhas] = lerCSV(await resposta.text());
        const col = Object.fromEntries(cabeca.map((n, i) => [chave(n), i]));
        const pega = (l, ...ns) => { for (const n of ns) if (col[n] !== undefined) return (l[col[n]] || "").trim(); return ""; };
        const produtos = linhas.map((l) => {
            const nome = pega(l, "nome", "peca");
            if (!nome) return null;
            const fotos = pega(l, "fotos", "foto").split(/[\s;]+/).filter((x) => /^https?:\/\/|^fotos\//i.test(x));
            return {
                id: pega(l, "id", "codigo").replace(/[^\w-]/g, "") || chave(nome).slice(0, 30), nome, cat: pega(l, "categoria") || "Outros",
                preco: centavos(pega(l, "preco", "valor")), desc: pega(l, "descricao", "desc"), resumo: pega(l, "resumo"),
                fotos, unica: sim(pega(l, "unica")), vendida: sim(pega(l, "vendida")), esgotada: sim(pega(l, "esgotada")),
                novo: sim(pega(l, "novo")), secreto: sim(pega(l, "secreta")),
            };
        }).filter(Boolean);
        return { loja, produtos, origem: "planilha" };
    }
    const produtos = avaliar(trecho(script, "PRODUTOS", "[", "]"), { ROUPA: ["PP", "P", "M", "G", "GG"], LOJA: loja })
        .map((p) => ({ ...p, fotos: p.fotos || (p.foto ? [p.foto] : []) }));
    return { loja, produtos, origem: "script.js" };
}

// endereço público de uma foto (as do site viram link completo; as do Drive já vêm completas)
const urlDaFoto = (f) => (/^https?:\/\//.test(f) ? f.replace(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{10,}).*/, "lh3.googleusercontent.com/d/$1") : BASE + f);
const arquivoDaFoto = (f) => (/^https?:\/\//.test(f) ? null : path.join(PASTA, f));

module.exports = { carregarCatalogo, urlDaFoto, arquivoDaFoto, BASE, PASTA, RAIZ };
