let artistaIdAtual = "6043160";
let bancoDeMusicas = [];
let albunsDisponiveis = [];
let filaDeMusicas = [];
let musicaAtual;
let modoJogo = 'classico'; // 'classico', 'custom', 'zen'
let tipoResposta = 'digitar'; // 'digitar', 'marcar'
let trechoAjustavel = false;

let score = 0;
let rodadaAtual = 0;
let totalRodadas = 10;

let tempoTotal = 15;
let tempoTrecho = 1;
let segundosTocadosAnteriormente = 1;
let inicioAleatorioAudio = 0;
let tempoRestante = 0;
let tempoInicio = 0;
let loopTempo = null;
let timeoutAudio = null;
let loopProgressoTrecho = null;
let rodadaAtiva = false;
let jaTocouPrimeiraVez = false;

let pontosBonusClassico = 500;
let historicoGeral = [];

let catalogosCache = {}; 

let listaArtistasPadrão = [
    { id: "6043160", nome: "Kali Uchis" },
    { id: "380362", nome: "Mother Mother" },
    { id: "5039338", nome: "FKA twigs" },
    { id: "399", nome: "Radiohead" },
    { id: "5518450", nome: "Melanie Martinez" },
    { id: "9667370", nome: "Froid" },
    { id: "5578942", nome: "Doja Cat" },
    { id: "630", nome: "Björk" },
    { id: "6478881", nome: "SOPHIE" },
    { id: "14456487", nome: "Juice WRLD" }
];