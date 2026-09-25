/* Gera o style-azul.css a partir do style.css, trocando só as cores:
   - vermelho vivo (neon)   -> verde-água/ciano, o destaque do tema azul antigo (#5df4d0)
   - vermelho escuro (sangue) -> azul
   - cinza-carvão            -> azul-marinho (#070b16 / #0f172b / #141f37)
   - cinza claro             -> cinza-azulado
   Branco, preto e as outras cores (verde do WhatsApp etc.) ficam iguais, e também qualquer linha
   marcada com o comentário "manter-cor".

   Uso: node ferramentas/gerar-tema-azul.js           (grava o style-azul.css)
        node ferramentas/gerar-tema-azul.js --conferir (só confere se está em dia; usado no CI)
   Sempre que mexer no style.css, rode de novo. O mobile.js usa trocarCor() pra desenhar o card de
   compartilhar nas cores do tema. */
"use strict";
const fs = require("fs");
const path = require("path");

function paraHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
    if (max === min) return [0, 0, l];
    const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h * 60, s, l];
}
function paraRgb(h, s, l) {
    const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [f(0), f(8), f(4)].map((v) => Math.round(v * 255));
}

// [r, g, b] -> [r, g, b] no tema azul
function trocarCor(r, g, b) {
    const [h, s, l] = paraHsl(r, g, b);
    const vermelho = (h >= 330 || h <= 20) && s > 0.25;
    if (vermelho) {
        if (l < 0.42) return paraRgb(218, Math.min(s, 0.7), l);              // sangue -> azul
        return paraRgb(166, Math.min(s, 0.87), Math.max(l, 0.6));            // neon -> ciano
    }
    if (s < 0.15 && l > 0.02 && l < 0.97) {
        if (l <= 0.5) return paraRgb(222, 0.45, l * 0.92);                   // carvão -> marinho
        return paraRgb(222, 0.25, l);                                        // cinza claro -> cinza-azulado
    }
    return [r, g, b];
}

const hex2 = (n) => n.toString(16).padStart(2, "0");
// Linha com o comentário "manter-cor" fica como está (ex.: o botão de tema, que mostra a cor do outro tema)
function trocarNoCss(css) {
    return css.split("\n").map((linha) => (linha.includes("manter-cor") ? linha : trocarNaLinha(linha))).join("\n");
}
function trocarNaLinha(css) {
    return css
        .replace(/#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/gi, (tudo, h) => {
            if (h.length <= 4) h = [...h].map((c) => c + c).join("");
            const rgb = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
            const novo = trocarCor(...rgb);
            return "#" + novo.map(hex2).join("") + (h.length === 8 ? h.slice(6) : "");
        })
        .replace(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*([,)])/gi, (tudo, r, g, b, fim) => {
            const [nr, ng, nb] = trocarCor(+r, +g, +b);
            return tudo.replace(/\(.*$/, "") + "(" + nr + "," + ng + "," + nb + fim;
        })
        .replace(/(--[\w-]*rgb\s*:\s*)(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/gi, (tudo, ini, r, g, b) => ini + trocarCor(+r, +g, +b).join(", "));
}

if (require.main === module) {
    const raiz = path.join(__dirname, "..");
    const origem = fs.readFileSync(path.join(raiz, "style.css"), "utf8");
    const saida = "/* GERADO a partir do style.css por ferramentas/gerar-tema-azul.js — não edite à mão. */\n" + trocarNoCss(origem);
    const destino = path.join(raiz, "style-azul.css");
    if (process.argv.includes("--conferir")) {
        const atual = fs.existsSync(destino) ? fs.readFileSync(destino, "utf8") : "";
        if (atual !== saida) { console.error("style-azul.css desatualizado: rode node ferramentas/gerar-tema-azul.js"); process.exit(1); }
        console.log("style-azul.css em dia");
    } else {
        fs.writeFileSync(destino, saida);
        console.log("style-azul.css gerado");
    }
}
module.exports = { trocarCor, trocarNoCss };
