// Contador de quadros por segundo
//
// Roda em paralelo, por cima de todas as cenas, enquanto a configuração
// estiver ligada. Serve para medir o RNF02 na máquina da avaliação.
//
// Fica no canto de cima, à esquerda, acima dos textos das barras, que começam
// na altura 13.

import {lerConfiguracoes} from "../dados/configuracoes.js";
import {COR, FONTE} from "../dados/tema.js";

const INTERVALO_EM_MS = 250;

// Liga ou desliga o contador conforme a configuração salva
export function aplicarFps(cena) {
    const ligado = lerConfiguracoes().mostrarFps;
    const ativo = cena.scene.isActive("CenaFPS");

    if (ligado && !ativo) {
        cena.scene.launch("CenaFPS");
    } else if (!ligado && ativo) {
        cena.scene.stop("CenaFPS");
    }
}

export class CenaFPS extends Phaser.Scene {

    constructor() {
        super({key: "CenaFPS"});
    }

    create() {
        this.texto = this.add.text(0, 0, "", {
            fontFamily: FONTE,
            fontSize: "9px",
            color: COR.textoInvertido,
            backgroundColor: COR.contorno,
            padding: {x: 4, y: 1}
        });
        this.proximaLeitura = 0;
    }

    // Toda cena que abre por cima chama bringToTop; o contador volta para o
    // topo no quadro seguinte
    update(tempo) {
        if (tempo >= this.proximaLeitura) {
            this.texto.setText(Math.round(this.game.loop.actualFps) + " FPS");
            this.proximaLeitura = tempo + INTERVALO_EM_MS;
        }

        const cenas = this.game.scene.scenes;
        if (cenas[cenas.length - 1] !== this) {
            this.scene.bringToTop();
        }
    }
}
