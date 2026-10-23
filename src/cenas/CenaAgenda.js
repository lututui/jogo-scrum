// Agenda da sprint
//
// Aberta pelo calendário da parede do escritório.
//
// A agenda é o calendário da sprint: as reuniões e os imprevistos, dia a
// dia. Ela abre o compromisso da vez, e é assim que o dia avança; os outros
// aparecem como já vividos ou ainda não chegados. O imprevisto só mostra o
// dia: o que é, o jogador descobre quando chega.
//
// Abrir qualquer uma, fora de ordem, é ferramenta de desenvolvimento e
// depende da depuração ligada no servidor.

import {CADEIRAS} from "../dados/cadeiras.js";
import {DEPURACAO, marcarDepuracao} from "../dados/depuracao.js";
import {agendaDaCadeira} from "../dados/calendario.js";
import {compromissoDaVez, contextuaisResolvidos, eventosConcluidos} from "../dados/progresso.js";
import {PAPEIS_DOS_EVENTOS} from "../dados/eventosPorPapel.js";
import {COR, COR_HEX, FONTE} from "../dados/tema.js";
import {nomeDaCadeira} from "../dados/texto.js";
import {ListaDeOpcoes} from "../ui/ListaDeOpcoes.js";
import {TECLA_DO_GLOSSARIO, abrirGlossario} from "./CenaGlossario.js";

const MARGEM = 24;
const TOPO_DA_LISTA = 116;

export class CenaAgenda extends Phaser.Scene {

    constructor() {
        super({key: "CenaAgenda"});
    }

    create() {
        this.criarMoldura();
        this.criarLista();
        this.criarControles();
    }

    criarMoldura() {
        this.add.rectangle(0, 0, 960, 540, COR_HEX.fundo).setOrigin(0, 0);

        const barra = this.add.graphics();
        barra.fillStyle(COR_HEX.painel, 1);
        barra.fillRect(0, 0, 960, 40);
        barra.lineStyle(2, COR_HEX.contorno, 1);
        barra.lineBetween(0, 40, 960, 40);

        const estilo = {fontFamily: FONTE, fontSize: "14px", color: COR.texto};
        this.add.text(MARGEM, 13, "AGENDA DA SPRINT", estilo);
        this.add.text(480, 13, "COMO " + nomeDaCadeira(this.registry, this.cadeira()).toUpperCase(), {
            fontFamily: FONTE,
            fontSize: "14px",
            color: CADEIRAS[this.cadeira()].cor
        }).setOrigin(0.5, 0);
        this.add.text(940, 13, "ESC PARA VOLTAR", estilo).setOrigin(1, 0);

        this.add.text(MARGEM, 72, "Os quatro eventos do Scrum e os imprevistos da sprint, dia a dia.", {
            fontFamily: FONTE,
            fontSize: "13px",
            color: COR.texto
        });

        marcarDepuracao(this, 936, 46);

        this.add.text(MARGEM, 516, "setas escolhem, ENTER abre o compromisso da vez, G abre o glossário", {
            fontFamily: FONTE,
            fontSize: "12px",
            color: COR.textoSecundario
        });
    }

    situacao(compromisso) {
        const vividos = compromisso.reuniao
            ? eventosConcluidos(this.registry, this.cadeira())
            : contextuaisResolvidos(this.registry, this.cadeira());
        if (vividos.indexOf(compromisso.chave) >= 0) {
            return "concluida";
        }

        const vez = compromissoDaVez(this.registry, this.cadeira());
        return vez && vez.chave === compromisso.chave ? "agora" : "depois";
    }

    rotuloDaSituacao(situacao, compromisso) {
        if (situacao === "concluida") {
            return "\u2713 " + (compromisso.reuniao ? "concluída" : "resolvido");
        }

        if (situacao === "depois") {
            return "ainda não é a hora";
        }

        return compromisso.reuniao ? this.rotuloDoPapel(compromisso.chave) : "acontece agora";
    }

    criarLista() {
        const cena = this;
        this.lista = new ListaDeOpcoes(this, {
            x: MARGEM,
            y: TOPO_DA_LISTA,
            largura: 960 - MARGEM * 2,
            visiveis: 7,
            opcoes: agendaDaCadeira(this.cadeira()).map(function (compromisso) {
                const situacao = cena.situacao(compromisso);

                return {
                    id: compromisso.chave,
                    titulo: compromisso.reuniao ? compromisso.evento.nome : "IMPREVISTO",
                    detalhe: "dia " + compromisso.dia + " · "
                        + (compromisso.reuniao ? compromisso.evento.resumo : "algo vai acontecer no escritório"),
                    sufixo: cena.rotuloDaSituacao(situacao, compromisso),
                    chave: compromisso.chave,
                    compromisso: compromisso,
                    situacao: situacao
                };
            }),
            aoConfirmar: function (opcao) {
                cena.escolher(opcao);
            }
        });

        this.lista.selecionar(this.indiceDaVez());
    }

    // O cursor abre na reunião da vez; com a sprint encerrada, na primeira
    indiceDaVez() {
        const indice = this.lista.opcoes.findIndex(function (opcao) {
            return opcao.situacao === "agora";
        });

        return indice < 0 ? 0 : indice;
    }

    escolher(opcao) {
        if (opcao.situacao === "agora" || DEPURACAO.eventosLivres && opcao.compromisso.reuniao) {
            this.abrirEvento(opcao.compromisso);
            return;
        }

        this.avisar(opcao.situacao === "concluida"
            ? "isto já aconteceu nesta sprint"
            : "isto vem depois; a sprint segue a ordem do calendário");
    }

    avisar(texto) {
        if (this.aviso) {
            this.aviso.destroy();
        }

        this.aviso = this.add.text(MARGEM, 492, texto, {
            fontFamily: FONTE,
            fontSize: "12px",
            color: COR.alerta
        }).setDepth(900);

        this.time.delayedCall(2600, function () {
            if (this.aviso) {
                this.aviso.destroy();
                this.aviso = null;
            }
        }, [], this);
    }

    cadeira() {
        return this.registry.get("cadeira") || "po";
    }

    // Marca na lista os eventos em que a cadeira atual tem a mecânica própria.
    rotuloDoPapel(chaveDoEvento) {
        const porPapel = PAPEIS_DOS_EVENTOS[chaveDoEvento] || {};
        const papel = porPapel[this.cadeira()] || {};

        if (!papel.conduz) {
            return "você participa";
        }

        return papel.rotulo || "você conduz";
    }

    criarControles() {
        this.teclas = this.input.keyboard.addKeys({
            cima: Phaser.Input.Keyboard.KeyCodes.UP,
            baixo: Phaser.Input.Keyboard.KeyCodes.DOWN,
            acao: Phaser.Input.Keyboard.KeyCodes.ENTER,
            espaco: Phaser.Input.Keyboard.KeyCodes.SPACE,
            sair: Phaser.Input.Keyboard.KeyCodes.ESC,
            glossario: TECLA_DO_GLOSSARIO
        });
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.teclas.sair)) {
            this.voltarAoEscritorio();
        } else if (Phaser.Input.Keyboard.JustDown(this.teclas.glossario)) {
            abrirGlossario(this);
        } else if (Phaser.Input.Keyboard.JustDown(this.teclas.cima)) {
            this.lista.mover(-1);
        } else if (Phaser.Input.Keyboard.JustDown(this.teclas.baixo)) {
            this.lista.mover(1);
        } else if (Phaser.Input.Keyboard.JustDown(this.teclas.acao)
            || Phaser.Input.Keyboard.JustDown(this.teclas.espaco)) {
            this.lista.confirmar();
        }
    }

    // A agenda sai de cena enquanto o evento roda
    // O escritório segue pausado atrás dos dois e é para ele que o evento volta
    abrirEvento(compromisso) {
        const chave = compromisso.reuniao ? compromisso.chave : "CenaEventoContextual";
        this.scene.stop();
        this.scene.launch(chave, compromisso.reuniao ? undefined : {evento: compromisso.evento});
        this.scene.bringToTop(chave);
    }

    voltarAoEscritorio() {
        this.scene.stop();
        this.scene.resume("CenaEscritorio");
    }
}