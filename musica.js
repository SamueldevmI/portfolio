/* Música de fundo: uma trilha animada e curiosa (clima de "descobrindo algo legal"), tocada pelo
   próprio navegador (Web Audio), sem arquivo de áudio. Não pesa no carregamento e não tem direito
   autoral envolvido. Pra trocar por uma música de verdade, dá pra usar um <audio> no lugar do sintetizador.

   Como ela é: 112 BPM em dó maior, marimba saltitante fazendo arpejos, baixo pulando, palma e chocalho
   leves e um sininho com uma melodia que gruda. Um ciclo tem 8 compassos (Dó–Lám–Fá–Sol–Dó–Mim–Fá–Sol);
   o primeiro ciclo é só a base, e a melodia entra do segundo em diante, alternando sininho e marimba.

   Regras:
   - O navegador não deixa tocar som antes de a pessoa interagir, então a música começa no primeiro
     clique/toque/tecla na página, no computador e no celular. Como é gerada no próprio aparelho, não
     gasta internet.
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

    // Clima de cada parte da página: a força de cada instrumento (0 = não toca), se tem melodia e o quanto
    // o som fica aberto (filtro). Muda no fim do compasso em que a pessoa chega na seção.
    const CLIMAS = {
        inicio:    { pad: 1,   marimba: 1,    baixo: 1,    bumbo: 1,    palma: 1,   chocalho: 1,   melodia: "ciclo",  brilho: false, filtro: 9000 },  // animado
        sobre:     { pad: 1.4, marimba: .75,  baixo: .6,   bumbo: 0,    palma: 0,   chocalho: .35, melodia: "nao",    brilho: false, filtro: 3200 },  // íntimo
        projetos:  { pad: 1,   marimba: 1,    baixo: 1,    bumbo: 1,    palma: 1,   chocalho: 1,   melodia: "sempre", brilho: true,  filtro: 10000 }, // descoberta
        servicos:  { pad: .8,  marimba: .9,   baixo: 1.25, bumbo: 1.1,  palma: 1.4, chocalho: .9,  melodia: "nao",    brilho: false, filtro: 7500 },  // confiante
        orcamento: { pad: 1,   marimba: .7,   baixo: .8,   bumbo: .6,   palma: 0,   chocalho: .4,  melodia: "nao",    brilho: false, filtro: 5000 },  // foco
        jornada:   { pad: 1.8, marimba: .6,   baixo: .5,   bumbo: 0,    palma: 0,   chocalho: 0,   melodia: "rara",   brilho: false, filtro: 2800, esparso: true }, // nostálgico
        contato:   { pad: 1.2, marimba: 1.05, baixo: 1.1,  bumbo: 1.05, palma: 1.2, chocalho: 1,   melodia: "sempre", brilho: true,  filtro: 10000 }, // final
    };
    const SECAO_CLIMA = { inicio: "inicio", "sobre-mim": "sobre", projetos: "projetos", "mais-projetos": "projetos", servicos: "servicos", orcamento: "orcamento", jornada: "jornada", contato: "contato" };
    let clima = CLIMAS.inicio;
    let filtroMestre = null;

    let ctx = null, mestre = null, saida = null, ruido = null;
    let tocando = false, pausadoPorFora = false, relogio = 0, proximo = 0, indice = 0;

    function montar() {
        // iPhone: sem isso, a chavinha do modo silencioso emudece o áudio da página mesmo com volume alto
        try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) { /* navegador sem suporte */ }
        ctx = new Contexto();
        const filtro = ctx.createBiquadFilter();
        filtro.type = "lowpass";
        filtro.frequency.value = clima.filtro; // aberto (brilhante) ou fechado (abafado) conforme a seção
        filtroMestre = filtro;
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

    function pad(notas, t, forca) {
        // cordas bem baixinhas por trás, só pra preencher
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.008 * forca, t + 0.3);
        g.gain.setValueAtTime(0.008 * forca, t + COMPASSO - 0.2);
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

    function baixo(nota, t, duracao, forca) {
        // baixo curtinho e redondo, que "pula"
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        const f = ctx.createBiquadFilter();
        o.type = "triangle";
        o.frequency.value = midi(nota);
        f.type = "lowpass";
        f.frequency.value = 700;
        envelope(g, t, 0.01, 0.26 * forca, duracao);
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

    function palma(t, forca) {
        // três estalinhos colados, como mãos batendo
        [0, 0.011, 0.022].forEach((d, i) => barulho(t + d, "bandpass", 1500, (i === 2 ? 0.14 : 0.08) * forca, i === 2 ? 0.14 : 0.03));
    }

    function compasso(n, t) {
        const c = clima; // o clima vale pro compasso inteiro: a troca de seção entra no próximo
        const pos = n % 8;
        const ciclo = Math.floor(n / 8);
        const acorde = ACORDES[pos];
        const colcheia = BATIDA / 2;

        if (c.pad) pad(acorde.notas, t, c.pad);
        if (c.marimba) ARPEJO.forEach((i, k) => {
            if (c.esparso && k % 2) return; // só nos tempos fortes: mais calmo
            marimba(acorde.notas[i], t + k * colcheia, (k % 2 ? 0.7 : 1) * c.marimba);
        });

        // baixo: tônica, oitava no contratempo, quinta e volta
        const b = acorde.baixo;
        if (c.baixo) [[0, b, 0.7], [1.5, b + 12, 0.35], [2, b + 7, 0.6], [3, b, 0.35], [3.5, b + 12, 0.3]]
            .forEach(([tempo, nota, dur]) => baixo(nota, t + tempo * BATIDA, dur, c.baixo));

        if (c.bumbo) {
            bumbo(t, c.bumbo);
            bumbo(t + BATIDA * 2, 0.9 * c.bumbo);
            if (pos === 7) bumbo(t + BATIDA * 3.5, 0.6 * c.bumbo); // puxadinha no fim do ciclo
        }
        if (c.palma) { palma(t + BATIDA, c.palma); palma(t + BATIDA * 3, c.palma); }
        if (c.chocalho) for (let s = 0; s < 16; s++) { // chocalho em semicolcheias, acentuado no contratempo
            if (Math.random() < 0.08) continue;
            barulho(t + (BATIDA / 4) * s, "highpass", 8000, (s % 2 ? 0.02 : (s % 4 === 2 ? 0.045 : 0.03)) * c.chocalho, 0.04);
        }

        // brilho: duas notas agudas do acorde no fim do compasso, como faísca
        if (c.brilho) {
            sino(acorde.notas[3] + 12, t + BATIDA * 2.5, 0.5, 0.45);
            sino(acorde.notas[2] + 24, t + BATIDA * 3.5, 0.5, 0.35);
        }

        // melodia: "ciclo" = o primeiro ciclo é só a base e depois alterna sininho e marimba;
        // "sempre" = sininho direto; "rara" = só as notas do primeiro tempo, bem espaçadas
        const tocaMelodia = c.melodia === "sempre" || (c.melodia === "ciclo" && ciclo >= 1) || (c.melodia === "rara" && pos % 2 === 0);
        if (tocaMelodia) {
            const noSino = c.melodia !== "ciclo" || ciclo % 3 !== 0;
            MELODIA[pos].forEach(([tempo, nota, dur]) => {
                if (c.melodia === "rara" && tempo > 0) return;
                if (noSino) sino(nota, t + tempo * BATIDA, c.melodia === "rara" ? 3 : dur, c.melodia === "rara" ? 0.8 : 1);
                else marimba(nota + 12, t + tempo * BATIDA, 0.9);
            });
        }
    }

    function mudarClima(id) {
        const novo = CLIMAS[id];
        if (!novo || novo === clima) return;
        clima = novo;
        if (ctx && filtroMestre) filtroMestre.frequency.setTargetAtTime(novo.filtro, ctx.currentTime, 1.2); // abre/fecha o som devagar
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
        }).catch(function () { /* o navegador ainda não deixou: o próximo gesto tenta de novo */ });
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

    // Gestos que o navegador aceita como "permissão pra tocar som". pointerdown de toque não conta em
    // todo navegador (só o de mouse), por isso entram também touchend e click.
    const GESTOS = ["pointerdown", "touchend", "click", "keydown"];

    // Se a música está ligada mas o navegador deixou o áudio suspenso (o gesto não valeu, ou o sistema
    // pausou), o próximo toque/clique/tecla tenta de novo, em vez de ficar mudo pra sempre.
    GESTOS.forEach((tipo) => document.addEventListener(tipo, function () {
        if (tocando && ctx && ctx.state !== "running" && !pausadoPorFora && !document.hidden) ligar();
    }, true));

    // Começa sozinha no primeiro clique/toque/tecla, se a pessoa não tiver desligado antes.
    const preferencia = ler(CHAVE);
    if (preferencia !== "off") {
        const primeiraInteracao = function (evento) {
            if (evento.target.closest && evento.target.closest("#botaoSom")) return remover(); // o próprio botão resolve
            remover();
            ligar();
            if (!ler(CHAVE_AVISO) && typeof window.mostrarToast === "function") {
                window.mostrarToast("🎵 Música ligada. Pra desligar, é o ícone de som lá em cima.");
                gravar(CHAVE_AVISO, "1");
            }
        };
        const remover = function () { GESTOS.forEach((tipo) => document.removeEventListener(tipo, primeiraInteracao, true)); };
        GESTOS.forEach((tipo) => document.addEventListener(tipo, primeiraInteracao, true));
    }

    // Seção que está no meio da tela decide o clima da música.
    if ("IntersectionObserver" in window) {
        const vistas = new IntersectionObserver((entradas) => {
            entradas.forEach((e) => { if (e.isIntersecting) mudarClima(SECAO_CLIMA[e.target.id]); });
        }, { rootMargin: "-45% 0px -45% 0px" });
        Object.keys(SECAO_CLIMA).forEach((id) => { const el = document.getElementById(id); if (el) vistas.observe(el); });
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
