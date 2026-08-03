export default {
    name: "Healer",
    health: 17,
    actions: {
        PoisonPotion: {
            type: "enemyTarget",
            mana: 17,
            apply(state, unit, target) {
                if (state.units[unit].frontLine && state.units[target].frontLine) {
                    state.units[target].damage(1);
                    let potionTicks = 3;
                    state.effects.push({
                        name: "HealerPoison",
                        target: target,
                        emit(type, damaged_unit) {
                            if (type == "turn" && state.currentPlayer == state.units[unit].player.id) {
                                state.units[target].damage(1);
                                potionTicks--;
                            }
                            if (type == "damage" && damaged_unit == target) {
                                state.units[target].health -= 1;
                                if (state.units[target].health <= 0) state.units[target].health = 0;
                            }
                            if (potionTicks == 0) return () => {};
                        }
                    });
                }
            }
        },
        Heal: {
            type: "friendTarget",
            mana: 15,
            apply(state, unit, target) {
                if (state.units[unit].frontLine != state.units[target].frontLine && state.units[target].health > 0) {
                    state.units[target].heal(3);
                }
            }
        },
        Revive: {
            type: "friendTarget",
            mana: 40,
            apply(state, unit, target) {
                if (state.units[target].health <= 0) {
                    state.units[target].heal(4);
                    state.units[unit].damage(6);
                }
            }
        }
    }
};
