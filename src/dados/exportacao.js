// Exportação dos dados da avaliação
//
// Um arquivo .json, baixado pelo navegador, sem servidor: o nome escolhido
// pelo jogador, o resumo de cada cadeira (o mesmo da tela de fim) e o diário
// completo. Também apaga tudo o que o jogo guarda no navegador, para a mesma
// máquina receber o próximo participante.

import {ORDEM_DAS_CADEIRAS} from "./cadeiras.js";
import {VERSAO_DO_JOGO, apagarDiario, lerDiario} from "./diario.js";
import {conquistasDoJogo, lerProgresso, sprintsConcluidas, ultimaSprint} from "./progresso.js";

// tudo o que o jogo guarda no navegador começa com este prefixo
const PREFIXO_NO_NAVEGADOR = "jogo-scrum:";

// data de hoje, sem hora: AAAA-MM-DD
function hoje() {
    const data = new Date();
    const doisDigitos = function (numero) {
        return String(numero).padStart(2, "0");
    };
    return data.getFullYear() + "-" + doisDigitos(data.getMonth() + 1) + "-" + doisDigitos(data.getDate());
}

export function montarExportacao(registry) {
    const progresso = lerProgresso(registry);
    const resumo = {};

    ORDEM_DAS_CADEIRAS.forEach(function (cadeira) {
        resumo[cadeira] = {
            sprintsConcluidas: sprintsConcluidas(registry, cadeira),
            ultimaSprint: ultimaSprint(registry, cadeira)
        };
    });

    return {
        jogo: "jogo-scrum",
        versao: VERSAO_DO_JOGO,
        exportadoEm: hoje(),
        jogador: progresso.perfil ? progresso.perfil.nome : null,
        cadeiraEmAndamento: progresso.cadeiraEmAndamento || null,
        conquistas: conquistasDoJogo(registry),
        resumo: resumo,
        diario: lerDiario()
    };
}

export function nomeDoArquivo(dados) {
    return "jogo-scrum_" + (dados.jogador || "sem-nome") + "_" + dados.exportadoEm + ".json";
}

// devolve o nome do arquivo baixado
export function baixarExportacao(registry) {
    const dados = montarExportacao(registry);
    const arquivo = new Blob([JSON.stringify(dados, null, 2)], {type: "application/json"});
    const endereco = URL.createObjectURL(arquivo);
    const link = document.createElement("a");

    link.href = endereco;
    link.download = nomeDoArquivo(dados);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () {
        URL.revokeObjectURL(endereco);
    }, 1000);

    return link.download;
}

// progresso, personagem, diário e configurações; a página recarrega do zero
export function limparTudo() {
    apagarDiario();
    try {
        Object.keys(window.localStorage).filter(function (chave) {
            return chave.indexOf(PREFIXO_NO_NAVEGADOR) === 0;
        }).forEach(function (chave) {
            window.localStorage.removeItem(chave);
        });
    } catch (erro) {
        // armazenamento bloqueado: só havia o que está em memória
    }
    window.location.reload();
}
