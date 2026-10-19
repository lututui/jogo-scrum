// Síntese da sprint
//
// Fecha a sprint de uma cadeira. O que foi decidido, como ficaram os três
// medidores, as conquistas obtidas e os conceitos que valem revisar.

import {CADEIRAS, ORDEM_DAS_CADEIRAS} from "../dados/cadeiras.js";
import {
    MEDIDORES,
    cadeirasConcluidas,
    conquistasObtidas,
    lerProgresso,
    registrarSprintConcluida
} from "../dados/progresso.js";
import {COR, COR_HEX, FONTE} from "../dados/tema.js";

const MARGEM = 24;
const LARGURA_DA_COLUNA = 440;
const TOPO = 108;

export class CenaSintese extends Phaser.Scene {

    constructor() {
        super({key: "CenaSintese"});
    }

    create() {
        this.cadeira = this.registry.get("cadeira") || "po";
        this.progresso = registrarSprintConcluida(this.registry, this.cadeira);
        this.fechouTodas = cadeirasConcluidas(this.registry).length === ORDEM_DAS_CADEIRAS.length;

        this.montarMoldura();
        this.montarDecisoes();
        this.montarMedidores();
        this.montarConquistas();
        this.montarRodape();
        this.criarControles();
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

        this.add.text(MARGEM, 13, "FIM DA SPRINT", {
            fontFamily: FONTE,
            fontSize: "14px",
            color: COR.texto
        });

        this.add.text(936, 13, "COMO " + CADEIRAS[this.cadeira].nome.toUpperCase(), {
            fontFamily: FONTE,
            fontSize: "14px",
            color: CADEIRAS[this.cadeira].cor
        }).setOrigin(1, 0);

        this.add.text(MARGEM, 62, this.resumoDaSprint(), {
            fontFamily: FONTE,
            fontSize: "13px",
            color: COR.texto,
            lineSpacing: 4,
            wordWrap: {width: 960 - MARGEM * 2}
        });
    }

    resumoDaSprint() {
        const decisoes = this.progresso.decisoes;
        const total = decisoes.boa + decisoes.media + decisoes.ruim;

        return "Você tomou " + total + " decisões nesta cadeira e somou "
            + this.progresso.pontos + " pontos.";
    }

    // ---------------------------------------------------------
    // blocos

    montarDecisoes() {
        this.tituloDoBloco(MARGEM, TOPO, "DECISÕES");

        const decisoes = this.progresso.decisoes;
        const linhas = [
            ["alinhadas ao princípio", decisoes.boa],
            ["com custo", decisoes.media],
            ["contra o princípio", decisoes.ruim],
            ["tomadas sem mentor", this.progresso.decisoesSozinho]
        ];

        linhas.forEach(function (linha, posicao) {
            const y = TOPO + 28 + posicao * 22;

            this.add.text(MARGEM, y, linha[0], {
                fontFamily: FONTE,
                fontSize: "12px",
                color: COR.texto
            });

            this.add.text(MARGEM + LARGURA_DA_COLUNA - 20, y, String(linha[1]), {
                fontFamily: FONTE,
                fontSize: "12px",
                color: COR.textoSecundario
            }).setOrigin(1, 0);
        }, this);
    }

    montarMedidores() {
        const x = MARGEM + LARGURA_DA_COLUNA + 32;
        this.tituloDoBloco(x, TOPO, "MEDIDORES");

        Object.keys(MEDIDORES).forEach(function (chave, posicao) {
            const y = TOPO + 28 + posicao * 26;
            const valor = this.progresso.medidores[chave];

            this.add.text(x, y, MEDIDORES[chave].nome, {
                fontFamily: FONTE,
                fontSize: "12px",
                color: COR.texto
            });

            const fundo = this.add.rectangle(x + 210, y + 2, 180, 10, COR_HEX.painelSuave)
                .setOrigin(0, 0);
            fundo.setStrokeStyle(1, COR_HEX.contornoSuave);

            this.add.rectangle(x + 211, y + 3, Math.max(178 * valor / 100, 1), 8,
                valor < 35 ? COR_HEX.alerta : COR_HEX.destaque).setOrigin(0, 0);

            this.add.text(x + 400, y, String(valor), {
                fontFamily: FONTE,
                fontSize: "12px",
                color: COR.textoSecundario
            }).setOrigin(1, 0);
        }, this);
    }

    montarConquistas() {
        const y = TOPO + 132;
        this.tituloDoBloco(MARGEM, y, "CONQUISTAS");

        const obtidas = conquistasObtidas(this.progresso);

        if (obtidas.length === 0) {
            this.add.text(MARGEM, y + 28, "Nenhuma ainda. Elas marcam conduta, não quantidade.", {
                fontFamily: FONTE,
                fontSize: "12px",
                color: COR.textoSecundario
            });

            return;
        }

        obtidas.slice(0, 6).forEach(function (conquista, posicao) {
            const linha = y + 28 + posicao * 30;

            this.add.text(MARGEM, linha, conquista.nome, {
                fontFamily: FONTE,
                fontSize: "12px",
                color: COR.destaque
            });

            this.add.text(MARGEM + 240, linha, conquista.descricao, {
                fontFamily: FONTE,
                fontSize: "11px",
                color: COR.textoSecundario
            });
        }, this);
    }

    // As cadeiras já vividas, e o convite para as que faltam
    montarRodape() {
        const y = 446;
        const cumpridas = cadeirasConcluidas(this.registry);

        const marcadas = ORDEM_DAS_CADEIRAS.map(function (cadeira) {
            const feita = cumpridas.indexOf(cadeira) >= 0;

            return (feita ? "\u2713 " : "\u25cb ") + CADEIRAS[cadeira].nome;
        }).join("     ");

        this.add.text(MARGEM, y, marcadas, {
            fontFamily: FONTE,
            fontSize: "12px",
            color: COR.texto
        });

        this.add.text(MARGEM, y + 24, this.textoDoEpilogo(), {
            fontFamily: FONTE,
            fontSize: "12px",
            color: this.fechouTodas ? COR.destaque : COR.textoSecundario,
            lineSpacing: 4,
            wordWrap: {width: 960 - MARGEM * 2}
        });

        this.add.text(MARGEM, 516, "ENTER volta para a escolha de cadeira", {
            fontFamily: FONTE,
            fontSize: "11px",
            color: COR.textoSecundario
        });
    }

    textoDoEpilogo() {
        if (!this.fechouTodas) {
            return "A mesma sprint muda de forma conforme a cadeira. As que "
                + "faltam mostram o outro lado das decisões que você tomou aqui.";
        }

        return "Você viveu a mesma sprint das três cadeiras: negociou o escopo, "
            + "protegeu o acordo do time e recebeu a pressão direta de quem "
            + "executa. O pedido de última hora, o dado que não veio e o atalho "
            + "técnico foram os mesmos; o que mudou foi de onde você os enxergou.";
    }

    tituloDoBloco(x, y, texto) {
        this.add.text(x, y, texto, {
            fontFamily: FONTE,
            fontSize: "11px",
            color: COR.destaque
        });

        this.add.rectangle(x, y + 18, LARGURA_DA_COLUNA, 1, COR_HEX.contornoSuave)
            .setOrigin(0, 0);
    }

    // ---------------------------------------------------------
    // controles

    criarControles() {
        this.teclas = this.input.keyboard.addKeys({
            acao: Phaser.Input.Keyboard.KeyCodes.ENTER,
            espaco: Phaser.Input.Keyboard.KeyCodes.SPACE
        });
    }

    update() {
        const confirmou = Phaser.Input.Keyboard.JustDown(this.teclas.acao)
            || Phaser.Input.Keyboard.JustDown(this.teclas.espaco);

        if (confirmou) {
            this.scene.stop();
            this.scene.start("CenaSelecaoDePapel");
        }
    }
}
