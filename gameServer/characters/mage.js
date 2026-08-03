export default {
    name: "Mage",
    health: 19,
    actions: {
        Pull: {
            type: "enemyTarget",
            mana: 15,
            apply(state, unit, target) {
                if (state.units[unit].frontLine || state.units[target].frontLine) {
                    let initHealth = state.units[target].health;
                    state.units[target].damage(4);
                    let dealt = max(0, - state.units[target].health + initHealth);
                    state.units[unit].heal(dealt - 1);
                }
            }
        },
        Push: {
            type: "friendTarget",
            mana: 10,
            apply(state, unit, target) {
                let initHealth = state.units[target].health;
                state.units[target].heal(4);
                let gained = max(-1, state.units[target].health - initHealth);
                state.units[unit].damage(gained + 1);
            }
        },
        Fireball: {
            type: "noTarget",
            mana: 50,
            apply(state, unit) {
                state.units.forEach((u, ind) => {
                    if (ind != unit) {
                        u.damage(10);
                    } else {
                        u.damage(3);
                    }
                });
            }
        }
    }
};
