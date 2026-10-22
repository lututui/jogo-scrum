// Daily Scrum
//
// Mecânica: a reunião tem quinze minutos e cada intervenção consome
// parte deles.

import {DAILY_SCRUM} from "../dados/eventos.js";
import {CenaReuniao} from "./CenaReuniao.js";

export class CenaDailyScrum extends CenaReuniao {

    constructor() {
        super(DAILY_SCRUM.chave, DAILY_SCRUM);
    }

    iniciar() {
        this.minutosUsados = 0;
        this.rodadaAtual = 0;
        this.impedimentosTratados = 0;

        if (!this.conduzOEvento()) {
            this.participarDoEvento();
            return;
        }

        this.atualizarRelogio();

        const cena = this;
        this.falarAbertura(function () {
            cena.abrirRodada();
        });
    }

    atualizarRelogio() {
        const restante = this.evento.duracaoEmMinutos - this.minutosUsados;
        this.definirAviso("restam " + restante + " min");
    }

    abrirRodada() {
        const rodada = this.evento.rodadas[this.rodadaAtual];
        if (!rodada) {
            this.fecharReuniao();
            return;
        }

        const cena = this;
        this.falar(rodada.quem, rodada.fala, function () {
            cena.perguntar({
                pergunta: "O que você faz?",
                opcoes: rodada.opcoes.map(function (opcao) {
                    return Object.assign({}, opcao, {sufixo: opcao.custo + " min"});
                }),
                aoConfirmar: function (opcao) {
                    cena.responderNaRodada(opcao);
                }
            });
        }, rodada.expressao);
    }

    responderNaRodada(opcao) {
        const mudanca = this.pontuar(Object.assign({}, opcao, {
            marca: opcao.registraImpedimento ? "impedimento" : opcao.marca
        }));
        this.minutosUsados += opcao.custo;
        if (opcao.registraImpedimento) {
            this.impedimentosTratados += 1;
        }
        this.atualizarRelogio();

        const cena = this;
        this.responder(opcao.titulo, function () {
            cena.mostrarMudanca(mudanca, function () {
                cena.comentarDecisao(opcao.avaliacao, opcao.feedback, opcao.principio, function () {
                    cena.rodadaAtual += 1;
                    cena.abrirRodada();
                });
            });
        });
    }

    // O fechamento depende do tempo respeitado e impedimento em
    // condição de ser tratado
    fecharReuniao() {
        const fechamento = this.evento.fechamento;
        const dentroDoTempo = this.minutosUsados <= this.evento.duracaoEmMinutos;

        // Passar do tempo é uma decisão com custo, somada às das rodadas
        if (!dentroDoTempo) {
            this.pontuar({avaliacao: "media", conceito: fechamento.conceitoAcimaDoTempo});
        }

        const texto = (dentroDoTempo ? fechamento.dentroDoTempo : fechamento.acimaDoTempo)
            + " A reunião levou " + this.minutosUsados + " minutos. "
            + (this.impedimentosTratados > 0 ? fechamento.comImpedimento : fechamento.semImpedimento);

        const acertos = (dentroDoTempo ? 1 : 0) + (this.impedimentosTratados > 0 ? 1 : 0);
        const avaliacao = ["ruim", "media", "boa"][acertos];

        const cena = this;
        this.comentarDecisao(avaliacao, texto, fechamento.principio, function () {
            cena.sair();
        });
    }
}
