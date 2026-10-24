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
import {CenaGlossario} from "./cenas/CenaGlossario.js";
import {CenaGuia} from "./cenas/CenaGuia.js";
import {CenaMenu} from "./cenas/CenaMenu.js";
import {CenaConfiguracoes} from "./cenas/CenaConfiguracoes.js";
import {CenaFPS} from "./cenas/CenaFPS.js";
import {CenaGlobal} from "./cenas/CenaGlobal.js";
import {CenaFim} from "./cenas/CenaFim.js";
import {CenaEditor} from "./cenas/CenaEditor.js";

const LARGURA = 960;
const ALTURA = 540;

const configuracao = {
    type: Phaser.AUTO,
    parent: "jogo",
    width: LARGURA,
    height: ALTURA,
    backgroundColor: COR.fundo,
    pixelArt: true,
    // o editor de personagem põe campos do HTML por cima do canvas
    dom: {createContainer: true},
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
        CenaMenu,
        CenaSelecaoDePapel,
        CenaEditor,
        CenaEscritorio,
        CenaKanban,
        CenaAgenda,
        CenaSprintPlanning,
        CenaDailyScrum,
        CenaSprintReview,
        CenaSprintRetrospective,
        CenaEventoContextual,
        CenaSintese,
        CenaFim,
        CenaGlossario,
        CenaGuia,
        CenaConfiguracoes,
        CenaFPS,
        CenaGlobal
    ]
};

await carregarDepuracao();

new Phaser.Game(configuracao);