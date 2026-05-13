<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "../../services/api";

type Order = {
  id: string;
  total: number;
  status: string;
  created_at: string;

  user: {
    name: string;
    email: string;
  };

  items: {
    id: string;

    quantity: number;

    product: {
      name: string;
      image: string;
      price: number;
    };
  }[];
};

const orders = ref<Order[]>([]);

async function loadOrders() {
  const { data } = await api.get("/purchase-orders");

  orders.value = data;
}

async function updateStatus(id: string, status: string) {

  await api.put(
    `/purchase-orders/${id}/status`,
    { status }
  );

  await loadOrders();
}

onMounted(loadOrders);
</script>

<template>
  <div class="page">

    <h1>📦 Pedidos</h1>

    <div
      v-for="order in orders"
      :key="order.id"
      class="card"
    >

      <div class="top">

        <div>
          <h2>{{ order.user.name }}</h2>

          <p>{{ order.user.email }}</p>

          <small>
            {{ new Date(order.created_at)
              .toLocaleString("pt-BR") }}
          </small>
        </div>

        <div class="status-area">

          <span class="price">
            R$ {{ order.total.toFixed(2) }}
          </span>

          <select
            :value="order.status"
            @change="updateStatus(
              order.id,
              ($event.target as HTMLSelectElement).value
            )"
          >
            <option value="processing">
              Preparando
            </option>

            <option value="shipped">
              Chegando
            </option>

            <option value="delivered">
              Entregue
            </option>
          </select>

        </div>

      </div>

      <div class="items">

        <div
          v-for="item in order.items"
          :key="item.id"
          class="item"
        >

          <img
            :src="item.product.image"
            alt=""
          >

          <div>

            <strong>
              {{ item.product.name }}
            </strong>

            <p>
              Quantidade:
              {{ item.quantity }}
            </p>

          </div>

        </div>

      </div>

    </div>

  </div>
</template>

<style scoped>
.page {
  padding: 40px;
  min-height: 100vh;
  background: #0f0a06;
  color: #f5deb3;
}

h1 {
  margin-bottom: 30px;
}

.card {
  background: #1b140d;
  border: 1px solid #3d2b16;
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 20px;
}

.top {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.status-area {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.price {
  font-size: 20px;
  font-weight: bold;
  color: #d4af37;
}

select {
  padding: 10px;
  border-radius: 10px;
  border: none;
  background: #2a1e12;
  color: white;
}

.items {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item {
  display: flex;
  gap: 15px;
  align-items: center;
  background: #24180f;
  padding: 10px;
  border-radius: 10px;
}

.item img {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 10px;
}
</style>

