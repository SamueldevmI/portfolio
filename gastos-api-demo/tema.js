// Roda no começo do <body>, antes do conteúdo aparecer, pra página já nascer no tema certo
document.body.classList.toggle("dark-mode", localStorage.getItem("tema") === "escuro");
