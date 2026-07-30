#pragma once
#include "nlohmann/json.hpp"
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

    struct State {
        int turnNumber;
        Player me, enemy;
        std::vector<Effect> effects;
        
        explicit State(const nlohmann::json& json);
    };

    class Response {
        std::vector<nlohmann::json> actions;
    
    public:
        void move(int unit);
        void action(int unit, const std::string& action);
        void action(int unit, const std::string& action, int target);

        nlohmann::json json();
    };

    void start(char* url, const std::string& character1, const std::string& character2, std::function<void(const State& state, Response& response)> onTurn);
    void start(int argc, char** argv, const std::string& character1, const std::string& character2, std::function<void(const State& state, Response& response)> onTurn);
};
