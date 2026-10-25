// Tela de fim
//
// Aparece uma vez, depois da síntese que completa as três cadeiras. Mostra a
// última sprint de cada cadeira lado a lado e as conquistas do jogo.

import {CADEIRAS, ORDEM_DAS_CADEIRAS} from "../dados/cadeiras.js";
import {CONQUISTAS} from "../dados/conquistas.js";
import {MEDIDORES, conquistasDoJogo, conquistasPorId, ultimaSprint} from "../dados/progresso.js";
import {COR, COR_HEX, FONTE} from "../dados/tema.js";
import {nomeDaCadeira, personalizar} from "../dados/texto.js";
import {tocarEfeito} from "../ui/som.js";
import {anotar} from "../dados/diario.js";

const MARGEM = 24;
const TOPO_DA_TABELA = 150;
const ALTURA_DA_LINHA = 30;
const COLUNAS_DA_TABELA = [MARGEM, 180, 260, 360, 660];

export class CenaFim extends Phaser.Scene {

    constructor() {
        super({key: "CenaFim"});
    }

    create() {
        anotar("fim", {});
        this.montarMoldura();
        this.montarTabela();
        this.montarConquistas();
        this.criarControles();
        tocarEfeito(this, "vinheta");
    }

    montarMoldura() {
        this.add.rectangle(0, 0, 960, 540, COR_HEX.fundo).setOrigin(0, 0);

        const barra = this.add.graphics();
        barra.fillStyle(COR_HEX.painel, 1);
        barra.fillRect(0, 0, 960, 40);
        barra.lineStyle(2, COR_HEX.contorno, 1);
        barra.lineBetween(0, 40, 960, 40);

        this.add.text(MARGEM, 13, "FIM DA EXPERIÊNCIA", {
            fontFamily: FONTE,
            fontSize: "14px",
            color: COR.texto
        });

        this.add.text(MARGEM, 62, personalizar(this.registry,
            "Você viveu a mesma sprint pelas três cadeiras do time: no lugar de "
            + "quem decide o que vale a pena construir, de quem cuida do processo "
            + "e de quem responde pelo que é construído. A tabela mostra como foi "
            + "a última sprint em cada uma."), {
                fontFamily: FONTE,
                fontSize: "13px",
                color: COR.texto,
                lineSpacing: 5,
                wordWrap: {width: 960 - MARGEM * 2}
            });

        this.add.text(MARGEM, 516,
            "ENTER volta ao menu principal; qualquer cadeira pode ser jogada de novo", {
                fontFamily: FONTE,
                fontSize: "11px",
                color: COR.textoSecundario
            });
    }

    // Uma linha por cadeira, com a última sprint fechada nela
    montarTabela() {
        const titulos = ["CADEIRA", "PONTOS", "ENTREGA", "DECISÕES", "MEDIDORES"];

        titulos.forEach(function (titulo, indice) {
            this.add.text(COLUNAS_DA_TABELA[indice], TOPO_DA_TABELA, titulo, {
                fontFamily: FONTE,
                fontSize: "11px",
                color: COR.destaque
            });
        }, this);

        this.add.rectangle(MARGEM, TOPO_DA_TABELA + 18, 960 - MARGEM * 2, 1, COR_HEX.contornoSuave)
            .setOrigin(0, 0);

        ORDEM_DAS_CADEIRAS.forEach(function (cadeira, posicao) {
            const y = TOPO_DA_TABELA + 28 + posicao * ALTURA_DA_LINHA;
            const sprint = ultimaSprint(this.registry, cadeira);
            const celulas = [
                nomeDaCadeira(this.registry, cadeira),
                sprint ? String(sprint.pontos) : "—",
                sprint && sprint.entrega ? sprint.entrega.prontos + " de " + sprint.entrega.total : "—",
                sprint ? this.textoDasDecisoes(sprint.decisoes) : "—",
                sprint ? this.textoDosMedidores(sprint.medidores) : "—"
            ];

            celulas.forEach(function (texto, indice) {
                this.add.text(COLUNAS_DA_TABELA[indice], y, texto, {
                    fontFamily: FONTE,
                    fontSize: "12px",
                    color: indice === 0 ? CADEIRAS[cadeira].cor : COR.texto
                });
            }, this);
        }, this);
    }

    textoDasDecisoes(decisoes) {
        return decisoes.boa + " alinhadas · " + decisoes.media + " com custo · "
            + decisoes.ruim + " contra";
    }

    // Primeira palavra de cada medidor e o valor final
    textoDosMedidores(medidores) {
        return Object.keys(MEDIDORES).map(function (chave) {
            return MEDIDORES[chave].nome.split(" ")[0].toLowerCase() + " " + medidores[chave];
        }).join(" · ");
    }

    // As conquistas do jogo inteiro, em duas colunas
    montarConquistas() {
        const y = TOPO_DA_TABELA + 28 + ORDEM_DAS_CADEIRAS.length * ALTURA_DA_LINHA + 24;
        const obtidas = conquistasPorId(conquistasDoJogo(this.registry));

        this.add.text(MARGEM, y, "CONQUISTAS: " + obtidas.length + " DE " + CONQUISTAS.length, {
            fontFamily: FONTE,
            fontSize: "11px",
            color: COR.destaque
        });

        this.add.rectangle(MARGEM, y + 18, 960 - MARGEM * 2, 1, COR_HEX.contornoSuave)
            .setOrigin(0, 0);

        CONQUISTAS.forEach(function (conquista, indice) {
            const obtida = obtidas.indexOf(conquista) >= 0;
            const coluna = indice % 2;
            const linha = Math.floor(indice / 2);

            this.add.text(MARGEM + coluna * 456, y + 30 + linha * 24,
                (obtida ? "✓ " : "○ ") + conquista.nome, {
                    fontFamily: FONTE,
                    fontSize: "12px",
                    color: obtida ? COR.destaque : COR.textoSecundario
                });
        }, this);
    }

    criarControles() {
        this.teclas = this.input.keyboard.addKeys({
            acao: Phaser.Input.Keyboard.KeyCodes.ENTER,
            espaco: Phaser.Input.Keyboard.KeyCodes.SPACE
        });
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.teclas.acao)
            || Phaser.Input.Keyboard.JustDown(this.teclas.espaco)) {
            this.scene.start("CenaMenu");
        }
    }
}
