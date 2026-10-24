// Sprint Review
//
// Mecânica: propor como o incremento é mostrado à escola e escolher o que
// mostrar.
//
// O que a escola pede volta ao quadro como item novo.

import {SPRINT_REVIEW} from "../dados/eventos.js";
import {
    acrescentarItem,
    descreverEntrega,
    entrouNestaSprint,
    entregaDaSprint,
    lerItensDoQuadro
} from "../dados/estadoDoQuadro.js";
import {registrarEntrega} from "../dados/progresso.js";
import {CenaReuniao} from "./CenaReuniao.js";
import {tocarEfeito} from "../ui/som.js";

const COLUNA_CONCLUIDO = "concluido";
const COLUNA_EM_REVISAO = "revisao";
const ID_DO_FEEDBACK = "rev-feedback";

export class CenaSprintReview extends CenaReuniao {

    constructor() {
        super(SPRINT_REVIEW.chave, SPRINT_REVIEW);
    }

    // Antes de tudo, o mentor lê no quadro o que ficou pronto
    iniciar() {
        this.formato = null;
        this.opcoesDeItens = null;

        const entrega = entregaDaSprint(this.registry, this.cadeira());
        registrarEntrega(this.registry, this.cadeira(), entrega);
        tocarEfeito(this, "vinheta");

        const cena = this;
        this.falar(this.chaveDoMentor(), "Antes de começar, o quadro: " + descreverEntrega(entrega), function () {
            if (!cena.conduzOEvento()) {
                cena.participarDoEvento();
                return;
            }
            cena.falarAbertura(function () {
                cena.etapaDoFormato();
            });
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
            cena.comentarDecisao(formato.avaliacao, formato.feedback, formato.principio, function () {
                cena.abrirItens();
            });
        });
    }

    // Os candidatos incluem o que está em revisão, que ainda não está pronto.
    // Só entra o trabalho desta sprint: o que já estava no quadro quando ela
    // começou fica de fora. Sem candidatos, a reunião fecha sem nada para
    // mostrar
    abrirItens() {
        const registry = this.registry;
        const cadeira = this.cadeira();
        const itens = lerItensDoQuadro(registry, cadeira).filter(function (item) {
            const naColuna = item.coluna === COLUNA_CONCLUIDO || item.coluna === COLUNA_EM_REVISAO;
            return naColuna && entrouNestaSprint(registry, cadeira, item);
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
            this.comentarDecisao(
                "ruim",
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
        // Mostrar só o que está pronto respeita a Definition of Done e pontua
        // como boa; o texto e a reação do mentor também olham o formato, porque
        // sem uso pela escola a inspeção fica pela metade
        const comUso = houveDemonstracao && this.formato.gerarFeedbackDoUsuario;
        let resultado = this.evento.fechamento.semItens;
        let reacao = "ruim";

        if (comUso) {
            resultado = this.evento.fechamento.comItens;
            reacao = "boa";
        } else if (houveDemonstracao) {
            resultado = this.evento.fechamento.comItensSemUso;
            reacao = "media";
        }

        this.pontuar({
            avaliacao: houveDemonstracao ? "boa" : "ruim",
            marca: mostrouPlanejado ? "definicao-de-pronto" : null,
            conceito: houveDemonstracao ? null : this.evento.fechamento.semItens.conceito
        });

        if (comUso) {
            acrescentarItem(this.registry, this.cadeira(), Object.assign(
                {id: ID_DO_FEEDBACK}, this.evento.feedbackDoUsuario
            ), "afazer");
        }

        const cena = this;
        this.comentarDecisao(reacao, resultado.feedback, resultado.principio, function () {
            cena.sair();
        });
    }
}
