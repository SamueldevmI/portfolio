"use strict";
/* A Elizabeth atualiza a loja pela planilha do Google: nome, preço, fotos, "vendida"… e o site lê de lá.
   Como ligar (passo a passo pra ela em planilha/index.html):
     1. importar planilha/modelo.csv numa planilha do Google;
     2. Arquivo › Compartilhar › Publicar na Web › a aba das peças › "Valores separados por vírgula (.csv)" › Publicar;
     3. colar o link que aparecer em PLANILHA aqui embaixo e publicar o site.
   Enquanto PLANILHA estiver vazio, a loja usa o catálogo do script.js.
   Teste com um arquivo daqui do site: ?planilha=planilha/modelo.csv (só aceita arquivo do próprio site). */
const PLANILHA = ""; // ex.: "https://docs.google.com/spreadsheets/d/e/2PACX-…/pub?gid=0&single=true&output=csv"

const CATALOGO = (() => {
    const CHAVE_CACHE = "es-planilha-cache";
    const teste = new URLSearchParams(location.search).get("planilha");
    /* link de teste só do próprio site: assim ninguém monta um link que mostra preço falso */
    const url = teste && !/^[a-z]+:|^\/\//i.test(teste) ? teste : PLANILHA;
    if (!url) return { ativo: false };

    /* CSV com aspas, vírgulas e quebras de linha dentro das células */
    function lerCSV(texto) {
        const linhas = [];
        let linha = [], campo = "", aspas = false;
        for (let i = 0; i < texto.length; i++) {
            const c = texto[i];
            if (aspas) {
                if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
                else if (c === '"') aspas = false;
                else campo += c;
            } else if (c === '"') aspas = true;
            else if (c === ",") { linha.push(campo); campo = ""; }
            else if (c === "\n" || c === "\r") {
                if (c === "\r" && texto[i + 1] === "\n") i++;
                linha.push(campo); linhas.push(linha); linha = []; campo = "";
            } else campo += c;
        }
        if (campo || linha.length) { linha.push(campo); linhas.push(linha); }
        return linhas.filter((l) => l.some((x) => x.trim()));
    }
    const chave = (t) => String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "");
    const sim = (t) => /^(s|sim|x|yes|true|1|✓|✔)$/i.test(String(t || "").trim());
    const lista = (t, sep = /[;\n]+/) => String(t || "").split(sep).map((x) => x.trim()).filter(Boolean);
    function centavos(t) {
        const limpo = String(t || "").replace(/[^\d,.]/g, "");
        if (!limpo) return null;
        const numero = limpo.includes(",") ? Number(limpo.replace(/\./g, "").replace(",", ".")) : Number(limpo);
        return Number.isFinite(numero) ? Math.round(numero * 100) : null;
    }
    /* link de compartilhar do Google Drive vira link direto da imagem */
    function foto(link) {
        const drive = link.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{10,})/);
        return drive ? `https://lh3.googleusercontent.com/d/${drive[1]}` : link;
    }
    const VIBES = { vitoriana: "vitoriana", tradgoth: "tradgoth", trad: "tradgoth", bruxinha: "bruxinha", bruxa: "bruxinha", pastelgoth: "pastel", pastel: "pastel" };
    const TONS = ["l", "r", "m", "c"];
    const slug = (t) => chave(t).slice(0, 30) || "peca";

    function montar(texto) {
        const [cabeca, ...linhas] = lerCSV(texto);
        if (!cabeca || !linhas.length) return null;
        const col = Object.fromEntries(cabeca.map((nome, i) => [chave(nome), i]));
        const pega = (l, ...nomes) => { for (const n of nomes) if (col[n] !== undefined) return (l[col[n]] || "").trim(); return ""; };
        const usados = new Set();
        const pecas = linhas.map((l, i) => {
            const nome = pega(l, "nome", "peca");
            if (!nome) return null;
            let id = pega(l, "id", "codigo").replace(/[^\w-]/g, "") || slug(nome); // código da planilha fica como está (favoritos e sacolas guardam ele)
            while (usados.has(id)) id += "-" + (i + 1);
            usados.add(id);
            const fotos = lista(pega(l, "fotos", "foto", "imagens", "imagem"), /[\s;]+/).filter((x) => /^https?:\/\/|^fotos\//i.test(x)).map(foto);
            const desenho = pega(l, "ilustracao", "desenho");
            const tamanhos = lista(pega(l, "tamanhos", "tamanho"), /[,;/]+/);
            const p = {
                id, nome, cat: pega(l, "categoria", "cat") || "Outros",
                preco: centavos(pega(l, "preco", "valor")),
                tam: tamanhos.length && !/^(unico|u)$/i.test(chave(tamanhos[0])) ? tamanhos : null,
                arte: ARTE[desenho] ? desenho : (ARTE[id] ? id : "caixa"), tom: TONS[i % TONS.length],
                alt: pega(l, "descricaodafoto", "alt") || nome,
                resumo: pega(l, "resumo", "subtitulo"),
                desc: pega(l, "descricao", "desc"),
                itens: lista(pega(l, "detalhes", "itens")),
                busca: pega(l, "busca", "palavraschave"),
                unica: sim(pega(l, "unica", "pecaunica")), vendida: sim(pega(l, "vendida")), novo: sim(pega(l, "novo", "novidade")),
                secreto: sim(pega(l, "secreta", "dropsecreto")),
            };
            if (fotos.length) { p.fotos = fotos; p.foto = fotos[0]; }
            p.estilos = [...new Set(lista(pega(l, "vibes", "vibe", "estilos"), /[,;/]+/).map((v) => VIBES[chave(v)]).filter(Boolean))];
            return p;
        }).filter(Boolean);
        return pecas.length ? pecas : null;
    }

    function aplicar(pecas) {
        const fixas = PRODUTOS.filter((p) => p.id === "caixa"); // a caixa misteriosa continua
        PRODUTOS.splice(0, PRODUTOS.length, ...pecas, ...fixas);
        const cats = [...new Set(pecas.filter((p) => !p.secreto).map((p) => p.cat))];
        CATEGORIAS.splice(0, CATEGORIAS.length, ...cats);
        Object.keys(ESTILOS_DAS_PECAS).forEach((v) => { ESTILOS_DAS_PECAS[v] = pecas.filter((p) => p.estilos.includes(v)).map((p) => p.id); });
        fixas.forEach((p) => { p.estilos = []; });
        /* looks com peça que não existe mais (ou vendida) saem */
        for (let i = LOOKS.length - 1; i >= 0; i--) if (!LOOKS[i].itens.every((it) => produto(it.id) && disponivel(produto(it.id)))) LOOKS.splice(i, 1);
        sacola = sacola.filter(itemValido);
        if (filtro.cat !== "todos" && filtro.cat !== "favoritos" && !CATEGORIAS.includes(filtro.cat)) filtro.cat = "todos";
        renderChips(); renderGrade(); renderLooks(); renderSacola();
        document.querySelector(".looks")?.toggleAttribute("hidden", !LOOKS.length);
        document.dispatchEvent(new CustomEvent("catalogo:atualizado"));
    }

    /* abre rápido com a última planilha guardada e depois busca a versão nova */
    try {
        const cache = JSON.parse(localStorage.getItem(CHAVE_CACHE) || "null");
        if (cache && cache.url === url) { const p = montar(cache.texto); if (p) aplicar(p); }
    } catch (erro) { /* sem cache */ }
    fetch(url + (url.includes("?") ? "&" : "?") + "v=" + Date.now(), { cache: "no-store" })
        .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
        .then((texto) => {
            const pecas = montar(texto);
            if (!pecas) return;
            aplicar(pecas);
            try { localStorage.setItem(CHAVE_CACHE, JSON.stringify({ url, texto })); } catch (erro) { /* sem espaço */ }
        })
        .catch(() => { /* sem internet ou planilha fora do ar: fica o que já estava */ });
    return { ativo: true, montar };
})();
