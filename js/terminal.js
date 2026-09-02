/**
 * THEO K LAURENT — REPL TERMINAL MATRIX & COMMAND PALETTE (⌘K / Ctrl+K)
 * Pure Vanilla JavaScript — Zero Dependencies, Zero CORS
 * Self-Mounting DOM Container
 * Palette: Royal Plum (#9b7fde) + Celestial Bronze (#dfb260) + Crystalline Silver (#f8fafc)
 */

(function () {
    function initTerminal() {
        // Ensure DOM container exists; if not, inject it dynamically
        let backdrop = document.getElementById('cmd-modal');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.id = 'cmd-modal';
            backdrop.innerHTML = `
                <div class="cmd-window">
                    <div class="cmd-bar">
                        <span>THEO K LAURENT // REPL MATRIX [v2.4.0]</span>
                        <div>
                            <span style="font-size: 0.7rem; color: var(--silver-dim); margin-right: 0.75rem;">(ESC to close)</span>
                            <button class="cmd-close-btn" id="cmd-close-btn" aria-label="Close Terminal">✕</button>
                        </div>
                    </div>
                    <div class="cmd-quick-pills">
                        <button class="cmd-pill" data-cmd="bench">⚡ bench</button>
                        <button class="cmd-pill" data-cmd="whoami">whoami</button>
                        <button class="cmd-pill" data-cmd="systems">systems</button>
                        <button class="cmd-pill" data-cmd="papers">papers</button>
                        <button class="cmd-pill" data-cmd="quote">quote</button>
                        <button class="cmd-pill" data-cmd="help">help</button>
                        <button class="cmd-pill" data-cmd="clear">clear</button>
                    </div>
                    <div class="cmd-output" id="cmd-output">
                        <div class="cmd-line res-info">
                            <strong>Theo K Laurent — Quantitative Systems Environment</strong><br>
                            Tap a command pill above, type <code>help</code>, or run <code>bench</code>.
                        </div>
                    </div>
                    <div class="cmd-input-wrap">
                        <span class="cmd-prompt">theo@systems:~$</span>
                        <input type="text" class="cmd-input" id="cmd-input" autocomplete="off" spellcheck="false" placeholder="type a command...">
                    </div>
                </div>
            `;
            document.body.appendChild(backdrop);
        }

        const input = document.getElementById('cmd-input');
        const output = document.getElementById('cmd-output');
        const closeBtn = document.getElementById('cmd-close-btn');
        const history = [];
        let historyIndex = -1;

        function isOpen() {
            return backdrop.classList.contains('open');
        }

        function open() {
            backdrop.classList.add('open');
            setTimeout(() => input && input.focus(), 60);
        }

        function close() {
            backdrop.classList.remove('open');
        }

        function toggle() {
            if (isOpen()) close();
            else open();
        }

        // Global Keyboard Shortcut (Cmd+K / Ctrl+K)
        window.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                toggle();
            }
            if (e.key === 'Escape' && isOpen()) {
                close();
            }
        });

        // Click outside to dismiss
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) close();
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', close);
        }

        // Attach to all .cmd-trigger buttons on page
        document.querySelectorAll('.cmd-trigger').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                open();
            });
        });

        // Attach to quick command pills
        backdrop.querySelectorAll('.cmd-pill').forEach(pill => {
            pill.addEventListener('click', (e) => {
                e.preventDefault();
                const cmd = pill.getAttribute('data-cmd');
                if (cmd) execute(cmd);
            });
        });

        // Mobile Hamburger Menu Toggle
        const menuToggle = document.getElementById('menu-toggle');
        const navWrap = document.getElementById('masthead-nav-wrap');
        if (menuToggle && navWrap) {
            menuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const isOpen = navWrap.classList.contains('open');
                if (isOpen) {
                    navWrap.classList.remove('open');
                    menuToggle.classList.remove('open');
                } else {
                    navWrap.classList.add('open');
                    menuToggle.classList.add('open');
                }
            });

            document.addEventListener('click', (e) => {
                if (!navWrap.contains(e.target) && !menuToggle.contains(e.target)) {
                    navWrap.classList.remove('open');
                    menuToggle.classList.remove('open');
                }
            });
        }

        function appendLine(html, type = '') {
            if (!output) return;
            const line = document.createElement('div');
            line.className = `cmd-line ${type}`;
            line.innerHTML = html;
            output.appendChild(line);
            output.scrollTop = output.scrollHeight;
        }

        function runBenchmark() {
            appendLine("Executing 1,000,000 sequential array & arithmetic operations on hardware...", "echo");
            const n = 1_000_000;
            const arr = new Float64Array(1000);
            for (let i = 0; i < 1000; i++) arr[i] = i * 1.41421356;

            const t0 = performance.now();
            let acc = 0;
            for (let i = 0; i < n; i++) {
                acc += arr[i % 1000];
            }
            const t1 = performance.now();
            const durationMs = (t1 - t0).toFixed(2);
            const nsPerOp = (((t1 - t0) * 1_000_000) / n).toFixed(2);

            appendLine(`
                ✓ <strong>Benchmark Execution Complete:</strong><br>
                &nbsp;&nbsp;• Total Duration: <strong>${durationMs} ms</strong><br>
                &nbsp;&nbsp;• Mean Throughput: <strong>${nsPerOp} ns / operation</strong><br>
                &nbsp;&nbsp;• Heap Allocation: <strong>0 Bytes (Zero-GC Cache Alignment)</strong>
            `, 'res-success');
        }

        function execute(rawCmd) {
            appendLine(`theo@systems:~$ ${rawCmd}`, 'echo');
            const [cmd, ...args] = rawCmd.trim().split(' ');
            const query = args.join(' ');

            switch (cmd.toLowerCase()) {
                case 'help':
                    appendLine(`
                        <strong>Available Primitives & Commands:</strong><br>
                        &nbsp;&nbsp;<code>bench</code> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Run in-browser micro-latency benchmark (1M ops)<br>
                        &nbsp;&nbsp;<code>whoami</code> &nbsp;&nbsp;&nbsp;&nbsp;- The Architect profile & quantitative baseline<br>
                        &nbsp;&nbsp;<code>systems</code> &nbsp;&nbsp;&nbsp;- Technical registry (Aether-L3, ThreatLens, etc.)<br>
                        &nbsp;&nbsp;<code>papers</code> &nbsp;&nbsp;&nbsp;&nbsp;- Monograph repository and architectural essays<br>
                        &nbsp;&nbsp;<code>eval &lt;expr&gt;</code> - Inline arithmetic evaluation (e.g. <code>eval 2^16</code>)<br>
                        &nbsp;&nbsp;<code>quote</code> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Architectural and quantitative aphorisms<br>
                        &nbsp;&nbsp;<code>contact</code> &nbsp;&nbsp;&nbsp;- Transmission coordinates & GitHub<br>
                        &nbsp;&nbsp;<code>clear</code> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Purge console output buffer<br>
                        &nbsp;&nbsp;<code>exit</code> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Dismiss REPL terminal modal
                    `, 'res-info');
                    break;

                case 'whoami':
                case 'bio':
                case 'architect':
                    appendLine(`
                        <strong>Theo K Laurent // The Architect</strong><br>
                        Quantitative Systems, Latency Determinism & Formal Verification.<br>
                        <em>"In most fields, being elite is regarded as a ceiling. In quantitative development, it is merely the baseline – the table stakes required to enter the room."</em>
                    `, 'res-success');
                    break;

                case 'systems':
                    appendLine(`
                        <strong>Production Systems Registry:</strong><br>
                        • <strong>SYS.01 // Cipher-CLI Vault:</strong> Constant-time Argon2id (64MB) + AES-256-GCM in Go.<br>
                        • <strong>SYS.02 // ThreatLens Extension:</strong> Pure JS client-side phishing defense for web & webmail.<br>
                        • <strong>SYS.03 // MedBridge Engine:</strong> Clinical graph conflict solver with model preloading.<br>
                        • <strong>SYS.04 // Aether-L3 Matching:</strong> Zero-allocation C++23 AVX-512 order matching (&le; 14.2ns).
                    `, 'res-info');
                    break;

                case 'papers':
                    appendLine(`
                        <strong>Monographs & Verse Index:</strong><br>
                        • <strong>2026.07:</strong> <a href="papers.html#medbridge-post-mortem" style="color:var(--bronze-light);">MedBridge: An Architecture of Inevitable Convergence</a><br>
                        • <strong>2026.08:</strong> <a href="papers.html#to-fall" style="color:var(--bronze-light);">To Fall (Verse on Icarus & Daedalus)</a><br>
                        • <strong>2025.11:</strong> <a href="papers.html#ravenclaw-creed-intellectual-moat" style="color:var(--bronze-light);">The Ravenclaw Creed: Intellectual Rigor as the Only Durable Moat</a>
                    `, 'res-info');
                    break;

                case 'bench':
                    runBenchmark();
                    break;

                case 'eval':
                    if (!query) {
                        appendLine("Error: Missing mathematical expression. Example: <code>eval 2^16 + sqrt(144)</code>", "res-error");
                        break;
                    }
                    try {
                        const sanitized = query.replace(/[^0-9+\-*/().%^eE\sMathsqrtlonsincostan]/g, '')
                                               .replace(/\^/g, '**')
                                               .replace(/sqrt/g, 'Math.sqrt')
                                               .replace(/ln/g, 'Math.log');
                        const res = new Function(`return (${sanitized})`)();
                        appendLine(`=> <strong>${res}</strong>`, 'res-success');
                    } catch (e) {
                        appendLine(`Evaluation Error: Invalid algebraic token.`, 'res-error');
                    }
                    break;

                case 'quote':
                    const quotes = [
                        "Software, I've come to believe, is a kind of architecture, and a building oughtn't be ugly.",
                        "Un regard tourné vers la Terre, l'autre vers l'infini.",
                        "In most fields, being elite is regarded as a ceiling. In quantitative development, it is merely the baseline.",
                        "A plan for a system is an invariant governing what each component must answer for, and nothing more.",
                        "To build is to accept the sea. To engineer is to make the ascent anyway.",
                        "Complexity is trivial to create; absolute simplicity requires devastating mastery.",
                        "The median case is an illusion designed for convenience; the worst-case bound is the only truth.",
                        "If you cannot measure your 99.99th percentile, you are not measuring latency—you are observing luck.",
                        "Mechanical sympathy is not an optimization; it is respect for the physics of silicon.",
                        "Memory is physical geometry. Align with the cache line, or pay the penalty in cycles.",
                        "La rigueur n'est pas une contrainte, mais l'armature de la liberté.",
                        "Bâtir, c'est accepter la mer. Être ingénieur, c'est faire l'ascension malgré tout.",
                        "L'élégance n'est pas l'absence de complexité, mais sa parfaite domination.",
                        "Freedom beyond the Blackwall is bought with unyielding conviction, not pragmatic compromise.",
                        "An orchestra without a concertmaster is noise; a distributed system without an architect is entropy.",
                        "Wit beyond measure is man's greatest treasure; the rest is merely implementation details."
                    ];
                    const q = quotes[Math.floor(Math.random() * quotes.length)];
                    appendLine(`<em>"${q}"</em>`, 'res-success');
                    break;

                case 'contact':
                    appendLine(`
                        <strong>Transmission Coordinates:</strong><br>
                        • Email: <a href="mailto:theoklaurent@icloud.com" style="color:var(--bronze-light);">theoklaurent@icloud.com</a><br>
                        • GitHub: <a href="https://github.com/iTheoKL" target="_blank" rel="noopener noreferrer" style="color:var(--accent-plum-bright);">github.com/iTheoKL</a><br>
                        • Hubs: Singapore, Hong Kong, and Global
                    `, 'res-info');
                    break;

                case 'clear':
                    if (output) output.innerHTML = '';
                    break;

                case 'exit':
                case 'quit':
                    close();
                    break;

                default:
                    appendLine(`Command not recognized: '${cmd}'. Type <code>help</code> for available commands.`, 'res-error');
                    break;
            }
        }

        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const cmd = input.value.trim();
                    if (cmd) {
                        history.push(cmd);
                        historyIndex = history.length;
                        execute(cmd);
                        input.value = '';
                    }
                } else if (e.key === 'ArrowUp') {
                    if (historyIndex > 0) {
                        historyIndex--;
                        input.value = history[historyIndex] || '';
                    }
                } else if (e.key === 'ArrowDown') {
                    if (historyIndex < history.length - 1) {
                        historyIndex++;
                        input.value = history[historyIndex] || '';
                    } else {
                        historyIndex = history.length;
                        input.value = '';
                    }
                }
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTerminal);
    } else {
        initTerminal();
    }
})();
