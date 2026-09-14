// Caixa de diálogo do jogo

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
        this.painel.fillStyle(0xfbfcfe, 1);
        this.painel.fillRect(24, 56, 912, 116);
        this.painel.lineStyle(2, 0x2b3348, 1);
        this.painel.strokeRect(24, 56, 912, 116);
        this.painel.lineStyle(1, 0x9fb0cf, 1);
        this.painel.strokeRect(29, 61, 902, 106);

        this.molduraRetrato = cena.add.graphics();
        this.molduraRetrato.fillStyle(0xe7ebf4, 1);
        this.molduraRetrato.fillRect(40, 72, 72, 84);
        this.molduraRetrato.lineStyle(1, 0x2b3348, 1);
        this.molduraRetrato.strokeRect(40, 72, 72, 84);

        this.retrato = cena.add.image(76, 114, "retrato_marcia", 0);

        this.textoNome = cena.add.text(132, 74, "", {
            fontFamily: "monospace",
            fontSize: "16px",
            color: "#2b3348",
            fontStyle: "bold"
        });

        this.textoCorpo = cena.add.text(132, 100, "", {
            fontFamily: "monospace",
            fontSize: "15px",
            color: "#1b2430",
            lineSpacing: 6,
            wordWrap: {width: 780}
        });

        this.textoDica = cena.add.text(916, 150, "ENTER para continuar", {
            fontFamily: "monospace",
            fontSize: "12px",
            color: "#6d7b95"
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
        this.falas = interlocutor.falas;
        this.indiceFala = 0;
        this.aoFechar = aoFechar || null;

        const chaveRetrato = "retrato_" + interlocutor.chave;
        if (this.cena.textures.exists(chaveRetrato)) {
            this.retrato.setTexture(chaveRetrato, 0);
            this.retrato.setVisible(true);
        } else {
            this.retrato.setVisible(false);
        }

        this.textoNome.setText(interlocutor.nome + " — " + interlocutor.papel);
        this.textoNome.setColor(interlocutor.cor);
        this.elementos.forEach(function (elemento) {
            elemento.setVisible(true);
        });
        this.iniciarFala();
    }

    // Prepara a revelação gradual da fala atual
    iniciarFala() {
        this.textoRevelado = "";
        this.acumulador = 0;
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
        while (this.acumulador >= intervalo && !this.revelacaoTerminou) {
            this.acumulador -= intervalo;
            this.textoRevelado = this.falaCompleta.slice(0, this.textoRevelado.length + 1);
        }
        this.textoCorpo.setText(this.textoRevelado);
        if (this.revelacaoTerminou) {
            this.atualizarDica();
        }
    }
}
