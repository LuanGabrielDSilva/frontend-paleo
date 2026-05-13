import { createRouter, createWebHistory } from "vue-router";

/* ================= LAYOUTS ================= */
import DefaultLayout from "../layouts/DefaultLayout.vue";
import AdminLayout from "../layouts/AdminLayout.vue";

/* ================= AUTH ================= */
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";

/* ================= USER ================= */
import Home from "../views/Home.vue";
import Profile from "../views/Profile.vue";
import Collection from "../views/Collection.vue";
import Eras from "../views/Eras.vue";
import EraDetailsView from "../views/EraDetailsView.vue";
import Users from "../views/Users.vue";
import SaibaMais from "../views/SaibaMais.vue";
import Game from "../views/Game.vue";
import WalletView from "../views/WalletView.vue";

/* ================= SHOP ================= */
import Shop from "../views/shop/Shop.vue";
import Inventory from "../views/shop/Inventory.vue";
import Checkout from "../views/shop/Checkout.vue";

import Cart from "../views/shop/Cart.vue";

/* ================= GAMES ================= */
import DinoClickerView from "../views/games/DinoClickerView.vue";
import MemoryGame from "../views/games/MemoryGame.vue";
import QuizGame from "../views/games/QuizGame.vue";

/* ================= ERAS ================= */
import Mesozoico from "../views/eras/Mesozoico.vue";
import Paleozoico from "../views/eras/Paleozoico.vue";
import Cenozoico from "../views/eras/Cenozoico.vue";

/* ================= ADMIN ================= */
import AdminDashboard from "../views/admin/AdminDashboard.vue";
import AdminEras from "../views/admin/AdminEras.vue";
import AdminAnimals from "../views/admin/AdminAnimals.vue";
import AdminUsers from "../views/admin/AdminUsers.vue";
import AdminPeriodos from "../views/admin/AdminPeriodos.vue";
import AdminProducts from "../views/admin/AdminProducts.vue";
import AdminOrders from "../views/admin/AdminOrders.vue";

/* ================= ROUTES ================= */

const routes = [
  {
    path: "/",
    redirect: "/login",
  },

  /* ================= PUBLIC ================= */
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/register",
    component: Register,
  },

  /* ================= USER LAYOUT ================= */
  {
    path: "/",
    component: DefaultLayout,
    children: [

      { path: "home", component: Home },
      { path: "profile", component: Profile },
      { path: "saiba-mais", component: SaibaMais },
      { path: "animals", component: Collection },
      { path: "eras", component: Eras },
      { path: "eras/:id", component: EraDetailsView },
      { path: "users", component: Users },
      { path: "game", component: Game },
      { path: "wallet", component: WalletView },
      

      /* 🎯 SHOP AQUI DENTRO DO LAYOUT */
      { path: "shop", component: Shop },
      { path: "inventory", component: Inventory },
      { path: "checkout", component: Checkout },
      { path: "cart", component: Cart },
      { path: "shop/:id", component: () => import("../views/shop/ProductDetails.vue") },

      /* GAMES */
      { path: "games/dino-clicker", component: DinoClickerView },
      { path: "games/memory-game", component: MemoryGame },
      { path: "games/quiz", component: QuizGame },

      /* ERAS */
      { path: "eras/mesozoico", component: Mesozoico },
      { path: "eras/paleozoico", component: Paleozoico },
      { path: "eras/cenozoico", component: Cenozoico },
    ],
  },

  /* ================= ADMIN ================= */
  {
    path: "/admin",
    component: AdminLayout,
    children: [
      { path: "", component: AdminDashboard },
      { path: "eras", component: AdminEras },
      { path: "animals", component: AdminAnimals },
      { path: "users", component: AdminUsers },
      { path: "periodos", component: AdminPeriodos },
      { path: "products", component: AdminProducts },
      { path: "orders", component: AdminOrders },
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});