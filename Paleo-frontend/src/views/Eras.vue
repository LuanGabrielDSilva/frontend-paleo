<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "../services/api";

const eras = ref<any[]>([]);

onMounted(async () => {
  try {
    const res = await api.get("/eras");
    eras.value = res.data;
  } catch (error) {
    console.error("Erro ao buscar eras:", error);
  }
});
</script>

<template>
  <div class="page">
    <h2>🌍 Eras Geológicas</h2>

    <div v-if="eras.length === 0">
      <p>Nenhuma era encontrada...</p>
    </div>

    <div v-else class="grid">
      <div v-for="e in eras" :key="e.id" class="card">

        <!-- 🖼️ IMAGEM -->
        <img
          v-if="e.image"
          :src="e.image"
          alt="Imagem da era"
          class="image"
        />

        <h3>{{ e.name }}</h3>
        <p>{{ e.description }}</p>

      </div>
    </div>
  </div>
</template>
<style scoped>
.page {
  min-height: 100vh;
  padding: 20px;
  background: hsl(30, 20%, 5%);
  color: hsl(36, 50%, 88%);
  text-align: center;
}

h2 {
  font-family: 'Cinzel', serif;
  letter-spacing: 0.1em;
  margin-bottom: 20px;
}

/* GRID */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

/* CARD estilo HOME */
.card {
  background: hsl(30, 18%, 8%);
  border: 1px solid hsl(36, 25%, 18%);
  padding: 16px;
  border-radius: 10px;
  text-align: center;
  transition: 0.3s;
}

.card:hover {
  transform: translateY(-5px);
  border-color: hsl(36, 60%, 50%);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.6);
}

/* IMAGEM */
.image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 10px;
}

p {
  color: hsl(36, 20%, 65%);
}
</style>