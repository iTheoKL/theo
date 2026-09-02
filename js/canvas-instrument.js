/**
 * THEO K LAURENT – BROWNIAN DRIFT & DENSITY PROFILE INSTRUMENT
 * Pure Vanilla Canvas2D – Zero Dependencies, Zero CORS
 * Features: Geometric Brownian Motion, Dynamic Liquidity Bands, Click-to-Inject Liquidity Shocks
 * Palette: Electric Plum (#9b7fde) + Celestial Bronze (#dfb260) + Crystalline Silver (#f8fafc)
 */

(function () {
    function initPhaseCanvas() {
        const canvas = document.getElementById('phase-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width, height;
        const maxPoints = 80;
        const points = [];
        let currentPrice = 100.0;
        let basePrice = 100.0;
        const mu = 0.0002;
        const sigma = 0.18;
        let shocks = []; // Active visual shock wave particles

        for (let i = 0; i < maxPoints; i++) {
            points.push(currentPrice);
        }

        function resize() {
            const rect = canvas.getBoundingClientRect();
            width = rect.width || 760;
            height = rect.height || 180;
            canvas.width = width * (window.devicePixelRatio || 1);
            canvas.height = height * (window.devicePixelRatio || 1);
            ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
        }

        // Click / Touch to inject stochastic shock
        function injectShock(e) {
            const rect = canvas.getBoundingClientRect();
            const clickX = e.clientX ? e.clientX - rect.left : width * 0.9;
            const clickY = e.clientY ? e.clientY - rect.top : height * 0.5;

            // Shock magnitude between -3.5% and +3.5%
            const direction = clickY < height / 2 ? 1 : -1;
            const magnitude = (0.015 + Math.random() * 0.025) * direction;
            currentPrice = currentPrice * (1.0 + magnitude);

            shocks.push({
                x: clickX,
                y: clickY,
                radius: 4,
                alpha: 0.9,
                color: direction > 0 ? '#9b7fde' : '#dfb260'
            });
        }

        canvas.addEventListener('mousedown', injectShock);
        canvas.addEventListener('touchstart', function (e) {
            if (e.touches && e.touches[0]) {
                injectShock(e.touches[0]);
            }
        }, { passive: true });

        function step() {
            // Box-Muller Gaussian noise
            const u1 = Math.max(1e-7, Math.random());
            const u2 = Math.random();
            const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

            const dt = 0.05;
            // Mean-reversion tendency toward basePrice to keep within aesthetic bounds
            const meanReversion = 0.08 * (basePrice - currentPrice) * dt;
            const drift = (mu - 0.5 * sigma * sigma) * dt + meanReversion;
            const diffusion = sigma * Math.sqrt(dt) * z;
            
            currentPrice = currentPrice * Math.exp(drift + diffusion);

            points.push(currentPrice);
            if (points.length > maxPoints) {
                points.shift();
            }

            // Update shocks
            for (let i = shocks.length - 1; i >= 0; i--) {
                shocks[i].radius += 2.2;
                shocks[i].alpha *= 0.88;
                if (shocks[i].alpha < 0.02) {
                    shocks.splice(i, 1);
                }
            }

            render();
        }

        function render() {
            ctx.clearRect(0, 0, width, height);

            // Subtle Grid
            ctx.strokeStyle = 'rgba(160, 150, 196, 0.06)';
            ctx.lineWidth = 1;
            const gridStep = 40;
            for (let x = 0; x < width; x += gridStep) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
            for (let y = 0; y < height; y += gridStep) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            const minP = Math.min(...points) - 1.2;
            const maxP = Math.max(...points) + 1.2;
            const pRange = maxP - minP || 1;

            const midY = height - ((currentPrice - minP) / pRange) * (height - 36) - 18;

            // Ask Liquidity Band (Royal Plum)
            const gradAsk = ctx.createLinearGradient(0, midY - 50, 0, midY);
            gradAsk.addColorStop(0, 'rgba(124, 92, 193, 0.0)');
            gradAsk.addColorStop(1, 'rgba(124, 92, 193, 0.14)');
            ctx.fillStyle = gradAsk;
            ctx.fillRect(0, midY - 50, width, 50);

            // Bid Liquidity Band (Celestial Bronze)
            const gradBid = ctx.createLinearGradient(0, midY, 0, midY + 50);
            gradBid.addColorStop(0, 'rgba(201, 154, 69, 0.12)');
            gradBid.addColorStop(1, 'rgba(201, 154, 69, 0.0)');
            ctx.fillStyle = gradBid;
            ctx.fillRect(0, midY, width, 50);

            // Price Trajectory (Electric Plum)
            ctx.strokeStyle = '#9b7fde';
            ctx.lineWidth = 1.75;
            ctx.beginPath();

            points.forEach((p, idx) => {
                const x = (idx / (maxPoints - 1)) * width;
                const y = height - ((p - minP) / pRange) * (height - 36) - 18;
                if (idx === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();

            // Render Shock Rings
            shocks.forEach(s => {
                ctx.save();
                ctx.strokeStyle = s.color;
                ctx.globalAlpha = s.alpha;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            });

            // Active Head Marker
            const lastX = width;
            const lastY = midY;
            ctx.fillStyle = '#f8fafc';
            ctx.shadowColor = '#9b7fde';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(lastX - 2, lastY, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        window.addEventListener('resize', resize);
        resize();
        setInterval(step, 50);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPhaseCanvas);
    } else {
        initPhaseCanvas();
    }
})();
