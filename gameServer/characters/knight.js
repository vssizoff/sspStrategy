export default {
    name: "Knight",
    health: 30,
    actions: {
        SwordAttack: {
            type: "enemyTarget",
            mana: 10,
            apply(state, unit, target) {
                if (state.units[unit].frontLine && state.units[target].frontLine) {
                    state.units[target].damage(6);
                }
            }
        },
        SplashAttack: {
            type: "noTarget",
            mana: 15,
            apply(state, unit) {
                if (state.units[unit].frontLine)
                    for (target of state.units) if (state.isEnemy(state.units[unit].player.id, target)) {
                        if (state.units[target].frontLine) {
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
                    emit(type, damaged_unit, value) {
                        if (type == "damage" && damaged_unit == unit ) {
                            let dealt = value;
                            let prevented_damage = min(shield_points, dealt);
                            state.units[unit].health += prevented_damage;
                            shield_points -= prevented_damage;
                        }
                    }
                });
            }
        }

    }
};
