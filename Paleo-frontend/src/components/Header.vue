<template>
  <header class="topbar">
    <div class="left">
       <span>Paleo Park</span>
    </div>

    <nav class="nav">
      <router-link to="/home">Home</router-link>
      <router-link to="/animals">Animais</router-link>
      <router-link to="/eras">Eras</router-link>
      <router-link to="/game">Jogo</router-link>
      <RouterLink to="/wallet">Carteira</RouterLink>
      <router-link to="/shop">Loja</router-link>
      <router-link to="/cart" class="cart-icon">🛒 Carrinho</router-link>
    </nav>

    <!-- Perfil do Usuário -->
    <UserProfile />
  </header>
</template>

<script setup>
import UserProfile from '@/components/UserProfile.vue'
</script>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 30px;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
}

.left {
  font-weight: bold;
  color: #d4af37;
  display: flex;
  gap: 8px;
  font-size: 1.25rem;
}

.nav {
  display: flex;
  gap: 24px;
}

.nav a {
  color: #f5e6c8;
  text-decoration: none;
}

.nav a.router-link-active {
  color: #d4af37;
  border-bottom: 2px solid #d4af37;
}

.cart-icon {
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(212,175,55,0.1);
}

</style>