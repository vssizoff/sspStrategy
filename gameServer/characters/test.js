export default {
    name: "test",
    health: 10,
    actions: {
        act0: {
            type: "noTarget",
            mana: 10,
            apply(state, unit) {
                console.log("test");
            }
        },
        act1: {
            type: "enemyTarget",
            mana: 10,
            apply(state, unit, target) {
                console.log("test");
            }
        }
    }
};
