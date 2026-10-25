// Cena global
//
// Roda o tempo todo, por baixo das outras, sem desenhar nada. Começa a
// música, mede o FPS da sessão para o diário e atende a tecla das
// configurações em qualquer tela: abre por cima da cena que estiver no topo
// e, se as configurações já estiverem abertas, fecha.
//
// Também avisa a conquista na hora em que ela sai, com o som de conquista: a
// faixa é desenhada na cena do topo e, se essa cena fechar antes do fim,
// passa para a que ficar no topo, pelo tempo que faltava.

import {iniciarMusica, tocarEfeito} from "../ui/som.js";
import {DURACAO_DO_AVISO, desenharAviso} from "../ui/AvisoDeConquista.js";
import {abrirConfiguracoes} from "./CenaConfiguracoes.js";
import {registrarFps} from "../dados/diario.js";
import {EVENTO_DE_CONQUISTA} from "../dados/progresso.js";

// menos que isso, não vale redesenhar o aviso em outra cena
const SOBRA_MINIMA_DO_AVISO = 500;

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
        this.aviso = null;
        this.registry.events.on(EVENTO_DE_CONQUISTA, this.avisarConquistas, this);
    }

    // uma conquista nova junta-se à que ainda está na tela, e a contagem recomeça
    avisarConquistas(obtidas) {
        const anterior = this.aviso && this.aviso.fim > this.time.now ? this.aviso : null;

        if (anterior) {
            anterior.objetos.forEach(function (objeto) {
                objeto.destroy();
            });
        }
        tocarEfeito(this, "conquista");
        this.aviso = {
            obtidas: (anterior ? anterior.obtidas : []).concat(obtidas),
            fim: this.time.now + DURACAO_DO_AVISO,
            objetos: []
        };
        this.mostrarAviso(true);
    }

    mostrarAviso(entrar) {
        const aviso = this.aviso;
        const topo = this.cenaDoTopo();
        const restante = aviso ? aviso.fim - this.time.now : 0;

        if (!aviso || !topo || restante < SOBRA_MINIMA_DO_AVISO) {
            return;
        }

        aviso.objetos = desenharAviso(topo, aviso.obtidas, restante, entrar);
        topo.events.once("shutdown", function () {
            // na próxima volta, outra cena já está no topo
            this.time.delayedCall(0, function () {
                if (this.aviso === aviso) {
                    this.mostrarAviso(false);
                }
            }, [], this);
        }, this);
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
