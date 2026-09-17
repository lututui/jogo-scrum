// Configuração do Phaser

import {COR} from "./dados/tema.js";
import {CenaCarregamento} from "./cenas/CenaCarregamento.js";
import {CenaEscritorio} from "./cenas/CenaEscritorio.js";
import {CenaKanban} from "./cenas/CenaKanban.js";

const LARGURA = 960;
const ALTURA = 540;

const configuracao = {
    type: Phaser.AUTO,
    parent: "jogo",
    width: LARGURA,
    height: ALTURA,
    backgroundColor: COR.fundo,
    pixelArt: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: "arcade",
        arcade: {debug: false}
    },
    scene: [CenaCarregamento, CenaEscritorio, CenaKanban]
};

new Phaser.Game(configuracao);
