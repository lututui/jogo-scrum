// Medidores na barra do topo
//
// Três barras curtas com o estado do valor entregue, da confiança do cliente
// e da saúde do time.
//
// Qualquer estratégia que maximize um deles derruba os outros.

import {MEDIDORES} from "../dados/progresso.js";
import {COR, COR_HEX, FONTE} from "../dados/tema.js";

const LARGURA_DA_BARRA = 52;
const ALTURA_DA_BARRA = 8;
const ESPACO_ENTRE_MEDIDORES = 76;
const LIMITE_BAIXO = 35;

export class MedidoresHUD {

    constructor(cena, x, y) {
        this.cena = cena;
        this.x = x;
        this.y = y;
        this.barras = {};
        this.montar();
    }

    montar() {
        Object.keys(MEDIDORES).forEach(function (chave, posicao) {
            const x = this.x + posicao * ESPACO_ENTRE_MEDIDORES;

            const rotulo = this.cena.add.text(x, this.y, this.sigla(chave), {
                fontFamily: FONTE,
                fontSize: "9px",
                color: COR.textoSecundario
            }).setDepth(9002).setScrollFactor(0);

            const fundo = this.cena.add.rectangle(
                x, this.y + 12, LARGURA_DA_BARRA, ALTURA_DA_BARRA, COR_HEX.painelSuave
            ).setOrigin(0, 0).setDepth(9002).setScrollFactor(0);
            fundo.setStrokeStyle(1, COR_HEX.contornoSuave);

            const barra = this.cena.add.rectangle(
                x + 1, this.y + 13, LARGURA_DA_BARRA - 2, ALTURA_DA_BARRA - 2, COR_HEX.destaque
            ).setOrigin(0, 0).setDepth(9003).setScrollFactor(0);

            this.barras[chave] = {barra: barra, rotulo: rotulo};
        }, this);
    }

    sigla(chave) {
        return MEDIDORES[chave].nome.split(" ")[0].toUpperCase();
    }

    atualizar(medidores) {
        Object.keys(this.barras).forEach(function (chave) {
            const valor = medidores[chave];
            const cheio = (LARGURA_DA_BARRA - 2) * (valor / 100);

            this.barras[chave].barra.width = Math.max(cheio, 1);
            this.barras[chave].barra.setFillStyle(
                valor < LIMITE_BAIXO ? COR_HEX.alerta : COR_HEX.destaque
            );
        }, this);
    }
}
