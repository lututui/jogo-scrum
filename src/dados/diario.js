// Diário da avaliação
//
// O que o jogador faz, em ordem, para a análise da avaliação: decisões (com a
// opção, a avaliação e o tempo para decidir), cadeiras, sínteses, consultas
// ao glossário e ao guia, aberturas do quadro, dicas e o FPS de cada sessão.
// Cada linha leva a sessão (uma por carregamento da página) e o tempo desde
// o começo dela, em milissegundos; não leva data nem hora.
//
// Fica guardado à parte do progresso: "Nova partida" não apaga o diário, só
// o "Limpar tudo" das configurações. Se o navegador bloquear o armazenamento,
// o diário vale até a página ser recarregada.

export const VERSAO_DO_JOGO = "0.1.0";

const CHAVE_NO_NAVEGADOR = "jogo-scrum:diario";
const VERSAO_DO_DIARIO = 1;

let diario = null;
let inicioDaSessao = 0;

function diarioVazio() {
    return {versao: VERSAO_DO_DIARIO, sessoes: [], eventos: []};
}

function carregar() {
    if (diario) {
        return diario;
    }

    try {
        const texto = window.localStorage.getItem(CHAVE_NO_NAVEGADOR);
        const salvo = texto ? JSON.parse(texto) : null;
        diario = salvo && salvo.versao === VERSAO_DO_DIARIO ? salvo : diarioVazio();
    } catch (erro) {
        diario = diarioVazio();
    }
    return diario;
}

function gravar() {
    try {
        window.localStorage.setItem(CHAVE_NO_NAVEGADOR, JSON.stringify(diario));
    } catch (erro) {
        return;
    }
}

// uma sessão nova a cada carregamento da página
export function iniciarSessao() {
    const atual = carregar();
    inicioDaSessao = performance.now();
    atual.sessoes.push({numero: atual.sessoes.length + 1, fps: null});
    gravar();
}

function sessaoAtual() {
    const atual = carregar();
    if (atual.sessoes.length === 0) {
        iniciarSessao();
    }
    return atual.sessoes[atual.sessoes.length - 1];
}

// milissegundos desde o começo da sessão; também serve para medir intervalos
export function agora() {
    return Math.round(performance.now() - inicioDaSessao);
}

export function anotar(tipo, dados) {
    const sessao = sessaoAtual();
    diario.eventos.push(Object.assign({sessao: sessao.numero, t: agora(), tipo: tipo}, dados));
    gravar();
}

// média e mínimo de FPS da sessão, atualizados de tempos em tempos
export function registrarFps(media, minimo) {
    sessaoAtual().fps = {media: Math.round(media), minimo: Math.round(minimo)};
    gravar();
}

export function lerDiario() {
    return carregar();
}

export function apagarDiario() {
    diario = diarioVazio();
    try {
        window.localStorage.removeItem(CHAVE_NO_NAVEGADOR);
    } catch (erro) {
        return;
    }
}
