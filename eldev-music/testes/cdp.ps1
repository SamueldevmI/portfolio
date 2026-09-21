# Mini-cliente do Chrome DevTools Protocol (PowerShell 5.1): abre o Chrome invisível, clica de verdade, espera, tira foto.
$script:chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$script:id = 0
$script:eventos = New-Object System.Collections.ArrayList
$script:ct = [Threading.CancellationToken]::None
$script:pasta = Join-Path $PSScriptRoot 'saida'

function Ler {
  $buf = New-Object byte[] 262144
  $sb = New-Object System.Text.StringBuilder
  do {
    $seg = New-Object 'System.ArraySegment[byte]' -ArgumentList (, $buf)
    $t = $script:ws.ReceiveAsync($seg, $script:ct)
    if (-not $t.Wait(60000)) { throw 'timeout esperando o Chrome' }
    $r = $t.Result
    [void]$sb.Append([Text.Encoding]::UTF8.GetString($buf, 0, $r.Count))
  } until ($r.EndOfMessage)
  $sb.ToString() | ConvertFrom-Json
}

function Cmd([string]$metodo, $params = @{}) {
  $script:id++
  $meu = $script:id
  $json = @{ id = $meu; method = $metodo; params = $params } | ConvertTo-Json -Depth 12 -Compress
  $bytes = [Text.Encoding]::UTF8.GetBytes($json)
  $seg = New-Object 'System.ArraySegment[byte]' -ArgumentList (, $bytes)
  $script:ws.SendAsync($seg, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $script:ct).Wait()
  while ($true) {
    $m = Ler
    if ($m.id -eq $meu) {
      if ($m.error) { throw ("CDP " + $metodo + ": " + ($m.error | ConvertTo-Json -Compress)) }
      return $m.result
    }
    elseif ($m.method) { [void]$script:eventos.Add($m) }
  }
}

function Tamanho([int]$w, [int]$h, [switch]$Movel, [double]$Dsf = 1) {
  Cmd 'Emulation.setDeviceMetricsOverride' @{ width = $w; height = $h; deviceScaleFactor = $Dsf; mobile = [bool]$Movel } | Out-Null
  Cmd 'Emulation.setTouchEmulationEnabled' @{ enabled = [bool]$Movel } | Out-Null
}

function Iniciar([int]$Porta = 9333, [int]$W = 390, [int]$H = 844, [switch]$Movel, [double]$Dsf = 1) {
  $script:perfil = Join-Path $script:pasta ('cdp-' + [guid]::NewGuid().ToString('N').Substring(0, 8))
  $script:proc = Start-Process $script:chrome -PassThru -ArgumentList @(
    '--headless=new', '--disable-gpu', "--remote-debugging-port=$Porta", "--user-data-dir=$($script:perfil)",
    '--autoplay-policy=no-user-gesture-required', '--no-first-run', '--window-size=1280,900', 'about:blank')
  $alvo = $null
  for ($i = 0; $i -lt 60 -and -not $alvo; $i++) {
    Start-Sleep -Milliseconds 250
    try { $alvo = (Invoke-RestMethod "http://127.0.0.1:$Porta/json/list") | Where-Object { $_.type -eq 'page' } | Select-Object -First 1 } catch { }
  }
  if (-not $alvo) { throw 'Chrome não respondeu' }
  $script:ws = New-Object System.Net.WebSockets.ClientWebSocket
  $script:ws.ConnectAsync([uri]$alvo.webSocketDebuggerUrl, $script:ct).Wait()
  Cmd 'Runtime.enable' | Out-Null
  Cmd 'Log.enable' | Out-Null
  Cmd 'Page.enable' | Out-Null
  Tamanho $W $H -Movel:$Movel -Dsf $Dsf
}

function Fechar {
  try { $script:ws.Dispose() } catch { }
  try { Stop-Process -Id $script:proc.Id -Force -ErrorAction SilentlyContinue } catch { }
  Start-Sleep -Milliseconds 400
  Remove-Item $script:perfil -Recurse -Force -ErrorAction SilentlyContinue
}

function Js([string]$expr) {
  $r = Cmd 'Runtime.evaluate' @{ expression = $expr; returnByValue = $true; awaitPromise = $true }
  if ($r.exceptionDetails) { throw ("JS: " + $r.exceptionDetails.text + " " + $r.exceptionDetails.exception.description) }
  return $r.result.value
}

function Ir([string]$url, [int]$Espera = 500) {
  Cmd 'Page.navigate' @{ url = $url } | Out-Null
  for ($i = 0; $i -lt 80; $i++) {
    Start-Sleep -Milliseconds 250
    try { if ((Js 'document.readyState') -eq 'complete') { break } } catch { }
  }
  Start-Sleep -Milliseconds $Espera
}

function Esperar([int]$ms) { Start-Sleep -Milliseconds $ms }

function Clicar([string]$sel) {
  $expr = "(()=>{const e=document.querySelector(" + ($sel | ConvertTo-Json -Compress) + ");if(!e)return null;e.scrollIntoView({block:'center',behavior:'instant'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()"
  $p = Js $expr
  if (-not $p) { throw "Clicar: sem elemento $sel" }
  Cmd 'Input.dispatchMouseEvent' @{ type = 'mouseMoved'; x = $p.x; y = $p.y } | Out-Null
  Cmd 'Input.dispatchMouseEvent' @{ type = 'mousePressed'; x = $p.x; y = $p.y; button = 'left'; clickCount = 1 } | Out-Null
  Cmd 'Input.dispatchMouseEvent' @{ type = 'mouseReleased'; x = $p.x; y = $p.y; button = 'left'; clickCount = 1 } | Out-Null
}

# arrastar com o mouse: Pressionar, vários Mover e Soltar (o botão fica apertado durante o arrasto)
function Pressionar([double]$x, [double]$y) {
  Cmd 'Input.dispatchMouseEvent' @{ type = 'mouseMoved'; x = $x; y = $y } | Out-Null
  Cmd 'Input.dispatchMouseEvent' @{ type = 'mousePressed'; x = $x; y = $y; button = 'left'; buttons = 1; clickCount = 1 } | Out-Null
}
function Mover([double]$x, [double]$y) {
  Cmd 'Input.dispatchMouseEvent' @{ type = 'mouseMoved'; x = $x; y = $y; buttons = 1 } | Out-Null
}
function Soltar([double]$x, [double]$y) {
  Cmd 'Input.dispatchMouseEvent' @{ type = 'mouseReleased'; x = $x; y = $y; button = 'left'; buttons = 0; clickCount = 1 } | Out-Null
}

# só passar o mouse por cima (sem apertar nenhum botão)
function Passar([double]$x, [double]$y) {
  Cmd 'Input.dispatchMouseEvent' @{ type = 'mouseMoved'; x = $x; y = $y; buttons = 0 } | Out-Null
}

function Digitar([string]$texto) {
  Cmd 'Input.insertText' @{ text = $texto } | Out-Null
}

function Tecla([string]$chave, [string]$codigo = '') {
  if (-not $codigo) { $codigo = $chave }
  Cmd 'Input.dispatchKeyEvent' @{ type = 'keyDown'; key = $chave; code = $codigo } | Out-Null
  Cmd 'Input.dispatchKeyEvent' @{ type = 'keyUp'; key = $chave; code = $codigo } | Out-Null
}

function Arquivos([string]$sel, [string[]]$caminhos) {
  $doc = Cmd 'DOM.getDocument' @{ depth = 0 }
  $no = Cmd 'DOM.querySelector' @{ nodeId = $doc.root.nodeId; selector = $sel }
  Cmd 'DOM.setFileInputFiles' @{ files = @($caminhos); nodeId = $no.nodeId } | Out-Null
}

function Foto([string]$arquivo) {
  $r = Cmd 'Page.captureScreenshot' @{ format = 'png' }
  $caminho = Join-Path $script:pasta $arquivo
  [IO.File]::WriteAllBytes($caminho, [Convert]::FromBase64String($r.data))
  "foto: $caminho"
}

function Erros {
  $achou = 0
  foreach ($e in $script:eventos) {
    $txt = $null
    if ($e.method -eq 'Runtime.exceptionThrown') { $txt = 'EXCECAO: ' + $e.params.exceptionDetails.text + ' ' + $e.params.exceptionDetails.exception.description }
    elseif ($e.method -eq 'Runtime.consoleAPICalled' -and $e.params.type -eq 'error') { $txt = 'console.error: ' + (($e.params.args | ForEach-Object { $_.value }) -join ' ') }
    elseif ($e.method -eq 'Log.entryAdded' -and $e.params.entry.level -eq 'error') { $txt = 'log: ' + $e.params.entry.text + ' ' + $e.params.entry.url }
    if ($txt) { $achou++; $txt }
  }
  if (-not $achou) { 'sem erros no console' }
  $script:eventos.Clear()
}
