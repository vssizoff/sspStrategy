#include <cstdlib>
#include <iostream>
#include "lib/strategy.hpp"

using std::cout, std::cerr;

void onTurn(const Strategy::State& state, Strategy::Response& response) {
    cerr << state.turnNumber << '\n';
}

int main(int argc, char** argv) {
    Strategy::start(argc, argv, "test", "test", onTurn);
}
