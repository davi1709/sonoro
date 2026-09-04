//AAAAAAAA
let tipoMenuAtual = 'artistas'; // 'artistas' ou 'playlists'

let artistaIdAtual = "6043160";
let playlistIdAtual = "3155776842"; // Exemplo padrão

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
let catalogosPlaylistsCache = {};

let artistaSelecionadoNome = "Kali Uchis";

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

let listaPlaylistsPadrao = [
    { id: "3155776842", titulo: "Top Worldwide", capa: "https://cdn-images.dzcdn.net/images/playlist/0b92c2f9e94a1a3650f0de769c4fc07c/500x500-000000-80-0-0.jpg", fas: 50000 },
    { id: "5207214368", titulo: "Top 50 Sertanejo", capa: "https://cdn-images.dzcdn.net/images/playlist/a0bfc66bf660f268503241e9ae95d045/500x500-000000-80-0-0.jpg", fas: 30000 },
    { id: "8282573142", titulo: "10s Pop", capa: "https://cdn-images.dzcdn.net/images/playlist/a2c4a523d4054a2ddb04856f0f31282b/500x500-000000-80-0-0.jpg", fas: 40000 }
];
