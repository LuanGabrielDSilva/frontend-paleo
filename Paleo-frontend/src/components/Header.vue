<template>
  <div class="app-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="logo">
        🦖 <span>PaleoApp</span>
      </div>

      <nav class="nav">
        <router-link to="/" class="nav-item">🏠 Home</router-link>
        <router-link to="/animals" class="nav-item">🦕 Animais</router-link>
        <router-link to="/eras" class="nav-item">🌍 Eras</router-link>
        <router-link to="/users" class="nav-item">👤 Usuários</router-link>
        <router-link to="/game" class="nav-item">🎮 Jogo</router-link>
      </nav>
    </aside>

    <!-- CONTEÚDO -->
    <main class="main-content">
      <router-view /> <!-- 🔥 AQUI É O CERTO -->
    </main>
  </div>
</template>

<script setup lang="ts">
// Nenhum script necessário por enquanto
</script>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
  background: #f8f9fa;
}

.sidebar {
  width: 280px;
  background: linear-gradient(180deg, #1e272e, #2c3e50);
  color: white;
  padding: 30px 20px;
  position: fixed;
  height: 100vh;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.logo {
  font-size: 28px;
  font-weight: 700;
  padding: 0 15px 40px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  margin-bottom: 30px;
}

.logo span {
  letter-spacing: -1px;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(6px);
}

.nav-item.router-link-active,
.nav-item.router-link-exact-active {
  background: #3498db;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
  font-weight: 600;
}

/* Main Content */
.main-content {
  margin-left: 280px;
  flex: 1;
  padding: 40px;
  background: #f8f9fa;
  min-height: 100vh;
}

/* Responsivo */
@media (max-width: 992px) {
  .sidebar {
    width: 240px;
  }
  .main-content {
    margin-left: 240px;
    padding: 30px 25px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
    padding: 20px;
  }
  
  .main-content {
    margin-left: 0;
    padding: 20px;
  }
  
  .logo {
    justify-content: center;
    padding-bottom: 25px;
  }
}
</style>