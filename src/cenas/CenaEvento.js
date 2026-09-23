// Base das cenas de evento do Scrum
//
// Reúne moldura, objetivo de aprendizagem no topo, pergunta da etapa,
// painel de feedback com o princípio e a volta ao escritório.
//
// A mecânica de cada evento fica na sua própria cena.

import {COR, COR_HEX, FONTE} from "../dados/tema.js";
import {ListaDeOpcoes} from "../ui/ListaDeOpcoes.js";

export const MARGEM = 24;
export const LARGURA_DA_TELA = 960;
export const ALTURA_DA_TELA = 540;
export const TOPO_DO_CONTEUDO = 196;
export const LARGURA_DO_CONTEUDO = LARGURA_DA_TELA - MARGEM * 2;

// Título do painel conforme o peso da decisão; o texto explica, o título só
// prepara a leitura
const TITULO_POR_AVALIACAO = {
    boa: "O que isso resolveu",
    media: "O que isso custou",
    ruim: "O que isso quebrou",
    neutro: "O que aconteceu"
};

export function tituloDaAvaliacao(avaliacao) {
    return TITULO_POR_AVALIACAO[avaliacao] || TITULO_POR_AVALIACAO.neutro;
}

export class CenaEvento extends Phaser.Scene {

    constructor(chave, evento) {
        super({key: chave});
        this.evento = evento;
    }

    // O Phaser reaproveita a instância da cena entre stop e launch: os objetos
    // de tela são destruídos, mas os campos continuam apontando para eles.
    create() {
        this.lista = null;
        this.emFeedback = false;
        this.aoFecharFeedback = null;
        this.caixaDeFala = null;
        this.textoDeFala = null;

        this.criarMoldura();
        this.criarPainelDeFeedback();
        this.criarControles();
        this.iniciar();
    }

    // -----------------------------------------------------------
    // moldura

    criarMoldura() {
        this.add.rectangle(0, 0, LARGURA_DA_TELA, ALTURA_DA_TELA, COR_HEX.fundo).setOrigin(0, 0);

        const barra = this.add.graphics();
        barra.fillStyle(COR_HEX.painel, 1);
        barra.fillRect(0, 0, LARGURA_DA_TELA, 40);
        barra.lineStyle(2, COR_HEX.contorno, 1);
        barra.lineBetween(0, 40, LARGURA_DA_TELA, 40);

        const estilo = {fontFamily: FONTE, fontSize: "14px", color: COR.texto};
        this.add.text(MARGEM, 13, this.evento.nome, estilo);
        this.add.text(LARGURA_DA_TELA - MARGEM, 13, "ESC PARA SAIR", estilo).setOrigin(1, 0);

        this.criarObjetivo();

        this.textoPergunta = this.add.text(MARGEM, TOPO_DO_CONTEUDO - 28, "", {
            fontFamily: FONTE,
            fontSize: "14px",
            color: COR.texto
        });

        this.textoAjuda = this.add.text(MARGEM, ALTURA_DA_TELA - 24, "", {
            fontFamily: FONTE,
            fontSize: "12px",
            color: COR.textoSecundario
        });

        this.definirAjuda("setas escolhem, ENTER confirma");
    }

    // Objetivo de aprendizagem exibido na abertura do evento (RF08)
    criarObjetivo() {
        const caixa = this.add.rectangle(MARGEM, 50, LARGURA_DO_CONTEUDO, 58, COR_HEX.painelSuave);
        caixa.setOrigin(0, 0);
        caixa.setStrokeStyle(1, COR_HEX.contornoSuave);

        this.add.text(MARGEM + 12, 57, "OBJETIVO", {
            fontFamily: FONTE,
            fontSize: "10px",
            color: COR.destaque
        });

        this.add.text(MARGEM + 12, 72, this.evento.objetivo, {
            fontFamily: FONTE,
            fontSize: "12px",
            color: COR.texto,
            lineSpacing: 4,
            wordWrap: {width: LARGURA_DO_CONTEUDO - 24}
        });
    }

    definirPergunta(texto) {
        this.textoPergunta.setText(texto);
    }

    definirAjuda(texto) {
        this.textoAjuda.setText(texto);
    }

    // Fala de abertura do mentor ou do interlocutor do evento
    mostrarFala(quem, fala) {
        if (this.caixaDeFala) {
            this.caixaDeFala.destroy();
            this.textoDeFala.destroy();
        }

        this.caixaDeFala = this.add.rectangle(
            MARGEM, TOPO_DO_CONTEUDO - 82, LARGURA_DO_CONTEUDO, 52, COR_HEX.painel
        );
        this.caixaDeFala.setOrigin(0, 0);
        this.caixaDeFala.setStrokeStyle(1, COR_HEX.contornoSuave);

        this.textoDeFala = this.add.text(MARGEM + 12, TOPO_DO_CONTEUDO - 74, quem + ": " + fala, {
            fontFamily: FONTE,
            fontSize: "12px",
            color: COR.texto,
            lineSpacing: 3,
            wordWrap: {width: LARGURA_DO_CONTEUDO - 24}
        });
    }

    // ----------------------------------------------------------
    // feedback

    criarPainelDeFeedback() {
        const largura = 720;
        const altura = 230;
        const x = (LARGURA_DA_TELA - largura) / 2;
        const y = (ALTURA_DA_TELA - altura) / 2;

        this.fundoDoFeedback = this.add.rectangle(
            0, 0, LARGURA_DA_TELA, ALTURA_DA_TELA, COR_HEX.contorno, 0.35
        ).setOrigin(0, 0).setDepth(900);

        this.painelDeFeedback = this.add.rectangle(x, y, largura, altura, COR_HEX.painel);
        this.painelDeFeedback.setOrigin(0, 0);
        this.painelDeFeedback.setStrokeStyle(2, COR_HEX.contorno);
        this.painelDeFeedback.setDepth(901);

        this.tituloDoFeedback = this.add.text(x + 20, y + 18, "", {
            fontFamily: FONTE,
            fontSize: "13px",
            color: COR.destaque
        }).setDepth(902);

        this.textoDoFeedback = this.add.text(x + 20, y + 44, "", {
            fontFamily: FONTE,
            fontSize: "13px",
            color: COR.texto,
            lineSpacing: 5,
            wordWrap: {width: largura - 40}
        }).setDepth(902);

        this.linhaDoPrincipio = this.add.rectangle(x + 20, y + altura - 76, largura - 40, 1,
            COR_HEX.contornoSuave).setOrigin(0, 0).setDepth(902);

        this.textoDoPrincipio = this.add.text(x + 20, y + altura - 66, "", {
            fontFamily: FONTE,
            fontSize: "12px",
            color: COR.textoSecundario,
            lineSpacing: 4,
            wordWrap: {width: largura - 40}
        }).setDepth(902);

        this.dicaDoFeedback = this.add.text(x + largura - 20, y + altura - 22, "ENTER para continuar", {
            fontFamily: FONTE,
            fontSize: "11px",
            color: COR.textoSecundario
        }).setOrigin(1, 0).setDepth(902);

        this.elementosDoFeedback = [
            this.fundoDoFeedback, this.painelDeFeedback, this.tituloDoFeedback,
            this.textoDoFeedback, this.linhaDoPrincipio, this.textoDoPrincipio,
            this.dicaDoFeedback
        ];
        this.esconderFeedback();
    }

    // O princípio ágil vem junto da consequência (RF10)
    mostrarFeedback(titulo, texto, principio, aoFechar) {
        this.emFeedback = true;
        this.aoFecharFeedback = aoFechar || null;

        this.tituloDoFeedback.setText(titulo);
        this.textoDoFeedback.setText(texto);
        this.textoDoPrincipio.setText(principio ? "Princípio: " + principio : "");

        this.elementosDoFeedback.forEach(function (elemento) {
            elemento.setVisible(true);
        });
    }

    esconderFeedback() {
        this.emFeedback = false;
        this.elementosDoFeedback.forEach(function (elemento) {
            elemento.setVisible(false);
        });
    }

    fecharFeedback() {
        const seguinte = this.aoFecharFeedback;
        this.aoFecharFeedback = null;
        this.esconderFeedback();

        if (seguinte) {
            seguinte();
        }
    }

    // -------------------------------------------------------------
    // lista

    montarLista(config) {
        if (this.lista) {
            this.lista.destruir();
        }
        this.lista = new ListaDeOpcoes(this, config);
        return this.lista;
    }

    // ----------------------------------------------------------
    // controles

    criarControles() {
        this.teclas = this.input.keyboard.addKeys({
            cima: Phaser.Input.Keyboard.KeyCodes.UP,
            baixo: Phaser.Input.Keyboard.KeyCodes.DOWN,
            acao: Phaser.Input.Keyboard.KeyCodes.ENTER,
            espaco: Phaser.Input.Keyboard.KeyCodes.SPACE,
            concluir: Phaser.Input.Keyboard.KeyCodes.C,
            sair: Phaser.Input.Keyboard.KeyCodes.ESC
        });
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.teclas.sair)) {
            this.sair();
            return;
        }

        if (this.emFeedback) {
            if (this.confirmou()) {
                this.fecharFeedback();
            }
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(this.teclas.cima)) {
            this.aoNavegar(-1);
        } else if (Phaser.Input.Keyboard.JustDown(this.teclas.baixo)) {
            this.aoNavegar(1);
        } else if (this.confirmou()) {
            this.aoConfirmarSelecao();
        } else if (Phaser.Input.Keyboard.JustDown(this.teclas.concluir)) {
            this.aoConcluirEtapa();
        }
    }

    confirmou() {
        return Phaser.Input.Keyboard.JustDown(this.teclas.acao)
            || Phaser.Input.Keyboard.JustDown(this.teclas.espaco);
    }

    aoNavegar(passo) {
        if (this.lista) {
            this.lista.mover(passo);
        }
    }

    aoConfirmarSelecao() {
        if (this.lista) {
            this.lista.confirmar();
        }
    }

    // Etapas de escolha múltipla
    aoConcluirEtapa() {
    }

    sair() {
        this.scene.stop();
        this.scene.resume("CenaEscritorio");
    }

    // Implementado por cada evento
    iniciar() {
    }
}