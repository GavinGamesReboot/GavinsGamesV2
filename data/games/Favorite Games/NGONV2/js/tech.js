const tech = {
    totalCount: null,
    removeCount: 0,
    setupAllTech() {
        for (let i = 0, len = tech.tech.length; i < len; i++) {
            tech.tech[i].isLost = false
            tech.tech[i].isBanished = false
            tech.tech[i].remove();
            tech.tech[i].count = 0
            if (tech.tech[i].isJunk) {
                tech.tech[i].frequency = 0
            } else if (tech.tech[i].frequencyDefault) {
                tech.tech[i].frequency = tech.tech[i].frequencyDefault
            } else {
                tech.tech[i].frequency = 2
            }
            if (tech.tech[i].name === "heals" || tech.tech[i].name === "ammo" || tech.tech[i].name === "research") tech.tech[i].value = tech.tech[i].defaultValue
        }
        //remove lore if it's your first time playing since it's confusing
        //also remove lore if cheating
        tech.removeCount = 0;
        tech.pauseEjectTech = 1; //used in paradigm shift
        lore.techCount = 0;
        if (simulation.isCheating || localSettings.runCount < 1) { //simulation.isCommunityMaps ||
            for (let i = 0, len = tech.tech.length; i < len; i++) {
                if (tech.tech[i].isLore) {
                    tech.tech[i].frequency = 0;
                    tech.tech[i].count = 0;
                }
            }
        }

        tech.damage = 1
        tech.junkChance = 0;
        tech.extraMaxHealth = 0;
        tech.totalCount = 0;
        simulation.updateTechHUD();
        simulation.updateGunHUD();
    },
    removeTech(index = 'random') {
        if (index === 'random') {
            const have = [] //find which tech you have
            for (let i = 0; i < tech.tech.length; i++) {
                if (tech.tech[i].count > 0 && !tech.tech[i].isInstant) have.push(i)
            }
            if (have.length) {
                index = have[Math.floor(Math.random() * have.length)]
            } else {
                return 0 //if none found don't remove any tech
            }
        } else if (isNaN(index)) { //find index by name
            let found = false;
            for (let i = 0; i < tech.tech.length; i++) {
                if (index === tech.tech[i].name) {
                    index = i;
                    found = true;
                    break;
                }
            }
            if (!found) return 0 //if name not found don't remove any tech
        }
        if (tech.tech[index].count === 0) return 0
        const totalRemoved = tech.tech[index].count
        simulation.makeTextLog(`<span class='color-var'>tech</span>.removeTech("<span class='color-text'>${tech.tech[index].name}</span>")`, 360)
        tech.tech[index].remove();
        tech.removeCount += totalRemoved
        tech.tech[index].count = 0;
        tech.totalCount -= totalRemoved
        simulation.updateTechHUD();
        tech.tech[index].isLost = true
        simulation.updateTechHUD();
        return totalRemoved //return the total number of tech removed
    },
    junkChance: 0,
    addJunkTechToPool(percent) { //percent is number between 0-1
        simulation.makeTextLog(`<strong>+${(100 * percent).toFixed(0)}%</strong> <span class='color-text'>JUNK</span><span class='color-var'>tech</span> chance (${(100 * tech.junkChance).toFixed(0)} total chance)`)
        // tech.junkChance += (1 - tech.junkChance) * percent
        tech.junkChance += percent
        if (tech.junkChance < 0.001 || tech.junkChance === undefined) tech.junkChance = 0
        if (tech.junkChance > 1) tech.junkChance = 1
        return percent

        //make an array for possible junk tech to add
        // let options = [];
        // for (let i = 0; i < tech.tech.length; i++) {
        //     if (tech.tech[i].count < tech.tech[i].maxCount && tech.tech[i].isJunk) options.push(i);
        // }
        // if (options.length) {
        //     let countNonJunk = 0 // count total non junk tech
        //     for (let i = 0, len = tech.tech.length; i < len; i++) {
        //         if (tech.tech[i].count < tech.tech[i].maxCount && tech.tech[i].allowed() && !tech.tech[i].isJunk) countNonJunk += tech.tech[i].frequency
        //     }
        //     const num = Math.ceil(percent * countNonJunk) //scale number added
        //     for (let i = 0; i < num; i++) tech.tech[options[Math.floor(Math.random() * options.length)]].frequency++ //add random array options to tech pool
        //     simulation.makeTextLog(`<span class='color-var'>tech</span>.tech.push(${num.toFixed(0)} <span class='color-text'>JUNK</span>)`)
        //     return num
        // } else {
        //     return 0
        // }
    },
    removeJunkTechFromPool(percent) {
        // for (let j = 0; j < num; j++) {
        //     for (let i = 0; i < tech.tech.length; i++) {
        //         if (tech.tech[i].isJunk && tech.tech[i].frequency > 0 && tech.tech[i].count < tech.tech[i].maxCount) {
        //             tech.tech[i].frequency--
        //             break
        //         }
        //     }
        // }

        // if (percent > 0) {
        //     tech.junkChance = (tech.junkChance - percent) / (1 - percent)
        //     if (tech.junkChance < 0.001 || tech.junkChance === undefined) tech.junkChance = 0
        // }
        tech.junkChance -= percent
        if (tech.junkChance < 0.001 || tech.junkChance === undefined) tech.junkChance = 0
        if (tech.junkChance > 1) tech.junkChance = 1
    },
    giveTech(index = 'random') {
        if (index === 'random') {
            let options = [];
            for (let i = 0; i < tech.tech.length; i++) {
                if (tech.tech[i].count < tech.tech[i].maxCount && tech.tech[i].allowed() && !tech.tech[i].isJunk && !tech.tech[i].isLore && !tech.tech[i].isBadRandomOption) options.push(i);
            }
            // give a random tech from the tech I don't have
            if (options.length > 0) {
                let newTech = options[Math.floor(Math.random() * options.length)]
                simulation.makeTextLog(`<span class='color-var'>tech</span>.giveTech("<strong class='color-text'>${tech.tech[newTech].name}</strong>")<em> //random tech</em>`);
                tech.giveTech(newTech)
            }
        } else {
            if (isNaN(index)) { //find index by name
                let found = false;
                for (let i = 0; i < tech.tech.length; i++) {
                    if (index === tech.tech[i].name) {
                        index = i;
                        found = true;
                        break;
                    }
                }
                if (!found) return //if name not found don't give any tech
            }
            if (tech.isMetaAnalysis && tech.tech[index].isJunk) {
                simulation.makeTextLog(`//tech: meta-analysis replaced junk tech with random tech`);
                tech.giveTech('random')
                for (let i = 0; i < 2; i++) powerUps.spawn(m.pos.x + 40 * Math.random(), m.pos.y + 40 * Math.random(), "research");
                return
            }

            if (tech.tech[index].isLost) tech.tech[index].isLost = false; //give specific tech
            if (tech.isBanish && tech.tech[index].isBanished) tech.tech[index].isBanished = false //stops the bug where you can't gets stacks of tech you take with decoherence, I think
            tech.tech[index].effect(); //give specific tech
            tech.tech[index].count++
            tech.totalCount++ //used in power up randomization
            requestAnimationFrame(() => {
                //move new tech to the top of the tech list
                if (index > 0 && !build.isExperimentSelection) {
                    const [item] = tech.tech.splice(index, 1); // Remove the element from the array
                    tech.tech.unshift(item); // Add the element to the front of the array
                }
                simulation.updateTechHUD();
            })
        }
    },
    setCheating() {
        if (!simulation.isCheating) {
            simulation.isCheating = true;
            level.levelAnnounce();
            lore.techCount = 0;
            for (let i = 0, len = tech.tech.length; i < len; i++) {
                if (tech.tech[i].isLore) {
                    tech.tech[i].frequency = 0;
                    tech.tech[i].count = 0;
                }
            }
            console.log('cheating')
            sound.tone(250)
            sound.tone(300)
            sound.tone(375)
        }
    },
    haveGunCheck(name, needActive = true) {
        // if (
        //     !build.isExperimentSelection &&
        //     b.inventory.length > 2 &&
        //     name !== b.guns[b.activeGun].name &&
        //     Math.random() > 2 - b.inventory.length * 0.5
        // ) {
        //     return false
        // }
        // for (i = 0, len = b.inventory.length; i < len; i++) {
        //     if (b.guns[b.inventory[i]].name === name) return true
        // }
        // return false
        if (build.isExperimentSelection || !needActive) {
            for (i = 0, len = b.inventory.length; i < len; i++) {
                if (b.guns[b.inventory[i]].name === name) return true
            }
            return false
        } else { //must be holding gun, this is the standard while playing
            return b.inventory.length > 0 && b.guns[b.activeGun].name === name
        }
    },
    hasExplosiveDamageCheck() {
        return tech.haveGunCheck("missiles") || (m.fieldMode === 4 && simulation.molecularMode === 1) || tech.missileBotCount > 0 || tech.isBoomBotUpgrade || tech.isIncendiary || tech.isPulseLaser || tech.isTokamak || (tech.haveGunCheck("grenades") && !tech.isNeutronBomb)
    },
    damage: 1, //used for tech changes to player damage that don't have complex conditions
    damageFromTech() {
        let dmg = tech.damage * m.fieldDamage
        if (tech.isMaxHealthDamage && m.health === m.maxHealth) dmg *= 1.5
        if (tech.isNoDefenseDamage && m.defense() === 1) dmg *= 2
        if (tech.isImmunityDamage && m.immuneCycle > m.cycle) dmg *= 4
        if (tech.isPowerUpDamage) dmg *= 1 + 0.05 * powerUp.length
        if (tech.isDamageCooldown) dmg *= m.lastKillCycle + tech.isDamageCooldownTime > m.cycle ? 0.5 : 4
        if (tech.isDamageAfterKillNoRegen && m.lastKillCycle + 300 > m.cycle) dmg *= 2
        if (tech.isDivisor && b.activeGun !== undefined && b.activeGun !== null && b.guns[b.activeGun].ammo % 3 === 0) dmg *= 1.8
        if (tech.isNoGroundDamage) dmg *= m.onGround ? 0.9 : 2
        if (tech.isDilate) dmg *= 1.9 + 1.1 * Math.sin(m.cycle * 0.01)
        if (tech.isGunChoice && tech.buffedGun === b.inventoryGun) dmg *= 1 + 0.3 * b.inventory.length
        if (powerUps.boost.endCycle > m.cycle) dmg *= 1 + powerUps.boost.damage
        if (m.coupling && (m.fieldMode === 0 || m.fieldMode === 5)) dmg *= 1 + 0.015 * m.coupling
        if (tech.deathSkipTime) dmg *= 1 + 0.6 * tech.deathSkipTime
        if (tech.isTechDebt) dmg *= tech.totalCount > 20 ? Math.pow(0.85, tech.totalCount - 20) : 4 - 0.15 * tech.totalCount
        if (tech.isAnthropicDamage && tech.isDeathAvoidedThisLevel) dmg *= 2.71828
        if (tech.isDupDamage) dmg *= 1 + Math.min(1, tech.duplicationChance())
        if (tech.isDamageForGuns) dmg *= 1 + 0.22 * Math.max(0, b.inventory.length - 1)
        if (tech.isOneGun && b.inventory.length < 2) dmg *= 1.3
        if (tech.isAcidDmg && m.health > 1) dmg *= 1.35;
        if (tech.isRerollDamage) dmg *= 1 + Math.max(0, 0.05 * powerUps.research.count)
        if (tech.isBotDamage) dmg *= 1 + 0.04 * b.totalBots()
        if (tech.restDamage > 1 && player.speed < 1) dmg *= tech.restDamage
        if (tech.isLowEnergyDamage) dmg *= 1 + 0.5 * Math.max(0, m.maxEnergy - m.energy)
        if (tech.energyDamage) dmg *= 1 + m.energy * 0.23 * tech.energyDamage;
        if (tech.isDamageFromBulletCount) dmg *= 1 + bullet.length * 0.01
        if (tech.isNoFireDamage && m.cycle > m.fireCDcycle + 120) dmg *= 2
        if (tech.isSpeedDamage) dmg *= 1 + Math.min(1, (tech.speedAdded + player.speed) * 0.0193)
        if (tech.isAxion && tech.isHarmDarkMatter) dmg *= ((tech.isMoveDarkMatter || tech.isNotDarkMatter) ? 3.2 : 2)
        if (tech.isHarmDamage && m.lastHarmCycle + 480 > m.cycle) dmg *= 3;
        if (tech.lastHitDamage && m.lastHit) dmg *= 1 + tech.lastHitDamage * m.lastHit
        // if (tech.isLowHealthDmg) dmg *= 1 + 0.6 * Math.max(0, 1 - (tech.isEnergyHealth ? m.energy : m.health))
        if (tech.isLowHealthDmg) dmg *= 1 + 0.6 * Math.max(0, (tech.isEnergyHealth ? m.maxEnergy - m.energy : m.maxHealth - m.health))
        if (tech.isJunkDNA) dmg *= 1 + 2 * tech.junkChance
        return dmg
    },
    duplicationChance() {
        return Math.min(1, Math.max(0, (tech.isPowerUpsVanish ? 0.13 : 0) + (tech.isStimulatedEmission ? 0.2 : 0) + tech.duplication + tech.duplicateChance + 0.05 * tech.isExtraGunField + m.duplicateChance + tech.fieldDuplicate + 0.08 * tech.isDuplicateMobs + 0.03 * tech.isMassProduction + 0.04 * tech.isHealAttract + tech.cloakDuplication + (tech.isAnthropicTech && tech.isDeathAvoidedThisLevel ? 0.6 : 0) + 0.06 * tech.isDupEnergy))
    },
    setTechFrequency(name, frequency) {
        for (let i = 0, len = tech.tech.length; i < len; i++) {
            if (tech.tech[i].name === name) tech.tech[i].frequency = frequency
        }
    },
    setBotTechFrequency(f = 0) {
        for (let i = 0, len = tech.tech.length; i < len; i++) {
            if (tech.tech[i].isBotTech) {
                switch (tech.tech[i].name) {
                    case "dynamo-bot":
                        tech.tech[i].frequency = f
                        break;
                    case "orbital-bot":
                        tech.tech[i].frequency = f
                        break;
                    case "laser-bot":
                        tech.tech[i].frequency = f
                        break;
                    case "boom-bot":
                        tech.tech[i].frequency = f
                        break;
                    case "foam-bot":
                        tech.tech[i].frequency = f
                        break;
                    case "nail-bot":
                        tech.tech[i].frequency = f
                        break;
                }
            }
        }
    },
    tech: [{
        name: "tungsten carbide",
        description: "<strong>+400</strong> maximum <strong class='color-h'>health</strong><br><strong>lose</strong> <strong class='color-h'>health</strong> after hard <strong>landings</strong>",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isSkin: true,
        allowed() {
            return !m.isAltSkin
        },
        requires: "not skin",
        effect() {
            tech.isFallingDamage = true;
            m.setMaxHealth();
            m.addHealth(3 / simulation.healScale)
            m.skin.tungsten()
        },
        remove() {
            tech.isFallingDamage = false;
            m.setMaxHealth();
            if (this.count) m.resetSkin();
        }
    },
    {
        name: "nitinol",
        description: "<strong>1.3x</strong> <strong>movement</strong> and <strong>jumping</strong><br><strong>0.17</strong> seconds of <strong>coyote time</strong>",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isSkin: true,
        allowed() {
            return !m.isAltSkin
        },
        requires: "not skinned",
        effect() {
            m.skin.mech();
            m.setMovement()
        },
        remove() {
            if (this.count) m.resetSkin();
        }
    },
    {
        name: "Higgs mechanism",
        description: "<strong>4x</strong> <em>fire rate</em><br>while <strong>firing</strong> your <strong>position</strong> is fixed",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isSkin: true,
        allowed() {
            return !m.isAltSkin && !m.isShipMode && !tech.isAlwaysFire
        },
        requires: "not skinned, ship mode, automatic",
        effect() {
            tech.isFireMoveLock = true;
            b.setFireCD();
            b.setFireMethod();
            m.skin.strokeGap();
        },
        remove() {
            tech.isFireMoveLock = false
            if (tech.isFireMoveLock) {
                b.setFireCD();
                b.setFireMethod();
                if (this.count) m.resetSkin();
            }
        }
    },
    {
        name: "Hilbert space",
        description: "<strong>4x</strong> <strong class='color-d'>damage</strong><br>after a <strong>collision</strong> enter an <strong class='alt'>alternate reality</strong>",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isAltRealityTech: true,
        isSkin: true,
        allowed() {
            return !m.isAltSkin && !tech.isResearchReality && !tech.isSwitchReality
        },
        requires: "not skinned, Ψ(t) collapse, many-worlds",
        damage: 4,
        effect() {
            m.skin.anodize();
            tech.damage *= this.damage
            tech.isCollisionRealitySwitch = true;
        },
        remove() {
            tech.isCollisionRealitySwitch = false;
            if (this.count && m.alive) {
                tech.damage /= this.damage
                m.resetSkin();
            }
        }
    },
    {
        name: "aperture",
        description: "every <strong>4</strong> seconds your <strong class='color-d'>damage</strong> cycles<br>between <strong>0.8x</strong> and <strong>3x</strong> <strong class='color-d'>damage</strong>",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isSkin: true,
        allowed() {
            return !m.isAltSkin
        },
        requires: "not skinned",
        effect() {
            tech.isDilate = true
            m.skin.dilate()
        },
        remove() {
            tech.isDilate = false
            if (this.count) m.resetSkin();
        }
    },
    {
        name: "diaphragm",
        description: "every <strong>4</strong> seconds your <strong class='color-defense'>damage taken</strong> cycles<br>between <strong>0.9x</strong> and <strong>0.2x</strong> <strong class='color-defense'>damage taken</strong>",
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        isSkin: true,
        allowed() {
            return tech.isDilate
        },
        requires: "aperture",
        effect() {
            tech.isDiaphragm = true
            m.resetSkin();
            m.skin.dilate2()
        },
        remove() {
            tech.isDiaphragm = false
            if (this.count) m.resetSkin();
        }
    },
    {
        name: "mass-energy equivalence",
        description: `<strong class='color-f'>energy</strong> protects you instead of <strong class='color-h'>health</strong>`,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isSkin: true,
        allowed() {
            return !m.isAltSkin && !tech.isPiezo && !tech.isRewindAvoidDeath && !tech.isAnnihilation //&& !tech.isAmmoFromHealth && !tech.isRewindGun
        },
        requires: "not piezoelectricity, CPT, annihilation",
        effect() {
            m.health = 0
            document.getElementById("health").style.display = "none"
            document.getElementById("health-bg").style.display = "none"
            document.getElementById("dmg").style.backgroundColor = "#0cf";
            tech.isEnergyHealth = true;
            simulation.mobDmgColor = "rgba(0, 255, 255,0.6)" //"#0cf"
            m.displayHealth();
            m.lastCalculatedDefense = 0 //this triggers a redraw of the defense bar
            m.skin.energy();
        },
        remove() {
            if (this.count > 0) {
                tech.isEnergyHealth = false;
                document.getElementById("health").style.display = "inline"
                document.getElementById("health-bg").style.display = "inline"
                document.getElementById("dmg").style.backgroundColor = "#f67";
                m.health = Math.max(Math.min(m.maxHealth, m.energy), 0.1);
                simulation.mobDmgColor = "rgba(255,0,0,0.7)"
                m.displayHealth();
                m.lastCalculatedDefense = 0 //this triggers a redraw of the defense bar
                m.resetSkin();
            }
            tech.isEnergyHealth = false;
        }
    },
    {
        name: "1st ionization energy",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Ionization_energy' class="link">1st ionization energy</a>`,
        descriptionFunction() {
            return `convert current and future <div class="heal-circle"></div> into <div class="heal-circle" style="background-color: #ff0; border: 0.5px #000 solid;"></div><br><div class="heal-circle" style="background-color: #ff0; border: 0.5px #000 solid;"></div> give <strong>+${14 * tech.largerHeals * (tech.isHalfHeals ? 0.5 : 1)}</strong> maximum <strong class='color-f'>energy</strong>`
        },
        maxCount: 1,
        count: 0,
        frequency: 5,
        frequencyDefault: 5,
        allowed() {
            return tech.isEnergyHealth && !tech.isOverHeal
        },
        requires: "mass-energy equivalence, not quenching",
        effect() {
            powerUps.healGiveMaxEnergy = true; //tech.healMaxEnergyBonus given from heal power up
            powerUps.heal.color = "#ff0" //"#0ae"
            for (let i = 0; i < powerUp.length; i++) { //find active heal power ups and adjust color live
                if (powerUp[i].name === "heal") powerUp[i].color = powerUps.heal.color
            }
        },
        remove() {
            powerUps.healGiveMaxEnergy = false;
            // tech.healMaxEnergyBonus = 0
            powerUps.heal.color = "#0eb"
            for (let i = 0; i < powerUp.length; i++) { //find active heal power ups and adjust color live
                if (powerUp[i].name === "heal") powerUp[i].color = powerUps.heal.color
            }
        }
    },
    {
        name: "depolarization",
        descriptionFunction() {
            return `<strong>4x</strong> <strong class='color-d'>damage</strong>, but if a mob <strong>dies</strong><br><strong>0.5x</strong> <strong class='color-d'>damage</strong> for <strong>${(tech.isDamageCooldownTime / 60).toFixed(1)}</strong> seconds instead`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isSkin: true,
        allowed() {
            return !m.isAltSkin
        },
        requires: "not skinned",
        effect() {
            m.skin.polar();
            tech.isDamageCooldown = true;
        },
        remove() {
            tech.isDamageCooldown = false;
            if (this.count) m.resetSkin();
        }
    },
    {
        name: "repolarization",
        descriptionFunction() {
            return `the <strong class= 'color-d'> damage</strong> from <strong> depolarization</strong> <br>resets <strong>1.25</strong> seconds sooner after a mob <strong>dies</strong>`
        },
        maxCount: 3,
        count: 0,
        frequency: 4,
        frequencyDefault: 4,
        allowed() {
            return tech.isDamageCooldown
        },
        requires: "depolarization",
        effect() {
            tech.isDamageCooldownTime -= 75
        },
        remove() {
            tech.isDamageCooldownTime = 240
        }
    },
    {
        name: "CPT symmetry",
        descriptionFunction() {
            return `after losing <strong class='color-h'>health</strong>, if you have above <strong>${(85 * Math.min(100, m.maxEnergy)).toFixed(0)}</strong> <strong class='color-f'>energy</strong><br><strong>rewind</strong> time for <strong>20</strong> <strong class='color-f'>energy</strong> per second`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isSkin: true,
        allowed() {
            return !m.isAltSkin && m.fieldUpgrades[m.fieldMode].name !== "standing wave" && !tech.isRewindField && !tech.isEnergyHealth
        },
        requires: "not skinned, standing wave, max energy reduction, retrocausality, mass-energy",
        effect() {
            tech.isRewindAvoidDeath = true;
            m.skin.CPT()
        },
        remove() {
            tech.isRewindAvoidDeath = false;
            if (this.count) m.resetSkin();
        }
    },
    {
        name: "causality bots",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Causality' class="link">causality bots</a>`,
        description: "when you <strong class='color-rewind'>rewind</strong> build scrap <strong class='color-bot'>bots</strong><br>that protect you for about <strong>9</strong> seconds",
        maxCount: 3,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        isBotTech: true,
        allowed() {
            return tech.isRewindAvoidDeath || tech.isRewindField
        },
        requires: "CPT, retrocausality",
        effect() {
            tech.isRewindBot++;
        },
        remove() {
            tech.isRewindBot = 0;
        }
    },
    {
        name: "causality bombs",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Causality' class="link">causality bombs</a>`,
        description: "when you <strong class='color-rewind'>rewind</strong> drop several <strong>grenades</strong>", //<br>become <strong>invulnerable</strong> until they <strong class='color-e'>explode</strong>
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.isRewindAvoidDeath || tech.isRewindField
        },
        requires: "CPT, retrocausality",
        effect() {
            tech.isRewindGrenade = true;
        },
        remove() {
            tech.isRewindGrenade = false;
        }
    },
    {
        name: "ternary", //"divisor",
        descriptionFunction() {
            return `<strong>1.8x</strong> <strong class='color-d'>damage</strong> while your current <strong class='color-g'>gun</strong><br>has <strong class='color-ammo'>ammo</strong> divisible by <strong>3</strong>`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed: () => true,
        requires: "",
        // divisible: 3, // + Math.floor(6 * Math.random()),
        effect() {
            tech.isDivisor = true;
        },
        remove() {
            tech.isDivisor = false;
        }
    },
    {
        name: "integrated armament",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Weapon' class="link">integrated armament</a>`,
        description: `<span style='font-size:95%;'><strong>1.3x</strong> <strong class='color-d'>damage</strong>, but new <strong class='color-g'>guns</strong> replace<br>your current <strong class='color-g'>gun</strong> and convert <strong class='color-g'>gun</strong><strong class='color-m'>tech</strong></span>`,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return b.inventory.length === 1
        },
        requires: "only 1 gun",
        effect() {
            tech.isOneGun = true;
        },
        remove() {
            tech.isOneGun = false;
        }
    },
    {
        name: "ordnance",
        description: "spawn a <strong class='color-g'>gun</strong>, gain <strong>2x</strong> <strong class='color-g'>gun</strong><strong class='color-m'>tech</strong> <em class='flicker'>frequency</em><br><strong>+6%</strong> <strong class='color-junk'>JUNK</strong><strong class='color-m'>tech</strong> chance",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isInstant: true,
        isBadRandomOption: true,
        allowed: () => tech.junkChance < 1,
        requires: "",
        effect() {
            powerUps.spawn(m.pos.x, m.pos.y, "gun");
            for (let i = 0, len = tech.tech.length; i < len; i++) {
                if (tech.tech[i].isGunTech) tech.tech[i].frequency *= 2
            }
            this.refundAmount += tech.addJunkTechToPool(0.06)
        },
        refundAmount: 0,
        remove() {
            if (this.count > 0 && this.refundAmount > 0) {
                tech.removeJunkTechFromPool(this.refundAmount)
                this.refundAmount = 0
            }
        }
    },
    {
        name: "arsenal",
        descriptionFunction() {
            return `<strong>1.25x</strong> <strong class='color-d'>damage</strong> per unequipped <strong class='color-g'>gun</strong><br><em style ="float: right;">(${(1 + 0.25 * Math.max(0, b.inventory.length - 1)).toFixed(2)}x)</em>`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed: () => b.inventory.length > 1,
        requires: "at least 2 guns",
        effect() {
            tech.isDamageForGuns = true;
        },
        remove() {
            tech.isDamageForGuns = false;
        }
    },
    {
        name: "active cooling",
        descriptionFunction() {
            return `<strong>1.25x</strong> <em>fire rate</em> per unequipped <strong class='color-g'>gun</strong><br><em style ="float: right;">(${(1 / Math.pow(0.8, Math.max(0, b.inventory.length - 1))).toFixed(2)}x)</em>`
        }, //<br>but not including your equipped <strong class='color-g'>gun</strong>` },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed: () => b.inventory.length > 1,
        requires: "at least 2 guns",
        effect() {
            tech.isFireRateForGuns = true;
            b.setFireCD();
        },
        remove() {
            tech.isFireRateForGuns = false;
            b.setFireCD();
        }
    },
    {
        name: "pigeonhole principle",
        descriptionFunction() {
            let info = ""
            if (this.count > 0 && Number.isInteger(tech.buffedGun) && b.inventory.length) {
                let gun = b.guns[b.inventory[tech.buffedGun]].name
                info = `<br>this level: <strong>${(1.3 * Math.max(0, b.inventory.length)).toFixed(2)}x</strong> <strong class='color-d'>damage</strong> for <strong class="highlight">${gun}</strong>`
            }
            return `a new <strong class='color-g'>gun</strong> is <strong>chosen</strong> to be improved each <strong>level</strong><br><strong>1.3x</strong> <strong class='color-d'>damage</strong> per <strong class='color-g'>gun</strong> for the <strong>chosen</strong> <strong class='color-g'>gun</strong>${info}`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return b.inventory.length > 1
        },
        requires: "at least 2 guns",
        effect() {
            tech.isGunChoice = true
            //switches gun on new level
            //generalist uses the same chosen gun so they match
        },
        remove() {
            tech.isGunChoice = false;
        }
    },
    {
        name: "generalist",
        description: "spawn <strong>7</strong> <strong class='color-g'>guns</strong>, but you can't <strong>switch</strong> <strong class='color-g'>guns</strong><br>your equipped <strong class='color-g'>gun</strong> cycles after each level",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isInstant: true,
        isBadRandomOption: true,
        allowed() {
            return b.inventory.length < b.guns.length - 5 && b.inventory.length > 1
        },
        requires: "at least 2 guns, at least 5 unclaimed guns",
        effect() {
            tech.isGunCycle = true;
            for (let i = 0; i < 7; i++) powerUps.spawn(m.pos.x + 10 * Math.random(), m.pos.y + 10 * Math.random(), "gun");
        },
        remove() {
            tech.isGunCycle = false; // only set to false if you don't have this tech
        }
    },
    {
        name: "ad hoc",
        descriptionFunction() {
            return `spawn a ${powerUps.orb.heal()}, ${powerUps.orb.research(1)}, ${powerUps.orb.ammo(1)}, <strong class='color-f'>field</strong>, <strong class='color-g'>gun</strong>, or <strong class='color-m'>tech</strong><br>for each of your <strong class='color-g'>guns</strong>`
        },
        maxCount: 1, //random power up
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isInstant: true,
        allowed() {
            return b.inventory.length > 1
        },
        requires: "at least 2 guns",
        effect() {
            for (let i = 0; i < b.inventory.length; i++) {
                if (Math.random() < 1 / 6) {
                    powerUps.spawn(m.pos.x + 10 * Math.random(), m.pos.y + 10 * Math.random(), "gun");
                } else if (Math.random() < 1 / 5) {
                    powerUps.spawn(m.pos.x + 10 * Math.random(), m.pos.y + 10 * Math.random(), "tech");
                } else if (Math.random() < 1 / 4) {
                    powerUps.spawn(m.pos.x + 10 * Math.random(), m.pos.y + 10 * Math.random(), "field");
                } else if (Math.random() < 1 / 3) {
                    powerUps.spawn(m.pos.x + 10 * Math.random(), m.pos.y + 10 * Math.random(), "heal");
                } else if (Math.random() < 1 / 2) {
                    powerUps.spawn(m.pos.x + 10 * Math.random(), m.pos.y + 10 * Math.random(), "ammo");
                } else {
                    powerUps.spawn(m.pos.x + 10 * Math.random(), m.pos.y + 10 * Math.random(), "research");
                }
            }
        },
        remove() { }
    },
    {
        name: "applied science",
        description: `get a random <strong class='color-g'>gun</strong><strong class='color-m'>tech</strong><br>for each of your <strong class='color-g'>guns</strong>`, //spawn ${powerUps.orb.research(1)} and
        maxCount: 1,
        count: 0,
        isInstant: true,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return b.inventory.length > 1
        },
        requires: "at least 2 guns",
        effect() {
            for (let i = b.inventory.length - 1; i > -1; i--) { //backwards because some tech can remove or add guns
                const gunTechPool = [] //find gun tech for this gun
                for (let j = 0, len = tech.tech.length; j < len; j++) {
                    // console.log(j, tech.tech[j].isGunTech, tech.tech[j].allowed(), !tech.tech[j].isJunk, !tech.tech[j].isBadRandomOption, tech.tech[j].count < tech.tech[j].maxCount)
                    const originalActiveGunIndex = b.activeGun //set current gun to active so allowed works
                    b.activeGun = b.inventory[i] //to make the .allowed work for guns that aren't active
                    if (tech.tech[j].isGunTech && tech.tech[j].allowed() && !tech.tech[j].isJunk && !tech.tech[j].isBadRandomOption && tech.tech[j].count < tech.tech[j].maxCount) {
                        const regex = tech.tech[j].requires.search(b.guns[b.inventory[i]].name) //get string index of gun name
                        const not = tech.tech[j].requires.search(' not ') //get string index of ' not '
                        if (regex !== -1 && (not === -1 || not > regex)) gunTechPool.push(j) //look for the gun name in the requirements, but the gun name needs to show up before the word ' not '                        
                    }
                    b.activeGun = originalActiveGunIndex
                    if (!b.guns[b.activeGun].have) {
                        if (b.inventory.length === 0) {
                            b.activeGun = null
                        } else {
                            b.activeGun = b.inventory[0]
                        }
                        b.inventoryGun = 0;
                    }
                }
                if (gunTechPool.length) {
                    const index = Math.floor(Math.random() * gunTechPool.length)
                    // console.log(gunTechPool, index, gunTechPool[index], tech.tech[gunTechPool[index]].name)
                    simulation.makeTextLog(`<span class='color-var'>tech</span>.giveTech("<span class='color-text'>${tech.tech[gunTechPool[index]].name}</span>")`, 360)
                    // tech.tech[gunTechPool[index]].isInstant = true //makes it not remove properly under paradigm shift
                    tech.giveTech(gunTechPool[index]) // choose from the gun pool
                    // console.log(gunTechPool, index, gunTechPool[index], tech.tech[gunTechPool[index]].name)
                    // tech.tech[gunTechPool[index]].isFromAppliedScience = true //makes it not remove properly under paradigm shift
                }
            }
            simulation.boldActiveGunHUD();
        },
        remove() { }
    },
    {
        name: "supply chain",
        descriptionFunction() {
            return `spawn a <strong class='color-g'>gun</strong><br>spawn ${powerUps.orb.ammo(1)} that will <strong>2x</strong> your <strong class='color-g'>gun's</strong> <strong class='color-ammo'>ammo</strong>`
        },
        maxCount: 9,
        count: 0,
        isInstant: true,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            let ammoCount = 0 //count ammo
            if (b.activeGun && b.activeGun !== undefined && b.guns[b.activeGun].have && b.guns[b.activeGun].ammo !== Infinity) {
                ammoCount += b.guns[b.activeGun].ammo / b.guns[b.activeGun].ammoPack
            }
            powerUps.spawnDelay("ammo", Math.ceil(ammoCount))
            powerUps.spawn(m.pos.x, m.pos.y, "gun");
        },
        remove() { }
    },
    {
        name: "marginal utility",
        descriptionFunction() {
            if (this.count === 0) this.gun = Math.floor(Math.random() * (b.guns.length - 1)) //don't pick laser
            return `<strong>2x</strong> <strong class='color-ammo'>ammo</strong> per ${powerUps.orb.ammo(1)} for <strong class='color-g'>${b.guns[this.gun].name}</strong>`
        },
        maxCount: 9,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() { return true },
        requires: "",
        gun: undefined,
        effect() {
            if (this.gun === undefined) this.gun = Math.floor(Math.random() * (b.guns.length - 1)) //don't pick laser

            simulation.makeTextLog(`${b.guns[this.gun].ammoPack} → ${2 * b.guns[this.gun].ammoPack} average <strong class='color-ammo'>ammo</strong> per ${powerUps.orb.ammo(1)} for <strong class='color-g'>${b.guns[this.gun].name}</strong>`)
            b.guns[this.gun].ammoPack *= 2
            // simulation.makeTextLog(`${(tech.interestRate * 100).toFixed(0)}<span class='color-symbol'>%</span> <span class='color-m'>interest</span> on <span class='color-h'>health</span> <span class='color-symbol'>=</span> ${h > 20 ? h + powerUps.orb.heal(1) : powerUps.orb.heal(h)}`)

            // for (let i = 0; i < 4; i++) powerUps.spawn(m.pos.x + 10 * Math.random(), m.pos.y + 10 * Math.random(), "ammo");
        },
        remove() {
            if (this.count) {
                b.guns[this.gun].ammoPack /= 2
            }
        }
    },
    {
        name: "Pareto efficiency",
        descriptionFunction() {
            return `for each of your <strong class='color-g'>guns</strong><br>randomly get <strong>5x</strong> or <strong>0.2x</strong> <strong class='color-ammo'>ammo</strong> per ${powerUps.orb.ammo(1)}`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isBadRandomOption: true,
        allowed() {
            return b.inventory.length > 2
        },
        requires: "at least 3 guns",
        effect() {

            let options = []
            for (let i = 0; i < b.inventory.length; i++) options.push(b.inventory[i])
            options = shuffle(options)
            for (let i = 0; i < options.length; i++) {
                const index = options[i]
                const scale = (i < options.length / 2) ? 4 : 0.25
                simulation.makeTextLog(`${(b.guns[index].ammoPack).toFixed(1)} <span ${scale < 1 ? 'style="color: #f00;"' : ''}>→</span> ${(b.guns[index].ammoPack * scale).toFixed(1)} average <strong class='color-ammo'>ammo</strong> per ${powerUps.orb.ammo(1)} for <strong class='color-g'>${b.guns[index].name}</strong>`, Infinity)
                b.guns[index].ammoPack *= scale
            }
        },
        remove() { }
    },
    {
        name: "logistics",
        description: `<strong>2x</strong> <strong class='color-ammo'>ammo</strong> per ${powerUps.orb.ammo()}, but<br><strong class='color-ammo'>ammo</strong> is only added to your current <strong class='color-g'>gun</strong>`,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return !tech.isEnergyNoAmmo
        },
        requires: "not non-renewables",
        effect() {
            tech.isAmmoForGun = true;
        },
        remove() {
            tech.isAmmoForGun = false;
        }
    },
    {
        name: "cache",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Cache_(computing)' class="link">cache</a>`,
        description: `<strong>17x</strong> <strong class='color-ammo'>ammo</strong> per ${powerUps.orb.ammo()}, but<br>you can't <strong>store</strong> additional <strong class='color-ammo'>ammo</strong>`,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return !tech.isEnergyNoAmmo
        },
        requires: "not non-renewables",
        effect() {
            tech.ammoCap = 17;
            powerUps.ammo.effect()
        },
        remove() {
            tech.ammoCap = 0;
        }
    },
    {
        name: "catabolism",
        descriptionFunction() {
            return `if you fire while <strong>out</strong> of <strong class='color-ammo'>ammo</strong><br>spawn ${powerUps.orb.ammo(4)} and ${tech.isEnergyHealth ? "<strong>–4</strong> maximum <strong class='color-f'>energy</strong>" : "<strong>–2</strong> maximum <strong class='color-h'>health</strong>"}`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return !tech.isEnergyNoAmmo
        },
        requires: "not non-renewables",
        effect() {
            tech.isAmmoFromHealth = true;
        },
        remove() {
            tech.isAmmoFromHealth = false;
        }
    },
    {
        name: "non-renewables",
        description: `<strong>2x</strong> <strong class='color-d'>damage</strong><br>${powerUps.orb.ammo()} can't <strong>spawn</strong>`,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return !tech.isAmmoFromHealth && !tech.isBoostReplaceAmmo
        },
        requires: "not catabolism, quasiparticles",
        damage: 2,
        effect() {
            tech.damage *= this.damage
            tech.isEnergyNoAmmo = true;
        },
        remove() {
            if (this.count && m.alive) tech.damage /= this.damage
            tech.isEnergyNoAmmo = false;
        }
    },
    {
        name: "desublimated ammunition",
        description: `if <strong>crouching</strong><br>alternating shots use no <strong class='color-ammo'>ammo</strong>`,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed: () => true,
        requires: "",
        effect() {
            tech.crouchAmmoCount = true
        },
        remove() {
            tech.crouchAmmoCount = false;
        }
    },
    {
        name: "gun turret",
        description: "if <strong>crouching</strong><br><strong>0.3x</strong> <strong class='color-defense'>damage taken</strong>",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            tech.isTurret = true
        },
        remove() {
            tech.isTurret = false;
        }
    },
    {
        name: "dead reckoning",
        description: `if your <strong class="color-speed">speed</strong> is 0<br><strong>1.5x</strong> <strong class='color-d'>damage</strong>`,
        maxCount: 9,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            tech.restDamage += 0.5
        },
        remove() {
            tech.restDamage = 1;
        }
    },
    {
        name: "Newtons 1st law",
        descriptionFunction() {
            return `<strong class='color-defense'>damage taken</strong> is proportional to your <strong class="color-speed">speed</strong><br>up to <strong>0.2x</strong> <strong class='color-defense'>damage taken</strong> at <strong>55</strong> <strong class="color-speed">speed</strong> <em style ="float: right;">(${(1 - Math.min((tech.speedAdded + player.speed) * 0.0193, 0.8)).toFixed(2)}x)</em>`
        },
        description: "",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            tech.isSpeedHarm = true //max at speed = 40
        },
        remove() {
            tech.isSpeedHarm = false
        }
    },
    {
        name: "Newtons 2nd law",
        descriptionFunction() {
            return `<strong class='color-d'>damage</strong> is proportional to your <strong class="color-speed">speed</strong><br>up to <strong>2x</strong> <strong class='color-d'>damage</strong> at <strong>55</strong> <strong class="color-speed">speed</strong> <em style ="float: right;">(${(1 + Math.min(1, ((tech.speedAdded + player.speed) * 0.0193))).toFixed(2)}x)</em>`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            tech.isSpeedDamage = true //max at speed = 40
        },
        remove() {
            tech.isSpeedDamage = false
        }
    },
    {
        name: "modified Newtonian dynamics",
        descriptionFunction() {
            return `your <strong class="color-speed">speed</strong> counts as <strong>+20</strong> higher<br><em>(for Newton's 1st and 2nd laws)</em>`
        },
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.isSpeedDamage || tech.isSpeedHarm
        },
        requires: "Newtons 1st or 2nd law",
        effect() {
            tech.speedAdded = 20
        },
        remove() {
            tech.speedAdded = 0
        }
    },
    {
        name: "kinetic bombardment",
        description: "far away mobs take more <strong class='color-d'>damage</strong><br>up to <strong>1.3x</strong> <strong class='color-d'>damage</strong> at <strong>3000</strong> displacement",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            tech.isFarAwayDmg = true;
        },
        remove() {
            tech.isFarAwayDmg = false;
        }
    },

    {
        name: "microstates",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Microstate_(statistical_mechanics)' class="link">microstates</a>`,
        descriptionFunction() {
            return `use ${powerUps.orb.research(3)}<br><strong>1.01x</strong> <strong class='color-d'>damage</strong> per <strong>bullet</strong> or <strong>bot</strong>`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return powerUps.research.count > 2 || build.isExperimentSelection
        },
        requires: "",
        effect() {
            tech.isDamageFromBulletCount = true
            for (let i = 0; i < 3; i++) {
                if (powerUps.research.count > 0) powerUps.research.changeRerolls(-1)
            }
        },
        remove() {
            tech.isDamageFromBulletCount = false
            if (this.count > 0) {
                powerUps.research.changeRerolls(3)
            }
        }
    },
    {
        name: "regression",
        description: "bullet <strong>collisions</strong> increase <strong>vulnerability</strong> to<br><strong class='color-d'>damage</strong> by <strong>1.05x</strong> for mobs and <strong>+1.025x</strong> for bosses",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            tech.isLessDamageReduction = true
        },
        remove() {
            tech.isLessDamageReduction = false
        }
    },
    {
        name: "simulated annealing",
        description: "<strong>1.2x</strong> <strong class='color-d'>damage</strong><br><strong>0.8x</strong> <em>fire rate</em>",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return true
        },
        damage: 1.2,
        effect() {
            tech.damage *= this.damage
            tech.slowFire = 1.25
            b.setFireCD();
        },
        remove() {
            if (this.count && m.alive) tech.damage /= this.damage
            tech.slowFire = 1;
            b.setFireCD();
        }
    },
    {
        name: "heuristics",
        description: "<strong>1.3x</strong> <em>fire rate</em>",
        maxCount: 9,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            tech.fireRate *= 0.77
            b.setFireCD();
        },
        remove() {
            tech.fireRate = 1;
            b.setFireCD();
        }
    },
    {
        name: "mechatronics",
        descriptionFunction() {
            let damageTotal = 1
            for (let i = 0; i < this.damageSoFar.length; i++) damageTotal *= this.damageSoFar[i]
            let currentDamage = ""
            if (this.count) currentDamage = `<br><em style ="float: right;">(${(damageTotal).toFixed(2)}x)</em>`
            return `randomly gain between <strong>1x</strong> and <strong>1.3x</strong> <strong class='color-d'>damage</strong>` + currentDamage
        },
        maxCount: 9,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() { return true },
        requires: "",
        damage: 1.1,
        damageSoFar: [], //tracks the random damage upgrades so it can be removed and in descriptionFunction
        effect() {
            const damage = (Math.floor((Math.random() * 0.3 + 1) * 100)) / 100
            tech.damage *= damage
            this.damageSoFar.push(damage)
        },
        remove() {
            if (this.count && m.alive) for (let i = 0; i < this.damageSoFar.length; i++) tech.damage /= this.damageSoFar[i]
            this.damageSoFar.length = 0
        }
    },
    {
        name: "dynamical systems",
        description: `use ${powerUps.orb.research(2)}<br><strong>1.3x</strong> <strong class='color-d'>damage</strong>`,
        // isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return powerUps.research.count > 1 || build.isExperimentSelection
        },
        requires: "",
        // allowed() {
        //     return (m.fieldMode === 5 || m.fieldMode === 7 || m.fieldMode === 8) && (build.isExperimentSelection || powerUps.research.count > 1)
        // },
        // requires: "cloaking, pilot wave, or plasma torch",
        damage: 1.3,
        effect() {
            tech.damage *= this.damage
            tech.isCloakingDamage = true
            for (let i = 0; i < 2; i++) {
                if (powerUps.research.count > 0) powerUps.research.changeRerolls(-1)
            }
        },
        remove() {
            tech.isCloakingDamage = false
            if (this.count && m.alive) {
                tech.damage /= this.damage
                powerUps.research.changeRerolls(2)
            }
        }
    },
    {
        name: "anti-shear topology",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Topology' class="link">anti-shear topology</a>`,
        description: "your bullets last <strong>1.3x</strong> <strong>longer</strong>", //<br><em style = 'font-size: 83%'>drone spore worm flea missile foam wave neutron ice</em>",
        maxCount: 3,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed: () => true,
        requires: "",
        effect() {
            tech.bulletsLastLonger += 0.3
        },
        remove() {
            tech.bulletsLastLonger = 1;
        }
    },
    {
        name: "fracture analysis",
        description: "if a mob is <strong>stunned</strong> it takes<br><strong>5x</strong> <strong class='color-d'>damage</strong> from bullet impacts",
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.isStunField || tech.oneSuperBall || tech.isCloakStun || tech.isOrbitBotUpgrade || tech.isStun
        },
        requires: "a stun effect",
        effect() {
            tech.isCrit = true;
        },
        remove() {
            tech.isCrit = false;
        }
    },
    {
        name: "shear stress",
        description: "after mobs <strong>die</strong><br>they fire a <strong>nail</strong> at nearby mobs",
        maxCount: 9,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return !tech.sporesOnDeath && !tech.isExplodeMob && !tech.botSpawner && !tech.isMobBlockFling && !tech.iceIXOnDeath
        },
        requires: "no other mob death tech",
        effect() {
            tech.nailsDeathMob++
        },
        remove() {
            tech.nailsDeathMob = 0;
        }
    },
    {
        name: "thermal runaway",
        description: "after mobs <strong>die</strong> they <strong class='color-e'>explode</strong>",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return !tech.sporesOnDeath && !tech.nailsDeathMob && !tech.botSpawner && !tech.isMobBlockFling && !tech.iceIXOnDeath
        },
        requires: "no other mob death tech",
        effect() {
            tech.isExplodeMob = true;
        },
        remove() {
            tech.isExplodeMob = false;
        }
    },
    {
        name: "zoospore vector",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Disease_vector' class="link">zoospore vector</a>`,
        descriptionFunction() {
            return `after mobs <strong>die</strong> there is a <strong>10%</strong> chance<br>they grow ${b.guns[6].nameString('s')}`
        },
        // description: "after mobs <strong>die</strong><br>they have a <strong>+10%</strong> chance to grow <strong class='color-p' style='letter-spacing: 2px;'>spores</strong>",
        maxCount: 9,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return !tech.nailsDeathMob && !tech.isExplodeMob && !tech.botSpawner && !tech.isMobBlockFling && !tech.iceIXOnDeath
        },
        requires: "no other mob death tech",
        effect() {
            tech.sporesOnDeath += 0.1;
            // if (tech.isSporeWorm) {
            //     for (let i = 0; i < 4; i++) b.worm(m.pos)
            // } else {
            //     for (let i = 0; i < 8; i++) b.spore(m.pos)
            // }
        },
        remove() {
            tech.sporesOnDeath = 0;
        }
    },
    {
        name: "propagator",
        description: "after mobs <strong>die</strong> advance time <strong>0.5</strong> seconds<br><strong>1.6x</strong> <strong class='color-d'>damage</strong>",
        maxCount: 3,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed: () => true,
        requires: "",
        effect() {
            tech.deathSkipTime++
        },
        remove() {
            tech.deathSkipTime = 0
        }
    },
    {
        name: "exciton",
        descriptionFunction() {
            return `<span style = 'font-size:94%;'>after mobs <strong>die</strong> they have a <strong>14%</strong> chance to<br>spawn ${powerUps.orb.boost(1)} that give <strong>${(1 + powerUps.boost.damage).toFixed(2)}x</strong> <strong class='color-d'>damage</strong> for <strong>${(powerUps.boost.duration / 60).toFixed(0)}</strong> seconds</span>`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed: () => true,
        requires: "",
        effect() {
            tech.isBoostPowerUps = true
        },
        remove() {
            tech.isBoostPowerUps = false
        }
    },
    {
        name: "band gap",
        descriptionFunction() {
            return `${powerUps.orb.boost(1)} give <strong>1.77x</strong> <strong class='color-d'>damage</strong><br>but their duration is reduced by <strong>1</strong> second`
        },
        maxCount: 9,
        count: 1,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.isBoostPowerUps || tech.isBoostReplaceAmmo
        },
        requires: "exciton, quasiparticles",
        effect() {
            powerUps.boost.duration -= 60
            powerUps.boost.damage += 0.77
        },
        remove() {
            powerUps.boost.duration = 600
            powerUps.boost.damage = 1.25
        }
    },
    {
        name: "collider",
        descriptionFunction() {
            return `after mobs <strong>die</strong> existing <strong>power ups</strong><br><strong>collide</strong> to form new <strong>power ups</strong>`
            // return `after mobs <strong>die</strong> there is a <strong>+33%</strong> chance to convert<br>${powerUps.orb.heal()}, ${powerUps.orb.ammo()}, ${powerUps.orb.research(1)}, <strong class='color-m'>tech</strong>, <strong class='color-f'>field</strong>, <strong class='color-g'>gun</strong> into other types`
        },

        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed: () => true,
        requires: "",
        effect() {
            tech.collidePowerUps = true
        },
        remove() {
            tech.collidePowerUps = false
        }
    },
    {
        name: "bubble fusion",
        descriptionFunction() {
            return `after destroying a mob's <strong>shield</strong><br>spawn <strong>1-2</strong> ${powerUps.orb.heal()}, ${powerUps.orb.ammo()}, or ${powerUps.orb.research(1)} <em style ="float: right;">(once per mob)</em>`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isHealTech: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            tech.isShieldAmmo = true;
        },
        remove() {
            tech.isShieldAmmo = false;
        }
    },
    {
        name: "enthalpy",
        descriptionFunction() {
            return `after mobs <strong>die</strong><br>they have an <strong>8%</strong> chance to spawn ${powerUps.orb.heal(1)}`
        },
        maxCount: 9,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isHealTech: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            tech.healSpawn += 0.08;
        },
        remove() {
            tech.healSpawn = 0;
        }
    },
    {
        name: "cascading failure",
        description: "<strong>3x</strong> <strong class='color-d'>damage</strong> to <strong>mobs</strong> below <strong>25%</strong> <strong>durability</strong>",
        maxCount: 1,
        count: 0,
        frequency: 3,
        frequencyDefault: 3,
        allowed() {
            return tech.mobSpawnWithHealth > 0
        },
        requires: "reaction inhibitor",
        effect() {
            tech.isMobLowHealth = true
        },
        remove() {
            tech.isMobLowHealth = false
        }
    },
    {
        name: "reaction inhibitor",
        description: "<strong>mobs</strong> spawn with <strong>0.88x</strong> initial <strong>durability</strong>",
        maxCount: 3,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return !tech.isMobFullHealthCloak
        },
        requires: "not topological defect",
        effect() {
            tech.mobSpawnWithHealth++
            mobs.setMobSpawnHealth()
            for (let i = 0; i < mob.length; i++) {
                if (mob.health > mobs.mobSpawnWithHealth) mob.health = mobs.mobSpawnWithHealth
            }
        },
        remove() {
            tech.mobSpawnWithHealth = 0
            mobs.setMobSpawnHealth()
        }
    },
    {
        name: "scrap bots",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Scrap' class="link">scrap bots</a>`,
        description: "after mobs <strong>die</strong> you have a <strong>33%</strong> chance<br>to build scrap <strong class='color-bot'>bots</strong> that operate for <strong>15</strong> seconds",
        maxCount: 3,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isBotTech: true,
        allowed() {
            return !tech.sporesOnDeath && !tech.nailsDeathMob && !tech.isExplodeMob && !tech.isMobBlockFling && !tech.iceIXOnDeath
        },
        requires: "no other mob death tech",
        effect() {
            tech.botSpawner += 0.33;
        },
        remove() {
            tech.botSpawner = 0;
        }
    },
    {
        name: "scrap refit",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Scrap' class="link">scrap refit</a>`,
        description: "after mobs <strong>die</strong><br>reset scrap <strong class='color-bot'>bots</strong> to <strong>15</strong> seconds of operation",
        maxCount: 1,
        count: 0,
        frequency: 3,
        frequencyDefault: 3,
        isBotTech: true,
        allowed() {
            return tech.botSpawner
        },
        requires: "scrap bots",
        effect() {
            tech.isBotSpawnerReset = true;
        },
        remove() {
            tech.isBotSpawnerReset = false;
        }
    },
    {
        name: "nail-bot",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Robot' class="link">nail-bot</a>`,
        description: "a <strong class='color-bot'>bot</strong> fires <strong>nails</strong> at mobs in line of sight",
        maxCount: 9,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isBot: true,
        isBotTech: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            tech.nailBotCount++;
            b.nailBot();
        },
        remove() {
            if (this.count) {
                tech.nailBotCount -= this.count;
                b.clearPermanentBots();
                b.respawnBots();
            }
        }
    },
    {
        name: "nail-bot upgrade",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Robot' class="link">nail-bot upgrade</a>`,
        description: "<strong>convert</strong> your bots to <strong>nail-bots</strong><br><strong>4x</strong> <em>fire rate</em> and <strong>1.4x</strong> nail <strong>velocity</strong>",
        maxCount: 1,
        count: 0,
        frequency: 3,
        frequencyDefault: 3,
        isBotTech: true,
        allowed() {
            return tech.nailBotCount > 1 && !b.hasBotUpgrade()
        },
        requires: "2 or more nail bots and no other bot upgrade",
        effect() {
            tech.isNailBotUpgrade = true
            b.convertBotsTo("nail-bot")
            for (let i = 0; i < bullet.length; i++) {
                if (bullet[i].botType === 'nail') bullet[i].isUpgraded = true
            }
            tech.setBotTechFrequency()
            tech.setTechFrequency("nail-bot", 5)
        },
        remove() {
            if (this.count) {
                for (let i = 0; i < bullet.length; i++) {
                    if (bullet[i].botType === 'nail') bullet[i].isUpgraded = false
                }
                tech.setBotTechFrequency(1)
            }
            tech.isNailBotUpgrade = false
        }
    },
    {
        name: "foam-bot",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Robot' class="link">foam-bot</a>`,
        description: "a <strong class='color-bot'>bot</strong> sprays sticky <strong>foam</strong> at nearby mobs",
        maxCount: 9,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isBot: true,
        isBotTech: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            tech.foamBotCount++;
            b.foamBot();
        },
        remove() {
            if (this.count) {
                tech.foamBotCount -= this.count;
                b.clearPermanentBots();
                b.respawnBots();
            }
        }
    },
    {
        name: "foam-bot upgrade",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Robot' class="link">foam-bot upgrade</a>`,
        description: "<strong>convert</strong> your bots to <strong>foam-bots</strong><br><strong>2.5x</strong> foam <strong>size</strong> and <em>fire rate</em>",
        maxCount: 1,
        count: 0,
        frequency: 3,
        frequencyDefault: 3,
        isBotTech: true,
        allowed() {
            return tech.foamBotCount > 1 && !b.hasBotUpgrade()
        },
        requires: "2 or more foam bots and no other bot upgrade",
        effect() {
            tech.isFoamBotUpgrade = true
            b.convertBotsTo("foam-bot")
            for (let i = 0; i < bullet.length; i++) {
                if (bullet[i].botType === 'foam') bullet[i].isUpgraded = true
            }
            tech.setBotTechFrequency()
            tech.setTechFrequency("foam-bot", 5)
        },
        remove() {
            if (this.count) {
                for (let i = 0; i < bullet.length; i++) {
                    if (bullet[i].botType === 'foam') bullet[i].isUpgraded = false
                }
                tech.setBotTechFrequency(1)
            }
            tech.isFoamBotUpgrade = false
        }
    },
    {
        name: "sound-bot",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Robot' class="link">sound-bot</a>`,
        description: "a <strong class='color-bot'>bot</strong> emits <strong>expanding arcs</strong><br>aimed towards nearby mobs",
        maxCount: 9,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isBot: true,
        isBotTech: true,
        allowed() { return true },
        requires: "",
        effect() {
            tech.soundBotCount++;
            b.soundBot();
        },
        remove() {
            if (this.count) {
                tech.soundBotCount -= this.count;
                b.clearPermanentBots();
                b.respawnBots();
            }
        }
    },
    {
        name: "sound-bot upgrade",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Robot' class="link">sound-bot upgrade</a>`,
        description: "<strong>convert</strong> your bots to <strong>sound-bots</strong><br><strong>2x</strong> wave <em>fire rate</em>, <strong class='color-d'>damage</strong>, and duration",
        maxCount: 1,
        count: 0,
        frequency: 3,
        frequencyDefault: 3,
        isBotTech: true,
        allowed() {
            return tech.soundBotCount > 1 && !b.hasBotUpgrade()
        },
        requires: "2 or more sound bots and no other bot upgrade",
        effect() {
            tech.isSoundBotUpgrade = true
            b.convertBotsTo("sound-bot")
            for (let i = 0; i < bullet.length; i++) {
                if (bullet[i].botType === 'sound') bullet[i].isUpgraded = true
            }
            tech.setBotTechFrequency()
            tech.setTechFrequency("sound-bot", 5)
        },
        remove() {
            if (this.count) {
                for (let i = 0; i < bullet.length; i++) {
                    if (bullet[i].botType === 'sound') bullet[i].isUpgraded = false
                }
                tech.setBotTechFrequency(1)
            }
            tech.isSoundBotUpgrade = false
        }
    },
    {
        name: "boom-bot",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Robot' class="link">boom-bot</a>`,
        description: "a <strong class='color-bot'>bot</strong> <strong>defends</strong> the space around you<br>ignites an <strong class='color-e'>explosion</strong> after hitting a mob",
        maxCount: 9,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isBot: true,
        isBotTech: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            tech.boomBotCount++;
            b.boomBot();
        },
        remove() {
            if (this.count) {
                tech.boomBotCount -= this.count;
                b.clearPermanentBots();
                b.respawnBots();
            }
        }
    },
    {
        name: "boom-bot upgrade",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Robot' class="link">boom-bot upgrade</a>`,
        description: "<strong>convert</strong> your bots to <strong>boom-bots</strong><br><strong>4x</strong> <strong class='color-e'>explosion</strong> <strong class='color-d'>damage</strong> and size",
        maxCount: 1,
        count: 0,
        frequency: 3,
        frequencyDefault: 3,
        isBotTech: true,
        allowed() {
            return tech.boomBotCount > 1 && !b.hasBotUpgrade()
        },
        requires: "2 or more boom bots and no other bot upgrade",
        effect() {
            tech.isBoomBotUpgrade = true
            b.convertBotsTo("boom-bot")
            for (let i = 0; i < bullet.length; i++) {
                if (bullet[i].botType === 'boom') bullet[i].isUpgraded = true
            }
            tech.setBotTechFrequency()
            tech.setTechFrequency("boom-bot", 5)
        },
        remove() {
            if (this.count) {
                for (let i = 0; i < bullet.length; i++) {
                    if (bullet[i].botType === 'boom') bullet[i].isUpgraded = false
                }
                tech.setBotTechFrequency(1)
            }
            tech.isBoomBotUpgrade = false
        }
    },
    {
        name: "laser-bot",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Robot' class="link">laser-bot</a>`,
        description: "a <strong class='color-bot'>bot</strong> uses <strong class='color-f'>energy</strong> to emit a <strong class='color-laser'>laser</strong> beam<br>that targets nearby mobs",
        maxCount: 9,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isBot: true,
        isBotTech: true,
        allowed() {
            return m.maxEnergy > 0.5
        },
        requires: "maximum energy above 50",
        effect() {
            tech.laserBotCount++;
            b.laserBot();
        },
        remove() {
            if (this.count) {
                tech.laserBotCount -= this.count;
                b.clearPermanentBots();
                b.respawnBots();
            }
        }
    },
    {
        name: "laser-bot upgrade",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Robot' class="link">laser-bot upgrade</a>`,
        description: "<strong>convert</strong> your bots to <strong>laser-bots</strong><br><strong>2x</strong> <strong class='color-d'>damage</strong>, efficiency, and range",
        maxCount: 1,
        count: 0,
        frequency: 3,
        frequencyDefault: 3,
        isBotTech: true,
        allowed() {
            return tech.laserBotCount > 1 && !b.hasBotUpgrade()
        },
        requires: "2 or more laser bots and no other bot upgrade",
        effect() {
            tech.isLaserBotUpgrade = true
            b.convertBotsTo("laser-bot")
            for (let i = 0; i < bullet.length; i++) {
                if (bullet[i].botType === 'laser') bullet[i].isUpgraded = true
            }
            tech.setBotTechFrequency()
            tech.setTechFrequency("laser-bot", 5)
        },
        remove() {
            if (this.count) {
                for (let i = 0; i < bullet.length; i++) {
                    if (bullet[i].botType === 'laser') bullet[i].isUpgraded = false
                }
                tech.setBotTechFrequency(1)
            }
            tech.isLaserBotUpgrade = false
        }
    },
    {
        name: "orbital-bot",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Robot' class="link">orbital-bot</a>`,
        description: "a <strong class='color-bot'>bot</strong> is locked in <strong>orbit</strong> around you<br><strong>stuns</strong> and <strong class='color-d'>damages</strong> mobs on <strong>contact</strong>",
        maxCount: 9,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isBot: true,
        isBotTech: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            b.orbitBot();
            tech.orbitBotCount++;
        },
        remove() {
            if (this.count) {
                tech.orbitBotCount -= this.count;
                b.clearPermanentBots();
                b.respawnBots();
            }
        }
    },
    {
        name: "orbital-bot upgrade",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Robot' class="link">orbital-bot upgrade</a>`,
        description: "<strong>convert</strong> your bots to <strong>orbital-bots</strong><br><strong>4x</strong> orbital <strong class='color-d'>damage</strong> and <strong>2x</strong> <strong>radius</strong>",
        maxCount: 1,
        count: 0,
        frequency: 3,
        frequencyDefault: 3,
        isBotTech: true,
        allowed() {
            return tech.orbitBotCount > 1 && !b.hasBotUpgrade()
        },
        requires: "2 or more orbital bots and no other bot upgrade",
        effect() {
            tech.isOrbitBotUpgrade = true
            b.convertBotsTo("orbital-bot")
            const range = 190 + 120 * tech.isOrbitBotUpgrade
            for (let i = 0; i < bullet.length; i++) {
                if (bullet[i].botType === 'orbit') {
                    bullet[i].isUpgraded = true
                    bullet[i].range = range
                    bullet[i].orbitalSpeed = Math.sqrt(0.25 / range)
                }
            }
            tech.setBotTechFrequency()
            tech.setTechFrequency("orbital-bot", 5)
        },
        remove() {
            if (this.count) {
                const range = 190 + 100 * tech.isOrbitBotUpgrade
                for (let i = 0; i < bullet.length; i++) {
                    if (bullet[i].botType === 'orbit') {
                        bullet[i].range = range
                        bullet[i].orbitalSpeed = Math.sqrt(0.25 / range)
                    }
                }
                tech.setBotTechFrequency(1)
            }
            tech.isOrbitBotUpgrade = false
        }
    },
    {
        name: "dynamo-bot",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Robot' class="link">dynamo-bot</a>`,
        description: "a <strong class='color-bot'>bot</strong> <strong class='color-d'>damages</strong> mobs while it <strong>traces</strong> your path<br><strong>+8</strong> <strong class='color-f'>energy</strong> per second when nearby",
        maxCount: 9,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isBot: true,
        isBotTech: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            tech.dynamoBotCount++;
            b.dynamoBot();
        },
        remove() {
            if (this.count) {
                tech.dynamoBotCount -= this.count;
                b.clearPermanentBots();
                b.respawnBots();
            }
        }
    },
    {
        name: "dynamo-bot upgrade",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Robot' class="link">dynamo-bot upgrade</a>`,
        description: "<strong>convert</strong> your bots to <strong>dynamo-bots</strong><br><strong>+24</strong> <strong class='color-f'>energy</strong> per second when nearby",
        maxCount: 1,
        count: 0,
        frequency: 3,
        frequencyDefault: 3,
        isBotTech: true,
        allowed() {
            return tech.dynamoBotCount > 1 && !b.hasBotUpgrade()
        },
        requires: "2 or more dynamo bots and no other bot upgrade",
        effect() {
            tech.isDynamoBotUpgrade = true
            b.convertBotsTo("dynamo-bot")
            for (let i = 0; i < bullet.length; i++) {
                if (bullet[i].botType === 'dynamo') bullet[i].isUpgraded = true
            }
            tech.setBotTechFrequency()
            tech.setTechFrequency("dynamo-bot", 5)
        },
        remove() {
            if (this.count) {
                for (let i = 0; i < bullet.length; i++) {
                    if (bullet[i].botType === 'dynamo') bullet[i].isUpgraded = false
                }
                tech.setBotTechFrequency(1)
            }
            tech.isDynamoBotUpgrade = false
        }
    },
    {
        name: "perimeter defense",
        description: "for each permanent <strong class='color-bot'>bot</strong><br><strong>0.96x</strong> <strong class='color-defense'>damage taken</strong>",
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        isBotTech: true,
        allowed() {
            return b.totalBots() > 1
        },
        requires: "at least 2 bots",
        effect() {
            tech.isBotArmor = true
        },
        remove() {
            tech.isBotArmor = false
        }
    },
    {
        name: "network effect",
        description: "for each permanent <strong class='color-bot'>bot</strong><br><strong>1.04x</strong> <strong class='color-d'>damage</strong>",
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        isBotTech: true,
        allowed() {
            return b.totalBots() > 1
        },
        requires: "at least 2 bots",
        effect() {
            tech.isBotDamage = true
        },
        remove() {
            tech.isBotDamage = false
        }
    },
    {
        name: "bot fabrication",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Robot' class="link">bot fabrication</a>`,
        descriptionFunction() {
            return `after you collect ${powerUps.orb.research(2 + Math.floor(0.1666 * b.totalBots()))}use them to build a<br>random <strong class='color-bot'>bot</strong> <em style ="float: right;">(+1 cost every 5 bots)</em>`
        },
        // description: `if you collect ${powerUps.orb.research(2)}use them to build a<br>random <strong class='color-bot'>bot</strong> <em>(+1 cost every 5 bots)</em>`,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        isBotTech: true,
        allowed() {
            return powerUps.research.count > 1 || build.isExperimentSelection
        },
        requires: "at least 2 research",
        effect() {
            tech.isRerollBots = true;
            powerUps.research.changeRerolls(0)
            simulation.makeTextLog(`<span class='color-var'>m</span>.<span class='color-r'>research</span> <span class='color-symbol'>=</span> 0`)
        },
        remove() {
            tech.isRerollBots = false;
            // this.description = `if you collect ${powerUps.orb.research(2 + Math.floor(0.2 * b.totalBots()))}use them to build a<br>random <strong class='color-bot'>bot</strong>  <em>(+1 cost every 5 bots)</em>`
        }
    },
    {
        name: "open-source",
        description: `<strong class='color-m'>tech</strong>, <strong class='color-f'>fields</strong>, and <strong class='color-g'>guns</strong> have <strong>+1</strong> bot <strong class='color-choice'><span>ch</span><span>oi</span><span>ce</span></strong><br><strong>3x</strong> bot<strong class='color-m'>tech</strong> <em class='flicker'>frequency</em>`,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isBotTech: true,
        allowed() {
            return b.totalBots() > 1 && !tech.isDeterminism
        },
        requires: "at least 2 bots",
        effect() {
            tech.isExtraBotOption = true
            for (let i = 0, len = tech.tech.length; i < len; i++) {
                if (tech.tech[i].isBotTech) tech.tech[i].frequency *= 3
            }
        },
        remove() {
            if (this.count > 0) {
                for (let i = 0, len = tech.tech.length; i < len; i++) {
                    if (tech.tech[i].isBotTech) tech.tech[i].frequency = Math.ceil(tech.tech[i].frequency / 3)
                }
            }
            tech.isExtraBotOption = false
        }
    },
    {
        name: "ersatz bots",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Ersatz_good' class="link">ersatz bots</a>`,
        description: "<strong>double</strong> your current permanent <strong class='color-bot'>bots</strong><br>remove <strong>all</strong> <strong class='color-g'>guns</strong> in your inventory",
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        isBotTech: true,
        isInstant: true,
        isBadRandomOption: true,
        numberOfGunsLost: 0,
        allowed() {
            return b.totalBots() > 3 && !build.isExperimentSelection
        },
        requires: "NOT EXPERIMENT MODE, at least 4 bots",
        effect() {
            this.numberOfGunsLost = b.inventory.length
            b.inventory = []; //removes guns and ammo  
            for (let i = 0, len = b.guns.length; i < len; ++i) {
                b.guns[i].count = 0;
                b.guns[i].have = false;
                if (b.guns[i].ammo != Infinity) b.guns[i].ammo = 0;
            }
            tech.buffedGun = 0
            b.activeGun = null;
            b.inventoryGun = 0;
            simulation.drawCursor = simulation.drawCursorBasic //set cross hairs

            simulation.makeGunHUD();
            //double bots
            for (let i = 0; i < tech.nailBotCount; i++) b.nailBot();
            tech.nailBotCount *= 2
            for (let i = 0; i < tech.laserBotCount; i++) b.laserBot();
            tech.laserBotCount *= 2
            for (let i = 0; i < tech.foamBotCount; i++) b.foamBot();
            tech.foamBotCount *= 2
            for (let i = 0; i < tech.boomBotCount; i++) b.boomBot();
            tech.boomBotCount *= 2
            for (let i = 0; i < tech.orbitBotCount; i++) b.orbitBot();
            tech.orbitBotCount *= 2
            for (let i = 0; i < tech.dynamoBotCount; i++) b.dynamoBot();
            tech.dynamoBotCount *= 2
            for (let i = 0; i < tech.soundBotCount; i++) b.soundBot();
            tech.soundBotCount *= 2
            for (let i = 0; i < tech.plasmaBotCount; i++) b.plasmaBot();
            tech.plasmaBotCount *= 2
            for (let i = 0; i < tech.missileBotCount; i++) b.missileBot();
            tech.missileBotCount *= 2
        },
        remove() {
            // if (this.count) {
            //     //return guns
            //     for (let i = 0; i < this.numberOfGunsLost; i++) powerUps.spawn(m.pos.x + 60 * (Math.random() - 0.5), m.pos.y + 60 * (Math.random() - 0.5), "gun");
            //     this.numberOfGunsLost = 0;

            //     //half all current bots
            //     tech.nailBotCount = Math.round(tech.nailBotCount / 2)
            //     tech.laserBotCount = Math.round(tech.laserBotCount / 2)
            //     tech.foamBotCount = Math.round(tech.foamBotCount / 2)
            //     tech.soundBotCount = Math.round(tech.soundBotCount / 2)
            //     tech.boomBotCount = Math.round(tech.boomBotCount / 2)
            //     tech.orbitBotCount = Math.round(tech.orbitBotCount / 2)
            //     tech.dynamoBotCount = Math.round(tech.dynamoBotCount / 2)
            //     tech.plasmaBotCount = Math.round(tech.plasmaBotCount / 2)
            //     tech.missileBotCount = Math.round(tech.missileBotCount / 2)
            //     b.clearPermanentBots();
            //     b.respawnBots();
            // }
        }
    },
    {
        name: "robotics",
        description: `spawn <strong>2</strong> random <strong>bots</strong>`,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isBotTech: true,
        isInstant: true,
        allowed() {
            return b.totalBots() > 2
        },
        requires: "at least 3 bots",
        effect() {
            for (let i = 0; i < 2; i++) b.randomBot()
        },
        remove() {
        }
    },
    {
        name: "bot manufacturing",
        description: `use ${powerUps.orb.research(2)} to build<br><strong>3</strong> random <strong class='color-bot'>bots</strong>`,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isBotTech: true,
        isInstant: true,
        allowed() {
            return b.totalBots() > 3 && powerUps.research.count > 1
        },
        requires: "at least 4 bots",
        effect() {
            for (let i = 0; i < 2; i++) {
                if (powerUps.research.count > 0) powerUps.research.changeRerolls(-1)
            }
            // m.energy = 0.01;
            b.randomBot()
            b.randomBot()
            b.randomBot()
        },
        remove() { }
    },
    {
        name: "bot prototypes",
        description: `use ${powerUps.orb.research(3)}to build <strong>2</strong> random <strong class='color-bot'>bots</strong><br>and <strong>upgrade</strong> all <strong class='color-bot'>bots</strong> to a random type`,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isBotTech: true,
        isInstant: true,
        allowed() {
            return b.totalBots() > 5 && powerUps.research.count > 2
        },
        requires: "at least 6 bots",
        effect() {
            requestAnimationFrame(() => {
                for (let i = 0; i < 3; i++) {
                    if (powerUps.research.count > 0) powerUps.research.changeRerolls(-1)
                }
                //fill array of available bots
                const notUpgradedBots = []
                const num = 2
                notUpgradedBots.push(() => {
                    tech.giveTech("nail-bot upgrade")
                    for (let i = 0; i < num; i++) {
                        b.nailBot()
                        tech.nailBotCount++;
                    }
                    simulation.makeTextLog(`tech.isNailBotUpgrade = true`)
                })
                notUpgradedBots.push(() => {
                    tech.giveTech("foam-bot upgrade")
                    for (let i = 0; i < num; i++) {
                        b.foamBot()
                        tech.foamBotCount++;
                    }
                    simulation.makeTextLog(`tech.isFoamBotUpgrade = true`)
                })
                notUpgradedBots.push(() => {
                    tech.giveTech("sound-bot upgrade")
                    for (let i = 0; i < num; i++) {
                        b.soundBot()
                        tech.soundBotCount++;
                    }
                    simulation.makeTextLog(`tech.isSoundBotUpgrade = true`)
                })
                notUpgradedBots.push(() => {
                    tech.giveTech("boom-bot upgrade")
                    for (let i = 0; i < num; i++) {
                        b.boomBot()
                        tech.boomBotCount++;
                    }
                    simulation.makeTextLog(`tech.isBoomBotUpgrade = true`)
                })
                notUpgradedBots.push(() => {
                    tech.giveTech("laser-bot upgrade")
                    for (let i = 0; i < num; i++) {
                        b.laserBot()
                        tech.laserBotCount++;
                    }
                    simulation.makeTextLog(`tech.isLaserBotUpgrade = true`)
                })
                notUpgradedBots.push(() => {
                    tech.giveTech("orbital-bot upgrade")
                    for (let i = 0; i < num; i++) {
                        b.orbitBot()
                        tech.orbitBotCount++;
                    }
                    simulation.makeTextLog(`tech.isOrbitalBotUpgrade = true`)
                })
                notUpgradedBots.push(() => {
                    tech.giveTech("dynamo-bot upgrade")
                    for (let i = 0; i < num; i++) {
                        b.dynamoBot()
                        tech.dynamoBotCount++;
                    }
                    simulation.makeTextLog(`tech.isDynamoBotUpgrade = true`)
                })

                notUpgradedBots[Math.floor(Math.random() * notUpgradedBots.length)]() //choose random function from the array and run it
            })
        },
        remove() { }
    },
    {
        name: "decorrelation",
        description: "if your <strong class='color-g'>gun</strong> and <strong class='color-f'>field</strong> are unused for <strong>2</strong> seconds<br><strong>0.3x</strong> <strong class='color-defense'>damage taken</strong>",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return !tech.isRewindField
        },
        requires: "not retrocausality",
        effect() {
            tech.isNoFireDefense = true
        },
        remove() {
            tech.isNoFireDefense = false
        }
    },
    {
        name: "anticorrelation",
        description: "if your <strong class='color-g'>gun</strong> and <strong class='color-f'>field</strong> are unused for <strong>2</strong> seconds<br><strong>2x</strong> <strong class='color-d'>damage</strong>",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return !tech.isRewindField
        },
        requires: "not retrocausality",
        effect() {
            tech.isNoFireDamage = true
        },
        remove() {
            tech.isNoFireDamage = false
        }
    },
    {
        name: "mass driver",
        description: "<strong>4x</strong> <strong class='color-block'>block</strong> collision <strong class='color-d'>damage</strong>",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return m.fieldMode !== 9 && !tech.isTokamak && !tech.isReel
        },
        requires: "not wormhole, reel, tokamak",
        effect() {
            tech.blockDamage = 0.3
        },
        remove() {
            tech.blockDamage = 0.075
        }
    },
    {
        name: "inflation",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Inflation_(cosmology)' class="link">inflation</a>`,
        description: "if <strong>holding</strong> a <strong class='color-block'>block</strong> <strong>0.1x</strong> <strong class='color-defense'>damage taken</strong><br>after <strong>throwing</strong> a <strong class='color-block'>block</strong> it expands <strong>3x</strong>",
        maxCount: 1,
        count: 0,
        frequency: 3,
        frequencyDefault: 3,
        allowed() {
            return (tech.blockDamage > 0.075 || tech.isPrinter) && m.fieldMode !== 8 && m.fieldMode !== 9 && !tech.isTokamak
        },
        requires: "mass driver, not pilot wave, tokamak, wormhole",
        effect() {
            tech.isAddBlockMass = true
        },
        remove() {
            tech.isAddBlockMass = false
        }
    },
    {
        name: "restitution",
        description: "<strong>2.5x</strong> <strong class='color-block'>block</strong> collision <strong class='color-d'>damage</strong><br>after <strong>throwing</strong> a <strong class='color-block'>block</strong> it becomes very <strong>bouncy</strong>",
        maxCount: 1,
        count: 0,
        frequency: 3,
        frequencyDefault: 3,
        allowed() {
            return (tech.blockDamage > 0.075 || tech.isPrinter) && m.fieldUpgrades[m.fieldMode].name !== "pilot wave" && m.fieldUpgrades[m.fieldMode].name !== "wormhole" && !tech.isTokamak
        },
        requires: "mass driver, not pilot wave, tokamak, wormhole",
        effect() {
            tech.isBlockRestitution = true
        },
        remove() {
            tech.isBlockRestitution = false
        }
    },
    {
        name: "flywheel",
        description: "<strong>2.5x</strong> <strong class='color-block'>block</strong> collision <strong class='color-d'>damage</strong><br>after a mob <strong>dies</strong> its <strong class='color-block'>block</strong> is <strong>flung</strong> at mobs",
        maxCount: 1,
        count: 0,
        frequency: 3,
        frequencyDefault: 3,
        allowed() {
            return (tech.blockDamage > 0.075 || tech.isPrinter) && !tech.nailsDeathMob && !tech.sporesOnDeath && !tech.isExplodeMob && !tech.botSpawner && !tech.iceIXOnDeath
        },
        requires: "mass driver, no other mob death tech",
        effect() {
            tech.isMobBlockFling = true
        },
        remove() {
            tech.isMobBlockFling = false
        }
    },
    {
        name: "buckling",
        descriptionFunction() {
            return `if a <strong class='color-block'>block</strong> kills a mob there's a <strong>50%</strong> chance<br>to spawn either ${powerUps.orb.coupling(1)}, ${powerUps.orb.boost(1)}, ${powerUps.orb.heal()}, ${powerUps.orb.ammo()}, or ${powerUps.orb.research(1)}`
        },
        maxCount: 1,
        count: 0,
        frequency: 3,
        frequencyDefault: 3,
        allowed() {
            return (tech.blockDamage > 0.075 || tech.isPrinter) && m.fieldUpgrades[m.fieldMode].name !== "pilot wave" && !tech.isTokamak
        },
        requires: "mass driver, not pilot wave, tokamak",
        effect() {
            tech.isBlockPowerUps = true
        },
        remove() {
            tech.isBlockPowerUps = false
        }
    },

    {
        name: "first derivative",
        descriptionFunction() {
            return `while your <strong>first</strong> <strong class='color-g'>gun</strong> is equipped<br><strong>0.85x</strong> <strong class='color-defense'>damage taken</strong> per <strong class='color-g'>gun</strong> <em style ="float: right;">(${(0.85 ** b.inventory.length).toFixed(2)}x)</em>`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            tech.isFirstDer = true
        },
        remove() {
            tech.isFirstDer = false;
        }
    },
    {
        name: "dark matter",
        //a MAssive Compact Halo Object follows you<br>
        descriptionFunction() {
            return `<strong class='color-dark-matter'>dark matter</strong> slowly gravitates <strong>towards</strong> you<br><strong>0.4x</strong> <strong class='color-defense'>damage taken</strong> <strong>${tech.isNotDarkMatter ? "outside" : "inside"}</strong> <strong class='color-dark-matter'>dark matter</strong>`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            tech.isDarkMatter = true; //this harm reduction comes from the particle toggling  tech.isHarmDarkMatter
            spawn.darkMatter()
        },
        remove() {
            tech.isDarkMatter = false;
            tech.isHarmDarkMatter = false;
            for (let i = 0, len = mob.length; i < len; i++) {
                if (mob[i].isDarkMatter) mob[i].alive = false;
            }
        }
    },
    {
        name: "axion",
        descriptionFunction() {
            return `while <strong>${tech.isNotDarkMatter ? "outside" : "inside"}</strong> <strong class='color-dark-matter'>dark matter</strong><br> <strong>2x</strong> <strong class='color-d'>damage</strong>`
        },
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.isDarkMatter
        },
        requires: "dark matter",
        effect() {
            tech.isAxion = true
        },
        remove() {
            tech.isAxion = false
        }
    },
    {
        name: "dark energy",
        descriptionFunction() {
            return `while <strong>${tech.isNotDarkMatter ? "outside" : "inside"}</strong> <strong class='color-dark-matter'>dark matter</strong><br>generate <strong>10</strong> <strong class='color-f'>energy</strong> per second`
        },
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.isDarkMatter
        },
        requires: "dark matter",
        effect() {
            tech.isDarkEnergy = true
        },
        remove() {
            tech.isDarkEnergy = false
        }
    },
    {
        name: "MACHO",
        description: "<span style = 'font-size:93%;'><strong class='color-dark-matter'>dark matter's</strong> effects are only active <strong>outside</strong> it's range<br><strong>1.6x</strong> to all <strong class='color-dark-matter'>dark matter</strong> effects</span>",
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.isDarkMatter && !tech.isMoveDarkMatter && !tech.isDarkStar
        },
        requires: "dark matter, not entropic gravity, dark star",
        effect() {
            tech.isNotDarkMatter = true
        },
        remove() {
            tech.isNotDarkMatter = false
        }
    },
    {
        name: "entropic gravity",
        description: "<strong>crouching</strong> pulls <strong class='color-dark-matter'>dark matter</strong> towards you<br><strong>1.6x</strong> to all <strong class='color-dark-matter'>dark matter</strong> effects",
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.isDarkMatter && !tech.isNotDarkMatter
        },
        requires: "dark matter, not MACHO",
        effect() {
            tech.isMoveDarkMatter = true
        },
        remove() {
            tech.isMoveDarkMatter = false
        }
    },
    {
        name: "dark star",
        description: `mobs <strong>inside</strong> <strong class='color-dark-matter'>dark matter</strong> are <strong class='color-d'>damaged</strong><br><strong>1.3x</strong> <strong class='color-dark-matter'>dark matter</strong> radius`,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.isDarkMatter && !tech.isNotDarkMatter
        },
        requires: "dark matter, not MACHO",
        effect() {
            tech.isDarkStar = true
        },
        remove() {
            tech.isDarkStar = false
        }
    },
    {
        name: "ablative drones",
        description: "after losing <strong class='color-h'>health</strong> there is a chance<br>to rebuild your broken parts as <strong>drones</strong>",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed: () => true,
        requires: "",
        effect() {
            tech.isDroneOnDamage = true;
            // for (let i = 0; i < 4; i++) b.drone()
        },
        remove() {
            tech.isDroneOnDamage = false;
        }
    },
    {
        name: "non-Newtonian armor",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Non-Newtonian_fluid' class="link">non-Newtonian armor</a>`,
        description: "after mob collisions<br><strong>0.3x</strong> <strong class='color-defense'>damage taken</strong> for <strong>10</strong> seconds",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            tech.isHarmArmor = true;
        },
        remove() {
            tech.isHarmArmor = false;
        }
    },
    {
        name: "tessellation",
        description: `use ${powerUps.orb.research(2)}<br><strong>0.6x</strong> <strong class='color-defense'>damage taken</strong>`,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return powerUps.research.count > 1 || build.isExperimentSelection
        },
        requires: "",
        effect() {
            tech.isFieldHarmReduction = true
            for (let i = 0; i < 2; i++) {
                if (powerUps.research.count > 0) powerUps.research.changeRerolls(-1)
            }
        },
        remove() {
            tech.isFieldHarmReduction = false
            if (this.count > 0) powerUps.research.changeRerolls(2)
        }
    },
    {
        name: "Pauli exclusion",
        description: `for <strong>8</strong> seconds after mob <strong>collisions</strong><br>become <strong class="color-invulnerable">invulnerable</strong> and <em style="opacity: 0.3;">inhibit <strong class='color-f'>energy</strong> regen</em>`,
        maxCount: 9,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            m.collisionImmuneCycles += 480;
            if (m.immuneCycle < m.cycle + m.collisionImmuneCycles) m.immuneCycle = m.cycle + m.collisionImmuneCycles; //player is immune to damage
        },
        remove() {
            m.collisionImmuneCycles = 30;
        }
    },
    {
        name: "spin-statistics theorem",
        description: `for <strong>1.9</strong> seconds out of every <strong>7</strong> seconds<br>become <strong class="color-invulnerable">invulnerable</strong> and <em style="opacity: 0.3;">inhibit <strong class='color-f'>energy</strong> regen</em>`,
        maxCount: 3,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return true //m.collisionImmuneCycles > 30
        },
        requires: "",
        effect() {
            tech.cyclicImmunity += 114;
        },
        remove() {
            tech.cyclicImmunity = 0;
        }
    },
    {
        name: "fermion",
        description: `for <strong>6</strong> seconds after mobs <strong>die</strong><br>become <strong class="color-invulnerable">invulnerable</strong> and <em style="opacity: 0.3;">inhibit <strong class='color-f'>energy</strong> regen</em>`,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            tech.isMobDeathImmunity = true;
        },
        remove() {
            tech.isMobDeathImmunity = false;
        }
    },
    {
        name: "abelian group",
        description: `<strong>4x</strong> <strong class='color-d'>damage</strong> while <strong class="color-invulnerable">invulnerable</strong>`,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.isMobDeathImmunity || tech.cyclicImmunity || m.collisionImmuneCycles > 30
        },
        requires: "invincibility tech",
        effect() {
            tech.isImmunityDamage = true;
        },
        remove() {
            tech.isImmunityDamage = false;
        }
    },
    {
        name: "refrigerant",
        descriptionFunction() {
            return `after losing at least <strong>5</strong> ${tech.isEnergyHealth ? "<strong class='color-f'>energy</strong>" : "<strong class='color-h'>health</strong>"}<br><strong class='color-s'>freeze</strong> all mobs for <strong>7</strong> seconds`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            tech.isHarmFreeze = true;
        },
        remove() {
            tech.isHarmFreeze = false;
        }
    },
    {
        name: "piezoelectricity",
        description: "if you <strong>collide</strong> with a mob<br>generate <strong>+2048</strong> <strong class='color-f'>energy</strong>",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return !tech.isEnergyHealth
        },
        requires: "not mass-energy",
        effect() {
            tech.isPiezo = true;
            // if (simulation.isTextLogOpen) m.energy += 20.48;
        },
        remove() {
            tech.isPiezo = false;
        }
    },
    {
        name: "ground state",
        description: "<strong>+300</strong> maximum <strong class='color-f'>energy</strong><br><strong>0.66x</strong> passive <strong class='color-f'>energy</strong> generation",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return !tech.isTimeCrystals
        },
        requires: "not time crystals",
        effect() {
            tech.isGroundState = true
            m.setFieldRegen()
            m.setMaxEnergy()
        },
        remove() {
            tech.isGroundState = false
            m.setFieldRegen()
            m.setMaxEnergy()
        }
    },
    {
        name: "heat engine",
        description: `<strong>1.4x</strong> <strong class='color-d'>damage</strong><br><strong>–50</strong> maximum <strong class='color-f'>energy</strong>`,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed: () => true,
        requires: "not CPT",
        damage: 1.4,
        effect() {
            tech.damage *= this.damage
            tech.isMaxEnergyTech = true;
            m.setMaxEnergy()
        },
        remove() {
            if (this.count && m.alive) tech.damage /= this.damage
            tech.isMaxEnergyTech = false;
            m.setMaxEnergy()
        }
    },
    {
        name: "exothermic process",
        description: "<strong>1.6x</strong> <strong class='color-d'>damage</strong><br>after mobs <strong>die</strong> <strong>–5</strong> <strong class='color-f'>energy</strong>",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return true
        },
        requires: "",
        damage: 1.6,
        effect() {
            tech.damage *= this.damage
            tech.isEnergyLoss = true;
        },
        remove() {
            if (this.count && m.alive) tech.damage /= this.damage
            tech.isEnergyLoss = false;
        }
    },
    {
        name: "Gibbs free energy",
        descriptionFunction() {
            return `<strong>1.005x</strong> <strong class='color-d'>damage</strong> for each missing <strong class='color-f'>energy</strong><br><em style ="float: right;">(${(1 + 0.5 * Math.max(0, m.maxEnergy - m.energy)).toFixed(2)}x)</em>`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            tech.isLowEnergyDamage = true;
        },
        remove() {
            tech.isLowEnergyDamage = false;
        }
    },
    {
        name: "overcharge",
        description: "<strong>+88</strong> maximum <strong class='color-f'>energy</strong><br><strong>+4%</strong> <strong class='color-junk'>JUNK</strong><strong class='color-m'>tech</strong> chance",
        maxCount: 9,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return tech.junkChance < 1
        },
        requires: "",
        effect() {
            tech.bonusEnergy += 0.88
            m.setMaxEnergy()
            this.refundAmount += tech.addJunkTechToPool(0.04)
        },
        refundAmount: 0,
        remove() {
            tech.bonusEnergy = 0;
            m.setMaxEnergy()
            if (this.count > 0 && this.refundAmount > 0) {
                tech.removeJunkTechFromPool(this.refundAmount)
                this.refundAmount = 0
            }
        }
    },
    {
        name: "Maxwells demon",
        description: "<strong class='color-f'>energy</strong> above maximum decays <strong>30x</strong> slower<br><strong>+5%</strong> <strong class='color-junk'>JUNK</strong><strong class='color-m'>tech</strong> chance",
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return (m.energy > m.maxEnergy || build.isExperimentSelection) && tech.junkChance < 1
        },
        requires: "energy above your max",
        effect() {
            tech.overfillDrain = 0.99 //70% = 1-(1-0.75)/(1-0.15) //92% = 1-(1-0.75)/(1-0.87)
            this.refundAmount += tech.addJunkTechToPool(0.05)
        },
        refundAmount: 0,
        remove() {
            tech.overfillDrain = 0.7
            if (this.count > 0 && this.refundAmount > 0) {
                tech.removeJunkTechFromPool(this.refundAmount)
                this.refundAmount = 0
            }
        }
    },
    {
        name: "inductive charging",
        description: "if <strong>crouched</strong> <strong>7x</strong> passive <strong class='color-f'>energy</strong> generation<br>otherwise <strong>0x</strong> passive <strong class='color-f'>energy</strong> generation",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return !tech.isDamageAfterKillNoRegen
        },
        requires: "not parasitism",
        effect() {
            tech.isCrouchRegen = true; //only used to check for requirements
            m.regenEnergy = function () {
                if (m.immuneCycle < m.cycle && m.crouch && m.fieldCDcycle < m.cycle) m.energy += 7 * m.fieldRegen;
                if (m.energy < 0) m.energy = 0
            }
        },
        remove() {
            tech.isCrouchRegen = false;
            m.regenEnergy = m.regenEnergyDefault
        }
    },
    {
        name: "energy conservation",
        description: "doing <strong class='color-d'>damage</strong> to mobs generates <strong class='color-f'>energy</strong>",
        maxCount: 9,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            tech.energySiphon += 0.04;
        },
        remove() {
            tech.energySiphon = 0;
        }
    },
    {
        name: "parasitism",
        description: "if a mob has <strong>died</strong> in the last <strong>5</strong> seconds<br><strong>2x</strong> <strong class='color-d'>damage</strong>, no passive <strong class='color-f'>energy</strong> generation",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return !tech.isCrouchRegen
        },
        requires: "not inductive charging",
        effect() {
            tech.isDamageAfterKillNoRegen = true;
            m.regenEnergy = function () {
                if (m.immuneCycle < m.cycle && (m.lastKillCycle + 300 < m.cycle) && m.fieldCDcycle < m.cycle) m.energy += m.fieldRegen;
                if (m.energy < 0) m.energy = 0
            }
        },
        remove() {
            if (this.count) m.regenEnergy = m.regenEnergyDefault
            tech.isDamageAfterKillNoRegen = false;
        }
    },
    {
        name: "waste heat recovery",
        description: "if a mob has <strong>died</strong> in the last <strong>5</strong> seconds<br>generate <strong>0.05x</strong> maximum <strong class='color-f'>energy</strong> every second",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            tech.isEnergyRecovery = true;
        },
        remove() {
            tech.isEnergyRecovery = false;
        }
    },
    {
        name: "recycling",
        descriptionFunction() {
            return `if a mob has <strong>died</strong> in the last <strong>5</strong> seconds<br>recover <strong>0.005x</strong> maximum ${tech.isEnergyHealth ? "<strong class='color-f'>energy</strong>" : "<strong class='color-h'>health</strong>"} every second`
        },
        description: "",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isHealTech: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            tech.isHealthRecovery = true;
        },
        remove() {
            tech.isHealthRecovery = false;
        }
    },
    {
        name: "torpor",
        description: "if a mob has <strong>not died</strong> in the last <strong>5</strong> seconds<br><strong>0.3x</strong> <strong class='color-defense'>damage taken</strong>",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            tech.isHarmReduceNoKill = true;
        },
        remove() {
            tech.isHarmReduceNoKill = false;
        }
    },
    {
        name: "stability",
        descriptionFunction() {
            return `<strong>0.3x</strong> <strong class='color-defense'>damage taken</strong><br>while your <strong class='color-h'>health</strong> is at maximum`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            tech.isMaxHealthDefense = true;
        },
        remove() {
            tech.isMaxHealthDefense = false;
        }
    },
    {
        name: "instability",
        descriptionFunction() {
            return `<strong>2x</strong> <strong class='color-d'>damage</strong> while your <strong class='color-defense'>damage taken</strong> is <strong>1.00x</strong><br><em style ="float: right;">(damage taken = ${(m.defense()).toFixed(2)}x)</em>`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            tech.isNoDefenseDamage = true;
        },
        remove() {
            tech.isNoDefenseDamage = false;
        }
    },
    {
        name: "control theory",
        descriptionFunction() {
            return `<strong>1.5x</strong> <strong class='color-d'>damage</strong><br>while your <strong class='color-h'>health</strong> is at maximum`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            tech.isMaxHealthDamage = true;
        },
        remove() {
            tech.isMaxHealthDamage = false;
        }
    },
    {
        name: "homeostasis",
        descriptionFunction() {
            // return `<strong>0.9x</strong> <strong class='color-defense'>damage taken</strong> for each ${name} missing<br><em>(${(Math.pow(0.1 * max, Math.max(0, max - h))).toFixed(2)}x)</em>`
            const scale = 0.2 //adjust this to control the strength of this effect
            return `reduce <strong class='color-defense'>damage taken</strong> for each missing ${tech.isEnergyHealth ? "<strong class='color-f'>energy</strong>" : "<strong class='color-h'>health</strong>"}<br>down to a limit of <strong>${scale}x</strong> at <strong>0</strong> ${tech.isEnergyHealth ? "<strong class='color-f'>energy</strong>" : "<strong class='color-h'>health</strong>"}<em style ="float: right;">(${(Math.pow(scale, Math.max(0, 1 - (tech.isEnergyHealth ? m.energy / m.maxEnergy : m.health / m.maxHealth)))).toFixed(2)}x)</em>`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return m.health < 0.9 || build.isExperimentSelection
        },
        requires: "health below 60",
        effect() {
            tech.isLowHealthDefense = true;
        },
        remove() {
            tech.isLowHealthDefense = false;
        }
    },
    {
        name: "negative feedback",
        descriptionFunction() {
            return `<strong>1.006x</strong> <strong class='color-d'>damage</strong> for each missing ${tech.isEnergyHealth ? "<strong class='color-f'>energy</strong>" : "<strong class='color-h'>health</strong>"}<br><em style ="float: right;">(${(1 + 0.6 * Math.max(0, (tech.isEnergyHealth ? m.maxEnergy - m.energy : m.maxHealth - m.health))).toFixed(2)}x)</em>` //1 + 0.6 * Math.max(0, (tech.isEnergyHealth ? m.maxEnergy - m.energy : m.maxHealth - m.health))
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return m.health < 0.9 || build.isExperimentSelection
        },
        requires: "health below 90",
        effect() {
            tech.isLowHealthDmg = true; //used in mob.damage()
        },
        remove() {
            tech.isLowHealthDmg = false;
        }
    },
    {
        name: "Zenos paradox",
        descriptionFunction() {
            return `<strong>0.15x</strong> <strong class='color-defense'>damage taken</strong><br><strong>–5%</strong> of current ${tech.isEnergyHealth ? "<strong class='color-f'>energy</strong>" : "<strong class='color-h'>health</strong>"} every <strong>5</strong> seconds`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            tech.isZeno = true;
        },
        remove() {
            tech.isZeno = false;
        }
    },
    {
        name: "antiscience",
        descriptionFunction() {
            return `<strong>–10</strong> ${tech.isEnergyHealth ? "<strong class='color-f'>energy</strong>" : "<strong class='color-h'>health</strong>"} after picking up a <strong class='color-m'>tech</strong><br><strong>1.7x</strong> <strong class='color-d'>damage</strong>`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isBadRandomOption: true,
        allowed() {
            return true
        },
        requires: "",
        damage: 1.7,
        effect() {
            tech.damage *= this.damage
            tech.isTechDamage = true;
        },
        remove() {
            if (this.count && m.alive) tech.damage /= this.damage
            tech.isTechDamage = false;
        }
    },
    {
        name: "ergodicity",
        descriptionFunction() {
            return `<strong>0.50x</strong> <strong class='color-h'>healing</strong> from ${powerUps.orb.heal()}<br><strong>1.7x</strong> <strong class='color-d'>damage</strong>`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return true
        },
        requires: "",
        damage: 1.7,
        effect() {
            tech.damage *= this.damage
            tech.isHalfHeals = true;
            for (let i = 0; i < powerUp.length; i++) {
                if (powerUp[i].name === "heal") {
                    const scale = Math.sqrt(0.5)
                    powerUp[i].size *= scale
                    Matter.Body.scale(powerUp[i], scale, scale); //grow    
                }
            }
        },
        remove() {
            if (this.count && m.alive) {
                tech.damage /= this.damage
                for (let i = 0; i < powerUp.length; i++) {
                    if (powerUp[i].name === "heal") {
                        const scale = 1 / Math.sqrt(0.5)
                        powerUp[i].size *= scale
                        Matter.Body.scale(powerUp[i], scale, scale); //grow    
                    }
                }
            }
            tech.isHalfHeals = false;
        }
    },
    {
        name: "fluoroantimonic acid",
        description: "if your <strong class='color-h'>health</strong> is above <strong>100</strong><br><strong>1.35x</strong> <strong class='color-d'>damage</strong>",
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.maxHealth > 1;
        },
        requires: "maximum health above 100",
        effect() {
            tech.isAcidDmg = true;
        },
        remove() {
            tech.isAcidDmg = false;
        }
    },
    {
        name: "induction brake",
        descriptionFunction() {
            return `after using ${powerUps.orb.heal()}<br><strong class='color-s'>slow</strong> nearby mobs for <strong>17</strong> seconds`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return !tech.isPerfectBrake
        },
        requires: "not eddy current brake",
        effect() {
            tech.isHealBrake = true;
        },
        remove() {
            tech.isHealBrake = false;
        }
    },
    {
        name: "adiabatic healing",
        descriptionFunction() {
            return `<strong>2x</strong> <strong class='color-h'>healing</strong> from ${powerUps.orb.heal()}<br><strong>+4%</strong> <strong class='color-junk'>JUNK</strong><strong class='color-m'>tech</strong> chance`
        },
        maxCount: 3,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isHealTech: true,
        allowed() {
            return ((m.health / m.maxHealth) < 0.7 || build.isExperimentSelection) && tech.junkChance < 1
        },
        requires: "under 70% health",
        effect() {
            tech.largerHeals++;
            for (let i = 0; i < powerUp.length; i++) {
                if (powerUp[i].name === "heal") {
                    const oldSize = powerUp[i].size
                    powerUp[i].size = powerUps.heal.size() //update current heals
                    const scale = powerUp[i].size / oldSize
                    Matter.Body.scale(powerUp[i], scale, scale); //grow    
                }
            }
            this.refundAmount += tech.addJunkTechToPool(0.04)
        },
        refundAmount: 0,
        remove() {
            tech.largerHeals = 1;
            for (let i = 0; i < powerUp.length; i++) {
                if (powerUp[i].name === "heal") {
                    const oldSize = powerUp[i].size
                    powerUp[i].size = powerUps.heal.size() //update current heals
                    const scale = powerUp[i].size / oldSize
                    Matter.Body.scale(powerUp[i], scale, scale); //grow    
                }
            }
            if (this.count > 0 && this.refundAmount > 0) {
                tech.removeJunkTechFromPool(this.refundAmount)
                this.refundAmount = 0
            }
        }
    },
    {
        name: "quenching",
        descriptionFunction() {
            return `${powerUps.orb.heal()} over<strong class='color-h'>healing</strong> results in <strong>2x</strong> <strong class='color-h'>health</strong> loss<br> and <strong>2x</strong> maximum <strong class='color-h'>health</strong> increase`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isHealTech: true,
        allowed() {
            return !tech.isEnergyHealth
        },
        requires: "not mass-energy",
        effect() {
            tech.isOverHeal = true;
        },
        remove() {
            tech.isOverHeal = false;
        }
    },
    {
        name: "accretion",
        descriptionFunction() {
            return `${powerUps.orb.heal(1)} follow you, even between levels<br><strong>+4%</strong> chance to <strong class='color-dup'>duplicate</strong> spawned <strong>power ups</strong>`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isHealTech: true,
        allowed() {
            return m.fieldMode !== 9
        },
        requires: "not wormhole",
        effect() {
            tech.isHealAttract = true
            powerUps.setPowerUpMode();
            if (!build.isExperimentSelection && !simulation.isTextLogOpen) simulation.circleFlare(0.04);
        },
        remove() {
            tech.isHealAttract = false
            powerUps.setPowerUpMode();
        },
    },
    {
        name: "accretion disk",
        descriptionFunction() {
            return `<strong>1.05x</strong> <strong class='color-d'>damage</strong> for each <strong>power up</strong> on this <strong>level</strong><br><em style ="float: right;">(${(1 + 0.05 * powerUp.length).toFixed(2)}x)</em>`
        },
        maxCount: 1,
        count: 0,
        frequency: 3,
        frequencyDefault: 3,
        isHealTech: true,
        allowed() {
            return tech.isHealAttract
        },
        requires: "accretion",
        effect() {
            tech.isPowerUpDamage = true
        },
        remove() {
            tech.isPowerUpDamage = false
        },
    },
    {
        name: "maintenance",
        descriptionFunction() {
            return `<strong>2x</strong> <strong class='color-h'>heal</strong><strong class='color-m'>tech</strong> <em class='flicker'>frequency</em><br>spawn ${powerUps.orb.heal(13)}`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isInstant: true,
        isBadRandomOption: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            for (let i = 0; i < 13; i++) powerUps.spawn(m.pos.x + 60 * (Math.random() - 0.5), m.pos.y + 60 * (Math.random() - 0.5), "heal");
            for (let i = 0, len = tech.tech.length; i < len; i++) {
                if (tech.tech[i].isHealTech) tech.tech[i].frequency *= 2
            }
        },
        remove() { }
    },
    {
        name: "self-assembly",
        descriptionFunction() {
            return `at the start of each <strong>level</strong><br>for every <strong>20</strong> missing ${tech.isEnergyHealth ? "<strong class='color-f'>energy</strong>" : "<strong class='color-h'>health</strong>"} spawn ${powerUps.orb.heal()}`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isHealTech: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            tech.isHealLowHealth = true;
        },
        remove() {
            tech.isHealLowHealth = false;
        }
    },
    {
        name: "interest",
        descriptionFunction() {
            return `at the start of each <strong>level</strong> spawn<br><strong>${(100 * this.rate).toFixed(0)}%</strong> of your ${powerUps.orb.research(1)}, ${powerUps.orb.ammo(1)}, ${powerUps.orb.coupling(1)}, and ${powerUps.orb.heal(1)} <em>(rounded up)</em>`
        },
        maxCount: 9,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return true
        },
        requires: "",
        rate: 0.06,
        effect() {
            tech.interestRate += this.rate;
        },
        remove() {
            tech.interestRate = 0;
        }
    },
    {
        name: "anthropic principle",
        // nameInfo: "<span id = 'tech-anthropic'></span>",
        // addNameInfo() {
        //     setTimeout(function () {
        //         powerUps.research.changeRerolls(0)
        //     }, 1000);
        // },
        descriptionFunction() {
            return `once per level, instead of <strong>dying</strong><br>use ${powerUps.orb.research(1)} and spawn ${powerUps.orb.heal(16)}`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isHealTech: true,
        allowed() {
            return powerUps.research.count > 0 || build.isExperimentSelection
        },
        requires: "at least 1 research",
        effect() {
            tech.isDeathAvoid = true;
            tech.isDeathAvoidedThisLevel = false;
            setTimeout(function () {
                powerUps.research.changeRerolls(0)
            }, 1000);
        },
        remove() {
            tech.isDeathAvoid = false;
        }
    },
    {
        name: "weak anthropic principle",
        description: "after <strong>anthropic principle</strong> prevents your <strong>death</strong><br><strong>+60%</strong> <strong class='color-dup'>duplication</strong> chance for that level",
        maxCount: 1,
        count: 0,
        frequency: 3,
        frequencyDefault: 3,
        allowed() {
            return tech.isDeathAvoid
        },
        requires: "anthropic principle",
        effect() {
            tech.isAnthropicTech = true
            powerUps.setPowerUpMode(); //needed after adjusting duplication chance
        },
        remove() {
            tech.isAnthropicTech = false
            powerUps.setPowerUpMode(); //needed after adjusting duplication chance
        }
    },
    {
        name: "strong anthropic principle",
        description: "after <strong>anthropic principle</strong> prevents your <strong>death</strong><br><strong>2.71828x</strong> <strong class='color-d'>damage</strong> for that level",
        maxCount: 1,
        count: 0,
        frequency: 3,
        frequencyDefault: 3,
        allowed() {
            return tech.isDeathAvoid
        },
        requires: "anthropic principle",
        effect() {
            tech.isAnthropicDamage = true
        },
        remove() {
            tech.isAnthropicDamage = false
        }
    },
    {
        name: "quantum immortality",
        description: "<strong>0.7x</strong> <strong class='color-defense'>damage taken</strong><br>after <strong>dying</strong>, continue in an <strong class='alt'>alternate reality</strong>",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            tech.isImmortal = true;
        },
        remove() {
            tech.isImmortal = false;
        }
    },
    {
        name: "many-worlds",
        // description: "each <strong>level</strong> is an <strong class='alt'>alternate reality</strong>, where you<br>find a <strong class='color-m'>tech</strong> at the start of each level",
        description: `at the start of each <strong>level</strong> spawn a <strong class='color-m'>tech</strong><br>and enter an <strong class='alt'>alternate reality</strong>`,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isAltRealityTech: true,
        allowed() {
            return !tech.isResearchReality && !tech.isCollisionRealitySwitch
        },
        requires: "not Ψ(t) collapse, Hilbert space",
        effect() {
            tech.isSwitchReality = true;
        },
        remove() {
            tech.isSwitchReality = false;
        }
    },
    {
        name: "Ψ(t) collapse",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Wave_function_collapse' class="link">Ψ(t) collapse</a>`,
        description: `after a <strong>boss</strong> <strong>dies</strong> spawn ${powerUps.orb.research(5)}<br>if you <strong class='color-r'>research</strong> enter an <strong class='alt'>alternate reality</strong>`,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isAltRealityTech: true,
        allowed() {
            return !tech.isSwitchReality && !tech.isCollisionRealitySwitch && !tech.isJunkResearch
        },
        requires: "not many-worlds, Hilbert space, pseudoscience",
        bonusResearch: 21,
        effect() {
            tech.isResearchReality = true;
            // for (let i = 0; i < this.bonusResearch; i++) powerUps.spawn(m.pos.x + Math.random() * 60, m.pos.y + Math.random() * 60, "research", false);
        },
        remove() {
            tech.isResearchReality = false;
            // if (this.count > 0) powerUps.research.changeRerolls(-this.bonusResearch)
        }
    },
    {
        name: "decoherence",
        description: `after a <strong>boss</strong> <strong>dies</strong> spawn ${powerUps.orb.research(2)}<br><strong class='color-m'>tech</strong> options you don't <strong>choose</strong> won't <strong>reoccur</strong>`,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return !tech.isSuperDeterminism
        },
        requires: "not superdeterminism",
        bonusResearch: 7,
        effect() {
            tech.isBanish = true
        },
        remove() {
            if (tech.isBanish) {
                tech.isBanish = false
                //reset banish list
                for (let i = 0; i < tech.tech.length; i++) {
                    if (tech.tech[i].isBanished) tech.tech[i].isBanished = false
                }
            }
            tech.isBanish = false
        }
    },
    {
        name: "peer review",
        description: `after you <strong class='color-r'>research</strong> gain <strong>1.05x</strong> <strong class='color-d'>damage</strong><br>and <strong>+1%</strong> <strong class='color-junk'>JUNK</strong><strong class='color-m'>tech</strong> chance`,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return (powerUps.research.count > 0 || build.isExperimentSelection) && !tech.isSuperDeterminism
        },
        requires: "at least 1 research, not superdeterminism",
        effect() {
            tech.isResearchDamage = true;
        },
        remove() {
            tech.isResearchDamage = false;
        }
    },
    {
        name: "pseudoscience",
        description: "<strong class='color-r'>research</strong> <strong>2</strong> times</span> for <strong>free</strong>, but<br>add <strong>1%</strong> <strong class='color-junk'>JUNK</strong><strong class='color-m'>tech</strong> chance each time",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return !tech.isResearchReality && !tech.isSuperDeterminism
        },
        requires: "not Ψ(t) collapse, superdeterminism",
        effect() {
            tech.isJunkResearch = true;
        },
        remove() {
            tech.isJunkResearch = false;
        }
    },
    {
        name: "renormalization",
        description: `<strong>47%</strong> chance to spawn ${powerUps.orb.research(1)} after consuming ${powerUps.orb.research(1)}<br><strong>+5%</strong> <strong class='color-junk'>JUNK</strong><strong class='color-m'>tech</strong> chance`,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return (powerUps.research.count > 3 || build.isExperimentSelection) && !tech.isSuperDeterminism && tech.junkChance < 1
        },
        requires: "at least 4 research, not superdeterminism",
        effect() {
            tech.renormalization = true;
            this.refundAmount += tech.addJunkTechToPool(0.05)

        },
        refundAmount: 0,
        remove() {
            tech.renormalization = false;
            if (this.count > 0 && this.refundAmount > 0) {
                tech.removeJunkTechFromPool(this.refundAmount)
                this.refundAmount = 0
            }
        }
    },
    {
        name: "perturbation theory",
        description: `if you have no ${powerUps.orb.research(1)} in your inventory<br><strong>2x</strong> <em>fire rate</em>`,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return powerUps.research.count === 0
        },
        requires: "no research",
        effect() {
            tech.isRerollHaste = true;
            powerUps.research.changeRerolls(0)
            b.setFireCD();
        },
        remove() {
            tech.isRerollHaste = false;
            tech.researchHaste = 1;
            b.setFireCD();
        }
    },
    {
        name: "Bayesian statistics",
        descriptionFunction() {
            return `<strong>1.05x</strong> <strong class='color-d'>damage</strong> per ${powerUps.orb.research(1)} in your inventory<br><em style ="float: right;">(${(1 + Math.max(0, 0.05 * powerUps.research.count)).toFixed(2)}x)</em>`
        },
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return powerUps.research.count > 1 || build.isExperimentSelection
        },
        requires: "at least 2 research",
        effect() {
            tech.isRerollDamage = true;
        },
        remove() {
            tech.isRerollDamage = false;
        }
    },
    {
        name: "ansatz",
        description: `after choosing a <strong class='color-f'>field</strong>, <strong class='color-m'>tech</strong>, or <strong class='color-g'>gun</strong><br>if you have no ${powerUps.orb.research(1)} in your inventory spawn ${powerUps.orb.research(3)}`,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return powerUps.research.count < 1 && !tech.isSuperDeterminism && !tech.isRerollHaste
        },
        requires: "no research, not superdeterminism, Ψ(t) collapse, perturbation theory",
        effect() {
            tech.isAnsatz = true;
        },
        remove() {
            tech.isAnsatz = false;
        }
    },
    {
        name: "unified field theory",
        description: `when <strong>paused</strong> you can click to <strong>switch</strong> <strong class='color-f'>fields</strong><br><strong>2x</strong> <strong class='color-f'>field</strong><strong class='color-m'>tech</strong> <em class='flicker'>frequency</em>`,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return !tech.isSuperDeterminism && !tech.isNoDraftPause
        },
        requires: "not superdeterminism, eternalism",
        effect() {
            tech.isPauseSwitchField = true;
            for (let i = 0, len = tech.tech.length; i < len; i++) {
                if (tech.tech[i].isFieldTech) tech.tech[i].frequency *= 2
            }
        },
        remove() {
            tech.isPauseSwitchField = false;
            if (this.count > 1) {
                for (let i = 0, len = tech.tech.length; i < len; i++) {
                    if (tech.tech[i].isFieldTech) tech.tech[i].frequency /= 2
                }
            }
        }
    },
    {
        name: "eternalism",
        description: "<strong>1.25x</strong> <strong class='color-d'>damage</strong><br><strong>time</strong> can't be <strong>paused</strong> <em>(time can be dilated)</em>",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return !tech.isPauseSwitchField && !tech.isPauseEjectTech && !tech.isWormHolePause
        },
        requires: "not unified field theory, paradigm shift, invariant",
        damage: 1.25,
        effect() {
            tech.damage *= this.damage
            tech.isNoDraftPause = true
        },
        remove() {
            if (this.count && m.alive) tech.damage /= this.damage
            tech.isNoDraftPause = false
        }
    },
    {
        name: "brainstorming",
        description: "<strong class='color-m'>tech</strong> <strong class='color-choice'><span>ch</span><span>oi</span><span>ces</span></strong> <strong>randomize</strong><br>every <strong>1.5</strong> seconds for <strong>10</strong> seconds",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return !tech.isSuperDeterminism
        },
        requires: "not superdeterminism",
        effect() {
            tech.isBrainstorm = true
            tech.isBrainstormActive = false
            tech.brainStormDelay = 2000 - simulation.difficultyMode * 100
        },
        remove() {
            tech.isBrainstorm = false
            tech.isBrainstormActive = false
        }
    },
    {
        name: "cross-disciplinary",
        description: "<strong class='color-m'>tech</strong> have an extra <strong class='color-f'>field</strong> or <strong class='color-g'>gun</strong> <strong class='color-choice'><span>ch</span><span>oi</span><span>ce</span></strong><br><strong>+5%</strong> chance to <strong class='color-dup'>duplicate</strong> spawned <strong>power ups</strong>",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return !tech.isDeterminism
        },
        requires: "not determinism",
        effect() {
            tech.isExtraGunField = true;
            powerUps.setPowerUpMode(); //needed after adjusting duplication chance
            if (!build.isExperimentSelection && !simulation.isTextLogOpen) simulation.circleFlare(0.05);
        },
        remove() {
            tech.isExtraGunField = false;
            if (this.count) powerUps.setPowerUpMode(); //needed after adjusting duplication chance
        }
    },
    {
        name: "emergence",
        description: "<strong class='color-m'>tech</strong>, <strong class='color-f'>fields</strong>, and <strong class='color-g'>guns</strong> have <strong>+1</strong> <strong class='color-choice'><span>ch</span><span>oi</span><span>ce</span></strong><br><strong>1.1x</strong> <strong class='color-d'>damage</strong>",
        maxCount: 9,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return !tech.isDeterminism
        },
        requires: "not determinism",
        damage: 1.1,
        effect() {
            tech.extraChoices += 1;
            tech.damage *= this.damage
        },
        refundAmount: 0,
        remove() {
            tech.extraChoices = 0;
            if (this.count && m.alive) tech.damage /= this.damage
        }
    },
    {
        name: "path integral",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Path_integral_formulation' class="link">path integral</a>`,
        description: "your next <strong class='color-m'>tech</strong> <strong class='color-choice'><span>ch</span><span>oi</span><span>ce</span></strong> has all possible <strong>options</strong><br><strong>+4%</strong> <strong class='color-junk'>JUNK</strong><strong class='color-m'>tech</strong> chance",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isInstant: true,
        // isJunk: true,
        allowed() {
            return !tech.isDeterminism && !tech.isBrainstorm && tech.junkChance < 1
        },
        requires: "not determinism, brainstorm",
        effect() {
            tech.tooManyTechChoices = 1
            // for (let i = 0; i < this.bonusResearch; i++) powerUps.spawn(m.pos.x + 40 * (Math.random() - 0.5), m.pos.y + 40 * (Math.random() - 0.5), "research", false);
            this.refundAmount += tech.addJunkTechToPool(0.04)
        },
        refundAmount: 0,
        remove() {
            tech.tooManyTechChoices = 0
            if (this.count > 0 && this.refundAmount > 0) {
                tech.removeJunkTechFromPool(this.refundAmount)
                this.refundAmount = 0
            }
        }
    },
    {
        name: "determinism",
        description: "spawn <strong>5</strong> <strong class='color-m'>tech</strong><br>only <strong>1</strong> <strong class='color-choice'><span>ch</span><span>oi</span><span>ce</span></strong> for <strong class='color-m'>tech</strong>, <strong class='color-f'>fields</strong>, and <strong class='color-g'>guns</strong>",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isBadRandomOption: true,
        isInstant: true,
        allowed() {
            return !tech.extraChoices && !tech.isExtraGunField && !tech.isExtraBotOption
        },
        requires: "not emergence, cross-disciplinary, integrated circuit",
        effect() {
            tech.isDeterminism = true;
            //if you change the number spawned also change it in Born rule
            for (let i = 0; i < 5; i++) powerUps.spawn(m.pos.x + 60 * (Math.random() - 0.5), m.pos.y + 60 * (Math.random() - 0.5), "tech");
        },
        remove() {
            tech.isDeterminism = false;
        }
    },
    {
        name: "superdeterminism",
        description: `spawn <strong>5</strong> <strong class='color-m'>tech</strong><br>you can't <strong class='color-cancel'>cancel</strong> and ${powerUps.orb.research(1)} no longer <strong>spawn</strong>`,
        maxCount: 1,
        count: 0,
        frequency: 3,
        frequencyDefault: 3,
        isBadRandomOption: true,
        isInstant: true,
        allowed() {
            return tech.isDeterminism && !tech.isAnsatz && !tech.isJunkResearch && !tech.isBrainstorm
        },
        requires: "determinism, not ansatz, pseudoscience, brainstorming",
        effect() {
            tech.isSuperDeterminism = true;
            //if you change the number spawned also change it in Born rule
            for (let i = 0; i < 5; i++) powerUps.spawn(m.pos.x + 60 * (Math.random() - 0.5), m.pos.y + 60 * (Math.random() - 0.5), "tech");
        },
        remove() {
            tech.isSuperDeterminism = false;
        }
    },
    {
        name: "technical debt",
        descriptionFunction() {
            return `<strong>4x</strong> <strong class='color-d'>damage</strong> but lose <strong>0.15x</strong> <strong class='color-d'>damage</strong><br>for each <strong class='color-m'>tech</strong> you have learned <em style ="float: right;">(${(tech.totalCount > 20 ? (Math.pow(0.85, tech.totalCount - 20)) : (4 - 0.15 * tech.totalCount)).toFixed(2)}x)</em>`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isBadRandomOption: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            tech.isTechDebt = true;
        },
        remove() {
            tech.isTechDebt = false;
        }
    },
    {
        name: "meta-analysis",
        description: `if you choose a <strong class='color-junk'>JUNK</strong><strong class='color-m'>tech</strong> you instead get a<br>random normal <strong class='color-m'>tech</strong> and spawn ${powerUps.orb.research(2)}`,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return tech.junkChance > 0
        },
        requires: "some JUNK tech",
        effect() {
            tech.isMetaAnalysis = true
        },
        remove() {
            tech.isMetaAnalysis = false
        }
    },
    {
        name: "dark patterns",
        description: "<strong>1.3x</strong> <strong class='color-d'>damage</strong><br><strong>+15%</strong> <strong class='color-junk'>JUNK</strong><strong class='color-m'>tech</strong> chance",
        maxCount: 9,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return tech.junkChance < 1
        },
        requires: "",
        damage: 1.3,
        effect() {
            tech.damage *= this.damage
            this.refundAmount += tech.addJunkTechToPool(0.15)
        },
        refundAmount: 0,
        remove() {
            if (this.count && m.alive) {
                tech.damage /= this.damage
                if (this.refundAmount > 0) tech.removeJunkTechFromPool(this.refundAmount)
            }
        }
    },
    {
        name: "junk DNA",
        descriptionFunction() {
            return `increase <strong class='color-d'>damage</strong> by twice the<br><strong class='color-junk'>JUNK</strong><strong class='color-m'>tech</strong> chance <em style ="float: right;">(${(1 + 2 * tech.junkChance).toFixed(2)}x)</em>`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return tech.junkChance > 0
        },
        requires: "JUNK in tech pool",
        effect() {
            tech.isJunkDNA = true
        },
        remove() {
            tech.isJunkDNA = false
        }
    },
    {
        name: "mass production",
        descriptionFunction() {
            return `<strong class='color-m'>tech</strong> have extra <strong class='color-choice'><span>ch</span><span>oi</span><span>ces</span></strong> to spawn ${powerUps.orb.ammo(1)},&nbsp; ${powerUps.orb.heal(1)}, &nbsp;or&nbsp; ${powerUps.orb.research(1)}<br><strong>+3%</strong> chance to <strong class='color-dup'>duplicate</strong> spawned <strong>power ups</strong>`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() { return true },
        requires: "",
        effect() {
            tech.isMassProduction = true
            powerUps.setPowerUpMode(); //needed after adjusting duplication chance
            if (!build.isExperimentSelection && !simulation.isTextLogOpen) simulation.circleFlare(0.03);
        },
        remove() {
            tech.isMassProduction = false
            if (this.count) powerUps.setPowerUpMode(); //needed after adjusting duplication chance

        }
    },
    {
        name: "research",
        descriptionFunction() {
            return `spawn ${this.value > 36 ? this.value + powerUps.orb.research(1) : powerUps.orb.research(this.value)} <br>next time increase amount spawned by +5${powerUps.orb.research(1)}`
        },
        maxCount: 9,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isInstant: true,
        isMassProduction: true,
        allowed() { return true },
        requires: "",
        value: 8,
        defaultValue: 8,
        effect() {
            powerUps.spawnDelay("research", this.value);
            this.value += 5
        },
        remove() { }
    },
    {
        name: "ammo",
        descriptionFunction() {
            return `spawn ${this.value > 33 ? this.value + powerUps.orb.ammo(1) : powerUps.orb.ammo(this.value)}<br>next time increase amount spawned by +7${powerUps.orb.ammo(1)}`
        },
        maxCount: 9,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isInstant: true,
        isMassProduction: true,
        allowed() { return true },
        requires: "",
        value: 10,
        defaultValue: 10,
        effect() {
            powerUps.spawnDelay("ammo", this.value);
            this.value += 7
        },
        remove() { }
    },
    {
        name: "heals",
        descriptionFunction() {
            return `spawn ${this.value > 30 ? this.value + powerUps.orb.heal(1) : powerUps.orb.heal(this.value)}<br>next time increase amount spawned by +7${powerUps.orb.heal(1)}`
        },
        maxCount: 9,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isInstant: true,
        isMassProduction: true,
        allowed() { return true },
        requires: "",
        value: 10,
        defaultValue: 10,
        effect() {
            powerUps.spawnDelay("heal", this.value);
            this.value += 7
        },
        remove() { }
    },
    {
        name: "field coupling",
        descriptionFunction() {
            return `spawn ${powerUps.orb.coupling(10)}<br><em>${m.couplingDescription(1)} per ${powerUps.orb.coupling(1)}</em>`
        },
        maxCount: 9,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isInstant: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            powerUps.spawnDelay("coupling", 10)
        },
        remove() {
            // if (this.count) m.couplingChange(-this.count * 10)
        }
    },
    {
        name: "quintessence",
        descriptionFunction() {
            if (this.count) {
                converted = this.researchUsed * this.couplingToResearch
                let orbText
                if (converted > 15) {
                    orbText = `${converted} ${powerUps.orb.coupling()}`
                } else {
                    orbText = powerUps.orb.coupling(converted)
                }
                return `convert ${this.researchUsed} ${powerUps.orb.research(1)} into <strong>${orbText}</strong><br><em>${m.couplingDescription(1)} per ${powerUps.orb.coupling(1)}</em>`
            } else {
                let converted = powerUps.research.count * this.couplingToResearch
                let orbText
                if (converted > 15) {
                    orbText = `${converted} ${powerUps.orb.coupling()}`
                } else {
                    orbText = powerUps.orb.coupling(converted)
                }
                return `convert ${powerUps.research.count} ${powerUps.orb.research(1)} into <strong>${orbText}</strong><br><em>${m.couplingDescription(1)} per ${powerUps.orb.coupling(1)}</em>`
            }
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isInstant: true,
        allowed() {
            return powerUps.research.count > 3
        },
        requires: "",
        researchUsed: 0,
        couplingToResearch: 3,
        effect() {
            // let count = 0
            // while (powerUps.research.count > 0 && powerUps.research.count !== Infinity) {
            //     powerUps.research.changeRerolls(-1)
            //     count += 2.5
            //     this.researchUsed++
            // }
            // powerUps.spawnDelay("coupling", Math.floor(count))

            let cycle = () => {
                if (powerUps.research.count > 0 && powerUps.research.count !== Infinity) {
                    if (m.alive) requestAnimationFrame(cycle);
                    if (!simulation.paused && !simulation.isChoosing) { //&& !(simulation.cycle % 2)
                        powerUps.research.changeRerolls(-1)
                        this.researchUsed++
                        powerUps.spawnDelay("coupling", this.couplingToResearch)
                    }
                }  // else exit delay loop

            }
            requestAnimationFrame(cycle);
        },
        remove() {
            if (this.count) {
                m.couplingChange(-this.researchUsed * this.couplingToResearch)
                powerUps.research.changeRerolls(this.researchUsed)
                this.researchUsed = 0
            }
        }
    },
    {
        name: "virtual particles",
        descriptionFunction() {
            return `<strong>17%</strong> chance after mobs <strong>die</strong> to spawn ${powerUps.orb.coupling(1)}<br><em>${m.couplingDescription(1)} per ${powerUps.orb.coupling(1)}</em>`
            // return `<strong>17%</strong> chance after mobs <strong>die</strong> to spawn ${powerUps.orb.coupling(1)} that each give <strong>+0.1</strong> <strong class='color-coupling'>coupling</strong>` //<br>${m.couplingDescription(1)} ${m.fieldMode === 0 ? "" : "per <strong class='color-coupling'>coupling</strong>"}
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed: () => true,
        requires: "",
        effect() {
            tech.isCouplingPowerUps = true //about 20-30 mobs per level so at 16% and 0.1 coupling that's about 25 * 0.16 * 0.1 = 0.4 coupling per level with out duplication
        },
        remove() {
            tech.isCouplingPowerUps = false
        }
    },
    {
        name: "fine-structure constant",
        descriptionFunction() {
            // return `spawn ${this.value} ${powerUps.orb.coupling(1)} that each give <strong>+0.1</strong> <strong class='color-coupling'>coupling</strong><br><strong>-0.5</strong> <strong class='color-coupling'>coupling</strong> after mob <strong>collisions</strong>`//<br>${m.couplingDescription(1)} ${m.fieldMode === 0 ? "" : "per <strong class='color-coupling'>coupling</strong>"}
            return `after a <strong>boss</strong> <strong>dies</strong> spawn ${powerUps.orb.coupling(9)}<br><strong>lose</strong> ${powerUps.orb.coupling(4)} after mob <strong>collisions</strong>`//<br><em>${m.couplingDescription(1)} per ${powerUps.orb.coupling(1)}</em>
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        // isInstant: true,
        allowed: () => true,
        requires: "",
        value: 60,
        effect() {
            tech.isCouplingNoHit = true
            // powerUps.spawnDelay("coupling", this.value)
        },
        remove() {
            // if (this.count) m.couplingChange(-this.value)
            tech.isCouplingNoHit = false
        }
    },
    {
        name: "residual dipolar coupling",
        descriptionFunction() {
            // return `clicking <strong class='color-cancel'>cancel</strong> for a <strong class='color-f'>field</strong>, <strong class='color-m'>tech</strong>, or <strong class='color-g'>gun</strong><br>spawns ${powerUps.orb.coupling(5)}that each give <strong>+0.1</strong> <strong class='color-coupling'>coupling</strong>`//<br>${m.couplingDescription(1)} ${m.fieldMode === 0 ? "" : "per <strong class='color-coupling'>coupling</strong>"}
            return `clicking <strong class='color-cancel'>cancel</strong> spawns ${powerUps.orb.coupling(8)}<br><em>${m.couplingDescription(1)} per ${powerUps.orb.coupling(1)}</em>`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return !tech.isSuperDeterminism
        },
        requires: "not superdeterminism",
        effect() {
            tech.isCancelCouple = true
        },
        remove() {
            tech.isCancelCouple = false
        }
    },
    {
        name: "commodities exchange",
        descriptionFunction() {
            return `clicking <strong class='color-cancel'>cancel</strong> for a <strong class='color-f'>field</strong>, <strong class='color-m'>tech</strong>, or <strong class='color-g'>gun</strong><br>spawns <strong>8-12</strong> ${powerUps.orb.heal()}, ${powerUps.orb.ammo()}, or ${powerUps.orb.research(1)}`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return !tech.isSuperDeterminism
        },
        requires: "not superdeterminism",
        effect() {
            tech.isCancelRerolls = true
        },
        remove() {
            tech.isCancelRerolls = false
        }
    },
    {
        name: "options exchange",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Option_(finance)' class="link">options exchange</a>`,
        // description: `<span style = 'font-size:96%;'>once per level clicking <strong class='color-cancel'>cancel</strong> will <strong>randomize</strong><br>with <strong>2x</strong> <strong class='color-choice'><span>ch</span><span>oi</span><span>ces</span></strong> for <strong class='color-f'>fields</strong>, <strong class='color-m'>tech</strong>, or <strong class='color-g'>guns</strong></span>`,
        description: `clicking <strong class='color-cancel'>cancel</strong> for <strong class='color-f'>fields</strong>, <strong class='color-m'>tech</strong>, or <strong class='color-g'>guns</strong><br>will <strong>randomize</strong> with <strong>3x</strong> <strong class='color-choice'><span>ch</span><span>oi</span><span>ces</span></strong>, once a level`,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return !tech.isSuperDeterminism //&& (tech.isCancelRerolls || tech.isCancelDuplication || tech.isCancelCouple)
        },
        requires: "not superdeterminism", //residual dipolar coupling, commodities exchange, futures exchange,
        effect() {
            tech.isCancelTech = true
            tech.cancelTechCount = 0
        },
        remove() {
            tech.isCancelTech = false
            tech.cancelTechCount = 0
        }
    },
    {
        name: "futures exchange",
        description: "clicking <strong class='color-cancel'>cancel</strong> for a <strong class='color-f'>field</strong>, <strong class='color-m'>tech</strong>, or <strong class='color-g'>gun</strong><br>gives <strong>+5%</strong> power up <strong class='color-dup'>duplication</strong> chance",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return tech.duplicationChance() < 1 && !tech.isSuperDeterminism
        },
        requires: "below 100% duplication chance, not superdeterminism",
        effect() {
            tech.isCancelDuplication = true //search for tech.duplication  to balance
            powerUps.setPowerUpMode(); //needed after adjusting duplication chance
        },
        remove() {
            tech.isCancelDuplication = false
            if (this.count) powerUps.setPowerUpMode(); //needed after adjusting duplication chance
        }
    },
    {
        name: "replication",
        description: "<strong>+10%</strong> chance to <strong class='color-dup'>duplicate</strong> spawned <strong>power ups</strong><br><strong>+15%</strong> <strong class='color-junk'>JUNK</strong><strong class='color-m'>tech</strong> chance",
        maxCount: 9,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return tech.duplicationChance() < 1 && tech.junkChance < 1
        },
        requires: "below 100% duplication chance",
        effect() {
            tech.duplicateChance += 0.1
            powerUps.setPowerUpMode(); //needed after adjusting duplication chance
            if (!build.isExperimentSelection && !simulation.isTextLogOpen) simulation.circleFlare(0.1);
            this.refundAmount += tech.addJunkTechToPool(0.15)
        },
        refundAmount: 0,
        remove() {
            tech.duplicateChance = 0
            powerUps.setPowerUpMode(); //needed after adjusting duplication chance
            if (this.count > 0 && this.refundAmount > 0) {
                tech.removeJunkTechFromPool(this.refundAmount)
                this.refundAmount = 0
            }
        }
    },
    {
        name: "metastability",
        description: "<strong>+13%</strong> chance to <strong class='color-dup'>duplicate</strong> spawned <strong>power ups</strong><br><strong class='color-dup'>duplicates</strong> <strong class='color-e'>explode</strong> with a <strong>4</strong> second <strong>half-life</strong>",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return tech.duplicationChance() < 1
        },
        requires: "below 100% duplication chance",
        effect() {
            tech.isPowerUpsVanish = true
            powerUps.setPowerUpMode(); //needed after adjusting duplication chance
            if (!build.isExperimentSelection && !simulation.isTextLogOpen) simulation.circleFlare(0.11);
        },
        remove() {
            tech.isPowerUpsVanish = false
            if (this.count) powerUps.setPowerUpMode(); //needed after adjusting duplication chance        }
        }
    },
    {
        name: "correlated damage",
        descriptionFunction() {
            return `<strong class='color-dup'>duplication</strong> increases <strong class='color-d'>damage</strong><br><em style ="float: right;">(${(1 + Math.min(1, tech.duplicationChance())).toFixed(2)}x)</em>`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return tech.duplicationChance() > 0.03
        },
        requires: "duplication chance > 3%",
        effect() {
            tech.isDupDamage = true;
        },
        remove() {
            tech.isDupDamage = false;
        }
    },
    {
        name: "parthenogenesis",
        description: "<strong>+8%</strong> chance to <strong class='color-dup'>duplicate</strong> spawned <strong>power ups</strong><br><strong class='color-dup'>duplication</strong> also <strong class='color-dup'>duplicates</strong> <strong>mobs</strong>",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return tech.duplicationChance() > 0
        },
        requires: "some duplication chance",
        effect() {
            tech.isDuplicateMobs = true;
            powerUps.setPowerUpMode(); //needed after adjusting duplication chance
            if (!build.isExperimentSelection && !simulation.isTextLogOpen) simulation.circleFlare(0.08);
        },
        remove() {
            tech.isDuplicateMobs = false;
            if (this.count) powerUps.setPowerUpMode(); //needed after adjusting duplication chance
        }
    },
    {
        name: "stimulated emission",
        description: "<strong>+20%</strong> chance to <strong class='color-dup'>duplicate</strong> spawned <strong>power ups</strong>,<br><strong>collisions</strong> <span class='color-remove'>eject</span> a random <strong class='color-m'>tech</strong>",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return tech.duplicationChance() < 1
        },
        requires: "below 1% duplication chance",
        effect() {
            tech.isStimulatedEmission = true
            powerUps.setPowerUpMode(); //needed after adjusting duplication chance
            if (!build.isExperimentSelection && !simulation.isTextLogOpen) simulation.circleFlare(0.20);
        },
        remove() {
            tech.isStimulatedEmission = false
            if (this.count) powerUps.setPowerUpMode(); //needed after adjusting duplication chance
        }
    },
    {
        name: "strange attractor",
        descriptionFunction() {
            return `<strong>1.1x</strong> <strong class='color-d'>damage</strong><br><span class='color-remove'>removing</span> this increases <strong class='color-dup'>duplication</strong> by <strong>+11%</strong>`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isBadRandomOption: true,
        allowed() {
            return true
        },
        requires: "",
        damage: 1.1,
        effect() {
            tech.damage *= this.damage
        },
        isRemoveBenefit: true,
        remove() {
            if (this.count > 0 && m.alive) {
                tech.duplication += 0.11
                powerUps.setPowerUpMode(); //needed after adjusting duplication chance
                if (!build.isExperimentSelection && !simulation.isTextLogOpen) simulation.circleFlare(0.11);
                tech.damage /= this.damage
                this.frequency = 0
            }
        }
    },
    {
        name: "strange loop",
        description: `<strong>1.1x</strong> <strong class='color-d'>damage</strong><br><span class='color-remove'>removing</span> this gives a random <span class='color-remove'>remove<strong class='color-m'>tech</strong></span>`,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isBadRandomOption: true,
        allowed() {
            return true
        },
        requires: "",
        damage: 1.1,
        effect() {
            tech.damage *= this.damage
        },
        isRemoveBenefit: true,
        remove() {
            if (this.count > 0 && m.alive) {
                tech.damage /= this.damage
                this.frequency = 0

                requestAnimationFrame(() => {
                    const options = []
                    for (let i = 0, len = tech.tech.length; i < len; i++)    if (tech.tech[i].isRemoveBenefit && tech.tech[i].count === 0) options.push(i)
                    const index = options[Math.floor(Math.random() * options.length)]
                    tech.giveTech(tech.tech[index].name)
                });
            }
        }
    },
    {
        name: "null hypothesis",
        description: `<strong>1.1x</strong> <strong class='color-d'>damage</strong><br><span class='color-remove'>removing</span> this spawns ${powerUps.orb.research(15)}`,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isBadRandomOption: true,
        allowed() {
            return true
        },
        requires: "",
        damage: 1.1,
        effect() {
            tech.damage *= this.damage
        },
        isRemoveBenefit: true,
        remove() {
            if (this.count > 0 && m.alive) {
                tech.damage /= this.damage
                requestAnimationFrame(() => { powerUps.spawnDelay("research", 15) });
                this.frequency = 0
            }
        }
    },
    {
        name: "martingale",
        descriptionFunction() {
            return `<span style = 'font-size:95%;'><strong>${(1 + this.damage).toFixed(1)}x</strong> <strong class='color-d'>damage</strong>. <span class='color-remove'>removing</span> this has a <strong>50%</strong><br>chance return with <strong>2x</strong> its <strong class='color-d'>damage</strong> <em style ="float: right;">(${(1 + this.damage).toFixed(1)}x→${(1 + 2 * this.damage).toFixed(1)}x)</em></span>`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isBadRandomOption: true,
        allowed() {
            return true
        },
        requires: "",
        damage: 0.1,
        effect() {
            tech.damage *= 1 + this.damage
        },
        isRemoveBenefit: true,
        remove() {
            if (this.count > 0 && m.alive) {
                tech.damage /= 1 + this.damage
                if (Math.random() < 0.5) {
                    this.damage *= 2
                    requestAnimationFrame(() => { tech.giveTech("martingale") });
                }
                this.frequency = 0
            }
        }
    },
    {
        name: "externality",
        descriptionFunction() {
            return `<strong>1.1x</strong> <strong class='color-d'>damage</strong><br><span class='color-remove'>removing</span> this spawns <strong>${this.ammo}</strong> ${powerUps.orb.ammo(1)}`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isBadRandomOption: true,
        allowed() {
            return true
        },
        requires: "",
        damage: 1.1,
        ammo: 50,
        effect() {
            tech.damage *= this.damage
        },
        isRemoveBenefit: true,
        remove() {
            if (this.count > 0 && m.alive) {
                tech.damage /= this.damage
                this.frequency = 0
                requestAnimationFrame(() => { powerUps.spawnDelay("ammo", this.ammo) });
            }
        }
    },
    {
        name: "deprecated",
        scale: 0.07,
        descriptionFunction() {
            return `after <span class='color-remove'>removing</span> this gain<br><strong>${1 + this.scale}x</strong> <strong class='color-d'>damage</strong> per <span class='color-remove'>removed</span> <strong class='color-m'>tech</strong><em style ="float: right;">(${(1 + this.scale * ((this.frequency === 0 ? 0 : 1) + tech.removeCount)).toFixed(2)}x)</em>`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isBadRandomOption: true,
        allowed() {
            return true
        },
        requires: "",
        damage: 1.1,
        effect() {
        },
        isRemoveBenefit: true,
        remove() {
            if (this.count > 0 && m.alive) {
                tech.damage *= 1 + this.scale * (1 + tech.removeCount)
                this.frequency = 0
            }
        }
    },
    {
        name: "paradigm shift",
        descriptionFunction() {
            return `when <strong>paused</strong> clicking a <strong class='color-m'>tech</strong> <span class='color-remove'>ejects</span> it<br><strong>–${tech.pauseEjectTech.toFixed(1)}</strong> ${tech.isEnergyHealth ? "<strong class='color-f'>energy</strong>" : "<strong class='color-h'>health</strong>"} cost <em style ="float: right;">(1.3x cost each use)</em>`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return !tech.isSuperDeterminism && !tech.isNoDraftPause
        },
        requires: "not superdeterminism, eternalism",
        effect() {
            tech.isPauseEjectTech = true;
        },
        remove() {
            tech.isPauseEjectTech = false;

        }
    },
    {
        name: "Born rule",
        description: "<span class='color-remove'>eject</span> all your <strong class='color-m'>tech</strong>",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isInstant: true,
        isBadRandomOption: true,
        allowed() {
            return (tech.totalCount > 6)
        },
        requires: "more than 6 tech",
        effect() {
            // //remove active bullets  //to get rid of bots
            // for (let i = 0; i < bullet.length; ++i) Matter.Composite.remove(engine.world, bullet[i]);
            // bullet = [];
            // let count = 1 //count tech
            // for (let i = 0, len = tech.tech.length; i < len; i++) { // spawn new tech power ups
            //     if (!tech.tech[i].isInstant) count += tech.tech[i].count
            // }
            // if (tech.isDeterminism) count -= 4 //remove the bonus tech
            // if (tech.isSuperDeterminism) count -= 4 //remove the bonus tech
            // const removeCount = tech.removeCount
            // tech.setupAllTech(); // remove all tech
            // tech.removeCount = removeCount
            // if (simulation.isCheating) tech.setCheating();
            // lore.techCount = 0;
            // // tech.addLoreTechToPool();
            // for (let i = 0; i < count; i++) powerUps.spawn(m.pos.x + 100 * (Math.random() - 0.5), m.pos.y + 100 * (Math.random() - 0.5), "tech"); // spawn new tech power ups
            // //have state is checked in m.death()


            let count = 0 //count tech
            for (let i = 0, len = tech.tech.length; i < len; i++) { // spawn new tech power ups
                if (!tech.tech[i].isInstant && tech.tech[i].count) {
                    count += tech.tech[i].count
                    tech.removeTech(i)
                    // powerUps.ejectTech(index)
                }
            }
            powerUps.spawnDelay("tech", count);
            // for (let i = 0; i < count; i++) powerUps.spawn(m.pos.x + 100 * (Math.random() - 0.5), m.pos.y + 100 * (Math.random() - 0.5), "tech"); // spawn new tech power ups
        },
        remove() { }
    },

    {
        name: "Occams razor",
        descriptionFunction() {
            return `randomly <span class='color-remove'>remove</span> <strong>half</strong> your <strong class='color-m'>tech</strong><br>for each removed <strong>${(1 + this.damagePerRemoved).toFixed(2)}x</strong> <strong class='color-d'>damage</strong> <em style ="float: right;">(~${((this.count === 0) ? 1 + this.damagePerRemoved * 0.5 * tech.totalCount : this.damage).toFixed(2)}x)</em>`
        },
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isInstant: true,
        isBadRandomOption: true,
        allowed() {
            return (tech.totalCount > 6)
        },
        requires: "more than 6 tech",
        damagePerRemoved: 0.5,
        damage: null,
        effect() {
            let pool = []
            for (let i = 0, len = tech.tech.length; i < len; i++) { // spawn new tech power ups
                if (tech.tech[i].count && !tech.tech[i].isInstant) pool.push(i)
            }
            pool = shuffle(pool); //shuffles order of maps
            let removeCount = 0
            for (let i = 0, len = pool.length * 0.5; i < len; i++) removeCount += tech.removeTech(pool[i])
            this.damage = this.damagePerRemoved * removeCount
            tech.damage *= (1 + this.damage)
        },
        remove() {
            if (this.count && m.alive) tech.damage /= (1 + this.damage)
        }
    },
    {
        name: "exchange symmetry",
        description: "<span class='color-remove'>remove</span> <strong>1</strong> random <strong class='color-m'>tech</strong><br>spawn <strong>2</strong> new <strong class='color-g'>guns</strong>",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isInstant: true,
        isBadRandomOption: true,
        allowed() {
            return (tech.totalCount > 3) && !tech.isSuperDeterminism
        },
        requires: "at least 4 tech, not superdeterminism",
        effect() {
            const have = [] //find which tech you have
            for (let i = 0; i < tech.tech.length; i++) {
                if (tech.tech[i].count > 0 && !tech.tech[i].isInstant) have.push(i)
            }
            const choose = have[Math.floor(Math.random() * have.length)]
            for (let i = 0; i < tech.tech[choose].count; i++) {
                powerUps.spawn(m.pos.x, m.pos.y, "gun");
            }
            powerUps.spawn(m.pos.x, m.pos.y, "gun");
            tech.removeTech(choose)
        },
        remove() { }
    },
    {
        name: "Monte Carlo method",
        description: "<span class='color-remove'>remove</span> <strong>1</strong> random <strong class='color-m'>tech</strong><br>spawn <strong>2</strong> <strong class='color-m'>tech</strong>",
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isInstant: true,
        isBadRandomOption: true,
        allowed() {
            return (tech.totalCount > 3) && tech.duplicationChance() > 0 && !tech.isSuperDeterminism
        },
        requires: "some duplication, at least 4 tech, not superdeterminism",
        effect() {
            const removeTotal = tech.removeTech()
            for (let i = 0; i < removeTotal + 1; i++) powerUps.spawn(m.pos.x + 60 * (Math.random() - 0.5), m.pos.y + 60 * (Math.random() - 0.5), "tech");
        },
        remove() { }
    },
    //************************************************** 
    //************************************************** gun
    //************************************************** tech
    //**************************************************
    {
        name: "needle ice",
        description: `after <strong>needles</strong> impact walls<br>they chip off <strong>1-2</strong> freezing <strong class='color-s'>ice IX</strong> crystals`,
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return (tech.isNeedles || tech.isNeedles) && !tech.needleTunnel
        },
        requires: "nail gun, needle gun, not nanowires",
        effect() {
            tech.isNeedleIce = true
        },
        remove() {
            tech.isNeedleIce = false
        }
    },
    {
        name: "nanowires",
        description: `<strong>needles</strong> tunnel through <strong class='color-block'>blocks</strong> and <strong>map</strong><br><strong>1.2x</strong> needle <strong class='color-d'>damage</strong>`,
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return ((tech.haveGunCheck("nail gun") && tech.isNeedles) || (tech.isNeedles && tech.haveGunCheck("shotgun"))) && !tech.isNeedleIce
        },
        requires: "nail gun, needle gun, not needle ice",
        effect() {
            tech.needleTunnel = true
        },
        remove() {
            tech.needleTunnel = false
        }
    },
    {
        name: "ceramics",
        description: `<strong>needles</strong> and <strong>harpoons</strong> pierce <strong>shields</strong><br>directly <strong class='color-d'>damaging</strong> shielded mobs`,
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return (!tech.isLargeHarpoon && tech.haveGunCheck("harpoon")) || tech.isNeedles || tech.isHookDefense
        },
        requires: "needle gun, harpoon, not Bessemer process",
        effect() {
            tech.isShieldPierce = true
        },
        remove() {
            tech.isShieldPierce = false
        }
    },
    {
        name: "needle gun",
        description: "<strong>nail gun</strong> and <strong>shotgun</strong> fire mob piercing <strong>needles</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return ((tech.haveGunCheck("nail gun") && !tech.nailInstantFireRate && !tech.nailRecoil && !tech.isRicochet) || (tech.haveGunCheck("shotgun") && !tech.isNailShot && !tech.isFoamShot && !tech.isSporeWorm && !tech.isSporeFlea)) && !tech.isRivets && !tech.isIncendiary && !tech.isIceCrystals && !tech.isIceShot
        },
        requires: "nail gun, shotgun, not ice crystal, rivets, rotary cannon, pneumatic, incendiary, nail-shot, foam-shot, worm-shot, ice-shot",
        effect() {
            tech.isNeedles = true
            for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                if (b.guns[i].name === "nail gun") {
                    b.guns[i].ammo = Math.ceil(b.guns[i].ammo / this.ammoScale);
                    b.guns[i].ammoPack = b.guns[i].defaultAmmoPack / this.ammoScale;
                    b.guns[i].chooseFireMethod()
                    simulation.updateGunHUD();
                    break
                }
            }
        },
        ammoScale: 3,
        remove() {
            if (tech.isNeedles) {
                tech.isNeedles = false
                for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                    if (b.guns[i].name === "nail gun") {
                        b.guns[i].chooseFireMethod()
                        b.guns[i].ammo = Math.ceil(b.guns[i].ammo * this.ammoScale);
                        b.guns[i].ammoPack = b.guns[i].ammo * this.ammoScale;
                        simulation.updateGunHUD();
                        break
                    }
                }
            }
        }
    },
    {
        name: "stress concentration",
        description: "mobs below <strong>half</strong> durability <strong>die</strong> after you shoot<br>them near their <strong>center</strong> with <strong>needles</strong> or <strong>rivets</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return (tech.isNeedles || tech.isRivets) && !tech.isNailCrit && !tech.isIncendiary
        },
        requires: "needles, rivets, not incendiary, supercritical fission",
        effect() {
            tech.isCritKill = true
        },
        remove() {
            tech.isCritKill = false
        }
    },
    {
        name: "rivet gun",
        description: "<strong>nail gun</strong> and <strong>shotgun</strong> slowly lob a heavy <strong>rivet</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return ((tech.haveGunCheck("nail gun") && !tech.nailInstantFireRate && !tech.isRicochet) || (tech.haveGunCheck("shotgun") && !tech.isNailShot && !tech.isFoamShot && !tech.isSporeWorm && !tech.isSporeFlea)) && !tech.isNeedles && !tech.isIceCrystals && !tech.isIceShot
        },
        requires: "nail gun, shotgun, not ice crystal, needles, or pneumatic actuator",
        effect() {
            tech.isRivets = true
            for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                if (b.guns[i].name === "nail gun") {
                    b.guns[i].chooseFireMethod()
                    break
                }
            }
        },
        remove() {
            if (tech.isRivets) {
                tech.isRivets = false
                for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                    if (b.guns[i].name === "nail gun") {
                        b.guns[i].chooseFireMethod()
                        break
                    }
                }
            }
            tech.isRivets = false
        }
    },
    {
        name: "pneumatic actuator",
        description: "<strong>nail gun</strong> takes <strong>no</strong> time to ramp up<br>to its fastest <em>fire rate</em>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("nail gun") && !tech.isRivets && !tech.isNeedles && !tech.nailRecoil
        },
        requires: "nail gun, not rotary cannon, rivets, or needles",
        effect() {
            tech.nailInstantFireRate = true
            for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                if (b.guns[i].name === "nail gun") b.guns[i].chooseFireMethod()
            }
        },
        remove() {
            if (tech.nailInstantFireRate) {
                tech.nailInstantFireRate = false
                for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                    if (b.guns[i].name === "nail gun") b.guns[i].chooseFireMethod()
                }
            }
        }
    },
    {
        name: "ice crystal nucleation",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Nucleation' class="link">ice crystal nucleation</a>`,
        description: "<strong>nail gun</strong> uses <strong class='color-f'>energy</strong> to condense<br>unlimited <strong class='color-s'>freezing</strong> <strong>ice shards</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("nail gun") && !tech.isRivets && !tech.isNeedles // && !tech.isNailRadiation && !tech.isNailCrit
        },
        requires: "nail gun, not rivets, needles",
        effect() {
            tech.isIceCrystals = true;
            b.guns[0].ammoPack = Infinity
            b.guns[0].recordedAmmo = b.guns[i].ammo
            b.guns[0].ammo = Infinity
            simulation.updateGunHUD();
        },
        remove() {
            if (tech.isIceCrystals) {
                tech.isIceCrystals = false;
                b.guns[0].ammoPack = b.guns[0].defaultAmmoPack;
                if (b.guns[0].recordedAmmo) b.guns[0].ammo = b.guns[0].recordedAmmo
                simulation.updateGunHUD();
                if (this.count) requestAnimationFrame(() => { simulation.updateGunHUD(); });
            }
            tech.isIceCrystals = false;
            if (b.guns[0].ammo === Infinity) b.guns[0].ammo = 0
        }
    },
    {
        name: "rotary cannon",
        description: `<strong>nail gun</strong> has increased muzzle <strong class="color-speed">speed</strong>,<br>maximum <em>fire rate</em>, <strong>accuracy</strong>, and <strong>recoil</strong>`,
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("nail gun") && !tech.nailInstantFireRate && !tech.isNeedles
        },
        requires: "nail gun, not pneumatic actuator, needle gun",
        effect() {
            tech.nailRecoil = true
            for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                if (b.guns[i].name === "nail gun") b.guns[i].chooseFireMethod()
            }
        },
        remove() {
            if (tech.nailRecoil) {
                tech.nailRecoil = false
                for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                    if (b.guns[i].name === "nail gun") b.guns[i].chooseFireMethod()
                }
            }
        }
    },
    {
        name: "gauge",
        description: `<strong>rivets</strong>, <strong>needles</strong>, <strong>super balls</strong>, and <strong>nails</strong><br>have <strong>1.3x</strong> mass and physical <strong class='color-d'>damage</strong>`,
        isGunTech: true,
        maxCount: 9,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.hookNails + tech.isMineDrop + tech.isNailBotUpgrade + tech.fragments + tech.nailsDeathMob + (tech.haveGunCheck("super balls") + (tech.haveGunCheck("mine") && !tech.isFoamMine) + (tech.haveGunCheck("nail gun")) + tech.isNeedles + tech.isNailShot + tech.isRivets) * 2 > 1
        },
        requires: "nails, nail gun, rivets, shotgun, super balls, mine",
        effect() {
            tech.bulletSize = 1 + 0.25 * Math.pow(this.count + 1, 0.5)
        },
        remove() {
            tech.bulletSize = 1;
        }
    },
    {
        name: "supercritical fission",
        description: "if <strong>nails</strong>, <strong>needles</strong>, or <strong>rivets</strong> strike mobs<br>near their <strong>center</strong> they can <strong class='color-e'>explode</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return (tech.isNailShot || tech.isNeedles || tech.isNailBotUpgrade || tech.haveGunCheck("nail gun") || tech.isRivets || ((tech.isMineDrop || tech.haveGunCheck("mine")) && !(tech.isFoamMine || tech.isSuperMine))) && !tech.isIncendiary && !tech.isCritKill
        },
        requires: "nail gun, mine, needles, nails, rivets, not incendiary, stress concentration",
        effect() {
            tech.isNailCrit = true
        },
        remove() {
            tech.isNailCrit = false
        }
    },
    {
        name: "irradiated nails",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Irradiation' class="link">irradiated nails</a>`,
        description: "<strong>nails</strong>, <strong>needles</strong>, and <strong>rivets</strong> are <strong class='color-p'>radioactive</strong><br><strong>1.9x</strong> <strong class='color-p'>radioactive</strong> <strong class='color-d'>damage</strong> over <strong>3</strong> seconds",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.isNailBotUpgrade || tech.hookNails || tech.fragments || tech.nailsDeathMob || ((tech.isMineDrop || tech.haveGunCheck("mine")) && !(tech.isFoamMine || tech.isSuperMine)) || (tech.haveGunCheck("nail gun") && !tech.isShieldPierce) || (tech.haveGunCheck("shotgun") && (tech.isNeedles || tech.isNailShot))
        },
        requires: "nail gun, nails, rivets, mine, not ceramic needles",
        effect() {
            tech.isNailRadiation = true;
        },
        remove() {
            tech.isNailRadiation = false;
        }
    },
    {
        name: "6s half-life",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Half-life' class="link">6s half-life</a>`,
        description: "<span style = 'font-size:90%;'><strong>nails</strong>, <strong>needles</strong>, <strong>rivets</strong> are made of <strong class='color-p'>plutonium-238</strong></span><br><strong class='color-p'>radioactive</strong> <strong class='color-d'>damage</strong> lasts <strong>+3</strong>  seconds",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.isNailRadiation && !tech.isFastRadiation
        },
        requires: "nail gun, mine, irradiated nails, not 1s half-life",
        effect() {
            tech.isSlowRadiation = true;
        },
        remove() {
            tech.isSlowRadiation = false;
        }
    },
    {
        name: "1s half-life",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Half-life' class="link">1s half-life</a>`,
        description: "<span style = 'font-size:95%;'><strong>nails</strong>, <strong>needles</strong>, <strong>rivets</strong> are made of <strong class='color-p'>lithium-8</strong><br><strong>4x</strong> <strong class='color-p'>radioactive</strong> <strong class='color-d'>damage</strong> for <strong>1</strong> second</span>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.isNailRadiation && !tech.isSlowRadiation
        },
        requires: "nail gun, mine, irradiated nails, not 6s half-life",
        effect() {
            tech.isFastRadiation = true;
        },
        remove() {
            tech.isFastRadiation = false;
        }
    },
    {
        name: "spin-statistics",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Spin%E2%80%93statistics_theorem' class="link">spin-statistics</a>`,
        description: `after firing the <strong>shotgun</strong> you are <strong class="color-invulnerable">invulnerable</strong><br>shotgun has <strong>0.7x</strong> bullets per ${powerUps.orb.ammo(1)}`,
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("shotgun")
        },
        requires: "shotgun",
        effect() {
            tech.isShotgunImmune = true;

            //cut current ammo by 1/2
            for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                if (b.guns[i].name === "shotgun") {
                    b.guns[i].ammo = Math.ceil(b.guns[i].ammo * 0.7);
                    b.guns[i].ammoPack *= 0.7
                    break;
                }
            }
            simulation.updateGunHUD();
        },
        remove() {
            tech.isShotgunImmune = false;
            if (this.count > 0) {
                for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                    if (b.guns[i].name === "shotgun") {
                        b.guns[i].ammoPack /= 0.7
                        b.guns[i].ammo = Math.ceil(b.guns[i].ammo / 0.7);
                        simulation.updateGunHUD();
                        break;
                    }
                }
            }
        }
    },
    {
        name: "Newtons 3rd law",
        description: "<strong>1.7x</strong> <strong>shotgun</strong> <em>fire rate</em> and <strong>recoil</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("shotgun") && !tech.isShotgunReversed
        },
        requires: "shotgun, not Noether violation",
        effect() {
            tech.isShotgunRecoil = true;
        },
        remove() {
            tech.isShotgunRecoil = false;
        }
    },
    {
        name: "Noether violation",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Noether%27s_theorem' class="link">Noether violation</a>`,
        description: "<strong>1.5x</strong> <strong>shotgun</strong> <strong class='color-d'>damage</strong><br><strong>shotgun</strong> <strong>recoil</strong> is <strong>reversed</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return (tech.haveGunCheck("shotgun")) && !tech.isShotgunRecoil
        },
        requires: "shotgun, not Newtons 3rd law",
        effect() {
            tech.isShotgunReversed = true;
        },
        remove() {
            tech.isShotgunReversed = false;
        }
    },
    {
        name: "repeater",
        description: "<strong>shotgun</strong> immediately fires again for no <strong class='color-ammo'>ammo</strong><br>reduced <strong>0.5x</strong> <strong>shotgun</strong> <em>fire rate</em>",
        isGunTech: true,
        maxCount: 9,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return (tech.haveGunCheck("shotgun"))
        },
        requires: "shotgun, not Newtons 3rd law",
        effect() {
            tech.shotgunExtraShots++;
        },
        remove() {
            tech.shotgunExtraShots = 0
        }
    },
    {
        name: "nail-shot",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Nail_(fastener)' class="link">nail-shot</a>`,
        description: "<strong>shotgun</strong> drives a long clip of <strong>nails</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("shotgun") && !tech.isIncendiary && !tech.isRivets && !tech.isIceShot && !tech.isFoamShot && !tech.isSporeWorm && !tech.isSporeFlea && !tech.isNeedles
        },
        requires: "shotgun, not incendiary, rivets, foam-shot, worm-shot, ice-shot, needles",
        effect() {
            tech.isNailShot = true;
        },
        remove() {
            tech.isNailShot = false;
        }
    },
    {
        name: "foam-shot",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Foam' class="link">foam-shot</a>`,
        description: "<strong>shotgun</strong> sprays sticky <strong>foam</strong> bubbles",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("shotgun") && !tech.isNailShot && !tech.isIncendiary && !tech.isRivets && !tech.isIceShot && !tech.isSporeWorm && !tech.isSporeFlea && !tech.isNeedles
        },
        requires: "shotgun, not incendiary, nail-shot, rivet, worm-shot, ice-shot, needle",
        effect() {
            tech.isFoamShot = true;
        },
        remove() {
            tech.isFoamShot = false;
        }
    },
    {
        name: "ice-shot",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Ice-nine_(disambiguation)' class="link">ice-shot</a>`,
        description: "<strong>shotgun</strong> grows freezing <strong class='color-s'>ice IX</strong> crystals",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("shotgun") && !tech.isNailShot && !tech.isIncendiary && !tech.isRivets && !tech.isFoamShot && !tech.isSporeWorm && !tech.isSporeFlea && !tech.isNeedles
        },
        requires: "shotgun, not incendiary, nail-shot, rivet, foam-shot, worm-shot",
        effect() {
            tech.isIceShot = true;
        },
        remove() {
            tech.isIceShot = false;
        }
    },
    {
        name: "freezer burn",
        description: "mobs <strong class='color-s'>frozen</strong> while below <strong>33%</strong> durability <strong>die</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.isIceCrystals || tech.isSporeFreeze || (m.fieldMode === 4 && simulation.molecularMode === 2) || tech.isIceShot || tech.isNeedleIce || (m.coupling && (m.fieldMode === 2 || m.fieldMode === 0))
        },
        requires: "a freeze effect",
        effect() {
            tech.isIceKill = true
        },
        remove() {
            tech.isIceKill = false
        }
    },
    {
        name: "flash freeze",
        description: "mobs <strong class='color-s'>frozen</strong> while above <strong>66%</strong> durability<br>have their durability reduced to <strong>66%</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.isIceCrystals || tech.isSporeFreeze || (m.fieldMode === 4 && simulation.molecularMode === 2) || tech.isIceShot || tech.isNeedleIce || (m.coupling && (m.fieldMode === 2 || m.fieldMode === 0))
        },
        requires: "a freeze effect",
        effect() {
            tech.isIceMaxHealthLoss = true
        },
        remove() {
            tech.isIceMaxHealthLoss = false
        }
    },
    {
        name: "crystallizer",
        description: "after <strong class='color-s'>frozen</strong> mobs <strong>die</strong> they<br>shatter into <strong class='color-s'>ice IX</strong> crystals",
        isGunTech: true,
        maxCount: 9,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return (tech.isIceCrystals || tech.isSporeFreeze || (m.fieldMode === 4 && simulation.molecularMode === 2) || tech.isIceShot || tech.isNeedleIce || (m.coupling && (m.fieldMode === 2 || m.fieldMode === 0))) && !tech.sporesOnDeath && !tech.isExplodeMob && !tech.botSpawner && !tech.isMobBlockFling && !tech.nailsDeathMob
        },
        requires: "a localized freeze effect, no other mob death tech",
        effect() {
            tech.iceIXOnDeath++
        },
        remove() {
            tech.iceIXOnDeath = 0
        }
    },
    {
        name: "thermoelectric effect",
        description: "after <strong>killing</strong> mobs with <strong class='color-s'>ice IX</strong><br><strong>+100</strong> <strong class='color-f'>energy</strong>",
        isGunTech: true,
        maxCount: 9,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return (m.fieldMode === 4 && simulation.molecularMode === 2) || tech.isNeedleIce || (m.coupling && (m.fieldMode === 2 || m.fieldMode === 0)) || tech.iceIXOnDeath || tech.isIceShot
        },
        requires: "ice IX",
        effect() {
            tech.iceEnergy++
        },
        remove() {
            tech.iceEnergy = 0;
        }
    },
    {
        name: "superfluidity",
        description: "<strong class='color-s'>freeze</strong> effects are applied<br>to a small area around the target",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.isIceCrystals || tech.isSporeFreeze || (m.fieldMode === 4 && simulation.molecularMode === 2) || tech.isNeedleIce || (m.coupling && (m.fieldMode === 2 || m.fieldMode === 0)) || tech.iceIXOnDeath || tech.isIceShot
        },
        requires: "a localized freeze effect",
        effect() {
            tech.isAoESlow = true
        },
        remove() {
            tech.isAoESlow = false
        }
    },
    {
        name: "triple point",
        descriptionFunction() {
            return `<strong>+5</strong> second <strong class='color-s'>freeze</strong> duration`
        },
        isGunTech: true,
        maxCount: 3,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        // allowed() {
        //     return (m.fieldMode === 2 && m.coupling > 0) || (tech.haveGunCheck("shotgun") && tech.isIceShot)
        // },
        // requires: "perfect diamagnetism",
        allowed() {
            return (tech.isIceCrystals || tech.isSporeFreeze || (m.fieldMode === 4 && simulation.molecularMode === 2) || tech.isIceShot || tech.isNeedleIce || (m.coupling && (m.fieldMode === 2 || m.fieldMode === 0)))
        },
        requires: "a localized freeze effect",
        effect() {
            tech.iceIXFreezeTime += 5 * 60
            // powerUps.spawnDelay("coupling", 10)
        },
        remove() {
            tech.iceIXFreezeTime = 150
            // if (this.count) m.couplingChange(-10 * this.count)
        }
    },
    {
        name: "incendiary ammunition",
        description: "<strong>shotgun</strong>, <strong>rivets</strong>, <strong>super balls</strong>, and <strong>drones</strong><br>are loaded with <strong class='color-e'>explosives</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return (tech.haveGunCheck("shotgun") && !tech.isNailShot && !tech.isIceShot && !tech.isRivets && !tech.isFoamShot && !tech.isSporeWorm && !tech.isSporeFlea && !tech.isNeedles) || ((tech.haveGunCheck("super balls") || tech.isSuperMine) && !tech.isSuperBounce && !tech.isFoamBall && !tech.isSuperHarm) || (tech.isRivets && !tech.isNailCrit) || (m.fieldMode === 4 && simulation.molecularMode === 3) || (tech.haveGunCheck("drones") && !tech.isForeverDrones && !tech.isDroneRadioactive && !tech.isDroneTeleport)
        },
        requires: "shotgun, super balls, rivets, drones, not irradiated drones, burst drones, polyurethane, Zectron",
        effect() {
            tech.isIncendiary = true
        },
        remove() {
            tech.isIncendiary = false;
        }
    },
    {
        name: "rebound",
        description: `after they collide with a mob, <strong>super balls</strong><br>gain <strong class="color-speed">speed</strong>, <strong>duration</strong>, and <strong>1.3x</strong> <strong class='color-d'>damage</strong>`,
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return (tech.haveGunCheck("super balls") || tech.isSuperMine) && !tech.isIncendiary && !tech.isFoamBall
        },
        requires: "super balls, not incendiary",
        effect() {
            tech.isSuperBounce = true
        },
        remove() {
            tech.isSuperBounce = false
        }
    },
    {
        name: "Zectron",
        description: `<strong>2x</strong> <strong>super ball</strong> <strong class='color-d'>damage</strong>, but<br>after colliding with <strong>super balls</strong> <strong>-4</strong> <strong class='color-f'>energy</strong>`,
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return (tech.haveGunCheck("super balls") || tech.isSuperMine) && !tech.isIncendiary && !tech.isBulletTeleport
        },
        requires: "super balls not incendiary ammunition, uncertainty principle",
        effect() {
            tech.isSuperHarm = true
        },
        remove() {
            tech.isSuperHarm = false
        }
    },
    {
        name: "polyurethane foam",
        description: "<strong>super balls</strong> and <strong>harpoons</strong> colliding with <strong>mobs</strong><br>catalyzes a reaction that yields <strong>foam</strong> bubbles",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return ((tech.haveGunCheck("super balls") || tech.isSuperMine) && !tech.isSuperBounce) || (tech.haveGunCheck("harpoon") && !tech.fragments) || tech.isHookDefense
        },
        requires: "super balls, harpoon, not fragmentation",
        effect() {
            tech.isFoamBall = true;
        },
        remove() {
            tech.isFoamBall = false;
        }
    },
    {
        name: "autocannon",
        description: "fire <strong>+2</strong> <strong>super balls</strong> in a line<br><strong>1.4x</strong> <strong>super ball</strong> velocity and gravity",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("super balls") && !tech.oneSuperBall
        },
        requires: "super balls, but not the tech super ball",
        effect() {
            tech.superBallDelay = true
            for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                if (b.guns[i].name === "super balls") b.guns[i].chooseFireMethod()
            }
        },
        remove() {
            if (tech.superBallDelay) {
                tech.superBallDelay = false;
                for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                    if (b.guns[i].name === "super balls") b.guns[i].chooseFireMethod()
                }
            }
        }
    },
    {
        name: "super duper",
        description: `randomly fire <strong>+0</strong>, <strong>+1</strong>, <strong>+2</strong>, or <strong>+3</strong> extra <strong>super balls</strong>`,
        isGunTech: true,
        maxCount: 9,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return (tech.haveGunCheck("super balls") || tech.isSuperMine) && !tech.oneSuperBall
        },
        requires: "super balls, not super ball",
        effect() {
            tech.extraSuperBalls += 4
        },
        remove() {
            tech.extraSuperBalls = 0;
        }
    },
    {
        name: "super ball",
        description: "fire just <strong>1 large</strong> super <strong>ball</strong><br>that <strong>stuns</strong> mobs for <strong>2</strong> second",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return (tech.haveGunCheck("super balls") || tech.isSuperMine) && !tech.extraSuperBalls && !tech.superBallDelay
        },
        requires: "super balls, not super duper or autocannon",
        effect() {
            tech.oneSuperBall = true;
            for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                if (b.guns[i].name === "super balls") b.guns[i].chooseFireMethod()
            }
        },
        remove() {
            if (tech.oneSuperBall) {
                tech.oneSuperBall = false;
                for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                    if (b.guns[i].name === "super balls") b.guns[i].chooseFireMethod()
                }
            }
        }
    },
    {
        name: "phase velocity",
        description: "wave particles <strong>propagate</strong> faster as <strong>solids</strong><br><strong>1.4x</strong> wave <strong class='color-d'>damage</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("wave") && !tech.isLongitudinal
        },
        requires: "wave, not phonon",
        effect() {
            tech.isPhaseVelocity = true;
        },
        remove() {
            tech.isPhaseVelocity = false;
        }
    },
    {
        name: "amplitude",
        description: "<strong>1.4x</strong> wave <strong class='color-d'>damage</strong><br><strong>1.4x</strong> wave bullet <strong>amplitude</strong>",
        isGunTech: true,
        maxCount: 3,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("wave") || tech.isSoundBotUpgrade
        },
        requires: "wave",
        effect() {
            tech.waveFrequency *= 0.66
            tech.wavePacketDamage *= 1.4
        },
        remove() {
            tech.waveFrequency = 0.2  //adjust this to make the waves much larger
            tech.wavePacketDamage = 1
        }
    },
    {
        name: "propagation",
        description: `<strong>0.75x</strong> wave propagation <strong class="color-speed">speed</strong><br><strong>1.4x</strong> wave <strong class='color-d'>damage</strong>`,
        isGunTech: true,
        maxCount: 9,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("wave") || tech.isSoundBotUpgrade
        },
        requires: "wave",
        effect() {
            tech.waveBeamSpeed *= 0.75;
            tech.waveBeamDamage += 0.3 * 0.4 //this sets base  wave damage
        },
        remove() {
            tech.waveBeamSpeed = 11;
            tech.waveBeamDamage = 0.3 //this sets base  wave damage
        }
    },
    {
        name: "bound state",
        description: "wave packets <strong>reflect</strong> backwards <strong>2</strong> times<br><strong>0.7x</strong> wave <strong>range</strong>",
        isGunTech: true,
        maxCount: 9,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("wave") && !tech.isLongitudinal
        },
        requires: "wave, not phonon",
        effect() {
            tech.waveReflections += 2
        },
        remove() {
            tech.waveReflections = 1
        }
    },
    {
        name: "frequency",
        description: `<strong>wave</strong> has unlimited <strong class='color-ammo'>ammo</strong><br><strong>0.75x</strong> wave <strong class='color-d'>damage</strong>`,
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed: () => tech.haveGunCheck("wave"),
        requires: "wave",
        effect() {
            tech.isInfiniteWaveAmmo = true
            b.guns[3].savedAmmo = b.guns[3].ammo
            b.guns[3].ammo = Infinity
            simulation.updateGunHUD();
        },
        remove() {
            tech.isInfiniteWaveAmmo = false
            if (this.count > 0 && b.guns[3].savedAmmo !== undefined) {
                b.guns[3].ammo = b.guns[3].savedAmmo
                simulation.updateGunHUD();
                requestAnimationFrame(() => { simulation.updateGunHUD(); });
            } else if (b.guns[3].ammo === Infinity) {
                b.guns[3].ammo = 0
            }
        }
    },
    {
        name: "phonon",
        description: "waves are low <strong>frequency</strong>, high <strong class='color-d'>damage</strong><br><strong>expanding arcs</strong> that propagate through <strong>solids</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 3,
        frequencyDefault: 3,
        allowed() {
            return tech.haveGunCheck("wave") && !tech.isPhaseVelocity && tech.waveReflections === 1
        },
        requires: "wave, not phase velocity, bound state",
        ammoScale: 6,
        effect() {
            tech.isLongitudinal = true;
            b.guns[3].chooseFireMethod()
            b.guns[3].ammoPack /= this.ammoScale
            if (tech.isInfiniteWaveAmmo) {
                b.guns[3].savedAmmo = Math.ceil(b.guns[3].savedAmmo / this.ammoScale); //used with low frequency
            } else {
                b.guns[3].ammo = Math.ceil(b.guns[3].ammo / this.ammoScale);
            }
            simulation.updateGunHUD();
        },
        remove() {
            tech.isLongitudinal = false;
            if (this.count > 0) {
                b.guns[3].chooseFireMethod()
                b.guns[3].ammoPack *= this.ammoScale
                if (tech.isInfiniteWaveAmmo) {
                    b.guns[3].savedAmmo = Math.ceil(b.guns[3].savedAmmo * this.ammoScale); //used with low frequency
                } else {
                    b.guns[3].ammo = Math.ceil(b.guns[3].ammo * this.ammoScale);
                }
                simulation.updateGunHUD();
            }
        }
    },
    {
        name: "isotropic",
        description: "<strong>waves</strong> expand in <strong>all</strong> directions<br><strong>0.6x</strong> <strong>range</strong> and <strong>1.5x</strong> <strong class='color-d'>damage</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 3,
        frequencyDefault: 3,
        allowed() {
            return tech.isLongitudinal && tech.haveGunCheck("wave") && !tech.isBulletTeleport
        },
        requires: "wave, phonon, not uncertainty principle",
        effect() {
            tech.is360Longitudinal = true;
            b.guns[3].chooseFireMethod()
        },
        remove() {
            tech.is360Longitudinal = false;
            b.guns[3].chooseFireMethod()
        }
    },
    {
        name: "mechanical resonance",
        description: "after a <strong class='color-block'>block</strong> gets vibrated by a <strong>phonon</strong><br>there is a chance it's <strong>flung</strong> at nearby mobs",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return (tech.isLongitudinal && tech.haveGunCheck("wave")) || tech.isSoundBotUpgrade
        },
        requires: "wave, phonon",
        effect() {
            tech.isPhononBlock = true
        },
        remove() {
            tech.isPhononBlock = false
        }
    },
    {
        name: "sympathetic resonance",
        description: "after a <strong>mob</strong> gets vibrated by a <strong>phonon</strong><br>a new <strong>resonance wave</strong> expands",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return (tech.isLongitudinal && tech.haveGunCheck("wave")) || tech.isSoundBotUpgrade
        },
        requires: "wave, phonon",
        effect() {
            tech.isPhononWave = true
        },
        remove() {
            tech.isPhononWave = false
        }
    },
    {
        name: "missile-bot",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Robot' class="link">missile-bot</a>`,
        description: `use ${powerUps.orb.research(1)}to trade your <strong>missile</strong> <strong class='color-g'>gun</strong><br>for a <strong class='color-bot'>bot</strong> that fires <strong>missiles</strong>`,
        // isGunTech: true,
        isRemoveGun: true,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isBot: true,
        isBotTech: true,
        isInstant: true,
        allowed() {
            return tech.haveGunCheck("missiles", false) && tech.missileFireCD === 45 && (build.isExperimentSelection || powerUps.research.count > 0)
        },
        requires: "missiles, not launch system",
        effect() {
            tech.missileBotCount++;
            b.missileBot();
            if (tech.haveGunCheck("missiles", false)) b.removeGun("missiles") //remove your last gun
            for (let i = 0; i < 1; i++) {
                if (powerUps.research.count > 0) powerUps.research.changeRerolls(-1)
            }
        },
        remove() {
            // if (this.count) {
            //     tech.missileBotCount = 0;
            //     b.clearPermanentBots();
            //     b.respawnBots();
            //     if (!tech.haveGunCheck("missiles", false)) b.giveGuns("missiles")
            //     powerUps.research.changeRerolls(1)
            // }
        }
    },
    {
        name: "cruise missile",
        description: "<strong>2x</strong> <strong>missile</strong> <strong class='color-e'>explosive</strong> <strong class='color-d'>damage</strong>, radius<br><strong>0.5x</strong> <strong>missile</strong> speed",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return (tech.haveGunCheck("missiles") && tech.missileFireCD === 45) || (m.fieldMode === 4 && simulation.molecularMode === 1) || tech.missileBotCount
        },
        requires: "missiles, not launch system",
        effect() {
            tech.isMissileBig = true
        },
        remove() {
            tech.isMissileBig = false
        }
    },
    {
        name: "ICBM",
        description: "<strong>1.75x</strong> <strong>missile</strong> <strong class='color-e'>explosive</strong> <strong class='color-d'>damage</strong>, radius<br><strong>0.5x</strong> <strong>missile</strong> speed",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return (tech.haveGunCheck("missiles") || (m.fieldMode === 4 && simulation.molecularMode === 1)) && tech.isMissileBig
        },
        requires: "missiles, cruise missile",
        effect() {
            tech.isMissileBiggest = true
        },
        remove() {
            tech.isMissileBiggest = false
        }
    },
    {
        name: "launch system",
        description: `<strong>5x</strong> <strong>missile</strong> <strong class='color-g'>gun</strong> <em>fire rate</em><br><strong>1.2x</strong> missile <strong class='color-ammo'>ammo</strong> per ${powerUps.orb.ammo(1)}`,
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("missiles") && !tech.isMissileBig
        },
        requires: "missiles, not cruise missile",
        ammoBonus: 1.2,
        effect() {
            tech.missileFireCD = 10
            for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                if (b.guns[i].name === "missiles") {
                    b.guns[i].ammoPack *= this.ammoBonus;
                    b.guns[i].ammo = Math.ceil(b.guns[i].ammo * this.ammoBonus);
                    simulation.updateGunHUD();
                    break
                }
            }
        },
        remove() {
            tech.missileFireCD = 45;
            if (this.count > 0) {
                for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                    if (b.guns[i].name === "missiles") {
                        b.guns[i].ammoPack /= this.ammoBonus;
                        b.guns[i].ammo = Math.ceil(b.guns[i].ammo / this.ammoBonus);
                        simulation.updateGunHUD();
                        break
                    }
                }
            }
        }
    },
    {
        name: "iridium-192",
        description: "<strong class='color-e'>explosions</strong> release <strong class='color-p'>gamma radiation</strong><br><strong>2x</strong> <strong class='color-e'>explosion</strong> <strong class='color-d'>damage</strong> over <strong>4</strong> seconds",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return !tech.isImmuneExplosion && tech.explosiveRadius === 1 && !tech.isSmallExplosion && !tech.isBlockExplode && !tech.fragments && (tech.haveGunCheck("missiles") || tech.missileBotCount || tech.isIncendiary || (tech.haveGunCheck("grenades") && !tech.isNeutronBomb) || tech.isPulseLaser || (m.fieldMode === 4 && simulation.molecularMode === 1) || tech.isBoomBotUpgrade || tech.isTokamak)
        },
        requires: "an explosive damage source, not ammonium nitrate, nitroglycerin, chain reaction, fragmentation, electric armor",
        effect() {
            tech.isExplodeRadio = true; //iridium-192
        },
        remove() {
            tech.isExplodeRadio = false;
        }
    },
    {
        name: "fragmentation",
        description: "some <strong class='color-e'>detonations</strong> and collisions eject <strong>nails</strong><br><em style = 'font-size: 90%'>blocks, grenades, missiles, rivets, harpoon</em>",
        isGunTech: true,
        maxCount: 9,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return !tech.isExplodeRadio && ((tech.haveGunCheck("harpoon") && !tech.isFoamBall) || (tech.haveGunCheck("grenades") && !tech.isNeutronBomb) || tech.haveGunCheck("missiles") || (m.fieldMode === 4 && simulation.molecularMode === 1) || tech.missileBotCount || tech.isRivets || tech.blockDamage > 0.075 || tech.isHookDefense)
        },
        requires: "grenades, missiles, rivets, harpoon, or mass driver, not iridium-192, not polyurethane foam",
        effect() {
            tech.fragments++
        },
        remove() {
            tech.fragments = 0
        }
    },
    {
        name: "ammonium nitrate",
        description: "<strong>1.25x</strong> <strong class='color-e'>explosive</strong> <strong class='color-d'>damage</strong>, radius",
        isGunTech: true,
        maxCount: 9,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return !tech.isExplodeRadio && tech.hasExplosiveDamageCheck()
        },
        requires: "an explosive damage source, not iridium-192",
        effect() {
            tech.explosiveRadius += 0.25;
        },
        remove() {
            tech.explosiveRadius = 1;
        }
    },
    {
        name: "nitroglycerin",
        description: "<strong>1.7x</strong> <strong class='color-e'>explosive</strong> <strong class='color-d'>damage</strong><br><strong>0.7x</strong> smaller <strong class='color-e'>explosive</strong> <strong>radius</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return !tech.isExplodeRadio && tech.hasExplosiveDamageCheck() && !tech.isExplosionHarm
        },
        requires: "an explosive damage source, not iridium-192, acetone peroxide",
        effect() {
            tech.isSmallExplosion = true;
        },
        remove() {
            tech.isSmallExplosion = false;
        }
    },
    {
        name: "acetone peroxide",
        description: "<strong>1.7x</strong> <strong class='color-e'>explosive</strong> <strong>radius</strong><br><strong>1.4x</strong> <strong class='color-e'>explosive</strong> <strong class='color-defense'>damage taken</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        isBadRandomOption: true,
        allowed() {
            return tech.hasExplosiveDamageCheck() && !tech.isSmallExplosion
        },
        requires: "an explosive damage source, not nitroglycerin",
        effect() {
            tech.isExplosionHarm = true;
        },
        remove() {
            tech.isExplosionHarm = false;
        }
    },
    {
        name: "shock wave",
        description: "<strong>mines</strong> and <strong class='color-p' style='letter-spacing: 2px;'>sporangium</strong> <strong>stun</strong> for <strong>3-5</strong> seconds<br><strong class='color-e'>explosions</strong> <strong>stun</strong> for <strong>0.5</strong> seconds",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return tech.haveGunCheck("spores") || tech.haveGunCheck("mine") || (!tech.isExplodeRadio && tech.hasExplosiveDamageCheck())
        },
        requires: "mine, spores, an explosive damage source, not iridium-192",
        effect() {
            tech.isStun = true;
        },
        remove() {
            tech.isStun = false;
        }
    },
    {
        name: "shaped charge",
        description: `use ${powerUps.orb.research(2)} to dynamically <strong>reduce</strong><br>all <strong class='color-e'>explosions</strong> to prevent <strong class='color-h'>health</strong> loss`,
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return !tech.isImmuneExplosion && (build.isExperimentSelection || powerUps.research.count > 1) && (tech.haveGunCheck("missiles") || (m.fieldMode === 4 && simulation.molecularMode === 1) || tech.missileBotCount > 0 || tech.isIncendiary || tech.isPulseLaser || tech.isTokamak || (tech.haveGunCheck("grenades") && !tech.isNeutronBomb))
        },
        requires: "an explosive damage source, not rocket propelled grenade",
        effect() {
            tech.isSmartRadius = true;
            for (let i = 0; i < 2; i++) {
                if (powerUps.research.count > 0) powerUps.research.changeRerolls(-1)
            }
        },
        remove() {
            tech.isSmartRadius = false;
            if (this.count > 0) powerUps.research.changeRerolls(3)
        }
    },
    {
        name: "MIRV",
        description: "fire <strong>+1</strong> <strong>missile</strong> or <strong>grenade</strong> per shot<br><strong>0.88x</strong> <strong class='color-e'>explosion</strong> <strong class='color-d'>damage</strong> and <strong>radius</strong>",
        isGunTech: true,
        maxCount: 9,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("missiles") || tech.missileBotCount || tech.haveGunCheck("grenades")
        },
        requires: "missiles, grenades",
        effect() {
            tech.missileCount++;
        },
        remove() {
            tech.missileCount = 1;
        }
    },
    {
        name: "rocket-propelled grenade",
        description: "<strong>grenades</strong> <strong class='color-e'>explode</strong> on map <strong>collisions</strong><br><strong class='color-e'>explosions</strong> drain <strong class='color-f'>energy</strong>, not <strong class='color-h'>health</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("grenades") && !tech.isVacuumBomb && !tech.isSmartRadius
        },
        requires: "grenades, not vacuum bomb, shaped charges",
        effect() {
            tech.isImmuneExplosion = true;
            tech.isRPG = true;
            b.setGrenadeMode()
        },
        remove() {
            tech.isImmuneExplosion = false;
            tech.isRPG = false;
            b.setGrenadeMode()
        }
    },
    {
        name: "vacuum bomb",
        description: "<strong>grenades</strong> fire slower, <strong class='color-e'>explode</strong> bigger,<br>and <strong>suck</strong> everything towards them",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("grenades") && !tech.isNeutronBomb && !tech.isBlockExplode && !tech.isRPG
        },
        requires: "grenades, not neutron bomb, chain reaction, RPG",
        effect() {
            tech.isVacuumBomb = true;
            b.setGrenadeMode()
        },
        remove() {
            tech.isVacuumBomb = false;
            b.setGrenadeMode()
        }
    },
    {
        name: "chain reaction",
        description: "<strong>1.3x</strong> <strong>grenade</strong> radius and <strong class='color-d'>damage</strong><br><strong class='color-block'>blocks</strong> caught in <strong class='color-e'>explosions</strong> also <strong class='color-e'>explode</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("grenades") && !tech.isExplodeRadio && !tech.isNeutronBomb && !tech.isVacuumBomb
        },
        requires: "grenades, not iridium-192, neutron bomb, vacuum bomb",
        effect() {
            tech.isBlockExplode = true; //chain reaction
        },
        remove() {
            tech.isBlockExplode = false;
        }
    },
    {
        name: "flame test",
        description: "after <strong>grenades</strong> detonate they release<br>a colorful <strong>cluster</strong> of small <strong class='color-e'>explosions</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("grenades") && !tech.isNeutronBomb && !tech.isCircleExplode && !tech.isPetalsExplode
        },
        requires: "grenades, not neutron bomb, pyrotechnics, fireworks",
        effect() {
            tech.isClusterExplode = true;
        },
        remove() {
            tech.isClusterExplode = false;
        }
    },
    {
        name: "pyrotechnics",
        description: "after <strong>grenades</strong> detonate they release<br>a colorful <strong>circle</strong> of <strong class='color-e'>explosions</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("grenades") && !tech.isNeutronBomb && !tech.isClusterExplode && !tech.isPetalsExplode
        },
        requires: "grenades, not neutron bomb, flame test, fireworks",
        effect() {
            tech.isCircleExplode = true;
        },
        remove() {
            tech.isCircleExplode = false;
        }
    },
    {
        name: "fireworks",
        description: "after <strong>grenades</strong> detonate they release<br>colorful <strong>petals</strong> of <strong class='color-e'>explosions</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("grenades") && !tech.isNeutronBomb && !tech.isClusterExplode && !tech.isCircleExplode
        },
        requires: "grenades, not neutron bomb, pyrotechnics, flame test",
        effect() {
            tech.isPetalsExplode = true;
        },
        remove() {
            tech.isPetalsExplode = false;
        }
    },
    {
        name: "neutron bomb",
        description: "<strong>grenades</strong> are <strong class='color-p'>irradiated</strong> with <strong class='color-p'>Cf-252</strong><br>does <strong class='color-p'>radioactive</strong> <strong class='color-d'>damage</strong> over time",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("grenades") && !tech.fragments && !tech.isVacuumBomb && !tech.isExplodeRadio && !tech.isBlockExplode && !tech.isClusterExplode && !tech.isPetalsExplode && !tech.isCircleExplode
        },
        requires: "grenades, not fragmentation, vacuum bomb, iridium-192, pyrotechnics, fireworks, flame test, chain reaction",
        effect() {
            tech.isNeutronBomb = true;
            b.setGrenadeMode()
        },
        remove() {
            tech.isNeutronBomb = false;
            b.setGrenadeMode()
        }
    },
    {
        name: "vacuum permittivity",
        description: "<strong>1.2x</strong> <strong class='color-p'>radioactive</strong> range<br>objects in range of the bomb are <strong>slowed</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.isNeutronBomb
        },
        requires: "grenades, neutron bomb",
        effect() {
            tech.isNeutronSlow = true
        },
        remove() {
            tech.isNeutronSlow = false
        }
    },
    {
        name: "radioactive contamination",
        description: "after a mob or shield <strong>dies</strong>,<br>leftover <strong class='color-p'>radiation</strong> <strong>spreads</strong> to a nearby mob",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.isNailRadiation || tech.isWormholeDamage || tech.isNeutronBomb || tech.isExplodeRadio || tech.isBlockRadiation
        },
        requires: "radiation damage source",
        effect() {
            tech.isRadioactive = true
        },
        remove() {
            tech.isRadioactive = false
        }
    },
    {
        name: "nuclear transmutation",
        description: "<strong>1.5x</strong> <strong class='color-p'>radiation</strong> <strong class='color-d'>damage</strong><br><em style = 'font-size:93%;'>nail, drone, neutron bomb, iridium, cosmic string, deflect</em>",
        isGunTech: true,
        maxCount: 9,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.isNailRadiation || tech.isWormholeDamage || tech.isNeutronBomb || tech.isExplodeRadio || tech.isBlockRadiation || tech.isDroneRadioactive
        },
        requires: "radiation damage source",
        effect() {
            tech.radioactiveDamage += 1.5
        },
        remove() {
            tech.radioactiveDamage = 1
        }
    },
    {
        name: "water shielding",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Radiation_protection#Radiation_shielding' class="link">water shielding</a>`,
        description: "reduce <strong class='color-p'>radioactive</strong> effects on you by <strong>0.8x</strong><br><em>neutron bomb, drones, explosions, slime</em>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.isNeutronBomb || tech.isDroneRadioactive || tech.isExplodeRadio
        },
        requires: "neutron bomb, irradiated drones, iridium-192",
        effect() {
            tech.isRadioactiveResistance = true
        },
        remove() {
            tech.isRadioactiveResistance = false
        }
    },
    {
        name: "ricochet",
        description: "after <strong>nails</strong> hit a mob they <strong>rebound</strong> towards<br>a new mob with <strong>2.8x</strong> <strong class='color-d'>damage</strong> per bounce",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            // return (tech.haveGunCheck("nail gun") && !tech.isRivets && !tech.isNeedles) || (tech.haveGunCheck("mines"))
            return tech.isMineDrop || tech.isNailBotUpgrade || tech.hookNails || tech.fragments || tech.nailsDeathMob || (tech.haveGunCheck("mine") && !(tech.isLaserMine || tech.isFoamMine || tech.isSuperMine)) || (tech.haveGunCheck("nail gun") && !tech.isRivets && !tech.isNeedles) || (tech.haveGunCheck("shotgun") && (tech.isNeedles || tech.isNailShot) && !tech.isRivets && !tech.isNeedles)
        },
        //
        requires: "nail gun, not rotary cannon, rivets, or needles",
        effect() {
            tech.isRicochet = true
        },
        remove() {
            tech.isRicochet = false
        }
    },
    {
        name: "booby trap",
        description: "<strong>50%</strong> chance to drop a <strong>mine</strong> from <strong>power ups</strong><br><strong>+15%</strong> <strong class='color-junk'>JUNK</strong><strong class='color-m'>tech</strong> chance",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("mine") && tech.junkChance < 1
        },
        requires: "mines",
        effect() {
            tech.isMineDrop = true;
            if (tech.isMineDrop) b.mine(m.pos, { x: 0, y: 0 }, 0)
            this.refundAmount += tech.addJunkTechToPool(0.15)
        },
        refundAmount: 0,
        remove() {
            tech.isMineDrop = false;
            if (this.count > 0 && this.refundAmount > 0) {
                tech.removeJunkTechFromPool(this.refundAmount)
                this.refundAmount = 0
            }
        }
    },
    {
        name: "elephants toothpaste",
        description: "instead of nails <strong>mines</strong> catalyze a reaction<br>that yields <strong>foam</strong> bubbles",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("mine") && !tech.isSuperMine && !tech.isRicochet && !tech.isNailRadiation && !tech.isNailCrit
        },
        requires: "mines, not blast ball, ricochet, irradiated nails, supercritical fission",
        effect() {
            tech.isFoamMine = true;
        },
        remove() {
            tech.isFoamMine = false;
        }
    },
    {
        name: "blast ball",
        descriptionFunction() {
            return `instead of nails <strong>mines</strong> fire <strong>bouncy balls</strong>`
        },
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("mine") && !tech.isFoamMine && !tech.isRicochet && !tech.isNailRadiation && !tech.isNailCrit
        },
        requires: "mines, not elephants toothpaste, ricochet, irradiated nails, supercritical fission",
        effect() {
            tech.isSuperMine = true;
        },
        remove() {
            tech.isSuperMine = false;
        }
    },
    {
        name: "laser-mines",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Laser' class="link">laser-mines</a>`,
        description: "<strong>mines</strong> laid while you are <strong>crouched</strong><br>use <strong class='color-f'>energy</strong> to emit <strong>3</strong> unaimed <strong class='color-laser'>lasers</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("mine")
        },
        requires: "mines",
        effect() {
            tech.isLaserMine = true;
        },
        remove() {
            tech.isLaserMine = false;
        }
    },
    {
        name: "sentry",
        descriptionFunction() {
            return `<strong>mines</strong> fire one ${b.guns[10].nameString()} at a time<br><strong>mines</strong> fire <strong>1.5x</strong> more ${b.guns[10].nameString('s')}`
        },
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("mine")
        },
        requires: "mines, not elephants toothpaste",
        effect() {
            tech.isMineSentry = true;
        },
        remove() {
            tech.isMineSentry = false;
        }
    },
    {
        name: "extended magazine",
        descriptionFunction() {
            return `sentry <strong>mines</strong> fire <strong>1.5x</strong> more ${b.guns[10].nameString('s')}`
        },
        isGunTech: true,
        maxCount: 9,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("mine") && tech.isMineSentry
        },
        requires: "mines, sentry",
        effect() {
            tech.sentryAmmo += 17;
        },
        remove() {
            tech.sentryAmmo = 33;
        }
    },
    {
        name: "mycelial fragmentation",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Fungus' class="link">mycelial fragmentation</a>`,
        description: "during their <strong>growth</strong> phase<br><strong>1.7x</strong> <strong class='color-p' style='letter-spacing: 2px;'>sporangium</strong> discharge",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("spores")
        },
        requires: "spores",
        effect() {
            tech.isSporeGrowth = true
        },
        remove() {
            tech.isSporeGrowth = false
        }
    },
    {
        name: "cordyceps",
        // descriptionFunction() {
        //     return `mobs infected by ${b.guns[6].nameString('s')} have a <strong>5%</strong> chance<br>to <strong>resurrect</strong> and attack other mobs`
        // },
        description: "<strong class='color-p' style='letter-spacing: 2px;'>sporangium</strong> <strong>infect</strong> mobs they attach to<br><strong>infected</strong> mobs <strong>resurrect</strong> and attack other mobs",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("spores")
        },
        requires: "spores",
        effect() {
            tech.isZombieMobs = true
        },
        remove() {
            tech.isZombieMobs = false
        }
    },
    {
        name: "colony",
        description: "<strong>1.6x</strong> <strong class='color-p' style='letter-spacing: 2px;'>sporangium</strong> discharge<br><strong>33%</strong> chance to discharge something different",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Colony_(biology)' class="link">colony</a>`,
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("spores")
        },
        requires: "spores",
        effect() {
            tech.isSporeColony = true
        },
        remove() {
            tech.isSporeColony = false
        }
    },
    {
        name: "cryodesiccation",
        descriptionFunction() {
            return `<strong>1.25x</strong> <strong class='color-p' style='letter-spacing: 2px;'>sporangium</strong> discharge<br> ${b.guns[6].nameString('s')} <strong class='color-s'>freeze</strong> mobs for <strong>1.5</strong> second`
        },
        // description: "<strong>+25%</strong> <strong class='color-p' style='letter-spacing: 2px;'>sporangium</strong> discharge<br><strong class='color-p' style='letter-spacing: 2px;'>spores</strong> <strong class='color-s'>freeze</strong> mobs for <strong>1.5</strong> second",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("spores") || tech.sporesOnDeath > 0 || (m.fieldMode === 4 && simulation.molecularMode === 0) || tech.isSporeWorm || tech.isSporeFlea
        },
        requires: "spores",
        effect() {
            tech.isSporeFreeze = true
        },
        remove() {
            tech.isSporeFreeze = false
        }
    },
    {
        name: "flagella",
        descriptionFunction() {
            return `<strong>2x</strong> ${b.guns[6].nameString()} acceleration<br>if they can't find a target ${b.guns[6].nameString('s')} follow you`
        },
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("spores") || tech.sporesOnDeath > 0 || (m.fieldMode === 4 && simulation.molecularMode === 0) || tech.isSporeWorm || tech.isSporeFlea
        },
        requires: "spores",
        effect() {
            tech.isSporeFollow = true
        },
        remove() {
            tech.isSporeFollow = false
        }
    },
    {
        name: "mutualism",
        descriptionFunction() {
            return `<strong>3x</strong> ${b.guns[6].nameString()} <strong class='color-d'>damage</strong><br>${b.guns[6].nameString('s')} borrow <strong>1</strong> <strong class='color-h'>health</strong> until they <strong>die</strong>`
        },
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return (tech.haveGunCheck("spores") || tech.sporesOnDeath > 0 || (m.fieldMode === 4 && simulation.molecularMode === 0)) || tech.isSporeWorm || tech.isSporeFlea
        },
        requires: "spores",
        effect() {
            tech.isMutualism = true
        },
        remove() {
            tech.isMutualism = false
        }
    },
    {
        name: "necrophage",
        description: "if <strong>foam</strong>, <strong class='color-p' style='letter-spacing: -0.8px;'>fleas</strong>, or <strong class='color-p' style='letter-spacing: -0.8px;'>worms</strong> <strong>kill</strong> their target<br>they grow 3 <strong>copies</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("foam") || tech.isFoamBall || tech.isFoamBotUpgrade || tech.isFoamShot || tech.isSporeWorm || tech.isSporeFlea || tech.isFoamMine
        },
        requires: "foam, spores, worms, fleas",
        effect() {
            tech.isSpawnBulletsOnDeath = true
        },
        remove() {
            tech.isSpawnBulletsOnDeath = false;
        }
    },
    {
        name: "siphonaptera",
        description: "<strong class='color-p' style='letter-spacing: 2px;'>spores</strong> metamorphose into <strong class='color-p' style='letter-spacing: -0.8px;'>fleas</strong><br><strong>shotgun</strong> fires <strong class='color-p' style='letter-spacing: -0.8px;'>fleas</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 3,
        frequencyDefault: 3,
        allowed() {
            return (tech.haveGunCheck("spores") || tech.sporesOnDeath > 0 || (m.fieldMode === 4 && simulation.molecularMode === 0) || (tech.haveGunCheck("shotgun") && !tech.isIncendiary && !tech.isRivets && !tech.isIceShot && !tech.isFoamShot && !tech.isNeedles && !tech.isNailShot)) && !tech.isSporeWorm
        },
        requires: "spores, not worms",
        effect() {
            tech.isSporeFlea = true
        },
        remove() {
            tech.isSporeFlea = false

        }
    },
    {
        name: "nematodes",
        description: "<strong class='color-p' style='letter-spacing: 2px;'>spores</strong> metamorphose into <strong class='color-p' style='letter-spacing: -0.8px;'>worms</strong><br><strong>shotgun</strong> fires <strong class='color-p' style='letter-spacing: -0.8px;'>worms</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 3,
        frequencyDefault: 3,
        allowed() {
            return (tech.haveGunCheck("spores") || tech.sporesOnDeath > 0 || (m.fieldMode === 4 && simulation.molecularMode === 0) || (tech.haveGunCheck("shotgun") && !tech.isIncendiary && !tech.isRivets && !tech.isIceShot && !tech.isFoamShot && !tech.isNeedles && !tech.isNailShot)) && !tech.isSporeFlea
        },
        requires: "spores, not fleas",
        effect() {
            tech.isSporeWorm = true
        },
        remove() {
            tech.isSporeWorm = false
        }
    },
    {
        name: "K-selection",
        description: "<strong>1.37x</strong> <strong class='color-p' style='letter-spacing: -0.8px;'>worm</strong> and <strong class='color-p' style='letter-spacing: -0.8px;'>flea</strong> <strong class='color-d'>damage</strong>",
        isGunTech: true,
        maxCount: 3,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.isSporeWorm || tech.isSporeFlea
        },
        requires: "spores, shotgun, worms, fleas",
        effect() {
            tech.wormSize++
        },
        remove() {
            tech.wormSize = 0
        }
    },
    {
        name: "path integration",
        descriptionFunction() {
            return `<strong>drones</strong> and ${b.guns[6].nameString("s")}<br>travel with you through <strong>levels</strong>`
        },
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return (tech.isSporeFollow && (tech.haveGunCheck("spores") || (tech.haveGunCheck("shotgun") && tech.isSporeWorm))) || tech.haveGunCheck("drones") || (m.fieldMode === 4 && (simulation.molecularMode === 0 || simulation.molecularMode === 3))
        },
        requires: "spores, worms, flagella, drones",
        effect() {
            tech.isDronesTravel = true
        },
        remove() {
            tech.isDronesTravel = false
        }
    },
    {
        name: "fault tolerance",
        description: `use ${powerUps.orb.research(2)}to trade your <strong>drone</strong> <strong class='color-g'>gun</strong><br>for <strong>5</strong> <strong>drones</strong> that last <strong>forever</strong>`,
        // isGunTech: true,
        isRemoveGun: true,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isInstant: true,
        allowed() {
            return tech.haveGunCheck("drones", false) && !tech.isDroneRespawn && tech.bulletsLastLonger === 1 && !tech.isDronesTravel && (build.isExperimentSelection || powerUps.research.count > 1)
        },
        requires: "drones, not drone repair, anti-shear topology, autonomous navigation",
        effect() {
            const num = 5
            tech.isForeverDrones += num
            if (tech.haveGunCheck("drones", false)) b.removeGun("drones")
            //spawn drones
            if (tech.isDroneRadioactive) {
                for (let i = 0; i < num * 0.25; i++) {
                    b.droneRadioactive({
                        x: m.pos.x + 30 * (Math.random() - 0.5),
                        y: m.pos.y + 30 * (Math.random() - 0.5)
                    }, 5)
                    bullet[bullet.length - 1].endCycle = Infinity
                }
            } else {
                for (let i = 0; i < num; i++) {
                    b.drone({
                        x: m.pos.x + 30 * (Math.random() - 0.5),
                        y: m.pos.y + 30 * (Math.random() - 0.5)
                    }, 5)
                    bullet[bullet.length - 1].endCycle = Infinity
                }
            }
            for (let i = 0; i < 2; i++) {
                if (powerUps.research.count > 0) powerUps.research.changeRerolls(-1)
            }
        },
        remove() {
            tech.isForeverDrones = 0
            // if (this.count && !tech.haveGunCheck("drones", false)) b.giveGuns("drones")
            // if (this.count > 0) powerUps.research.changeRerolls(2)
        }
    },
    {
        name: "reduced tolerances",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Engineering_tolerance' class="link">reduced tolerances</a>`,
        description: `<strong>2x</strong> <strong>drones</strong> per ${powerUps.orb.ammo()} and <strong class='color-f'>energy</strong><br><strong>0.6x</strong> drone <strong>duration</strong>`,
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return !tech.isDroneRadioactive && (tech.haveGunCheck("drones") || (m.fieldMode === 4 && simulation.molecularMode === 3))
        },
        requires: "drones, not irradiated drones",
        effect() {
            tech.droneCycleReduction = 0.6
            tech.droneEnergyReduction = 0.3
            for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                if (b.guns[i].name === "drones") b.guns[i].ammoPack *= 2
            }
        },
        remove() {
            tech.droneCycleReduction = 1
            tech.droneEnergyReduction = 1
            if (this.count > 0) {
                for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                    if (b.guns[i].name === "drones") b.guns[i].ammoPack /= 2
                }
            }
        }
    },
    {
        name: "delivery drone",
        description: "if a <strong>drone</strong> picks up a <strong>power up</strong>,<br>it becomes <strong>larger</strong>, <strong>faster</strong>, and more <strong>durable</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("drones") || tech.isForeverDrones || (m.fieldMode === 4 && simulation.molecularMode === 3)
        },
        requires: "drones",
        effect() {
            tech.isDroneGrab = true
        },
        remove() {
            tech.isDroneGrab = false
        }
    },
    {
        name: "von Neumann probe",  //"drone repair",
        description: "after a <strong>drone</strong> expires it will use <strong>-4</strong> <strong class='color-f'>energy</strong><br>and a nearby <strong class='color-block'>block</strong> to <strong>replicate</strong> itself",
        // description: "broken <strong>drones</strong> <strong>repair</strong> if the drone <strong class='color-g'>gun</strong> is active<br><strong>repairing</strong> has a <strong>25%</strong> chance to use <strong>1</strong> <strong>drone</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("drones") || (m.fieldMode === 4 && simulation.molecularMode === 3)
        },
        requires: "drones",
        effect() {
            tech.isDroneRespawn = true
        },
        remove() {
            tech.isDroneRespawn = false
        }
    },
    {
        name: "brushless motor",
        description: "<strong>drones</strong> rapidly <strong>rush</strong> towards their target<br><strong>1.33x</strong> <strong>drone</strong> collision <strong class='color-d'>damage</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 3,
        frequencyDefault: 3,
        allowed() {
            return (tech.haveGunCheck("drones") || tech.isForeverDrones || (m.fieldMode === 4 && simulation.molecularMode === 3)) && !tech.isDroneRadioactive && !tech.isIncendiary
        },
        requires: "drones, molecular assembler, not irradiated drones, incendiary",
        effect() {
            tech.isDroneTeleport = true
        },
        remove() {
            tech.isDroneTeleport = false
        }
    },
    {
        name: "axial flux motor",
        description: "<strong>1.66x</strong> <strong>drones</strong> <strong>rush</strong> frequency<br><strong>1.44x</strong> <strong>drone</strong> collision <strong class='color-d'>damage</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.isDroneTeleport
        },
        requires: "drones, brushless motor",
        effect() {
            tech.isDroneFastLook = true
        },
        remove() {
            tech.isDroneFastLook = false
        }
    },
    {
        name: "irradiated drones",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Irradiation' class="link">irradiated drones</a>`,
        description: `the space around <strong>drones</strong> is <strong class='color-p'>irradiated</strong><br><strong>0.25x</strong> <strong>drones</strong> per ${powerUps.orb.ammo()} and <strong class='color-f'>energy</strong>`,
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.droneCycleReduction === 1 && !tech.isIncendiary && !tech.isDroneTeleport && (tech.haveGunCheck("drones") || tech.isForeverDrones || (m.fieldMode === 4 && simulation.molecularMode === 3))
        },
        requires: "drones, not reduced tolerances, incendiary, torque bursts",
        effect() {
            tech.isDroneRadioactive = true
            for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                if (b.guns[i].name === "drones") {
                    b.guns[i].ammoPack *= 0.25
                    b.guns[i].ammo = Math.ceil(b.guns[i].ammo * 0.25)
                    simulation.makeGunHUD();
                }
            }
        },
        remove() {
            tech.isDroneRadioactive = false
            if (this.count > 0) {
                for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                    if (b.guns[i].name === "drones") {
                        b.guns[i].ammoPack /= 0.25
                        b.guns[i].ammo = b.guns[i].ammo * 4
                        simulation.makeGunHUD();
                    }
                }
            }
        }
    },
    {
        name: "beta radiation", //"control rod ejection",
        description: "<strong>0.5x</strong> <strong>drone</strong> duration<br><strong>2x</strong> <strong>drone</strong> <strong class='color-p'>radiation</strong> <strong class='color-d'>damage</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.isDroneRadioactive
        },
        requires: "drones, irradiated drones",
        effect() {
            tech.droneRadioDamage = 2
        },
        remove() {
            tech.droneRadioDamage = 1
        }
    },
    {
        name: "orthocyclic winding",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Coil_winding_technology' class="link">orthocyclic winding</a>`,
        description: "<strong>1.66x</strong> <strong>drone</strong> acceleration<br><strong>1.33x</strong> <strong class='color-p'>radiation</strong> <strong class='color-d'>damage</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.isDroneRadioactive
        },
        requires: "drones, irradiated drones",
        effect() {
            tech.isFastDrones = true
        },
        remove() {
            tech.isFastDrones = false
        }
    },
    {
        name: "electrostatic induction",
        description: "<strong>foam</strong> bubbles are electrically charged<br>causing <strong>attraction</strong> to nearby <strong>mobs</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return tech.haveGunCheck("foam") || tech.isFoamBotUpgrade || tech.isFoamShot || tech.isFoamBall || tech.isFoamMine
        },
        requires: "foam",
        effect() {
            tech.isFoamAttract = true
        },
        remove() {
            tech.isFoamAttract = false
        }
    },
    {
        name: "uncertainty principle",
        description: "<strong>foam</strong>, <strong>wave</strong>, and <strong>super ball</strong> positions are erratic<br><strong>1.5x</strong> <strong>foam</strong>, <strong>wave</strong>, and <strong>super ball</strong> <strong class='color-d'>damage</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return (tech.haveGunCheck("foam") || tech.isFoamBotUpgrade || tech.isFoamShot || tech.isFoamBall || tech.isFoamMine) || (tech.haveGunCheck("wave") && !tech.is360Longitudinal) || (tech.haveGunCheck("super balls") && !tech.isSuperHarm) || tech.isSoundBotUpgrade
        },
        requires: "foam, wave, super balls, not isotropic, Zectron",
        effect() {
            tech.isBulletTeleport = true
        },
        remove() {
            tech.isBulletTeleport = false;
        }
    },
    {
        name: "surfactant",
        description: `use ${powerUps.orb.research(2)}to trade your <strong>foam</strong> <strong class='color-g'>gun</strong><br>for <strong>2</strong> <strong class='color-bot'>foam-bots</strong> and <strong>foam-bot upgrade</strong>`,
        // isGunTech: true,
        isRemoveGun: true,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        isBot: true,
        isBotTech: true,
        isInstant: true,
        requires: "foam gun, not bot upgrades, fractionation, pressure vessel",
        allowed() {
            return tech.haveGunCheck("foam", false) && !b.hasBotUpgrade() && !tech.isAmmoFoamSize && !tech.isFoamPressure && (build.isExperimentSelection || powerUps.research.count > 1)
        },
        effect() {

            requestAnimationFrame(() => { tech.giveTech("foam-bot upgrade") })
            for (let i = 0; i < 2; i++) {
                b.foamBot()
                tech.foamBotCount++;
            }
            simulation.makeTextLog(`tech.isFoamBotUpgrade = true`)
            if (tech.haveGunCheck("foam", false)) b.removeGun("foam")
            for (let i = 0; i < 2; i++) {
                if (powerUps.research.count > 0) powerUps.research.changeRerolls(-1)
            }
        },
        remove() {
            // if (this.count) {
            //     b.clearPermanentBots();
            //     b.respawnBots();
            //     if (!tech.haveGunCheck("foam")) b.giveGuns("foam")
            // }
            // if (this.count > 0) powerUps.research.changeRerolls(2)
        }
    },
    {
        name: "aerogel",
        description: "<strong>foam</strong> bubbles <strong>float</strong> with <strong>0.5x</strong> <strong>foam</strong> duration<br><strong>2.8x</strong> <strong>foam</strong> <strong class='color-d'>damage</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("foam") || tech.isFoamBotUpgrade || tech.isFoamShot || tech.isFoamBall || tech.isFoamMine
        },
        requires: "foam",
        effect() {
            tech.isFastFoam = true
            tech.foamGravity = -0.0003
        },
        remove() {
            tech.isFastFoam = false;
            tech.foamGravity = 0.00008
        }
    },
    {
        name: "surface tension",
        description: "<strong>1.4x</strong> <strong>foam</strong> <strong class='color-d'>damage</strong>",
        isGunTech: true,
        maxCount: 9,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("foam") || tech.isFoamBotUpgrade || tech.isFoamShot || tech.isFoamBall || tech.isFoamMine
        },
        requires: "foam",
        effect() {
            tech.foamDamage += 0.01 * 0.4
        },
        remove() {
            tech.foamDamage = 0.01;
        }
    },
    {
        name: "cavitation",
        description: "<strong>25%</strong> chance to discharge a huge <strong>foam</strong> bubble<br><strong>2x</strong> <strong>foam</strong> gun <strong>recoil</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("foam") || tech.isFoamBotUpgrade || tech.isFoamShot || tech.isFoamBall || tech.isFoamMine
        },
        requires: "foam",
        effect() {
            tech.isFoamCavitation = true;
            b.guns[8].knockBack = 0.001
        },
        remove() {
            tech.isFoamCavitation = false;
            b.guns[8].knockBack = 0.0005
        }
    },
    {
        name: "foam fractionation",
        description: "if you have below <strong>300</strong> <strong class='color-ammo'>ammo</strong><br><strong>2x</strong> <strong>foam</strong> <strong class='color-g'>gun</strong> bubble <strong>size</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("foam")
        },
        requires: "foam",
        effect() {
            tech.isAmmoFoamSize = true
        },
        remove() {
            tech.isAmmoFoamSize = false;
        }
    },
    {
        name: "ideal gas law",
        description: `<strong>6x</strong> <strong>foam</strong> <strong class='color-ammo'>ammo</strong> per ${powerUps.orb.ammo(1)}`, //remove <strong>all</strong> current <strong>foam</strong> <strong class='color-ammo'>ammo</strong><br>
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("foam") && !tech.isEnergyNoAmmo
        },
        requires: "foam, not non-renewables",
        // ammoLost: 0,
        effect() {
            b.guns[8].ammoPack *= 6;
            // this.ammoLost = b.guns[8].ammo
            // b.guns[8].ammo = 0
            simulation.updateGunHUD()
        },
        remove() {
            if (this.count) {
                b.guns[8].ammoPack /= 8
                // b.guns[8].ammo += this.ammoLost
                simulation.updateGunHUD()
            }
        }
    },
    {
        name: "pressure vessel",
        description: "build up <strong>charge</strong> while firing <strong>foam</strong> <strong class='color-g'>gun</strong><br>after firing <strong>discharge</strong> <strong>foam</strong> bubbles",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("foam")
        },
        requires: "foam",
        effect() {
            tech.isFoamPressure = true;
            b.guns[8].chooseFireMethod()
        },
        remove() {
            tech.isFoamPressure = false;
            b.guns[8].chooseFireMethod()
        }
    },
    {
        name: "capacitor bank",
        // description: "<strong>charge</strong> effects build up almost <strong>instantly</strong><br><em style = 'font-size:97%;'>throwing <strong class='color-block'>blocks</strong>, foam, railgun, pulse, tokamak</em>",
        descriptionFunction() {
            return `<strong>charge</strong> effects build up almost <strong>instantly</strong><br><em style = 'font-size:93%;'><strong class='color-block'>blocks</strong>, ${tech.haveGunCheck("foam", false) ? "<strong>foam</strong>" : "foam"}, ${tech.isPlasmaBall ? "<strong>plasma ball</strong>" : "plasma ball"}, ${tech.isRailGun ? "<strong>railgun</strong>" : "railgun"}, ${tech.isPulseLaser ? "<strong>pulse</strong>" : "pulse"}, ${tech.isTokamak ? "<strong>tokamak</strong>" : "tokamak"}</em>`
        },
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.blockDamage > 0.075 || tech.isRailGun || (tech.haveGunCheck("foam") && tech.isFoamPressure) || tech.isTokamak || tech.isPulseLaser || tech.isPlasmaBall
        },
        requires: "mass driver, railgun, foam, pressure vessel, pulse, tokamak, plasma ball",
        effect() {
            tech.isCapacitor = true;
        },
        remove() {
            tech.isCapacitor = false;
        }
    },
    {
        name: "Bitter electromagnet",
        descriptionFunction() {
            return `<strong>0.66x</strong> <strong>railgun</strong> charge rate<br><strong>2x</strong> <strong>harpoon</strong> density and <strong class='color-d'>damage</strong>`
        },
        isGunTech: true,
        maxCount: 3,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("harpoon") && tech.isRailGun
        },
        requires: "harpoon, railgun",
        effect() {
            tech.railChargeRate *= 1.06
            tech.harpoonDensity += 0.007
        },
        remove() {
            tech.railChargeRate = 0.97;
            tech.harpoonDensity = tech.isRailGun ? 0.007 : 0.004
        }
    },
    {
        name: "railgun",
        description: `hold fire to charge <strong>harpoon</strong> and release to launch<br><strong>harpoons</strong> can't <strong>retract</strong>`,
        // description: `<strong>+900%</strong> <strong>harpoon</strong> <strong class='color-ammo'>ammo</strong>, but it can't <strong>retract</strong><br><strong>+50%</strong> <strong>harpoon</strong> density and <strong class='color-d'>damage</strong>`,
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("harpoon") && !tech.isFilament && !tech.isHarpoonPowerUp && !tech.isBoostReplaceAmmo
        },
        requires: "harpoon, not UHMWPE, induction furnace, quasiparticles",
        ammoBonus: 9,
        effect() {
            tech.isRailGun = true;
            tech.harpoonDensity = tech.isRailGun ? 0.007 : 0.004
            b.guns[9].chooseFireMethod()
            b.guns[9].ammoPack *= 3;
            b.guns[9].ammo = b.guns[9].ammo * 6;
            simulation.updateGunHUD();
        },
        remove() {
            tech.isRailGun = false;
            if (this.count > 0) {
                tech.harpoonDensity = tech.isRailGun ? 0.007 : 0.004
                b.guns[9].chooseFireMethod()
                b.guns[9].ammoPack /= 3;
                b.guns[9].ammo = Math.ceil(b.guns[9].ammo / 6);
                simulation.updateGunHUD();
            }
        }
    },
    {
        name: "alternator",
        description: "<strong>0.05x</strong> <strong>harpoon</strong> <strong class='color-f'>energy</strong> cost",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("harpoon")
        },
        requires: "harpoon",
        effect() {
            tech.isRailEnergy = true;
        },
        remove() {
            tech.isRailEnergy = false;
        }
    },
    {
        name: "autonomous defense",
        description: "if you <strong>collide</strong> with a <strong>mob</strong><br>fire <strong>harpoons</strong> at nearby <strong>mobs</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("harpoon")
        },
        requires: "harpoon",
        effect() {
            tech.isHarpoonDefense = true
        },
        remove() {
            tech.isHarpoonDefense = false
        }
    },
    {
        name: "Bessemer process",
        descriptionFunction() {
            return `<strong>${(1 + 0.1 * Math.sqrt(b.guns[9].ammo)).toFixed(2)}x</strong> <strong>harpoon</strong> size and <strong class='color-d'>damage</strong><br><em>(effect scales by 1/10 √ harpoon <strong class='color-ammo'>ammo</strong>)</em>`
        },
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("harpoon") && !tech.isShieldPierce
        },
        requires: "harpoon, not ceramics",
        effect() {
            tech.isLargeHarpoon = true;
        },
        remove() {
            tech.isLargeHarpoon = false;
        }
    },
    {
        name: "smelting",
        descriptionFunction() {
            return `forge <strong>${this.removeAmmo()}</strong> <strong class='color-ammo'>ammo</strong> into a new harpoon<br>fire <strong>+1</strong> <strong>harpoon</strong> with each shot`
        },
        isGunTech: true,
        maxCount: 9,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        ammoRemoved: 0,
        removeAmmo() {
            return (tech.isRailGun ? 5 : 1) * (2 + 2 * this.count)
        },
        allowed() {
            return tech.haveGunCheck("harpoon") && b.guns[9].ammo >= this.removeAmmo()
        },
        requires: "harpoon",
        effect() {
            for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                if (b.guns[i].name === "harpoon") {
                    const removeAmmo = this.removeAmmo()
                    this.ammoRemoved += removeAmmo
                    b.guns[i].ammo -= removeAmmo
                    if (b.guns[i].ammo < 0) b.guns[i].ammo = 0
                    simulation.updateGunHUD();
                    tech.extraHarpoons++;
                    break
                }
            }
        },
        remove() {
            if (tech.extraHarpoons) {
                for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                    if (b.guns[i].name === "harpoon") {
                        b.guns[i].ammo += this.ammoRemoved
                        simulation.updateGunHUD();
                        break
                    }
                }
            }
            this.ammoRemoved = 0
            tech.extraHarpoons = 0;
        }
    },
    {
        name: "UHMWPE",
        descriptionFunction() {
            return `<strong>${(1 + b.guns[9].ammo * 0.0125).toFixed(2)}x</strong> <strong>harpoon</strong> rope length<br><em>(effect scales by 1/80 of harpoon <strong class='color-ammo'>ammo</strong>)</em>`
        },
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("harpoon") && !tech.isRailGun
        },
        requires: "harpoon, not railgun",
        effect() {
            tech.isFilament = true;
        },
        remove() {
            tech.isFilament = false;
        }
    },
    {
        name: "induction furnace",
        description: "after using <strong>harpoon</strong>/<strong>grapple</strong> to collect <strong>power ups</strong><br><strong>1.8x</strong> <strong>harpoon</strong> or <strong>grapple</strong> <strong class='color-d'>damage</strong> for <strong>8</strong> seconds",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return ((tech.haveGunCheck("harpoon") && !tech.isRailGun) || m.fieldMode === 10) && !tech.isHarpoonFullHealth
        },
        requires: "harpoon, grappling hook, not railgun, brittle",
        effect() {
            tech.isHarpoonPowerUp = true
        },
        remove() {
            tech.isHarpoonPowerUp = false
            tech.harpoonPowerUpCycle = 0
        }
    },
    {
        name: "brittle",
        description: "<strong>2.2x</strong> <strong>harpoon</strong>/<strong>grapple</strong> <strong class='color-d'>damage</strong><br>to <strong>mobs</strong> at maximum <strong>durability</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return (tech.haveGunCheck("harpoon") || m.fieldMode === 10) && !tech.isHarpoonPowerUp
        },
        requires: "harpoon, grappling hook, not induction furnace",
        effect() {
            tech.isHarpoonFullHealth = true
        },
        remove() {
            tech.isHarpoonFullHealth = false
        }
    },
    {
        name: "quasiparticles",
        descriptionFunction() {
            return `convert current and future ${powerUps.orb.ammo(1)} into ${powerUps.orb.boost(1)}<br>that give <strong>${(1 + powerUps.boost.damage).toFixed(2)}x</strong> <strong class='color-d'>damage</strong> for <strong>${(powerUps.boost.duration / 60).toFixed(0)}</strong> seconds</span>`
        },
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return ((tech.haveGunCheck("wave") && tech.isInfiniteWaveAmmo) || tech.haveGunCheck("laser") || (tech.haveGunCheck("harpoon") && !tech.isRailGun)) && !tech.isEnergyNoAmmo
        },
        requires: "harpoon, laser, wave, frequency, not railgun, non-renewables",
        effect() {
            tech.isBoostReplaceAmmo = true
            for (let i = powerUp.length - 1; i > -1; i--) {
                if (powerUp[i].name === "ammo") {
                    powerUps.spawn(powerUp[i].position.x + 50 * (Math.random() - 0.5), powerUp[i].position.y + 50 * (Math.random() - 0.5), "boost");
                    Matter.Composite.remove(engine.world, powerUp[i]);
                    powerUp.splice(i, 1);
                }
            }

        },
        remove() {
            tech.isBoostReplaceAmmo = false
        }
    },
    {
        name: "optical amplifier",
        description: "gain <strong>3</strong> random <strong class='color-laser'>laser</strong> <strong class='color-g'>gun</strong><strong class='color-m'>tech</strong><br><strong class='color-laser'>laser</strong> only turns <strong>off</strong> if you have no <strong class='color-f'>energy</strong>",
        // isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        isInstant: true,
        allowed() {
            return tech.haveGunCheck("laser") && !tech.isPulseLaser
        },
        requires: "laser gun, not pulse",
        effect() {
            requestAnimationFrame(() => {
                let techGiven = 0
                for (let j = 0; j < 3; j++) {
                    const names = ["quasiparticles", "lens", "compound lens", "arc length", "infrared diode", "free-electron laser", "dye laser", "relativistic momentum", "specular reflection", "diffraction grating", "diffuse beam", "output coupler", "slow light", "laser-bot", "laser-bot upgrade"]
                    //convert names into indexes
                    const options = []
                    for (let i = 0; i < names.length; i++) {
                        for (let k = 0; k < tech.tech.length; k++) {
                            if (tech.tech[k].name === names[i]) {
                                options.push(k)
                                break
                            }
                        }
                    }
                    //remove options that don't meet requirements
                    for (let i = options.length - 1; i > -1; i--) {
                        const index = options[i]
                        if (!(tech.tech[index].count < tech.tech[index].maxCount) || !tech.tech[index].allowed()) {
                            options.splice(i, 1);
                        }
                    }
                    //pick one option
                    if (options.length) {
                        const index = options[Math.floor(Math.random() * options.length)]
                        simulation.makeTextLog(`<span class='color-var'>tech</span>.giveTech("<span class='color-text'>${tech.tech[index].name}</span>") <em>//optical amplifier</em>`, 360);
                        tech.giveTech(index)
                        techGiven++
                    }
                }
                if (techGiven > 0) {
                    tech.isStuckOn = true
                } else { //eject if none found
                    simulation.makeTextLog(`0 <span class='color-var'>tech</span> found <em>//optical amplifier</em>`);
                    const loop = () => {
                        if (!simulation.paused && m.alive) {
                            for (let i = 0; i < tech.tech.length; i++) {
                                if (tech.tech[i].name === this.name) powerUps.ejectTech(i)
                            }
                            return
                        }
                        requestAnimationFrame(loop);
                    }
                    requestAnimationFrame(loop);
                }
            });
        },
        remove() {
            tech.isStuckOn = false
        }
    },
    {
        name: "relativistic momentum",
        description: "<strong class='color-laser'>lasers</strong> push <strong>mobs</strong> and <strong class='color-block'>blocks</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return (tech.haveGunCheck("laser") && !tech.isPulseLaser) || tech.isLaserBotUpgrade || tech.isLaserField
        },
        requires: "laser, not pulse",
        effect() {
            tech.isLaserPush = true;
        },
        remove() {
            tech.isLaserPush = false;
        }
    },
    {
        name: "iridescence",
        description: "if <strong class='color-laser'>laser</strong> beams hit mobs near their <strong>center</strong><br><strong>2x</strong> <strong class='color-laser'>laser</strong> <strong class='color-d'>damage</strong>",
        isGunTech: true,
        maxCount: 9,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return (tech.haveGunCheck("laser") && !tech.isPulseLaser) || tech.isLaserBotUpgrade || tech.isLaserMine
        },
        requires: "laser, not pulse",
        effect() {
            tech.laserCrit += 1;
        },
        remove() {
            tech.laserCrit = 0;
        }
    },
    {
        name: "lens",
        description: "<strong>2.5x</strong> <strong class='color-laser'>laser</strong> <strong class='color-g'>gun</strong> <strong class='color-d'>damage</strong> if it passes<br>through a revolving <strong>90°</strong> arc circular lens", //<span style='font-size: 125%;'>π</span> / 2</strong>
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("laser")
        },
        requires: "laser",
        effect() {
            tech.isLaserLens = true
            b.guns[11].chooseFireMethod()
            // if (this.count > 0) b.guns[11].lensDamageOn += 20 * Math.PI / 180
            // b.guns[11].arcRange = 0.78
        },
        remove() {
            tech.isLaserLens = false
            b.guns[11].chooseFireMethod()
            // b.guns[11].lensDamageOn = 2.5 // 100% + 150%
            // b.guns[11].arcRange = 0
        }
    },
    {
        name: "compound lens",
        description: "<strong>1.4x</strong> <strong class='color-laser'>laser</strong> lens <strong class='color-d'>damage</strong><br><strong>+25°</strong> lens arc",
        isGunTech: true,
        maxCount: 9,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("laser") && tech.isLaserLens
        },
        requires: "lens",
        effect() {
            b.guns[11].arcRange += 25 * Math.PI / 180 / 2
            b.guns[11].lensDamageOn += 0.4
        },
        remove() {
            b.guns[11].arcRange = 90 * Math.PI / 180 / 2 //0.78 divded by 2 because of how it's drawn
            b.guns[11].lensDamageOn = 2.5
        }
    },
    {
        name: "specular reflection",
        description: "<strong>+2</strong> <strong class='color-laser'>laser</strong> beam reflections",
        isGunTech: true,
        maxCount: 3,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return (tech.haveGunCheck("laser") || tech.isLaserMine || tech.isLaserBotUpgrade || tech.isLaserField) && !tech.isWideLaser && !tech.isPulseLaser && !tech.historyLaser
        },
        requires: "laser, not diffuse beam, pulse, or slow light",
        effect() {
            tech.laserReflections += 2;
        },
        remove() {
            tech.laserReflections = 2;
        }
    },
    {
        name: "diffraction grating",
        description: `<strong>+1</strong> diverging <strong class='color-laser'>laser</strong> <strong class='color-g'>gun</strong> beam`,
        isGunTech: true,
        maxCount: 9,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return tech.haveGunCheck("laser") && !tech.isWideLaser && !tech.historyLaser
        },
        requires: "laser gun, diffuse beam, or slow light",
        effect() {
            tech.beamSplitter++
            b.guns[11].chooseFireMethod()
        },
        remove() {
            if (tech.beamSplitter !== 0) {
                tech.beamSplitter = 0
                b.guns[11].chooseFireMethod()
            }
        }
    },
    {
        name: "diffuse beam",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Diffuser_(optics)' class="link">diffuse beam</a>`,
        description: "<strong class='color-laser'>laser</strong> <strong class='color-g'>gun</strong> beam is <strong>wider</strong> and doesn't <strong>reflect</strong><br><strong>3.2x</strong> <strong class='color-laser'>laser</strong> <strong class='color-d'>damage</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("laser") && tech.laserReflections < 3 && !tech.beamSplitter && !tech.isPulseLaser && !tech.historyLaser
        },
        requires: "laser gun, not specular reflection, diffraction grating, slow light, pulse",
        effect() {
            if (tech.wideLaser === 0) tech.wideLaser = 3
            tech.isWideLaser = true;
            b.guns[11].chooseFireMethod()
        },
        remove() {
            if (tech.isWideLaser) {
                // tech.wideLaser = 0
                tech.isWideLaser = false;
                b.guns[11].chooseFireMethod()
            }
        }
    },
    {
        name: "output coupler",
        description: "<strong>1.3x</strong> <strong class='color-laser'>laser</strong> <strong class='color-g'>gun</strong> beam <strong>width</strong><br><strong>1.3x</strong> <strong class='color-laser'>laser</strong> <strong class='color-d'>damage</strong>",
        isGunTech: true,
        maxCount: 9,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("laser") && tech.isWideLaser
        },
        requires: "laser gun, diffuse beam",
        effect() {
            tech.wideLaser += 2
            b.guns[11].chooseFireMethod()
        },
        remove() {
            if (tech.isWideLaser) {
                tech.wideLaser = 3
            } else {
                tech.wideLaser = 0
            }
            b.guns[11].chooseFireMethod()
        }
    },
    {
        name: "delayed-choice",
        description: "<strong class='color-laser'>laser</strong> <strong class='color-g'>gun</strong> fires a <strong>0.4</strong> second <strong>delayed</strong> beam<br>delayed beams do <strong>0.7x</strong> <strong class='color-d'>damage</strong>",
        isGunTech: true,
        maxCount: 9,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return tech.haveGunCheck("laser") && !tech.beamSplitter && !tech.isWideLaser
        },
        requires: "laser gun, diffraction grating, diffuse beam",
        effect() {
            tech.historyLaser++
            b.guns[11].chooseFireMethod()
        },
        remove() {
            if (tech.historyLaser) {
                tech.historyLaser = 0
                b.guns[11].chooseFireMethod()
            }
        }
    },
    {
        name: "infrared diode",
        description: "<strong>0.4x</strong> <strong class='color-laser'>laser</strong> <strong class='color-f'>energy</strong> cost<br><em>infrared light is outside visual perception</em>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return (tech.haveGunCheck("laser") || tech.isLaserBotUpgrade || tech.isLaserMine || tech.isLaserField) && !tech.isPulseLaser && tech.laserDrain === 0.003
        },
        requires: "laser, not free-electron, pulse",
        effect() {
            tech.laserDrain *= 0.4; //100%-50%
            tech.laserColor = "transparent" //"rgb(255,0,20,0.02)"
            // tech.laserColorAlpha = "rgba(255,0,20,0.05)"
        },
        remove() {
            tech.laserDrain = 0.003;
            tech.laserColor = "#f02"
            tech.laserColorAlpha = "rgba(255, 0, 0, 0.5)"
        }
    },
    {
        name: "dye laser",
        description: "<strong>0.75x</strong> <strong class='color-laser'>laser</strong> <strong class='color-f'>energy</strong> cost<br><strong>1.25x</strong> <strong class='color-laser'>laser</strong> <strong class='color-d'>damage</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return (tech.haveGunCheck("laser") || tech.isLaserMine || tech.isLaserBotUpgrade || tech.isLaserField) && !tech.isPulseLaser && tech.laserDrain === 0.003
        },
        requires: "laser, not pulse, infrared diode",
        effect() {
            tech.laserDrain *= 0.75
            tech.laserDamage *= 1.25
            tech.laserColor = "rgb(0, 11, 255)"
            tech.laserColorAlpha = "rgba(0, 11, 255,0.5)"
        },
        remove() {
            tech.laserDrain = 0.003;
            tech.laserDamage = 0.18; //used in check on pulse and diode: tech.laserDamage === 0.18
            tech.laserColor = "#f00"
            tech.laserColorAlpha = "rgba(255, 0, 0, 0.5)"
        }
    },
    {
        name: "free-electron laser",
        description: "<strong>3x</strong> <strong class='color-laser'>laser</strong> <strong class='color-f'>energy</strong> cost<br><strong>3x</strong> <strong class='color-laser'>laser</strong> <strong class='color-d'>damage</strong>",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return (tech.haveGunCheck("laser") || tech.isLaserMine || tech.isLaserBotUpgrade || tech.isLaserField) && !tech.isPulseLaser && tech.laserDrain === 0.003
        },
        requires: "laser, not pulse, infrared diode",
        effect() {
            tech.laserDrain *= 3
            tech.laserDamage *= 3
            tech.laserColor = "#83f"
            tech.laserColorAlpha = "rgba(136, 51, 255,0.5)"
        },
        remove() {
            tech.laserDrain = 0.003;
            tech.laserDamage = 0.18; //used in check on pulse and diode: tech.laserDamage === 0.18
            tech.laserColor = "#f00"
            tech.laserColorAlpha = "rgba(255, 0, 0, 0.5)"
        }
    },
    {
        name: "pulse",
        description: "charge your <strong class='color-f'>energy</strong> and release it as a<br><strong class='color-laser'>laser</strong> pulse that initiates an <strong class='color-e'>explosion</strong> cluster",
        isGunTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return tech.haveGunCheck("laser") && tech.laserReflections < 3 && !tech.isWideLaser && tech.laserDrain === 0.003 && !tech.isStuckOn
        },
        requires: "laser gun, not specular reflection, diffuse, free-electron laser, optical amplifier",
        effect() {
            tech.isPulseLaser = true;
            b.guns[11].chooseFireMethod()
        },
        remove() {
            if (tech.isPulseLaser) {
                tech.isPulseLaser = false;
                b.guns[11].chooseFireMethod()
            }
        }
    },
    //************************************************** 
    //************************************************** field
    //************************************************** tech
    //**************************************************
    {
        name: "spherical harmonics",
        description: "<strong>1.5x</strong> <strong>standing wave</strong> deflection <strong class='color-f'>energy</strong> efficiency<br>shield deflection <strong>radius</strong> is stable", //<strong>standing wave</strong> oscillates in a 3rd dimension<br>
        isFieldTech: true,
        maxCount: 9,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.fieldMode === 1 && !tech.isLaserField
        },
        requires: "standing wave, not surface plasmons",
        effect() {
            tech.harmonics++
            m.fieldShieldingScale = 1.6 * Math.pow(0.5, (tech.harmonics - 2))
            m.harmonicShield = m.harmonicAtomic
        },
        remove() {
            tech.harmonics = 2
            m.fieldShieldingScale = 1.6 * Math.pow(0.5, (tech.harmonics - 2))
            m.harmonicShield = m.harmonic3Phase
        }
    },
    {
        name: "surface plasmons",
        description: "if <strong>deflecting</strong> drains all your <strong class='color-f'>energy</strong><br>emit <strong class='color-laser'>laser</strong> beams that scale with max <strong class='color-f'>energy</strong>",
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.fieldMode === 1 && tech.harmonics === 2
        },
        requires: "standing wave",
        effect() {
            tech.isLaserField = true
        },
        remove() {
            tech.isLaserField = false
        }
    },
    {
        name: "zero point energy",
        description: `use ${powerUps.orb.research(2)}<br><strong>+166</strong> maximum <strong class='color-f'>energy</strong>`,
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 3,
        frequencyDefault: 3,
        allowed() {
            return (m.fieldMode === 1 || m.fieldMode === 8 || m.fieldMode === 6) && (build.isExperimentSelection || powerUps.research.count > 1)
        },
        requires: "standing wave, pilot wave, time dilation",
        effect() {
            tech.harmonicEnergy = 1.66
            m.setMaxEnergy()
            for (let i = 0; i < 2; i++) {
                if (powerUps.research.count > 0) powerUps.research.changeRerolls(-1)
            }
        },
        remove() {
            tech.harmonicEnergy = 0;
            m.setMaxEnergy()
            if (this.count > 0) powerUps.research.changeRerolls(2)
        }
    },
    {
        name: "expansion",
        description: "using <strong>standing wave</strong> field <strong>expands</strong> its <strong>radius</strong><br><strong>+77</strong> maximum <strong class='color-f'>energy</strong>",
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.fieldMode === 1
        },
        requires: "standing wave",
        effect() {
            tech.isStandingWaveExpand = true
            m.setMaxEnergy()
            // m.fieldShieldingScale = (tech.isStandingWaveExpand ? 0.9 : 1.6) * Math.pow(0.6, (tech.harmonics - 2))
        },
        remove() {
            tech.isStandingWaveExpand = false
            m.setMaxEnergy()
            // m.fieldShieldingScale = (tech.isStandingWaveExpand ? 0.9 : 1.6) * Math.pow(0.6, (tech.harmonics - 2))
            m.harmonicRadius = 1
        }
    },
    {

        // descriptionFunction() {
        //     return `use ${powerUps.orb.research(2)}<br><span style = 'font-size:94%;'><strong>1.01x</strong> <strong class='color-d'>damage</strong> per <strong class='color-f'>energy</strong> below <strong>maximum</strong> <em style ="float: right;">(${(1 + Math.max(0, m.maxEnergy - m.energy)).toFixed(2)}x)</em></span>`
        // },
        name: "electronegativity",
        descriptionFunction() {
            return `<strong>1.0023x</strong> <strong class='color-d'>damage</strong> per <strong class='color-f'>energy</strong><br><em style ="float: right;">(${(1 + 0.23 * m.energy).toFixed(2)} at current energy, ${(1 + 0.23 * m.maxEnergy).toFixed(2)}x at maximum energy)</em>`
        },
        // description: "<strong>+1%</strong> <strong class='color-d'>damage</strong> per <strong>8</strong> stored <strong class='color-f'>energy</strong>",
        isFieldTech: true,
        maxCount: 9,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.fieldMode === 1 || m.fieldMode === 9 || m.fieldMode === 8
        },
        requires: "standing wave, wormhole, pilot wave",
        effect() {
            tech.energyDamage++
        },
        remove() {
            tech.energyDamage = 0;
        }
    },
    {
        name: "bremsstrahlung",
        description: "<strong>deflecting</strong> and thrown <strong class='color-block'>blocks</strong><br>do braking <strong class='color-d'>damage</strong> to mobs",
        isFieldTech: true,
        maxCount: 9,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.fieldMode === 1 || m.fieldMode === 2 || m.fieldMode === 8
        },
        requires: "standing wave, perfect diamagnetism, pilot wave",
        effect() {
            tech.blockDmg += 5 //if you change this value also update the for loop in the electricity graphics in m.pushMass
        },
        remove() {
            tech.blockDmg = 0;
        }
    },
    {
        name: "cherenkov radiation", //<strong>deflecting</strong> and <strong class='color-block'>blocks</strong>
        description: "bremsstrahlung's effects are <strong class='color-p'>radioactive</strong><br><strong>3.5x</strong> <strong class='color-d'>damage</strong> over <strong>3</strong> seconds",
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return (m.fieldMode === 1 || m.fieldMode === 2 || m.fieldMode === 8) && tech.blockDmg
        },
        requires: "bremsstrahlung",
        effect() {
            tech.isBlockRadiation = true
        },
        remove() {
            tech.isBlockRadiation = false;
        }
    },
    {
        name: "flux pinning",
        description: "after <strong>deflecting</strong> a mob<br>it is <strong>stunned</strong> for up to <strong>4</strong> seconds",
        isFieldTech: true,
        maxCount: 9,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.fieldMode === 2 || m.fieldMode === 1 || m.fieldMode === 4
        },
        requires: "a field that can block",
        effect() {
            tech.isStunField += 240;
        },
        remove() {
            tech.isStunField = 0;
        }
    },
    {
        name: "eddy current brake",
        description: "perfect diamagnetism <strong class='color-s'>slows</strong> nearby mobs<br>effect <strong>radius</strong> scales with stored <strong class='color-f'>energy</strong>",
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.fieldMode === 2 && !tech.isHealBrake
        },
        requires: "perfect diamagnetism, not induction brake",
        effect() {
            tech.isPerfectBrake = true;
        },
        remove() {
            tech.isPerfectBrake = false;
        }
    },
    {
        name: "Meissner effect",
        description: "<strong>1.55x</strong> perfect diamagnetism <strong>radius</strong><br><strong>+22°</strong> perfect diamagnetism circular <strong>arc</strong>",
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.fieldMode === 2
        },
        requires: "perfect diamagnetism",
        effect() {
            tech.isBigField = true;
        },
        remove() {
            tech.isBigField = false;
        }
    },
    {
        name: "radiative equilibrium",
        descriptionFunction() {
            return `after losing ${tech.isEnergyHealth ? "<strong class='color-f'>energy</strong>" : "<strong class='color-h'>health</strong>"}<br><strong>3x</strong> <strong class='color-d'>damage</strong> for <strong>8</strong> seconds`
        },
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.fieldMode === 8 || m.fieldMode === 3
        },
        requires: "negative mass, pilot wave",
        effect() {
            tech.isHarmDamage = true;
        },
        remove() {
            tech.isHarmDamage = false;
        }
    },
    {
        name: "dynamic equilibrium",
        descriptionFunction() {
            return `increase <strong class='color-d'>damage</strong> by your last ${tech.isEnergyHealth ? "<strong class='color-f'>energy</strong>" : "<strong class='color-h'>health</strong>"} loss<br> <em style ="float: right;">(${(1 + tech.lastHitDamage * m.lastHit).toFixed(2)}x damage)</em>`
        },
        isFieldTech: true,
        maxCount: 9,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.fieldMode === 8 || m.fieldMode === 3
        },
        requires: "negative mass, pilot wave",
        effect() {
            tech.lastHitDamage += 5;
        },
        remove() {
            tech.lastHitDamage = 0;
        }
    },
    {
        name: "neutronium",
        description: `<strong>0.8x</strong> <strong>move</strong> and <strong>jump</strong>, but <br>if your <strong class='color-f'>field</strong> is active <strong>0.05x</strong> <strong class='color-defense'>damage taken</strong>`,
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.fieldMode === 3
        },
        requires: "negative mass",
        effect() {
            tech.isNeutronium = true
            tech.baseFx *= 0.8
            tech.baseJumpForce *= 0.8
            m.setMovement()
        },
        //also removed in m.setHoldDefaults() if player switches into a bad field
        remove() {
            tech.isNeutronium = false
            if (!tech.isFreeWormHole) {
                tech.baseFx = 0.08
                tech.baseJumpForce = 10.5
                m.setMovement()
            }
        }
    },
    {
        name: "aerostat",
        description: `<strong>2x</strong> <strong class='color-d'>damage</strong> while <strong>off</strong> the <strong>ground</strong><br><strong>0.9x</strong> <strong class='color-d'>damage</strong> while <strong>on</strong> the <strong>ground</strong>`,
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.fieldMode === 3 || m.fieldMode === 10
        },
        requires: "negative mass, grappling hook",
        effect() {
            tech.isNoGroundDamage = true
        },
        remove() {
            tech.isNoGroundDamage = false
        }
    },
    {
        name: "annihilation",
        description: "after <strong>colliding</strong> with non-boss mobs<br>they are <strong>annihilated</strong> and <strong>–10</strong> <strong class='color-f'>energy</strong>",
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.fieldMode === 3 && !tech.isEnergyHealth
        },
        requires: "negative mass, not mass-energy",
        effect() {
            tech.isAnnihilation = true
        },
        remove() {
            tech.isAnnihilation = false;
        }
    },
    {
        name: "inertial mass",
        description: "<strong>negative mass</strong> is larger and <strong>faster</strong>",  //<br><strong class='color-block'>blocks</strong> also move <strong>horizontally</strong> with the field
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.fieldMode === 3
        },
        requires: "negative mass",
        effect() {
            tech.isFlyFaster = true
        },
        remove() {
            tech.isFlyFaster = false;
        }
    },
    // {
    //     name: "Bose Einstein condensate",
    //     description: "use <strong class='color-f'>energy</strong> to <strong class='color-s'>freeze</strong> <strong>mobs</strong> in your <strong class='color-f'>field</strong><br><em style = 'font-size: 100%'>pilot wave, negative mass, time dilation</em>",
    //     isFieldTech: true,
    //     maxCount: 1,
    //     count: 0,
    //     frequency: 2,
    //     frequencyDefault: 2,
    //     allowed() {
    //         return m.fieldMode === 8 || m.fieldMode === 3 || (m.fieldMode === 6 && !tech.isRewindField)
    //     },
    //     requires: "pilot wave, negative mass, time dilation, not retrocausality",
    //     effect() {
    //         tech.isFreezeMobs = true
    //     },
    //     remove() {
    //         tech.isFreezeMobs = false
    //     }
    // },

    // {
    //     name: "mycelium manufacturing",
    //     link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Mycelium' class="link">mycelium manufacturing</a>`,
    //     // description: `use ${powerUps.orb.research(1)}to repurpose <strong>molecular assembler</strong><br>excess <strong class='color-f'>energy</strong> used to grow <strong class='color-p' style='letter-spacing: 2px;'>spores</strong>`,
    //     descriptionFunction() { return `use ${powerUps.orb.research(1)}to repurpose <strong>molecular assembler</strong><br>excess <strong class='color-f'>energy</strong> used to grow ${b.guns[6].nameString('s')}` },
    //     isFieldTech: true,
    //     maxCount: 1,
    //     count: 0,
    //     frequency: 3,
    //     frequencyDefault: 3,
    //     allowed() {
    //         return (build.isExperimentSelection || powerUps.research.count > 0) && m.fieldMode === 4 && !(tech.isMissileField || tech.isIceField || tech.isFastDrones || tech.isDroneGrab || tech.isDroneRadioactive || tech.isDroneTeleport)
    //     },
    //     requires: "molecular assembler, no other manufacturing, no drone tech",
    //     effect() {
    //         if (!build.isExperimentSelection) {
    //             for (let i = 0; i < 1; i++) {
    //                 if (powerUps.research.count > 0) powerUps.research.changeRerolls(-1)
    //             }
    //         }
    //         tech.isSporeField = true;
    //     },
    //     remove() {
    //         tech.isSporeField = false;
    //         if (this.count > 0) powerUps.research.changeRerolls(1)
    //     }
    // },
    // {
    //     name: "missile manufacturing",
    //     link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Missile' class="link">missile manufacturing</a>`,
    //     description: `use ${powerUps.orb.research(1)}to repurpose <strong>molecular assembler</strong><br>excess <strong class='color-f'>energy</strong> used to construct <strong>missiles</strong>`,
    //     // description: "use <strong>3</strong> <strong class='color-r'>research</strong> to repurpose <strong>assembler</strong><br>excess <strong class='color-f'>energy</strong> used to construct <strong>missiles</strong>",
    //     isFieldTech: true,
    //     maxCount: 1,
    //     count: 0,
    //     frequency: 3,
    //     frequencyDefault: 3,
    //     allowed() {
    //         return (build.isExperimentSelection || powerUps.research.count > 0) && m.maxEnergy > 0.5 && m.fieldMode === 4 && !(tech.isSporeField || tech.isIceField || tech.isFastDrones || tech.isDroneGrab || tech.isDroneRadioactive || tech.isDroneTeleport || tech.isDronesTravel)
    //     },
    //     requires: "molecular assembler, no other manufacturing, no drone tech",
    //     effect() {
    //         if (!build.isExperimentSelection) {
    //             for (let i = 0; i < 1; i++) {
    //                 if (powerUps.research.count > 0) powerUps.research.changeRerolls(-1)
    //             }
    //         }
    //         tech.isMissileField = true;
    //     },
    //     remove() {
    //         tech.isMissileField = false;
    //         if (this.count > 0) powerUps.research.changeRerolls(1)
    //     }
    // },
    // {
    //     name: "ice IX manufacturing",
    //     link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Ice-nine_(disambiguation)' class="link">ice IX manufacturing</a>`,
    //     description: `use ${powerUps.orb.research(1)}to repurpose <strong>molecular assembler</strong><br>excess <strong class='color-f'>energy</strong> used to condense <strong class='color-s'>ice IX</strong>`,
    //     // description: "use <strong>3</strong> <strong class='color-r'>research</strong> to repurpose <strong>assembler</strong><br>excess <strong class='color-f'>energy</strong> used to condense <strong class='color-s'>ice IX</strong>",
    //     isFieldTech: true,
    //     maxCount: 1,
    //     count: 0,
    //     frequency: 3,
    //     frequencyDefault: 3,
    //     allowed() {
    //         return (build.isExperimentSelection || powerUps.research.count > 0) && m.fieldMode === 4 && !(tech.isSporeField || tech.isMissileField || tech.isFastDrones || tech.isDroneGrab || tech.isDroneRadioactive || tech.isDroneTeleport || tech.isDronesTravel)
    //     },
    //     requires: "molecular assembler, no other manufacturing, no drone tech",
    //     effect() {
    //         if (!build.isExperimentSelection) {
    //             for (let i = 0; i < 1; i++) {
    //                 if (powerUps.research.count > 0) powerUps.research.changeRerolls(-1)
    //             }
    //         }
    //         tech.isIceField = true;
    //     },
    //     remove() {
    //         tech.isIceField = false;
    //         if (this.count > 0) powerUps.research.changeRerolls(1)
    //     }
    // },
    {
        name: "additive manufacturing",
        description: "hold <strong>crouch</strong> and use your <strong class='color-f'>field</strong> to <strong class='color-print'>print</strong> a <strong class='color-block'>block</strong><br> with <strong>1.8x</strong> density, <strong class='color-d'>damage</strong>, and launch speed",
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return (m.fieldMode === 4 || m.fieldMode === 8) && !tech.isTokamak
        },
        requires: "molecular assembler, pilot wave, not tokamak",
        effect() {
            tech.isPrinter = true;
        },
        remove() {
            if (this.count > 0) m.holdingTarget = null;
            tech.isPrinter = false;
        }
    },
    {
        name: "working mass",
        // description: "molecular assembler <strong class='color-print'>prints</strong> one <strong class='color-block'>block</strong><br>to <strong>jump</strong> off while midair",
        descriptionFunction() {
            const fieldName = m.fieldMode === 8 ? "pilot wave" : "molecular assembler"
            return `a second <strong>jump</strong> in <strong>midair</strong><br>will <strong class='color-print'>print</strong> a <strong class='color-block'>block</strong> to <strong>jump</strong> off`
            // return `${fieldName} <strong class='color-print'>prints</strong> a <strong class='color-block'>block</strong><br>to <strong>jump</strong> off while midair`
        },
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return (m.fieldMode === 4 || m.fieldMode === 8)
        },
        requires: "molecular assembler, pilot wave",
        effect() {
            simulation.ephemera.push({
                name: "blockJump",
                blockJumpPhase: 0,
                do() {
                    if (m.onGround && m.buttonCD_jump + 10 < m.cycle && !(m.lastOnGroundCycle + m.coyoteCycles > m.cycle)) this.blockJumpPhase = 0 //reset after touching ground or block
                    if (this.blockJumpPhase === 0 && !m.onGround && !input.up && m.buttonCD_jump + 10 < m.cycle) { //not pressing jump
                        this.blockJumpPhase = 1
                    } else if (this.blockJumpPhase === 1 && input.up && m.buttonCD_jump + 10 < m.cycle) { //2nd jump
                        this.blockJumpPhase = 2
                        let horizontalVelocity = 8 * (- input.left + input.right)  //ive player and block horizontal momentum

                        const radius = 25 + Math.floor(15 * Math.random())
                        body[body.length] = Matter.Bodies.polygon(m.pos.x, m.pos.y + 60 + radius, 4, radius, {
                            friction: 0.05,
                            frictionAir: 0.001,
                            collisionFilter: {
                                category: cat.body,
                                mask: cat.player | cat.map | cat.body | cat.bullet | cat.mob | cat.mobBullet
                            },
                            classType: "body",
                        });
                        const block = body[body.length - 1]
                        //mess with the block shape (this code is horrible)
                        Composite.add(engine.world, block); //add to world
                        const r1 = radius * (1 + 0.4 * Math.random())
                        const r2 = radius * (1 + 0.4 * Math.random())
                        let angle = Math.PI / 4
                        const vertices = []
                        for (let i = 0, len = block.vertices.length; i < len; i++) {
                            angle += 2 * Math.PI / len
                            vertices.push({ x: block.position.x + r1 * Math.cos(angle), y: block.position.y + r2 * Math.sin(angle) })
                        }
                        Matter.Body.setVertices(block, vertices)
                        // Matter.Body.setAngle(block, Math.PI / 4)
                        Matter.Body.setVelocity(block, { x: 0.9 * player.velocity.x - horizontalVelocity, y: 10 });
                        Matter.Body.applyForce(block, m.pos, { x: 0, y: m.jumpForce * 0.12 * Math.min(m.standingOn.mass, 5) });
                        if (tech.isBlockRestitution) {
                            block.restitution = 0.999 //extra bouncy
                            block.friction = block.frictionStatic = block.frictionAir = 0.001
                        }
                        if (tech.isAddBlockMass) {
                            const expand = function (that, massLimit) {
                                if (that.mass < massLimit) {
                                    const scale = 1.04;
                                    Matter.Body.scale(that, scale, scale);
                                    setTimeout(expand, 20, that, massLimit);
                                }
                            };
                            expand(block, Math.min(20, block.mass * 3))
                        }
                        //jump
                        m.buttonCD_jump = m.cycle; //can't jump again until 20 cycles pass
                        Matter.Body.setVelocity(player, { x: player.velocity.x + horizontalVelocity, y: -7.5 + 0.25 * player.velocity.y });
                        player.force.y = -m.jumpForce; //player jump force
                    }
                },
            })
        },
        remove() {
            if (this.count) simulation.removeEphemera("blockJump")
        }
    },
    {
        name: "pair production",
        description: "after picking up a <strong>power up</strong><br><strong>+200</strong> <strong class='color-f'>energy</strong>",
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.fieldMode === 4 || m.fieldMode === 1 || m.fieldMode === 8
        },
        requires: "molecular assembler, pilot wave, standing wave",
        effect() {
            tech.isMassEnergy = true // used in m.grabPowerUp
            m.energy += 2
        },
        remove() {
            tech.isMassEnergy = false;
        }
    },
    {
        name: "electric generator",
        description: "after <strong>deflecting</strong> mobs<br><strong>molecular assembler</strong> generates <strong>+50</strong> <strong class='color-f'>energy</strong>",
        isFieldTech: true,
        maxCount: 9,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.fieldMode === 4
        },
        requires: "molecular assembler",
        effect() {
            tech.deflectEnergy += 0.5;
        },
        remove() {
            tech.deflectEnergy = 0;
        }
    },
    {
        name: "combinatorial optimization",
        description: "<strong>1.35x</strong> <strong class='color-d'>damage</strong><br><strong>0.7x</strong> <em>fire rate</em>",
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.fieldMode === 6 || m.fieldMode === 7 || m.fieldMode === 8
        },
        requires: "time dilation, cloaking, pilot wave",
        damage: 1.35,
        effect() {
            tech.damage *= this.damage
            tech.aimDamage = 1.42
            b.setFireCD();
        },
        remove() {
            if (this.count && m.alive) tech.damage /= this.damage
            tech.aimDamage = 1
            b.setFireCD();
        }
    },
    {
        name: "tokamak",
        description: "<strong class='color-tokamak'>tokamak</strong> converts thrown <strong class='color-block'>blocks</strong> into <strong class='color-f'>energy</strong><br>and a pulsed fusion <strong class='color-e'>explosion</strong>",
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return (m.fieldMode === 5 || m.fieldMode === 4 || m.fieldMode === 10) && !tech.isPrinter && !tech.isReel && !tech.hookNails
        },
        requires: "plasma torch, molecular assembler, grappling hook, not printer, reel, swarf",
        effect() {
            tech.isTokamak = true;
        },
        remove() {
            tech.isTokamak = false;
        }
    },
    {
        name: "stellarator",
        descriptionFunction() {
            return `the first <strong>5</strong> <strong class='color-block'>blocks</strong> detonated by <strong class='color-tokamak'>tokamak</strong><br>spawn ${powerUps.orb.heal(1)} proportional to <strong class='color-block'>block</strong> size`
        },
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 3,
        frequencyDefault: 3,
        allowed() {
            return tech.isTokamak && (m.fieldMode === 5 || m.fieldMode === 4 || m.fieldMode === 10)
        },
        requires: "tokamak",
        effect() {
            tech.isTokamakHeal = true;
            tech.tokamakHealCount = 0
        },
        remove() {
            tech.isTokamakHeal = false;
        }
    },
    {
        name: "inertial confinement",
        description: "while holding a <strong class='color-block'>block</strong> charged with <strong class='color-tokamak'>tokamak</strong><br>you can use <strong class='color-f'>energy</strong> to <strong>fly</strong>",  //and invulnerable?
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 3,
        frequencyDefault: 3,
        allowed() {
            return tech.isTokamak && (m.fieldMode === 5 || m.fieldMode === 4 || m.fieldMode === 10)
        },
        requires: "tokamak",
        effect() {
            tech.isTokamakFly = true;
        },
        remove() {
            tech.isTokamakFly = false;
        }
    },
    {
        name: "degenerate matter",
        description: "if your <strong class='color-f'>field</strong> is active<br><strong>0.1x</strong> <strong class='color-defense'>damage taken</strong>",
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return (m.fieldMode === 10 || m.fieldMode === 5 || m.fieldMode === 8)  //1 standing wave  2 perfect diamagnetism  3 negative mass  4 molecular assembler  5 plasma torch  6 time dilation  7 metamaterial cloaking  8 pilot wave  9 wormhole 10 grappling hook
        },
        requires: "plasma torch, grappling hook, pilot wave",
        effect() {
            tech.isHarmReduce = true
        },
        remove() {
            tech.isHarmReduce = false;
        }
    },
    {
        name: "plasma-bot",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Robot' class="link">plasma-bot</a>`,
        description: `use ${powerUps.orb.research(2)}to trade your <strong class='color-f'>field</strong><br>for a <strong class='color-bot'>bot</strong> that uses <strong class='color-f'>energy</strong> to emit <strong class='color-plasma'>plasma</strong>`,
        // isFieldTech: true,
        isInstant: true,
        maxCount: 1,
        count: 0,
        frequency: 3,
        frequencyDefault: 3,
        isBot: true,
        isBotTech: true,
        allowed() {
            return m.fieldMode === 5 && !tech.isPlasmaBall && !tech.isExtruder && (build.isExperimentSelection || powerUps.research.count > 1)
        },
        requires: "plasma torch, not extruder, plasma ball",
        effect() {
            tech.plasmaBotCount++;
            b.plasmaBot();
            if (build.isExperimentSelection) {
                document.getElementById("field-" + m.fieldMode).classList.remove("build-field-selected");
                document.getElementById("field-0").classList.add("build-field-selected");
            }
            m.setField("field emitter")
            for (let i = 0; i < 2; i++) {
                if (powerUps.research.count > 0) powerUps.research.changeRerolls(-1)
            }
        },
        remove() {
            if (this.count > 0) {
                tech.plasmaBotCount = 0;
                b.clearPermanentBots();
                b.respawnBots();
                if (m.fieldMode === 0) {
                    m.setField("plasma torch")
                    if (build.isExperimentSelection) {
                        document.getElementById("field-0").classList.remove("build-field-selected");
                        document.getElementById("field-" + m.fieldMode).classList.add("build-field-selected");
                    }
                }
                powerUps.research.changeRerolls(2)
            }
        }
    },
    {
        name: "plasma jet",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Plasma_(physics)' class="link">plasma jet</a>`,
        description: `use ${powerUps.orb.research(2)}<br><strong>1.5x</strong> <strong class='color-plasma'>plasma</strong> <strong>torch</strong> range`,
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return (tech.plasmaBotCount || m.fieldMode === 5) && (build.isExperimentSelection || powerUps.research.count > 1) && !tech.isPlasmaBall
        },
        requires: "plasma torch, not plasma ball",
        effect() {
            tech.isPlasmaRange += 0.5;
            for (let i = 0; i < 2; i++) {
                if (powerUps.research.count > 0) powerUps.research.changeRerolls(-1)
            }
        },
        remove() {
            tech.isPlasmaRange = 1;
            if (this.count > 0) powerUps.research.changeRerolls(this.count * 2)
        }
    },
    {
        name: "extruder",
        description: "<strong>extrude</strong> a thin hot wire of <strong class='color-plasma'>plasma</strong><br>increases <strong class='color-d'>damage</strong> and <strong class='color-f'>energy</strong> cost",
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.fieldMode === 5 && !tech.isPlasmaBall
        },
        requires: "plasma torch, not plasma ball",
        effect() {
            tech.isExtruder = true;
            m.fieldUpgrades[m.fieldMode].set()
        },
        remove() {
            tech.isExtruder = false;
            if (this.count && m.fieldMode === 5) m.fieldUpgrades[m.fieldMode].set()
        }
    },
    {
        name: "refractory metal",
        description: "<strong class='color-plasma'>extrude</strong> metals at a higher <strong class='color-plasma'>temperature</strong><br>increases effective <strong>radius</strong> and <strong class='color-d'>damage</strong>",
        isFieldTech: true,
        maxCount: 9,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.fieldMode === 5 && tech.isExtruder
        },
        requires: "extruder",
        effect() {
            tech.extruderRange += 55
        },
        remove() {
            tech.extruderRange = 15
        }
    },
    {
        name: "plasma ball",
        description: "<strong>grow</strong> an expanding <strong>ball</strong> of <strong class='color-plasma'>plasma</strong><br>increases <strong class='color-d'>damage</strong> and <strong class='color-f'>energy</strong> cost",
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.fieldMode === 5 && !tech.isExtruder && tech.isPlasmaRange === 1
        },
        requires: "plasma torch, not extruder, plasma jet",
        effect() {
            tech.isPlasmaBall = true;
            m.fieldUpgrades[m.fieldMode].set()
        },
        remove() {
            tech.isPlasmaBall = false;
            if (this.count && m.fieldMode === 5) m.fieldUpgrades[m.fieldMode].set()
        }
    },
    {
        name: "corona discharge",
        description: "increase the <strong>range</strong> and <strong>frequency</strong><br>of <strong class='color-plasma'>plasma</strong> ball's <strong>electric arc</strong> ",
        isFieldTech: true,
        maxCount: 9,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.fieldMode === 5 && tech.isPlasmaBall
        },
        requires: "plasma ball",
        effect() {
            tech.plasmaDischarge += 0.03
        },
        remove() {
            tech.plasmaDischarge = 0.01 //default chance per cycle of a discharge
        }
    },
    {
        name: "retrocausality",
        description: "<strong>time dilation</strong> uses <strong class='color-f'>energy</strong> to <strong>rewind</strong> your<br><strong class='color-h'>health</strong>, <strong>velocity</strong>, and <strong>position</strong> up to <strong>10</strong> seconds",
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return m.fieldMode === 6 && !m.isShipMode && !tech.isRewindAvoidDeath && !tech.isTimeSkip
        },
        requires: "time dilation, not CPT symmetry",
        effect() {
            tech.isRewindField = true;
            m.fieldUpgrades[6].set()
            m.wakeCheck();
        },
        remove() {
            tech.isRewindField = false;
            if (this.count) m.fieldUpgrades[6].set()
        }
    },
    {
        name: "frame-dragging", //"non-inertial frame",
        description: "when not <strong>moving</strong> time dilation <strong style='letter-spacing: 2px;'>stops time</strong><br><strong>0.6x</strong> <strong class='color-defense'>damage taken</strong>",
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return m.fieldMode === 6
        },
        requires: "time dilation",
        effect() {
            tech.isTimeStop = true;
            m.fieldHarmReduction = 0.66; //33% reduction
        },
        remove() {
            tech.isTimeStop = false;
            if (m.fieldMode === 6) m.fieldHarmReduction = 1;
        }
    },
    {
        name: "Lorentz transformation",
        description: `use ${powerUps.orb.research(3)}<br><strong>1.5x</strong> movement, jumping, and <em>fire rate</em>`,
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 3,
        frequencyDefault: 3,
        allowed() {
            return (m.fieldMode === 6 || m.fieldMode === 8) && (build.isExperimentSelection || powerUps.research.count > 2)
        },
        requires: "time dilation or pilot wave",
        effect() {
            tech.isFastTime = true
            m.setMovement();
            b.setFireCD();
            for (let i = 0; i < 3; i++) {
                if (powerUps.research.count > 0) powerUps.research.changeRerolls(-1)
            }
        },
        remove() {
            tech.isFastTime = false
            m.setMovement();
            b.setFireCD();
            if (this.count > 0) powerUps.research.changeRerolls(3)
        }
    },
    {
        name: "time crystals",
        descriptionFunction() {
            return `<strong>2.5x</strong> passive <strong class='color-f'>energy</strong> generation<br><em style ="float: right;">(+${(150 * m.fieldRegen * 60).toFixed(1)} energy per second)</em>`
        },
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return !tech.isGroundState && (m.fieldMode === 6 || m.fieldMode === 8)
        },
        requires: "time dilation or pilot wave, not ground state",
        effect() {
            tech.isTimeCrystals = true
            m.setFieldRegen()
            this.descriptionFunction = function () {
                return `<strong>2.5x</strong> passive <strong class='color-f'>energy</strong> generation<br><em style ="float: right;">(+${(60 * m.fieldRegen * 60).toFixed(1)} energy per second)</em>`
            }
        },
        remove() {
            tech.isTimeCrystals = false
            m.setFieldRegen()
            this.descriptionFunction = function () {
                return `<strong>2.5x</strong> passive <strong class='color-f'>energy</strong> generation<br><em style ="float: right;">(+${(150 * m.fieldRegen * 60).toFixed(1)} energy per second)</em>`
            }
        }
    },
    {
        name: "no-cloning theorem",
        description: `<strong>+40%</strong> chance to <strong class='color-dup'>duplicate</strong> spawned <strong>power ups</strong><br>after a mob <strong>dies</strong> <strong>–1%</strong> <strong class='color-dup'>duplication</strong>`,
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return (m.fieldMode === 6 || m.fieldMode === 7)
        },
        requires: "cloaking, time dilation",
        effect() {
            tech.cloakDuplication = 0.4
            powerUps.setPowerUpMode(); //needed after adjusting duplication chance
            if (!build.isExperimentSelection && !simulation.isTextLogOpen) simulation.circleFlare(0.4);
        },
        remove() {
            tech.cloakDuplication = 0
            if (this.count) powerUps.setPowerUpMode(); //needed after adjusting duplication chance
        }
    },
    {
        name: "metamaterial absorber",  //quantum eraser
        descriptionFunction() {
            return `for each mob left <strong>alive</strong> after you exit a <strong>level</strong><br>there is a <strong>30%</strong> chance to spawn a random <strong>power up</strong>`
        },
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return (m.fieldMode === 7) && !tech.cloakDuplication
        },
        requires: "cloaking",
        effect() {
            tech.isQuantumEraser = true
        },
        remove() {
            tech.isQuantumEraser = false
        }
    },
    {
        name: "symbiosis",
        descriptionFunction() {
            return `after a <strong>boss</strong> <strong>dies</strong> spawn ${powerUps.orb.research(4)}${powerUps.orb.heal(3)} and a <strong class='color-m'>tech</strong><br>after a <strong>mob</strong> <strong>dies</strong> <strong>–0.25</strong> maximum ${tech.isEnergyHealth ? "<strong class='color-f'>energy</strong>" : "<strong class='color-h'>health</strong>"}`
        },
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.fieldMode === 7 //|| m.fieldMode === 6
        },
        requires: "cloaking",
        effect() {
            tech.isAddRemoveMaxHealth = true
        },
        remove() {
            tech.isAddRemoveMaxHealth = false
        }
    },
    {
        name: "boson composite",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Boson' class="link">boson composite</a>`,
        description: "while <strong class='color-cloaked'>cloaked</strong> you are <strong>intangible</strong><br>to <strong class='color-block'>blocks</strong> and mobs, but <strong>mobs</strong> drain <strong class='color-f'>energy</strong>",
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.fieldMode === 7
        },
        requires: "metamaterial cloaking",
        effect() {
            tech.isIntangible = true;
        },
        remove() {
            if (tech.isIntangible) {
                tech.isIntangible = false;
                player.collisionFilter.mask = cat.body | cat.map | cat.mob | cat.mobBullet | cat.mobShield //normal collisions
            }
        }
    },
    {
        name: "patch",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Patch_(computing)' class="link">patch</a>`,
        description: "after <strong class='color-cloaked'>cloaking</strong> recover <strong>0.75x</strong><br>of your last <strong class='color-h'>health</strong> lost",
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.fieldMode === 7 && !tech.isEnergyHealth
        },
        requires: "metamaterial cloaking, not mass-energy",
        effect() {
            tech.isCloakHealLastHit = true;
        },
        remove() {
            tech.isCloakHealLastHit = false;
        }
    },
    {
        name: "dazzler",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Dazzler_(weapon)' class="link">dazzler</a>`,
        description: "after <strong class='color-cloaked'>decloaking</strong><br><strong>stun</strong> nearby mobs for 2 second",
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.fieldMode === 7
        },
        requires: "metamaterial cloaking",
        effect() {
            tech.isCloakStun = true;
        },
        remove() {
            tech.isCloakStun = false;
        }
    },
    {
        name: "topological defect",
        description: "<strong>2.1x</strong> <strong class='color-d'>damage</strong><br>to <strong>mobs</strong> at maximum <strong>durability</strong>",
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return (m.fieldMode === 8 || m.fieldMode === 7) && tech.mobSpawnWithHealth === 0
        },
        requires: "cloaking, pilot wave, not reaction inhibitor",
        effect() {
            tech.isMobFullHealthCloak = true
        },
        remove() {
            tech.isMobFullHealthCloak = false
        }
    },
    {
        name: "WIMPs",
        description: `at the end of each <strong>level</strong> spawn ${powerUps.orb.research(4)}<br> and a dangerous particle that slowly <strong>chases</strong> you`,
        isFieldTech: true,
        maxCount: 9,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.fieldMode === 9 || m.fieldMode === 8
        },
        requires: "wormhole, pilot wave",
        effect() {
            tech.wimpCount++
            spawn.WIMP()
            for (let j = 0, len = 4; j < len; j++) powerUps.spawn(level.exit.x + 100 * (Math.random() - 0.5), level.exit.y - 100 + 100 * (Math.random() - 0.5), "research", false)
        },
        remove() {
            tech.wimpCount = 0
        }
    },
    {
        name: "vacuum fluctuation",
        description: `use ${powerUps.orb.research(3)}<br><strong>+11%</strong> chance to <strong class='color-dup'>duplicate</strong> spawned <strong>power ups</strong>`,
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 3,
        frequencyDefault: 3,
        allowed() {
            return (m.fieldMode === 8 || m.fieldMode === 6 || m.fieldMode === 9) && (build.isExperimentSelection || powerUps.research.count > 2)
        },
        requires: "wormhole, time dilation, negative mass, pilot wave",
        effect() {
            tech.fieldDuplicate = 0.11
            powerUps.setPowerUpMode(); //needed after adjusting duplication chance
            if (!build.isExperimentSelection && !simulation.isTextLogOpen) simulation.circleFlare(0.11);
            for (let i = 0; i < 3; i++) {
                if (powerUps.research.count > 0) powerUps.research.changeRerolls(-1)
            }
        },
        remove() {
            tech.fieldDuplicate = 0
            if (this.count) powerUps.setPowerUpMode(); //needed after adjusting duplication chance
            if (this.count > 0) powerUps.research.changeRerolls(3)
        }
    },
    {
        name: "transdimensional worms",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Dimension' class="link">transdimensional worms</a>`,
        description: "after a <strong class='color-block'>block</strong> falls into a <strong class='color-worm'>wormhole</strong><br>spawn a <strong class='color-p' style='letter-spacing: 2px;'>worm</strong>",
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.fieldMode === 9
        },
        requires: "wormhole",
        effect() {
            tech.isWormholeWorms = true
        },
        remove() {
            tech.isWormholeWorms = false
        }
    },
    {
        name: "anyon",
        descriptionFunction() {
            return `<strong>2x</strong> <strong class='color-f'>energy</strong> after <strong class='color-dup'>duplicating</strong> a power up<br><strong>+6%</strong> chance to <strong class='color-dup'>duplicate</strong> spawned <strong>power ups</strong>`
        },
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return m.fieldMode === 9 || m.fieldMode === 1
        },
        requires: "wormhole, standing wave",
        effect() {
            tech.isDupEnergy = true;
            powerUps.setPowerUpMode(); //needed after adjusting duplication chance
            if (!build.isExperimentSelection && !simulation.isTextLogOpen) simulation.circleFlare(0.06);
        },
        remove() {
            tech.isDupEnergy = false;
            if (this.count) powerUps.setPowerUpMode(); //needed after adjusting duplication chance        }
        }
    },
    {
        name: "geodesics",
        description: `your <strong>bullets</strong> can traverse <strong class='color-worm'>wormholes</strong><br><strong>1.5x</strong> <strong class='color-d'>damage</strong>`,
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.fieldMode === 9
        },
        requires: "wormhole",
        damage: 1.5,
        effect() {
            tech.damage *= this.damage
            tech.isWormHoleBullets = true
            // for (let i = 0; i < 2; i++) powerUps.spawn(m.pos.x + 200 * (Math.random() - 0.5), m.pos.y + 200 * (Math.random() - 0.5), "gun");
            // for (let i = 0; i < 4; i++) powerUps.spawn(m.pos.x + 200 * (Math.random() - 0.5), m.pos.y + 200 * (Math.random() - 0.5), "ammo");
        },
        remove() {
            // if (tech.isWormHoleBullets) {
            //     for (let i = 0; i < 2; i++) {
            //         if (b.inventory.length) b.removeGun(b.guns[b.inventory[b.inventory.length - 1]].name) //remove your last gun
            //     }
            // }
            if (this.count && m.alive) tech.damage /= this.damage
            tech.isWormHoleBullets = false;
        }
    },
    {
        name: "cosmic string",
        description: "after <strong>tunneling</strong> through mobs with a <strong class='color-worm'>wormhole</strong><br><strong>stun</strong> them and do <strong class='color-p'>radioactive</strong> <strong class='color-d'>damage</strong>",
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.fieldMode === 9
        },
        requires: "wormhole",
        effect() {
            tech.isWormholeDamage = true
        },
        remove() {
            tech.isWormholeDamage = false
        }
    },
    {
        name: "invariant",
        description: "while placing your <strong class='color-worm'>wormhole</strong><br>use <strong class='color-f'>energy</strong> to <strong>pause</strong> time",
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.fieldMode === 9 && !tech.isNoDraftPause
        },
        requires: "wormhole, not eternalism",
        effect() {
            tech.isWormHolePause = true
        },
        remove() {
            if (tech.isWormHolePause && m.isBodiesAsleep) m.wakeCheck();
            tech.isWormHolePause = false
        }
    },
    {
        name: "charmed baryons",
        description: `<strong>0.66x</strong> <strong>movement</strong> and <strong>jumping</strong><br><strong class='color-worm'>wormholes</strong> cost <strong>zero</strong> <strong class='color-f'>energy</strong>`,
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.fieldMode === 9 && !tech.isWormholeMapIgnore
        },
        requires: "wormhole, not affine connection",
        effect() {
            tech.isFreeWormHole = true
            tech.baseFx *= 0.66
            tech.baseJumpForce *= 0.66
            m.setMovement()
        },
        //also removed in m.setHoldDefaults() if player switches into a bad field
        remove() {
            tech.isFreeWormHole = false
            if (!tech.isNeutronium) {
                tech.baseFx = 0.08
                tech.baseJumpForce = 10.5
                m.setMovement()
            }
        }
    },
    {
        name: "affine connection",
        description: "<strong class='color-worm'>wormholes</strong> can tunnel through <strong>anything</strong><br>for <strong>2x</strong> <strong class='color-f'>energy</strong> cost",
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.fieldMode === 9 && !tech.isFreeWormHole
        },
        requires: "wormhole, not charmed baryons",
        effect() {
            tech.isWormholeMapIgnore = true
        },
        remove() {
            tech.isWormholeMapIgnore = false
        }
    },
    {
        name: "CIWS",
        description: "<strong>grappling hook</strong> uses <strong>10</strong> <strong class='color-f'>energy</strong><br> to fire <strong>harpoons</strong> at nearby mobs",
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.fieldMode === 10
        },
        requires: "grappling hook",
        effect() {
            tech.isHookDefense = true
        },
        remove() {
            tech.isHookDefense = false
        }
    },
    {
        name: "swarf",
        // description: "after <strong>grappling hook</strong> impacts solid objects generate an <strong class='color-e'>explosion</strong> and become briefly <strong>invulnerable</strong>",
        description: "after <strong>grappling hook</strong> impacts something<br>eject <strong>nails</strong> splinters towards nearby mobs",
        isFieldTech: true,
        maxCount: 3,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        allowed() {
            return m.fieldMode === 10 && !tech.isReel && !tech.isTokamak
        },
        requires: "grappling hook, not reel, tokamak",
        effect() {
            tech.hookNails += 4
        },
        remove() {
            tech.hookNails = 0
        }
    },
    {
        name: "reel",
        description: "<strong>5x</strong> <strong class='color-block'>block</strong> collision <strong class='color-d'>damage</strong><br>up to <strong>+100</strong> <strong class='color-f'>energy</strong> after reeling in <strong class='color-block'>blocks</strong>",
        isFieldTech: true,
        maxCount: 1,
        count: 0,
        frequency: 1,
        frequencyDefault: 1,
        allowed() {
            return m.fieldMode === 10 && !tech.isTokamak && tech.blockDamage === 0.075 && !tech.hookNails
        },
        requires: "grappling hook, not mass driver, swarf, tokamak",
        effect() {
            tech.blockDamage = 0.375
            tech.isReel = true
        },
        remove() {
            tech.blockDamage = 0.075
            tech.isReel = false
        }
    },
    // {
    //     name: "CIWS",
    //     description: "if you <strong>collide</strong> with a mob<br>fire <strong>harpoons</strong> at nearby mobs",
    //     isFieldTech: true,
    //     maxCount: 1,
    //     count: 0,
    //     frequency: 2,
    //     frequencyDefault: 2,
    //     allowed() {
    //         return m.fieldMode === 10 && !tech.isHookDefense
    //     },
    //     requires: "grappling hook, not automatic offense",
    //     effect() {
    //         tech.isHookDefense = true
    //     },
    //     remove() {
    //         tech.isHookDefense = false
    //     }
    // },
    //     {
    //     name: "wire",
    //     description: "",
    //     isFieldTech: true,
    //     maxCount: 1,
    //     count: 0,
    //     frequency: 2,
    //     frequencyDefault: 2,
    //     allowed() {
    //         return m.fieldMode === 10
    //     },
    //     requires: "grappling hook",
    //     effect() {
    //         tech.isHookWire = true
    //     },
    //     remove() {
    //         tech.isHookWire = false
    //     }
    // },
    //************************************************** 
    //************************************************** experimental
    //************************************************** modes
    //************************************************** 
    // {
    //     name: "-ship-",
    //     description: "<strong style='color: #f55;'>experiment:</strong> fly around with no legs<br>aim with the keyboard",
    //     maxCount: 1,
    //     count: 0,
    //     frequency: 0,
    //     isInstant: true,
    //     isBadRandomOption: true,
    //     isExperimentalMode: true,
    //     allowed() {
    //         return build.isExperimentSelection && !m.isShipMode && m.fieldUpgrades[m.fieldMode].name !== "negative mass"
    //     },
    //     requires: "",
    //     effect() {
    //         m.shipMode()
    //     },
    //     remove() {}
    // },
    // {
    //     name: "-quantum leap-",
    //     description: "<strong style='color: #f55;'>experiment:</strong> every 20 seconds<br>become an <strong class='alt'>alternate</strong> version of yourself",
    //     maxCount: 1,
    //     count: 0,
    //     frequency: 0,
    //     isBadRandomOption: true,
    //     isExperimentalMode: true,
    //     allowed() {
    //         return build.isExperimentSelection
    //     },
    //     requires: "",
    //     interval: undefined,
    //     effect() {
    //         this.interval = setInterval(() => {
    //             if (!build.isExperimentSelection) {
    //                 m.switchWorlds()
    //                 simulation.trails()
    //             }
    //         }, 20000); //every 20 seconds

    //     },
    //     remove() {
    //         if (this.count > 0) clearTimeout(this.interval);
    //     }
    // },
    // {
    //     name: "-shields-",
    //     description: "<strong style='color: #f55;'>experiment:</strong> every 5 seconds<br>all mobs gain a shield",
    //     maxCount: 1,
    //     count: 0,
    //     frequency: 0,
    //     isBadRandomOption: true,
    //     isExperimentalMode: true,
    //     allowed() {
    //         return build.isExperimentSelection
    //     },
    //     requires: "",
    //     effect() {
    //         this.interval = setInterval(() => {
    //             if (!build.isExperimentSelection) {
    //                 for (let i = 0; i < mob.length; i++) {
    //                     if (!mob[i].isShielded && !mob[i].shield && mob[i].isDropPowerUp) spawn.shield(mob[i], mob[i].position.x, mob[i].position.y, 1, true);
    //                 }
    //             }
    //         }, 5000); //every 5 seconds
    //     },
    //     interval: undefined,
    //     remove() {
    //         if (this.count > 0) clearTimeout(this.interval);
    //     }
    // },
    // {
    //     name: "-Fourier analysis-",
    //     description: "<strong style='color: #f55;'>experiment:</strong> your aiming is random",
    //     maxCount: 1,
    //     count: 0,
    //     frequency: 0,
    //     isBadRandomOption: true,
    //     isExperimentalMode: true,
    //     allowed() {
    //         return build.isExperimentSelection && !m.isShipMode
    //     },
    //     requires: "not ship",
    //     effect() {
    //         m.look = () => {
    //             m.angle = 2 * Math.sin(m.cycle * 0.0133) + Math.sin(m.cycle * 0.013) + 0.5 * Math.sin(m.cycle * 0.031) + 0.33 * Math.sin(m.cycle * 0.03)
    //             const scale = 0.8;
    //             m.transSmoothX = canvas.width2 - m.pos.x - (simulation.mouse.x - canvas.width2) * scale;
    //             m.transSmoothY = canvas.height2 - m.pos.y - (simulation.mouse.y - canvas.height2) * scale;
    //             m.transX += (m.transSmoothX - m.transX) * 0.07;
    //             m.transY += (m.transSmoothY - m.transY) * 0.07;
    //         }
    //     },
    //     remove() {
    //         if (this.count > 0) m.look = m.lookDefault()
    //     }
    // },
    // {
    //     name: "-panopticon-",
    //     description: "<strong style='color: #f55;'>experiment:</strong> mobs can always see you",
    //     maxCount: 1,
    //     count: 0,
    //     frequency: 0,
    //     isBadRandomOption: true,
    //     isExperimentalMode: true,
    //     allowed() {
    //         return build.isExperimentSelection
    //     },
    //     requires: "",
    //     effect() {
    //         this.interval = setInterval(() => {
    //             if (!build.isExperimentSelection) {
    //                 for (let i = 0; i < mob.length; i++) {
    //                     if (!mob[i].shield && mob[i].isDropPowerUp) {
    //                         mob[i].locatePlayer()
    //                         mob[i].seePlayer.yes = true;
    //                     }
    //                 }
    //             }
    //         }, 1000); //every 1 seconds
    //     },
    //     interval: undefined,
    //     remove() {
    //         if (this.count > 0) clearTimeout(this.interval);
    //     }
    // },
    // {
    //     name: "-decomposers-",
    //     description: "<strong style='color: #f55;'>experiment:</strong> after they die<br>mobs leave behind spawns",
    //     maxCount: 1,
    //     count: 0,
    //     frequency: 0,
    //     isBadRandomOption: true,
    //     isExperimentalMode: true,
    //     allowed() {
    //         return build.isExperimentSelection
    //     },
    //     requires: "",
    //     effect() {
    //         tech.deathSpawns = 0.2
    //     },
    //     remove() {
    //         tech.deathSpawns = 0
    //     }
    // },



    //************************************************** 
    //************************************************** JUNK
    //************************************************** tech
    //************************************************** 
    // {
    //     name: "junk",
    //     description: "",
    //     maxCount: 9,
    //     count: 0,
    //     frequency: 0,
    //     isInstant: true,
    //     isJunk: true,
    //     allowed() {
    //         return true
    //     },
    //     requires: "",
    //     effect() {

    //     },
    //     remove() {}
    // },
    {
        name: "swap meet",
        description: "normal <strong class='color-m'>tech</strong> become <strong class='color-junk'>JUNK</strong><br>and <strong class='color-junk'>JUNK</strong> become normal <strong class='color-m'>tech</strong>",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isJunk: true,
        isInstant: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            for (let i = 0, len = tech.tech.length; i < len; i++) {
                tech.tech[i].isJunk = !tech.tech[i].isJunk
                if (tech.tech[i].isJunk) { } else { }

                if (tech.tech[i].frequency > 0) {
                    tech.tech[i].frequency = 0
                } else {
                    tech.tech[i].frequency = 2
                }
            }
        },
        remove() { }
    },
    // {
    //     name: "pocket dimension",
    //     description: "rotate tech descriptions into a higher spacial dimension",
    //     maxCount: 1,
    //     count: 0,
    //     frequency: 0,
    //     isJunk: true,
    //     isInstant: true,
    //     allowed() {
    //         return true
    //     },
    //     requires: "",
    //     effect() {
    // document.getElementById("choose-grid").classList.add("flipX");
    //     },
    //     remove() {}
    // },
    {
        name: "random",
        link: `<a target="_blank" href='https://en.wikipedia.org/wiki/Special:Random' class="link">random</a>`,
        delay: 333,
        descriptionFunction() {
            const delay = 333
            const loop = () => {
                if ((simulation.isChoosing) && m.alive && !build.isExperimentSelection) {
                    const dmg = Math.floor(27 * Math.random()) * 0.01
                    this.text = `<strong style = "font-family: 'Courier New', monospace;">+${(1 + dmg).toFixed(2).padStart(2, '0')}x</strong> <strong class='color-d'>damage</strong>`
                    this.damage = 1 + dmg
                    if (document.getElementById(`damage-JUNK-id${this.id}`)) document.getElementById(`damage-JUNK-id${this.id}`).innerHTML = this.text
                    setTimeout(() => {
                        loop()
                    }, delay);
                }
            }
            setTimeout(() => {
                loop()
            }, delay);
            this.id++
            return `<span id = "damage-JUNK-id${this.id}">${this.text}</span>`
        },
        maxCount: 3,
        count: 0,
        frequency: 1,
        isJunk: true,
        allowed() {
            return !build.isExperimentSelection
        },
        requires: "NOT EXPERIMENT MODE",
        damage: 0,
        effect() {
            tech.damage *= this.damage
        },
        remove() {
            if (this.count && m.alive) tech.damage /= this.damage
        }
    },
    {
        name: "boost",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isJunk: true,
        isInstant: true,
        allowed() {
            return !build.isExperimentSelection
        },
        requires: "NOT EXPERIMENT MODE",
        effect() {
            powerUps.spawnDelay("boost", this.spawnCount)
        },
        remove() { },
        id: 0,
        text: "",
        delay: 100,
        spawnCount: 0,
        descriptionFunction() {
            let count = 9999 * Math.random()
            const loop = () => {
                if ((simulation.isChoosing) && m.alive && !build.isExperimentSelection) { //&& (!simulation.isChoosing || this.count === 0) //simulation.paused ||
                    count += 4.5
                    const waves = 2 * Math.sin(count * 0.0133) + Math.sin(count * 0.013) + 0.5 * Math.sin(count * 0.031) + 0.33 * Math.sin(count * 0.03)
                    this.spawnCount = Math.floor(100 * Math.abs(waves))
                    this.text = `spawn <strong style = "font-family: 'Courier New', monospace;">${this.spawnCount.toLocaleString(undefined, { minimumIntegerDigits: 3 })}</strong> ${powerUps.orb.boost(1)}<br>that give <strong>${(1 + powerUps.boost.damage).toFixed(2)}x</strong> <strong class='color-d'>damage</strong> for <strong>${(powerUps.boost.duration / 60).toFixed(0)}</strong> seconds</span>`
                    if (document.getElementById(`boost-JUNK-id${this.id}`)) document.getElementById(`boost-JUNK-id${this.id}`).innerHTML = this.text
                    setTimeout(() => {
                        loop()
                    }, this.delay);
                }
            }
            setTimeout(() => {
                loop()
            }, this.delay);
            this.id++
            return `<span id = "boost-JUNK-id${this.id}">${this.text}</span>`
        },
    },
    {
        name: "placebo",
        description: "<strong>7.77x</strong> <strong class='color-d'>damage</strong>",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isJunk: true,
        allowed: () => true,
        requires: "",
        effect() {
            if (Math.random() < 0.07) tech.damage *= 7.77
        },
        remove() { }
    },
    {
        name: "universal healthcare",
        description: "make your <strong class='color-d'>damage</strong> negative",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isJunk: true,
        allowed: () => true,
        requires: "",
        effect() {
            tech.damage *= -1
        },
        remove() { }
    },
    {
        name: "planned obsolescence",
        description: "build <strong>100</strong> scrap <strong class='color-bot'>bots</strong><br>bots might last for <strong>30</strong> seconds",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isJunk: true,
        allowed: () => true,
        requires: "",
        effect() {
            for (let i = 0; i < 100; i++) {
                b.randomBot(m.pos, false)
                bullet[bullet.length - 1].endCycle = simulation.cycle + 800 + 1000 * Math.random() //15 seconds
            }
        },
        remove() { }
    },
    // {
    //     name: "synchrotron",
    //     descriptionFunction() {
    //         return `<strong>power ups</strong> change into a different <strong>flavor</strong> after a boss dies`
    //     },
    //     maxCount: 3,
    //     count: 0,
    //     frequency: 1,
    //     frequencyDefault: 1,
    //     allowed: () => true,
    //     requires: "",
    //     effect() {
    //     },
    //     remove() {
    //     }
    // },
    {
        name: "return",
        description: "return to the start of the game",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isJunk: true,
        isInstant: true,
        allowed: () => true,
        requires: "",
        effect() {
            level.onLevel = 0
            simulation.clearNow = true //end current level
        },
        remove() { }
    },
    {
        name: "panpsychism",
        description: "awaken all <strong class='color-block'>blocks</strong><br><strong class='color-block'>blocks</strong> have a chance to spawn power ups",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isJunk: true,
        isInstant: true,
        allowed: () => true,
        requires: "",
        effect() {
            setInterval(() => {
                for (let i = body.length - 1; i > -1; i--) {
                    if (!body[i].isNotHoldable) {
                        Matter.Composite.remove(engine.world, body[i]);
                        spawn.blockMob(body[i].position.x, body[i].position.y, body[i], 0);
                        if (!body[i].isAboutToBeRemoved) mob[mob.length - 1].isDropPowerUp = true
                        body.splice(i, 1);
                    }
                }
            }, 6000);
        },
        remove() { }
    },
    {
        name: "meteor shower",
        description: "take a shower, but meteors instead of water",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isJunk: true,
        isInstant: true,
        allowed: () => true,
        requires: "",
        effect() {
            setInterval(() => {

                fireBlock = function (xPos, yPos) {
                    const index = body.length
                    spawn.bodyRect(xPos, yPos, 20 + 50 * Math.random(), 20 + 50 * Math.random());
                    const bodyBullet = body[index]
                    Matter.Body.setVelocity(bodyBullet, {
                        x: 5 * (Math.random() - 0.5),
                        y: 10 * (Math.random() - 0.5)
                    });
                    bodyBullet.isAboutToBeRemoved = true
                    setTimeout(() => { //remove block
                        for (let i = 0; i < body.length; i++) {
                            if (body[i] === bodyBullet) {
                                Matter.Composite.remove(engine.world, body[i]);
                                body.splice(i, 1);
                            }
                        }
                    }, 4000 + Math.floor(9000 * Math.random()));
                }
                fireBlock(player.position.x + 600 * (Math.random() - 0.5), player.position.y - 500 - 500 * Math.random());
                // for (let i = 0, len =  Math.random(); i < len; i++) {
                // }

            }, 1000);
        },
        remove() { }
    },
    {
        name: "reinforcement learning",
        description: "<strong>10x</strong> current <strong class='color-m'>tech</strong> <em class='flicker'>frequency</em>",
        maxCount: 1,
        count: 0,
        frequency: 1,
        isJunk: true,
        allowed() {
            return tech.totalCount > 9
        },
        requires: "at least 10 tech",
        effect() {
            for (let i = 0, len = tech.tech.length; i < len; i++) {
                if (tech.tech[i].count > 0) tech.tech[i].frequency *= 10
            }
        },
        remove() {
            if (this.count) {
                for (let i = 0, len = tech.tech.length; i < len; i++) {
                    if (tech.tech[i].count > 0 && tech.tech[i].frequency > 1) tech.tech[i].frequency /= 10
                }
            }
        }
    },
    {
        name: "startle response",
        description: `if a threat is nearby, activate a ${powerUps.orb.boost(1)}<br>and lock your mouse until you press escape`,
        maxCount: 1,
        count: 0,
        frequency: 0,
        isJunk: true,
        isInstant: true,
        allowed: () => true,
        requires: "",
        effect() {
            // tech.damage *= 1.33
            setInterval(() => {
                if (powerUps.boost.endCycle < m.cycle && !simulation.paused && m.alive) {
                    for (let i = 0; i < mob.length; i++) {
                        if (mob[i].distanceToPlayer2() < 400000) { //650
                            canvas.requestPointerLock();
                            powerUps.boost.effect();
                            break
                        }
                    }
                }
            }, 2000);
        },
        remove() { }
    },
    {
        name: "closed timelike curve",
        description: "spawn 5 <strong class='color-f'>field</strong> power ups, but every 12 seconds<br>teleport a second into your future or past",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isJunk: true,
        isInstant: true,
        allowed: () => true,
        requires: "",
        effect() {
            for (let i = 0; i < 5; i++) powerUps.spawn(m.pos.x + 10 * Math.random(), m.pos.y + 10 * Math.random(), "field");

            function loop() {
                if (!simulation.paused && m.alive) {
                    if (!(simulation.cycle % 720)) {
                        requestAnimationFrame(() => {
                            if ((simulation.cycle % 1440) > 720) { //kinda alternate between each option
                                m.rewind(60)
                                m.energy += 0.4 //to make up for lost energy
                            } else {
                                simulation.timePlayerSkip(60)
                            }
                        }); //wrapping in animation frame prevents errors, probably
                    }
                }
                requestAnimationFrame(loop);
            }
            requestAnimationFrame(loop);
        },
        remove() { }
    },
    // {
    //     name: "translate",
    //     description: "translate n-gon into a random language",
    //     maxCount: 1,
    //     count: 0,
    //     frequency: 0,
    //     isJunk: true,
    //     isInstant: true,
    //     allowed() {
    //         return true
    //     },
    //     requires: "",
    //     effect() {
    //         // generate a container 
    //         const gtElem = document.createElement('div')
    //         gtElem.id = "gtElem"
    //         gtElem.style.visibility = 'hidden' // make it invisible
    //         document.body.append(gtElem)

    //         // generate a script to run after creation
    //         function initGT() {
    //             // create a new translate element
    //             new google.translate.TranslateElement({ pageLanguage: 'en', layout: google.translate.TranslateElement.InlineLayout.HORIZONTAL }, 'gtElem')
    //             // ok now since it's loaded perform a funny hack to make it work
    //             const langSelect = document.getElementsByClassName("goog-te-combo")[0]
    //             // select a random language. It takes a second for all langauges to load, so wait a second.
    //             setTimeout(() => {
    //                 langSelect.selectedIndex = Math.round(langSelect.options.length * Math.random())
    //                 // simulate a click
    //                 langSelect.dispatchEvent(new Event('change'))
    //                 // now make it go away
    //                 const bar = document.getElementById(':1.container')
    //                 bar.style.display = 'none'
    //                 bar.style.visibility = 'hidden'
    //             }, 1000)

    //         }

    //         // add the google translate script
    //         const translateScript = document.createElement('script')
    //         translateScript.src = '//translate.google.com/translate_a/element.js?cb=initGT'
    //         document.body.append(translateScript)
    //     },
    //     remove() {}
    // },
    {
        name: "discount",
        description: "get 3 random <strong class='color-junk'>JUNK</strong><strong class='color-m'>tech</strong> for the price of 1!",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isJunk: true,
        isInstant: true,
        allowed: () => true,
        requires: "",
        effect() {
            for (let i = 0; i < 3; i++) {
                const list = []
                for (let i = 0; i < tech.tech.length; i++) {
                    if (tech.tech[i].isJunk) list.push(tech.tech[i].name)
                }
                let name = list[Math.floor(Math.random() * list.length)]
                simulation.makeTextLog(`<span class='color-var'>tech</span>.giveTech("<span class='color-text'>${name}</span>")`);
                tech.giveTech(name)
            }
        },
        remove() { }
    },
    // {
    //     name: "hi",
    //     description: `spawn to seed <strong>616</strong> `,
    //     maxCount: 1,
    //     count: 0,
    //     frequency: 0,
    //     isInstant: true,
    //     isJunk: true,
    //     allowed() {
    //         return true
    //     },
    //     requires: "",
    //     effect() {
    //         document.getElementById("seed").placeholder = Math.initialSeed = String(616)
    //         Math.seed = Math.abs(Math.hash(Math.initialSeed)) //update randomizer seed in case the player changed it
    //     },
    //     remove() {}
    // },
    {
        name: "Higgs phase transition",
        description: "instantly spawn 5 <strong class='color-m'>tech</strong>, but add a chance to<br>remove everything with a 5 minute <strong>half-life</strong>",
        maxCount: 1,
        count: 0,
        frequency: 0,
        frequencyDefault: 0,
        isJunk: true,
        isInstant: true,
        allowed: () => true,
        requires: "",
        effect() {
            powerUps.spawn(m.pos.x, m.pos.y, "tech");
            powerUps.spawn(m.pos.x + 30, m.pos.y, "tech");
            powerUps.spawn(m.pos.x + 60, m.pos.y, "tech");
            powerUps.spawn(m.pos.x, m.pos.y - 30, "tech");
            powerUps.spawn(m.pos.x + 30, m.pos.y - 60, "tech");

            function loop() {
                // (1-X)^cycles = chance to be removed //Math.random() < 0.000019  10 min
                if (!simulation.paused && m.alive) {
                    if (Math.random() < 0.000038) {
                        // m.death();
                        simulation.clearMap();
                        simulation.draw.setPaths();
                        return
                    }
                }
                requestAnimationFrame(loop);
            }
            requestAnimationFrame(loop);
        },
        remove() { }
    },
    {
        name: "harvest",
        description: "convert all the mobs on this level into <strong class='color-ammo'>ammo</strong>",
        maxCount: 1,
        count: 0,
        frequency: 0,
        frequencyDefault: 0,
        isJunk: true,
        isInstant: true,
        allowed: () => true,
        requires: "",
        effect() {
            for (let i = 0, len = mob.length; i < len; i++) {
                if (mob[i].isDropPowerUp) {
                    powerUps.directSpawn(mob[i].position.x, mob[i].position.y, "ammo");
                    mob[i].death();
                }
            }
            // for (let i = powerUp.length - 1; i > -1; i--) {
            //     if (powerUp[i].name !== "ammo") {
            //         Matter.Composite.remove(engine.world, powerUp[i]);
            //         powerUp.splice(i, 1);
            //     }
            // }
        },
        remove() { }
    },
    {
        name: "brainstorm",
        description: "the <strong class='color-m'>tech</strong> <strong class='color-choice'><span>ch</span><span>oi</span><span>ce</span></strong> menu <strong>randomizes</strong><br>every <strong>0.5</strong> seconds for <strong>10</strong> seconds",
        maxCount: 1,
        count: 0,
        frequency: 0,
        frequencyDefault: 0,
        isJunk: true,
        allowed: () => true,
        requires: "",
        effect() {
            tech.isBrainstorm = true
            tech.isBrainstormActive = false
            tech.brainStormDelay = 500 //show each option for 0.5 seconds
        },
        remove() {
            tech.isBrainstorm = false
            tech.isBrainstormActive = false
        }
    },
    {
        name: "catabolysis",
        description: `set your maximum <strong class='color-h'>health</strong> to <strong>1</strong><br><strong>double</strong> your current <strong class='color-ammo'>ammo</strong> <strong>10</strong> times`,
        maxCount: 1,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return !tech.isFallingDamage && !tech.isOverHeal && !tech.isEnergyHealth
        },
        requires: "not quenching, tungsten carbide, mass-energy",
        effect() {
            m.baseHealth = 0.01
            m.setMaxHealth();
            for (let i = 0; i < b.guns.length; i++) b.guns[i].ammo = b.guns[i].ammo * Math.pow(2, 10)
            simulation.updateGunHUD();
        },
        remove() { }
    },
    {
        name: "palantír",
        description: `see far away lands`,
        maxCount: 1,
        count: 0,
        frequency: 0,
        // isInstant: true,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            m.look = () => {
                //always on mouse look
                m.angle = Math.atan2(
                    simulation.mouseInGame.y - m.pos.y,
                    simulation.mouseInGame.x - m.pos.x
                );
                //smoothed mouse look translations
                const scale = 2;
                m.transSmoothX = canvas.width2 - m.pos.x - (simulation.mouse.x - canvas.width2) * scale;
                m.transSmoothY = canvas.height2 - m.pos.y - (simulation.mouse.y - canvas.height2) * scale;
                m.transX += (m.transSmoothX - m.transX) * m.lookSmoothing;
                m.transY += (m.transSmoothY - m.transY) * m.lookSmoothing;
            }
        },
        remove() {
            if (this.count) m.look = m.lookDefault
        }
    },
    {
        name: "motion sickness",
        description: `disable camera smoothing`,
        maxCount: 1,
        count: 0,
        frequency: 0,
        // isInstant: true,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            m.look = () => {
                //always on mouse look
                m.angle = Math.atan2(
                    simulation.mouseInGame.y - m.pos.y,
                    simulation.mouseInGame.x - m.pos.x
                );
                //smoothed mouse look translations
                const scale = 1.2;
                m.transSmoothX = canvas.width2 - m.pos.x - (simulation.mouse.x - canvas.width2) * scale;
                m.transSmoothY = canvas.height2 - m.pos.y - (simulation.mouse.y - canvas.height2) * scale;
                m.transX = canvas.width2 - m.pos.x - (simulation.mouse.x - canvas.width2) * scale;
                m.transY = canvas.height2 - m.pos.y - (simulation.mouse.y - canvas.height2) * scale;
                // m.transX += (m.transSmoothX - m.transX) * m.lookSmoothing;
                // m.transY += (m.transSmoothY - m.transY) * m.lookSmoothing;
            }
        },
        remove() {
            if (this.count) m.look = m.lookDefault
        }
    },
    {
        name: "facsimile",
        description: `inserts a copy of your current level into the level list`,
        maxCount: 1,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            const index = Math.min(level.levels.length - 1, level.onLevel)
            level.levels.splice(index, 0, level.levels[index]);
        },
        remove() { }
    },
    {
        name: "negative friction",
        description: "when you touch walls you speed up instead of slowing down. It's kinda fun.",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            player.friction = -0.4
        },
        remove() {
            if (this.count) player.friction = 0.002
        }
    },
    {
        name: "bounce",
        description: "you bounce off things.  It's annoying, but not that bad.",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            player.restitution = 0.9
        },
        remove() {
            if (this.count) player.restitution = 0
        }
    },
    {
        name: "mouth",
        description: "mobs have a non functional mouth",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            mobs.draw = () => {
                ctx.lineWidth = 2;
                let i = mob.length;
                while (i--) {
                    ctx.beginPath();
                    const vertices = mob[i].vertices;
                    ctx.moveTo(vertices[0].x, vertices[0].y);
                    for (let j = 1, len = vertices.length; j < len; ++j) ctx.lineTo(vertices[j].x, vertices[j].y);
                    ctx.quadraticCurveTo(mob[i].position.x, mob[i].position.y, vertices[0].x, vertices[0].y);
                    ctx.fillStyle = mob[i].fill;
                    ctx.strokeStyle = mob[i].stroke;
                    ctx.fill();
                    ctx.stroke();
                }
            }
        },
        remove() {
            mobs.draw = mobs.drawDefault
        }
    },
    {
        name: "all-stars",
        description: "make all mobs look like stars",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            mobs.draw = () => {
                ctx.lineWidth = 2;
                let i = mob.length;
                while (i--) {
                    ctx.beginPath();
                    const vertices = mob[i].vertices;
                    ctx.moveTo(vertices[0].x, vertices[0].y);
                    for (let j = 1, len = vertices.length; j < len; ++j) ctx.quadraticCurveTo(mob[i].position.x, mob[i].position.y, vertices[j].x, vertices[j].y);
                    ctx.quadraticCurveTo(mob[i].position.x, mob[i].position.y, vertices[0].x, vertices[0].y);
                    ctx.fillStyle = mob[i].fill;
                    ctx.strokeStyle = mob[i].stroke;
                    ctx.fill();
                    ctx.stroke();
                }
            }
        },
        remove() {
            mobs.draw = mobs.drawDefault
        }
    },
    // draw() {
    //     ctx.lineWidth = 2;
    //     let i = mob.length;
    //     while (i--) {
    //         ctx.beginPath();
    //         const vertices = mob[i].vertices;
    //         ctx.moveTo(vertices[0].x, vertices[0].y);
    //         for (let j = 1, len = vertices.length; j < len; ++j) ctx.lineTo(vertices[j].x, vertices[j].y);
    //         ctx.lineTo(vertices[0].x, vertices[0].y);
    //         ctx.fillStyle = mob[i].fill;
    //         ctx.strokeStyle = mob[i].stroke;
    //         ctx.fill();
    //         ctx.stroke();
    //     }
    // },
    {
        name: "true colors",
        description: `set all power ups to their real world colors`,
        maxCount: 1,
        count: 0,
        frequency: 0,
        isJunk: true,
        isInstant: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            // const colors = shuffle(["#f7b", "#0eb", "#467", "#0cf", "hsl(246,100%,77%)", "#26a"])
            const colors = shuffle([powerUps.research.color, powerUps.heal.color, powerUps.ammo.color, powerUps.ammo.color, powerUps.field.color, powerUps.gun.color])
            powerUps.research.color = colors[0]
            powerUps.heal.color = colors[1]
            powerUps.ammo.color = colors[2]
            powerUps.field.color = colors[3]
            powerUps.tech.color = colors[4]
            powerUps.gun.color = colors[5]
            for (let i = 0; i < powerUp.length; i++) {
                switch (powerUp[i].name) {
                    case "research":
                        powerUp[i].color = colors[0]
                        break;
                    case "heal":
                        powerUp[i].color = colors[1]
                        break;
                    case "ammo":
                        powerUp[i].color = colors[2]
                        break;
                    case "field":
                        powerUp[i].color = colors[3]
                        break;
                    case "tech":
                        powerUp[i].color = colors[4]
                        break;
                    case "gun":
                        powerUp[i].color = colors[5]
                        break;
                }
            }
        },
        remove() {
            // const colors = ["#f7b", "#0eb", "#467", "#0cf", "hsl(246,100%,77%)", "#26a"] //no shuffle
            // powerUps.research.color = colors[0]
            // powerUps.heal.color = colors[1]
            // powerUps.ammo.color = colors[2]
            // powerUps.field.color = colors[3]
            // powerUps.tech.color = colors[4]
            // powerUps.gun.color = colors[5]
            // for (let i = 0; i < powerUp.length; i++) {
            //     switch (powerUp[i].name) {
            //         case "research":
            //             powerUp[i].color = colors[0]
            //             break;
            //         case "heal":
            //             powerUp[i].color = colors[1]
            //             break;
            //         case "ammo":
            //             powerUp[i].color = colors[2]
            //             break;
            //         case "field":
            //             powerUp[i].color = colors[3]
            //             break;
            //         case "tech":
            //             powerUp[i].color = colors[4]
            //             break;
            //         case "gun":
            //             powerUp[i].color = colors[5]
            //             break;
            //     }
            // }
        }
    },
    {
        name: "emergency broadcasting",
        description: "emit 2 sine waveforms at 853 Hz and 960 Hz<br><em>lower your volume</em>",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isJunk: true,
        isInstant: true,
        allowed() {
            return true
        },
        requires: "",
        effect: () => {
            //setup audio context
            function tone(frequency) {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator1 = audioCtx.createOscillator();
                const gainNode1 = audioCtx.createGain();
                gainNode1.gain.value = 0.5; //controls volume
                oscillator1.connect(gainNode1);
                gainNode1.connect(audioCtx.destination);
                oscillator1.type = "sine"; // 'sine' 'square', 'sawtooth', 'triangle' and 'custom'
                oscillator1.frequency.value = frequency; // value in hertz
                oscillator1.start();
                return audioCtx
            }
            // let sound = tone(1050)

            function EBS() {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

                const oscillator1 = audioCtx.createOscillator();
                const gainNode1 = audioCtx.createGain();
                gainNode1.gain.value = 0.3; //controls volume
                oscillator1.connect(gainNode1);
                gainNode1.connect(audioCtx.destination);
                oscillator1.type = "sine"; // 'sine' 'square', 'sawtooth', 'triangle' and 'custom'
                oscillator1.frequency.value = 850; // value in hertz
                oscillator1.start();

                const oscillator2 = audioCtx.createOscillator();
                const gainNode2 = audioCtx.createGain();
                gainNode2.gain.value = 0.3; //controls volume
                oscillator2.connect(gainNode2);
                gainNode2.connect(audioCtx.destination);
                oscillator2.type = "sine"; // 'sine' 'square', 'sawtooth', 'triangle' and 'custom'
                oscillator2.frequency.value = 957; // value in hertz
                oscillator2.start();
                return audioCtx
            }
            let sound = EBS()

            delay = 1000
            setTimeout(() => {
                sound.suspend()
                powerUps.spawn(m.pos.x + 160 * (Math.random() - 0.5), m.pos.y + 160 * (Math.random() - 0.5), "heal");
                setTimeout(() => {
                    sound.resume()
                    setTimeout(() => {
                        sound.suspend()
                        powerUps.spawn(m.pos.x + 160 * (Math.random() - 0.5), m.pos.y + 160 * (Math.random() - 0.5), "heal");
                        setTimeout(() => {
                            sound.resume()
                            setTimeout(() => {
                                sound.suspend()
                                powerUps.spawn(m.pos.x + 160 * (Math.random() - 0.5), m.pos.y + 160 * (Math.random() - 0.5), "heal");
                                setTimeout(() => {
                                    sound.resume()
                                    setTimeout(() => {
                                        sound.suspend()
                                        powerUps.spawn(m.pos.x + 160 * (Math.random() - 0.5), m.pos.y + 160 * (Math.random() - 0.5), "heal");
                                        setTimeout(() => {
                                            sound.resume()
                                            setTimeout(() => {
                                                sound.suspend()
                                                powerUps.spawn(m.pos.x + 160 * (Math.random() - 0.5), m.pos.y + 160 * (Math.random() - 0.5), "heal");
                                                setTimeout(() => {
                                                    sound.resume()
                                                    setTimeout(() => {
                                                        sound.suspend()
                                                        sound.close()
                                                        powerUps.spawn(m.pos.x + 160 * (Math.random() - 0.5), m.pos.y + 160 * (Math.random() - 0.5), "heal");
                                                    }, delay);
                                                }, delay);
                                            }, delay);
                                        }, delay);
                                    }, delay);
                                }, delay);
                            }, delay);
                        }, delay);
                    }, delay);
                }, delay);
            }, delay);
        },
        remove() { }
    },
    {
        name: "automatic",
        description: "you can't fire when moving<br>always <strong>fire</strong> when at <strong>rest</strong>",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isJunk: true,
        allowed() {
            return !tech.isFireMoveLock
        },
        requires: "not Higgs mechanism",
        effect() {
            tech.isAlwaysFire = true;
            b.setFireMethod();
        },
        remove() {
            if (tech.isAlwaysFire) {
                tech.isAlwaysFire = false
                b.setFireMethod();
            }
        }
    },
    {
        name: "hidden variable",
        descriptionFunction() {
            return `spawn ${powerUps.orb.heal(20)}<br>but hide your <strong class='color-h'>health</strong> bar`
        },
        maxCount: 1,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            document.getElementById("health").style.display = "none"
            document.getElementById("health-bg").style.display = "none"
            document.getElementById("defense-bar").style.display = "none"
            for (let i = 0; i < 20; i++) powerUps.spawn(m.pos.x + 160 * (Math.random() - 0.5), m.pos.y + 160 * (Math.random() - 0.5), "heal");
        },
        remove() { }
    },
    {
        name: "not a bug",
        description: "initiate a totally safe game crash for 10 seconds",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            const savedfunction = simulation.drawCircle
            simulation.drawCircle = () => {
                const a = mob[Infinity].position //crashed the game in a visually interesting way, because of the ctx.translate command is never reverted in the main game loop
            }
            setTimeout(() => {
                simulation.drawCircle = savedfunction
                canvas.width = canvas.width //clears the canvas // works on chrome at least
                powerUps.spawn(m.pos.x, m.pos.y, "tech");
            }, 10000);

            // for (;;) {} //freezes the tab
        },
        remove() { }
    },
    {
        name: "what the block?",
        description: "throwing a <strong class='color-block'>block</strong> throws <strong>you</strong> instead",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return m.fieldMode !== 8 && m.fieldMode !== 9 && !tech.isTokamak
        },
        requires: "not pilot wave, tokamak, wormhole",
        effect() {

        },
        remove() {
            m.throwBlock = m.throwBlockDefault
        }
    },
    {
        name: "spinor",
        description: "the direction you aim is determined by your position",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return !m.isShipMode
        },
        requires: "",
        effect() {
            m.look = function () {
                //always on mouse look
                m.angle = (((m.pos.x + m.pos.y) / 100 + Math.PI) % Math.PI * 2) - Math.PI
                //smoothed mouse look translations
                const scale = 0.8;
                m.transSmoothX = canvas.width2 - m.pos.x - (simulation.mouse.x - canvas.width2) * scale;
                m.transSmoothY = canvas.height2 - m.pos.y - (simulation.mouse.y - canvas.height2) * scale;

                m.transX += (m.transSmoothX - m.transX) * 0.07;
                m.transY += (m.transSmoothY - m.transY) * 0.07;
            }
        },
        remove() {
            if (this.count) m.look = m.lookDefault
        }
    },
    {
        name: "p-zombie",
        description: "set your <strong class='color-h'>health</strong> to <strong>1</strong><br>all mobs, not bosses, die and <strong>resurrect</strong> as zombies",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() { return true },
        requires: "",
        effect() {
            m.health = 0.01 //set health to 1
            m.displayHealth();
            for (let i = mob.length - 1; i > -1; i--) { //replace mobs with zombies
                if (mob[i].isDropPowerUp && !mob[i].isBoss && mob[i].alive) {
                    mob[i].isSoonZombie = true
                    mob[i].death()
                }
            }
        },
        remove() { }
    },
    {
        name: "decomposers",
        description: "after they die <strong>mobs</strong> leave behind <strong>spawns</strong>",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return tech.deathSpawns === 0
        },
        requires: "",
        effect() {
            tech.deathSpawns = 0.2
        },
        remove() {
            tech.deathSpawns = 0
        }
    },
    {
        name: "panopticon",
        description: "<strong>mobs</strong> can always see you",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            setInterval(() => {
                for (let i = 0; i < mob.length; i++) {
                    if (!mob[i].shield && mob[i].isDropPowerUp) {
                        mob[i].locatePlayer()
                        mob[i].seePlayer.yes = true;
                    }
                }
            }, 1000); //every 1 seconds
        },
        remove() { }
    },
    // {
    //     name: "inverted mouse",
    //     description: "your mouse is scrambled<br>it's fine, just rotate it 90 degrees",
    //     maxCount: 1,
    //     count: 0,
    //     frequency: 0,
    //     isExperimentHide: true,
    //     isInstant: true,
    //     isJunk: true,
    //     allowed() {
    //         return !m.isShipMode
    //     },
    //     requires: "not ship",
    //     effect() {
    //         document.body.addEventListener("mousemove", (e) => {
    //             const ratio = window.innerWidth / window.innerHeight
    //             simulation.mouse.x = e.clientY * ratio
    //             simulation.mouse.y = e.clientX / ratio;
    //         });
    //     },
    //     remove() {
    //         // m.look = m.lookDefault
    //     }
    // },
    {
        name: "Fourier analysis",
        description: "your aiming is now controlled by this equation:<br><span style = 'font-size:80%;'>2sin(0.0133t) + sin(0.013t) + 0.5sin(0.031t)+ 0.33sin(0.03t)</span>",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isJunk: true,
        allowed() {
            return !m.isShipMode
        },
        requires: "not ship",
        effect() {
            m.look = () => {
                m.angle = 2 * Math.sin(m.cycle * 0.0133) + Math.sin(m.cycle * 0.013) + 0.5 * Math.sin(m.cycle * 0.031) + 0.33 * Math.sin(m.cycle * 0.03)
                const scale = 0.8;
                simulation.mouse.y
                m.transSmoothX = canvas.width2 - m.pos.x - (simulation.mouse.x - canvas.width2) * scale;
                m.transSmoothY = canvas.height2 - m.pos.y - (simulation.mouse.y - canvas.height2) * scale;
                m.transX += (m.transSmoothX - m.transX) * 0.07;
                m.transY += (m.transSmoothY - m.transY) * 0.07;
            }
        },
        remove() {
            if (this.count) m.look = m.lookDefault
        }
    },
    {
        name: "disintegrated armament",
        description: "spawn a <strong class='color-g'>gun</strong><br><strong>remove</strong> your active <strong class='color-g'>gun</strong>",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return b.inventory.length > 0
        },
        requires: "at least 1 gun",
        effect() {
            if (b.inventory.length > 0) b.removeGun(b.guns[b.activeGun].name)
            simulation.makeGunHUD()
            powerUps.spawn(m.pos.x + 60 * (Math.random() - 0.5), m.pos.y + 60 * (Math.random() - 0.5), "gun");
        },
        remove() { }
    },
    {
        name: "probability",
        description: "<strong>100x</strong> <em class='flicker'>frequency</em><br>of one random <strong class='color-m'>tech</strong>",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            let options = []; //find what tech I could get
            for (let i = 0, len = tech.tech.length; i < len; i++) {
                if (
                    tech.tech[i].count < tech.tech[i].maxCount &&
                    tech.tech[i].allowed() &&
                    !tech.tech[i].isJunk &&
                    !tech.tech.isLore
                ) {
                    options.push(i);
                }
            }
            if (options.length) {
                const index = options[Math.floor(Math.random() * options.length)]
                tech.tech[index].frequency = 100
            }
        },
        remove() { }
    },
    {
        name: "encryption",
        description: "secure <strong class='color-m'>tech</strong> information",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            String.prototype.shuffle = function () {
                var a = this.split(""),
                    n = a.length;

                for (var i = n - 1; i > 0; i--) {
                    var j = Math.floor(Math.random() * (i + 1));
                    var tmp = a[i];
                    a[i] = a[j];
                    a[j] = tmp;
                }
                return a.join("");
            }

            for (let i = 0, len = tech.tech.length; i < len; i++) tech.tech[i].name = tech.tech[i].name.shuffle()
        },
        remove() { }
    },
    {
        name: "quantum leap",
        description: "become an <strong class='alt'>alternate</strong> version of yourself<br>every <strong>20</strong> seconds",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            setInterval(() => {
                m.switchWorlds()
                simulation.trails()
            }, 20000); //every 30 seconds
        },
        remove() { }
    },
    {
        name: "score",
        description: "Add a score to n-gon!",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            setInterval(() => {
                let score = Math.ceil(1000 * Math.random() * Math.random() * Math.random() * Math.random() * Math.random())
                simulation.makeTextLog(`simulation.score <span class='color-symbol'>=</span> ${score.toFixed(0)}`);
            }, 10000); //every 10 seconds
        },
        remove() { }
    },
    {
        name: "pop-ups",
        description: "sign up to learn endless easy ways to win n-gon<br>that Landgreen doesn't want you to know!!!1!!",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            setInterval(() => {
                alert(`The best combo is ${tech.tech[Math.floor(Math.random() * tech.tech.length)].name} with ${tech.tech[Math.floor(Math.random() * tech.tech.length)].name}!`);
            }, 30000); //every 30 seconds
        },
        remove() { }
    },
    {
        name: "music",
        description: "add music to n-gon",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            window.open('https://www.youtube.com/watch?v=lEbHeSdmS-k&list=PL9Z5wjoBiPKEDhwCW2RN-VZoCpmhIojdn', '_blank')
        },
        remove() { }
    },
    {
        name: "performance",
        description: "display performance stats to n-gon",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            (function () {
                var script = document.createElement('script');
                script.onload = function () {
                    var stats = new Stats();
                    document.body.appendChild(stats.dom);
                    requestAnimationFrame(function loop() {
                        stats.update();
                        requestAnimationFrame(loop)
                    });
                };
                script.src = 'https://unpkg.com/stats.js@0.17.0/build/stats.min.js';
                document.head.appendChild(script);
            })()
            //move health to the right
            document.getElementById("health").style.left = "86px"
            document.getElementById("health-bg").style.left = "86px"
            document.getElementById("defense-bar").style.left = "86px"
            document.getElementById("damage-bar").style.left = "86px"
        },
        remove() { }
    },
    {
        name: "repartitioning",
        description: "set the <em class='flicker'>frequency</em> of finding normal <strong class='color-m'>tech</strong> to <strong>0</strong><br>spawn 5 <strong class='color-m'>tech</strong>",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            for (let i = 0, len = tech.tech.length; i < len; i++) {
                if (tech.tech[i].isJunk) {
                    tech.tech[i].frequency = 2
                } else {
                    tech.tech[i].frequency = 0
                }
            }
            for (let i = 0; i < 5; i++) powerUps.spawn(m.pos.x, m.pos.y, "tech");
        },
        remove() { }
    },
    {
        name: "defragment",
        description: "set the <em class='flicker'>frequency</em> of finding <strong class='color-junk'>JUNK</strong><strong class='color-m'>tech</strong> to zero",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            tech.junkChance = 0;
        },
        remove() { }
    },
    // {
    //     name: "lubrication",
    //     description: "reduce block density and friction for this level",
    //     maxCount: 9,
    //     count: 0,
    //     frequency: 0,
    //     isInstant: true,
    //     isExperimentHide: true,
    //     isJunk: true,
    //     allowed() {
    //         return true
    //     },
    //     requires: "",
    //     effect() {
    //         for (let i = 0; i < body.length; i++) {
    //             Matter.Body.setDensity(body[i], 0.0001) // 0.001 is normal
    //             body[i].friction = 0.01
    //         }
    //     },
    //     remove() {}
    // },
    {
        name: "pitch",
        description: "oscillate the pitch of your world",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            setInterval(() => {
                if (!simulation.paused) ctx.rotate(0.001 * Math.sin(simulation.cycle * 0.01))
            }, 16);
        },
        remove() { }
    },
    // {
    //     name: "flatland",
    //     description: "map blocks line of sight",
    //     maxCount: 1,
    //     count: 0,
    //     frequency: 0,
    //     isInstant: true,
    //     isJunk: true,
    //     allowed() { return true },
    //     requires: "",
    //     effect() {
    //         simulation.draw.lineOfSightPrecalculation() //required precalculation for line of sight
    //         simulation.draw.drawMapPath = simulation.draw.drawMapSight

    //         simulation.ephemera.push({
    //             name: "LoS", count: 0, do() {
    //                 const pos = m.pos
    //                 const radius = 3000
    //                 if (!simulation.isTimeSkipping) {
    //                     const vertices = simulation.sight.circleLoS(pos, radius);
    //                     if (vertices.length) {
    //                         ctx.beginPath();
    //                         ctx.moveTo(vertices[0].x, vertices[0].y);
    //                         for (var i = 1; i < vertices.length; i++) {
    //                             var currentDistance = Math.sqrt((vertices[i - 1].x - pos.x) ** 2 + (vertices[i - 1].y - pos.y) ** 2);
    //                             var newDistance = Math.sqrt((vertices[i].x - pos.x) ** 2 + (vertices[i].y - pos.y) ** 2);
    //                             if (Math.abs(currentDistance - radius) < 1 && Math.abs(newDistance - radius) < 1) {
    //                                 const currentAngle = Math.atan2(vertices[i - 1].y - pos.y, vertices[i - 1].x - pos.x);
    //                                 const newAngle = Math.atan2(vertices[i].y - pos.y, vertices[i].x - pos.x);
    //                                 ctx.arc(pos.x, pos.y, radius, currentAngle, newAngle);
    //                             } else {
    //                                 ctx.lineTo(vertices[i].x, vertices[i].y)
    //                             }
    //                         }
    //                         newDistance = Math.sqrt((vertices[0].x - pos.x) ** 2 + (vertices[0].y - pos.y) ** 2);
    //                         currentDistance = Math.sqrt((vertices[vertices.length - 1].x - pos.x) ** 2 + (vertices[vertices.length - 1].y - pos.y) ** 2);
    //                         if (Math.abs(currentDistance - radius) < 1 && Math.abs(newDistance - radius) < 1) {
    //                             const currentAngle = Math.atan2(vertices[vertices.length - 1].y - pos.y, vertices[vertices.length - 1].x - pos.x);
    //                             const newAngle = Math.atan2(vertices[0].y - pos.y, vertices[0].x - pos.x);
    //                             ctx.arc(pos.x, pos.y, radius, currentAngle, newAngle);
    //                         } else {
    //                             ctx.lineTo(vertices[0].x, vertices[0].y)
    //                         }

    //                         //stroke the map, so it looks different form the line of sight 
    //                         ctx.strokeStyle = "#234";
    //                         ctx.lineWidth = 9;
    //                         ctx.stroke(simulation.draw.mapPath); //this has a pretty large impact on performance, maybe 5% worse performance

    //                         ctx.globalCompositeOperation = "destination-in";
    //                         ctx.fillStyle = "#000";
    //                         ctx.fill();
    //                         ctx.globalCompositeOperation = "source-over";
    //                         // also see the map
    //                         // ctx.fill(simulation.draw.mapPath);
    //                         // ctx.fillStyle = "#000";
    //                         ctx.clip();
    //                     }
    //                 }
    //             },
    //         })
    //     },
    //     remove() { }
    // },
    {
        name: "umbra",
        description: "produce a blue glow around everything<br>and probably some simulation lag",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            ctx.shadowColor = '#06f';
            ctx.shadowBlur = 25;
        },
        remove() { }
    },
    {
        name: "lighter",
        description: `ctx.globalCompositeOperation = "lighter"`,
        maxCount: 1,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            ctx.globalCompositeOperation = "lighter";
        },
        remove() { }
    },
    {
        name: "rewind",
        description: "every 10 seconds <strong class='color-rewind'>rewind</strong> <strong>2</strong> seconds",
        maxCount: 9,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            setInterval(() => {
                m.rewind(120)
                m.energy += 0.4
            }, 10000);
            // for (let i = 0; i < 24; i++) {
            //     setTimeout(() => { m.rewind(120) }, i * 5000);
            // }
        },
        remove() { }
    },
    {
        name: "undo",
        description: "every 4 seconds <strong class='color-rewind'>rewind</strong> <strong>1/2</strong> a second",
        maxCount: 9,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            setInterval(() => {
                m.rewind(30)
                m.energy += 0.2
            }, 4000);
        },
        remove() { }
    },
    {
        name: "energy to mass conversion",
        description: "convert your <strong class='color-f'>energy</strong> into <strong class='color-block'>blocks</strong>",
        maxCount: 9,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            for (let i = 0, len = 40; i < len; i++) {
                setTimeout(() => {
                    m.energy -= 1 / len
                    where = Vector.add(m.pos, { x: 400 * (Math.random() - 0.5), y: 400 * (Math.random() - 0.5) })
                    spawn.bodyRect(where.x, where.y, Math.floor(15 + 100 * Math.random()), Math.floor(15 + 100 * Math.random()));
                }, i * 100);
            }

        },
        remove() { }
    },
    {
        name: "level.nextLevel()",
        description: "advance to the next level",
        maxCount: 9,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            level.nextLevel();
        },
        remove() { }
    },
    {
        name: "reincarnation",
        description: "kill all mobs and spawn new ones<br>(also spawn a few extra mobs for fun)",
        maxCount: 3,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            spawn.setSpawnList();
            spawn.setSpawnList();
            for (let i = 0, len = mob.length; i < len; i++) {
                if (mob[i].alive && !mob[i].shield && !mob[i].isBadTarget) {
                    const pick = spawn.pickList[Math.floor(Math.random() * spawn.pickList.length)];
                    spawn[pick](mob[i].position.x, mob[i].position.y);
                    if (Math.random() < 0.5) spawn[pick](mob[i].position.x, mob[i].position.y);
                    mob[i].death();
                }
            }
        },
        remove() { }
    },
    {
        name: "expert system",
        description: "spawn a <strong class='color-m'>tech</strong> power up<br><strong>+50%</strong> <strong class='color-junk'>JUNK</strong><strong class='color-m'>tech</strong> chance",
        maxCount: 9,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return tech.junkChance < 1
        },
        requires: "",
        effect() {
            powerUps.spawn(m.pos.x, m.pos.y, "tech");
            tech.addJunkTechToPool(0.5)
        },
        remove() { }
    },
    {
        name: "energy investment",
        description: "every 10 seconds drain your <strong class='color-f'>energy</strong><br>return it doubled 5 seconds later",
        maxCount: 9,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            setInterval(() => {
                if (!simulation.paused) {
                    const energy = m.energy
                    m.energy = 0
                    setTimeout(() => { //return energy
                        m.energy += 2 * energy
                    }, 5000);
                }
            }, 10000);
        },
        remove() { }
    },
    {
        name: "missile launching system",
        description: "fire missiles for the next 120 seconds",
        maxCount: 9,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            for (let i = 0; i < 120; i++) {
                setTimeout(() => {
                    const where = {
                        x: m.pos.x,
                        y: m.pos.y - 40
                    }
                    b.missile(where, -Math.PI / 2 + 0.2 * (Math.random() - 0.5) * Math.sqrt(tech.missileCount), -2)
                }, i * 1000);
            }
        },
        remove() { }
    },
    {
        name: "grenade production",
        description: "drop a grenade every 2 seconds",
        maxCount: 9,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            setInterval(() => {
                if (!simulation.paused && document.visibilityState !== "hidden") {
                    b.grenade(Vector.add(m.pos, {
                        x: 10 * (Math.random() - 0.5),
                        y: 10 * (Math.random() - 0.5)
                    }), -Math.PI / 2) //fire different angles for each grenade
                    const who = bullet[bullet.length - 1]
                    Matter.Body.setVelocity(who, {
                        x: who.velocity.x * 0.1,
                        y: who.velocity.y * 0.1
                    });
                }
            }, 2000);
        },
        remove() { }
    },
    {
        name: "wall jump",
        description: "no knees or toes are drawn on the player<br>you can wall climb though",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isJunk: true,
        isInstant: true,
        allowed() {
            return !m.isShipMode
        },
        requires: "",
        effect() {
            m.skin.stubs()
            jumpSensor.vertices[0].x += -22
            jumpSensor.vertices[3].x += -22
            jumpSensor.vertices[1].x += 22
            jumpSensor.vertices[2].x += 22
        },
        remove() { }
    },
    {
        name: "Sleipnir",
        description: "grow more legs",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isJunk: true,
        allowed() {
            return !m.isShipMode
        },
        requires: "",
        effect() {
            m.skin.Sleipnir()
        },
        remove() {
            if (this.count) m.resetSkin();
        }
    },
    {
        name: "diegesis",
        description: "indicate fire cooldown</strong><br>through a rotation of your head",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isJunk: true,
        allowed() {
            return !m.isShipMode
        },
        requires: "",
        effect() {
            m.skin.diegesis()
        },
        remove() {
            if (this.count) m.resetSkin();
        }
    },
    {
        name: "🐱",
        description: "🐈",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isJunk: true,
        allowed() {
            return !m.isShipMode
        },
        requires: "",
        effect() {
            m.skin.cat();
        },
        remove() {
            if (this.count) m.resetSkin();
        }
    },
    {
        name: "n-gone",
        description: "become invisible to yourself<br><em>mobs can still see you</em>",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            m.draw = () => { }
        },
        remove() {
            if (this.count) m.resetSkin();
        }
    },
    {
        name: "pareidolia",
        description: "don't",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return !m.isShipMode
        },
        requires: "",
        effect() {
            m.skin.pareidolia()
        },
        remove() {
            if (this.count) m.resetSkin();
        }
    },
    {
        name: "posture",
        description: "stand a bit taller",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isJunk: true,
        allowed() {
            return !m.isShipMode
        },
        requires: "",
        effect() {
            m.yOffWhen.stand = 70
        },
        remove() {
            m.yOffWhen.stand = 49
        }
    },
    {
        name: "rhythm",
        description: "you oscillate up and down",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isJunk: true,
        isInstant: true,
        allowed() {
            return !m.isShipMode
        },
        requires: "",
        effect() {
            setInterval(() => {
                m.yOffWhen.stand = 53 + 28 * Math.sin(simulation.cycle * 0.2)
                if (m.onGround && !m.crouch) m.yOffGoal = m.yOffWhen.stand
            }, 100);
        },
        remove() { }
    },
    {
        name: "prism",
        description: "you cycle through different <strong>colors</strong>",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            m.color = {
                hue: 0,
                sat: 100,
                light: 50
            }
            setInterval(function () {
                m.color.hue++
                m.setFillColors()
            }, 10);
        },
        remove() { }
    },
    // {
    //     name: "microtransactions",
    //     description: `when you choose a <strong class='color-m'>tech</strong> you can<br>use ${powerUps.orb.research(1)} to buy a free in game <strong>skin</strong>`,
    //     maxCount: 1,
    //     count: 0,
    //     frequency: 0,
    //     isJunk: true,
    //     allowed() {
    //         return true
    //     },
    //     requires: "",
    //     effect() {
    //         tech.isMicroTransactions = true
    //     },
    //     remove() {
    //         tech.isMicroTransactions = false
    //     }
    // },
    {
        name: "ship",
        description: "fly around with no legs",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return !m.isShipMode && !m.isAltSkin && m.fieldUpgrades[m.fieldMode].name !== "negative mass"
        },
        requires: "",
        effect() {
            m.isAltSkin = true
            m.shipMode()
            //unlock relativistic rotation
            for (let i = 0; i < tech.tech.length; i++) {
                if (tech.tech[i].name === "relativistic rotation") tech.tech[i].frequency = 10
            }
        },
        remove() { }
    },
    {
        name: "circular symmetry",
        description: "turning the ship rotates the universe instead<br><strong>2x</strong> <strong class='color-d'>damage</strong>",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return m.isShipMode
        },
        requires: "",
        effect() {
            tech.damage *= 3

            m.look = () => {
                // const scale = 0;
                m.transSmoothX = canvas.width2 - m.pos.x // - (simulation.mouse.x - canvas.width2) * scale;
                m.transSmoothY = canvas.height2 - m.pos.y // - (simulation.mouse.y - canvas.height2) * scale;
                m.transX += (m.transSmoothX - m.transX) * m.lookSmoothing;
                m.transY += (m.transSmoothY - m.transY) * m.lookSmoothing;
                ctx.restore();
                ctx.save();
                ctx.translate(canvas.width2, canvas.height2); //center
                ctx.rotate(-m.angle)
                ctx.translate(-canvas.width2, -canvas.height2); //center
            }
        },
        remove() { }
    },
    {
        name: "assimilation",
        description: "all your <strong class='color-bot'>bots</strong> are converted to the <strong>same</strong> random model",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isBotTech: true,
        isInstant: true,
        isJunk: true,
        allowed() {
            return b.totalBots() > 2
        },
        requires: "at least 3 bots",
        effect() {
            const total = b.totalBots();
            tech.dynamoBotCount = 0;
            tech.nailBotCount = 0;
            tech.laserBotCount = 0;
            tech.orbitBotCount = 0;
            tech.foamBotCount = 0;
            tech.soundBotCount = 0;
            tech.boomBotCount = 0;
            tech.plasmaBotCount = 0;
            tech.missileBotCount = 0;
            for (let i = 0; i < bullet.length; i++) {
                if (bullet[i].botType) bullet[i].endCycle = 0
            }

            const bots = [
                () => {
                    b.nailBot();
                    tech.nailBotCount++;
                },
                () => {
                    b.foamBot();
                    tech.foamBotCount++;
                },
                () => {
                    b.soundBot();
                    tech.soundBotCount++;
                },
                () => {
                    b.boomBot();
                    tech.boomBotCount++;
                },
                () => {
                    b.laserBot();
                    tech.laserBotCount++;
                },
                () => {
                    b.orbitBot();
                    tech.orbitBotCount++
                },
                () => {
                    b.dynamoBot();
                    tech.dynamoBotCount++
                }
            ]
            const index = Math.floor(Math.random() * bots.length)
            for (let i = 0; i < total; i++) bots[index]()
        },
        remove() { }
    },
    {
        name: "stun",
        description: "<strong>stun</strong> all mobs for up to <strong>8</strong> seconds",
        maxCount: 9,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            for (let i = 0; i < mob.length; i++) mobs.statusStun(mob[i], 480)
        },
        remove() { }
    },
    {
        name: "translucent",
        description: "spawn <strong>3</strong> <strong class='color-g'>gun</strong> power ups<br>your <strong class='color-g'>bullets</strong> and bots are transparent",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            for (let i = 0; i < 3; i++) powerUps.spawn(m.pos.x + 60 * (Math.random() - 0.5), m.pos.y + 60 * (Math.random() - 0.5), "gun");

            // //removes guns and ammo  
            // b.inventory = [];
            // b.activeGun = null;
            // b.inventoryGun = 0;
            // for (let i = 0, len = b.guns.length; i < len; ++i) {
            //     b.guns[i].have = false;
            //     if (b.guns[i].ammo !== Infinity) b.guns[i].ammo = 0;
            // }
            // simulation.makeGunHUD(); //update gun HUD
            b.bulletDraw = () => { }; //make bullets invisible
        },
        remove() { }
    },
    {
        name: "difficulty",
        description: "spawn a power up that lets you<br>adjust the simulation <strong>difficulty</strong> parameters",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return (level.levelsCleared < 5)
        },
        requires: "before level 5",
        effect() {
            powerUps.spawn(m.pos.x, m.pos.y, "difficulty");
        },
        remove() { }
    },
    {
        name: "re-research",
        description: `<strong>eject</strong> all your ${powerUps.orb.research(1)}`,
        maxCount: 9,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return powerUps.research.count > 3
        },
        requires: "at least 4 research",
        effect() {
            powerUps.spawnDelay("research", powerUps.research.count);
            powerUps.research.count = 0
        },
        remove() { }
    },
    {
        name: "black hole",
        description: `use your <strong class='color-f'>energy</strong> and ${powerUps.orb.research(4)} to <strong>spawn</strong><br>inside the event horizon of a huge <strong>black hole</strong>`,
        maxCount: 1,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return powerUps.research.count > 3
        },
        requires: "at least 4 research",
        effect() {
            m.energy = 0
            spawn.suckerBoss(m.pos.x, m.pos.y - 700)
            powerUps.research.changeRerolls(-4)
            simulation.makeTextLog(`<span class='color-var'>m</span>.<span class='color-r'>research</span> <span class='color-symbol'>--</span><br>${powerUps.research.count}`)
        },
        remove() { }
    },
    {
        name: "apomixis",
        description: `spawn <strong>11 bosses</strong>`,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        isInstant: true,
        isJunk: true,
        allowed() {
            return tech.duplicationChance() > 0.99
        },
        requires: "duplication chance above 99%",
        effect() {
            const range = 1300
            for (let i = 0, len = 9; i < len; i++) {
                const angle = 2 * Math.PI * i / len
                spawn.randomLevelBoss(m.pos.x + range * Math.cos(angle), m.pos.y + range * Math.sin(angle), spawn.nonCollideBossList);
            }
            spawn.historyBoss(0, 0)
            spawn.pulsarBoss(level.exit.x, level.exit.y, 70, true)
            spawn.blockBoss(level.enter.x, level.enter.y)
        },
        remove() { }
    },
    {
        name: "mobs!",
        descriptionFunction() {
            if (this.mobType === "") this.mobType = spawn.fullPickList[Math.floor(Math.random() * spawn.fullPickList.length)]
            return `spawn 20 <strong>${this.mobType}</strong> mobs`
        },
        maxCount: 1,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() { return true },
        requires: "",
        mobType: "",
        effect() {
            if (this.mobType === "") this.mobType = spawn.fullPickList[Math.floor(Math.random() * spawn.fullPickList.length)]
            for (let i = 0; i < 20; i++) {
                spawn[this.mobType](m.pos.x, m.pos.y - 700)
            }
            simulation.makeTextLog(`spawn<span class='color-symbol'>.</span>${this.mobType}<span class='color-symbol'>(</span>x<span class='color-symbol'>,</span>y<span class='color-symbol'>)</span>`)

        },
        remove() { }
    },
    {
        name: "black hole cluster",
        description: `spawn <strong>30</strong> nearby <strong>black holes</strong>`,
        maxCount: 1,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            const unit = {
                x: 1,
                y: 0
            }
            for (let i = 0; i < 30; i++) {
                const where = Vector.add(m.pos, Vector.mult(Vector.rotate(unit, Math.random() * 2 * Math.PI), 2000 + 1200 * Math.random()))
                spawn.sucker(where.x, where.y, 140)
                const who = mob[mob.length - 1]
                who.locatePlayer()
                // who.damageReduction = 0.2
            }
        },
        remove() { }
    },
    {
        name: "rule 30",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isJunk: true,
        allowed() {
            return !build.isExperimentSelection
        },
        requires: "NOT EXPERIMENT MODE",
        effect() { },
        remove() { },
        state: [
            [false, false, false, Math.random() > 0.8, false, false, false, Math.random() > 0.8, false, false, false, false, false, false, false, false, false, true, false, false, false, Math.random() > 0.8, false, false, false, Math.random() > 0.8, false, false, false, false, Math.random() > 0.8, false, Math.random() > 0.8, false, false, false, Math.random() > 0.8, false, false, false, false, false, false, false, false, false]
        ],
        rule(state, a, b, c) {
            //30
            if (state[a] && state[b] && state[c]) return false; // TTT => F
            if (state[a] && state[b] && !state[c]) return false; // TTF => F
            if (state[a] && !state[b] && state[c]) return false; //TFT => F 
            if (state[a] && !state[b] && !state[c]) return true; //TFF => T
            if (!state[a] && state[b] && state[c]) return true; //FTT => T
            if (!state[a] && state[b] && !state[c]) return true; //FTF => T
            if (!state[a] && !state[b] && state[c]) return true; //FFT => T
            if (!state[a] && !state[b] && !state[c]) return false; //FFF => F
        },
        id: 0,
        researchSpawned: 0,
        descriptionFunction() {
            const loop = () => {
                if ((simulation.paused || simulation.isChoosing) && m.alive && !build.isExperimentSelection) { //&& (!simulation.isChoosing || this.count === 0)
                    let b = []; //produce next row
                    b.push(this.rule(this.state[this.state.length - 1], this.state[this.state.length - 1].length - 1, 0, 1)); //left edge wrap around
                    for (let i = 1; i < this.state[this.state.length - 1].length - 1; i++) { //apply rule to the rest of the array
                        b.push(this.rule(this.state[this.state.length - 1], i - 1, i, i + 1));
                    }
                    b.push(this.rule(this.state[this.state.length - 1], this.state[this.state.length - 1].length - 2, this.state[this.state.length - 1].length - 1, 0)); //right edge wrap around
                    this.state.push(b)
                    if (document.getElementById(`cellular-rule-id${this.id}`)) document.getElementById(`cellular-rule-id${this.id}`).innerHTML = this.outputText() //convert to squares and send HTML
                    if (this.count && this.researchSpawned < 12 && !(this.state.length % 10)) {
                        this.researchSpawned++
                        powerUps.spawn(m.pos.x - 50 + 100 * (Math.random() - 0.5), m.pos.y + 100 * (Math.random() - 0.5), "research");
                    }
                    setTimeout(() => {
                        loop()
                    }, 300 + 5 * this.state.length);
                }
            }
            setTimeout(() => {
                loop()
            }, 300);
            this.id++
            return `<span id = "cellular-rule-id${this.id}" style = "letter-spacing: -0.5px;font-size: 100%;line-height: normal;font-family: 'Courier New', monospace;">${this.outputText()}</span>`
        },
        outputText() {
            let text = "<pre>"
            for (let j = 0; j < this.state.length; j++) {
                // text += "<p style = 'margin-bottom: -12px;'>"
                text += "<p style = 'margin-top: -7px;margin-bottom: -7px;'>"
                for (let i = 0; i < this.state[j].length; i++) {
                    if (this.state[j][i]) {
                        text += "■" //"☻" //"⬛" //"█" //"■"
                    } else {
                        text += " " //"□" //"☺" //"⬜" //"&nbsp;&nbsp;&nbsp;&nbsp;" //"□"
                    }
                }
                text += "</p>"
            }
            text += "</pre>"
            return text
        },
    },
    {
        name: "rule 90",
        maxCount: 1,
        count: 0,
        frequency: 0,
        isJunk: true,
        allowed() {
            return !build.isExperimentSelection
        },
        requires: "NOT EXPERIMENT MODE",
        effect() { },
        remove() { },
        state: [
            [false, false, false, Math.random() > 0.8, false, false, false, Math.random() > 0.8, false, false, false, false, false, false, false, false, false, true, true, false, false, false, Math.random() > 0.8, false, false, false, Math.random() > 0.8, false, false, false, false, Math.random() > 0.8, false, Math.random() > 0.8, false, false, false, Math.random() > 0.8, false, false, false, false, false, false, false, false]
        ],
        rule(state, a, b, c) { //90
            if (state[a] && state[b] && state[c]) return false; // TTT => F
            if (state[a] && state[b] && !state[c]) return true; // TTF => T
            if (state[a] && !state[b] && state[c]) return false; //TFT => F 
            if (state[a] && !state[b] && !state[c]) return true; //TFF => T
            if (!state[a] && state[b] && state[c]) return true; //FTT => T
            if (!state[a] && state[b] && !state[c]) return false; //FTF => F
            if (!state[a] && !state[b] && state[c]) return true; //FFT => T
            if (!state[a] && !state[b] && !state[c]) return false; //FFF => F
        },
        id: 90,
        researchSpawned: 0,
        descriptionFunction() {
            const loop = () => {
                if ((simulation.paused || simulation.isChoosing) && m.alive && !build.isExperimentSelection) { //&& (!simulation.isChoosing || this.count === 0)
                    let b = []; //produce next row
                    b.push(this.rule(this.state[this.state.length - 1], this.state[this.state.length - 1].length - 1, 0, 1)); //left edge wrap around
                    for (let i = 1; i < this.state[this.state.length - 1].length - 1; i++) { //apply rule to the rest of the array
                        b.push(this.rule(this.state[this.state.length - 1], i - 1, i, i + 1));
                    }
                    b.push(this.rule(this.state[this.state.length - 1], this.state[this.state.length - 1].length - 2, this.state[this.state.length - 1].length - 1, 0)); //right edge wrap around
                    this.state.push(b)
                    if (document.getElementById(`cellular-rule-id${this.id}`)) document.getElementById(`cellular-rule-id${this.id}`).innerHTML = this.outputText() //convert to squares and send HTML
                    if (this.count && this.researchSpawned < 12 && !(this.state.length % 10)) {
                        this.researchSpawned++
                        powerUps.spawn(m.pos.x - 50 + 100 * (Math.random() - 0.5), m.pos.y + 100 * (Math.random() - 0.5), "research");
                    }
                    setTimeout(() => {
                        loop()
                    }, 300 + 5 * this.state.length);
                }
            }
            setTimeout(() => {
                loop()
            }, 300);
            this.id++
            return `<span id = "cellular-rule-id${this.id}" style = "letter-spacing: -0.5px;font-size: 100%;line-height: normal;font-family: 'Courier New', monospace;">${this.outputText()}</span>`
        },
        outputText() {
            let text = "<pre>"
            for (let j = 0; j < this.state.length; j++) {
                // text += "<p style = 'margin-bottom: -12px;'>"
                text += "<p style = 'margin-top: -7px;margin-bottom: -7px;'>"
                for (let i = 0; i < this.state[j].length; i++) {
                    if (this.state[j][i]) {
                        text += "■" //"☻" //"⬛" //"█" //"■"
                    } else {
                        text += " " //"□" //"☺" //"⬜" //"&nbsp;&nbsp;&nbsp;&nbsp;" //"□"
                    }
                }
                text += "</p>"
            }
            text += "</pre>"
            return text
        },
    },
    {
        name: "cosmogonic myth",
        description: `<span style = "opacity: 9%;">open a portal to a primordial version of reality<br>in 5 minutes close the portal, spawn 1 of each power up</span>`,
        maxCount: 1,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            const urls = ["https://scratch.mit.edu/projects/14005697/fullscreen/", "https://scratch.mit.edu/projects/22573757/fullscreen/", "https://scratch.mit.edu/projects/41429974/fullscreen/", "https://scratch.mit.edu/projects/43690666/fullscreen/", "https://codepen.io/lilgreenland/full/ozXNWZ", "https://codepen.io/lilgreenland/full/wzARJY", "classic/7-1-2017/", "classic/4-15-2018/", "classic/7-11-2019/", "classic/9-8-2019/", "classic/7-15-2020/", "classic/6-1-2021/"]
            const choose = urls[Math.floor(Math.random() * urls.length)]
            console.log(`opening new tab" ${choose}`)
            let tab = window.open(choose, "_blank");
            setTimeout(() => {
                tab.close();
                powerUps.spawn(m.pos.x, m.pos.y, "gun");
                setTimeout(() => {
                    powerUps.spawn(m.pos.x, m.pos.y - 50, "ammo")
                }, 250);
                setTimeout(() => {
                    powerUps.spawn(m.pos.x + 50, m.pos.y, "field");
                }, 500);
                setTimeout(() => {
                    powerUps.spawn(m.pos.x + 50, m.pos.y - 50, "heal");
                }, 750);
                setTimeout(() => {
                    powerUps.spawn(m.pos.x - 50, m.pos.y, "tech");
                }, 1000);
                setTimeout(() => {
                    powerUps.spawn(m.pos.x - 50, m.pos.y - 50, "research");
                }, 1250);
            }, 1000 * 5 * 60);
        },
        remove() { }
    },
    {
        name: "beforeunload",
        description: "<strong>75%</strong> of the time when you attempt to <strong>exit</strong> n-gon<br>you are prompted to <strong>cancel</strong> or continue.<br>Each time you <strong>cancel</strong> gain <strong>1.25x</strong> <strong class='color-d'>damage</strong>.",
        maxCount: 1,
        count: 0,
        frequency: 1,
        isJunk: true,
        allowed() {
            return tech.totalCount > 9
        },
        requires: "at least 10 tech",
        effect() {
            tech.isExitPrompt = true
            addEventListener('beforeunload', beforeUnloadEventListener);
        },
        remove() {
            tech.isExitPrompt = false
            if (this.count > 0) removeEventListener('beforeunload', beforeUnloadEventListener);
        }
    },
    {
        name: "planetesimals",
        description: `play <strong>planetesimals</strong> <em style = 'font-size:80%;'>(an asteroids-like game)</em><br>clear <strong>levels</strong> in <strong>planetesimals</strong> to spawn <strong class='color-m'>tech</strong><br>if you <strong style="color:red;">die</strong> in <strong>planetesimals</strong> you <strong style="color:red;">die</strong> in <strong>n-gon</strong>`,
        maxCount: 1,
        count: 0,
        frequency: 0,
        isInstant: true,
        isJunk: true,
        allowed() {
            return true
        },
        requires: "",
        effect() {
            window.open('../../planetesimals/index.html', '_blank')
            // powerUps.spawn(m.pos.x, m.pos.y, "tech");

            // for communicating to other tabs, like planetesimals
            // Connection to a broadcast channel
            const bc = new BroadcastChannel('planetesimals');
            bc.activated = false

            bc.onmessage = function (ev) {
                if (ev.data === 'tech') powerUps.directSpawn(m.pos.x, m.pos.y, "tech");
                if (ev.data === 'death') {
                    m.death()
                    bc.close(); //end session
                }
                if (ev.data === 'ready' && !bc.activated) {
                    bc.activated = true //prevents n-gon from activating multiple copies of planetesimals
                    bc.postMessage("activate");
                }
            }
        },
        remove() { }
    },
    {
        name: "tinker",
        description: "<strong>permanently</strong> unlock <strong class='color-junk'>JUNK</strong><strong class='color-m'>tech</strong> in experiment mode<br><em>this effect is stored for future visits</em>",
        maxCount: 1,
        count: 0,
        frequency: 0,
        frequencyDefault: 0,
        isJunk: true,
        isInstant: true,
        allowed() {
            return !localSettings.isJunkExperiment
        },
        requires: "",
        effect() {
            localSettings.isJunkExperiment = true
            if (localSettings.isAllowed) localStorage.setItem("localSettings", JSON.stringify(localSettings)); //update local storage
        },
        remove() { }
    },
    {
        name: "NFT",
        descriptionFunction() {
            return `buy your current game seed: <strong style = 'font-size:120%;'>${Math.initialSeed}</strong><br><em>no one is allowed to use your seeds<br>if they use them they are gonna get in trouble</em><br>your seeds: <span style = 'font-size:80%;'>${localSettings.personalSeeds.join(", ")}</span>`
        },
        maxCount: 1,
        count: 0,
        frequency: 0,
        isJunk: true,
        isInstant: true,
        allowed: () => true,
        requires: "",
        effect() {
            localSettings.personalSeeds.push(Math.initialSeed)
            if (localSettings.isAllowed) localStorage.setItem("localSettings", JSON.stringify(localSettings)); //update local storage
        },
        remove() { }
    },
    // {
    //     name: "rule 90",
    //     maxCount: 1,
    //     count: 0,
    //     frequency: 0,
    //     isJunk: true,
    //     allowed() {
    //         return true
    //     },
    //     requires: "",
    //     effect() {},
    //     remove() {},
    //     state: [
    //         [false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false]
    //     ],
    //     rule(state, a, b, c) {
    //         if (state[a] && state[b] && state[c]) return false; // TTT => F
    //         if (state[a] && state[b] && !state[c]) return true; // TTF => T
    //         if (state[a] && !state[b] && state[c]) return false; //TFT => F 
    //         if (state[a] && !state[b] && !state[c]) return true; //TFF => T
    //         if (!state[a] && state[b] && state[c]) return true; //FTT => T
    //         if (!state[a] && state[b] && !state[c]) return false; //FTF => F
    //         if (!state[a] && !state[b] && state[c]) return true; //FFT => T
    //         if (!state[a] && !state[b] && !state[c]) return false; //FFF => F
    //     },
    //     id: 0,
    //     descriptionFunction() {
    //         const loop = () => {
    //             if ((simulation.paused || simulation.isChoosing) && m.alive && !build.isExperimentSelection) { //&& (!simulation.isChoosing || this.count === 0)
    //                 let b = []; //produce next row
    //                 b.push(this.rule(this.state[this.state.length - 1], this.state[this.state.length - 1].length - 1, 0, 1)); //left edge wrap around
    //                 for (let i = 1; i < this.state[this.state.length - 1].length - 1; i++) { //apply rule to the rest of the array
    //                     b.push(this.rule(this.state[this.state.length - 1], i - 1, i, i + 1));
    //                 }
    //                 b.push(this.rule(this.state[this.state.length - 1], this.state[this.state.length - 1].length - 2, this.state[this.state.length - 1].length - 1, 0)); //right edge wrap around
    //                 this.state.push(b)
    //                 if (document.getElementById(`cellular-rule-id${this.id}`)) document.getElementById(`cellular-rule-id${this.id}`).innerHTML = this.outputText() //convert to squares and send HTML
    //                 if (this.count && this.state.length < 120 && !(this.state.length % 10)) powerUps.spawn(m.pos.x - 50 + 100 * (Math.random() - 0.5), m.pos.y + 100 * (Math.random() - 0.5), "research");
    //                 setTimeout(() => { loop() }, 400);
    //             }
    //         }
    //         setTimeout(() => { loop() }, 400);
    //         // if (this.id === 0) {
    //         //     for (let i = 0; i < 29; i++) this.state[0][i] = Math.random() < 0.5 //randomize seed
    //         // }
    //         this.id++
    //         return `<span id = "cellular-rule-id${this.id}" style = "letter-spacing: 0px;font-size: 50%;line-height: normal;">${this.outputText()}</span>`
    //     },
    //     outputText() {
    //         let text = ""
    //         for (let j = 0; j < this.state.length; j++) {
    //             text += "<p style = 'margin-bottom: -11px;'>"
    //             for (let i = 0; i < this.state[j].length; i++) {
    //                 if (this.state[j][i]) {
    //                     text += "⬛" //"█" //"■"
    //                 } else {
    //                     text += "⬜" //"&nbsp;&nbsp;&nbsp;&nbsp;" //"□"
    //                 }
    //             }
    //             text += "</p>"
    //         }
    //         return text
    //     },
    // },

    //************************************************** 
    //************************************************** undefined / lore
    //************************************************** tech
    //************************************************** 
    {
        name: `undefined`,
        description: `<strong class="lore-text">this</strong><br> &nbsp;`,
        maxCount: 1,
        count: 0,
        frequency: 2,
        frequencyDefault: 2,
        isLore: true,
        // isExperimentHide: true,
        allowed() { return !build.isExperimentSelection },
        requires: "NOT EXPERIMENT MODE",
        effect() {
            if (localSettings.loreCount > lore.conversation.length - 1) { //reward for people done with lore chapters (or on the final chapter)
                for (let i = mob.length - 1; i > -1; i--) { //replace mobs with starters
                    if (!mob[i].isBoss && mob[i].isDropPowerUp && mob[i].alive) {
                        spawn.starter(mob[i].position.x, mob[i].position.y)
                        mob[i].leaveBody = false
                        mob[i].isDropPowerUp = false
                        mob[i].death()

                        //spawn a random power up
                        // if (Math.random() < 1 / 5) {
                        //     powerUps.spawn(mob[i].position.x, mob[i].position.y, "research")
                        // } else 
                        if (Math.random() < 1 / 4) {
                            powerUps.spawn(mob[i].position.x, mob[i].position.y, "ammo")
                        } else if (Math.random() < 1 / 3) {
                            powerUps.spawn(mob[i].position.x, mob[i].position.y, "heal")
                        } else if (Math.random() < 1 / 2) {
                            powerUps.spawn(mob[i].position.x, mob[i].position.y, "boost")
                        } else {
                            powerUps.spawn(mob[i].position.x, mob[i].position.y, "coupling")
                        }
                    }
                }
            }

            setTimeout(() => { //a short delay, I can't remember why
                lore.techCount++
                if (lore.techCount === lore.techGoal) {
                    // tech.removeLoreTechFromPool();
                    this.frequency = 0;
                    this.description = `<strong class="lore-text">null</strong> is open at level.final() <br> &nbsp;`
                } else {
                    this.frequency += lore.techGoal * 2
                    // for (let i = 0; i < tech.tech.length; i++) { //set name for all unchosen copies of this tech
                    //     if (tech.tech[i].isLore && tech.tech[i].count === 0) tech.tech[i].description = `${lore.techCount+1}/${lore.techGoal}<br><em>add copies of <strong class="lore-text">this</strong> to the potential <strong class='color-m'>tech</strong> pool</em>`
                    // }
                    // for (let i = 0, len = 10; i < len; i++) tech.addLoreTechToPool()
                    this.description = `<em>uncaught error:</em><br><strong>${Math.max(0, lore.techGoal - lore.techCount)}</strong> more required for access to <strong class="lore-text">null</strong>`
                }
            }, 1);
        },
        remove() {
            lore.techCount = 0;
            this.maxCount = lore.techGoal;
            this.description = `<strong class="lore-text">this</strong> <br> &nbsp;`
        }
    }
    ],
    // addLoreTechToPool() { //adds lore tech to tech pool
    //     if (!simulation.isCheating) {
    //         tech.tech.push({
    //             name: `undefined`,
    //             description: `${lore.techCount+1}/${lore.techGoal}<br><em>add copies of <strong class="lore-text">this</strong> to the potential <strong class='color-m'>tech</strong> pool</em>`,
    //             maxCount: 1,
    //             count: 0,
    //             frequency: 2,
    //             isLore: true,
    //             isInstant: true,
    //             isExperimentHide: true,
    //             allowed() {
    //                 return true
    //             },
    //             requires: "",
    //             effect() {
    //                 setTimeout(() => { //a short delay, I can't remember why
    //                     lore.techCount++
    //                     if (lore.techCount > lore.techGoal - 1) {
    //                         // tech.removeLoreTechFromPool();
    //                         for (let i = tech.tech.length - 1; i > 0; i--) {
    //                             if (tech.tech[i].isLore && tech.tech[i].count === 0) tech.tech.splice(i, 1)
    //                         }
    //                     } else {
    //                         for (let i = 0; i < tech.tech.length; i++) { //set name for all unchosen copies of this tech
    //                             if (tech.tech[i].isLore && tech.tech[i].count === 0) tech.tech[i].description = `${lore.techCount+1}/${lore.techGoal}<br><em>add copies of <strong class="lore-text">this</strong> to the potential <strong class='color-m'>tech</strong> pool</em>`
    //                         }
    //                         for (let i = 0, len = 10; i < len; i++) tech.addLoreTechToPool()
    //                     }
    //                 }, 1);
    //             },
    //             remove() {}
    //         })
    //     }
    // },
    // junk: [

    // ],
    //variables use for gun tech upgrades
    fireRate: null,
    bulletSize: null,
    energySiphon: null,
    healSpawn: null,
    crouchAmmoCount: null,
    bulletsLastLonger: null,
    isImmortal: null,
    sporesOnDeath: null,
    isImmuneExplosion: null,
    isExplodeMob: null,
    isDroneOnDamage: null,
    isAcidDmg: null,
    isAnnihilation: null,
    largerHeals: null,
    isCrit: null,
    isLowHealthDmg: null,
    isLowHealthDefense: null,
    isLowHealthFireRate: null,
    isFarAwayDmg: null,
    isFirstDer: null,
    isMassEnergy: null,
    extraChoices: null,
    laserBotCount: null,
    dynamoBotCount: null,
    nailBotCount: null,
    foamBotCount: null,
    soundBotCount: null,
    boomBotCount: null,
    plasmaBotCount: null,
    missileBotCount: null,
    orbitBotCount: null,
    blockDmg: null,
    isBlockRadiation: null,
    isPiezo: null,
    isFastDrones: null,
    oneSuperBall: null,
    laserReflections: null,
    laserDamage: null,
    isAmmoFromHealth: null,
    mobSpawnWithHealth: null,
    isEnergyRecovery: null,
    isHealthRecovery: null,
    isEnergyLoss: null,
    isDeathAvoid: null,
    isDeathAvoidedThisLevel: null,
    isPlasmaRange: null,
    isFreezeMobs: null,
    isIceCrystals: null,
    blockDamage: null,
    isBlockStun: null,
    isStunField: null,
    isHarmDamage: null,
    isVacuumBomb: null,
    renormalization: null,
    fragments: null,
    energyDamage: null,
    botSpawner: null,
    isBotSpawnerReset: null,
    isSporeFollow: null,
    isNailRadiation: null,
    isEnergyHealth: null,
    isStun: null,
    restDamage: null,
    isRPG: null,
    missileCount: null,
    isDeterminism: null,
    isSuperDeterminism: null,
    isHarmReduce: null,
    nailsDeathMob: null,
    isSlowFPS: null,
    isNeutronStun: null,
    isAnsatz: null,
    isDamageFromBulletCount: null,
    laserDrain: null,
    isNailShot: null,
    slowFire: null,
    fastTime: null,
    isFastRadiation: null,
    isAmmoForGun: null,
    isRapidPulse: null,
    isSporeFreeze: null,
    isShotgunRecoil: null,
    isHealLowHealth: null,
    isAoESlow: null,
    isHarmArmor: null,
    isTurret: null,
    isRerollDamage: null,
    isHarmFreeze: null,
    isBotArmor: null,
    isRerollHaste: null,
    researchHaste: null,
    isMineDrop: null,
    isRerollBots: null,
    isNailBotUpgrade: null,
    isFoamBotUpgrade: null,
    isSoundBotUpgrade: null,
    isLaserBotUpgrade: null,
    isBoomBotUpgrade: null,
    isOrbitBotUpgrade: null,
    isDroneGrab: null,
    isOneGun: null,
    isDamageForGuns: null,
    isGunCycle: null,
    isFastFoam: null,
    isSporeGrowth: null,
    isStimulatedEmission: null,
    // nailGun: null,
    nailInstantFireRate: null,
    isCapacitor: null,
    isEnergyNoAmmo: null,
    // isFreezeHarmImmune: null,
    isSmallExplosion: null,
    isExplosionHarm: null,
    extraMaxHealth: null,
    // bonusHealth: null,
    isIntangible: null,
    isCloakStun: null,
    bonusEnergy: null,
    // healGiveMaxEnergy: null,
    healMaxEnergyBonus: 0, //not null
    aimDamage: null,
    isNoFireDefense: null,
    isNoFireDamage: null,
    duplicateChance: null,
    beamSplitter: null,
    iceEnergy: null,
    isPerfectBrake: null,
    explosiveRadius: null,
    // isWormholeEnergy: null,
    isWormholeDamage: null,
    isNailCrit: null,
    isFlechetteExplode: null,
    isWormholeWorms: null,
    isWormHoleBullets: null,
    isWideLaser: null,
    wideLaser: null,
    isPulseLaser: null,
    isRadioactive: null,
    radioactiveDamage: null,
    isRailEnergy: null,
    isMineSentry: null,
    isIncendiary: null,
    overfillDrain: null,
    isNeutronSlow: null,
    // isRailAreaDamage: null,
    historyLaser: null,
    isSpeedHarm: null,
    isSpeedDamage: null,
    speedAdded: null,
    isTimeSkip: null,
    isCancelDuplication: null,
    duplication: null,
    isCancelRerolls: null,
    isCancelTech: null,
    cancelTechCount: null,
    isBotDamage: null,
    isBanish: null,
    isMaxEnergyTech: null,
    isLowEnergyDamage: null,
    isRewindBot: null,
    isRewindGrenade: null,
    isExtruder: null,
    isEndLevelPowerUp: null,
    isMissileBig: null,
    isMissileBiggest: null,
    isLaserMine: null,
    isFoamMine: null,
    isAmmoFoamSize: null,
    isIceIX: null,
    isDupDamage: null,
    isDupEnergy: null,
    isFireRateForGuns: null,
    cyclicImmunity: null,
    isTechDamage: null,
    isRestHarm: null,
    isFireMoveLock: null,
    isRivets: null,
    isNeedles: null,
    isExplodeRadio: null,
    isPauseSwitchField: null,
    isPauseEjectTech: null,
    pauseEjectTech: null,
    isShieldPierce: null,
    isDuplicateMobs: null,
    isDynamoBotUpgrade: null,
    isBlockPowerUps: null,
    isDamageAfterKillNoRegen: null,
    isHarmReduceNoKill: null,
    isSwitchReality: null,
    isResearchReality: null,
    isAnthropicDamage: null,
    isMetaAnalysis: null,
    isFoamAttract: null,
    droneCycleReduction: null,
    droneEnergyReduction: null,
    isHalfHeals: null,
    isAlwaysFire: null,
    isDroneRespawn: null,
    deathSpawns: null,
    isMobBlockFling: null,
    isPhaseVelocity: null,
    waveBeamSpeed: null,
    wavePacketAmplitude: null,
    isCollisionRealitySwitch: null,
    iceIXOnDeath: null,
    wimpCount: null,
    isAddBlockMass: null,
    isDarkMatter: null,
    isHarmDarkMatter: null,
    isMoveDarkMatter: null,
    isNotDarkMatter: null,
    isSneakAttack: null,
    isFallingDamage: null,
    harmonics: null,
    isStandingWaveExpand: null,
    isTokamak: null,
    isTokamakHeal: null,
    tokamakHealCount: null,
    isTokamakFly: null,
    deflectEnergy: null,
    superBallDelay: null,
    isBlockExplode: null,
    isOverHeal: null,
    isDroneRadioactive: null,
    droneRadioDamage: null,
    isDroneTeleport: null,
    isDroneFastLook: null,
    isBulletTeleport: null,
    isJunkResearch: null,
    laserColor: null,
    laserColorAlpha: null,
    isLongitudinal: null,
    is360Longitudinal: null,
    isShotgunReversed: null,
    fieldDuplicate: null,
    isCloakingDamage: null,
    harmonicEnergy: null,
    isFieldHarmReduction: null,
    isFastTime: null,
    isAnthropicTech: null,
    isSporeWorm: null,
    isSporeFlea: null,
    isFoamShot: null,
    isIceShot: null,
    isBlockRestitution: null,
    isZeno: null,
    isFieldFree: null,
    isExtraGunField: null,
    isBigField: null,
    isSmartRadius: null,
    isFilament: null,
    isLargeHarpoon: null,
    extraHarpoons: null,
    ammoCap: null,
    isHarpoonPowerUp: null,
    harpoonDensity: null,
    isAddRemoveMaxHealth: null,
    cloakDuplication: null,
    extruderRange: null,
    isForeverDrones: null,
    nailRecoil: null,
    baseJumpForce: null,
    baseFx: null,
    isNeutronium: null,
    isFreeWormHole: null,
    isRewindField: null,
    isCrouchRegen: null,
    isAxion: null,
    isDarkEnergy: null,
    isDarkStar: null,
    isWormholeMapIgnore: null,
    isLessDamageReduction: null,
    needleTunnel: null,
    isBrainstorm: null,
    isBrainstormActive: null,
    brainStormDelay: null,
    wormSize: null,
    extraSuperBalls: null,
    isTimeCrystals: null,
    isGroundState: null,
    isRailGun: null,
    isDronesTravel: null,
    isTechDebt: null,
    isPlasmaBall: null,
    plasmaDischarge: null,
    missileFireCD: null,
    isBotField: null,
    isFoamBall: null,
    isNoDraftPause: null,
    isFoamPressure: null,
    foamDamage: null,
    isClusterExplode: null,
    isCircleExplode: null,
    isPetalsExplode: null,
    deathSkipTime: null,
    isIceMaxHealthLoss: null,
    isIceKill: null,
    isCritKill: null,
    isQuantumEraser: null,
    isPhononBlock: null,
    isPhononWave: null,
    isLaserLens: null,
    laserCrit: null,
    isSporeColony: null,
    isExtraBotOption: null,
    isLastHitDamage: null,
    isCloakHealLastHit: null,
    isRicochet: null,
    isCancelCouple: null,
    isCouplingPowerUps: null,
    isBoostPowerUps: null,
    isBoostReplaceAmmo: null,
    isInfiniteWaveAmmo: null,
    isJunkDNA: null,
    buffedGun: 0,
    isGunChoice: null,
    railChargeRate: null,
    isSuperHarm: null,
    isZombieMobs: null,
    isSuperMine: null,
    sentryAmmo: null,
    collidePowerUps: null,
    isDilate: null,
    isDiaphragm: null,
    isNoGroundDamage: null,
    isSuperBounce: null,
    isDivisor: null,
    isFoamCavitation: null,
    isHealAttract: null,
    isLaserField: null,
    isHealBrake: null,
    isMassProduction: null,
    isPrinter: null,
    isHookDefense: null,
    hookNails: null,
    isHarpoonDefense: null,
    isReel: null,
    harpoonPowerUpCycle: null,
    isHarpoonFullHealth: null,
    isMobFullHealthCloak: null,
    isMobLowHealth: null,
    isDamageCooldown: null,
    isDamageCooldownTime: null,
    isPowerUpDamage: null,
    isExitPrompt: null,
    isResearchDamage: null,
    interestRate: null,
    isImmunityDamage: null,
    isMobDeathImmunity: null,
    isMaxHealthDefense: null,
    isNoDefenseDamage: null,
    isMaxHealthDamage: null,
}