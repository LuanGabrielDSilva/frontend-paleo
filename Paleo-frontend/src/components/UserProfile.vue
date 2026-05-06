<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const open = ref(false)
const wrapperRef = ref(null)

const user = computed(() => {
  const data = localStorage.getItem('user')
  return data ? JSON.parse(data) : { name: 'Usuário Explorador' }
})

const inicial = computed(() => {
  return user.value.name?.[0]?.toUpperCase() || 'U'
})

const firstName = computed(() => {
  return user.value.name?.split(' ')[0] || 'Usuário'
})

function toggle() {
  open.value = !open.value
}

// Fechar ao clicar fora
const handleClickOutside = (event) => {
  if (wrapperRef.value && !wrapperRef.value.contains(event.target)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

function goToProfile() {
  router.push('/profile')
  open.value = false
}

function logout() {
  if (confirm('Deseja realmente sair da conta?')) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }
  open.value = false
}
</script>

<template>
  <div class="wrapper" ref="wrapperRef">
    <div class="user-trigger" :class="{ 'is-active': open }" @click="toggle">
      <div class="avatar-container">
        <div class="avatar-ring"></div>
        <div class="avatar-core">{{ inicial }}</div>
      </div>
      <div class="user-info">
        <span class="name">{{ firstName }}</span>
        <span class="rank">Explorador</span>
      </div>
      <svg class="chevron" :class="{ rotate: open }" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>

    <Transition name="menu-anim">
      <div v-if="open" class="dropdown-menu">
        <div class="menu-header">
          <p>Sua Conta</p>
        </div>
        
        <div class="menu-content">
          <button @click.stop="goToProfile" class="menu-item">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <span>Meu Perfil</span>
          </button>

          <div class="divider"></div>

          <button @click.stop="logout" class="menu-item logout">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Sair da Conta</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Variáveis de Cor (ajustadas para luxo) */
.wrapper {
  --gold: #d4af37;
  --gold-light: #f1d98a;
  --bg-dark: #120c08;
  --text-cream: #f5e6c8;
  --danger: #ff4d4d;
  position: relative;
  font-family: 'Cormorant Garamond', serif;
}

/* === GATILHO (USER AREA) === */
.user-trigger {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 14px 6px 6px;
  border-radius: 40px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(212, 175, 55, 0.1);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  user-select: none;
}

.user-trigger:hover, .user-trigger.is-active {
  background: rgba(212, 175, 55, 0.08);
  border-color: rgba(212, 175, 55, 0.4);
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

/* Avatar com efeito de anel */
.avatar-container {
  position: relative;
  width: 38px;
  height: 38px;
}

.avatar-core {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--gold), #8a6a1f);
  color: #000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.1rem;
  z-index: 2;
  font-family: 'Cinzel', serif;
}

.avatar-ring {
  position: absolute;
  inset: -3px;
  border: 1px solid var(--gold);
  border-radius: 50%;
  opacity: 0.3;
  transition: all 0.4s ease;
}

.user-trigger:hover .avatar-ring {
  inset: -5px;
  opacity: 0.6;
}

/* Textos ao lado do avatar */
.user-info {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.name {
  color: var(--text-cream);
  font-weight: 600;
  font-family: 'Cinzel', serif;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
}

.rank {
  font-size: 0.65rem;
  color: var(--gold);
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.7;
}

.chevron {
  width: 16px;
  height: 16px;
  color: var(--gold);
  transition: transform 0.4s ease;
}

.chevron.rotate {
  transform: rotate(180deg);
}

/* === DROPDOWN MENU === */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 200px;
  background: rgba(18, 12, 8, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.7);
  z-index: 1000;
  overflow: hidden;
}

.menu-header {
  padding: 12px 16px;
  background: rgba(212, 175, 55, 0.05);
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}

.menu-header p {
  margin: 0;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--gold);
  opacity: 0.8;
}

.menu-content {
  padding: 6px;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: transparent;
  border: none;
  color: var(--text-cream);
  font-size: 0.95rem;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-family: 'Cormorant Garamond', serif;
}

.icon {
  width: 18px;
  height: 18px;
  opacity: 0.7;
  transition: 0.2s;
}

.menu-item:hover {
  background: rgba(212, 175, 55, 0.1);
  color: #fff;
}

.menu-item:hover .icon {
  opacity: 1;
  transform: translateX(2px);
}

.divider {
  height: 1px;
  background: rgba(212, 175, 55, 0.1);
  margin: 6px 12px;
}

.logout {
  color: var(--danger);
}

.logout:hover {
  background: rgba(255, 77, 77, 0.08);
}

/* === ANIMAÇÕES === */
.menu-anim-enter-active {
  animation: menu-in 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}
.menu-anim-leave-active {
  animation: menu-in 0.2s reverse ease-in;
}

@keyframes menu-in {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Responsivo */
@media (max-width: 768px) {
  .user-info { display: none; }
  .user-trigger { padding: 5px; }
  .chevron { display: none; }
}
</style>