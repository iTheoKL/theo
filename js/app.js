/**
 * THEO K LAURENT — CORE APPLICATION INITIALIZER
 */

import { OrderBookSimulator } from './orderbook-sim.js';
import { CommandTerminal } from './terminal.js';
import { LatencyTicker } from './latency-ticker.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Navbar Scroll State
    const header = document.querySelector('.site-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }
    }, { passive: true });

    // 2. Initialize Order Book Simulator if present
    if (document.getElementById('orderbook-widget')) {
        new OrderBookSimulator('orderbook-widget');
    }

    // 3. Initialize Terminal REPL
    new CommandTerminal();

    // 4. Initialize Latency Ticker
    new LatencyTicker();

    // 5. Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (mobileBtn && navMenu) {
        mobileBtn.addEventListener('click', () => {
            const isVisible = navMenu.style.display === 'flex';
            navMenu.style.display = isVisible ? 'none' : 'flex';
            if (!isVisible) {
                navMenu.style.flexDirection = 'column';
                navMenu.style.position = 'absolute';
                navMenu.style.top = 'var(--nav-height)';
                navMenu.style.left = '0';
                navMenu.style.right = '0';
                navMenu.style.background = 'var(--bg-glass-elevated)';
                navMenu.style.padding = '1.5rem';
                navMenu.style.borderBottom = '1px solid var(--border-regular)';
            }
        });
    }
});
