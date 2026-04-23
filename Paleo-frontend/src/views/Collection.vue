<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "../services/api";

const animals = ref<any[]>([]);

onMounted(async () => {
  try {
    const res = await api.get("/animals");
    animals.value = res.data;
    console.log(animals.value); // 🔍 debug
  } catch (error) {
    console.error("Erro ao buscar animais:", error);
  }
});
</script>

<template>
  <div class="page">
    <h1>🦖 Coleção de Animais</h1>

    <div v-if="animals.length === 0">
      <p>Nenhum animal encontrado...</p>
    </div>

    <div v-else class="grid">
      <div v-for="animal in animals" :key="animal.id" class="card">
        
        <!-- 🖼️ IMAGEM -->
        <img
          v-if="animal.image"
          :src="animal.image"
          alt="Imagem do animal"
          class="img"
        />

        <h2>{{ animal.name }}</h2>
        <p><strong>Tipo:</strong> {{ animal.type }}</p>
        <p><strong>Tamanho:</strong> {{ animal.size }}</p>
        <p><strong>Era:</strong> {{ animal.era?.name }}</p>
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

h1 {
  margin-bottom: 20px;
  font-family: 'Cinzel', serif;
  letter-spacing: 0.1em;
}

/* GRID */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

/* CARD estilo HOME */
.card {
  background: hsl(30, 18%, 8%);
  border: 1px solid hsl(36, 25%, 18%);
  padding: 16px;
  border-radius: 10px;
  transition: all 0.3s;
}

.card:hover {
  transform: translateY(-5px);
  border-color: hsl(36, 60%, 50%);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.6);
}

/* IMAGEM */
.img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
}

/* TEXTO */
p {
  margin: 5px 0;
  color: hsl(36, 20%, 65%);
}
</style>