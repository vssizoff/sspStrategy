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
            path: "/local-run",
            component: () => import("@renderer/views/LocalRunView.vue"),
        },
        {
            name: "visualize",
            path: "/visualize",
            component: () => import("@renderer/views/VisualizeView.vue"),
        }
    ]
});