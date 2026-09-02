/**
 * THEO K LAURENT — WORKING PAPERS & ESSAYS REPOSITORY
 * Rigorous analyses on market microstructure, latency determinants, and formal systems.
 */

export const PAPERS = [
    {
        id: "fallacy-of-amortized-complexity",
        title: "On the Fallacy of Amortized Complexity in High-Frequency Execution",
        slug: "fallacy-of-amortized-complexity",
        date: "2026.04.12",
        category: "Microstructure & Systems",
        tags: ["C++23", "Tail-Latency", "Data Structures", "SIMD"],
        readTime: "7 min read",
        abstract: "Standard computer science curricula revere amortized $\\mathcal{O}(1)$ performance. In competitive high-frequency market making, amortized analysis is an operational liability: the outlier 99.99th-percentile allocation cycle is precisely where toxic order flow consumes your resting liquidity.",
        content: `
            <p class="lead">
                An algorithm with amortized $\\mathcal{O}(1)$ insertion is a trap for the mathematically uninitiated. In an academic setting or a distributed web backend, an occasional reallocation overhead of $300\\,\\mu\\text{s}$ is smoothed over millions of operations. In a price discovery auction on an FPGA/kernel-bypass NIC pipeline, a single $300\\,\\mu\\text{s}$ tail spike guarantees adverse selection.
            </p>

            <h2>I. The Deception of Hash Tables</h2>
            <p>
                Consider the pervasive reliance on open-addressing or robin-hood hash tables for order book indexing. While expected lookup is constant time, cache-line collisions under clustered hash distributions trigger iterative bucket probes:
            </p>

            <div class="math-block">
                $$\\mathbb{E}[T_{\\text{lookup}}] = \\Theta(1) \\quad \\text{but} \\quad \\max_{k} T_{\\text{lookup}}(k) = \\Omega\\left(\\frac{\\ln n}{\\ln \\ln n}\\right)$$
            </div>

            <p>
                When a liquidity shock hits an exchange cross-connect, incoming message burst rates exceed $10^6$ packets per second. An adversarial cancellation pattern will deliberately exploit secondary cluster boundaries, transforming what appeared to be a constant-time pipeline into a cache-miss cascade.
            </p>

            <div class="sidenote-box">
                <strong>§ Lemma 1.1 (Tail Invariance):</strong> A system whose worst-case bound exceeds the maximum inter-arrival threshold $\\Delta t_{\\text{min}}$ possesses an effective capacity of zero during non-stationary market regimes.
            </div>

            <h2>II. Zero-Allocation Contiguous B-Trees</h2>
            <p>
                To eliminate non-deterministic heap interactions, we architect our L3 book using fixed-capacity contiguous node arrays aligned strictly to $64$-byte cache boundaries.
            </p>

            <div class="code-figure">
                <div class="code-figure-header">
                    <span>OrderBookRing.hpp (Zero-Heap Primitive)</span>
                    <span>C++23 / AVX-512</span>
                </div>
                <pre><code>template &lt;size_t MaxDepth = 1024&gt;
struct alignas(64) FlatOrderBook {
    std::array&lt;uint64_t, MaxDepth&gt; prices;
    std::array&lt;uint32_t, MaxDepth&gt; quantities;
    uint32_t count{0};

    [[nodiscard]] inline size_t match_limit_simd(uint64_t target_price) noexcept {
        // SIMD broadcast price scan: zero branching, guaranteed 12ns execution
        __m512i target = _mm512_set1_epi64(target_price);
        // ... vectorized parallel comparison ...
        return count;
    }
};</code></pre>
            </div>

            <h2>III. Architectural Takeaways</h2>
            <p>
                When designing deterministic matching primitives, never trust convenience over predictable mechanical sympathy. True engineering maturity lies not in using elaborate container abstractions, but in understanding how silicon executes electrons through cache lines.
            </p>
        `
    },
    {
        id: "geometry-of-fixed-point-routing",
        title: "The Geometry of Fixed-Point Routing: Eliminating IEEE-754 Nondeterminism",
        slug: "geometry-of-fixed-point-routing",
        date: "2026.02.18",
        category: "Numerical Methods",
        tags: ["Quant Math", "Fixed-Point", "Determinism", "Arbitrage"],
        readTime: "9 min read",
        abstract: "Floating-point arithmetic is inherently non-associative. In multi-venue smart order routing, IEEE-754 rounding differences produce phantom arbitrage loops and non-reproducible state transitions. We formalize a scaled 128-bit fixed-point execution ring.",
        content: `
            <p class="lead">
                Few bugs in automated execution are as insidious as floating-point nondeterminism. When price aggregators compute synthetic spreads across fragmented venues, $(a + b) + c \\neq a + (b + c)$ introduces rounding anomalies that cascade into broken hedge ratios.
            </p>

            <h2>I. The Non-Associativity Trap</h2>
            <p>
                In high-dimension currency triangular arbitrage:
            </p>

            <div class="math-block">
                $$\\Pi_{\\text{synthetic}} = \\prod_{i=1}^k P_i \\quad \\text{vs.} \\quad \\sum_{i=1}^k \\ln P_i$$
            </div>

            <p>
                Standard IEEE-754 double precision introduces a machine epsilon $\\epsilon \\approx 2.22 \\times 10^{-16}$. Over high-frequency execution graphs spanning $10^8$ daily ticks, cumulative drift diverges calculated inventory risk from actual exchange balances.
            </p>

            <h2>II. 128-bit Fixed Point Algebra</h2>
            <p>
                We define fixed-point representation $\\hat{x} = \\lfloor x \\cdot 10^8 \\rfloor$, packing fractional pip increments into atomic integer registers. This eliminates floating point pipeline units (FPU latency) in favor of single-cycle ALU additions:
            </p>

            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Representation</th>
                            <th>Add Latency</th>
                            <th>Mul Latency</th>
                            <th>Associativity Proven</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>IEEE-754 Double</td>
                            <td>3-4 cycles</td>
                            <td>5 cycles</td>
                            <td class="dim">False</td>
                        </tr>
                        <tr>
                            <td>Int128 Fixed (8-dec)</td>
                            <td class="highlight">1 cycle</td>
                            <td class="highlight">3 cycles</td>
                            <td class="highlight">True (Formal Q.E.D.)</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <p>
                Precision is not a luxury; it is the fundamental prerequisite of valid inference.
            </p>
        `
    },
    {
        id: "ravenclaw-creed-intellectual-moat",
        title: "The Ravenclaw Creed: Intellectual Rigor as the Only Durable Moat",
        slug: "ravenclaw-creed-intellectual-moat",
        date: "2025.11.05",
        category: "Philosophy & Engineering",
        tags: ["Manifesto", "First Principles", "Epistemology"],
        readTime: "5 min read",
        abstract: "In an industry obsessed with short-term heuristics and brute-force compute, true competitive edge is not found in superficial speed, but in uncompromising clarity of thought and the courage to think from irreducible first principles.",
        content: `
            <p class="lead">
                Rowena Ravenclaw's dictum—<em>'Wit beyond measure is man's greatest treasure'</em>—is not a poetic sentiment. It is an operational law of systems architecture.
            </p>

            <h2>I. The Baseline of Competence</h2>
            <p>
                In mediocre engineering cultures, achieving correctness is treated as a milestone worthy of celebration. In elite quantitative environments, correctness is not an achievement; it is merely the table stakes required to enter the room.
            </p>
            <p>
                The difference between an average developer and an elite practitioner is not typing speed or memorized API syntax. It is the ability to perceive the entire causal topology of a machine: from the cache coherence protocol on the silicon die, to the stochastic properties of the limit order queue, to the asymptotic invariants of the data structure.
            </p>

            <div class="theorem-block">
                <div class="theorem-title">The First Principle of Craft</div>
                <div class="proof-statement">
                    If an engineer cannot explain the mechanical reason for every nanosecond spent in their hot path, they have not designed a system; they have merely assembled a coincidence.
                </div>
                <div class="proof-qed">■</div>
            </div>

            <h2>II. The Rejection of Superficiality</h2>
            <p>
                We do not build to impress those who evaluate software by the number of dependencies in their lockfile. We build for the silent scrutiny of mathematics, the relentless discipline of silicon, and the quiet satisfaction of unyielding precision.
            </p>
        `
    }
];
