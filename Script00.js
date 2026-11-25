/**
 * SCRIPTANDO FOR A QUIZIZZ - Bookmarklet Premium V6 Apple Style (Auth Removed)
 * Created by Pajé
 * 
 * Refinamentos:
 * 1. Design Apple Glassmorphism - Preto, Branco, Cinza com translúcido real
 * 2. Lógica de Resolução Automática integrada para Quizizz
 * 3. NOVO: Removida toda a lógica de autenticação e login
 * 4. Interface de Página Única (sem telas laterais ocultas)
 * 5. Nome: "SCRIPTANDO FOR A QUIZIZZ"
 */

(() => {
    if (window.scriptando_loaded) {
        console.log("SCRIPTANDO já está em execução.");
        return;
    }
    window.scriptando_loaded = true;

    const PREFIX = 'scriptando-';
    const LOGO_URL = 'https://iili.io/C7kiXTu.png';

    const IA_CONFIG = {
        puter: {
            enabled: true,
            models: [
                "gpt-4o",
                "claude-3-5-sonnet",
                "llama-3.1-405b",
                "gemini-1.5-pro",
                "mistral-large"
            ]
        }
    };

    // SVG Icons (Removed auth-related icons: lock, unlock, user, logout)
    const ICONS = {
        settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m2.12 2.12l4.24 4.24M1 12h6m6 0h6m-15.78 7.78l4.24-4.24m2.12-2.12l4.24-4.24"></path></svg>',
        target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="12" r="5"></circle><circle cx="12" cy="12" r="9"></circle></svg>',
        play: '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>',
        check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
        close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
        back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 12H5M12 19l-7-7 7-7"></path></svg>',
        minimize: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
        refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36M20.49 15a9 9 0 0 1-14.85 3.36"></path></svg>',
        loading: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" opacity="0.3"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path></svg>'
    };

    // ============================================================
    // FUNÇÕES DO SCRIPT ORIGINAL (MODIFICADAS PARA REMOVER AUTH)
    // ============================================================

    function carregarDependencias() {
        return new Promise((resolve, reject) => {
            if (typeof puter !== 'undefined') {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://js.puter.com/v2/';
            script.onload = () => {
                console.log("Sistema de IA carregado com sucesso.");
                resolve();
            };
            script.onerror = (e) => {
                console.error("Erro ao carregar sistema de IA:", e);
                reject(e);
            };
            document.head.appendChild(script);
        });
    }

    function iniciarCapturaPergunta() {
        const panelOriginal = document.querySelector(`.${PREFIX}panel`);
        const ballOriginal = document.querySelector(`.${PREFIX}ball`);
        if (panelOriginal) {
            panelOriginal.style.display = 'none';
            panelOriginal.classList.remove('open');
        }
        if (ballOriginal) {
            ballOriginal.style.display = 'none';
            ballOriginal.classList.add('hidden');
        }

        const overlay = document.createElement('div');
        overlay.id = `${PREFIX}capture-overlay`;
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.4);
            z-index: 10000002;
            cursor: crosshair;
            backdrop-filter: none;
        `;

        const canvas = document.createElement('canvas');
        canvas.id = `${PREFIX}selection-canvas`;
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            z-index: 10000003;
            cursor: crosshair;
        `;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const mensagem = document.createElement('div');
        mensagem.id = `${PREFIX}capture-msg`;
        mensagem.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(15, 15, 15, 0.9);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 16px;
            padding: 32px;
            color: #fff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            text-align: center;
            z-index: 10000004;
            max-width: 320px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            transition: opacity 0.5s ease;
        `;
        mensagem.innerHTML = `
            <div style="font-size: 18px; font-weight: 500; margin-bottom: 12px; letter-spacing: -0.5px;">Selecione a Pergunta</div>
            <div style="font-size: 13px; color: rgba(255, 255, 255, 0.6); line-height: 1.6; font-weight: 300;">
                Clique e arraste para selecionar a área da pergunta que deseja resolver.
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(canvas);
        document.body.appendChild(mensagem);

        setTimeout(() => {
            const msg = document.getElementById(`${PREFIX}capture-msg`);
            if (msg) {
                msg.style.opacity = '0';
                setTimeout(() => msg.remove(), 500);
            }
        }, 3000);

        const ctx = canvas.getContext('2d');
        let isDrawing = false;
        let startX, startY;
        let currentSel = null;

        function redraw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            if (currentSel) {
                ctx.clearRect(currentSel.x, currentSel.y, currentSel.w, currentSel.h);
                ctx.shadowBlur = 10;
                ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.lineWidth = 2;
                ctx.strokeRect(currentSel.x, currentSel.y, currentSel.w, currentSel.h);
                ctx.shadowBlur = 0;
            }
        }
        
        redraw();

        function startSelection(e) {
            isDrawing = true;
            const rect = canvas.getBoundingClientRect();
            startX = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
            startY = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
        }

        function drawSelection(e) {
            if (!isDrawing) return;
            const rect = canvas.getBoundingClientRect();
            const currentX = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
            const currentY = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

            currentSel = {
                x: Math.min(startX, currentX),
                y: Math.min(startY, currentY),
                w: Math.abs(currentX - startX),
                h: Math.abs(currentY - startY)
            };
            redraw();
        }

        function endSelection(e) {
            if (!isDrawing) return;
            isDrawing = false;
        }

        canvas.addEventListener('mousedown', startSelection);
        canvas.addEventListener('mousemove', drawSelection);
        canvas.addEventListener('mouseup', endSelection);
        canvas.addEventListener('touchstart', startSelection);
        canvas.addEventListener('touchmove', drawSelection);
        canvas.addEventListener('touchend', endSelection);

        const botoesDiv = document.createElement('div');
        botoesDiv.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 12px;
            z-index: 10000005;
        `;

        const btnConfirmar = document.createElement('button');
        btnConfirmar.innerHTML = ICONS.check;
        btnConfirmar.style.cssText = `
            background: rgba(255, 255, 255, 0.9);
            border: none;
            color: #000;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 8px 24px rgba(255, 255, 255, 0.2);
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const btnCancelar = document.createElement('button');
        btnCancelar.innerHTML = ICONS.close;
        btnCancelar.style.cssText = `
            background: rgba(15, 15, 15, 0.8);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #fff;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        botoesDiv.appendChild(btnConfirmar);
        botoesDiv.appendChild(btnCancelar);
        document.body.appendChild(botoesDiv);

        btnCancelar.onclick = () => {
            overlay.remove();
            canvas.remove();
            const msg = document.getElementById(`${PREFIX}capture-msg`);
            if (msg) msg.remove();
            botoesDiv.remove();
            openPanel();
        };

        btnConfirmar.onclick = async () => {
            if (!currentSel || currentSel.w < 10) {
                alert('Por favor, selecione uma área da pergunta.');
                return;
            }

            const sel = currentSel;
            overlay.style.display = 'none';
            canvas.style.display = 'none';
            botoesDiv.style.display = 'none';
            const msg = document.getElementById(`${PREFIX}capture-msg`);
            if (msg) msg.style.display = 'none';

            try {
                await new Promise(r => setTimeout(r, 150));
                const fullCanvas = await html2canvas(document.body, {
                    useCORS: true,
                    allowTaint: true,
                    logging: false,
                    backgroundColor: null,
                    x: window.scrollX + sel.x,
                    y: window.scrollY + sel.y,
                    width: sel.w,
                    height: sel.h
                });
                const imageData = fullCanvas.toDataURL('image/png');

                overlay.remove();
                canvas.remove();
                botoesDiv.remove();
                if (msg) msg.remove();

                openPanel();
                mostrarTelaRespostaIA();
                await processarPerguntaSelecionada(imageData);
            } catch (e) {
                console.error("Erro na captura:", e);
                alert("Erro ao capturar imagem.");
                openPanel();
            }
        };
    }

    async function processarPerguntaSelecionada(imageData) {
        const container = document.getElementById(`${PREFIX}resposta-container`);
        if (!container) return;
        
        container.innerHTML = `
            <div class="${PREFIX}glass-container" style="align-items: center; justify-content: center; min-height: 150px; gap: 16px;">
                <div style="width: 24px; height: 24px; color: #fff; animation: spin 1s linear infinite;">
                    ${ICONS.loading}
                </div>
                <div style="color: rgba(255, 255, 255, 0.6); font-size: 13px; font-weight: 400;">Analisando pergunta...</div>
            </div>
        `;

        try {
            const instrucao = `Analise a imagem da pergunta e forneça a RESPOSTA CORRETA de forma completa. Se for múltipla escolha, indique a letra/número e o texto da opção. Se for dissertativa ou preenchimento, forneça o texto completo da resposta. Seja direto e preciso.`;

            let resposta = '';
            for (const model of IA_CONFIG.puter.models) {
                try {
                    const result = await puter.ai.chat([{
                        role: "user",
                        content: [
                            { type: "image_url", image_url: { url: imageData } },
                            { type: "text", text: instrucao }
                        ]
                    }], { model: model });

                    resposta = (result.message ? result.message.content : result).toString().trim();
                    if (resposta && resposta.length > 0) break;
                } catch (e) {
                    console.warn(`Modelo ${model} falhou`);
                }
            }

            if (!resposta || resposta.length === 0) {
                throw new Error("Nenhuma IA conseguiu processar a pergunta.");
            }

            container.innerHTML = `
                <div class="${PREFIX}glass-container" style="max-height: 200px; overflow-y: auto; text-align: left;">
                    <div style="color: #fff; font-size: 14px; line-height: 1.6; white-space: pre-wrap; font-weight: 500;">${resposta}</div>
                </div>
            `;
        } catch (e) {
            container.innerHTML = `
                <div class="${PREFIX}glass-container" style="border-color: rgba(255, 68, 68, 0.3); background: rgba(255, 68, 68, 0.05);">
                    <div style="color: #ff4444; font-size: 13px; text-align: center;">Erro: ${e.message}</div>
                </div>
            `;
        }
    }

    async function executarResolucao() {
        alert("Modo de Resposta Automática: Esta função depende da estrutura específica da página do Quizizz.");
    }

    function atualizarBotaoIATelaInicial() {
        const btnIA = document.getElementById(`${PREFIX}btn-ia`);
        if (!btnIA) return;
        
        // Sempre exibe como pronto, pois a autenticação foi removida
        btnIA.innerHTML = `
            <span style="width: 16px; height: 16px; color: #34c759;">${ICONS.check}</span>
            <span style="color: #34c759;">IA Pronta</span>
        `;
        btnIA.style.borderColor = 'rgba(52, 199, 89, 0.4)';
        btnIA.style.background = 'rgba(52, 199, 89, 0.1)';
        btnIA.style.cursor = 'default';
    }

    // ============================================================
    // ESTILOS GLOBAIS
    // ============================================================
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .${PREFIX}overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: #000; z-index: 10000000; display: flex;
            flex-direction: column; align-items: center; justify-content: center;
            transition: opacity 0.8s ease, visibility 0.8s;
        }
        .${PREFIX}logo-init { width: 120px; margin-bottom: 40px; }
        .${PREFIX}loader-container { width: 200px; text-align: center; }
        .${PREFIX}progress-track {
            width: 100%; height: 2px; background: rgba(255, 255, 255, 0.1);
            border-radius: 1px; overflow: hidden; margin-bottom: 12px;
        }
        .${PREFIX}progress-fill {
            width: 0%; height: 100%; background: #fff;
            transition: width 0.4s ease;
        }
        .${PREFIX}status-text {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 10px; color: rgba(255, 255, 255, 0.4);
            letter-spacing: 2px; font-weight: 600; text-transform: uppercase;
        }

        .${PREFIX}ball {
            position: fixed; bottom: 24px; right: 24px; width: 56px; height: 56px;
            background: rgba(15, 15, 15, 0.8); backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 50%; cursor: pointer; z-index: 10000001;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .${PREFIX}ball:hover { transform: scale(1.05) translateY(-2px); border-color: rgba(255, 255, 255, 0.2); }
        .${PREFIX}ball.hidden { transform: scale(0) rotate(90deg); opacity: 0; pointer-events: none; }
        .${PREFIX}ball img { width: 24px; height: 24px; filter: drop-shadow(0 0 8px rgba(255,255,255,0.2)); }

        .${PREFIX}panel {
            position: fixed; bottom: 24px; right: 24px; width: 320px;
            background: rgba(15, 15, 15, 0.85); backdrop-filter: blur(30px);
            -webkit-backdrop-filter: blur(30px); border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 24px; z-index: 10000001; display: flex; flex-direction: column;
            box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
            transform: translateY(20px) scale(0.95); opacity: 0; pointer-events: none;
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .${PREFIX}panel.open { transform: translateY(0) scale(1); opacity: 1; pointer-events: all; }

        .${PREFIX}header {
            padding: 20px 20px 16px; display: flex; align-items: center; justify-content: space-between;
        }
        .${PREFIX}brand { display: flex; align-items: center; gap: 10px; }
        .${PREFIX}title { font-size: 12px; font-weight: 700; color: #fff; letter-spacing: 0.5px; }
        .${PREFIX}controls { display: flex; gap: 8px; }
        .${PREFIX}ctrl-btn {
            background: rgba(255, 255, 255, 0.05); border: none; color: rgba(255, 255, 255, 0.5);
            width: 28px; height: 28px; border-radius: 50%; cursor: pointer;
            display: flex; align-items: center; justify-content: center; transition: 0.2s;
        }
        .${PREFIX}ctrl-btn:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }
        .${PREFIX}ctrl-btn svg { width: 14px; height: 14px; }

        .${PREFIX}content { padding: 0 20px 20px; flex: 1; }
        .${PREFIX}footer {
            padding: 12px 20px; background: rgba(255, 255, 255, 0.03);
            border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;
        }
        .${PREFIX}footer-text { font-size: 9px; color: rgba(255, 255, 255, 0.2); letter-spacing: 1.5px; font-weight: 700; }

        .${PREFIX}main-btn {
            background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 14px 16px; border-radius: 14px; color: #fff; font-size: 13px; font-weight: 600;
            cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex; align-items: center; gap: 12px; width: 100%; margin: 8px 0;
        }
        .${PREFIX}main-btn:hover { background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.2); transform: translateY(-1px); }
        .${PREFIX}main-btn:active { transform: translateY(0); }
        .${PREFIX}main-btn svg { width: 18px; height: 18px; opacity: 0.8; }

        .${PREFIX}glass-container {
            background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 18px; padding: 16px; margin: 12px 0; display: flex; flex-direction: column; gap: 12px;
        }
        .${PREFIX}glass-desc { font-size: 12px; color: rgba(255, 255, 255, 0.4); line-height: 1.5; font-weight: 400; }

        .${PREFIX}back-btn {
            background: none; border: none; color: rgba(255, 255, 255, 0.5); font-size: 12px;
            font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;
            padding: 8px 0; transition: 0.2s;
        }
        .${PREFIX}back-btn:hover { color: #fff; }
        .${PREFIX}back-btn svg { width: 18px; height: 18px; }

        .${PREFIX}section-title {
            font-size: 14px; font-weight: 600; color: rgba(255, 255, 255, 0.8);
            margin-bottom: 4px; letter-spacing: -0.2px;
        }

        /* MODAL DE CONFIRMAÇÃO ESTILIZADO */
        .${PREFIX}modal-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
            z-index: 10000020; display: flex; align-items: center; justify-content: center;
            opacity: 0; transition: opacity 0.3s ease;
        }
        .${PREFIX}modal-overlay.visible { opacity: 1; }
        .${PREFIX}modal {
            background: rgba(15, 15, 15, 0.95); backdrop-filter: blur(30px);
            border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 20px;
            padding: 32px; max-width: 320px; width: 90%;
            text-align: center;
            transform: scale(0.9); transition: transform 0.3s ease;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
        }
        .${PREFIX}modal-overlay.visible .${PREFIX}modal { transform: scale(1); }
        .${PREFIX}modal-title {
            font-size: 17px; font-weight: 600; color: #fff;
            margin-bottom: 8px; letter-spacing: -0.3px;
        }
        .${PREFIX}modal-desc {
            font-size: 13px; color: rgba(255, 255, 255, 0.5);
            line-height: 1.6; margin-bottom: 24px; font-weight: 400;
        }
        .${PREFIX}modal-buttons {
            display: flex; gap: 12px;
        }
        .${PREFIX}modal-btn {
            flex: 1; padding: 14px 16px; border-radius: 12px; font-size: 14px;
            font-weight: 600; cursor: pointer; transition: 0.2s; border: none;
        }
        .${PREFIX}modal-btn-cancel {
            background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.12);
            color: #fff;
        }
        .${PREFIX}modal-btn-cancel:hover { background: rgba(255, 255, 255, 0.12); }
        .${PREFIX}modal-btn-confirm {
            background: #ff4444; color: #fff;
        }
        .${PREFIX}modal-btn-confirm:hover { background: #ff2222; }

        svg { stroke-linecap: round; stroke-linejoin: round; vertical-align: middle; }
    `;
    document.head.appendChild(style);

    const body = document.body;

    const overlay = document.createElement('div');
    overlay.className = `${PREFIX}overlay`;
    overlay.innerHTML = `
        <img src="${LOGO_URL}" class="${PREFIX}logo-init" id="${PREFIX}init-logo">
        <div class="${PREFIX}loader-container" id="${PREFIX}loader">
            <div class="${PREFIX}progress-track"><div class="${PREFIX}progress-fill" id="${PREFIX}progress"></div></div>
            <div class="${PREFIX}status-text" id="${PREFIX}status">INICIALIZANDO</div>
        </div>
    `;

    const ball = document.createElement('div');
    ball.className = `${PREFIX}ball`;
    ball.innerHTML = `<img src="${LOGO_URL}">`;

    const panel = document.createElement('div');
    panel.className = `${PREFIX}panel`;
    panel.innerHTML = `
        <div class="${PREFIX}header" id="${PREFIX}panel-header">
            <div class="${PREFIX}brand"><img src="${LOGO_URL}" width="18"><span class="${PREFIX}title">SCRIPTANDO FOR A QUIZIZZ</span></div>
            <div class="${PREFIX}controls">
                <button class="${PREFIX}ctrl-btn" id="${PREFIX}min-btn">${ICONS.minimize}</button>
                <button class="${PREFIX}ctrl-btn" id="${PREFIX}close-btn">${ICONS.close}</button>
            </div>
        </div>
        <div class="${PREFIX}content">
            <div id="${PREFIX}page-content"></div>
        </div>
        <div class="${PREFIX}footer"><div class="${PREFIX}footer-text">CREATED BY PAJÉ</div></div>
    `;

    body.appendChild(ball);
    body.appendChild(panel);

    function showModalConfirm(title, desc, onConfirm, onCancel) {
        const existing = document.querySelector(`.${PREFIX}modal-overlay`);
        if (existing) existing.remove();

        const modalOverlay = document.createElement('div');
        modalOverlay.className = `${PREFIX}modal-overlay`;
        modalOverlay.innerHTML = `
            <div class="${PREFIX}modal">
                <div class="${PREFIX}modal-title">${title}</div>
                <div class="${PREFIX}modal-desc">${desc}</div>
                <div class="${PREFIX}modal-buttons">
                    <button class="${PREFIX}modal-btn ${PREFIX}modal-btn-cancel" id="${PREFIX}modal-cancel">Cancelar</button>
                    <button class="${PREFIX}modal-btn ${PREFIX}modal-btn-confirm" id="${PREFIX}modal-confirm">Fechar</button>
                </div>
            </div>
        `;

        document.body.appendChild(modalOverlay);
        requestAnimationFrame(() => { modalOverlay.classList.add('visible'); });

        const btnConfirm = modalOverlay.querySelector(`#${PREFIX}modal-confirm`);
        const btnCancel = modalOverlay.querySelector(`#${PREFIX}modal-cancel`);

        const close = () => {
            modalOverlay.classList.remove('visible');
            setTimeout(() => modalOverlay.remove(), 300);
        };

        btnConfirm.onclick = () => { close(); if (onConfirm) onConfirm(); };
        btnCancel.onclick = () => { close(); if (onCancel) onCancel(); };
    }

    // ============================================================
    // SISTEMA DE NAVEGAÇÃO
    // ============================================================

    function mostrarTelaInicial() {
        const pageContent = document.getElementById(`${PREFIX}page-content`);
        if (!pageContent) return;
        pageContent.innerHTML = `
            <div class="${PREFIX}main-btn" id="${PREFIX}btn-ia" style="cursor: default;">
                <span style="width: 16px; height: 16px; color: #34c759;">${ICONS.check}</span>
                <span style="color: #34c759;">IA Pronta</span>
            </div>
            <div style="height:1px; background:rgba(255,255,255,0.1); margin:4px 0;"></div>
            <div class="${PREFIX}glass-container">
                <span class="${PREFIX}glass-desc">Automação com IA para resolver questões do Quizizz.</span>
                <button class="${PREFIX}main-btn" id="${PREFIX}btn-automacao-ia">
                    <span>Automação com IA</span>
                </button>
            </div>
        `;
        atualizarBotaoIATelaInicial();
        bindTelaInicialEvents();
    }

    function mostrarTelaAutomacaoIA() {
        const pageContent = document.getElementById(`${PREFIX}page-content`);
        if (!pageContent) return;
        pageContent.innerHTML = `
            <button class="${PREFIX}back-btn" id="${PREFIX}btn-voltar-automacao">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 12H5M12 19l-7-7 7-7"></path></svg>
                Voltar
            </button>
            <div style="height:1px; background:rgba(255,255,255,0.1); margin:4px 0 12px 0;"></div>
            <div class="${PREFIX}section-title">Automação com IA</div>
            <div class="${PREFIX}glass-container">
                <span class="${PREFIX}glass-desc">Escolha o modo de resolução automática:</span>
                <button class="${PREFIX}main-btn" id="${PREFIX}btn-resolver-perguntas">
                    <span style="width: 16px; height: 16px;">${ICONS.target}</span>
                    <span>Selecionar Pergunta</span>
                </button>
                <button class="${PREFIX}main-btn" id="${PREFIX}btn-resolucao-automatica" style="background:rgba(255,255,255,0.1); border-color:rgba(255,255,255,0.2);">
                    <span style="width: 16px; height: 16px;">${ICONS.play}</span>
                    <span>Resolução Automática</span>
                </button>
            </div>
        `;

        document.getElementById(`${PREFIX}btn-voltar-automacao`).onclick = mostrarTelaInicial;
        document.getElementById(`${PREFIX}btn-resolver-perguntas`).onclick = iniciarCapturaPergunta;
        document.getElementById(`${PREFIX}btn-resolucao-automatica`).onclick = executarResolucao;
    }

    function mostrarTelaRespostaIA() {
        const pageContent = document.getElementById(`${PREFIX}page-content`);
        if (!pageContent) return;
        pageContent.innerHTML = `
            <button class="${PREFIX}back-btn" id="${PREFIX}btn-voltar-resposta">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 12H5M12 19l-7-7 7-7"></path></svg>
                Voltar
            </button>
            <div style="height:1px; background:rgba(255,255,255,0.1); margin:4px 0 12px 0;"></div>
            <div class="${PREFIX}section-title">Resposta da IA</div>
            <div id="${PREFIX}resposta-container"></div>
        `;
        document.getElementById(`${PREFIX}btn-voltar-resposta`).onclick = mostrarTelaAutomacaoIA;
    }

    function bindTelaInicialEvents() {
        document.getElementById(`${PREFIX}btn-automacao-ia`).onclick = mostrarTelaAutomacaoIA;
    }

    function openPanel() {
        panel.classList.add('open');
        ball.classList.add('hidden');
    }

    function closePanel() {
        panel.classList.remove('open');
        ball.classList.remove('hidden');
    }

    document.getElementById(`${PREFIX}min-btn`).onclick = closePanel;
    document.getElementById(`${PREFIX}close-btn`).onclick = () => {
        showModalConfirm("Fechar Script", "Deseja realmente encerrar o Scriptando?", () => {
            window.scriptando_loaded = false;
            panel.remove();
            ball.remove();
            overlay.remove();
            document.head.querySelector(`style[data-scriptando]`)?.remove();
        });
    };
    ball.onclick = openPanel;

    async function init() {
        body.appendChild(overlay);
        const progress = document.getElementById(`${PREFIX}progress`);
        const status = document.getElementById(`${PREFIX}status`);

        try {
            status.innerText = "CARREGANDO IA...";
            progress.style.width = "50%";
            await carregarDependencias();

            status.innerText = "FINALIZANDO...";
            progress.style.width = "100%";

            setTimeout(() => {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.remove();
                    mostrarTelaInicial();
                }, 800);
            }, 500);

        } catch (e) {
            console.error("Erro na inicialização:", e);
            status.innerText = "ERRO NA INICIALIZAÇÃO";
            status.style.color = "#ff4444";
        }
    }

    init();

    if (typeof html2canvas === 'undefined') {
        const s = document.createElement('script');
        s.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
        document.head.appendChild(s);
    }

})();
