// Sprint Review
//
// Mecânica: propor como o incremento é mostrado à escola e escolher o que
// mostrar.
//
// O que a escola pede volta ao quadro como item novo.

import {SPRINT_REVIEW} from "../dados/eventos.js";
import {acrescentarItem, lerItensDoQuadro} from "../dados/estadoDoQuadro.js";
import {CenaReuniao} from "./CenaReuniao.js";

const COLUNA_CONCLUIDO = "concluido";
const COLUNA_EM_REVISAO = "revisao";
const ID_DO_FEEDBACK = "rev-feedback";

export class CenaSprintReview extends CenaReuniao {

    constructor() {
        super(SPRINT_REVIEW.chave, SPRINT_REVIEW);
    }

    iniciar() {
        this.formato = null;
        this.opcoesDeItens = null;

        if (!this.conduzOEvento()) {
            this.participarDoEvento();
            return;
        }

        const cena = this;
        this.falar(this.papel().abertura.quem, this.papel().abertura.texto, function () {
            cena.etapaDoFormato();
        });
    }

    etapaDoFormato() {
        const cena = this;
        this.perguntar({
            pergunta: this.evento.perguntaDoFormato,
            opcoes: this.evento.formatos,
            aoConfirmar: function (formato) {
                cena.escolherFormato(formato);
            }
        });
    }

    escolherFormato(formato) {
        this.formato = formato;
        this.pontuar(formato);
        const cena = this;

        this.responder(formato.titulo, function () {
            cena.falarComoMentor(formato.feedback, formato.principio, function () {
                cena.abrirItens();
            });
        });
    }

    // Os candidatos incluem o que está em revisão, que ainda não está pronto.
    // O que já estava pronto antes da sprint não entra; sem candidatos, a
    // reunião fecha sem nada para mostrar
    abrirItens() {
        const itens = lerItensDoQuadro(this.registry, this.cadeira()).filter(function (item) {
            const naColuna = item.coluna === COLUNA_CONCLUIDO || item.coluna === COLUNA_EM_REVISAO;
            return naColuna && !item.sprintAnterior;
        });

        this.opcoesDeItens = itens.map(function (item) {
            const concluido = item.coluna === COLUNA_CONCLUIDO;
            return {
                id: item.id,
                titulo: item.titulo,
                detalhe: concluido ? "CONCLUÍDO" : "EM REVISÃO",
                marcada: false,
                concluido: concluido,
                item: item
            };
        });

        if (this.opcoesDeItens.length === 0) {
            this.encerrarReuniao();
            return;
        }

        this.mostrarItens();
    }

    mostrarItens() {
        const cena = this;
        this.perguntar({
            pergunta: this.evento.perguntaDosItens + "  " + this.evento.aviso,
            ajuda: "setas escolhem, ENTER marca e desmarca, C encerra a reunião",
            multipla: true,
            opcoes: this.opcoesDeItens,
            aoConfirmar: function (opcao) {
                cena.alternarItem(opcao);
            }
        });
    }

    alternarItem(opcao) {
        if (!opcao.concluido) {
            const cena = this;
            this.falarComoMentor(
                this.evento.itemNaoConcluido.feedback,
                this.evento.itemNaoConcluido.principio,
                function () {
                    cena.mostrarItens();
                }
            );
            return;
        }

        opcao.marcada = !opcao.marcada;
        this.lista.atualizarDestaque();
    }

    aoConcluirEtapa() {
        if (!this.opcoesDeItens) {
            return;
        }
        this.encerrarReuniao();
    }

    encerrarReuniao() {
        const demonstrados = this.opcoesDeItens.filter(function (opcao) {
            return opcao.marcada;
        });

        const houveDemonstracao = demonstrados.length > 0;
        const mostrouPlanejado = demonstrados.some(function (opcao) {
            return opcao.item.planejado;
        });
        const resultado = houveDemonstracao
            ? this.evento.fechamento.comItens
            : this.evento.fechamento.semItens;

        this.pontuar({
            avaliacao: houveDemonstracao ? "boa" : "ruim",
            marca: mostrouPlanejado ? "definicao-de-pronto" : null
        });

        if (houveDemonstracao && this.formato.gerarFeedbackDoUsuario) {
            acrescentarItem(this.registry, this.cadeira(), Object.assign(
                {id: ID_DO_FEEDBACK}, this.evento.feedbackDoUsuario
            ), "afazer");
        }

        const cena = this;
        this.falarComoMentor(resultado.feedback, resultado.principio, function () {
            cena.sair();
        });
    }
}
