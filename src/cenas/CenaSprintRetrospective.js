// Sprint Retrospective
//
// Mecânica: o time levanta observações e o jogador escolhe até duas para virar
// uma ação.

import {SPRINT_RETROSPECTIVE} from "../dados/eventos.js";
import {CenaEvento, LARGURA_DO_CONTEUDO, MARGEM, TOPO_DO_CONTEUDO, tituloDaAvaliacao}
    from "./CenaEvento.js";

export class CenaSprintRetrospective extends CenaEvento {

    constructor() {
        super(SPRINT_RETROSPECTIVE.chave, SPRINT_RETROSPECTIVE);
    }

    iniciar() {
        this.opcoesDeObservacoes = null;
        this.opcoesDeAcoes = null;
        this.escolheuRelevante = false;
        this.mostrarFala(this.evento.aberturaQuem, this.evento.abertura);
        this.etapaDasObservacoes();
    }

    etapaDasObservacoes() {
        this.definirPergunta(this.evento.perguntaDasObservacoes);
        this.definirAjuda("setas escolhem, ENTER marca e desmarca, C segue para a ação");

        const cena = this;
        this.opcoesDeObservacoes = this.evento.observacoes.map(function (observacao) {
            return {
                id: observacao.id,
                titulo: observacao.titulo,
                detalhe: observacao.quem,
                marcada: false,
                relevante: observacao.relevante
            };
        });

        this.montarLista({
            x: MARGEM,
            y: TOPO_DO_CONTEUDO,
            largura: LARGURA_DO_CONTEUDO,
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

    // O limite existe para forçar escolha
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

        this.definirPergunta(this.evento.perguntaDaAcao);
        this.definirAjuda("setas escolhem, ENTER confirma");

        const cena = this;
        this.opcoesDeAcoes = this.evento.acoes;
        this.montarLista({
            x: MARGEM,
            y: TOPO_DO_CONTEUDO,
            largura: LARGURA_DO_CONTEUDO,
            opcoes: this.opcoesDeAcoes,
            aoConfirmar: function (acao) {
                cena.confirmarAcao(acao);
            }
        });
    }

    confirmarAcao(acao) {
        const cena = this;

        if (!this.escolheuRelevante) {
            this.mostrarFeedback(
                tituloDaAvaliacao("ruim"),
                this.evento.semObservacaoRelevante.feedback,
                this.evento.semObservacaoRelevante.principio,
                function () {
                    cena.fecharComAcao(acao);
                }
            );
            return;
        }

        this.fecharComAcao(acao);
    }

    fecharComAcao(acao) {
        const cena = this;
        this.mostrarFeedback(
            tituloDaAvaliacao(acao.avaliacao),
            acao.feedback,
            acao.principio,
            function () {
                cena.sair();
            }
        );
    }
}