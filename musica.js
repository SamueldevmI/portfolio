/* Música de fundo: uma trilha animada e curiosa (clima de "descobrindo algo legal"), tocada pelo
   próprio navegador (Web Audio), sem arquivo de áudio. Não pesa no carregamento e não tem direito
   autoral envolvido. Pra trocar por uma música de verdade, dá pra usar um <audio> no lugar do sintetizador.

   Como ela é: 112 BPM em dó maior, marimba saltitante fazendo arpejos, baixo pulando, palma e chocalho
   leves e um sininho com uma melodia que gruda. Um ciclo tem 8 compassos (Dó–Lám–Fá–Sol–Dó–Mim–Fá–Sol);
   o primeiro ciclo é só a base, e a melodia entra do segundo em diante, alternando sininho e marimba.

   Regras:
   - O navegador não deixa tocar som antes de a pessoa interagir, então a música começa no primeiro
     clique/toque/tecla na página (no computador). No celular ou em internet lenta (modo leve) ela só
     liga se a pessoa tocar no ícone.
   - O ícone no topo liga e desliga, e a escolha fica guardada neste aparelho.
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

    const BPM = 112;
    const BATIDA = 60 / BPM;
    const COMPASSO = BATIDA * 4;
    const VOLUME = 0.5;
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
    const ARPEJO = [0, 2, 1, 3, 2, 1, 3, 2]; // ordem das notas do acorde nas 8 colcheias

    let ctx = null, mestre = null, saida = null, ruido = null;
    let tocando = false, pausadoPorFora = false, relogio = 0, proximo = 0, indice = 0;

    function montar() {
        ctx = new Contexto();
        const filtro = ctx.createBiquadFilter();
        filtro.type = "lowpass";
        filtro.frequency.value = 9000; // só tira o chiado mais agudo: o som fica brilhante
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = -16;
        compressor.ratio.value = 3;
        saida = ctx.createGain();
        saida.gain.value = 0;
        mestre = ctx.createGain();
        mestre.gain.value = 1;
        mestre.connect(filtro).connect(compressor).connect(saida).connect(ctx.destination);

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

    function marimba(nota, t, forca) {
        // madeira: fundamental curtinha + o harmônico agudo típico da marimba (4x), que some rápido
        const f = midi(nota);
        tom(f, "sine", t, 0.004, 0.09 * forca, 0.42);
        tom(f * 4, "sine", t, 0.002, 0.018 * forca, 0.07);
    }

    function sino(nota, t, duracao, forca) {
        // glockenspiel: fundamental brilhante + parcial inarmônico (2,76x), com cauda longa
        const f = midi(nota);
        tom(f, "sine", t, 0.003, 0.075 * forca, Math.max(0.5, duracao * BATIDA + 0.4));
        tom(f * 2.76, "sine", t, 0.002, 0.02 * forca, 0.25);
        tom(f * 2, "triangle", t, 0.003, 0.012 * forca, 0.4);
    }

    function pad(notas, t) {
        // cordas bem baixinhas por trás, só pra preencher
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.008, t + 0.3);
        g.gain.setValueAtTime(0.008, t + COMPASSO - 0.2);
        g.gain.linearRampToValueAtTime(0.0001, t + COMPASSO + 0.1);
        const f = ctx.createBiquadFilter();
        f.type = "lowpass";
        f.frequency.value = 1600;
        g.connect(f).connect(mestre);
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

    function baixo(nota, t, duracao) {
        // baixo curtinho e redondo, que "pula"
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        const f = ctx.createBiquadFilter();
        o.type = "triangle";
        o.frequency.value = midi(nota);
        f.type = "lowpass";
        f.frequency.value = 700;
        envelope(g, t, 0.01, 0.26, duracao);
        o.connect(f).connect(g).connect(mestre);
        o.start(t);
        o.stop(t + duracao + 0.05);
    }

    function bumbo(t, forca) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.setValueAtTime(140, t);
        o.frequency.exponentialRampToValueAtTime(48, t + 0.12);
        envelope(g, t, 0.003, 0.5 * forca, 0.26);
        o.connect(g).connect(mestre);
        o.start(t);
        o.stop(t + 0.3);
    }

    function barulho(t, tipo, freq, pico, duracao) {
        const s = ctx.createBufferSource();
        s.buffer = ruido;
        const f = ctx.createBiquadFilter();
        f.type = tipo;
        f.frequency.value = freq;
        const g = ctx.createGain();
        envelope(g, t, 0.002, pico, duracao);
        s.connect(f).connect(g).connect(mestre);
        s.start(t, Math.random() * 0.5);
        s.stop(t + duracao + 0.02);
    }

    function palma(t) {
        // três estalinhos colados, como mãos batendo
        [0, 0.011, 0.022].forEach((d, i) => barulho(t + d, "bandpass", 1500, i === 2 ? 0.14 : 0.08, i === 2 ? 0.14 : 0.03));
    }

    function compasso(n, t) {
        const pos = n % 8;
        const ciclo = Math.floor(n / 8);
        const acorde = ACORDES[pos];
        const colcheia = BATIDA / 2;

        pad(acorde.notas, t);
        ARPEJO.forEach((i, c) => marimba(acorde.notas[i], t + c * colcheia, c % 2 ? 0.7 : 1));

        // baixo: tônica, oitava no contratempo, quinta e volta
        const b = acorde.baixo;
        [[0, b, 0.7], [1.5, b + 12, 0.35], [2, b + 7, 0.6], [3, b, 0.35], [3.5, b + 12, 0.3]]
            .forEach(([tempo, nota, dur]) => baixo(nota, t + tempo * BATIDA, dur));

        bumbo(t, 1);
        bumbo(t + BATIDA * 2, 0.9);
        if (pos === 7) bumbo(t + BATIDA * 3.5, 0.6); // puxadinha no fim do ciclo
        palma(t + BATIDA);
        palma(t + BATIDA * 3);
        for (let s = 0; s < 16; s++) { // chocalho em semicolcheias, acentuado no contratempo
            if (Math.random() < 0.08) continue;
            barulho(t + (BATIDA / 4) * s, "highpass", 8000, s % 2 ? 0.02 : (s % 4 === 2 ? 0.045 : 0.03), 0.04);
        }

        // melodia: o primeiro ciclo é só a base; depois alterna sininho e marimba uma oitava acima
        if (ciclo >= 1) {
            const noSino = ciclo % 3 !== 0;
            MELODIA[pos].forEach(([tempo, nota, dur]) => {
                if (noSino) sino(nota, t + tempo * BATIDA, dur, 1);
                else marimba(nota + 12, t + tempo * BATIDA, 0.9);
            });
        }
    }

    function agendar() {
        while (proximo < ctx.currentTime + 1.2) {
            compasso(indice, proximo);
            proximo += COMPASSO;
            indice++;
        }
    }

    function atualizarBotao() {
        botao.setAttribute("aria-pressed", String(tocando));
        botao.setAttribute("aria-label", tocando ? "Desligar música de fundo" : "Ligar música de fundo");
        botao.title = tocando ? "Desligar música" : "Ligar música";
    }

    function ligar() {
        if (!ctx) montar();
        tocando = true;
        atualizarBotao();
        if (pausadoPorFora || document.hidden) return; // liga assim que a demo fechar / a aba voltar
        ctx.resume().then(function () {
            proximo = Math.max(proximo, ctx.currentTime + 0.1);
            agendar();
            clearInterval(relogio);
            relogio = setInterval(agendar, 250);
            saida.gain.cancelScheduledValues(ctx.currentTime);
            saida.gain.setTargetAtTime(VOLUME, ctx.currentTime, 0.9); // entra devagar
        });
    }

    function silenciar() {
        if (!ctx) return;
        clearInterval(relogio);
        saida.gain.cancelScheduledValues(ctx.currentTime);
        saida.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
        setTimeout(function () { if (!tocando || pausadoPorFora || document.hidden) ctx.suspend(); }, 700);
    }

    function desligar() {
        tocando = false;
        atualizarBotao();
        silenciar();
    }

    botao.addEventListener("click", function () {
        if (tocando) { desligar(); gravar(CHAVE, "off"); }
        else { ligar(); gravar(CHAVE, "on"); }
    });

    // Começa sozinha no primeiro clique/toque/tecla, se a pessoa não tiver desligado antes.
    const preferencia = ler(CHAVE);
    const leve = document.documentElement.classList.contains("modo-leve");
    if (preferencia === "on" || (preferencia === null && !leve)) {
        const primeiraInteracao = function (evento) {
            if (evento.target.closest && evento.target.closest("#botaoSom")) return remover(); // o próprio botão resolve
            remover();
            ligar();
            if (!ler(CHAVE_AVISO) && typeof window.mostrarToast === "function") {
                window.mostrarToast("🎵 Música ligada. Pra desligar, é o ícone de som lá em cima.");
                gravar(CHAVE_AVISO, "1");
            }
        };
        const remover = function () {
            document.removeEventListener("pointerdown", primeiraInteracao, true);
            document.removeEventListener("keydown", primeiraInteracao, true);
        };
        document.addEventListener("pointerdown", primeiraInteracao, true);
        document.addEventListener("keydown", primeiraInteracao, true);
    }

    // Aba escondida: para de tocar (e de gastar processador); voltou, continua.
    document.addEventListener("visibilitychange", function () {
        if (!tocando) return;
        if (document.hidden) silenciar(); else if (!pausadoPorFora) ligar();
    });

    // Demo aberta na janelinha: pausa, porque ela pode ter som próprio. Fechou, volta.
    const modal = document.getElementById("modalOverlay");
    if (modal) {
        new MutationObserver(function () {
            const aberta = !modal.hidden && !!modal.querySelector("iframe");
            if (aberta && !pausadoPorFora) { pausadoPorFora = true; if (tocando) silenciar(); }
            else if (!aberta && pausadoPorFora) { pausadoPorFora = false; if (tocando) ligar(); }
        }).observe(modal, { attributes: true, attributeFilter: ["hidden"], childList: true, subtree: true });
    }
})();
