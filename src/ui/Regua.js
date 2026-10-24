// Régua
//
// Trilho com uma marca por valor e um cursor no valor atual. Clicar no
// trilho leva o cursor à marca mais perto; arrastar segue o ponteiro, de
// marca em marca, mesmo fora do trilho. Os valores são índices de 0 a
// quantidade - 1; quem usa a régua traduz para o que precisar.
//
// config: {x, meio, largura, quantidade, indice, profundidade,
//          aoPegar(), aoMudar(indice), aoSoltar(mudou)}

import {COR_HEX} from "../dados/tema.js";

const CURSOR = {largura: 8, altura: 16};
const ALTURA_DA_MARCA = 8;
const ALTURA_DO_ALVO = 22;

export class Regua {

    constructor(cena, config) {
        this.cena = cena;
        this.config = config;
        this.indice = config.indice || 0;
        this.passo = config.largura / (config.quantidade - 1);
        this.arrastando = false;
        this.mudouNoGesto = false;
        this.montar();
        this.definir(this.indice);
    }

    montar() {
        const cena = this.cena;
        const config = this.config;
        const profundidade = config.profundidade || 0;

        this.trilho = cena.add.graphics().setDepth(profundidade);
        this.trilho.fillStyle(COR_HEX.contornoSuave, 1);
        this.trilho.fillRect(config.x, config.meio - 1, config.largura, 2);
        for (let posicao = 0; posicao < config.quantidade; posicao++) {
            this.trilho.fillRect(config.x + posicao * this.passo - 1, config.meio - ALTURA_DA_MARCA / 2,
                2, ALTURA_DA_MARCA);
        }

        this.cursor = cena.add.rectangle(config.x, config.meio, CURSOR.largura, CURSOR.altura, COR_HEX.destaque)
            .setStrokeStyle(1, COR_HEX.contorno).setDepth(profundidade + 1);

        // o alvo cobre meia marca além de cada ponta, para as pontas serem
        // fáceis de pegar
        this.alvo = cena.add.rectangle(config.x - this.passo / 2, config.meio, config.largura + this.passo,
            ALTURA_DO_ALVO).setOrigin(0, 0.5).setDepth(profundidade + 2).setInteractive({useHandCursor: true});

        this.alvo.on("pointerdown", function (ponteiro) {
            this.arrastando = true;
            this.mudouNoGesto = false;
            if (config.aoPegar) {
                config.aoPegar();
            }
            this.seguir(ponteiro);
        }, this);
        cena.input.on("pointermove", function (ponteiro) {
            if (this.arrastando && ponteiro.isDown) {
                this.seguir(ponteiro);
            }
        }, this);
        cena.input.on("pointerup", this.soltar, this);
        cena.input.on("pointerupoutside", this.soltar, this);
    }

    // o índice da marca mais perto do ponteiro
    seguir(ponteiro) {
        const indice = Phaser.Math.Clamp(Math.round((ponteiro.x - this.config.x) / this.passo),
            0, this.config.quantidade - 1);
        if (indice === this.indice) {
            return;
        }
        this.definir(indice);
        this.mudouNoGesto = true;
        this.config.aoMudar(indice);
    }

    soltar() {
        if (!this.arrastando) {
            return;
        }
        this.arrastando = false;
        if (this.config.aoSoltar) {
            this.config.aoSoltar(this.mudouNoGesto);
        }
    }

    // põe o cursor numa marca, sem avisar ninguém
    definir(indice) {
        this.indice = indice;
        this.cursor.setX(this.config.x + indice * this.passo);
    }
}
