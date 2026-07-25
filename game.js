// Energy Orb Collector - Idle Game
// Original game by GameBunch

class EnergyOrbGame {
    constructor() {
        this.gameState = {
            totalOrbs: 0,
            orbsPerSecond: 0,
            clicksPerSecond: 0,
            level: 1,
            totalClicks: 0,
            totalEarned: 0,
            playTime: 0,
            upgradesPurchased: 0,
            ascensions: 0,
            ascensionMultiplier: 1,
            lastAutoSave: Date.now(),
            lastDailyReward: 0,
        };

        this.upgrades = this.initializeUpgrades();
        this.achievements = this.initializeAchievements();
        this.settings = {
            soundEnabled: true,
            animationsEnabled: true,
            volume: 100,
            numberFormat: false,
            autosaveInterval: 10000,
        };

        this.ui = {};
        this.events = [];
        this.gameRunning = true;

        this.initializeUI();
        this.loadGame();
        this.startGameLoop();
        this.setupEventListeners();
    }

    initializeUpgrades() {
        return [
            { id: 1, name: 'Spark Generator', desc: 'Generate passive energy', cost: 10, baseProduction: 0.1, owned: 0, unlockAt: 0, type: 'generator' },
            { id: 2, name: 'Crystal Reactor', desc: 'Boost energy flow', cost: 100, baseProduction: 1, owned: 0, unlockAt: 50, type: 'reactor' },
            { id: 3, name: 'Quantum Battery', desc: 'Store and release energy', cost: 500, baseProduction: 5, owned: 0, unlockAt: 500, type: 'battery' },
            { id: 4, name: 'Plasma Core', desc: 'Explosive energy production', cost: 2500, baseProduction: 25, owned: 0, unlockAt: 3000, type: 'core' },
            { id: 5, name: 'Nova Collector', desc: 'Harness stellar energy', cost: 10000, baseProduction: 100, owned: 0, unlockAt: 15000, type: 'collector' },
            { id: 6, name: 'Click Amplifier', desc: '+25% click power', cost: 50, basePower: 1.25, owned: 0, unlockAt: 100, type: 'clicker' },
            { id: 7, name: 'Resonance Tuner', desc: '+50% all production', cost: 5000, multiplier: 1.5, owned: 0, unlockAt: 10000, type: 'multiplier' },
            { id: 8, name: 'Energy Nexus', desc: 'Connects all generators', cost: 50000, baseProduction: 500, owned: 0, unlockAt: 100000, type: 'nexus' },
            { id: 9, name: 'Temporal Accelerator', desc: 'Speed up production by 1%', cost: 3000, multiplier: 1.01, owned: 0, unlockAt: 5000, type: 'accelerator' },
            { id: 10, name: 'Dimensional Rift', desc: 'Double all passive production', cost: 100000, multiplier: 2, owned: 0, unlockAt: 500000, type: 'rift' },
            { id: 11, name: 'Photon Emitter', desc: '+30% auto production', cost: 200, baseProduction: 2, owned: 0, unlockAt: 300, type: 'emitter' },
            { id: 12, name: 'Solar Panel Array', desc: '+100 orbs per second', cost: 10000, baseProduction: 100, owned: 0, unlockAt: 50000, type: 'solar' },
            { id: 13, name: 'Singularity Engine', desc: 'Exponential production growth', cost: 500000, baseProduction: 1000, owned: 0, unlockAt: 1000000, type: 'singularity' },
            { id: 14, name: 'Nebula Harvester', desc: 'Harvest cosmic energy', cost: 1000, baseProduction: 10, owned: 0, unlockAt: 2000, type: 'nebula' },
            { id: 15, name: 'Void Tapper', desc: 'Extract void energy', cost: 50000, baseProduction: 250, owned: 0, unlockAt: 200000, type: 'void' },
            { id: 16, name: 'Hyperdrive Generator', desc: 'Triple production speed', cost: 75000, multiplier: 3, owned: 0, unlockAt: 300000, type: 'hyperdrive' },
            { id: 17, name: 'Quantum Entangler', desc: '+5x click power', cost: 25000, basePower: 5, owned: 0, unlockAt: 100000, type: 'quantumclicker' },
            { id: 18, name: 'Antimatter Reactor', desc: 'Ultra-efficient production', cost: 200000, baseProduction: 2000, owned: 0, unlockAt: 1000000, type: 'antimatter' },
            { id: 19, name: 'Infinity Core', desc: 'Unlimited potential', cost: 1000000, baseProduction: 10000, owned: 0, unlockAt: 5000000, type: 'infinity' },
            { id: 20, name: 'Transcendence Matrix', desc: 'Ascend to new heights', cost: 5000000, baseProduction: 50000, owned: 0, unlockAt: 10000000, type: 'transcendence' },
        ];
    }

    initializeAchievements() {
        return [
            { id: 1, name: 'First Click', desc: 'Click the orb', unlocked: false, icon: '👆' },
            { id: 2, name: 'Hundred Clicks', desc: 'Click 100 times', condition: () => this.gameState.totalClicks >= 100, unlocked: false, icon: '💯' },
            { id: 3, name: 'Thousand Clicks', desc: 'Click 1000 times', condition: () => this.gameState.totalClicks >= 1000, unlocked: false, icon: '🎯' },
            { id: 4, name: 'First Generator', desc: 'Buy first upgrade', unlocked: false, icon: '⚡' },
            { id: 5, name: 'Generator Master', desc: 'Buy 10 upgrades', condition: () => this.gameState.upgradesPurchased >= 10, unlocked: false, icon: '🔧' },
            { id: 6, name: 'Rich', desc: 'Earn 1000 orbs', condition: () => this.gameState.totalEarned >= 1000, unlocked: false, icon: '💰' },
            { id: 7, name: 'Wealthy', desc: 'Earn 100,000 orbs', condition: () => this.gameState.totalEarned >= 100000, unlocked: false, icon: '🏆' },
            { id: 8, name: 'Millionaire', desc: 'Earn 1,000,000 orbs', condition: () => this.gameState.totalEarned >= 1000000, unlocked: false, icon: '💎' },
            { id: 9, name: 'Auto Clicker', desc: 'Generate 1 orb per second', condition: () => this.gameState.orbsPerSecond >= 1, unlocked: false, icon: '🤖' },
            { id: 10, name: 'Level Up', desc: 'Reach level 5', condition: () => this.gameState.level >= 5, unlocked: false, icon: '📈' },
            { id: 11, name: 'Level Master', desc: 'Reach level 50', condition: () => this.gameState.level >= 50, unlocked: false, icon: '👑' },
            { id: 12, name: 'First Ascension', desc: 'Use Ascension once', unlocked: false, icon: '🚀' },
            { id: 13, name: 'Play One Hour', desc: 'Play for 1 hour', condition: () => this.gameState.playTime >= 3600, unlocked: false, icon: '⏰' },
            { id: 14, name: 'Clicker Legend', desc: 'Click 10,000 times', condition: () => this.gameState.totalClicks >= 10000, unlocked: false, icon: '⭐' },
            { id: 15, name: 'All Upgrades', desc: 'Buy all available upgrades', unlocked: false, icon: '🌟' },
        ];
    }

    initializeUI() {
        this.ui = {
            totalOrbs: document.getElementById('totalOrbs'),
            orbsPerSecond: document.getElementById('orbsPerSecond'),
            level: document.getElementById('level'),
            cpsDisplay: document.getElementById('cpsDisplay'),
            orb: document.getElementById('orbClickable'),
            floatingNumbers: document.getElementById('floatingNumbers'),
            progressFill: document.getElementById('progressFill'),
            progressText: document.getElementById('progressText'),
            upgradesContainer: document.getElementById('upgradesContainer'),
            notification: document.getElementById('notification'),
            settingsModal: document.getElementById('settingsModal'),
            statsModal: document.getElementById('statsModal'),
            achievementsModal: document.getElementById('achievementsModal'),
        };
    }

    setupEventListeners() {
        // Orb click
        this.ui.orb.addEventListener('click', (e) => this.handleOrbClick(e));

        // Buttons
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettings());
        document.getElementById('statsBtn').addEventListener('click', () => this.showStats());
        document.getElementById('achievementsBtn').addEventListener('click', () => this.showAchievements());
        document.getElementById('ascensionBtn').addEventListener('click', () => this.showAscensionDialog());
        document.getElementById('dailyRewardBtn').addEventListener('click', () => this.claimDailyReward());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveGame());
        document.getElementById('loadBtn').addEventListener('click', () => this.loadGame());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterUpgrades(e.target.dataset.filter));
        });

        // Modal close buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.remove('active');
            });
        });

        // Settings
        document.getElementById('soundToggle').addEventListener('change', (e) => {
            this.settings.soundEnabled = e.target.checked;
        });
        document.getElementById('animationsToggle').addEventListener('change', (e) => {
            this.settings.animationsEnabled = e.target.checked;
        });
        document.getElementById('volumeSlider').addEventListener('input', (e) => {
            this.settings.volume = e.target.value;
            document.getElementById('volumeValue').textContent = e.target.value;
        });
        document.getElementById('autosaveSlider').addEventListener('input', (e) => {
            this.settings.autosaveInterval = e.target.value * 1000;
            document.getElementById('autosaveValue').textContent = e.target.value;
        });
        document.getElementById('numberFormatToggle').addEventListener('change', (e) => {
            this.settings.numberFormat = e.target.checked;
        });
    }

    handleOrbClick(e) {
        const rect = this.ui.orb.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const orbsEarned = this.calculateClickValue();
        this.gameState.totalOrbs += orbsEarned;
        this.gameState.totalEarned += orbsEarned;
        this.gameState.totalClicks++;

        this.createFloatingNumber(x, y, this.formatNumber(orbsEarned));

        if (this.settings.animationsEnabled) {
            this.ui.orb.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.ui.orb.style.transform = 'scale(1)';
            }, 50);
        }

        this.checkAchievements();
    }

    calculateClickValue() {
        let basePower = 1;
        const clickAmplifier = this.upgrades.find(u => u.id === 6);
        if (clickAmplifier && clickAmplifier.owned > 0) {
            basePower *= Math.pow(1.25, clickAmplifier.owned);
        }

        const quantumEntan = this.upgrades.find(u => u.id === 17);
        if (quantumEntan && quantumEntan.owned > 0) {
            basePower *= Math.pow(5, quantumEntan.owned);
        }

        return basePower * this.gameState.ascensionMultiplier;
    }

    createFloatingNumber(x, y, text) {
        const num = document.createElement('div');
        num.className = 'floating-number';
        num.textContent = '+' + text;
        num.style.left = x + 'px';
        num.style.top = y + 'px';

        this.ui.floatingNumbers.appendChild(num);
        setTimeout(() => num.remove(), 1000);
    }

    calculateProductionPerSecond() {
        let total = 0;

        this.upgrades.forEach(upgrade => {
            if (upgrade.baseProduction && upgrade.owned > 0) {
                let production = upgrade.baseProduction * upgrade.owned;
                
                // Apply multipliers
                if (upgrade.multiplier) {
                    production *= Math.pow(upgrade.multiplier, upgrade.owned);
                }

                total += production;
            }
        });

        // Apply ascension multiplier
        total *= this.gameState.ascensionMultiplier;

        return total;
    }

    updateUI() {
        this.ui.totalOrbs.textContent = this.formatNumber(this.gameState.totalOrbs);
        this.gameState.orbsPerSecond = this.calculateProductionPerSecond();
        this.ui.orbsPerSecond.textContent = this.formatNumber(this.gameState.orbsPerSecond.toFixed(1));
        this.ui.level.textContent = this.gameState.level;
        this.ui.cpsDisplay.textContent = this.formatNumber((this.gameState.totalClicks / Math.max(this.gameState.playTime, 1)).toFixed(2)) + ' clicks/sec';

        // Update progress
        const currentLevelTarget = this.gameState.level * 1000;
        const previousLevelTarget = (this.gameState.level - 1) * 1000;
        const progress = (this.gameState.totalEarned - previousLevelTarget) / (currentLevelTarget - previousLevelTarget);
        this.ui.progressFill.style.width = Math.min(100, progress * 100) + '%';
        this.ui.progressText.textContent = this.gameState.totalEarned + ' / ' + currentLevelTarget;

        this.renderUpgrades();
        this.updateLevelIfNeeded();
    }

    updateLevelIfNeeded() {
        const newLevel = Math.floor(this.gameState.totalEarned / 1000) + 1;
        if (newLevel > this.gameState.level) {
            this.gameState.level = newLevel;
            this.showNotification(`🎉 Reached Level ${this.gameState.level}!`);
        }
    }

    renderUpgrades() {
        this.ui.upgradesContainer.innerHTML = '';

        const filter = document.querySelector('.filter-btn.active').dataset.filter;

        this.upgrades.forEach(upgrade => {
            const isUnlocked = this.gameState.totalEarned >= upgrade.unlockAt;
            const isAffordable = this.gameState.totalOrbs >= upgrade.cost;

            let shouldShow = true;
            if (filter === 'available') shouldShow = isUnlocked && isAffordable;
            if (filter === 'locked') shouldShow = !isUnlocked || !isAffordable;

            if (shouldShow) {
                const item = document.createElement('div');
                item.className = 'upgrade-item';
                if (!isUnlocked) item.classList.add('locked');
                if (isAffordable && isUnlocked) item.classList.add('affordable');

                const cost = upgrade.cost * Math.pow(1.15, upgrade.owned);

                item.innerHTML = `
                    <div class="upgrade-header">
                        <span class="upgrade-name">${upgrade.name}</span>
                        <span class="upgrade-cost">${this.formatNumber(cost.toFixed(0))}</span>
                    </div>
                    <div class="upgrade-desc">${upgrade.desc}</div>
                    <div class="upgrade-production">+${this.formatNumber((upgrade.baseProduction || upgrade.multiplier || 1).toFixed(2))}</div>
                    ${upgrade.owned > 0 ? `<div class="upgrade-count">${upgrade.owned}</div>` : ''}
                `;

                if (isUnlocked && isAffordable) {
                    item.addEventListener('click', () => this.buyUpgrade(upgrade));
                    item.style.cursor = 'pointer';
                }

                this.ui.upgradesContainer.appendChild(item);
            }
        });
    }

    buyUpgrade(upgrade) {
        const cost = upgrade.cost * Math.pow(1.15, upgrade.owned);
        if (this.gameState.totalOrbs >= cost) {
            this.gameState.totalOrbs -= cost;
            upgrade.owned++;
            this.gameState.upgradesPurchased++;
            this.showNotification(`Bought ${upgrade.name}!`);
            this.checkAchievements();
        }
    }

    filterUpgrades(filter) {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        this.renderUpgrades();
    }

    formatNumber(num) {
        if (this.settings.numberFormat) {
            return parseFloat(num).toExponential(2);
        }

        num = parseFloat(num);
        if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
        return num.toFixed(0);
    }

    showSettings() {
        this.ui.settingsModal.classList.add('active');
    }

    showStats() {
        document.getElementById('statTotalClicks').textContent = this.formatNumber(this.gameState.totalClicks);
        document.getElementById('statTotalEarned').textContent = this.formatNumber(this.gameState.totalEarned);
        document.getElementById('statPlayTime').textContent = this.formatPlayTime(this.gameState.playTime);
        document.getElementById('statUpgradesPurchased').textContent = this.gameState.upgradesPurchased;
        document.getElementById('statAscensions').textContent = this.gameState.ascensions;
        document.getElementById('statMultiplier').textContent = this.gameState.ascensionMultiplier.toFixed(2) + 'x';
        this.ui.statsModal.classList.add('active');
    }

    showAchievements() {
        const container = document.getElementById('achievementsContainer');
        container.innerHTML = '';

        this.achievements.forEach(ach => {
            const div = document.createElement('div');
            div.className = 'achievement';
            if (ach.unlocked) div.classList.add('unlocked');

            div.innerHTML = `
                <div class="achievement-icon">${ach.icon}</div>
                <div class="achievement-name">${ach.name}</div>
                <div class="achievement-desc">${ach.desc}</div>
            `;

            container.appendChild(div);
        });

        this.ui.achievementsModal.classList.add('active');
    }

    claimDailyReward() {
        const now = Date.now();
        const lastReward = this.gameState.lastDailyReward;
        const dayInMs = 24 * 60 * 60 * 1000;

        if (now - lastReward >= dayInMs) {
            const reward = this.gameState.totalEarned * 0.1 + 100;
            this.gameState.totalOrbs += reward;
            this.gameState.lastDailyReward = now;
            this.showNotification(`Daily reward: +${this.formatNumber(reward)}!`);
        } else {
            this.showNotification('Daily reward available in 24 hours!', true);
        }
    }

    showAscensionDialog() {
        const multiplierGain = 1 + (this.gameState.level * 0.05);
        if (confirm(`Ascend and gain ${multiplierGain.toFixed(2)}x multiplier? (Resets progress)`)) {
            this.ascend(multiplierGain);
        }
    }

    ascend(multiplier) {
        this.gameState.ascensionMultiplier *= multiplier;
        this.gameState.ascensions++;
        this.gameState.totalOrbs = 0;
        this.gameState.level = 1;
        this.gameState.totalEarned = 0;
        this.upgrades.forEach(u => u.owned = 0);
        this.showNotification(`Ascended! New multiplier: ${this.gameState.ascensionMultiplier.toFixed(2)}x`);
        this.checkAchievements();
    }

    checkAchievements() {
        this.achievements.forEach(ach => {
            if (!ach.unlocked) {
                let shouldUnlock = false;

                if (ach.id === 1 && this.gameState.totalClicks > 0) shouldUnlock = true;
                if (ach.id === 4 && this.gameState.upgradesPurchased > 0) shouldUnlock = true;
                if (ach.id === 12 && this.gameState.ascensions > 0) shouldUnlock = true;
                if (ach.condition && ach.condition()) shouldUnlock = true;

                if (shouldUnlock) {
                    ach.unlocked = true;
                    this.showNotification(`🏆 Achievement Unlocked: ${ach.name}`);
                }
            }
        });
    }

    showNotification(message, isError = false) {
        this.ui.notification.textContent = message;
        this.ui.notification.classList.add('show');
        if (isError) this.ui.notification.classList.add('error');

        setTimeout(() => {
            this.ui.notification.classList.remove('show', 'error');
        }, 3000);
    }

    formatPlayTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }

    saveGame() {
        const saveData = {
            gameState: this.gameState,
            upgrades: this.upgrades,
            achievements: this.achievements,
            settings: this.settings,
        };
        localStorage.setItem('energyOrbGameSave', JSON.stringify(saveData));
        this.showNotification('Game saved successfully!');
    }

    loadGame() {
        const saveData = localStorage.getItem('energyOrbGameSave');
        if (saveData) {
            const data = JSON.parse(saveData);
            Object.assign(this.gameState, data.gameState);
            Object.assign(this.settings, data.settings);
            this.upgrades = data.upgrades;
            this.achievements = data.achievements;
        }
        this.updateUI();
    }

    resetGame() {
        if (confirm('Are you sure? This will reset all progress (except Ascension bonuses).')) {
            this.gameState.totalOrbs = 0;
            this.gameState.level = 1;
            this.gameState.totalClicks = 0;
            this.gameState.totalEarned = 0;
            this.gameState.playTime = 0;
            this.gameState.upgradesPurchased = 0;
            this.upgrades.forEach(u => u.owned = 0);
            this.achievements.forEach(a => {
                if (a.id !== 12) a.unlocked = false;
            });
            this.saveGame();
            this.updateUI();
            this.showNotification('Game reset!');
        }
    }

    startGameLoop() {
        let lastUpdate = Date.now();

        const update = () => {
            const now = Date.now();
            const deltaTime = (now - lastUpdate) / 1000;
            lastUpdate = now;

            this.gameState.playTime += deltaTime;
            this.gameState.totalOrbs += this.gameState.orbsPerSecond * deltaTime;
            this.gameState.totalEarned += this.gameState.orbsPerSecond * deltaTime;

            this.updateUI();

            // Auto-save
            if (now - this.gameState.lastAutoSave >= this.settings.autosaveInterval) {
                this.saveGame();
                this.gameState.lastAutoSave = now;
            }

            requestAnimationFrame(update);
        };

        requestAnimationFrame(update);
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new EnergyOrbGame();
});
