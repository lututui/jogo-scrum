// Guia introdutório
//
// Abre de dois jeitos. Como primeiro passo da primeira partida neste
// navegador, ocupa a tela, mostra só as páginas de entrada e, ao fechar,
// segue para a próxima cena (o editor de personagem). Pelo menu ou pela tecla
// H, abre completo, por cima da cena de onde veio, que volta ao fechar.
// Fechar, pelo fim ou por ESC, marca o guia como visto; só o "Limpar tudo"
// das configurações desfaz a marca.

import {GUIA} from "../dados/guia.js";
import {marcarGuiaVisto} from "../dados/configuracoes.js";
import {COR, COR_HEX, FONTE} from "../dados/tema.js";
import {LADO_DA_LOGO, desenharLogo} from "../ui/logo.js";
import {abrirPorCima, fecharPorCima} from "./sobreposicao.js";
import {agora, anotar} from "../dados/diario.js";

const PAINEL = {x: 120, y: 72, largura: 720, altura: 392};
const RECUO = 24;
const RAIO_DO_PONTO = 4;
const ESPACO_ENTRE_PONTOS = 18;
const ESPACO_DA_LOGO = 16;

// título, linha e corpo descem quando a página tem a logo
const SEM_LOGO = {titulo: RECUO + 9, linha: 60, corpo: 80};
const COM_LOGO = {titulo: RECUO + LADO_DA_LOGO / 2, linha: RECUO + LADO_DA_LOGO + 16, corpo: RECUO + LADO_DA_LOGO + 36};

export function abrirGuia(cena) {
    abrirPorCima(cena, "CenaGuia");
}

// o guia como passo de um fluxo: ao fechar, abre a cena depois com os dados
export function comecarPeloGuia(cena, depois, dadosDepois) {
    cena.scene.start("CenaGuia", {depois: depois, dadosDepois: dadosDepois});
}

export class CenaGuia extends Phaser.Scene {

    constructor() {
        super({key: "CenaGuia"});
    }

    init(dados) {
        this.retorno = dados.retorno;
        this.depois = dados.depois;
        this.dadosDepois = dados.dadosDepois;
        this.paginas = this.depois ? GUIA.filter(function (pagina) {
            return pagina.entrada;
        }) : GUIA;
        this.pagina = 0;
    }

    create() {
        this.abertoEm = agora();
        this.paginasVistas = 1;
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

        this.logo = desenharLogo(this, x, PAINEL.y + RECUO);

        this.textoDoTitulo = this.add.text(x, PAINEL.y + SEM_LOGO.titulo, "", {
            fontFamily: FONTE,
            fontSize: "18px",
            color: COR.destaque
        }).setOrigin(0, 0.5);

        this.linha = this.add.rectangle(x, PAINEL.y + SEM_LOGO.linha, largura, 1, COR_HEX.contornoSuave).setOrigin(0, 0);

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
        const inicio = 480 - (this.paginas.length - 1) * ESPACO_ENTRE_PONTOS / 2;

        this.pontos = this.paginas.map(function (pagina, indice) {
            const ponto = this.add.circle(
                inicio + indice * ESPACO_ENTRE_PONTOS, y, RAIO_DO_PONTO, COR_HEX.painel
            );
            ponto.setStrokeStyle(1, COR_HEX.destaque);

            return ponto;
        }, this);
    }

    mostrarPagina() {
        const pagina = this.paginas[this.pagina];
        const ultima = this.pagina === this.paginas.length - 1;

        this.textoDaPagina.setText((this.pagina + 1) + " DE " + this.paginas.length);
        this.textoDoTitulo.setText(pagina.titulo);
        this.textoDoCorpo.setText(pagina.texto);
        this.posicionarPelaLogo(Boolean(pagina.logo));

        this.pontos.forEach(function (ponto, indice) {
            ponto.setFillStyle(indice === this.pagina ? COR_HEX.destaque : COR_HEX.painel);
        }, this);

        this.textoDeAjuda.setText(ultima
            ? "ENTER começa, ← volta" + (this.depois ? "; o guia completo fica no menu" : "")
            : "ENTER ou → avança, ← volta, clique para avançar");
    }

    posicionarPelaLogo(comLogo) {
        const posicoes = comLogo ? COM_LOGO : SEM_LOGO;
        const x = PAINEL.x + RECUO;

        this.logo.setVisible(comLogo);
        this.textoDoTitulo.setPosition(comLogo ? x + LADO_DA_LOGO + ESPACO_DA_LOGO : x, PAINEL.y + posicoes.titulo);
        this.linha.setY(PAINEL.y + posicoes.linha);
        this.textoDoCorpo.setY(PAINEL.y + posicoes.corpo);
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
        if (this.pagina === this.paginas.length - 1) {
            this.fechar();
            return;
        }

        this.pagina += 1;
        this.paginasVistas = Math.max(this.paginasVistas, this.pagina + 1);
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
        anotar("guia", {
            completo: !this.depois,
            paginas: this.paginasVistas + " de " + this.paginas.length,
            ms: agora() - this.abertoEm
        });
        marcarGuiaVisto();

        if (this.depois) {
            this.scene.start(this.depois, this.dadosDepois);
            return;
        }
        fecharPorCima(this);
    }
}
