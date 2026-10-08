/* Português / Espanhol: troca o idioma do site sem recarregar a página.
   Estratégia: na primeira carga, percorre o texto visível e GUARDA o original (português,
   como foi escrito no HTML) junto com a tradução achada no dicionário abaixo. Trocar de
   idioma depois é só reaplicar a lista — não mexe no HTML, então não tem risco de quebrar
   marcação. Áreas montadas por JavaScript (vitrine, comparador, orçamento) ainda não entram
   nessa tradução; ficam para uma próxima etapa. */
(function () {
    "use strict";

    var CHAVE = "portfolio-idioma";

    var DICIONARIO = {
        /* ---------- Navegação ---------- */
        "Sobre mim": "Sobre mí",
        "Projetos": "Proyectos",
        "Serviços": "Servicios",
        "Currículo": "Currículum",
        "Contato": "Contacto",
        "Orçamento": "Presupuesto",
        "Trocar para o tema azul": "Cambiar al tema azul",
        "Tema azul": "Tema azul",
        "Ligar música de fundo": "Activar música de fondo",
        "Ligar música": "Activar música",
        "Ir para Início": "Ir a Inicio",
        "Ir para Sobre mim": "Ir a Sobre mí",
        "Ir para Projetos": "Ir a Proyectos",
        "Ir para Serviços": "Ir a Servicios",
        "Ir para Orçamento": "Ir a Presupuesto",
        "Ir para Minha jornada": "Ir a Mi trayectoria",
        "Ir para Contato": "Ir a Contacto",

        /* ---------- Hero ---------- */
        "Aceitando projetos": "Aceptando proyectos",
        "Dev web & mobile · Campo Grande - MS": "Dev web y móvil · Campo Grande - MS",
        "Olá! Me chamo": "¡Hola! Me llamo",
        "Bom dia! Me chamo": "¡Buenos días! Me llamo",
        "Boa tarde! Me chamo": "¡Buenas tardes! Me llamo",
        "Boa noite! Me chamo": "¡Buenas noches! Me llamo",
        "Boa madrugada! Me chamo": "¡Buena madrugada! Me llamo",
        "Sites e sistemas que": "Sitios y sistemas que",
        "trabalham por você.": "trabajan por ti.",
        "Site e sistema sob medida pro seu negócio: aparece no Google, responde no WhatsApp sozinho e funciona no celular.":
            "Sitio y sistema a medida para tu negocio: aparece en Google, responde en WhatsApp solo y funciona en el celular.",
        "Quero meu orçamento": "Quiero mi presupuesto",
        "ver projetos funcionando": "ver proyectos funcionando",
        "⚡ Orçamento em 24h": "⚡ Presupuesto en 24h",
        "sem compromisso · direto no WhatsApp": "sin compromiso · directo por WhatsApp",
        "🖤 No ar: loja da": "🖤 En línea: tienda de",
        "ver o case": "ver el caso",
        "Exemplos de site pronto, por ramo": "Ejemplos de sitio listo, por rubro",
        "projetos pra testar ao vivo": "proyectos para probar en vivo",
        "valor inicial de um site": "valor inicial de un sitio",
        "pra responder sua mensagem": "para responder tu mensaje",

        /* ---------- Calculadora rápida ---------- */
        "🔮 Quanto custaria o seu?": "🔮 ¿Cuánto costaría el tuyo?",
        "Complexidade:": "Complejidad:",
        "Simples": "Simple",
        "Médio": "Medio",
        "Avançado": "Avanzado",
        "Site": "Sitio",
        "Sistema": "Sistema",
        "Automação": "Automatización",
        "Estimativa:": "Estimación:",
        "Pedir esse orçamento →": "Pedir este presupuesto →",
        "Só um ponto de partida — o valor exato vem na proposta, depois que eu entender sua ideia.":
            "Es solo un punto de partida — el valor exacto llega en la propuesta, después de que entienda tu idea.",

        /* ---------- Comparador (parte estática) ---------- */
        "Seu negócio": "Tu negocio",
        "sem site": "sin sitio",
        "com site": "con sitio",
        "😩 sem site": "😩 sin sitio",
        "😎 com site": "😎 con sitio",
        "Qual é o seu negócio?": "¿Cuál es tu negocio?",
        "sem site · a vida como ela é": "sin sitio · la vida como es",
        "a vida como ela é": "la vida como es",
        "com site · a vida como deveria ser": "con sitio · la vida como debería ser",
        "a vida como deveria ser": "la vida como debería ser",
        "👀 ver como ficaria o site da": "👀 ver cómo quedaría el sitio de",
        "Sua Pizzaria": "Tu Pizzería",
        "💸 Quanto você perde por mês sem site?": "💸 ¿Cuánto pierdes al mes sin sitio?",
        "calcular": "calcular",
        "Mensagens de cliente por semana:": "Mensajes de cliente por semana:",
        "Valor médio de uma venda: R$": "Valor medio de una venta: R$",
        "Se 1 em cada 5 desiste esperando resposta, são": "Si 1 de cada 5 desiste esperando respuesta, son",
        "clientes por mês indo pro concorrente:": "clientes al mes que se van a la competencia:",
        "por mês ·": "al mes ·",
        "por ano": "al año",
        "O site custa a partir de": "El sitio cuesta desde",
        ", uma vez só. É uma estimativa, mas a conta é essa.": ", una sola vez. Es una estimación, pero la cuenta es esa.",
        "ver os projetos ↓": "ver los proyectos ↓",
        "quero isso no meu negócio →": "quiero eso en mi negocio →",
        "nome do seu negócio (opcional)": "nombre de tu negocio (opcional)",

        /* ---------- Sobre mim ---------- */
        "QUEM SOU": "QUIÉN SOY",
        "Sobre mim": "Sobre mí",
        "onde tudo começou": "donde todo empezó",
        "Meu primeiro projeto usando HTML e CSS.": "Mi primer proyecto usando HTML y CSS.",
        "Crio sites, sistemas e aplicativos sob medida, com foco em Python, Flask e JavaScript — do primeiro rascunho até o projeto no ar. Você pode testar cada um deles abaixo, na hora, sem precisar instalar nada.":
            "Creo sitios, sistemas y aplicaciones a medida, con foco en Python, Flask y JavaScript — desde el primer boceto hasta el proyecto en línea. Puedes probar cada uno abajo, al instante, sin instalar nada.",
        "Tenho 22 anos e sigo estudando Análise e Desenvolvimento de Sistemas, mas aprendo mesmo é resolvendo problema real. Confira os projetos e a minha jornada até aqui.":
            "Tengo 22 años y sigo estudiando Análisis y Desarrollo de Sistemas, pero aprendo de verdad resolviendo problemas reales. Mira los proyectos y mi trayectoria hasta aquí.",
        "ATIVIDADE NO GITHUB": "ACTIVIDAD EN GITHUB",

        /* ---------- Sobre mim: ficha de personagem e "Converse comigo" (ficha.js) ---------- */
        "FICHA DE PERSONAGEM": "FICHA DE PERSONAJE",
        "VERSO": "REVERSO",
        "NÍVEL": "NIVEL",
        "Classe:": "Clase:",
        "Atributos": "Atributos",
        "Resolver problema de cliente": "Resolver problemas de clientes",
        "Café consumido": "Café consumido",
        "toque pra virar ↻": "toca para girar ↻",
        "↻ Virar a ficha": "↻ Girar la ficha",
        "SUPERPODER": "SUPERPODER",
        "Transformar planilha bagunçada e atendimento lento em sistema que funciona.":
            "Transformar planillas desordenadas y atención lenta en sistemas que funcionan.",
        "ORIGEM": "ORIGEN",
        "Técnico de computador no Exército Brasileiro. Hoje, no 4º semestre de Análise e Desenvolvimento de Sistemas.":
            "Técnico de computadoras en el Ejército Brasileño. Hoy, en el 4º semestre de Análisis y Desarrollo de Sistemas.",
        "PONTO FRACO": "PUNTO DÉBIL",
        "NAS HORAS VAGAS": "EN LOS RATOS LIBRES",
        "MISSÕES CUMPRIDAS": "MISIONES CUMPLIDAS",
        "INVENTÁRIO": "INVENTARIO",
        "Conquistas desbloqueadas": "Logros desbloqueados",
        "Edição de estreia · Campo Grande - MS": "Edición de estreno · Campo Grande - MS",
        "Trabalha até de madrugada!": "¡Trabaja hasta de madrugada!",
        "Enquanto isso, em Campo Grande…": "Mientras tanto, en Campo Grande…",
        "Mais tarde, no laboratório…": "Más tarde, en el laboratorio…",
        "Nos bastidores…": "Tras bastidores…",
        "Agora, o que interessa…": "Ahora, lo que importa…",
        "Nesse exato momento, alguém precisa de um site…": "En este preciso momento, alguien necesita un sitio…",
        "Flashback!": "¡Flashback!",
        "E pra fechar a edição…": "Y para cerrar la edición…",
        "sim, esse botão funciona. eu testei.": "sí, este botón funciona. lo probé.",
        "pode clicar em tudo: é tudo de verdade 👇": "puedes hacer clic en todo: todo es de verdad 👇",
        "leu até aqui? então já é quase cliente 😏": "¿leíste hasta aquí? entonces ya eres casi cliente 😏",
        "fim da edição #1. a #2 depende de você.": "fin de la edición #1. la #2 depende de ti.",
        "Você": "Tú",
        "Quero o meu!": "¡Quiero el mío!",
        "🎨 O site pegou as cores do seu ramo. Pra voltar, é só escolher um tema lá em cima.": "🎨 El sitio tomó los colores de tu rubro. Para volver, elige un tema arriba.",
        "Escolher o tema de cores": "Elegir el tema de colores",
        "Temas de cor": "Temas de color",
        "Escolha as cores": "Elige los colores",
        "Vermelho": "Rojo", "o clássico": "el clásico", "Azul": "Azul", "elétrico": "eléctrico",
        "Cerrado": "Cerrado", "terra, ipê-amarelo e ipê-roxo": "tierra, ipê amarillo e ipê morado",
        "Neon": "Neón", "lanchonete de madrugada": "cafetería de madrugada",
        "Gibi 1985": "Cómic 1985", "revista de banca": "revista de quiosco",
        "Não deu pra trocar o tema agora. Tente de novo.": "No se pudo cambiar el tema ahora. Inténtalo de nuevo.",
        "🌙 Já é tarde aqui em Campo Grande: sua mensagem chega agora e eu te respondo amanhã, em até 24h.": "🌙 Ya es tarde aquí en Campo Grande: tu mensaje llega ahora y te respondo mañana, en hasta 24 h.",
        "⚡ Versão leve": "⚡ Versión ligera",
        "✨ Versão completa": "✨ Versión completa",
        "⚡ Tá lento? Toque pra versão leve": "⚡ ¿Va lento? Toca para la versión ligera",
        "⏱️ Sem tempo? Leia em 20 segundos": "⏱️ ¿Sin tiempo? Léelo en 20 segundos",
        "Resumo de 20 segundos": "Resumen de 20 segundos",
        "Samuel Mickael, dev de Campo Grande - MS": "Samuel Mickael, desarrollador de Campo Grande - MS (Brasil)",
        "O que eu faço:": "Lo que hago:",
        "site, cardápio com pedido no WhatsApp, agendamento, loja online e sistemas sob medida.": "sitio web, menú con pedido por WhatsApp, agenda de citas, tienda online y sistemas a medida.",
        "Quanto custa:": "Cuánto cuesta:",
        "a partir de R$ 250, pagamento único, sem mensalidade.": "desde R$ 250, pago único, sin mensualidad.",
        "Sem risco:": "Sin riesgo:",
        "eu monto uma prévia antes. Só paga se gostar.": "armo una vista previa antes. Solo pagas si te gusta.",
        "Prazo:": "Plazo:",
        "um site de apresentação fica pronto em cerca de 5 dias.": "un sitio de presentación queda listo en unos 5 días.",
        "Já no ar:": "Ya en línea:",
        "a loja da Eclipse Studio.": "la tienda de Eclipse Studio.",
        "Ver o case →": "Ver el caso →",
        "Ver o site completo": "Ver el sitio completo",
        "Nunca teve site? As 3 dúvidas mais comuns": "¿Nunca tuviste sitio web? Las 3 dudas más comunes",
        "E se eu não souber mexer?": "¿Y si no sé usarlo?",
        "Não precisa. Os pedidos chegam no WhatsApp que você já usa. Pra trocar preço ou foto, é só me mandar, ou eu te ensino a mudar. Nas primeiras vezes eu te ajudo.": "No hace falta. Los pedidos llegan al WhatsApp que ya usas. Para cambiar un precio o una foto, solo mándamelo, o te enseño a cambiarlo. Las primeras veces te ayudo.",
        "E se der problema?": "¿Y si algo falla?",
        "Erro meu no site, eu corrijo sem custo. Site fora do ar, eu olho em até 24h.": "Si es un error mío en el sitio, lo corrijo sin costo. Si el sitio se cae, lo reviso en hasta 24 h.",
        "O site é meu ou alugado?": "¿El sitio es mío o alquilado?",
        "É seu: site, textos, fotos e o domínio (.com.br) no seu nome, com todos os acessos por escrito. Nenhuma mensalidade obrigatória comigo.": "Es tuyo: sitio, textos, fotos y el dominio (.com.br) a tu nombre, con todos los accesos por escrito. Ninguna mensualidad obligatoria conmigo.",
        "Ver como eu trabalho, do começo ao fim →": "Ver cómo trabajo, de principio a fin →",
        "🎧 Aperte o play da edição": "🎧 Dale play a la edición",
        "continua na próxima página": "continúa en la próxima página",
        "lendária": "legendaria",
        "rara": "rara",
        "especial": "especial",
        "Aprovado!": "¡Aprobado!",
        "agora é só apertar enviar": "ahora solo aprieta enviar",
        "Fim?": "¿Fin?",
        "arraste pro lado pra ver os 3 →": "desliza hacia el lado para ver los 3 →",
        "arraste pro lado pra ver todas →": "desliza hacia el lado para ver todos →",
        "Indiquei alguém. Ganho alguma coisa?": "Recomendé a alguien. ¿Gano algo?",
        "E a jornada até aqui": "Y el camino hasta aquí",
        "Grátis": "Gratis",
        "Não sabe o que precisa?": "¿No sabes qué necesitas?",
        "Faça o diagnóstico de 1 minuto: nota de 0 a 10 e as 3 coisas que mais estão te fazendo perder cliente.": "Haz el diagnóstico de 1 minuto: nota de 0 a 10 y las 3 cosas que más te están haciendo perder clientes.",
        "Fazer o diagnóstico →": "Hacer el diagnóstico →",
        "Prefere marcar uma conversa de 15 min?": "¿Prefieres agendar una charla de 15 min?",
        "Toque num horário e a mensagem já vai pronta. Se não der pra mim, eu te sugiro outro.": "Toca un horario y el mensaje ya va listo. Si no puedo, te sugiero otro.",
        "Sugestões de horário": "Sugerencias de horario",
        "pra aparecer e vender": "para aparecer y vender",
        "pra organizar o negócio": "para organizar el negocio",
        "pra parar de repetir tarefa": "para dejar de repetir tareas",
        "Cansado de perder cliente pro vizinho?": "¿Cansado de perder clientes con el vecino?",
        "Chega de caderno e planilha bagunçada!": "¡Basta de cuadernos y planillas desordenadas!",
        "Faça o computador trabalhar por você!": "¡Haz que la computadora trabaje por ti!",
        "✂ cupom · recorte e envie": "✂ cupón · recorta y envía",
        "Na próxima edição…": "En la próxima edición…",
        "O seu projeto!": "¡Tu proyecto!",
        "Site, sistema ou automação: a história continua no seu WhatsApp.": "Sitio, sistema o automatización: la historia continúa en tu WhatsApp.",
        "Garantir a próxima edição →": "Asegurar la próxima edición →",
        "Aprovado pelo": "Aprobado por el",
        "Comitê de Clientes Felizes": "Comité de Clientes Felices",
        "Selo de brincadeira: aprovado pelo Comitê de Clientes Felizes": "Sello de broma: aprobado por el Comité de Clientes Felices",
        "Contracapa: próxima edição": "Contraportada: próxima edición",
        "Arrasta e vê o que muda no": "Desliza y mira qué cambia en",
        "seu negócio": "tu negocio",
        "Seu negócio:": "Tu negocio:",
        "Tipo do seu negócio": "Tipo de tu negocio",
        "🍕 pizzaria": "🍕 pizzería",
        "💈 barbearia": "💈 barbería",
        "👕 loja de roupa": "👕 tienda de ropa",
        "💇 salão": "💇 salón",
        "💪 academia": "💪 gimnasio",
        "🩺 clínica": "🩺 clínica",
        "O mesmo cliente, no seu negócio sem site e com site. Arraste pra comparar.": "El mismo cliente, en tu negocio sin sitio y con sitio. Desliza para comparar.",
        "Precisa de um site? É só acender o sinal.": "¿Necesitas un sitio? Solo enciende la señal.",
        "arraste pro lado pra ler a tirinha →": "desliza hacia el lado para leer la tira →",
        "Próxima edição: o seu projeto.": "Próxima edición: tu proyecto.",
        "Os projetos de bastidores, do primeiro site ao primeiro banco de dados. Cada um destravou uma coisa nova.":
            "Los proyectos de bastidores, del primer sitio a la primera base de datos. Cada uno desbloqueó algo nuevo.",
        "conquistas": "logros",
        "🏆 Conquista desbloqueada ·": "🏆 Logro desbloqueado ·",
        "Primeiro site no ar": "Primer sitio en línea",
        "O dinheiro não some mais": "El dinero ya no desaparece",
        "Primeiro banco de dados de verdade": "Primera base de datos de verdad",
        "Treino organizado pelo terminal": "Entrenamiento organizado desde la terminal",
        "8 commits · onde tudo começou": "8 commits · donde todo empezó",
        "11 commits · em 27/08 virou app que instala no celular": "11 commits · el 27/08 se volvió app que se instala en el celular",
        "32 testes automáticos rodando no GitHub Actions": "32 pruebas automáticas corriendo en GitHub Actions",
        "8 testes · Python com Rich, direto no terminal": "8 pruebas · Python con Rich, directo en la terminal",
        "Conquista bloqueada · ???": "Logro bloqueado · ???",
        "O seu projeto no ar": "Tu proyecto en línea",
        "A próxima conquista da lista pode ser o site, o sistema ou a automação do seu negócio.":
            "El próximo logro de la lista puede ser el sitio, el sistema o la automatización de tu negocio.",
        "Desbloquear →": "Desbloquear →",
        "projetos no ar pra testar": "proyectos en línea para probar",
        "contribuições no GitHub no último ano": "contribuciones en GitHub en el último año",
        "loja de cliente no ar:": "tienda de cliente en línea:",
        "Chamar pra missão →": "Llamar a la misión →",
        "Salvar a ficha": "Guardar la ficha",
        "Converse comigo": "Habla conmigo",
        "online": "en línea",
        "Conversa": "Conversación",
        "Perguntas": "Preguntas",
        "Oi! Sou o Samuel 👋 Toque numa pergunta aqui embaixo que eu respondo.":
            "¡Hola! Soy Samuel 👋 Toca una pregunta aquí abajo y te respondo.",
        "Respondo em até 24h, direto no WhatsApp. E depois de entender o seu projeto, já mando o valor e o prazo.":
            "Respondo en hasta 24h, directo por WhatsApp. Y después de entender tu proyecto, te envío el valor y el plazo.",
        "Quanto custa?": "¿Cuánto cuesta?",
        "Em quanto tempo você responde?": "¿En cuánto tiempo respondes?",
        "Preciso ter logo e fotos?": "¿Necesito tener logo y fotos?",
        "E o domínio e a hospedagem?": "¿Y el dominio y el hosting?",
        "Tem suporte depois?": "¿Hay soporte después?",
        "Como é o pagamento?": "¿Cómo es el pago?",
        "Continuar no meu WhatsApp →": "Seguir en mi WhatsApp →",

        /* ---------- Projetos em destaque ---------- */
        "PORTFÓLIO": "PORTAFOLIO",
        "Projetos em destaque": "Proyectos destacados",
        "Teste agora, direto no navegador — sem instalar nada. São parecidos com o que você pode encomendar.":
            "Pruébalo ahora, directo en el navegador — sin instalar nada. Son parecidos a lo que puedes encargar.",
        "Todos": "Todos",
        "App": "App",
        "Atendimento": "Atención",
        "🎯 Qual é a sua cara?": "🎯 ¿Cuál es tu estilo?",
        "O que você quer criar?": "¿Qué quieres crear?",
        "Surpreenda": "Sorpréndeme",
        "Quer ver as demos com a cara do seu negócio?": "¿Quieres ver las demos con la cara de tu negocio?",
        "Nome do seu negócio (ex.: Pizzaria do João)": "Nombre de tu negocio (ej.: Pizzería de Juan)",
        "A loja e o atendimento por chat abrem com o nome que você digitar.":
            "La tienda y la atención por chat se abren con el nombre que escribas.",

        /* Eldev Music */
        "App que instala no celular": "App que se instala en el celular",
        "app de verdade, sem passar pela loja de apps": "app de verdad, sin pasar por la tienda de apps",
        "Quer estar na tela do celular do seu cliente, sem ele precisar baixar nada da loja de apps? Este app de música mostra que dá: instala com um toque e funciona até sem internet.":
            "¿Quieres estar en la pantalla del celular de tu cliente, sin que tenga que descargar nada de la tienda de apps? Esta app de música demuestra que se puede: se instala con un toque y funciona hasta sin internet.",
        "Antes:": "Antes:",
        "Depois:": "Después:",
        "o cliente precisa lembrar o endereço do seu site.": "el cliente tiene que recordar la dirección de tu sitio.",
        "o seu ícone fica na tela dele, a um toque.": "tu ícono queda en su pantalla, a un toque.",
        "Serve pra": "Sirve para",
        "Rádio ou podcast": "Radio o podcast",
        "Academia com playlist": "Gimnasio con playlist",
        "Igreja ou banda": "Iglesia o banda",
        "Escola de música": "Escuela de música",
        "Tudo o que ele faz": "Todo lo que hace",
        "Disco de vinil que gira com o dedo": "Disco de vinilo que gira con el dedo",
        "Rádio que não para de tocar": "Radio que no para de sonar",
        "Timer pra desligar sozinho na hora de dormir": "Temporizador para apagarse solo a la hora de dormir",
        "Baixar músicas pra ouvir sem internet": "Descargar música para escuchar sin internet",
        "Garimpo de artistas novos": "Descubrimiento de artistas nuevos",
        "Playlists pra mandar por link": "Playlists para enviar por link",
        "Teste agora:": "Prueba ahora:",
        "toque numa música e gire o disco com o dedo pra avançar.": "toca una canción y gira el disco con el dedo para avanzar.",
        "6 recursos além do play": "6 funciones además del play",
        "Prazo de algo assim: 3 a 4 semanas": "Plazo de algo así: 3 a 4 semanas",
        "Testar agora": "Probar ahora",
        "Quero um app assim": "Quiero una app así",

        /* Glitch District */
        "Loja online com pedido no WhatsApp": "Tienda en línea con pedido por WhatsApp",
        "a vitrine que manda o pedido pronto pro seu WhatsApp": "la vitrina que manda el pedido listo a tu WhatsApp",
        "Cansou de responder “tem no M?” e “quanto fica?” o dia inteiro? Aqui o cliente vê as peças, escolhe o tamanho e o pedido chega pronto no seu WhatsApp. O visual neon é só um exemplo: ele muda pra cara da sua marca.":
            "¿Cansado de responder “¿tienen talla M?” y “¿cuánto cuesta?” todo el día? Aquí el cliente ve las piezas, elige la talla y el pedido llega listo a tu WhatsApp. El estilo neón es solo un ejemplo: cambia a la cara de tu marca.",
        "foto no direct e preço mandado um por um.": "foto por mensaje directo y precio enviado uno por uno.",
        "o cliente monta o carrinho sozinho e você só confirma.": "el cliente arma el carrito solo y tú solo confirmas.",
        "Loja de roupa": "Tienda de ropa",
        "Marmitaria ou doceria": "Viandas o pastelería",
        "Loja de acessórios": "Tienda de accesorios",
        "Qualquer loja pequena": "Cualquier tienda pequeña",
        "escolha um tamanho, ponha no carrinho e veja a mensagem que iria pro WhatsApp.":
            "elige una talla, ponla en el carrito y mira el mensaje que iría a WhatsApp.",
        "19 peças em 6 categorias": "19 piezas en 6 categorías",
        "Prazo de algo assim: 2 a 3 semanas": "Plazo de algo así: 2 a 3 semanas",
        "Quero uma loja assim": "Quiero una tienda así",

        /* Fatia Nobre */
        "Atendimento automático por chat": "Atención automática por chat",
        "responde o cliente mesmo com a loja fechada": "responde al cliente aunque la tienda esté cerrada",
        "Cliente pergunta o horário às 23h e fica sem resposta? Aqui o chat responde na hora: horário, endereço, cardápio, entrega e pagamento.":
            "¿El cliente pregunta el horario a las 23h y se queda sin respuesta? Aquí el chat responde al instante: horario, dirección, menú, entrega y pago.",
        "as mesmas perguntas o dia todo, no seu celular.": "las mismas preguntas todo el día, en tu celular.",
        "o chat responde sozinho e você cuida do que importa.": "el chat responde solo y tú te ocupas de lo que importa.",
        "Pizzaria e lanchonete": "Pizzería y lonchería",
        "Salão e barbearia": "Peluquería y barbería",
        "Clínica e consultório": "Clínica y consultorio",
        "Loja com perguntas repetidas": "Tienda con preguntas repetidas",
        "digite “que horas abre?” e veja a resposta chegar.": "escribe “¿a qué hora abren?” y mira llegar la respuesta.",
        "Responde 9 tipos de pergunta": "Responde 9 tipos de pregunta",
        "Prazo de algo assim: 1 a 2 semanas": "Plazo de algo así: 1 a 2 semanas",
        "Quero um atendimento assim": "Quiero una atención así",

        /* Conta a Dois */
        "Sistema que funciona em dois celulares": "Sistema que funciona en dos celulares",
        "cada um lança, os dois veem na hora": "cada uno anota, los dos lo ven al instante",
        "Sabe a conversa de “quem pagou o mercado?”? Aqui cada um anota o gasto no próprio celular e o app mostra na hora quem deve quanto pra quem.":
            "¿Conoces la charla de “¿quién pagó el mercado?”? Aquí cada uno anota el gasto en su propio celular y la app muestra al instante quién le debe cuánto a quién.",
        "planilha, papel ou “depois a gente vê”.": "planilla, papel o “después lo vemos”.",
        "a conta fecha sozinha, nos dois celulares.": "la cuenta se cierra sola, en los dos celulares.",
        "Casal ou quem divide casa": "Pareja o quien comparte casa",
        "Sócios de um negócio": "Socios de un negocio",
        "Equipe que anota pedidos": "Equipo que anota pedidos",
        "Grupo que divide contas": "Grupo que divide cuentas",
        "crie um casal e toque em “Abrir como o par”. Anote um gasto numa aba e veja aparecer na outra.":
            "crea una pareja y toca “Abrir como el otro”. Anota un gasto en una pestaña y mira aparecer en la otra.",
        "Atualiza a cada 4 segundos": "Se actualiza cada 4 segundos",
        "Quero um sistema assim": "Quiero un sistema así",

        /* TaskFlow */
        "Lista de tarefas com prioridade": "Lista de tareas con prioridad",
        "o que é urgente fica no topo": "lo urgente queda arriba",
        "Anota tudo e mesmo assim o urgente se perde no meio da lista? Aqui você marca o que é urgente e ele sobe pro topo; o que já fez, é só riscar. Tudo fica salvo no próprio aparelho.":
            "¿Anotas todo y aun así lo urgente se pierde en medio de la lista? Aquí marcas lo urgente y sube arriba; lo que ya hiciste, solo lo tachas. Todo queda guardado en el propio dispositivo.",
        "Freelancer": "Freelancer",
        "Equipe pequena": "Equipo pequeño",
        "Estudante": "Estudiante",
        "3 níveis de prioridade": "3 niveles de prioridad",
        "Quero um organizador assim": "Quiero un organizador así",

        /* FocusFlow */
        "Cronômetro de foco": "Cronómetro de enfoque",
        "foco de 25 minutos, pausa na hora certa": "enfoque de 25 minutos, pausa en el momento justo",
        "Senta pra trabalhar e dez minutos depois está no celular? Este cronômetro divide o trabalho em blocos de foco e pausas, e conta quantos blocos você já completou.":
            "¿Te sientas a trabajar y diez minutos después estás en el celular? Este cronómetro divide el trabajo en bloques de enfoque y pausas, y cuenta cuántos bloques ya completaste.",
        "Quem trabalha em casa": "Quien trabaja en casa",
        "Curso ou escola": "Curso o escuela",
        "3 modos: 25, 5 e 15 min": "3 modos: 25, 5 y 15 min",
        "Prazo de algo assim: 1 semana": "Plazo de algo así: 1 semana",

        /* FlowBoard */
        "Quadro de tarefas em colunas": "Tablero de tareas en columnas",
        "do “a fazer” ao “pronto”, arrastando": "de “por hacer” a “listo”, arrastrando",
        "Não sabe mais o que já andou e o que está parado? Um quadro com três colunas (a fazer, fazendo e pronto), e no computador você arrasta cada tarefa conforme ela anda.":
            "¿Ya no sabes qué avanzó y qué está parado? Un tablero con tres columnas (por hacer, haciendo y listo), y en la computadora arrastras cada tarea a medida que avanza.",
        "Agência": "Agencia",
        "Organizar um projeto": "Organizar un proyecto",
        "3 colunas de trabalho": "3 columnas de trabajo",
        "Quero um quadro assim": "Quiero un tablero así",

        /* ---------- Mais projetos ---------- */
        "TAMBÉM NO GITHUB": "TAMBIÉN EN GITHUB",
        "Mais projetos": "Más proyectos",
        "Fora da vitrine principal, mas ainda no ar. Dá uma espiada nos bastidores.":
            "Fuera de la vitrina principal, pero sigue en línea. Échale un vistazo detrás de escena.",
        "Uma landing page: página única pra apresentar uma marca. Serve pra quando alguém tá começando um negócio e precisa de um lugar profissional pra mandar o link, além da rede social.":
            "Una landing page: página única para presentar una marca. Sirve para cuando alguien está empezando un negocio y necesita un lugar profesional para mandar el link, además de la red social.",
        "Um app pra anotar receitas e despesas do dia a dia. Serve pra quando você quer parar de chegar no fim do mês sem saber pra onde o dinheiro foi.":
            "Una app para anotar ingresos y gastos del día a día. Sirve para cuando quieres dejar de llegar a fin de mes sin saber adónde se fue el dinero.",
        "O banco de dados real por trás do app acima. Sem ele, os gastos sumiriam ao fechar a aba — é o que separa um site simples de um sistema que guarda informação de verdade.":
            "La base de datos real detrás de la app de arriba. Sin ella, los gastos desaparecerían al cerrar la pestaña — es lo que separa un sitio simple de un sistema que guarda información de verdad.",
        "Um programa de terminal pra organizar a semana de treino. Mais um exercício técnico (testes automatizados, código organizado) do que uma ferramenta pronta pro dia a dia.":
            "Un programa de terminal para organizar la semana de entrenamiento. Más un ejercicio técnico (pruebas automatizadas, código organizado) que una herramienta lista para el día a día.",

        /* ---------- Serviços ---------- */
        "COMO POSSO AJUDAR": "CÓMO PUEDO AYUDAR",
        "O que eu posso fazer pelo seu negócio.": "Lo que puedo hacer por tu negocio.",
        "Preço de partida pra você ter uma ideia agora. O valor exato vem na proposta — respondo ainda hoje.":
            "Precio de partida para que tengas una idea ahora. El valor exacto llega en la propuesta — respondo hoy mismo.",
        "10% de desconto": "10% de descuento",
        "se você deixar um depoimento sobre o meu serviço.": "si dejas un testimonio sobre mi servicio.",
        "Sites e landing pages": "Sitios y landing pages",
        "Páginas responsivas para apresentar serviços, produtos ou uma marca pessoal.":
            "Páginas responsivas para presentar servicios, productos o una marca personal.",
        "a partir de": "desde",
        "Funciona no celular e no computador": "Funciona en el celular y en la computadora",
        "Botão direto pro seu WhatsApp": "Botón directo a tu WhatsApp",
        "Ajuda pra colocar no ar": "Ayuda para poner en línea",
        "Pedir orçamento disso →": "Pedir presupuesto de esto →",
        "Aplicações web": "Aplicaciones web",
        "Ferramentas interativas que resolvem tarefas reais, do planejamento ao controle financeiro.":
            "Herramientas interactivas que resuelven tareas reales, de la planificación al control financiero.",
        "Cadastro e controle do que você precisa": "Registro y control de lo que necesitas",
        "Dados guardados num banco de dados": "Datos guardados en una base de datos",
        "Vários aparelhos vendo a mesma informação": "Varios dispositivos viendo la misma información",
        "Automações em Python": "Automatizaciones en Python",
        "Soluções para reduzir tarefas repetitivas e deixar processos mais rápidos.":
            "Soluciones para reducir tareas repetitivas y agilizar procesos.",
        "Outubro de automação:": "Octubre de automatización:",
        "as 3 primeiras fechadas no mês saem com": "las 3 primeras cerradas en el mes salen con",
        "30% de desconto": "30% de descuento",
        "— é a categoria que eu mais quero validar agora.": "— es la categoría que más quiero validar ahora.",
        "Atendimento que responde sozinho": "Atención que responde sola",
        "Fim do copiar e colar repetitivo": "Fin del copiar y pegar repetitivo",
        "Relatórios e planilhas automáticas": "Informes y planillas automáticas",

        /* ---------- Orçamento ---------- */
        "ORÇAMENTO": "PRESUPUESTO",
        "Conte seu projeto em 1 minuto.": "Cuenta tu proyecto en 1 minuto.",
        "Responda algumas perguntas rapidinho — a mensagem já sai pronta pro WhatsApp, sem digitar nada.":
            "Responde algunas preguntas rapidito — el mensaje ya sale listo para WhatsApp, sin escribir nada.",
        "Prefere falar direto?": "¿Prefieres hablar directo?",
        "Chamar no WhatsApp ↗": "Llamar por WhatsApp ↗",
        "Para montar o orçamento por aqui, ative o JavaScript. Ou chame direto no WhatsApp.":
            "Para armar el presupuesto por aquí, activa JavaScript. O llama directo por WhatsApp.",
        "As respostas só chegam até mim pelo WhatsApp, quando você enviar. Enquanto preenche, ficam guardadas apenas neste aparelho.":
            "Las respuestas solo me llegan por WhatsApp, cuando las envíes. Mientras completas, quedan guardadas solo en este dispositivo.",
        "Você conta a ideia": "Cuentas la idea",
        "Leva 1 minuto: responde as perguntas aqui ou me chama direto no WhatsApp.":
            "Toma 1 minuto: responde las preguntas aquí o me llamas directo por WhatsApp.",
        "Eu envio a proposta": "Envío la propuesta",
        "Depois de entender o projeto, mando o valor e o prazo — ainda hoje.":
            "Después de entender el proyecto, mando el valor y el plazo — hoy mismo.",
        "Eu entrego e acompanho": "Entrego y acompaño",
        "Desenvolvo o projeto, entrego pronto e continuo por perto para tirar dúvidas.":
            "Desarrollo el proyecto, lo entrego listo y sigo cerca para resolver dudas.",
        "Perguntas frequentes": "Preguntas frecuentes",
        "Quanto custa um projeto?": "¿Cuánto cuesta un proyecto?",
        "Sites e automações começam em R$ 250, e sistemas em R$ 300 (um sistema como o Conta a Dois, com dois celulares sincronizando, fica a partir de R$ 400). Depois que eu entender a sua ideia, envio uma proposta com o valor exato.":
            "Sitios y automatizaciones empiezan en R$ 250, y sistemas en R$ 300 (un sistema como Conta a Dois, con dos celulares sincronizando, queda desde R$ 400). Después de entender tu idea, envío una propuesta con el valor exacto.",
        "Em outubro, as 3 primeiras automações em Python fechadas no mês saem com 30% de desconto.":
            "En octubre, las 3 primeras automatizaciones en Python cerradas en el mes salen con 30% de descuento.",
        "E deixando um depoimento sobre o meu serviço, você ganha 10% de desconto.":
            "Y dejando un testimonio sobre mi servicio, ganas 10% de descuento.",
        "Quanto tempo leva?": "¿Cuánto tiempo toma?",
        "Depende do projeto: uma página simples é mais rápida que um sistema completo. Junto com a proposta, já passo o prazo.":
            "Depende del proyecto: una página simple es más rápida que un sistema completo. Junto con la propuesta, ya paso el plazo.",
        "Preciso ter logo, textos e fotos antes de começar?": "¿Necesito tener logo, textos y fotos antes de empezar?",
        "Ajuda bastante, mas não é obrigatório. Se faltar alguma coisa, a gente combina como resolver.":
            "Ayuda bastante, pero no es obligatorio. Si falta algo, lo resolvemos juntos.",
        "E o endereço na internet (domínio) e a hospedagem?": "¿Y la dirección en internet (dominio) y el hosting?",
        "Explico as opções e ajudo você a escolher. Se você já tem um domínio, dá para aproveitar.":
            "Explico las opciones y te ayudo a elegir. Si ya tienes un dominio, se puede aprovechar.",
        "Tem suporte depois da entrega?": "¿Hay soporte después de la entrega?",
        "Depois da entrega continuo por perto para tirar dúvidas. Ajustes maiores a gente combina caso a caso.":
            "Después de la entrega sigo cerca para resolver dudas. Ajustes mayores se combinan caso por caso.",
        "Como funciona o pagamento?": "¿Cómo funciona el pago?",
        "A forma de pagamento é combinada na proposta, antes de começar.":
            "La forma de pago se combina en la propuesta, antes de empezar.",

        /* ---------- Jornada ---------- */
        "EVOLUÇÃO": "EVOLUCIÓN",
        "Minha jornada": "Mi trayectoria",
        "Portfólio no ar": "Portafolio en línea",
        "Publiquei o portfólio com os primeiros projetos: landing page, TaskFlow, FocusFlow, FlowBoard e Controle de gastos.":
            "Publiqué el portafolio con los primeros proyectos: landing page, TaskFlow, FocusFlow, FlowBoard y Control de gastos.",
        "Primeiros passos no back-end": "Primeros pasos en el back-end",
        "Planejador de treino em Python, com testes, e a": "Planificador de entrenamiento en Python, con pruebas, y la",
        "do controle de gastos (Flask + SQLAlchemy) no ar, com testes automáticos no GitHub Actions.":
            "del control de gastos (Flask + SQLAlchemy) en línea, con pruebas automáticas en GitHub Actions.",
        "Portfólio interativo": "Portafolio interactivo",
        "Filtro de projetos, demos embutidas, paleta de comandos, tour guiado e atividade ao vivo do GitHub.":
            "Filtro de proyectos, demos integradas, paleta de comandos, tour guiado y actividad en vivo de GitHub.",
        "App que instala no celular": "App que se instala en el celular",
        "O controle de gastos virou": "El control de gastos se convirtió en",
        ": instala como aplicativo e funciona sem internet. Em 5 de setembro ganhou edição de lançamentos.":
            ": se instala como aplicación y funciona sin internet. El 5 de septiembre ganó edición de registros.",
        "Foco em clientes": "Enfoque en clientes",
        "Orçamento em passos, botão de WhatsApp e o “Quero um assim” em cada projeto: o portfólio passou a atender quem quer contratar.":
            "Presupuesto en pasos, botón de WhatsApp y el “Quiero uno así” en cada proyecto: el portafolio pasó a atender a quien quiere contratar.",
        "Loja online e app de música": "Tienda en línea y app de música",
        "Loja cyberpunk de demonstração com carrinho que fecha o pedido no WhatsApp, e o Eldev Music, app de música instalável com fila e playlists.":
            "Tienda cyberpunk de demostración con carrito que cierra el pedido por WhatsApp, y Eldev Music, app de música instalable con cola y playlists.",
        "Dois projetos novos no mesmo dia": "Dos proyectos nuevos el mismo día",
        "Cartões, linha do tempo e a seção “Mais projetos” repaginados. O Fatia Nobre: atendimento por chat que reconhece a pergunta e responde na hora. E o Conta a Dois: controle de gastos pra casal com backend próprio, sincronizando sozinho entre os dois aparelhos.":
            "Tarjetas, línea de tiempo y la sección “Más proyectos” renovadas. Fatia Nobre: atención por chat que reconoce la pregunta y responde al instante. Y Conta a Dois: control de gastos para parejas con backend propio, sincronizando solo entre los dos dispositivos.",
        "O que vem por aí": "Lo que viene",
        "Próximo passo: aplicações cada vez mais completas, com banco de dados e login.":
            "Próximo paso: aplicaciones cada vez más completas, con base de datos y login.",
        "Agora": "Ahora",
        "em construção": "en construcción",

        /* ---------- Contato / rodapé ---------- */
        "VAMOS CONVERSAR": "HABLEMOS",
        "Tem um projeto em mente?": "¿Tienes un proyecto en mente?",
        "Costumo responder ainda no mesmo dia. Prefere conversar direto? Me chame no WhatsApp. Também estou no LinkedIn e no GitHub.":
            "Suelo responder el mismo día. ¿Prefieres hablar directo? Escríbeme por WhatsApp. También estoy en LinkedIn y GitHub.",
        "Falar direto no WhatsApp": "Hablar directo por WhatsApp",
        "LinkedIn ↗": "LinkedIn ↗",
        "GitHub ↗": "GitHub ↗",
        "Baixar currículo (PDF)": "Descargar currículum (PDF)",
        "📲 Instalar o portfólio": "📲 Instalar el portafolio",
        "📤 Mandar pro seu sócio": "📤 Enviar a tu socio",
        "🎴 Meu resumo da visita": "🎴 Mi resumen de la visita",
        "Gente de verdade passou por aqui:": "Gente de verdad pasó por aquí:",
        "Samuel Mickael. Feito com dedicação. ·": "Samuel Mickael. Hecho con dedicación. ·",
        "Tour rápido": "Tour rápido",
        "Quero meu orçamento": "Quiero mi presupuesto",
        "Voltar ao topo": "Volver arriba",

        /* ---------- Paleta de comandos ---------- */
        "Buscar seção, projeto ou ação…": "Buscar sección, proyecto o acción…",
        "Nada encontrado. Tente outro termo.": "No se encontró nada. Prueba otro término.",
        "Início": "Inicio",
        "Me surpreenda 🎲": "Sorpréndeme 🎲",
        "Iniciar tour rápido": "Iniciar tour rápido",
        "Ver GitHub": "Ver GitHub",
        "Ver LinkedIn": "Ver LinkedIn",

        /* ---------- Tour guiado ---------- */
        "Pular tour": "Saltar tour",
        "Anterior": "Anterior",
        "Próximo": "Siguiente",

        /* ---------- Currículo (curriculo.html) ---------- */
        "Salvar como PDF": "Guardar como PDF",
        "Baixar o PDF pronto": "Descargar el PDF listo",
        "DESENVOLVEDOR WEB & MOBILE": "DESARROLLADOR WEB Y MÓVIL",
        "Contato": "Contacto",
        "Tecnologias": "Tecnologías",
        "Suporte técnico": "Soporte técnico",
        "Redes": "Redes",
        "Idiomas": "Idiomas",
        "Português": "Portugués",
        "Nativo": "Nativo",
        "Inglês": "Inglés",
        "Leitura técnica": "Lectura técnica",
        "Campo Grande, MS": "Campo Grande, MS",
        "Perfil": "Perfil",
        "22 anos, estudante de Análise e Desenvolvimento de Sistemas (4º semestre), com experiência prévia como Técnico de computador no Exército Brasileiro. Desenvolvo projetos front-end e back-end e busco oportunidades para aplicar conhecimento, aprender e entregar soluções úteis.":
            "22 años, estudiante de Análisis y Desarrollo de Sistemas (4º semestre), con experiencia previa como Técnico de computadoras en el Ejército Brasileño. Desarrollo proyectos front-end y back-end y busco oportunidades para aplicar conocimiento, aprender y entregar soluciones útiles.",
        "Experiência": "Experiencia",
        "Técnico de computador": "Técnico de computadoras",
        "— Exército Brasileiro": "— Ejército Brasileño",
        "Suporte técnico a usuários, atendendo solicitações e resolvendo problemas de hardware e software":
            "Soporte técnico a usuarios, atendiendo solicitudes y resolviendo problemas de hardware y software",
        "Manutenção de equipamentos de informática": "Mantenimiento de equipos de informática",
        "Configuração e manutenção de rede local básica (cabeamento e roteadores)":
            "Configuración y mantenimiento de red local básica (cableado y routers)",
        "Formação": "Formación",
        "Análise e Desenvolvimento de Sistemas": "Análisis y Desarrollo de Sistemas",
        "Em andamento · 4º semestre": "En curso · 4º semestre",
        "Projetos": "Proyectos",
        "Controle de Gastos — API": "Control de Gastos — API",
        "Flask · SQLAlchemy · Testes automatizados": "Flask · SQLAlchemy · Pruebas automatizadas",
        "Backend do controle de gastos, com API REST, validação de entrada e deploy em produção.":
            "Backend del control de gastos, con API REST, validación de entrada y despliegue en producción.",
        "Planejador de Treino": "Planificador de Entrenamiento",
        "Aplicação de terminal para organizar a rotina semanal de treinos, com dados em JSON e testes automatizados. Código no GitHub.":
            "Aplicación de terminal para organizar la rutina semanal de entrenamientos, con datos en JSON y pruebas automatizadas. Código en GitHub.",
        "Controle de Gastos": "Control de Gastos",
        "Aplicação para registrar transações, filtrar dados e acompanhar despesas por categoria.":
            "Aplicación para registrar transacciones, filtrar datos y seguir gastos por categoría.",
        "Quadro Kanban com criação de tarefas, prioridade, drag and drop e persistência local.":
            "Tablero Kanban con creación de tareas, prioridad, arrastrar y soltar, y persistencia local.",
        "TaskFlow e FocusFlow": "TaskFlow y FocusFlow",
        "Ferramentas de produtividade para organização de tarefas e sessões de foco.":
            "Herramientas de productividad para organizar tareas y sesiones de enfoque.",
        "Currículo também disponível em": "Currículum también disponible en",
        "Ver portfólio completo": "Ver portafolio completo",

        /* ---------- FocusFlow (focusflow/index.html) ---------- */
        "Alternar tema": "Cambiar tema",
        "TEMPO COM INTENÇÃO": "TIEMPO CON INTENCIÓN",
        "Foque no que": "Enfócate en lo que",
        "importa.": "importa.",
        "Use o método Pomodoro para trabalhar com mais presença e descansar na medida certa.":
            "Usa el método Pomodoro para trabajar con más presencia y descansar en la medida justa.",
        "Foco": "Enfoque",
        "Pausa curta": "Pausa corta",
        "Pausa longa": "Pausa larga",
        "Sessão de foco": "Sesión de enfoque",
        "Começar foco": "Empezar enfoque",
        "Reiniciar timer": "Reiniciar temporizador",
        "SESSÃO ATUAL": "SESIÓN ACTUAL",
        "Seu objetivo": "Tu objetivo",
        "No que você vai focar?": "¿En qué te vas a enfocar?",
        "Ex.: Estudar JavaScript": "Ej.: Estudiar JavaScript",
        "Deixe o celular longe e escolha apenas uma tarefa para esta sessão.":
            "Deja el celular lejos y elige solo una tarea para esta sesión.",
        "ciclos hoje": "ciclos hoy",
        "minutos focados": "minutos enfocados",
        "Escolha uma tarefa": "Elige una tarea",
        "Defina uma única prioridade para não dispersar sua atenção.": "Define una sola prioridad para no dispersar tu atención.",
        "Foque por 25 minutos": "Enfócate por 25 minutos",
        "Trabalhe sem interrupções até o timer terminar.": "Trabaja sin interrupciones hasta que el temporizador termine.",
        "Faça uma pausa": "Haz una pausa",
        "Recupere a energia antes de iniciar o próximo ciclo.": "Recupera la energía antes de empezar el próximo ciclo.",
        "FocusFlow · Um projeto de Samuel Mickael.": "FocusFlow · Un proyecto de Samuel Mickael.",
        "Pausar timer": "Pausar temporizador",
        "Começar pausa": "Empezar pausa",
        "Sessão concluída! Hora de uma pausa.": "¡Sesión completada! Hora de una pausa.",
        "Pausa concluída! Pronto para focar?": "¡Pausa completada! ¿Listo para enfocarte?",

        /* ---------- TaskFlow (taskflow/index.html) ---------- */
        "ORGANIZAÇÃO SEM COMPLICAÇÃO": "ORGANIZACIÓN SIN COMPLICACIONES",
        "Seu dia, no": "Tu día, bajo",
        "controle.": "control.",
        "Transforme tarefas em progresso, uma por vez.": "Transforma tareas en progreso, una a la vez.",
        "concluído hoje": "completado hoy",
        "Total de tarefas": "Total de tareas",
        "Para fazer": "Por hacer",
        "Concluídas": "Completadas",
        "NOVA TAREFA": "NUEVA TAREA",
        "O que importa agora?": "¿Qué importa ahora?",
        "Tarefa": "Tarea",
        "Ex.: Finalizar o portfólio": "Ej.: Terminar el portafolio",
        "Categoria": "Categoría",
        "Trabalho": "Trabajo",
        "Estudos": "Estudios",
        "Pessoal": "Personal",
        "Saúde": "Salud",
        "Prioridade": "Prioridad",
        "Alta": "Alta",
        "Média": "Media",
        "Baixa": "Baja",
        "Prazo": "Plazo",
        "Adicionar tarefa": "Agregar tarea",
        "MINHAS TAREFAS": "MIS TAREAS",
        "Planejamento diário": "Planificación diaria",
        "Filtrar tarefas": "Filtrar tareas",
        "Todas": "Todas",
        "Pendentes": "Pendientes",
        "Sua lista está vazia. Adicione uma tarefa para começar.": "Tu lista está vacía. Agrega una tarea para empezar.",
        "TaskFlow · Seus dados ficam salvos neste navegador.": "TaskFlow · Tus datos quedan guardados en este navegador.",
        "Concluir tarefa": "Completar tarea",
        "Apagar tarefa": "Borrar tarea",
        "Tarefa adicionada!": "¡Tarea agregada!",

        /* ---------- FlowBoard (flowboard/index.html) ---------- */
        "ORGANIZE SEU FLUXO": "ORGANIZA TU FLUJO",
        "Do plano à entrega.": "Del plan a la entrega.",
        "+ Nova tarefa": "+ Nueva tarea",
        "Backlog": "Pendiente",
        "Em andamento": "En progreso",
        "Concluído": "Completado",
        "Nova tarefa": "Nueva tarea",
        "Título": "Título",
        "Ex.: Criar página inicial": "Ej.: Crear página de inicio",
        "Cancelar": "Cancelar",
        "Criar tarefa": "Crear tarea",
        "Excluir": "Eliminar",
        "tarefa": "tarea",
        "tarefas": "tareas",

        /* ---------- Nexus Studio (primeiro-projeto/index.html) ---------- */
        "CRIATIVIDADE + TECNOLOGIA": "CREATIVIDAD + TECNOLOGÍA",
        "Ideias que viram presença digital.": "Ideas que se vuelven presencia digital.",
        "Uma landing page moderna criada para apresentar marcas e serviços de forma clara, rápida e memorável.":
            "Una landing page moderna creada para presentar marcas y servicios de forma clara, rápida y memorable.",
        "Conhecer o projeto": "Conocer el proyecto",
        "Estratégia": "Estrategia",
        "Uma mensagem direta para o público certo.": "Un mensaje directo para el público correcto.",
        "Design": "Diseño",
        "Visual forte com foco em hierarquia e contraste.": "Visual fuerte con foco en jerarquía y contraste.",
        "Experiência": "Experiencia",
        "Layout responsivo pensado para todos os dispositivos.": "Diseño responsivo pensado para todos los dispositivos.",
        "Nexus Studio · Projeto de demonstração por Samuel Mickael.": "Nexus Studio · Proyecto de demostración por Samuel Mickael.",

        /* ---------- Eldev Music (eldev-music/) — só a casca estática; as telas do player são
           montadas inteiramente via JS (telas.js) e ficam de fora por enquanto. ---------- */
        "DEMO": "DEMO",
        "App de demonstração do portfólio de Samuel Mickael.": "App de demostración del portafolio de Samuel Mickael.",
        "← Voltar ao portfólio": "← Volver al portafolio",
        "Início": "Inicio",
        "Buscar": "Buscar",
        "Coleção": "Colección",
        "Configurações": "Configuración",

        /* ---------- Fatia Nobre (fatia-nobre/) ---------- */
        "Pular para o campo de mensagem": "Saltar al campo de mensaje",
        "Atendimento automático fictício da pizzaria Fatia Nobre. As respostas são geradas aqui mesmo, na hora — nada é enviado a lugar nenhum.":
            "Atención automática ficticia de la pizzería Fatia Nobre. Las respuestas se generan aquí mismo, al instante — nada se envía a ningún lado.",
        "Quero um desses ↗": "Quiero uno de esos ↗",
        "digitando…": "escribiendo…",
        "Reiniciar": "Reiniciar",
        "Digite uma pergunta": "Escribe una pregunta",
        "Digite uma pergunta…": "Escribe una pregunta…",
        "Enviar mensagem": "Enviar mensaje",
        "> ATENDIMENTO AUTOMÁTICO": "> ATENCIÓN AUTOMÁTICA",
        "Responde sozinho, na hora, mesmo de madrugada.": "Responde solo, al instante, hasta de madrugada.",
        "Pergunte aí em cima o horário, o endereço, o cardápio ou como fazer um pedido. Quem reconhece a pergunta e responde é um programa, não uma pessoa digitando.":
            "Pregunta ahí arriba el horario, la dirección, el menú o cómo hacer un pedido. Quien reconoce la pregunta y responde es un programa, no una persona escribiendo.",
        "Como funciona por trás": "Cómo funciona por detrás",
        "Quando alguém manda uma mensagem, o programa lê o texto e procura palavras-chave — \"horário\", \"endereço\", \"entrega\"...":
            "Cuando alguien manda un mensaje, el programa lee el texto y busca palabras clave — \"horario\", \"dirección\", \"entrega\"...",
        "Reconhecendo o assunto, ele responde na hora. Não precisa de ninguém acordado de madrugada.":
            "Al reconocer el tema, responde al instante. No hace falta nadie despierto de madrugada.",
        "Se não entende a pergunta, ele mostra os assuntos principais em botões, pra ninguém ficar sem resposta.":
            "Si no entiende la pregunta, muestra los temas principales en botones, para que nadie se quede sin respuesta.",
        "As perguntas e respostas ficam numa lista simples — dá pra adaptar pro seu negócio em poucos minutos.":
            "Las preguntas y respuestas quedan en una lista simple — se puede adaptar a tu negocio en pocos minutos.",
        "Isso aqui é só uma demonstração, mas o mesmo esquema funciona pro seu negócio de verdade, direto no seu WhatsApp.":
            "Esto es solo una demostración, pero el mismo esquema funciona para tu negocio de verdad, directo en tu WhatsApp.",
        "Quero um desses pro meu negócio": "Quiero uno de esos para mi negocio",
        "Fatia Nobre não existe de verdade — é uma demonstração de atendimento automático. Feito por":
            "Fatia Nobre no existe de verdad — es una demostración de atención automática. Hecho por",
        ", projeto de portfólio.": ", proyecto de portafolio.",

        /* ---------- Conta a Dois (conta-a-dois/) ---------- */
        "Pular para o conteúdo": "Saltar al contenido",
        "Dados de demonstração — o banco pode limpar casais antigos de vez em quando. Não use pra suas finanças de verdade.":
            "Datos de demostración — la base puede borrar parejas antiguas de vez en cuando. No lo uses para tus finanzas reales.",
        "Criar um casal": "Crear una pareja",
        "Entrar com código": "Entrar con código",
        "Seu nome": "Tu nombre",
        "Ex.: Ana": "Ej.: Ana",
        "Criar casal e gerar código": "Crear pareja y generar código",
        "Você recebe um código de 6 letras pra compartilhar com seu par.":
            "Recibes un código de 6 letras para compartir con tu pareja.",
        "Código do casal": "Código de la pareja",
        "Ex.: 7K2QXP": "Ej.: 7K2QXP",
        "Ex.: Bruno": "Ej.: Bruno",
        "Entrar": "Entrar",
        "Peça o código pra quem já criou o casal.": "Pide el código a quien ya creó la pareja.",
        "> TEMPO REAL ENTRE DOIS DISPOSITIVOS": "> TIEMPO REAL ENTRE DOS DISPOSITIVOS",
        "Cada um lança no próprio celular. Os dois veem na hora.": "Cada uno anota en su propio celular. Los dos lo ven al instante.",
        "Crie um casal aqui do lado, abra o código num outro dispositivo (ou numa aba nova, com o botão que aparece depois) e lance um gasto — ele aparece pro outro lado sozinho, sem apertar F5.":
            "Crea una pareja aquí al lado, abre el código en otro dispositivo (o en una pestaña nueva, con el botón que aparece después) y anota un gasto — aparece del otro lado solo, sin apretar F5.",
        "Cada pessoa fica ligada a um \"integrante\" só dela — os gastos ficam marcados de quem pagou.":
            "Cada persona queda ligada a un \"integrante\" solo suyo — los gastos quedan marcados de quién pagó.",
        "O navegador confere o servidor a cada poucos segundos e atualiza a lista sozinho, sem precisar recarregar a página.":
            "El navegador consulta el servidor cada pocos segundos y actualiza la lista solo, sin recargar la página.",
        "Um saldo automático soma tudo e calcula quem deve quanto pra quem, dividindo os gastos meio a meio.":
            "Un saldo automático suma todo y calcula quién le debe cuánto a quién, dividiendo los gastos a la mitad.",
        "Sem senha: o código de 6 letras é o que liga as duas pessoas ao mesmo casal.":
            "Sin contraseña: el código de 6 letras es lo que une a las dos personas a la misma pareja.",
        "Essa é uma demonstração pública, mas o mesmo esquema (backend real + sincronização) dá pra construir pro seu negócio ou uso pessoal.":
            "Esta es una demostración pública, pero el mismo esquema (backend real + sincronización) se puede construir para tu negocio o uso personal.",
        "Quero conversar sobre um projeto": "Quiero hablar sobre un proyecto",
        "Código:": "Código:",
        "Copiar": "Copiar",
        "Abrir como o par (nova aba)": "Abrir como el otro (pestaña nueva)",
        "Sair": "Salir",
        "Carregando…": "Cargando…",
        "Lançar gasto": "Anotar gasto",
        "Descrição": "Descripción",
        "Ex.: Mercado do mês": "Ej.: Mercado del mes",
        "Valor (R$)": "Valor (R$)",
        "Casa": "Casa",
        "Mercado": "Mercado",
        "Lazer": "Ocio",
        "Transporte": "Transporte",
        "Saúde": "Salud",
        "Outros": "Otros",
        "Data": "Fecha",
        "Adicionar gasto": "Agregar gasto",
        "Gastos": "Gastos",
        "Nenhum gasto lançado ainda. Adicione o primeiro aí em cima.": "Ningún gasto anotado aún. Agrega el primero ahí arriba.",
        "Conta a Dois é um projeto de demonstração — os dados são de teste. Feito por":
            "Conta a Dois es un proyecto de demostración — los datos son de prueba. Hecho por",
        "Assim que seu par entrar, o saldo entre vocês aparece aqui.": "En cuanto tu pareja entre, el saldo entre ustedes aparece aquí.",
        "Vocês estão quites 🎉": "Están a mano 🎉",
        "Nenhum gasto ainda": "Ningún gasto todavía",
        "Os dois pagaram a mesma parte até agora.": "Los dos pagaron la misma parte hasta ahora.",
        "Lance o primeiro gasto aí embaixo.": "Anota el primer gasto ahí abajo.",
        "deve pra": "le debe a",
        "Total gasto pelo casal:": "Total gastado por la pareja:",
        "Remover gasto": "Eliminar gasto",
        "Sincronizado às": "Sincronizado a las",
        "Não deu pra sincronizar agora, tentando de novo…": "No se pudo sincronizar ahora, intentando de nuevo…",
        "Essa sessão de demonstração expirou — dados de teste são limpos periodicamente. Comece de novo.":
            "Esta sesión de demostración expiró — los datos de prueba se limpian periódicamente. Empieza de nuevo.",
        "Criando… (pode levar uns segundos)": "Creando… (puede tardar unos segundos)",
        "Entrando… (pode levar uns segundos)": "Entrando… (puede tardar unos segundos)",
        "Copiado!": "¡Copiado!",
        "Adicionando…": "Agregando…",
        "você": "tú",

        /* ---------- Grana em Dia (controle-gastos/) ---------- */
        "Ativar tema escuro": "Activar tema oscuro",
        "ORGANIZAÇÃO FINANCEIRA": "ORGANIZACIÓN FINANCIERA",
        "Seu dinheiro,": "Tu dinero,",
        "mais claro.": "más claro.",
        "Acompanhe seus ganhos e gastos em um só lugar.": "Sigue tus ingresos y gastos en un solo lugar.",
        "Ver exemplo": "Ver ejemplo",
        "Limpar dados": "Borrar datos",
        "Saldo atual": "Saldo actual",
        "Comece adicionando uma transação.": "Empieza agregando una transacción.",
        "Receitas": "Ingresos",
        "Entradas registradas": "Entradas registradas",
        "Despesas": "Gastos",
        "Saídas registradas": "Salidas registradas",
        "NOVA TRANSAÇÃO": "NUEVA TRANSACCIÓN",
        "Adicione um lançamento": "Agrega un registro",
        "Ex.: Freelance de site": "Ej.: Freelance de sitio web",
        "Valor": "Valor",
        "Alimentação": "Alimentación",
        "Moradia": "Vivienda",
        "Educação": "Educación",
        "Tipo": "Tipo",
        "Receita": "Ingreso",
        "Despesa": "Gasto",
        "Adicionar transação": "Agregar transacción",
        "Cancelar edição": "Cancelar edición",
        "HISTÓRICO": "HISTORIAL",
        "Suas transações": "Tus transacciones",
        "Filtrar transações": "Filtrar transacciones",
        "Nenhuma transação por aqui. Adicione a primeira ao lado.": "Ninguna transacción por aquí. Agrega la primera al lado.",
        "ANÁLISE": "ANÁLISIS",
        "Despesas por categoria": "Gastos por categoría",
        "Veja para onde seu dinheiro está indo.": "Mira a dónde está yendo tu dinero.",
        "Adicione despesas para ver o resumo por categoria.": "Agrega gastos para ver el resumen por categoría.",
        "Feito por Samuel Mickael · Dados salvos numa API real (Flask + SQLAlchemy). No plano gratuito, a 1ª ação pode levar até 50s se a API estava \"dormindo\".":
            "Hecho por Samuel Mickael · Datos guardados en una API real (Flask + SQLAlchemy). En el plan gratuito, la 1ª acción puede tardar hasta 50s si la API estaba \"dormida\".",
        "Erro": "Error",
        "ao falar com a API.": "al hablar con la API.",
        "Você está no positivo.": "Estás en positivo.",
        "Atenção: saldo negativo.": "Atención: saldo negativo.",
        "das despesas": "de los gastos",
        "Carregando transações da API… (pode levar até 50s se ela estava dormindo)":
            "Cargando transacciones de la API… (puede tardar hasta 50s si estaba dormida)",
        "Não foi possível conectar com a API agora. Tente recarregar a página em instantes.":
            "No se pudo conectar con la API ahora. Intenta recargar la página en unos instantes.",
        "Editar": "Editar",
        "Excluir": "Eliminar",
        "Sem data": "Sin fecha",
        "EDITAR TRANSAÇÃO": "EDITAR TRANSACCIÓN",
        "Atualize o lançamento": "Actualiza el registro",
        "Salvar alterações": "Guardar cambios",
        "Salvando…": "Guardando…",
        "Transação atualizada com sucesso.": "Transacción actualizada con éxito.",
        "Transação adicionada com sucesso.": "Transacción agregada con éxito.",
        "Transação removida.": "Transacción eliminada.",
        "Deseja apagar todas as transações?": "¿Deseas borrar todas las transacciones?",
        "Dados removidos.": "Datos eliminados.",
        "Isso vai substituir suas transações pelos dados de exemplo. Continuar?":
            "Esto va a reemplazar tus transacciones por los datos de ejemplo. ¿Continuar?",
        "Salário": "Salario",
        "Freelance": "Freelance",
        "Supermercado": "Supermercado",
        "Aluguel": "Alquiler",
        "Internet": "Internet",
        "Dados de exemplo carregados.": "Datos de ejemplo cargados.",
        "Ativar tema claro": "Activar tema claro",

        /* ---------- Demonstração da API de gastos (gastos-api-demo/) ---------- */
        "← voltar ao portfólio": "← volver al portafolio",
        "DEMONSTRAÇÃO AO VIVO": "DEMOSTRACIÓN EN VIVO",
        "Controle de Gastos — API": "Control de Gastos — API",
        "Esta página consome direto a": "Esta página consume directo la",
        "API Flask hospedada no Render": "API Flask alojada en Render",
        ". Tudo que você adicionar ou remover aqui é salvo de verdade no banco de dados. Prefere explorar os endpoints direto? Veja a":
            ". Todo lo que agregues o quites aquí se guarda de verdad en la base de datos. ¿Prefieres explorar los endpoints directo? Mira la",
        "documentação interativa (Swagger)": "documentación interactiva (Swagger)",
        "Plano gratuito: se a API estiver \"dormindo\", a primeira ação pode levar até 50 segundos. Só na primeira vez.":
            "Plan gratuito: si la API está \"dormida\", la primera acción puede tardar hasta 50 segundos. Solo la primera vez.",
        "Novo gasto": "Nuevo gasto",
        "Ex: Mercado": "Ej: Mercado",
        "Ex: alimentação": "Ej: alimentación",
        "Resumo": "Resumen",
        "total gasto": "total gastado",
        "lançamentos": "registros",
        "Lançamentos": "Registros",
        "Carregando...": "Cargando...",
        "Carregando... (pode levar um tempo se a API estava dormindo)": "Cargando... (puede tardar si la API estaba dormida)",
        "a API grátis pode levar até 50 s para acordar": "la API gratuita puede tardar hasta 50 s en despertar",
        "Nenhum gasto cadastrado ainda. Adicione o primeiro ao lado.": "Ningún gasto registrado aún. Agrega el primero al lado.",
        "Não foi possível carregar os dados agora. Tente novamente em instantes.":
            "No se pudieron cargar los datos ahora. Intenta de nuevo en unos instantes.",
        "Remover": "Eliminar",
        "Salvando...": "Guardando...",
        "Erro ao salvar.": "Error al guardar.",

        /* ---------- Glitch District (loja-cyberpunk/) — casca + carrinho ---------- */
        "Pular para os produtos": "Saltar a los productos",
        "Frete grátis em Campo Grande acima de R$ 299": "Envío gratis en Campo Grande sobre R$ 299",
        "5% de desconto no Pix": "5% de descuento con Pix",
        "Enviamos pra todo o Brasil": "Enviamos a todo Brasil",
        "Coleção": "Colección",
        "A marca": "La marca",
        "Dúvidas": "Preguntas",
        "Abrir carrinho, vazio": "Abrir carrito, vacío",
        "Carrinho": "Carrito",
        "VISTA O FUTURO": "VISTE EL FUTURO",
        "Jaquetas, cargos e acessórios pra quem vive depois da meia-noite. Monte o carrinho aqui e feche o pedido direto no WhatsApp.":
            "Chaquetas, cargos y accesorios para quien vive después de medianoche. Arma el carrito aquí y cierra el pedido directo por WhatsApp.",
        "Ver coleção": "Ver colección",
        "Como comprar": "Cómo comprar",
        "Envio em até 2 dias úteis": "Envío en hasta 2 días hábiles",
        "Pra todo o Brasil, com rastreio": "A todo Brasil, con seguimiento",
        "Troca grátis em 30 dias": "Cambio gratis en 30 días",
        "Não serviu? A gente troca": "¿No te quedó bien? Lo cambiamos",
        "5% off no Pix": "5% off con Pix",
        "Ou em até 3x sem juros no cartão": "O hasta en 3x sin intereses con tarjeta",
        "Atendimento de gente": "Atención de verdad",
        "Seg a sáb, das 9h às 19h": "Lun a sáb, de 9h a 19h",
        "Escolha": "Elige",
        "Abra a peça, marque o tamanho e adicione ao carrinho.": "Abre la prenda, marca la talla y agrégala al carrito.",
        "Revise": "Revisa",
        "Confira quantidades e o total estimado. Nada de cadastro nem senha.":
            "Revisa cantidades y el total estimado. Nada de registro ni contraseña.",
        "Envie no WhatsApp": "Envía por WhatsApp",
        "O pedido chega pronto pra gente. Confirmamos o estoque, o frete e o pagamento (Pix ou cartão) na conversa.":
            "El pedido nos llega listo. Confirmamos el stock, el envío y el pago (Pix o tarjeta) en la conversación.",
        "Looks prontos": "Looks listos",
        "Combinações que já saem casando. Um clique bota as três peças no carrinho.":
            "Combinaciones que ya quedan perfectas. Un clic pone las tres piezas en el carrito.",
        "Casacos": "Abrigos",
        "Camadas": "Capas",
        "Calças": "Pantalones",
        "Calçados": "Calzado",
        "Acessórios": "Accesorios",
        "Buscar peça…": "Buscar prenda…",
        "Buscar produto": "Buscar producto",
        "Ordenar por": "Ordenar por",
        "Destaques": "Destacados",
        "Menor preço": "Menor precio",
        "Maior preço": "Mayor precio",
        "Nome (A–Z)": "Nombre (A–Z)",
        "Nada encontrado neste setor.": "Nada encontrado en esta sección.",
        "Tente outra palavra ou volte pra todas as categorias.": "Prueba otra palabra o vuelve a todas las categorías.",
        "Limpar filtros": "Limpiar filtros",
        "Ative o JavaScript para ver a loja.": "Activa JavaScript para ver la tienda.",
        "Nasceu num quarto em Campo Grande": "Nació en un cuarto en Campo Grande",
        "A marca começou em 2024, quando a Nina Azevedo cansou de pagar importação caríssima pra usar techwear. Ela começou costurando as próprias jaquetas e, quando os amigos pediram, virou marca.":
            "La marca empezó en 2024, cuando Nina Azevedo se cansó de pagar importaciones carísimas para usar techwear. Empezó cosiendo sus propias chaquetas y, cuando los amigos se las pidieron, se volvió marca.",
        "Hoje a gente desenha e produz em pequenos lotes aqui em Campo Grande, com tecido que aguenta vento e chuva fina e bolso de sobra. Cada drop tem poucas peças: quando acaba, acabou.":
            "Hoy diseñamos y producimos en lotes pequeños aquí en Campo Grande, con tela que aguanta viento y lluvia fina, y bolsillos de sobra. Cada drop tiene pocas piezas: cuando se acaba, se acabó.",
        "— Nina, fundadora": "— Nina, fundadora",
        "Guia de medidas": "Guía de medidas",
        "Medidas da peça em centímetros. Na dúvida entre dois, pega o maior: o caimento é mais solto.":
            "Medidas de la prenda en centímetros. En la duda entre dos, elige la mayor: cae más suelta.",
        "Tamanho": "Talla",
        "Peito": "Pecho",
        "Cintura": "Cintura",
        "Comprimento": "Largo",
        "Dúvidas frequentes": "Preguntas frecuentes",
        "Qual o prazo de entrega?": "¿Cuál es el plazo de entrega?",
        "Postamos em até 2 dias úteis depois do pagamento. Em Campo Grande chega em 1 a 2 dias; no resto do país, de 4 a 10 dias úteis, conforme o frete escolhido.":
            "Despachamos en hasta 2 días hábiles después del pago. En Campo Grande llega en 1 a 2 días; en el resto del país, de 4 a 10 días hábiles, según el envío elegido.",
        "Como funciona a troca?": "¿Cómo funciona el cambio?",
        "Você tem 30 dias a partir do recebimento pra trocar por outro tamanho ou peça, com a etiqueta e sem uso. O frete da primeira troca é por nossa conta.":
            "Tienes 30 días desde la recepción para cambiar por otra talla o prenda, con etiqueta y sin uso. El envío del primer cambio corre por nuestra cuenta.",
        "Quais as formas de pagamento?": "¿Cuáles son las formas de pago?",
        "Pix, com 5% de desconto, ou cartão de crédito em até 3x sem juros, por link de pagamento. Tudo é combinado pelo WhatsApp depois que você manda o pedido.":
            "Pix, con 5% de descuento, o tarjeta de crédito hasta en 3x sin intereses, por link de pago. Todo se acuerda por WhatsApp después de que mandas el pedido.",
        "Posso retirar pessoalmente?": "¿Puedo retirar en persona?",
        "Pode! Em Campo Grande dá pra combinar a retirada no ateliê, sem frete. É só escrever na observação do pedido.":
            "¡Puedes! En Campo Grande se puede coordinar el retiro en el taller, sin envío. Solo escríbelo en la observación del pedido.",
        "Como lavo as peças?": "¿Cómo lavo las prendas?",
        "Lavagem à mão ou na máquina, no ciclo delicado com água fria, do avesso. Não use alvejante nem secadora, pra fita refletiva e o zíper durarem mais.":
            "Lavado a mano o en máquina, en ciclo delicado con agua fría, al revés. No uses blanqueador ni secadora, para que la cinta reflectante y el cierre duren más.",
        "Techwear desenhado e produzido em pequenos lotes em Campo Grande - MS.":
            "Techwear diseñado y producido en lotes pequeños en Campo Grande - MS.",
        "Loja": "Tienda",
        "Atendimento": "Atención",
        "Seg a sáb, das 9h às 19h<br>Pelo WhatsApp, depois de montar o pedido":
            "Lun a sáb, de 9h a 19h<br>Por WhatsApp, después de armar el pedido",
        "Trocas e prazos": "Cambios y plazos",
        "Pagamento": "Pago",
        "Cartão 3x": "Tarjeta 3x",
        "Loja de demonstração criada por": "Tienda de demostración creada por",
        ". A marca, a Nina, os preços e o estoque são fictícios; as fotos são do Pexels, de uso livre.":
            ". La marca, Nina, los precios y el stock son ficticios; las fotos son de Pexels, de uso libre.",
        "Quero uma loja assim →": "Quiero una tienda así →",
        "Seu carrinho": "Tu carrito",
        "Fechar carrinho": "Cerrar carrito",
        "Carrinho vazio": "Carrito vacío",
        "Escolha uma peça e o tamanho, e ela aparece aqui.": "Elige una prenda y la talla, y aparece aquí.",
        "Continuar comprando": "Seguir comprando",
        "Total estimado": "Total estimado",
        "(opcional)": "(opcional)",
        "Como devo te chamar?": "¿Cómo debo llamarte?",
        "Observação": "Observación",
        "Ex.: prefiro retirar pessoalmente": "Ej.: prefiero retirar en persona",
        "Ver a mensagem que será enviada": "Ver el mensaje que se enviará",
        "Enviar pedido pelo WhatsApp": "Enviar pedido por WhatsApp",
        "Copiar pedido": "Copiar pedido",
        "Esvaziar carrinho": "Vaciar carrito",
        "No WhatsApp a gente confirma o estoque, calcula o frete e manda o Pix ou o link do cartão. Este site não pede nem guarda dado de pagamento.":
            "Por WhatsApp confirmamos el stock, calculamos el envío y mandamos el Pix o el link de la tarjeta. Este sitio no pide ni guarda datos de pago.",
        "Tamanho único": "Talla única",
        "Escolha um tamanho.": "Elige una talla.",
        "Novo": "Nuevo",
        "Adicionar": "Agregar",
        "produtos": "productos",
        "1 produto": "1 producto",
        "Ver detalhes de": "Ver detalles de",
        "peça nova": "pieza nueva",
        "Adicionar look completo": "Agregar look completo",
        "Look adicionado:": "Look agregado:",
        "peças": "piezas",
        "uma já estava no máximo por peça": "una ya estaba al máximo por pieza",
        "Ver carrinho": "Ver carrito",
        "Adicionar ao carrinho": "Agregar al carrito",
        "Diminuir a quantidade:": "Disminuir la cantidad:",
        "Aumentar a quantidade:": "Aumentar la cantidad:",
        "Quantidade": "Cantidad",
        "Remover do carrinho:": "Eliminar del carrito:",
        "Abrir carrinho,": "Abrir carrito,",
        "item": "artículo",
        "itens": "artículos",
        "Máximo de": "Máximo de",
        "por peça. Para mais, combine no WhatsApp.": "por pieza. Para más, coordina por WhatsApp.",
        "Adicionado:": "Agregado:",
        "Olá! Quero fazer este pedido na": "¡Hola! Quiero hacer este pedido en",
        "Total estimado:": "Total estimado:",
        "Nome:": "Nombre:",
        "Obs.:": "Obs.:",
        "Podemos combinar o valor final, o frete e o pagamento por aqui?": "¿Podemos acordar el valor final, el envío y el pago por aquí?",
        "_(Pedido de teste da loja de demonstração do portfólio)_": "_(Pedido de prueba de la tienda de demostración del portafolio)_",
        "Pedido copiado. Cole na conversa que quiser.": "Pedido copiado. Pégalo en la conversación que quieras.",
        "Não consegui copiar. Abra a mensagem acima e copie manualmente.": "No pude copiar. Abre el mensaje de arriba y cópialo manualmente.",
        "Abrindo o WhatsApp com o pedido pronto…": "Abriendo WhatsApp con el pedido listo…",

        /* nomes e resumos dos produtos */
        "Parka VX-7": "Parka VX-7",
        "Jaqueta Puffer Nexus": "Chaqueta Puffer Nexus",
        "Moletom Ghost": "Sudadera Ghost",
        "Colete Puffer Rig-3": "Chaleco Puffer Rig-3",
        "Trench Blackout": "Trench Blackout",
        "Camiseta Void": "Camiseta Void",
        "Camiseta Oversized Grid": "Camiseta Oversized Grid",
        "Blusa Gola Alta Nyx": "Blusa Cuello Alto Nyx",
        "Manga Longa Circuit": "Manga Larga Circuit",
        "Calça Cargo Onyx": "Pantalón Cargo Onyx",
        "Calça Cargo Stone": "Pantalón Cargo Stone",
        "Calça Wide Reflect": "Pantalón Wide Reflect",
        "Bota Nightwalker": "Bota Nightwalker",
        "Tênis Cano Alto Volt": "Tenis Caña Alta Volt",
        "Bota Verniz Static": "Bota Charol Static",
        "Máscara Filter-X": "Mascarilla Filter-X",
        "Óculos Pulse": "Gafas Pulse",
        "Boné Cross": "Gorra Cross",
        "Mochila Null": "Mochila Null",
        "Acolchoada · capuz · bolsos fundos": "Acolchada · capucha · bolsillos profundos",
        "Puffer curta · gola alta": "Puffer corta · cuello alto",
        "Capuz · cordão contrastante": "Capucha · cordón contrastante",
        "Sem manga · acolchoado": "Sin mangas · acolchado",
        "Comprido · abotoado · elegante": "Largo · abotonado · elegante",
        "Básica · algodão pesado": "Básica · algodón grueso",
        "Oversized · estampa tom sobre tom": "Oversized · estampado tono sobre tono",
        "Justa · gola alta · manga longa": "Ajustada · cuello alto · manga larga",
        "Manga longa · justa": "Manga larga · ajustada",
        "Cargo larga · 6 bolsos": "Cargo ancho · 6 bolsillos",
        "Cargo · lavagem stone": "Cargo · lavado stone",
        "Larga · cintura alta": "Ancho · cintura alta",
        "Coturno · sola tratorada": "Bota militar · suela tractora",
        "Lona · cano alto": "Lona · caña alta",
        "Verniz · sola tratorada": "Charol · suela tractora",
        "Tecido duplo · lavável": "Tela doble · lavable",
        "Aviador · lente escura": "Aviador · lente oscura",
        "Aba curva · ajuste atrás": "Visera curva · ajuste trasero",
        "Couro sintético · 15 L": "Cuero sintético · 15 L",

        /* looks prontos */
        "Look Nightwalker": "Look Nightwalker",
        "Bota, calça e colete pra sair sem pensar duas vezes.": "Bota, pantalón y chaleco para salir sin pensarlo dos veces.",
        "Look Ghost Run": "Look Ghost Run",
        "Moletom, óculos e mochila pra andar leve.": "Sudadera, gafas y mochila para andar ligero.",
        "Look Blackout": "Look Blackout",
        "O trench novo com o tênis de cano alto e a máscara.": "El trench nuevo con el tenis de caña alta y la mascarilla.",

        /* ---------- Case Eclipse Studio (case-eclipse.html) ---------- */
        "← voltar pro portfólio": "← volver al portafolio",
        "CASE · MODA ALTERNATIVA · CAMPO GRANDE - MS": "CASO · MODA ALTERNATIVA · CAMPO GRANDE - MS",
        "A loja da": "La tienda de",
        ", do direct pro pedido pronto": ", del mensaje directo al pedido listo",
        "A Eclipse Studio vende moda alt pelo Instagram e pelo WhatsApp. A missão: um lugar só com a coleção inteira, a cara da marca, e onde a cliente monta a sacola e já manda o pedido pronto, sem aquele vai e volta de “tem no M?” e “quanto é?”.":
            "Eclipse Studio vende moda alt por Instagram y WhatsApp. La misión: un solo lugar con la colección entera, la cara de la marca, y donde la clienta arma la bolsa y ya manda el pedido listo, sin ese ir y venir de “¿tienen talla M?” y “¿cuánto cuesta?”.",
        "Ver a loja no ar ↗": "Ver la tienda en línea ↗",
        "Quero um assim": "Quiero uno así",
        "Em números": "En números",
        "2 dias": "2 días",
        "do primeiro rascunho à loja no ar": "del primer boceto a la tienda en línea",
        "9 extras": "9 extras",
        "além do básico, pra cliente ficar e voltar": "además de lo básico, para que la clienta se quede y vuelva",
        "1 toque": "1 toque",
        "pra mandar o pedido inteiro no WhatsApp": "para mandar el pedido entero por WhatsApp",
        "R$ 0": "R$ 0",
        "de mensalidade de plataforma ou taxa por venda": "de mensualidad de plataforma o comisión por venta",
        "O que mudou pra cliente": "Lo que cambió para la clienta",
        "😩 Só com o Instagram": "😩 Solo con Instagram",
        "A cliente vê uma peça no feed, chama no direct, pergunta preço, tamanho, se tem outra cor… e a dona da loja responde tudo, uma por uma, peça por peça.":
            "La clienta ve una pieza en el feed, escribe por mensaje directo, pregunta precio, talla, si hay otro color… y la dueña de la tienda responde todo, una por una, pieza por pieza.",
        "🖤 Com a loja": "🖤 Con la tienda",
        "A cliente vê a coleção inteira com preço e tamanho, monta a sacola, e o WhatsApp abre com o pedido já escrito: peças, quantidades, total e observação. É só confirmar o estoque e combinar o pagamento.":
            "La clienta ve la colección entera con precio y talla, arma la bolsa, y WhatsApp abre con el pedido ya escrito: piezas, cantidades, total y observación. Solo falta confirmar el stock y acordar el pago.",
        "No celular, que é onde a cliente compra": "En el celular, que es donde la clienta compra",
        "A marca com cara própria": "La marca con cara propia",
        "Coleção com filtro, busca e preço": "Colección con filtro, búsqueda y precio",
        "A sacola que vira pedido no WhatsApp": "La bolsa que se vuelve pedido por WhatsApp",
        "O que tem na loja": "Lo que tiene la tienda",
        "Além do básico bem feito, detalhes que fazem a cliente ficar mais tempo e voltar:":
            "Además de lo básico bien hecho, detalles que hacen que la clienta se quede más tiempo y vuelva:",
        "🛍️ Sacola → WhatsApp": "🛍️ Bolsa → WhatsApp",
        "O pedido chega pronto e organizado. Nada de site pedindo cartão: o pagamento é combinado na conversa.":
            "El pedido llega listo y organizado. Nada de sitio pidiendo tarjeta: el pago se acuerda en la conversación.",
        "🔮 Qual é a sua vibe?": "🔮 ¿Cuál es tu vibra?",
        "A cliente escolhe o estilo dela e a vitrine mostra as peças que combinam.":
            "La clienta elige su estilo y la vitrina muestra las piezas que combinan.",
        "👗 Looks prontos": "👗 Looks listos",
        "Combinações montadas que vão pra sacola de uma vez.": "Combinaciones armadas que van a la bolsa de una vez.",
        "🃏 Tarô do look": "🃏 Tarot del look",
        "Três cartas sorteiam um look. Brincadeira que vira venda (e print pro story).":
            "Tres cartas sortean un look. Un juego que se vuelve venta (y captura para el story).",
        "🌕 Drop na lua cheia": "🌕 Drop en luna llena",
        "Contagem pra próxima leva de peças novas, com a fase da lua de verdade.":
            "Cuenta regresiva para la próxima tanda de piezas nuevas, con la fase de la luna real.",
        "🤍 Favoritos e link por peça": "🤍 Favoritos y link por pieza",
        "Dá pra salvar o que gostou e mandar uma peça específica pra amiga.":
            "Se puede guardar lo que te gustó y mandar una pieza específica a una amiga.",
        "📏 Tamanhos e dúvidas": "📏 Tallas y preguntas",
        "Tabela de medidas e respostas prontas pras perguntas de sempre.":
            "Tabla de medidas y respuestas listas para las preguntas de siempre.",
        "🐈‍⬛ Segredos escondidos": "🐈‍⬛ Secretos escondidos",
        "Apague as velas, ache o gato preto… a loja tem easter eggs com a cara da marca.":
            "Apaga las velas, encuentra el gato negro… la tienda tiene easter eggs con la cara de la marca.",
        "📦 Kit de lançamento": "📦 Kit de lanzamiento",
        "Posts e stories pro Instagram, cartões de visita pra imprimir e uma ficha simples pra cadastrar peças novas.":
            "Posts e historias para Instagram, tarjetas de presentación para imprimir y una ficha simple para registrar piezas nuevas.",
        "Quem usa, conta": "Quien lo usa, lo cuenta",
        "A vitrine ainda mostra peças e preços de exemplo enquanto chegam as fotos da coleção nova. O resto já está pronto.":
            "La vitrina todavía muestra piezas y precios de ejemplo mientras llegan las fotos de la colección nueva. El resto ya está listo.",
        "Quer uma loja assim pro seu negócio?": "¿Quieres una tienda así para tu negocio?",
        "Loja, cardápio, agenda de horários… Me conta como você vende hoje que eu te mando o orçamento em até 24h, sem compromisso.":
            "Tienda, menú, agenda de horarios… Cuéntame cómo vendes hoy que te mando el presupuesto en hasta 24h, sin compromiso.",
        "Pedir orçamento no WhatsApp": "Pedir presupuesto por WhatsApp",
        "Ver outros projetos": "Ver otros proyectos",

        /* ---------- Eclipse Studio (eclipse-studio/) — casca estática ---------- */
        "Pular para as peças": "Saltar a las piezas",
        "Frete grátis acima de R$ 150": "Envío gratis sobre R$ 150",
        "Até 12x sem juros no cartão": "Hasta 12x sin intereses con tarjeta",
        "Entrega em Campo Grande": "Entrega en Campo Grande",
        "Prévia": "Vista previa",
        "peças e preços provisórios": "piezas y precios provisorios",
        "Magias": "Magias",
        "Ligar o clima: chuva e lareira": "Activar el ambiente: lluvia y chimenea",
        "Abrir sacola, vazia": "Abrir bolsa, vacía",
        "Sacola": "Bolsa",
        "Moda alt · Campo Grande - MS": "Moda alt · Campo Grande - MS",
        "Roupas, bijuterias, bolsas e perfumes pro seu estilo alt de todo dia: peças feitas à mão, garimpadas em brechó e escolhidas a dedo. Monte a sacola e feche o pedido direto no WhatsApp.":
            "Ropa, bisutería, bolsas y perfumes para tu estilo alt de todos los días: piezas hechas a mano, encontradas en tiendas de segunda mano y elegidas con cuidado. Arma la bolsa y cierra el pedido directo por WhatsApp.",
        "Ver a coleção": "Ver la colección",
        "Apague as velas": "Apaga las velas",
        "tem segredo no escuro": "hay un secreto en la oscuridad",
        "psiu… tem um gato preto escondido nesta página. Procure dois olhinhos que não somem.":
            "psst… hay un gato negro escondido en esta página. Busca dos ojitos que no desaparecen.",
        "Por Uber, 99 ou retirada combinada": "Por Uber, 99 o retiro acordado",
        "Nas entregas em Campo Grande": "En las entregas en Campo Grande",
        "Até 5% off no Pix": "Hasta 5% off con Pix",
        "Ou até 12x sem juros no cartão": "O hasta 12x sin intereses con tarjeta",
        "Direto com a Elizabeth no WhatsApp": "Directo con Elizabeth por WhatsApp",
        "Abra a peça e ponha na sacola. Quase tudo é tamanho único.": "Abre la pieza y ponla en la bolsa. Casi todo es talla única.",
        "Confira quantidades e o total. Sem cadastro e sem senha.": "Revisa cantidades y el total. Sin registro ni contraseña.",
        "O pedido chega pronto. A gente confirma o estoque, a entrega e o pagamento na conversa.":
            "El pedido llega listo. Confirmamos el stock, la entrega y el pago en la conversación.",
        "A coleção": "La colección",
        "Qual é a sua vibe?": "¿Cuál es tu vibra?",
        "não sabe? tire o tarô ✦": "¿no sabes? saca el tarot ✦",
        "Buscar peça": "Buscar pieza",
        "Buscar peça…": "Buscar pieza…",
        "Faixa de preço": "Rango de precio",
        "Qualquer preço": "Cualquier precio",
        "Até R$ 50": "Hasta R$ 50",
        "R$ 50 a R$ 150": "R$ 50 a R$ 150",
        "Acima de R$ 150": "Más de R$ 150",
        "Qualquer tamanho": "Cualquier talla",
        "Nenhuma peça por aqui…": "Ninguna pieza por aquí…",
        "Tente outra palavra ou volte pra coleção inteira.": "Prueba otra palabra o vuelve a la colección entera.",
        "Combinações que já saem casando. Um clique põe as três peças na sacola.":
            "Combinaciones que ya quedan perfectas. Un clic pone las tres piezas en la bolsa.",
        "Sacudir a caixa misteriosa": "Agitar la caja misteriosa",
        "Caixa misteriosa do coven": "Caja misteriosa del aquelarre",
        "O que tem dentro?": "¿Qué hay adentro?",
        "Abrir a caixa": "Abrir la caja",
        "Quero essa caixa": "Quiero esa caja",
        "Quem já é da coven 🖤": "Quien ya es del aquelarre 🖤",
        "Pra brincar enquanto escolhe": "Para jugar mientras eliges",
        "Cantinho místico": "Rincón místico",
        "Tarô": "Tarot",
        "Lua": "Luna",
        "Horóscopo": "Horóscopo",
        "Grimório": "Grimorio",
        "Arcanos": "Arcanos",
        "Porta secreta": "Puerta secreta",
        "Tarô do look": "Tarot del look",
        "Embaralhe e tire três cartas: a sua essência, a peça e o feitiço. As cartas montam o look, e a tiragem vira imagem pro seu story.":
            "Baraja y saca tres cartas: tu esencia, la pieza y el hechizo. Las cartas arman el look, y la tirada se vuelve imagen para tu story.",
        "Embaralhar e tirar as cartas": "Barajar y sacar las cartas",
        "Ritual da lua cheia": "Ritual de luna llena",
        "Peça nova chega na lua cheia": "Pieza nueva llega en luna llena",
        "Me avisa no próximo drop 🌕": "Avísame en el próximo drop 🌕",
        "Seguir no Instagram": "Seguir en Instagram",
        "Horóscopo alt": "Horóscopo alt",
        "Escolha o seu signo: a previsão muda todo dia.": "Elige tu signo: la predicción cambia todos los días.",
        "O grimório": "El grimorio",
        "Receitas de estilo pra cada vibe. Vire as páginas (dá pra arrastar, tocar nos cantos ou usar as setas).":
            "Recetas de estilo para cada vibra. Pasa las páginas (puedes arrastrar, tocar las esquinas o usar las flechas).",
        "‹ Voltar": "‹ Volver",
        "Virar a página ›": "Pasar la página ›",
        "Coleção de arcanos": "Colección de arcanos",
        "Só pros close friends": "Solo para close friends",
        "A porta secreta": "La puerta secreta",
        "Tem peça que só aparece pra quem sabe a palavra mágica. Ela sai nos close friends do": "Hay piezas que solo aparecen para quien sabe la palabra mágica. Se publica en los close friends de",
        "Palavra mágica": "Palabra mágica",
        "Palavra mágica…": "Palabra mágica…",
        "Abrir a porta": "Abrir la puerta",
        "Drop secreto": "Drop secreto",
        "Você entrou. Essas peças não aparecem na vitrine: é só pra quem sabe a palavra.":
            "Entraste. Estas piezas no aparecen en la vitrina: son solo para quien sabe la palabra.",
        "Um gato preto escondido! Clique nele": "¡Un gato negro escondido! Haz clic en él",
        "Um lugar pra ser livre": "Un lugar para ser libre",
        "★ uma pequena sonhadora com grandes sonhos ☆": "★ una pequeña soñadora con grandes sueños ☆",
        "é um lugar onde você pode ser livre criativamente e experimentar, até descobrir o seu próprio estilo.":
            "es un lugar donde puedes ser libre creativamente y experimentar, hasta descubrir tu propio estilo.",
        "São peças pra meninxs alternativas e pro dia a dia, tudo focado no estilo alt: umas feitas à mão, outras garimpadas em brechó e outras escolhidas a dedo pra revenda.":
            "Son piezas para chiques alternativos y para el día a día, todo enfocado en el estilo alt: unas hechas a mano, otras encontradas en tiendas de segunda mano y otras elegidas con cuidado para reventa.",
        "com carinho, Elizabeth 🖤": "con cariño, Elizabeth 🖤",
        "@eclipse_studiocg no Instagram →": "@eclipse_studiocg en Instagram →",
        "escrito com tinta de lua: a próxima peça chega na lua cheia 🌕": "escrito con tinta de luna: la próxima pieza llega en luna llena 🌕",
        "Na foto: o colar bola de cristal, o brinco morceguinho e o espartilho rosa seca, flagrados às vésperas da lua cheia.":
            "En la foto: el collar bola de cristal, el arete murcielaguito y el corsé rosa seco, captados en vísperas de la luna llena.",
        "Gazeta das Trevas · edição de lua cheia": "Gaceta de las Tinieblas · edición de luna llena",
        "Tamanhos": "Tallas",
        "Quase todas as peças são": "Casi todas las piezas son",
        "tamanho único": "talla única",
        ". Quer saber se serve? Pergunta as medidas da peça no WhatsApp que a gente mede pra você.":
            ". ¿Quieres saber si te queda? Pregunta las medidas de la pieza por WhatsApp que te las pasamos.",
        "Sob encomenda ✦": "Por encargo ✦",
        "Gostou de uma peça mas queria em outra cor ou outro tamanho? A gente faz sob encomenda. É só escrever na observação do pedido.":
            "¿Te gustó una pieza pero la querías en otro color o talla? La hacemos por encargo. Solo escríbelo en la observación del pedido.",
        "Tirar dúvida no WhatsApp": "Resolver dudas por WhatsApp",
        "Dúvidas frequentes": "Preguntas frecuentes",
        "Como funciona a entrega?": "¿Cómo funciona la entrega?",
        "Por enquanto a gente entrega só em Campo Grande: por Uber ou 99, ou você retira num lugar combinado. O pedido fica pronto em até 3 dias úteis depois do pagamento. Acima de R$ 150 o frete é grátis.":
            "Por ahora entregamos solo en Campo Grande: por Uber o 99, o retiras en un lugar acordado. El pedido queda listo en hasta 3 días hábiles después del pago. Sobre R$ 150 el envío es gratis.",
        "Como funciona a troca?": "¿Cómo funciona el cambio?",
        "Você tem 7 dias a partir do recebimento pra trocar, com a etiqueta na peça. Roupa íntima não tem troca.":
            "Tienes 7 días desde la recepción para cambiar, con la etiqueta en la pieza. Ropa íntima no tiene cambio.",
        "Quais as formas de pagamento?": "¿Cuáles son las formas de pago?",
        "Pix, com até 5% de desconto; cartão de crédito em até 12x sem juros, por link de pagamento; cartão de débito; ou dinheiro na retirada. Tudo é combinado no WhatsApp depois que você manda o pedido.":
            "Pix, con hasta 5% de descuento; tarjeta de crédito hasta en 12x sin intereses, por link de pago; tarjeta de débito; o efectivo en el retiro. Todo se acuerda por WhatsApp después de que mandas el pedido.",
        "Dá pra encomendar em outra cor ou tamanho?": "¿Se puede encargar en otro color o talla?",
        "Dá, sim! Escreve na observação do pedido o que você queria e a gente combina no WhatsApp.":
            "¡Sí se puede! Escribe en la observación del pedido lo que querías y lo acordamos por WhatsApp.",
        "As peças são novas?": "¿Las piezas son nuevas?",
        "Tem de tudo: peças feitas à mão pela Elizabeth, peças novas de revenda e achados de brechó. Cada anúncio diz de onde a peça veio.":
            "Hay de todo: piezas hechas a mano por Elizabeth, piezas nuevas de reventa y hallazgos de tiendas de segunda mano. Cada anuncio dice de dónde vino la pieza.",
        "Moda alternativa em Campo Grande - MS: doce por fora, bruxa por dentro.":
            "Moda alternativa en Campo Grande - MS: dulce por fuera, bruja por dentro.",
        "Loja": "Tienda",
        "Tamanhos e dúvidas": "Tallas y preguntas",
        "WhatsApp (67) 99975-0866": "WhatsApp (67) 99975-0866",
        "Entrega em Campo Grande por Uber, 99 ou retirada": "Entrega en Campo Grande por Uber, 99 o retiro",
        "Crédito 12x": "Crédito 12x",
        "Débito": "Débito",
        "Dinheiro": "Efectivo",
        "Prévia criada por": "Vista previa creada por",
        ". As peças e os preços da vitrine ainda são de exemplo, até chegarem as fotos da coleção.":
            ". Las piezas y los precios de la vitrina todavía son de ejemplo, hasta que lleguen las fotos de la colección.",
        "Sua sacola": "Tu bolsa",
        "Fechar sacola": "Cerrar bolsa",
        "Sacola vazia": "Bolsa vacía",
        "A Nyx está dormindo aqui dentro. Ponha uma peça que ela acorda.": "Nyx está durmiendo aquí dentro. Pon una pieza y se despierta.",
        "Continuar olhando": "Seguir mirando",
        "Entrega": "Entrega",
        "prefiro retirar / quero em outra cor": "prefiero retirar / quiero en otro color",
        "Ex.: prefiro retirar / quero em outra cor": "Ej.: prefiero retirar / quiero en otro color",
        "🎁 Pedir de presente": "🎁 Pedir de regalo",
        "Esvaziar sacola": "Vaciar bolsa",
        "No WhatsApp a gente confirma o estoque, combina a entrega e manda o Pix ou o link do cartão. Este site não pede nem guarda dado de pagamento.":
            "Por WhatsApp confirmamos el stock, acordamos la entrega y mandamos el Pix o el link de la tarjeta. Este sitio no pide ni guarda datos de pago.",
        "Você achou o gato preto!": "¡Encontraste el gato negro!",
        "Pôr o código no meu pedido": "Poner el código en mi pedido",
        "Me dá de presente?": "¿Me regalas esto?",
        "A gente escreve uma cartinha com as peças da sua sacola. Você manda pra quem quiser, e a pessoa abre o link e já pode comprar.":
            "Escribimos una cartita con las piezas de tu bolsa. La mandas a quien quieras, y la persona abre el link y ya puede comprar.",
        "Seu nome": "Tu nombre",
        "Como a pessoa te conhece?": "¿Cómo te conoce la persona?",
        "Pra quem": "Para quién",
        "Ex.: mãe, amor, madrinha": "Ej.: mamá, amor, madrina",
        "Escrever a carta e mandar no WhatsApp": "Escribir la carta y mandar por WhatsApp",
        "ou copiar o link da carta": "o copiar el link de la carta",
        "Pôr tudo na sacola": "Poner todo en la bolsa",
        "com amor, Eclipse Studio 🖤": "con amor, Eclipse Studio 🖤",
        "Ver minha coleção": "Ver mi colección",
        "Nyx, a gata da loja: toque pra uma dica": "Nyx, la gata de la tienda: toca para una pista",
        "Acender as velas": "Encender las velas",
        "Fechar pedido": "Cerrar pedido",
        "Dúvidas?": "¿Dudas?",
        "Fechar": "Cerrar",
        "Como a gente te chama?": "¿Cómo te llamamos?",
        "Observação": "Observación",
        "Ver a mensagem que será enviada": "Ver el mensaje que se enviará",
        "Enviar pedido pelo WhatsApp": "Enviar pedido por WhatsApp",
        "Copiar pedido": "Copiar pedido",
        "Total estimado": "Total estimado",
        "(opcional)": "(opcional)",

        /* ---------- Eclipse Studio — textos gerados pelo script.js ---------- */
        "Sob consulta": "A consultar",
        "Vibe": "Vibra",
        "Retirada combinada": "Retiro acordado",
        "sem custo": "sin costo",
        "Escolher depois, no WhatsApp": "Elegir después, por WhatsApp",
        "Ver detalhes de": "Ver detalles de",
        "peça nova": "pieza nueva",
        "peça única": "pieza única",
        "já vendida": "ya vendida",
        "já tem dona": "ya tiene dueña",
        "Novidade": "Novedad",
        "Peça única": "Pieza única",
        "só existe uma": "solo existe una",
        "Já tem dona": "Ya tiene dueña",
        "Me avisa se chegar parecida": "Avísame si llega algo parecido",
        "Pôr na sacola": "Poner en la bolsa",
        "Tirar o filtro de estilo": "Quitar el filtro de estilo",
        "Tudo": "Todo",
        "Favoritos": "Favoritos",
        "1 peça": "1 pieza",
        "peças": "piezas",
        "Combina com": "Combina con",
        "Fotos de": "Fotos de",
        "por": "por",
        "Link da peça copiado. É só colar na conversa.": "Link de la pieza copiado. Solo pégalo en la conversación.",
        "Copie o link da peça:": "Copia el link de la pieza:",
        "nos favoritos": "en tus favoritos",
        "Ver favoritos": "Ver favoritos",
        "Sacola:": "Bolsa:",
        "Fechar pedido": "Cerrar pedido",
        "Entrega no": "Entrega en",
        "Faltam": "Faltan",
        "pro frete grátis": "para el envío gratis",
        "Frete grátis na entrega em Campo Grande": "Envío gratis en la entrega en Campo Grande",
        "Retirada sem custo": "Retiro sin costo",
        "Abrir sacola, vazia": "Abrir bolsa, vacía",
        "Abrir sacola,": "Abrir bolsa,",
        "peça": "pieza",
        "é peça única: ela já está na sua sacola 🖤": "es pieza única: ya está en tu bolsa 🖤",
        "Máximo de": "Máximo de",
        "por peça. Pra mais, combine no WhatsApp.": "por pieza. Para más, coordina por WhatsApp.",
        "caiu no caldeirão": "cayó en el caldero",
        "Oi! 🔮 Quero encomendar esta poção na": "¡Hola! 🔮 Quiero encargar esta poción en",
        "Ingredientes:": "Ingredientes:",
        "valor a combinar": "valor a acordar",
        "Entrega:": "Entrega:",
        "taxa": "costo",
        "frete grátis": "envío gratis",
        "Total estimado:": "Total estimado:",
        "+ itens a combinar": "+ artículos a acordar",
        "Nome:": "Nombre:",
        "Obs.:": "Obs.:",
        "Achei o gato preto no site: código": "Encontré el gato negro en el sitio: código",
        "Completei a coleção de arcanos: código": "Completé la colección de arcanos: código",
        "Podemos combinar a entrega e o pagamento por aqui?": "¿Podemos acordar la entrega y el pago por aquí?",
        "_(Pedido de teste da prévia do site)_": "_(Pedido de prueba de la vista previa del sitio)_",
        "Pedido copiado. Cole na conversa que quiser.": "Pedido copiado. Pégalo en la conversación que quieras.",
        "Não consegui copiar. Abra a mensagem acima e copie à mão.": "No pude copiar. Abre el mensaje de arriba y cópialo a mano.",
        "Abrindo o WhatsApp com o pedido pronto…": "Abriendo WhatsApp con el pedido listo…",
        "Oi! 🌕 Quero entrar na lista do próximo drop da lua cheia da": "¡Hola! 🌕 Quiero entrar en la lista del próximo drop de luna llena de",
        "Aqui é a": "Aquí está",
        "✦ Manda a mensagem que você entra na lista do drop": "✦ Manda el mensaje y entras en la lista del drop",
        "Look no caldeirão:": "Look en el caldero:",
        "uma já estava na sacola e não dá pra pôr mais": "una ya estaba en la bolsa y no se puede poner más",
        "Ver sacola": "Ver bolsa",
        "Pôr o look inteiro na sacola": "Poner el look entero en la bolsa",
        "essa já encontrou a dona dela": "esa ya encontró a su dueña",
        "Fechar": "Cerrar",
        "Oi! Quais são as medidas da peça": "¡Hola! ¿Cuáles son las medidas de la pieza",
        "Pedir as medidas": "Pedir las medidas",
        "Compartilhar": "Compartir",
        "Tamanho único": "Talla única",
        "Tamanho": "Talla",
        "Escolha um tamanho.": "Elige una talla.",
        "Quantidade": "Cantidad",
        "Diminuir a quantidade:": "Disminuir la cantidad:",
        "Aumentar a quantidade:": "Aumentar la cantidad:",
        "Tirar da sacola:": "Quitar de la bolsa:",
        "Tirar": "Quitar",

        /* produtos */
        "Camiseta Estampada": "Camiseta Estampada",
        "Perfumes": "Perfumes",
        "Espartilho Rosa Seca": "Corsé Rosa Seco",
        "Saia de Renda Midnight": "Falda de Encaje Midnight",
        "Vestido Boneca Lilás": "Vestido Muñeca Lila",
        "Blusa Vitoriana Creme": "Blusa Victoriana Crema",
        "Capa de Veludo Lua Cheia": "Capa de Terciopelo Luna Llena",
        "Casaco de Pelúcia Noite": "Abrigo de Peluche Noche",
        "Choker Lua de Renda": "Choker Luna de Encaje",
        "Choker Rosa Vermelha": "Choker Rosa Roja",
        "Colar Rosário Noturno": "Collar Rosario Nocturno",
        "Broche Camafeu": "Broche Camafeo",
        "Colar Cruz Lilás": "Collar Cruz Lila",
        "Brinco Morceguinho": "Arete Murcielaguito",
        "Brinco Argola Cruz": "Arete Argolla Cruz",
        "Anel Olho Místico": "Anillo Ojo Místico",
        "Colar Bola de Cristal": "Collar Bola de Cristal",
        "Bolsa Caixão": "Bolso Ataúd",
        "Caixa Misteriosa do Coven": "Caja Misteriosa del Aquelarre",
        "Colar Eclipse Dourado": "Collar Eclipse Dorado",
        "Brinco Lua Negra": "Arete Luna Negra",
        "Roupas": "Ropa",
        "Joias e bijuterias": "Joyas y bisutería",
        "Bolsas": "Bolsos",
        "Maquiagem e perfumes": "Maquillaje y perfumes",
        "Caixas": "Cajas",
        "Estampas sortidas · tamanho único": "Estampados variados · talla única",
        "Fragrâncias variadas": "Fragancias variadas",
        "Amarração · renda no decote": "Atado · encaje en el escote",
        "Rodada · barra dupla de renda": "Con vuelo · bajo doble de encaje",
        "Manga bufante · gola boneca": "Manga abullonada · cuello muñeca",
        "Gola alta · manga bufante": "Cuello alto · manga abullonada",
        "Veludo · forro lilás · fecho dourado": "Terciopelo · forro lila · cierre dorado",
        "Longo · gola e barra de pelúcia": "Largo · cuello y bajo de peluche",
        "Veludo · renda · lua": "Terciopelo · encaje · luna",
        "Veludo · rosa vermelha": "Terciopelo · rosa roja",
        "Contas pretas e vinho · cruz": "Cuentas negras y vino · cruz",
        "Perfil marfim · moldura de pérolas": "Perfil marfil · marco de perlas",
        "Cruz esmaltada · pedra rosa": "Cruz esmaltada · piedra rosa",
        "Par · olhinhos rosa": "Par · ojitos rosa",
        "Par desigual · rosa e menta": "Par desigual · rosa y menta",
        "Ajustável · olho com cílios": "Ajustable · ojo con pestañas",
        "Bola de vidro · lua por dentro": "Bola de vidrio · luna por dentro",
        "Formato caixão · alça de mão": "Forma de ataúd · asa de mano",
        "Exclusivo dos close friends": "Exclusivo de los close friends",
        "3 peças surpresa da vibe que você escolher": "3 piezas sorpresa de la vibra que elijas",

        /* estilos (vibes) */
        "Vitoriana": "Victoriana",
        "Espartilho, renda marfim e camafeu: delicada e assombrada, feito retrato antigo.":
            "Corsé, encaje marfil y camafeo: delicada y embrujada, como un retrato antiguo.",
        "Trad goth": "Trad goth",
        "Veludo preto, pelúcia, rosário e rosa vermelha. Pra noite toda na rua.":
            "Terciopelo negro, peluche, rosario y rosa roja. Para toda la noche en la calle.",
        "Bruxinha": "Brujita",
        "Bola de cristal, lua e capa de veludo pra quem lê o futuro.":
            "Bola de cristal, luna y capa de terciopelo para quien lee el futuro.",
        "Pastel goth": "Pastel goth",
        "Lilás, rosa e menta com um pé nas trevas: fofa e macabra.":
            "Lila, rosa y menta con un pie en las tinieblas: tierna y macabra.",

        /* looks prontos */
        "Look Boneca Assombrada": "Look Muñeca Embrujada",
        "Vestido boneca, choker de renda e a bolsa caixão: doce com um pé nas trevas.":
            "Vestido muñeca, choker de encaje y el bolso ataúd: dulce con un pie en las tinieblas.",
        "Look Chá da Meia-Noite": "Look Té de Medianoche",
        "Blusa vitoriana, espartilho e o colar de cruz.": "Blusa victoriana, corsé y el collar de cruz.",
        "Kit Noite de Lua Cheia": "Kit Noche de Luna Llena",
        "Capa de veludo, colar bola de cristal e brinco morceguinho.":
            "Capa de terciopelo, collar bola de cristal y arete murcielaguito.",

        /* magia.js: lua de verdade */
        "Lua nova": "Luna nueva",
        "Lua crescente": "Luna creciente",
        "Quarto crescente": "Cuarto creciente",
        "Crescente gibosa": "Creciente gibosa",
        "Minguante gibosa": "Gibosa menguante",
        "Quarto minguante": "Cuarto menguante",
        "Lua minguante": "Luna menguante",

        /* página inicial: garantia, indicação, monte o seu, filme do celular, calculadora do celular e rótulos de acessibilidade */
        "Um cliente": "Un cliente",
        "acha a {m} no Google": "encuentra {m} en Google",
        "acha o {m} no Google": "encuentra {m} en Google",
        "acha a {m} no Instagram": "encuentra {m} en Instagram",
        "…a mensagem chega pronta no WhatsApp e <b>já é respondida sozinha</b>…": "…el mensaje llega listo a WhatsApp y <b>se responde solo</b>…",
        "…e você acorda com": "…y te despiertas con",
        "3 horários marcados": "3 turnos agendados",
        "3 vendas": "3 ventas",
        "3 clientes agendaram": "3 clientes agendaron",
        "3 alunos novos": "3 alumnos nuevos",
        "3 consultas marcadas": "3 consultas agendadas",
        "ou veja o preço na hora →": "o mira el precio al instante →",
        "Só paga se gostar da prévia": "Solo pagas si te gusta la vista previa",
        "como funciona?": "¿cómo funciona?",
        "📝 Não sabe se precisa?": "📝 ¿No sabes si lo necesitas?",
        "Faça o teste de 1 minuto": "Haz el test de 1 minuto",
        "monte o seu e veja o preço": "arma el tuyo y mira el precio",
        "Qual é a sua cara?": "¿Cuál es tu estilo?",
        "deixando um depoimento (10% off)": "dejando un testimonio (10% off)",
        "Meu primeiro site": "Mi primer sitio",
        "Monte o seu e veja o preço na hora →": "Arma el tuyo y mira el precio al instante →",
        "Salão, barbearia ou estética": "Salón, barbería o estética",
        "Prestador de serviço": "Prestador de servicios",
        "Um site a partir de R$ 250 se paga com": "Un sitio desde R$ 250 se paga con",
        "É uma estimativa, só pra ter ideia do tamanho da coisa.": "Es una estimación, solo para tener idea del tamaño.",
        "Toque no campo e aperte o": "Toca el campo y aprieta el",
        "microfone do teclado": "micrófono del teclado",
        ". Fala do seu jeito que o texto sai pronto pro WhatsApp.": ". Habla a tu manera y el texto sale listo para WhatsApp.",
        "💬 Mandar minha ideia": "💬 Enviar mi idea",
        "Você só paga se gostar da prévia.": "Solo pagas si te gusta la vista previa.",
        "Eu monto a primeira versão do seu site antes de qualquer pagamento. Gostou? Aí você paga 50% e eu termino; os outros 50% ficam pra entrega. Não gostou? Não paga nada. Pix, cartão ou o que combinarmos na proposta.": "Armo la primera versión de tu sitio antes de cualquier pago. ¿Te gustó? Entonces pagas el 50% y lo termino; el otro 50% queda para la entrega. ¿No te gustó? No pagas nada. Pix, tarjeta o lo que acordemos en la propuesta.",
        "Indiquei alguém. Ganho alguma coisa?": "Recomendé a alguien. ¿Gano algo?",
        "Ganha! Quem chega pelo seu link tem": "¡Sí! Quien llega por tu link tiene",
        "10% de desconto no primeiro site": "10% de descuento en el primer sitio",
        ". Gere o seu link aqui:": ". Genera tu link aquí:",
        "Gerar meu link": "Generar mi link",
        "Mandar pro seu sócio": "Enviar a tu socio",
        "Meu resumo da visita": "Mi resumen de la visita",
        "Instalar o portfólio": "Instalar el portafolio",
        "monte o seu": "arma el tuyo",
        "como eu trabalho": "cómo trabajo",
        "Navegação rápida por seção": "Navegación rápida por sección",
        "Navegação principal": "Navegación principal",
        "Navegação rápida": "Navegación rápida",
        "Chamar no WhatsApp": "Escribir por WhatsApp",
        "Passe o mouse pra ver o modo desenho": "Pasa el mouse para ver el modo dibujo",
        "Stories dos projetos": "Stories de los proyectos",
        "Abrir a prévia do site deste exemplo": "Abrir la vista previa del sitio de este ejemplo",
        "Nome do seu negócio, pra ver no celular": "Nombre de tu negocio, para verlo en el celular",
        "Digite o nome do seu negócio": "Escribe el nombre de tu negocio",
        "Resumo do portfólio": "Resumen del portafolio",
        "Calculadora rápida de orçamento": "Calculadora rápida de presupuesto",
        "Seu negócio sem site e com site": "Tu negocio sin sitio y con sitio",
        "Arraste pra comparar: à esquerda sem site, à direita com site": "Arrastra para comparar: a la izquierda sin sitio, a la derecha con sitio",
        "Nome do seu negócio (opcional)": "Nombre de tu negocio (opcional)",
        "Escolha uma situação": "Elige una situación",
        "Com site": "Con sitio",
        "Sem site": "Sin sitio",
        "Ver aqui, sem sair da página": "Ver aquí, sin salir de la página",
        "Ver o código no GitHub": "Ver el código en GitHub",
        "Ver Eldev Music aqui, sem sair da página": "Ver Eldev Music aquí, sin salir de la página",
        "Ver o código de Eldev Music no GitHub": "Ver el código de Eldev Music en GitHub",
        "Ver Glitch District aqui, sem sair da página": "Ver Glitch District aquí, sin salir de la página",
        "Ver o código de Glitch District no GitHub": "Ver el código de Glitch District en GitHub",
        "Ver Fatia Nobre aqui, sem sair da página": "Ver Fatia Nobre aquí, sin salir de la página",
        "Ver o código de Fatia Nobre no GitHub": "Ver el código de Fatia Nobre en GitHub",
        "Ver Conta a Dois aqui, sem sair da página": "Ver Conta a Dois aquí, sin salir de la página",
        "Ver o código de Conta a Dois no GitHub": "Ver el código de Conta a Dois en GitHub",
        "Ver TaskFlow aqui, sem sair da página": "Ver TaskFlow aquí, sin salir de la página",
        "Ver o código de TaskFlow no GitHub": "Ver el código de TaskFlow en GitHub",
        "Ver FocusFlow aqui, sem sair da página": "Ver FocusFlow aquí, sin salir de la página",
        "Ver o código de FocusFlow no GitHub": "Ver el código de FocusFlow en GitHub",
        "Ver FlowBoard aqui, sem sair da página": "Ver FlowBoard aquí, sin salir de la página",
        "Ver o código de FlowBoard no GitHub": "Ver el código de FlowBoard en GitHub",
        "App de música no celular: disco de vinil girando, a tela inicial com músicas em alta e o player": "App de música en el celular: disco de vinilo girando, la pantalla de inicio con canciones en tendencia y el reproductor",
        "Vitrine da loja com fotos de parka, moletom, calça cargo, coturno e óculos, o carrinho com 3 peças e a loja aberta no celular": "Vitrina de la tienda con fotos de parka, buzo, pantalón cargo, borcegos y lentes, el carrito con 3 piezas y la tienda abierta en el celular",
        "Chat da pizzaria respondendo sozinho o horário de funcionamento e a entrega": "Chat de la pizzería respondiendo solo el horario de atención y el delivery",
        "O app no computador e no celular, mostrando que Bruno deve R$ 68,75 pra Ana e a lista de gastos dos dois": "La app en la computadora y en el celular, mostrando que Bruno le debe R$ 68,75 a Ana y la lista de gastos de los dos",
        "Lista de tarefas do dia com prioridade alta, média e baixa, e o progresso do dia": "Lista de tareas del día con prioridad alta, media y baja, y el progreso del día",
        "Cronômetro de 25 minutos de foco rodando, com os botões de pausa curta e longa": "Cronómetro de 25 minutos de foco corriendo, con los botones de pausa corta y larga",
        "Quadro com três colunas de tarefas: a fazer, em andamento e concluído": "Tablero con tres columnas de tareas: por hacer, en curso y terminado",
        "Conte sua ideia": "Cuenta tu idea",
        "Ex.: tenho uma pizzaria e queria um site pros clientes pedirem pelo WhatsApp…": "Ej.: tengo una pizzería y quiero un sitio para que los clientes pidan por WhatsApp…",
        "Como funciona": "Cómo funciona",
        "Interface de Programação de Aplicações: a porta por onde outros programas conversam com um sistema": "Interfaz de Programación de Aplicaciones: la puerta por donde otros programas conversan con un sistema",
        "Progressive Web App: um site que dá pra instalar como aplicativo": "Progressive Web App: un sitio que se puede instalar como aplicación",
        "Volume da música": "Volumen de la música",
        "salão": "salón",
        "salão de beleza": "salón de belleza",
        /* antes × depois do topo (antes-depois.js) e vitrine do celular */
        "Boa noite! Vocês tão abertos? Queria 2 calabresa 🍕": "¡Buenas noches! ¿Están abiertos? Quería 2 de calabresa 🍕",
        "deixa, pedi em outro lugar 👋": "deja, pedí en otro lado 👋",
        "Abertos até 23h30! 🍕 2 calabresa = R$ 90. Chega em 40 min.": "¡Abiertos hasta las 23:30! 🍕 2 de calabresa = R$ 90. Llega en 40 min.",
        "Fechado! 🙌": "¡Listo! 🙌",
        "Fala! Tem horário hoje à tarde? Corte + barba": "¡Buenas! ¿Hay turno hoy a la tarde? Corte + barba",
        "achei outra barbearia, valeu": "encontré otra barbería, gracias",
        "Tem sim ✂️ 16h30 ou 18h. Toca no horário pra agendar 👇": "Sí ✂️ 16:30 o 18:00. Toca el horario para agendar 👇",
        "18h! 🙌": "¡18:00! 🙌",
        "Oi! Tem o moletom preto no M?": "¡Hola! ¿Tienen el buzo negro en M?",
        "oi??": "¿hola??",
        "comprei em outra loja 👋": "compré en otra tienda 👋",
        "Tem! 🖤 Moletom M = R$ 189. Pix ou cartão?": "¡Sí! 🖤 Buzo M = R$ 189. ¿Pix o tarjeta?",
        "Pix! 🙌": "¡Pix! 🙌",
        "Oi, tem horário pra escova no sábado?": "Hola, ¿hay turno para brushing el sábado?",
        "alguém?": "¿alguien?",
        "marquei em outro salão 👋": "reservé en otro salón 👋",
        "Tem! 💇‍♀️ Sábado 10h ou 14h. Qual prefere?": "¡Sí! 💇‍♀️ Sábado 10:00 o 14:00. ¿Cuál prefieres?",
        "10h! 🙌": "¡10:00! 🙌",
        "Bom dia! Como faço pra treinar aí?": "¡Buen día! ¿Cómo hago para entrenar ahí?",
        "fechei com outra academia": "me anoté en otro gimnasio",
        "Bora! 💪 Aula experimental grátis hoje às 18h. Te espero!": "¡Vamos! 💪 Clase de prueba gratis hoy a las 18:00. ¡Te espero!",
        "Tô dentro! 🙌": "¡Me anoto! 🙌",
        "Boa noite, tem consulta com clínico essa semana?": "Buenas noches, ¿hay consulta con clínico esta semana?",
        "olá?": "¿hola?",
        "consegui em outra clínica": "conseguí en otra clínica",
        "Temos! 🩺 Quinta 9h ou 14h. Qual fica melhor?": "¡Sí! 🩺 Jueves 9:00 o 14:00. ¿Cuál te queda mejor?",
        "Quinta 9h, obrigada!": "Jueves 9:00, ¡gracias!",
        "+1 HORÁRIO": "+1 TURNO",
        "+1 VENDA": "+1 VENTA",
        "+1 AGENDAMENTO": "+1 TURNO",
        "+1 ALUNO": "+1 ALUMNO",
        "R$ 99/mês": "R$ 99/mes",
        "marcada": "agendada",
        "você viu às": "lo viste a las",
        "resposta automática": "respuesta automática",
        "Cliente novo": "Cliente nuevo",
        "visto por último às": "últ. vez a las",
        "foi pro concorrente": "se fue a la competencia",
        "arrasta ↔": "arrastra ↔",
        "pizzaria": "pizzería",
        "barbearia": "barbería",
        "loja": "tienda",
        "academia": "gimnasio",
        "Ver exemplo de outro ramo": "Ver ejemplo de otro rubro",
        "digite o nome do seu negócio aqui embaixo, ou toque no celular pra prévia completa 👆": "escribe el nombre de tu negocio aquí abajo, o toca el celular para la vista previa completa 👆",
        /* script.js: orçamento em passos (perguntas, opções, botões e a mensagem final) */
        "2 a 5 pessoas": "2 a 5 personas",
        "6 a 20 pessoas": "6 a 20 personas",
        "Agendamento": "Agenda de citas",
        "Ainda não": "Todavía no",
        "Ainda não controlo": "Todavía no lo controlo",
        "Ainda não sei": "Todavía no sé",
        "Ainda não sei o que preciso": "Todavía no sé qué necesito",
        "Ainda não tenho": "Todavía no tengo",
        "Aplicativo de celular": "Aplicación para celular",
        "Automação (acabar com tarefa repetitiva)": "Automatización (acabar con tareas repetitivas)",
        "Avisos por WhatsApp ou e-mail": "Avisos por WhatsApp o e-mail",
        "Baixar em PDF": "Descargar en PDF",
        "Blog ou novidades": "Blog o novedades",
        "Botão de WhatsApp": "Botón de WhatsApp",
        "Cadastro de clientes": "Registro de clientes",
        "Caderno ou papel": "Cuaderno o papel",
        "Com que frequência ela acontece?": "¿Con qué frecuencia ocurre?",
        "Como controla hoje": "Cómo lo controla hoy",
        "Como posso te chamar?": "¿Cómo te llamas?",
        "Como você controla isso hoje?": "¿Cómo controlas eso hoy?",
        "Confira e mude o que quiser. Ao clicar em enviar, o WhatsApp abre com este texto. Falta só apertar enviar por lá.": "Revisa y cambia lo que quieras. Al tocar en enviar, WhatsApp se abre con este texto. Solo falta tocar enviar allí.",
        "Continuamos de onde você parou.": "Seguimos desde donde lo dejaste.",
        "Copiar resumo": "Copiar resumen",
        "Câmera e fotos": "Cámara y fotos",
        "Ele precisa funcionar sem internet?": "¿Necesita funcionar sin internet?",
        "Em cerca de 1 mês": "En aproximadamente 1 mes",
        "Escreva seu nome para eu saber com quem estou falando.": "Escribe tu nombre para saber con quién estoy hablando.",
        "Ex.: copiar os dados dos e-mails para uma planilha": "Ej.: copiar los datos de los e-mails a una planilla",
        "Ex.: instagram.com/seunegocio": "Ej.: instagram.com/tunegocio",
        "Ex.: link de um site que você gosta, ou algo importante que eu deva saber": "Ej.: el link de un sitio que te guste, o algo importante que deba saber",
        "Ex.: perco muito tempo respondendo as mesmas perguntas": "Ej.: pierdo mucho tiempo respondiendo las mismas preguntas",
        "Ex.: sou dentista e atendo em Campo Grande": "Ej.: soy dentista y atiendo en Campo Grande",
        "Formulário de contato": "Formulario de contacto",
        "Frequência": "Frecuencia",
        "Funcionar sem internet": "Funcionar sin internet",
        "Galeria de fotos": "Galería de fotos",
        "Já tem domínio": "Ya tiene dominio",
        "Já tem site ou rede social do negócio? (opcional)": "¿Ya tienes sitio o red social del negocio? (opcional)",
        "Ler PDFs e documentos": "Leer PDFs y documentos",
        "Login de usuários": "Login de usuarios",
        "Logo e cores": "Logo y colores",
        "Loja online": "Tienda online",
        "Mais de 20": "Más de 20",
        "Mais detalhes:": "Más detalles:",
        "Mapa e localização": "Mapa y ubicación",
        "Marque o que quiser. Pode pular.": "Marca lo que quieras. Puedes saltarlo.",
        "Me chamo": "Me llamo",
        "Mensagem para o WhatsApp": "Mensaje para WhatsApp",
        "Notificações": "Notificaciones",
        "Não deu para copiar. Selecione o texto e copie.": "No se pudo copiar. Selecciona el texto y cópialo.",
        "Não sei": "No sé",
        "Não sei o que é isso": "No sé qué es eso",
        "O quanto antes": "Lo antes posible",
        "O que o projeto precisa ter?": "¿Qué necesita tener el proyecto?",
        "O que quer resolver": "Qué quiere resolver",
        "O que você faz ou vende?": "¿Qué haces o vendes?",
        "Oi, Samuel!": "¡Hola, Samuel!",
        "Os dois": "Los dos",
        "Outro sistema": "Otro sistema",
        "Pagamento online": "Pago online",
        "Painel com gráficos": "Panel con gráficos",
        "Painel para administrar": "Panel para administrar",
        "Para qual celular?": "¿Para qué celular?",
        "Para quando você precisa?": "¿Para cuándo lo necesitas?",
        "Pedir orçamento": "Pedir presupuesto",
        "Pedir orçamento disso": "Pedir presupuesto de esto",
        "Pergunta": "Pregunta",
        "Planilha": "Planilla",
        "Planilhas (Excel ou Google)": "Planillas (Excel o Google)",
        "Precisa ter": "Necesita tener",
        "Progresso do orçamento": "Progreso del presupuesto",
        "Projeto:": "Proyecto:",
        "Pular": "Saltar",
        "Qual problema você quer resolver ou o que quer melhorar?": "¿Qué problema quieres resolver o qué quieres mejorar?",
        "Qual tarefa você repete todo dia ou toda semana?": "¿Qué tarea repites todos los días o todas las semanas?",
        "Quantas pessoas vão usar": "Cuántas personas lo van a usar",
        "Quantas pessoas vão usar o sistema?": "¿Cuántas personas van a usar el sistema?",
        "Que tipo de projeto você quer?": "¿Qué tipo de proyecto quieres?",
        "Quer acrescentar algo? (opcional)": "¿Quieres agregar algo? (opcional)",
        "Recomeçar": "Empezar de nuevo",
        "Recomeçar do zero": "Empezar desde cero",
        "Referência: projeto": "Referencia: proyecto",
        "Relatórios em PDF ou Excel": "Informes en PDF o Excel",
        "Relatórios prontos": "Informes listos",
        "Resumo copiado!": "¡Resumen copiado!",
        "Sem pressa": "Sin prisa",
        "Sim, tenho os dois": "Sí, tengo los dos",
        "Sistema web (cadastro, controle, painel)": "Sistema web (registro, control, panel)",
        "Site ou página de vendas": "Sitio o página de ventas",
        "Site/rede social atual:": "Sitio/red social actual:",
        "Sobre o negócio": "Sobre el negocio",
        "Sua mensagem está pronta": "Tu mensaje está listo",
        "Só eu": "Solo yo",
        "Só o logo": "Solo el logo",
        "Tarefa que se repete": "Tarea que se repite",
        "Tirar dúvida": "Sacar una duda",
        "Toda semana": "Todas las semanas",
        "Todo dia": "Todos los días",
        "Todo mês": "Todos los meses",
        "Tudo certo!": "¡Todo listo!",
        "Ver minha mensagem": "Ver mi mensaje",
        "Vi seu portfólio": "Vi tu portafolio",
        "Vim pelo": "Llegué por",
        "Você está no navegador do Instagram. Se o WhatsApp não abrir, toque em Copiar resumo e me chame por lá.": "Estás en el navegador de Instagram. Si WhatsApp no se abre, toca en Copiar resumen y escríbeme por allí.",
        "Você já tem logo e cores da sua marca?": "¿Ya tienes logo y colores de tu marca?",
        "Você já tem um endereço na internet (domínio)?": "¿Ya tienes una dirección en internet (dominio)?",
        "e quero pedir um orçamento.": "y quiero pedir un presupuesto.",
        "link que você me mandou": "link que me enviaste",
        "← Voltar": "← Volver",
        "← Voltar e mudar respostas": "← Volver y cambiar respuestas",
        "Novidades": "Novedades",
        "Como cheguei:": "Cómo llegué:",
        "QR do cartão de visita": "el QR de la tarjeta",
        "status do WhatsApp": "los estados de WhatsApp",
        "indicação de amiga": "recomendación de una amiga",
        "Site feito por": "Sitio hecho por",
        "site de um cliente seu": "el sitio de un cliente tuyo",
        "amanhã": "mañana",
        "· Edição #1 · Impresso em Campo Grande - MS": "· Edición #1 · Impreso en Campo Grande - MS",
        "Alguém": "Alguien",
        /* cantinho místico: horóscopo, grimório, arcanos, caixa, presente, boneca e a Nyx */
        "Lua cheia": "Luna llena",
        "Com a {fase}, tudo fica mais intenso, até o look.": "Con la {fase}, todo se vuelve más intenso, hasta el look.",
        "Com a {fase}, é dia de começar algo do zero.": "Con la {fase}, es día de empezar algo desde cero.",
        "Com a lua {fase}, o que você plantar hoje cresce rápido.": "En {fase}, lo que siembres hoy crece rápido.",
        "Com a lua {fase}, é hora de desapegar do que não te veste mais.": "En {fase}, es hora de soltar lo que ya no te viste.",
        "Previsão de {data}. Muda todo dia: volta amanhã ✦": "Predicción del {data}. Cambia todos los días: vuelve mañana ✦",
        "Escolha o seu signo": "Elige tu signo",
        "Magias da loja": "Magias de la tienda",
        "Áries": "Aries",
        "Touro": "Tauro",
        "Gêmeos": "Géminis",
        "Câncer": "Cáncer",
        "Leão": "Leo",
        "Virgem": "Virgo",
        "Escorpião": "Escorpio",
        "Sagitário": "Sagitario",
        "Capricórnio": "Capricornio",
        "Aquário": "Acuario",
        "Peixes": "Piscis",
        "Hoje sua energia está em brasa:": "Hoy tu energía está al rojo vivo:",
        "O fogo do seu signo anda inquieto:": "El fuego de tu signo anda inquieto:",
        "Tem faísca no ar pra você:": "Hay chispas en el aire para ti:",
        "Seu brilho não cabe em meia-luz hoje:": "Tu brillo no cabe en la penumbra hoy:",
        "Hoje o dia pede raiz e ritual:": "Hoy el día pide raíz y ritual:",
        "Seu signo quer algo que dure:": "Tu signo quiere algo que dure:",
        "A terra sussurra paciência:": "La tierra susurra paciencia:",
        "Hoje você merece conforto com um pé no macabro:": "Hoy mereces comodidad con un pie en lo macabro:",
        "Hoje as ideias voam feito morcego ao entardecer:": "Hoy las ideas vuelan como murciélago al atardecer:",
        "O vento traz novidade pro seu lado:": "El viento trae novedades a tu lado:",
        "Sua cabeça está nas nuvens (e as nuvens estão roxas):": "Tu cabeza está en las nubes (y las nubes son moradas):",
        "Hoje a conversa flui, e o estilo também:": "Hoy la conversación fluye, y el estilo también:",
        "Hoje sua intuição está afiada:": "Hoy tu intuición está afilada:",
        "As águas do seu signo andam profundas:": "Las aguas de tu signo andan profundas:",
        "Tem mistério rondando você hoje:": "Hay misterio rondándote hoy:",
        "Seu sexto sentido está no máximo:": "Tu sexto sentido está al máximo:",
        "aposte numa peça que ninguém espera de você.": "apuesta por una pieza que nadie espera de ti.",
        "use preto como quem veste armadura.": "usa negro como quien se pone una armadura.",
        "um detalhe de renda resolve o dia inteiro.": "un detalle de encaje resuelve el día entero.",
        "deixe o delineado mais afiado que a língua.": "deja el delineado más afilado que la lengua.",
        "combine algo fofo com algo que assusta.": "combina algo tierno con algo que asuste.",
        "prata ou dourado? Os dois. Hoje pode.": "¿plata o dorado? Los dos. Hoy se puede.",
        "tire aquela peça do fundo do armário e dê uma chance.": "saca esa pieza del fondo del armario y dale una oportunidad.",
        "menos explicação, mais presença.": "menos explicación, más presencia.",
        "um choker no pescoço e o mundo te respeita.": "un choker en el cuello y el mundo te respeta.",
        "coloque a playlist mais dramática que você tem.": "pon la playlist más dramática que tengas.",
        "saia na rua como se fosse capa de revista antiga.": "sal a la calle como si fueras portada de revista antigua.",
        "acenda uma vela e peça algo com fé.": "enciende una vela y pide algo con fe.",
        "lilás": "lila",
        "vinho": "vino",
        "preto veludo": "negro terciopelo",
        "marfim": "marfil",
        "rosa bebê": "rosa bebé",
        "dourado": "dorado",
        "Cor do dia": "Color del día",
        "Número da sorte": "Número de la suerte",
        "Peça do dia": "Pieza del día",
        "Ver a peça": "Ver la pieza",
        "HORÓSCOPO ALT DO DIA": "HORÓSCOPO ALT DEL DÍA",
        "PEÇA DO DIA": "PIEZA DEL DÍA",
        "cor do dia: {cor}  ✦  número da sorte: {n}": "color del día: {cor}  ✦  número de la suerte: {n}",
        "veja o seu no link da bio ✦ @eclipse_studiocg": "mira el tuyo en el link de la bio ✦ @eclipse_studiocg",
        "Não consegui montar a imagem agora. Tente de novo ou tire um print.": "No pude armar la imagen ahora. Intenta de nuevo o haz una captura.",
        "A porta está aberta ✦ boas-vindas ao drop secreto.": "La puerta está abierta ✦ bienvenida al drop secreto.",
        "Seu navegador não abre essa porta. Tente outro navegador.": "Tu navegador no abre esta puerta. Prueba otro navegador.",
        "A porta não reconheceu essa palavra 🔒 Ela aparece nos close friends do @eclipse_studiocg.": "La puerta no reconoció esa palabra 🔒 Aparece en los mejores amigos de @eclipse_studiocg.",
        "Grimório da Eclipse Studio": "Grimorio de Eclipse Studio",
        "da Eclipse Studio": "de Eclipse Studio",
        "receitas de estilo ✦ vire a página": "recetas de estilo ✦ pasa la página",
        "Continua na próxima lua cheia…": "Continúa en la próxima luna llena…",
        "Novas receitas chegam junto com as peças novas.": "Las recetas nuevas llegan junto con las piezas nuevas.",
        "ver tudo da vibe {vibe} →": "ver todo de la vibra {vibe} →",
        "capa": "portada",
        "fim": "fin",
        "Pegue um espartilho, uma pitada de renda marfim e um camafeu preso na gola. Misture à meia-luz e sirva com olhar de retrato antigo.": "Toma un corsé, una pizca de encaje marfil y un camafeo prendido en el cuello. Mezcla a media luz y sirve con mirada de retrato antiguo.",
        "Derreta veludo preto em fogo baixo, junte um rosário longo e uma rosa vermelha no pescoço. Deixe descansar até a meia-noite e saia pra rua.": "Derrite terciopelo negro a fuego lento, añade un rosario largo y una rosa roja en el cuello. Deja reposar hasta la medianoche y sal a la calle.",
        "Numa noite de lua, junte uma capa de veludo, uma bola de cristal no peito e um olho que tudo vê no dedo. Mexa três vezes em sentido anti-horário.": "En una noche de luna, junta una capa de terciopelo, una bola de cristal en el pecho y un ojo que todo lo ve en el dedo. Revuelve tres veces en sentido antihorario.",
        "Bata lilás, rosa e menta até ficar fofo. Acrescente uma cruz, um morceguinho e uma gota de trevas. Sirva com laço.": "Bate lila, rosa y menta hasta que quede tierno. Agrega una cruz, un murcielaguito y una gota de tinieblas. Sirve con moño.",
        "Desligar o clima sonoro": "Apagar el ambiente",
        "arraste pra mover, setas também movem": "arrastra para mover, las flechas también mueven",
        "Look com 1 peça: {total}": "Look con 1 pieza: {total}",
        "Look com {n} peças: {total}": "Look con {n} piezas: {total}",
        "itens a combinar": "artículos a acordar",
        "A boneca está só de anágua. Escolha uma peça ✦": "La muñeca está solo en enagua. Elige una pieza ✦",
        "Meu look de boneca": "Mi look de muñeca",
        "monte o seu no link da bio ✦ @eclipse_studiocg": "arma el tuyo en el link de la bio ✦ @eclipse_studiocg",
        "Vista a boneca primeiro ✦": "Viste la muñeca primero ✦",
        "✦ O look da boneca caiu no caldeirão": "✦ El look de la muñeca cayó en el caldero",
        "Toque nas peças pra vestir a boneca e arraste pra arrumar. Gostou do look? Salva pro story ou põe tudo na sacola.": "Toca las piezas para vestir la muñeca y arrastra para acomodarlas. ¿Te gustó el look? Guárdalo para el story o ponlo todo en la bolsa.",
        "Boneca vestida com as peças escolhidas": "Muñeca vestida con las piezas elegidas",
        "Peça selecionada": "Pieza seleccionada",
        "Diminuir a peça": "Achicar la pieza",
        "Aumentar a peça": "Agrandar la pieza",
        "(toque pra vestir ou tirar)": "(toca para poner o quitar)",
        "Oi, {nome}!": "¡Hola, {nome}!",
        "Oi!": "¡Hola!",
        "Separei umas peças na {loja} que eu ia amar ganhar de presente 🖤": "Elegí unas piezas en {loja} que me encantaría recibir de regalo 🖤",
        "É só abrir a cartinha:": "Solo abre la cartita:",
        "Ponha as peças que você quer ganhar na sacola primeiro ✦": "Primero pon en la bolsa las piezas que quieres recibir ✦",
        "🎁 Carta pronta: escolha pra quem mandar no WhatsApp.": "🎁 Carta lista: elige a quién mandarla por WhatsApp.",
        "Carta copiada ✦ cola na conversa que quiser.": "Carta copiada ✦ pégala en la conversación que quieras.",
        "{de} te mandou uma carta": "{de} te mandó una carta",
        "{de} separou estas peças na {loja} e ia amar ganhar de presente:": "{de} eligió estas piezas en {loja} y le encantaría recibirlas de regalo:",
        "É presente pra {de} 🎁": "Es regalo para {de} 🎁",
        "🎁 O presente pra {de} está na sacola": "🎁 El regalo para {de} está en la bolsa",
        "{n} peças surpresa da vibe que você escolher, por {preco}. Toca na caixa pra sacudir 😉": "{n} piezas sorpresa de la vibra que elijas, por {preco}. Toca la caja para sacudirla 😉",
        "Numa caixa {vibe} pode vir qualquer uma destas (ou outras da mesma vibe):": "En una caja {vibe} puede venir cualquiera de estas (u otras de la misma vibra):",
        "Quero a caixa {vibe}": "Quiero la caja {vibe}",
        "Caixa {vibe} no caldeirão": "Caja {vibe} en el caldero",
        "Coleção completa! Seu código {codigo} já vai sozinho no pedido: {premio}.": "¡Colección completa! Tu código {codigo} ya va solo en el pedido: {premio}.",
        "Cada dia que você visita a loja, ganha uma carta. Junte as {total} e ganhe um código: {premio}. Você tem {n} de {total}.": "Cada día que visitas la tienda, ganas una carta. Junta las {total} y gana un código: {premio}. Tienes {n} de {total}.",
        "Carta ainda escondida": "Carta todavía escondida",
        "volte amanhã": "vuelve mañana",
        "Sua primeira visita trouxe uma carta ✦": "Tu primera visita trajo una carta ✦",
        "A última carta! Coleção completa ✦": "¡La última carta! Colección completa ✦",
        "Você voltou, e trouxe uma carta nova ✦": "Volviste, y trajiste una carta nueva ✦",
        "Seu código é {codigo}: {premio}. Ele já vai sozinho na mensagem do pedido.": "Tu código es {codigo}: {premio}. Ya va solo en el mensaje del pedido.",
        "{n} de {total} cartas. Volte amanhã pra próxima.": "{n} de {total} cartas. Vuelve mañana por la próxima.",
        "🃏 Você ganhou sua primeira carta de arcano!": "🃏 ¡Ganaste tu primera carta de arcano!",
        "🃏 Carta nova na sua coleção!": "🃏 ¡Carta nueva en tu colección!",
        "Frete grátis acima de {valor} na entrega em Campo Grande. Eu conferi 🐾": "Envío gratis desde {valor} en entregas en Campo Grande. Lo verifiqué 🐾",
        "Já tirou o tarô do look? As cartas não mentem (eu às vezes sim).": "¿Ya sacaste el tarot del look? Las cartas no mienten (yo a veces sí).",
        "Psiu… apaga as velas lá em cima. Tem um primo meu escondido no escuro.": "Psst… apaga las velas allá arriba. Hay un primo mío escondido en la oscuridad.",
        "Lua de hoje: {fase}. Peça nova chega na lua cheia.": "Luna de hoy: {fase}. Las piezas nuevas llegan en luna llena.",
        "Dizem que tem uma porta secreta aqui embaixo. A palavra sai nos close friends 👀": "Dicen que hay una puerta secreta aquí abajo. La palabra sale en los mejores amigos 👀",
        "Quer ganhar de presente? Monta a sacola e toca em “Pedir de presente”.": "¿Quieres que te lo regalen? Arma la bolsa y toca “Pedir de regalo”.",
        "Volta amanhã que tem carta de arcano nova pra você 🃏": "Vuelve mañana que hay carta de arcano nueva para ti 🃏",
        "Já viu seu horóscopo alt de hoje? Muda todo dia.": "¿Ya viste tu horóscopo alt de hoy? Cambia todos los días.",
        "Mrrrau! Caiu no caldeirão ✦": "¡Mrrrau! Cayó en el caldero ✦",
        "Boa escolha. Eu aprovo 🐾": "Buena elección. La apruebo 🐾",
        "Hmm, essa combina com você.": "Mmm, esa va contigo.",
        "Ronronando aqui de felicidade.": "Ronroneando aquí de felicidad.",
        "Mandar a Nyx cochilar hoje": "Mandar a Nyx a dormir la siesta hoy",
        "Tá bom, vou cochilar. Até amanhã 😴": "Está bien, voy a dormir la siesta. Hasta mañana 😴",
        "Pensando em {peca}? Combina demais com {par} ✦": "¿Pensando en {peca}? Combina muchísimo con {par} ✦",
        "Voltou! Senti sua falta 🐾": "¡Volviste! Te extrañé 🐾",
        "Miau. Eu sou a Nyx, a gata da loja 🐈‍⬛ Toca em mim que eu dou dicas.": "Miau. Soy Nyx, la gata de la tienda 🐈‍⬛ Tócame y te doy consejos.",
        "✦ Pronto! A Eclipse está na sua tela inicial.": "✦ ¡Listo! Eclipse está en tu pantalla de inicio.",
        "hoje é lua cheia!": "¡hoy es luna llena!",
        "drop na lua cheia amanhã": "drop en la luna llena mañana",
        "drop na lua cheia em": "drop en la luna llena en",
        "Hoje é noite de lua cheia 🌕 Fica de olho no @eclipse_studiocg pra ver o que chegou.":
            "Hoy es noche de luna llena 🌕 Mantente atenta a @eclipse_studiocg para ver lo que llegó.",
        "Hoje:": "Hoy:",
        "A próxima lua cheia é em": "La próxima luna llena es en",
        "fica de olho no @eclipse_studiocg pra ver o que chega.":
            "mantente atenta a @eclipse_studiocg para ver lo que llega.",
        "Faltam": "Faltan",
        "pra lua cheia": "para la luna llena",
        "dias": "días",
        "horas": "horas",
        "minutos": "minutos",
        "dia": "día",
        "hora": "hora",
        "minuto": "minuto",

        /* magia.js: apague as velas e o gato preto */
        "🕯 Mova o dedo (ou o mouse): a luz da vela revela segredos.":
            "🕯 Mueve el dedo (o el mouse): la luz de la vela revela secretos.",
        "Você já tinha achado! O código continua guardado no seu pedido.":
            "¡Ya lo habías encontrado! El código sigue guardado en tu pedido.",
        "Quem acha o gato ganha um código:": "Quien encuentra al gato gana un código:",
        "a Elizabeth manda um mimo surpresa junto com o pedido":
            "Elizabeth manda un detalle sorpresa junto con el pedido",
        "Beleza": "Genial",
        "Pôr o código no meu pedido": "Poner el código en mi pedido",
        "Código": "Código",
        "guardado: ele vai junto no seu pedido.": "guardado: va junto con tu pedido.",

        /* magia.js: tarô do look */
        "A Rosa": "La Rosa",
        "O Morcego": "El Murciélago",
        "A Lua": "La Luna",
        "O Coração": "El Corazón",
        "Delicadeza assombrada, feito retrato antigo: você guarda segredos em renda e escreve cartas que ninguém lê.":
            "Delicadeza embrujada, como un retrato antiguo: guardas secretos en encaje y escribes cartas que nadie lee.",
        "Você é de veludo e de rua. A noite inteira é sua, e a lua já sabe o seu nome.":
            "Eres de terciopelo y de calle. La noche entera es tuya, y la luna ya sabe tu nombre.",
        "Intuição afiada, bola de cristal na bolsa e um gato como conselheiro. Você já sabia que ia tirar essa carta.":
            "Intuición afilada, bola de cristal en el bolso y un gato como consejero. Ya sabías que ibas a sacar esta carta.",
        "Doce por fora, macabra por dentro: você equilibra laço e caveira sem pedir licença.":
            "Dulce por fuera, macabra por dentro: equilibras lazo y calavera sin pedir permiso.",
        "A Camiseta": "La Camiseta",
        "O Perfume": "El Perfume",
        "O Espartilho": "El Corsé",
        "A Saia": "La Falda",
        "O Vestido": "El Vestido",
        "A Blusa": "La Blusa",
        "A Capa": "La Capa",
        "O Casaco": "El Abrigo",
        "O Choker": "El Choker",
        "A Rosa Vermelha": "La Rosa Roja",
        "O Rosário": "El Rosario",
        "O Camafeu": "El Camafeo",
        "A Cruz": "La Cruz",
        "Os Morcegos": "Los Murciélagos",
        "As Cruzes": "Las Cruces",
        "O Olho": "El Ojo",
        "A Bola de Cristal": "La Bola de Cristal",
        "O Caixão": "El Ataúd",
        "Essência": "Esencia",
        "A peça": "La pieza",
        "O feitiço": "El hechizo",
        "As cartas escolheram:": "Las cartas eligieron:",
        "pra vestir, e": "para vestir, y",
        "pra fechar o feitiço.": "para cerrar el hechizo.",
        "Pôr as duas no caldeirão": "Poner las dos en el caldero",
        "Salvar pro story": "Guardar para el story",
        "Ver tudo da vibe": "Ver todo de la vibra",
        "Tirar de novo": "Sacar de nuevo",
        "O look do tarô caiu no caldeirão": "El look del tarot cayó en el caldero",
        "Preparando a imagem…": "Preparando la imagen…",
        "Meu tarô do look": "Mi tarot del look",
        "essência": "esencia",
        "a peça": "la pieza",
        "o feitiço": "el hechizo",
        "✦ tirado numa noite de {fase} ✦": "✦ sacado en una noche de {fase} ✦",
        "tire o seu no link da bio ✦ @eclipse_studiocg": "saca el tuyo en el link de la bio ✦ @eclipse_studiocg",
        "Meu tarô do look · Eclipse Studio": "Mi tarot del look · Eclipse Studio",
        "Não consegui montar a imagem agora. Tente de novo ou tire um print da tiragem.":
            "No pude armar la imagen ahora. Intenta de nuevo o toma una captura de la tirada.",
        "✦ Imagem salva. É só postar no story e marcar @eclipse_studiocg":
            "✦ Imagen guardada. Solo publícala en el story y marca a @eclipse_studiocg",

        /* eclipse-studio/ficha/: formulário de intake pra Elizabeth */
        "Falta pouco pra loja": "Falta poco para que la tienda",
        "abrir as portas": "abra las puertas",
        "Com essas respostas eu troco tudo que ainda é provisório no site: número do WhatsApp, regras de entrega, textos da marca e a vitrine. Responda o que souber. O que ficar em branco a gente conversa depois.": "Con estas respuestas cambio todo lo que todavía es provisorio en el sitio: número de WhatsApp, reglas de entrega, textos de la marca y la vitrina. Responde lo que sepas. Lo que quede en blanco lo conversamos después.",
        "Preencha aqui. Fica salvo neste aparelho enquanto você digita, então dá pra fechar e voltar depois.": "Completa aquí. Queda guardado en este aparato mientras escribes, así que puedes cerrar y volver después.",
        "Quando terminar, toque em": "Cuando termines, toca en",
        "Enviar pelo WhatsApp": "Enviar por WhatsApp",
        ". As fotos das peças você manda depois, na mesma conversa (tem um": ". Las fotos de las piezas las mandas después, en la misma conversación (hay una",
        "guia rapidinho de como fotografar": "guía rapidita de cómo fotografiar",
        ").": ").",
        "Ver como as respostas vão chegar": "Ver cómo van a llegar las respuestas",
        "Nada respondido ainda.": "Nada respondido todavía.",
        "Copiar respostas": "Copiar respuestas",
        "Limpar tudo e recomeçar": "Borrar todo y empezar de nuevo",
        "Suas respostas ficam só neste aparelho. Nada é enviado até você tocar em enviar ou copiar.": "Tus respuestas quedan solo en este aparato. Nada se envía hasta que toques enviar o copiar.",
        "Esta ficha precisa de JavaScript ligado no navegador.": "Esta ficha necesita JavaScript activado en el navegador.",
        "de": "de",
        "respondidas": "respondidas",
        "essencial": "esencial",
        "Copiado! Agora é só colar na conversa.": "¡Copiado! Ahora solo pega en la conversación.",
        "Não deu para copiar. Copie manualmente.": "No se pudo copiar. Copia manualmente.",
        "Apagar tudo o que você preencheu neste aparelho e recomeçar?": "¿Borrar todo lo que completaste en este aparato y empezar de nuevo?",
        "Você e a loja": "Tú y la tienda",
        "O básico pra loja te achar e as clientes te acharem.": "Lo básico para que la tienda te encuentre y las clientas te encuentren.",
        "ex.: Maria": "ej.: María",
        "WhatsApp que vai receber os pedidos (com DDD)": "WhatsApp que va a recibir los pedidos (con código de área)",
        "ex.: (67) 99999-9999": "ej.: (67) 99999-9999",
        "@ do Instagram da loja": "@ de Instagram de la tienda",
        "ex.: @eclipse.studio": "ej.: @eclipse.studio",
        "De qual cidade você envia": "Desde qué ciudad envías",
        "A frase do topo, “Doce por fora, bruxa por dentro”": "La frase de arriba, “Doce por fora, bruxa por dentro”",
        "Pode manter": "Se puede mantener",
        "Quero outra (escrevo no fim)": "Quiero otra (la escribo al final)",
        "Tudo é combinado no WhatsApp; o site só avisa como funciona.": "Todo se acuerda por WhatsApp; el sitio solo avisa cómo funciona.",
        "Formas de pagamento que você aceita": "Formas de pago que aceptas",
        "Pix": "Pix",
        "Cartão de crédito (link de pagamento)": "Tarjeta de crédito (link de pago)",
        "Cartão de débito": "Tarjeta de débito",
        "Dinheiro na retirada": "Efectivo al retirar",
        "Boleto": "Boleto",
        "Dá desconto no Pix? Quanto?": "¿Da descuento por Pix? ¿Cuánto?",
        "ex.: 5%, ou não dou desconto": "ej.: 5%, o no doy descuento",
        "Parcela no cartão? Em quantas vezes sem juros?": "¿Hay cuotas con tarjeta? ¿En cuántas veces sin interés?",
        "ex.: até 3x sem juros": "ej.: hasta 3 cuotas sin interés",
        "Entrega e trocas": "Entrega y cambios",
        "O que vai aparecer nas “Dúvidas frequentes” e na faixa do topo.": "Lo que va a aparecer en “Preguntas frecuentes” y en la franja de arriba.",
        "Como a peça chega na cliente": "Cómo llega la pieza a la clienta",
        "Correios pra todo o Brasil": "Correo para todo Brasil",
        "Entrega na minha cidade": "Entrega en mi ciudad",
        "Aplicativo de entrega (Uber, 99…)": "Aplicación de entrega (Uber, 99…)",
        "Em quantos dias você posta depois do pagamento": "En cuántos días despachas después del pago",
        "ex.: até 3 dias úteis": "ej.: hasta 3 días hábiles",
        "Tem frete grátis a partir de algum valor?": "¿Hay envío gratis a partir de algún valor?",
        "ex.: acima de R$ 250, ou não tem": "ej.: por encima de R$ 250, o no hay",
        "Como funcionam as trocas": "Cómo funcionan los cambios",
        "Prazo, se precisa estar com etiqueta, quem paga o frete da troca.": "Plazo, si tiene que estar con etiqueta, quién paga el envío del cambio.",
        "Embrulho de presente": "Envoltorio de regalo",
        "Grátis": "Gratis",
        "Cobrado à parte": "Se cobra aparte",
        "Não faço": "No hago",
        "As peças": "Las piezas",
        "As fotos você manda depois pelo WhatsApp. Aqui é só pra eu montar a vitrine.": "Las fotos las mandas después por WhatsApp. Aquí es solo para que yo arme la vitrina.",
        "Quantas peças no lançamento, mais ou menos": "Cuántas piezas en el lanzamiento, más o menos",
        "O que você vende": "Qué vendes",
        "Meias": "Medias",
        "Chapéus e tiaras": "Sombreros y diademas",
        "Maquiagem": "Maquillaje",
        "Decoração": "Decoración",
        "As peças são": "Las piezas son",
        "Feitas por mim": "Hechas por mí",
        "Customizadas por mim": "Personalizadas por mí",
        "Revenda": "Reventa",
        "Brechó / vintage": "Segunda mano / vintage",
        "Tabela de medidas": "Tabla de medidas",
        "Pode usar a do site": "Se puede usar la del sitio",
        "Tenho a minha (mando depois)": "Tengo la mía (la mando después)",
        "Cada peça tem a sua medida": "Cada pieza tiene su propia medida",
        "Quase tudo é tamanho único": "Casi todo es talla única",
        "Faz sob encomenda (outra cor, outro tamanho)?": "¿Haces por encargo (otro color, otra talla)?",
        "Sim": "Sí",
        "Só algumas peças": "Solo algunas piezas",
        "Não": "No",
        "Fotos das peças": "Fotos de las piezas",
        "Já tenho fotos boas": "Ya tengo fotos buenas",
        "Vou tirar no celular": "Las voy a tomar con el celular",
        "Preciso de dicas pra fotografar": "Necesito consejos para fotografiar",
        "Lista das peças (se já tiver)": "Lista de las piezas (si ya la tienes)",
        "Uma por linha: nome — preço — tamanhos. Pode ser rascunho.": "Una por línea: nombre — precio — tallas. Puede ser un borrador.",
        "ex.: Espartilho rosa — 189,90 — P, M, G": "ej.: Corsé rosa — 189,90 — S, M, L",
        "Pra seção “A marca” soar como você, e não como eu.": "Para que la sección “La marca” suene como tú, y no como yo.",
        "Como a Eclipse Studio começou": "Cómo empezó Eclipse Studio",
        "Pode contar do seu jeito, eu ajeito o texto.": "Puedes contarlo a tu manera, yo ajusto el texto.",
        "Pra quem você faz as peças": "Para quién haces las piezas",
        "ex.: meninas do alt, quem ama Halloween o ano inteiro…": "ej.: chicas del estilo alt, quien ama Halloween todo el año…",
        "O que achou da prévia do site": "Qué te pareció la vista previa del sitio",
        "O que amou, o que mudaria, o que falta.": "Qué amaste, qué cambiarías, qué falta.",
        "Novidades da loja": "Novedades de la tienda",
        "Coisas novas que entraram no site. Responda o que souber; o resto a gente combina.": "Cosas nuevas que entraron en el sitio. Responde lo que sepas; el resto lo acordamos.",
        "Taxa de entrega por região de Campo Grande": "Tarifa de entrega por región de Campo Grande",
        "Quanto cobra pra cada região (ou um valor só pra cidade toda). Acima do frete grátis, sai de graça.": "Cuánto cobras por cada región (o un valor único para toda la ciudad). Por encima del envío gratis, sale gratis.",
        "ex.: Centro R$ 8 · Prosa, Segredo e Bandeira R$ 12 · Lagoa e Imbirussu R$ 14 · Anhanduizinho R$ 15": "ej.: Centro R$ 8 · Prosa, Segredo y Bandeira R$ 12 · Lagoa e Imbirussu R$ 14 · Anhanduizinho R$ 15",
        "Quais peças são únicas (brechó, só tem uma)?": "¿Qué piezas son únicas (de segunda mano, solo hay una)?",
        "Essas ganham o selo dourado de “peça única” e só dá pra pôr 1 na sacola.": "Esas ganan el sello dorado de “pieza única” y solo se puede poner 1 en la bolsa.",
        "ex.: casaco de pelúcia, blusa vitoriana creme": "ej.: abrigo de peluche, blusa victoriana crema",
        "Tem prints de clientes elogiando ou usando as peças?": "¿Tienes capturas de clientas elogiando o usando las piezas?",
        "Aparecem na seção “Quem já é da coven”. Só com autorização da cliente.": "Aparecen en la sección “Quién ya es del aquelarre”. Solo con autorización de la clienta.",
        "Tenho, mando no WhatsApp": "Tengo, las mando por WhatsApp",
        "Ainda não, vou pedir pras clientes": "Todavía no, voy a pedirle a las clientas",
        "Prefiro não mostrar": "Prefiero no mostrar",
        "Lista do próximo drop (lua cheia)": "Lista del próximo drop (luna llena)",
        "No site tem o botão “Me avisa no próximo drop”: a cliente te manda mensagem e você adiciona ela na lista.": "En el sitio hay un botón “Avísame en el próximo drop”: la clienta te manda un mensaje y tú la agregas a la lista.",
        "Já tenho lista de transmissão no WhatsApp": "Ya tengo lista de difusión en WhatsApp",
        "Vou criar uma": "Voy a crear una",
        "Prefiro avisar só pelo Instagram": "Prefiero avisar solo por Instagram",
        "Caixa misteriosa (3 peças surpresa de uma vibe): quanto cobraria?": "Caja misteriosa (3 piezas sorpresa de una vibra): ¿cuánto cobrarías?",
        "ex.: R$ 99, ou não quero fazer caixa": "ej.: R$ 99, o no quiero hacer caja",
        "Prêmio de quem acha o gato preto ou junta as 4 cartas de arcano": "Premio de quien encuentra al gato negro o junta las 4 cartas de arcano",
        "ex.: um adesivo de mimo, 10% off, frete grátis…": "ej.: una calcomanía de regalo, 10% off, envío gratis…",
        "Mais alguma coisa?": "¿Algo más?",
        "Recados, dúvidas ou a frase nova do topo": "Mensajes, dudas o la frase nueva de arriba",
        "1. Você e a loja": "1. Tú y la tienda",
        "2. Pagamento": "2. Pago",
        "3. Entrega e trocas": "3. Entrega y cambios",
        "4. As peças": "4. Las piezas",
        "5. A marca": "5. La marca",
        "6. Novidades da loja": "6. Novedades de la tienda",
        "7. Mais alguma coisa?": "7. ¿Algo más?",

        /* eclipse-studio/fotos/: guia de fotos pra Elizabeth */
        "Eclipse Studio · só pra você": "Eclipse Studio · solo para ti",
        "Guia de fotos": "Guía de fotos",
        "das peças": "de las piezas",
        "Foto boa vende mais que qualquer texto. Dá pra fazer tudo com o celular, em casa, em uns 2 minutos por peça. O segredo é fazer": "Una buena foto vende más que cualquier texto. Se puede hacer todo con el celular, en casa, en unos 2 minutos por pieza. El secreto es hacer",
        "todas do mesmo jeito": "todas de la misma manera",
        ": aí a vitrine fica com cara de loja.": ": así la vitrina queda con cara de tienda.",
        "Monte o cantinho uma vez só": "Arma el rincón una sola vez",
        "Luz de janela, de dia.": "Luz de ventana, de día.",
        "Perto da janela, sem sol batendo direto. Nada de flash nem de luz amarela do teto.": "Cerca de la ventana, sin sol directo. Nada de flash ni de luz amarilla del techo.",
        "Fundo liso e sempre o mesmo:": "Fondo liso y siempre el mismo:",
        "um lençol ou tecido lilás claro, creme ou preto, preso na parede. Escolha um e use em todas.": "una sábana o tela lila claro, crema o negra, pegada en la pared. Elige una y úsala en todas.",
        "Limpe a lente": "Limpia el lente",
        "do celular na camiseta antes de começar. Parece bobo, mas é o que mais deixa a foto nítida.": "del celular en la camiseta antes de empezar. Parece tontería, pero es lo que más deja la foto nítida.",
        "Três fotos por peça": "Tres fotos por pieza",
        "Frente": "Frente",
        "no cabide ou estendida no fundo": "en el gancho o extendida en el fondo",
        "Vestida": "Puesta",
        "em você, numa amiga ou no manequim": "en ti, en una amiga o en el maniquí",
        "Detalhe": "Detalle",
        "renda, fecho, estampa ou etiqueta": "encaje, cierre, estampado o etiqueta",
        "A 1ª aparece na vitrine; a 2ª aparece quando a cliente passa o mouse e na janela da peça, onde dá pra arrastar e ver as três.": "La 1ª aparece en la vitrina; la 2ª aparece cuando la clienta pasa el mouse y en la ventana de la pieza, donde se puede arrastrar y ver las tres.",
        "Joias e bijuterias: uma em cima do tecido, uma no pescoço ou na orelha (bem de perto) e uma na mão, pra dar noção de tamanho.": "Joyas y bijouterie: una encima de la tela, una en el cuello o en la oreja (bien de cerca) y una en la mano, para dar noción de tamaño.",
        "Enquadramento": "Encuadre",
        "Foto quadrada": "Foto cuadrada",
        "(na câmera, escolha 1:1). A peça no meio, ocupando quase tudo, com um respiro em volta.": "(en la cámara, elige 1:1). La pieza en el medio, ocupando casi todo, con un respiro alrededor.",
        "Celular na altura da peça": "Celular a la altura de la pieza",
        ", reto. De cima pra baixo a peça fica torta e menor.": ", derecho. De arriba hacia abajo la pieza queda torcida y más pequeña.",
        "Peça passada e sem fiapo.": "Pieza planchada y sin pelusa.",
        "Um rolinho tira-pelo resolve muito, principalmente em peça preta.": "Un rodillo quitapelusa resuelve mucho, sobre todo en piezas negras.",
        "✓ Assim": "✓ Así",
        "fundo liso, luz de janela, peça inteira e reta, a mesma distância em todas.": "fondo liso, luz de ventana, pieza entera y derecha, la misma distancia en todas.",
        "✕ Evite": "✕ Evita",
        "cama bagunçada atrás, flash, filtro forte, foto escura ou cortando a peça.": "cama desordenada atrás, flash, filtro fuerte, foto oscura o cortando la pieza.",
        "Junto com as fotos, me manda": "Junto con las fotos, mándame",
        "Nome da peça": "Nombre de la pieza",
        "e": "y",
        "preço": "precio",
        "(ou se é \"sob consulta\").": "(o si es \"a consultar\").",
        "(ou \"tamanho único\") e, se der, as": "(o \"talla única\") y, si puedes, las",
        "medidas": "medidas",
        ": busto, cintura e comprimento.": ": busto, cintura y largo.",
        "De onde veio:": "De dónde salió:",
        "feita à mão, revenda ou achado de brechó. Se for": "hecha a mano, reventa o hallazgo de segunda mano. Si es",
        ", avisa: ela ganha o selo dourado de \"peça única\" na vitrine.": ", avísame: gana el sello dorado de \"pieza única\" en la vitrina.",
        "Uma frase sobre ela, do seu jeito: com o que combina, pra que ocasião.": "Una frase sobre ella, a tu manera: con qué combina, para qué ocasión.",
        "Como me mandar": "Cómo mandarlas",
        "No WhatsApp, mande como": "Por WhatsApp, mándala como",
        "documento": "documento",
        "(clipe → Documento), assim a foto não perde qualidade.": "(clip → Documento), así la foto no pierde calidad.",
        "Ou numa pasta do Google Drive, uma pasta por peça.": "O en una carpeta de Google Drive, una carpeta por pieza.",
        "Se puder, nomeie assim:": "Si puedes, nómbralas así:",
        "Checklist antes de fotografar": "Checklist antes de fotografiar",
        "Fundo liso montado perto da janela": "Fondo liso armado cerca de la ventana",
        "Lente limpa e câmera no quadrado (1:1)": "Lente limpio y cámara en cuadrado (1:1)",
        "Peças passadas e sem fiapo": "Piezas planchadas y sin pelusa",
        "3 fotos de cada: frente, vestida e detalhe": "3 fotos de cada: frente, puesta y detalle",
        "Nome, preço, tamanho e origem anotados": "Nombre, precio, talla y origen anotados",
        "Avisar o Samuel que as fotos estão prontas": "Avisarle a Samuel que las fotos están listas",

        /* eclipse-studio/kit/: kit do Instagram */
        "Kit pro": "Kit para",
        "Instagram": "Instagram",
        "Imagens prontas no visual da loja, com uma sugestão de legenda pra copiar. Baixe no celular e poste no @eclipse_studiocg.": "Imágenes listas con el estilo de la tienda, con una sugerencia de leyenda para copiar. Descarga en el celular y publica en @eclipse_studiocg.",
        "A camiseta e o perfume aparecem como ilustração. Quando chegarem as fotos das peças, estes cards são refeitos com as fotos de verdade.": "La camiseta y el perfume aparecen como ilustración. Cuando lleguen las fotos de las piezas, estas tarjetas se rehacen con las fotos reales.",
        "Lançamento": "Lanzamiento",
        "Story: a loja chegou": "Story: la tienda llegó",
        "Baixar": "Descargar",
        "Post de lançamento": "Post de lanzamiento",
        "Copiar legenda": "Copiar leyenda",
        "Post: qual é a sua vibe?": "Post: ¿cuál es tu vibra?",
        "Peças": "Piezas",
        "Cartão com QR pra mandar junto do pedido": "Tarjeta con QR para mandar junto con el pedido",
        "Folha A4 com 10 cartões de 85 × 55 mm. Imprima em papel mais grosso e corte na linha tracejada.": "Hoja A4 con 10 tarjetas de 85 × 55 mm. Imprime en papel más grueso y corta en la línea punteada.",
        "PDF versão escura": "PDF versión oscura",
        "PDF versão clara (menos tinta)": "PDF versión clara (menos tinta)",
        "Ver e imprimir": "Ver e imprimir",
        "Legenda copiada ✦": "¡Leyenda copiada! ✦",
        "Não deu pra copiar: segure o dedo no texto e copie.": "No se pudo copiar: mantén el dedo en el texto y copia.",

        /* eclipse-studio/cartao/: cartão de visita pra imprimir */
        "Folha A4 com 10 cartões de 85 × 55 mm (tamanho de cartão de visita). Imprima em papel mais grosso e corte na linha tracejada. O QR abre a loja.": "Hoja A4 con 10 tarjetas de 85 × 55 mm (tamaño de tarjeta de presentación). Imprime en papel más grueso y corta en la línea punteada. El QR abre la tienda.",
        "Imprimir": "Imprimir",
        "Versão clara (gasta menos tinta)": "Versión clara (gasta menos tinta)",
        "Versão escura": "Versión oscura",
    };

    /* Páginas e áreas com texto montado por JavaScript em tempo de execução (vitrine de sites,
       comparador sem-site/com-site, assistente de orçamento) não entram nesta tradução ainda —
       eles continuam em português até uma próxima etapa. */
    var SELETORES_IGNORADOS = [
        ".hero-vitrine", ".cmp-tipos", ".cmp-abas", ".cmp-palco", ".cmp-metricas", ".cmp-rodape",
        "#orcamentoApp", "#ghDesenho", "#ghTotal", ".hero-texto", ".contato-relogio",
        "#trabalhandoAgora", "script", "style", "noscript",
        ".legenda", /* kit do Instagram: legendas são conteúdo pra copiar e postar em pt-BR, não interface */
        ".cartao" /* cartão de visita pra imprimir: o texto impresso tem que continuar em pt-BR sempre */
    ];

    /* O texto do hero tem efeito de digitação (script.js) que já usa o idioma detectado cedo
       no <head>; aqui só garantimos que uma troca manual de idioma (clique no botão) também
       atualize ele, sem precisar repetir a animação. */
    var TEXTO_HERO_PT = "Site e sistema sob medida pro seu negócio: aparece no Google, responde no WhatsApp sozinho e funciona no celular.";
    var TEXTO_HERO_ES = "Sitio y sistema a medida para tu negocio: aparece en Google, responde en WhatsApp solo y funciona en el celular.";

    function normalizar(txt) {
        return txt.replace(/ /g, " ").replace(/\s+/g, " ").trim();
    }

    function dentroDeIgnorado(no) {
        var el = no.nodeType === 1 ? no : no.parentElement;
        while (el) {
            for (var i = 0; i < SELETORES_IGNORADOS.length; i++) {
                if (el.matches && el.matches(SELETORES_IGNORADOS[i])) return true;
            }
            el = el.parentElement;
        }
        return false;
    }

    var listaTextos = [];   // { no, original }
    var listaAtributos = []; // { el, atributo, original }
    var ATRIBUTOS_TRADUZIVEIS = ["aria-label", "title", "placeholder"];

    /* Guarda o texto original (português) de cada nó que tem tradução. Pode ser chamada de novo pra
       um pedaço novo da página: o que já está guardado não entra duas vezes. Devolve só o que é novo. */
    var conhecidos = new WeakSet();       // nós de texto já guardados
    var atributosConhecidos = new WeakMap(); // elemento -> atributos já guardados
    function montarListas(raiz) {
        raiz = raiz || document.body;
        var novos = { textos: [], atributos: [] };
        if (raiz.nodeType === 3) {
            guardarTexto(raiz, novos);
        } else if (raiz.nodeType === 1) {
            var walker = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, null);
            var no;
            while ((no = walker.nextNode())) guardarTexto(no, novos);
            var elementos = Array.prototype.slice.call(raiz.querySelectorAll("[aria-label], [title], [placeholder]"));
            if (raiz.matches && raiz.matches("[aria-label], [title], [placeholder]")) elementos.push(raiz);
            elementos.forEach(function (el) {
                ATRIBUTOS_TRADUZIVEIS.forEach(function (atributo) {
                    var valor = el.getAttribute(atributo);
                    if (!valor || !DICIONARIO[normalizar(valor)]) return;
                    var ja = atributosConhecidos.get(el);
                    if (ja && ja[atributo]) return;
                    if (dentroDeIgnorado(el)) return;
                    if (!ja) { ja = {}; atributosConhecidos.set(el, ja); }
                    ja[atributo] = true;
                    var item = { el: el, atributo: atributo, original: valor };
                    listaAtributos.push(item);
                    novos.atributos.push(item);
                });
            });
        }
        return novos;
    }
    function guardarTexto(no, novos) {
        if (conhecidos.has(no) || !no.nodeValue || !no.nodeValue.trim()) return;
        if (!DICIONARIO[normalizar(no.nodeValue)]) return; // primeiro o dicionário (barato), depois a subida na árvore
        if (dentroDeIgnorado(no)) return;
        conhecidos.add(no);
        var item = { no: no, original: no.nodeValue };
        listaTextos.push(item);
        novos.textos.push(item);
    }

    /* Função global pra scripts de páginas de projeto traduzirem texto que eles mesmos geram em
       tempo real (um rótulo de botão que muda de estado, uma mensagem de toast). Esses textos não
       passam pelo TreeWalker (são escritos depois, por código da própria página), então eles pedem
       a tradução na hora, direto: window.traduzir("texto em português"). */
    window.traduzir = function (textoPt) {
        var chave = normalizar(textoPt);
        return document.documentElement.lang === "es" && DICIONARIO[chave] ? DICIONARIO[chave] : textoPt;
    };

    /* O idioma é decidido aqui, de cara, assim que este arquivo carrega — não espera o <body>
       existir. Isso importa pras páginas de projeto que têm script inline chamando
       window.traduzir() logo na primeira linha: se esse script carregar antes do idioma.js
       nunca saber de nada, ele sempre pegaria "pt". A passada completa (traduzir o texto já
       escrito na página) é que precisa esperar o body — essa fica em iniciar(), mais abaixo. */
    (function definirIdiomaCedo() {
        var idioma = "pt";
        try {
            var salvo = localStorage.getItem(CHAVE);
            if (salvo === "es" || salvo === "pt") idioma = salvo;
            else if ((navigator.language || "").toLowerCase().indexOf("es") === 0) idioma = "es";
        } catch (e) { /* sem armazenamento */ }
        document.documentElement.lang = idioma === "es" ? "es" : "pt-BR";
        document.documentElement.dataset.idioma = idioma;
    })();

    /* Em português (o caso comum) a página já está no idioma certo e não precisa varrer nada na
       abertura. As listas são montadas quando o espanhol entra (na abertura ou no botão): nessa hora o
       texto ainda está em português, então o original guardado é o certo. */
    function traduzirItens(novos, idioma) {
        novos.textos.forEach(function (item) {
            var chave = normalizar(item.original);
            if (idioma === "es" && DICIONARIO[chave]) {
                var antes = item.original.match(/^\s*/)[0];
                var depois = item.original.match(/\s*$/)[0];
                item.no.nodeValue = antes + DICIONARIO[chave] + depois;
            } else {
                item.no.nodeValue = item.original;
            }
        });
        novos.atributos.forEach(function (item) {
            var chave = normalizar(item.original || "");
            if (idioma === "es" && DICIONARIO[chave]) item.el.setAttribute(item.atributo, DICIONARIO[chave]);
            else item.el.setAttribute(item.atributo, item.original);
        });
    }

    /* Conteúdo que entra depois (scripts carregados mais tarde, telas montadas por JavaScript): enquanto
       estiver em espanhol, cada pedaço novo da página é traduzido assim que aparece. Só olha nós
       adicionados (não mudanças de texto), então a própria tradução não dispara outra volta. */
    var observador = null, pendentes = [], agendado = false;
    function vigiar(ligar) {
        if (!("MutationObserver" in window)) return;
        if (!ligar) { if (observador) observador.disconnect(); pendentes = []; return; }
        if (!observador) observador = new MutationObserver(function (registros) {
            registros.forEach(function (r) { for (var i = 0; i < r.addedNodes.length; i++) pendentes.push(r.addedNodes[i]); });
            if (agendado) return;
            agendado = true;
            setTimeout(function () {
                agendado = false;
                var lote = pendentes; pendentes = [];
                if (document.documentElement.lang !== "es") return;
                lote.forEach(function (no) { if (no.isConnected) traduzirItens(montarListas(no), "es"); });
            }, 30);
        });
        observador.observe(document.body, { childList: true, subtree: true });
    }

    function aplicar(idioma) {
        if (idioma === "es") montarListas(document.body);
        traduzirItens({ textos: listaTextos, atributos: listaAtributos }, idioma);
        vigiar(idioma === "es");
        var heroTexto = document.getElementById("heroTextoDigitado");
        if (heroTexto) heroTexto.textContent = idioma === "es" ? TEXTO_HERO_ES : TEXTO_HERO_PT;
        document.documentElement.dataset.idioma = idioma;
        document.documentElement.lang = idioma === "es" ? "es" : "pt-BR";
        var tituloEl = document.getElementById("tituloPagina");
        if (tituloEl) document.title = idioma === "es"
            ? "Samuel Mickael | Desarrollador Web y Móvil"
            : "Samuel Mickael | Desenvolvedor Web & Mobile";
        var botao = document.getElementById("botaoIdioma");
        if (botao) {
            botao.textContent = idioma === "es" ? "PT" : "ES";
            botao.setAttribute("aria-label", idioma === "es" ? "Cambiar a portugués" : "Mudar para espanhol");
            botao.title = botao.getAttribute("aria-label");
        }
        try { localStorage.setItem(CHAVE, idioma); } catch (e) { /* sem armazenamento */ }
        /* Avisa scripts da própria página (como um chat que precisa reiniciar a conversa no
           idioma novo) que o idioma mudou, pra eles reagirem como acharem melhor. */
        document.dispatchEvent(new CustomEvent("idiomaMudou", { detail: { idioma: idioma } }));
    }

    function idiomaInicial() {
        try {
            var salvo = localStorage.getItem(CHAVE);
            if (salvo === "es" || salvo === "pt") return salvo;
        } catch (e) { /* sem armazenamento */ }
        return (navigator.language || "").toLowerCase().indexOf("es") === 0 ? "es" : "pt";
    }

    function criarBotao(idioma) {
        var botao = document.createElement("button");
        botao.type = "button";
        botao.id = "botaoIdioma";
        botao.textContent = idioma === "es" ? "PT" : "ES";
        botao.addEventListener("click", function () {
            aplicar(document.documentElement.lang === "es" ? "pt" : "es");
        });
        return botao;
    }

    /* Nas páginas sem o estilo do portfólio principal (currículo, páginas de projeto), o botão
       ganha um estilo mínimo próprio em vez de depender da classe .botao-som do site. */
    /* Mesma cara do botão de idioma da home (fundo carvão, borda e destaque vermelho-neon #ff2a3d),
       pra ficar reconhecível em qualquer página do site, mesmo nas que não usam a paleta do portfólio. */
    function estiloProprio() {
        var s = document.createElement("style");
        s.textContent = "#botaoIdioma{display:inline-flex;align-items:center;justify-content:center;min-width:36px;height:34px;padding:0 9px;border:1px solid rgba(255,255,255,.14);border-radius:8px;background:rgba(22,22,22,.72);color:rgba(255,255,255,.86);font:600 .72rem 'DM Mono',monospace;letter-spacing:.04em;cursor:pointer;transition:border-color .25s ease,color .25s ease,background .25s ease}"
            + "#botaoIdioma:hover{border-color:#ff2a3d;color:#ff2a3d}"
            + "#botaoIdioma:focus-visible{outline:2px solid #ff2a3d;outline-offset:2px}";
        document.head.appendChild(s);
    }

    function iniciar() {
        var idioma = idiomaInicial();
        aplicar(idioma);

        var nav = document.querySelector(".nav");
        if (nav) {
            var botao = criarBotao(idioma);
            botao.className = "botao-som botao-idioma";
            var botaoTema = document.getElementById("botaoTema");
            if (botaoTema) nav.insertBefore(botao, botaoTema);
            else nav.appendChild(botao);
            return;
        }
        var acoes = document.querySelector(".acoes");
        if (acoes) {
            estiloProprio();
            var botao2 = criarBotao(idioma);
            acoes.insertBefore(botao2, acoes.firstChild);
            return;
        }
        /* Páginas de projeto: cada uma tem seu próprio cabeçalho, então o botão entra no
           <header> da página (perto do botão de tema, se houver um), com a mesma cara do botão
           da home. Em headers com um wrapper interno (.miolo etc.), gruda antes do primeiro botão
           de verdade em vez de cair fora da fileira de ações — senão fica flutuando torto. */
        var header = document.querySelector("header, nav");
        if (header) {
            estiloProprio();
            var botao3 = criarBotao(idioma);
            var botaoTemaProjeto = header.querySelector('[id*="tema" i], [class*="tema" i]');
            if (botaoTemaProjeto) {
                botaoTemaProjeto.insertAdjacentElement("beforebegin", botao3);
            } else {
                /* acha a fileira de verdade (o wrapper interno da logo, tipo .miolo.topo-in),
                   não o <header> por fora — senão o botão cai fora da fileira de ações e fica torto */
                var logoEl = header.querySelector("a.logo, .logo, .marca, header > b, header b");
                var linha = (logoEl && logoEl.parentElement) || header;
                var primeiroBotao = linha.querySelector("button");
                if (primeiroBotao) primeiroBotao.insertAdjacentElement("beforebegin", botao3);
                else linha.appendChild(botao3);
            }
            return;
        }
        /* Último recurso: nenhum cabeçalho reconhecível na página, então o botão flutua
           fixo num canto, sempre visível. */
        estiloProprio();
        var botaoFlutuante = criarBotao(idioma);
        botaoFlutuante.style.cssText = "position:fixed;top:12px;right:12px;z-index:9999";
        document.body.appendChild(botaoFlutuante);
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
    else iniciar();
})();
