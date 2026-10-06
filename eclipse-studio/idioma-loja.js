"use strict";
/* Português / Espanhol da Eclipse Studio: botão PT | ES no topo, sem recarregar a página.
   Como a loja monta quase tudo por JavaScript (vitrine, sacola, avisos, magias), este arquivo
   observa a página: todo texto que aparece e está no dicionário (ou casa com uma das regras com
   número) é traduzido na hora, e o original fica guardado pra voltar pro português.
   Os NOMES das peças ficam em português de propósito: são os nomes que a Elizabeth usa, e o pedido
   no WhatsApp precisa bater com o estoque dela. No pedido vai também a linha "🇪🇸 Cliente fala espanhol".
   Ainda em português: as previsões do horóscopo, a leitura do tarô e as dicas da Nyx (texto sorteado). */
(function () {
    const CHAVE = "portfolio-idioma"; // a mesma do portfólio: quem escolheu espanhol lá já chega em espanhol aqui

    const DIC = {
        /* topo, faixa e menu */
        "Pular para as peças": "Saltar a las piezas",
        "toque pra entrar": "toca para entrar",
        "Frete grátis acima de R$ 150": "Envío gratis sobre R$ 150",
        "Até 12x sem juros no cartão": "Hasta 12 cuotas sin interés con tarjeta",
        "Entrega em Campo Grande": "Entrega en Campo Grande",
        "Prévia": "Vista previa",
        "peças e preços provisórios": "piezas y precios provisorios",
        "Coleção": "Colección",
        "Magias": "Magias",
        "A marca": "La marca",
        "Dúvidas": "Preguntas",
        "Sacola": "Bolsa",
        "Eclipse Studio, início": "Eclipse Studio, inicio",
        "Principal": "Principal",
        "Ligar o clima: chuva e lareira": "Activar el clima: lluvia y chimenea",
        "Abrir sacola, vazia": "Abrir la bolsa, vacía",
        /* hero */
        "Moda alt · Campo Grande - MS": "Moda alt · Campo Grande - MS",
        "Doce por fora,": "Dulce por fuera,",
        "bruxa por dentro": "bruja por dentro",
        "Roupas, bijuterias, bolsas e perfumes pro seu estilo alt de todo dia: peças feitas à mão, garimpadas em brechó e escolhidas a dedo. Monte a sacola e feche o pedido direto no WhatsApp.":
            "Ropa, bisutería, carteras y perfumes para tu estilo alt de todos los días: piezas hechas a mano, rescatadas de tiendas de segunda mano y elegidas una por una. Arma tu bolsa y cierra el pedido directo por WhatsApp.",
        "Ver a coleção": "Ver la colección",
        "Como comprar": "Cómo comprar",
        "Apague as velas": "Apaga las velas",
        "tem segredo no escuro": "hay un secreto en la oscuridad",
        "Acender as velas": "Encender las velas",
        "psiu… tem um gato preto escondido nesta página. Procure dois olhinhos que não somem.": "psst… hay un gato negro escondido en esta página. Busca dos ojitos que no desaparecen.",
        "Lua nova": "Luna nueva", "Lua crescente": "Luna creciente", "Quarto crescente": "Cuarto creciente", "Crescente gibosa": "Gibosa creciente",
        "Lua cheia": "Luna llena", "Minguante gibosa": "Gibosa menguante", "Quarto minguante": "Cuarto menguante", "Lua minguante": "Luna menguante",
        /* vantagens e como comprar */
        "Vantagens de comprar aqui": "Ventajas de comprar aquí",
        "Por Uber, 99 ou retirada combinada": "Por Uber, 99 o retiro acordado",
        "Nas entregas em Campo Grande": "En las entregas en Campo Grande",
        "Até 5% off no Pix": "Hasta 5% off con Pix",
        "Ou até 12x sem juros no cartão": "O hasta 12 cuotas sin interés con tarjeta",
        "Atendimento de gente": "Atención de persona a persona",
        "Direto com a Elizabeth no WhatsApp": "Directo con Elizabeth por WhatsApp",
        "Escolha": "Elige",
        "Abra a peça e ponha na sacola. Quase tudo é tamanho único.": "Abre la pieza y ponla en la bolsa. Casi todo es talla única.",
        "Revise": "Revisa",
        "Confira quantidades e o total. Sem cadastro e sem senha.": "Revisa cantidades y el total. Sin registro y sin contraseña.",
        "Envie no WhatsApp": "Envía por WhatsApp",
        "O pedido chega pronto. A gente confirma o estoque, a entrega e o pagamento na conversa.": "El pedido llega listo. Confirmamos el stock, la entrega y el pago en la conversación.",
        /* coleção, filtros e vibes */
        "A coleção": "La colección",
        "Qual é a sua vibe?": "¿Cuál es tu vibe?",
        "não sabe? tire o tarô ✦": "¿no sabes? saca el tarot ✦",
        "Vitoriana": "Victoriana",
        "Espartilho, renda marfim e camafeu: delicada e assombrada, feito retrato antigo.": "Corsé, encaje marfil y camafeo: delicada y embrujada, como un retrato antiguo.",
        "Trad goth": "Trad goth",
        "Veludo preto, pelúcia, rosário e rosa vermelha. Pra noite toda na rua.": "Terciopelo negro, peluche, rosario y rosa roja. Para toda la noche en la calle.",
        "Bruxinha": "Brujita",
        "Bola de cristal, lua e capa de veludo pra quem lê o futuro.": "Bola de cristal, luna y capa de terciopelo para quien lee el futuro.",
        "Pastel goth": "Pastel goth",
        "Lilás, rosa e menta com um pé nas trevas: fofa e macabra.": "Lila, rosa y menta con un pie en las tinieblas: tierna y macabra.",
        "Tudo": "Todo",
        "Roupas": "Ropa",
        "Joias e bijuterias": "Joyas y bisutería",
        "Bolsas": "Carteras",
        "Maquiagem e perfumes": "Maquillaje y perfumes",
        "Caixas": "Cajas",
        "Favoritos": "Favoritos",
        "Filtrar por categoria": "Filtrar por categoría",
        "Buscar peça": "Buscar pieza",
        "Buscar peça…": "Buscar pieza…",
        "Faixa de preço": "Rango de precio",
        "Qualquer preço": "Cualquier precio",
        "Até R$ 50": "Hasta R$ 50",
        "R$ 50 a R$ 150": "R$ 50 a R$ 150",
        "Acima de R$ 150": "Más de R$ 150",
        "Tamanho": "Talla",
        "Qualquer tamanho": "Cualquier talla",
        "Ordenar por": "Ordenar por",
        "Destaques": "Destacados",
        "Menor preço": "Menor precio",
        "Maior preço": "Mayor precio",
        "Nome (A–Z)": "Nombre (A–Z)",
        "Novidade": "Novedad",
        "Tamanho único": "Talla única",
        "tamanho único": "talla única",
        "Pôr na sacola": "Poner en la bolsa",
        "Sob consulta": "A consultar",
        "🕯 Peça única": "🕯 Pieza única",
        "· só existe uma": "· solo existe una",
        "🕯 Peça única · só existe uma": "🕯 Pieza única · solo existe una",
        "🕯 Peça única · essa já encontrou a dona dela": "🕯 Pieza única · esta ya encontró a su dueña",
        "já tem dona": "ya tiene dueña",
        "Já tem dona": "Ya tiene dueña",
        "Me avisa se chegar parecida": "Avísame si llega una parecida",
        "Nenhuma peça por aqui…": "Ninguna pieza por aquí…",
        "Tente outra palavra ou volte pra coleção inteira.": "Prueba otra palabra o vuelve a la colección completa.",
        "Limpar filtros": "Limpiar filtros",
        /* resumos, descrições e detalhes das peças (os nomes ficam em português) */
        "Estampas sortidas · tamanho único": "Estampados surtidos · talla única",
        "Camisetas com estampas alternativas sortidas. Cada uma é diferente: pergunte no WhatsApp quais estampas estão disponíveis, ou escreva na observação do pedido a que você quer.": "Camisetas con estampados alternativos surtidos. Cada una es diferente: pregunta por WhatsApp qué estampados hay, o escribe en la observación del pedido la que quieres.",
        "Estampas sortidas": "Estampados surtidos", "Pergunte as estampas disponíveis": "Pregunta los estampados disponibles", "Pode encomendar": "Se puede encargar",
        "Fragrâncias variadas": "Fragancias variadas",
        "Perfumes variados. As fragrâncias e os preços mudam conforme o estoque: ponha na sacola e a gente te conta no WhatsApp quais tem agora.": "Perfumes variados. Las fragancias y los precios cambian según el stock: ponlo en la bolsa y te contamos por WhatsApp cuáles hay ahora.",
        "Preço conforme a fragrância": "Precio según la fragancia", "Consulte o estoque no WhatsApp": "Consulta el stock por WhatsApp",
        "Amarração · renda no decote": "Cordones · encaje en el escote",
        "Espartilho vitoriano em rosa seca, com amarração na frente que ajusta a cintura e renda creme no decote. Vai por cima de blusa ou sozinho.": "Corsé victoriano en rosa viejo, con cordones al frente que ajustan la cintura y encaje crema en el escote. Va sobre una blusa o solo.",
        "Amarração ajustável na frente": "Cordones ajustables al frente", "Barbatanas flexíveis": "Varillas flexibles", "Renda no decote": "Encaje en el escote", "Laço de cetim preto": "Lazo de satén negro",
        "Rodada · barra dupla de renda": "Con vuelo · doble ruedo de encaje",
        "Saia rodada lilás com cós alto e duas camadas de renda na barra, uma creme e uma preta. Gira bonito e fica ótima com meia listrada.": "Falda lila con vuelo, tiro alto y dos capas de encaje en el ruedo, una crema y una negra. Gira lindo y queda genial con medias a rayas.",
        "Cós alto com elástico atrás": "Tiro alto con elástico atrás", "Barra dupla de renda": "Doble ruedo de encaje", "Forro que não marca": "Forro que no marca", "Cruzinha bordada": "Crucecita bordada",
        "Manga bufante · gola boneca": "Manga abullonada · cuello bebé",
        "Vestido lilás de manga bufante, gola boneca creme e laço preto marcando a cintura. Doce na medida, com barra de renda.": "Vestido lila de manga abullonada, cuello bebé crema y lazo negro marcando la cintura. Dulce en su justa medida, con ruedo de encaje.",
        "Manga bufante curta": "Manga abullonada corta", "Gola boneca removível": "Cuello bebé removible", "Laço de veludo na cintura": "Lazo de terciopelo en la cintura", "Barra de renda": "Ruedo de encaje",
        "Gola alta · manga bufante": "Cuello alto · manga abullonada",
        "Blusa creme de gola alta com babado lilás, fita preta no pescoço e manga bufante com punho de renda. Base perfeita pro espartilho.": "Blusa crema de cuello alto con volado lila, cinta negra en el cuello y manga abullonada con puño de encaje. La base perfecta para el corsé.",
        "Gola alta com babado": "Cuello alto con volado", "Fita de veludo com coraçãozinho": "Cinta de terciopelo con corazoncito", "Manga bufante longa": "Manga abullonada larga", "Botões forrados": "Botones forrados",
        "Veludo · forro lilás · fecho dourado": "Terciopelo · forro lila · broche dorado",
        "Capa de veludo preto com forro lilás e fecho dourado de correntinha. Por cima de vestido ou de moletom, vira feitiço na hora.": "Capa de terciopelo negro con forro lila y broche dorado de cadenita. Sobre un vestido o un buzo, se vuelve hechizo al instante.",
        "Veludo molhado": "Terciopelo brillante", "Forro de cetim lilás": "Forro de satén lila", "Fecho dourado com corrente": "Broche dorado con cadena", "Gola alta": "Cuello alto",
        "Longo · gola e barra de pelúcia": "Largo · cuello y ruedo de peluche",
        "Casaco longo preto com gola, punhos e barra de pelúcia macia. Por cima de vestido ou de saia longa, é trad goth na hora.": "Abrigo largo negro con cuello, puños y ruedo de peluche suave. Sobre un vestido o una falda larga, es trad goth al instante.",
        "Comprimento abaixo do joelho": "Largo debajo de la rodilla", "Pelúcia sintética macia": "Peluche sintético suave", "Forro leve": "Forro liviano", "Botão escondido": "Botón oculto",
        "Veludo · renda · lua": "Terciopelo · encaje · luna",
        "Choker de veludo preto com renda creme por baixo e um pingente de lua lilás. Fecho ajustável com correntinha extensora.": "Choker de terciopelo negro con encaje crema debajo y un dije de luna lila. Cierre ajustable con cadenita extensora.",
        "Veludo macio": "Terciopelo suave", "Renda creme": "Encaje crema", "Pingente de lua esmaltado": "Dije de luna esmaltado", "Correntinha extensora de 5 cm": "Cadenita extensora de 5 cm",
        "Veludo · rosa vermelha": "Terciopelo · rosa roja",
        "Choker de fita de veludo preto com uma rosa vermelha no centro e uma gotinha pendurada. Amarra atrás, serve em qualquer pescoço.": "Choker de cinta de terciopelo negro con una rosa roja en el centro y una gotita colgante. Se ata atrás, sirve para cualquier cuello.",
        "Fita de veludo": "Cinta de terciopelo", "Rosa de tecido vinho": "Rosa de tela bordó", "Amarração atrás": "Se ata atrás", "Gotinha pendente": "Gotita colgante",
        "Contas pretas e vinho · cruz": "Cuentas negras y bordó · cruz",
        "Colar rosário de contas pretas, com uma conta vinho a cada cinco, medalhinha dourada e cruz pendente. Longo, fica lindo por cima de tudo.": "Collar rosario de cuentas negras, con una cuenta bordó cada cinco, medallita dorada y cruz colgante. Largo, queda lindo sobre todo.",
        "Contas de vidro": "Cuentas de vidrio", "Medalha dourada": "Medalla dorada", "Cruz de metal escuro": "Cruz de metal oscuro", "Comprimento longo": "Largo largo",
        "Perfil marfim · moldura de pérolas": "Perfil marfil · marco de perlas",
        "Broche camafeu com perfil de moça em marfim, moldura dourada e pérolas em volta. Na gola, no espartilho ou numa fita de veludo.": "Broche camafeo con perfil de dama en marfil, marco dorado y perlas alrededor. En el cuello, en el corsé o en una cinta de terciopelo.",
        "Moldura dourada": "Marco dorado", "Pérolas em volta": "Perlas alrededor", "Alfinete com trava": "Alfiler con traba", "Dá pra usar como pingente": "Se puede usar como dije",
        "Cruz esmaltada · pedra rosa": "Cruz esmaltada · piedra rosa",
        "Corrente de bolinhas com cruz gótica esmaltada em lilás e uma pedrinha rosa no centro. Comprimento de 45 cm.": "Cadena de bolitas con cruz gótica esmaltada en lila y una piedrita rosa en el centro. Largo de 45 cm.",
        "Cruz esmaltada": "Cruz esmaltada", "Pedra rosa": "Piedra rosa", "Corrente de 45 cm": "Cadena de 45 cm", "Não escurece": "No se oscurece",
        "Par · olhinhos rosa": "Par · ojitos rosa",
        "Par de brincos de morceguinho preto com olhinhos rosa. Levinhos, dá pra usar o dia inteiro sem pesar a orelha.": "Par de aretes de murcielaguito negro con ojitos rosa. Livianitos, se pueden usar todo el día sin que pesen.",
        "Par de brincos": "Par de aretes", "Acrílico leve": "Acrílico liviano", "Gancho antialérgico": "Gancho antialérgico", "Olhinhos pintados à mão": "Ojitos pintados a mano",
        "Par desigual · rosa e menta": "Par desigual · rosa y menta",
        "Argolinhas com cruzes pendentes, uma rosa e uma menta, de propósito. O par desigual que chama atenção.": "Argollitas con cruces colgantes, una rosa y una menta, a propósito. El par desigual que llama la atención.",
        "Par desigual rosa e menta": "Par desigual rosa y menta", "Argola de 1,5 cm": "Argolla de 1,5 cm", "Antialérgico": "Antialérgico", "Pedrinha no centro": "Piedrita en el centro",
        "Ajustável · olho com cílios": "Ajustable · ojo con pestañas",
        "Anel ajustável com um olho de íris menta e cílios de metal. Fofo e esquisito na medida certa.": "Anillo ajustable con un ojo de iris menta y pestañas de metal. Tierno y raro en su justa medida.",
        "Aro ajustável": "Aro ajustable", "Olho esmaltado": "Ojo esmaltado", "Cílios de metal": "Pestañas de metal", "Serve do 12 ao 22": "Sirve del 12 al 22",
        "Bola de vidro · lua por dentro": "Bola de vidrio · luna adentro",
        "Pingente de bola de vidro com uma luazinha lilás lá dentro e tampinha dourada. Pra ler o futuro de pertinho.": "Dije de bola de vidrio con una lunita lila adentro y tapita dorada. Para leer el futuro de cerquita.",
        "Bola de vidro de 2 cm": "Bola de vidrio de 2 cm", "Lua lilás por dentro": "Luna lila adentro", "Tampa dourada": "Tapa dorada", "Corrente de 50 cm": "Cadena de 50 cm",
        "Formato caixão · alça de mão": "Forma de ataúd · asa de mano",
        "Bolsa preta em formato de caixão, com cruz lilás na frente e costura rosa aparente. Cabe celular, carteira e maquiagem.": "Cartera negra en forma de ataúd, con cruz lila al frente y costura rosa a la vista. Entran el celular, la billetera y el maquillaje.",
        "Couro sintético": "Cuero sintético", "Cruz lilás aplicada": "Cruz lila aplicada", "Alça de mão e alça longa": "Asa de mano y correa larga", "Forro de cetim rosa": "Forro de satén rosa",
        "3 peças surpresa da vibe que você escolher": "3 piezas sorpresa de la vibe que elijas",
        "Uma caixa com 3 peças surpresa da vibe que você escolher, montada pela Elizabeth. Você só descobre o que veio quando abrir.": "Una caja con 3 piezas sorpresa de la vibe que elijas, armada por Elizabeth. Solo descubres lo que vino cuando la abres.",
        "3 peças surpresa": "3 piezas sorpresa", "Você escolhe a vibe": "Tú eliges la vibe", "Montada à mão": "Armada a mano", "Sem troca do conteúdo, só de tamanho": "Sin cambio del contenido, solo de talla",
        "Exclusivo dos close friends": "Exclusivo de los mejores amigos",
        "Pingente de eclipse, com o disco escuro cobrindo o sol dourado. Peça do drop secreto: só aparece pra quem sabe a palavra mágica.": "Dije de eclipse, con el disco oscuro cubriendo el sol dorado. Pieza del drop secreto: solo aparece para quien sabe la palabra mágica.",
        "Pingente esmaltado": "Dije esmaltado", "Poucas unidades": "Pocas unidades", "Só no drop secreto": "Solo en el drop secreto",
        "Par de luas crescentes pretas com contorno dourado. Peça do drop secreto: só aparece pra quem sabe a palavra mágica.": "Par de lunas crecientes negras con borde dorado. Pieza del drop secreto: solo aparece para quien sabe la palabra mágica.",
        "Contorno dourado": "Borde dorado",
        /* janela da peça */
        "Pedir as medidas": "Pedir las medidas",
        "Compartilhar": "Compartir",
        "Combina com": "Combina con",
        "Fechar": "Cerrar",
        /* looks, caixa, coven */
        "Looks prontos": "Looks listos",
        "Combinações que já saem casando. Um clique põe as três peças na sacola.": "Combinaciones que ya salen armadas. Un clic pone las tres piezas en la bolsa.",
        "Pôr o look inteiro na sacola": "Poner el look entero en la bolsa",
        "Look Noite de Halloween 🎃": "Look Noche de Halloween 🎃",
        "Capa de veludo, bola de cristal e morceguinhos: fantasia que dá pra usar o ano todo.": "Capa de terciopelo, bola de cristal y murcielaguitos: un disfraz para usar todo el año.",
        "Look Boneca Assombrada": "Look Muñeca Embrujada",
        "Vestido boneca, choker de renda e a bolsa caixão: doce com um pé nas trevas.": "Vestido muñeca, choker de encaje y la cartera ataúd: dulce con un pie en las tinieblas.",
        "Look Chá da Meia-Noite": "Look Té de Medianoche",
        "Blusa vitoriana, espartilho e o colar de cruz.": "Blusa victoriana, corsé y el collar de cruz.",
        "Kit Noite de Lua Cheia": "Kit Noche de Luna Llena",
        "Capa de veludo, colar bola de cristal e brinco morceguinho.": "Capa de terciopelo, collar bola de cristal y aretes de murcielaguito.",
        "Caixa misteriosa do coven": "Caja misteriosa del coven",
        "O que tem dentro?": "¿Qué hay adentro?",
        "Abrir a caixa": "Abrir la caja",
        "Quero essa caixa": "Quiero esta caja",
        "Sacudir a caixa misteriosa": "Sacudir la caja misteriosa",
        "Escolha a vibe da caixa": "Elige la vibe de la caja",
        "Quem já é da coven 🖤": "Quien ya es del coven 🖤",
        "Clientes usando as peças. Marque": "Clientas usando las piezas. Etiqueta a",
        "no seu look pra aparecer aqui.": "en tu look para aparecer aquí.",
        /* cantinho místico */
        "Pra brincar enquanto escolhe": "Para jugar mientras eliges",
        "Cantinho místico": "Rincón místico",
        "Magias da loja": "Magias de la tienda",
        "Tarô": "Tarot", "Lua": "Luna", "Horóscopo": "Horóscopo", "Grimório": "Grimorio", "Arcanos": "Arcanos", "Boneca": "Muñeca", "Porta secreta": "Puerta secreta",
        "Tarô do look": "Tarot del look",
        "Embaralhe e tire três cartas: a sua essência, a peça e o feitiço. As cartas montam o look, e a tiragem vira imagem pro seu story.": "Baraja y saca tres cartas: tu esencia, la pieza y el hechizo. Las cartas arman el look, y la tirada se vuelve imagen para tu historia.",
        "Essência": "Esencia", "A peça": "La pieza", "O feitiço": "El hechizo",
        "Embaralhar e tirar as cartas": "Barajar y sacar las cartas",
        "Ritual da lua cheia": "Ritual de la luna llena",
        "Peça nova chega na lua cheia": "Las piezas nuevas llegan en luna llena",
        "dias": "días", "horas": "horas", "minutos": "minutos",
        "Me avisa no próximo drop 🌕": "Avísame en el próximo drop 🌕",
        "Seguir no Instagram": "Seguir en Instagram",
        "Horóscopo alt": "Horóscopo alt",
        "Escolha o seu signo": "Elige tu signo",
        "Áries": "Aries", "Touro": "Tauro", "Gêmeos": "Géminis", "Câncer": "Cáncer", "Leão": "Leo", "Virgem": "Virgo",
        "Libra": "Libra", "Escorpião": "Escorpio", "Sagitário": "Sagitario", "Capricórnio": "Capricornio", "Aquário": "Acuario", "Peixes": "Piscis",
        "Cor do dia": "Color del día", "Número da sorte": "Número de la suerte", "Peça do dia": "Pieza del día", "Ver a peça": "Ver la pieza",
        "menta": "menta", "lilás": "lila", "rosa": "rosa", "preto": "negro", "creme": "crema", "vinho": "bordó", "dourado": "dorado",
        "O grimório": "El grimorio",
        "Grimório da Eclipse Studio": "Grimorio de Eclipse Studio",
        "Receitas de estilo pra cada vibe. Vire as páginas (dá pra arrastar, tocar nos cantos ou usar as setas).": "Recetas de estilo para cada vibe. Pasa las páginas (puedes arrastrar, tocar las esquinas o usar las flechas).",
        "da Eclipse Studio": "de Eclipse Studio",
        "receitas de estilo ✦ vire a página": "recetas de estilo ✦ pasa la página",
        "Capítulo I": "Capítulo I", "Capítulo II": "Capítulo II", "Capítulo III": "Capítulo III", "Capítulo IV": "Capítulo IV",
        "Pegue um espartilho, uma pitada de renda marfim e um camafeu preso na gola. Misture à meia-luz e sirva com olhar de retrato antigo.": "Toma un corsé, una pizca de encaje marfil y un camafeo prendido en el cuello. Mezcla a media luz y sirve con mirada de retrato antiguo.",
        "Ingredientes": "Ingredientes",
        "ver tudo da vibe Vitoriana →": "ver todo de la vibe Victoriana →",
        "Derreta veludo preto em fogo baixo, junte um rosário longo e uma rosa vermelha no pescoço. Deixe descansar até a meia-noite e saia pra rua.": "Derrite terciopelo negro a fuego lento, agrega un rosario largo y una rosa roja en el cuello. Deja reposar hasta la medianoche y sal a la calle.",
        "ver tudo da vibe Trad goth →": "ver todo de la vibe Trad goth →",
        "Numa noite de lua, junte uma capa de veludo, uma bola de cristal no peito e um olho que tudo vê no dedo. Mexa três vezes em sentido anti-horário.": "En una noche de luna, junta una capa de terciopelo, una bola de cristal en el pecho y un ojo que todo lo ve en el dedo. Revuelve tres veces en sentido antihorario.",
        "ver tudo da vibe Bruxinha →": "ver todo de la vibe Brujita →",
        "Bata lilás, rosa e menta até ficar fofo. Acrescente uma cruz, um morceguinho e uma gota de trevas. Sirva com laço.": "Bate lila, rosa y menta hasta que quede esponjoso. Agrega una cruz, un murcielaguito y una gota de tinieblas. Sirve con lazo.",
        "ver tudo da vibe Pastel goth →": "ver todo de la vibe Pastel goth →",
        "Continua na próxima lua cheia…": "Continúa en la próxima luna llena…",
        "Novas receitas chegam junto com as peças novas.": "Las recetas nuevas llegan junto con las piezas nuevas.",
        "‹ Voltar": "‹ Volver", "capa": "tapa", "Virar a página ›": "Pasar la página ›",
        "Coleção de arcanos": "Colección de arcanos",
        "volte amanhã": "vuelve mañana",
        "Carta ainda escondida": "Carta todavía oculta",
        "A Rosa": "La Rosa",
        "Boneca de papel": "Muñeca de papel",
        "Toque nas peças pra vestir a boneca e arraste pra arrumar. Gostou do look? Salva pro story ou põe tudo na sacola.": "Toca las piezas para vestir a la muñeca y arrastra para acomodar. ¿Te gustó el look? Guárdalo para tu historia o pon todo en la bolsa.",
        "Tirar": "Quitar",
        "Peças": "Piezas",
        "(toque pra vestir ou tirar)": "(toca para poner o quitar)",
        "A boneca está só de anágua. Escolha uma peça ✦": "La muñeca está solo con enagua. Elige una pieza ✦",
        "Pôr o look na sacola": "Poner el look en la bolsa",
        "Salvar pro story": "Guardar para la historia",
        "Tirar tudo": "Quitar todo",
        "Boneca vestida com as peças escolhidas": "Muñeca vestida con las piezas elegidas",
        "Peça selecionada": "Pieza seleccionada", "Diminuir a peça": "Achicar la pieza", "Aumentar a peça": "Agrandar la pieza",
        "Só pros close friends": "Solo para los mejores amigos",
        "A porta secreta": "La puerta secreta",
        "Tem peça que só aparece pra quem sabe a palavra mágica. Ela sai nos close friends do": "Hay piezas que solo aparecen para quien sabe la palabra mágica. Sale en los mejores amigos de",
        "Palavra mágica": "Palabra mágica", "Palavra mágica…": "Palabra mágica…",
        "Abrir a porta": "Abrir la puerta",
        "Drop secreto": "Drop secreto",
        "Você entrou. Essas peças não aparecem na vitrine: é só pra quem sabe a palavra.": "Entraste. Estas piezas no aparecen en la vitrina: son solo para quien sabe la palabra.",
        /* a marca */
        "Gazeta das Trevas · edição de lua cheia": "Gaceta de las Tinieblas · edición de luna llena",
        "Um lugar pra ser livre": "Un lugar para ser libre",
        "★ uma pequena sonhadora com grandes sonhos ☆": "★ una pequeña soñadora con grandes sueños ☆",
        "é um lugar onde você pode ser livre criativamente e experimentar, até descobrir o seu próprio estilo.": "es un lugar donde puedes ser libre creativamente y experimentar, hasta descubrir tu propio estilo.",
        "São peças pra meninxs alternativas e pro dia a dia, tudo focado no estilo alt: umas feitas à mão, outras garimpadas em brechó e outras escolhidas a dedo pra revenda.": "Son piezas para chicxs alternativxs y para el día a día, todo enfocado en el estilo alt: unas hechas a mano, otras rescatadas de tiendas de segunda mano y otras elegidas una por una para revender.",
        "com carinho, Elizabeth 🖤": "con cariño, Elizabeth 🖤",
        "@eclipse_studiocg no Instagram →": "@eclipse_studiocg en Instagram →",
        "escrito com tinta de lua: a próxima peça chega na lua cheia 🌕": "escrito con tinta de luna: la próxima pieza llega en luna llena 🌕",
        "Na foto: o colar bola de cristal, o brinco morceguinho e o espartilho rosa seca, flagrados às vésperas da lua cheia.": "En la foto: el collar bola de cristal, los aretes de murcielaguito y el corsé rosa viejo, sorprendidos en vísperas de la luna llena.",
        "Um gato preto escondido! Clique nele": "¡Un gato negro escondido! Haz clic en él",
        /* tamanhos e dúvidas */
        "Tamanhos": "Tallas",
        "Quase todas as peças são": "Casi todas las piezas son",
        ". Quer saber se serve? Pergunta as medidas da peça no WhatsApp que a gente mede pra você.": ". ¿Quieres saber si te queda? Pregunta las medidas de la pieza por WhatsApp y la medimos para ti.",
        "Sob encomenda ✦": "Por encargo ✦",
        "Gostou de uma peça mas queria em outra cor ou outro tamanho? A gente faz sob encomenda. É só escrever na observação do pedido.": "¿Te gustó una pieza pero la querías en otro color u otra talla? La hacemos por encargo. Solo escríbelo en la observación del pedido.",
        "Tirar dúvida no WhatsApp": "Preguntar por WhatsApp",
        "Dúvidas frequentes": "Preguntas frecuentes",
        "Como funciona a entrega?": "¿Cómo funciona la entrega?",
        "Por enquanto a gente entrega só em Campo Grande: por Uber ou 99, ou você retira num lugar combinado. O pedido fica pronto em até 3 dias úteis depois do pagamento. Acima de R$ 150 o frete é grátis.": "Por ahora entregamos solo en Campo Grande: por Uber o 99, o retiras en un lugar acordado. El pedido queda listo en hasta 3 días hábiles después del pago. Sobre R$ 150 el envío es gratis.",
        "Como funciona a troca?": "¿Cómo funciona el cambio?",
        "Você tem 7 dias a partir do recebimento pra trocar, com a etiqueta na peça. Roupa íntima não tem troca.": "Tienes 7 días desde que la recibes para cambiarla, con la etiqueta puesta. La ropa interior no tiene cambio.",
        "Quais as formas de pagamento?": "¿Cuáles son las formas de pago?",
        "Pix, com até 5% de desconto; cartão de crédito em até 12x sem juros, por link de pagamento; cartão de débito; ou dinheiro na retirada. Tudo é combinado no WhatsApp depois que você manda o pedido.": "Pix, con hasta 5% de descuento; tarjeta de crédito en hasta 12 cuotas sin interés, por link de pago; tarjeta de débito; o efectivo al retirar. Todo se combina por WhatsApp después de que mandas el pedido.",
        "Dá pra encomendar em outra cor ou tamanho?": "¿Se puede encargar en otro color o talla?",
        "Dá, sim! Escreve na observação do pedido o que você queria e a gente combina no WhatsApp.": "¡Sí! Escribe en la observación del pedido lo que querías y lo combinamos por WhatsApp.",
        "As peças são novas?": "¿Las piezas son nuevas?",
        "Tem de tudo: peças feitas à mão pela Elizabeth, peças novas de revenda e achados de brechó. Cada anúncio diz de onde a peça veio.": "Hay de todo: piezas hechas a mano por Elizabeth, piezas nuevas de reventa y hallazgos de segunda mano. Cada anuncio dice de dónde viene la pieza.",
        /* rodapé e app */
        "Moda alternativa em Campo Grande - MS: doce por fora, bruxa por dentro.": "Moda alternativa en Campo Grande - MS: dulce por fuera, bruja por dentro.",
        "📲 Instalar o app da Eclipse": "📲 Instalar la app de Eclipse",
        "No iPhone: toque em": "En iPhone: toca",
        "e depois em": "y después",
        "Adicionar à Tela de Início": "Agregar a inicio",
        "Loja": "Tienda", "Tamanhos e dúvidas": "Tallas y preguntas", "Atendimento": "Atención",
        "Entrega em Campo Grande por Uber, 99 ou retirada": "Entrega en Campo Grande por Uber, 99 o retiro",
        "Trocas e prazos": "Cambios y plazos", "Pagamento": "Pago", "Crédito 12x": "Crédito 12 cuotas", "Débito": "Débito", "Dinheiro": "Efectivo",
        "Prévia criada por": "Vista previa creada por",
        ". As peças e os preços da vitrine ainda são de exemplo, até chegarem as fotos da coleção.": ". Las piezas y los precios de la vitrina todavía son de ejemplo, hasta que lleguen las fotos de la colección.",
        /* sacola */
        "Sua sacola": "Tu bolsa",
        "Fechar sacola": "Cerrar la bolsa",
        "Sacola vazia": "Bolsa vacía",
        "A Nyx está dormindo aqui dentro. Ponha uma peça que ela acorda.": "Nyx está durmiendo aquí adentro. Pon una pieza y se despierta.",
        "Escolha uma peça e ela aparece aqui.": "Elige una pieza y aparece aquí.",
        "Continuar olhando": "Seguir mirando",
        "Entrega": "Entrega",
        "Escolher depois, no WhatsApp": "Elegir después, por WhatsApp",
        "✦ Frete grátis na entrega em Campo Grande": "✦ Envío gratis en la entrega en Campo Grande",
        "Retirada sem custo ✦": "Retiro sin costo ✦",
        "Total estimado": "Total estimado",
        "Seu nome": "Tu nombre", "(opcional)": "(opcional)", "Observação": "Observación",
        "Como a gente te chama?": "¿Cómo te llamamos?",
        "Ex.: prefiro retirar / quero em outra cor": "Ej.: prefiero retirar / la quiero en otro color",
        "Ver a mensagem que será enviada": "Ver el mensaje que se enviará",
        "Enviar pedido pelo WhatsApp": "Enviar pedido por WhatsApp",
        "Copiar pedido": "Copiar pedido",
        "🎁 Pedir de presente": "🎁 Pedir de regalo",
        "Esvaziar sacola": "Vaciar la bolsa",
        "No WhatsApp a gente confirma o estoque, combina a entrega e manda o Pix ou o link do cartão. Este site não pede nem guarda dado de pagamento.": "Por WhatsApp confirmamos el stock, combinamos la entrega y mandamos el Pix o el link de la tarjeta. Este sitio no pide ni guarda datos de pago.",
        "Abrindo o WhatsApp com o pedido pronto…": "Abriendo WhatsApp con el pedido listo…",
        "Pedido copiado. Cole na conversa que quiser.": "Pedido copiado. Pégalo en la conversación que quieras.",
        "Ver sacola": "Ver bolsa",
        "Fechar pedido": "Cerrar pedido",
        "Quantidade": "Cantidad",
        "Mrrrau! Caiu no caldeirão ✦": "¡Mrrrau! Cayó en el caldero ✦",
        "Dúvidas?": "¿Preguntas?",
        /* gato, presente e arcanos */
        "Você achou o gato preto!": "¡Encontraste el gato negro!",
        "Pôr o código no meu pedido": "Poner el código en mi pedido",
        "Beleza": "Listo",
        "Me dá de presente?": "¿Me lo regalas?",
        "A gente escreve uma cartinha com as peças da sua sacola. Você manda pra quem quiser, e a pessoa abre o link e já pode comprar.": "Escribimos una cartita con las piezas de tu bolsa. La mandas a quien quieras, y esa persona abre el link y ya puede comprar.",
        "Pra quem": "Para quién",
        "Como a pessoa te conhece?": "¿Cómo te conoce esa persona?",
        "Ex.: mãe, amor, madrinha": "Ej.: mamá, amor, madrina",
        "Escrever a carta e mandar no WhatsApp": "Escribir la carta y mandarla por WhatsApp",
        "ou copiar o link da carta": "o copiar el link de la carta",
        "Pôr tudo na sacola": "Poner todo en la bolsa",
        "com amor, Eclipse Studio 🖤": "con amor, Eclipse Studio 🖤",
        "Ver minha coleção": "Ver mi colección",
        "🃏 Você ganhou sua primeira carta de arcano!": "🃏 ¡Ganaste tu primera carta de arcano!",
        "Ver carta": "Ver carta",
        "Nyx, a gata da loja: toque pra uma dica": "Nyx, la gata de la tienda: tócala para un consejo",
        "Mandar a Nyx cochilar hoje": "Mandar a Nyx a dormir la siesta hoy",
        "Miau. Eu sou a Nyx, a gata da loja 🐈‍⬛ Toca em mim que eu dou dicas.": "Miau. Soy Nyx, la gata de la tienda 🐈‍⬛ Tócame y te doy consejos.",
    };

    const MESES = { janeiro: "enero", fevereiro: "febrero", "março": "marzo", abril: "abril", maio: "mayo", junho: "junio", julho: "julio", agosto: "agosto", setembro: "septiembre", outubro: "octubre", novembro: "noviembre", dezembro: "diciembre" };
    const SEMANA = { "domingo": "domingo", "segunda-feira": "lunes", "terça-feira": "martes", "quarta-feira": "miércoles", "quinta-feira": "jueves", "sexta-feira": "viernes", "sábado": "sábado" };
    const data = (d) => d.replace(/\b(domingo|segunda-feira|terça-feira|quarta-feira|quinta-feira|sexta-feira|sábado)\b/g, (m) => SEMANA[m]).replace(/\b(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\b/g, (m) => MESES[m]);
    const fase = (f) => DIC[f.charAt(0).toUpperCase() + f.slice(1)] ? DIC[f.charAt(0).toUpperCase() + f.slice(1)].toLowerCase() : f;
    const pecas = (n) => (n === "1" ? "1 pieza" : `${n} piezas`);
    const cat = (c) => DIC[c] || c;

    /* textos com número ou nome no meio */
    const REGRAS = [
        [/^(\d+) peças?$/, (m, n) => pecas(n)],
        [/^(\d+) peças? →$/, (m, n) => `${pecas(n)} →`],
        [/^(\d+) peças? · (.+)$/, (m, n, v) => `${pecas(n)} · ${DIC[v] || v}`],
        [/^· drop na lua cheia em (\d+) dias?$/, (m, n) => `· drop en luna llena en ${n} ${n === "1" ? "día" : "días"}`],
        [/^🎃 Mês das bruxas na Eclipse · faltam (\d+) dias pro Halloween ✦$/, (m, n) => `🎃 Mes de las brujas en Eclipse · faltan ${n} días para Halloween ✦`],
        [/^Faltam (R\$ [\d.,]+) pro frete grátis ✦$/, (m, v) => `Faltan ${v} para el envío gratis ✦`],
        [/^Entrega no (.+): (R\$ [\d.,]+)\. Faltam (R\$ [\d.,]+) pro frete grátis ✦$/, (m, r, t, f) => `Entrega en ${r}: ${t}. Faltan ${f} para el envío gratis ✦`],
        [/^Retirada combinada · sem custo$/, () => "Retiro acordado · sin costo"],
        [/^Tamanho único · (.+?)( · peça única)?$/, (m, v, u) => `Talla única · ${v}${u ? " · pieza única" : ""}`],
        [/^Tamanho (\S+) · (.+)$/, (m, t, v) => `Talla ${t} · ${v}`],
        [/^(Roupas|Joias e bijuterias|Bolsas|Maquiagem e perfumes|Caixas) · (ES-\d+)$/, (m, c, cod) => `${cat(c)} · ${cod}`],
        [/^✦ (.+) caiu no caldeirão$/, (m, n) => `✦ ${n} cayó en el caldero`],
        [/^(.+) é peça única: ela já está na sua sacola 🖤$/, (m, n) => `${n} es pieza única: ya está en tu bolsa 🖤`],
        [/^♥ (.+) nos favoritos$/, (m, n) => `♥ ${n} en favoritos`],
        [/^✦ Look no caldeirão: (\d+) peças(.*)$/, (m, n, r) => `✦ Look en el caldero: ${n} piezas${r ? " (una ya estaba en la bolsa)" : ""}`],
        [/^Máximo de (\d+) por peça\. Pra mais, combine no WhatsApp\.$/, (m, n) => `Máximo de ${n} por pieza. Para más, combínalo por WhatsApp.`],
        [/^Faltam (\d+) dias?, (\d+) horas?, (\d+) minutos? pra lua cheia$/, (m, d, h, mi) => `Faltan ${d} días, ${h} horas, ${mi} minutos para la luna llena`],
        [/^Hoje: (.+)\. A próxima lua cheia é (em|hoje)(.*?): fica de olho no (@\S+) pra ver o que chega\.$/, (m, f, e, d, ig) => `Hoy: ${fase(f)}. La próxima luna llena es ${e === "hoje" ? "hoy" : "el"}${data(d)}: atenta a ${ig} para ver lo que llega.`],
        [/^Previsão de (.+)\. Muda todo dia: volta amanhã ✦$/, (m, d) => `Previsión del ${data(d)}. Cambia todos los días: vuelve mañana ✦`],
        [/^(domingo|segunda-feira|terça-feira|quarta-feira|quinta-feira|sexta-feira|sábado), (\d+) de (\w+)$/, (m) => data(m)],
        [/^(\d+) peças surpresa da vibe que você escolher, por (R\$ [\d.,]+)\. Toca na caixa pra sacudir 😉$/, (m, n, v) => `${n} piezas sorpresa de la vibe que elijas, por ${v}. Toca la caja para sacudirla 😉`],
        [/^Cada dia que você visita a loja, ganha uma carta\. Junte as 4 e ganhe um código: (.+)\. Você tem (\d) de 4\.$/, (m, p, n) => `Cada día que visitas la tienda, ganas una carta. Junta las 4 y gana un código: ${p === "a Elizabeth manda um mimo surpresa junto com o pedido" ? "Elizabeth te manda un regalito sorpresa junto con el pedido" : p}. Tienes ${n} de 4.`],
        [/^Ver detalhes de (.+?)((?:, peça nova|, peça única|, já vendida)*)$/, (m, n, x) => `Ver detalles de ${n}${x.replace(", peça nova", ", pieza nueva").replace(", peça única", ", pieza única").replace(", já vendida", ", ya vendida")}`],
        [/^Favoritar (.+)$/, (m, n) => `Agregar ${n} a favoritos`],
        [/^Abrir sacola, (\d+) peças?$/, (m, n) => `Abrir la bolsa, ${pecas(n)}`],
        [/^(Diminuir|Aumentar) a quantidade: (.+), Tamanho único$/, (m, a, n) => `${a === "Diminuir" ? "Disminuir" : "Aumentar"} la cantidad: ${n}, talla única`],
        [/^Tirar da sacola: (.+), Tamanho único$/, (m, n) => `Quitar de la bolsa: ${n}, talla única`],
        [/^Sacola: (\d+) peças?, (.+)\. Fechar pedido$/, (m, n, v) => `Bolsa: ${pecas(n)}, ${v}. Cerrar pedido`],
        [/^(Centro|Prosa|Segredo|Bandeira|Lagoa|Imbirussu|Anhanduizinho) · (R\$ [\d.,]+)$/, (m, r, v) => `${r} · ${v}`],
    ];

    /* pedido do WhatsApp em espanhol (linha a linha; o que não tiver regra fica como está) */
    const LINHAS_PEDIDO = [
        [/^Oi! 🔮 Quero encomendar esta poção na (.+) 🖤$/, (m, l) => `¡Hola! 🔮 Quiero encargar esta poción en ${l} 🖤`],
        [/^\*Ingredientes:\*$/, () => "*Ingredientes:*"],
        [/^(• .+ — )valor a combinar$/, (m, a) => `${a}valor a combinar`],
        [/^Entrega: (.+?)( \(taxa (R\$ [\d.,]+)\)| \(frete grátis ✦\))?$/, (m, r, x, t) => `Entrega: ${r === "Retirada combinada" ? "Retiro acordado" : r}${t ? ` (tarifa ${t})` : x ? " (envío gratis ✦)" : ""}`],
        [/^\*Total estimado: (R\$ [\d.,]+)\*( \+ itens a combinar)?$/, (m, v, x) => `*Total estimado: ${v}*${x ? " + ítems a combinar" : ""}`],
        [/^Nome: (.+)$/, (m, n) => `Nombre: ${n}`],
        [/^🐈‍⬛ Achei o gato preto no site: código (.+)$/, (m, c) => `🐈‍⬛ Encontré el gato negro en el sitio: código ${c}`],
        [/^🃏 Completei a coleção de arcanos: código (.+)$/, (m, c) => `🃏 Completé la colección de arcanos: código ${c}`],
        [/^Podemos combinar a entrega e o pagamento por aqui\?$/, () => "¿Podemos combinar la entrega y el pago por aquí?"],
        [/^_\(Pedido de teste da prévia do site\)_$/, () => "_(Pedido de prueba de la vista previa del sitio)_"],
        [/^Oi! Quais são as medidas da peça (.+)\? 🖤$/, (m, p) => `¡Hola! ¿Cuáles son las medidas de la pieza ${p}? 🖤`],
        [/^Oi! 🌕 Quero entrar na lista do próximo drop da lua cheia da (.+?)(?:\. Aqui é a (.+?))? 🖤$/, (m, l, n) => `¡Hola! 🌕 Quiero entrar en la lista del próximo drop de luna llena de ${l}${n ? `. Soy ${n}` : ""} 🖤`],
        [/^Oi! Vi que (.+) já tem dona 🕯 (.*)$/, (m, p) => `¡Hola! Vi que ${p} ya tiene dueña 🕯 Avísame si llega una parecida 🖤`],
        [/^Oi! Tenho uma dúvida sobre uma peça da Eclipse Studio 🖤$/, () => "¡Hola! Tengo una pregunta sobre una pieza de Eclipse Studio 🖤"],
        [/^Oi! Vim pelo site da Eclipse Studio 🖤$/, () => "¡Hola! Vengo del sitio de Eclipse Studio 🖤"],
    ];
    const AVISO_ES = "🇪🇸 (Cliente fala espanhol)";
    function pedidoEmEspanhol(texto) {
        if (texto.startsWith(AVISO_ES)) return texto;
        const linhas = texto.split("\n").map((l) => {
            for (const [re, f] of LINHAS_PEDIDO) { const m = l.match(re); if (m) return f(...m); }
            return l;
        });
        return `${AVISO_ES}\n${linhas.join("\n")}`;
    }

    /* ---------- motor ---------- */
    const html = document.documentElement;
    let idioma = "pt";
    try {
        const salvo = localStorage.getItem(CHAVE);
        idioma = salvo === "es" || salvo === "pt" ? salvo : (navigator.language || "").toLowerCase().startsWith("es") ? "es" : "pt";
    } catch (e) { /* sem armazenamento */ }
    const originais = new WeakMap(); // nó de texto → português
    const ATRIBUTOS = ["aria-label", "title", "placeholder", "alt"];
    const IGNORAR = "script, style, noscript, .previsao-texto, [data-sem-traducao]";
    const normal = (t) => t.replace(/ /g, " ").replace(/\s+/g, " ").trim();

    function traduzirTexto(pt) {
        const chave = normal(pt);
        if (!chave) return null;
        if (DIC[chave]) return DIC[chave];
        for (const [re, f] of REGRAS) { const m = chave.match(re); if (m) { const r = f(...m); if (r) return r; } }
        return null;
    }
    function noTexto(no) {
        const pai = no.parentElement;
        if (!pai || pai.closest(IGNORAR)) return;
        let pt = originais.get(no);
        if (pt === undefined || (idioma === "es" && no.nodeValue !== pt && no.nodeValue !== traduzido(pt))) { pt = no.nodeValue; originais.set(no, pt); } // o script trocou o texto: o novo é o original
        const alvo = idioma === "es" ? traduzido(pt) : pt;
        if (alvo != null && no.nodeValue !== alvo) no.nodeValue = alvo;
    }
    function traduzido(pt) {
        const t = traduzirTexto(pt);
        if (t == null) return pt;
        return pt.match(/^\s*/)[0] + t + pt.match(/\s*$/)[0];
    }
    const attrOriginais = new WeakMap(); // elemento → { atributo: português }
    function elemento(el) {
        if (el.closest && el.closest(IGNORAR)) return;
        let guardados = attrOriginais.get(el);
        for (const a of ATRIBUTOS) {
            const v = el.getAttribute && el.getAttribute(a);
            if (v == null) continue;
            if (!guardados) { guardados = {}; attrOriginais.set(el, guardados); }
            if (guardados[a] === undefined || (v !== guardados[a] && v !== (traduzirTexto(guardados[a]) || guardados[a]))) guardados[a] = v;
            const alvo = idioma === "es" ? traduzirTexto(guardados[a]) || guardados[a] : guardados[a];
            if (v !== alvo) el.setAttribute(a, alvo);
        }
    }
    function varrer(raiz) {
        if (raiz.nodeType === 3) { noTexto(raiz); return; }
        if (raiz.nodeType !== 1) return;
        elemento(raiz);
        const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
        let n;
        while ((n = w.nextNode())) n.nodeType === 3 ? noTexto(n) : elemento(n);
    }
    let ocupado = false;
    const observador = new MutationObserver((mudancas) => {
        if (ocupado) return;
        ocupado = true;
        for (const m of mudancas) {
            if (m.type === "childList") m.addedNodes.forEach(varrer);
            else if (m.type === "characterData") noTexto(m.target);
            else if (m.type === "attributes") elemento(m.target);
        }
        observador.takeRecords();
        ocupado = false;
    });

    /* o pedido (prévia, link do WhatsApp e "copiar pedido") sai em espanhol */
    function ligarPedido() {
        if (typeof window.montarMensagem !== "function" || window.montarMensagem.__idioma) return;
        const original = window.montarMensagem;
        const nova = function () { const t = original(); return idioma === "es" ? pedidoEmEspanhol(t) : t; };
        nova.__idioma = true;
        window.montarMensagem = nova;
    }
    /* os outros links de WhatsApp da loja (medidas, drop, dúvidas, "já tem dona") também */
    document.addEventListener("click", (e) => {
        if (idioma !== "es") return;
        const a = e.target.closest && e.target.closest('a[href*="wa.me/"]');
        if (!a || a.id === "enviarZap") return;
        try {
            const u = new URL(a.href);
            const t = u.searchParams.get("text");
            if (t) a.href = `${u.origin}${u.pathname}?text=${encodeURIComponent(pedidoEmEspanhol(t))}`;
        } catch (erro) { /* link fora do padrão */ }
    }, true);

    function aplicar(novo) {
        idioma = novo;
        html.lang = idioma === "es" ? "es" : "pt-BR";
        html.dataset.idioma = idioma;
        try { localStorage.setItem(CHAVE, idioma); } catch (e) { /* sem armazenamento */ }
        ocupado = true;
        varrer(document.body);
        observador.takeRecords();
        ocupado = false;
        if (typeof window.atualizarLinkPedido === "function") window.atualizarLinkPedido();
        const b = document.getElementById("botaoIdioma");
        if (b) {
            b.querySelectorAll("span").forEach((s) => s.classList.toggle("ativo", s.dataset.idioma === idioma));
            b.setAttribute("aria-label", idioma === "es" ? "Cambiar a portugués" : "Mudar para espanhol");
        }
        document.title = idioma === "es" ? "Eclipse Studio — Moda alternativa en Campo Grande - MS" : "Eclipse Studio — Moda alternativa em Campo Grande - MS";
        document.dispatchEvent(new CustomEvent("idiomaMudou", { detail: { idioma } }));
    }

    function iniciar() {
        ligarPedido();
        const botao = document.createElement("button");
        botao.type = "button";
        botao.id = "botaoIdioma";
        botao.className = "botao-idioma";
        botao.innerHTML = '<span data-idioma="pt">PT</span><i aria-hidden="true">|</i><span data-idioma="es">ES</span>';
        botao.addEventListener("click", () => aplicar(idioma === "es" ? "pt" : "es"));
        const antes = document.getElementById("botaoSom") || document.getElementById("abrirSacola");
        if (antes) antes.before(botao); else document.body.append(botao);
        observador.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATRIBUTOS });
        aplicar(idioma);
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
    window.idiomaLoja = { aplicar, get atual() { return idioma; }, pedidoEmEspanhol };
})();
