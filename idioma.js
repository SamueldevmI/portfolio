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
            "Capa de terciopelo, collar bola de cristal y arete murcielaguito."
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
        var header = document.querySelector("header, nav");
        if (header) {
            estiloProprio();
            var botao3 = criarBotao(idioma);
            var botaoTemaProjeto = header.querySelector('[id*="tema" i], [class*="tema" i]');
            if (botaoTemaProjeto) botaoTemaProjeto.insertAdjacentElement("beforebegin", botao3);
            else header.appendChild(botao3);
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
