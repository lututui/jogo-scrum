// Guia introdutório
//
// Abre por cima da escolha de cadeira, que fica pausada atrás. Fechar o guia,
// pelo fim ou por ESC, marca o guia como visto.

import {GUIA} from "../dados/guia.js";
import {marcarGuiaVisto} from "../dados/progresso.js";
import {COR, COR_HEX, FONTE} from "../dados/tema.js";
import {abrirPorCima, fecharPorCima} from "./sobreposicao.js";

const PAINEL = {x: 120, y: 72, largura: 720, altura: 392};
const RECUO = 24;
const RAIO_DO_PONTO = 4;
const ESPACO_ENTRE_PONTOS = 18;

export function abrirGuia(cena) {
    abrirPorCima(cena, "CenaGuia");
}

export class CenaGuia extends Phaser.Scene {

    constructor() {
        super({key: "CenaGuia"});
    }

    init(dados) {
        this.retorno = dados.retorno;
        this.pagina = 0;
    }

    create() {
        this.montarMoldura();
        this.montarPainel();
        this.montarPontos();
        this.criarControles();
        this.mostrarPagina();
    }

    montarMoldura() {
        this.add.rectangle(0, 0, 960, 540, COR_HEX.fundo).setOrigin(0, 0);

        const barra = this.add.graphics();
        barra.fillStyle(COR_HEX.painel, 1);
        barra.fillRect(0, 0, 960, 40);
        barra.lineStyle(2, COR_HEX.contorno, 1);
        barra.lineBetween(0, 40, 960, 40);

        const estilo = {fontFamily: FONTE, fontSize: "14px", color: COR.texto};
        this.add.text(24, 13, "GUIA", estilo);
        this.textoDaPagina = this.add.text(480, 13, "", estilo).setOrigin(0.5, 0);
        this.add.text(936, 13, "ESC PARA FECHAR", estilo).setOrigin(1, 0);

        this.textoDeAjuda = this.add.text(480, 516, "", {
            fontFamily: FONTE,
            fontSize: "12px",
            color: COR.textoSecundario
        }).setOrigin(0.5, 0);
    }

    montarPainel() {
        const fundo = this.add.rectangle(
            PAINEL.x, PAINEL.y, PAINEL.largura, PAINEL.altura, COR_HEX.painel
        ).setOrigin(0, 0);
        fundo.setStrokeStyle(1, COR_HEX.contornoSuave);

        const x = PAINEL.x + RECUO;
        const largura = PAINEL.largura - RECUO * 2;

        this.textoDoTitulo = this.add.text(x, PAINEL.y + RECUO, "", {
            fontFamily: FONTE,
            fontSize: "18px",
            color: COR.destaque
        });

        this.add.rectangle(x, PAINEL.y + 60, largura, 1, COR_HEX.contornoSuave).setOrigin(0, 0);

        this.textoDoCorpo = this.add.text(x, PAINEL.y + 80, "", {
            fontFamily: FONTE,
            fontSize: "14px",
            color: COR.texto,
            lineSpacing: 7,
            wordWrap: {width: largura}
        });
    }

    // Um ponto por página, cheio na página atual
    montarPontos() {
        const y = PAINEL.y + PAINEL.altura + 22;
        const inicio = 480 - (GUIA.length - 1) * ESPACO_ENTRE_PONTOS / 2;

        this.pontos = GUIA.map(function (pagina, indice) {
            const ponto = this.add.circle(
                inicio + indice * ESPACO_ENTRE_PONTOS, y, RAIO_DO_PONTO, COR_HEX.painel
            );
            ponto.setStrokeStyle(1, COR_HEX.destaque);

            return ponto;
        }, this);
    }

    mostrarPagina() {
        const pagina = GUIA[this.pagina];
        const ultima = this.pagina === GUIA.length - 1;

        this.textoDaPagina.setText((this.pagina + 1) + " DE " + GUIA.length);
        this.textoDoTitulo.setText(pagina.titulo);
        this.textoDoCorpo.setText(pagina.texto);

        this.pontos.forEach(function (ponto, indice) {
            ponto.setFillStyle(indice === this.pagina ? COR_HEX.destaque : COR_HEX.painel);
        }, this);

        this.textoDeAjuda.setText(ultima
            ? "ENTER começa, ← volta"
            : "ENTER ou → avança, ← volta, clique para avançar");
    }

    criarControles() {
        this.teclas = this.input.keyboard.addKeys({
            avancar: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            voltar: Phaser.Input.Keyboard.KeyCodes.LEFT,
            acao: Phaser.Input.Keyboard.KeyCodes.ENTER,
            espaco: Phaser.Input.Keyboard.KeyCodes.SPACE,
            sair: Phaser.Input.Keyboard.KeyCodes.ESC
        });

        this.input.on("pointerdown", this.avancar, this);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.teclas.sair)) {
            this.fechar();
        } else if (Phaser.Input.Keyboard.JustDown(this.teclas.voltar)) {
            this.voltar();
        } else if (Phaser.Input.Keyboard.JustDown(this.teclas.avancar)
            || Phaser.Input.Keyboard.JustDown(this.teclas.acao)
            || Phaser.Input.Keyboard.JustDown(this.teclas.espaco)) {
            this.avancar();
        }
    }

    avancar() {
        if (this.pagina === GUIA.length - 1) {
            this.fechar();
            return;
        }

        this.pagina += 1;
        this.mostrarPagina();
    }

    voltar() {
        if (this.pagina === 0) {
            return;
        }

        this.pagina -= 1;
        this.mostrarPagina();
    }

    fechar() {
        marcarGuiaVisto(this.registry);
        fecharPorCima(this);
    }
}
