// Cena do quadro Kanban
//
// O quadro é aberto pelo quadro da parede do escritório.

import {COLUNAS} from "../dados/quadro.js";
import {lerItensDoQuadro, salvarItensDoQuadro} from "../dados/estadoDoQuadro.js";
import {COR, COR_HEX, FONTE} from "../dados/tema.js";
import {ALTURA_CARTAO, CartaoKanban, LARGURA_CARTAO} from "../ui/CartaoKanban.js";
import {TECLA_DO_GLOSSARIO, abrirGlossario} from "./CenaGlossario.js";

const MARGEM = 20;
const LARGURA_DA_COLUNA = 218;
const ESPACO_ENTRE_COLUNAS = 12;
const TOPO_DA_COLUNA = 72;
const ALTURA_DA_COLUNA = 424;
const ALTURA_DO_CABECALHO = 34;
const ESPACO_ENTRE_CARTOES = 8;
const ALTURA_DO_RODAPE_DA_COLUNA = 22;

// Quantos cartões cabem numa coluna sem passar do fundo dela
function capacidadeDaColuna() {
    const disponivel = ALTURA_DA_COLUNA - ALTURA_DO_CABECALHO
        - ESPACO_ENTRE_CARTOES - ALTURA_DO_RODAPE_DA_COLUNA;
    return Math.floor(disponivel / (ALTURA_CARTAO + ESPACO_ENTRE_CARTOES));
}

export class CenaKanban extends Phaser.Scene {

    constructor() {
        super({key: "CenaKanban"});
    }

    create() {
        this.itens = this.carregarItens();
        this.cartoes = [];
        this.selecao = {coluna: 0, indice: 0};
        this.arrastando = null;

        this.criarFundo();
        this.criarCabecalho();
        this.criarColunas();
        this.criarAviso();
        this.criarDicaDeMover();
        this.criarControles();
        this.desenharCartoes();
    }

    // O estado vem do registry quando o jogador já esteve no quadro antes
    carregarItens() {
        return lerItensDoQuadro(this.registry);
    }

    criarFundo() {
        this.add.rectangle(0, 0, 960, 540, COR_HEX.fundo).setOrigin(0, 0);
    }

    criarCabecalho() {
        const barra = this.add.graphics();
        barra.fillStyle(COR_HEX.painel, 1);
        barra.fillRect(0, 0, 960, 40);
        barra.lineStyle(2, COR_HEX.contorno, 1);
        barra.lineBetween(0, 40, 960, 40);

        const estilo = {fontFamily: FONTE, fontSize: "14px", color: COR.texto};
        this.add.text(MARGEM, 13, "QUADRO KANBAN", estilo);
        this.add.text(480, 13, "SPRINT 1 — DIA 1 DE 10", estilo).setOrigin(0.5, 0);
        this.add.text(940, 13, "ESC PARA VOLTAR", estilo).setOrigin(1, 0);

        this.add.text(
            MARGEM,
            516,
            "setas escolhem o cartão, SHIFT com as setas move o cartão, "
            + "ou arraste com o mouse; G abre o glossário",
            {fontFamily: FONTE, fontSize: "12px", color: COR.textoSecundario}
        );
    }

    // Cada coluna guarda seus elementos para o contador e o alerta de limite
    criarColunas() {
        this.colunas = COLUNAS.map(function (coluna, indice) {
            const x = MARGEM + indice * (LARGURA_DA_COLUNA + ESPACO_ENTRE_COLUNAS);

            const fundo = this.add.rectangle(
                x, TOPO_DA_COLUNA, LARGURA_DA_COLUNA, ALTURA_DA_COLUNA, COR_HEX.painelSuave
            );
            fundo.setOrigin(0, 0);
            fundo.setStrokeStyle(1, COR_HEX.contornoSuave);

            const cabecalho = this.add.rectangle(
                x, TOPO_DA_COLUNA, LARGURA_DA_COLUNA, ALTURA_DO_CABECALHO, COR_HEX.painel
            );
            cabecalho.setOrigin(0, 0);
            cabecalho.setStrokeStyle(1, COR_HEX.contornoSuave);

            const titulo = this.add.text(x + 12, TOPO_DA_COLUNA + 11, coluna.titulo, {
                fontFamily: FONTE,
                fontSize: "12px",
                color: COR.texto
            });

            const contador = this.add.text(x + LARGURA_DA_COLUNA - 12, TOPO_DA_COLUNA + 11, "", {
                fontFamily: FONTE,
                fontSize: "12px",
                color: COR.textoSecundario
            }).setOrigin(1, 0);

            return {
                dados: coluna,
                x: x,
                fundo: fundo,
                cabecalho: cabecalho,
                titulo: titulo,
                contador: contador
            };
        }, this);
    }

    criarDicaDeMover() {
        this.dica = this.add.text(0, 0, "SHIFT + setas move", {
            fontFamily: FONTE,
            fontSize: "10px",
            color: COR.textoInvertido,
            backgroundColor: COR.destaque,
            padding: {x: 5, y: 2}
        }).setOrigin(0.5, 0).setDepth(600).setVisible(false);
    }

    criarAviso() {
        this.aviso = this.add.text(480, 504, "", {
            fontFamily: FONTE,
            fontSize: "12px",
            color: COR.alerta
        }).setOrigin(0.5, 0.5).setDepth(900);
    }

    criarControles() {
        this.teclas = this.input.keyboard.addKeys({
            cima: Phaser.Input.Keyboard.KeyCodes.UP,
            baixo: Phaser.Input.Keyboard.KeyCodes.DOWN,
            esquerda: Phaser.Input.Keyboard.KeyCodes.LEFT,
            direita: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            mover: Phaser.Input.Keyboard.KeyCodes.SHIFT,
            sair: Phaser.Input.Keyboard.KeyCodes.ESC,
            glossario: TECLA_DO_GLOSSARIO
        });

        this.input.on("dragstart", this.aoComecarArrasto, this);
        this.input.on("drag", this.aoArrastar, this);
        this.input.on("dragend", this.aoSoltarArrasto, this);
    }

    // ------------------------------------------------------------
    // desenho

    itensDaColuna(idColuna) {
        return this.itens.filter(function (item) {
            return item.coluna === idColuna;
        });
    }

    desenharCartoes() {
        this.cartoes.forEach(function (cartao) {
            cartao.destruir();
        });
        this.cartoes = [];

        const capacidade = capacidadeDaColuna();

        this.colunas.forEach(function (coluna) {
            const itens = this.itensDaColuna(coluna.dados.id);
            let y = TOPO_DA_COLUNA + ALTURA_DO_CABECALHO + ESPACO_ENTRE_CARTOES;

            itens.slice(0, capacidade).forEach(function (item) {
                const cartao = new CartaoKanban(this, item);
                cartao.posicionar(coluna.x + (LARGURA_DA_COLUNA - LARGURA_CARTAO) / 2, y);
                this.cartoes.push(cartao);
                y += ALTURA_CARTAO + ESPACO_ENTRE_CARTOES;
            }, this);

            this.marcarOcultos(coluna, itens.length - capacidade, y);
        }, this);

        this.ajustarSelecao();
        this.atualizarColunas();
        this.atualizarEstadoDosCartoes();
    }

    // excesso de cards em uma coluna
    marcarOcultos(coluna, quantidade, y) {
        if (coluna.rotuloOcultos) {
            coluna.rotuloOcultos.destroy();
            coluna.rotuloOcultos = null;
        }

        if (quantidade <= 0) {
            return;
        }

        coluna.rotuloOcultos = this.add.text(
            coluna.x + LARGURA_DA_COLUNA / 2,
            y + 4,
            "+" + quantidade + " sem espaço na tela",
            {fontFamily: FONTE, fontSize: "11px", color: COR.textoSecundario}
        ).setOrigin(0.5, 0);
    }

    atualizarColunas() {
        let algumaAcimaDoLimite = false;

        this.colunas.forEach(function (coluna) {
            const total = this.itensDaColuna(coluna.dados.id).length;
            const limite = coluna.dados.limite;

            coluna.contador.setText(limite ? total + "/" + limite : String(total));

            const acima = Boolean(limite) && total > limite;
            algumaAcimaDoLimite = algumaAcimaDoLimite || acima;

            coluna.contador.setColor(acima ? COR.alerta : COR.textoSecundario);
            coluna.cabecalho.setStrokeStyle(acima ? 2 : 1, acima ? COR_HEX.alerta : COR_HEX.contornoSuave);
            coluna.fundo.setFillStyle(acima ? COR_HEX.alertaSuave : COR_HEX.painelSuave);
        }, this);

        if (algumaAcimaDoLimite) {
            this.mostrarAviso("coluna acima do limite de trabalho em progresso");
        }
    }

    atualizarEstadoDosCartoes() {
        const selecionado = this.cartaoSelecionado();

        this.cartoes.forEach(function (cartao) {
            cartao.definirEstado(cartao === selecionado, cartao === this.arrastando);
        }, this);

        this.posicionarDica(selecionado);
    }

    posicionarDica(cartao) {
        if (!cartao || this.arrastando) {
            this.dica.setVisible(false);
            return;
        }

        this.dica.setPosition(
            cartao.container.x + LARGURA_CARTAO / 2,
            cartao.container.y + ALTURA_CARTAO + 3
        );
        this.dica.setVisible(true);
    }

    selecionarCartao(cartao) {
        const indice = this.itensDaColuna(cartao.item.coluna).indexOf(cartao.item);
        if (indice < 0) {
            return;
        }

        this.selecao.coluna = this.indiceDaColuna(cartao.item.coluna);
        this.selecao.indice = indice;
        this.atualizarEstadoDosCartoes();
    }

    cartaoSelecionado() {
        const item = this.itemSelecionado();
        if (!item) {
            return null;
        }

        return this.cartoes.find(function (cartao) {
            return cartao.item.id === item.id;
        });
    }

    itemSelecionado() {
        const coluna = this.colunas[this.selecao.coluna];
        return this.itensDaColuna(coluna.dados.id)[this.selecao.indice] || null;
    }

    // Mantém o cursor dentro de uma posição válida depois de cada mudança
    ajustarSelecao() {
        const total = Math.min(
            this.itensDaColuna(this.colunas[this.selecao.coluna].dados.id).length,
            capacidadeDaColuna()
        );
        if (total === 0) {
            this.selecao.indice = 0;
            return;
        }
        this.selecao.indice = Phaser.Math.Clamp(this.selecao.indice, 0, total - 1);
    }

    mostrarAviso(texto) {
        this.aviso.setText(texto);
        this.time.delayedCall(2600, function () {
            if (this.aviso.text === texto) {
                this.aviso.setText("");
            }
        }, [], this);
    }

    // ------------------------------------------------------------
    // regras

    podeReceber(idColuna) {
        const coluna = COLUNAS.find(function (c) {
            return c.id === idColuna;
        });

        if (!coluna.limite) {
            return true;
        }
        return this.itensDaColuna(idColuna).length < coluna.limite;
    }

    moverItem(item, idColuna, posicao) {
        if (item.coluna === idColuna) {
            this.reordenar(item, posicao);
            return true;
        }

        if (!this.podeReceber(idColuna)) {
            const coluna = COLUNAS.find(function (c) {
                return c.id === idColuna;
            });
            this.mostrarAviso(
                coluna.titulo + " já está no limite de " + coluna.limite + " itens"
            );
            return false;
        }

        item.coluna = idColuna;
        this.reordenar(item, posicao);
        this.salvar();
        return true;
    }

    reordenar(item, posicao) {
        const daColuna = this.itensDaColuna(item.coluna).filter(function (outro) {
            return outro.id !== item.id;
        });

        const destino = Phaser.Math.Clamp(
            posicao === undefined ? daColuna.length : posicao, 0, daColuna.length
        );
        daColuna.splice(destino, 0, item);

        const outros = this.itens.filter(function (outro) {
            return outro.coluna !== item.coluna;
        });
        this.itens = outros.concat(daColuna);
        this.salvar();
    }

    salvar() {
        salvarItensDoQuadro(this.registry, this.itens);
    }

    // ------------------------------------------------------------
    // teclado

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.teclas.sair)) {
            this.voltarAoEscritorio();
            return;
        }

        // Com um cartão sendo arrastado pelo mouse, o glossário espera
        if (Phaser.Input.Keyboard.JustDown(this.teclas.glossario) && !this.arrastando) {
            abrirGlossario(this);
            return;
        }

        const levandoCartao = this.teclas.mover.isDown;

        if (Phaser.Input.Keyboard.JustDown(this.teclas.esquerda)) {
            this.navegarLateral(-1, levandoCartao);
        } else if (Phaser.Input.Keyboard.JustDown(this.teclas.direita)) {
            this.navegarLateral(1, levandoCartao);
        } else if (Phaser.Input.Keyboard.JustDown(this.teclas.cima)) {
            this.navegarVertical(-1, levandoCartao);
        } else if (Phaser.Input.Keyboard.JustDown(this.teclas.baixo)) {
            this.navegarVertical(1, levandoCartao);
        }
    }

    navegarLateral(passo, levandoCartao) {
        const destino = Phaser.Math.Clamp(this.selecao.coluna + passo, 0, this.colunas.length - 1);
        if (destino === this.selecao.coluna) {
            return;
        }

        if (!levandoCartao) {
            this.selecao.coluna = destino;
            this.ajustarSelecao();
            this.atualizarEstadoDosCartoes();
            return;
        }

        const item = this.itemSelecionado();
        const idDestino = this.colunas[destino].dados.id;
        if (!this.moverItem(item, idDestino)) {
            return;
        }

        this.selecao.coluna = destino;
        this.selecao.indice = this.itensDaColuna(idDestino).indexOf(item);
        this.desenharCartoes();
    }

    navegarVertical(passo, levandoCartao) {
        const item = this.itemSelecionado();
        if (!item) {
            return;
        }

        if (!levandoCartao) {
            const total = Math.min(this.itensDaColuna(item.coluna).length, capacidadeDaColuna());
            this.selecao.indice = Phaser.Math.Clamp(this.selecao.indice + passo, 0, total - 1);
            this.atualizarEstadoDosCartoes();
            return;
        }

        this.reordenar(item, this.selecao.indice + passo);
        this.selecao.indice = this.itensDaColuna(item.coluna).indexOf(item);
        this.desenharCartoes();
    }

    voltarAoEscritorio() {
        this.scene.stop();
        this.scene.resume("CenaEscritorio");
    }

    // ------------------------------------------------------------
    // ponteiro

    aoComecarArrasto(ponteiro, container) {
        const cartao = container.getData("cartao");
        this.arrastando = cartao;

        this.selecao.coluna = this.indiceDaColuna(cartao.item.coluna);
        this.selecao.indice = this.itensDaColuna(cartao.item.coluna).indexOf(cartao.item);

        this.dica.setVisible(false);
        cartao.definirEstado(true, true);
    }

    aoArrastar(ponteiro, container, x, y) {
        container.setPosition(x, y);
        this.realcarColunaAlvo(ponteiro.x);
    }

    // Mostra desde o arrasto se a coluna aceita o cartão em vez de só
    // recusar depois que o jogador solta
    realcarColunaAlvo(x) {
        const alvo = this.colunaSobOPonteiro(x);
        const item = this.arrastando ? this.arrastando.item : null;

        this.colunas.forEach(function (coluna) {
            const eAlvo = coluna === alvo;
            const mesmaColuna = item && item.coluna === coluna.dados.id;
            const aceita = mesmaColuna || this.podeReceber(coluna.dados.id);

            if (!eAlvo) {
                coluna.fundo.setStrokeStyle(1, COR_HEX.contornoSuave);
                return;
            }
            coluna.fundo.setStrokeStyle(2, aceita ? COR_HEX.destaque : COR_HEX.alerta);
        }, this);
    }

    limparRealce() {
        this.colunas.forEach(function (coluna) {
            coluna.fundo.setStrokeStyle(1, COR_HEX.contornoSuave);
        }, this);
    }

    aoSoltarArrasto(ponteiro, container) {
        const cartao = container.getData("cartao");
        const coluna = this.colunaSobOPonteiro(ponteiro.x);
        this.arrastando = null;
        this.limparRealce();

        if (!coluna) {
            cartao.voltarAoLugar();
            this.atualizarEstadoDosCartoes();
            return;
        }

        const posicao = this.posicaoPelaAltura(coluna.dados.id, ponteiro.y, cartao.item);
        if (!this.moverItem(cartao.item, coluna.dados.id, posicao)) {
            cartao.voltarAoLugar();
            this.atualizarEstadoDosCartoes();
            return;
        }

        this.selecao.coluna = this.indiceDaColuna(coluna.dados.id);
        this.selecao.indice = this.itensDaColuna(coluna.dados.id).indexOf(cartao.item);
        this.desenharCartoes();
    }

    indiceDaColuna(idColuna) {
        return this.colunas.findIndex(function (coluna) {
            return coluna.dados.id === idColuna;
        });
    }

    colunaSobOPonteiro(x) {
        return this.colunas.find(function (coluna) {
            return x >= coluna.x && x <= coluna.x + LARGURA_DA_COLUNA;
        }) || null;
    }

    // Converte a altura do ponteiro na posição que o cartão ocupará
    posicaoPelaAltura(idColuna, y, item) {
        const topo = TOPO_DA_COLUNA + ALTURA_DO_CABECALHO + ESPACO_ENTRE_CARTOES;
        const passo = ALTURA_CARTAO + ESPACO_ENTRE_CARTOES;
        const total = this.itensDaColuna(idColuna).filter(function (outro) {
            return outro.id !== item.id;
        }).length;

        return Phaser.Math.Clamp(Math.round((y - topo) / passo), 0, total);
    }
}