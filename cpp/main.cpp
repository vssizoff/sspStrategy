#include <iostream>
#include "lib/strategy.hpp"

using std::cout, std::cerr;

void onTurn(Strategy::State& state) {
    cerr << "Turn: " << state.turnNumber << '\n';
    bool moved = 0;
    if (state.me.units[1].frontLine == false && state.me.mana >= 7) {
        state.move(state.me.units[1].id);
        moved = 1;
    }
    while (state.me.mana >= 14 && state.me.units[1].frontLine && (state.enemy.units[0].frontLine && state.enemy.units[1].frontLine)) state.action(state.me.units[1].id, "SplashAttack");
    //while (state.me.mana >= 7 && state.me.units[1].frontLine && (state.enemy.units[0].frontLine || state.enemy.units[1].frontLine)) state.action(state.me.units[1].id, "SwordAttack");
    if (!moved) {
        state.move(state.me.units[1].id);
        moved = 1;
    }
    //cerr << archer->id << ' ' << state.me.units[0].id << '\n';
    while (state.me.mana >= 17 && (state.me.units[0].frontLine || state.enemy.units[0].frontLine || state.enemy.units[1].frontLine)) {
        if (state.me.units[0].frontLine || state.enemy.units[0].frontLine) state.action(state.me.units[0].id, "Shoot", state.enemy.units[0].id);
        else state.action(state.me.units[0].id, "Shoot", state.enemy.units[1].id);
    }
}

int main(int argc, char** argv) {
    Strategy::start(argc, argv, "Archer", "Knight", onTurn);
}
