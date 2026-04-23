<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "../../services/api";

const users = ref<any[]>([]);
const selected = ref<any | null>(null);

const newUser = ref({
  name: "",
  email: "",
  password: ""
});

async function load() {
  const res = await api.get("/users");
  users.value = res.data;
}

onMounted(load);

async function create() {
  await api.post("/users", newUser.value);
  newUser.value = { name: "", email: "", password: "" };
  await load();
}

async function remove(id: string) {
  if (!confirm("Excluir usuário?")) return;
  await api.delete(`/users/${id}`);
  users.value = users.value.filter(u => u.id !== id);
}

function openEdit(user: any) {
  selected.value = { ...user };
}

async function saveEdit() {
  await api.put(`/users/${selected.value.id}`, selected.value);
  selected.value = null;
  await load();
}

async function makeAdmin(user: any) {
  await api.put(`/users/${user.id}`, { role: "admin" });
  await load();
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1>👑 Admin · Usuários</h1>
      <p class="subtitle">Gerencie os exploradores do reino jurássico</p>
    </div>

    <!-- CREATE -->
    <div class="form-card">
      <h2 class="form-title">✨ Novo Usuário</h2>
      <div class="form-grid">
        <input v-model="newUser.name" placeholder="Nome" />
        <input v-model="newUser.email" placeholder="Email" />
        <input v-model="newUser.password" type="password" placeholder="Senha" />
      </div>
      <button class="btn btn-primary" @click="create">Criar Usuário</button>
    </div>

    <!-- EDIT MODAL -->
    <transition name="fade">
      <div v-if="selected" class="modal-overlay" @click.self="selected = null">
        <div class="modal-card">
          <h2>✏️ Editando {{ selected.name }}</h2>
          <div class="form-grid">
            <input v-model="selected.name" placeholder="Nome" />
            <input v-model="selected.email" placeholder="Email" />
          </div>
          <div class="modal-actions">
            <button class="btn btn-ghost" @click="selected = null">Cancelar</button>
            <button class="btn btn-primary" @click="saveEdit">Salvar</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- LIST -->
    <div class="grid">
      <div v-for="user in users" :key="user.id" class="user-card">
        <div class="card-header">
          <div class="avatar">{{ user.name?.charAt(0)?.toUpperCase() || '?' }}</div>
          <div class="user-info">
            <h3>{{ user.name }}</h3>
            <p class="email">{{ user.email }}</p>
          </div>
        </div>

        <span class="role-badge" :class="user.role === 'admin' ? 'admin' : 'regular'">
          {{ user.role === 'admin' ? '👑 Admin' : 'Usuário' }}
        </span>

        <div class="actions">
          <button v-if="user.role !== 'admin'" class="btn btn-gold" @click="makeAdmin(user)">Admin</button>
          <button class="btn btn-edit" @click="openEdit(user)">Editar</button>
          <button class="btn btn-delete" @click="remove(user.id)">Excluir</button>
        </div>
      </div>
    </div>

    <p v-if="!users.length" class="empty">Nenhum usuário encontrado 🦴</p>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');

.page {
  padding: 40px 28px;
  min-height: 100vh;
  background:
    radial-gradient(circle at 50% 0%, rgba(212, 175, 55, 0.08) 0%, transparent 50%),
    linear-gradient(180deg, #0b0a08 0%, #1a140f 50%, #0d0b08 100%);
  color: #f5e6c8;
  font-family: 'Cinzel', serif;
}

.page-header {
  text-align: center;
  margin-bottom: 36px;
}

h1 {
  font-family: "Cinzel", serif;
  font-size: 2.4rem;
  letter-spacing: 2px;
  margin: 0 0 8px;
  background: linear-gradient(180deg, #f5e6c8, #d4af37);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-family: 'Crimson Text', serif;
  font-style: italic;
  color: rgba(212, 175, 55, 0.6);
  margin: 0;
}

/* ===== FORM CARD ===== */
.form-card {
  background: linear-gradient(170deg, rgba(26, 20, 15, 0.95), rgba(14, 11, 8, 0.98));
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 20px;
  padding: 28px;
  margin-bottom: 36px;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 16px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04);
}

.form-title {
  font-size: 1.1rem;
  letter-spacing: 1.5px;
  color: #d4af37;
  margin: 0 0 18px;
  text-transform: uppercase;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(0,0,0,0.35);
  border: 1.5px solid rgba(212, 175, 55, 0.18);
  border-radius: 12px;
  color: #f5e6c8;
  font-family: 'Crimson Text', serif;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

input::placeholder { color: rgba(212, 175, 55, 0.4); }

input:focus {
  outline: none;
  border-color: rgba(212, 175, 55, 0.6);
  background: rgba(0,0,0,0.5);
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

/* ===== BUTTONS ===== */
.btn {
  padding: 11px 18px;
  border-radius: 10px;
  border: 1px solid transparent;
  font-family: 'Cinzel', serif;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-primary {
  background: linear-gradient(135deg, #d4af37, #b8972e);
  color: #0f0c08;
  box-shadow: 0 6px 18px rgba(212, 175, 55, 0.25);
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(212, 175, 55, 0.35); }

.btn-ghost {
  background: rgba(212, 175, 55, 0.1);
  color: #d4af37;
  border-color: rgba(212, 175, 55, 0.25);
}
.btn-ghost:hover { background: rgba(212, 175, 55, 0.2); }

.btn-gold {
  flex: 1;
  background: rgba(212, 175, 55, 0.12);
  color: #d4af37;
  border-color: rgba(212, 175, 55, 0.3);
}
.btn-gold:hover { background: rgba(212, 175, 55, 0.25); transform: translateY(-2px); }

.btn-edit {
  flex: 1;
  background: rgba(245, 230, 200, 0.06);
  color: #f5e6c8;
  border-color: rgba(245, 230, 200, 0.15);
}
.btn-edit:hover { background: rgba(245, 230, 200, 0.12); transform: translateY(-2px); }

.btn-delete {
  flex: 1;
  background: rgba(255, 80, 80, 0.08);
  color: #ff8a8a;
  border-color: rgba(255, 80, 80, 0.25);
}
.btn-delete:hover { background: rgba(255, 80, 80, 0.18); transform: translateY(-2px); }

/* ===== MODAL ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modal-card {
  background: linear-gradient(170deg, #1a150e, #0d0b08);
  border: 1px solid rgba(212, 175, 55, 0.35);
  border-radius: 20px;
  padding: 32px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.8), 0 0 60px rgba(212, 175, 55, 0.08);
}

.modal-card h2 {
  font-size: 1.2rem;
  color: #d4af37;
  margin: 0 0 20px;
  letter-spacing: 1px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}
.modal-actions .btn { flex: 1; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ===== GRID ===== */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.user-card {
  background: linear-gradient(170deg, rgba(26, 20, 15, 0.95), rgba(14, 11, 8, 0.98));
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 18px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03);
}

.user-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #d4af37, transparent);
  opacity: 0.6;
}

.user-card:hover {
  transform: translateY(-6px);
  border-color: rgba(212, 175, 55, 0.4);
  box-shadow: 0 20px 40px rgba(0,0,0,0.6), 0 0 25px rgba(212, 175, 55, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d4af37, #b8972e);
  color: #0f0c08;
  font-weight: 700;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid rgba(212, 175, 55, 0.3);
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
}

.user-info h3 { margin: 0; font-size: 1.1rem; color: #f5e6c8; }
.email { margin: 4px 0 0; font-size: 0.85rem; color: rgba(245, 230, 200, 0.6); font-family: 'Crimson Text', serif; }

.role-badge {
  align-self: flex-start;
  padding: 5px 14px;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.role-badge.admin { background: rgba(212, 175, 55, 0.15); color: #d4af37; border: 1px solid rgba(212, 175, 55, 0.35); }
.role-badge.regular { background: rgba(245, 230, 200, 0.06); color: rgba(245, 230, 200, 0.7); border: 1px solid rgba(245, 230, 200, 0.12); }

.actions { display: flex; gap: 8px; margin-top: auto; }

.empty {
  text-align: center;
  color: rgba(245, 230, 200, 0.5);
  font-family: 'Crimson Text', serif;
  font-style: italic;
  margin-top: 40px;
}
</style>
