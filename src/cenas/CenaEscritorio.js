// Cena do escritório

import {ELENCO, MESAS, OBJETOS} from "../dados/elenco.js";
import {DEPURACAO, marcarDepuracao} from "../dados/depuracao.js";
import {EVENTOS, SPRINT_REVIEW} from "../dados/eventos.js";
import {PAPEIS_DOS_EVENTOS} from "../dados/eventosPorPapel.js";
import {proximoPassoDoJogador} from "../dados/estadoDoQuadro.js";
import {
    DIAS_DA_SPRINT,
    compromissoDaVez,
    contextuaisResolvidos,
    diaDaSprint,
    eventosConcluidos,
    medidoresDaCadeira,
    sprintsConcluidas,
    viuOQuadroHoje
} from "../dados/progresso.js";
import {nomeDaCadeira} from "../dados/texto.js";
import {MedidoresHUD} from "../ui/MedidoresHUD.js";
import {COR, COR_HEX, FONTE} from "../dados/tema.js";
import {CaixaDialogo} from "../ui/CaixaDialogo.js";
import {TECLA_DO_GLOSSARIO, abrirGlossario} from "./CenaGlossario.js";

// Um respiro no escritório antes do evento contextual, para o dia novo
// aparecer no painel
const ESPERA_DO_CONTEXTUAL = 500;

export class CenaEscritorio extends Phaser.Scene {

    constructor() {
        super({key: "CenaEscritorio"});
        this.alcanceInteracao = 64;
        this.velocidade = 160;
    }

    create() {
        this.cadeiraAtual = this.registry.get("cadeira") || "po";
        this.emDialogo = false;
        this.contextualAgendado = false;
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

        const faixa = this.add.rectangle(900, 322, 88, 420, COR_HEX.painel, 0.35);
        faixa.setDepth(1);
        faixa.setStrokeStyle(1, COR_HEX.contornoSuave);

        this.add.text(900, 120, "área de teste", {
            fontFamily: FONTE,
            fontSize: "11px",
            color: COR.textoSecundario
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

        // Da esquerda para a direita: sprint, medidores, dia e cadeira. Os
        // medidores ficam entre a sprint e o dia porque o nome da cadeira, à
        // direita, chega a ocupar um quinto da barra
        this.textoSprint = this.add.text(20, 13, "", estilo);
        this.medidores = new MedidoresHUD(this, 150, 6);
        this.textoDia = this.add.text(480, 13, "DIA 1 DE 10", estilo).setOrigin(0.5, 0);
        this.textoCadeira = this.add.text(940, 13, "", estilo).setOrigin(1, 0);

        this.textoProximoPasso = this.add.text(940, 516, "", {
            fontFamily: FONTE,
            fontSize: "12px",
            color: COR.destaque
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(9001);

        this.textoDicaDoQuadro = this.add.text(940, 46, "", {
            fontFamily: FONTE,
            fontSize: "11px",
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
        this.events.on("resume", this.aoVoltarDaPausa, this);
        this.events.once("shutdown", function () {
            this.events.off("resume", this.aoVoltarDaPausa, this);
        }, this);

        this.teclaAcao = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.teclaEspaco = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.teclaPapel = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.teclaSintese = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        this.teclaGlossario = this.input.keyboard.addKey(TECLA_DO_GLOSSARIO);
        this.teclaMenu = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    }

    // O jogador para antes da pausa
    consultarGlossario() {
        this.rotulo.setVisible(false);
        this.jogador.setVelocity(0, 0);
        this.jogador.anims.play("jogador_" + this.cadeiraAtual + "_parado", true);
        abrirGlossario(this);
    }

    aoVoltarDaPausa() {
        this.bloqueioAcaoAte = this.time.now + 250;
        this.aoRetomar();
        this.seguirASprint();
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

    // O calendário diz o que vem agora: um evento contextual abre sozinho,
    // uma reunião espera o jogador ir ao calendário. Sem compromisso, a
    // sprint daquela cadeira fecha
    seguirASprint() {
        this.atualizarPainelDaSprint();

        if (this.sprintTerminou()) {
            this.abrirSintese();
            return;
        }

        if (this.contextualPendente() && !this.contextualAgendado) {
            this.contextualAgendado = true;
            this.time.delayedCall(ESPERA_DO_CONTEXTUAL, this.abrirContextualPendente, [], this);
        }
    }

    contextualPendente() {
        const vez = compromissoDaVez(this.registry, this.cadeiraAtual);
        return vez && !vez.reuniao ? vez.evento : null;
    }

    sprintTerminou() {
        return !compromissoDaVez(this.registry, this.cadeiraAtual);
    }

    abrirContextualPendente() {
        this.contextualAgendado = false;
        const evento = this.contextualPendente();

        if (!evento || !this.scene.isActive()) {
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

    atualizarPainelDaSprint() {
        const dia = diaDaSprint(this.registry, this.cadeiraAtual);

        this.textoSprint.setText("SPRINT " + (sprintsConcluidas(this.registry, this.cadeiraAtual) + 1));
        this.textoDia.setText("DIA " + dia + " DE " + DIAS_DA_SPRINT);
        this.medidores.atualizar(medidoresDaCadeira(this.registry, this.cadeiraAtual));
        this.textoProximoPasso.setText(this.proximoPasso());
        this.textoDicaDoQuadro.setText(this.dicaDoQuadro());
        this.textoAjuda.setText(this.linhaDeAjuda());
    }

    // Na cadeira de Dev, avisa quando o cartão do jogador pode andar; nas
    // outras, lembra o PO de olhar o quadro antes da Review
    dicaDoQuadro() {
        if (proximoPassoDoJogador(this.registry, this.cadeiraAtual)) {
            return "dica: o seu cartão no quadro da parede pode andar hoje";
        }

        const pendente = this.reuniaoPendente();
        const conduzReview = Boolean(
            (PAPEIS_DOS_EVENTOS[SPRINT_REVIEW.chave][this.cadeiraAtual] || {}).conduz
        );

        if (!conduzReview || pendente !== SPRINT_REVIEW
            || viuOQuadroHoje(this.registry, this.cadeiraAtual)) {
            return "";
        }

        return "dica: antes da Review, veja no quadro da parede o que o time concluiu";
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
        const base = "setas ou WASD andam, ENTER interage, G glossário, ESC menu";

        if (DEPURACAO.trocaDeCadeiraLivre || !this.sprintComecou()) {
            return base + ", P troca de cadeira";
        }

        return base;
    }

    atualizarCadeira(cadeira) {
        this.cadeiraAtual = cadeira;
        this.registry.set("cadeira", cadeira);
        this.textoCadeira.setText("CADEIRA: " + nomeDaCadeira(this.registry, cadeira).toUpperCase());
        if (this.jogador) {
            this.jogador.setTexture("corpo_jogador_" + cadeira, 0);
        }
    }

    update(tempo, delta) {
        this.caixa.atualizar(delta);

        if (Phaser.Input.Keyboard.JustDown(this.teclaGlossario)) {
            this.consultarGlossario();
            return;
        }

        // O progresso já está salvo; a sprint continua de onde parou
        if (!this.emDialogo && Phaser.Input.Keyboard.JustDown(this.teclaMenu)) {
            this.scene.start("CenaMenu");
            return;
        }

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