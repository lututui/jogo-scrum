// Cena de carregamento

import {ELENCO} from "../dados/elenco.js";
import {CADEIRAS} from "../dados/cadeiras.js";
import {COR, FONTE} from "../dados/tema.js";

const LARGURA_CORPO = 32;
const ALTURA_CORPO = 32;
const LARGURA_RETRATO = 72;
const ALTURA_RETRATO = 96;

export class CenaCarregamento extends Phaser.Scene {

    constructor() {
        super({key: "CenaCarregamento"});
    }

    preload() {
        this.mostrarAviso();

        const personagens = ELENCO.map(function (npc) {
            return npc.chave;
        }).concat(Object.keys(CADEIRAS).map(function (cadeira) {
            return "jogador_" + cadeira;
        }));

        personagens.forEach(function (chave) {
            this.load.spritesheet("corpo_" + chave, "assets/corpo_" + chave + ".png", {
                frameWidth: LARGURA_CORPO,
                frameHeight: ALTURA_CORPO
            });
            this.load.spritesheet("retrato_" + chave, "assets/retrato_" + chave + ".png", {
                frameWidth: LARGURA_RETRATO,
                frameHeight: ALTURA_RETRATO
            });
        }, this);

        this.load.image("chao", "assets/chao.png");
        this.load.image("parede", "assets/parede.png");
        this.load.image("mesa", "assets/mesa.png");
        this.load.image("quadro_parede", "assets/quadro_parede.png");

        this.personagens = personagens;
    }

    mostrarAviso() {
        this.add.text(480, 270, "carregando", {
            fontFamily: FONTE,
            fontSize: "16px",
            color: COR.textoSecundario
        }).setOrigin(0.5);
    }

    create() {
        this.criarAnimacoes();
        this.scene.start("CenaEscritorio");
    }

    // Cada folha tem três quadros: parado, passo A, passo B
    criarAnimacoes() {
        this.personagens.forEach(function (chave) {
            this.anims.create({
                key: chave + "_parado",
                frames: [{key: "corpo_" + chave, frame: 0}],
                frameRate: 1
            });
            this.anims.create({
                key: chave + "_andando",
                frames: this.anims.generateFrameNumbers("corpo_" + chave, {frames: [1, 0, 2, 0]}),
                frameRate: 8,
                repeat: -1
            });
        }, this);
    }
}
