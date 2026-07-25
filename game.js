// Orb Clicker - Idle Game
// Completely original game by GameBunch

class OrbClicker {
    constructor() {
        // Game state
        this.state = {
            totalOrbs: 0,
            orbsPerClick: 1,
            totalClicks: 0,
            clicksThisSecond: 0,
        };

        // Upgrade definitions
        this.clickUpgrades = [
            { id: 1, name: '+1 Click Power', cost: 10, owned: 0 },
            { id: 2, name: '+2 Click Power', cost: 50, owned: 0 },
            { id: 3, name: '+5 Click Power', cost: 300, owned: 0 },
            { id: 4, name: '+10 Click Power', cost: 1200, owned: 0 },
            { id: 5, name: '+25 Click Power', cost: 5000, owned: 0 },
            { id: 6, name: '+50 Click Power', cost: 20000, owned: 0 },
            { id: 7, name: '+100 Click Power', cost: 100000, owned: 0 },
            { id: 8, name: '+250 Click Power', cost: 400000, owned: 0 },
            { id: 9, name: '+500 Click Power', cost: 2000000, owned: 0 },
            { id: 10, name: '+1000 Click Power', cost: 10000000, owned: 0 },
        ];

        this.generators = [
            { id: 1, name: 'Spark Generator', production: 1, cost: 25, owned: 0 },
            { id: 2, name: 'Mini Reactor', production: 5, cost: 150, owned: 0 },
            { id: 3, name: 'Crystal Harvester', production: 10, cost: 500, owned: 0 },
            { id: 4, name: 'Quantum Battery', production: 25, cost: 1500, owned: 0 },
            { id: 5, name: 'Orb Extractor', production: 50, cost: 4000, owned: 0 },
            { id: 6, name: 'Plasma Core', production: 100, cost: 10000, owned: 0 },
            { id: 7, name: 'Fusion Engine', production: 250, cost: 30000, owned: 0 },
            { id: 8, name: 'Nova Collector', production: 500, cost: 80000, owned: 0 },
            { id: 9, name: 'Galaxy Forge', production: 1000, cost: 200000, owned: 0 },
            { id: 10, name: 'Void Reactor', production: 2500, cost: 600000, owned: 0 },
            { id: 11, name: 'Cosmic Nexus', production: 5000, cost: 2000000, owned: 0 },
        ];

        // Initialize UI
        this.setupUI();
        this.loadGame();
        this.setupEventListeners();
        this.startGameLoop();
    }

    setupUI() {
        this.ui = {
            totalOrbs: document.getElementById('totalOrbs'),
            orbsPerClick: document.getElementById('orbsPerClick'),
            orbsPerSecond: document.getElementById('orbsPerSecond'),
            orb: document.getElementById('orbClickable'),
            floatingNumbers: document.getElementById('floatingNumbers'),
            clicksPerSec: document.getElementById('clicksPerSec'),
            clickUpgradesContainer: document.getElementById('clickUpgradesContainer'),
            generatorsContainer: document.getElementById('generatorsContainer'),
            saveBtn: document.getElementById('saveBtn'),
            resetBtn: document.getElementById('resetBtn'),
        };
    }

    setupEventListeners() {
        this.ui.orb.addEventListener('click', (e) => this.handleOrbClick(e));
        this.ui.saveBtn.addEventListener('click', () => this.saveGame());
        this.ui.resetBtn.addEventListener('click', () => this.resetGame());
    }

    handleOrbClick(e) {
        const rect = this.ui.orb.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.state.totalOrbs += this.state.orbsPerClick;
        this.state.totalClicks++;
        this.state.clicksThisSecond++;

        this.createFloatingNumber(x, y, '+' + this.state.orbsPerClick);

        // Animation
        this.ui.orb.style.transform = 'scale(0.92)';
        setTimeout(() => {
            this.ui.orb.style.transform = 'scale(1)';
        }, 50);
    }

    createFloatingNumber(x, y, text) {
        const num = document.createElement('div');
        num.className = 'floating-number';
        num.textContent = text;
        num.style.left = x + 'px';
        num.style.top = y + 'px';
        this.ui.floatingNumbers.appendChild(num);
        setTimeout(() => num.remove(), 1000);
    }

    calculateCost(upgrade, nextCost) {
        if (upgrade.hasOwnProperty('basePower')) {
            // Click upgrade: 20% increase per purchase
            return Math.round(nextCost * 1.20);
        } else {
            // Generator: 15% increase per purchase
            return Math.round(nextCost * 1.15);
        }
    }

    buyClickUpgrade(upgrade) {
        const currentCost = this.getClickUpgradeCost(upgrade);
        if (this.state.totalOrbs >= currentCost) {
            this.state.totalOrbs -= currentCost;
            upgrade.owned++;
            this.state.orbsPerClick += upgrade.name.match(/\+(\d+)/)[1] * 1;
            this.renderUpgrades();
        }
    }

    buyGenerator(generator) {
        const currentCost = this.getGeneratorCost(generator);
        if (this.state.totalOrbs >= currentCost) {
            this.state.totalOrbs -= currentCost;
            generator.owned++;
            this.renderUpgrades();
        }
    }

    getClickUpgradeCost(upgrade) {
        let cost = upgrade.cost;
        for (let i = 0; i < upgrade.owned; i++) {
            cost = Math.round(cost * 1.20);
        }
        return cost;
    }

    getGeneratorCost(generator) {
        let cost = generator.cost;
        for (let i = 0; i < generator.owned; i++) {
            cost = Math.round(cost * 1.15);
        }
        return cost;
    }

    calculateProductionPerSecond() {
        let total = 0;
        this.generators.forEach(gen => {
            total += gen.production * gen.owned;
        });
        return total;
    }

    formatNumber(num) {
        num = Math.floor(num);
        if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
        return num.toString();
    }

    updateUI() {
        this.ui.totalOrbs.textContent = this.formatNumber(this.state.totalOrbs);
        this.ui.orbsPerClick.textContent = this.state.orbsPerClick;
        
        const pps = this.calculateProductionPerSecond();
        this.ui.orbsPerSecond.textContent = this.formatNumber(pps);
        this.ui.clicksPerSec.textContent = this.formatNumber(this.state.clicksThisSecond) + ' clicks/sec';

        this.renderUpgrades();
    }

    renderUpgrades() {
        // Render click upgrades
        this.ui.clickUpgradesContainer.innerHTML = '';
        this.clickUpgrades.forEach(upgrade => {
            const cost = this.getClickUpgradeCost(upgrade);
            const canAfford = this.state.totalOrbs >= cost;
            
            const item = document.createElement('div');
            item.className = 'upgrade-item' + (canAfford ? ' affordable' : '');
            item.innerHTML = `
                <div class="upgrade-header">
                    <span class="upgrade-name">${upgrade.name}</span>
                    <span class="upgrade-cost">${this.formatNumber(cost)}</span>
                </div>
                <div class="upgrade-production">+${upgrade.name.match(/\+(\d+)/)[1]} power/click</div>
                ${upgrade.owned > 0 ? `<div class="upgrade-count">${upgrade.owned}</div>` : ''}
            `;
            
            if (canAfford) {
                item.style.cursor = 'pointer';
                item.addEventListener('click', () => this.buyClickUpgrade(upgrade));
            }
            
            this.ui.clickUpgradesContainer.appendChild(item);
        });

        // Render generators
        this.ui.generatorsContainer.innerHTML = '';
        this.generators.forEach(gen => {
            const cost = this.getGeneratorCost(gen);
            const canAfford = this.state.totalOrbs >= cost;
            
            const item = document.createElement('div');
            item.className = 'upgrade-item' + (canAfford ? ' affordable' : '');
            item.innerHTML = `
                <div class="upgrade-header">
                    <span class="upgrade-name">${gen.name}</span>
                    <span class="upgrade-cost">${this.formatNumber(cost)}</span>
                </div>
                <div class="upgrade-production">+${this.formatNumber(gen.production)}/sec</div>
                ${gen.owned > 0 ? `<div class="upgrade-count">${gen.owned}</div>` : ''}
            `;
            
            if (canAfford) {
                item.style.cursor = 'pointer';
                item.addEventListener('click', () => this.buyGenerator(gen));
            }
            
            this.ui.generatorsContainer.appendChild(item);
        });
    }

    saveGame() {
        const saveData = {
            state: this.state,
            clickUpgrades: this.clickUpgrades,
            generators: this.generators,
        };
        localStorage.setItem('orbClickerSave', JSON.stringify(saveData));
    }

    loadGame() {
        const saveData = localStorage.getItem('orbClickerSave');
        if (saveData) {
            const data = JSON.parse(saveData);
            this.state = data.state;
            this.clickUpgrades = data.clickUpgrades;
            this.generators = data.generators;
        }
        this.updateUI();
    }

    resetGame() {
        this.state = { totalOrbs: 0, orbsPerClick: 1, totalClicks: 0, clicksThisSecond: 0 };
        this.clickUpgrades.forEach(u => u.owned = 0);
        this.generators.forEach(g => g.owned = 0);
        this.updateUI();
        localStorage.removeItem('orbClickerSave');
    }

    startGameLoop() {
        let lastSecond = Date.now();

        const update = () => {
            const now = Date.now();
            const deltaTime = (now - lastSecond) / 1000;

            if (deltaTime >= 1) {
                const pps = this.calculateProductionPerSecond();
                this.state.totalOrbs += pps * deltaTime;
                this.state.clicksThisSecond = 0;
                lastSecond = now;
                this.updateUI();
                this.saveGame();
            } else {
                this.updateUI();
            }

            requestAnimationFrame(update);
        };

        requestAnimationFrame(update);
    }
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    new OrbClicker();
});
