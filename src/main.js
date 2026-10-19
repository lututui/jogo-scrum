// Configuração do Phaser

import {carregarDepuracao} from "./dados/depuracao.js";
import {COR} from "./dados/tema.js";
import {CenaCarregamento} from "./cenas/CenaCarregamento.js";
import {CenaSelecaoDePapel} from "./cenas/CenaSelecaoDePapel.js";
import {CenaEscritorio} from "./cenas/CenaEscritorio.js";
import {CenaKanban} from "./cenas/CenaKanban.js";
import {CenaAgenda} from "./cenas/CenaAgenda.js";
import {CenaSprintPlanning} from "./cenas/CenaSprintPlanning.js";
import {CenaDailyScrum} from "./cenas/CenaDailyScrum.js";
import {CenaSprintReview} from "./cenas/CenaSprintReview.js";
import {CenaSprintRetrospective} from "./cenas/CenaSprintRetrospective.js";
import {CenaEventoContextual} from "./cenas/CenaEventoContextual.js";
import {CenaSintese} from "./cenas/CenaSintese.js";

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
        autoCenter: Phaser.Scale.CENTER_BOTH,
        autoRound: true,
        expandParent: false
    },
    physics: {
        default: "arcade",
        arcade: {debug: false}
    },
    scene: [
        CenaCarregamento,
        CenaSelecaoDePapel,
        CenaEscritorio,
        CenaKanban,
        CenaAgenda,
        CenaSprintPlanning,
        CenaDailyScrum,
        CenaSprintReview,
        CenaSprintRetrospective,
        CenaEventoContextual,
        CenaSintese
    ]
};

await carregarDepuracao();

new Phaser.Game(configuracao);