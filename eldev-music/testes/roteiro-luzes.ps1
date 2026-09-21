# Teste das luzes lá atrás: sem piscar, passeio visível, velocidade pelo BPM, só mexem tocando, cores da capa,
# parallax (mouse, rolagem, troca de tela e de música), vidro fosco, facho de palco no disco,
# botão "Efeitos" (Completo / Suave / Desligado + "Piscar na batida") e movimento reduzido.
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
$camadas = "[...document.querySelectorAll('#luzes .lx, #luzes .ly')]"
$todasParadas = "($camadas.length === 10 && $camadas.every(e => getComputedStyle(e).animationPlayState === 'paused'))"
$todasAndando = "($camadas.length === 10 && $camadas.every(e => getComputedStyle(e).animationPlayState === 'running'))"
# deslocamento (x, y) da luz n, em px, vindo do parallax (mouse, rolagem, troca de tela, troca de música)
$desloc = "(n) => { const t = getComputedStyle(document.querySelector('#luzes .luz:nth-child(' + n + ')')).translate.split(' '); return [parseFloat(t[0]) || 0, parseFloat(t[1]) || 0]; }"
$lerDesloc = "JSON.stringify([1, 5].map($desloc))"

try {
  Iniciar -W 390 -H 844 -Movel
  Ir $Url -Espera 4000

  # ================= estrutura e "parado" =================
  Confere 'estrutura: 5 luzes, cada uma com 3 camadas (.luz > .lx > .ly), nível "Completo" por padrão' (Js "document.querySelectorAll('#luzes .luz').length === 5 && document.querySelectorAll('#luzes .luz > .lx > .ly').length === 5 && document.body.dataset.efeitos === 'completo'")
  Confere 'antes de tocar nada se mexe (animações pausadas)' (Js $todasParadas)
  Confere 'o movimento nunca é escrito na página inteira (:root), só nas luzes' (Js "document.documentElement.style.getPropertyValue('--px') === '' && document.documentElement.style.getPropertyValue('--sy') === ''")
  $leves = @'
(() => {
  const nomes = ['vagar-x', 'vagar-y', 'bater', 'varrer', 'brilhar'];
  const regras = [...document.styleSheets].flatMap((s) => [...s.cssRules]).filter((r) => r.type === CSSRule.KEYFRAMES_RULE && nomes.includes(r.name));
  const ok = ['transform', 'opacity', 'scale', 'rotate', 'translate'];
  return regras.length === nomes.length && regras.every((r) => [...r.cssRules].every((k) => [...k.style].every((p) => ok.includes(p))));
})()
'@
  Confere 'leve: as 5 animações só mexem em transform/opacity (nada de desfoque animado)' (Js $leves)
  $sw = Js "fetch('sw.js', { cache: 'no-store' }).then(r => r.text()).then(t => /js\/luzes\.js/.test(t) && /js\/cores\.js/.test(t))"
  Confere 'offline: o cache do app inclui luzes.js e cores.js' $sw
  Confere 'o brilho fixo antigo do topo some (as luzes que andam fazem esse papel)' (Js "getComputedStyle(document.body, '::before').display === 'none'")

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
  Confere 'tocando: as luzes se mexem' (Js $todasAndando)

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

  # ================= sem piscar + passeio visível =================
  $amostras = @'
new Promise((ok) => {
  const p = document.querySelector('#luzes .luz-pulso');
  const lista = [];
  const t = setInterval(() => {
    lista.push(getComputedStyle(p).opacity + '|' + getComputedStyle(p).animationName + '|' + getComputedStyle(document.querySelector('#luzes .luz')).opacity);
    if (lista.length === 8) { clearInterval(t); ok(JSON.stringify([...new Set(lista)])); }
  }, 250);
})
'@
  $am = (Js $amostras) | ConvertFrom-Json
  Confere "sem piscar: o brilho do fundo é sempre o mesmo em 8 amostras ($($am -join ' ; '))" (($am.Count -eq 1) -and ($am[0] -match '^1\|none\|'))

  $pos = "JSON.stringify([3, 4, 5].map((n) => { const r = document.querySelector('#luzes .luz:nth-child(' + n + ') .ly').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }))"
  $p0 = (Js $pos) | ConvertFrom-Json
  Esperar 4000
  $p1 = (Js $pos) | ConvertFrom-Json
  $dist = 0.0
  for ($i = 0; $i -lt 3; $i++) { $dist += [Math]::Sqrt([Math]::Pow($p1[$i][0] - $p0[$i][0], 2) + [Math]::Pow($p1[$i][1] - $p0[$i][1], 2)) }
  Confere "passeio visível: as 3 luzes do meio andaram $([Math]::Round($dist)) px em 4 s" ($dist -gt 40)

  # ================= velocidade segue o BPM =================
  $achouBpm = $false
  for ($k = 0; $k -lt 8; $k++) {
    if (Js "import('./js/player.js').then(p => (p.atual()?.bpm || 0) >= 50)") { $achouBpm = $true; break }
    ProximaMusica
    Esperar 2500
  }
  Esperar 3500
  $vel = @'
import('./js/player.js').then((p) => {
  const bpm = p.atual().bpm || 0;
  const esperado = bpm >= 50 && bpm <= 220 ? Math.min(1.6, Math.max(0.75, bpm / 100)) : 1;
  const taxa = (sel) => document.querySelector(sel).getAnimations().find((a) => a.animationName === 'vagar-x').playbackRate;
  return JSON.stringify({ bpm, esperado, fundo: taxa('#luzes .lx'), cheio: taxa('#cheio .lx') });
})
'@
  $v = (Js $vel) | ConvertFrom-Json
  Confere "velocidade: as luzes andam a $([Math]::Round($v.fundo, 2))x (BPM $($v.bpm), esperado $([Math]::Round($v.esperado, 2))x), também no player cheio" (([Math]::Abs($v.fundo - $v.esperado) -lt 0.03) -and ([Math]::Abs($v.cheio - $v.esperado) -lt 0.03))
  if (-not $achouBpm) { Pula 'velocidade: nenhuma das músicas testadas tinha BPM (só conferi o normal, 1x)' }

  # ================= pausar =================
  Clicar '.mini-play'
  Confere 'pausou: as luzes param' (Ate "!document.body.classList.contains('som') && $todasParadas" 6000)
  $ler = "document.querySelector('#luzes .lx').getAnimations().find(a => a.animationName === 'vagar-x').currentTime"
  $t0 = Js $ler
  Esperar 800
  $t1 = Js $ler
  Confere 'pausado: o relógio das luzes não anda' ($t0 -eq $t1)
  Clicar '.mini-play'
  $voltou = Ate "document.body.classList.contains('som') && $todasAndando" 8000
  Confere 'voltou a tocar: as luzes voltam a andar de onde estavam' ($voltou -and ([double](Js $ler) -ge [double]$t1))

  # ================= rolagem move o fundo =================
  Js 'window.scrollTo(0, 0); 1' | Out-Null
  Esperar 1400
  $r0 = (Js $lerDesloc) | ConvertFrom-Json
  Js 'window.scrollTo(0, 1e6); 1' | Out-Null
  Esperar 1600
  $sy = [double](Js "+document.getElementById('luzes').style.getPropertyValue('--sy')")
  $r1 = (Js $lerDesloc) | ConvertFrom-Json
  $dLonge = $r1[0][1] - $r0[0][1]
  $dPerto = $r1[1][1] - $r0[1][1]
  Confere "rolagem: no fim da lista o trajeto está em $([Math]::Round($sy, 2)) (0 a 1)" ($sy -gt 0.95)
  Confere "rolagem: a luz de perto subiu $([Math]::Round(-$dPerto)) px e a de longe só $([Math]::Round(-$dLonge)) px (a lista subiu bem mais)" (($dPerto -lt -250) -and ($dLonge -gt -120) -and ($dPerto -lt 4 * $dLonge))
  Js 'window.scrollTo(0, 0); 1' | Out-Null
  Esperar 1400
  Confere 'rolagem: voltando pro topo as luzes voltam' ([double](Js "+document.getElementById('luzes').style.getPropertyValue('--sy')") -lt 0.05)

  # ================= troca de tela empurra as luzes =================
  $a0 = (Js $lerDesloc) | ConvertFrom-Json
  $rota0 = Js "document.getElementById('luzes').style.getPropertyValue('--rota')"
  Ir "$Url#/biblioteca" -Espera 1800
  $a1 = (Js $lerDesloc) | ConvertFrom-Json
  $rota1 = Js "document.getElementById('luzes').style.getPropertyValue('--rota')"
  $dxPerto = $a1[1][0] - $a0[1][0]
  $dxLonge = $a1[0][0] - $a0[0][0]
  Confere "troca de tela: Buscar -> Coleção mudou a aba de $rota0 para $rota1" (($rota0 -eq '1') -and ($rota1 -eq '2'))
  Confere "troca de tela: a luz de perto escorregou $([Math]::Round($dxPerto)) px pro lado e a de longe só $([Math]::Round($dxLonge)) px" (($dxPerto -lt -35) -and ([Math]::Abs($dxLonge) -lt 15))

  # ================= troca de música empurra as luzes =================
  $lado0 = [double](Js "+document.getElementById('luzes').style.getPropertyValue('--vai')")
  $b0 = (Js $lerDesloc) | ConvertFrom-Json
  ProximaMusica
  Esperar 2200
  $lado1 = [double](Js "+document.getElementById('luzes').style.getPropertyValue('--vai')")
  $b1 = (Js $lerDesloc) | ConvertFrom-Json
  $dxMusica = $b1[1][0] - $b0[1][0]
  Confere "troca de música: o empurrão mudou de lado ($lado0 -> $lado1) e a luz de perto andou $([Math]::Round($dxMusica)) px" (($lado0 * $lado1 -lt 0) -and ([Math]::Abs($dxMusica) -gt 50))
  Confere 'troca de música: o player cheio recebe o mesmo empurrão' ((Js "+document.getElementById('cheio').style.getPropertyValue('--vai')") -eq $lado1)
  Ir "$Url#/genero/Lo-Fi" -Espera 2500

  # ================= parallax (mouse) =================
  foreach ($p in @(@(200, 300), @(300, 160), @(360, 90))) { Passar $p[0] $p[1]; Esperar 60 }
  Esperar 1400
  $par = (Js "JSON.stringify({ x: $pxLuzes, y: +document.getElementById('luzes').style.getPropertyValue('--py') })") | ConvertFrom-Json
  $ma = (Js $lerDesloc) | ConvertFrom-Json
  Confere "parallax: mouse no canto de cima à direita empurra as luzes (x $([Math]::Round($par.x, 2)), y $([Math]::Round($par.y, 2)))" (($par.x -gt 0.6) -and ($par.y -lt -0.5))
  foreach ($p in @(@(200, 500), @(80, 700), @(30, 780))) { Passar $p[0] $p[1]; Esperar 60 }
  Esperar 1400
  $mb = (Js $lerDesloc) | ConvertFrom-Json
  $mdPerto = $ma[1][0] - $mb[1][0]
  $mdLonge = $ma[0][0] - $mb[0][0]
  Confere "parallax: de um canto ao outro a luz perto andou $([Math]::Round($mdPerto)) px e a longe só $([Math]::Round($mdLonge)) px" (($mdPerto -gt 50) -and ($mdPerto -gt 4 * [Math]::Abs($mdLonge)))
  Confere 'parallax: indo pro canto de baixo à esquerda elas vão pro outro lado' ((Js $pxLuzes) -lt -0.6)

  # ================= player cheio =================
  Confere 'player cheio fechado: as luzes e o facho dele ficam parados (escondidos não gastam bateria)' (Js "['#cheio .lx', '#cheio .ly', '#cheio .facho'].every((s) => getComputedStyle(document.querySelector(s)).animationPlayState === 'paused')")
  Clicar '.mini-info'
  Esperar 1500
  Confere 'player cheio: tem facho de palco e luzes próprias' (Js "!!document.querySelector('#cheio .facho') && document.querySelectorAll('#cheio .luzes .luz').length === 5 && getComputedStyle(document.querySelector('#cheio .facho')).animationName === 'varrer'")
  Confere 'player cheio: as luzes de trás ficam escondidas e paradas (não gastam bateria)' (Js "getComputedStyle(document.getElementById('luzes')).visibility === 'hidden' && $todasParadas")
  Confere 'player cheio: facho e brilho do disco andam enquanto toca' (Js "getComputedStyle(document.querySelector('#cheio .facho')).animationPlayState === 'running' && getComputedStyle(document.querySelector('#cheio .palco .disco'), '::after').animationName === 'brilhar'")
  Confere 'player cheio: as luzes dele andam enquanto toca' (Js "[...document.querySelectorAll('#cheio .lx, #cheio .ly')].every((e) => getComputedStyle(e).animationPlayState === 'running')")
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
  Confere 'configurações: "Efeitos de luz" com 3 opções, "Completo" marcado e "Piscar na batida" desmarcado' (Js "document.querySelectorAll('#dialogo input[name=efeitos]').length === 3 && document.querySelector('#dialogo input[name=efeitos]:checked').value === 'completo' && document.querySelector('#dialogo input[name=piscar]').checked === false && document.querySelector('#dialogo input[name=piscar]').disabled === false")
  Clicar '#dialogo input[value=suave]'
  Esperar 900
  Confere 'Suave (prévia na hora): somem o facho e as 2 luzes de perto, e o "Piscar" fica desligado' (Js "document.body.dataset.efeitos === 'suave' && document.body.dataset.piscar === 'nao' && getComputedStyle(document.querySelector('#luzes .luz.extra')).display === 'none' && getComputedStyle(document.querySelector('#cheio .facho')).display === 'none' && document.querySelector('#dialogo input[name=piscar]').disabled === true")
  Confere 'Suave: o parallax desliga e as luzes voltam pro centro' (([Math]::Abs([double](Js $pxLuzes)) -lt 0.05) -and (Js "document.getElementById('luzes').style.getPropertyValue('--rota') === '' && document.getElementById('luzes').style.getPropertyValue('--sy') === ''"))
  Clicar '#dialogo input[value=desligado]'
  Esperar 300
  Confere 'Desligado (prévia): as luzes somem e o brilho fixo antigo do topo volta' (Js "document.body.dataset.efeitos === 'desligado' && getComputedStyle(document.getElementById('luzes')).display === 'none' && getComputedStyle(document.body, '::before').display !== 'none'")
  Clicar '#dialogo [data-fechar]'
  Esperar 600
  Confere 'Cancelar desfaz a prévia (volta ao Completo) e não salva nada' (Js "import('./js/store.js').then(s => document.body.dataset.efeitos === 'completo' && s.config().efeitos === 'completo' && getComputedStyle(document.getElementById('luzes')).display !== 'none' && getComputedStyle(document.body, '::before').display === 'none')")

  # "Piscar na batida": desligado por padrão, quem quiser liga
  Clicar '.topo-acoes [data-acao=config]'
  Esperar 600
  Clicar '#dialogo input[name=piscar]'
  Esperar 400
  Confere 'Piscar na batida (prévia): o fundo passa a acender e apagar no ritmo' (Js "document.body.dataset.piscar === 'sim' && getComputedStyle(document.querySelector('#luzes .luz-pulso')).animationName === 'bater'")
  Clicar '#dialogo [data-fechar]'
  Esperar 500
  Confere 'Piscar: cancelar volta a não piscar' (Js "document.body.dataset.piscar === 'nao' && getComputedStyle(document.querySelector('#luzes .luz-pulso')).animationName === 'none'")
  Clicar '.topo-acoes [data-acao=config]'
  Esperar 600
  Clicar '#dialogo input[name=piscar]'
  Clicar '#dialogo button[value=ok]'
  Confere 'Piscar: salvar guarda a escolha' (Ate "JSON.parse(localStorage.getItem('eldev-music:v1')).config.piscar === true" 4000)
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
  return JSON.stringify({ d: Math.min(d, ms - d), ms, dado: parseFloat(document.getElementById('luzes').style.getPropertyValue('--batida')), per });
})
'@
    $f = (Js $fase) | ConvertFrom-Json
    Confere "Piscar: a duração segue o BPM ($([Math]::Round($f.dado, 3)) s) e a luz bate junto com a música (diferença $([Math]::Round($f.d)) ms de um ciclo de $([Math]::Round($f.ms)) ms)" (([Math]::Abs($f.dado - $f.per) -lt 0.01) -and ($f.d -lt 150))
  } else {
    Pula 'Piscar: nenhuma música testada tinha BPM, então a fase não foi medida'
  }
  Js "import('./js/store.js').then(s => { s.definirConfig({ piscar: false }); return 1; })" | Out-Null
  Esperar 400
  Confere 'Piscar desligado de novo: o fundo volta a ficar constante' (Js "document.body.dataset.piscar === 'nao' && getComputedStyle(document.querySelector('#luzes .luz-pulso')).animationName === 'none'")

  # salvar "Desligado" e recarregar
  Clicar '.topo-acoes [data-acao=config]'
  Esperar 600
  Clicar '#dialogo input[value=desligado]'
  Clicar '#dialogo button[value=ok]'
  Confere 'Salvar guarda "Desligado" no aparelho' (Ate "JSON.parse(localStorage.getItem('eldev-music:v1')).config.efeitos === 'desligado'" 4000)
  Ir $Url -Espera 3500
  Confere 'depois de recarregar continua "Desligado" (sem luzes)' (Js "document.body.dataset.efeitos === 'desligado' && getComputedStyle(document.getElementById('luzes')).display === 'none'")
  Js "import('./js/store.js').then(s => { s.definirConfig({ efeitos: 'completo' }); return 1; })" | Out-Null
  Esperar 500
  Confere 'voltando pra "Completo" as luzes reaparecem e voltam a andar' (Js "document.body.dataset.efeitos === 'completo' && getComputedStyle(document.getElementById('luzes')).display !== 'none' && document.querySelectorAll('#luzes .lx').length === 5")

  # ================= movimento reduzido (acessibilidade) =================
  Js "import('./js/player.js').then(p => { p.alternar(); return 1; })" | Out-Null
  Ate "document.body.classList.contains('som')" 20000 | Out-Null
  Cmd 'Emulation.setEmulatedMedia' @{ features = @(@{ name = 'prefers-reduced-motion'; value = 'reduce' }) } | Out-Null
  Esperar 700
  Confere 'movimento reduzido: nenhuma luz ou facho anima' (Js "getComputedStyle(document.querySelector('#luzes .lx')).animationName === 'none' && getComputedStyle(document.querySelector('#luzes .ly')).animationName === 'none' && getComputedStyle(document.querySelector('#cheio .facho')).animationName === 'none'")
  foreach ($p in @(@(100, 500), @(40, 700), @(20, 780))) { Passar $p[0] $p[1]; Esperar 60 }
  Js 'window.scrollTo(0, 400); 1' | Out-Null
  Esperar 900
  Confere 'movimento reduzido: nem o mouse nem a rolagem empurram as luzes' (([Math]::Abs([double](Js $pxLuzes)) -lt 0.05) -and (Js "document.getElementById('luzes').style.getPropertyValue('--sy') === ''"))
  Cmd 'Emulation.setEmulatedMedia' @{ features = @(@{ name = 'prefers-reduced-motion'; value = 'no-preference' }) } | Out-Null
  Esperar 700
  Confere 'sem a preferência de movimento reduzido tudo volta a animar' (Js "getComputedStyle(document.querySelector('#luzes .lx')).animationName === 'vagar-x'")
  Js 'window.scrollTo(0, 0); 1' | Out-Null

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
