#include <iostream>
#include "strategy.hpp"

using std::cout, std::cerr;

void onTurn(Strategy::State& state) {
    cerr << state.turnNumber << '\n';
    state.action(state.me.units[0].id, "act0");
}

int main(int argc, char** argv) {
    Strategy::start(argc, argv, "Archer", "Knight", onTurn);
}
