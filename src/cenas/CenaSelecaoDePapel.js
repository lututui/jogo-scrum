// Seleção de papel
//
// Permite troca de cadeira.

import {CADEIRAS, ORDEM_DAS_CADEIRAS} from "../dados/cadeiras.js";
import {ELENCO} from "../dados/elenco.js";
import {apagarProgresso, cadeirasConcluidas} from "../dados/progresso.js";
import {COR, COR_HEX, FONTE} from "../dados/tema.js";

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

    create() {
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

        this.add.text(MARGEM, 508,
            "setas escolhem, ENTER confirma, R apaga o progresso salvo", {
                fontFamily: FONTE,
                fontSize: "12px",
                color: COR.textoSecundario
            });
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

        const nome = this.add.text(LARGURA_DO_CARTAO / 2, 140, cadeira.nome, {
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

        const conduz = this.add.text(20, 228, "Conduz: " + cadeira.conduz, {
            fontFamily: FONTE,
            fontSize: "11px",
            color: COR.textoSecundario,
            lineSpacing: 3,
            wordWrap: {width: LARGURA_DO_CARTAO - 40}
        });

        const mentor = this.add.text(20, 258, "Mentor: " + this.nomeDoTitular(chave), {
            fontFamily: FONTE,
            fontSize: "11px",
            color: COR.textoSecundario
        });

        const elementos = [fundo, avatar, nome, resumo, conduz, mentor];

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

    // O progresso fica gravado no navegador; apagar é explícito, e só aqui
    reiniciarProgresso() {
        apagarProgresso(this.registry);
        this.scene.restart();
    }

    criarControles() {
        this.teclaReiniciar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.teclas = this.input.keyboard.addKeys({
            esquerda: Phaser.Input.Keyboard.KeyCodes.LEFT,
            direita: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            acao: Phaser.Input.Keyboard.KeyCodes.ENTER,
            espaco: Phaser.Input.Keyboard.KeyCodes.SPACE
        });
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.teclaReiniciar)) {
            this.reiniciarProgresso();
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

    // O escritório pode estar pausado atrás, se a troca veio de lá
    confirmar() {
        this.registry.set("cadeira", this.cartoes[this.indice].chave);
        this.scene.stop();

        if (this.scene.isPaused("CenaEscritorio")) {
            this.scene.resume("CenaEscritorio");
            return;
        }

        this.scene.start("CenaEscritorio");
    }
}
