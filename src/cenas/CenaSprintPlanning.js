// Sprint Planning
//
// Mecânica: propor a meta ao time e montar o Sprint Backlog dentro da
// capacidade estimada pelos desenvolvedores.
//
// A meta é dita pelo jogador como resposta, e o retorno vem pela boca de
// quem ocupa a cadeira de Product Owner. A capacidade é anunciada por uma
// desenvolvedora, porque quem diz o que cabe é quem faz.

import {CAPACIDADE_DA_SPRINT, PLANO_DO_TIME, PRODUTO_BACKLOG, SPRINT_PLANNING} from "../dados/eventos.js";
import {planejarItens} from "../dados/estadoDoQuadro.js";
import {embaralhar} from "../ui/ListaDeOpcoes.js";
import {CenaReuniao} from "./CenaReuniao.js";

export class CenaSprintPlanning extends CenaReuniao {

    constructor() {
        super(SPRINT_PLANNING.chave, SPRINT_PLANNING);
    }

    iniciar() {
        this.meta = null;
        this.opcoesDoBacklog = null;

        if (!this.conduzOEvento()) {
            this.participarDoEvento();
            return;
        }

        const cena = this;
        this.falarAbertura(function () {
            cena.etapaDaMeta();
        });
    }

    // Quem só participa também sai com Sprint Backlog: o plano do time
    encerrarComoParticipante() {
        planejarItens(this.registry, this.cadeira(), PLANO_DO_TIME);
        super.encerrarComoParticipante();
    }

    // -------------------------------------------------------------
    // meta

    etapaDaMeta() {
        const cena = this;
        this.perguntar({
            pergunta: this.evento.perguntaDaMeta,
            opcoes: this.evento.metas,
            aoConfirmar: function (meta) {
                cena.escolherMeta(meta);
            }
        });
    }

    escolherMeta(meta) {
        this.meta = meta;
        this.pontuar(meta);
        const cena = this;

        this.responder(meta.titulo, function () {
            cena.comentarDecisao(meta.avaliacao, meta.feedback, meta.principio, function () {
                cena.abrirBacklog();
            });
        });
    }

    // ----------------------------------------------------------
    // backlog

    abrirBacklog() {
        const cena = this;
        this.opcoesDoBacklog = embaralhar(PRODUTO_BACKLOG).map(function (item) {
            return {
                id: item.id,
                titulo: item.titulo,
                detalhe: item.tipo.toUpperCase(),
                sufixo: item.esforco + " pt",
                marcada: false,
                item: item
            };
        });

        this.falar(this.evento.vozDosDesenvolvedores, this.evento.instrucaoDoBacklog, function () {
            cena.mostrarBacklog();
        });
    }

    // A lista é remontada sempre que uma fala passa por cima dela
    mostrarBacklog() {
        const cena = this;
        this.perguntar({
            pergunta: this.textoDoBacklog(),
            ajuda: "setas escolhem, ENTER marca e desmarca, C fecha o planejamento",
            multipla: true,
            opcoes: this.opcoesDoBacklog,
            aoConfirmar: function (opcao) {
                cena.alternarItem(opcao);
            }
        });
    }

    textoDoBacklog() {
        return "Sprint Backlog — " + this.esforcoEscolhido()
            + " de " + CAPACIDADE_DA_SPRINT + " pontos";
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
            this.atualizarPergunta(this.textoDoBacklog());
            return;
        }

        if (this.esforcoEscolhido() + opcao.item.esforco > CAPACIDADE_DA_SPRINT) {
            const cena = this;
            this.comentarDecisao(
                "ruim",
                this.evento.capacidadeExcedida.feedback,
                this.evento.capacidadeExcedida.principio,
                function () {
                    cena.mostrarBacklog();
                }
            );
            return;
        }

        opcao.marcada = true;
        this.lista.atualizarDestaque();
        this.atualizarPergunta(this.textoDoBacklog());
    }

    aoConcluirEtapa() {
        if (!this.opcoesDoBacklog) {
            return;
        }
        this.fecharPlanejamento();
    }

    // --------------------------------------------------------
    // fechamento

    fecharPlanejamento() {
        const marcados = this.opcoesDoBacklog.filter(function (opcao) {
            return opcao.marcada;
        });

        const resultado = this.avaliarPlano(marcados);
        this.pontuar(resultado);

        planejarItens(this.registry, this.cadeira(), marcados.map(function (opcao) {
            return opcao.item;
        }));

        const cena = this;
        this.comentarDecisao(resultado.avaliacao, resultado.feedback, resultado.principio, function () {
            cena.sair();
        });
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

        // Os itens alinhados servem à meta boa; com outra meta, eles não são
        // coerentes com o que foi dito na sala
        if (!this.meta || this.meta.avaliacao !== "boa") {
            return Object.assign({avaliacao: "media"}, this.evento.fechamento.semMeta);
        }

        return Object.assign({avaliacao: "boa"}, this.evento.fechamento.alinhado);
    }
}
