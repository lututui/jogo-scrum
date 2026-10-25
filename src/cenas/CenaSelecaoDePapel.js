// Seleção de papel
//
// Aparece no começo de uma partida nova e depois da síntese de cada cadeira:
// a cadeira escolhida vale até a sprint dela terminar. O guia vem antes, no
// começo da partida, e daqui só abre pela tecla H.

import {CADEIRA_RECEM_ESCOLHIDA} from "../dados/boasVindas.js";
import {CADEIRAS, ORDEM_DAS_CADEIRAS} from "../dados/cadeiras.js";
import {DEPURACAO, marcarDepuracao, opcoesLigadas} from "../dados/depuracao.js";
import {ELENCO} from "../dados/elenco.js";
import {temPerfil} from "../dados/perfil.js";
import {cadeirasConcluidas, definirCadeiraEmAndamento} from "../dados/progresso.js";
import {COR, COR_HEX, FONTE} from "../dados/tema.js";
import {nomeDaCadeira} from "../dados/texto.js";
import {abrirGuia} from "./CenaGuia.js";
import {anotar} from "../dados/diario.js";

const MARGEM = 24;
const TOPO_DOS_CARTOES = 150;
const LARGURA_DO_CARTAO = 288;
const ALTURA_DO_CARTAO = 286;
const ESPACO_ENTRE_CARTOES = 18;
const ESCALA_DO_AVATAR = 3;

export class CenaSelecaoDePapel extends Phaser.Scene {

    constructor() {
        super({key: "CenaSelecaoDePapel"});
    }

    // sem perfil completo não se entra no jogo: o editor vem antes
    create() {
        this.semPerfil = !temPerfil(this.registry);
        if (this.semPerfil) {
            this.scene.start("CenaEditor", {depois: "CenaSelecaoDePapel", voltar: "CenaMenu"});
            return;
        }

        this.indice = this.indiceDaCadeiraAtual();
        this.cartoes = [];

        this.montarMoldura();
        this.montarCartoes();
        this.criarControles();
        this.destacarEscolhido();
    }

    indiceDaCadeiraAtual() {
        const atual = this.registry.get("cadeira");
        const posicao = ORDEM_DAS_CADEIRAS.indexOf(atual);

        return posicao < 0 ? 0 : posicao;
    }

    // ---------------------------------------------------------
    // moldura

    montarMoldura() {
        this.add.rectangle(0, 0, 960, 540, COR_HEX.fundo).setOrigin(0, 0);

        const barra = this.add.graphics();
        barra.fillStyle(COR_HEX.painel, 1);
        barra.fillRect(0, 0, 960, 40);
        barra.lineStyle(2, COR_HEX.contorno, 1);
        barra.lineBetween(0, 40, 960, 40);

        this.add.text(MARGEM, 13, "ESCOLHA SUA CADEIRA", {
            fontFamily: FONTE,
            fontSize: "14px",
            color: COR.texto
        });

        this.add.text(MARGEM, 66,
            "Você acompanha o contrato da escola como aprendiz. A cada sprint "
            + "ocupa uma cadeira do time, ao lado de quem exerce o papel.", {
                fontFamily: FONTE,
                fontSize: "13px",
                color: COR.texto,
                lineSpacing: 5,
                wordWrap: {width: 960 - MARGEM * 2}
            });

        this.add.text(MARGEM, 112,
            "As decisões são suas: o titular da cadeira orienta e comenta, "
            + "mas não decide no seu lugar.", {
                fontFamily: FONTE,
                fontSize: "12px",
                color: COR.textoSecundario
            });

        marcarDepuracao(this, 936, 46);
        this.listarDepuracao();

        this.add.text(MARGEM, 508,
            "setas escolhem, ENTER confirma, H abre o guia, ESC volta", {
                fontFamily: FONTE,
                fontSize: "12px",
                color: COR.textoSecundario
            });
    }

    listarDepuracao() {
        if (!DEPURACAO.ativa) {
            return;
        }

        this.add.text(MARGEM, 466, "depuração ligada no servidor: " + opcoesLigadas().join(", "), {
            fontFamily: FONTE,
            fontSize: "11px",
            color: COR.alerta,
            wordWrap: {width: 960 - MARGEM * 2}
        }).setDepth(900);
    }

    // ---------------------------------------------------------
    // cartões

    montarCartoes() {
        const largura = LARGURA_DO_CARTAO * 3 + ESPACO_ENTRE_CARTOES * 2;
        const inicio = (960 - largura) / 2;

        ORDEM_DAS_CADEIRAS.forEach(function (chave, posicao) {
            const x = inicio + posicao * (LARGURA_DO_CARTAO + ESPACO_ENTRE_CARTOES);
            this.cartoes.push(this.criarCartao(chave, x, posicao));
        }, this);
    }

    criarCartao(chave, x, posicao) {
        const cadeira = CADEIRAS[chave];
        const container = this.add.container(x, TOPO_DOS_CARTOES);

        const fundo = this.add.rectangle(
            0, 0, LARGURA_DO_CARTAO, ALTURA_DO_CARTAO, COR_HEX.painel
        ).setOrigin(0, 0);
        fundo.setStrokeStyle(1, COR_HEX.contornoSuave);

        const avatar = this.add.image(
            LARGURA_DO_CARTAO / 2, 78, "corpo_jogador_" + chave, 0
        ).setScale(ESCALA_DO_AVATAR);

        const nome = this.add.text(LARGURA_DO_CARTAO / 2, 140, nomeDaCadeira(this.registry, chave), {
            fontFamily: FONTE,
            fontSize: "15px",
            color: cadeira.cor
        }).setOrigin(0.5, 0);

        const resumo = this.add.text(20, 176, cadeira.resumo, {
            fontFamily: FONTE,
            fontSize: "12px",
            color: COR.texto,
            lineSpacing: 4,
            wordWrap: {width: LARGURA_DO_CARTAO - 40}
        });

        const nosEventos = this.add.text(20, 222, "Nos eventos: " + cadeira.nosEventos, {
            fontFamily: FONTE,
            fontSize: "11px",
            color: COR.textoSecundario,
            lineSpacing: 3,
            wordWrap: {width: LARGURA_DO_CARTAO - 40}
        });

        const mentor = this.add.text(20, 262, "Mentor: " + this.nomeDoTitular(chave), {
            fontFamily: FONTE,
            fontSize: "11px",
            color: COR.textoSecundario
        });

        const elementos = [fundo, avatar, nome, resumo, nosEventos, mentor];

        if (cadeirasConcluidas(this.registry).indexOf(chave) >= 0) {
            elementos.push(this.add.text(LARGURA_DO_CARTAO - 20, 14, "\u2713 vivida", {
                fontFamily: FONTE,
                fontSize: "11px",
                color: COR.destaque
            }).setOrigin(1, 0));
        }

        container.add(elementos);
        container.setSize(LARGURA_DO_CARTAO, ALTURA_DO_CARTAO);

        container.setInteractive(
            new Phaser.Geom.Rectangle(
                container.displayOriginX, container.displayOriginY,
                LARGURA_DO_CARTAO, ALTURA_DO_CARTAO
            ),
            Phaser.Geom.Rectangle.Contains
        );
        container.input.cursor = "pointer";

        const cena = this;
        container.on("pointerdown", function () {
            cena.indice = posicao;
            cena.destacarEscolhido();
            cena.confirmar();
        });

        return {chave: chave, fundo: fundo};
    }

    nomeDoTitular(chave) {
        const titular = ELENCO.find(function (pessoa) {
            return pessoa.chave === CADEIRAS[chave].titular;
        });

        return titular ? titular.nome : CADEIRAS[chave].titular;
    }

    destacarEscolhido() {
        this.cartoes.forEach(function (cartao, posicao) {
            const escolhido = posicao === this.indice;

            cartao.fundo.setStrokeStyle(
                escolhido ? 3 : 1,
                escolhido ? COR_HEX.destaque : COR_HEX.contornoSuave
            );
            cartao.fundo.setFillStyle(escolhido ? COR_HEX.selecao : COR_HEX.painel);
        }, this);
    }

    // ---------------------------------------------------------
    // controles

    criarControles() {
        this.teclaGuia = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
        this.teclas = this.input.keyboard.addKeys({
            esquerda: Phaser.Input.Keyboard.KeyCodes.LEFT,
            direita: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            acao: Phaser.Input.Keyboard.KeyCodes.ENTER,
            espaco: Phaser.Input.Keyboard.KeyCodes.SPACE,
            sair: Phaser.Input.Keyboard.KeyCodes.ESC
        });
    }

    update() {
        if (this.semPerfil) {
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(this.teclas.sair)) {
            this.voltar();
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(this.teclaGuia)) {
            abrirGuia(this);
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(this.teclas.esquerda)) {
            this.mover(-1);
        } else if (Phaser.Input.Keyboard.JustDown(this.teclas.direita)) {
            this.mover(1);
        } else if (Phaser.Input.Keyboard.JustDown(this.teclas.acao)
            || Phaser.Input.Keyboard.JustDown(this.teclas.espaco)) {
            this.confirmar();
        }
    }

    mover(passo) {
        this.indice = Phaser.Math.Clamp(this.indice + passo, 0, this.cartoes.length - 1);
        this.destacarEscolhido();
    }

    // Vinda do escritório pela tecla P, a troca é cancelada e a cadeira não
    // muda; vinda do menu, volta para ele
    voltar() {
        this.scene.stop();

        if (this.scene.isPaused("CenaEscritorio")) {
            this.scene.resume("CenaEscritorio");
            return;
        }

        this.scene.start("CenaMenu");
    }

    // O escritório pode estar pausado atrás, se a troca veio de lá; nos dois
    // casos, o mentor da cadeira recebe o jogador
    confirmar() {
        this.registry.set("cadeira", this.cartoes[this.indice].chave);
        this.registry.set(CADEIRA_RECEM_ESCOLHIDA, true);
        definirCadeiraEmAndamento(this.registry, this.cartoes[this.indice].chave);
        anotar("cadeira", {cadeira: this.cartoes[this.indice].chave});
        this.scene.stop();

        if (this.scene.isPaused("CenaEscritorio")) {
            this.scene.resume("CenaEscritorio");
            return;
        }

        this.scene.start("CenaEscritorio");
    }
}
