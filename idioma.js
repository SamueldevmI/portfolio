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
        "Sobre mim ": "Sobre mí",
        "onde tudo começou": "donde todo empezó",
        "Meu primeiro projeto usando HTML e CSS.": "Mi primer proyecto usando HTML y CSS.",
        "Crio sites, sistemas e aplicativos sob medida, com foco em Python, Flask e JavaScript — do primeiro rascunho até o projeto no ar. Você pode testar cada um deles abaixo, na hora, sem precisar instalar nada.":
            "Creo sitios, sistemas y aplicaciones a medida, con foco en Python, Flask y JavaScript — desde el primer boceto hasta el proyecto en línea. Puedes probar cada uno abajo, al instante, sin instalar nada.",
        "Tenho 22 anos e sigo estudando Análise e Desenvolvimento de Sistemas, mas aprendo mesmo é resolvendo problema real. Confira os projetos e a minha jornada até aqui.":
            "Tengo 22 años y sigo estudiando Análisis y Desarrollo de Sistemas, pero aprendo de verdad resolviendo problemas reales. Mira los proyectos y mi trayectoria hasta aquí.",
        "ATIVIDADE NO GITHUB": "ACTIVIDAD EN GITHUB",

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
        "App que instala no celular ": "App que se instala en el celular",
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
        "Quero meu orçamento ": "Quiero mi presupuesto",
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
        "Nexus Studio · Projeto de demonstração por Samuel Mickael.": "Nexus Studio · Proyecto de demostración por Samuel Mickael."
    };

    /* Páginas e áreas com texto montado por JavaScript em tempo de execução (vitrine de sites,
       comparador sem-site/com-site, assistente de orçamento) não entram nesta tradução ainda —
       eles continuam em português até uma próxima etapa. */
    var SELETORES_IGNORADOS = [
        ".hero-vitrine", ".cmp-tipos", ".cmp-abas", ".cmp-palco", ".cmp-metricas", ".cmp-rodape",
        "#orcamentoApp", "#ghDesenho", "#ghTotal", ".hero-texto", ".contato-relogio",
        "#trabalhandoAgora", "script", "style", "noscript"
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

    function montarListas() {
        var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
        var no;
        while ((no = walker.nextNode())) {
            if (!no.nodeValue || !no.nodeValue.trim()) continue;
            if (dentroDeIgnorado(no)) continue;
            var chave = normalizar(no.nodeValue);
            if (DICIONARIO[chave]) listaTextos.push({ no: no, original: no.nodeValue });
        }
        ATRIBUTOS_TRADUZIVEIS.forEach(function (atributo) {
            document.querySelectorAll("[" + atributo + "]").forEach(function (el) {
                if (dentroDeIgnorado(el)) return;
                var valor = el.getAttribute(atributo);
                var chave = normalizar(valor || "");
                if (DICIONARIO[chave]) listaAtributos.push({ el: el, atributo: atributo, original: valor });
            });
        });
    }

    /* Função global pra scripts de páginas de projeto traduzirem texto que eles mesmos geram em
       tempo real (um rótulo de botão que muda de estado, uma mensagem de toast). Esses textos não
       passam pelo TreeWalker (são escritos depois, por código da própria página), então eles pedem
       a tradução na hora, direto: window.traduzir("texto em português"). */
    window.traduzir = function (textoPt) {
        var chave = normalizar(textoPt);
        return document.documentElement.lang === "es" && DICIONARIO[chave] ? DICIONARIO[chave] : textoPt;
    };

    function aplicar(idioma) {
        listaTextos.forEach(function (item) {
            var chave = normalizar(item.original);
            if (idioma === "es" && DICIONARIO[chave]) {
                var antes = item.original.match(/^\s*/)[0];
                var depois = item.original.match(/\s*$/)[0];
                item.no.nodeValue = antes + DICIONARIO[chave] + depois;
            } else {
                item.no.nodeValue = item.original;
            }
        });
        listaAtributos.forEach(function (item) {
            var chave = normalizar(item.original || "");
            if (idioma === "es" && DICIONARIO[chave]) item.el.setAttribute(item.atributo, DICIONARIO[chave]);
            else item.el.setAttribute(item.atributo, item.original);
        });
        var heroTexto = document.querySelector(".hero-texto");
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
    function estiloProprio() {
        var s = document.createElement("style");
        s.textContent = "#botaoIdioma{display:inline-flex;align-items:center;justify-content:center;min-width:36px;height:34px;padding:0 10px;border:1px solid rgba(0,0,0,.15);border-radius:8px;background:rgba(0,0,0,.04);color:inherit;font:600 .72rem 'DM Mono',monospace;letter-spacing:.04em;cursor:pointer}";
        document.head.appendChild(s);
    }

    function iniciar() {
        montarListas();
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
           <header> da página (perto do botão de tema, se houver um) com estilo mínimo próprio. */
        var header = document.querySelector("header");
        if (header) {
            estiloProprio();
            var botao3 = criarBotao(idioma);
            var botaoTemaProjeto = header.querySelector('[id*="tema" i], [class*="tema" i]');
            if (botaoTemaProjeto) botaoTemaProjeto.insertAdjacentElement("beforebegin", botao3);
            else header.appendChild(botao3);
        }
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
    else iniciar();
})();
