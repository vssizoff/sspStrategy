#include "strategy.hpp"
#include <cassert>
#include <cstdlib>
#include <iostream>
#include <functional>
#include <string>
#include <utility>
#include <vector>
#include "easywsclient.hpp"
#include "nlohmann/json.hpp"

Strategy::Effect::Effect(const nlohmann::json& json): json(json), name(json["name"].get<std::string>()) {}

bool Strategy::Effect::hasTarget() {
    return json.contains("target");
}

std::pair<int, int> Strategy::Effect::getTarget() {
    int globalId = json["target"].get<int>();
    if (globalId > 1) return {1, globalId - 2};
    return {0, globalId};
}

Strategy::Unit::Unit(const nlohmann::json& json): health(json["health"].get<int>()), frontLine(json["frontLine"].get<bool>()) {}

Strategy::Player::Player(const nlohmann::json& json): id(json["id"].get<int>()), mana(json["mana"].get<int>()) {
    for (const auto& rawUnit : json["units"].get<std::vector<nlohmann::json>>()) {
        units.push_back(Unit(rawUnit));
    }
}

Strategy::State::State(const nlohmann::json& json): turnNumber(json["turnNumber"].get<int>()), me(json["you"]), enemy(json["enemy"]) {
    for (const auto& rawEffect : json["effects"].get<std::vector<nlohmann::json>>()) {
        effects.push_back(Effect(rawEffect));
    }
}

void Strategy::Response::move(int unit) {
    actions.push_back(nlohmann::json({
        {"type", "move"},
        {"unit", unit}
    }));
}

void Strategy::Response::action(int unit, const std::string& action) {
    actions.push_back(nlohmann::json({
        {"type", "action"},
        {"unit", unit}
    }));
}

void Strategy::Response::action(int unit, const std::string& action, int target) {
    actions.push_back(nlohmann::json({
        {"type", "action"},
        {"unit", unit},
        {"target", target}
    }));
}

nlohmann::json Strategy::Response::json() {
    return nlohmann::json(actions);
}

void Strategy::start(char* url, const std::string& character1, const std::string& character2, std::function<void(const State& state, Response& response)> onTurn) {
    easywsclient::WebSocket::pointer ws = easywsclient::WebSocket::from_url(url);
    assert(ws);
    while (ws->getReadyState() != easywsclient::WebSocket::CLOSED) {
        ws->poll(); 
        ws->dispatch([&character1, &character2, &onTurn, &ws](const std::string& message) {
            auto json = nlohmann::json::parse(message);
            if (json["emit"].get<std::string>() == "init") {
                ws->send(nlohmann::json(std::vector({character1, character2})).dump());
                return;
            }
            State state(json);
            Response response;
            onTurn(state, response);
            ws->send(response.json().dump());
        });
    }
    delete ws;
    std::cerr << "Game ended successfully";
}

void Strategy::start(int argc, char** argv, const std::string& character1, const std::string& character2, std::function<void(const State& state, Response& response)> onTurn) {
    if (argc < 2) {
        std::cerr << "You must specify url to connect to";
        std::exit(1);
    }
    start(argv[1], character1, character2, onTurn);
}
