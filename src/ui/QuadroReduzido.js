// Quadro reduzido
//
// Mostra, entre a fala do jogador e o comentário do mentor, o que a decisão
// mudou no quadro: os cartões saem de onde estavam e vão para onde ficaram.
// ENTER durante a animação pula para o fim; ENTER depois fecha.

import {COLUNAS, ETIQUETA_DE_BLOQUEIO} from "../dados/quadro.js";
import {COR, COR_HEX, FONTE, TIPO_DE_ITEM} from "../dados/tema.js";

const MOLDURA = {x: 150, y: 86, largura: 660, altura: 248};
const MARGEM = 12;
const ESPACO_ENTRE_COLUNAS = 8;
const TOPO_DAS_COLUNAS = 30;
const ALTURA_DO_TITULO_DA_COLUNA = 18;
const ALTURA_DA_LEGENDA = 40;
const ALTURA_MAXIMA_DO_CARTAO = 16;
const ESPACO_ENTRE_CARTOES = 3;
const PROFUNDIDADE = 900;

const ESPERA = 300;
const DURACAO = 700;

const LARGURA_DA_COLUNA = (MOLDURA.largura - MARGEM * 2 - ESPACO_ENTRE_COLUNAS * (COLUNAS.length - 1))
    / COLUNAS.length;
const ALTURA_DAS_COLUNAS = MOLDURA.altura - TOPO_DAS_COLUNAS - ALTURA_DA_LEGENDA - MARGEM;

export class QuadroReduzido {

    // mudanca: {antes, depois, texto}, vinda de aplicarNoQuadro
    constructor(cena, mudanca, aoFechar) {
        this.cena = cena;
        this.aoFechar = aoFechar;
        this.objetos = [];
        this.cartoes = {};
        this.animacoes = [];
        this.animando = true;

        const antes = visiveis(mudanca.antes);
        const depois = visiveis(mudanca.depois);
        this.alterados = idsAlterados(antes, depois);

        this.montarMoldura(mudanca.texto);
        this.posicoesDepois = posicoes(depois);
        this.montarCartoes(antes, depois);
        this.contadores = this.montarColunas(antes);
        this.animar(depois);
    }

    montarMoldura(texto) {
        const cena = this.cena;
        const fundo = cena.add.rectangle(MOLDURA.x, MOLDURA.y, MOLDURA.largura, MOLDURA.altura, COR_HEX.painel)
            .setOrigin(0, 0).setStrokeStyle(2, COR_HEX.contorno);
        const titulo = cena.add.text(MOLDURA.x + MARGEM, MOLDURA.y + 9, "NO QUADRO", {
            fontFamily: FONTE, fontSize: "12px", color: COR.texto
        });
        const legenda = cena.add.text(
            MOLDURA.x + MARGEM,
            MOLDURA.y + MOLDURA.altura - ALTURA_DA_LEGENDA,
            texto,
            {
                fontFamily: FONTE,
                fontSize: "11px",
                color: COR.destaque,
                lineSpacing: 3,
                wordWrap: {width: MOLDURA.largura - MARGEM * 2}
            }
        );
        this.guardar([fundo, titulo, legenda]);
    }

    montarColunas(itens) {
        const contadores = {};

        COLUNAS.forEach(function (coluna, indice) {
            const x = xDaColuna(indice);
            const y = MOLDURA.y + TOPO_DAS_COLUNAS;
            const fundo = this.cena.add.rectangle(x, y, LARGURA_DA_COLUNA, ALTURA_DAS_COLUNAS, COR_HEX.painelSuave)
                .setOrigin(0, 0).setStrokeStyle(1, COR_HEX.contornoSuave);
            const titulo = this.cena.add.text(x + 6, y + 4, coluna.titulo, {
                fontFamily: FONTE, fontSize: "9px", color: COR.textoSecundario
            });
            contadores[coluna.id] = this.cena.add.text(x + LARGURA_DA_COLUNA - 6, y + 4, "", {
                fontFamily: FONTE, fontSize: "9px", color: COR.textoSecundario
            }).setOrigin(1, 0);
            this.guardar([fundo, titulo, contadores[coluna.id]]);
            fundo.setDepth(PROFUNDIDADE + 1);
            titulo.setDepth(PROFUNDIDADE + 2);
            contadores[coluna.id].setDepth(PROFUNDIDADE + 2);
        }, this);

        this.atualizarContadores(contadores, itens);
        return contadores;
    }

    atualizarContadores(contadores, itens) {
        COLUNAS.forEach(function (coluna) {
            const quantos = itens.filter(function (item) {
                return item.coluna === coluna.id;
            }).length;
            const texto = coluna.limite ? quantos + "/" + coluna.limite : String(quantos);
            contadores[coluna.id].setText(texto);
            contadores[coluna.id].setColor(coluna.limite && quantos > coluna.limite ? COR.alerta : COR.textoSecundario);
        });
    }

    // Cada cartão nasce onde estava; os novos nascem já no destino, apagados
    montarCartoes(antes, depois) {
        const posicoesAntes = posicoes(antes);

        depois.forEach(function (item) {
            const inicio = posicoesAntes[item.id] || this.posicoesDepois[item.id];
            const cartao = this.montarCartao(item, inicio);
            if (!posicoesAntes[item.id]) {
                cartao.container.setAlpha(0);
            }
            this.cartoes[item.id] = cartao;
        }, this);
    }

    montarCartao(item, posicao) {
        const cena = this.cena;
        const largura = LARGURA_DA_COLUNA - 8;
        const tipo = TIPO_DE_ITEM[item.tipo];
        const bloqueado = item.etiquetas.indexOf(ETIQUETA_DE_BLOQUEIO) >= 0;

        const fundo = cena.add.rectangle(0, 0, largura, posicao.altura, bloqueado ? COR_HEX.alertaSuave : COR_HEX.painel)
            .setOrigin(0, 0).setStrokeStyle(1, bloqueado ? COR_HEX.alerta : COR_HEX.contornoSuave);
        const faixa = cena.add.rectangle(0, 0, 3, posicao.altura, tipo.corHex).setOrigin(0, 0);
        const partes = [fundo, faixa];

        if (posicao.altura >= 12) {
            partes.push(cena.add.text(6, Math.floor((posicao.altura - 10) / 2), resumir(item.titulo, largura - 10), {
                fontFamily: FONTE, fontSize: "9px", color: COR.texto
            }));
        }

        const container = cena.add.container(posicao.x, posicao.y, partes).setDepth(PROFUNDIDADE + 3);
        this.objetos.push(container);
        return {container: container, fundo: fundo, bloqueado: bloqueado};
    }

    animar(depois) {
        this.depois = depois;
        Object.keys(this.cartoes).forEach(function (id) {
            const cartao = this.cartoes[id];
            const destino = this.posicoesDepois[id];
            this.animacoes.push(this.cena.tweens.add({
                targets: cartao.container,
                x: destino.x,
                y: destino.y,
                alpha: 1,
                delay: ESPERA,
                duration: DURACAO,
                ease: "Sine.easeInOut"
            }));
        }, this);

        this.cena.time.delayedCall(ESPERA + DURACAO, this.finalizar, [], this);
    }

    // Fim da animação: tudo no lugar, contadores certos, alterados em destaque
    finalizar() {
        if (!this.animando) {
            return;
        }
        this.animando = false;

        this.animacoes.forEach(function (animacao) {
            animacao.stop();
        });
        Object.keys(this.cartoes).forEach(function (id) {
            const destino = this.posicoesDepois[id];
            this.cartoes[id].container.setPosition(destino.x, destino.y).setAlpha(1);
        }, this);

        this.alterados.forEach(function (id) {
            const cartao = this.cartoes[id];
            if (cartao) {
                cartao.fundo.setStrokeStyle(2, cartao.bloqueado ? COR_HEX.alerta : COR_HEX.destaque);
            }
        }, this);
        this.atualizarContadores(this.contadores, this.depois);
    }

    avancar() {
        if (this.animando) {
            this.finalizar();
            return;
        }
        this.fechar();
    }

    fechar() {
        this.objetos.forEach(function (objeto) {
            objeto.destroy();
        });
        this.objetos = [];

        const aoFechar = this.aoFechar;
        this.aoFechar = null;
        if (aoFechar) {
            aoFechar();
        }
    }

    guardar(lista) {
        lista.forEach(function (objeto) {
            objeto.setDepth(PROFUNDIDADE);
            this.objetos.push(objeto);
        }, this);
    }
}

// O histórico da sprint anterior não entra: só ocuparia espaço
function visiveis(itens) {
    return itens.filter(function (item) {
        return !item.sprintAnterior;
    });
}

function xDaColuna(indice) {
    return MOLDURA.x + MARGEM + indice * (LARGURA_DA_COLUNA + ESPACO_ENTRE_COLUNAS);
}

// Os cartões encolhem quando a coluna enche
function posicoes(itens) {
    const resultado = {};

    COLUNAS.forEach(function (coluna, indice) {
        const daColuna = itens.filter(function (item) {
            return item.coluna === coluna.id;
        });
        const disponivel = ALTURA_DAS_COLUNAS - ALTURA_DO_TITULO_DA_COLUNA - 4;
        const altura = Math.min(
            ALTURA_MAXIMA_DO_CARTAO,
            Math.floor(disponivel / Math.max(daColuna.length, 1)) - ESPACO_ENTRE_CARTOES
        );

        daColuna.forEach(function (item, ordem) {
            resultado[item.id] = {
                x: xDaColuna(indice) + 4,
                y: MOLDURA.y + TOPO_DAS_COLUNAS + ALTURA_DO_TITULO_DA_COLUNA + ordem * (altura + ESPACO_ENTRE_CARTOES),
                altura: altura
            };
        });
    });

    return resultado;
}

function idsAlterados(antes, depois) {
    return depois.filter(function (item) {
        const anterior = antes.find(function (outro) {
            return outro.id === item.id;
        });
        return !anterior || anterior.coluna !== item.coluna
            || anterior.etiquetas.join() !== item.etiquetas.join()
            || Boolean(anterior.bloqueado) !== Boolean(item.bloqueado);
    }).map(function (item) {
        return item.id;
    });
}

// Corta o título para caber no cartão; a fonte é monoespaçada
function resumir(titulo, largura) {
    const cabem = Math.floor(largura / 5.5);
    return titulo.length <= cabem ? titulo : titulo.slice(0, cabem - 1) + "…";
}
