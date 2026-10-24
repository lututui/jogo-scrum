// Cena do escritório

import {
    DECORACOES,
    ELENCO,
    ESCALA_DO_ESCRITORIO,
    FIM_DA_PAREDE,
    MESAS,
    OBJETOS
} from "../dados/elenco.js";
import {DEPURACAO, marcarDepuracao} from "../dados/depuracao.js";
import {SPRINT_REVIEW} from "../dados/eventos.js";
import {PAPEIS_DOS_EVENTOS} from "../dados/eventosPorPapel.js";
import {entregaDaSprint, lerItensDoQuadro, proximoPassoDoJogador} from "../dados/estadoDoQuadro.js";
import {falasDoEscritorio} from "../dados/falasDoEscritorio.js";
import {acaoPendente} from "../dados/acoesDoEscritorio.js";
import {COLUNAS} from "../dados/quadro.js";
import {BOAS_VINDAS} from "../dados/boasVindas.js";
import {CADEIRAS} from "../dados/cadeiras.js";
import {
    DIAS_DA_SPRINT,
    compromissoDaVez,
    conheceOTime,
    contextuaisResolvidos,
    foiRecebido,
    registrarBoasVindas,
    entregaRegistrada,
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
import {tocarEfeito} from "../ui/som.js";
import {abrirDicaUmaVez} from "./CenaDica.js";

// passo do mentor quando vai receber o jogador, em pixels por segundo
const VELOCIDADE_DO_MENTOR = 130;

export class CenaEscritorio extends Phaser.Scene {

    constructor() {
        super({key: "CenaEscritorio"});
        this.alcanceInteracao = 72;
        this.velocidade = 200;
    }

    create() {
        this.cadeiraAtual = this.registry.get("cadeira") || "po";
        this.emDialogo = false;
        this.emChegada = false;
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
        this.receberSePreciso();
    }

    // ---------------------------------------------------------
    // boas-vindas do mentor

    // no dia 1, antes do Planning, uma vez por sprint
    receberSePreciso() {
        const cadeira = this.cadeiraAtual;
        const mentor = this.interativos.find(function (item) {
            return item.dados.chave === CADEIRAS[cadeira].titular;
        });

        if (this.emChegada || !mentor || !mentor.dados.chegada || this.sprintComecou()
            || foiRecebido(this.registry, cadeira)) {
            return;
        }

        const roteiro = BOAS_VINDAS[cadeira][conheceOTime(this.registry, cadeira) ? "seguinte" : "primeira"];
        registrarBoasVindas(this.registry, cadeira);
        this.emChegada = true;
        this.rotulo.setVisible(false);

        const ida = mentor.dados.chegada;
        const volta = ida.slice(0, -1).reverse().concat([[mentor.x, mentor.y]]);
        const cena = this;

        this.andar(mentor, ida, function () {
            cena.emDialogo = true;
            // embaixo: a conversa aponta para a agenda e o quadro, na parede
            cena.caixa.abrir(Object.assign({}, mentor.dados, roteiro), function () {
                cena.emDialogo = false;
                cena.emChegada = false;
                cena.bloqueioAcaoAte = cena.time.now + 250;
                cena.andar(mentor, volta, null);
            }, true);
        });
    }

    // o mentor anda de ponto em ponto, com o nome e o "!" junto; enquanto
    // anda, não conversa
    andar(item, pontos, aoChegar) {
        const cena = this;
        const sprite = item.sprite;
        item.andando = true;
        sprite.anims.play(item.dados.chave + "_andando", true);

        const acompanhar = function () {
            sprite.setDepth(sprite.y);
            item.nome.setPosition(sprite.x, sprite.y + 2);
            item.aviso.setPosition(sprite.x, sprite.y - sprite.displayHeight + 4);
        };
        const proximo = function (indice) {
            if (indice >= pontos.length) {
                item.andando = false;
                sprite.anims.play(item.dados.chave + "_parado", true);
                sprite.setFlipX(false);
                if (aoChegar) {
                    aoChegar();
                }
                return;
            }
            const destino = pontos[indice];
            const distancia = Phaser.Math.Distance.Between(sprite.x, sprite.y, destino[0], destino[1]);
            sprite.setFlipX(destino[0] < sprite.x);
            cena.tweens.add({
                targets: sprite,
                x: destino[0],
                y: destino[1],
                duration: distancia / VELOCIDADE_DO_MENTOR * 1000,
                onUpdate: acompanhar,
                onComplete: function () {
                    proximo(indice + 1);
                }
            });
        };
        proximo(0);
    }

    // Piso, parede e limites do mundo
    criarAmbiente() {
        this.add.tileSprite(0, 0, 960, FIM_DA_PAREDE, "parede").setOrigin(0, 0).setDepth(0);
        this.add.tileSprite(0, FIM_DA_PAREDE, 960, 540 - FIM_DA_PAREDE, "chao")
            .setOrigin(0, 0).setTileScale(ESCALA_DO_ESCRITORIO).setDepth(0);

        const rodape = this.add.rectangle(480, FIM_DA_PAREDE, 960, 4, COR_HEX.rodape);
        rodape.setDepth(1);

        this.physics.world.setBounds(0, FIM_DA_PAREDE, 960, 510 - FIM_DA_PAREDE);
        this.obstaculos = this.physics.add.staticGroup();
    }

    // Imagem pela base, na escala do escritório; a profundidade é a base
    imagemPelaBase(x, y, chave, quadro) {
        return this.add.image(x, y, chave, quadro).setOrigin(0.5, 1)
            .setScale(ESCALA_DO_ESCRITORIO).setDepth(y);
    }

    // Retângulo invisível que o jogador não atravessa
    bloquear(x, y, largura, altura) {
        const bloco = this.add.rectangle(x, y, largura, altura).setVisible(false);
        this.physics.add.existing(bloco, true);
        this.obstaculos.add(bloco);
        return bloco;
    }

    // Mesas com os objetos de cada pessoa, e a decoração
    criarMobiliario() {
        MESAS.forEach(function (mesa) {
            this.imagemPelaBase(mesa.x, mesa.y, mesa.imagem || "mesa");
            mesa.objetos.forEach(function (objeto) {
                this.imagemPelaBase(mesa.x + objeto.dx, mesa.y - 44, objeto.imagem).setDepth(mesa.y + 1);
            }, this);
            this.bloquear(mesa.x, mesa.y - 20, mesa.largura || 136, 32);
        }, this);

        DECORACOES.forEach(function (deco) {
            const imagem = this.imagemPelaBase(deco.x, deco.y, deco.imagem);
            if (deco.naParede) {
                imagem.setDepth(2);
            } else if (deco.solido) {
                this.bloquear(deco.x, deco.y - 8, imagem.displayWidth - 4, 16);
            }
        }, this);
    }

    // Objetos da parede: o jogador interage do piso logo abaixo
    // Objetos da parede, com o nome escrito em cima; a agenda ganha um "!"
    // no primeiro dia, até o Planning
    criarObjetos() {
        OBJETOS.forEach(function (objeto) {
            const sprite = this.imagemPelaBase(objeto.x, objeto.y, objeto.imagem).setDepth(2);
            const topo = objeto.y - sprite.displayHeight;
            const rotulo = this.add.text(objeto.x, topo - 2, objeto.rotulo || "", {
                fontFamily: FONTE,
                fontSize: "11px",
                color: COR.texto
            }).setOrigin(0.5, 1).setDepth(3);
            const aviso = objeto.avisoAntesDoPlanning
                ? this.add.text(rotulo.x + rotulo.width / 2 + 6, topo - 1, "!", {
                    fontFamily: FONTE,
                    fontSize: "16px",
                    fontStyle: "bold",
                    color: COR.alerta
                }).setOrigin(0, 1).setDepth(3).setVisible(false)
                : null;

            this.interativos.push({
                dados: objeto,
                sprite: sprite,
                x: objeto.x,
                y: FIM_DA_PAREDE + 22,
                topo: topo,
                avisoDaParede: aviso
            });
        }, this);
    }

    // Pessoas com o nome embaixo e o "!" em cima, quando há ação pendente
    criarNpcs() {
        ELENCO.forEach(function (npc) {
            // sprite, e não imagem: o mentor anda quando vem receber o jogador
            const sprite = this.add.sprite(npc.x, npc.y, "corpo_" + npc.chave, 0).setOrigin(0.5, 1)
                .setScale(ESCALA_DO_ESCRITORIO).setDepth(npc.y);
            const topo = npc.y - sprite.displayHeight;
            const nome = this.add.text(npc.x, npc.y + 2, npc.nome, {
                fontFamily: FONTE,
                fontSize: "11px",
                color: COR.texto
            }).setOrigin(0.5, 0).setDepth(7000);
            const aviso = this.add.text(npc.x, topo + 4, "!", {
                fontFamily: FONTE,
                fontSize: "20px",
                fontStyle: "bold",
                color: COR.alerta
            }).setOrigin(0.5, 1).setDepth(7001).setVisible(false);
            const bloqueio = this.bloquear(npc.x, npc.y - 8, 28, 16);

            this.interativos.push({
                dados: npc,
                sprite: sprite,
                x: npc.x,
                y: npc.y,
                topo: topo,
                nome: nome,
                aviso: aviso,
                bloqueio: bloqueio
            });
        }, this);
    }

    // Visitantes só aparecem quando têm algo a tratar com o jogador (ou na
    // depuração); quem tem uma ação pendente ganha um "!"
    atualizarPresencas() {
        this.interativos.forEach(function (item) {
            if (item.avisoDaParede) {
                item.avisoDaParede.setVisible(!this.sprintComecou());
            }
            if (!item.aviso) {
                return;
            }
            const acao = acaoPendente(this.registry, this.cadeiraAtual, item.dados.chave);
            const presente = !item.dados.teste || DEPURACAO.npcsDeTeste || Boolean(acao);

            item.ausente = !presente;
            item.sprite.setVisible(presente);
            item.nome.setVisible(presente);
            item.bloqueio.body.enable = presente;
            if (acao && !item.aviso.visible && this.presencasMontadas) {
                tocarEfeito(this, "aviso", 1200);
            }
            item.aviso.setVisible(Boolean(acao));
        }, this);
        this.presencasMontadas = true;
    }

    criarJogador() {
        this.jogador = this.physics.add.sprite(560, 220, "corpo_jogador_po", 0);
        this.jogador.setScale(ESCALA_DO_ESCRITORIO);
        this.jogador.body.setSize(16, 10);
        this.jogador.body.setOffset(8, 21);
        this.jogador.setCollideWorldBounds(true);
        this.jogador.setDepth(this.pesDoJogador());

        this.physics.add.collider(this.jogador, this.obstaculos);
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
        this.receberSePreciso();
        this.explicarMedidoresSePreciso();
    }

    // na primeira volta depois de uma decisão, os medidores já mexeram
    explicarMedidoresSePreciso() {
        if (!this.sprintComecou() || this.sprintTerminou() || this.emChegada) {
            return;
        }
        this.time.delayedCall(300, function () {
            if (this.scene.isActive()) {
                abrirDicaUmaVez(this, "medidores");
            }
        }, [], this);
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

    // O jogador segue a sprint pela agenda, reunião ou imprevisto; sem
    // compromisso, a sprint daquela cadeira fecha
    seguirASprint() {
        this.atualizarPainelDaSprint();

        if (this.sprintTerminou()) {
            this.abrirSintese();
        }
    }

    sprintTerminou() {
        return !compromissoDaVez(this.registry, this.cadeiraAtual);
    }

    abrirSintese() {
        this.scene.stop();
        this.scene.start("CenaSintese");
    }

    atualizarPainelDaSprint() {
        const dia = diaDaSprint(this.registry, this.cadeiraAtual);

        // o sino só toca na volta de um compromisso que fez o dia andar
        if (this.diaMostrado && dia > this.diaMostrado) {
            tocarEfeito(this, "dia", 300);
        }
        this.diaMostrado = dia;

        this.textoSprint.setText("SPRINT " + (sprintsConcluidas(this.registry, this.cadeiraAtual) + 1));
        this.textoDia.setText("DIA " + dia + " DE " + DIAS_DA_SPRINT);
        this.medidores.atualizar(medidoresDaCadeira(this.registry, this.cadeiraAtual));
        this.textoProximoPasso.setText(this.proximoPasso());
        this.textoDicaDoQuadro.setText(this.dicaDoQuadro());
        this.textoAjuda.setText(this.linhaDeAjuda());
        this.atualizarPresencas();
    }

    // Na cadeira de Dev, avisa quando o cartão do jogador pode andar; nas
    // outras, lembra o PO de olhar o quadro antes da Review
    dicaDoQuadro() {
        if (proximoPassoDoJogador(this.registry, this.cadeiraAtual)) {
            return "dica: o seu cartão no quadro da parede pode andar hoje";
        }

        const vez = compromissoDaVez(this.registry, this.cadeiraAtual);
        const conduzReview = Boolean(
            (PAPEIS_DOS_EVENTOS[SPRINT_REVIEW.chave][this.cadeiraAtual] || {}).conduz
        );

        if (!conduzReview || !vez || vez.chave !== SPRINT_REVIEW.chave
            || viuOQuadroHoje(this.registry, this.cadeiraAtual)) {
            return "";
        }

        return "dica: antes da Review, veja no quadro da parede o que o time concluiu";
    }

    proximoPasso() {
        const vez = compromissoDaVez(this.registry, this.cadeiraAtual);

        if (!vez) {
            return "sprint encerrada";
        }

        return "próximo: " + (vez.reuniao ? vez.evento.nome : "um imprevisto") + ", na agenda";
    }

    linhaDeAjuda() {
        const base = "setas andam, ENTER interage, G glossário, O configurações, ESC menu";

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

        // o mentor está vindo: o jogador espera parado
        if (this.emChegada && !this.emDialogo) {
            this.jogador.setVelocity(0, 0);
            this.jogador.anims.play("jogador_" + this.cadeiraAtual + "_parado", true);
            return;
        }

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
        this.jogador.setDepth(this.pesDoJogador());
    }

    // Altura dos pés do jogador na tela: o sprite tem a origem no meio
    pesDoJogador() {
        return this.jogador.y + this.jogador.displayHeight / 2 - 2;
    }

    // Interativo mais próximo dentro do alcance, medido pelos pés
    alvoMaisProximo() {
        let escolhido = null;
        let menorDistancia = this.alcanceInteracao;

        this.interativos.forEach(function (item) {
            if (item.ausente || item.andando) {
                return;
            }
            const distancia = Phaser.Math.Distance.Between(
                this.jogador.x, this.pesDoJogador(), item.x, item.y
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
        this.rotulo.setPosition(alvo.x, alvo.topo - 2);
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
        const acao = acaoPendente(this.registry, this.cadeiraAtual, alvo.dados.chave);
        if (acao) {
            this.abrirAcao(acao);
            return;
        }

        this.emDialogo = true;
        this.rotulo.setVisible(false);
        this.jogador.setVelocity(0, 0);

        const cena = this;
        const daSprint = falasDoEscritorio(alvo.dados.chave, this.contextoDasFalas());
        this.caixa.abrir(daSprint ? Object.assign({}, alvo.dados, daSprint) : alvo.dados, function () {
            cena.emDialogo = false;
        });
    }

    // A ação abre como evento contextual, no dia de hoje
    abrirAcao(acao) {
        this.rotulo.setVisible(false);
        this.jogador.setVelocity(0, 0);
        this.jogador.anims.play("jogador_" + this.cadeiraAtual + "_parado", true);

        this.scene.pause();
        this.scene.launch("CenaEventoContextual", {
            evento: Object.assign({}, acao, {dia: diaDaSprint(this.registry, this.cadeiraAtual), doEscritorio: true})
        });
        this.scene.bringToTop("CenaEventoContextual");
    }

    // O que as falas do escritório precisam saber da sprint
    contextoDasFalas() {
        const cadeira = this.cadeiraAtual;
        const itens = lerItensDoQuadro(this.registry, cadeira);
        const entrega = entregaDaSprint(this.registry, cadeira);
        const doJogador = itens.find(function (item) {
            return item.doJogador;
        });
        const coluna = doJogador && COLUNAS.find(function (outra) {
            return outra.id === doJogador.coluna;
        });

        return {
            dia: diaDaSprint(this.registry, cadeira),
            cadeira: cadeira,
            mentor: CADEIRAS[cadeira].titular,
            conhece: conheceOTime(this.registry, cadeira),
            itens: itens,
            entrega: entregaRegistrada(this.registry, cadeira),
            prontos: entrega.prontos,
            total: entrega.total,
            colunaDoJogador: coluna ? coluna.titulo : null
        };
    }
}