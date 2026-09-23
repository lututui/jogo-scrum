// Daily Scrum
//
// Mecânica: a reunião tem quinze minutos e cada intervenção consome
// parte deles.
//
// O relógio é a restrição que dá peso à escolha.

import {DAILY_SCRUM} from "../dados/eventos.js";
import {COR, COR_HEX, FONTE} from "../dados/tema.js";
import {CenaEvento, LARGURA_DO_CONTEUDO, MARGEM, TOPO_DO_CONTEUDO, tituloDaAvaliacao}
    from "./CenaEvento.js";

export class CenaDailyScrum extends CenaEvento {

    constructor() {
        super(DAILY_SCRUM.chave, DAILY_SCRUM);
    }

    iniciar() {
        this.minutosUsados = 0;
        this.rodadaAtual = 0;
        this.impedimentosTratados = 0;

        this.criarRelogio();
        this.mostrarFala(this.evento.aberturaQuem, this.evento.abertura);
        this.abrirRodada();
    }

    criarRelogio() {
        this.caixaDoRelogio = this.add.rectangle(
            MARGEM + LARGURA_DO_CONTEUDO - 150, TOPO_DO_CONTEUDO - 34, 150, 28, COR_HEX.painel
        );
        this.caixaDoRelogio.setOrigin(0, 0);
        this.caixaDoRelogio.setStrokeStyle(1, COR_HEX.contornoSuave);

        this.textoDoRelogio = this.add.text(
            MARGEM + LARGURA_DO_CONTEUDO - 12, TOPO_DO_CONTEUDO - 27, "", {
                fontFamily: FONTE,
                fontSize: "13px",
                color: COR.texto
            }
        ).setOrigin(1, 0);

        this.atualizarRelogio();
    }

    atualizarRelogio() {
        const restante = this.evento.duracaoEmMinutos - this.minutosUsados;
        this.textoDoRelogio.setText("restam " + restante + " min");
        this.textoDoRelogio.setColor(restante <= 0 ? COR.alerta : COR.texto);
        this.caixaDoRelogio.setFillStyle(restante <= 0 ? COR_HEX.alertaSuave : COR_HEX.painel);
    }

    abrirRodada() {
        const rodada = this.evento.rodadas[this.rodadaAtual];
        if (!rodada) {
            this.fecharReuniao();
            return;
        }

        this.definirPergunta("O que você faz?");
        this.definirAjuda("setas escolhem, ENTER confirma");
        this.mostrarFala(rodada.quem, rodada.fala);

        const cena = this;
        this.montarLista({
            x: MARGEM,
            y: TOPO_DO_CONTEUDO,
            largura: LARGURA_DO_CONTEUDO,
            opcoes: rodada.opcoes.map(function (opcao) {
                return Object.assign({}, opcao, {sufixo: opcao.custo + " min"});
            }),
            aoConfirmar: function (opcao) {
                cena.responder(opcao);
            }
        });
    }

    responder(opcao) {
        this.minutosUsados += opcao.custo;
        if (opcao.registraImpedimento) {
            this.impedimentosTratados += 1;
        }
        this.atualizarRelogio();

        const cena = this;
        this.mostrarFeedback(
            tituloDaAvaliacao(opcao.avaliacao),
            opcao.feedback,
            opcao.principio,
            function () {
                cena.rodadaAtual += 1;
                cena.abrirRodada();
            }
        );
    }

    // O fechamento depende do tempo respeitado e impedimento em
    // condição de ser tratado
    fecharReuniao() {
        if (this.lista) {
            this.lista.destruir();
            this.lista = null;
        }

        const fechamento = this.evento.fechamento;
        const dentroDoTempo = this.minutosUsados <= this.evento.duracaoEmMinutos;

        const texto = (dentroDoTempo ? fechamento.dentroDoTempo : fechamento.acimaDoTempo)
            + " A reunião levou " + this.minutosUsados + " minutos. "
            + (this.impedimentosTratados > 0 ? fechamento.comImpedimento : fechamento.semImpedimento);

        const cena = this;
        this.definirPergunta("");
        this.mostrarFeedback(
            tituloDaAvaliacao(dentroDoTempo && this.impedimentosTratados > 0 ? "boa" : "media"),
            texto,
            fechamento.principio,
            function () {
                cena.sair();
            }
        );
    }
}
