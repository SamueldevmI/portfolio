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
- **No aparelho:** arquivos seus (mp3, m4a, flac, ogg, wav). O mp3 traz título, artista e capa da própria etiqueta
- Instala como app e abre sem internet (o catálogo do Audius precisa de internet; suas músicas do aparelho não)
- Favoritas, playlists e histórico ficam só no aparelho, sem login

## Pastas

| Onde | O quê |
|---|---|
| `index.html`, `style.css` | a página e o visual |
| `js/` | o código (cada arquivo tem uma função só: `player.js` toca, `audius.js` busca, `telas.js` desenha as telas...) |
| `sw.js`, `manifest.webmanifest` | fazem virar app e abrir sem internet |
| `icons/`, `gerar-icones.py` | ícones do app (para mudar o logo, mude o desenho no script e rode `python gerar-icones.py`) |
| `testes/` | teste automático: `powershell -File testes\roteiro.ps1` (com o servidor ligado) |

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

## Observações

- O catálogo é de artistas independentes do Audius, então não tem as músicas famosas.
- Projeto de portfólio, sem fins comerciais.
