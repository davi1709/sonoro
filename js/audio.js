// audio
const player = document.getElementById("player");

let audioCtx = null;
let analyser = null;
let sourceNode = null;
let animFrameOndas = null;

function construirBarrasOndas() {
    const container = document.getElementById("visualizador-ondas");
    if (!container) return;
    container.innerHTML = "";
    for (let i = 0; i < 25; i++) {
        const barra = document.createElement("div");
        barra.className = "barra-onda";
        container.appendChild(barra);
    }
}
construirBarrasOndas();

function inicializarAudioContext() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContextClass();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64; 
        sourceNode = audioCtx.createMediaElementSource(player);
        sourceNode.connect(analyser);
        analyser.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function renderizarOndasReais() {
    if (!analyser) return;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    const barras = document.querySelectorAll('.barra-onda');
    const totalBarras = barras.length;

    for (let i = 0; i < totalBarras; i++) {
        let indexData = Math.floor((i + 1) * (bufferLength / (totalBarras + 1)));
        let val = dataArray[indexData] || 0;
        
        let alturaCalculada = Math.max(6, Math.floor((val / 255) * 44));
        if (barras[i]) barras[i].style.height = `${alturaCalculada}px`;
    }

    animFrameOndas = requestAnimationFrame(renderizarOndasReais);
}

function iniciarAnimacaoOndas() {
    try {
        inicializarAudioContext();
    } catch(e) {
        console.log("AudioContext fallback ativo");
    }
    document.getElementById("visualizador-ondas").classList.add("ativo");
    document.getElementById("icone-play").innerText = "⏸";
    renderizarOndasReais();
}

function pararAnimacaoOndas() {
    if (animFrameOndas) cancelAnimationFrame(animFrameOndas);
    document.getElementById("visualizador-ondas").classList.remove("ativo");
    document.getElementById("icone-play").innerText = "⏵";
    document.getElementById("linha-trecho-progresso").style.width = "0%";

    const barras = document.querySelectorAll('.barra-onda');
    barras.forEach(b => b.style.height = "6px");
}

function ouvirAudio(tipo) {
    if (timeoutAudio) clearTimeout(timeoutAudio);
    if (loopProgressoTrecho) cancelAnimationFrame(loopProgressoTrecho);
    
    player.currentTime = inicioAleatorioAudio; 
    player.play();
    iniciarAnimacaoOndas();

    if (tipo === 'trecho') {
        timeoutAudio = setTimeout(() => { 
            player.pause(); 
            pararAnimacaoOndas();
        }, tempoTrecho * 1000);
    }
}
