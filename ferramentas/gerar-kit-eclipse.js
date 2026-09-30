/* Gera o kit do Instagram da Eclipse Studio (eclipse-studio/kit/*.jpg) a partir da própria loja,
   com as mesmas fontes, cores e ilustrações (ou fotos, quando a peça tiver o campo "foto").

   Uso: python3 -m http.server 8765        (na raiz do portfólio, em outro terminal)
        node ferramentas/gerar-kit-eclipse.js
   Precisa do Playwright com Chromium. Os cards de peça saem da lista no fim de COMPOSICOES. */
const { chromium } = require('playwright');
const path = require('path');
const DESTINO = path.join(__dirname, '..', 'eclipse-studio', 'kit') + path.sep;

const CSS_BASE = `
  .olhos-noite, .zap-flutuante, .avisos, dialog { display: none !important; }
  *, *::before, *::after { animation-play-state: paused !important; }
  body { overflow: hidden; }
  .peca { position: relative; width: 100vw; height: 100vh; display: flex; flex-direction: column; align-items: center; text-align: center; box-sizing: border-box; }
  .k-marca { display: flex; align-items: center; justify-content: center; gap: 18px; margin: 0; font: 400 64px/1 var(--gotica); }
  .k-marca .logo-icone { width: 64px; height: 64px; }
  .k-titulo { margin: 0; font: 700 112px/1 var(--serifa); }
  .k-titulo em { font: italic 700 1em/1.05 var(--serifa); background: linear-gradient(90deg, var(--lilas), var(--rosa) 55%, var(--menta)); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .k-sub { margin: 0; color: var(--mudo); font: 500 38px/1.4 var(--fonte); }
  .k-selos { display: flex; flex-wrap: wrap; justify-content: center; gap: 14px; margin: 0; padding: 0; list-style: none; }
  .k-selos li { padding: 12px 26px; border: 3px solid var(--linha-forte); border-radius: 999px; font: 700 30px var(--fonte); }
  .k-rodape { margin: 0; color: var(--ouro); font: 700 40px var(--fonte); letter-spacing: .02em; }
  .k-rodape span { color: var(--texto); }
  .cera { position: absolute; left: 0; right: 0; top: 0; height: 80px; margin: 0; background-size: 276px 80px; }
`;

const COMPOSICOES = [
  {
    arquivo: 'story-a-loja-chegou.jpg', w: 1080, h: 1920,
    html: () => `<div class="peca" style="padding:150px 70px 110px;justify-content:space-between">
      <div class="cera"></div>
      <p class="k-marca">${document.querySelector('.logo-icone').outerHTML}Eclipse Studio</p>
      <div class="k-espelho" style="width:620px">${document.querySelector('.hero-arte').outerHTML}</div>
      <div style="display:grid;gap:30px">
        <h1 class="k-titulo">A loja online<br><em>chegou</em></h1>
        <p class="k-sub">Monte a sacola no site e feche<br>o pedido direto no WhatsApp</p>
      </div>
      <ul class="k-selos"><li>Entrega em Campo Grande</li><li>Frete grátis acima de R$ 150</li><li>Até 12x sem juros</li></ul>
      <p class="k-rodape">link na bio ✦ <span>@eclipse_studiocg</span></p>
    </div>`,
    css: `.k-espelho .hero-arte { width: 100%; }`,
  },
  {
    arquivo: 'post-lancamento.jpg', w: 1080, h: 1350,
    html: () => `<div class="peca" style="padding:120px 70px 80px;justify-content:space-between">
      <div class="cera"></div>
      <p class="k-marca">${document.querySelector('.logo-icone').outerHTML}Eclipse Studio</p>
      <div style="display:grid;grid-template-columns:1fr 360px;align-items:center;gap:24px;text-align:left">
        <div style="display:grid;gap:26px">
          <h1 class="k-titulo" style="font-size:84px">Doce por fora,<br><em>bruxa por<br>dentro</em></h1>
          <p class="k-sub" style="font-size:34px">Roupas, bijuterias, bolsas e perfumes pro seu estilo alt de todo dia.</p>
        </div>
        <div class="k-espelho">${document.querySelector('.hero-arte').outerHTML}</div>
      </div>
      <ul class="k-selos"><li>Entrega em Campo Grande</li><li>Pix com até 5% off</li><li>Até 12x sem juros</li></ul>
      <p class="k-rodape">loja online no link da bio ✦ <span>@eclipse_studiocg</span></p>
    </div>`,
    css: `.k-espelho .hero-arte { width: 100%; }`,
  },
  {
    arquivo: 'post-qual-e-a-sua-vibe.jpg', w: 1080, h: 1350,
    antes: () => renderEstilos(),
    html: () => `<div class="peca" style="padding:120px 64px 80px;justify-content:space-between">
      <div class="cera"></div>
      <p class="k-marca" style="font-size:52px">${document.querySelector('.logo-icone').outerHTML}Eclipse Studio</p>
      <div style="display:grid;gap:14px"><h1 class="k-titulo" style="font-size:100px">Qual é a sua <em>vibe?</em></h1>
      <p class="k-sub">comenta a sua ✦ tem peça pra todas no site</p></div>
      <ul class="estilos-grade k-vibes">${document.querySelector('#estilos').innerHTML}</ul>
      <p class="k-rodape">link na bio ✦ <span>@eclipse_studiocg</span></p>
    </div>`,
    css: `.k-vibes { grid-template-columns: repeat(2, 1fr) !important; gap: 26px !important; width: 100%; text-align: left; }
          .k-vibes .estilo { padding: 16px 16px 20px; border-width: 3px; }
          .k-vibes .estilo-nome { font-size: 46px; }
          .k-vibes .estilo-desc, .k-vibes .estilo-total { display: none; }
          .k-vibes .estilo-foto { border-width: 10px 10px 24px; aspect-ratio: 16 / 10; margin-bottom: 8px; }`,
  },
  ...['camiseta', 'perfume'].map((id) => ({
    arquivo: `card-${id}.jpg`, w: 1080, h: 1350, arg: id,
    html: (id) => {
      const p = produto(id);
      return `<div class="peca" style="padding:110px 90px 80px;justify-content:space-between">
        <div class="cera"></div>
        <p class="k-marca" style="font-size:52px">${document.querySelector('.logo-icone').outerHTML}Eclipse Studio</p>
        <div class="k-produto tom-${p.tom}">${arte(p)}<span class="selo-novo">Novidade</span></div>
        <div style="display:grid;gap:14px">
          <h1 class="k-titulo" style="font-size:92px">${p.nome}</h1>
          <p class="k-sub">${p.resumo}</p>
          <p class="k-preco">${p.preco == null ? 'preço sob consulta' : precoTexto(p)}</p>
        </div>
        <p class="k-rodape">peça pelo link da bio ✦ <span>@eclipse_studiocg</span></p>
      </div>`;
    },
    css: `.k-produto { position: relative; width: 600px; aspect-ratio: 1; padding: 80px; border: 4px solid var(--tinta); border-radius: 36px; box-shadow: 0 30px 60px rgba(0,0,0,.45);
            background: radial-gradient(rgba(36, 26, 51, .09) 2.4px, transparent 3.2px) 0 0 / 28px 28px, radial-gradient(circle at 50% 40%, var(--tom1), var(--tom2) 78%); }
          .k-produto .selo-novo { top: 26px; left: 26px; padding: 8px 22px; border-width: 3px; font-size: 26px; }
          .k-preco { margin: 6px 0 0; color: var(--rosa); font: 700 64px var(--fonte); }`,
  })),
];

(async () => {
  const b = await chromium.launch({ args: ['--ignore-certificate-errors'] });
  for (const c of COMPOSICOES) {
    const p = await b.newPage({ viewport: { width: c.w, height: c.h }, ignoreHTTPSErrors: true });
    const erros = []; p.on('pageerror', (e) => erros.push(e.message));
    await p.goto('http://localhost:8765/eclipse-studio/', { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    if (c.antes) await p.evaluate(c.antes);
    const conteudo = await p.evaluate(c.html, c.arg);
    await p.evaluate(({ conteudo, css }) => {
      document.body.innerHTML = conteudo;
      const st = document.createElement('style');
      st.textContent = css;
      document.head.appendChild(st);
    }, { conteudo, css: CSS_BASE + (c.css || '') });
    await p.waitForTimeout(500);
    await p.screenshot({ path: DESTINO + c.arquivo, type: 'jpeg', quality: 92 });
    console.log(c.arquivo, erros.length ? erros : 'ok');
    await p.close();
  }
  await b.close();
})();
