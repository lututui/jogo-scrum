// Sala de reunião
//
// Base das cenas de evento do Scrum. Tudo acontece em fala: os personagens
// sentados à mesa redonda falam suas linhas, as escolhas do jogador aparecem
// como respostas que ele diz, e o retorno do mentor vem como fala dele, com o
// princípio ágil registrado embaixo.
//
// Cada evento herda daqui e implementa a própria mecânica.

import {CADEIRAS} from "../dados/cadeiras.js";
import {ELENCO} from "../dados/elenco.js";
import {ASSENTOS, ASSENTO_DO_JOGADOR, ESCALA, MESA} from "../dados/reuniao.js";
import {COR, COR_HEX, FONTE} from "../dados/tema.js";
import {ListaDeOpcoes} from "../ui/ListaDeOpcoes.js";
import {PAINEL, PainelDeFala} from "../ui/PainelDeFala.js";

const ALTURA_DA_BARRA = 40;
const ALTURA_DO_OBJETIVO = 36;
const FIM_DA_PAREDE = 150;
const ALTURA_DA_LINHA_DE_OPCAO = 34;
const OPCOES_VISIVEIS = 4;

export class CenaReuniao extends Phaser.Scene {

    constructor(chave, evento) {
        super({key: chave});
        this.evento = evento;
    }

    // O Phaser reaproveita a instância da cena entre stop e launch,
    // os campos não e precisam ser zerados aqui.
    create() {
        this.lista = null;
        this.aoTerminarFala = null;
        this.esperandoFala = false;
        this.pergunta = null;

        this.montarSala();
        this.montarBarra();
        this.painel = new PainelDeFala(this);
        this.criarControles();
        this.iniciar();
    }

    // ---------------------------------------------------------------
    // sala

    montarSala() {
        this.add.tileSprite(0, ALTURA_DA_BARRA + ALTURA_DO_OBJETIVO, 960,
            FIM_DA_PAREDE - ALTURA_DA_BARRA - ALTURA_DO_OBJETIVO, "parede")
            .setOrigin(0, 0).setDepth(0);
        this.add.tileSprite(0, FIM_DA_PAREDE, 960, 540 - FIM_DA_PAREDE, "chao")
            .setOrigin(0, 0).setDepth(0);
        this.add.rectangle(480, FIM_DA_PAREDE, 960, 3, COR_HEX.contornoSuave).setDepth(1);

        this.add.image(MESA.x, MESA.y, "mesa_redonda").setScale(ESCALA).setDepth(MESA.y);
        this.sentarParticipantes();
    }

    // Os participantes ocupam os assentos na ordem em que o evento os declara
    sentarParticipantes() {
        const participantes = this.evento.participantes || [];

        participantes.forEach(function (chave, indice) {
            const assento = ASSENTOS[indice];
            if (!assento) {
                return;
            }

            const sprite = this.add.image(assento.x, assento.y, "corpo_" + chave, 0);
            sprite.setScale(ESCALA);
            sprite.setDepth(assento.y);
            sprite.setFlipX(Boolean(assento.espelhado));

            this.etiquetarAssento(assento, this.personagem(chave).nome);
        }, this);

        const jogador = this.add.image(
            ASSENTO_DO_JOGADOR.x, ASSENTO_DO_JOGADOR.y,
            "corpo_jogador_" + this.cadeira(), 0
        );
        jogador.setScale(ESCALA);
        jogador.setDepth(ASSENTO_DO_JOGADOR.y);
    }

    etiquetarAssento(assento, nome) {
        const atrasDaMesa = assento.y < MESA.y;
        const deslocamento = 16 * ESCALA;

        this.add.text(
            assento.x,
            atrasDaMesa ? assento.y - deslocamento : assento.y + deslocamento,
            nome,
            {fontFamily: FONTE, fontSize: "10px", color: COR.textoSecundario}
        ).setOrigin(0.5, atrasDaMesa ? 1 : 0).setDepth(690);
    }

    montarBarra() {
        const barra = this.add.graphics().setDepth(700);
        barra.fillStyle(COR_HEX.painel, 1);
        barra.fillRect(0, 0, 960, ALTURA_DA_BARRA);
        barra.lineStyle(2, COR_HEX.contorno, 1);
        barra.lineBetween(0, ALTURA_DA_BARRA, 960, ALTURA_DA_BARRA);

        const estilo = {fontFamily: FONTE, fontSize: "14px", color: COR.texto};
        this.add.text(24, 13, this.evento.nome, estilo).setDepth(701);
        this.textoDaBarra = this.add.text(660, 13, "", estilo).setOrigin(1, 0).setDepth(701);
        this.add.text(936, 13, "ESC PARA SAIR", estilo).setOrigin(1, 0).setDepth(701);

        this.add.rectangle(0, ALTURA_DA_BARRA, 960, ALTURA_DO_OBJETIVO, COR_HEX.painelSuave)
            .setOrigin(0, 0).setDepth(700);
        this.add.text(24, ALTURA_DA_BARRA + 10, "OBJETIVO: " + this.evento.objetivo, {
            fontFamily: FONTE,
            fontSize: "11px",
            color: COR.textoSecundario
        }).setDepth(701);

        this.textoDeAjuda = this.add.text(24, 522, "", {
            fontFamily: FONTE,
            fontSize: "11px",
            color: COR.textoSecundario
        }).setDepth(701);
    }

    definirAviso(texto) {
        this.textoDaBarra.setText(texto);
    }

    definirAjuda(texto) {
        this.textoDeAjuda.setText(texto);
    }

    // ----------------------------------------------------------
    // elenco

    cadeira() {
        return this.registry.get("cadeira") || "po";
    }

    // NPC do elenco ou o jogador
    personagem(chave) {
        if (chave === "jogador") {
            const cadeira = this.cadeira();
            return {
                chaveDoRetrato: "jogador_" + cadeira,
                nome: "Você",
                papel: CADEIRAS[cadeira].nome,
                cor: CADEIRAS[cadeira].cor
            };
        }

        const npc = ELENCO.find(function (pessoa) {
            return pessoa.chave === chave;
        });

        if (!npc) {
            return {chaveDoRetrato: chave, nome: chave, papel: "", cor: COR.texto};
        }
        return {
            chaveDoRetrato: npc.chave,
            nome: npc.nome,
            papel: npc.papel,
            cor: npc.cor
        };
    }

    // -----------------------------------------------------------
    // falas

    falar(chave, texto, aoTerminar) {
        this.fecharLista();
        this.esperandoFala = true;
        this.aoTerminarFala = aoTerminar || null;
        this.definirAjuda("ENTER continua");
        this.painel.mostrar(this.personagem(chave), texto);
    }

    // Retorno do mentor
    // Fala em cena, princípio registrado embaixo (RF10)
    falarComoMentor(texto, principio, aoTerminar) {
        this.fecharLista();
        this.esperandoFala = true;
        this.aoTerminarFala = aoTerminar || null;
        this.definirAjuda("ENTER continua");
        this.painel.mostrar(this.personagem(this.evento.mentor), texto, principio);
    }

    // Encadeia falas de pessoas diferentes
    falarEmSequencia(falas, aoTerminar) {
        const cena = this;
        let indice = 0;

        function proxima() {
            if (indice >= falas.length) {
                if (aoTerminar) {
                    aoTerminar();
                }
                return;
            }
            const fala = falas[indice];
            indice += 1;
            cena.falar(fala.quem, fala.texto, proxima);
        }

        proxima();
    }

    // O jogador diz a resposta escolhida antes de qualquer consequência
    responder(texto, aoTerminar) {
        this.falar("jogador", texto, aoTerminar);
    }

    avancarFala() {
        if (this.painel.revelando && !this.painel.terminouDeRevelar) {
            this.painel.completarRevelacao();
            return;
        }

        const seguinte = this.aoTerminarFala;
        this.aoTerminarFala = null;
        this.esperandoFala = false;
        this.painel.esconder();

        if (seguinte) {
            seguinte();
        }
    }

    // ---------------------------------------------------------
    // perguntas

    // As opções são as falas que o jogador pode dizer
    perguntar(config) {
        this.esperandoFala = false;
        this.painel.mostrarApenasFundo();
        this.definirAjuda(config.ajuda || "setas escolhem, ENTER responde");

        if (this.pergunta) {
            this.pergunta.destroy();
        }
        this.pergunta = this.add.text(PAINEL.x + 16, PAINEL.y + 12, config.pergunta || "", {
            fontFamily: FONTE,
            fontSize: "12px",
            color: COR.textoSecundario,
            wordWrap: {width: PAINEL.largura - 32}
        }).setDepth(806);

        this.fecharLista();
        this.lista = new ListaDeOpcoes(this, {
            x: PAINEL.x + 16,
            y: PAINEL.y + 34,
            largura: PAINEL.largura - 32,
            multipla: Boolean(config.multipla),
            comoFala: config.multipla !== true,
            alturaDaLinha: ALTURA_DA_LINHA_DE_OPCAO,
            espaco: 4,
            visiveis: OPCOES_VISIVEIS,
            opcoes: config.opcoes,
            aoConfirmar: config.aoConfirmar
        });
    }

    atualizarPergunta(texto) {
        if (this.pergunta) {
            this.pergunta.setText(texto);
        }
    }

    fecharLista() {
        if (this.lista) {
            this.lista.destruir();
            this.lista = null;
        }
        if (this.pergunta) {
            this.pergunta.destroy();
            this.pergunta = null;
        }
    }

    // ---------------------------------------------------------
    // controles

    criarControles() {
        this.teclas = this.input.keyboard.addKeys({
            cima: Phaser.Input.Keyboard.KeyCodes.UP,
            baixo: Phaser.Input.Keyboard.KeyCodes.DOWN,
            acao: Phaser.Input.Keyboard.KeyCodes.ENTER,
            espaco: Phaser.Input.Keyboard.KeyCodes.SPACE,
            concluir: Phaser.Input.Keyboard.KeyCodes.C,
            sair: Phaser.Input.Keyboard.KeyCodes.ESC
        });
    }

    update(tempo, delta) {
        this.painel.atualizar(delta);

        if (Phaser.Input.Keyboard.JustDown(this.teclas.sair)) {
            this.sair();
            return;
        }

        if (this.esperandoFala) {
            if (this.confirmou()) {
                this.avancarFala();
            }
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(this.teclas.cima)) {
            this.navegar(-1);
        } else if (Phaser.Input.Keyboard.JustDown(this.teclas.baixo)) {
            this.navegar(1);
        } else if (this.confirmou()) {
            this.confirmarEscolha();
        } else if (Phaser.Input.Keyboard.JustDown(this.teclas.concluir)) {
            this.aoConcluirEtapa();
        }
    }

    confirmou() {
        return Phaser.Input.Keyboard.JustDown(this.teclas.acao)
            || Phaser.Input.Keyboard.JustDown(this.teclas.espaco);
    }

    navegar(passo) {
        if (this.lista) {
            this.lista.mover(passo);
        }
    }

    confirmarEscolha() {
        if (this.lista) {
            this.lista.confirmar();
        }
    }

    sair() {
        this.scene.stop();
        this.scene.resume("CenaEscritorio");
    }

    // Só as etapas de escolha múltipla usam a tecla de concluir
    aoConcluirEtapa() {
    }

    // Implementado por cada evento
    iniciar() {
    }
}
