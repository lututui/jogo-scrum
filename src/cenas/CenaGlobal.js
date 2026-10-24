// Cena global
//
// Roda o tempo todo, por baixo das outras, sem desenhar nada. Começa a
// música e atende a tecla das configurações em qualquer tela: abre por cima
// da cena que estiver no topo e, se as configurações já estiverem abertas,
// fecha.

import {iniciarMusica} from "../ui/som.js";
import {abrirConfiguracoes} from "./CenaConfiguracoes.js";

export const TECLA_DAS_CONFIGURACOES = Phaser.Input.Keyboard.KeyCodes.O;

// cenas que não recebem as configurações por cima
const FORA = ["CenaGlobal", "CenaFPS", "CenaCarregamento"];

export class CenaGlobal extends Phaser.Scene {

    constructor() {
        super({key: "CenaGlobal"});
    }

    create() {
        this.scene.sendToBack();
        iniciarMusica(this);
        this.tecla = this.input.keyboard.addKey(TECLA_DAS_CONFIGURACOES);
    }

    // a primeira cena ativa de cima para baixo, fora as de serviço
    cenaDoTopo() {
        return this.scene.manager.getScenes(true, true).find(function (cena) {
            return FORA.indexOf(cena.scene.key) < 0;
        }) || null;
    }

    update() {
        if (!Phaser.Input.Keyboard.JustDown(this.tecla)) {
            return;
        }

        const topo = this.cenaDoTopo();
        if (!topo) {
            return;
        }
        if (topo.scene.key === "CenaConfiguracoes") {
            topo.fechar();
            return;
        }
        abrirConfiguracoes(topo);
    }
}
