// Orb Clicker - Idle Game
// Completely original game by GameBunch
// Fully Functional Upgrade System with Complete Game Loop

class OrbClicker {
    constructor() {
        // Game state
        this.state = {
            totalOrbs: 0,
            orbsPerClick: 1,
            totalClicks: 0,
            clicksThisSecond: 0,
            lastSaveTime: Date.now(),
        };

        // Upgrade definitions - Click Power upgrades
        this.clickUpgrades = [
            { id: 1, name: '+1 Click Power', basePower: 1, baseCost: 10, owned: 0, costScaling: 1.20 },
            { id: 2, name: '+2 Click Power', basePower: 2, baseCost: 50, owned: 0, costScaling: 1.20 },
            { id: 3, name: '+5 Click Power', basePower: 5, baseCost: 300, owned: 0, costScaling: 1.20 },
            { id: 4, name: '+10 Click Power', basePower: 10, baseCost: 1200, owned: 0, costScaling: 1.20 },
            { id: 5, name: '+25 Click Power', basePower: 25, baseCost: 5000, owned: 0, costScaling: 1.20 },
            { id: 6, name: '+50 Click Power', basePower: 50, baseCost: 20000, owned: 0, costScaling: 1.20 },
            { id: 7, name: '+100 Click Power', basePower: 100, baseCost: 100000, owned: 0, costScaling: 1.20 },
            { id: 8, name: '+250 Click Power', basePower: 250, baseCost: 400000, owned: 0, costScaling: 1.20 },
            { id: 9, name: '+500 Click Power', basePower: 500, baseCost: 2000000, owned: 0, costScaling: 1.20 },
            { id: 10, name: '+1000 Click Power', basePower: 1000, baseCost: 10000000, owned: 0, costScaling: 1.20 },
        ];

        // Generator definitions
        this.generators = [
            { id: 1, name: 'Spark Generator', production: 1, baseCost: 25, owned: 0, costScaling: 1.15 },
            { id: 2, name: 'Mini Reactor', production: 5, baseCost: 150, owned: 0, costScaling: 1.15 },
            { id: 3, name: 'Crystal Harvester', production: 10, baseCost: 500, owned: 0, costScaling: 1.15 },
            { id: 4, name: 'Quantum Battery', production: 25, baseCost: 1500, owned: 0, costScaling: 1.15 },
            { id: 5, name: 'Orb Extractor', production: 50, baseCost: 4000, owned: 0, costScaling: 1.15 },
            { id: 6, name: 'Plasma Core', production: 100, baseCost: 10000, owned: 0, costScaling: 1.15 },
            { id: 7, name: 'Fusion Engine', production: 250, baseCost: 30000, owned: 0, costScaling: 1.15 },
            { id: 8, name: 'Nova Collector', production: 500, baseCost: 80000, owned: 0, costScaling: 1.15 },
            { id: 9, name: 'Galaxy Forge', production: 1000, baseCost: 200000, owned: 0, costScaling: 1.15 },
            { id: 10, name: 'Void Reactor', production: 2500, baseCost: 600000, owned: 0, costScaling: 1.15 },
            { id: 11, name: 'Cosmic Nexus', production: 5000, baseCost: 2000000, owned: 0, costScaling: 1.15 },
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
        this.ui.resetBtn.addEventListener('click', () => this.requestReset());
    }

    // ==================== ORBING & CLICKING ====================

    handleOrbClick(e) {
        const rect = this.ui.orb.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.state.totalOrbs += this.state.orbsPerClick;
        this.state.totalClicks++;
        this.state.clicksThisSecond++;

        this.createFloatingNumber(x, y, '+' + this.formatNumber(this.state.orbsPerClick));

        // Animation
        this.ui.orb.style.transform = 'scale(0.92)';
        setTimeout(() => {
            this.ui.orb.style.transform = 'scale(1)';
        }, 50);

        this.updateUI();
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

    // ==================== COST CALCULATION ====================

    getUpgradeCost(upgrade) {
        // Prevent NaN - always return a valid number
        if (!upgrade || typeof upgrade.baseCost !== 'number') return 0;
        
        let cost = upgrade.baseCost;
        const scaling = upgrade.costScaling || 1.15;
        
        for (let i = 0; i < upgrade.owned; i++) {
            cost = cost * scaling;
        }
        
        // Ensure no NaN
        return Math.max(0, Math.round(cost));
    }

    // ==================== PURCHASING SYSTEM ====================

    buyClickUpgrade(upgrade) {
        // Prevent double purchases & null checks
        if (!upgrade || upgrade.purchased) return false;
        
        const currentCost = this.getUpgradeCost(upgrade);
        
        // Prevent negative orbs
        if (this.state.totalOrbs < currentCost) return false;
        
        // Deduct cost
        this.state.totalOrbs -= currentCost;
        upgrade.owned++;
        
        // Apply effect - add to orbsPerClick
        this.state.orbsPerClick += upgrade.basePower;
        
        this.updateUI();
        return true;
    }

    buyGenerator(generator) {
        // Prevent double purchases & null checks
        if (!generator || generator.purchased) return false;
        
        const currentCost = this.getUpgradeCost(generator);
        
        // Prevent negative orbs
        if (this.state.totalOrbs < currentCost) return false;
        
        // Deduct cost
        this.state.totalOrbs -= currentCost;
        generator.owned++;
        
        // Production stacking is automatic via calculateProductionPerSecond()
        
        this.updateUI();
        return true;
    }

    // ==================== PRODUCTION CALCULATION ====================

    calculateProductionPerSecond() {
        let total = 0;
        
        // Sum all generators' production
        for (let gen of this.generators) {
            if (!isNaN(gen.production) && !isNaN(gen.owned)) {
                total += gen.production * gen.owned;
            }
        }
        
        // Ensure no NaN
        return Math.max(0, total);
    }

    // ==================== FORMATTING ====================

    formatNumber(num) {
        // Prevent NaN display
        if (typeof num !== 'number' || isNaN(num)) return '0';
        
        num = Math.floor(num);
        if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
        return num.toString();
    }

    // ==================== UI UPDATING ====================

    updateUI() {
        // Update main stats display
        this.ui.totalOrbs.textContent = this.formatNumber(this.state.totalOrbs);
        this.ui.orbsPerClick.textContent = this.formatNumber(this.state.orbsPerClick);
        
        const pps = this.calculateProductionPerSecond();
        this.ui.orbsPerSecond.textContent = this.formatNumber(pps);
        this.ui.clicksPerSec.textContent = this.formatNumber(this.state.clicksThisSecond) + ' clicks/sec';

        this.renderUpgrades();
    }

    // ==================== RENDERING UPGRADES ====================

    renderUpgrades() {
        // Store reference to this for use in onclick handlers
        const gameInstance = this;
        
        // Render click upgrades
        this.ui.clickUpgradesContainer.innerHTML = '';
        
        this.clickUpgrades.forEach(upgrade => {
            const cost = this.getUpgradeCost(upgrade);
            const canAfford = this.state.totalOrbs >= cost;
            
            const item = document.createElement('div');
            item.className = 'upgrade-item' + (canAfford ? ' affordable' : ' locked');
            
            // Build HTML with all required info
            item.innerHTML = `
                <div class="upgrade-header">
                    <span class="upgrade-name">${upgrade.name}</span>
                    <span class="upgrade-cost">${this.formatNumber(cost)}</span>
                </div>
                <div class="upgrade-production">+${upgrade.basePower} power/click</div>
                ${upgrade.owned > 0 ? `<div class="upgrade-count">${upgrade.owned}</div>` : ''}
            `;
            
            // Only enable if affordable
            if (canAfford) {
                item.style.opacity = '1';
                item.style.cursor = 'pointer';
                item.onclick = function() {
                    if (!upgrade.purchased) {
                        upgrade.purchased = true;
                        gameInstance.buyClickUpgrade(upgrade);
                        setTimeout(() => { upgrade.purchased = false; }, 100);
                    }
                };
            } else {
                item.style.opacity = '0.5';
                item.style.cursor = 'not-allowed';
            }
            
            this.ui.clickUpgradesContainer.appendChild(item);
        });

        // Render generators
        this.ui.generatorsContainer.innerHTML = '';
        
        this.generators.forEach(gen => {
            const cost = this.getUpgradeCost(gen);
            const canAfford = this.state.totalOrbs >= cost;
            
            const item = document.createElement('div');
            item.className = 'upgrade-item' + (canAfford ? ' affordable' : ' locked');
            
            // Build HTML with owner info
            item.innerHTML = `
                <div class="upgrade-header">
                    <span class="upgrade-name">${gen.name}</span>
                    <span class="upgrade-cost">${this.formatNumber(cost)}</span>
                </div>
                <div class="upgrade-production">Owned: ${gen.owned}</div>
                <div class="upgrade-production">+${this.formatNumber(gen.production)} Orb/sec each</div>
                ${gen.owned > 0 ? `<div class="upgrade-count">${gen.owned}</div>` : ''}
            `;
            
            // Only enable if affordable
            if (canAfford) {
                item.style.opacity = '1';
                item.style.cursor = 'pointer';
                item.onclick = function() {
                    if (!gen.purchased) {
                        gen.purchased = true;
                        gameInstance.buyGenerator(gen);
                        setTimeout(() => { gen.purchased = false; }, 100);
                    }
                };
            } else {
                item.style.opacity = '0.5';
                item.style.cursor = 'not-allowed';
            }
            
            this.ui.generatorsContainer.appendChild(item);
        });
    }

    // ==================== SAVE SYSTEM ====================

    saveGame() {
        const saveData = {
            version: 1,
            timestamp: Date.now(),
            state: JSON.parse(JSON.stringify(this.state)),
            clickUpgrades: JSON.parse(JSON.stringify(this.clickUpgrades)),
            generators: JSON.parse(JSON.stringify(this.generators)),
        };
        
        try {
            localStorage.setItem('orbClickerSave', JSON.stringify(saveData));
            // Visual feedback
            this.ui.saveBtn.textContent = '✓ Saved';
            setTimeout(() => {
                this.ui.saveBtn.textContent = '💾 Save';
            }, 1000);
        } catch (e) {
            console.error('Failed to save:', e);
        }
    }

    loadGame() {
        try {
            const saveData = localStorage.getItem('orbClickerSave');
            if (saveData) {
                const data = JSON.parse(saveData);
                
                // Validate and restore state
                if (data.state) {
                    this.state = {
                        totalOrbs: data.state.totalOrbs || 0,
                        orbsPerClick: data.state.orbsPerClick || 1,
                        totalClicks: data.state.totalClicks || 0,
                        clicksThisSecond: 0,
                        lastSaveTime: Date.now(),
                    };
                }
                
                // Restore upgrades
                if (data.clickUpgrades) {
                    this.clickUpgrades.forEach((upgrade, i) => {
                        if (data.clickUpgrades[i]) {
                            upgrade.owned = data.clickUpgrades[i].owned || 0;
                        }
                    });
                }
                
                // Restore generators
                if (data.generators) {
                    this.generators.forEach((gen, i) => {
                        if (data.generators[i]) {
                            gen.owned = data.generators[i].owned || 0;
                        }
                    });
                }
            }
        } catch (e) {
            console.error('Failed to load save:', e);
        }
        
        this.updateUI();
    }

    // ==================== RESET SYSTEM ====================

    requestReset() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
            this.resetGame();
        }
    }

    resetGame() {
        // Clear all state
        this.state = {
            totalOrbs: 0,
            orbsPerClick: 1,
            totalClicks: 0,
            clicksThisSecond: 0,
            lastSaveTime: Date.now(),
        };
        
        // Reset all upgrades
        this.clickUpgrades.forEach(u => u.owned = 0);
        this.generators.forEach(g => g.owned = 0);
        
        // Clear save
        localStorage.removeItem('orbClickerSave');
        
        this.updateUI();
    }

    // ==================== GAME LOOP ====================

    startGameLoop() {
        let lastSecond = Date.now();
        let lastAutoSave = Date.now();

        const update = () => {
            const now = Date.now();
            const deltaTime = (now - lastSecond) / 1000;
            
            // Add passive generation every second
            if (deltaTime >= 1) {
                const pps = this.calculateProductionPerSecond();
                
                // Add production (no NaN)
                if (pps > 0 && !isNaN(pps)) {
                    this.state.totalOrbs += pps * deltaTime;
                }
                
                // Prevent negative orbs
                this.state.totalOrbs = Math.max(0, this.state.totalOrbs);
                
                // Reset clicks counter
                this.state.clicksThisSecond = 0;
                lastSecond = now;
                
                this.updateUI();
            }
            
            // Auto-save every 10 seconds
            if (now - lastAutoSave >= 10000) {
                this.saveGame();
                lastAutoSave = now;
            }
            
            requestAnimationFrame(update);
        };

        requestAnimationFrame(update);
    }
}

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new OrbClicker();
});
