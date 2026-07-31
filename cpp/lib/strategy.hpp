#pragma once
#include <cstdint>
#include "easywsclient.hpp"
#include "nlohmann/json.hpp"
#include "httplib.h"
#include <functional>
#include <vector>
#include <string>

namespace Strategy {
    class Effect {
        nlohmann::json json;

    public:
        std::string name;

        explicit Effect(const nlohmann::json& json);

        bool hasTarget();
        std::pair<int, int> getTarget();
    };

    struct Unit {
        int health;
        bool frontLine;

        explicit Unit(const nlohmann::json& json);
    };

    struct Player {
        int id, mana;
        std::vector<Unit> units;

        explicit Player(const nlohmann::json& json);
    };

    class State {
        httplib::Client client;
        std::string route;
        
        void update(const nlohmann::json& json);
        void send(const nlohmann::json& json);

    public:
        int turnNumber;
        Player me, enemy;
        std::vector<Effect> effects;
        
        explicit State(const nlohmann::json& json, const std::string& host, const std::string& route);

        void move(int unit);
        void action(int unit, const std::string& action);
        void action(int unit, const std::string& action, int target);
    };

    void start(char* url, const std::string& character1, const std::string& character2, std::function<void(const State& state)> onTurn);
    void start(int argc, char** argv, const std::string& character1, const std::string& character2, std::function<void(const State& state)> onTurn);
};
