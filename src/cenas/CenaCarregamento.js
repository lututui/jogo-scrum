// Cena de carregamento

import {ELENCO, imagensDoEscritorio} from "../dados/elenco.js";
import {COR, FONTE} from "../dados/tema.js";
import {carregarLogo} from "../ui/logo.js";
import {aplicarPerfil, carregarCamadas, criarAnimacoesDoCorpo} from "../ui/montarJogador.js";
import {carregarSons} from "../ui/som.js";
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
        carregarSons(this);
        carregarLogo(this);

        ["chao", "parede", "quadro_parede", "mesa_redonda"].concat(imagensDoEscritorio()).forEach(function (nome) {
            this.load.image(nome, "assets/" + nome + ".png");
        }, this);

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
        aplicarPerfil(this);
        aplicarFps(this);
        this.scene.launch("CenaGlobal");
        this.scene.start("CenaMenu");
    }

    // Cada folha tem três quadros: parado, passo A, passo B
    criarAnimacoes() {
        this.personagens.forEach(function (chave) {
            criarAnimacoesDoCorpo(this, chave);
        }, this);
    }
}
