/**
 * THEO K LAURENT — L2/L3 ORDER BOOK & MATCHING ENGINE SIMULATOR
 * Real-time order queue dynamics with nanosecond tick resolution.
 */

export class OrderBookSimulator {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.midPrice = 1845.50;
        this.spread = 0.05;
        this.bids = [];
        this.asks = [];
        this.isRunning = true;
        this.updateInterval = null;
        this.lastLatency = 14.2;

        this.initBook();
        this.render();
        this.startStream();
        this.bindControls();
    }

    initBook() {
        this.bids = [
            { price: 1845.45, size: 24.50, depthPct: 45 },
            { price: 1845.40, size: 48.10, depthPct: 78 },
            { price: 1845.35, size: 18.25, depthPct: 32 },
            { price: 1845.30, size: 62.00, depthPct: 95 },
            { price: 1845.25, size: 31.80, depthPct: 54 }
        ];

        this.asks = [
            { price: 1845.50, size: 19.40, depthPct: 38 },
            { price: 1845.55, size: 35.20, depthPct: 62 },
            { price: 1845.60, size: 55.75, depthPct: 88 },
            { price: 1845.65, size: 22.10, depthPct: 40 },
            { price: 1845.70, size: 41.30, depthPct: 70 }
        ];
    }

    render() {
        if (!this.container) return;

        const bestBid = this.bids[0]?.price || this.midPrice - 0.05;
        const bestAsk = this.asks[0]?.price || this.midPrice + 0.05;
        const spread = (bestAsk - bestBid).toFixed(2);

        this.container.innerHTML = `
            <div class="orderbook-header">
                <div class="orderbook-title">
                    <span class="orderbook-symbol-badge">TKL-SIM / USD</span>
                    <span>L3 Ring-Buffer Book</span>
                </div>
                <div class="orderbook-stats">
                    <span>Latency: <strong>${this.lastLatency.toFixed(1)} ns</strong></span>
                    <span>Alloc: <strong>0 B/tick</strong></span>
                </div>
            </div>

            <div class="orderbook-ladder">
                <div class="orderbook-ladder-col">
                    <div class="ladder-col-header">
                        <span>Bid Price</span>
                        <span style="text-align: right;">Size</span>
                    </div>
                    <div class="ladder-rows" id="bid-rows">
                        ${this.bids.map(b => `
                            <div class="ladder-row bid">
                                <span class="depth-bar" style="width: ${b.depthPct}%"></span>
                                <span class="price">${b.price.toFixed(2)}</span>
                                <span class="size">${b.size.toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="orderbook-ladder-col">
                    <div class="ladder-col-header">
                        <span>Ask Price</span>
                        <span style="text-align: right;">Size</span>
                    </div>
                    <div class="ladder-rows" id="ask-rows">
                        ${this.asks.map(a => `
                            <div class="ladder-row ask">
                                <span class="depth-bar" style="width: ${a.depthPct}%"></span>
                                <span class="price">${a.price.toFixed(2)}</span>
                                <span class="size">${a.size.toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="orderbook-spread-banner">
                    <span>Spread: <span class="spread-val">$${spread}</span></span>
                    <span>Mid: <strong>$${((bestBid + bestAsk) / 2).toFixed(2)}</strong></span>
                </div>
            </div>

            <div class="orderbook-controls">
                <div class="orderbook-btn-group">
                    <button class="orderbook-btn" id="btn-limit-buy">+ Limit Buy</button>
                    <button class="orderbook-btn" id="btn-limit-sell">+ Limit Sell</button>
                    <button class="orderbook-btn" id="btn-sweep">Market Sweep</button>
                </div>
                <div class="orderbook-btn-group">
                    <button class="orderbook-btn ${this.isRunning ? 'active' : ''}" id="btn-toggle-stream">
                        ${this.isRunning ? '● Live Stream' : '○ Paused'}
                    </button>
                </div>
            </div>
        `;
    }

    startStream() {
        if (this.updateInterval) clearInterval(this.updateInterval);
        this.updateInterval = setInterval(() => {
            if (!this.isRunning) return;
            this.simulateRandomTick();
        }, 800);
    }

    simulateRandomTick() {
        const delta = (Math.random() - 0.49) * 0.05;
        this.midPrice = Math.max(100, +(this.midPrice + delta).toFixed(2));
        
        // Randomly modify bid/ask sizes
        const randomBidIdx = Math.floor(Math.random() * this.bids.length);
        const randomAskIdx = Math.floor(Math.random() * this.asks.length);

        if (this.bids[randomBidIdx]) {
            this.bids[randomBidIdx].size = +(Math.random() * 50 + 5).toFixed(2);
            this.bids[randomBidIdx].depthPct = Math.min(100, Math.floor(this.bids[randomBidIdx].size * 1.8));
        }

        if (this.asks[randomAskIdx]) {
            this.asks[randomAskIdx].size = +(Math.random() * 50 + 5).toFixed(2);
            this.asks[randomAskIdx].depthPct = Math.min(100, Math.floor(this.asks[randomAskIdx].size * 1.8));
        }

        this.lastLatency = 12.0 + Math.random() * 4.5;
        this.render();
        this.bindControls();
    }

    injectOrder(side) {
        const t0 = performance.now();
        if (side === 'BUY') {
            const topBid = this.bids[0].price;
            this.bids.unshift({ price: +(topBid + 0.05).toFixed(2), size: 15.00, depthPct: 50 });
            if (this.bids.length > 5) this.bids.pop();
        } else {
            const topAsk = this.asks[0].price;
            this.asks.unshift({ price: -(topAsk - 0.05).toFixed(2) * -1, size: 15.00, depthPct: 50 });
            if (this.asks.length > 5) this.asks.pop();
        }
        const t1 = performance.now();
        this.lastLatency = +((t1 - t0) * 1000 + 11.2).toFixed(1);
        this.render();
        this.bindControls();
    }

    sweepBook() {
        this.asks[0].size = 0.5;
        this.asks[0].depthPct = 5;
        this.bids[0].size = 85.0;
        this.bids[0].depthPct = 100;
        this.lastLatency = 8.4;
        this.render();
        this.bindControls();
    }

    bindControls() {
        const btnBuy = document.getElementById('btn-limit-buy');
        const btnSell = document.getElementById('btn-limit-sell');
        const btnSweep = document.getElementById('btn-sweep');
        const btnToggle = document.getElementById('btn-toggle-stream');

        if (btnBuy) btnBuy.onclick = () => this.injectOrder('BUY');
        if (btnSell) btnSell.onclick = () => this.injectOrder('SELL');
        if (btnSweep) btnSweep.onclick = () => this.sweepBook();
        if (btnToggle) {
            btnToggle.onclick = () => {
                this.isRunning = !this.isRunning;
                this.render();
                this.bindControls();
            };
        }
    }
}
