/* Música de fundo: uma batida lo-fi tocada pelo próprio navegador (Web Audio), sem arquivo de áudio.
   Não pesa no carregamento e não tem direito autoral envolvido. Pra trocar por uma música de verdade,
   dá pra usar um <audio> no lugar do sintetizador.

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

    const BPM = 78;
    const BATIDA = 60 / BPM;
    const COMPASSO = BATIDA * 4;
    const VOLUME = 0.5;
    const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

    // Rém9 – Sol13 – Dó maj9 – Lám9 (um compasso cada)
    const ACORDES = [
        { baixo: 38, notas: [53, 57, 60, 64] },
        { baixo: 43, notas: [53, 59, 64, 69] },
        { baixo: 48, notas: [52, 55, 59, 62] },
        { baixo: 45, notas: [55, 59, 60, 64] },
    ];
    const PENTATONICA = [72, 74, 76, 79, 81]; // dó maior pentatônica, uma oitava acima

    let ctx = null, mestre = null, saida = null, ruido = null, chiado = null;
    let tocando = false, pausadoPorFora = false, relogio = 0, proximo = 0, indice = 0;

    function montar() {
        ctx = new Contexto();
        const filtro = ctx.createBiquadFilter();
        filtro.type = "lowpass";
        filtro.frequency.value = 4200; // corta o brilho: dá o som abafado de lo-fi
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = -18;
        compressor.ratio.value = 3;
        saida = ctx.createGain();
        saida.gain.value = 0;
        mestre = ctx.createGain();
        mestre.gain.value = 1;
        mestre.connect(filtro).connect(compressor).connect(saida).connect(ctx.destination);

        ruido = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        const dados = ruido.getChannelData(0);
        for (let i = 0; i < dados.length; i++) dados[i] = Math.random() * 2 - 1;

        // chiado de vinil: ruído bem baixo com uns estalinhos espalhados, em loop
        const vinil = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
        const v = vinil.getChannelData(0);
        for (let i = 0; i < v.length; i++) v[i] = (Math.random() * 2 - 1) * 0.012 + (Math.random() < 0.00018 ? (Math.random() * 2 - 1) * 0.5 : 0);
        chiado = ctx.createBufferSource();
        chiado.buffer = vinil;
        chiado.loop = true;
        const passaAlta = ctx.createBiquadFilter();
        passaAlta.type = "highpass";
        passaAlta.frequency.value = 1200;
        const volChiado = ctx.createGain();
        volChiado.gain.value = 0.35;
        chiado.connect(passaAlta).connect(volChiado).connect(mestre);
        chiado.start();
    }

    function envelope(ganho, t, ataque, pico, duracao) {
        ganho.gain.setValueAtTime(0.0001, t);
        ganho.gain.linearRampToValueAtTime(pico, t + ataque);
        ganho.gain.exponentialRampToValueAtTime(0.0001, t + duracao);
    }

    function piano(nota, t, forca, duracao) {
        // "piano elétrico": fundamental + um harmônico baixinho, com um tremolo leve
        const g = ctx.createGain();
        envelope(g, t, 0.012, 0.05 * forca, duracao);
        const f = ctx.createBiquadFilter();
        f.type = "lowpass";
        f.frequency.value = 1900;
        g.connect(f).connect(mestre);
        [[1, 1], [2, 0.18]].forEach(([mult, vol]) => {
            const o = ctx.createOscillator();
            const gv = ctx.createGain();
            o.type = "sine";
            o.frequency.value = midi(nota) * mult;
            o.detune.value = (Math.random() - 0.5) * 8; // um pouco desafinado, de propósito
            gv.gain.value = vol;
            o.connect(gv).connect(g);
            o.start(t);
            o.stop(t + duracao + 0.05);
        });
    }

    function pad(notas, t) {
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.014, t + 0.6);
        g.gain.setValueAtTime(0.014, t + COMPASSO - 0.4);
        g.gain.linearRampToValueAtTime(0.0001, t + COMPASSO + 0.3);
        const f = ctx.createBiquadFilter();
        f.type = "lowpass";
        f.frequency.value = 900;
        g.connect(f).connect(mestre);
        notas.forEach((n) => {
            const o = ctx.createOscillator();
            o.type = "triangle";
            o.frequency.value = midi(n);
            o.detune.value = (Math.random() - 0.5) * 10;
            o.connect(g);
            o.start(t);
            o.stop(t + COMPASSO + 0.4);
        });
    }

    function baixo(nota, t, duracao) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        const f = ctx.createBiquadFilter();
        o.type = "triangle";
        o.frequency.value = midi(nota);
        f.type = "lowpass";
        f.frequency.value = 380;
        envelope(g, t, 0.02, 0.22, duracao);
        o.connect(f).connect(g).connect(mestre);
        o.start(t);
        o.stop(t + duracao + 0.05);
    }

    function bumbo(t, forca) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.setValueAtTime(120, t);
        o.frequency.exponentialRampToValueAtTime(42, t + 0.18);
        envelope(g, t, 0.004, 0.55 * forca, 0.38);
        o.connect(g).connect(mestre);
        o.start(t);
        o.stop(t + 0.42);
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

    function compasso(n, t) {
        const acorde = ACORDES[n % ACORDES.length];
        const swing = BATIDA * 0.1; // colcheia do contratempo um pouco atrasada
        pad(acorde.notas, t);
        acorde.notas.forEach((nota, i) => piano(nota, t + i * 0.012, 1, 2.4)); // leve "arpejo" ao tocar
        acorde.notas.slice(1).forEach((nota) => piano(nota, t + BATIDA * 1.5 + swing, 0.55, 1.1));
        baixo(acorde.baixo, t, BATIDA * 1.6);
        baixo(acorde.baixo, t + BATIDA * 2.5 + swing, BATIDA * 1.2);

        bumbo(t, 1);
        bumbo(t + BATIDA * 2.5 + swing, 0.7);
        [1, 3].forEach((b) => barulho(t + BATIDA * b, "bandpass", 1600, 0.16, 0.2)); // caixa
        for (let c = 0; c < 8; c++) {
            if (Math.random() < 0.12) continue; // uns chimbais pulados, pra não ficar robótico
            const tc = t + (BATIDA / 2) * c + (c % 2 ? swing : 0);
            barulho(tc, "highpass", 7500, c % 2 ? 0.035 : 0.055, 0.045);
        }

        // melodia só em parte dos compassos, pra ter respiro
        const ciclo = Math.floor(n / 4) % 2;
        if (ciclo === 1 && n % 2 === 1) {
            const tempos = [0, 1, 1.5, 2.5, 3].filter(() => Math.random() < 0.55);
            tempos.forEach((b) => {
                const nota = PENTATONICA[Math.floor(Math.random() * PENTATONICA.length)];
                piano(nota, t + BATIDA * b + (b % 1 ? swing : 0), 0.7, 1.3);
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
