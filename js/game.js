function confirmarModo(modo) {
    fecharModalModo();
    modoJogo = modo;
    
    if (modo === 'custom') {
        mostrarTela('tela-config');
    } else {
        document.getElementById("modal-estilo-resposta").classList.add("ativo");
    }
}

function selecionarEstiloEIniciar(estilo) {
    tipoResposta = estilo;
    fecharModalEstiloResposta();

    if (modoJogo === 'classico') {
        tempoTrecho = 1;
        trechoAjustavel = true;
        tempoTotal = 30;
        totalRodadas = 10;
        iniciarPartida();
    } else if (modoJogo === 'zen') {
        tempoTrecho = 30;
        trechoAjustavel = false;
        tempoTotal = 0;
        totalRodadas = 10;
        iniciarPartida();
    }
}

function iniciarPartida() {
    let acervoAtivo = [...bancoDeMusicas];

    if (modoJogo === 'custom') {
        tipoResposta = document.getElementById("config-tipo-resposta").value;
        
        let valTrecho = document.getElementById("config-trecho").value;
        if (valTrecho === "ajustavel") {
            trechoAjustavel = true;
            tempoTrecho = 1;
        } else {
            trechoAjustavel = false;
            tempoTrecho = parseInt(valTrecho);
        }

        tempoTotal = parseInt(document.getElementById("config-tempo").value);
        totalRodadas = parseInt(document.getElementById("config-rodadas").value);

        const incluirEPs = !document.getElementById("grupo-ep").classList.contains("inativo");
        const incluirSingles = !document.getElementById("grupo-single").classList.contains("inativo");

        const cardsAlbuns = document.querySelectorAll(".card-album");
        const albunsMarcados = [];
        cardsAlbuns.forEach(card => {
            if (!card.classList.contains("inativo")) {
                card.dataset.ids.split(',').forEach(id => albunsMarcados.push(parseInt(id)));
            }
        });

        acervoAtivo = acervoAtivo.filter(m => {
            if (m.tipoGrupo === "ep") return incluirEPs;
            if (m.tipoGrupo === "single") return incluirSingles;
            return albunsMarcados.includes(m.albumId);
        });

        if (acervoAtivo.length === 0) {
            alert("Selecione pelo menos uma opção para jogar!");
            return;
        }
    }
    
    score = 0;
    document.getElementById("score-total").innerText = score;
    
    document.getElementById("rodada-total").innerText = totalRodadas;
    rodadaAtual = 0;
    historicoGeral = [];
    
    filaDeMusicas = [...acervoAtivo].sort(() => Math.random() - 0.5).slice(0, totalRodadas);

    prepararRodada();
    mostrarTela('tela-jogo');
}

function aplicarEstiloRespostaPartida() {
    const formDigitar = document.getElementById("form-digitar");
    const containerMarcar = document.getElementById("container-marcar");

    if (tipoResposta === 'digitar') {
        formDigitar.style.display = "block";
        containerMarcar.style.display = "none";
    } else {
        formDigitar.style.display = "none";
        containerMarcar.style.display = "flex";
        if (musicaAtual) {
            gerareMontarOpcoesMarcar();
        }
    }
}

function prepararRodada() {
    rodadaAtual++;
    if (rodadaAtual > totalRodadas || filaDeMusicas.length === 0) {
        exibirEstatisticas();
        return;
    }

    if (loopTempo) cancelAnimationFrame(loopTempo);
    if (timeoutAudio) clearTimeout(timeoutAudio);
    if (loopProgressoTrecho) cancelAnimationFrame(loopProgressoTrecho);

    player.pause();
    player.currentTime = 0;
    pararAnimacaoOndas();

    document.getElementById("rodada-atual").innerText = rodadaAtual;
    document.getElementById("resultado").innerText = "";
    document.getElementById("painel-pos-resposta").style.display = "none";

    const containerBarraTempo = document.getElementById("container-barra-tempo");
    const textoTempo = document.getElementById("texto-tempo");

    if (modoJogo === 'zen') {
        containerBarraTempo.style.display = "none";
        textoTempo.style.display = "none";
    } else {
        containerBarraTempo.style.display = "block";
        textoTempo.style.display = "block";
        textoTempo.innerText = `${tempoTotal.toFixed(3)}s`;
        document.getElementById("barra-tempo").style.width = "100%";
        document.getElementById("barra-tempo").style.background = "#fff";
    }

    document.getElementById("linha-trecho-progresso").style.width = "0%";
    document.getElementById("resposta").value = "";
    
    musicaAtual = filaDeMusicas.pop();
    inicioAleatorioAudio = Math.floor(Math.random() * 15); 

    aplicarEstiloRespostaPartida();

    const btnMenos = document.getElementById("btn-menos");
    const btnMais = document.getElementById("btn-mais");
    
    if (trechoAjustavel) {
        btnMenos.style.display = "flex";
        btnMais.style.display = "flex";
    } else {
        btnMenos.style.display = "none";
        btnMais.style.display = "none";
    }
    
    if (modoJogo === 'classico') {
        tempoTrecho = 1;
        segundosTocadosAnteriormente = 1;
        pontosBonusClassico = 500;
    } else if (modoJogo === 'zen') {
        tempoTrecho = 30;
    }

    document.getElementById("txt-segundos-selecionados").innerText = tempoTrecho;
    document.getElementById("icone-play").innerText = "⏵";
    document.getElementById("btn-tocar").disabled = false;

    player.src = musicaAtual.preview;
    player.load();
    
    rodadaAtiva = true;
    jaTocouPrimeiraVez = false;
}

function gerareMontarOpcoesMarcar() {
    const containerMarcar = document.getElementById("container-marcar");
    containerMarcar.innerHTML = "";

    if (!musicaAtual) return;

    let alternativas = [musicaAtual];
    let outrasMusicas = bancoDeMusicas.filter(m => m.nomeNormalizado !== musicaAtual.nomeNormalizado);
    outrasMusicas = outrasMusicas.sort(() => Math.random() - 0.5);

    for (let i = 0; i < outrasMusicas.length && alternativas.length < 5; i++) {
        if (!alternativas.some(a => a.nomeNormalizado === outrasMusicas[i].nomeNormalizado)) {
            alternativas.push(outrasMusicas[i]);
        }
    }

    alternativas = alternativas.sort(() => Math.random() - 0.5);

    alternativas.forEach(item => {
        const btnOpcao = document.createElement("button");
        btnOpcao.className = "btn-opcao-marcar";
        btnOpcao.innerText = item.nomeExibicao;
        btnOpcao.onclick = () => conferirMarcar(item.nomeNormalizado);
        containerMarcar.appendChild(btnOpcao);
    });
}

function alterarSegundos(delta) {
    if (!trechoAjustavel) return;
    let novoVal = tempoTrecho + delta;
    if (novoVal >= 1 && novoVal <= 10) {
        tempoTrecho = novoVal;
        document.getElementById("txt-segundos-selecionados").innerText = tempoTrecho;
    }
}

async function tocarTrecho() {
    if (modoJogo === 'classico' && trechoAjustavel) {
        if (tempoTrecho > segundosTocadosAnteriormente) {
            let diff = tempoTrecho - segundosTocadosAnteriormente;
            pontosBonusClassico = Math.max(0, pontosBonusClassico - (diff * 50));
            segundosTocadosAnteriormente = tempoTrecho;
        }
    }

    document.getElementById("btn-tocar").disabled = true;
    
    try {
        if (timeoutAudio) clearTimeout(timeoutAudio);
        if (loopProgressoTrecho) cancelAnimationFrame(loopProgressoTrecho);

        player.pause();
        player.currentTime = inicioAleatorioAudio;
        
        await player.play();
        iniciarAnimacaoOndas();

        let inicioTrechoPerf = performance.now();
        let duracaoTrechoMs = tempoTrecho * 1000;

        function atualizarProgressoLinha(now) {
            let decorrido = now - inicioTrechoPerf;
            let pct = Math.min(100, (decorrido / duracaoTrechoMs) * 100);
            document.getElementById("linha-trecho-progresso").style.width = `${pct}%`;

            if (decorrido < duracaoTrechoMs && !player.paused) {
                loopProgressoTrecho = requestAnimationFrame(atualizarProgressoLinha);
            }
        }
        loopProgressoTrecho = requestAnimationFrame(atualizarProgressoLinha);

        timeoutAudio = setTimeout(() => { 
            player.pause();
            pararAnimacaoOndas();
            document.getElementById("btn-tocar").disabled = false;

            if (!jaTocouPrimeiraVez) {
                jaTocouPrimeiraVez = true;
                if (modoJogo !== 'zen' && rodadaAtiva) {
                    tempoInicio = performance.now();
                    loopTempo = requestAnimationFrame(atualizarTempo);
                }
            }
        }, duracaoTrechoMs);
    } catch (e) {
        console.error("Erro na reprodução:", e);
        document.getElementById("btn-tocar").disabled = false;
        pararAnimacaoOndas();
    }
}

function atualizarTempo(timestamp) {
    if (!rodadaAtiva || modoJogo === 'zen' || !jaTocouPrimeiraVez) return;

    let decorrido = (timestamp - tempoInicio) / 1000;
    tempoRestante = Math.max(0, tempoTotal - decorrido);

    document.getElementById("texto-tempo").innerText = `${tempoRestante.toFixed(3)}s`;
    
    let porcentagem = (tempoRestante / tempoTotal) * 100;
    const barra = document.getElementById("barra-tempo");
    barra.style.width = `${porcentagem}%`;

    if (porcentagem < 25) barra.style.background = "#ff4d4d";
    else if (porcentagem < 50) barra.style.background = "#ffca28";

    if (tempoRestante > 0) {
        loopTempo = requestAnimationFrame(atualizarTempo);
    } else {
        encerrarRodada(false, "Tempo esgotado!", 'tempo');
    }
}

function conferir(event) {
    if (event) event.preventDefault();
    if (!rodadaAtiva) return;

    let chuteEntrada = document.getElementById("resposta").value;
    let chuteNormalizado = normalizarNome(chuteEntrada);

    processarResposta(chuteNormalizado === musicaAtual.nomeNormalizado);
}

function conferirMarcar(nomeNormalizadoOpcao) {
    if (!rodadaAtiva) return;
    processarResposta(nomeNormalizadoOpcao === musicaAtual.nomeNormalizado);
}

function processarResposta(acertou) {
    if (acertou) {
        let pontosGanhos = 0;

        if (modoJogo === 'classico') {
            let pontosTempo = jaTocouPrimeiraVez ? Math.floor((tempoRestante / tempoTotal) * 500) : 500;
            pontosGanhos = pontosTempo + pontosBonusClassico;
        } else if (modoJogo === 'zen') {
            pontosGanhos = 100;
        } else {
            let proporcao = jaTocouPrimeiraVez ? (tempoRestante / tempoTotal) : 1;
            pontosGanhos = Math.floor(500 + (proporcao * 500));
        }

        score += pontosGanhos;
        document.getElementById("score-total").innerText = score;
        
        encerrarRodada(true, `+${pontosGanhos} pts!`);
    } else {
        encerrarRodada(false, `Resposta incorreta!`, 'erro');
    }
}

function encerrarRodada(acertou, mensagem, motivo) {
    rodadaAtiva = false;
    if (loopTempo) cancelAnimationFrame(loopTempo);
    if (timeoutAudio) clearTimeout(timeoutAudio);
    if (loopProgressoTrecho) cancelAnimationFrame(loopProgressoTrecho);
    player.pause();
    pararAnimacaoOndas();

    let tempoGasto = 0;
    if (modoJogo === 'zen') {
        tempoGasto = (performance.now() - tempoInicio) / 1000;
    } else if (jaTocouPrimeiraVez) {
        tempoGasto = tempoTotal - tempoRestante;
    }

    historicoGeral.push({ musica: musicaAtual, acertou: acertou, tempo: tempoGasto, motivo: motivo });

    let divResultado = document.getElementById("resultado");
    divResultado.innerHTML = `${mensagem} <br><span class="nome-revelado">Música: ${musicaAtual.nomeExibicao}</span>`;
    divResultado.style.color = acertou ? "#1db954" : "#ff4d4d";

    const btnsMarcar = document.querySelectorAll(".btn-opcao-marcar");
    btnsMarcar.forEach(b => b.disabled = true);

    document.getElementById("btn-tocar").disabled = true;
    
    const btnProximo = document.getElementById("btn-proximo");
    if (rodadaAtual === totalRodadas || filaDeMusicas.length === 0) {
        btnProximo.innerText = "VER ESTATÍSTICAS";
        btnProximo.style.background = "#ff0055";
    } else {
        btnProximo.innerText = "PRÓXIMA MÚSICA ➔";
        btnProximo.style.background = "#ff0055";
    }

    document.getElementById("painel-pos-resposta").style.display = "block";
}

function proximaAcao() {
    prepararRodada();
}

function exibirEstatisticas() {
    if (timeoutAudio) clearTimeout(timeoutAudio);
    if (loopProgressoTrecho) cancelAnimationFrame(loopProgressoTrecho);
    player.pause();
    player.currentTime = 0;
    pararAnimacaoOndas();

    const acertos = historicoGeral.filter(h => h.acertou);

    document.getElementById("stat-score").innerText = score;
    document.getElementById("stat-acertos").innerText = `${acertos.length}/${historicoGeral.length}`;

    if (acertos.length > 0) {
        let somaTempos = acertos.reduce((acc, curr) => acc + curr.tempo, 0);
        let media = (somaTempos / acertos.length).toFixed(2);
        document.getElementById("stat-tempo-medio").innerText = `${media}s`;

        let maisRapido = acertos.reduce((min, curr) => curr.tempo < min.tempo ? curr : min, acertos[0]);
        document.getElementById("stat-mais-rapido").innerText = `${maisRapido.musica.nomeExibicao} (${maisRapido.tempo.toFixed(1)}s)`;
    } else {
        document.getElementById("stat-tempo-medio").innerText = "-";
        document.getElementById("stat-mais-rapido").innerText = "-";
    }

    const containerHist = document.getElementById("stat-historico-lista");
    containerHist.innerHTML = "";

    historicoGeral.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "item-historico";
        div.innerHTML = `
            <img src="${item.musica.capa || 'https://e-cdns-images.dzcdn.net/images/cover/100x100-000000-80-0-0.jpg'}" alt="Capa">
            <div class="info-track">
                <div class="title">${index + 1}. ${item.musica.nomeExibicao}</div>
                <div class="status ${item.acertou ? 'status-acerto' : 'status-erro'}">
                    ${item.acertou ? `Acertou em ${item.tempo.toFixed(1)}s` : (item.motivo === 'tempo' ? 'Tempo esgotado' : 'Resposta errada')}
                </div>
            </div>
        `;

        div.addEventListener("mouseenter", () => {
            player.src = item.musica.preview;
            player.currentTime = 0;
            player.play().catch(() => {});
        });

        div.addEventListener("mouseleave", () => {
            player.pause();
        });

        div.addEventListener("click", () => {
            const jaTocandoEssa = player.src === item.musica.preview && !player.paused;
            if (jaTocandoEssa) {
                player.pause();
            } else {
                player.src = item.musica.preview;
                player.currentTime = 0;
                player.play().catch(() => {});
            }
        });

        containerHist.appendChild(div);
    });

    mostrarTela('tela-fim');
}

renderizarGridArtistas();