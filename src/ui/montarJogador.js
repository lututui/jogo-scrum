// Montagem do jogador
//
// Empilha as folhas de assets/camadas, trocando os marcadores pelas cores da
// aparência, e grava o resultado nas mesmas texturas que as cenas já usam:
// corpo_jogador_<cadeira> e retrato_jogador_<cadeira>.
//
// Na primeira vez cria as texturas e as animações. Depois, redesenha por
// cima das mesmas texturas: os quadros, as animações e os sprites que já
// estão na tela continuam valendo, então dá para trocar a aparência no meio
// do jogo sem parar a caminhada.
//
// A ordem é a de tools/sprites/personagem.py: corpo, as duas peças, cabelo,
// óculos, olhos e crachá.

import {
    MARCADORES,
    MEDIDAS,
    SOBRANCELHA,
    folhasDeCamada,
    ordemDasPecas
} from "../dados/aparencia.js";
import {CADEIRAS} from "../dados/cadeiras.js";
import {EXPRESSOES} from "../dados/expressoes.js";

const PREFIXO = "camada_";

// pixels de cada folha, lidos uma vez
const pixelsDasFolhas = {};

export function carregarCamadas(cena) {
    folhasDeCamada(EXPRESSOES).forEach(function (nome) {
        cena.load.image(PREFIXO + nome, "assets/camadas/" + nome + ".png");
    });
}

// texturas e animações do jogador nas três cadeiras
export function montarJogador(cena, aparencia) {
    Object.keys(CADEIRAS).forEach(function (cadeira) {
        gravarTextura(cena, "corpo_jogador_" + cadeira,
            folhaDoCorpo(cena, aparencia, cadeira), MEDIDAS.largura, MEDIDAS.altura);
        gravarTextura(cena, "retrato_jogador_" + cadeira,
            folhaDoRetrato(cena, aparencia, cadeira), larguraDoRetrato(), alturaDoRetrato());

        if (!cena.anims.exists("jogador_" + cadeira + "_andando")) {
            criarAnimacoesDoCorpo(cena, "jogador_" + cadeira);
        }
    });
}

// ------------------------------------------------------------------
// folhas

// três quadros lado a lado: parado, passo A, passo B
export function folhaDoCorpo(cena, aparencia, cadeira) {
    const folha = novaTela(MEDIDAS.largura * MEDIDAS.quadros, MEDIDAS.altura);

    for (let quadro = 0; quadro < MEDIDAS.quadros; quadro++) {
        const imagem = comporQuadro(cena, aparencia, quadro, EXPRESSOES[0], cadeira);
        folha.getContext("2d").drawImage(imagem, quadro * MEDIDAS.largura, 0);
    }
    return folha;
}

// a cabeça do quadro parado ampliada, uma vez por expressão
export function folhaDoRetrato(cena, aparencia, cadeira) {
    const recorte = MEDIDAS.recorteDoRetrato;
    const folha = novaTela(larguraDoRetrato() * EXPRESSOES.length, alturaDoRetrato());
    const contexto = folha.getContext("2d");

    EXPRESSOES.forEach(function (expressao, indice) {
        const imagem = comporQuadro(cena, aparencia, 0, expressao, cadeira);
        contexto.drawImage(imagem, recorte.x, recorte.y, recorte.largura, recorte.altura,
            indice * larguraDoRetrato(), 0, larguraDoRetrato(), alturaDoRetrato());
    });
    return folha;
}

function larguraDoRetrato() {
    return MEDIDAS.recorteDoRetrato.largura * MEDIDAS.escalaDoRetrato;
}

function alturaDoRetrato() {
    return MEDIDAS.recorteDoRetrato.altura * MEDIDAS.escalaDoRetrato;
}

// ------------------------------------------------------------------
// quadro

export function comporQuadro(cena, aparencia, quadro, expressao, cadeira) {
    const tela = novaTela(MEDIDAS.largura, MEDIDAS.altura);
    const empilhar = function (folha, cores) {
        empilharCamada(cena, tela, folha, quadro, cores);
    };

    empilhar("corpo", [aparencia.pele]);
    ordemDasPecas(aparencia).forEach(function (peca) {
        empilhar(peca.folha, peca.categorias.map(function (categoria) {
            return aparencia[categoria];
        }));
    });
    empilhar("cabelo_" + aparencia.estiloDeCabelo, [aparencia.cabelo]);

    if (aparencia.oculos) {
        empilhar("oculos", [aparencia.oculos]);
    }

    // a sobrancelha depende do que já está embaixo dela
    const fundo = fundoDaSobrancelha(tela, aparencia.pele);
    empilhar("olhos_" + expressao, [corDaSobrancelha(aparencia.cabelo, fundo)]);

    if (cadeira) {
        empilhar("cracha", [CADEIRAS[cadeira].cor]);
    }
    return tela;
}

// recolore um quadro da folha e põe por cima do que já está na tela
function empilharCamada(cena, tela, folha, quadro, cores) {
    const original = pixelsDaFolha(cena, folha);
    const camada = new ImageData(MEDIDAS.largura, MEDIDAS.altura);
    const trocas = cores.map(function (cor, indice) {
        return {de: hexParaRgb(MARCADORES[indice]), para: hexParaRgb(cor)};
    });

    for (let y = 0; y < MEDIDAS.altura; y++) {
        for (let x = 0; x < MEDIDAS.largura; x++) {
            const origem = (y * original.width + quadro * MEDIDAS.largura + x) * 4;
            const destino = (y * MEDIDAS.largura + x) * 4;
            const pixel = trocarMarcador(original.data, origem, trocas);
            camada.data.set(pixel, destino);
        }
    }

    const temporaria = novaTela(MEDIDAS.largura, MEDIDAS.altura);
    temporaria.getContext("2d").putImageData(camada, 0, 0);
    tela.getContext("2d").drawImage(temporaria, 0, 0);
}

// o pixel na cor nova se for exatamente um marcador; senão, como está
function trocarMarcador(dados, inicio, trocas) {
    const pixel = [dados[inicio], dados[inicio + 1], dados[inicio + 2], dados[inicio + 3]];
    if (pixel[3] !== 255) {
        return pixel;
    }

    for (let i = 0; i < trocas.length; i++) {
        const de = trocas[i].de;
        if (pixel[0] === de[0] && pixel[1] === de[1] && pixel[2] === de[2]) {
            return trocas[i].para.concat([255]);
        }
    }
    return pixel;
}

function pixelsDaFolha(cena, folha) {
    if (!pixelsDasFolhas[folha]) {
        const imagem = cena.textures.get(PREFIXO + folha).getSourceImage();
        const tela = novaTela(imagem.width, imagem.height);
        const contexto = tela.getContext("2d");
        contexto.drawImage(imagem, 0, 0);
        pixelsDasFolhas[folha] = contexto.getImageData(0, 0, imagem.width, imagem.height);
    }
    return pixelsDasFolhas[folha];
}

// ------------------------------------------------------------------
// sobrancelha

function fundoDaSobrancelha(tela, pele) {
    const pixel = tela.getContext("2d")
        .getImageData(SOBRANCELHA.amostraX, SOBRANCELHA.amostraY, 1, 1).data;
    if (pixel[3] === 0) {
        return hexParaRgb(pele);
    }
    return [pixel[0], pixel[1], pixel[2]];
}

// a cor do cabelo vem primeiro por ser a mais natural
function corDaSobrancelha(cabelo, fundo) {
    const candidatas = [cabelo, SOBRANCELHA.contorno];
    for (let i = 0; i < candidatas.length; i++) {
        const diferenca = luminancia(hexParaRgb(candidatas[i])) - luminancia(fundo);
        if (Math.abs(diferenca) >= SOBRANCELHA.limiarDeContraste) {
            return candidatas[i];
        }
    }
    return SOBRANCELHA.clara;
}

function luminancia(rgb) {
    return 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];
}

// ------------------------------------------------------------------
// apoio

function hexParaRgb(cor) {
    return [
        parseInt(cor.slice(1, 3), 16),
        parseInt(cor.slice(3, 5), 16),
        parseInt(cor.slice(5, 7), 16)
    ];
}

function novaTela(largura, altura) {
    const tela = document.createElement("canvas");
    tela.width = largura;
    tela.height = altura;
    const contexto = tela.getContext("2d", {willReadFrequently: true});
    contexto.imageSmoothingEnabled = false;
    return tela;
}

// redesenha a textura que já existe; remover e recriar deixaria os sprites
// na tela apontando para quadros destruídos
function gravarTextura(cena, chave, tela, largura, altura) {
    if (cena.textures.exists(chave)) {
        const textura = cena.textures.get(chave);
        textura.context.clearRect(0, 0, textura.width, textura.height);
        textura.context.drawImage(tela, 0, 0);
        textura.refresh();
        return;
    }

    const textura = cena.textures.addCanvas(chave, tela);
    const quadros = tela.width / largura;
    for (let quadro = 0; quadro < quadros; quadro++) {
        textura.add(quadro, 0, quadro * largura, 0, largura, altura);
    }
}

// parado e andando a partir da folha corpo_<chave>
export function criarAnimacoesDoCorpo(cena, chave) {
    cena.anims.create({
        key: chave + "_parado",
        frames: [{key: "corpo_" + chave, frame: 0}],
        frameRate: 1
    });
    cena.anims.create({
        key: chave + "_andando",
        frames: cena.anims.generateFrameNumbers("corpo_" + chave, {frames: [1, 0, 2, 0]}),
        frameRate: 8,
        repeat: -1
    });
}
