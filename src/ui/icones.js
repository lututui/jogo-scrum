// Ícones em pixels
//
// Desenhos pequenos, um caractere por pixel (# é o desenho), viram texturas
// com um contorno claro em volta, que deixa o ícone visível sobre qualquer
// cor. Cada textura é criada uma vez por jogo.

import {COR_HEX} from "../dados/tema.js";

// cadeado dos desbloqueáveis, fechado e aberto
const DESENHOS = {
    cadeado_fechado: [
        "..####..",
        ".#....#.",
        ".#....#.",
        ".#....#.",
        "########",
        "###..###",
        "###..###",
        "########"
    ],
    cadeado_aberto: [
        "..####..",
        ".#....#.",
        ".#......",
        ".#......",
        "########",
        "###..###",
        "###..###",
        "########"
    ]
};

function corCss(cor) {
    return "#" + cor.toString(16).padStart(6, "0");
}

// desenha pixel a pixel, para as diagonais saírem nítidas
export function criarTexturaDePixels(cena, chave, largura, altura, corDoPixel) {
    if (cena.textures.exists(chave)) {
        return;
    }

    const textura = cena.textures.createCanvas(chave, largura, altura);
    const contexto = textura.getContext();
    for (let y = 0; y < altura; y++) {
        for (let x = 0; x < largura; x++) {
            const cor = corDoPixel(x, y);
            if (cor !== null) {
                contexto.fillStyle = corCss(cor);
                contexto.fillRect(x, y, 1, 1);
            }
        }
    }
    textura.refresh();
}

export function criarIcone(cena, chave, desenho) {
    const cheio = function (x, y) {
        return desenho[y] !== undefined && desenho[y][x] === "#";
    };
    criarTexturaDePixels(cena, chave, desenho[0].length, desenho.length, function (x, y) {
        if (cheio(x, y)) {
            return COR_HEX.contorno;
        }
        const vizinho = cheio(x - 1, y) || cheio(x + 1, y) || cheio(x, y - 1) || cheio(x, y + 1);
        return vizinho ? COR_HEX.painel : null;
    });
}

// "cadeado_fechado" e "cadeado_aberto"
export function criarCadeados(cena) {
    Object.keys(DESENHOS).forEach(function (chave) {
        criarIcone(cena, chave, DESENHOS[chave]);
    });
}

export function chaveDoCadeado(aberto) {
    return aberto ? "cadeado_aberto" : "cadeado_fechado";
}

// ao lado de texto, o cadeado vai em dobro, para dar para ver se está aberto
export const ESCALA_DO_CADEADO = 2;
