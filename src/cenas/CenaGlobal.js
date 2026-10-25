// Cena global
//
// Roda o tempo todo, por baixo das outras, sem desenhar nada. Começa a
// música, mede o FPS da sessão para o diário e atende a tecla das
// configurações em qualquer tela: abre por cima da cena que estiver no topo
// e, se as configurações já estiverem abertas, fecha.

import {iniciarMusica} from "../ui/som.js";
import {abrirConfiguracoes} from "./CenaConfiguracoes.js";
import {registrarFps} from "../dados/diario.js";

export const TECLA_DAS_CONFIGURACOES = Phaser.Input.Keyboard.KeyCodes.O;

// cenas que não recebem as configurações por cima
const FORA = ["CenaGlobal", "CenaFPS", "CenaCarregamento"];

export class CenaGlobal extends Phaser.Scene {

    constructor() {
        super({key: "CenaGlobal"});
    }

    create() {
        this.fps = {soma: 0, amostras: 0, minimo: Infinity, proxima: 0};
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

    // uma amostra por segundo; o diário guarda média e mínimo a cada dez
    medirFps(tempo) {
        if (tempo < this.fps.proxima) {
            return;
        }
        this.fps.proxima = tempo + 1000;
        const valor = this.game.loop.actualFps;
        this.fps.soma += valor;
        this.fps.amostras += 1;
        this.fps.minimo = Math.min(this.fps.minimo, valor);
        if (this.fps.amostras % 10 === 0) {
            registrarFps(this.fps.soma / this.fps.amostras, this.fps.minimo);
        }
    }

    update(tempo) {
        this.medirFps(tempo);
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
