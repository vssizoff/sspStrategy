#include "strategy.hpp"
#include <cassert>
#include <cstdlib>
#include <iostream>
#include <functional>
#include <string>
#include <vector>
#include "easywsclient.hpp"
#include "nlohmann/json.hpp"
#include "httplib.h"

Strategy::Effect::Effect(const nlohmann::json& json): json(json), name(json["name"].get<std::string>()) {}

bool Strategy::Effect::hasTarget() {
    return json.contains("target");
}

int Strategy::Effect::getTarget() {
    return json["target"].get<int>();
}

Strategy::Unit::Unit(const nlohmann::json& json): id(json["id"].get<int>()), health(json["health"].get<int>()), frontLine(json["frontLine"].get<bool>()) {}

Strategy::Player::Player(const nlohmann::json& json): id(json["id"].get<int>()), mana(json["mana"].get<int>()) {
    for (const auto& rawUnit : json["units"].get<std::vector<nlohmann::json>>()) {
        units.push_back(Unit(rawUnit));
    }
}

void Strategy::State::update(const nlohmann::json& json) {
    turnNumber = json["turnNumber"].get<int>();
    me = Player(json["you"]);
    enemy = Player(json["enemy"]);
    for (const auto& rawEffect : json["effects"].get<std::vector<nlohmann::json>>()) {
        effects.push_back(Effect(rawEffect));
    }
}

void Strategy::State::send(const nlohmann::json& json) {
    auto res = client.Post(route, json.dump(), "application/json");
    update(nlohmann::json::parse(res->body));
}

Strategy::State::State(const nlohmann::json& json, const std::string& host, const std::string& route):
    client(host),
    route(route),
    turnNumber(json["turnNumber"].get<int>()),
    me(json["you"]),
    enemy(json["enemy"])
{
    for (const auto& rawEffect : json["effects"].get<std::vector<nlohmann::json>>()) {
        effects.push_back(Effect(rawEffect));
    }
}

void Strategy::State::move(int unit) {
    send({
        {"type", "move"},
        {"unit", unit}
    });
}

void Strategy::State::action(int unit, const std::string& action) {
    send({
        {"type", "action"},
        {"unit", unit},
        {"action", action}
    });
}

void Strategy::State::action(int unit, const std::string& action, int target) {
    send({
        {"type", "action"},
        {"unit", unit},
        {"action", action},
        {"target", target}
    });
}

void Strategy::start(char* url, const std::string& character1, const std::string& character2, std::function<void(State& state)> onTurn) {
    easywsclient::WebSocket::pointer ws = easywsclient::WebSocket::from_url(url);
    assert(ws);
    std::string host, route;
    while (ws->getReadyState() != easywsclient::WebSocket::CLOSED) {
        ws->poll(); 
        ws->dispatch([&character1, &character2, &onTurn, &ws, &host, &route](const std::string& message) {
            auto json = nlohmann::json::parse(message);
            if (json["emit"].get<std::string>() == "init") {
                host = json["host"].get<std::string>();
                route = json["route"].get<std::string>();
                ws->send(nlohmann::json(std::vector({character1, character2})).dump());
                return;
            }
            httplib::Client client(host);
            auto res = client.Get(route);
            State state(nlohmann::json::parse(res->body), host, route);
            onTurn(state);
            ws->send("end");
        });
    }
    delete ws;
    std::cerr << "Game ended successfully";
}

void Strategy::start(int argc, char** argv, const std::string& character1, const std::string& character2, std::function<void(State& state)> onTurn) {
    if (argc < 2) {
        std::cerr << "You must specify url to connect to";
        std::exit(1);
    }
    start(argv[1], character1, character2, onTurn);
}
