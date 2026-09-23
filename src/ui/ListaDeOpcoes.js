// Lista de opções
//
// Componente compartilhado pelas cenas de evento.
//
// Linhas navegáveis por seta, confirmadas por ENTER ou por clique,
// com modo de marcação para as escolhas múltiplas do Planning e
// da Retrospective.

import {COR, COR_HEX, FONTE} from "../dados/tema.js";

const ALTURA_DA_LINHA = 40;
const ESPACO_ENTRE_LINHAS = 6;
const MARGEM_INTERNA = 12;
const LARGURA_DA_MARCA = 18;

export class ListaDeOpcoes {

    constructor(cena, config) {
        this.cena = cena;
        this.x = config.x;
        this.y = config.y;
        this.largura = config.largura;
        this.multipla = Boolean(config.multipla);
        this.aoConfirmar = config.aoConfirmar;
        this.opcoes = [];
        this.linhas = [];
        this.indice = 0;

        this.definirOpcoes(config.opcoes || []);
    }

    definirOpcoes(opcoes) {
        this.opcoes = opcoes;
        this.indice = Phaser.Math.Clamp(this.indice, 0, Math.max(opcoes.length - 1, 0));
        this.desenhar();
    }

    desenhar() {
        this.linhas.forEach(function (linha) {
            linha.container.destroy();
        });
        this.linhas = [];

        this.opcoes.forEach(function (opcao, indice) {
            this.linhas.push(this.criarLinha(opcao, indice));
        }, this);

        this.atualizarDestaque();
    }

    criarLinha(opcao, indice) {
        const cena = this.cena;
        const y = this.y + indice * (ALTURA_DA_LINHA + ESPACO_ENTRE_LINHAS);
        const container = cena.add.container(this.x, y);

        const fundo = cena.add.rectangle(0, 0, this.largura, ALTURA_DA_LINHA, COR_HEX.painel);
        fundo.setOrigin(0, 0);
        fundo.setStrokeStyle(1, COR_HEX.contornoSuave);

        const elementos = [fundo];
        let esquerda = MARGEM_INTERNA;

        if (this.multipla) {
            const marca = cena.add.rectangle(
                MARGEM_INTERNA, ALTURA_DA_LINHA / 2 - 7, 14, 14, COR_HEX.painelSuave
            );
            marca.setOrigin(0, 0);
            marca.setStrokeStyle(1, COR_HEX.contornoSuave);
            elementos.push(marca);
            esquerda += LARGURA_DA_MARCA + 6;
            container.setData("marca", marca);
        }

        const titulo = cena.add.text(esquerda, 5, opcao.titulo, {
            fontFamily: FONTE,
            fontSize: "13px",
            color: COR.texto,
            wordWrap: {width: this.largura - esquerda - MARGEM_INTERNA - 60}
        });
        elementos.push(titulo);

        if (opcao.detalhe) {
            elementos.push(cena.add.text(esquerda, ALTURA_DA_LINHA - 16, opcao.detalhe, {
                fontFamily: FONTE,
                fontSize: "11px",
                color: COR.textoSecundario
            }));
        }

        if (opcao.sufixo) {
            elementos.push(cena.add.text(
                this.largura - MARGEM_INTERNA, ALTURA_DA_LINHA / 2 - 7, opcao.sufixo,
                {fontFamily: FONTE, fontSize: "12px", color: COR.textoSecundario}
            ).setOrigin(1, 0));
        }

        container.add(elementos);
        container.setSize(this.largura, ALTURA_DA_LINHA);

        container.setInteractive(
            new Phaser.Geom.Rectangle(
                container.displayOriginX, container.displayOriginY,
                this.largura, ALTURA_DA_LINHA
            ),
            Phaser.Geom.Rectangle.Contains
        );
        container.input.cursor = "pointer";
        container.on("pointerdown", function () {
            this.indice = indice;
            this.atualizarDestaque();
            this.confirmar();
        }, this);

        return {container: container, fundo: fundo, opcao: opcao};
    }

    atualizarDestaque() {
        this.linhas.forEach(function (linha, indice) {
            const selecionada = indice === this.indice;
            linha.fundo.setStrokeStyle(selecionada ? 3 : 1,
                selecionada ? COR_HEX.destaque : COR_HEX.contornoSuave);
            linha.fundo.setFillStyle(selecionada ? COR_HEX.selecao : COR_HEX.painel);

            const marca = linha.container.getData("marca");
            if (marca) {
                marca.setFillStyle(linha.opcao.marcada ? COR_HEX.destaque : COR_HEX.painelSuave);
            }
        }, this);
    }

    mover(passo) {
        if (this.opcoes.length === 0) {
            return;
        }
        this.indice = Phaser.Math.Clamp(this.indice + passo, 0, this.opcoes.length - 1);
        this.atualizarDestaque();
    }

    selecionada() {
        return this.opcoes[this.indice] || null;
    }

    confirmar() {
        const opcao = this.selecionada();
        if (!opcao || !this.aoConfirmar) {
            return;
        }
        this.aoConfirmar(opcao, this.indice);
    }

    destruir() {
        this.linhas.forEach(function (linha) {
            linha.container.destroy();
        });
        this.linhas = [];
    }
}

export const ALTURA_DA_OPCAO = ALTURA_DA_LINHA + ESPACO_ENTRE_LINHAS;
