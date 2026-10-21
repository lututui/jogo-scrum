// Evento contextual
//
// Acontece por cima do escritório, que fica pausado atrás: o telefone toca, um
// colega aparece na mesa, um bug chega de produção.
//
// A decisão é tomada sem mentor por perto, e é isso que a torna diferente das
// reuniões: ela vale o dobro no placar, para bem e para mal.

import {CADEIRAS} from "../dados/cadeiras.js";
import {ELENCO} from "../dados/elenco.js";
import {registrarContextualResolvido, registrarDecisao} from "../dados/progresso.js";
import {COR, COR_HEX, FONTE} from "../dados/tema.js";
import {ListaDeOpcoes, embaralhar} from "../ui/ListaDeOpcoes.js";
import {PAINEL, PainelDeFala} from "../ui/PainelDeFala.js";
import {TECLA_DO_GLOSSARIO, abrirGlossario} from "./CenaGlossario.js";

const TOPO_DAS_OPCOES = 32;
const ALTURA_DA_LINHA = 34;
const ESPACO_ENTRE_OPCOES = 4;
const OPCOES_VISIVEIS = 3;

export class CenaEventoContextual extends Phaser.Scene {

    constructor() {
        super({key: "CenaEventoContextual"});
    }

    // Recebe o evento de quem a abriu; o escritório escolhe qual é a vez
    init(dados) {
        this.evento = dados.evento;
    }

    create() {
        this.lista = null;
        this.pergunta = null;
        this.esperandoFala = false;
        this.aoTerminarFala = null;

        this.escurecerFundo();
        this.montarTarja();
        this.painel = new PainelDeFala(this);
        this.criarControles();

        const cena = this;
        this.falar(this.evento.quem, this.evento.fala, function () {
            cena.perguntar();
        });
    }

    // ---------------------------------------------------------
    // moldura

    escurecerFundo() {
        this.add.rectangle(0, 0, 960, 540, COR_HEX.contorno, 0.35)
            .setOrigin(0, 0)
            .setDepth(700);
    }

    montarTarja() {
        const tarja = this.add.rectangle(0, 0, 960, 28, COR_HEX.painel)
            .setOrigin(0, 0)
            .setDepth(701);
        tarja.setStrokeStyle(1, COR_HEX.contornoSuave);

        this.add.text(24, 8, "NO MEIO DA SPRINT — DIA " + this.evento.dia, {
            fontFamily: FONTE,
            fontSize: "12px",
            color: COR.texto
        }).setDepth(702);

        this.add.text(936, 8, "SEM MENTOR POR PERTO", {
            fontFamily: FONTE,
            fontSize: "11px",
            color: COR.alerta
        }).setOrigin(1, 0).setDepth(702);

        this.ajuda = this.add.text(24, 522, "", {
            fontFamily: FONTE,
            fontSize: "11px",
            color: COR.textoSecundario
        }).setDepth(702);
    }

    // ---------------------------------------------------------
    // elenco

    cadeira() {
        return this.registry.get("cadeira") || "po";
    }

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

    // ---------------------------------------------------------
    // falas e resposta

    falar(chave, texto, aoTerminar, principio) {
        this.fecharLista();
        this.esperandoFala = true;
        this.aoTerminarFala = aoTerminar || null;
        this.ajuda.setText("ENTER continua  ·  G abre o glossário");
        this.painel.mostrar(this.personagem(chave), texto, principio);
    }

    perguntar() {
        const cena = this;
        this.esperandoFala = false;
        this.painel.mostrarApenasFundo();
        this.ajuda.setText("setas escolhem, ENTER responde  ·  G abre o glossário");

        this.pergunta = this.add.text(
            PAINEL.x + 16, PAINEL.y + 10, this.evento.pergunta, {
                fontFamily: FONTE,
                fontSize: "12px",
                color: COR.textoSecundario
            }
        ).setDepth(806);

        this.lista = new ListaDeOpcoes(this, {
            x: PAINEL.x + 16,
            y: PAINEL.y + TOPO_DAS_OPCOES,
            largura: PAINEL.largura - 32,
            comoFala: true,
            alturaDaLinha: ALTURA_DA_LINHA,
            espaco: ESPACO_ENTRE_OPCOES,
            visiveis: OPCOES_VISIVEIS,
            opcoes: embaralhar(this.evento.opcoes),
            aoConfirmar: function (opcao) {
                cena.responder(opcao);
            }
        });
    }

    // A decisão entra no placar antes do retorno, para o mentor comentar o
    // que já aconteceu
    responder(opcao) {
        const cena = this;

        registrarDecisao(this.registry, {
            cadeira: this.cadeira(),
            avaliacao: opcao.avaliacao,
            medidores: opcao.medidores,
            marca: opcao.marca,
            semMentor: Boolean(this.evento.semMentor)
        });

        this.falar("jogador", opcao.titulo, function () {
            cena.falar(cena.mentor(), opcao.feedback, function () {
                cena.encerrar();
            }, opcao.principio);
        });
    }

    mentor() {
        return CADEIRAS[this.cadeira()].titular;
    }

    encerrar() {
        registrarContextualResolvido(this.registry, this.cadeira(), this.evento.id);
        this.scene.stop();
        this.scene.resume("CenaEscritorio");
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
            glossario: TECLA_DO_GLOSSARIO
        });
    }

    update(tempo, delta) {
        this.painel.atualizar(delta);

        if (Phaser.Input.Keyboard.JustDown(this.teclas.glossario)) {
            abrirGlossario(this);
            return;
        }

        if (this.esperandoFala) {
            if (this.confirmou()) {
                this.avancarFala();
            }

            return;
        }

        if (Phaser.Input.Keyboard.JustDown(this.teclas.cima)) {
            this.lista.mover(-1);
        } else if (Phaser.Input.Keyboard.JustDown(this.teclas.baixo)) {
            this.lista.mover(1);
        } else if (this.confirmou()) {
            this.lista.confirmar();
        }
    }

    confirmou() {
        return Phaser.Input.Keyboard.JustDown(this.teclas.acao)
            || Phaser.Input.Keyboard.JustDown(this.teclas.espaco);
    }

    // Sem ESC: a decisão do dia não é adiável
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
}
