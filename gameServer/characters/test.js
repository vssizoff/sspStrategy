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
                    for (target of state.units) if (state.isEnemy(state.player, target)) {
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
                state.units[unit].heal(5)
            }
        }

    }
};
