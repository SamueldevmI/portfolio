# Teste das novidades do Eldev Music: garimpo, vitrola (girar o disco e o braço), timer de sono,
# rádio infinita, downloads sem internet e playlist em link.
# Antes: iniciar o servidor (python servidor-dev.py). Depois:  powershell -File testes\roteiro-novidades.ps1
param([string]$Url = 'http://localhost:8127/')
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.Encoding]::UTF8
. "$PSScriptRoot\cdp.ps1"
$script:falhas = 0
function Confere([string]$nome, $cond) {
  if ($cond) { "OK      $nome" } else { $script:falhas++; "FALHOU  $nome" }
}
function Ate([string]$js, [int]$max = 15000) {
  for ($t = 0; $t -lt $max; $t += 500) { if (Js $js) { return $true }; Start-Sleep -Milliseconds 500 }
  return $false
}
$tempoAtual = "import('./js/player.js').then(p => p.tempo().t)"

try {
  Iniciar -W 390 -H 844 -Movel
  Ir $Url -Espera 4000

  # ================= garimpo =================
  Ir "$Url#/garimpo" -Espera 3000
  Confere 'garimpo: lista músicas de artistas pequenos, com o número de plays' (Ate "document.querySelectorAll('.lista .faixa').length >= 15 && /plays/.test(document.querySelector('.lista .faixa-txt span').textContent)")
  Foto 'nov-garimpo.png' | Out-Null

  # ================= tocar uma música e abrir o player =================
  Ir "$Url#/genero/Lo-Fi" -Espera 3000
  Ate "document.querySelectorAll('.lista .faixa').length === 50" | Out-Null
  Clicar '.lista .faixa-tocar'
  Confere 'música toca' (Ate "document.body.classList.contains('som') && document.querySelector('.t-total').textContent !== '0:00'" 25000)
  Clicar '.mini-info'
  Esperar 1200

  # ================= vitrola: girar o disco =================
  $g = (Js "(() => { const d = document.querySelector('#cheio .palco .disco').getBoundingClientRect(); return JSON.stringify({cx: d.x + d.width / 2, cy: d.y + d.height / 2, r: d.width / 2}); })()") | ConvertFrom-Json
  $t0 = [double](Js $tempoAtual)
  $rr = $g.r * 0.7
  Pressionar ($g.cx + $rr) $g.cy
  foreach ($a in 10, 20, 30, 40, 50, 60, 70, 80, 90) {
    $rad = $a * [Math]::PI / 180
    Mover ($g.cx + $rr * [Math]::Cos($rad)) ($g.cy + $rr * [Math]::Sin($rad))
  }
  Foto 'nov-girando.png' | Out-Null
  Soltar $g.cx ($g.cy + $rr)
  Esperar 700
  $t1 = [double](Js $tempoAtual)
  Confere "girar o disco 1/4 de volta pra frente avança uns 7,5 s (foi de $([Math]::Round($t0,1)) para $([Math]::Round($t1,1)))" (($t1 - $t0) -gt 5 -and ($t1 - $t0) -lt 12)

  $t0 = $t1
  Pressionar ($g.cx + $rr) $g.cy
  foreach ($a in -10, -20, -30, -40, -50, -60, -70, -80, -90) {
    $rad = $a * [Math]::PI / 180
    Mover ($g.cx + $rr * [Math]::Cos($rad)) ($g.cy + $rr * [Math]::Sin($rad))
  }
  Soltar $g.cx ($g.cy - $rr)
  Esperar 700
  $t1 = [double](Js $tempoAtual)
  Confere "girar pra trás volta uns 7,5 s (foi de $([Math]::Round($t0,1)) para $([Math]::Round($t1,1)))" (($t0 - $t1) -gt 4 -and ($t0 - $t1) -lt 12)

  # um toque no disco pausa e toca
  Clicar '#cheio .palco .disco'
  Esperar 500
  Confere 'um toque no disco pausa' (Js "!document.body.classList.contains('som')")
  Clicar '#cheio .palco .disco'
  Esperar 700
  Confere 'outro toque no disco volta a tocar' (Ate "document.body.classList.contains('som')" 6000)

  # ================= vitrola: arrastar o braço =================
  Clicar '#cheio .js-play'          # pausa: o braço sobe pra posição de repouso (-24°)
  Esperar 1400
  $pv = (Js "(() => { const p = document.querySelector('#cheio .pivo').getBoundingClientRect(); const w = document.querySelector('#cheio .palco').getBoundingClientRect().width; return JSON.stringify({x: p.x + p.width / 2, y: p.y + p.height / 2, w: w}); })()") | ConvertFrom-Json
  $s = 0.34 * $pv.w / 120
  $th = -24 * [Math]::PI / 180
  $x0 = $pv.x - 40 * $s * [Math]::Sin($th)
  $y0 = $pv.y + 40 * $s * [Math]::Cos($th)
  $dur = [double](Js "import('./js/player.js').then(p => p.tempo().d)")
  Pressionar $x0 $y0
  foreach ($ang in 118, 121, 124.25) {
    $rad = $ang * [Math]::PI / 180
    Mover ($pv.x + 130 * $s * [Math]::Cos($rad)) ($pv.y + 130 * $s * [Math]::Sin($rad))
  }
  $radF = 124.25 * [Math]::PI / 180
  Soltar ($pv.x + 130 * $s * [Math]::Cos($radF)) ($pv.y + 130 * $s * [Math]::Sin($radF))
  Esperar 700
  $t1 = [double](Js $tempoAtual)
  $esperado = (10 + 18) / 36 * ($dur - 0.5)
  Confere "arrastar o braço até +10° leva a ~78% da música (foi pra $([Math]::Round($t1,1)) s, esperado perto de $([Math]::Round($esperado,1)))" ([Math]::Abs($t1 - $esperado) -lt [Math]::Max(4, $dur * 0.04))
  Foto 'nov-braco.png' | Out-Null
  Clicar '#cheio .js-play'          # volta a tocar
  Ate "document.body.classList.contains('som')" 6000 | Out-Null

  # ================= timer de sono =================
  Clicar '#cheio .js-timer'
  Esperar 500
  Confere 'timer: o menu abre com as opções' (Js "document.querySelectorAll('#folha .item').length >= 5")
  Foto 'nov-timer.png' | Out-Null
  Clicar '#folha .item[data-q="15"]'
  Confere 'timer: 15 min mostra o tempo que falta no botão da lua' (Ate "!document.querySelector('#cheio .selo').hidden && /^1[45]m$/.test(document.querySelector('#cheio .selo').textContent)" 4000)
  Clicar '#cheio .js-timer'
  Ate "[...document.querySelectorAll('#folha .item')].some(i => i.dataset.q === '0')" 4000 | Out-Null
  Clicar '#folha .item[data-q="0"]'
  Confere 'timer: desligar tira o selo' (Ate "document.querySelector('#cheio .selo').hidden" 3000)
  # timer curto de verdade (3 s): pausa sozinho
  Js "import('./js/player.js').then(p => { p.definirTimer(0.05); return 1; })" | Out-Null
  Confere 'timer curto pausa a música sozinho' (Ate "import('./js/player.js').then(p => p.estado().tocando === false)" 9000)
  Js "import('./js/player.js').then(p => { p.tocarAgora(); return 1; })" | Out-Null

  # ================= rádio infinita =================
  Clicar '#cheio .js-radio'
  Confere 'rádio: o botão desliga' (Js "document.querySelector('#cheio .js-radio').getAttribute('aria-pressed') === 'false'")
  Clicar '#cheio .js-radio'
  Confere 'rádio: o botão liga de novo' (Js "document.querySelector('#cheio .js-radio').getAttribute('aria-pressed') === 'true'")
  $rj = @'
(async () => { const p = await import('./js/player.js'); const a = await import('./js/audius.js'); const fs = await a.emAlta({ limite: 8 }); p.tocarLista([fs[0]]); return fs[0].titulo; })()
'@
  Js $rj | Out-Null
  Confere 'rádio: tocando uma música só, a fila cresce sozinha com músicas parecidas' (Ate "import('./js/player.js').then(p => p.estado().lista.length >= 6 && p.estado().lista.some(f => f.radio))" 30000)
  Clicar '#cheio [data-acao=fila]'
  Esperar 600
  Confere 'rádio: a fila mostra o aviso "Da rádio"' (Js "!!document.querySelector('#folha .fila-sep')")
  Foto 'nov-fila-radio.png' | Out-Null
  Tecla 'Escape'
  Esperar 300
  Js "history.back()" | Out-Null
  Esperar 800

  # ================= download e sem internet =================
  Ir "$Url#/genero/Lo-Fi" -Espera 3000
  Ate "document.querySelectorAll('.lista .faixa').length === 50" | Out-Null
  Clicar '.lista .faixa:nth-child(2) .mais'
  Esperar 500
  Clicar '[data-acao=m-baixar]'
  Confere 'download: a música fica guardada no aparelho' (Ate "(JSON.parse(localStorage.getItem('eldev-music:v1') || '{}').baixadas || []).length === 1" 45000)
  $idb = Js "import('./js/store.js').then(s => import('./js/db.js').then(d => d.lerArquivo(s.baixadas()[0].id))).then(b => b ? b.size : 0)"
  Confere "download: o áudio está no IndexedDB ($([Math]::Round([double]$idb / 1MB, 1)) MB)" ([double]$idb -gt 500000)
  Confere 'download: a lista mostra o ✓ de baixada' (Ate "document.querySelectorAll('.lista .faixa.baixada').length === 1" 5000)
  Foto 'nov-baixada.png' | Out-Null
  Cmd 'Network.enable' | Out-Null
  Cmd 'Network.emulateNetworkConditions' @{ offline = $true; latency = 0; downloadThroughput = -1; uploadThroughput = -1 } | Out-Null
  Ir "$Url#/baixadas" -Espera 1500
  Confere 'baixadas: a tela mostra a música e o tamanho em MB' (Js "document.querySelectorAll('.lista .faixa').length === 1 && /MB/.test(document.querySelector('.colecao-info .sub').textContent)")
  Clicar '.lista .faixa-tocar'
  Confere 'SEM INTERNET: a música baixada toca' (Ate "document.body.classList.contains('som') && document.querySelector('.t-atual').textContent !== '0:00'" 15000)
  Foto 'nov-offline.png' | Out-Null
  Cmd 'Network.emulateNetworkConditions' @{ offline = $false; latency = 0; downloadThroughput = -1; uploadThroughput = -1 } | Out-Null
  Js "import('./js/player.js').then(p => { p.pausar(); return 1; })" | Out-Null

  # ================= playlist em link =================
  $lj = @'
(async () => { const s = await import('./js/store.js'); const a = await import('./js/audius.js'); const c = await import('./js/compartilhar.js'); const fs = await a.emAlta({ limite: 6 }); const p = s.criarPlaylist('Meu mix', fs.slice(0, 3)); return c.paraLink(p.nome, p.faixas).url; })()
'@
  $link = Js $lj
  Confere 'link: o endereço da playlist foi gerado' ($link -match '#/importar/')
  Ir $link -Espera 3500
  Confere 'link: quem abre vê a playlist do amigo com as 3 músicas' (Ate "document.querySelector('h1')?.textContent === 'Meu mix' && document.querySelectorAll('.lista .faixa').length === 3" 12000)
  Foto 'nov-link.png' | Out-Null
  Clicar '[data-acao=salvar-importada]'
  Confere 'link: "Salvar" cria uma playlist nova na coleção' (Ate "JSON.parse(localStorage.getItem('eldev-music:v1')).playlists.length === 2" 5000)
  Ir "$Url#/importar/lixo-que-nao-e-link" -Espera 1500
  Confere 'link: um link quebrado mostra aviso em vez de erro' (Js "/não parece ser de uma playlist/.test(document.body.innerText)")
  Ir "$Url#/biblioteca" -Espera 1000
  Ir "$Url#/curtidas" -Espera 800

  $erros = @(Erros) | Where-Object { $_ -notmatch 'Failed to load resource' -and $_ -ne 'sem erros no console' }
  Confere 'nenhum erro de código no console' ($erros.Count -eq 0)
  $erros
} finally {
  Fechar
}
if ($script:falhas) { "`n$script:falhas verificação(ões) falharam"; exit 1 } else { "`nTudo certo." }
