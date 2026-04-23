<script setup lang="ts">
import { ref } from "vue";
import api from "../services/api";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");

const router = useRouter();

async function handleLogin() {
  try {
    const response = await api.post("/session", {
      email: email.value,
      password: password.value
    });

    const user = response.data;

    // 💾 salvar login
    localStorage.setItem("token", user.token);
    localStorage.setItem("user", JSON.stringify(user));

    // 👑 REDIRECIONAMENTO POR ROLE
    if (user.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/home");
    }

  } catch (err: any) {
    console.log(err);
    alert(err.response?.data?.error || "Erro ao logar");
  }
}
</script>

<template>
  <div>
    <h2>Login</h2>

    <form @submit.prevent="handleLogin">
      <input v-model="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Senha" />

      <button type="submit">Entrar</button>
    </form>
  </div>
</template>