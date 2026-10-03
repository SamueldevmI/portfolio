/* Imagem vertical (1080 × 1920) da prévia do site, pro Status do WhatsApp e pros stories:
   "Fiz uma prévia do site da Barbearia do Zé" + o celular com o mini-site, desenhados num canvas.
   Usa as cores e textos de cada ramo da previa-celular.js. Uso: ImagemPrevia.compartilhar("Barbearia do Zé", "barbearia"). */
window.ImagemPrevia = (function () {
    "use strict";
    const L = 1080, A = 1920;
    const FONTE = '"Space Grotesk", Arial, sans-serif';

    function arredondado(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    }
    /* quebra o texto em linhas que cabem na largura; devolve as linhas */
    function linhas(ctx, texto, largura, max) {
        const palavras = String(texto).split(/\s+/), saida = [];
        let atual = "";
        for (const p of palavras) {
            const teste = atual ? atual + " " + p : p;
            if (ctx.measureText(teste).width > largura && atual) { saida.push(atual); atual = p; } else atual = teste;
        }
        if (atual) saida.push(atual);
        if (saida.length > max) { saida.length = max; saida[max - 1] = saida[max - 1].replace(/\s*\S*$/, "") + "…"; }
        return saida;
    }

    async function desenhar(nome, ramoServico) {
        const S = window.SERVICOS, P = window.PreviaCelular;
        const rs = S.RAMOS[ramoServico] || S.RAMOS.pizzaria;
        const r = P.RAMOS[rs.previa];
        try { await Promise.all(["700 80px", "600 40px", "500 32px"].map((f) => document.fonts.load(`${f} "Space Grotesk"`))); } catch (e) { /* fonte do sistema serve */ }
        const c = document.createElement("canvas"); c.width = L; c.height = A;
        const ctx = c.getContext("2d");

        // fundo: carvão com brilho vermelho e um toque da cor do ramo
        ctx.fillStyle = "#121212"; ctx.fillRect(0, 0, L, A);
        let g = ctx.createRadialGradient(L * .5, 120, 0, L * .5, 120, 900); g.addColorStop(0, "rgba(255,42,61,.38)"); g.addColorStop(1, "rgba(255,42,61,0)");
        ctx.fillStyle = g; ctx.fillRect(0, 0, L, A);
        g = ctx.createRadialGradient(L * .5, 1250, 0, L * .5, 1250, 700); g.addColorStop(0, r.cor + "55"); g.addColorStop(1, r.cor + "00");
        ctx.fillStyle = g; ctx.fillRect(0, 0, L, A);

        // título
        ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "rgba(255,255,255,.82)"; ctx.font = `500 46px ${FONTE}`;
        ctx.fillText("Fiz uma prévia do site da", L / 2, 190);
        ctx.fillStyle = "#ff2a3d"; ctx.font = `700 92px ${FONTE}`;
        const tit = linhas(ctx, nome, L - 140, 2);
        tit.forEach((t, i) => ctx.fillText(t, L / 2, 300 + i * 98));
        const topoCelular = 300 + tit.length * 98 + 20;

        // celular
        const cw = 640, ch = Math.min(1180, A - topoCelular - 240), cx = (L - cw) / 2, cy = topoCelular;
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,.7)"; ctx.shadowBlur = 80; ctx.shadowOffsetY = 30;
        g = ctx.createLinearGradient(cx, cy, cx + cw, cy + ch); g.addColorStop(0, "#6b6b72"); g.addColorStop(.3, "#2a2a2f"); g.addColorStop(.55, "#48484f"); g.addColorStop(1, "#1d1d21");
        ctx.fillStyle = g; arredondado(ctx, cx, cy, cw, ch, 96); ctx.fill();
        ctx.restore();
        const sx = cx + 18, sy = cy + 18, sw = cw - 36, sh = ch - 36;
        ctx.save();
        arredondado(ctx, sx, sy, sw, sh, 80); ctx.clip();
        ctx.fillStyle = r.fundo; ctx.fillRect(sx, sy, sw, sh);
        // barra de status e ilha
        ctx.fillStyle = r.texto; ctx.font = `700 30px ${FONTE}`; ctx.textAlign = "left"; ctx.fillText("9:41", sx + 56, sy + 62);
        ctx.fillStyle = "#000"; arredondado(ctx, sx + sw / 2 - 90, sy + 22, 180, 52, 26); ctx.fill();
        ctx.strokeStyle = r.texto; ctx.lineWidth = 3; arredondado(ctx, sx + sw - 122, sy + 40, 58, 28, 8); ctx.stroke();
        ctx.fillStyle = r.texto; arredondado(ctx, sx + sw - 117, sy + 45, 40, 18, 4); ctx.fill();
        // endereço
        ctx.fillStyle = r.texto + "18"; arredondado(ctx, sx + 30, sy + 100, sw - 60, 64, 22); ctx.fill();
        ctx.fillStyle = r.suave; ctx.font = `500 28px ${FONTE}`; ctx.textAlign = "center";
        ctx.fillText("🔒 " + linhas(ctx, P.endereco(nome), sw - 140, 1)[0].replace(/(.{30}).+/, "$1…"), sx + sw / 2, sy + 142);
        // topo do site
        let y = sy + 200;
        ctx.fillStyle = r.cor; arredondado(ctx, sx + 32, y, 66, 66, 18); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = `800 26px ${FONTE}`; ctx.fillText(P.iniciais(nome), sx + 65, y + 43);
        ctx.fillStyle = r.texto; ctx.font = `700 34px ${FONTE}`; ctx.textAlign = "left";
        ctx.fillText(linhas(ctx, nome, sw - 200, 1)[0], sx + 116, y + 45);
        // capa com o desenho do ramo
        y += 96;
        g = ctx.createLinearGradient(sx, y, sx + sw, y + 220); g.addColorStop(0, r.cor); g.addColorStop(1, r.cor + "b0");
        ctx.fillStyle = g; arredondado(ctx, sx + 30, y, sw - 60, 220, 40); ctx.fill();
        ctx.font = `128px ${FONTE}`; ctx.textAlign = "center"; ctx.fillText(r.emoji, sx + sw / 2, y + 160);
        ctx.fillStyle = "rgba(0,0,0,.5)"; arredondado(ctx, sx + sw - 200, y + 22, 150, 52, 26); ctx.fill();
        ctx.fillStyle = "#ffd54a"; ctx.font = `700 28px ${FONTE}`; ctx.fillText("★ 4,9", sx + sw - 125, y + 58);
        // chamada, subtítulo e botão
        y += 280;
        ctx.textAlign = "left"; ctx.fillStyle = r.texto; ctx.font = `700 52px ${FONTE}`;
        linhas(ctx, r.chamada, sw - 80, 2).forEach((t, i) => ctx.fillText(t, sx + 40, y + i * 58));
        y += 58 * Math.min(2, linhas(ctx, r.chamada, sw - 80, 2).length) + 6;
        ctx.fillStyle = r.suave; ctx.font = `500 28px ${FONTE}`; ctx.fillText(linhas(ctx, r.sub, sw - 80, 1)[0], sx + 40, y);
        y += 36;
        ctx.fillStyle = r.cor; arredondado(ctx, sx + 40, y, sw - 80, 88, 26); ctx.fill();
        ctx.fillStyle = r.fundo; ctx.font = `700 32px ${FONTE}`; ctx.textAlign = "center"; ctx.fillText(r.botao, sx + sw / 2, y + 56);
        // itens
        y += 130;
        ctx.textAlign = "left"; ctx.fillStyle = r.cor; ctx.font = `700 24px ${FONTE}`; ctx.fillText(r.secao.toUpperCase(), sx + 40, y);
        y += 22;
        for (const [n, v] of r.itens) {
            if (y + 84 > sy + sh - 150) break; // não passa por baixo do botão do WhatsApp
            ctx.fillStyle = r.texto + "12"; arredondado(ctx, sx + 40, y, sw - 80, 84, 22); ctx.fill();
            ctx.fillStyle = r.texto; ctx.font = `600 30px ${FONTE}`; ctx.textAlign = "left"; ctx.fillText(n, sx + 68, y + 53);
            ctx.fillStyle = r.cor; ctx.font = `700 30px ${FONTE}`; ctx.textAlign = "right"; ctx.fillText(v, sx + sw - 68, y + 53);
            y += 100;
        }
        // botão do WhatsApp e barrinha
        ctx.fillStyle = "#25d366"; ctx.beginPath(); ctx.arc(sx + sw - 90, sy + sh - 100, 48, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = `44px ${FONTE}`; ctx.textAlign = "center"; ctx.fillText("💬", sx + sw - 90, sy + sh - 85);
        ctx.fillStyle = r.texto + "88"; arredondado(ctx, sx + sw / 2 - 110, sy + sh - 30, 220, 9, 5); ctx.fill();
        ctx.restore();

        // rodapé
        ctx.textAlign = "center";
        ctx.fillStyle = "#ffffff"; ctx.font = `700 44px ${FONTE}`; ctx.fillText("Quer ver funcionando? Me chama 👆", L / 2, A - 130);
        ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.font = `500 32px ${FONTE}`; ctx.fillText("Samuel Mickael · sites em Campo Grande - MS", L / 2, A - 72);
        return new Promise((ok) => c.toBlob(ok, "image/png"));
    }

    /* no celular abre o "compartilhar" (dá pra mandar direto pro Status); no computador baixa o arquivo */
    async function compartilhar(nome, ramo, texto) {
        const blob = await desenhar(nome, ramo);
        const arquivo = new File([blob], `previa-${(window.SERVICOS.slug(nome) || "site")}.png`, { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [arquivo] })) {
            try { await navigator.share({ files: [arquivo], text: texto || "" }); return "compartilhou"; } catch (e) { if (e.name === "AbortError") return "cancelou"; }
        }
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob); a.download = arquivo.name; a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        return "baixou";
    }
    return { desenhar, compartilhar };
})();
