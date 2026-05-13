<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()

const showId = ref(false)
const user = ref(null)
const favoriteAnimals = ref([])
const expeditions = ref([])

const showLogoutModal = ref(false)
const activeTab = ref('overview')

/* =========================
   LOAD USER + DATA
========================= */
const loadUser = async () => {
  try {
    const [userRes, animalsRes, expeditionsRes] = await Promise.all([
      api.get('/me'),
      api.get('/animals'),
      api.get('/expeditions') // 👈 NOVO ENDPOINT
    ])

    user.value = userRes.data

    localStorage.setItem('user', JSON.stringify(userRes.data))

    const savedFavorites = JSON.parse(
      localStorage.getItem('paleo-favorites') || '[]'
    )

    favoriteAnimals.value = animalsRes.data.filter((animal) =>
      savedFavorites.includes(String(animal.id))
    )

    expeditions.value = expeditionsRes.data || []
  } catch (error) {
    console.log(error)
  }
}

/* =========================
   TABS
========================= */
const tabs = computed(() => [
  {
    id: 'overview',
    label: 'Visão Geral',
    count: null,
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>'
  },
  {
    id: 'account',
    label: 'Conta',
    count: null,
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
  },
  {
    id: 'animals',
    label: 'Animais',
    count: favoriteAnimals.value.length,
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.5 12.5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0z"/><path d="M14.5 12.5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0z"/><path d="M9 18c1 1 2 1.5 3 1.5s2-.5 3-1.5"/></svg>'
  },
  {
    id: 'expeditions',
    label: 'Expedições',
    count: expeditions.value.length,
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"/><path d="M7 21V7l5-4 5 4v14"/><path d="M9 21v-6h6v6"/></svg>'
  }
])

const userInitial = computed(() =>
  user.value?.name
    ? user.value.name.charAt(0).toUpperCase()
    : 'U'
)

/* =========================
   LOGOUT
========================= */
function askLogout() {
  showLogoutModal.value = true
}
function confirmLogout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  showLogoutModal.value = false
  router.push('/login')
}
function cancelLogout() {
  showLogoutModal.value = false
}

onMounted(() => {
  loadUser()
})
</script>

<template>
  <div class="profile-page">
    <div class="container">

      <!-- HEADER -->
      <header class="profile-hero">
        <div class="hero-left">
          <div class="avatar-big">
            {{ userInitial }}
          </div>

          <div class="identity">
            <span class="eyebrow">
              — Ficha do Paleontólogo —
            </span>

            <h1>
              {{ user?.name || 'Nome não informado' }}
            </h1>

            <p class="email">
              {{ user?.email || 'Email não informado' }}
            </p>

            <span class="badge" :class="user?.role">
              {{
                user?.role === 'admin'
                  ? 'Administrador'
                  : 'Explorador'
              }}
            </span>
          </div>
        </div>

        <div class="hero-right">
          <div class="mini-stat">
            <span class="mini-label">
              Nível
            </span>

            <span class="mini-value">
              {{ user?.level || 1 }}
            </span>
          </div>

          <div class="mini-stat highlight">
            <span class="mini-label">
              Moedas
            </span>

            <span class="mini-value coin">
              <img
                src="@/assets/moedaDoSite.png"
                alt="Moeda"
                class="coin-icon"
              />

              {{ user?.coins || 0 }}
            </span>
          </div>

          <button
            class="btn-logout"
            @click="askLogout"
            title="Sair da conta"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      <!-- DASHBOARD -->
      <div class="dashboard">

        <!-- NAV -->
        <nav class="side-nav">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="nav-item"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <span
              class="nav-icon"
              v-html="tab.icon"
            ></span>

            <span class="nav-label">
              {{ tab.label }}
            </span>

            <span
              v-if="tab.count !== null"
              class="nav-count"
            >
              {{ tab.count }}
            </span>
          </button>
        </nav>

        <!-- PANEL -->
        <section class="panel">
          <Transition name="swap" mode="out-in">

            <!-- OVERVIEW -->
            <div
              v-if="activeTab === 'overview'"
              key="overview"
              class="panel-inner"
            >
              <div class="panel-head">
                <h2>Visão Geral</h2>

                <span class="panel-sub">
                  Resumo da sua expedição
                </span>
              </div>

              <div class="overview-grid">
                <div class="ov-card">
                  <span class="ov-num">
                    {{ favoriteAnimals.length }}
                  </span>

                  <span class="ov-cap">
                    Espécies
                  </span>
                </div>

                <div class="ov-card">
                  <span class="ov-num">
                    {{ user?.coins || 0 }}
                  </span>

                  <span class="ov-cap">
                    Moedas
                  </span>
                </div>

                <div class="ov-card">
                  <span class="ov-num">
                    {{ user?.xp || 0 }}
                  </span>

                  <span class="ov-cap">
                    XP
                  </span>
                </div>

                <div class="ov-card">
                  <span class="ov-num">
                    {{ user?.level || 1 }}
                  </span>

                  <span class="ov-cap">
                    Nível
                  </span>
                </div>
              </div>

              <div class="quick-info">
                <h3>Status</h3>

                <p>
                  Continue explorando espécies pré-históricas
                  para evoluir seu perfil no museu paleontológico.
                </p>
              </div>
            </div>

            <!-- ACCOUNT -->
            <div
              v-else-if="activeTab === 'account'"
              key="account"
              class="panel-inner"
            >
              <div class="panel-head">
                <h2>Informações da Conta</h2>

                <span class="panel-sub">
                  Seus dados pessoais
                </span>
              </div>

              <div class="info-list">

                <div class="info-row">
                  <span class="label">
                    Nome completo
                  </span>

                  <span class="value">
                    {{ user?.name || '—' }}
                  </span>
                </div>

                <div class="info-row">
                  <span class="label">
                    Email
                  </span>

                  <span class="value">
                    {{ user?.email || '—' }}
                  </span>
                </div>

                <div class="info-row">
                  <span class="label">
                    Tipo de conta
                  </span>

                  <span class="value">
                    {{
                      user?.role === 'admin'
                        ? 'Administrador do Sistema'
                        : 'Conta de Usuário'
                    }}
                  </span>
                </div>

                <div class="info-row">
                  <span class="label">
                    XP Atual
                  </span>

                  <span class="value">
                    {{ user?.xp || 0 }}
                  </span>
                </div>

                <div class="info-row">
                  <span class="label">
                    ID do usuário
                  </span>

                  <span class="value">
                    <span class="id-text">
                      {{
                        showId
                          ? (user?.id || '—')
                          : '••••••••••••'
                      }}
                    </span>

                    <button
                      @click="showId = !showId"
                      class="btn-toggle-id"
                    >
                      👁
                    </button>
                  </span>
                </div>

              </div>
            </div>

            <!-- ANIMALS -->
            <div
              v-else-if="activeTab === 'animals'"
              key="animals"
              class="panel-inner"
            >
              <div class="panel-head">
                <h2>Animais Descobertos</h2>

                <span class="panel-sub">
                  {{ favoriteAnimals.length }} espécie(s)
                </span>
              </div>

              <div
                v-if="favoriteAnimals.length"
                class="animals-grid"
              >
                <div
                  v-for="animal in favoriteAnimals"
                  :key="animal.id"
                  class="animal-card"
                >
                  <img
                    :src="animal.image"
                    :alt="animal.name"
                    class="animal-image"
                  />

                  <span class="animal-name">
                    {{ animal.name }}
                  </span>
                </div>
              </div>

              <p v-else class="empty">
                Nenhum animal descoberto ainda.
              </p>
            </div>
            <!-- EXPEDITIONS -->
<div
  v-else-if="activeTab === 'expeditions'"
  key="expeditions"
  class="panel-inner"
>
  <div class="panel-head">
    <h2>Expedições Registradas</h2>
    <span class="panel-sub">
      {{ expeditions.length }} missão(s)
    </span>
  </div>

  <div v-if="expeditions.length" class="expeditions-scroll">
    <div
      v-for="exp in expeditions"
      :key="exp.id"
      class="expedition-card"
    >
      <div class="expedition-header">
        <span class="expedition-title">
          {{ exp.title || 'Expedição sem nome' }}
        </span>

        <span class="expedition-status">
          {{ exp.status }}
        </span>
      </div>

      <p class="expedition-desc">
        {{ exp.description || 'Sem descrição registrada.' }}
      </p>

      <div class="expedition-footer">
        <span>🌍 {{ exp.location || 'Desconhecido' }}</span>
        <span>📅 {{ exp.date || 'Data não registrada' }}</span>
      </div>
    </div>
  </div>

  <p v-else class="empty">
    Nenhuma expedição registrada ainda.
  </p>
</div>

          </Transition>
        </section>
      </div>
    </div>

    <!-- MODAL -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showLogoutModal"
          class="logout-overlay"
          @click.self="cancelLogout"
        >
          <Transition name="pop" appear>
            <div class="logout-modal">

              <div class="seal">
                🚪
              </div>

              <p class="modal-eyebrow">
                — Encerramento de Sessão —
              </p>

              <h3 class="modal-title">
                Deixar a Expedição?
              </h3>

              <p class="modal-desc">
                Sua jornada ficará salva até o próximo acesso.
              </p>

              <div class="modal-actions">
                <button
                  class="btn ghost"
                  @click="cancelLogout"
                >
                  Continuar Explorando
                </button>

                <button
                  class="btn danger"
                  @click="confirmLogout"
                >
                  Sim, Sair
                </button>
              </div>

            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>


<style scoped>
.profile-page {
  background:
    radial-gradient(circle at 20% 10%, rgba(212,175,55,0.07), transparent 50%),
    radial-gradient(circle at 80% 90%, rgba(141,107,63,0.08), transparent 50%),
    #0b0a08;
  min-height: 100vh;
  color: #f5e6c8;
  padding: 30px 20px;
  font-family: 'Crimson Text', 'Cormorant Garamond', serif;
}
.container { max-width: 1200px; margin: 0 auto; }

/* ====== HERO ====== */
.profile-hero {
  display: flex; justify-content: space-between; align-items: center;
  gap: 24px; flex-wrap: wrap;
  background: linear-gradient(145deg, #16120c, #0e0a06);
  border: 1px solid #3a2f1d;
  border-radius: 16px;
  padding: 22px 28px;
  margin-bottom: 24px;
  position: relative; overflow: hidden;
}
.profile-hero::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(circle at 30% 50%, rgba(212,175,55,0.08), transparent 60%);
  pointer-events: none;
}
.hero-left { display: flex; align-items: center; gap: 22px; position: relative; }
.avatar-big {
  width: 90px; height: 90px; border-radius: 50%;
  background: linear-gradient(135deg, #d4af37, #8d6b3f);
  color: #0b0a08; font-size: 2.6rem; font-weight: bold;
  display: flex; align-items: center; justify-content: center;
  border: 3px solid #d4af37;
  box-shadow: 0 0 25px rgba(212,175,55,0.3);
}
.identity { display: flex; flex-direction: column; gap: 4px; }
.eyebrow {
  font-family: 'Cinzel', serif;
  font-size: 0.7rem; letter-spacing: 3px;
  color: #d4af37; opacity: 0.8; text-transform: uppercase;
}
.identity h1 {
  font-family: 'Cinzel', serif;
  font-size: 1.7rem; margin: 0; color: #f1d98a;
}
.email { font-size: 0.95rem; opacity: 0.75; margin: 0; }
.badge {
  align-self: flex-start; margin-top: 4px;
  padding: 4px 14px; border-radius: 30px;
  font-size: 0.75rem; font-weight: 600; letter-spacing: 1px;
  background: rgba(212,175,55,0.15); color: #d4af37;
  border: 1px solid rgba(212,175,55,0.3); text-transform: uppercase;
}
.badge.admin { background: #8d6b3f; color: white; border-color: #8d6b3f; }

.hero-right {
  display: flex; align-items: center; gap: 14px;
  position: relative; flex-wrap: wrap;
}
.mini-stat {
  background: rgba(0,0,0,0.3);
  border: 1px solid #3a2f1d;
  border-radius: 12px;
  padding: 12px 18px;
  display: flex; flex-direction: column;
  min-width: 110px;
}
.mini-stat.highlight { border-color: #d4af37; }
.mini-label {
  font-size: 0.7rem; letter-spacing: 2px;
  color: #bba980; text-transform: uppercase;
}
.mini-value {
  font-family: 'Cinzel', serif;
  font-size: 1.1rem; color: #d4af37; font-weight: bold;
  margin-top: 4px;
}
.coin { display: flex; align-items: center; gap: 8px; }
.coin-icon {
  width: 22px; height: 22px; object-fit: contain;
  filter: drop-shadow(0 0 4px rgba(212,175,55,0.6));
}
.btn-logout {
  width: 46px; height: 46px;
  border-radius: 50%;
  background: transparent;
  color: #ff6b6b;
  border: 1px solid rgba(255,107,107,0.4);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.3s ease;
}
.btn-logout svg { width: 20px; height: 20px; }
.btn-logout:hover {
  background: rgba(255,107,107,0.1);
  border-color: #ff8a8a; transform: rotate(-10deg) scale(1.05);
  box-shadow: 0 0 18px rgba(255,107,107,0.25);
}

/* ====== DASHBOARD ====== */
.dashboard {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 22px;
  align-items: start;
}

/* ====== NAV LATERAL ====== */
.side-nav {
  display: flex; flex-direction: column; gap: 6px;
  background: linear-gradient(145deg, #16120c, #0e0a06);
  border: 1px solid #3a2f1d;
  border-radius: 16px; padding: 14px;
  position: sticky; top: 20px;
}
.nav-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; border-radius: 10px;
  background: transparent; border: 1px solid transparent;
  color: #bba980; cursor: pointer; text-align: left;
  font-family: 'Cinzel', serif; font-size: 0.9rem;
  letter-spacing: 1px; transition: all 0.25s ease;
  position: relative;
}
.nav-item:hover {
  background: rgba(212,175,55,0.06);
  color: #f1d98a;
}
.nav-item.active {
  background: linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05));
  border-color: rgba(212,175,55,0.4);
  color: #f1d98a;
  box-shadow: inset 0 0 20px rgba(212,175,55,0.08);
}
.nav-item.active::before {
  content: ''; position: absolute; left: -1px; top: 20%; bottom: 20%;
  width: 3px; background: #d4af37; border-radius: 4px;
}
.nav-icon { display: flex; }
.nav-icon :deep(svg) { width: 18px; height: 18px; }
.nav-label { flex: 1; }
.nav-count {
  background: rgba(212,175,55,0.15);
  color: #d4af37;
  border-radius: 20px;
  padding: 2px 9px; font-size: 0.75rem;
  font-family: 'Crimson Text', serif; font-weight: bold;
}

/* ====== PAINEL ====== */
.panel {
  background: linear-gradient(145deg, #16120c, #0e0a06);
  border: 1px solid #3a2f1d;
  border-radius: 16px;
  padding: 30px;
  min-height: 480px;
  position: relative; overflow: hidden;
}
.panel-inner { animation: fadeUp 0.4s ease both; }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.panel-head {
  display: flex; justify-content: space-between; align-items: baseline;
  margin-bottom: 26px; padding-bottom: 14px;
  border-bottom: 1px solid #3a2f1d;
}
.panel-head h2 {
  font-family: 'Cinzel', serif;
  color: #f1d98a; margin: 0; font-size: 1.5rem; letter-spacing: 1px;
}
.panel-sub {
  font-size: 0.85rem; color: #bba980;
  font-family: 'Cinzel', serif; letter-spacing: 1px;
}

/* swap transição entre abas */
.swap-enter-active, .swap-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.swap-enter-from { opacity: 0; transform: translateX(10px); }
.swap-leave-to   { opacity: 0; transform: translateX(-10px); }

/* ====== OVERVIEW ====== */
.overview-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px; margin-bottom: 28px;
}
.ov-card {
  background: rgba(0,0,0,0.25);
  border: 1px solid #3a2f1d;
  border-radius: 12px;
  padding: 22px 18px;
  display: flex; flex-direction: column; gap: 6px;
  transition: all 0.25s ease;
}
.ov-card:hover {
  border-color: #d4af37;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.4), 0 0 18px rgba(212,175,55,0.1);
}
.ov-num {
  font-family: 'Cinzel', serif;
  font-size: 1.6rem; color: #d4af37; font-weight: bold;
}
.ov-cap {
  font-size: 0.78rem; letter-spacing: 2px;
  color: #bba980; text-transform: uppercase;
}
.quick-info {
  background: rgba(0,0,0,0.2);
  border-left: 3px solid #d4af37;
  padding: 16px 20px; border-radius: 8px;
}
.quick-info h3 {
  font-family: 'Cinzel', serif;
  margin: 0 0 6px; color: #f1d98a; font-size: 1rem; letter-spacing: 1px;
}
.quick-info p { margin: 0; color: #d8c8a5; font-size: 1rem; }
.quick-info .muted { opacity: 0.6; font-style: italic; }

/* ====== ACCOUNT INFO ====== */
.info-list { display: flex; flex-direction: column; gap: 18px; }
.info-row {
  display: flex; justify-content: space-between; align-items: center;
  padding-bottom: 14px; border-bottom: 1px solid #3a2f1d;
}
.info-row:last-child { border-bottom: none; padding-bottom: 0; }
.label { opacity: 0.75; font-size: 1.05rem; }
.value {
  font-weight: 500; font-size: 1.1rem;
  display: flex; align-items: center; gap: 12px;
  color: #f1d98a;
}
.id-text {
  letter-spacing: 1px; min-width: 130px;
  display: inline-block; text-align: right;
}
.btn-toggle-id {
  background: none; border: none; cursor: pointer; padding: 0;
  display: flex; align-items: center; transition: transform 0.2s;
}
.btn-toggle-id svg { width: 22px; height: 22px; }
.btn-toggle-id:hover { transform: scale(1.15); }

/* ====== PURCHASES (scroll interno só desta aba) ====== */
.purchases-scroll {
  display: flex; flex-direction: column; gap: 18px;
  max-height: 540px; overflow-y: auto; padding-right: 6px;
}
.purchases-scroll::-webkit-scrollbar { width: 6px; }
.purchases-scroll::-webkit-scrollbar-thumb {
  background: rgba(212,175,55,0.3); border-radius: 4px;
}
.purchase-card {
  background: linear-gradient(145deg, #1a140d, #120d08);
  border: 1px solid #3a2f1d; border-radius: 14px; padding: 18px;
  transition: all 0.25s ease;
}
.purchase-card:hover {
  border-color: #d4af37; transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.4), 0 0 18px rgba(212,175,55,0.12);
}
.purchase-header {
  display: flex; justify-content: space-between; align-items: center;
  gap: 16px; margin-bottom: 14px;
}
.purchase-id {
  display: block; color: #f1d98a; font-family: 'Cinzel', serif;
  font-size: 0.95rem; margin-bottom: 4px;
}
.purchase-date { color: #bba980; font-size: 0.85rem; }
.purchase-status {
  padding: 6px 12px; border-radius: 30px; font-size: 0.72rem;
  font-weight: bold; text-transform: uppercase; letter-spacing: 1px;
}
.purchase-status.pending   { background: rgba(255,196,0,0.15); color: #ffd54f; }
.purchase-status.sent      { background: rgba(0,140,255,0.15); color: #6ec1ff; }
.purchase-status.delivered { background: rgba(0,255,136,0.12); color: #57ffb0; }

.purchase-products { display: flex; flex-direction: column; gap: 10px; }
.purchase-product {
  display: flex; align-items: center; gap: 12px;
  padding: 10px; border-radius: 10px;
  background: rgba(255,255,255,0.03);
}
.purchase-product img {
  width: 56px; height: 56px; object-fit: cover;
  border-radius: 8px; border: 1px solid #4a3922;
}
.purchase-product strong { display: block; margin-bottom: 4px; color: #f5e6c8; }
.purchase-product p { margin: 0; color: #bba980; font-size: 0.9rem; }
.purchase-footer {
  margin-top: 14px; padding-top: 12px;
  border-top: 1px solid #3a2f1d; text-align: right;
  color: #f1d98a; font-size: 1rem;
}

/* ====== ANIMALS ====== */
.animals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
  max-height: 540px; overflow-y: auto; padding-right: 6px;
}
.animals-grid::-webkit-scrollbar { width: 6px; }
.animals-grid::-webkit-scrollbar-thumb {
  background: rgba(212,175,55,0.3); border-radius: 4px;
}
.animal-card {
  background: linear-gradient(145deg, #1a140d, #120d08);
  border: 1px solid #3a2f1d; border-radius: 14px;
  padding: 12px; text-align: center;
  transition: all 0.25s ease;
}
.animal-card:hover {
  transform: translateY(-4px); border-color: #d4af37;
  box-shadow: 0 10px 25px rgba(0,0,0,0.4), 0 0 18px rgba(212,175,55,0.15);
}
.animal-image {
  width: 100%; height: 100px; object-fit: cover;
  border-radius: 10px; border: 1px solid #4a3922; margin-bottom: 8px;
}
.animal-name {
  display: block; color: #f5e6c8; font-size: 0.95rem;
  font-weight: 600; font-family: 'Cinzel', serif;
}
.empty {
  text-align: center; opacity: 0.6; padding: 40px 0;
  font-style: italic; font-size: 1.05rem;
}

/* ====== RESPONSIVO ====== */
@media (max-width: 860px) {
  .dashboard { grid-template-columns: 1fr; }
  .side-nav {
    flex-direction: row; overflow-x: auto; position: static;
    padding: 10px;
  }
  .nav-item { flex-shrink: 0; }
  .nav-item.active::before { display: none; }
  .nav-label { display: none; }
  .nav-icon :deep(svg) { width: 22px; height: 22px; }
}
@media (max-width: 600px) {
  .profile-hero { flex-direction: column; align-items: flex-start; }
  .hero-right { width: 100%; justify-content: space-between; }
  .mini-stat { min-width: 90px; padding: 10px 14px; }
}

/* ============ MODAL LOGOUT ============ */
.logout-overlay {
  position: fixed; inset: 0;
  background:
    radial-gradient(circle at 50% 30%, rgba(212,175,55,0.12), transparent 60%),
    rgba(8,5,3,0.85);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; padding: 20px;
}
.logout-modal {
  position: relative; width: 100%; max-width: 460px;
  background: linear-gradient(145deg, #1a1108 0%, #0e0905 100%);
  border: 1px solid rgba(212,175,55,0.3);
  border-radius: 6px; padding: 50px 40px 36px;
  text-align: center; color: #f5e6c8;
  box-shadow:
    0 30px 80px rgba(0,0,0,0.8),
    0 0 60px rgba(212,175,55,0.08),
    inset 0 0 40px rgba(212,175,55,0.04);
  overflow: hidden;
}
.logout-modal::before {
  content: ''; position: absolute; inset: 8px;
  border: 1px dashed rgba(212,175,55,0.2);
  border-radius: 4px; pointer-events: none;
}
.corner { position: absolute; width: 22px; height: 22px; border: 2px solid #d4af37; opacity: 0.8; }
.corner.tl { top: 14px; left: 14px;  border-right: none; border-bottom: none; }
.corner.tr { top: 14px; right: 14px; border-left: none;  border-bottom: none; }
.corner.bl { bottom: 14px; left: 14px;  border-right: none; border-top: none; }
.corner.br { bottom: 14px; right: 14px; border-left: none;  border-top: none; }

.seal {
  width: 70px; height: 70px; margin: 0 auto 18px;
  border-radius: 50%;
  background: radial-gradient(circle, #2a1a0c, #0e0905);
  border: 2px solid #d4af37;
  display: flex; align-items: center; justify-content: center;
  color: #d4af37;
  box-shadow: 0 0 25px rgba(212,175,55,0.35), inset 0 0 15px rgba(212,175,55,0.15);
  animation: pulseSeal 2.4s ease-in-out infinite;
}
.seal svg { width: 32px; height: 32px; }
@keyframes pulseSeal {
  0%,100% { box-shadow: 0 0 25px rgba(212,175,55,0.35), inset 0 0 15px rgba(212,175,55,0.15); }
  50%     { box-shadow: 0 0 40px rgba(212,175,55,0.55), inset 0 0 20px rgba(212,175,55,0.25); }
}
.modal-eyebrow {
  margin: 0 0 6px; font-size: 0.75rem; letter-spacing: 4px;
  text-transform: uppercase; color: #d4af37; opacity: 0.85;
  font-family: 'Cinzel', serif;
}
.modal-title {
  font-family: 'Cinzel', serif; font-size: 1.9rem; margin: 0 0 14px;
  color: #f1d98a; letter-spacing: 1px;
  text-shadow: 0 0 18px rgba(212,175,55,0.3);
}
.ornament {
  display: flex; align-items: center; justify-content: center;
  gap: 10px; margin: 0 auto 16px; width: 60%;
}
.ornament span:not(.diamond) {
  flex: 1; height: 1px;
  background: linear-gradient(90deg, transparent, #d4af37, transparent);
}
.diamond { color: #d4af37; font-size: 0.75rem; }
.modal-desc {
  margin: 0 0 28px; font-size: 1.05rem; line-height: 1.55;
  color: #d8c8a5; opacity: 0.9; padding: 0 8px;
}
.modal-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 8px; padding: 12px 22px; border-radius: 4px; cursor: pointer;
  font-family: 'Cinzel', serif; font-size: 0.85rem; letter-spacing: 1.5px;
  text-transform: uppercase;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  position: relative; overflow: hidden;
}
.btn svg { width: 16px; height: 16px; }
.btn.ghost {
  background: transparent; color: #f1d98a;
  border: 1px solid rgba(212,175,55,0.4);
}
.btn.ghost:hover {
  background: rgba(212,175,55,0.1);
  border-color: #d4af37; transform: translateY(-2px);
}
.btn.danger {
  background: linear-gradient(135deg, #7a1f1f, #4a1010);
  color: #ffd9d9;
  border: 1px solid rgba(255,77,77,0.5);
  box-shadow: 0 4px 18px rgba(255,77,77,0.2);
}
.btn.danger:hover {
  background: linear-gradient(135deg, #951f1f, #5a1010);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(255,77,77,0.4);
}
.btn.danger::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(120deg, transparent, rgba(255,255,255,0.15), transparent);
  transform: translateX(-100%); transition: transform 0.6s;
}
.btn.danger:hover::before { transform: translateX(100%); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.pop-enter-active { animation: popIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1); }
.pop-leave-active { animation: popIn 0.25s reverse ease-in; }
@keyframes popIn {
  from { opacity: 0; transform: translateY(20px) scale(0.92) rotateX(8deg); }
  to   { opacity: 1; transform: translateY(0) scale(1) rotateX(0); }
}

/* ====== EXPEDIÇÕES ====== */
.expeditions-scroll {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 540px;
  overflow-y: auto;
  padding-right: 6px;
}

.expeditions-scroll::-webkit-scrollbar {
  width: 6px;
}

.expeditions-scroll::-webkit-scrollbar-thumb {
  background: rgba(212,175,55,0.3);
  border-radius: 4px;
}

.expedition-card {
  background: linear-gradient(145deg, #1a140d, #120d08);
  border: 1px solid #3a2f1d;
  border-radius: 14px;
  padding: 16px;
  transition: all 0.25s ease;
}

.expedition-card:hover {
  transform: translateY(-4px);
  border-color: #d4af37;
  box-shadow: 0 10px 25px rgba(0,0,0,0.4), 0 0 18px rgba(212,175,55,0.15);
}

.expedition-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.expedition-title {
  font-family: 'Cinzel', serif;
  color: #f1d98a;
  font-size: 1rem;
}

.expedition-status {
  font-size: 0.7rem;
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(212,175,55,0.15);
  color: #d4af37;
  text-transform: uppercase;
}

.expedition-desc {
  color: #bba980;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.expedition-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #d8c8a5;
}
</style>