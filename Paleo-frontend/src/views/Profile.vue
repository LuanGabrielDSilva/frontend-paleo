<template>
  <div class="profile-page">
    <div class="container">
      <div class="profile-header">
        <div class="avatar-big">
          {{ userInitial }}
        </div>
        <div class="header-info">
          <h1>{{ user?.name || 'Nome não informado' }}</h1>
          <p class="email">{{ user?.email || 'Email não informado' }}</p>
          <span class="badge" :class="user?.role">
            {{ user?.role === 'admin' ? 'Administrador' : 'Usuário' }}
          </span>
        </div>
      </div>

      <div class="wallet-section">
        <div class="wallet-card">
          <span class="wallet-label">Saldo em Conta</span>
          <span class="wallet-value">R$ {{ user?.balance?.toFixed(2) || '0,00' }}</span>
        </div>
        <div class="wallet-card highlight">
          <span class="wallet-label">Minhas Moedas</span>
          <span class="wallet-value coin">
            <img src="@/assets/moedaDoSite.png" alt="Moeda" class="coin-icon" />
            {{ user?.coins || 0 }}
          </span>
        </div>
      </div>

      <div class="card">
        <h2>Informações da Conta</h2>
        <div class="info-list">
          <div class="info-row">
            <span class="label">Nome completo</span>
            <span class="value">{{ user?.name || '—' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Email</span>
            <span class="value">{{ user?.email || '—' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Tipo de conta</span>
            <span class="value">
              {{ user?.role === 'admin' ? 'Administrador do Sistema' : 'Conta de Usuário' }}
            </span>
          </div>
          <div class="info-row">
            <span class="label">ID do usuário</span>
            <div class="value">
              <span class="id-text">
                {{ showId ? (user?.id || '—') : '••••••••••••' }}
              </span>
              <button @click="showId = !showId" class="btn-toggle-id" :title="showId ? 'Esconder' : 'Mostrar'">
                <img 
                  src="https://png.pngtree.com/png-vector/20250206/ourmid/pngtree-eye-password-icon-vector-png-image_15401930.png" 
                  alt="Toggle ID"
                  :class="{ 'is-hidden': !showId }"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-logout" @click="fazerLogout">
          Sair da Conta
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()

const showId = ref(false)

const user = ref(null)

/* ======================
   LOAD USER
====================== */
const loadUser = async () => {

  try {

    const res = await api.get('/me')

    user.value = res.data

    // 🔥 sincroniza localStorage
    localStorage.setItem(
      'user',
      JSON.stringify(res.data)
    )

  } catch (error) {

    console.log(error)

  }

}

/* ======================
   USER INITIAL
====================== */
const userInitial = computed(() => {

  if (!user.value?.name) return 'U'

  return user.value.name.charAt(0).toUpperCase()

})

/* ======================
   LOGOUT
====================== */
function fazerLogout() {

  if (confirm('Deseja realmente sair da conta?')) {

    localStorage.removeItem('token')
    localStorage.removeItem('user')

    router.push('/login')

  }

}

/* ======================
   MOUNT
====================== */
onMounted(() => {

  loadUser()

})
</script>

<style scoped>
/* Estilo Base */
.profile-page {
  background: #0b0a08;
  min-height: 100vh;
  color: #f5e6c8;
  padding: 50px 20px;
  font-family: 'Cormorant Garamond', serif;
}

.container {
  max-width: 700px;
  margin: 0 auto;
}

/* Header */
.profile-header {
  display: flex;
  align-items: center;
  gap: 30px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.avatar-big {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d4af37, #8d6b3f);
  color: #0b0a08;
  font-size: 3.5rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 5px solid #d4af37;
}

.header-info h1 {
  font-family: 'Cinzel', serif;
  font-size: 2.4rem;
  margin: 0 0 8px 0;
}

.email {
  font-size: 1.15rem;
  opacity: 0.85;
  margin: 0 0 12px 0;
}

.badge {
  padding: 8px 20px;
  border-radius: 30px;
  font-size: 0.95rem;
  font-weight: 600;
}

.badge.admin {
  background: #8d6b3f;
  color: white;
}

/* Seção de Carteira / Moedas */
.wallet-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.wallet-card {
  background: #16120c;
  border: 1px solid #3a2f1d;
  padding: 25px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease, border-color 0.3s;
}

.wallet-card:hover {
  transform: translateY(-5px);
  border-color: #d4af37;
}

.wallet-card.highlight {
  border: 1px solid #d4af37;
  background: linear-gradient(145deg, #16120c, #1f1a12);
}

.wallet-label {
  font-size: 0.85rem;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 10px;
}

.wallet-value {
  font-family: 'Cinzel', serif;
  font-size: 1.6rem;
  color: #d4af37;
  font-weight: bold;
}

/* Cards de Informação */
.card {
  background: #16120c;
  border: 1px solid #3a2f1d;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 30px;
}

.card h2 {
  color: #d4af37;
  font-family: 'Cinzel', serif;
  margin-bottom: 24px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 14px;
  border-bottom: 1px solid #3a2f1d;
}

.info-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.label {
  opacity: 0.75;
  font-size: 1.05rem;
}

.value {
  font-weight: 500;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Estilo do ID e Olho */
.id-text {
  letter-spacing: 1px;
  min-width: 130px;
  display: inline-block;
  text-align: right;
}

.btn-toggle-id {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  transition: transform 0.2s;
}

.btn-toggle-id img {
  width: 24px;
  height: 24px;
  object-fit: contain;
  /* Filtro para converter o ícone para um tom dourado claro compatível com o tema */
  filter: invert(90%) sepia(20%) saturate(500%) hue-rotate(350deg) brightness(100%);
}

.btn-toggle-id:hover {
  transform: scale(1.15);
}

/* Botão de Logout */
.actions {
  text-align: center;
  margin-top: 30px;
}

.btn-logout {
  padding: 14px 40px;
  background: transparent;
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
  border-radius: 8px;
  font-size: 1.05rem;
  cursor: pointer;
  transition: 0.3s;
}

.btn-logout:hover {
  background: rgba(255, 107, 107, 0.1);
}

/* Responsividade simples */
@media (max-width: 600px) {
  .wallet-section {
    grid-template-columns: 1fr;
  }
}

.coin {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}

.coin-icon {
  width: 26px;
  height: 26px;
  object-fit: contain;
  filter: drop-shadow(0 0 4px rgba(212, 175, 55, 0.6));
}

</style>