// Caixa de diálogo do jogo

import {DEPURACAO} from "../dados/depuracao.js";
import {TOTAL_DE_EXPRESSOES, quadroDaExpressao} from "../dados/expressoes.js";
import {COR, COR_HEX, FONTE} from "../dados/tema.js";
import {personalizar} from "../dados/texto.js";
import {silabasDoTexto} from "../dados/voz.js";
import {falarLetras} from "./PainelDeFala.js";


export class CaixaDialogo {

    constructor(cena) {
        this.cena = cena;
        this.aberta = false;
        this.falas = [];
        this.indiceFala = 0;
        this.textoRevelado = "";
        this.acumulador = 0;
        this.velocidade = 22;
        this.aoFechar = null;
        this.montar();
    }

    // Cria os elementos gráficos uma única vez e os deixa ocultos
    montar() {
        const cena = this.cena;

        this.painel = cena.add.graphics();
        this.painel.fillStyle(COR_HEX.painel, 1);
        this.painel.fillRect(24, 56, 912, 116);
        this.painel.lineStyle(2, COR_HEX.contorno, 1);
        this.painel.strokeRect(24, 56, 912, 116);
        this.painel.lineStyle(1, COR_HEX.contornoSuave, 1);
        this.painel.strokeRect(29, 61, 902, 106);

        this.molduraRetrato = cena.add.graphics();
        this.molduraRetrato.fillStyle(COR_HEX.fundo, 1);
        this.molduraRetrato.fillRect(40, 64, 72, 100);
        this.molduraRetrato.lineStyle(1, COR_HEX.contorno, 1);
        this.molduraRetrato.strokeRect(40, 64, 72, 100);

        this.retrato = cena.add.image(76, 114, "retrato_marcia", 0);

        this.textoNome = cena.add.text(132, 74, "", {
            fontFamily: FONTE,
            fontSize: "16px",
            color: COR.texto,
            fontStyle: "bold"
        });

        this.textoCorpo = cena.add.text(132, 100, "", {
            fontFamily: FONTE,
            fontSize: "15px",
            color: COR.texto,
            lineSpacing: 6,
            wordWrap: {width: 780}
        });

        this.textoDica = cena.add.text(916, 150, "ENTER para continuar", {
            fontFamily: FONTE,
            fontSize: "12px",
            color: COR.textoSecundario
        }).setOrigin(1, 0);

        this.elementos = [
            this.painel,
            this.molduraRetrato,
            this.retrato,
            this.textoNome,
            this.textoCorpo,
            this.textoDica
        ];

        this.elementos.forEach(function (elemento) {
            elemento.setScrollFactor(0);
            elemento.setDepth(10000);
            elemento.setVisible(false);
        });
    }

    // Abre a caixa com as falas de um interlocutor
    abrir(interlocutor, aoFechar) {
        this.aberta = true;
        const registry = this.cena.registry;
        this.falas = interlocutor.falas.map(function (fala) {
            return personalizar(registry, fala);
        });
        this.expressoes = interlocutor.expressoes || [];
        this.voz = interlocutor.voz || null;
        this.indiceFala = 0;
        this.aoFechar = aoFechar || null;

        this.textoNome.setText(interlocutor.nome + " — " + interlocutor.papel);
        this.textoNome.setColor(interlocutor.cor);
        this.elementos.forEach(function (elemento) {
            elemento.setVisible(true);
        });
        this.definirRetrato(interlocutor);
        this.iniciarFala();
    }

    // Objetos de cenário não têm retrato próprio.
    // Quem está olhando para eles é o jogador, então o retrato usado é o do avatar.
    // Sem nenhum dos dois, o espaço fica vazio.
    definirRetrato(interlocutor) {
        const cadeira = this.cena.cadeiraAtual || "po";
        const candidatos = [
            "retrato_" + interlocutor.chave,
            "retrato_jogador_" + cadeira
        ];

        const disponivel = candidatos.find(function (chave) {
            return this.cena.textures.exists(chave);
        }, this);

        if (disponivel) {
            this.retrato.setTexture(disponivel, 0);
        }
        this.retrato.setVisible(Boolean(disponivel));
    }

    // Prepara a revelação gradual da fala atual
    iniciarFala() {
        if (this.retrato.visible) {
            this.retrato.setFrame(
                DEPURACAO.expressoesEmCiclo
                    ? this.indiceFala % TOTAL_DE_EXPRESSOES
                    : quadroDaExpressao(this.expressoes[this.indiceFala])
            );
        }
        this.textoRevelado = "";
        this.acumulador = 0;
        this.silabas = silabasDoTexto(this.falaCompleta, this.voz);
        this.textoCorpo.setText("");
        this.textoDica.setText("ENTER para continuar");
    }

    get falaCompleta() {
        return this.falas[this.indiceFala] || "";
    }

    get revelacaoTerminou() {
        return this.textoRevelado.length >= this.falaCompleta.length;
    }

    // ENTER completa a fala em andamento ou avança para a próxima
    avancar() {
        if (!this.revelacaoTerminou) {
            this.textoRevelado = this.falaCompleta;
            this.textoCorpo.setText(this.textoRevelado);
            this.atualizarDica();
            return;
        }
        this.indiceFala += 1;
        if (this.indiceFala >= this.falas.length) {
            this.fechar();
            return;
        }
        this.iniciarFala();
    }

    atualizarDica() {
        const ultima = this.indiceFala >= this.falas.length - 1;
        this.textoDica.setText(ultima ? "ENTER para encerrar" : "ENTER para continuar");
    }

    fechar() {
        this.aberta = false;
        this.elementos.forEach(function (elemento) {
            elemento.setVisible(false);
        });
        if (this.aoFechar) {
            this.aoFechar();
            this.aoFechar = null;
        }
    }

    // Revela o texto ao longo do tempo, conforme a velocidade definida
    atualizar(delta) {
        if (!this.aberta || this.revelacaoTerminou) {
            return;
        }
        this.acumulador += delta;
        const intervalo = 1000 / this.velocidade;
        const antes = this.textoRevelado.length;
        while (this.acumulador >= intervalo && !this.revelacaoTerminou) {
            this.acumulador -= intervalo;
            this.textoRevelado = this.falaCompleta.slice(0, this.textoRevelado.length + 1);
        }
        this.textoCorpo.setText(this.textoRevelado);
        falarLetras(this.cena, this.voz, this.silabas, antes, this.textoRevelado.length);
        if (this.revelacaoTerminou) {
            this.atualizarDica();
        }
    }
}
