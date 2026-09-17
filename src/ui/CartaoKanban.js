// Cartão do quadro Kanban
//
// Cada cartão é um contêiner com faixa de tipo, rótulo, título e etiquetas.
// A faixa colorida à esquerda é o que identifica o tipo

import {COR, COR_HEX, FONTE, TIPO_DE_ITEM} from "../dados/tema.js";

export const LARGURA_CARTAO = 206;
export const ALTURA_CARTAO = 58;

const LARGURA_DA_FAIXA = 5;
const MARGEM_INTERNA = 12;

export class CartaoKanban {

    constructor(cena, item) {
        this.cena = cena;
        this.item = item;
        this.tipo = TIPO_DE_ITEM[item.tipo];
        this.montar();
    }

    montar() {
        const cena = this.cena;
        this.container = cena.add.container(0, 0);

        this.fundo = cena.add.rectangle(0, 0, LARGURA_CARTAO, ALTURA_CARTAO, COR_HEX.painel);
        this.fundo.setOrigin(0, 0);
        this.fundo.setStrokeStyle(1, COR_HEX.contornoSuave);

        this.faixa = cena.add.rectangle(0, 0, LARGURA_DA_FAIXA, ALTURA_CARTAO, this.tipo.corHex);
        this.faixa.setOrigin(0, 0);

        this.rotuloTipo = cena.add.text(MARGEM_INTERNA, 8, this.tipo.rotulo, {
            fontFamily: FONTE,
            fontSize: "10px",
            color: this.tipo.cor
        });

        this.titulo = cena.add.text(MARGEM_INTERNA, 21, this.item.titulo, {
            fontFamily: FONTE,
            fontSize: "12px",
            color: COR.texto,
            lineSpacing: 2,
            wordWrap: {width: LARGURA_CARTAO - MARGEM_INTERNA * 2}
        });

        this.container.add([this.fundo, this.faixa, this.rotuloTipo, this.titulo]);
        this.montarEtiquetas();

        this.container.setSize(LARGURA_CARTAO, ALTURA_CARTAO);

        // Ajustar a área clicável
        this.container.setInteractive(
            new Phaser.Geom.Rectangle(
                this.container.displayOriginX,
                this.container.displayOriginY,
                LARGURA_CARTAO,
                ALTURA_CARTAO
            ),
            Phaser.Geom.Rectangle.Contains
        );
        this.container.setData("cartao", this);
        this.container.input.cursor = "pointer";
        cena.input.setDraggable(this.container);

        this.container.on("pointerdown", function () {
            cena.selecionarCartao(this);
        }, this);
    }

    montarEtiquetas() {
        let direita = LARGURA_CARTAO - MARGEM_INTERNA;
        const y = 6;

        this.item.etiquetas.slice().reverse().forEach(function (etiqueta) {
            const texto = this.cena.add.text(0, y + 3, etiqueta, {
                fontFamily: FONTE,
                fontSize: "9px",
                color: COR.textoSecundario
            });

            const largura = texto.width + 10;
            const chip = this.cena.add.rectangle(
                direita - largura, y, largura, 14, COR_HEX.painelSuave
            );
            chip.setOrigin(0, 0);
            chip.setStrokeStyle(1, COR_HEX.contornoSuave);
            texto.setPosition(direita - largura + 5, y + 3);

            this.container.add([chip, texto]);
            direita -= largura + 6;
        }, this);
    }

    posicionar(x, y) {
        this.container.setPosition(x, y);
        this.posicaoEmRepouso = {x: x, y: y};
    }

    voltarAoLugar() {
        if (this.posicaoEmRepouso) {
            this.container.setPosition(this.posicaoEmRepouso.x, this.posicaoEmRepouso.y);
        }
    }

    // Selecionado é o cartão sob o cursor do teclado
    // Arrastado é o que está preso ao ponteiro.
    definirEstado(selecionado, arrastado) {
        if (arrastado) {
            this.fundo.setStrokeStyle(3, COR_HEX.destaque);
            this.fundo.setFillStyle(COR_HEX.painel);
            this.container.setDepth(500);
            return;
        }

        this.container.setDepth(10);

        if (selecionado) {
            this.fundo.setStrokeStyle(3, COR_HEX.destaque);
            this.fundo.setFillStyle(COR_HEX.selecao);
        } else {
            this.fundo.setStrokeStyle(1, COR_HEX.contornoSuave);
            this.fundo.setFillStyle(COR_HEX.painel);
        }
    }

    destruir() {
        this.container.destroy();
    }
}