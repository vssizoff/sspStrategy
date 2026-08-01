import {createRouter, createWebHashHistory} from "vue-router";

export default createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            name: "root",
            path: "/",
            component: () => import("@renderer/views/RootView.vue")
        },
        {
            name: "localRun",
            path: "/",
            component: () => import("@renderer/views/LocalRunView.vue"),
        }
    ]
});