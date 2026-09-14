// Configuração do Phaser

import { CenaCarregamento } from "./cenas/CenaCarregamento.js";
import { CenaEscritorio } from "./cenas/CenaEscritorio.js";

const LARGURA = 960;
const ALTURA = 540;
const COR_DE_FUNDO = "#e7ebf4";

const configuracao = {
    type: Phaser.AUTO,
    parent: "jogo",
    width: LARGURA,
    height: ALTURA,
    backgroundColor: COR_DE_FUNDO,
    pixelArt: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: "arcade",
        arcade: { debug: false }
    },
    scene: [CenaCarregamento, CenaEscritorio]
};

new Phaser.Game(configuracao);
