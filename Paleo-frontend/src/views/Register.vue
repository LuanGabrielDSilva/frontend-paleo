<script setup lang="ts">
import { ref } from "vue";
import api from "../services/api";
import { useRouter } from "vue-router";

const name = ref("");
const email = ref("");
const password = ref("");

const router = useRouter();

async function handleRegister() {
  try {
    await api.post("/users", {
      name: name.value,
      email: email.value,
      password: password.value
    });

    alert("Conta criada com sucesso!");

    // 🔥 volta pro login
    router.push("/");

  } catch (err: any) {
    alert(err.response?.data?.error || "Erro ao cadastrar");
  }
}
</script>

<template>
  <div>
    <h2>Cadastro</h2>

    <form @submit.prevent="handleRegister">
      <input v-model="name" placeholder="Nome" />
      <input v-model="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Senha" />

      <button type="submit">Cadastrar</button>
    </form>
  </div>
</template>