// Sprint Retrospective
//
// Mecânica: o time fala o que viu, o jogador escolhe até duas observações
// e as transforma em uma ação. A reunião fecha com ação escolhida.

import {SPRINT_RETROSPECTIVE} from "../dados/eventos.js";
import {CenaReuniao} from "./CenaReuniao.js";

export class CenaSprintRetrospective extends CenaReuniao {

    constructor() {
        super(SPRINT_RETROSPECTIVE.chave, SPRINT_RETROSPECTIVE);
    }

    iniciar() {
        this.opcoesDeObservacoes = null;
        this.opcoesDeAcoes = null;
        this.escolheuRelevante = false;

        const cena = this;
        this.falar(this.evento.aberturaQuem, this.evento.abertura, function () {
            cena.ouvirOTime();
        });
    }

    // Cada observação é dita por quem a levantou, antes de virar opção
    ouvirOTime() {
        const cena = this;
        const falas = this.evento.observacoes.map(function (observacao) {
            return {quem: observacao.quem, texto: observacao.titulo};
        });

        this.falarEmSequencia(falas, function () {
            cena.abrirObservacoes();
        });
    }

    abrirObservacoes() {
        this.opcoesDeObservacoes = this.evento.observacoes.map(function (observacao) {
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

    escolherAcao(acao) {
        const cena = this;

        this.responder(acao.titulo, function () {
            if (!cena.escolheuRelevante) {
                cena.falarComoMentor(
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
        this.falarComoMentor(acao.feedback, acao.principio, function () {
            cena.sair();
        });
    }
}
