<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "../../services/api";

/* =========================
   STATE
========================= */
const animals = ref<any[]>([]);
const eras = ref<any[]>([]);
const periodos = ref<any[]>([]);
const selected = ref<any | null>(null);

const selectedEra = ref("");

/* =========================
   DIETAS
========================= */
const dietas = [
  "Carnívoro",
  "Herbívoro",
  "Onívoro",
  "Insetívoro",
  "Piscívoro"
];

/* =========================
   FORM
========================= */
const newAnimal = ref({
  name: "",
  size: "",
  image: "",
  dieta: "",
  periodoId: ""
});

/* =========================
   LOAD
========================= */
async function load() {
  const [animalsRes, erasRes, periodosRes] = await Promise.all([
    api.get("/animals"),
    api.get("/eras"),
    api.get("/periodos")
  ]);

  animals.value = animalsRes.data;
  eras.value = erasRes.data;
  periodos.value = periodosRes.data;
}

onMounted(load);

/* =========================
   FILTER
========================= */
function getPeriodosByEra(eraId: string) {
  return periodos.value.filter(p => p.eraId === eraId);
}

/* =========================
   CREATE
========================= */
async function create() {
  try {
    const payload = {
      name: newAnimal.value.name,
      size: newAnimal.value.size,
      image: newAnimal.value.image,
      dieta: newAnimal.value.dieta,
      periodoId: newAnimal.value.periodoId || null,
      eraId: selectedEra.value || null
    };

    console.log("📦 payload enviado:", payload);

    await api.post("/animals", payload);

    newAnimal.value = {
      name: "",
      size: "",
      image: "",
      dieta: "",
      periodoId: ""
    };

    selectedEra.value = null;

    await load();

  } catch (err: any) {
    console.error("❌ erro ao criar animal:", err?.response?.data || err);
    alert("Erro ao criar animal (ver console)");
  }
}

/* =========================
   DELETE
========================= */
async function remove(id: string) {
  if (!confirm("Excluir animal?")) return;
  await api.delete(`/animals/${id}`);
  animals.value = animals.value.filter(a => a.id !== id);
}

/* =========================
   EDIT
========================= */
function openEdit(animal: any) {
  selected.value = { ...animal };
}

async function saveEdit() {
  await api.put(`/animals/${selected.value.id}`, selected.value);
  selected.value = null;
  await load();
}
</script>

<template>
  <div class="page">

    <!-- HEADER -->
    <header class="page-header">
      <h1>🦖 Admin · Animais</h1>
      <p>Catalogue criaturas pré-históricas</p>
    </header>

    <!-- FORM -->
    <section class="form-card">
  <div class="form-header">
    <div class="form-icon">🦖</div>
    <div>
      <h2>Catalogar Nova Criatura</h2>
      <p>Registre uma nova espécie no acervo pré-histórico</p>
    </div>
  </div>

  <div class="form-grid">

    <!-- Nome -->
    <div class="field full">
      <label><span class="dot"></span> Nome da Espécie</label>
      <input v-model="newAnimal.name" placeholder="Ex: Tyrannosaurus Rex" />
    </div>

    <!-- Tamanho -->
    <div class="field">
      <label><span class="dot"></span> Tamanho</label>
      <input v-model="newAnimal.size" placeholder="Ex: 12m de comprimento" />
    </div>

    <!-- Dieta -->
    <div class="field">
      <label><span class="dot"></span> Dieta</label>
      <select v-model="newAnimal.dieta">
        <option disabled value="">Selecione a dieta</option>
        <option v-for="d in dietas" :key="d" :value="d">{{ d }}</option>
      </select>
    </div>

    <!-- Imagem -->
    <div class="field full">
      <label><span class="dot"></span> Imagem (URL)</label>
      <div class="image-field">
        <input v-model="newAnimal.image" placeholder="https://..." />
        <div class="image-preview">
          <img v-if="newAnimal.image" :src="newAnimal.image" alt="preview" />
          <span v-else>🦕</span>
        </div>
      </div>
    </div>

    <!-- Era -->
    <div class="field">
      <label><span class="dot"></span> Era Geológica</label>
      <select v-model="selectedEra">
        <option disabled value="">Selecione uma era</option>
        <option v-for="e in eras" :key="e.id" :value="e.id">{{ e.name }}</option>
      </select>
    </div>

    <!-- Período -->
    <div class="field">
      <label>
        <span class="dot"></span> Período
        <span v-if="!selectedEra" class="hint">(selecione uma era)</span>
      </label>
      <select v-model="newAnimal.periodoId" :disabled="!selectedEra">
        <option disabled value="">Selecione um período</option>
        <option
          v-for="p in getPeriodosByEra(selectedEra || '')"
          :key="p.id"
          :value="p.id"
        >{{ p.name }}</option>
      </select>
    </div>

  </div>

  <div class="form-footer">
    <button class="btn primary" @click="create">
      <span>✦</span> Catalogar Criatura
    </button>
  </div>
</section>


    <!-- LIST -->
    <section class="grid">

      <div v-for="a in animals" :key="a.id" class="card">

        <img v-if="a.image" :src="a.image" />
        <div v-else class="placeholder">🦕</div>

        <h3>{{ a.name }}</h3>

        <div class="info">
          <span><b>Tamanho:</b> {{ a.size || "—" }}</span>
          <span><b>Período:</b> {{ a.periodo?.name || "—" }}</span>
          <span><b>Dieta:</b> {{ a.dieta || "—" }}</span>
        </div>

        <div class="actions">
          <button class="btn edit" @click="openEdit(a)">Editar</button>
          <button class="btn danger" @click="remove(a.id)">Excluir</button>
        </div>

      </div>

    </section>

    <p v-if="!animals.length" class="empty">
      Nenhum animal encontrado 🦴
    </p>

    <!-- MODAL -->
    <div v-if="selected" class="modal" @click.self="selected = null">

      <div class="modal-box">

        <h2>Editar {{ selected.name }}</h2>

        <input v-model="selected.name" placeholder="Nome" />
        <input v-model="selected.size" placeholder="Tamanho" />
        <input v-model="selected.image" placeholder="Imagem" />

        <select v-model="selected.dieta">
          <option v-for="d in dietas" :key="d" :value="d">
            {{ d }}
          </option>
        </select>

        <select v-model="selected.periodoId">
          <option v-for="p in periodos" :key="p.id" :value="p.id">
            {{ p.name }}
          </option>
        </select>

        <div class="modal-actions">
          <button class="btn" @click="selected = null">Cancelar</button>
          <button class="btn primary" @click="saveEdit">Salvar</button>
        </div>

      </div>

    </div>

  </div>
</template>

<style scoped>
/* =========================
   BASE
========================= */
.page {
  min-height: 100vh;
  padding: 40px;
  color: #f5e6c8;
  background: linear-gradient(180deg, #0b0a08, #1a140f);
  font-family: system-ui, sans-serif;
}

/* =========================
   HEADER
========================= */
.page-header {
  text-align: center;
  margin-bottom: 24px;
}

/* =========================
   FORM CARD
========================= */
.form-card {
  max-width: 900px;
  margin: 0 auto 30px;
  padding: 28px;
  border-radius: 20px;

  background:
    radial-gradient(circle at 0% 0%, rgba(212,175,55,0.08), transparent 50%),
    radial-gradient(circle at 100% 100%, rgba(212,175,55,0.05), transparent 50%),
    rgba(15, 12, 8, 0.85);

  border: 1px solid rgba(212,175,55,0.2);
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  position: relative;
  overflow: hidden;
}

.form-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #d4af37, transparent);
}

/* =========================
   FORM HEADER
========================= */
.form-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(212,175,55,0.15);
}

.form-icon {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.08));
  border: 1px solid rgba(212,175,55,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
}

/* =========================
   TEXTS
========================= */
.form-header h2 {
  margin: 0;
  font-size: 1.3rem;
  color: #d4af37;
}

.form-header p {
  margin: 2px 0 0;
  font-size: 0.85rem;
  color: rgba(245,230,200,0.6);
  font-style: italic;
}

/* =========================
   GRID
========================= */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-top: 10px;
}

.field.full {
  grid-column: 1 / -1;
}

/* =========================
   LABELS
========================= */
.label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: rgba(245,230,200,0.7);
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d4af37;
}

/* =========================
   INPUTS / SELECTS (UNIFICADO)
========================= */
input,
select {
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(212,175,55,0.2);
  background: rgba(0,0,0,0.45);
  color: #f5e6c8;
  font-size: 0.95rem;
  outline: none;
  transition: 0.2s ease;
}

input::placeholder {
  color: rgba(245,230,200,0.35);
}

input:focus,
select:focus {
  border-color: rgba(212,175,55,0.6);
  box-shadow: 0 0 0 3px rgba(212,175,55,0.12);
}

/* opções visíveis */
select option {
  background: #1a140f;
  color: #f5e6c8;
}

select:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* =========================
   IMAGE FIELD
========================= */
.image-field {
  display: flex;
  gap: 10px;
  align-items: center;
}

.image-preview {
  width: 54px;
  height: 48px;
  border-radius: 10px;
  background: rgba(0,0,0,0.5);
  border: 1px dashed rgba(212,175,55,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* =========================
   FOOTER BUTTON
========================= */
.form-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.btn.primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;

  padding: 12px 20px;
  border-radius: 12px;
  border: none;

  background: linear-gradient(135deg, #d4af37, #b8972e);
  color: #0f0c08;

  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.btn.primary:hover {
  transform: translateY(-2px);
}

/* =========================
   GRID LIST
========================= */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

/* =========================
   CARD
========================= */
.card {
  padding: 16px;
  border-radius: 14px;
  background: rgba(0,0,0,0.4);
  border: 1px solid rgba(212,175,55,0.15);
}

.card img {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 10px;
}

.placeholder {
  font-size: 40px;
  text-align: center;
  padding: 40px 0;
}

/* =========================
   INFO
========================= */
.info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin: 10px 0;
}

/* =========================
   ACTIONS
========================= */
.actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 14px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
}

.edit {
  background: rgba(255,255,255,0.1);
  color: #fff;
}

.danger {
  background: rgba(255,80,80,0.2);
  color: #ff8a8a;
}

/* =========================
   MODAL
========================= */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-box {
  width: 420px;
  padding: 20px;
  border-radius: 14px;
  background: #1a140f;
}
</style>