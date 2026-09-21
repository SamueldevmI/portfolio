# Teste das luzes lá atrás: só mexem tocando, cores da capa, batida no BPM, parallax, vidro fosco,
# facho de palco no disco, botão "Efeitos" (Completo / Suave / Desligado) e movimento reduzido.
# Antes: iniciar o servidor (python servidor-dev.py). Depois:  powershell -File testes\roteiro-luzes.ps1
param([string]$Url = 'http://localhost:8127/')
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.Encoding]::UTF8
. "$PSScriptRoot\cdp.ps1"
$script:falhas = 0
function Confere([string]$nome, $cond) {
  if ($cond) { "OK      $nome" } else { $script:falhas++; "FALHOU  $nome" }
}
function Pula([string]$nome) { "PULOU   $nome" }
function Ate([string]$js, [int]$max = 15000) {
  for ($t = 0; $t -lt $max; $t += 500) { if (Js $js) { return $true }; Start-Sleep -Milliseconds 500 }
  return $false
}
function ProximaMusica { Js "import('./js/player.js').then(p => { p.proxima(); return 1; })" | Out-Null }

$corA = "document.getElementById('luzes').style.getPropertyValue('--luz-a')"
$pxLuzes = "+document.getElementById('luzes').style.getPropertyValue('--px')"
$todasParadas = "[...document.querySelectorAll('#luzes .luz, #luzes .luz-pulso')].every(e => getComputedStyle(e).animationPlayState === 'paused')"
$todasAndando = "[...document.querySelectorAll('#luzes .luz, #luzes .luz-pulso')].every(e => getComputedStyle(e).animationPlayState === 'running')"

try {
  Iniciar -W 390 -H 844 -Movel
  Ir $Url -Espera 4000

  # ================= estrutura e "parado" =================
  Confere 'estrutura: 5 luzes lá atrás e nível "Completo" por padrão' (Js "document.querySelectorAll('#luzes .luz').length === 5 && document.body.dataset.efeitos === 'completo'")
  Confere 'antes de tocar nada se mexe (animações pausadas)' (Js $todasParadas)
  Confere 'o movimento nunca é escrito na página inteira (:root), só nas luzes' (Js "document.documentElement.style.getPropertyValue('--px') === ''")
  $leves = @'
(() => {
  const nomes = ['vagar', 'bater', 'varrer', 'brilhar'];
  const regras = [...document.styleSheets].flatMap((s) => [...s.cssRules]).filter((r) => r.type === CSSRule.KEYFRAMES_RULE && nomes.includes(r.name));
  const ok = ['transform', 'opacity', 'scale', 'rotate', 'translate'];
  return regras.length === nomes.length && regras.every((r) => [...r.cssRules].every((k) => [...k.style].every((p) => ok.includes(p))));
})()
'@
  Confere 'leve: as 4 animações só mexem em transform/opacity (nada de desfoque animado)' (Js $leves)
  $sw = Js "fetch('sw.js', { cache: 'no-store' }).then(r => r.text()).then(t => /js\/luzes\.js/.test(t) && /js\/cores\.js/.test(t))"
  Confere 'offline: o cache do app inclui luzes.js e cores.js' $sw

  # ================= cores (função pura) =================
  $cores = @'
import('./js/cores.js').then((m) => {
  const img = (cor) => { const a = new Uint8ClampedArray(24 * 24 * 4); for (let i = 0; i < 576; i++) { const c = cor(i); a[i * 4] = c[0]; a[i * 4 + 1] = c[1]; a[i * 4 + 2] = c[2]; a[i * 4 + 3] = 255; } return a; };
  const vermelho = m.paletaDe(img(() => [210, 30, 30]));
  const [r, g, b] = vermelho[0].match(/\d+/g).map(Number);
  return JSON.stringify({
    vermelhoOk: vermelho.length === 3 && r > 180 && g < 120 && b < 120,
    cinza: m.paletaDe(img(() => [128, 128, 128])),
    preto: m.paletaDe(img(() => [6, 6, 6])),
    duas: m.escolherCores(img((i) => (i < 288 ? [30, 60, 220] : [230, 200, 20]))).length,
  });
})
'@
  $c = (Js $cores) | ConvertFrom-Json
  Confere 'cores: capa vermelha dá luz vermelha (sempre 3 cores)' $c.vermelhoOk
  Confere 'cores: capa cinza ou preta não tem cor forte (fica no âmbar)' (($null -eq $c.cinza) -and ($null -eq $c.preto))
  Confere 'cores: capa azul + amarela dá 2 cores bem diferentes' ($c.duas -eq 2)

  # ================= tocar =================
  Ir "$Url#/genero/Lo-Fi" -Espera 3000
  Ate "document.querySelectorAll('.lista .faixa').length === 50" | Out-Null
  Clicar '.lista .faixa-tocar'
  Confere 'música toca' (Ate "document.body.classList.contains('som') && document.querySelector('.t-total').textContent !== '0:00'" 25000)
  Esperar 800
  Confere 'tocando: as luzes e a batida se mexem' (Js $todasAndando)

  # cores da capa (as capas vêm da internet: se a atual não der pra ler, tenta as próximas)
  $comCor = $false
  for ($k = 0; $k -lt 6; $k++) {
    if (Ate "$corA !== ''" 7000) { $comCor = $true; break }
    ProximaMusica
    Ate "document.body.classList.contains('som')" 15000 | Out-Null
  }
  Confere 'cores da capa: as luzes pegam as cores da música que toca' $comCor
  Confere 'cores da capa: o player cheio usa a mesma paleta' (Js "document.querySelector('#cheio .luzes').style.getPropertyValue('--luz-a') === $corA")
  Foto 'luzes-tocando.png' | Out-Null

  $antes = Js $corA
  $mudou = $false
  for ($k = 0; $k -lt 5 -and -not $mudou; $k++) {
    ProximaMusica
    Esperar 1500
    $mudou = Ate "$corA !== '$antes'" 7000
  }
  Confere 'trocar de música troca as cores das luzes' $mudou

  # ================= batida =================
  $achouBpm = $false
  for ($k = 0; $k -lt 8; $k++) {
    if (Js "import('./js/player.js').then(p => (p.atual()?.bpm || 0) >= 50)") { $achouBpm = $true; break }
    ProximaMusica
    Esperar 2500
  }
  $bat = @'
import('./js/player.js').then((p) => {
  const bpm = p.atual().bpm || 0;
  let per = bpm >= 50 && bpm <= 220 ? 60 / bpm : 0;
  while (per && per < 0.45) per *= 2;
  const dado = parseFloat(document.getElementById('luzes').style.getPropertyValue('--batida'));
  return JSON.stringify({ bpm, esperado: per || 3.2, dado });
})
'@
  $b = (Js $bat) | ConvertFrom-Json
  Confere "batida: a duração segue o BPM da música (BPM $($b.bpm) -> $([Math]::Round($b.esperado, 3)) s, luz $([Math]::Round($b.dado, 3)) s)" ([Math]::Abs($b.dado - $b.esperado) -lt 0.01)
  if ($achouBpm) {
    Ate "import('./js/player.js').then(p => p.tempo().t > 4.5 && !p.estado().carregando)" 30000 | Out-Null
    $fase = @'
import('./js/player.js').then((p) => {
  const bpm = p.atual().bpm;
  let per = 60 / bpm;
  while (per < 0.45) per *= 2;
  const a = document.querySelector('#luzes .luz-pulso').getAnimations().find((x) => x.animationName === 'bater');
  const ms = per * 1000;
  const ideal = (p.tempo().t % per) * 1000;
  const real = Number(a.currentTime) % ms;
  const d = Math.abs(ideal - real);
  return JSON.stringify({ d: Math.min(d, ms - d), ms });
})
'@
    $f = (Js $fase) | ConvertFrom-Json
    Confere "batida: a luz bate junto com a música (diferença $([Math]::Round($f.d)) ms de um ciclo de $([Math]::Round($f.ms)) ms)" ($f.d -lt 150)
  } else {
    Pula 'batida: nenhuma das músicas testadas tinha BPM, então a fase não foi medida'
  }

  # ================= pausar =================
  Clicar '.mini-play'
  Confere 'pausou: as luzes e a batida param' (Ate "!document.body.classList.contains('som') && $todasParadas" 6000)
  $ler = "document.querySelector('#luzes .luz').getAnimations().find(a => a.animationName === 'vagar').currentTime"
  $t0 = Js $ler
  Esperar 800
  $t1 = Js $ler
  Confere 'pausado: o relógio das luzes não anda' ($t0 -eq $t1)
  Clicar '.mini-play'
  $voltou = Ate "document.body.classList.contains('som') && $todasAndando" 8000
  Confere 'voltou a tocar: as luzes voltam a andar de onde estavam' ($voltou -and ([double](Js $ler) -ge [double]$t1))

  # ================= parallax (mouse) =================
  foreach ($p in @(@(200, 300), @(300, 160), @(360, 90))) { Passar $p[0] $p[1]; Esperar 60 }
  Esperar 900
  $par = (Js "JSON.stringify({ x: $pxLuzes, y: +document.getElementById('luzes').style.getPropertyValue('--py') })") | ConvertFrom-Json
  Confere "parallax: mouse no canto de cima à direita empurra as luzes (x $([Math]::Round($par.x, 2)), y $([Math]::Round($par.y, 2)))" (($par.x -gt 0.6) -and ($par.y -lt -0.5))
  $tr = (Js "JSON.stringify([1, 5].map((n) => parseFloat(getComputedStyle(document.querySelector('#luzes .luz:nth-child(' + n + ')')).translate)))") | ConvertFrom-Json
  Confere "parallax: a luz perto anda bem mais que a luz longe (perto $([Math]::Round($tr[1], 1)) px, longe $([Math]::Round($tr[0], 1)) px)" (($tr[1] -gt 25) -and ($tr[1] -gt 4 * [Math]::Abs($tr[0])))
  foreach ($p in @(@(200, 500), @(80, 700), @(30, 780))) { Passar $p[0] $p[1]; Esperar 60 }
  Esperar 900
  Confere 'parallax: indo pro canto de baixo à esquerda elas vão pro outro lado' ((Js $pxLuzes) -lt -0.6)

  # ================= player cheio =================
  Confere 'player cheio fechado: as luzes e o facho dele ficam parados (escondidos não gastam bateria)' (Js "['#cheio .luz', '#cheio .luz-pulso', '#cheio .facho'].every((s) => getComputedStyle(document.querySelector(s)).animationPlayState === 'paused')")
  Clicar '.mini-info'
  Esperar 1500
  Confere 'player cheio: tem facho de palco e luzes próprias' (Js "!!document.querySelector('#cheio .facho') && document.querySelectorAll('#cheio .luzes .luz').length === 5 && getComputedStyle(document.querySelector('#cheio .facho')).animationName === 'varrer'")
  Confere 'player cheio: as luzes de trás ficam escondidas e paradas (não gastam bateria)' (Js "getComputedStyle(document.getElementById('luzes')).visibility === 'hidden' && $todasParadas")
  Confere 'player cheio: facho e brilho do disco andam enquanto toca' (Js "getComputedStyle(document.querySelector('#cheio .facho')).animationPlayState === 'running' && getComputedStyle(document.querySelector('#cheio .palco .disco'), '::after').animationName === 'brilhar'")
  $sombras = "JSON.stringify({ px: document.getElementById('cheio').style.getPropertyValue('--px'), disco: getComputedStyle(document.querySelector('#cheio .palco .disco')).boxShadow, braco: getComputedStyle(document.querySelector('#cheio .braco')).filter, brilho: getComputedStyle(document.querySelector('#cheio .palco .disco'), '::after').rotate })"
  foreach ($p in @(@(200, 300), @(60, 300), @(20, 300))) { Passar $p[0] $p[1]; Esperar 60 }
  Esperar 900
  $sa = (Js $sombras) | ConvertFrom-Json
  foreach ($p in @(@(200, 300), @(330, 300), @(372, 300))) { Passar $p[0] $p[1]; Esperar 60 }
  Esperar 900
  $sb = (Js $sombras) | ConvertFrom-Json
  Confere "sombras: a luz do player cheio acompanha o mouse (px $($sa.px) e $($sb.px))" (($sa.px -ne '') -and ([double]$sb.px - [double]$sa.px -gt 1))
  Confere 'sombras: a sombra do disco muda de lado com a luz' ($sa.disco -ne $sb.disco)
  Confere 'sombras: a sombra do braço da vitrola muda de lado' ($sa.braco -ne $sb.braco)
  Confere 'brilho: o reflexo no disco gira junto' ($sa.brilho -ne $sb.brilho)
  Foto 'luzes-cheio.png' | Out-Null
  Clicar '[data-acao=fechar-cheio]'
  Esperar 900
  Confere 'fechar o player cheio: as luzes de trás voltam a aparecer e a andar' (Js "getComputedStyle(document.getElementById('luzes')).visibility === 'visible' && $todasAndando")

  # ================= botão "Efeitos" nas configurações =================
  Ir "$Url#/" -Espera 1500
  Clicar '.topo-acoes [data-acao=config]'
  Esperar 600
  Confere 'configurações: "Efeitos de luz" com 3 opções e "Completo" marcado' (Js "document.querySelectorAll('#dialogo input[name=efeitos]').length === 3 && document.querySelector('#dialogo input[name=efeitos]:checked').value === 'completo'")
  Clicar '#dialogo input[value=suave]'
  Esperar 900
  Confere 'Suave (prévia na hora): some a batida, o facho e as 2 luzes de perto' (Js "document.body.dataset.efeitos === 'suave' && getComputedStyle(document.querySelector('#luzes .luz.extra')).display === 'none' && getComputedStyle(document.querySelector('#luzes .luz-pulso')).animationName === 'none' && getComputedStyle(document.querySelector('#cheio .facho')).display === 'none'")
  Confere 'Suave: o parallax desliga e as luzes voltam pro centro' ([Math]::Abs([double](Js $pxLuzes)) -lt 0.05)
  Clicar '#dialogo input[value=desligado]'
  Esperar 300
  Confere 'Desligado (prévia): as luzes somem' (Js "document.body.dataset.efeitos === 'desligado' && getComputedStyle(document.getElementById('luzes')).display === 'none'")
  Clicar '#dialogo [data-fechar]'
  Esperar 600
  Confere 'Cancelar desfaz a prévia (volta ao Completo) e não salva nada' (Js "import('./js/store.js').then(s => document.body.dataset.efeitos === 'completo' && s.config().efeitos === 'completo' && getComputedStyle(document.getElementById('luzes')).display !== 'none')")
  Clicar '.topo-acoes [data-acao=config]'
  Esperar 600
  Clicar '#dialogo input[value=desligado]'
  Clicar '#dialogo button[value=ok]'
  Confere 'Salvar guarda "Desligado" no aparelho' (Ate "JSON.parse(localStorage.getItem('eldev-music:v1')).config.efeitos === 'desligado'" 4000)
  Ir $Url -Espera 3500
  Confere 'depois de recarregar continua "Desligado" (sem luzes)' (Js "document.body.dataset.efeitos === 'desligado' && getComputedStyle(document.getElementById('luzes')).display === 'none'")
  Js "import('./js/store.js').then(s => { s.definirConfig({ efeitos: 'completo' }); return 1; })" | Out-Null
  Esperar 500
  Confere 'voltando pra "Completo" as luzes reaparecem' (Js "document.body.dataset.efeitos === 'completo' && getComputedStyle(document.getElementById('luzes')).display !== 'none'")

  # ================= movimento reduzido (acessibilidade) =================
  Js "import('./js/player.js').then(p => { p.alternar(); return 1; })" | Out-Null
  Ate "document.body.classList.contains('som')" 20000 | Out-Null
  Cmd 'Emulation.setEmulatedMedia' @{ features = @(@{ name = 'prefers-reduced-motion'; value = 'reduce' }) } | Out-Null
  Esperar 700
  Confere 'movimento reduzido: nenhuma luz, batida ou facho anima' (Js "getComputedStyle(document.querySelector('#luzes .luz')).animationName === 'none' && getComputedStyle(document.querySelector('#luzes .luz-pulso')).animationName === 'none' && getComputedStyle(document.querySelector('#cheio .facho')).animationName === 'none'")
  foreach ($p in @(@(100, 500), @(40, 700), @(20, 780))) { Passar $p[0] $p[1]; Esperar 60 }
  Esperar 700
  Confere 'movimento reduzido: o mouse não empurra as luzes' ([Math]::Abs([double](Js $pxLuzes)) -lt 0.05)
  Cmd 'Emulation.setEmulatedMedia' @{ features = @(@{ name = 'prefers-reduced-motion'; value = 'no-preference' }) } | Out-Null
  Esperar 700
  Confere 'sem a preferência de movimento reduzido tudo volta a animar' (Js "getComputedStyle(document.querySelector('#luzes .luz')).animationName === 'vagar'")

  # ================= aba escondida =================
  Js "Object.defineProperty(document, 'visibilityState', { get: () => 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); 1" | Out-Null
  foreach ($p in @(@(200, 500), @(40, 700), @(20, 780))) { Passar $p[0] $p[1]; Esperar 60 }
  Esperar 700
  Confere 'aba escondida: mouse e inclinação são ignorados' ([Math]::Abs([double](Js $pxLuzes)) -lt 0.05)
  Js "delete document.visibilityState; document.dispatchEvent(new Event('visibilitychange')); 1" | Out-Null
  foreach ($p in @(@(200, 300), @(300, 150), @(370, 80))) { Passar $p[0] $p[1]; Esperar 60 }
  Esperar 900
  Confere 'aba de volta: o parallax volta' ([double](Js $pxLuzes) -gt 0.5)

  # ================= computador: vidro fosco + parallax =================
  Tamanho 1280 800
  Ir "$Url#/" -Espera 2500
  Confere 'vidro fosco: barra do topo e mini player desfocam a luz de trás' (Js "['.abas', '.mini'].every((s) => /blur/.test(getComputedStyle(document.querySelector(s)).backdropFilter))")
  Confere 'vidro fosco: o fundo deles é translúcido (a luz aparece por trás)' (Js "['.abas', '.mini'].every((s) => { const m = getComputedStyle(document.querySelector(s)).backgroundColor.match(/[\d.]+/g); return m.length === 4 && Number(m[3]) < 0.8; })")
  foreach ($p in @(@(400, 400), @(900, 200), @(1200, 90))) { Passar $p[0] $p[1]; Esperar 60 }
  Esperar 900
  Confere 'computador: o parallax também responde ao mouse' ([double](Js $pxLuzes) -gt 0.6)
  Foto 'luzes-desktop.png' | Out-Null
  Clicar '.mini-info'
  Esperar 1500
  Foto 'luzes-desktop-cheio.png' | Out-Null
  Js "import('./js/player.js').then(p => { p.pausar(); return 1; })" | Out-Null

  $erros = @(Erros) | Where-Object { $_ -notmatch 'Failed to load resource' -and $_ -ne 'sem erros no console' }
  Confere 'nenhum erro de código no console' ($erros.Count -eq 0)
  $erros
} finally {
  Fechar
}
if ($script:falhas) { "`n$script:falhas verificação(ões) falharam"; exit 1 } else { "`nTudo certo." }
