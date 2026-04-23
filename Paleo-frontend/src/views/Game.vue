<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "../services/api";

const animals = ref<any[]>([]);
const cards = ref<any[]>([]);
const flipped = ref<any[]>([]);
const matched = ref<any[]>([]);
const attempts = ref(0);
const startTime = ref(0);

// 🔥 busca animais do backend
onMounted(async () => {
  const res = await api.get("/animals");
  animals.value = res.data;
});

// 🎲 função de embaralhar (Fisher-Yates)
function shuffleArray(array: any[]) {
  const newArray = [...array];

  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }

  return newArray;
}

// 🎮 iniciar jogo
function startGame(difficulty: number) {

  // ⚠️ evita erro com poucos animais
  if (animals.value.length < difficulty) {
    alert("Não há animais suficientes para esse nível 😢");
    return;
  }

  // 🔥 embaralha antes de selecionar
  const shuffledAnimals = shuffleArray(animals.value);

  // pega quantidade baseada na dificuldade
  const selected = shuffledAnimals.slice(0, difficulty);

  // duplica pares
  const duplicated = [...selected, ...selected];

  // embaralha cartas
  cards.value = shuffleArray(
    duplicated.map(card => ({
      ...card,
      uuid: Math.random(),
      flipped: false
    }))
  );

  // reset
  flipped.value = [];
  matched.value = [];
  attempts.value = 0;
  startTime.value = Date.now();
}

// 🧠 lógica de virar carta
function flipCard(card: any) {
  if (card.flipped || flipped.value.length === 2) return;

  card.flipped = true;
  flipped.value.push(card);

  if (flipped.value.length === 2) {
    attempts.value++;

    const [c1, c2] = flipped.value;

    if (c1.id === c2.id) {
      matched.value.push(c1.id);
      flipped.value = [];

      if (matched.value.length === cards.value.length / 2) {
        const time = (Date.now() - startTime.value) / 1000;
        alert(`Você venceu! Tempo: ${time}s | Tentativas: ${attempts.value}`);
      }
    } else {
      setTimeout(() => {
        c1.flipped = false;
        c2.flipped = false;
        flipped.value = [];
      }, 800);
    }
  }
}
</script>

<template>
  <div>
    <h2>🎮 Jogo da Memória</h2>

    <button @click="startGame(4)">Fácil</button>
    <button @click="startGame(8)">Médio</button>
    <button @click="startGame(12)">Difícil</button>

    <p>Tentativas: {{ attempts }}</p>

    <div class="grid">
      <div 
        v-for="card in cards" 
        :key="card.uuid" 
        @click="flipCard(card)" 
        class="card"
      >
        <span v-if="card.flipped || matched.includes(card.id)">
          {{ card.name }}
        </span>
        <span v-else>❓</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(4, 90px);
  gap: 10px;
  justify-content: center;
}

.card {
  height: 90px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #3498db;
  color: white;
  cursor: pointer;
  border-radius: 8px;
  font-size: 12px;
  text-align: center;
}
</style>