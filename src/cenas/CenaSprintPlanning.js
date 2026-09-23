// Sprint Planning
//
// Mecânica: escolher a meta e montar o Sprint Backlog dentro da capacidade
// estimada pelo time.
//
// O que entra no plano vai para a coluna A FAZER do quadro,
// que é onde a sprint continua depois desta cena.

import {CAPACIDADE_DA_SPRINT, PRODUTO_BACKLOG, SPRINT_PLANNING} from "../dados/eventos.js";
import {acrescentarItem} from "../dados/estadoDoQuadro.js";
import {COR, FONTE} from "../dados/tema.js";
import {CenaEvento, LARGURA_DO_CONTEUDO, MARGEM, TOPO_DO_CONTEUDO, tituloDaAvaliacao}
    from "./CenaEvento.js";

export class CenaSprintPlanning extends CenaEvento {

    constructor() {
        super(SPRINT_PLANNING.chave, SPRINT_PLANNING);
    }

    iniciar() {
        this.escolhidos = [];
        this.mostrarFala(this.evento.aberturaQuem, this.evento.abertura);
        this.etapaDaMeta();
    }

    // ------------------------------------------------------------ etapas

    etapaDaMeta() {
        this.definirPergunta(this.evento.perguntaDaMeta);
        this.definirAjuda("setas escolhem, ENTER confirma");

        const cena = this;
        this.montarLista({
            x: MARGEM,
            y: TOPO_DO_CONTEUDO,
            largura: LARGURA_DO_CONTEUDO,
            opcoes: this.evento.metas,
            aoConfirmar: function (meta) {
                cena.confirmarMeta(meta);
            }
        });
    }

    confirmarMeta(meta) {
        this.meta = meta;
        const cena = this;

        this.mostrarFeedback(
            tituloDaAvaliacao(meta.avaliacao),
            meta.feedback,
            meta.principio,
            function () {
                cena.etapaDoBacklog();
            }
        );
    }

    etapaDoBacklog() {
        this.definirPergunta(this.evento.instrucaoDoBacklog);
        this.definirAjuda("setas escolhem, ENTER marca e desmarca, C fecha o planejamento");

        const cena = this;
        this.opcoesDoBacklog = PRODUTO_BACKLOG.map(function (item) {
            return {
                id: item.id,
                titulo: item.titulo,
                detalhe: item.tipo.toUpperCase(),
                sufixo: item.esforco + " pt",
                marcada: false,
                item: item
            };
        });

        this.montarLista({
            x: MARGEM,
            y: TOPO_DO_CONTEUDO,
            largura: LARGURA_DO_CONTEUDO,
            multipla: true,
            opcoes: this.opcoesDoBacklog,
            aoConfirmar: function (opcao) {
                cena.alternarItem(opcao);
            }
        });

        this.criarMedidorDeEsforco();
        this.atualizarMedidor();
    }

    criarMedidorDeEsforco() {
        if (this.medidor) {
            return;
        }
        this.medidor = this.add.text(MARGEM + LARGURA_DO_CONTEUDO, TOPO_DO_CONTEUDO - 28, "", {
            fontFamily: FONTE,
            fontSize: "14px",
            color: COR.texto
        }).setOrigin(1, 0);
    }

    atualizarMedidor() {
        const total = this.esforcoEscolhido();
        this.medidor.setText(total + " de " + CAPACIDADE_DA_SPRINT + " pontos");
        this.medidor.setColor(total === CAPACIDADE_DA_SPRINT ? COR.destaque : COR.texto);
    }

    esforcoEscolhido() {
        return this.opcoesDoBacklog.reduce(function (soma, opcao) {
            return opcao.marcada ? soma + opcao.item.esforco : soma;
        }, 0);
    }

    // A capacidade é limite, não sugestão: marcar além dela é recusado
    alternarItem(opcao) {
        if (opcao.marcada) {
            opcao.marcada = false;
            this.lista.atualizarDestaque();
            this.atualizarMedidor();
            return;
        }

        if (this.esforcoEscolhido() + opcao.item.esforco > CAPACIDADE_DA_SPRINT) {
            this.mostrarFeedback(
                tituloDaAvaliacao("ruim"),
                this.evento.capacidadeExcedida.feedback,
                this.evento.capacidadeExcedida.principio
            );
            return;
        }

        opcao.marcada = true;
        this.lista.atualizarDestaque();
        this.atualizarMedidor();
    }

    aoConcluirEtapa() {
        if (!this.opcoesDoBacklog) {
            return;
        }
        this.fecharPlanejamento();
    }

    // ----------------------------------------------------------
    // fechamento

    fecharPlanejamento() {
        const marcados = this.opcoesDoBacklog.filter(function (opcao) {
            return opcao.marcada;
        });

        const resultado = this.avaliarPlano(marcados);
        marcados.forEach(function (opcao) {
            acrescentarItem(this.registry, {
                id: opcao.item.id,
                tipo: opcao.item.tipo,
                titulo: opcao.item.titulo,
                etiquetas: []
            }, "afazer");
        }, this);

        const cena = this;
        this.mostrarFeedback(
            tituloDaAvaliacao(resultado.avaliacao),
            resultado.feedback,
            resultado.principio,
            function () {
                cena.sair();
            }
        );
    }

    avaliarPlano(marcados) {
        if (marcados.length === 0) {
            return Object.assign({avaliacao: "ruim"}, this.evento.fechamento.vazio);
        }

        const fora = marcados.filter(function (opcao) {
            return !opcao.item.alinhado;
        });

        if (fora.length > 0) {
            return Object.assign({avaliacao: "media"}, this.evento.fechamento.disperso);
        }
        return Object.assign({avaliacao: "boa"}, this.evento.fechamento.alinhado);
    }
}
