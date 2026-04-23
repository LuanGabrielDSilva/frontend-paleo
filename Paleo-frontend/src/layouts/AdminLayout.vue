<template>
  <div class="admin-layout">

    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="logo">
        🦴 PALEO ADMIN
      </div>

      <nav class="nav">
        <router-link to="/admin">Geral</router-link>
        <router-link to="/admin/users">Usuários</router-link>
        <router-link to="/admin/eras">Eras</router-link>
        <router-link to="/admin/periodos">Períodos</router-link>
        <router-link to="/admin/animals">Animais</router-link>
      </nav>

      <div class="divider"></div>

      <div class="admin-info">
        {{ user?.name }} • Admin Panel
      </div>

      <div class="logout" @click="logout">
        Sair
      </div>
    </aside>

    <!-- CONTEÚDO -->
    <main class="content">
      <router-view />
    </main>

  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const user = JSON.parse(localStorage.getItem("user") || "{}");

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  router.push("/login");
}


</script>

<style scoped>
/* =========================
   LAYOUT GERAL
========================= */
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: hsl(30, 20%, 5%);
  color: #f5e6c8;
  font-family: 'Cinzel', serif;
}

/* =========================
   SIDEBAR PREMIUM
========================= */
.sidebar {
  width: 260px;
  height: 100vh;

  position: fixed;
  left: 0;
  top: 0;

  background: linear-gradient(
    180deg,
    hsl(30, 20%, 6%) 0%,
    hsl(30, 25%, 4%) 100%
  );

  border-right: 1px solid rgba(212, 175, 55, 0.15);

  display: flex;
  flex-direction: column;

  padding: 26px 18px;
}

/* LOGO */
.logo {
  font-size: 1.1rem;
  text-align: center;
  font-weight: 700;
  letter-spacing: 3px;

  color: #d4af37;
  margin-bottom: 28px;
}

/* NAV */
.nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* LINKS */
.nav a {
  text-decoration: none;
  color: rgba(245, 230, 200, 0.85);

  padding: 12px 14px;
  border-radius: 10px;

  transition: 0.25s;
  border: 1px solid transparent;
}

/* HOVER */
.nav a:hover {
  background: rgba(212, 175, 55, 0.08);
  border-color: rgba(212, 175, 55, 0.2);
  transform: translateX(5px);
  color: #fff;
}

/* ATIVO */
.nav a.router-link-exact-active {
  background: rgba(212, 175, 55, 0.15);
  border-left: 3px solid #d4af37;
  padding-left: 11px;
  color: #fff;
}

/* DIVISOR */
.divider {
  height: 1px;
  margin: 14px 0;

  background: linear-gradient(
    90deg,
    transparent,
    rgba(212, 175, 55, 0.2),
    transparent
  );
}

/* INFO ADMIN */
.admin-info {
  margin-top: auto;

  padding: 12px;
  border-radius: 10px;

  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(212, 175, 55, 0.1);

  font-size: 0.75rem;
  text-align: center;
  color: rgba(245, 230, 200, 0.7);
}

/* LOGOUT */
.logout {
  margin-top: 14px;

  padding: 12px;
  border-radius: 10px;

  text-align: center;
  cursor: pointer;

  background: rgba(255, 80, 80, 0.08);
  border: 1px solid rgba(255, 80, 80, 0.2);

  color: #ff8a8a;
  transition: 0.3s;
}

.logout:hover {
  background: rgba(255, 80, 80, 0.18);
  transform: translateX(4px);
  color: white;
}

/* =========================
   CONTEÚDO
========================= */
.content {
  margin-left: 260px;
  width: calc(100% - 260px);
  padding: 30px;
}
</style>