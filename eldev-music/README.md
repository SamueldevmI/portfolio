# Eldev Music

App de música que funciona como site e como app instalado (celular e computador).
As músicas vêm do **Audius** (catálogo grátis, músicas inteiras, sem cadastro). Você também pode colocar as suas próprias músicas.

Feito com HTML, CSS e JavaScript puros (sem framework e sem etapa de build).

## Ver funcionando

```
python servidor-dev.py
```

Abra http://localhost:8127. O servidor não guarda cache, então o que você muda no código aparece ao recarregar.

## O que tem

- **Início:** destaque grande, atalhos da coleção, paradas numeradas e prateleiras por gênero
- **Buscar:** músicas, artistas e playlists, com buscas recentes e navegação por gênero
- **Coleção:** favoritas, playlists suas e as playlists que você salvar
- **Player:** fila, aleatório, repetir, tela cheia com disco de vinil girando e onda sonora como barra de progresso, controles na tela de bloqueio do celular, teclado no computador (espaço e setas)
- **Girar o disco:** arrastar o vinil em círculo avança ou volta a música (uma volta = 30 s); arrastar o braço da vitrola escolhe o ponto; um toque no disco toca ou pausa. O braço anda sozinho conforme a música toca
- **Rádio infinita:** quando a lista acaba, continua com músicas parecidas (mesmo gênero, BPM parecido, mesmo clima, tons que combinam). Dá pra desligar no player
- **Timer de sono:** pausa sozinho em 15, 30, 45 min, 1 hora ou ao fim da música, com o volume descendo no final
- **Garimpo:** músicas boas de artistas que quase ninguém ouviu ainda
- **Baixar pra ouvir sem internet:** numa música, numa playlist ou nas favoritas. Fica em "Baixadas" e toca com o app sem internet
- **Playlist em link:** manda uma playlist por link; quem abre vê a lista e salva na própria coleção (sem conta e sem servidor: as músicas vão dentro do link)
- **No aparelho:** arquivos seus (mp3, m4a, flac, ogg, wav). O mp3 traz título, artista e capa da própria etiqueta
- Instala como app e abre sem internet (o catálogo do Audius precisa de internet; suas músicas baixadas e as do aparelho não)
- Favoritas, playlists e histórico ficam só no aparelho, sem login

## Pastas

| Onde | O quê |
|---|---|
| `index.html`, `style.css` | a página e o visual |
| `js/` | o código (cada arquivo tem uma função só: `player.js` toca, `audius.js` busca, `telas.js` desenha as telas...) |
| `sw.js`, `manifest.webmanifest` | fazem virar app e abrir sem internet |
| `icons/`, `gerar-icones.py` | ícones do app (para mudar o logo, mude o desenho no script e rode `python gerar-icones.py`) |
| `screenshots/` | imagens que o Android mostra na tela de instalação (sem capas de artistas) |
| `testes/` | testes automáticos com o servidor ligado: `powershell -File testes\roteiro.ps1` (o app todo) e `testes\roteiro-novidades.ps1` (disco, timer, rádio, downloads, garimpo, link) |

**Ao mudar qualquer arquivo do app**, aumente o número em `VERSAO` no `sw.js`, senão quem já instalou continua com a versão antiga guardada.

## Instalar no celular (sem APK)

Abra o endereço do site no Chrome do Android, menu (três pontos) → **Instalar app**. Vira um ícone na tela inicial, sem barra do navegador.
No iPhone: Safari → Compartilhar → **Adicionar à Tela de Início**.
(Isso exige o site publicado num endereço `https://`. Em `localhost` só funciona no próprio computador.)

## Gerar o APK

1. Com o site publicado num endereço https, abrir https://www.pwabuilder.com e colar o endereço.
2. Escolher **Package for stores → Android**.
3. Baixar o pacote: vem o `.apk` para instalar direto no celular e o arquivo de chave (**guarde a chave**, sem ela não dá pra atualizar o app depois).
4. No celular, abrir o `.apk` e permitir instalar de "fontes desconhecidas".

Para colocar na Play Store precisa de conta de desenvolvedor do Google (pagamento único).

**Barra de endereço no app:** o APK do PWABuilder abre o site dentro do Chrome. Pra esconder a barra de endereço, o Android confere um arquivo `.well-known/assetlinks.json` na **raiz do domínio** (aqui seria em `samueldevmi.github.io/.well-known/`, que fica no repositório `SamueldevmI.github.io`, não neste). Sem esse arquivo o app funciona igual, só que mostra uma barra fina no topo.

## Testar no celular de verdade (o que os testes automáticos não cobrem)

1. Abrir o endereço no Chrome do Android e instalar (menu → Instalar app).
2. Tocar uma música e bloquear a tela: os botões de tocar/pausar/próxima devem aparecer na tela de bloqueio e a música continuar.
3. Baixar uma música, ligar o modo avião e tocar ela em "Baixadas".
4. No player em tela cheia, girar o disco com o dedo e arrastar o braço da vitrola.
5. Timer de sono de 15 min: conferir a lua com o tempo que falta e a música pausando.

## Observações

- O catálogo é de artistas independentes do Audius, então não tem as músicas famosas.
- Projeto de portfólio, sem fins comerciais.
