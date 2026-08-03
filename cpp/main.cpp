#include <iostream>
#include "strategy.hpp"

using std::cout, std::cerr;

void onTurn(Strategy::State& state) {
    cerr << state.turnNumber << '\n';
    if (state.me.mana >= 15) state.action(state.me.units[1].id, "SplashAttack");
}

int main(int argc, char** argv) {
    Strategy::start(argc, argv, "Archer", "Knight", onTurn);
}
