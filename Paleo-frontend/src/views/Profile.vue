<template>
  <div class="profile-page">
    <div class="container">

      <!-- HEADER -->
      <div class="profile-header">
        <div class="avatar-big">
          {{ userInitial }}
        </div>

        <div class="header-info">
          <h1>{{ user?.name || 'Nome não informado' }}</h1>

          <p class="email">
            {{ user?.email || 'Email não informado' }}
          </p>

          <span class="badge" :class="user?.role">
            {{
              user?.role === 'admin'
                ? 'Administrador'
                : 'Usuário'
            }}
          </span>
        </div>
      </div>

      <!-- WALLET -->
      <div class="wallet-section">

        <div class="wallet-card">
          <span class="wallet-label">
            Saldo em Conta
          </span>

          <span class="wallet-value">
            R$ {{ user?.balance?.toFixed(2) || '0,00' }}
          </span>
        </div>

        <div class="wallet-card highlight">
          <span class="wallet-label">
            Minhas Moedas
          </span>

          <span class="wallet-value coin">
            <img
              src="@/assets/moedaDoSite.png"
              alt="Moeda"
              class="coin-icon"
            />

            {{ user?.coins || 0 }}
          </span>
        </div>

      </div>

      <!-- INFO CARD -->
      <div class="card">

        <h2>Informações da Conta</h2>

        <div class="info-list">

          <!-- NOME -->
          <div class="info-row">
            <span class="label">
              Nome completo
            </span>

            <span class="value">
              {{ user?.name || '—' }}
            </span>
          </div>

          <!-- EMAIL -->
          <div class="info-row">
            <span class="label">
              Email
            </span>

            <span class="value">
              {{ user?.email || '—' }}
            </span>
          </div>

          <!-- ROLE -->
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

          <!-- ID -->
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
                :title="showId ? 'Esconder' : 'Mostrar'"
              >

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#d4af37"
                  stroke-width="2"
                >

                  <!-- OLHO FECHADO -->
                  <template v-if="showId">

                    <path
                      d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                    />

                    <line
                      x1="1"
                      y1="1"
                      x2="23"
                      y2="23"
                    />

                  </template>

                  <!-- OLHO ABERTO -->
                  <template v-else>

                    <path
                      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                    />

                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                    />

                  </template>

                </svg>

              </button>

            </span>

          </div>

        </div>

      </div>

      <!-- ANIMAIS -->
<div class="card">

  <h2>Animais Descobertos</h2>

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

  <div
  v-else
  class="empty-animals"
>
  Nenhum animal descoberto ainda.
</div>

</div>

      <!-- ACTIONS -->
      <div class="actions">

        <button
          class="btn-logout"
          @click="askLogout"
        >

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
            />

            <polyline
              points="16 17 21 12 16 7"
            />

            <line
              x1="21"
              y1="12"
              x2="9"
              y2="12"
            />
          </svg>

          Sair da Conta

        </button>

      </div>

    </div>

    <!-- MODAL LOGOUT -->
    <Teleport to="body">

      <Transition name="fade">

        <div
          v-if="showLogoutModal"
          class="logout-overlay"
          @click.self="cancelLogout"
        >

          <Transition
            name="pop"
            appear
          >

            <div
              v-if="showLogoutModal"
              class="logout-modal"
            >

              <span class="corner tl"></span>
              <span class="corner tr"></span>
              <span class="corner bl"></span>
              <span class="corner br"></span>

              <!-- SEAL -->
              <div class="seal">

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >

                  <path
                    d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                  />

                  <polyline
                    points="16 17 21 12 16 7"
                  />

                  <line
                    x1="21"
                    y1="12"
                    x2="9"
                    y2="12"
                  />

                </svg>

              </div>

              <p class="modal-eyebrow">
                — Encerramento de Sessão —
              </p>

              <h2 class="modal-title">
                Deixar a Expedição?
              </h2>

              <div class="ornament">
                <span></span>
                <span class="diamond">◆</span>
                <span></span>
              </div>

              <p class="modal-desc">
                Sua jornada pelo museu será pausada.
                Os fósseis aguardarão seu retorno
                no próximo acesso, paleontólogo.
              </p>

              <!-- BUTTONS -->
              <div class="modal-actions">

                <button
                  class="btn ghost"
                  @click="cancelLogout"
                >
                  <span>
                    Continuar Explorando
                  </span>
                </button>

                <button
                  class="btn danger"
                  @click="confirmLogout"
                >

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.2"
                  >

                    <path
                      d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                    />

                    <polyline
                      points="16 17 21 12 16 7"
                    />

                    <line
                      x1="21"
                      y1="12"
                      x2="9"
                      y2="12"
                    />

                  </svg>

                  <span>
                    Sim, Sair
                  </span>

                </button>

              </div>

            </div>

          </Transition>

        </div>

      </Transition>

    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()
const showId = ref(false)
const user = ref(null)
const favoriteAnimals = ref([])
const showLogoutModal = ref(false)

const loadUser = async () => {
  try {

    const [userRes, animalsRes] = await Promise.all([
      api.get('/me'),
      api.get('/animals')
    ])

    user.value = userRes.data

    localStorage.setItem(
      'user',
      JSON.stringify(userRes.data)
    )

    // favoritos salvos
    const savedFavorites = JSON.parse(
      localStorage.getItem('paleo-favorites') || '[]'
    )

    // filtra animais favoritos
    favoriteAnimals.value = animalsRes.data.filter(
      (animal) =>
        savedFavorites.includes(String(animal.id))
    )

  } catch (error) {
    console.log(error)
  }
}

const userInitial = computed(() => {
  if (!user.value?.name) return 'U'
  return user.value.name.charAt(0).toUpperCase()
})

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

onMounted(() => loadUser())
</script>

<style scoped>
.profile-page {
  background: #0b0a08;
  min-height: 100vh;
  color: #f5e6c8;
  padding: 50px 20px;
  font-family: 'Cormorant Garamond', serif;
}

.container { max-width: 700px; margin: 0 auto; }

.profile-header {
  display: flex; align-items: center; gap: 30px;
  margin-bottom: 40px; flex-wrap: wrap;
}
.avatar-big {
  width: 120px; height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d4af37, #8d6b3f);
  color: #0b0a08;
  font-size: 3.5rem; font-weight: bold;
  display: flex; align-items: center; justify-content: center;
  border: 5px solid #d4af37;
}
.header-info h1 {
  font-family: 'Cinzel', serif;
  font-size: 2.4rem; margin: 0 0 8px 0;
}
.email { font-size: 1.15rem; opacity: 0.85; margin: 0 0 12px 0; }
.badge {
  padding: 8px 20px; border-radius: 30px;
  font-size: 0.95rem; font-weight: 600;
}
.badge.admin { background: #8d6b3f; color: white; }

.wallet-section {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 20px; margin-bottom: 30px;
}
.wallet-card {
  background: #16120c;
  border: 1px solid #3a2f1d;
  padding: 25px; border-radius: 12px;
  display: flex; flex-direction: column; align-items: center;
  transition: transform 0.3s ease, border-color 0.3s;
}
.wallet-card:hover { transform: translateY(-5px); border-color: #d4af37; }
.wallet-card.highlight {
  border: 1px solid #d4af37;
  background: linear-gradient(145deg, #16120c, #1f1a12);
}
.wallet-label {
  font-size: 0.85rem; opacity: 0.7;
  text-transform: uppercase; letter-spacing: 1.5px;
  margin-bottom: 10px;
}
.wallet-value {
  font-family: 'Cinzel', serif;
  font-size: 1.6rem; color: #d4af37; font-weight: bold;
}

.card {
  background: #16120c; border: 1px solid #3a2f1d;
  border-radius: 12px; padding: 32px; margin-bottom: 30px;
}
.card h2 { color: #d4af37; font-family: 'Cinzel', serif; margin-bottom: 24px; }

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
}

.id-text {
  letter-spacing: 1px; min-width: 130px;
  display: inline-block; text-align: right;
}
.btn-toggle-id {
  background: none; border: none; cursor: pointer; padding: 0;
  display: flex; align-items: center; transition: transform 0.2s;
}
.btn-toggle-id svg { width: 24px; height: 24px; }
.btn-toggle-id:hover { transform: scale(1.15); }

.actions { text-align: center; margin-top: 30px; }

/* === BOTÃO LOGOUT REFINADO === */
.btn-logout {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 14px 36px;
  background: transparent;
  color: #ff6b6b;
  border: 1px solid rgba(255, 107, 107, 0.5);
  border-radius: 6px;
  font-size: 0.9rem; letter-spacing: 2px; text-transform: uppercase;
  font-family: 'Cinzel', serif;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative; overflow: hidden;
}
.btn-logout svg { width: 18px; height: 18px; }
.btn-logout:hover {
  background: rgba(255, 107, 107, 0.08);
  color: #ff8a8a;
  border-color: #ff8a8a;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255,107,107,0.2);
}

@media (max-width: 600px) {
  .wallet-section { grid-template-columns: 1fr; }
}

.coin {
  display: flex; align-items: center; gap: 10px; justify-content: center;
}
.coin-icon {
  width: 26px; height: 26px; object-fit: contain;
  filter: drop-shadow(0 0 4px rgba(212, 175, 55, 0.6));
}

/* ============================
   MODAL DE LOGOUT
============================ */
.logout-overlay {
  position: fixed; inset: 0;
  background:
    radial-gradient(circle at 50% 30%, rgba(212,175,55,0.12), transparent 60%),
    rgba(8, 5, 3, 0.85);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999;
  font-family: 'Cormorant Garamond', serif;
  padding: 20px;
}

.logout-modal {
  position: relative;
  width: 100%; max-width: 460px;
  background: linear-gradient(145deg, #1a1108 0%, #0e0905 100%);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 6px;
  padding: 50px 40px 36px;
  text-align: center;
  color: #f5e6c8;
  box-shadow:
    0 30px 80px rgba(0,0,0,0.8),
    0 0 60px rgba(212,175,55,0.08),
    inset 0 0 40px rgba(212,175,55,0.04);
  overflow: hidden;
}
.logout-modal::before {
  content: ''; position: absolute; inset: 8px;
  border: 1px dashed rgba(212, 175, 55, 0.2);
  border-radius: 4px; pointer-events: none;
}

.corner {
  position: absolute; width: 22px; height: 22px;
  border: 2px solid #d4af37; opacity: 0.8;
}
.corner.tl { top: 14px; left: 14px; border-right: none; border-bottom: none; }
.corner.tr { top: 14px; right: 14px; border-left: none; border-bottom: none; }
.corner.bl { bottom: 14px; left: 14px; border-right: none; border-top: none; }
.corner.br { bottom: 14px; right: 14px; border-left: none; border-top: none; }

.seal {
  width: 70px; height: 70px; margin: 0 auto 18px;
  border-radius: 50%;
  background: radial-gradient(circle, #2a1a0c, #0e0905);
  border: 2px solid #d4af37;
  display: flex; align-items: center; justify-content: center;
  color: #d4af37;
  box-shadow:
    0 0 25px rgba(212,175,55,0.35),
    inset 0 0 15px rgba(212,175,55,0.15);
  animation: pulseSeal 2.4s ease-in-out infinite;
}
.seal svg { width: 32px; height: 32px; }
@keyframes pulseSeal {
  0%,100% { box-shadow: 0 0 25px rgba(212,175,55,0.35), inset 0 0 15px rgba(212,175,55,0.15); }
  50%     { box-shadow: 0 0 40px rgba(212,175,55,0.55), inset 0 0 20px rgba(212,175,55,0.25); }
}

.modal-eyebrow {
  margin: 0 0 6px;
  font-size: 0.75rem; letter-spacing: 4px;
  text-transform: uppercase;
  color: #d4af37; opacity: 0.85;
  font-family: 'Cinzel', serif;
}
.modal-title {
  font-family: 'Cinzel', serif;
  font-size: 1.9rem; margin: 0 0 14px;
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
  margin: 0 0 28px;
  font-size: 1.05rem; line-height: 1.55;
  color: #d8c8a5; opacity: 0.9; padding: 0 8px;
}
.modal-actions {
  display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;
}
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 8px; padding: 12px 22px;
  border-radius: 4px; cursor: pointer;
  font-family: 'Cinzel', serif;
  font-size: 0.85rem; letter-spacing: 1.5px;
  text-transform: uppercase;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  position: relative; overflow: hidden;
}
.btn svg { width: 16px; height: 16px; }
.btn.ghost {
  background: transparent; color: #f1d98a;
  border: 1px solid rgba(212, 175, 55, 0.4);
}
.btn.ghost:hover {
  background: rgba(212, 175, 55, 0.1);
  border-color: #d4af37; transform: translateY(-2px);
}
.btn.danger {
  background: linear-gradient(135deg, #7a1f1f, #4a1010);
  color: #ffd9d9;
  border: 1px solid rgba(255, 77, 77, 0.5);
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

/* =========================
   ANIMAIS
========================= */

.animals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 18px;
  margin-top: 20px;
}

.animal-card {
  background: linear-gradient(145deg, #1a140d, #120d08);
  border: 1px solid #3a2f1d;
  border-radius: 14px;
  padding: 14px;
  text-align: center;
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}

.animal-card:hover {
  transform: translateY(-5px);
  border-color: #d4af37;
  box-shadow:
    0 10px 25px rgba(0,0,0,0.4),
    0 0 18px rgba(212,175,55,0.15);
}

.animal-image {
  width: 100%;
  height: 110px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #4a3922;
  margin-bottom: 10px;
}

.animal-name {
  display: block;
  color: #f5e6c8;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Cinzel', serif;
}

.empty-animals {
  text-align: center;
  opacity: 0.7;
  padding: 20px 0;
  font-size: 1.05rem;
}

</style>
