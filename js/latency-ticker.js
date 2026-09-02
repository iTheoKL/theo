/**
 * THEO K LAURENT — LATENCY TICKER & SYSTEM STATUS
 */

export class LatencyTicker {
    constructor() {
        this.badge = document.getElementById('nav-latency-badge');
        this.init();
    }

    init() {
        if (!this.badge) return;
        setInterval(() => {
            const jitter = (Math.random() * 0.8 - 0.4);
            const val = (4.2 + jitter).toFixed(1);
            this.badge.innerHTML = `
                <span class="latency-dot"></span>
                <span>${val}ns L1</span>
            `;
        }, 1500);
    }
}
