// Lista de opções
//
// Componente compartilhado pelas cenas de evento.
//
// Linhas navegáveis por seta, confirmadas por ENTER ou por clique,
// com modo de marcação para as escolhas múltiplas do Planning e
// da Retrospective.

import {COR, COR_HEX, FONTE} from "../dados/tema.js";
import {personalizar} from "../dados/texto.js";
import {tocarEfeito} from "../ui/som.js";

const ALTURA_DA_LINHA = 40;
const ESPACO_ENTRE_LINHAS = 6;
const MARGEM_INTERNA = 12;
const LARGURA_DA_MARCA = 18;

// Abaixo desta altura a linha usa fonte menor
const ALTURA_CONFORTAVEL = 34;

// Cópia das opções em ordem aleatória.
export function embaralhar(opcoes) {
    return Phaser.Utils.Array.Shuffle(opcoes.slice());
}

export class ListaDeOpcoes {

    constructor(cena, config) {
        this.cena = cena;
        this.x = config.x;
        this.y = config.y;
        this.largura = config.largura;
        this.multipla = Boolean(config.multipla);
        this.comoFala = Boolean(config.comoFala);
        this.centralizar = Boolean(config.centralizar);
        this.aoConfirmar = config.aoConfirmar;
        this.alturaDaLinha = config.alturaDaLinha || ALTURA_DA_LINHA;
        this.espaco = config.espaco === undefined ? ESPACO_ENTRE_LINHAS : config.espaco;
        this.visiveis = config.visiveis || 0;
        this.opcoes = [];
        this.linhas = [];
        this.indice = 0;
        this.deslocamento = 0;

        this.definirOpcoes(config.opcoes || []);
    }

    // Quantas linhas cabem de cada vez; zero significa todas
    get janela() {
        return this.visiveis > 0 ? Math.min(this.visiveis, this.opcoes.length) : this.opcoes.length;
    }

    definirOpcoes(opcoes) {
        this.opcoes = opcoes;
        this.indice = Phaser.Math.Clamp(this.indice, 0, Math.max(opcoes.length - 1, 0));
        this.ajustarDeslocamento();
        this.desenhar();
    }

    // Mantém a linha do cursor dentro da janela visível
    ajustarDeslocamento() {
        const janela = this.janela;
        if (janela === 0) {
            this.deslocamento = 0;
            return false;
        }

        const anterior = this.deslocamento;
        const maximo = Math.max(this.opcoes.length - janela, 0);

        if (this.indice < this.deslocamento) {
            this.deslocamento = this.indice;
        } else if (this.indice >= this.deslocamento + janela) {
            this.deslocamento = this.indice - janela + 1;
        }

        this.deslocamento = Phaser.Math.Clamp(this.deslocamento, 0, maximo);
        return this.deslocamento !== anterior;
    }

    desenhar() {
        this.linhas.forEach(function (linha) {
            linha.container.destroy();
        });
        this.linhas = [];

        const janela = this.janela;
        const visiveis = this.opcoes.slice(this.deslocamento, this.deslocamento + janela);

        visiveis.forEach(function (opcao, posicao) {
            this.linhas.push(this.criarLinha(opcao, this.deslocamento + posicao, posicao));
        }, this);

        this.desenharIndicadores();
        this.atualizarDestaque();
    }

    // O aviso de rolagem fica dentro da área da lista, abaixo da última linha
    // visível.
    desenharIndicadores() {
        this.destruirIndicadores();

        const restantes = this.opcoes.length - this.janela;

        if (restantes <= 0) {
            return;
        }

        const acima = this.deslocamento;
        const abaixo = restantes - this.deslocamento;
        const partes = [];

        if (acima > 0) {
            partes.push("\u25b2 mais " + acima + " acima");
        }

        if (abaixo > 0) {
            partes.push("\u25bc mais " + abaixo + " abaixo");
        }

        this.indicador = this.cena.add.text(
            this.x + this.largura / 2,
            this.y + this.alturaDaJanela + 4,
            partes.join("    "),
            {fontFamily: FONTE, fontSize: "10px", color: COR.destaque}
        ).setOrigin(0.5, 0).setDepth(806);
    }

    destruirIndicadores() {
        if (this.indicador) {
            this.indicador.destroy();
            this.indicador = null;
        }
    }

    // Altura ocupada pelas linhas visíveis, sem o espaço da última
    get alturaDaJanela() {
        return this.janela * (this.alturaDaLinha + this.espaco) - this.espaco;
    }

    criarLinha(opcao, indice, posicao) {
        const cena = this.cena;
        const y = this.y + posicao * (this.alturaDaLinha + this.espaco);
        const container = cena.add.container(this.x, y).setDepth(805);

        const fundo = cena.add.rectangle(0, 0, this.largura, this.alturaDaLinha, COR_HEX.painel);
        fundo.setOrigin(0, 0);
        fundo.setStrokeStyle(1, COR_HEX.contornoSuave);

        const elementos = [fundo];
        let esquerda = MARGEM_INTERNA;

        if (this.multipla) {
            const marca = cena.add.rectangle(
                MARGEM_INTERNA, this.alturaDaLinha / 2 - 7, 14, 14, COR_HEX.painelSuave
            );
            marca.setOrigin(0, 0);
            marca.setStrokeStyle(1, COR_HEX.contornoSuave);
            elementos.push(marca);
            esquerda += LARGURA_DA_MARCA + 6;
            container.setData("marca", marca);
        }

        const compacta = this.alturaDaLinha < ALTURA_CONFORTAVEL;
        const alturaDoTitulo = compacta ? 12 : 13;

        // Centralizado, o título usa a largura da linha inteira, como num botão
        const titulo = cena.add.text(
            this.centralizar ? this.largura / 2 : esquerda,
            this.topoDoTitulo(opcao, compacta),
            personalizar(cena.registry, this.comoFala ? "— " + opcao.titulo : opcao.titulo), {
                fontFamily: FONTE,
                fontSize: alturaDoTitulo + "px",
                color: COR.texto,
                align: this.centralizar ? "center" : "left",
                wordWrap: {width: this.largura - esquerda - MARGEM_INTERNA - 60}
            });

        if (this.centralizar) {
            titulo.setOrigin(0.5, 0);
        }
        elementos.push(titulo);

        if (opcao.detalhe) {
            elementos.push(cena.add.text(
                esquerda, this.alturaDaLinha - (compacta ? 13 : 16), personalizar(cena.registry, opcao.detalhe), {
                    fontFamily: FONTE,
                    fontSize: compacta ? "9px" : "11px",
                    color: COR.textoSecundario
                }
            ));
        }

        if (opcao.sufixo) {
            elementos.push(cena.add.text(
                this.largura - MARGEM_INTERNA, this.alturaDaLinha / 2 - 7, opcao.sufixo,
                {fontFamily: FONTE, fontSize: "12px", color: COR.textoSecundario}
            ).setOrigin(1, 0));
        }

        container.add(elementos);
        container.setSize(this.largura, this.alturaDaLinha);

        container.setInteractive(
            new Phaser.Geom.Rectangle(
                container.displayOriginX, container.displayOriginY,
                this.largura, this.alturaDaLinha
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

    topoDoTitulo(opcao, compacta) {
        if (!opcao.detalhe) {
            return this.alturaDaLinha / 2 - 8;
        }

        return compacta ? 2 : 4;
    }

    atualizarDestaque() {
        this.linhas.forEach(function (linha, posicao) {
            const selecionada = posicao + this.deslocamento === this.indice;
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

        const antes = this.indice;
        this.indice = Phaser.Math.Clamp(this.indice + passo, 0, this.opcoes.length - 1);
        if (this.indice !== antes) {
            tocarEfeito(this.cena, "cursor");
        }
        if (this.ajustarDeslocamento()) {
            this.desenhar();
            return;
        }
        this.atualizarDestaque();
    }

    // Põe o cursor numa linha, rolando a janela se ela estiver fora da vista
    selecionar(indice) {
        if (this.opcoes.length === 0) {
            return;
        }

        this.indice = Phaser.Math.Clamp(indice, 0, this.opcoes.length - 1);
        if (this.ajustarDeslocamento()) {
            this.desenhar();
            return;
        }
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
        tocarEfeito(this.cena, "confirmar");
        this.aoConfirmar(opcao, this.indice);
    }

    destruir() {
        this.linhas.forEach(function (linha) {
            linha.container.destroy();
        });
        this.linhas = [];
        this.destruirIndicadores();
    }
}

export const ALTURA_DA_OPCAO = ALTURA_DA_LINHA + ESPACO_ENTRE_LINHAS;