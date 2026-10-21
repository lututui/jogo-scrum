// Cena de carregamento

import {APARENCIA_PADRAO} from "../dados/aparencia.js";
import {ELENCO} from "../dados/elenco.js";
import {COR, FONTE} from "../dados/tema.js";
import {carregarCamadas, criarAnimacoesDoCorpo, montarJogador} from "../ui/montarJogador.js";
import {aplicarFps} from "./CenaFPS.js";

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
        });

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

        carregarCamadas(this);

        this.load.image("chao", "assets/chao.png");
        this.load.image("parede", "assets/parede.png");
        this.load.image("mesa", "assets/mesa.png");
        this.load.image("quadro_parede", "assets/quadro_parede.png");
        this.load.image("agenda_parede", "assets/agenda_parede.png");
        this.load.image("mesa_redonda", "assets/mesa_redonda.png");

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
        montarJogador(this, APARENCIA_PADRAO);
        aplicarFps(this);
        this.scene.start("CenaMenu");
    }

    // Cada folha tem três quadros: parado, passo A, passo B
    criarAnimacoes() {
        this.personagens.forEach(function (chave) {
            criarAnimacoesDoCorpo(this, chave);
        }, this);
    }
}
