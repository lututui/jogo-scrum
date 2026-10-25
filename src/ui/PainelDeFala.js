// Painel de fala da sala de reunião
//
// A faixa do princípio ágil aparece só quando o mentor comenta uma decisão,
// e o que a decisão valeu fica no alto, à direita do nome.
// Enquanto o texto aparece, a voz de quem fala acompanha as letras.

import {quadroDaExpressao} from "../dados/expressoes.js";
import {MEDIDORES} from "../dados/progresso.js";
import {COR, COR_HEX, FONTE} from "../dados/tema.js";
import {personalizar} from "../dados/texto.js";
import {silabasDoTexto} from "../dados/voz.js";
import {tocarSilaba} from "./som.js";

export const PAINEL = {
    x: 24,
    y: 344,
    largura: 912,
    altura: 172
};

const LARGURA_DO_RETRATO = 72;
const ALTURA_DO_RETRATO = 96;
const VELOCIDADE = 34;

// a sílaba da última letra nova que tiver uma; num quadro lento, várias
// letras aparecem juntas, e tocar todas embolaria o som
export function falarLetras(cena, voz, silabas, de, ate) {
    for (let i = ate - 1; i >= de; i--) {
        if (silabas[i]) {
            tocarSilaba(cena, voz.timbre, silabas[i]);
            return;
        }
    }
}

function textoDosPontos(efeito) {
    if (efeito.pontos === 0) {
        return "0 pontos";
    }
    return "+" + efeito.pontos + " pontos" + (efeito.dobro ? " (o dobro, sem mentor)" : "");
}

export class PainelDeFala {

    constructor(cena) {
        this.cena = cena;
        this.revelando = false;
        this.textoCompleto = "";
        this.textoRevelado = "";
        this.acumulador = 0;
        this.efeito = [];
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

    // Sem expressão declarada, o retrato fica neutro
    mostrar(personagem, texto, principio, expressao) {
        const chaveDoRetrato = "retrato_" + personagem.chaveDoRetrato;
        if (this.cena.textures.exists(chaveDoRetrato)) {
            this.retrato.setTexture(chaveDoRetrato, quadroDaExpressao(expressao));
            this.retrato.setVisible(true);
            this.molduraDoRetrato.setVisible(true);
        } else {
            this.retrato.setVisible(false);
            this.molduraDoRetrato.setVisible(false);
        }

        this.nome.setText(personagem.nome + " — " + personagem.papel);
        this.nome.setColor(personagem.cor);

        this.textoCompleto = personalizar(this.cena.registry, texto);
        this.voz = personagem.voz || null;
        this.silabas = silabasDoTexto(this.textoCompleto, this.voz);
        this.textoRevelado = "";
        this.acumulador = 0;
        this.revelando = true;
        this.texto.setText("");

        this.definirPrincipio(principio);
        this.definirEfeito(null);
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

    // Pontos e o sentido de cada medidor movido, montados da direita para a
    // esquerda; a seta leva a cor de quem sobe ou desce
    definirEfeito(efeito) {
        this.efeito.forEach(function (objeto) {
            objeto.destroy();
        });
        this.efeito = [];

        if (!efeito) {
            return;
        }

        const partes = [[textoDosPontos(efeito), COR.texto]];
        efeito.medidores.forEach(function (medidor) {
            const sobe = medidor.variacao > 0;
            partes.push(["  ·  " + MEDIDORES[medidor.chave].nome.split(" ")[0].toLowerCase(), COR.textoSecundario]);
            partes.push([sobe ? " ▲" : " ▼", sobe ? COR.destaque : COR.alerta]);
        });

        let x = PAINEL.x + PAINEL.largura - 16;
        for (let i = partes.length - 1; i >= 0; i--) {
            const texto = this.cena.add.text(x, PAINEL.y + 16, partes[i][0], {
                fontFamily: FONTE,
                fontSize: "11px",
                color: partes[i][1]
            }).setOrigin(1, 0).setDepth(802);
            x -= texto.width;
            this.efeito.push(texto);
        }
    }

    // Fundo sem fala: usado quando o painel vira lista de respostas
    mostrarApenasFundo() {
        this.definirEfeito(null);
        this.elementos.forEach(function (elemento) {
            elemento.setVisible(false);
        });
        this.fundo.setVisible(true);
    }

    esconder() {
        this.definirEfeito(null);
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
        const antes = this.textoRevelado.length;
        while (this.acumulador >= intervalo && !this.terminouDeRevelar) {
            this.acumulador -= intervalo;
            this.textoRevelado = this.textoCompleto.slice(0, this.textoRevelado.length + 1);
        }
        this.texto.setText(this.textoRevelado);
        falarLetras(this.cena, this.voz, this.silabas, antes, this.textoRevelado.length);

        if (this.terminouDeRevelar) {
            this.revelando = false;
        }
    }
}
