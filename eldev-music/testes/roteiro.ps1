# Teste de ponta a ponta do Eldev Music: abre um Chrome invisível, clica de verdade e confere o resultado.
# Antes: iniciar o servidor (python servidor-dev.py). Depois:  powershell -File testes\roteiro.ps1
# Fotos e arquivos de teste vão para testes\saida\
param([string]$Url = 'http://localhost:8127/')
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.Encoding]::UTF8
. "$PSScriptRoot\cdp.ps1"
$script:falhas = 0
function Confere([string]$nome, $cond) {
  if ($cond) { "OK      $nome" } else { $script:falhas++; "FALHOU  $nome" }
}
# espera (até $max ms) a expressão JS ficar verdadeira: a rede do Audius às vezes demora
function Ate([string]$js, [int]$max = 15000) {
  for ($t = 0; $t -lt $max; $t += 500) { if (Js $js) { return $true }; Start-Sleep -Milliseconds 500 }
  return $false
}
$saida = Join-Path $PSScriptRoot 'saida'
python "$PSScriptRoot\gerar-teste.py" | Out-Null

try {
  # ================= celular =================
  Iniciar -W 390 -H 844 -Movel
  Ir $Url -Espera 5000
  Confere 'início: destaque, atalhos da coleção e paradas numeradas' (Ate "!!document.querySelector('.hero:not(.esq-hero)') && document.querySelectorAll('.figurinha').length >= 3 && document.querySelectorAll('.rank').length === 20 && document.querySelectorAll('.cartao').length > 20")
  Foto 'celular-inicio.png' | Out-Null

  Clicar '.cartao[data-acao=tocar]'
  Confere 'clicar numa música: toca de verdade' (Ate "document.body.classList.contains('som') && document.querySelector('.t-atual').textContent !== '0:00'")
  Confere 'mini player aparece e o card fica destacado' (Js "!document.getElementById('mini').hidden && document.querySelectorAll('.cartao.tocando').length >= 1")

  Clicar '.mini-info'
  Esperar 900
  Confere 'player em tela cheia abre' (Js "document.querySelector('#cheio').classList.contains('aberto')")
  Confere 'player cheio: disco, braço da vitrola e onda sonora' (Js "!!document.querySelector('#cheio .disco') && !!document.querySelector('#cheio .braco') && getComputedStyle(document.querySelector('#cheio .seek-linha')).getPropertyValue('--onda').includes('svg')")
  Foto 'celular-cheio.png' | Out-Null
  Clicar '#cheio .js-curtir'
  Confere 'favoritar salva' (Ate "(JSON.parse(localStorage.getItem('eldev-music:v1') || '{}').curtidas || []).length === 1" 5000)
  Clicar '#cheio [data-acao=fila]'
  Esperar 500
  Confere 'fila lista as músicas' (Js "document.querySelectorAll('#folha .faixa').length > 5")
  Foto 'celular-fila.png' | Out-Null
  Tecla 'Escape'
  Esperar 300
  Confere 'Esc fecha o menu' (Js "document.getElementById('folha').hidden")
  Js "history.back()" | Out-Null
  Esperar 800
  Confere 'botão Voltar do celular fecha o player' (Js "!document.querySelector('#cheio').classList.contains('aberto')")

  # ---- buscar ----
  Ir "$Url#/buscar" -Espera 1200
  Clicar '#q'
  Digitar 'lofi'
  Esperar 4500
  Confere 'busca traz músicas, artistas e playlists' (Ate "document.querySelectorAll('#resultado .faixa').length > 5 && document.querySelectorAll('#resultado .cartao.redondo').length > 0")
  Foto 'celular-busca.png' | Out-Null

  # ---- gênero, menu e playlist ----
  Ir "$Url#/genero/Lo-Fi" -Espera 3500
  Confere 'página de gênero lista 50 músicas' (Ate "document.querySelectorAll('.lista .faixa').length === 50")
  Clicar '.lista .faixa:nth-child(3) .mais'
  Esperar 500
  Clicar '[data-acao=m-playlist]'
  Esperar 400
  Clicar '[data-acao=m-nova]'
  Esperar 500
  Digitar 'Treino'
  Clicar '#dialogo button.primario'
  Confere 'criar playlist a partir do menu' (Ate "(() => { const p = JSON.parse(localStorage.getItem('eldev-music:v1') || '{}').playlists || []; return p.length === 1 && p[0].nome === 'Treino' && p[0].faixas.length === 1; })()" 5000)
  Ir "$Url#/biblioteca" -Espera 1200
  Confere 'biblioteca mostra a playlist' (Js "[...document.querySelectorAll('.faixa-txt b')].some(b => b.textContent === 'Treino')")
  Foto 'celular-biblioteca.png' | Out-Null

  # ---- arquivos do aparelho (com etiqueta ID3) ----
  Ir "$Url#/meus" -Espera 1500
  Arquivos '#arquivos' @("$saida\Fulano - Tom de 440.wav", "$saida\com-etiqueta.mp3")
  Ate "(JSON.parse(localStorage.getItem('eldev-music:v1') || '{}').meus || []).length === 2 && document.querySelectorAll('.lista .faixa-tocar').length === 2" 20000 | Out-Null
  Confere 'importar lê título e artista da etiqueta e do nome' (Js "(() => { const m = JSON.parse(localStorage.getItem('eldev-music:v1')).meus; return m.length === 2 && m[0].titulo === 'Título Real ção' && m[0].artista === 'Artista Real' && m[1].artista === 'Fulano'; })()")
  Clicar '.lista .faixa-tocar'
  Confere 'arquivo do aparelho toca' (Ate "document.body.classList.contains('som')" 6000)
  Foto 'celular-meus.png' | Out-Null

  # ---- voltar de onde parou ----
  $antes = Js "document.querySelector('.js-titulo').textContent"
  Ir "${Url}?recarga=1" -Espera 3500
  Confere 'depois de recarregar, o player volta parado na mesma música' (Js "!document.getElementById('mini').hidden && !document.body.classList.contains('som') && document.querySelector('.js-titulo').textContent === $($antes | ConvertTo-Json -Compress)")

  # ================= computador =================
  Tamanho 1280 800
  Ir "$Url#/" -Espera 3500
  Confere 'computador: barra no topo e player flutuante embaixo' (Js "getComputedStyle(document.querySelector('.abas')).position === 'sticky' && document.getElementById('mini').getBoundingClientRect().width <= 981")
  Foto 'desktop-inicio.png' | Out-Null

  # ================= erros =================
  $erros = @(Erros) | Where-Object { $_ -notmatch 'Failed to load resource' -and $_ -ne 'sem erros no console' }
  Confere 'nenhum erro de código no console (falhas de imagem do Audius não contam)' ($erros.Count -eq 0)
  $erros
} finally {
  Fechar
}
if ($script:falhas) { "`n$script:falhas verificação(ões) falharam"; exit 1 } else { "`nTudo certo." }
