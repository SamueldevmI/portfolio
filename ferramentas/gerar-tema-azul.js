/* Gera os temas de cor a partir do style.css (o tema vermelho), trocando só as cores:
     style-azul.css     azul elétrico e carvão azulado
     style-cerrado.css  Cerrado de Campo Grande: terra vermelha, ipê-amarelo, ipê-roxo e marrom de chão
     style-neon.css     neon de lanchonete de madrugada: rosa, verde-limão e laranja num preto azulado
     style-gibi85.css   gibi de banca de 1985: magenta, ciano desbotado, amarelo-ovo e papel amarelado
   O que muda em cada um: vermelho vivo, vermelho escuro, cinza-carvão, cinza claro, o amarelo e o papel
   creme do gibi, e o azul-claro das sombras "glitch". Branco, preto e o verde do WhatsApp ficam iguais,
   e também qualquer linha marcada com o comentário "manter-cor".

   Uso: node ferramentas/gerar-tema-azul.js           (grava todos os temas)
        node ferramentas/gerar-tema-azul.js --conferir (só confere se estão em dia; usado no CI)
   Sempre que mexer no style.css, rode de novo. O mobile.js usa trocarCor() pra desenhar o card de
   compartilhar nas cores do tema azul. */
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

// Em que "papel" a cor está no tema vermelho
function tipoDaCor(h, s, l) {
    if (h >= 315 && h < 345 && s > 0.6 && l >= 0.42) return "magenta";       // o magenta dos detalhes (--pink)
    if ((h >= 330 || h <= 20) && s > 0.25) return l < 0.42 ? "sangue" : "neon";
    if (s < 0.15 && l > 0.02 && l < 0.97) return l <= 0.3 ? "carvao" : "cinza";
    if (h >= 45 && h <= 60 && s > 0.6 && l > 0.45 && l < 0.8) return "amarelo";
    if (h >= 30 && h <= 55 && s > 0.2 && l >= 0.8 && l < 0.97) return "papel";
    if (h >= 180 && h <= 215 && s > 0.5) return "frio";
    return null;
}

/* Cada tema novo: pra cada tipo de cor, a cor nova em HSL (h em graus, s e l de 0 a 1).
   As claras ficam claras e as escuras escuras, pra o contraste do texto continuar valendo. */
const TEMAS = {
    cerrado: {
        neon: (s, l) => [14, Math.min(s, 0.74), Math.max(l, 0.56)],     // terra vermelha
        sangue: (s, l) => [14, Math.min(s, 0.62), l],
        carvao: (s, l) => [22, 0.3, l * 1.05],                          // chão de terra escuro
        cinza: (s, l) => [30, 0.14, l],
        amarelo: () => [44, 0.92, 0.56],                                // ipê-amarelo
        papel: () => [38, 0.62, 0.88],
        frio: () => [285, 0.4, 0.55],                                   // ipê-roxo
        magenta: (s, l) => [285, 0.45, Math.max(l, 0.62)],              // ipê-roxo nos detalhes
    },
    neon: {
        neon: (s, l) => [332, 1, Math.max(l, 0.59)],                    // rosa neon
        sangue: (s, l) => [332, Math.min(s, 0.8), l],
        carvao: (s, l) => [245, 0.45, l * 0.95],                        // preto azulado de madrugada
        cinza: (s, l) => [245, 0.18, l],
        amarelo: () => [84, 1, 0.62],                                   // verde-limão
        papel: () => [255, 0.6, 0.95],
        frio: () => [28, 1, 0.56],                                      // laranja de placa
        magenta: (s, l) => [28, 1, Math.max(l, 0.58)],                  // laranja nos detalhes
    },
    gibi85: {
        neon: (s, l) => [335, 0.52, Math.max(Math.min(l, 0.66), 0.6)],  // magenta de impressão velha
        sangue: (s, l) => [335, 0.45, l],
        carvao: (s, l) => [28, 0.12, l * 1.1],                          // preto lavado, puxando pro marrom
        cinza: (s, l) => [35, 0.12, l],
        amarelo: () => [44, 0.88, 0.57],                                // amarelo-ovo
        papel: () => [40, 0.55, 0.82],                                  // papel amarelado
        frio: () => [191, 0.4, 0.51],                                   // ciano desbotado
        magenta: (s, l) => [191, 0.45, Math.max(l, 0.55)],              // ciano nos detalhes
    },
};
function trocadorDo(tema) {
    const regras = TEMAS[tema];
    return (r, g, b) => {
        const [h, s, l] = paraHsl(r, g, b);
        const tipo = tipoDaCor(h, s, l);
        return tipo && regras[tipo] ? paraRgb(...regras[tipo](s, l)) : [r, g, b];
    };
}

// [r, g, b] -> [r, g, b] no tema azul
function trocarCor(r, g, b) {
    const [h, s, l] = paraHsl(r, g, b);
    const vermelho = (h >= 330 || h <= 20) && s > 0.25;
    if (vermelho) {
        if (l < 0.42) return paraRgb(221, Math.min(s, 0.78), l);             // sangue -> azul-sangue
        return paraRgb(217, s, Math.max(l, 0.59));                           // neon -> azul elétrico
    }
    if (s < 0.15 && l > 0.02 && l < 0.97) {
        if (l <= 0.3) return paraRgb(221, 0.42, l * 1.1);                    // carvão -> azul-carvão
        return paraRgb(221, 0.2, l);                                         // cinza médio/claro -> cinza-azulado
    }
    return [r, g, b];
}

const hex2 = (n) => n.toString(16).padStart(2, "0");
// Linha com o comentário "manter-cor" fica como está (ex.: o botão de tema, que mostra a cor do outro tema)
function trocarNoCss(css, troca = trocarCor) {
    return css.split("\n").map((linha) => (linha.includes("manter-cor") ? linha : trocarNaLinha(linha, troca))).join("\n");
}
function trocarNaLinha(css, trocarCor) {
    return css
        .replace(/#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/gi, (tudo, h) => {
            if (h.length <= 4) h = [...h].map((c) => c + c).join("");
            const rgb = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
            const novo = trocarCor(...rgb);
            return "#" + novo.map(hex2).join("") + (h.length === 8 ? h.slice(6) : "");
        })
        .replace(/%23([0-9a-f]{6})\b/gi, (tudo, h) => "%23" + trocarCor(...[0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))).map(hex2).join(""))
        .replace(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*([,)])/gi, (tudo, r, g, b, fim) => {
            const [nr, ng, nb] = trocarCor(+r, +g, +b);
            return tudo.replace(/\(.*$/, "") + "(" + nr + "," + ng + "," + nb + fim;
        })
        .replace(/(--[\w-]*rgb\s*:\s*)(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/gi, (tudo, ini, r, g, b) => ini + trocarCor(+r, +g, +b).join(", "));
}

if (require.main === module) {
    const raiz = path.join(__dirname, "..");
    const origem = fs.readFileSync(path.join(raiz, "style.css"), "utf8");
    const conferir = process.argv.includes("--conferir");
    let erro = false;
    const saidas = { azul: trocarNoCss(origem), ...Object.fromEntries(Object.keys(TEMAS).map((t) => [t, trocarNoCss(origem, trocadorDo(t))])) };
    for (const [tema, css] of Object.entries(saidas)) {
        const nome = `style-${tema}.css`, destino = path.join(raiz, nome);
        const saida = `/* GERADO a partir do style.css por ferramentas/gerar-tema-azul.js — não edite à mão. */\n${css}`;
        if (conferir) {
            const atual = fs.existsSync(destino) ? fs.readFileSync(destino, "utf8") : "";
            if (atual !== saida) { console.error(`${nome} desatualizado: rode node ferramentas/gerar-tema-azul.js`); erro = true; }
            else console.log(`${nome} em dia`);
        } else {
            fs.writeFileSync(destino, saida);
            console.log(`${nome} gerado`);
        }
    }
    if (erro) process.exit(1);
}

module.exports = { trocarCor, trocadorDo, TEMAS };
