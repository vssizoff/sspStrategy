export default {
    name: "Knight",
    health: 30,
    actions: {
        SwordAttack: {
            type: "enemyTarget",
            mana: 10,
            apply(state, unit, target) {
                if (state.units[unit].frontline && state.units[target].frontline) {
                    state.units[target].damage(6);
                }
            }
        },
        SplashAttack: {
            type: "noTarget",
            mana: 15,
            apply(state, unit) {
                if (state.units[unit].frontline)
                    for (target of state.units) if (state.isEnemy(state.units[unit].player, target)) {
                        if (state.units[target].frontline) {
                          state.units[target].damage(4);
                        }
                    }
                }
            }
        },
        Shield: {
            type: "noTarget",
            mana: 12,
            apply(state, unit) {
                let shield_points = 5;
                state.effects.push({
                    name: "KnightShield",
                    target: unit,
                    emit(type, unit) {
                        if (type == "damageDealt") {
                            let dealt = 4;
                            let prevented_damage = min(shield_points, dealt);
                            state.units[unit].heal(prevented_damage);
                            shield_points -= prevented_damage;
                        }
                    }
                });
            }
        }

    }
};
