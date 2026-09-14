// Servidor estático mínimo

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORTA = process.env.PORTA || 8000;
const RAIZ = __dirname;

const TIPOS = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".png": "image/png",
    ".json": "application/json; charset=utf-8"
};

const servidor = http.createServer(function(requisicao, resposta) {
    const caminhoPedido = decodeURIComponent(requisicao.url.split("?")[0]);
    const relativo = caminhoPedido === "/" ? "index.html" : caminhoPedido.slice(1);
    const destino = path.join(RAIZ, path.normalize(relativo));

    // impede sair da pasta do projeto
    if (!destino.startsWith(RAIZ)) {
        resposta.writeHead(403);
        resposta.end("acesso negado");
        return;
    }

    fs.readFile(destino, function(erro, conteudo) {
        if (erro) {
            resposta.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
            resposta.end("não encontrado: " + relativo);
            return;
        }
        const tipo = TIPOS[path.extname(destino)] || "application/octet-stream";
        resposta.writeHead(200, { "Content-Type": tipo });
        resposta.end(conteudo);
    });
});

servidor.listen(PORTA, function() {
    console.log("jogo em http://localhost:" + PORTA);
});
