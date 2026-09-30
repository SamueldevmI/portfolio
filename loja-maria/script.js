"use strict";

/* ===== Configuração da loja: troque aqui quando a Maria mandar os dados dela ===== */
const LOJA = {
    nome: "Eclipse Studio",
    whatsapp: "", // só números: 55 + DDD + número. Vazio = o WhatsApp abre pra escolher o contato
    demo: true,   // true = a mensagem avisa que é um pedido de teste
};

/* Prévia com outro nome: loja-maria/?nome=Outro Nome */
const NOME_VISITANTE = (new URLSearchParams(location.search).get("nome") || "").trim().slice(0, 40);
if (NOME_VISITANTE) {
    LOJA.nome = NOME_VISITANTE;
    document.title = NOME_VISITANTE + " — Moda alternativa";
    document.querySelector(".logo")?.setAttribute("aria-label", NOME_VISITANTE + ", início");
}

/* ===== Ilustrações das peças (SVG 100×100). Ficam até chegarem as fotos de verdade =====
   Classes de preenchimento: l lilás, r rosa, m menta, c creme, p preto, n sem preenchimento.
   g = traço grosso, f = traço fino, s = sem contorno. */
const ESTRELA = "M0 -10C1 -3 3 -1 10 0C3 1 1 3 0 10C-1 3 -3 1 -10 0C-3 -1 -1 -3 0 -10Z";
const CORACAO = "M0 7C-12 -1 -7 -11 0 -5C7 -11 12 -1 0 7Z";
const cruz = (x, y, cls) => `<path class="${cls}" d="M${x - 3} ${y}h6v8h8v6h-8v16h-6v-16h-8v-6h8z"/>`;
const brilho = (x, y, s, cls = "c s") => `<path class="${cls}" transform="translate(${x} ${y}) scale(${s})" d="${ESTRELA}"/>`;

/* bolinhas de renda ao longo de uma curva (quadrática p0 → p1 → p2) */
function renda(p0, p1, p2, n, r, cls) {
    let s = "";
    for (let k = 0; k < n; k++) {
        const t = n === 1 ? .5 : k / (n - 1);
        const a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t;
        const x = a * p0[0] + b * p1[0] + c * p2[0];
        const y = a * p0[1] + b * p1[1] + c * p2[1];
        s += `<circle class="${cls}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}"/>`;
    }
    return s;
}
const reta = (x0, x1, y, n, r, cls) => renda([x0, y], [(x0 + x1) / 2, y], [x1, y], n, r, cls);

const morcego = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">
    <path class="p" d="M0 -4L-4 -12L-6 -3C-12 -9 -22 -8 -26 -2C-21 -2 -19 1 -19 5C-15 2 -11 3 -9 7C-6 3 -3 4 0 8C3 4 6 3 9 7C11 3 15 2 19 5C19 1 21 -2 26 -2C22 -8 12 -9 6 -3L4 -12Z"/>
    <circle class="r s" cx="-2.6" cy="-1" r="1.5"/><circle class="r s" cx="2.6" cy="-1" r="1.5"/></g>`;

const ARTE = {
    choker: renda([16, 36], [50, 70], [84, 36], 11, 3.6, "c")
        + `<path class="p" d="M16 28Q50 62 84 28L84 36Q50 70 16 36Z"/>`
        + `<circle class="n" cx="50" cy="56.5" r="3"/>`
        + `<path class="l" d="M53 60.5A10 10 0 1 0 53 79.5A12 12 0 0 1 53 60.5Z"/>`
        + brilho(61, 64, .45, "r s") + brilho(79, 78, .6),
    colarCruz: `<path class="n f" d="M18 14Q50 68 82 14" stroke-dasharray="0 5" stroke-width="4"/>`
        + `<circle class="n" cx="50" cy="44" r="3"/>`
        + `<path class="l" d="M47 47h6v11h10v7h-10v20l-3 5l-3 -5v-20h-10v-7h10z"/>`
        + `<circle class="r" cx="50" cy="61.5" r="3.2"/>` + brilho(70, 56, .6) + brilho(28, 70, .4, "m s"),
    brincoMorcego: `<path class="n" d="M28 52V38a6 6 0 0 1 12 0"/><path class="n" d="M72 52V38a6 6 0 0 1 12 0"/>`
        + morcego(28, 60, .72) + morcego(72, 60, .72) + brilho(50, 30, .5, "l s"),
    brincoCruz: `<circle class="n g" cx="32" cy="30" r="8"/><circle class="n g" cx="68" cy="30" r="8"/>`
        + `<path class="n" d="M32 38v5M68 38v5"/>`
        + cruz(32, 43, "r") + cruz(68, 43, "m")
        + `<circle class="m" cx="32" cy="54" r="2.3"/><circle class="r" cx="68" cy="54" r="2.3"/>` + brilho(50, 78, .55),
    anel: `<circle class="n g" cx="50" cy="62" r="22"/><circle class="n fl" cx="50" cy="62" r="22"/>`
        + `<path class="n" d="M36 27l-3 -5M43 23.5l-1 -6M50 22.5v-6M57 23.5l1 -6M64 27l3 -5"/>`
        + `<path class="c" d="M28 36Q50 18 72 36Q50 54 28 36Z"/>`
        + `<circle class="m" cx="50" cy="36" r="8"/><circle class="p" cx="50" cy="36" r="3.5"/><circle class="c s" cx="53" cy="33" r="1.6"/>`
        + brilho(80, 20, .6) + brilho(20, 78, .45, "r s"),

    espartilho: renda([30, 18], [50, 26], [70, 18], 8, 3.2, "c")
        + `<path class="r" d="M30 18Q50 26 70 18Q64 38 66 50Q70 66 74 84Q50 92 26 84Q30 66 34 50Q36 38 30 18Z"/>`
        + `<path class="n f" d="M39 24Q43 52 36 85M61 24Q57 52 64 85"/>`
        + `<path class="n f" d="M46 29L54 35L46 41L54 47L46 53L54 59L46 65L54 71L46 77L54 83M54 29L46 35L54 41L46 47L54 53L46 59L54 65L46 71L54 77L46 83"/>`
        + `<path class="p" d="M50 24l-8 -5v10zM50 24l8 -5v10z"/><circle class="p" cx="50" cy="24" r="2.4"/>`,
    saia: reta(12, 88, 80, 9, 4.4, "p") + reta(16, 84, 74, 8, 4.6, "c")
        + `<path class="l" d="M36 26H64L84 74H16Z"/>`
        + `<path class="n f" d="M44 26L34 74M50 26V74M56 26L66 74"/>`
        + `<rect class="p" x="35" y="18" width="30" height="9" rx="2"/>` + cruz(50, 45, "p"),
    vestido: `<circle class="l" cx="32" cy="31" r="9"/><circle class="l" cx="68" cy="31" r="9"/>`
        + reta(18, 82, 84, 8, 4.4, "c")
        + `<path class="l" d="M38 46H62L82 84H18Z"/><path class="l" d="M36 22Q50 28 64 22L62 47H38Z"/>`
        + `<path class="c" d="M39 22.5Q42 34 50 27Q58 34 61 22.5Q50 28 39 22.5Z"/>`
        + `<path class="p" d="M50 46l-9 -5v10zM50 46l9 -5v10z"/><circle class="p" cx="50" cy="46" r="2.6"/>`
        + `<path class="n f" d="M40 52L30 84M60 52L70 84"/>`,
    blusa: `<ellipse class="c" cx="27" cy="42" rx="11" ry="15"/><ellipse class="c" cx="73" cy="42" rx="11" ry="15"/>`
        + reta(19, 35, 58, 3, 3, "l") + reta(65, 81, 58, 3, 3, "l")
        + `<path class="c" d="M34 24L66 24L70 84H30Z"/>`
        + reta(38, 62, 23, 5, 3.4, "l")
        + `<rect class="p" x="40" y="14" width="20" height="8" rx="2"/>`
        + `<circle class="p" cx="50" cy="36" r="1.9"/><circle class="p" cx="50" cy="47" r="1.9"/><circle class="p" cx="50" cy="58" r="1.9"/><circle class="p" cx="50" cy="69" r="1.9"/>`
        + `<path class="r" transform="translate(50 18) scale(.45)" d="${CORACAO}"/>`,

    meiaListrada: reta(38, 62, 11, 4, 3.5, "l")
        + `<path class="c" d="M38 10H62V62Q62 70 70 74L80 78Q88 82 84 90H44Q36 90 38 80Z"/>`
        + `<path class="m s" d="M38.4 16h23.2v6h-23.2zM38.4 28h23.2v6h-23.2zM38.4 40h23.2v6h-23.2zM38.4 52h23.2v6h-23.2z"/>`
        + `<path class="n" d="M38 10H62V62Q62 70 70 74L80 78Q88 82 84 90H44Q36 90 38 80Z"/>`
        + brilho(22, 30, .55, "r s"),
    soquete: `<path class="c" d="M38 36H62V62Q62 70 70 74L80 78Q88 82 84 90H44Q36 90 38 80Z"/>`
        + reta(34, 66, 38, 5, 5, "r") + reta(36, 64, 32, 5, 4.4, "r")
        + `<path class="p" transform="translate(50 60) scale(.55)" d="${CORACAO}"/>` + brilho(76, 40, .55, "l s"),
    maryJane: `<path class="p" d="M10 72H90V84Q90 88 86 88H14Q10 88 10 84Z"/>`
        + `<path class="r" d="M14 72C13 60 17 52 25 49L31 49C36 57 50 59 58 53C73 53 87 60 89 72Z"/>`
        + `<path class="n f" d="M13 80H87" stroke-dasharray="3 3"/>`
        + `<path class="n f" d="M31 49C36 57 50 59 58 53" stroke-width="3.5"/>`
        + `<path class="n g" d="M29 54Q42 36 56 46"/>`
        + `<rect class="o" x="51" y="41" width="8" height="8" rx="1.5"/>`
        + `<path class="p" d="M76 61l-7 -4v8zM76 61l7 -4v8z"/><circle class="p" cx="76" cy="61" r="2"/>`
        + brilho(80, 30, .6, "o s") + brilho(22, 28, .4),
    tiara: `<ellipse class="m" cx="39" cy="36" rx="7" ry="3.5" transform="rotate(-35 39 36)"/><ellipse class="m" cx="61" cy="36" rx="7" ry="3.5" transform="rotate(35 61 36)"/>`
        + `<path class="n g" d="M14 76Q50 8 86 76"/><path class="n fl" d="M14 76Q50 8 86 76"/>`
        + `<circle class="c" cx="20" cy="64" r="3"/><circle class="c" cx="80" cy="64" r="3"/>`
        + [[32, 51, 8.5], [68, 51, 8.5], [50, 41, 11]].map(([x, y, r]) => `<circle class="p" cx="${x}" cy="${y}" r="${r}"/>`
            + `<path class="n f fl" d="M${x - r * .3} ${y}a${r * .3} ${r * .3} 0 1 1 ${r * .3} ${r * .3}M${x - r * .68} ${y + r * .05}a${r * .68} ${r * .62} 0 0 0 ${r * 1.36} 0M${x - r * .5} ${y - r * .45}a${r * .6} ${r * .5} 0 0 1 ${r} 0"/>`).join("")
        + brilho(84, 24, .6, "o s") + brilho(18, 30, .4),
    laco: `<path class="l" d="M47 54L37 84L44 79L48 86L53 56Z"/><path class="l" d="M53 54L63 84L56 79L52 86L47 56Z"/>`
        + `<path class="l" d="M50 48C36 30 16 32 18 48C16 64 36 66 50 52Z"/><path class="l" d="M50 48C64 30 84 32 82 48C84 64 64 66 50 52Z"/>`
        + `<path class="n f" d="M44 46C36 40 28 40 26 48M56 46C64 40 72 40 74 48"/>`
        + `<rect class="p" x="44" y="43" width="12" height="13" rx="4"/>` + brilho(80, 22, .6, "r s"),
    bolsaCaixao: `<path class="n g" d="M40 26Q50 6 60 26"/>`
        + `<path class="p" d="M38 24H62L74 42L64 88H36L26 42Z"/>`
        + `<path class="n f fr" d="M40 29H60L69 42L60 83H40L31 42Z" stroke-dasharray="2.5 2.5"/>`
        + cruz(50, 42, "l") + `<circle class="r" cx="50" cy="51" r="2"/>`,
    sombrinha: reta(14, 86, 50, 9, 4.6, "c")
        + `<path class="l" d="M14 50Q50 6 86 50Z"/>`
        + `<path class="n f" d="M50 17L30 50M50 17V50M50 17L70 50"/>`
        + `<path class="n" d="M50 17V9"/><circle class="p" cx="50" cy="8" r="2.2"/>`
        + `<path class="n g" d="M50 52V82a6 6 0 0 1 -12 0"/>` + brilho(84, 76, .6, "r s") + brilho(18, 22, .45, "m s"),
};

/* peças de bruxinha (referências: bola de cristal, lua, gato preto e as máscaras de morcego dos anos 40) */
Object.assign(ARTE, {
    chapeu: `<ellipse class="p" cx="50" cy="75" rx="40" ry="9"/>`
        + `<path class="p" d="M29 73Q38 52 46 32Q51 17 68 12Q58 24 60 40Q63 56 71 73Z"/>`
        + `<path class="l" d="M31 66Q50 72 69 66L71 73Q50 79 29 73Z"/>`
        + `<rect class="o" x="45" y="66" width="10" height="9" rx="1.5"/><rect class="p s" x="48" y="69" width="4" height="3"/>`
        + brilho(80, 30, .6, "o s") + brilho(22, 40, .45) + brilho(70, 12, .35, "r s"),
    capa: `<path class="p" d="M50 20C40 20 36 25 34 31L15 84Q50 93 85 84L66 31C64 25 60 20 50 20Z"/>`
        + `<path class="l" d="M44 28Q50 33 56 28L63 85Q50 89 37 85Z"/>`
        + `<path class="n fo" d="M45 44Q50 50 55 44"/><path class="o" d="M45 40l3 4l-3 4l-3 -4zM55 40l3 4l-3 4l-3 -4z"/>`
        + brilho(84, 20, .55, "o s"),
    mascara: `<path class="p" d="M50 40C44 33 34 31 26 35C18 39 10 37 5 32C7 43 11 49 16 52C20 50 24 52 26 58C30 54 34 56 36 61C40 57 46 57 50 59C54 57 60 57 64 61C66 56 70 54 74 58C76 52 80 50 84 52C89 49 93 43 95 32C90 37 82 39 74 35C66 31 56 33 50 40Z"/>`
        + `<path class="p" d="M45 40L43 29L50 35L57 29L55 40Z"/>`
        + `<path class="n f fl" d="M26 38L14 46M28 42L22 54M74 38L86 46M72 42L78 54"/>`
        + `<ellipse class="vaz" cx="38" cy="45" rx="7" ry="4.2"/><ellipse class="vaz" cx="62" cy="45" rx="7" ry="4.2"/>`
        + `<path class="n g" d="M86 54L80 90"/><path class="n fo" d="M86 54L80 90"/>`
        + brilho(22, 76, .5, "o s") + brilho(50, 18, .4),
    colarBola: `<path class="n f" d="M18 12Q50 60 82 12" stroke-dasharray="0 5" stroke-width="4"/>`
        + `<path class="o" d="M43 42H57L55 49H45Z"/>`
        + `<circle class="c" cx="50" cy="64" r="15"/>`
        + `<path class="l s" d="M54 55A9 9 0 1 0 54 73A10.5 10.5 0 0 1 54 55Z"/>`
        + `<path class="n f" d="M40 58Q42 53 47 51"/>` + brilho(57, 62, .3, "o s")
        + `<circle class="n" cx="50" cy="64" r="15"/>` + brilho(76, 44, .6, "o s") + brilho(24, 76, .4, "r s"),
});

/* Com foto de verdade, ela entra no lugar da ilustração: ponha o arquivo em loja-maria/fotos/
   e escreva na peça foto: "fotos/nome-do-arquivo.webp" (e, se quiser, pos: "50% 30%" pra enquadrar) */
const arte = (p, classe = "") => p.foto
    ? `<img class="foto ${classe}" src="${p.foto}" alt="" width="400" height="400" loading="lazy" decoding="async" style="object-position:${p.pos || "50% 50%"}">`
    : `<svg class="arte ${classe}" viewBox="0 0 100 100" aria-hidden="true" focusable="false">${ARTE[p.arte]}</svg>`;

/* ===== Catálogo (preço em centavos). Tudo provisório até a Maria mandar as peças dela ===== */
const ROUPA = ["PP", "P", "M", "G", "GG"];
const CALCADO = ["34", "35", "36", "37", "38", "39", "40"];
const CATEGORIAS = ["Roupas", "Joias", "Meias e calçados", "Acessórios"];

const PRODUTOS = [
    {
        id: "espartilho", nome: "Espartilho Rosa Seca", cat: "Roupas", preco: 18990, tam: ROUPA, arte: "espartilho", tom: "l", novo: true,
        alt: "Ilustração de espartilho rosa com amarração no meio e renda no decote",
        resumo: "Amarração · renda no decote",
        desc: "Espartilho vitoriano em rosa seca, com amarração na frente que ajusta a cintura e renda creme no decote. Vai por cima de blusa ou sozinho.",
        itens: ["Amarração ajustável na frente", "Barbatanas flexíveis", "Renda no decote", "Laço de cetim preto"],
        busca: "corset corpete espartilho vitoriano rosa",
    },
    {
        id: "saia", nome: "Saia de Renda Midnight", cat: "Roupas", preco: 12990, tam: ROUPA, arte: "saia", tom: "r",
        alt: "Ilustração de saia lilás rodada com barra dupla de renda creme e preta",
        resumo: "Rodada · barra dupla de renda",
        desc: "Saia rodada lilás com cós alto e duas camadas de renda na barra, uma creme e uma preta. Gira bonito e fica ótima com meia listrada.",
        itens: ["Cós alto com elástico atrás", "Barra dupla de renda", "Forro que não marca", "Cruzinha bordada"],
        busca: "saia renda rodada lilas midi",
    },
    {
        id: "vestido", nome: "Vestido Boneca Lilás", cat: "Roupas", preco: 21990, tam: ROUPA, arte: "vestido", tom: "m",
        alt: "Ilustração de vestido lilás com manga bufante, gola boneca creme e laço preto na cintura",
        resumo: "Manga bufante · gola boneca",
        desc: "Vestido lilás de manga bufante, gola boneca creme e laço preto marcando a cintura. Doce na medida, com barra de renda.",
        itens: ["Manga bufante curta", "Gola boneca removível", "Laço de veludo na cintura", "Barra de renda"],
        busca: "vestido boneca lolita lilas manga bufante",
    },
    {
        id: "blusa", nome: "Blusa Vitoriana Creme", cat: "Roupas", preco: 11990, tam: ROUPA, arte: "blusa", tom: "l",
        alt: "Ilustração de blusa creme de manga bufante com gola alta de babado e fita preta",
        resumo: "Gola alta · manga bufante",
        desc: "Blusa creme de gola alta com babado lilás, fita preta no pescoço e manga bufante com punho de renda. Base perfeita pro espartilho.",
        itens: ["Gola alta com babado", "Fita de veludo com coraçãozinho", "Manga bufante longa", "Botões forrados"],
        busca: "blusa camisa vitoriana gola alta manga bufante creme",
    },
    {
        id: "capa", nome: "Capa de Veludo Lua Cheia", cat: "Roupas", preco: 22990, tam: ["P/M", "G/GG"], arte: "capa", tom: "l", novo: true,
        alt: "Ilustração de capa preta de veludo com forro lilás e fecho dourado",
        resumo: "Veludo · forro lilás · fecho dourado",
        desc: "Capa de veludo preto com forro lilás e fecho dourado de correntinha. Por cima de vestido ou de moletom, vira feitiço na hora.",
        itens: ["Veludo molhado", "Forro de cetim lilás", "Fecho dourado com corrente", "Gola alta"],
        busca: "capa manto veludo bruxa preta",
    },
    {
        id: "choker", nome: "Choker Lua de Renda", cat: "Joias", preco: 3990, tam: null, arte: "choker", tom: "r",
        alt: "Ilustração de choker preto com renda creme e pingente de lua lilás",
        resumo: "Veludo · renda · lua",
        desc: "Choker de veludo preto com renda creme por baixo e um pingente de lua lilás. Fecho ajustável com correntinha extensora.",
        itens: ["Veludo macio", "Renda creme", "Pingente de lua esmaltado", "Correntinha extensora de 5 cm"],
        busca: "choker gargantilha colar lua renda veludo",
    },
    {
        id: "colarCruz", nome: "Colar Cruz Lilás", cat: "Joias", preco: 4990, tam: null, arte: "colarCruz", tom: "m",
        alt: "Ilustração de colar de bolinhas com pingente de cruz lilás e pedra rosa",
        resumo: "Cruz esmaltada · pedra rosa",
        desc: "Corrente de bolinhas com cruz gótica esmaltada em lilás e uma pedrinha rosa no centro. Comprimento de 45 cm.",
        itens: ["Cruz esmaltada", "Pedra rosa", "Corrente de 45 cm", "Não escurece"],
        busca: "colar cruz crucifixo lilas pingente",
    },
    {
        id: "brincoMorcego", nome: "Brinco Morceguinho", cat: "Joias", preco: 2990, tam: null, arte: "brincoMorcego", tom: "l", novo: true,
        alt: "Ilustração de par de brincos de morceguinho preto com olhos rosa",
        resumo: "Par · olhinhos rosa",
        desc: "Par de brincos de morceguinho preto com olhinhos rosa. Levinhos, dá pra usar o dia inteiro sem pesar a orelha.",
        itens: ["Par de brincos", "Acrílico leve", "Gancho antialérgico", "Olhinhos pintados à mão"],
        busca: "brinco morcego bat par",
    },
    {
        id: "brincoCruz", nome: "Brinco Argola Cruz", cat: "Joias", preco: 3490, tam: null, arte: "brincoCruz", tom: "r",
        alt: "Ilustração de par de argolas com cruzes pendentes, uma rosa e uma menta",
        resumo: "Par desigual · rosa e menta",
        desc: "Argolinhas com cruzes pendentes, uma rosa e uma menta, de propósito. O par desigual que chama atenção.",
        itens: ["Par desigual rosa e menta", "Argola de 1,5 cm", "Antialérgico", "Pedrinha no centro"],
        busca: "brinco argola cruz rosa menta par",
    },
    {
        id: "anel", nome: "Anel Olho Místico", cat: "Joias", preco: 3990, tam: null, arte: "anel", tom: "m",
        alt: "Ilustração de anel lilás com um olho de íris menta e cílios no topo",
        resumo: "Ajustável · olho com cílios",
        desc: "Anel ajustável com um olho de íris menta e cílios de metal. Fofo e esquisito na medida certa.",
        itens: ["Aro ajustável", "Olho esmaltado", "Cílios de metal", "Serve do 12 ao 22"],
        busca: "anel olho mistico ajustavel",
    },
    {
        id: "colarBola", nome: "Colar Bola de Cristal", cat: "Joias", preco: 5490, tam: null, arte: "colarBola", tom: "l",
        alt: "Ilustração de colar com pingente de bola de cristal com uma lua lilás dentro",
        resumo: "Bola de vidro · lua por dentro",
        desc: "Pingente de bola de vidro com uma luazinha lilás lá dentro e tampinha dourada. Pra ler o futuro de pertinho.",
        itens: ["Bola de vidro de 2 cm", "Lua lilás por dentro", "Tampa dourada", "Corrente de 50 cm"],
        busca: "colar bola cristal vidro lua bruxa pingente",
    },
    {
        id: "meiaListrada", nome: "Meia 7/8 Listrada Menta", cat: "Meias e calçados", preco: 3990, tam: null, arte: "meiaListrada", tom: "r",
        alt: "Ilustração de meia alta creme com listras menta e renda lilás no topo",
        resumo: "Acima do joelho · listras menta",
        desc: "Meia 7/8 creme com listras menta e barrado de renda lilás. Tem silicone por dentro pra não escorregar.",
        itens: ["Acima do joelho", "Silicone antiderrapante", "Barrado de renda", "Tamanho único (34 ao 40)"],
        busca: "meia 7/8 listrada menta alta coxa",
    },
    {
        id: "soquete", nome: "Soquete de Babado", cat: "Meias e calçados", preco: 2490, tam: null, arte: "soquete", tom: "l",
        alt: "Ilustração de meia soquete creme com babado rosa e coraçãozinho preto",
        resumo: "Babado rosa · coraçãozinho",
        desc: "Soquete creme de babado rosa com um coraçãozinho preto bordado. Nasceu pra usar com a Mary Jane.",
        itens: ["Babado duplo", "Coração bordado", "Algodão macio", "Tamanho único (34 ao 40)"],
        busca: "meia soquete babado rosa coracao",
    },
    {
        id: "maryJane", nome: "Mary Jane Plataforma", cat: "Meias e calçados", preco: 24990, tam: CALCADO, arte: "maryJane", tom: "m",
        alt: "Ilustração de sapato boneca rosa com plataforma preta, fivela e lacinho",
        resumo: "Plataforma de 6 cm · fivela",
        desc: "Sapato boneca rosa com plataforma preta de 6 cm, tira com fivela e lacinho na ponta. Confortável pra andar o dia todo.",
        itens: ["Plataforma de 6 cm", "Tira com fivela", "Palmilha acolchoada", "Sola antiderrapante"],
        busca: "sapato boneca mary jane plataforma rosa calcado",
    },
    {
        id: "chapeu", nome: "Chapéu de Bruxa Veludo", cat: "Acessórios", preco: 9990, tam: null, arte: "chapeu", tom: "m", novo: true,
        alt: "Ilustração de chapéu de bruxa preto com faixa lilás e fivela dourada",
        resumo: "Ponta torta · fivela dourada",
        desc: "Chapéu de bruxa de veludo preto, com a ponta caidinha, faixa lilás e fivela dourada. Aba firme que não desmonta.",
        itens: ["Veludo preto", "Faixa lilás com fivela dourada", "Aba de 12 cm", "Arame na ponta pra moldar"],
        busca: "chapeu bruxa witch veludo halloween",
    },
    {
        id: "mascara", nome: "Máscara Morcego Vintage", cat: "Acessórios", preco: 6990, tam: null, arte: "mascara", tom: "r",
        alt: "Ilustração de máscara preta em forma de morcego com asas abertas e haste de segurar",
        resumo: "Asas abertas · haste de mão",
        desc: "Máscara de baile em forma de morcego, inspirada nas festas dos anos 40. Vem com haste pra segurar e elástico escondido.",
        itens: ["Feltro rígido", "Asas com nervuras lilás", "Haste removível", "Elástico ajustável"],
        busca: "mascara morcego baile vintage halloween",
    },
    {
        id: "tiara", nome: "Tiara de Rosas Negras", cat: "Acessórios", preco: 5990, tam: null, arte: "tiara", tom: "r", novo: true,
        alt: "Ilustração de tiara com três rosas negras, folhas menta e pérolas",
        resumo: "3 rosas · folhas menta",
        desc: "Tiara com três rosas negras, folhinhas menta e pérolas nas pontas. Deixa qualquer look com cara de chá da tarde assombrado.",
        itens: ["Rosas de tecido", "Folhas menta", "Pérolas nas pontas", "Aro forrado que não aperta"],
        busca: "tiara rosa negra cabelo arco flores",
    },
    {
        id: "laco", nome: "Laço de Cabelo Lilás", cat: "Acessórios", preco: 2990, tam: null, arte: "laco", tom: "m",
        alt: "Ilustração de laço grande lilás com nó preto",
        resumo: "Grande · presilha de metal",
        desc: "Laço grande lilás com nó preto e presilha de metal. Fica lindo no meio do cabelo ou na ponta da trança.",
        itens: ["Tecido acetinado", "Presilha de metal", "12 cm de largura", "Nó de veludo preto"],
        busca: "laco cabelo presilha lilas",
    },
    {
        id: "bolsaCaixao", nome: "Bolsa Caixão", cat: "Acessórios", preco: 14990, tam: null, arte: "bolsaCaixao", tom: "l",
        alt: "Ilustração de bolsa preta em formato de caixão com cruz lilás e costura rosa",
        resumo: "Formato caixão · alça de mão",
        desc: "Bolsa preta em formato de caixão, com cruz lilás na frente e costura rosa aparente. Cabe celular, carteira e maquiagem.",
        itens: ["Couro sintético", "Cruz lilás aplicada", "Alça de mão e alça longa", "Forro de cetim rosa"],
        busca: "bolsa caixao coffin preta cruz",
    },
    {
        id: "sombrinha", nome: "Sombrinha de Renda", cat: "Acessórios", preco: 8990, tam: null, arte: "sombrinha", tom: "r",
        alt: "Ilustração de sombrinha lilás com barra de renda creme e cabo curvo",
        resumo: "Vitoriana · barra de renda",
        desc: "Sombrinha lilás com barra de renda e cabo curvo, igual às de antigamente. Protege do sol e rende foto.",
        itens: ["Tecido com proteção UV", "Barra de renda", "Cabo curvo", "Abre e fecha manual"],
        busca: "sombrinha guarda chuva renda vitoriana parasol",
    },
];

/* ===== Looks prontos: um clique adiciona as três peças ===== */
const LOOKS = [
    {
        id: "boneca", nome: "Look Boneca Assombrada",
        desc: "Vestido, meia listrada e Mary Jane: doce com um pé nas trevas.",
        itens: [{ id: "vestido", tam: "M" }, { id: "meiaListrada", tam: "" }, { id: "maryJane", tam: "36" }],
    },
    {
        id: "cha", nome: "Look Chá da Meia-Noite",
        desc: "Blusa vitoriana, espartilho e tiara de rosas.",
        itens: [{ id: "blusa", tam: "M" }, { id: "espartilho", tam: "M" }, { id: "tiara", tam: "" }],
    },
    {
        id: "lua", nome: "Kit Noite de Lua Cheia",
        desc: "Capa de veludo, chapéu de bruxa e o colar de bola de cristal.",
        itens: [{ id: "capa", tam: "P/M" }, { id: "chapeu", tam: "" }, { id: "colarBola", tam: "" }],
    },
];

/* ===== Utilidades ===== */
const $ = (seletor) => document.querySelector(seletor);
const produto = (id) => PRODUTOS.find((p) => p.id === id);
const esc = (texto) => String(texto).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const brl = (centavos) => (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }).replace(/ /g, " ");
const normalizar = (texto) => String(texto).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const codigo = (id) => "ES-" + String(PRODUTOS.findIndex((p) => p.id === id) + 1).padStart(2, "0");

function ler(chave, padrao) {
    try {
        const valor = localStorage.getItem(chave);
        return valor ? JSON.parse(valor) : padrao;
    } catch (erro) {
        return padrao;
    }
}
function guardar(chave, valor) {
    try { localStorage.setItem(chave, JSON.stringify(valor)); } catch (erro) { /* navegador sem armazenamento: segue sem salvar */ }
}

/* ===== Estado ===== */
const CHAVE_SACOLA = "es-sacola-v1";
const CHAVE_NOME = "es-nome";
const CHAVE_FAVORITOS = "es-favoritos";
const MAX_POR_ITEM = 9;

const itemValido = (i) => {
    const p = i && produto(i.id);
    if (!p) return false;
    const tamOk = p.tam ? p.tam.includes(i.tam) : i.tam === "";
    return tamOk && Number.isInteger(i.qtd) && i.qtd >= 1 && i.qtd <= MAX_POR_ITEM;
};
let sacola = ler(CHAVE_SACOLA, []);
sacola = Array.isArray(sacola) ? sacola.filter(itemValido) : [];

const filtro = { cat: "todos", q: "", ordem: "padrao" };

let favoritos = ler(CHAVE_FAVORITOS, []);
favoritos = Array.isArray(favoritos) ? favoritos.filter((id) => produto(id)) : [];
const ehFavorito = (id) => favoritos.includes(id);
const CORACAO_ICONE = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5C4 15 2.5 10.6 3.7 7.6 5 4.4 9.3 3.8 12 7c2.7-3.2 7-2.6 8.3.6 1.2 3-.3 7.4-8.3 12.9z"/></svg>`;
const favBotao = (p, classe = "") => `<button class="fav ${classe}" type="button" data-fav="${p.id}" aria-pressed="${ehFavorito(p.id)}" aria-label="Favoritar ${esc(p.nome)}">${CORACAO_ICONE}</button>`;

/* ===== Elementos ===== */
const looksEl = $("#looks");
const grade = $("#grade");
const chipsEl = $("#chips");
const contagemEl = $("#contagem");
const vazioEl = $("#vazio");
const buscaEl = $("#busca");
const ordemEl = $("#ordem");
const dlgProduto = $("#dialogoProduto");
const dlgSacola = $("#sacola");
const itensEl = $("#itens");
const sacolaVaziaEl = $("#sacolaVazia");
const sacolaRodapeEl = $("#sacolaRodape");
const totalEl = $("#total");
const botaoSacola = $("#abrirSacola");
const contadorEl = $("#contadorSacola");
const campoNome = $("#campoNome");
const campoObs = $("#campoObs");
const previaEl = $("#previa");
const enviarEl = $("#enviarZap");
const notaEl = $("#nota");
const avisosEl = $("#avisos");
const NOTA_PADRAO = notaEl.textContent;

document.querySelectorAll("[data-nome-loja]").forEach((el) => { el.textContent = LOJA.nome; });
campoNome.value = ler(CHAVE_NOME, "");

/* ===== Catálogo na tela ===== */
function tamanhosHtml(p, prefixo) {
    if (!p.tam) return `<p class="tam-unico">Tamanho único</p>`;
    const opcoes = p.tam.map((t) => `<label class="tam"><input type="radio" name="${prefixo}-${p.id}" value="${t}"><span>${t}</span></label>`).join("");
    return `<fieldset class="tamanhos"><legend>Tamanho</legend>${opcoes}</fieldset><p class="dica" role="alert" hidden>Escolha um tamanho.</p>`;
}

function cardHtml(p, indice) {
    return `<li class="card" data-id="${p.id}" style="--i:${indice}">
        <button class="card-imagem tom-${p.tom}" type="button" data-abrir="${p.id}" aria-label="Ver detalhes de ${esc(p.nome)}${p.novo ? ", peça nova" : ""}">
            ${arte(p)}
            ${p.novo ? '<span class="selo-novo">Novidade</span>' : ""}
        </button>
        ${favBotao(p)}
        <div class="card-corpo">
            <p class="card-cat">${esc(p.cat)}</p>
            <h3 class="card-nome"><button type="button" class="card-nome-botao" data-abrir="${p.id}">${esc(p.nome)}</button></h3>
            <p class="card-resumo">${esc(p.resumo)}</p>
            <p class="card-preco">${brl(p.preco)}</p>
            ${tamanhosHtml(p, "tam")}
            <button class="botao botao-cheio" type="button" data-add="${p.id}">Pôr na sacola</button>
        </div>
    </li>`;
}

function produtosVisiveis() {
    const q = normalizar(filtro.q.trim());
    const lista = PRODUTOS.filter((p) => {
        if (filtro.cat === "favoritos" ? !ehFavorito(p.id) : filtro.cat !== "todos" && p.cat !== filtro.cat) return false;
        return !q || normalizar(`${p.nome} ${p.cat} ${p.resumo} ${p.busca}`).includes(q);
    });
    if (filtro.ordem === "menor") lista.sort((a, b) => a.preco - b.preco);
    if (filtro.ordem === "maior") lista.sort((a, b) => b.preco - a.preco);
    if (filtro.ordem === "nome") lista.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    return lista;
}

function renderChips() {
    const nomes = ["todos", ...CATEGORIAS];
    chipsEl.innerHTML = nomes.map((nome) => {
        const total = nome === "todos" ? PRODUTOS.length : PRODUTOS.filter((p) => p.cat === nome).length;
        const rotulo = nome === "todos" ? "Tudo" : nome;
        return `<button type="button" class="chip" data-cat="${nome}" aria-pressed="${filtro.cat === nome}">${rotulo}<small>${total}</small></button>`;
    }).join("") + (favoritos.length || filtro.cat === "favoritos"
        ? `<button type="button" class="chip chip-fav" data-cat="favoritos" aria-pressed="${filtro.cat === "favoritos"}">${CORACAO_ICONE}Favoritos<small>${favoritos.length}</small></button>`
        : "");
}

function renderGrade() {
    const lista = produtosVisiveis();
    grade.innerHTML = lista.map(cardHtml).join("");
    grade.hidden = lista.length === 0;
    vazioEl.hidden = lista.length !== 0;
    contagemEl.textContent = lista.length === 1 ? "1 peça" : lista.length + " peças";
}

/* ===== Looks prontos na tela ===== */
const lookPrecoTotal = (look) => look.itens.reduce((soma, i) => soma + produto(i.id).preco, 0);

function lookHtml(look) {
    const imagens = look.itens.map((i) => `<span class="look-arte tom-${produto(i.id).tom}">${arte(produto(i.id))}</span>`).join("");
    const nomes = look.itens.map((i) => produto(i.id).nome + (i.tam ? ` (${i.tam})` : "")).join(" + ");
    return `<li class="look-card">
        <div class="look-imagens">${imagens}</div>
        <div class="look-corpo">
            <h3>${esc(look.nome)}</h3>
            <p class="look-desc">${esc(look.desc)}</p>
            <p class="look-pecas">${esc(nomes)}</p>
            <p class="card-preco">${brl(lookPrecoTotal(look))}</p>
            <button class="botao botao-cheio" type="button" data-look-add="${look.id}">Pôr o look inteiro na sacola</button>
        </div>
    </li>`;
}

function renderLooks() {
    if (!looksEl) return;
    looksEl.innerHTML = LOOKS.map(lookHtml).join("");
}

function balancarSacola() {
    botaoSacola.classList.remove("bump");
    void botaoSacola.offsetWidth;
    botaoSacola.classList.add("bump");
}

function adicionarLook(lookId) {
    const look = LOOKS.find((l) => l.id === lookId);
    if (!look) return;
    let algumNoMaximo = false;
    look.itens.forEach((i) => {
        const existente = sacola.find((x) => x.id === i.id && x.tam === i.tam);
        if (existente) {
            if (existente.qtd < MAX_POR_ITEM) existente.qtd += 1; else algumNoMaximo = true;
        } else {
            sacola.push({ id: i.id, tam: i.tam, qtd: 1 });
        }
    });
    renderSacola();
    balancarSacola();
    const rotulo = `Look na sacola: ${look.itens.length} peças${algumNoMaximo ? " (uma já estava no máximo)" : ""}`;
    avisar(rotulo, { rotulo: "Ver sacola", fazer: () => dlgSacola.showModal() });
}

/* ===== Peça em detalhe ===== */
function abrirProduto(id) {
    const p = produto(id);
    if (!p) return;
    dlgProduto.innerHTML = `<div class="dp">
        <button class="fechar" type="button" data-fechar aria-label="Fechar">×</button>
        <div class="dp-imagem tom-${p.tom}" role="img" aria-label="${esc(p.alt)}">${arte(p)}</div>
        <div class="dp-info" data-escopo>
            <p class="card-cat">${esc(p.cat)} · ${codigo(p.id)}</p>
            <h2 id="produtoTitulo">${esc(p.nome)}</h2>
            <p class="card-preco">${brl(p.preco)}</p>
            <p class="dp-desc">${esc(p.desc)}</p>
            <ul class="dp-itens">${p.itens.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
            ${tamanhosHtml(p, "dlg")}
            <button class="botao botao-cheio" type="button" data-add="${p.id}">Pôr na sacola</button>
            <div class="dp-extras">
                ${favBotao(p, "fav-texto")}
                <button class="link-fraco" type="button" data-compartilhar="${p.id}">Compartilhar esta peça</button>
            </div>
        </div>
    </div>`;
    if (!dlgProduto.open) dlgProduto.showModal();
    history.replaceState(null, "", "#peca-" + p.id);
}

/* ===== Link de cada peça: loja-maria/#peca-espartilho abre a peça direto ===== */
const linkDaPeca = (id) => location.href.split("#")[0] + "#peca-" + id;

function abrirPecaDoLink() {
    const id = location.hash.startsWith("#peca-") ? decodeURIComponent(location.hash.slice(6)) : "";
    if (produto(id)) abrirProduto(id);
}

async function compartilhar(id) {
    const p = produto(id);
    const url = linkDaPeca(id);
    if (navigator.share) {
        try { await navigator.share({ title: `${p.nome} · ${LOJA.nome}`, text: `${p.nome} por ${brl(p.preco)} na ${LOJA.nome}`, url }); return; }
        catch (erro) { if (erro.name === "AbortError") return; }
    }
    try {
        await navigator.clipboard.writeText(url);
        avisar("Link da peça copiado. É só colar na conversa.");
    } catch (erro) {
        prompt("Copie o link da peça:", url);
    }
}

/* ===== Favoritos: ficam salvos neste aparelho ===== */
function alternarFavorito(id) {
    const agora = !ehFavorito(id);
    favoritos = agora ? [...favoritos, id] : favoritos.filter((f) => f !== id);
    guardar(CHAVE_FAVORITOS, favoritos);
    document.querySelectorAll(`[data-fav="${id}"]`).forEach((b) => b.setAttribute("aria-pressed", agora));
    const naVitrineDeFavoritos = filtro.cat === "favoritos";
    if (naVitrineDeFavoritos && !favoritos.length) filtro.cat = "todos";
    renderChips();
    if (naVitrineDeFavoritos) renderGrade();
    if (agora) avisar(`♥ ${produto(id).nome} nos favoritos`, dlgProduto.open ? null : { rotulo: "Ver favoritos", fazer: verFavoritos });
}

function verFavoritos() {
    filtro.cat = "favoritos";
    renderChips();
    renderGrade();
    document.getElementById("colecao").scrollIntoView({ behavior: "smooth" });
}

/* ===== Sacola ===== */
const chaveDe = (i) => i.id + "|" + i.tam;
const totalCentavos = () => sacola.reduce((soma, i) => soma + produto(i.id).preco * i.qtd, 0);
const totalItens = () => sacola.reduce((soma, i) => soma + i.qtd, 0);
const rotuloTam = (i) => (i.tam ? "Tamanho " + i.tam : "Tamanho único");

function montarMensagem() {
    const linhas = [`Oi! Quero fazer este pedido na ${LOJA.nome} 🖤`, ""];
    sacola.forEach((i) => {
        const p = produto(i.id);
        linhas.push(`• ${i.qtd}x ${p.nome}${i.tam ? " (" + i.tam + ")" : ""} — ${brl(p.preco * i.qtd)}`);
    });
    linhas.push("", `*Total estimado: ${brl(totalCentavos())}*`);
    const nome = campoNome.value.trim();
    const obs = campoObs.value.trim();
    if (nome) linhas.push(`Nome: ${nome}`);
    if (obs) linhas.push(`Obs.: ${obs}`);
    linhas.push("", "Podemos combinar o frete e o pagamento por aqui?");
    if (LOJA.demo) linhas.push("", "_(Pedido de teste da prévia do site)_");
    return linhas.join("\n");
}

function itemHtml(i) {
    const p = produto(i.id);
    const nomeCompleto = `${p.nome}, ${rotuloTam(i)}`;
    return `<li class="item" data-chave="${chaveDe(i)}">
        <span class="item-arte tom-${p.tom}">${arte(p)}</span>
        <div class="item-info">
            <p class="item-nome">${esc(p.nome)}</p>
            <p class="item-tam">${rotuloTam(i)} · ${brl(p.preco)}</p>
            <div class="qtd">
                <button type="button" data-menos aria-label="Diminuir a quantidade: ${esc(nomeCompleto)}"${i.qtd <= 1 ? " disabled" : ""}>−</button>
                <span class="qtd-valor" aria-label="Quantidade">${i.qtd}</span>
                <button type="button" data-mais aria-label="Aumentar a quantidade: ${esc(nomeCompleto)}"${i.qtd >= MAX_POR_ITEM ? " disabled" : ""}>+</button>
            </div>
        </div>
        <div class="item-lado">
            <strong>${brl(p.preco * i.qtd)}</strong>
            <button type="button" class="item-remover" data-remover aria-label="Tirar da sacola: ${esc(nomeCompleto)}">Tirar</button>
        </div>
    </li>`;
}

function atualizarLinkPedido() {
    if (!sacola.length) return;
    const mensagem = montarMensagem();
    previaEl.textContent = mensagem;
    const numero = LOJA.whatsapp.replace(/\D/g, "");
    enviarEl.href = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

function renderSacola() {
    const vazia = sacola.length === 0;
    const quantidade = totalItens();
    itensEl.innerHTML = sacola.map(itemHtml).join("");
    sacolaVaziaEl.hidden = !vazia;
    sacolaRodapeEl.hidden = vazia;
    totalEl.textContent = brl(totalCentavos());
    contadorEl.hidden = vazia;
    contadorEl.textContent = quantidade;
    botaoSacola.setAttribute("aria-label", vazia ? "Abrir sacola, vazia" : `Abrir sacola, ${quantidade} ${quantidade === 1 ? "peça" : "peças"}`);
    atualizarLinkPedido();
    guardar(CHAVE_SACOLA, sacola);
}

function avisar(texto, acao) {
    const aviso = document.createElement("div");
    aviso.className = "aviso";
    const span = document.createElement("span");
    span.textContent = texto;
    aviso.appendChild(span);
    if (acao) {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.textContent = acao.rotulo;
        botao.addEventListener("click", () => { aviso.remove(); acao.fazer(); });
        aviso.appendChild(botao);
    }
    avisosEl.appendChild(aviso);
    while (avisosEl.children.length > 2) avisosEl.firstElementChild.remove();
    setTimeout(() => aviso.remove(), 3600);
}

function pedirTamanho(escopo) {
    const grupo = escopo.querySelector(".tamanhos");
    const dica = escopo.querySelector(".dica");
    grupo.classList.remove("erro");
    void grupo.offsetWidth; // reinicia a animação de tremer
    grupo.classList.add("erro");
    if (dica) dica.hidden = false;
    grupo.querySelector("input").focus();
}

function adicionar(id, escopo) {
    const p = produto(id);
    let tam = "";
    if (p.tam) {
        const marcado = escopo.querySelector("input[type=radio]:checked");
        if (!marcado) { pedirTamanho(escopo); return; }
        tam = marcado.value;
    }
    const existente = sacola.find((i) => i.id === id && i.tam === tam);
    if (existente && existente.qtd >= MAX_POR_ITEM) {
        if (dlgProduto.open) dlgProduto.close(); // o aviso fica atrás de um diálogo aberto
        avisar(`Máximo de ${MAX_POR_ITEM} por peça. Pra mais, combine no WhatsApp.`);
        return;
    }
    if (existente) existente.qtd += 1; else sacola.push({ id, tam, qtd: 1 });
    if (dlgProduto.open) dlgProduto.close();
    renderSacola();
    balancarSacola();
    avisar(`Na sacola: ${p.nome}${tam ? " (" + tam + ")" : ""}`, { rotulo: "Ver sacola", fazer: () => dlgSacola.showModal() });
}

function mudarQuantidade(chave, delta) {
    const item = sacola.find((i) => chaveDe(i) === chave);
    if (!item) return;
    item.qtd = Math.min(MAX_POR_ITEM, Math.max(1, item.qtd + delta));
    renderSacola();
    const seletor = delta > 0 ? "[data-mais]" : "[data-menos]";
    const alvo = itensEl.querySelector(`[data-chave="${chave}"] ${seletor}`) || itensEl.querySelector(`[data-chave="${chave}"] [data-mais]`);
    if (alvo) alvo.focus();
}

function removerItem(chave) {
    sacola = sacola.filter((i) => chaveDe(i) !== chave);
    renderSacola();
    const proximo = itensEl.querySelector("[data-remover]") || sacolaVaziaEl.querySelector("button");
    if (proximo) proximo.focus();
}

/* ===== Eventos ===== */
document.addEventListener("click", (e) => {
    const fav = e.target.closest("[data-fav]");
    if (fav) { alternarFavorito(fav.dataset.fav); return; }

    const partilha = e.target.closest("[data-compartilhar]");
    if (partilha) { compartilhar(partilha.dataset.compartilhar); return; }

    const abrir = e.target.closest("[data-abrir]");
    if (abrir) { abrirProduto(abrir.dataset.abrir); return; }

    const addLook = e.target.closest("[data-look-add]");
    if (addLook) { adicionarLook(addLook.dataset.lookAdd); return; }

    const add = e.target.closest("[data-add]");
    if (add) {
        const escopo = add.closest("[data-escopo], .card");
        adicionar(add.dataset.add, escopo);
        return;
    }

    const fechar = e.target.closest("[data-fechar]");
    if (fechar) fechar.closest("dialog").close();
});

document.addEventListener("change", (e) => {
    if (!e.target.matches(".tam input")) return;
    const escopo = e.target.closest("[data-escopo], .card");
    const dica = escopo && escopo.querySelector(".dica");
    if (dica) dica.hidden = true;
});

dlgProduto.addEventListener("close", () => {
    if (location.hash.startsWith("#peca-")) history.replaceState(null, "", location.pathname + location.search);
});
window.addEventListener("hashchange", abrirPecaDoLink);

[dlgProduto, dlgSacola].forEach((dialogo) => {
    dialogo.addEventListener("click", (e) => { if (e.target === dialogo) dialogo.close(); });
});

botaoSacola.addEventListener("click", () => dlgSacola.showModal());

chipsEl.addEventListener("click", (e) => {
    const botao = e.target.closest("[data-cat]");
    if (!botao) return;
    filtro.cat = botao.dataset.cat;
    renderChips();
    renderGrade();
    chipsEl.querySelector(`[data-cat="${filtro.cat}"]`).focus();
});
buscaEl.addEventListener("input", () => { filtro.q = buscaEl.value; renderGrade(); });
ordemEl.addEventListener("change", () => { filtro.ordem = ordemEl.value; renderGrade(); });
$("#limparFiltros").addEventListener("click", () => {
    filtro.cat = "todos"; filtro.q = ""; filtro.ordem = "padrao";
    buscaEl.value = ""; ordemEl.value = "padrao";
    renderChips();
    renderGrade();
});

itensEl.addEventListener("click", (e) => {
    const linha = e.target.closest(".item");
    if (!linha) return;
    const chave = linha.dataset.chave;
    if (e.target.closest("[data-mais]")) mudarQuantidade(chave, 1);
    else if (e.target.closest("[data-menos]")) mudarQuantidade(chave, -1);
    else if (e.target.closest("[data-remover]")) removerItem(chave);
});

campoNome.addEventListener("input", () => { guardar(CHAVE_NOME, campoNome.value); atualizarLinkPedido(); });
campoObs.addEventListener("input", atualizarLinkPedido);

$("#esvaziar").addEventListener("click", () => {
    sacola = [];
    renderSacola();
    sacolaVaziaEl.querySelector("button").focus();
});

$("#copiarPedido").addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(montarMensagem());
        notaEl.textContent = "Pedido copiado. Cole na conversa que quiser.";
    } catch (erro) {
        notaEl.textContent = "Não consegui copiar. Abra a mensagem acima e copie à mão.";
        previaEl.closest("details").open = true;
    }
    setTimeout(() => { notaEl.textContent = NOTA_PADRAO; }, 4000);
});

enviarEl.addEventListener("click", () => {
    notaEl.textContent = "Abrindo o WhatsApp com o pedido pronto…";
    setTimeout(() => { notaEl.textContent = NOTA_PADRAO; }, 4000);
});

/* ===== Início ===== */
document.querySelectorAll("svg[data-arte]").forEach((svg) => { svg.innerHTML = ARTE[svg.dataset.arte]; });
renderChips();
renderGrade();
renderSacola();
renderLooks();
abrirPecaDoLink();
