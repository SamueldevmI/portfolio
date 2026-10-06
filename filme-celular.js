/* O "filminho" do celular do topo: prova o "trabalham por você" em uns 12 segundos.
   1. de madrugada, um cliente acha o site, escolhe e toca no WhatsApp;
   2. a mensagem chega pronta e a resposta automática sai na hora;
   3. a tela vira o SEU celular às 7h, com 3 pedidos que entraram enquanto você dormia.
   Cada ramo (previa-celular.js) tem a sua história. Quem prefere menos movimento não vê o filme.
   Usado pela vitrine do topo (script.js): FilmeCelular.rodar(palco, ramo, { marca, ativo, legenda, fim }). */
(function () {
    "use strict";
    const HISTORIAS = {
        pizzaria: { hora: "23:47", alvo: "item:0", msg: "Oi! Quero 2 Calabresa pra entrega, por favor 🍕",
            resposta: "Pedido recebido! 🍕 2 Calabresa = R$ 90. Chega quentinha em até 40 min.",
            avisos: ["Novo pedido · R$ 90", "Novo pedido · R$ 52", "Novo pedido · R$ 98"], resumo: "3 pedidos enquanto você dormia", acha: "acha a {m} no Google" },
        barbearia: { hora: "00:32", alvo: "chip:1", msg: "Oi! Tem horário amanhã às 18h? Corte + barba ✂️",
            resposta: "Agendado! ✂️ Corte + barba amanhã às 18h. Te lembro 1h antes.",
            avisos: ["Novo horário · amanhã 18h", "Novo horário · amanhã 16h30", "Novo horário · amanhã 19h30"], resumo: "3 horários marcados enquanto você dormia", acha: "acha a {m} no Google" },
        "loja de roupa": { hora: "01:15", alvo: "item:1", msg: "Oi! Quero o Moletom oversized, tamanho M 🖤",
            resposta: "Separado pra você! 🛍️ Moletom M = R$ 189. Já te mando o Pix e o frete.",
            avisos: ["Nova venda · R$ 189", "Nova venda · R$ 129", "Nova venda · R$ 79"], resumo: "3 vendas enquanto você dormia", acha: "acha a {m} no Instagram" },
        "salão": { hora: "22:58", alvo: "chip:0", msg: "Oi! Tem horário pra escova amanhã às 10h? 💇‍♀️",
            resposta: "Tem sim! 💇‍♀️ Escova amanhã às 10h, tá agendado.",
            avisos: ["Novo agendamento · 10h", "Novo agendamento · 14h", "Novo agendamento · 16h"], resumo: "3 clientes agendaram enquanto você dormia", acha: "acha o {m} no Google" },
        academia: { hora: "05:40", alvo: "botao", msg: "Oi! Quero agendar a aula experimental grátis 💪",
            resposta: "Bora! 💪 Aula marcada pra amanhã às 7h. Traz tênis e garrafinha.",
            avisos: ["Novo aluno · aula experimental", "Novo aluno · plano mensal", "Novo aluno · plano anual"], resumo: "3 alunos novos enquanto você dormia", acha: "acha a {m} no Google" },
        "clínica": { hora: "23:05", alvo: "item:0", msg: "Olá! Queria marcar uma consulta com o clínico geral.",
            resposta: "Consulta marcada! 🩺 Segunda às 9h. Qualquer dúvida é só chamar.",
            avisos: ["Nova consulta · seg 9h", "Nova consulta · ter 14h", "Nova consulta · qua 10h"], resumo: "3 consultas marcadas enquanto você dormia", acha: "acha a {m} no Google" },
    };
    const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const somaMin = (hora, min) => {
        const [h, m] = hora.split(":").map(Number);
        const t = (h * 60 + m + min) % 1440;
        return String(Math.floor(t / 60)).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0");
    };
    // som só com a música do site ligada: o filme se repete, e "plim" sem a pessoa pedir cansa
    const som = (efeito, ...args) => { const m = window.musicaSite; if (m && m.tocando && m.tocando() && m[efeito]) m[efeito](...args); };
    const dataHoje = () => new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

    function rodar(palco, ramo, op) {
        const h = HISTORIAS[ramo];
        const tela = palco.querySelector(".previa-tela");
        const site = palco.querySelector(".previa-site");
        if (!h || !tela || !site) return { cancelar() {} };
        let cancelado = false;
        const marca = () => op.marca() || "Seu negócio";
        const iniciais = () => (window.PreviaCelular ? window.PreviaCelular.iniciais(marca()) : marca()[0]);

        // espera "ms" de tempo de tela: se a vitrine sai da tela ou a aba fica escondida, o filme pausa
        const esperar = (ms) => new Promise((ok, falha) => {
            let resta = ms, antes = performance.now();
            (function passo() {
                if (cancelado) return falha(new Error("cancelado"));
                const agora = performance.now();
                if (op.ativo()) resta -= agora - antes;
                antes = agora;
                if (resta <= 0) return ok();
                setTimeout(passo, Math.min(resta, 200));
            })();
        });
        const relogio = tela.querySelector(".previa-status span");
        if (relogio) relogio.textContent = h.hora.replace(/^0/, "");

        const dedo = document.createElement("span");
        dedo.className = "filme-dedo";
        dedo.setAttribute("aria-hidden", "true");
        tela.appendChild(dedo);
        const posicao = (el) => {
            const a = el.getBoundingClientRect(), t = tela.getBoundingClientRect();
            const escala = t.width / tela.offsetWidth || 1; // a vitrine pode estar levemente girada/escalada
            return [(a.left + a.width * .5 - t.left) / escala, (a.top + a.height * .55 - t.top) / escala];
        };
        const moverDedo = (el) => { const [x, y] = posicao(el); dedo.style.transform = `translate(${x}px, ${y}px)`; };
        async function tocar(el) {
            moverDedo(el);
            await esperar(800);
            dedo.classList.remove("toca"); void dedo.offsetWidth; dedo.classList.add("toca");
            el.classList.remove("apertou"); void el.offsetWidth; el.classList.add("apertou", "filme-escolhido");
            await esperar(420);
        }
        function alvo() {
            const [tipo, n] = h.alvo.split(":");
            if (tipo === "item") return site.querySelectorAll(".previa-item")[n];
            if (tipo === "chip") return site.querySelectorAll(".previa-chips button")[n];
            return site.querySelector(".previa-botao");
        }

        async function filme() {
            op.legenda(`🌙 ${h.hora}. Um cliente ${h.acha.replace("{m}", `<b data-marca>${esc(marca())}</b>`)}…`);
            await esperar(1100);
            // 1. escolhe no site
            const el = alvo();
            if (el) {
                const topo = el.getBoundingClientRect().top - site.getBoundingClientRect().top + site.scrollTop;
                const destino = Math.max(0, topo - site.clientHeight * .45);
                if (Math.abs(destino - site.scrollTop) > 20) { site.scrollTo({ top: destino, behavior: "smooth" }); await esperar(700); }
                dedo.style.transform = `translate(${tela.offsetWidth * .62}px, ${tela.offsetHeight * .92}px)`;
                void dedo.offsetWidth;
                dedo.classList.add("visivel");
                await esperar(250);
                await tocar(el);
            }
            const whats = site.querySelector(".previa-whats");
            if (whats) await tocar(whats);
            dedo.classList.remove("visivel");

            // 2. o WhatsApp: mensagem pronta e resposta automática
            const zap = document.createElement("div");
            zap.className = "filme-zap";
            zap.setAttribute("aria-hidden", "true");
            zap.innerHTML = `
                <div class="filme-zap-topo"><span class="filme-zap-voltar">‹</span><span class="filme-zap-logo">${esc(iniciais())}</span><p><b>${esc(marca())}</b><small>online</small></p></div>
                <div class="filme-zap-conversa"></div>
                <div class="filme-zap-campo"><span>Mensagem</span><i><svg viewBox="0 0 24 24"><path d="M3.4 20.4 21 12 3.4 3.6 3.3 10l12.4 2-12.4 2z"/></svg></i></div>`;
            tela.appendChild(zap);
            void zap.offsetWidth;
            zap.classList.add("entrou");
            op.legenda("…a mensagem chega pronta no WhatsApp e <b>já é respondida sozinha</b>…");
            const conversa = zap.querySelector(".filme-zap-conversa");
            const status = zap.querySelector(".filme-zap-topo small");
            const bolha = (texto, classe, extra) => {
                const p = document.createElement("p");
                p.className = "filme-bolha " + classe;
                p.innerHTML = esc(texto) + (extra || "");
                conversa.appendChild(p);
                return p;
            };
            await esperar(600);
            bolha(h.msg, "filme-cliente", `<small>${h.hora} <b>✓✓</b></small>`);
            som("passar");
            await esperar(700);
            status.textContent = "digitando…";
            const digitando = bolha("", "filme-loja filme-digitando", "<i></i><i></i><i></i>");
            await esperar(1200);
            digitando.remove();
            status.textContent = "online";
            bolha(h.resposta, "filme-loja", `<small>⚡ resposta automática · ${somaMin(h.hora, 1)}</small>`);
            som("curtir");
            await esperar(2300);

            // 3. o SEU celular de manhã
            const bloqueio = document.createElement("div");
            bloqueio.className = "filme-bloqueio";
            bloqueio.setAttribute("aria-hidden", "true");
            const vezes = [h.hora, somaMin(h.hora, 71), somaMin(h.hora, 146)];
            bloqueio.innerHTML = `
                <p class="filme-bloqueio-quem">📱 o seu celular</p>
                <p class="filme-bloqueio-data">${esc(dataHoje())}</p>
                <p class="filme-bloqueio-hora">7:00</p>
                <div class="filme-avisos">${h.avisos.map((a, i) => `<div class="filme-aviso"><span class="filme-aviso-logo">${esc(iniciais())}</span><p><b>${esc(marca())}</b><span>${esc(a)}</span></p><small>${vezes[i]}</small></div>`).join("")}</div>
                <p class="filme-resumo">🌙 ${esc(h.resumo)}</p>`;
            tela.appendChild(bloqueio);
            void bloqueio.offsetWidth;
            bloqueio.classList.add("entrou");
            if (relogio) relogio.textContent = "7:00";
            op.legenda(`…e você acorda com <b>${esc(h.resumo.split(" enquanto")[0])}</b>. 💰`);
            await esperar(700);
            for (const aviso of bloqueio.querySelectorAll(".filme-aviso")) {
                aviso.classList.add("chegou");
                som("nota", 84, .5);
                await esperar(520);
            }
            bloqueio.querySelector(".filme-resumo").classList.add("chegou");
            await esperar(3200);
        }
        filme().then(() => { if (!cancelado) op.fim(); }).catch(() => { /* trocaram de ramo no meio */ });
        return { cancelar() { cancelado = true; } };
    }

    window.FilmeCelular = { HISTORIAS, rodar };
})();
