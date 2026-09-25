/* Música de fundo: "Meia-noite", uma batida R&B escura e elegante, com um toque discreto de sedução,
   combinando com o tema preto e vermelho do site. Tocada pelo próprio navegador (Web Audio), sem arquivo
   de áudio: não pesa no carregamento e não tem direito autoral envolvido.

   Como ela é: 96 BPM com swing (clima de resenha, mas com classe), em dó menor. Piano elétrico (tipo Rhodes) com acordes de 7ª e 9ª,
   grave redondo que pula, bumbo abafado, estalo de dedo no 2 e no 4, chimbal com swing, conga, uma voz de
   sintetizador suave com vibrato fazendo a melodia e um pluck "neon" com eco. Um ciclo tem 8 compassos
   (Dóm9–Láb7M–Fám9–Sol7(b9)–Dóm9–Mib7M–Láb7M–Sol7(b9)); a cada terceiro ciclo entra a parte B.
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

    // De noite (19h às 6h) a música fica um pouco mais lenta, mais abafada e com mais pad
    const HORA = new Date().getHours();
    const NOITE = HORA >= 19 || HORA < 6;
    const TOQUE = window.matchMedia("(pointer: coarse)").matches;
    const BPM = NOITE ? 90 : 96;
    const BATIDA = 60 / BPM;
    const COMPASSO = BATIDA * 4;
    const CHAVE_VOLUME = "portfolio-musica-volume";
    let volume = Math.min(1, Math.max(0, Number(ler(CHAVE_VOLUME) || 0.5)));
    const NIVEL_MUSICA = 0.42; // a música fica abaixo dos efeitos de clique, toque, cards e orçamento
    const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

    // Dóm9 – Láb7M(9) – Fám9 – Sol7(b9) – Dóm9 – Mib7M(9) – Láb7M(9) – Sol7(b9) (um compasso cada)
    const ACORDES = [
        { baixo: 36, notas: [51, 55, 58, 62] }, // Dóm9
        { baixo: 44, notas: [51, 55, 58, 60] }, // Láb7M(9)
        { baixo: 41, notas: [51, 55, 56, 60] }, // Fám9
        { baixo: 43, notas: [53, 56, 59, 62] }, // Sol7(b9)
        { baixo: 36, notas: [51, 55, 58, 62] },
        { baixo: 39, notas: [55, 58, 62, 65] }, // Mib7M(9)
        { baixo: 44, notas: [51, 55, 58, 60] },
        { baixo: 43, notas: [53, 56, 59, 62] },
    ];
    // Melodia de 8 compassos: [tempo dentro do compasso, nota, duração em tempos]. Poucas notas, com respiro.
    const MELODIA = [
        [[.5, 79, 1], [1.5, 77, .5], [2, 75, 1.5]],
        [[0, 72, .5], [.5, 75, .5], [1, 79, 2.5]],
        [[.5, 80, 1], [1.5, 79, .5], [2, 77, .75], [3, 75, 1]],
        [[0, 74, 1.5], [2, 71, .5], [2.5, 74, 1.5]],
        [[.5, 79, .5], [1, 82, 1], [2, 79, .5], [2.5, 77, 1.5]],
        [[0, 75, 1], [1.5, 74, .5], [2, 70, 2]],
        [[.5, 72, .5], [1, 75, .5], [1.5, 79, .5], [2, 84, 2]],
        [[0, 83, 1], [1, 80, .5], [1.5, 77, .5], [2, 74, 2]],
    ];
    // Parte B, a cada terceiro ciclo: Láb7M – Solm7 – Fám9 – Sib13 – Mib7M – Láb7M – Rém7(b5) – Sol7(b9)
    const ACORDES_B = [
        { baixo: 44, notas: [51, 55, 58, 60] },
        { baixo: 43, notas: [50, 53, 58, 62] },
        { baixo: 41, notas: [51, 55, 56, 60] },
        { baixo: 46, notas: [50, 55, 56, 62] },
        { baixo: 39, notas: [55, 58, 62, 65] },
        { baixo: 44, notas: [51, 55, 58, 60] },
        { baixo: 38, notas: [53, 56, 60, 62] },
        { baixo: 43, notas: [53, 56, 59, 62] },
    ];
    const MELODIA_B = [
        [[0, 84, 1.5], [2, 82, .5], [2.5, 79, 1.5]],
        [[0, 82, 1], [1, 79, .5], [1.5, 77, 2]],
        [[0, 80, .5], [.5, 79, .5], [1, 77, 1], [2, 75, .5], [2.5, 72, 1.5]],
        [[0, 74, 1], [1, 77, 1], [2, 79, 2]],
        [[0, 79, 1.5], [2, 82, .5], [2.5, 86, 1.5]],
        [[0, 84, 1], [1, 82, .5], [1.5, 79, 2]],
        [[0, 80, 1], [1, 77, .5], [1.5, 74, 1], [2.5, 72, 1]],
        [[0, 71, 1], [1, 74, 1], [2, 77, 1], [3, 80, 1]],
    ];

    // Clima de cada parte da página: o volume de cada grupo de instrumentos (0 = calado) e o quanto o som
    // fica aberto (filtro). "marimba" = acordes do piano elétrico; "fraco" = as notinhas soltas do piano no
    // contratempo; "palma" = estalo de dedo; "chocalho" = chimbal; "brilho" = pluck neon com eco; "rara" =
    // melodia só com notas longas e espaçadas. Entre uma seção e outra os valores se misturam aos poucos.
    const CLIMAS = {
        inicio:    { pad: 1,   marimba: 1,    fraco: 1, baixo: 1,    bumbo: 1,    palma: 1,   chocalho: 1,   melodia: .8,  rara: 0, brilho: .5, filtro: 6500 },  // chegada, na medida
        sobre:     { pad: 1.4, marimba: .9,   fraco: 1, baixo: .7,   bumbo: 0,    palma: .5,  chocalho: .3,  melodia: 0,   rara: 0, brilho: 0,  filtro: 2600 },  // íntimo
        projetos:  { pad: 1,   marimba: 1,    fraco: 1, baixo: 1.1,  bumbo: 1.1,  palma: 1.1, chocalho: 1.1, melodia: 1,   rara: 0, brilho: 1,  filtro: 8000 },  // a noite acende
        servicos:  { pad: .8,  marimba: 1,    fraco: 1, baixo: 1.25, bumbo: 1.15, palma: 1.3, chocalho: 1,   melodia: 0,   rara: 0, brilho: .6, filtro: 6000 },  // confiante
        orcamento: { pad: 1,   marimba: .8,   fraco: 1, baixo: .8,   bumbo: .6,   palma: .6,  chocalho: .5,  melodia: 0,   rara: 0, brilho: 0,  filtro: 4000 },  // foco
        jornada:   { pad: 1.8, marimba: .7,   fraco: 0, baixo: .5,   bumbo: 0,    palma: 0,   chocalho: 0,   melodia: .8,  rara: 1, brilho: 0,  filtro: 2400 },  // lembrança
        contato:   { pad: 1.2, marimba: 1.05, fraco: 1, baixo: 1.15, bumbo: 1.1,  palma: 1.2, chocalho: 1.1, melodia: 1,   rara: 0, brilho: 1,  filtro: 8500 },  // final
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

    let ctx = null, mestre = null, saida = null, ruido = null, eco = null;
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
        // eco (colcheia pontuada, abafado): dá o ar de "noite" na voz, no estalo e no pluck neon
        eco = ctx.createGain();
        eco.gain.value = 0.3;
        const atraso = ctx.createDelay(2);
        atraso.delayTime.value = BATIDA * 0.75;
        const abafar = ctx.createBiquadFilter();
        abafar.type = "lowpass";
        abafar.frequency.value = 2200;
        const volta = ctx.createGain();
        volta.gain.value = 0.34;
        eco.connect(atraso).connect(abafar).connect(volta).connect(atraso);
        abafar.connect(musicaBus);
        GRUPOS.forEach((nome) => {
            grupo[nome] = ctx.createGain();
            grupo[nome].gain.value = volumeDoGrupo(nome, mix);
            grupo[nome].connect(musicaBus);
            if (nome === "melodia" || nome === "palma" || nome === "brilho") grupo[nome].connect(eco);
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

    function rhodes(nota, t, forca, destino, duracao) {
        // piano elétrico: fundamental macia com cauda longa, oitava discreta e um "tine" curtinho no ataque
        const f = midi(nota);
        const d = duracao || 1.1;
        tom(f, "sine", t, 0.006, 0.075 * forca, d, destino);
        tom(f * 2, "sine", t, 0.004, 0.02 * forca, d * 0.5, destino);
        tom(f * 4, "triangle", t, 0.002, 0.009 * forca, 0.08, destino);
    }
    // Os efeitos (hover, toque, cards) usam o mesmo piano, então ficam na cara da música
    function marimba(nota, t, forca, destino) { rhodes(nota, t, forca * 1.15, destino, 0.5); }
    function acordeRhodes(notas, t, forca, duracao, destino) {
        notas.forEach((n, i) => rhodes(n, t + i * 0.014, forca * 0.8, destino, duracao)); // levemente dedilhado
    }

    function sino(nota, t, duracao, forca, destino) {
        // sininho suave: fundamental + parcial inarmônico (2,76x), com cauda longa
        const f = midi(nota);
        tom(f, "sine", t, 0.003, 0.06 * forca, Math.max(0.5, duracao * BATIDA + 0.4), destino);
        tom(f * 2.76, "sine", t, 0.002, 0.012 * forca, 0.2, destino);
        tom(f * 2, "triangle", t, 0.003, 0.008 * forca, 0.35, destino);
    }

    function suspiro(nota, t, dur, forca, destino) {
        // voz de sintetizador: entra "escorregando" meio tom abaixo, vibrato que chega devagar, bem macia
        const f = midi(nota);
        const fim = t + Math.max(0.45, dur * BATIDA) + 0.25;
        const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
        const lfo = ctx.createOscillator(), prof = ctx.createGain();
        o.type = "sine"; o2.type = "triangle";
        o.frequency.setValueAtTime(f * 0.972, t);
        o.frequency.exponentialRampToValueAtTime(f, t + 0.09);
        o2.frequency.value = f * 2;
        lfo.frequency.value = 5.2;
        prof.gain.setValueAtTime(0, t);
        prof.gain.linearRampToValueAtTime(f * 0.006, t + 0.35);
        lfo.connect(prof).connect(o.frequency);
        lp.type = "lowpass"; lp.frequency.value = 2400;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.06 * forca, t + 0.08);
        g.gain.setTargetAtTime(0.04 * forca, t + 0.1, 0.3);
        g.gain.setTargetAtTime(0.0001, fim - 0.25, 0.08);
        const g2 = ctx.createGain(); g2.gain.value = 0.12;
        o.connect(lp); o2.connect(g2).connect(lp);
        lp.connect(g).connect(destino);
        [o, o2, lfo].forEach((x) => { x.start(t); x.stop(fim + 0.1); });
    }

    function pluckNeon(nota, t, forca, destino) {
        // pluck "neon": serra com filtro que fecha rápido; o eco faz o resto
        const o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
        o.type = "sawtooth";
        o.frequency.value = midi(nota);
        lp.type = "lowpass"; lp.Q.value = 4;
        lp.frequency.setValueAtTime(3200, t);
        lp.frequency.exponentialRampToValueAtTime(420, t + 0.22);
        envelope(g, t, 0.003, 0.03 * forca, 0.32);
        o.connect(lp).connect(g).connect(destino);
        o.start(t); o.stop(t + 0.36);
    }

    function pad(notas, t, destino) {
        // pad escuro e bem baixinho por trás, entrando devagar
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.007, t + 0.6);
        g.gain.setValueAtTime(0.007, t + COMPASSO - 0.2);
        g.gain.linearRampToValueAtTime(0.0001, t + COMPASSO + 0.15);
        const f = ctx.createBiquadFilter();
        f.type = "lowpass";
        f.frequency.value = 900;
        g.connect(f).connect(destino);
        notas.forEach((n) => {
            const o = ctx.createOscillator();
            o.type = "sawtooth";
            o.frequency.value = midi(n + 12);
            o.detune.value = (Math.random() - 0.5) * 14;
            o.connect(g);
            o.start(t);
            o.stop(t + COMPASSO + 0.2);
        });
    }

    function baixo(nota, t, duracao, destino) {
        // grave redondo: seno com um pouquinho de triângulo, escorregando de leve pra nota
        const f = midi(nota);
        const o = ctx.createOscillator(), o2 = ctx.createOscillator();
        const g = ctx.createGain(), lp = ctx.createBiquadFilter();
        o.type = "sine"; o2.type = "triangle";
        o.frequency.setValueAtTime(f * 0.97, t);
        o.frequency.exponentialRampToValueAtTime(f, t + 0.05);
        o2.frequency.value = f;
        lp.type = "lowpass"; lp.frequency.value = 380;
        const g2 = ctx.createGain(); g2.gain.value = 0.35;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.34, t + 0.015);
        g.gain.setTargetAtTime(0.22, t + 0.03, 0.2);
        g.gain.setTargetAtTime(0.0001, t + duracao, 0.06);
        o.connect(lp); o2.connect(g2).connect(lp);
        lp.connect(g).connect(destino);
        [o, o2].forEach((x) => { x.start(t); x.stop(t + duracao + 0.4); });
    }

    function bumbo(t, forca, destino) {
        // bumbo abafado e fundo
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.setValueAtTime(115, t);
        o.frequency.exponentialRampToValueAtTime(42, t + 0.16);
        envelope(g, t, 0.003, 0.55 * forca, 0.42);
        o.connect(g).connect(destino);
        o.start(t);
        o.stop(t + 0.45);
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

    function conga(t, freq, forca, destino) {
        // conga: tom curto que cai um pouquinho, com um tapa de ruído
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(freq * 1.25, t);
        o.frequency.exponentialRampToValueAtTime(freq, t + 0.03);
        envelope(g, t, 0.002, 0.14 * forca, 0.2);
        o.connect(g).connect(destino);
        o.start(t); o.stop(t + 0.25);
        barulho(t, "bandpass", 1800, 0.03 * forca, 0.02, destino);
    }

    function palma(t, destino) {
        // estalo de dedo: um "tsk" curto e agudo (o eco dá o espaço)
        barulho(t, "bandpass", 2600, 0.16, 0.05, destino);
        barulho(t + 0.004, "highpass", 5500, 0.06, 0.03, destino);
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
        const sw = (k) => k * colcheia + (k % 2 ? colcheia * 0.2 : 0); // colcheia com swing
        const ns = acorde.notas;

        if (ativo("pad")) pad(ns, t, grupo.pad);

        // piano: acorde longo no 1, "resposta" curta no contratempo do 2 e, nos compassos pares, no fim
        if (ativo("marimba")) {
            acordeRhodes(ns, t, 1, BATIDA * 2.2, grupo.marimba);
            acordeRhodes(ns, t + sw(3), 0.6, BATIDA * 0.6, grupo.marimba);
            if (pos % 2) acordeRhodes(ns, t + sw(7), 0.5, BATIDA * 0.5, grupo.marimba);
        }
        if (ativo("fraco")) [[5, 3], [6, 2]].forEach(([k, i]) => rhodes(ns[i] + 12, t + sw(k), 0.45, grupo.fraco, 0.6));
        // viradinha do piano a cada 4 compassos: três notas subindo, tipo "ó o pai"
        if (ativo("fraco") && pos % 4 === 3) [0, 1, 2].forEach((i) => rhodes(ns[i + 1] + 12, t + BATIDA * (3.25 + i * 0.25), 0.55, grupo.fraco, 0.35));

        // grave com gingado: tônica, "pulinho" na oitava, repique no "e" do 3, oitava e volta
        const b = acorde.baixo;
        if (ativo("baixo")) [[0, b, BATIDA * 1], [1.5, b + 12, BATIDA * 0.22], [2.5, b, BATIDA * 0.35], [3, b + 12, BATIDA * 0.25], [3.5, b, BATIDA * 0.4]]
            .forEach(([tempo, nota, dur]) => baixo(nota, t + sw(tempo * 2), dur, grupo.baixo));

        if (ativo("bumbo")) {
            bumbo(t, 1, grupo.bumbo);
            bumbo(t + sw(5), 0.75, grupo.bumbo);
            if (pos === 7) bumbo(t + sw(7), 0.55, grupo.bumbo);
        }
        if (ativo("palma")) { palma(t + BATIDA, grupo.palma); palma(t + BATIDA * 3, grupo.palma); }
        if (ativo("chocalho")) for (let s = 0; s < 16; s++) { // chimbal em semicolcheias com swing
            if (s % 4 === 1 && Math.random() < 0.5) continue;
            const quando = t + (BATIDA / 4) * s + (s % 2 ? BATIDA * 0.06 : 0);
            const aberto = s === 14 && pos % 2;
            barulho(quando, "highpass", 7500, aberto ? 0.035 : (s % 2 ? 0.014 : (s % 4 === 2 ? 0.03 : 0.022)), aberto ? 0.2 : 0.035, grupo.chocalho);
        }
        // conga: o toque de resenha, no contratempo
        if (ativo("chocalho")) [[3, 330, 0.8], [6, 247, 1], [7, 330, pos % 2 ? 0.6 : 0]].forEach(([k, f, forca]) => { if (forca) conga(t + sw(k), f, forca, grupo.chocalho); });

        // brilho: duas notinhas neon do acorde, com eco
        if (ativo("brilho") && pos % 2 === 0) {
            pluckNeon(ns[3] + 12, t + sw(3), 1, grupo.brilho);
            pluckNeon(ns[2] + 24, t + sw(6), 0.8, grupo.brilho);
        }

        // melodia: normal (voz) ou "rara" (só a nota do primeiro tempo, longa)
        if (ativo("melodia")) {
            const rara = mix.rara > 0.5;
            if (rara && pos % 2) return;
            melodia.forEach(([tempo, nota, dur]) => {
                if (rara && melodia[0][0] !== tempo) return;
                const quando = t + sw(tempo * 2);
                if (rara) suspiro(nota, quando, 3, 0.9, grupo.melodia);
                else tocarMelodia(nota, quando, dur, grupo.melodia);
            });
        }
    }

    // Timbre da melodia muda com o filtro de projetos: Todos = voz, Site = piano, Sistema = pluck,
    // App = flauta, Atendimento = "bip" de mensagem
    let timbre = "voz";
    function tocarMelodia(nota, t, dur, destino) {
        const f = midi(nota);
        if (timbre === "marimba") rhodes(nota, t, 1.1, destino, Math.max(0.5, dur * BATIDA));
        else if (timbre === "pluck") { tom(f, "square", t, 0.003, 0.028, 0.28, destino); tom(f * 2, "sine", t, 0.002, 0.02, 0.12, destino); }
        else if (timbre === "flauta") tom(f, "triangle", t, 0.06, 0.07, Math.max(0.35, dur * BATIDA), destino);
        else if (timbre === "bip") { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sine"; o.frequency.setValueAtTime(f * 0.94, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.04); envelope(g, t, 0.004, 0.07, 0.22); o.connect(g).connect(destino); o.start(t); o.stop(t + 0.3); }
        else suspiro(nota, t, dur, 1, destino);
    }

    function volumeDoGrupo(nome, m) {
        let v = nome === "fraco" ? m.marimba * m.fraco : m[nome];
        if (nome === "bumbo" || nome === "palma" || nome === "chocalho") v *= TOQUE ? 0.55 + 0.95 * energia : 0.75 + 0.5 * energia; // rolando rápido = batida mais forte (no celular, mais ainda)
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
        "Glitch District": (t) => { sino(87, t, 0.5, 0.6, efeitos); sino(84, t + 0.14, 1, 0.5, efeitos); },            // sininho de porta de loja
        "Fatia Nobre": (t) => { blip(t, 900, 1300, 0.09, 0.09); blip(t + 0.11, 1300, 1750, 0.1, 0.08); },               // notificação de mensagem
        "Conta a Dois": (t) => { tom(midi(82), "square", t, 0.003, 0.025, 0.08, efeitos); tom(midi(87), "square", t + 0.08, 0.003, 0.025, 0.35, efeitos); }, // moedinha
        "TaskFlow": (t) => { marimba(75, t, 0.8, efeitos); marimba(79, t + 0.07, 0.8, efeitos); marimba(84, t + 0.14, 0.7, efeitos); }, // tarefa concluída
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
    const ESCADA = [72, 74, 75, 77, 79, 80, 82, 84];
    function notaDaPergunta(n) { sino(ESCADA[Math.min(n, ESCADA.length - 1)], agoraMais(), 1, 0.7, efeitos); }
    function tada() {
        if (navigator.vibrate) navigator.vibrate([40, 40, 90]);
        const t = agoraMais(0.02);
        [72, 75, 79, 82].forEach((nota, i) => marimba(nota, t + i * 0.07, 1, efeitos));
        sino(86, t + 0.3, 3, 0.9, efeitos);
        sino(91, t + 0.3, 3, 0.5, efeitos);
        bumbo(t + 0.3, 0.7, efeitos);
    }

    // 8) Chegou no fim da página: a música "resolve" num acorde final e a base volta devagar
    let ultimoFinal = -1e9; // em performance.now()
    function tocarFinal() {
        const t = agoraMais(0.05);
        if (tocando) GRUPOS.forEach((nome) => { grupo[nome].gain.cancelScheduledValues(t); grupo[nome].gain.setTargetAtTime(volumeDoGrupo(nome, mix) * 0.15, t, 0.25); });
        [60, 63, 67, 70, 74, 79, 84].forEach((nota, i) => marimba(nota, t + i * 0.06, 0.9, efeitos));
        [70, 74, 75, 79].forEach((nota) => rhodes(nota, t + 0.45, 0.7, efeitos, 5));
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
                window.mostrarToast("♪ Tocando “Meia-noite”, trilha feita pro site. Pra desligar ou mudar o volume, é o ícone de som lá em cima.");
                gravar(CHAVE_AVISO, "1");
            }
        };
        const remover = function () { GESTOS.forEach((tipo) => document.removeEventListener(tipo, primeiraInteracao, true)); };
        GESTOS.forEach((tipo) => document.addEventListener(tipo, primeiraInteracao, true));
    }

    // Sons que o mobile.js usa (gestos do celular). Só tocam com o áudio liberado.
    window.musicaSite = {
        pode: () => podeTocarEfeito(),
        acorde() { if (!podeTocarEfeito()) return; const t = agoraMais(); acordeAgora().notas.forEach((n, i) => marimba(n + 12, t + i * 0.012, 0.8, efeitos)); sino(acordeAgora().notas[3] + 24, t + 0.05, 1.2, 0.4, efeitos); },
        arpejo() { if (!podeTocarEfeito()) return; const t = agoraMais(); const ns = acordeAgora().notas; [...ns, ...ns.map((n) => n + 12)].forEach((n, i) => marimba(n + 12, t + i * 0.07, 0.8, efeitos)); },
        subida() { if (!podeTocarEfeito()) return; const t = agoraMais(); [0, 3, 7, 12].forEach((d, i) => sino(72 + d, t + i * 0.09, 1.5, 0.6, efeitos)); },
        passagem() { if (!podeTocarEfeito()) return; varrida(agoraMais(), 300, 4000, 0.4); },
        nota(n, forca) { if (!podeTocarEfeito()) return; const t = agoraMais(); marimba(n, t, forca || 1, efeitos); sino(n + 12, t, 0.8, 0.45 * (forca || 1), efeitos); },
        erro() { if (!podeTocarEfeito()) return; const t = agoraMais(); tom(midi(43), "sawtooth", t, 0.01, 0.05, 0.5, efeitos); tom(midi(42), "square", t + 0.02, 0.01, 0.03, 0.5, efeitos); },
        curtir() { if (!podeTocarEfeito()) return; const t = agoraMais(); marimba(84, t, 0.9, efeitos); sino(91, t + 0.07, 0.8, 0.6, efeitos); },
        mola() { if (!podeTocarEfeito()) return; const t = agoraMais(); const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "triangle"; o.frequency.setValueAtTime(180, t); [420, 260, 360, 300, 330].forEach((f, i) => o.frequency.linearRampToValueAtTime(f, t + 0.06 * (i + 1))); envelope(g, t, 0.01, 0.12, 0.45); o.connect(g).connect(efeitos); o.start(t); o.stop(t + 0.5); },
        hq() { if (!podeTocarEfeito()) return; const t = agoraMais(); bumbo(t, 0.9, efeitos); barulho(t, "bandpass", 1800, 0.25, 0.12, efeitos); sino(84, t + 0.04, 0.4, 0.5, efeitos); },
        passar() { if (!podeTocarEfeito()) return; varrida(agoraMais(), 2400, 500, 0.25); },
        surpresa() { if (!podeTocarEfeito()) return; const t = agoraMais(); [84, 79, 75, 72, 87].forEach((n, i) => sino(n, t + i * 0.06, 0.6, 0.5, efeitos)); },
    };

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
    const TIMBRES = { todos: "voz", site: "marimba", sistema: "pluck", app: "flauta", atendimento: "bip" };
    document.querySelectorAll(".chip-filtro[data-filtro]").forEach((chip) => chip.addEventListener("click", () => {
        timbre = TIMBRES[chip.dataset.filtro] || "voz";
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

    // Rastro de faíscas neon atrás do cursor (só com mouse). O cursor em si é a seta/mãozinha neon do CSS.
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        let alvoX = -100, alvoY = -100, andou = 0, ultimaFaisca = 0, faiscasNaTela = 0;
        document.addEventListener("mousemove", (e) => {
            andou += Math.hypot(e.clientX - alvoX, e.clientY - alvoY);
            alvoX = e.clientX; alvoY = e.clientY;
            const agora = performance.now();
            // uma faísca a cada ~110 px andados, no máximo 6 na tela: um rastro discreto
            if (andou > 110 && agora - ultimaFaisca > 140 && faiscasNaTela < 6) {
                andou = 0; ultimaFaisca = agora; faiscasNaTela++;
                const n = document.createElement("span");
                n.className = "faisca-rastro" + (Math.random() < 0.4 ? " faisca-branca" : "");
                n.setAttribute("aria-hidden", "true");
                n.style.left = alvoX + "px";
                n.style.top = alvoY + "px";
                n.style.setProperty("--dx", (Math.random() * 36 - 18).toFixed(0) + "px");
                n.style.setProperty("--dy", (18 + Math.random() * 26).toFixed(0) + "px");
                n.addEventListener("animationend", () => { n.remove(); faiscasNaTela--; }, { once: true });
                document.body.append(n);
            }
        }, { passive: true });
    }

    // Conforme a pessoa rola, a música vai se misturando entre o clima de uma seção e o da próxima.
    let quadroRolagem = 0, ultimoY = window.scrollY, ultimoTempo = performance.now();
    const aoRolar = () => {
        const agora = performance.now(), y = window.scrollY;
        const velocidade = Math.abs(y - ultimoY) / Math.max(16, agora - ultimoTempo) * 1000; // px por segundo
        ultimoY = y; ultimoTempo = agora;
        energia = Math.max(energia, Math.min(1, velocidade / (TOQUE ? 1400 : 2500)));
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
