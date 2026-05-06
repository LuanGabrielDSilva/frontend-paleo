<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";
import video from "@/assets/video.mp4";

const router = useRouter();

const name = ref("");
const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

const formValido = computed(() => {
  return (
    name.value.trim().length >= 3 &&
    email.value.includes("@") &&
    email.value.includes(".") &&
    password.value.length >= 6
  );
});

async function handleRegister() {
  if (!formValido.value || loading.value) return;

  error.value = "";
  loading.value = true;

  try {
    await api.post("/users", {
      name: name.value.trim(),
      email: email.value.trim().toLowerCase(),
      password: password.value,
    });

    // Sucesso - redireciona para login
    router.push("/");
  } catch (err: any) {
    error.value =
      err.response?.data?.error ||
      err.response?.data?.message ||
      "Erro ao realizar o cadastro. Tente novamente.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="container">
    <div class="left">
      <div class="card">
        <h1 class="title">
          Cadastro
          <span class="title-line"></span>
        </h1>

        <div class="field">
          <label for="name">Nome completo</label>
          <input
            id="name"
            v-model="name"
            type="text"
            placeholder="Seu nome"
            autocomplete="name"
            :disabled="loading"
          />
        </div>

        <div class="field">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="seu@email.com"
            autocomplete="email"
            :disabled="loading"
          />
        </div>

        <div class="field">
          <label for="password">Senha</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            autocomplete="new-password"
            :disabled="loading"
          />
        </div>

        <button
          :disabled="!formValido || loading"
          @click="handleRegister"
          class="btn-register"
        >
          {{ loading ? "Cadastrando..." : "Criar conta" }}
        </button>

        <p v-if="error" class="error">{{ error }}</p>

        <div class="login-area">
          <p>Já tem uma conta?</p>
          <button @click="router.push('/')" class="btn-link">
            Entrar
          </button>
        </div>
      </div>
    </div>

    <div class="right">
      <video
        autoplay
        loop
        muted
        playsinline
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
        class="bg-video"
      >
        <source :src="video" type="video/mp4" />
      </video>
      <div class="overlay"></div>
    </div>
  </div>
</template>

<style scoped>
.container {
  position: fixed;
  inset: 0;
  display: flex;
  background: #0b0a08;
  color: #f5e6c8;
  font-family: 'Cinzel', serif;
  overflow: hidden;
}

.left {
  width: 45%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(6px);
}

.card {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.title {
  font-size: 42px;
  margin-bottom: 8px;
}

.title-line {
  display: block;
  width: 110px;
  height: 3px;
  margin-top: 10px;
  background: linear-gradient(90deg, #c6a46c, #8d6b3f);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-size: 14px;
  opacity: 0.9;
}

input {
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid #3a2f1d;
  background: #16120c;
  color: #f5e6c8;
  font-size: 16px;
  transition: border 0.3s;
}

input:focus {
  outline: none;
  border-color: #c6a46c;
}

.btn-register {
  padding: 15px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(90deg, #c6a46c, #8d6b3f);
  color: #0b0a08;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  margin-top: 8px;
  transition: all 0.3s;
}

.btn-register:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(198, 164, 108, 0.3);
}

.btn-register:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error {
  color: #ff6b6b;
  font-size: 14px;
  text-align: center;
  min-height: 20px;
}

.login-area {
  text-align: center;
  margin-top: 12px;
}

.login-area p {
  margin-bottom: 8px;
  opacity: 0.8;
}

.btn-link {
  background: none;
  border: none;
  color: #c6a46c;
  font-size: 16px;
  cursor: pointer;
  text-decoration: underline;
  padding: 4px 8px;
}

.btn-link:hover {
  color: #e8d0a0;
}

/* === Right Side - Video === */
.right {
  width: 55%;
  position: relative;
  overflow: hidden;
}

.bg-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(11, 10, 8, 0.35);
}

/* Responsividade básica */
@media (max-width: 1024px) {
  .left {
    width: 100%;
  }
  .right {
    display: none;
  }
}
</style>