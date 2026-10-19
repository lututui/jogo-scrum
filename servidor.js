// Servidor estático mínimo

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORTA = process.env.PORTA || 8000;
const RAIZ = __dirname;
const CAMINHO_DA_DEPURACAO = "/depuracao.json";

const OPCOES_DE_DEPURACAO = [
    "npcsDeTeste",
    "expressoesEmCiclo",
    "eventosLivres",
    "trocaDeCadeiraLivre",
    "atalhoDeSintese"
];

const TIPOS = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".png": "image/png",
    ".json": "application/json; charset=utf-8"
};

function textoDaDepuracao() {
    const argumento = process.argv.find(function (item) {
        return item.startsWith("--depuracao=");
    });

    if (argumento) {
        return argumento.slice("--depuracao=".length);
    }

    return process.env.DEPURACAO || "";
}

function montarDepuracao() {
    const texto = textoDaDepuracao().trim();
    const opcoes = {};

    OPCOES_DE_DEPURACAO.forEach(function (chave) {
        opcoes[chave] = false;
    });

    if (texto === "") {
        return opcoes;
    }

    const citadas = texto.split(",").map(function (item) {
        return item.trim();
    }).filter(Boolean);

    const tudo = citadas.indexOf("tudo") >= 0 || citadas.indexOf("1") >= 0;

    citadas.filter(function (chave) {
        return !tudo && OPCOES_DE_DEPURACAO.indexOf(chave) < 0;
    }).forEach(function (chave) {
        console.log("opção de depuração desconhecida: " + chave);
    });

    OPCOES_DE_DEPURACAO.forEach(function (chave) {
        opcoes[chave] = tudo || citadas.indexOf(chave) >= 0;
    });

    return opcoes;
}

const DEPURACAO = montarDepuracao();

function responderDepuracao(resposta) {
    resposta.writeHead(200, {
        "Content-Type": TIPOS[".json"],
        "Cache-Control": "no-store"
    });
    resposta.end(JSON.stringify(DEPURACAO));
}

const servidor = http.createServer(function (requisicao, resposta) {
    const caminhoPedido = decodeURIComponent(requisicao.url.split("?")[0]);

    if (caminhoPedido === CAMINHO_DA_DEPURACAO) {
        responderDepuracao(resposta);
        return;
    }

    const relativo = caminhoPedido === "/" ? "index.html" : caminhoPedido.slice(1);
    const destino = path.join(RAIZ, path.normalize(relativo));

    // impede sair da pasta do projeto
    if (!destino.startsWith(RAIZ)) {
        resposta.writeHead(403);
        resposta.end("acesso negado");
        return;
    }

    fs.readFile(destino, function (erro, conteudo) {
        if (erro) {
            resposta.writeHead(404, {"Content-Type": "text/plain; charset=utf-8"});
            resposta.end("não encontrado: " + relativo);
            return;
        }

        const tipo = TIPOS[path.extname(destino)] || "application/octet-stream";
        resposta.writeHead(200, {"Content-Type": tipo});
        resposta.end(conteudo);
    });
});

function anunciarDepuracao() {
    const ligadas = OPCOES_DE_DEPURACAO.filter(function (chave) {
        return DEPURACAO[chave];
    });

    if (ligadas.length === 0) {
        console.log("trilha final: nenhuma opção de depuração ligada");
        return;
    }

    console.log("DEPURAÇÃO ligada: " + ligadas.join(", "));
}

servidor.listen(PORTA, function () {
    console.log("jogo em http://localhost:" + PORTA);
    anunciarDepuracao();
});
