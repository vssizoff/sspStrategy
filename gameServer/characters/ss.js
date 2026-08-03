export default {
    name: "SergeySergeevich",
    health: 25,
    actions: {
        Probezhka: {
            type: "noTarget",
            mana: 10,
            apply(state, unit) {
                let probezhkaTicks = 3;
                state.effects.push({
                    name: "SSProbezhka",
                    target: unit,
                    emit(type, emit_unit) {
                        if (type == "move" && emit_unit == unit ) {
                            state.units[unit].player.mana += 3;
                        }
                        if (type == "turn" && state.currentPlayer == state.units[unit].player.id) {
                            probezhkaTicks--;
                        }
                        if (probezhkaTicks == 0) return () => {};
                    }
                });
            }
        },
        Reject: {
            type: "noTarget",
            mana: 15,
            apply(state, unit) {
                state.effects.push({
                    name: "SSReject",
                    target: unit,
                    emit(type, emit_unit, value) {
                        if (type == "damage") {
                            state.units[emit_unit].heal(value);
                            return () => {};
                        } else if (type == "heal") {
                            state.units[emit_unit].damage(value);
                            return () => {};
                        }
                    }
                });
            }
        },
        Pedagogika: {
            type: "noTarget",
            mana: 20,
            apply(state, unit) {
                state.players.forEach(pl => {
                  if (pl.id == state.units[unit].player.id) {
                      state.units[unit].player.mana += 30;
                  } else {
                      state.units[unit].player.mana += 7;
                  }
                });
            }
        }

    }
};

