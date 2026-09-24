/* Música de fundo: uma trilha animada e curiosa (clima de "descobrindo algo legal"), tocada pelo
   próprio navegador (Web Audio), sem arquivo de áudio. Não pesa no carregamento e não tem direito
   autoral envolvido. Pra trocar por uma música de verdade, dá pra usar um <audio> no lugar do sintetizador.

   Como ela é: 112 BPM em dó maior, marimba saltitante fazendo arpejos, baixo pulando, palma e chocalho
   leves e um sininho com uma melodia que gruda. Um ciclo tem 8 compassos (Dó–Lám–Fá–Sol–Dó–Mim–Fá–Sol).
   Cada seção da página tem um clima (ver CLIMAS), e a música vai se misturando entre eles conforme a
   rolagem: cada grupo de instrumentos tem o próprio volume, que sobe e desce devagar.

   Regras:
   - O navegador não deixa tocar som antes de a pessoa interagir, então a música começa no primeiro
     clique/toque/tecla na página, no computador e no celular. Como é gerada no próprio aparelho, não
     gasta internet.
   - O ícone no topo liga e desliga só a música (os efeitos de clique, cards e orçamento continuam), e a
     escolha fica guardada neste aparelho.
   - Pausa sozinha quando a aba fica escondida e quando uma demo abre na janelinha (a demo pode ter
     som próprio, como o Eldev Music), e volta quando fecha. */
(function () {
    "use strict";
    const botao = document.getElementById("botaoSom");
    const Contexto = window.AudioContext || window.webkitAudioContext;
    if (!botao || !Contexto) return;
    botao.hidden = false;

    const CHAVE = "portfolio-musica"; // "on" | "off"
    const CHAVE_AVISO = "portfolio-musica-avisou";
    const ler = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
    const gravar = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* sem armazenamento: só não lembra */ } };

    // De noite (19h às 6h) a música fica um pouco mais lenta, mais abafada e com mais cordas
    const HORA = new Date().getHours();
    const NOITE = HORA >= 19 || HORA < 6;
    const BPM = NOITE ? 100 : 112;
    const BATIDA = 60 / BPM;
    const COMPASSO = BATIDA * 4;
    const CHAVE_VOLUME = "portfolio-musica-volume";
    let volume = Math.min(1, Math.max(0, Number(ler(CHAVE_VOLUME) || 0.5)));
    const NIVEL_MUSICA = 0.42; // a música fica abaixo dos efeitos de clique, toque, cards e orçamento
    const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

    // Dó – Lám – Fá – Sol – Dó – Mim – Fá – Sol (um compasso cada)
    const ACORDES = [
        { baixo: 36, notas: [60, 64, 67, 72] },
        { baixo: 45, notas: [57, 60, 64, 69] },
        { baixo: 41, notas: [57, 60, 65, 69] },
        { baixo: 43, notas: [59, 62, 67, 71] },
        { baixo: 36, notas: [60, 64, 67, 72] },
        { baixo: 40, notas: [59, 64, 67, 71] },
        { baixo: 41, notas: [57, 60, 65, 69] },
        { baixo: 43, notas: [59, 62, 67, 71] },
    ];
    // Melodia de 8 compassos: [tempo dentro do compasso, nota, duração em tempos]
    const MELODIA = [
        [[0, 76, .5], [.5, 79, .5], [1, 81, .5], [1.5, 79, .5], [2.5, 76, .5], [3, 74, .5], [3.5, 72, .5]],
        [[0, 76, 1], [1.5, 72, .5], [2, 74, 1], [3, 76, .5]],
        [[0, 77, .5], [.5, 81, .5], [1, 84, .5], [1.5, 81, .5], [2.5, 79, .5], [3, 77, .5], [3.5, 76, .5]],
        [[0, 74, 1.5], [2, 79, .5], [2.5, 81, .5], [3, 83, 1]],
        [[0, 76, .5], [.5, 79, .5], [1, 81, .5], [1.5, 79, .5], [2.5, 76, .5], [3, 74, .5], [3.5, 72, .5]],
        [[0, 79, 1], [1.5, 76, .5], [2, 79, .5], [2.5, 83, 1.5]],
        [[0, 84, .5], [.5, 81, .5], [1, 77, .5], [1.5, 81, .5], [2, 84, 1], [3, 86, 1]],
        [[0, 83, .5], [.5, 79, .5], [1, 74, .5], [2, 79, 2]],
    ];
    // Parte B (tipo refrão), a cada terceiro ciclo: Lám – Fá – Dó – Sol – Lám – Fá – Rém – Sol7, melodia mais longa
    const ACORDES_B = [
        { baixo: 45, notas: [57, 60, 64, 69] },
        { baixo: 41, notas: [57, 60, 65, 69] },
        { baixo: 48, notas: [55, 60, 64, 67] },
        { baixo: 43, notas: [55, 59, 62, 67] },
        { baixo: 45, notas: [57, 60, 64, 69] },
        { baixo: 41, notas: [57, 60, 65, 69] },
        { baixo: 38, notas: [57, 62, 65, 69] },
        { baixo: 43, notas: [59, 62, 65, 71] },
    ];
    const MELODIA_B = [
        [[0, 81, 1.5], [2, 79, .5], [2.5, 76, 1.5]],
        [[0, 77, 1], [1, 76, .5], [1.5, 72, 2]],
        [[0, 79, .5], [.5, 76, .5], [1, 72, 1], [2, 76, .5], [2.5, 79, 1.5]],
        [[0, 74, 1], [1, 79, 1], [2, 83, 2]],
        [[0, 84, 1.5], [2, 81, .5], [2.5, 76, 1.5]],
        [[0, 77, 1], [1, 81, .5], [1.5, 84, 2]],
        [[0, 86, 1], [1, 84, .5], [1.5, 81, 1], [2.5, 77, 1]],
        [[0, 79, 1], [1, 83, 1], [2, 86, 2]],
    ];
    const ARPEJO = [0, 2, 1, 3, 2, 1, 3, 2]; // ordem das notas do acorde nas 8 colcheias

    // Clima de cada parte da página: o volume de cada grupo de instrumentos (0 = calado) e o quanto o som
    // fica aberto (filtro). "fraco" = as notas de contratempo da marimba; "rara" = melodia só com notas
    // longas e espaçadas. Entre uma seção e outra os valores se misturam aos poucos conforme a rolagem.
    const CLIMAS = {
        inicio:    { pad: 1,   marimba: 1,    fraco: 1, baixo: 1,    bumbo: 1,    palma: 1,   chocalho: 1,   melodia: .75, rara: 0, brilho: 0, filtro: 9000 },  // animado
        sobre:     { pad: 1.4, marimba: .75,  fraco: 1, baixo: .6,   bumbo: 0,    palma: 0,   chocalho: .35, melodia: 0,   rara: 0, brilho: 0, filtro: 3200 },  // íntimo
        projetos:  { pad: 1,   marimba: 1,    fraco: 1, baixo: 1,    bumbo: 1,    palma: 1,   chocalho: 1,   melodia: 1,   rara: 0, brilho: 1, filtro: 10000 }, // descoberta
        servicos:  { pad: .8,  marimba: .9,   fraco: 1, baixo: 1.25, bumbo: 1.1,  palma: 1.4, chocalho: .9,  melodia: 0,   rara: 0, brilho: 0, filtro: 7500 },  // confiante
        orcamento: { pad: 1,   marimba: .7,   fraco: 1, baixo: .8,   bumbo: .6,   palma: 0,   chocalho: .4,  melodia: 0,   rara: 0, brilho: 0, filtro: 5000 },  // foco
        jornada:   { pad: 1.8, marimba: .6,   fraco: 0, baixo: .5,   bumbo: 0,    palma: 0,   chocalho: 0,   melodia: .8,  rara: 1, brilho: 0, filtro: 2800 },  // nostálgico
        contato:   { pad: 1.2, marimba: 1.05, fraco: 1, baixo: 1.1,  bumbo: 1.05, palma: 1.2, chocalho: 1,   melodia: 1,   rara: 0, brilho: 1, filtro: 10000 }, // final
    };
    const SECAO_CLIMA = { inicio: "inicio", "sobre-mim": "sobre", projetos: "projetos", "mais-projetos": "projetos", servicos: "servicos", orcamento: "orcamento", jornada: "jornada", contato: "contato" };
    const GRUPOS = ["pad", "marimba", "fraco", "baixo", "bumbo", "palma", "chocalho", "melodia", "brilho"];
    let mix = Object.assign({}, CLIMAS.inicio);
    let energia = 0; // 0 = parado lendo, 1 = rolando rápido
    let filtroMestre = null;
    const grupo = {}; // um GainNode por grupo de instrumentos
    let efeitos = null; // efeitos de interação (cliques, cards, orçamento): não dependem do clima da seção
    let musicaBus = null; // só a música passa por aqui: o botão de som zera este, e os efeitos continuam
    const linhaDoTempo = []; // últimos compassos agendados, pra saber qual acorde está tocando agora

    let ctx = null, mestre = null, saida = null, ruido = null;
    let tocando = false, pausadoPorFora = false, relogio = 0, proximo = 0, indice = 0;

    function montar() {
        // iPhone: sem isso, a chavinha do modo silencioso emudece o áudio da página mesmo com volume alto
        try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) { /* navegador sem suporte */ }
        ctx = new Contexto();
        const filtro = ctx.createBiquadFilter();
        filtro.type = "lowpass";
        filtroMestre = filtro;
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = -16;
        compressor.ratio.value = 3;
        saida = ctx.createGain();
        saida.gain.value = 0;
        mestre = ctx.createGain();
        mestre.gain.value = 1;
        musicaBus = ctx.createGain();
        musicaBus.gain.value = 0;
        musicaBus.connect(mestre);
        mestre.connect(filtro).connect(compressor).connect(saida).connect(ctx.destination);
        mix = misturaAtual();
        filtro.frequency.value = mix.filtro * (NOITE ? 0.8 : 1);
        efeitos = ctx.createGain();
        efeitos.gain.value = 1.25;
        efeitos.connect(compressor); // sem o filtro da seção: efeito sempre nítido
        GRUPOS.forEach((nome) => {
            grupo[nome] = ctx.createGain();
            grupo[nome].gain.value = volumeDoGrupo(nome, mix);
            grupo[nome].connect(musicaBus);
        });

        ruido = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        const dados = ruido.getChannelData(0);
        for (let i = 0; i < dados.length; i++) dados[i] = Math.random() * 2 - 1;
    }

    function envelope(ganho, t, ataque, pico, duracao) {
        ganho.gain.setValueAtTime(0.0001, t);
        ganho.gain.linearRampToValueAtTime(pico, t + ataque);
        ganho.gain.exponentialRampToValueAtTime(0.0001, t + duracao);
    }

    function tom(freq, tipo, t, ataque, pico, duracao, destino) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = tipo;
        o.frequency.value = freq;
        envelope(g, t, ataque, pico, duracao);
        o.connect(g).connect(destino || mestre);
        o.start(t);
        o.stop(t + duracao + 0.05);
    }

    function marimba(nota, t, forca, destino) {
        // madeira: fundamental curtinha + o harmônico agudo típico da marimba (4x), que some rápido
        const f = midi(nota);
        tom(f, "sine", t, 0.004, 0.09 * forca, 0.42, destino);
        tom(f * 4, "sine", t, 0.002, 0.018 * forca, 0.07, destino);
    }

    function sino(nota, t, duracao, forca, destino) {
        // glockenspiel: fundamental brilhante + parcial inarmônico (2,76x), com cauda longa
        const f = midi(nota);
        tom(f, "sine", t, 0.003, 0.075 * forca, Math.max(0.5, duracao * BATIDA + 0.4), destino);
        tom(f * 2.76, "sine", t, 0.002, 0.02 * forca, 0.25, destino);
        tom(f * 2, "triangle", t, 0.003, 0.012 * forca, 0.4, destino);
    }

    function pad(notas, t, destino) {
        // cordas bem baixinhas por trás, só pra preencher
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.008, t + 0.3);
        g.gain.setValueAtTime(0.008, t + COMPASSO - 0.2);
        g.gain.linearRampToValueAtTime(0.0001, t + COMPASSO + 0.1);
        const f = ctx.createBiquadFilter();
        f.type = "lowpass";
        f.frequency.value = 1600;
        g.connect(f).connect(destino);
        notas.forEach((n) => {
            const o = ctx.createOscillator();
            o.type = "sawtooth";
            o.frequency.value = midi(n);
            o.detune.value = (Math.random() - 0.5) * 12;
            o.connect(g);
            o.start(t);
            o.stop(t + COMPASSO + 0.2);
        });
    }

    function baixo(nota, t, duracao, destino) {
        // baixo curtinho e redondo, que "pula"
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        const f = ctx.createBiquadFilter();
        o.type = "triangle";
        o.frequency.value = midi(nota);
        f.type = "lowpass";
        f.frequency.value = 700;
        envelope(g, t, 0.01, 0.26, duracao);
        o.connect(f).connect(g).connect(destino);
        o.start(t);
        o.stop(t + duracao + 0.05);
    }

    function bumbo(t, forca, destino) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.setValueAtTime(140, t);
        o.frequency.exponentialRampToValueAtTime(48, t + 0.12);
        envelope(g, t, 0.003, 0.5 * forca, 0.26);
        o.connect(g).connect(destino);
        o.start(t);
        o.stop(t + 0.3);
    }

    function barulho(t, tipo, freq, pico, duracao, destino) {
        const s = ctx.createBufferSource();
        s.buffer = ruido;
        const f = ctx.createBiquadFilter();
        f.type = tipo;
        f.frequency.value = freq;
        const g = ctx.createGain();
        envelope(g, t, 0.002, pico, duracao);
        s.connect(f).connect(g).connect(destino);
        s.start(t, Math.random() * 0.5);
        s.stop(t + duracao + 0.02);
    }

    function palma(t, destino) {
        // três estalinhos colados, como mãos batendo
        [0, 0.011, 0.022].forEach((d, i) => barulho(t + d, "bandpass", 1500, i === 2 ? 0.14 : 0.08, i === 2 ? 0.14 : 0.03, destino));
    }

    // Tudo é agendado em volume cheio dentro do seu grupo; quem decide o quanto se ouve é o volume do grupo,
    // que acompanha a rolagem. Grupo praticamente calado nem é agendado, pra poupar processamento.
    const ativo = (nome) => volumeDoGrupo(nome, mix) > 0.02;

    function compasso(n, t) {
        const pos = n % 8;
        const ciclo = Math.floor(n / 8);
        const parteB = ciclo % 3 === 2;
        const acorde = (parteB ? ACORDES_B : ACORDES)[pos];
        const melodia = (parteB ? MELODIA_B : MELODIA)[pos];
        const colcheia = BATIDA / 2;

        if (ativo("pad")) pad(acorde.notas, t, grupo.pad);
        ARPEJO.forEach((i, k) => {
            const nome = k % 2 ? "fraco" : "marimba"; // contratempo num grupo próprio: some na parte calma
            if (ativo(nome)) marimba(acorde.notas[i], t + k * colcheia, k % 2 ? 0.7 : 1, grupo[nome]);
        });

        // baixo: tônica, oitava no contratempo, quinta e volta
        const b = acorde.baixo;
        if (ativo("baixo")) [[0, b, 0.7], [1.5, b + 12, 0.35], [2, b + 7, 0.6], [3, b, 0.35], [3.5, b + 12, 0.3]]
            .forEach(([tempo, nota, dur]) => baixo(nota, t + tempo * BATIDA, dur, grupo.baixo));

        if (ativo("bumbo")) {
            bumbo(t, 1, grupo.bumbo);
            bumbo(t + BATIDA * 2, 0.9, grupo.bumbo);
            if (pos === 7) bumbo(t + BATIDA * 3.5, 0.6, grupo.bumbo); // puxadinha no fim do ciclo
        }
        if (ativo("palma")) { palma(t + BATIDA, grupo.palma); palma(t + BATIDA * 3, grupo.palma); }
        if (ativo("chocalho")) for (let s = 0; s < 16; s++) { // chocalho em semicolcheias, acentuado no contratempo
            if (Math.random() < 0.08) continue;
            barulho(t + (BATIDA / 4) * s, "highpass", 8000, s % 2 ? 0.02 : (s % 4 === 2 ? 0.045 : 0.03), 0.04, grupo.chocalho);
        }

        // brilho: duas notas agudas do acorde no fim do compasso, como faísca
        if (ativo("brilho")) {
            sino(acorde.notas[3] + 12, t + BATIDA * 2.5, 0.5, 0.45, grupo.brilho);
            sino(acorde.notas[2] + 24, t + BATIDA * 3.5, 0.5, 0.35, grupo.brilho);
        }

        // melodia: normal (sininho, e a cada 3 ciclos na marimba) ou "rara" (só a nota do primeiro tempo, longa)
        if (ativo("melodia")) {
            const rara = mix.rara > 0.5;
            if (rara && pos % 2) return;
            melodia.forEach(([tempo, nota, dur]) => {
                if (rara && tempo > 0) return;
                if (rara) sino(nota, t + tempo * BATIDA, 3, 0.8, grupo.melodia);
                else if (ciclo % 3 === 0 && timbre === "sino") marimba(nota + 12, t + tempo * BATIDA, 0.9, grupo.melodia);
                else tocarMelodia(nota, t + tempo * BATIDA, dur, grupo.melodia);
            });
        }
    }

    // Timbre da melodia muda com o filtro de projetos: Todos = sininho, Site = marimba, Sistema = pluck,
    // App = flauta, Atendimento = "bip" de mensagem
    let timbre = "sino";
    function tocarMelodia(nota, t, dur, destino) {
        const f = midi(nota);
        if (timbre === "marimba") marimba(nota + 12, t, 0.95, destino);
        else if (timbre === "pluck") { tom(f, "square", t, 0.003, 0.028, 0.28, destino); tom(f * 2, "sine", t, 0.002, 0.02, 0.12, destino); }
        else if (timbre === "flauta") tom(f, "triangle", t, 0.06, 0.07, Math.max(0.35, dur * BATIDA), destino);
        else if (timbre === "bip") { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sine"; o.frequency.setValueAtTime(f * 0.94, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.04); envelope(g, t, 0.004, 0.07, 0.22); o.connect(g).connect(destino); o.start(t); o.stop(t + 0.3); }
        else sino(nota, t, dur, 1, destino);
    }

    function volumeDoGrupo(nome, m) {
        let v = nome === "fraco" ? m.marimba * m.fraco : m[nome];
        if (nome === "bumbo" || nome === "palma" || nome === "chocalho") v *= 0.75 + 0.5 * energia; // rolando rápido = batida mais forte
        if (nome === "pad" && NOITE) v *= 1.25;
        return v;
    }

    // Mistura dos climas pela posição do meio da tela: dentro do "miolo" de uma seção vale o clima dela;
    // entre o miolo de uma e o da próxima, os dois se misturam aos poucos (curva suave).
    function misturaAtual() {
        const centro = window.scrollY + window.innerHeight / 2;
        const trechos = [];
        Object.keys(SECAO_CLIMA).forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;
            const r = el.getBoundingClientRect();
            const topo = r.top + window.scrollY, altura = r.height;
            const folga = Math.min(altura * 0.3, 450);
            trechos.push({ c: CLIMAS[SECAO_CLIMA[id]], a: topo + folga, b: topo + altura - folga });
        });
        trechos.sort((x, y) => x.a - y.a);
        if (!trechos.length) return Object.assign({}, CLIMAS.inicio);
        if (centro <= trechos[0].b) return Object.assign({}, trechos[0].c);
        for (let i = 0; i < trechos.length - 1; i++) {
            const atual = trechos[i], prox = trechos[i + 1];
            if (centro <= atual.b) return Object.assign({}, atual.c);
            if (centro < prox.a) {
                let u = (centro - atual.b) / Math.max(1, prox.a - atual.b);
                u = u * u * (3 - 2 * u);
                const m = {};
                Object.keys(atual.c).forEach((k) => {
                    m[k] = k === "filtro"
                        ? Math.exp(Math.log(atual.c[k]) * (1 - u) + Math.log(prox.c[k]) * u) // filtro mistura "de ouvido" (escala log)
                        : atual.c[k] * (1 - u) + prox.c[k] * u;
                });
                return m;
            }
        }
        return Object.assign({}, trechos[trechos.length - 1].c);
    }

    function aplicarMistura() {
        mix = misturaAtual();
        if (!ctx) return;
        const agora = ctx.currentTime;
        GRUPOS.forEach((nome) => grupo[nome].gain.setTargetAtTime(volumeDoGrupo(nome, mix), agora, 0.35));
        filtroMestre.frequency.setTargetAtTime(mix.filtro * (NOITE ? 0.8 : 1), agora, 0.5);
    }

    /* ---------- Efeitos de interação: tudo afinado com o acorde que está tocando ---------- */
    // Efeitos tocam mesmo com a música desligada: basta o áudio da página estar liberado
    function podeTocarEfeito() { return ctx && ctx.state === "running" && !pausadoPorFora && !document.hidden; }
    function acordeAgora() {
        const agora = ctx.currentTime;
        let atual = linhaDoTempo[0];
        linhaDoTempo.forEach((c) => { if (c.t <= agora) atual = c; });
        return atual ? atual.acorde : ACORDES[0];
    }
    const agoraMais = (s) => ctx.currentTime + (s || 0.01);

    // 1) Passar o mouse e clicar em botões/links: uma nota da marimba subindo pelo acorde; o clique é um sininho
    let passoHover = 0, ultimoHover = 0;
    function notaHover() {
        const agora = performance.now();
        if (agora - ultimoHover < 70) return;
        ultimoHover = agora;
        const notas = acordeAgora().notas;
        passoHover = (passoHover + 1) % (notas.length * 2);
        const nota = notas[passoHover % notas.length] + 12 + (passoHover >= notas.length ? 12 : 0);
        marimba(nota, agoraMais(), 0.45, efeitos);
    }
    // Toque na tela (celular) em qualquer lugar: nota da marimba + um brilhinho, subindo pelo acorde
    function notaToque() {
        const notas = acordeAgora().notas;
        passoHover = (passoHover + 1) % notas.length;
        const t = agoraMais();
        marimba(notas[passoHover] + 12, t, 0.75, efeitos);
        sino(notas[(passoHover + 2) % notas.length] + 24, t + 0.06, 0.4, 0.3, efeitos);
    }
    function notaClique() {
        const notas = acordeAgora().notas;
        sino(notas[3] + 12, agoraMais(), 0.6, 0.55, efeitos);
    }

    // 2) Cada projeto com o seu som, ao passar o mouse no card
    function estalosVinil(t) {
        for (let i = 0; i < 9; i++) barulho(t + Math.random() * 0.6, "highpass", 3000, 0.05 + Math.random() * 0.08, 0.012, efeitos);
        barulho(t, "bandpass", 1200, 0.03, 0.6, efeitos);
    }
    function varrida(t, de, ate, dur) {
        const src = ctx.createBufferSource();
        src.buffer = ruido;
        const f = ctx.createBiquadFilter();
        f.type = "bandpass";
        f.Q.value = 2;
        f.frequency.setValueAtTime(de, t);
        f.frequency.exponentialRampToValueAtTime(ate, t + dur);
        const g = ctx.createGain();
        envelope(g, t, dur * 0.4, 0.18, dur);
        src.connect(f).connect(g).connect(efeitos);
        src.start(t);
        src.stop(t + dur + 0.05);
    }
    function blip(t, de, ate, dur, pico) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(de, t);
        o.frequency.exponentialRampToValueAtTime(ate, t + dur);
        envelope(g, t, 0.004, pico, dur);
        o.connect(g).connect(efeitos);
        o.start(t);
        o.stop(t + dur + 0.05);
    }
    const SOM_PROJETO = {
        "Eldev Music": (t) => { estalosVinil(t); marimba(acordeAgora().baixo + 24, t + 0.05, 0.6, efeitos); },           // disco de vinil
        "Glitch District": (t) => { sino(88, t, 0.5, 0.6, efeitos); sino(84, t + 0.14, 1, 0.5, efeitos); },            // sininho de porta de loja
        "Fatia Nobre": (t) => { blip(t, 900, 1300, 0.09, 0.09); blip(t + 0.11, 1300, 1750, 0.1, 0.08); },               // notificação de mensagem
        "Conta a Dois": (t) => { tom(midi(83), "square", t, 0.003, 0.025, 0.08, efeitos); tom(midi(88), "square", t + 0.08, 0.003, 0.025, 0.35, efeitos); }, // moedinha
        "TaskFlow": (t) => { marimba(76, t, 0.8, efeitos); marimba(79, t + 0.07, 0.8, efeitos); marimba(84, t + 0.14, 0.7, efeitos); }, // tarefa concluída
        "FocusFlow": (t) => { barulho(t, "bandpass", 2600, 0.12, 0.03, efeitos); barulho(t + 0.27, "bandpass", 1900, 0.12, 0.03, efeitos); }, // tique-taque
        "FlowBoard": (t) => { varrida(t, 400, 3200, 0.35); },                                                          // arrastar cartão
    };
    const ultimoCard = new WeakMap();
    function somDoProjeto(card) {
        const nome = card.querySelector(".projeto-nome")?.textContent.trim();
        const som = SOM_PROJETO[nome];
        if (!som) return;
        const agora = performance.now();
        if (agora - (ultimoCard.get(card) || 0) < 1200) return;
        ultimoCard.set(card, agora);
        som(agoraMais(0.02));
    }

    // 3) Orçamento: uma nota subindo a cada pergunta respondida e um "tá-dá!" no final
    const ESCADA = [72, 74, 76, 77, 79, 81, 83, 84];
    function notaDaPergunta(n) { sino(ESCADA[Math.min(n, ESCADA.length - 1)], agoraMais(), 1, 0.7, efeitos); }
    function tada() {
        const t = agoraMais(0.02);
        [72, 76, 79, 84].forEach((nota, i) => marimba(nota, t + i * 0.07, 1, efeitos));
        sino(88, t + 0.3, 3, 0.9, efeitos);
        sino(91, t + 0.3, 3, 0.5, efeitos);
        bumbo(t + 0.3, 0.7, efeitos);
    }

    // 8) Chegou no fim da página: a música "resolve" num acorde final e a base volta devagar
    let ultimoFinal = -1e9; // em performance.now()
    function tocarFinal() {
        const t = agoraMais(0.05);
        if (tocando) GRUPOS.forEach((nome) => { grupo[nome].gain.cancelScheduledValues(t); grupo[nome].gain.setTargetAtTime(volumeDoGrupo(nome, mix) * 0.15, t, 0.25); });
        [60, 64, 67, 72, 76, 79, 84].forEach((nota, i) => marimba(nota, t + i * 0.06, 0.9, efeitos));
        [72, 76, 79].forEach((nota) => sino(nota, t + 0.45, 6, 0.6, efeitos));
        baixo(36, t + 0.45, 2.5, efeitos);
        setTimeout(aplicarMistura, 4200);
    }

    function agendar() {
        while (proximo < ctx.currentTime + 1.2) {
            compasso(indice, proximo);
            const parteB = Math.floor(indice / 8) % 3 === 2;
            linhaDoTempo.push({ t: proximo, acorde: (parteB ? ACORDES_B : ACORDES)[indice % 8] });
            if (linhaDoTempo.length > 4) linhaDoTempo.shift();
            proximo += COMPASSO;
            indice++;
        }
    }

    function atualizarBotao() {
        botao.setAttribute("aria-pressed", String(tocando));
        botao.setAttribute("aria-label", tocando ? "Desligar música de fundo" : "Ligar música de fundo");
        botao.title = tocando ? "Desligar música" : "Ligar música";
    }

    // Libera o áudio da página (precisa de um gesto da pessoa). Vale pra música e pros efeitos.
    function destravar() {
        if (!ctx) montar();
        if (pausadoPorFora || document.hidden) return Promise.resolve(false);
        return ctx.resume().then(function () {
            saida.gain.cancelScheduledValues(ctx.currentTime);
            saida.gain.setTargetAtTime(volume, ctx.currentTime, 0.3);
            return true;
        }).catch(function () { return false; /* o navegador ainda não deixou: o próximo gesto tenta de novo */ });
    }

    let ligar = function () {
        if (!ctx) montar();
        tocando = true;
        atualizarBotao();
        destravar().then(function (ok) {
            if (!ok || !tocando) return;
            proximo = Math.max(proximo, ctx.currentTime + 0.1);
            agendar();
            clearInterval(relogio);
            relogio = setInterval(agendar, 250);
            musicaBus.gain.cancelScheduledValues(ctx.currentTime);
            musicaBus.gain.setTargetAtTime(NIVEL_MUSICA, ctx.currentTime, 0.9); // entra devagar
        });
    };

    // Aba escondida ou demo aberta: cala tudo (música e efeitos) e poupa processador
    function silenciar() {
        if (!ctx) return;
        clearInterval(relogio);
        saida.gain.cancelScheduledValues(ctx.currentTime);
        saida.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
        setTimeout(function () { if (pausadoPorFora || document.hidden) ctx.suspend(); }, 700);
    }

    // Botão de som: tira só a música; os efeitos de clique, cards e orçamento continuam
    function desligar() {
        tocando = false;
        atualizarBotao();
        if (!ctx) return;
        clearInterval(relogio);
        musicaBus.gain.cancelScheduledValues(ctx.currentTime);
        musicaBus.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
    }

    const retomar = () => (tocando ? ligar() : destravar());

    // 9) Volume: barrinha que aparece ao passar o mouse (ou focar pelo teclado) no ícone
    if (window.matchMedia("(hover: hover)").matches) {
        const caixa = document.createElement("span");
        caixa.className = "som-caixa-volume";
        botao.before(caixa);
        caixa.append(botao);
        const painel = document.createElement("span");
        painel.className = "som-volume";
        painel.innerHTML = '<input type="range" min="0" max="1" step="0.05" aria-label="Volume da música">';
        caixa.append(painel);
        const faixa = painel.querySelector("input");
        faixa.value = String(volume);
        faixa.addEventListener("input", () => {
            volume = Number(faixa.value);
            gravar(CHAVE_VOLUME, String(volume));
            if (ctx && !pausadoPorFora && !document.hidden) saida.gain.setTargetAtTime(volume, ctx.currentTime, 0.08);
        });
    }

    // 10) Ondinhas do ícone pulsando na batida de verdade
    function pulsarIcone() {
        if (!tocando || !ctx || ctx.state !== "running") { botao.style.removeProperty("--pulso"); return; }
        const agora = ctx.currentTime;
        let inicio = null;
        linhaDoTempo.forEach((c) => { if (c.t <= agora) inicio = c.t; });
        if (inicio !== null) {
            const fase = ((agora - inicio) / BATIDA) % 1;
            botao.style.setProperty("--pulso", Math.exp(-fase * 5).toFixed(3));
        }
        requestAnimationFrame(pulsarIcone);
    }
    const ligarBase = ligar;
    ligar = function () { ligarBase(); requestAnimationFrame(pulsarIcone); };

    botao.addEventListener("click", function () {
        if (tocando) { desligar(); gravar(CHAVE, "off"); }
        else { ligar(); gravar(CHAVE, "on"); }
    });

    // Gestos que o navegador aceita como "permissão pra tocar som". pointerdown de toque não conta em
    // todo navegador (só o de mouse), por isso entram também touchend e click.
    const GESTOS = ["pointerdown", "touchend", "click", "keydown"];

    // Se a música está ligada mas o navegador deixou o áudio suspenso (o gesto não valeu, ou o sistema
    // pausou), o próximo toque/clique/tecla tenta de novo, em vez de ficar mudo pra sempre.
    GESTOS.forEach((tipo) => document.addEventListener(tipo, function () {
        if (ctx && ctx.state !== "running" && !pausadoPorFora && !document.hidden) retomar();
    }, true));

    // Começa sozinha no primeiro clique/toque/tecla, se a pessoa não tiver desligado antes.
    // Com a música desligada, o primeiro gesto só libera o áudio, pros efeitos funcionarem.
    const preferencia = ler(CHAVE);
    {
        const primeiraInteracao = function (evento) {
            if (evento.target.closest && evento.target.closest("#botaoSom")) return remover(); // o próprio botão resolve
            remover();
            if (preferencia === "off") { destravar(); return; }
            ligar();
            if (!ler(CHAVE_AVISO) && typeof window.mostrarToast === "function") {
                window.mostrarToast("♪ Tocando “Descoberta”, trilha feita pro site. Pra desligar ou mudar o volume, é o ícone de som lá em cima.");
                gravar(CHAVE_AVISO, "1");
            }
        };
        const remover = function () { GESTOS.forEach((tipo) => document.removeEventListener(tipo, primeiraInteracao, true)); };
        GESTOS.forEach((tipo) => document.addEventListener(tipo, primeiraInteracao, true));
    }

    // Efeitos de interação (tocam com ou sem a música, depois que o áudio foi liberado)
    const INTERATIVO = "a[href], button, summary, .chip-filtro, .orc-opcao, [role='button']";
    document.addEventListener("pointerover", (e) => {
        if (e.pointerType !== "mouse" || !podeTocarEfeito()) return;
        const alvo = e.target.closest(INTERATIVO);
        if (alvo && !alvo.contains(e.relatedTarget) && alvo.id !== "botaoSom") notaHover();
        const card = e.target.closest(".card-projeto");
        if (card && !card.contains(e.relatedTarget)) somDoProjeto(card);
    });
    // Toque rápido na tela (sem arrastar, pra não tocar enquanto a pessoa rola a página)
    let toqueInicio = null;
    document.addEventListener("pointerdown", (e) => {
        if (e.pointerType === "touch") toqueInicio = { x: e.clientX, y: e.clientY, t: performance.now() };
    }, true);
    document.addEventListener("pointerup", (e) => {
        if (e.pointerType !== "touch" || !toqueInicio) return;
        const parado = Math.hypot(e.clientX - toqueInicio.x, e.clientY - toqueInicio.y) < 12 && performance.now() - toqueInicio.t < 500;
        toqueInicio = null;
        if (!parado || e.target.closest(INTERATIVO)) return; // em botão/link quem toca é o som de clique
        // no primeiro toque o áudio ainda está sendo liberado: espera um instante e toca
        setTimeout(() => { if (podeTocarEfeito()) notaToque(); }, ctx && ctx.state === "running" ? 0 : 120);
    }, true);
    document.addEventListener("click", (e) => {
        if (!podeTocarEfeito()) return;
        const alvo = e.target.closest(INTERATIVO);
        if (alvo && alvo.id !== "botaoSom") notaClique();
    });
    // 5) Filtro de projetos troca o timbre da melodia
    const TIMBRES = { todos: "sino", site: "marimba", sistema: "pluck", app: "flauta", atendimento: "bip" };
    document.querySelectorAll(".chip-filtro[data-filtro]").forEach((chip) => chip.addEventListener("click", () => {
        timbre = TIMBRES[chip.dataset.filtro] || "sino";
        if (podeTocarEfeito()) tocarMelodia(acordeAgora().notas[3] + 12, agoraMais(0.12), 1, efeitos); // amostra do timbre novo
    }));

    const orcamento = document.getElementById("orcamentoApp");
    if (orcamento) {
        let ultimaPergunta = 1, terminou = false;
        new MutationObserver(() => {
            const etapa = orcamento.querySelector(".orc-etapa");
            if (!etapa) return;
            const texto = etapa.textContent;
            const m = texto.match(/Pergunta (\d+)/);
            if (m) {
                const n = Number(m[1]);
                if (n > ultimaPergunta && podeTocarEfeito()) notaDaPergunta(n - 2);
                ultimaPergunta = n;
                terminou = false;
            } else if (/Tudo certo/.test(texto) && !terminou) {
                terminou = true;
                if (podeTocarEfeito()) tada();
            }
        }).observe(orcamento, { childList: true, subtree: true, characterData: true });
    }

    // Conforme a pessoa rola, a música vai se misturando entre o clima de uma seção e o da próxima.
    let quadroRolagem = 0, ultimoY = window.scrollY, ultimoTempo = performance.now();
    const aoRolar = () => {
        const agora = performance.now(), y = window.scrollY;
        const velocidade = Math.abs(y - ultimoY) / Math.max(16, agora - ultimoTempo) * 1000; // px por segundo
        ultimoY = y; ultimoTempo = agora;
        energia = Math.max(energia, Math.min(1, velocidade / 2500));
        cancelAnimationFrame(quadroRolagem);
        quadroRolagem = requestAnimationFrame(aplicarMistura);
        const noFim = y + window.innerHeight >= document.documentElement.scrollHeight - 6;
        if (noFim && podeTocarEfeito() && agora - ultimoFinal > 40000) { ultimoFinal = agora; tocarFinal(); }
    };
    // a energia vai baixando sozinha quando a pessoa para de rolar (a batida "respira")
    setInterval(() => { if (energia > 0.01) { energia *= 0.8; if (ctx) aplicarMistura(); } }, 300);
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar);

    // Aba escondida: para de tocar (e de gastar processador); voltou, continua.
    document.addEventListener("visibilitychange", function () {
        if (!ctx) return;
        if (document.hidden) silenciar(); else if (!pausadoPorFora) retomar();
    });

    // Demo aberta na janelinha: pausa, porque ela pode ter som próprio. Fechou, volta.
    const modal = document.getElementById("modalOverlay");
    if (modal) {
        new MutationObserver(function () {
            const aberta = !modal.hidden && !!modal.querySelector("iframe");
            if (aberta && !pausadoPorFora) { pausadoPorFora = true; silenciar(); }
            else if (!aberta && pausadoPorFora) { pausadoPorFora = false; if (ctx) retomar(); }
        }).observe(modal, { attributes: true, attributeFilter: ["hidden"], childList: true, subtree: true });
    }
})();
