export default {
    name: "Archer",
    health: 20,
    actions: {
        Shoot: {
            type: "enemyTarget",
            mana: 17,
            apply(state, unit, target) {
                if (state.units[unit].frontLine || state.units[target].frontLine) {
                    if (state.units[unit].aimed == target) {
                      state.units[target].damage(8);
                      state.units[unit].aim = -1;
                    } else {
                      state.units[target].damage(4);
                    }
                }
            }
        },
        Trap: {
            type: "noTarget",
            mana: 12,
            apply(state, unit) {
                state.effects.push({
                    name: "ArcherTrap",
                    emit(type, emitUnit) {
                        if (type == "move") {
                            if (state.units[emitUnit].frontLine) {
                                if (state.isEnemy(state.units[unit].player.id, emitUnit)) {
                                    state.units[emitUnit].damage(2);
                                    state.units[unit].player.mana += 8;
                                    return () => {};
                               }
                            }
                        }
                    }
                })
            }
        },
        Aim: {
            type: "enemyTarget",
            mana: 8,
            apply(state, unit, target) {
              state.units[unit].aimed = target;
              state.effects.push({
                  name: "ArcherAim",
                  target: target,
                  emit(type, emitUnit) {
                      if (type == "move" && (emitUnit == target || emitUnit == unit)) {
                          state.units[unit].aimed = -1;
                          return () => {};
                      }
                  }
              });
            }
        }

    }
};
