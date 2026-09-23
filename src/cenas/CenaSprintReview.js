// Sprint Review
//
// Mecânica: escolher como conduzir e o que mostrar.
//
// Os candidatos vêm do quadro, então tentar demonstrar item que não está
// em CONCLUÍDO é possível, e é recusado com explicação.
//
// O que a escola pede na reunião volta ao quadro como item novo: é a Review
// adaptando o Product Backlog.

import {SPRINT_REVIEW} from "../dados/eventos.js";
import {acrescentarItem, lerItensDoQuadro} from "../dados/estadoDoQuadro.js";
import {CenaEvento, LARGURA_DO_CONTEUDO, MARGEM, TOPO_DO_CONTEUDO, tituloDaAvaliacao}
    from "./CenaEvento.js";

const COLUNA_CONCLUIDO = "concluido";
const COLUNA_EM_REVISAO = "revisao";
const ID_DO_FEEDBACK = "rev-feedback";

export class CenaSprintReview extends CenaEvento {

    constructor() {
        super(SPRINT_REVIEW.chave, SPRINT_REVIEW);
    }

    iniciar() {
        this.formato = null;
        this.opcoesDeItens = null;
        this.mostrarFala(this.evento.aberturaQuem, this.evento.abertura);
        this.etapaDoFormato();
    }

    etapaDoFormato() {
        this.definirPergunta(this.evento.perguntaDoFormato);
        this.definirAjuda("setas escolhem, ENTER confirma");

        const cena = this;
        this.montarLista({
            x: MARGEM,
            y: TOPO_DO_CONTEUDO,
            largura: LARGURA_DO_CONTEUDO,
            opcoes: this.evento.formatos,
            aoConfirmar: function (formato) {
                cena.confirmarFormato(formato);
            }
        });
    }

    confirmarFormato(formato) {
        this.formato = formato;
        const cena = this;

        this.mostrarFeedback(
            tituloDaAvaliacao(formato.avaliacao),
            formato.feedback,
            formato.principio,
            function () {
                cena.etapaDosItens();
            }
        );
    }

    // Os candidatos incluem o que está em revisão
    etapaDosItens() {
        this.definirPergunta(this.evento.perguntaDosItens + "  " + this.evento.aviso);
        this.definirAjuda("setas escolhem, ENTER demonstra, C encerra a reunião");

        const itens = lerItensDoQuadro(this.registry).filter(function (item) {
            return item.coluna === COLUNA_CONCLUIDO || item.coluna === COLUNA_EM_REVISAO;
        });

        const cena = this;
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

        this.montarLista({
            x: MARGEM,
            y: TOPO_DO_CONTEUDO,
            largura: LARGURA_DO_CONTEUDO,
            multipla: true,
            opcoes: this.opcoesDeItens,
            aoConfirmar: function (opcao) {
                cena.alternarItem(opcao);
            }
        });
    }

    alternarItem(opcao) {
        if (!opcao.concluido) {
            this.mostrarFeedback(
                tituloDaAvaliacao("ruim"),
                this.evento.itemNaoConcluido.feedback,
                this.evento.itemNaoConcluido.principio
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
        const resultado = houveDemonstracao
            ? this.evento.fechamento.comItens
            : this.evento.fechamento.semItens;

        if (houveDemonstracao && this.formato.gerarFeedbackDoUsuario) {
            acrescentarItem(this.registry, Object.assign(
                {id: ID_DO_FEEDBACK}, this.evento.feedbackDoUsuario
            ), "afazer");
        }

        const cena = this;
        this.mostrarFeedback(
            tituloDaAvaliacao(houveDemonstracao ? "boa" : "ruim"),
            resultado.feedback,
            resultado.principio,
            function () {
                cena.sair();
            }
        );
    }
}