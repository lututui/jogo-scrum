// Cena do escritório

import {ELENCO, MESAS, OBJETOS} from "../dados/elenco.js";
import {CADEIRAS} from "../dados/cadeiras.js";
import {DEPURACAO, marcarDepuracao} from "../dados/depuracao.js";
import {EVENTOS} from "../dados/eventos.js";
import {proximoContextual} from "../dados/eventosContextuais.js";
import {
    contextuaisResolvidos,
    eventosConcluidos,
    lerProgresso
} from "../dados/progresso.js";
import {MedidoresHUD} from "../ui/MedidoresHUD.js";
import {COR, COR_HEX, FONTE} from "../dados/tema.js";
import {CaixaDialogo} from "../ui/CaixaDialogo.js";

export class CenaEscritorio extends Phaser.Scene {

    constructor() {
        super({key: "CenaEscritorio"});
        this.alcanceInteracao = 64;
        this.velocidade = 160;
    }

    create() {
        this.cadeiraAtual = this.registry.get("cadeira") || "po";
        this.emDialogo = false;
        this.interativos = [];

        this.criarAmbiente();
        this.criarMobiliario();
        this.criarObjetos();
        this.criarNpcs();
        this.criarJogador();
        this.criarInterface();
        this.criarControles();

        this.caixa = new CaixaDialogo(this);

        this.seguirASprint();
    }

    // Piso, parede e limites do mundo
    criarAmbiente() {
        this.add.tileSprite(0, 0, 960, 104, "parede").setOrigin(0, 0).setDepth(0);
        this.add.tileSprite(0, 104, 960, 436, "chao").setOrigin(0, 0).setDepth(0);

        const rodape = this.add.rectangle(480, 104, 960, 4, COR_HEX.rodape);
        rodape.setDepth(1);

        this.physics.world.setBounds(0, 100, 960, 440);
    }

    // Mesas: sprite com corpo estático na base, para o jogador passar por trás
    criarMobiliario() {
        this.mobiliario = this.physics.add.staticGroup();

        MESAS.forEach(function (mesa) {
            const sprite = this.mobiliario.create(mesa.x, mesa.y, "mesa");
            sprite.setDepth(mesa.y);
            sprite.body.setSize(48, 22);
            sprite.body.setOffset(0, 18);
            sprite.refreshBody();
        }, this);
    }

    // Objetos de cenário com fala própria
    criarObjetos() {
        OBJETOS.forEach(function (objeto) {
            const sprite = this.add.image(objeto.x, objeto.y, objeto.chave);
            sprite.setDepth(2);
            this.interativos.push({dados: objeto, sprite: sprite, alturaRotulo: 26});
        }, this);
    }

    criarNpcs() {
        this.npcs = this.physics.add.staticGroup();
        this.marcarAreaDeTeste();

        this.elencoDoEscritorio().forEach(function (npc) {
            const sprite = this.npcs.create(npc.x, npc.y, "corpo_" + npc.chave, 0);
            sprite.setDepth(npc.y);
            sprite.body.setSize(18, 12);
            sprite.body.setOffset(7, 19);
            sprite.refreshBody();
            this.interativos.push({dados: npc, sprite: sprite, alturaRotulo: 24});
        }, this);
    }

    elencoDoEscritorio() {
        return ELENCO.filter(function (npc) {
            return !npc.teste || DEPURACAO.npcsDeTeste;
        });
    }

    marcarAreaDeTeste() {
        if (!DEPURACAO.npcsDeTeste) {
            return;
        }

        const visitantes = ELENCO.filter(function (npc) {
            return npc.teste;
        });

        if (visitantes.length === 0) {
            return;
        }

        const faixa = this.add.rectangle(900, 322, 88, 420, 0xffffff, 0.35);
        faixa.setDepth(1);
        faixa.setStrokeStyle(1, 0x9fb0cf);

        this.add.text(900, 120, "área de teste", {
            fontFamily: "monospace",
            fontSize: "11px",
            color: "#6d7b95"
        }).setOrigin(0.5).setDepth(2);
    }

    criarJogador() {
        this.jogador = this.physics.add.sprite(480, 470, "corpo_jogador_po", 0);
        this.jogador.body.setSize(16, 10);
        this.jogador.body.setOffset(8, 21);
        this.jogador.setCollideWorldBounds(true);
        this.jogador.setDepth(this.jogador.y);

        this.physics.add.collider(this.jogador, this.mobiliario);
        this.physics.add.collider(this.jogador, this.npcs);
    }

    // Barra superior e rótulo de interação
    criarInterface() {
        const barra = this.add.graphics();
        barra.fillStyle(COR_HEX.painel, 1);
        barra.fillRect(0, 0, 960, 40);
        barra.lineStyle(2, COR_HEX.contorno, 1);
        barra.lineBetween(0, 40, 960, 40);
        barra.setScrollFactor(0).setDepth(9000);

        const estilo = {fontFamily: FONTE, fontSize: "14px", color: COR.texto};

        this.textoSprint = this.add.text(20, 13, "SPRINT 1 DE 6", estilo);
        this.textoDia = this.add.text(480, 13, "DIA 1 DE 10", estilo).setOrigin(0.5, 0);
        this.textoCadeira = this.add.text(940, 13, "", estilo).setOrigin(1, 0);
        this.medidores = new MedidoresHUD(this, 560, 6);

        this.textoProximoPasso = this.add.text(940, 516, "", {
            fontFamily: FONTE,
            fontSize: "12px",
            color: COR.destaque
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(9001);

        [this.textoSprint, this.textoDia, this.textoCadeira].forEach(function (texto) {
            texto.setScrollFactor(0).setDepth(9001);
        });

        this.textoAjuda = this.add.text(20, 516, "", {
            fontFamily: FONTE,
            fontSize: "12px",
            color: COR.textoSecundario
        }).setScrollFactor(0).setDepth(9001);

        this.rotulo = this.add.text(0, 0, "ENTER", {
            fontFamily: FONTE,
            fontSize: "12px",
            color: COR.textoInvertido,
            backgroundColor: COR.contorno,
            padding: {x: 6, y: 3}
        }).setOrigin(0.5, 1).setDepth(8000).setVisible(false);

        this.atualizarCadeira(this.cadeiraAtual);
        marcarDepuracao(this, 940, 28);
    }

    criarControles() {
        this.teclas = this.input.keyboard.addKeys({
            cima: Phaser.Input.Keyboard.KeyCodes.UP,
            baixo: Phaser.Input.Keyboard.KeyCodes.DOWN,
            esquerda: Phaser.Input.Keyboard.KeyCodes.LEFT,
            direita: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            w: Phaser.Input.Keyboard.KeyCodes.W,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            s: Phaser.Input.Keyboard.KeyCodes.S,
            d: Phaser.Input.Keyboard.KeyCodes.D
        });

        this.bloqueioAcaoAte = 0;
        this.events.on("resume", function () {
            this.bloqueioAcaoAte = this.time.now + 250;
            this.aoRetomar();
            this.seguirASprint();
        }, this);

        this.teclaAcao = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.teclaEspaco = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.teclaPapel = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.teclaSintese = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    }

    // A troca de cadeira volta para a cena de seleção
    pedirTrocaDeCadeira() {
        if (DEPURACAO.trocaDeCadeiraLivre || !this.sprintComecou()) {
            this.abrirSelecaoDePapel();
            return;
        }

        this.avisar("a sprint já começou nesta cadeira; ela termina na síntese");
    }

    sprintComecou() {
        return eventosConcluidos(this.registry, this.cadeiraAtual).length > 0
            || contextuaisResolvidos(this.registry, this.cadeiraAtual).length > 0;
    }

    // Recado curto no rodapé, que some sozinho
    avisar(texto) {
        if (this.aviso) {
            this.aviso.destroy();
        }

        this.aviso = this.add.text(480, 492, texto, {
            fontFamily: FONTE,
            fontSize: "12px",
            color: COR.alerta
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(9001);

        this.time.delayedCall(2600, function () {
            if (this.aviso) {
                this.aviso.destroy();
                this.aviso = null;
            }
        }, [], this);
    }

    abrirSelecaoDePapel() {
        this.rotulo.setVisible(false);
        this.jogador.setVelocity(0, 0);
        this.jogador.anims.play("jogador_" + this.cadeiraAtual + "_parado", true);

        this.scene.pause();
        this.scene.launch("CenaSelecaoDePapel");
        this.scene.bringToTop("CenaSelecaoDePapel");
    }

    // O escritório volta da seleção com a cadeira escolhida
    aoRetomar() {
        const escolhida = this.registry.get("cadeira") || this.cadeiraAtual;

        if (escolhida !== this.cadeiraAtual) {
            this.atualizarCadeira(escolhida);
        }

        this.atualizarPainelDaSprint();
    }

    // ---------------------------------------------------------
    // andamento da sprint

    // Depois de uma reunião vem o que acontece entre elas; quando não sobra
    // reunião nem evento contextual, a sprint daquela cadeira fecha
    seguirASprint() {
        this.atualizarPainelDaSprint();

        const saiuDeReuniao = this.registry.get("saiuDeReuniao");
        this.registry.set("saiuDeReuniao", false);

        if (this.sprintTerminou()) {
            this.abrirSintese();
            return;
        }

        if (saiuDeReuniao) {
            this.abrirContextualPendente();
        }
    }

    contextualPendente() {
        return proximoContextual(
            this.cadeiraAtual,
            contextuaisResolvidos(this.registry, this.cadeiraAtual)
        );
    }

    sprintTerminou() {
        const reunioes = eventosConcluidos(this.registry, this.cadeiraAtual);

        return reunioes.length >= EVENTOS.length && !this.contextualPendente();
    }

    abrirContextualPendente() {
        const evento = this.contextualPendente();

        if (!evento) {
            return;
        }

        this.rotulo.setVisible(false);
        this.jogador.setVelocity(0, 0);
        this.jogador.anims.play("jogador_" + this.cadeiraAtual + "_parado", true);

        this.scene.pause();
        this.scene.launch("CenaEventoContextual", {evento: evento});
        this.scene.bringToTop("CenaEventoContextual");
    }

    abrirSintese() {
        this.scene.stop();
        this.scene.start("CenaSintese");
    }

    // O dia avança a cada reunião e a cada evento contextual vivido
    atualizarPainelDaSprint() {
        const progresso = lerProgresso(this.registry);
        const vividos = eventosConcluidos(this.registry, this.cadeiraAtual).length
            + contextuaisResolvidos(this.registry, this.cadeiraAtual).length;

        this.textoDia.setText("DIA " + Math.min(1 + vividos, 10) + " DE 10");
        this.medidores.atualizar(progresso.medidores);
        this.textoProximoPasso.setText(this.proximoPasso());
        this.textoAjuda.setText(this.linhaDeAjuda());
    }

    proximoPasso() {
        const pendente = this.reuniaoPendente();

        if (!pendente) {
            return "sprint encerrada";
        }

        return "próximo: " + pendente.nome + " (calendário)";
    }

    reuniaoPendente() {
        const feitos = eventosConcluidos(this.registry, this.cadeiraAtual);

        return EVENTOS.find(function (evento) {
            return feitos.indexOf(evento.chave) < 0;
        }) || null;
    }

    linhaDeAjuda() {
        const base = "setas ou WASD para andar, ENTER para interagir";

        if (DEPURACAO.trocaDeCadeiraLivre || !this.sprintComecou()) {
            return base + ", P para trocar de cadeira";
        }

        return base;
    }

    atualizarCadeira(cadeira) {
        this.cadeiraAtual = cadeira;
        this.registry.set("cadeira", cadeira);
        this.textoCadeira.setText("CADEIRA: " + CADEIRAS[cadeira].nome.toUpperCase());
        if (this.jogador) {
            this.jogador.setTexture("corpo_jogador_" + cadeira, 0);
        }
    }

    update(tempo, delta) {
        this.caixa.atualizar(delta);

        if (!this.emDialogo && Phaser.Input.Keyboard.JustDown(this.teclaPapel)) {
            this.pedirTrocaDeCadeira();
            return;
        }

        if (DEPURACAO.atalhoDeSintese && Phaser.Input.Keyboard.JustDown(this.teclaSintese)) {
            this.abrirSintese();
            return;
        }

        if (this.emDialogo) {
            this.jogador.setVelocity(0, 0);
            this.jogador.anims.play("jogador_" + this.cadeiraAtual + "_parado", true);
            if (this.acaoPressionada()) {
                this.caixa.avancar();
            }
            return;
        }

        this.moverJogador();
        const alvo = this.alvoMaisProximo();
        this.atualizarRotulo(alvo);

        if (alvo && this.acaoPressionada()) {
            this.interagir(alvo);
        }
    }

    acaoPressionada() {
        const pressionou = Phaser.Input.Keyboard.JustDown(this.teclaAcao)
            || Phaser.Input.Keyboard.JustDown(this.teclaEspaco);
        return pressionou && this.time.now >= this.bloqueioAcaoAte;
    }

    moverJogador() {
        const teclas = this.teclas;
        let vx = 0;
        let vy = 0;

        if (teclas.esquerda.isDown || teclas.a.isDown) {
            vx -= 1;
        }
        if (teclas.direita.isDown || teclas.d.isDown) {
            vx += 1;
        }
        if (teclas.cima.isDown || teclas.w.isDown) {
            vy -= 1;
        }
        if (teclas.baixo.isDown || teclas.s.isDown) {
            vy += 1;
        }

        const vetor = new Phaser.Math.Vector2(vx, vy);
        if (vetor.length() > 0) {
            vetor.normalize().scale(this.velocidade);
            this.jogador.anims.play("jogador_" + this.cadeiraAtual + "_andando", true);
            this.jogador.setFlipX(vx < 0);
        } else {
            this.jogador.anims.play("jogador_" + this.cadeiraAtual + "_parado", true);
        }

        this.jogador.setVelocity(vetor.x, vetor.y);
        this.jogador.setDepth(this.jogador.y);
    }

    // Interativo mais próximo dentro do alcance, medido pelos pés
    alvoMaisProximo() {
        let escolhido = null;
        let menorDistancia = this.alcanceInteracao;

        this.interativos.forEach(function (item) {
            const distancia = Phaser.Math.Distance.Between(
                this.jogador.x, this.jogador.y + 8,
                item.sprite.x, item.sprite.y + 8
            );
            if (distancia < menorDistancia) {
                menorDistancia = distancia;
                escolhido = item;
            }
        }, this);

        return escolhido;
    }

    atualizarRotulo(alvo) {
        if (!alvo) {
            this.rotulo.setVisible(false);
            return;
        }
        this.rotulo.setPosition(alvo.sprite.x, alvo.sprite.y - alvo.alturaRotulo);
        this.rotulo.setVisible(true);
    }

    // O alvo abre outra cena ou conversa, conforme o que estiver declarado
    interagir(alvo) {
        if (alvo.dados.cena) {
            this.abrirCena(alvo.dados.cena);
            return;
        }
        this.iniciarDialogo(alvo);
    }

    abrirCena(chaveDaCena) {
        this.rotulo.setVisible(false);
        this.jogador.setVelocity(0, 0);
        this.jogador.anims.play("jogador_" + this.cadeiraAtual + "_parado", true);

        this.scene.pause();
        this.scene.launch(chaveDaCena);

        this.scene.bringToTop(chaveDaCena);
    }

    iniciarDialogo(alvo) {
        this.emDialogo = true;
        this.rotulo.setVisible(false);
        this.jogador.setVelocity(0, 0);

        const cena = this;
        this.caixa.abrir(alvo.dados, function () {
            cena.emDialogo = false;
        });
    }
}