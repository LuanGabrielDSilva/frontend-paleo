<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "../../services/api";

const eras = ref<any[]>([]);
const selected = ref<any | null>(null);

const newEra = ref({ name: "", description: "", image: "" });

const deleteModal = ref({
  isOpen: false,
  eraId: null as string | null,
  eraName: "",
  isDeleting: false
});

async function load() {
  const res = await api.get("/eras");

  // 🔥 ORDENAÇÃO DAS ERAS AQUI
  const order = ["Paleozoico", "Mesozoico", "Cenozoico"];

  eras.value = res.data.sort((a: any, b: any) => {
    return order.indexOf(a.name) - order.indexOf(b.name);
  });
}

onMounted(load);

async function create() {
  await api.post("/eras", newEra.value);
  newEra.value = { name: "", description: "", image: "" };
  await load();
}

function openDeleteModal(id: string, name: string) {
  deleteModal.value = {
    isOpen: true,
    eraId: id,
    eraName: name,
    isDeleting: false
  };
}

function closeDeleteModal() {
  deleteModal.value.isOpen = false;
  setTimeout(() => {
    deleteModal.value.eraId = null;
    deleteModal.value.eraName = "";
    deleteModal.value.isDeleting = false;
  }, 300);
}

async function confirmDelete() {
  if (!deleteModal.value.eraId) return;

  deleteModal.value.isDeleting = true;

  try {
    await api.delete(`/eras/${deleteModal.value.eraId}`);
    eras.value = eras.value.filter(e => e.id !== deleteModal.value.eraId);
    closeDeleteModal();
  } catch (err) {
    console.error(err);
    deleteModal.value.isDeleting = false;
  }
}

function openEdit(era: any) {
  selected.value = { ...era };
}

async function saveEdit() {
  await api.put(`/eras/${selected.value.id}`, selected.value);
  selected.value = null;
  await load();
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1>🌍 Admin · Eras</h1>
      <p class="subtitle">Gerencie as eras geológicas do mundo perdido</p>
    </div>

    <!-- CREATE -->
    <div class="form-card">
      <h2 class="form-title">🪨 Nova Era</h2>
      <div class="form-grid">
        <input v-model="newEra.name" placeholder="Nome (ex: Jurássico)" />
        <input v-model="newEra.description" placeholder="Descrição" />
        <input v-model="newEra.image" placeholder="URL da imagem" />
      </div>
      <button class="btn btn-primary" @click="create"> ✦ Criar Era</button>
    </div>

    <!-- EDIT MODAL -->
    <transition name="fade">
  <div v-if="selected" class="modal-overlay" @click.self="selected = null">

    <div class="modal-pro">

      <!-- HEADER -->
      <div class="modal-header">
        <h2>Editar Era</h2>
        <button class="close-btn" @click="selected = null">✕</button>
      </div>

      <!-- BODY -->
      <div class="modal-body">

        <div class="form-group">
          <label>Nome</label>
          <input v-model="selected.name" placeholder="Nome da era" />
        </div>

        <div class="form-group">
          <label>Descrição</label>
          <input v-model="selected.description" placeholder="Descrição" />
        </div>

        <div class="form-group">
          <label>Imagem</label>
          <input v-model="selected.image" placeholder="URL da imagem" />
        </div>

        <!-- PREVIEW -->
        <div v-if="selected.image" class="preview">
          <img :src="selected.image" />
        </div>

      </div>

      <!-- FOOTER -->
      <div class="modal-footer">
        <button class="btn cancel" @click="selected = null">
          Cancelar
        </button>

        <button class="btn save" @click="saveEdit">
          💾 Salvar Alterações
        </button>
      </div>

    </div>

  </div>
</transition>

    <!-- LIST -->
    <div class="grid">
      <div v-for="e in eras" :key="e.id" class="era-card">

        <!-- ✅ IMAGEM -->
        <img v-if="e.image" :src="e.image" class="era-img" />
        <div v-else class="era-icon">🌋</div>

        <h3>{{ e.name }}</h3>
        <p class="desc">{{ e.description || 'Sem descrição' }}</p>

        <div class="actions">
          <button class="btn btn-edit" @click="openEdit(e)">Editar</button>
          <button class="btn btn-delete" @click="openDeleteModal(e.id, e.name)">
            Excluir
          </button>
        </div>
      </div>
    </div>

    <p v-if="!eras.length" class="empty">Nenhuma era encontrada 🦴</p>

    <Transition name="fade-scale">
  <div v-if="deleteModal.isOpen" class="confirm-overlay" @click.self="closeDeleteModal">
    <div class="confirm-modal">

      <div class="confirm-header">
        <div class="confirm-icon">⚠️</div>
        <h3>Confirmar Exclusão</h3>
      </div>

      <div class="confirm-body">
        <p>Deseja excluir a era:</p>

        <strong>{{ deleteModal.eraName }}</strong>

        <p class="confirm-warning">
          Essa ação não pode ser desfeita.
        </p>
      </div>

      <div class="confirm-actions">
        <button class="btn-cancel" @click="closeDeleteModal">
          Cancelar
        </button>

        <button class="btn-delete" @click="confirmDelete">
          🗑️ Excluir
        </button>
      </div>

    </div>
  </div>
</Transition>
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

.page-header { text-align: center; margin-bottom: 36px; }

h1 {
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

/* ===== FORM ===== */
.form-card {
  background: linear-gradient(170deg, rgba(26, 20, 15, 0.95), rgba(14, 11, 8, 0.98));
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 20px;
  padding: 28px;
  margin: 0 auto 36px;
  max-width: 900px;
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
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  z-index: 100; padding: 20px;
}
.modal-card {
  background: linear-gradient(170deg, #1a150e, #0d0b08);
  border: 1px solid rgba(212, 175, 55, 0.35);
  border-radius: 20px;
  padding: 32px;
  width: 100%; max-width: 480px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.8), 0 0 60px rgba(212, 175, 55, 0.08);
}
.modal-card h2 { font-size: 1.2rem; color: #d4af37; margin: 0 0 20px; letter-spacing: 1px; }
.modal-actions { display: flex; gap: 12px; margin-top: 8px; }
.modal-actions .btn { flex: 1; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ===== GRID ===== */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.era-card {
  background: linear-gradient(170deg, rgba(26, 20, 15, 0.95), rgba(14, 11, 8, 0.98));
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 16px;
  padding: 28px 24px;
  text-align: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.era-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #d4af37, transparent);
  opacity: 0.6;
}

.era-card:hover {
  transform: translateY(-6px);
  border-color: rgba(212, 175, 55, 0.4);
  box-shadow: 0 20px 40px rgba(0,0,0,0.6), 0 0 25px rgba(212, 175, 55, 0.1);
}

.era-icon { font-size: 2.5rem; }

.era-card h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #f5e6c8;
  letter-spacing: 1px;
}

.desc {
  font-family: 'Crimson Text', serif;
  font-style: italic;
  color: rgba(245, 230, 200, 0.6);
  font-size: 0.9rem;
  margin: 0;
  flex: 1;
}

.actions { display: flex; gap: 8px; margin-top: 8px; }

.empty {
  text-align: center;
  color: rgba(245, 230, 200, 0.5);
  font-family: 'Crimson Text', serif;
  font-style: italic;
  margin-top: 40px;
}

.era-img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 10px;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

/* ===== MODAL PRO ===== */
.modal-pro {
  width: 100%;
  max-width: 600px;
  background: linear-gradient(170deg, #1a150e, #0d0b08);
  border-radius: 20px;
  border: 1px solid rgba(212, 175, 55, 0.3);
  overflow: hidden;
  box-shadow:
    0 30px 80px rgba(0,0,0,0.9),
    0 0 50px rgba(212, 175, 55, 0.08);
}

/* HEADER */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #d4af37;
}

.close-btn {
  background: none;
  border: none;
  color: #f5e6c8;
  font-size: 1.2rem;
  cursor: pointer;
}

/* BODY */
.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.75rem;
  color: rgba(245, 230, 200, 0.6);
  letter-spacing: 1px;
  text-transform: uppercase;
}


/* PREVIEW */
.preview img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

/* FOOTER */
.modal-footer {
  display: flex;
  gap: 10px;
  padding: 20px 24px;
  border-top: 1px solid rgba(212, 175, 55, 0.2);
}
.modal-footer .btn {
  flex: 1;
}

/* MODAL CLEAN */
.modal-clean {
  width: 100%;
  max-width: 480px;
  background: #14110c;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.7);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* TÍTULO */
.modal-clean h2 {
  font-size: 1.2rem;
  color: #e6d3a3;
  margin: 0;
}

/* FORM */
.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form input {
  padding: 10px 12px;
  border-radius: 8px;
  border: none;
  background: #1f1a14;
  color: #f5e6c8;
  font-size: 0.9rem;
}

.form input::placeholder {
  color: rgba(255,255,255,0.3);
}

/* PREVIEW */
.preview {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 8px;
  margin-top: 6px;
}

/* AÇÕES */
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn {
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
}

/* BOTÕES */
.btn.cancel {
  background: transparent;
  color: #aaa;
}

.btn.save {
  background: #d4af37;
  color: #0f0c08;
}
.btn.save:hover {
  background: #c39d2e;
}

/* =========================
   CONFIRM DELETE MODAL (ERAS)
========================= */

.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  padding: 20px;
}

.confirm-modal {
  width: 100%;
  max-width: 420px;
  background: linear-gradient(160deg, #1a150e, #0b0a08);
  border: 1px solid rgba(212,175,55,0.25);
  border-radius: 20px;
  overflow: hidden;
  box-shadow:
    0 30px 80px rgba(0,0,0,0.9),
    0 0 60px rgba(212,175,55,0.08),
    inset 0 1px 0 rgba(212,175,55,0.1);
  animation: confirmSlideUp 0.4s cubic-bezier(.2,.9,.3,1.2);
}

@keyframes confirmSlideUp {
  from {
    transform: translateY(40px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

/* HEADER */
.confirm-header {
  padding: 26px 24px 16px;
  text-align: center;
  background: linear-gradient(180deg, rgba(255,80,80,0.08), transparent);
  border-bottom: 1px solid rgba(255,80,80,0.15);
}

.confirm-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto 12px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  background: rgba(255,80,80,0.12);
  border: 2px solid rgba(255,80,80,0.3);
  box-shadow: 0 0 30px rgba(255,80,80,0.2);
  animation: pulseWarning 2s infinite;
}

@keyframes pulseWarning {
  0%,100% { box-shadow: 0 0 25px rgba(255,80,80,0.2); }
  50% { box-shadow: 0 0 50px rgba(255,80,80,0.4); }
}

.confirm-header h3 {
  margin: 0;
  font-size: 1.2rem;
  letter-spacing: 2px;
  color: #ff8a8a;
}

/* BODY */
.confirm-body {
  padding: 22px 26px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.confirm-body p {
  margin: 0;
  font-size: 0.95rem;
  color: rgba(245,230,200,0.7);
}

.confirm-body strong {
  display: block;
  font-size: 1.1rem;
  color: #d4af37;
  font-family: 'Cinzel', serif;
  letter-spacing: 1px;
  padding: 10px;
  border-radius: 10px;
  background: rgba(212,175,55,0.08);
  border: 1px solid rgba(212,175,55,0.2);
}

.confirm-warning {
  font-size: 0.8rem;
  font-style: italic;
  color: rgba(255,138,138,0.7);
  background: rgba(255,80,80,0.06);
  border: 1px solid rgba(255,80,80,0.15);
  padding: 10px 14px;
  border-radius: 10px;
}

/* ACTIONS */
.confirm-actions {
  display: flex;
  gap: 12px;
  padding: 0 24px 24px;
}

.btn-cancel {
  flex: 1;
  padding: 13px;
  border-radius: 12px;
  background: transparent;
  border: 1px solid rgba(245,230,200,0.25);
  color: rgba(245,230,200,0.8);
  font-size: 0.75rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: 0.25s;
}

.btn-cancel:hover {
  background: rgba(245,230,200,0.08);
  border-color: rgba(245,230,200,0.4);
}

.btn-delete {
  flex: 1.3;
  padding: 13px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #ff5a5a, #c73e3e);
  color: white;
  font-size: 0.75rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: 0.25s;
  box-shadow: 0 6px 20px rgba(255,90,90,0.3);
}

.btn-delete:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(255,90,90,0.5);
}

/* TRANSITION */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
}

.fade-scale-enter-from .confirm-modal,
.fade-scale-leave-to .confirm-modal {
  transform: scale(0.95) translateY(20px);
}
</style>
