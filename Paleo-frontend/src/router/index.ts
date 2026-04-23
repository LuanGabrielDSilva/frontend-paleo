import { createRouter, createWebHistory } from "vue-router";

// 🔓 públicas
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";

// 🔐 usuário
import Home from "../views/Home.vue";
import Animals from "../views/Animals.vue";
import Eras from "../views/Eras.vue";
import Users from "../views/Users.vue";
import Game from "../views/Game.vue";
import Collection from "../views/Collection.vue";

// 👑 ADMIN
import AdminLayout from "../layouts/AdminLayout.vue";
import AdminDashboard from "../views/admin/AdminDashboard.vue";
import AdminEras from "../views/admin/AdminEras.vue";
import AdminAnimals from "../views/admin/AdminAnimals.vue";
import AdminUsers from "../views/admin/AdminUsers.vue";
import AdminPeriodos from "../views/admin/AdminPeriodos.vue";

const routes = [
  // 🔓 públicas
  { path: "/", component: Login },
  { path: "/login", component: Login },
  { path: "/register", component: Register },

  // 🔐 usuário
  { path: "/home", component: Home },
  { path: "/animals", component: Animals },
  { path: "/eras", component: Eras },
  { path: "/users", component: Users },
  { path: "/game", component: Game },
  { path: "/collection", component: Collection },

  // 👑 ADMIN (CORRETO AGORA)
  {
    path: "/admin",
    component: AdminLayout,
    meta: { admin: true },
    children: [
      {
        path: "",
        component: AdminDashboard,
      },
      {
        path: "eras",
        component: AdminEras,
      },
      {
        path: "animals",
        component: AdminAnimals,
      },
      {
        path: "users",
        component: AdminUsers,
      },
      {
      path: "/admin/periodos",
      component: AdminPeriodos
    },
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 🔐 PROTEÇÃO GLOBAL
router.beforeEach((to) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // públicas
  if (["/", "/login", "/register"].includes(to.path)) {
    if (token) return "/home";
    return true;
  }

  // sem login
  if (!token) return "/login";

  // admin protection
  if (to.path.startsWith("/admin")) {
    if (user.role !== "admin") return "/home";
  }

  return true;
});