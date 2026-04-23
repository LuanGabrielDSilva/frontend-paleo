<template>
  <div class="page">

    <h1>👑 Dashboard Geral</h1>
    <p class="subtitle">Visão em tempo real do sistema</p>

    <!-- LOADING -->
    <div v-if="loading" class="loading">
      Carregando dados do sistema...
    </div>

    <!-- CARDS -->
    <div v-else class="grid">

      <div class="card users">
        <h2>👥 Usuários</h2>
        <p>{{ animated.users }}</p>
      </div>

      <div class="card eras">
        <h2>🌍 Eras</h2>
        <p>{{ animated.eras }}</p>
      </div>

      <div class="card animals">
        <h2>🦖 Animais</h2>
        <p>{{ animated.animals }}</p>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import api from "../../services/api";

const loading = ref(true);

const stats = ref({
  users: 0,
  eras: 0,
  animals: 0
});

const animated = reactive({
  users: 0,
  eras: 0,
  animals: 0
});

/* ANIMA CONTAGEM */
function animateCount(key: "users" | "eras" | "animals") {
  let start = 0;
  const end = stats.value[key];

  const interval = setInterval(() => {
    start++;
    animated[key] = start;

    if (start >= end) {
      clearInterval(interval);
    }
  }, 40);
}

onMounted(async () => {
  try {
    const res = await api.get("/admin/stats");
    stats.value = res.data;

    animateCount("users");
    animateCount("eras");
    animateCount("animals");

  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.page {
  padding: 30px;
  min-height: 100vh;
  background: radial-gradient(circle at top, #1a1208, #0f0c08);
  color: #f5e6c8;
  font-family: "Cinzel", serif;
}

h1 {
  color: #d4af37;
  margin-bottom: 6px;
}

.subtitle {
  opacity: 0.7;
  margin-bottom: 25px;
}

/* LOADING */
.loading {
  color: #d4af37;
  font-size: 1.2rem;
}

/* GRID */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

/* CARDS */
.card {
  padding: 25px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(212, 175, 55, 0.2);
  text-align: center;
  transition: 0.3s;
  position: relative;
  overflow: hidden;
}

.card:hover {
  transform: translateY(-6px);
  border-color: rgba(212, 175, 55, 0.5);
}

/* brilho leve */
.card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top, rgba(212,175,55,0.1), transparent);
}

/* TITULO */
.card h2 {
  font-size: 1rem;
  margin-bottom: 10px;
  opacity: 0.9;
}

/* NUMERO */
.card p {
  font-size: 2.5rem;
  font-weight: bold;
  color: #d4af37;
}

/* CORES */
.users { border-left: 3px solid #4da3ff; }
.eras { border-left: 3px solid #d4af37; }
.animals { border-left: 3px solid #ff9f43; }
</style>