<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "../services/api";

const cart = ref<any>(null);

const loadCart = async () => {
  const { data } = await api.get("/cart");
  cart.value = data;
};

const removeItem = async (id: string) => {
  await api.post("/cart/remove", { id });
  loadCart();
};

onMounted(loadCart);
</script>

<template>
  <div class="cart">
    <h1>🛒 Carrinho</h1>

    <div v-if="!cart?.items?.length">
      Carrinho vazio 😢
    </div>

    <div v-else>
      <div v-for="item in cart.items" :key="item.id">
        <span>{{ item.product.name }}</span>
        <span>x{{ item.quantity }}</span>

        <button @click="removeItem(item.id)">
          ❌
        </button>
      </div>
    </div>
  </div>
</template>