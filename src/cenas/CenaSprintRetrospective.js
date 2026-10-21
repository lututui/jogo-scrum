// Sprint Retrospective
//
// Mecânica: o time fala o que viu, o jogador escolhe até duas observações
// e as transforma em uma ação. A reunião fecha com ação escolhida.

import {SPRINT_RETROSPECTIVE} from "../dados/eventos.js";
import {embaralhar} from "../ui/ListaDeOpcoes.js";
import {CenaReuniao} from "./CenaReuniao.js";

export class CenaSprintRetrospective extends CenaReuniao {

    constructor() {
        super(SPRINT_RETROSPECTIVE.chave, SPRINT_RETROSPECTIVE);
    }

    iniciar() {
        this.opcoesDeObservacoes = null;
        this.opcoesDeAcoes = null;
        this.escolheuRelevante = false;

        if (!this.conduzOEvento()) {
            this.participarDoEvento();
            return;
        }

        const cena = this;
        this.falarAbertura(function () {
            cena.ouvirOTime();
        });
    }

    // Cada observação é dita por quem a levantou, antes de virar opção
    ouvirOTime() {
        const cena = this;
        this.observacoes = embaralhar(this.evento.observacoes);
        const falas = this.observacoes.map(function (observacao) {
            return {quem: observacao.quem, texto: observacao.titulo, expressao: observacao.expressao};
        });

        this.falarEmSequencia(falas, function () {
            cena.abrirObservacoes();
        });
    }

    abrirObservacoes() {
        this.opcoesDeObservacoes = this.observacoes.map(function (observacao) {
            return {
                id: observacao.id,
                titulo: observacao.titulo,
                detalhe: observacao.quem,
                marcada: false,
                relevante: observacao.relevante
            };
        });

        this.mostrarObservacoes();
    }

    mostrarObservacoes() {
        const cena = this;
        this.perguntar({
            pergunta: this.evento.perguntaDasObservacoes,
            ajuda: "setas escolhem, ENTER marca e desmarca, C segue para a ação",
            multipla: true,
            opcoes: this.opcoesDeObservacoes,
            aoConfirmar: function (opcao) {
                cena.alternarObservacao(opcao);
            }
        });
    }

    marcadas() {
        return this.opcoesDeObservacoes.filter(function (opcao) {
            return opcao.marcada;
        });
    }

    // O limite existe para forçar escolha: tudo é observação, poucas são o problema
    alternarObservacao(opcao) {
        if (opcao.marcada) {
            opcao.marcada = false;
            this.lista.atualizarDestaque();
            return;
        }

        if (this.marcadas().length >= this.evento.limiteDeObservacoes) {
            this.avisar("até " + this.evento.limiteDeObservacoes
                + " observações: desmarque uma para trocar");
            return;
        }

        opcao.marcada = true;
        this.lista.atualizarDestaque();
    }

    aoConcluirEtapa() {
        if (this.opcoesDeAcoes || !this.opcoesDeObservacoes) {
            return;
        }
        if (this.marcadas().length === 0) {
            this.avisar("marque ao menos uma observação antes de seguir");
            return;
        }
        this.etapaDaAcao();
    }

    etapaDaAcao() {
        this.escolheuRelevante = this.marcadas().some(function (opcao) {
            return opcao.relevante;
        });
        this.opcoesDeAcoes = this.evento.acoes;

        const cena = this;
        this.perguntar({
            pergunta: this.evento.perguntaDaAcao,
            opcoes: this.opcoesDeAcoes,
            aoConfirmar: function (acao) {
                cena.escolherAcao(acao);
            }
        });
    }

    // Observações que não tocam o que travou a sprint contam como decisão
    // própria, além da ação escolhida
    escolherAcao(acao) {
        const cena = this;
        this.pontuar(acao);

        if (!this.escolheuRelevante) {
            this.pontuar({avaliacao: "ruim", conceito: this.evento.semObservacaoRelevante.conceito});
        }

        this.responder(acao.titulo, function () {
            if (!cena.escolheuRelevante) {
                cena.comentarDecisao(
                    "ruim",
                    cena.evento.semObservacaoRelevante.feedback,
                    cena.evento.semObservacaoRelevante.principio,
                    function () {
                        cena.fecharComAcao(acao);
                    }
                );
                return;
            }
            cena.fecharComAcao(acao);
        });
    }

    fecharComAcao(acao) {
        const cena = this;
        this.comentarDecisao(acao.avaliacao, acao.feedback, acao.principio, function () {
            cena.sair();
        });
    }
}
