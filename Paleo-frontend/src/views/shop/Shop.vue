<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "../../services/api";

const products = ref([]);

const load = async () => {
  const { data } = await api.get("/products");
  products.value = data;
};

const add = async (id: string) => {
  await api.post("/cart/add", {
    productId: id,
    quantity: 1
  });
};

onMounted(load);
</script>

<template>
  <div>
    <h1>🛍️ Loja</h1>

    <div v-for="p in products" :key="p.id">
      <h3>{{ p.name }}</h3>
      <button @click="add(p.id)">Comprar</button>
    </div>
  </div>
</template>