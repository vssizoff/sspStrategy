#include <iostream>
#include "lib/strategy.hpp"

using std::cout, std::cerr;

void onTurn(Strategy::State& state) {
    Strategy::Unit& archer = state.me.units[0];
    Strategy::Unit& knight = state.me.units[1];
    Strategy::Unit& enemy1 = state.enemy.units[0];
    Strategy::Unit& enemy2 = state.enemy.units[1];
    cerr << "Turn: " << state.turnNumber << '\n';
    bool moved = 0;
    if (knight.frontLine == false && state.me.mana >= 7) {
        state.move(knight.id);
        moved = 1;
    }
    while (state.me.mana >= 14 && knight.frontLine && (enemy1.frontLine && enemy2.frontLine)) state.action(knight.id, "SplashAttack");
    while (state.me.mana >= 7 && knight.frontLine && (enemy1.frontLine || enemy2.frontLine)) state.action(knight.id, "SwordAttack");
    if (!moved) {
        state.move(knight.id);
        moved = 1;
    }
    while (state.me.mana >= 17 && (archer.frontLine || enemy1.frontLine || enemy2.frontLine)) {
        if (archer.frontLine || enemy1.frontLine) state.action(archer.id, "Shoot", enemy1.id);
        else state.action(archer.id, "Shoot", enemy2.id);
    }
}

int main(int argc, char** argv) {
    Strategy::start(argc, argv, "Archer", "Knight", onTurn);
}
