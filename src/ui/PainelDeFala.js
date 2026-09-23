// Painel de fala da sala de reunião
//
// A faixa do princípio ágil aparece só quando o mentor comenta uma decisão

import {COR, COR_HEX, FONTE} from "../dados/tema.js";

export const PAINEL = {
    x: 24,
    y: 344,
    largura: 912,
    altura: 172
};

const LARGURA_DO_RETRATO = 72;
const ALTURA_DO_RETRATO = 96;
const VELOCIDADE = 34;

export class PainelDeFala {

    constructor(cena) {
        this.cena = cena;
        this.revelando = false;
        this.textoCompleto = "";
        this.textoRevelado = "";
        this.acumulador = 0;
        this.montar();
    }

    montar() {
        const cena = this.cena;

        this.fundo = cena.add.rectangle(
            PAINEL.x, PAINEL.y, PAINEL.largura, PAINEL.altura, COR_HEX.painel
        ).setOrigin(0, 0).setDepth(800);
        this.fundo.setStrokeStyle(2, COR_HEX.contorno);

        this.molduraDoRetrato = cena.add.rectangle(
            PAINEL.x + 16, PAINEL.y + 14, LARGURA_DO_RETRATO, ALTURA_DO_RETRATO, COR_HEX.painelSuave
        ).setOrigin(0, 0).setDepth(801);
        this.molduraDoRetrato.setStrokeStyle(1, COR_HEX.contornoSuave);

        this.retrato = cena.add.image(
            PAINEL.x + 16 + LARGURA_DO_RETRATO / 2,
            PAINEL.y + 14 + ALTURA_DO_RETRATO / 2,
            "retrato_marcia", 0
        ).setDepth(802);

        const esquerda = PAINEL.x + 16 + LARGURA_DO_RETRATO + 18;

        this.nome = cena.add.text(esquerda, PAINEL.y + 14, "", {
            fontFamily: FONTE,
            fontSize: "14px",
            color: COR.texto,
            fontStyle: "bold"
        }).setDepth(802);

        this.texto = cena.add.text(esquerda, PAINEL.y + 40, "", {
            fontFamily: FONTE,
            fontSize: "13px",
            color: COR.texto,
            lineSpacing: 5,
            wordWrap: {width: PAINEL.largura - (esquerda - PAINEL.x) - 24}
        }).setDepth(802);

        this.linhaDoPrincipio = cena.add.rectangle(
            esquerda, PAINEL.y + PAINEL.altura - 44, PAINEL.largura - (esquerda - PAINEL.x) - 24, 1,
            COR_HEX.contornoSuave
        ).setOrigin(0, 0).setDepth(802);

        this.principio = cena.add.text(esquerda, PAINEL.y + PAINEL.altura - 36, "", {
            fontFamily: FONTE,
            fontSize: "11px",
            color: COR.textoSecundario,
            lineSpacing: 3,
            wordWrap: {width: PAINEL.largura - (esquerda - PAINEL.x) - 24}
        }).setDepth(802);

        this.dica = cena.add.text(
            PAINEL.x + PAINEL.largura - 16, PAINEL.y + PAINEL.altura - 20, "ENTER para continuar",
            {fontFamily: FONTE, fontSize: "11px", color: COR.textoSecundario}
        ).setOrigin(1, 0).setDepth(802);

        this.elementos = [
            this.fundo, this.molduraDoRetrato, this.retrato, this.nome,
            this.texto, this.linhaDoPrincipio, this.principio, this.dica
        ];
        this.esconder();
    }

    mostrar(personagem, texto, principio) {
        const chaveDoRetrato = "retrato_" + personagem.chaveDoRetrato;
        if (this.cena.textures.exists(chaveDoRetrato)) {
            this.retrato.setTexture(chaveDoRetrato, 0);
            this.retrato.setVisible(true);
            this.molduraDoRetrato.setVisible(true);
        } else {
            this.retrato.setVisible(false);
            this.molduraDoRetrato.setVisible(false);
        }

        this.nome.setText(personagem.nome + " — " + personagem.papel);
        this.nome.setColor(personagem.cor);

        this.textoCompleto = texto;
        this.textoRevelado = "";
        this.acumulador = 0;
        this.revelando = true;
        this.texto.setText("");

        this.definirPrincipio(principio);
        this.elementos.forEach(function (elemento) {
            elemento.setVisible(true);
        });
        this.retrato.setVisible(this.cena.textures.exists(chaveDoRetrato));
        this.dica.setText("ENTER para continuar");
    }

    definirPrincipio(principio) {
        this.principio.setText(principio ? "Princípio ágil: " + principio : "");
        this.principio.setVisible(Boolean(principio));
        this.linhaDoPrincipio.setVisible(Boolean(principio));
    }

    // Fundo sem fala: usado quando o painel vira lista de respostas
    mostrarApenasFundo() {
        this.elementos.forEach(function (elemento) {
            elemento.setVisible(false);
        });
        this.fundo.setVisible(true);
    }

    esconder() {
        this.elementos.forEach(function (elemento) {
            elemento.setVisible(false);
        });
    }

    get terminouDeRevelar() {
        return this.textoRevelado.length >= this.textoCompleto.length;
    }

    completarRevelacao() {
        this.textoRevelado = this.textoCompleto;
        this.texto.setText(this.textoRevelado);
        this.revelando = false;
    }

    atualizar(delta) {
        if (!this.revelando || this.terminouDeRevelar) {
            return;
        }

        this.acumulador += delta;
        const intervalo = 1000 / VELOCIDADE;
        while (this.acumulador >= intervalo && !this.terminouDeRevelar) {
            this.acumulador -= intervalo;
            this.textoRevelado = this.textoCompleto.slice(0, this.textoRevelado.length + 1);
        }
        this.texto.setText(this.textoRevelado);

        if (this.terminouDeRevelar) {
            this.revelando = false;
        }
    }
}
