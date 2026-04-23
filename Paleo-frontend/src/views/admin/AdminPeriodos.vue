<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import api from "../../services/api";

/* =========================
   STATE
========================= */
const periodos = ref<any[]>([]);
const eras = ref<any[]>([]);
const selected = ref<any | null>(null);
const selectedEra = ref<string>("");

const newPeriodo = ref({
  name: "",
  description: "",
  image: "",
  eraId: "",
  periodoId: ""
});

/* =========================
   LOAD
========================= */
async function load() {
  const [pRes, eRes] = await Promise.all([
    api.get("/periodos"),
    api.get("/eras")
  ]);
  periodos.value = pRes.data;
  eras.value = eRes.data;
}
onMounted(load);

const filteredPeriodos = computed(() => {
  if (!selectedEra.value) return [];
  return periodos.value.filter(p => p.eraId === selectedEra.value);
});

watch(selectedEra, () => {
  newPeriodo.value.eraId = selectedEra.value;
  newPeriodo.value.periodoId = "";
});

const grouped = computed(() => {
  const map: Record<string, any[]> = {};
  periodos.value.forEach(p => {
    const eraName = p.era?.name || "Sem Era";
    if (!map[eraName]) map[eraName] = [];
    map[eraName].push(p);
  });
  return map;
});

async function create() {
  await api.post("/periodos", newPeriodo.value);
  newPeriodo.value = { name: "", description: "", image: "", eraId: "", periodoId: "" };
  selectedEra.value = "";
  await load();
}

async function remove(id: string) {
  if (!confirm("Excluir período?")) return;
  await api.delete(`/periodos/${id}`);
  periodos.value = periodos.value.filter(p => p.id !== id);
}

function openEdit(p: any) {
  selected.value = { ...p };
}

async function saveEdit() {
  await api.put(`/periodos/${selected.value.id}`, selected.value);
  selected.value = null;
  await load();
}
</script>

<template>
  <div class="page">

    <!-- ====== HEADER REFINADO ====== -->
    <header class="page-header">
      <div class="header-emblem">🦴</div>
      <div class="header-text">
        <span class="header-eyebrow">Painel Administrativo</span>
        <h1>Gerenciar Períodos</h1>
        <p>Catálogo de eras geológicas e seus períodos</p>
      </div>
      <div class="header-stats">
        <div class="stat">
          <strong>{{ periodos.length }}</strong>
          <span>períodos</span>
        </div>
        <div class="stat">
          <strong>{{ eras.length }}</strong>
          <span>eras</span>
        </div>
      </div>
    </header>

    <!-- ====== FORM (mantido) ====== -->
    <section class="form-card">

      <div class="form-header">
        <div class="form-icon">🦴</div>
        <div>
          <h2>Novo Período</h2>
          <p class="form-subtitle">Selecione uma era e depois um período</p>
        </div>
      </div>

      <div class="form-grid">
        <div class="field">
          <label>Nome do Período</label>
          <input v-model="newPeriodo.name" placeholder="Ex: Jurássico" />
        </div>

        <div class="field">
          <label>Era</label>
          <select v-model="selectedEra">
            <option disabled value="">Selecione a Era</option>
            <option v-for="e in eras" :key="e.id" :value="e.id">{{ e.name }}</option>
          </select>
        </div>

        <div class="field">
          <label>Período</label>
          <select v-model="newPeriodo.periodoId" :disabled="!selectedEra">
            <option disabled value="">Selecione o Período</option>
            <option v-for="p in filteredPeriodos" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>

        <div class="field full">
          <label>Descrição</label>
          <input v-model="newPeriodo.description" />
        </div>

        <div class="field full">
          <label>Imagem</label>
          <div class="image-row">
            <input v-model="newPeriodo.image" placeholder="URL da imagem" />
            <div class="image-preview">
              <img v-if="newPeriodo.image" :src="newPeriodo.image" />
              <span v-else>🦴</span>
            </div>
          </div>
        </div>
      </div>

      <button class="btn-create" @click="create">
        Criar Período →
      </button>
    </section>

    <!-- ====== LISTA POR ERA REFINADA ====== -->
    <div v-for="(items, era) in grouped" :key="era" class="era-section">

      <div class="era-header">
        <div class="era-marker"></div>
        <div class="era-titles">
          <span class="era-eyebrow">Era Geológica</span>
          <h2>{{ era }}</h2>
        </div>
        <span class="era-count">{{ items.length }} período{{ items.length > 1 ? 's' : '' }}</span>
      </div>

      <div class="grid">
        <article v-for="p in items" :key="p.id" class="card">

          <div class="card-media">
            <img v-if="p.image" :src="p.image" :alt="p.name" />
            <div v-else class="placeholder">🦴</div>
            <span class="card-badge">{{ era }}</span>
            <div class="card-shadow"></div>
          </div>

          <div class="card-body">
            <h3>{{ p.name }}</h3>
            <p class="card-desc">{{ p.description || 'Sem descrição disponível.' }}</p>
          </div>

          <div class="card-footer">
            <button class="btn edit" @click="openEdit(p)">✏️ Editar</button>
            <button class="btn danger" @click="remove(p.id)">🗑️ Excluir</button>
          </div>

        </article>
      </div>
    </div>

    <div v-if="!periodos.length" class="empty-state">
      <span>🦕</span>
      <p>Nenhum período cadastrado ainda</p>
    </div>

    <!-- ====== MODAL (mantido) ====== -->
    <div v-if="selected" class="modal-overlay" @click.self="selected = null">
      <div class="modal-museum">
        <div class="catalog-bar">
          <div class="catalog-tag">
            <span class="catalog-dot"></span>
            <span>FICHA Nº {{ selected.id?.slice(0, 6).toUpperCase() || '------' }}</span>
          </div>
          <button class="close-x" @click="selected = null">✕</button>
        </div>

        <div class="museum-body">
          <div class="museum-preview">
            <div class="preview-frame">
              <img v-if="selected.image" :src="selected.image" :alt="selected.name" />
              <div v-else class="preview-empty">
                <span>🦴</span>
                <small>Sem imagem</small>
              </div>
            </div>
            <div class="preview-caption">
              <span class="caption-label">Espécime</span>
              <strong>{{ selected.name || 'Sem nome' }}</strong>
            </div>
          </div>

          <div class="museum-form">
            <h3 class="museum-title">Editar Registro</h3>
            <p class="museum-sub">Atualize os dados do período</p>

            <div class="museum-field">
              <label>Nome</label>
              <input v-model="selected.name" />
            </div>

            <div class="museum-field">
              <label>Descrição</label>
              <textarea v-model="selected.description" rows="3"></textarea>
            </div>

            <div class="museum-field">
              <label>Era</label>
              <select v-model="selected.eraId">
                <option v-for="e in eras" :key="e.id" :value="e.id">{{ e.name }}</option>
              </select>
            </div>

            <div class="museum-field">
              <label>URL da Imagem</label>
              <input v-model="selected.image" />
            </div>

            <div class="museum-actions">
              <button class="btn-ghost" @click="selected = null">Cancelar</button>
              <button class="btn-gold" @click="saveEdit">
                <span>Salvar</span>
                <span class="arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');

.page {
  padding: 40px 30px 60px;
  color: #f5e6c8;
  min-height: 100vh;
  background:
    radial-gradient(ellipse at top, rgba(212,175,55,0.06), transparent 60%),
    linear-gradient(180deg, #0b0a08, #14110c);
  font-family: 'Crimson Text', serif;
}

/* ===== PAGE HEADER ===== */
.page-header {
  max-width: 1100px;
  margin: 0 auto 40px;
  padding: 26px 30px;
  display: flex;
  align-items: center;
  gap: 22px;
  border-radius: 18px;
  background: linear-gradient(120deg, rgba(212,175,55,0.08), rgba(0,0,0,0.4));
  border: 1px solid rgba(212,175,55,0.18);
  position: relative;
  overflow: hidden;
}
.page-header::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, #d4af37, transparent);
}

.header-emblem {
  width: 64px; height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  background: rgba(212,175,55,0.15);
  border: 1px solid rgba(212,175,55,0.35);
  box-shadow: inset 0 0 20px rgba(212,175,55,0.1);
}

.header-text { flex: 1; }
.header-eyebrow {
  font-family: 'Cinzel', serif;
  font-size: 0.65rem;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #d4af37;
  opacity: 0.8;
}
.header-text h1 {
  margin: 4px 0 4px;
  font-family: 'Cinzel', serif;
  font-size: 1.7rem;
  letter-spacing: 2px;
  color: #f5e6c8;
}
.header-text p {
  margin: 0;
  font-style: italic;
  color: rgba(245,230,200,0.55);
  font-size: 0.9rem;
}

.header-stats {
  display: flex;
  gap: 14px;
}
.stat {
  text-align: center;
  padding: 10px 18px;
  border-radius: 12px;
  background: rgba(0,0,0,0.4);
  border: 1px solid rgba(212,175,55,0.18);
  min-width: 70px;
}
.stat strong {
  display: block;
  font-family: 'Cinzel', serif;
  font-size: 1.4rem;
  color: #d4af37;
}
.stat span {
  font-size: 0.65rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(245,230,200,0.5);
}

/* TITLE legacy off */
.title { display: none; }

/* ===== FORM (mantido) ===== */
.form-card {
  max-width: 900px;
  margin: 0 auto 50px;
  padding: 30px;
  border-radius: 18px;
  background: linear-gradient(160deg, #14110c, #0b0a08);
  border: 1px solid rgba(212,175,55,0.2);
  box-shadow: 0 20px 60px rgba(0,0,0,0.6), inset 0 0 40px rgba(212,175,55,0.05);
  position: relative;
  overflow: hidden;
}
.form-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, #d4af37, transparent);
}

.form-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 25px;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(212,175,55,0.15);
}
.form-icon {
  width: 50px; height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: rgba(212,175,55,0.1);
  border: 1px solid rgba(212,175,55,0.3);
}
.form-header h2 {
  margin: 0;
  font-family: 'Cinzel', serif;
  font-size: 1.25rem;
  letter-spacing: 1.5px;
  color: #f5e6c8;
}
.form-subtitle {
  margin: 2px 0 0;
  font-size: 0.85rem;
  font-style: italic;
  color: rgba(245,230,200,0.5);
}

.form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field.full { grid-column: 1 / -1; }
.field label {
  font-family: 'Cinzel', serif;
  font-size: 0.65rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(245,230,200,0.6);
}
.field input, .field select {
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid rgba(212,175,55,0.2);
  background: rgba(0,0,0,0.5);
  color: #f5e6c8;
  font-family: 'Crimson Text', serif;
  transition: all 0.25s ease;
}
.field input:hover, .field select:hover { border-color: rgba(212,175,55,0.5); }
.field input:focus, .field select:focus {
  outline: none;
  border-color: #d4af37;
  box-shadow: 0 0 0 3px rgba(212,175,55,0.2);
}
.field select:disabled { opacity: 0.5; cursor: not-allowed; }
.field select option { background: #1a140f; }

.image-row { display: flex; gap: 12px; align-items: stretch; }
.image-row input { flex: 1; }
.image-preview {
  width: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.6);
  border: 1px dashed rgba(212,175,55,0.3);
  overflow: hidden;
}
.image-preview img { width: 100%; height: 100%; object-fit: cover; }

.btn-create {
  margin-top: 25px;
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, #d4af37, #b8972e);
  color: #1a140f;
  font-family: 'Cinzel', serif;
  font-size: 0.9rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  transition: all 0.25s ease;
  box-shadow: 0 6px 20px rgba(212,175,55,0.3);
}
.btn-create:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(212,175,55,0.5); }
.btn-create:active { transform: scale(0.97); }

/* ===== ERA SECTION REFINADA ===== */
.era-section {
  max-width: 1100px;
  margin: 0 auto 50px;
}
.era-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
  padding: 14px 20px;
  border-radius: 14px;
  background: linear-gradient(90deg, rgba(212,175,55,0.1), transparent);
  border-left: 3px solid #d4af37;
}
.era-marker {
  width: 12px; height: 12px;
  border-radius: 50%;
  background: #d4af37;
  box-shadow: 0 0 12px #d4af37;
  flex-shrink: 0;
}
.era-titles { flex: 1; }
.era-eyebrow {
  font-family: 'Cinzel', serif;
  font-size: 0.6rem;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: rgba(212,175,55,0.7);
}
.era-titles h2 {
  margin: 2px 0 0;
  font-family: 'Cinzel', serif;
  font-size: 1.3rem;
  letter-spacing: 1.5px;
  color: #f5e6c8;
}
.era-count {
  padding: 6px 12px;
  border-radius: 20px;
  background: rgba(212,175,55,0.15);
  border: 1px solid rgba(212,175,55,0.3);
  font-family: 'Cinzel', serif;
  font-size: 0.7rem;
  letter-spacing: 1.5px;
  color: #d4af37;
}

/* ===== GRID ===== */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

/* ===== CARD REFINADO ===== */
.card {
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  background: linear-gradient(170deg, #1a150e, #0b0a08);
  border: 1px solid rgba(212,175,55,0.15);
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 6px 18px rgba(0,0,0,0.4);
}
.card:hover {
  transform: translateY(-6px);
  border-color: rgba(212,175,55,0.4);
  box-shadow: 0 18px 40px rgba(0,0,0,0.6), 0 0 30px rgba(212,175,55,0.15);
}

.card-media {
  position: relative;
  height: 160px;
  overflow: hidden;
}
.card-media img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.card:hover .card-media img { transform: scale(1.08); }

.placeholder {
  width: 100%; height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  background: radial-gradient(circle, rgba(212,175,55,0.12), transparent);
}

.card-badge {
  position: absolute;
  top: 12px; left: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(0,0,0,0.7);
  border: 1px solid rgba(212,175,55,0.4);
  color: #d4af37;
  font-family: 'Cinzel', serif;
  font-size: 0.6rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  backdrop-filter: blur(6px);
}
.card-shadow {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 50%, rgba(11,10,8,0.9) 100%);
  pointer-events: none;
}

.card-body {
  padding: 16px 18px 12px;
  flex: 1;
}
.card-body h3 {
  margin: 0 0 6px;
  font-family: 'Cinzel', serif;
  font-size: 1.1rem;
  letter-spacing: 1px;
  color: #f5e6c8;
}
.card-desc {
  margin: 0;
  font-size: 0.88rem;
  color: rgba(245,230,200,0.6);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  gap: 8px;
  padding: 12px 14px;
  border-top: 1px solid rgba(212,175,55,0.12);
  background: rgba(0,0,0,0.3);
}

/* ===== BUTTONS ===== */
.btn {
  flex: 1;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  font-family: 'Cinzel', serif;
  font-size: 0.7rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  transition: all 0.2s ease;
}
.btn.edit {
  background: rgba(212,175,55,0.12);
  color: #d4af37;
  border-color: rgba(212,175,55,0.3);
}
.btn.edit:hover { background: rgba(212,175,55,0.22); }
.btn.danger {
  background: rgba(255,80,80,0.1);
  color: #ff8a8a;
  border-color: rgba(255,80,80,0.3);
}
.btn.danger:hover { background: rgba(255,80,80,0.2); }

/* ===== EMPTY STATE ===== */
.empty-state {
  max-width: 500px;
  margin: 60px auto;
  text-align: center;
  padding: 40px;
  border-radius: 16px;
  border: 1px dashed rgba(212,175,55,0.3);
  background: rgba(0,0,0,0.3);
}
.empty-state span { font-size: 3rem; display: block; margin-bottom: 10px; }
.empty-state p {
  margin: 0;
  font-family: 'Cinzel', serif;
  letter-spacing: 1.5px;
  color: rgba(245,230,200,0.5);
}

/* ===== MODAL (mantido) ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  padding: 20px;
  animation: fadeIn 0.25s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.modal-museum {
  width: 100%;
  max-width: 820px;
  background: linear-gradient(160deg, #1a150e, #0b0a08);
  border: 1px solid rgba(212,175,55,0.25);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(0,0,0,0.9), 0 0 60px rgba(212,175,55,0.08);
  animation: slideUp 0.35s cubic-bezier(.2,.9,.3,1.2);
}
@keyframes slideUp {
  from { transform: translateY(30px) scale(0.96); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

.catalog-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 22px;
  background: rgba(0,0,0,0.4);
  border-bottom: 1px solid rgba(212,175,55,0.18);
}
.catalog-tag {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Cinzel', serif;
  font-size: 0.7rem;
  letter-spacing: 3px;
  color: #d4af37;
}
.catalog-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #d4af37;
  box-shadow: 0 0 10px #d4af37;
  animation: pulse 2s infinite;
}
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
.close-x {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: transparent;
  border: 1px solid rgba(212,175,55,0.3);
  color: #f5e6c8;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}
.close-x:hover { background: rgba(212,175,55,0.2); transform: rotate(90deg); }

.museum-body { display: grid; grid-template-columns: 280px 1fr; }
.museum-preview {
  padding: 24px;
  background: linear-gradient(180deg, rgba(212,175,55,0.05), transparent);
  border-right: 1px solid rgba(212,175,55,0.15);
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.preview-frame {
  aspect-ratio: 1;
  border-radius: 12px;
  border: 1px solid rgba(212,175,55,0.25);
  background: rgba(0,0,0,0.5);
  overflow: hidden;
  position: relative;
}
.preview-frame::before {
  content: '';
  position: absolute;
  inset: 6px;
  border: 1px dashed rgba(212,175,55,0.15);
  border-radius: 8px;
  pointer-events: none;
  z-index: 2;
}
.preview-frame img { width: 100%; height: 100%; object-fit: cover; }
.preview-empty {
  width: 100%; height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: rgba(245,230,200,0.4);
}
.preview-empty span { font-size: 3rem; }
.preview-empty small {
  font-family: 'Cinzel', serif;
  font-size: 0.65rem;
  letter-spacing: 2px;
  text-transform: uppercase;
}
.preview-caption {
  text-align: center;
  padding-top: 8px;
  border-top: 1px solid rgba(212,175,55,0.15);
}
.caption-label {
  display: block;
  font-family: 'Cinzel', serif;
  font-size: 0.6rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(245,230,200,0.5);
  margin-bottom: 4px;
}
.preview-caption strong {
  font-family: 'Cinzel', serif;
  color: #d4af37;
  font-size: 1rem;
  letter-spacing: 1px;
}

.museum-form { padding: 26px 28px; display: flex; flex-direction: column; gap: 14px; }
.museum-title {
  margin: 0;
  font-family: 'Cinzel', serif;
  color: #f5e6c8;
  font-size: 1.25rem;
  letter-spacing: 1.5px;
}
.museum-sub {
  margin: 0 0 8px;
  font-style: italic;
  font-size: 0.85rem;
  color: rgba(245,230,200,0.5);
}
.museum-field { display: flex; flex-direction: column; gap: 6px; }
.museum-field label {
  font-family: 'Cinzel', serif;
  font-size: 0.65rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(245,230,200,0.6);
}
.museum-field input, .museum-field select, .museum-field textarea {
  padding: 11px 14px;
  border-radius: 10px;
  border: 1px solid rgba(212,175,55,0.2);
  background: rgba(0,0,0,0.5);
  color: #f5e6c8;
  font-family: 'Crimson Text', serif;
  font-size: 0.95rem;
  resize: none;
  transition: all 0.2s ease;
}
.museum-field input:focus, .museum-field select:focus, .museum-field textarea:focus {
  outline: none;
  border-color: #d4af37;
  background: rgba(0,0,0,0.7);
  box-shadow: 0 0 0 3px rgba(212,175,55,0.15);
}
.museum-field select option { background: #1a140f; }

.museum-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid rgba(212,175,55,0.12);
}
.btn-ghost {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  background: transparent;
  border: 1px solid rgba(245,230,200,0.2);
  color: rgba(245,230,200,0.7);
  font-family: 'Cinzel', serif;
  font-size: 0.75rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-ghost:hover { background: rgba(245,230,200,0.05); }
.btn-gold {
  flex: 1.4;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #d4af37, #b8972e);
  color: #1a140f;
  font-family: 'Cinzel', serif;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 16px rgba(212,175,55,0.3);
}
.btn-gold:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(212,175,55,0.5); }
.btn-gold .arrow { transition: transform 0.25s ease; }
.btn-gold:hover .arrow { transform: translateX(4px); }

/* ===== RESPONSIVE ===== */
@media (max-width: 800px) {
  .page-header { flex-direction: column; text-align: center; }
  .form-grid { grid-template-columns: 1fr; }
  .museum-body { grid-template-columns: 1fr; }
  .museum-preview { border-right: none; border-bottom: 1px solid rgba(212,175,55,0.15); }
  .preview-frame { aspect-ratio: 16/9; }
}
</style>
