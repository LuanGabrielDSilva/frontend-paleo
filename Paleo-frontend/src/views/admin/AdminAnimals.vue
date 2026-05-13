<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import api from "../../services/api";

/* =========================
   STATE
========================= */
const animals = ref<any[]>([]);
const eras = ref<any[]>([]);
const periodos = ref<any[]>([]);
const selected = ref<any | null>(null);
const selectedEra = ref<string>("");
const search = ref("");

/* CONFIRMAÇÃO DE EXCLUSÃO */
const deleteModal = ref({
  isOpen: false,
  animalId: null as string | null,
  animalName: "",
  isDeleting: false
});

const ordemPaleozoico = [
  "Cambriano", "Ordoviciano", "Siluriano",
  "Devoniano", "Carbonífero", "Permiano"
];

const dietas = [
  "Carnívoro", "Herbívoro", "Onívoro", "Insetívoro", "Piscívoro",
  "Necrófago", "Detritívoro", "Filtrador", "Nectarívoro",
  "Hematófago", "Fungívoro", "Micrófago", "Autótrofa"
];

const newAnimal = ref({
  name: "",
  size: "",
  image: "",
  dieta: "",
  habitat: "",
  clima: "",
  descoberta: "",
  local: "",
  periodoId: ""
});

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

const groupedAnimals = computed(() => {
  const groups: Record<string, any[]> = {};
  animals.value.forEach(animal => {
    const periodoId = animal.periodoId || "sem-periodo";
    if (!groups[periodoId]) groups[periodoId] = [];
    groups[periodoId].push(animal);
  });

  Object.keys(groups).forEach(key => {
    groups[key].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  });

  const sortedGroups = periodos.value
    .map(p => ({
      id: p.id, name: p.name, eraId: p.eraId,
      animals: groups[p.id] || []
    }))
    .sort((a, b) => {
      const ia = ordemPaleozoico.indexOf(a.name);
      const ib = ordemPaleozoico.indexOf(b.name);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return 0;
    })
    .filter(g => g.animals.length > 0);

  if (groups["sem-periodo"]?.length) {
    sortedGroups.push({
      id: "sem-periodo", name: "Sem Período",
      eraId: null, animals: groups["sem-periodo"]
    });
  }
  return sortedGroups;
});

function getPeriodosByEra(eraId: string) {
  return periodos.value
    .filter(p => p.eraId === eraId)
    .sort((a, b) => ordemPaleozoico.indexOf(a.name) - ordemPaleozoico.indexOf(b.name));
}

function getEraName(eraId: string | null) {
  if (!eraId) return "Sem Era";
  return eras.value.find(e => e.id === eraId)?.name || "Era";
}

async function create() {
  try {
    await api.post("/animals", {
      name: newAnimal.value.name,
      size: newAnimal.value.size,
      image: newAnimal.value.image,
      dieta: newAnimal.value.dieta,
      habitat: newAnimal.value.habitat,
      clima: newAnimal.value.clima,
      descoberta: newAnimal.value.descoberta,
      local: newAnimal.value.local,
      periodoId: newAnimal.value.periodoId || null,
      eraId: selectedEra.value || null
    });

    newAnimal.value = {
      name: "",
      size: "",
      image: "",
      dieta: "",
      habitat: "",
      clima: "",
      descoberta: "",
      local: "",
      periodoId: ""
    };

    selectedEra.value = "";

    await load();

    alert("✅ Criatura catalogada com sucesso!");
  } catch (err) {
    console.error(err);
    alert("Erro ao criar animal");
  }
}

/* =========================
   DELETE CONFIRMATION
========================= */
function openDeleteModal(id: string, name: string) {
  deleteModal.value = {
    isOpen: true,
    animalId: id,
    animalName: name,
    isDeleting: false
  };
}

function closeDeleteModal() {
  deleteModal.value.isOpen = false;
  setTimeout(() => {
    deleteModal.value.animalId = null;
    deleteModal.value.animalName = "";
    deleteModal.value.isDeleting = false;
  }, 300);
}

async function confirmDelete() {
  if (!deleteModal.value.animalId) return;
  
  deleteModal.value.isDeleting = true;
  
  try {
    await api.delete(`/animals/${deleteModal.value.animalId}`);
    animals.value = animals.value.filter(a => a.id !== deleteModal.value.animalId);
    closeDeleteModal();
  } catch (err) {
    console.error("Erro ao excluir:", err);
    deleteModal.value.isDeleting = false;
  }
}

function openEdit(animal: any) {
  selected.value = { ...animal };
}

async function saveEdit() {
  if (!selected.value) return;
  await api.put(`/animals/${selected.value.id}`, selected.value);
  selected.value = null;
  await load();
}

const openPeriods = ref<string[]>([]);

function togglePeriod(id: string) {
  if (openPeriods.value.includes(id)) {
    openPeriods.value = openPeriods.value.filter(p => p !== id);
  } else {
    openPeriods.value.push(id);
  }
}

const groupedByEra = computed(() => {
  const erasMap: Record<string, any> = {};

  groupedAnimals.value.forEach(period => {
    const eraId = period.eraId || "sem-era";

    if (!erasMap[eraId]) {
      erasMap[eraId] = {
        eraId,
        eraName: getEraName(eraId),
        periods: []
      };
    }

    erasMap[eraId].periods.push(period);
  });

  return Object.values(erasMap);
});

const openEras = ref<string[]>([]);

function toggleEra(id: string) {
  if (openEras.value.includes(id)) {
    openEras.value = openEras.value.filter(e => e !== id);
  } else {
    openEras.value.push(id);
  }
}

onMounted(load);
</script>

<template>
  <div class="page">

    <!-- ===== HEADER ===== -->
    <header class="page-header">
      <div class="header-emblem">🦖</div>
      <div class="header-text">
        <span class="header-eyebrow">Painel Administrativo</span>
        <h1>Acervo de Criaturas</h1>
        <p>Catalogue espécies pré-históricas e organize-as por período</p>
      </div>
      <div class="header-stats">
        <div class="stat">
          <strong>{{ animals.length }}</strong>
          <span>espécies</span>
        </div>
        <div class="stat">
          <strong>{{ groupedAnimals.length }}</strong>
          <span>períodos</span>
        </div>
      </div>
    </header>

    <!-- ===== FORM ===== -->
    <section class="form-card">
      <div class="form-header">
        <div class="form-icon">🦖</div>
        <div>
          <h2>Catalogar Nova Criatura</h2>
          <p class="form-subtitle">Registre uma nova espécie no acervo pré-histórico</p>
        </div>
      </div>

      <div class="form-grid">
        <div class="field full">
          <label>Nome da Espécie</label>
          <input v-model="newAnimal.name" placeholder="Ex: Tyrannosaurus Rex" />
        </div>

        <div class="field">
          <label>Tamanho</label>
          <input v-model="newAnimal.size" placeholder="Ex: 12m de comprimento" />
        </div>

        <div class="field">
          <label>Dieta</label>
          <select v-model="newAnimal.dieta">
            <option disabled value="">Selecione a dieta</option>
            <option v-for="d in dietas" :key="d" :value="d">{{ d }}</option>
          </select>
        </div>

        <div class="field">
  <label>Habitat</label>
  <input
    v-model="newAnimal.habitat"
    placeholder="Ex: Florestas tropicais"
  />
</div>

<div class="field">
  <label>Clima</label>
  <input
    v-model="newAnimal.clima"
    placeholder="Ex: Quente e úmido"
  />
</div>

<div class="field">
  <label>Descoberta</label>
  <input
    v-model="newAnimal.descoberta"
    placeholder="Ex: 1902"
  />
</div>

<div class="field">
  <label>Local da Descoberta</label>
  <input
    v-model="newAnimal.local"
    placeholder="Ex: Argentina"
  />
</div>

        <div class="field full">
          <label>Imagem (URL)</label>
          <div class="image-row">
            <input v-model="newAnimal.image" placeholder="https://..." />
            <div class="image-preview">
              <img v-if="newAnimal.image" :src="newAnimal.image" alt="preview" />
              <span v-else>🦕</span>
            </div>
          </div>
        </div>

        <div class="field">
          <label>Era Geológica</label>
          <select v-model="selectedEra">
            <option disabled value="">Selecione uma era</option>
            <option v-for="e in eras" :key="e.id" :value="e.id">{{ e.name }}</option>
          </select>
        </div>

        <div class="field">
          <label>
            Período
            <span v-if="!selectedEra" class="hint">— selecione uma era</span>
          </label>
          <select v-model="newAnimal.periodoId" :disabled="!selectedEra">
            <option disabled value="">Selecione um período</option>
            <option v-for="p in getPeriodosByEra(selectedEra)" :key="p.id" :value="p.id">
              {{ p.name }}
            </option>
          </select>
        </div>
      </div>

      <button class="btn-create" @click="create">
        ✦ Catalogar Criatura →
      </button>
    </section>

    <!-- ===== LISTA POR ERA ===== -->
    <section v-for="era in groupedByEra" :key="era.eraId" class="period-section">
      <div class="period-header" @click="toggleEra(era.eraId)" style="cursor:pointer;">
        <div class="period-marker"></div>
        <div class="period-titles">
          <span class="period-eyebrow">ERA</span>
          <h2>{{ era.eraName }}</h2>
        </div>
        <div class="period-count">
          {{ era.periods.length }} período{{ era.periods.length > 1 ? 's' : '' }}
        </div>
      </div>

      <Transition name="slide-fade">
        <div v-show="openEras.includes(era.eraId)">
          <div v-for="group in era.periods" :key="group.id" class="group-block">
            <div class="group-header" @click="togglePeriod(group.id)" style="cursor:pointer;">
              <div class="group-titles">
                <span class="group-era">{{ era.eraName }}</span>
                <h3>{{ group.name }}</h3>
              </div>
              <div class="group-count">
                {{ group.animals.length }} espécie{{ group.animals.length > 1 ? 's' : '' }}
              </div>
            </div>

            <Transition name="slide-fade">
              <div v-show="openPeriods.includes(group.id)" class="group-grid">
                <div v-for="a in group.animals" :key="a.id" class="card">
                  <div class="card-media">
                    <div v-if="a.image" class="image-wrap">
                      <img :src="a.image" :alt="a.name" />
                    </div>
                    <div v-else class="placeholder">🦕</div>
                    <div class="card-shadow"></div>
                    <div class="card-badge">{{ group.name }}</div>
                  </div>
                  <div class="card-body">
                    <h3>{{ a.name }}</h3>
                    <div class="card-meta">
                      <span class="meta-pill">📏 {{ a.size || "—" }}</span>
                      <span class="meta-pill diet">🍖 {{ a.dieta || "—" }}</span>
                    </div>

                    <div class="extra-info">
                      <p>🌍 {{ a.habitat || "Habitat desconhecido" }}</p>
                      <p>☁️ {{ a.clima || "Clima desconhecido" }}</p>
                      <p>📍 {{ a.local || "Local desconhecido" }}</p>
                      <p>⛏️ {{ a.descoberta || "Descoberta desconhecida" }}</p>
                    </div>
                  </div>
                  <div class="card-footer">
                    <button class="btn edit" @click="openEdit(a)">✏️ Editar</button>
                    <button class="btn danger" @click="openDeleteModal(a.id, a.name)">🗑️ Excluir</button>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </Transition>
    </section>

    <!-- ===== EMPTY ===== -->
    <div v-if="animals.length === 0" class="empty-state">
      <span>🦴</span>
      <p>Nenhum animal catalogado ainda</p>
    </div>

    <!-- ===== MODAL DE EDIÇÃO ===== -->
    <div v-if="selected" class="modal-overlay" @click.self="selected = null">
      <div class="modal-museum">
        <div class="catalog-bar">
          <div class="catalog-tag">
            <span class="catalog-dot"></span>
            ESPÉCIME Nº {{ selected.id?.slice(0, 6).toUpperCase() || '------' }}
          </div>
          <button class="close-x" @click="selected = null">✕</button>
        </div>

        <div class="museum-body">
          <div class="museum-preview">
            <div class="preview-frame">
              <img v-if="selected.image" :src="selected.image" />
              <div v-else class="preview-empty">
                <span>🦕</span>
                <small>Sem imagem</small>
              </div>
            </div>
            <div class="preview-caption">
              <span class="caption-label">Espécime</span>
              <strong>{{ selected.name || 'Sem nome' }}</strong>
            </div>
          </div>

          <div class="museum-form">
            <h3 class="museum-title">Editar Criatura</h3>
            <p class="museum-sub">Atualize os dados do espécime</p>

            <div class="museum-row">
              <div class="museum-field">
                <label>Nome</label>
                <input v-model="selected.name" />
              </div>
              <div class="museum-field">
                <label>Tamanho</label>
                <input v-model="selected.size" />
              </div>
            </div>

            <div class="museum-row">
              <div class="museum-field">
                <label>Dieta</label>
                <select v-model="selected.dieta">
                  <option v-for="d in dietas" :key="d" :value="d">{{ d }}</option>
                </select>
              </div>
              <div class="museum-field">
                <label>Período</label>
                <select v-model="selected.periodoId">
                  <option v-for="p in periodos" :key="p.id" :value="p.id">{{ p.name }}</option>
                </select>
              </div>
            </div>

            <div class="museum-row">
  <div class="museum-field">
    <label>Habitat</label>
    <input v-model="selected.habitat" />
  </div>

  <div class="museum-field">
    <label>Clima</label>
    <input v-model="selected.clima" />
  </div>
</div>

<div class="museum-row">
  <div class="museum-field">
    <label>Descoberta</label>
    <input v-model="selected.descoberta" />
  </div>

  <div class="museum-field">
    <label>Local</label>
    <input v-model="selected.local" />
  </div>
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

    <!-- ===== MODAL DE CONFIRMAÇÃO DE EXCLUSÃO ===== -->
    <Transition name="fade-scale">
      <div v-if="deleteModal.isOpen" class="confirm-overlay" @click.self="closeDeleteModal">
        <div class="confirm-modal">
          <div class="confirm-header">
            <div class="confirm-icon">⚠️</div>
            <h3>Confirmar Extinção</h3>
          </div>
          
          <div class="confirm-body">
            <p class="confirm-message">
              Você está prestes a remover permanentemente do acervo:
            </p>
            <div class="confirm-target">
              <span class="target-icon">🦕</span>
              <strong>{{ deleteModal.animalName }}</strong>
            </div>
            <p class="confirm-warning">
              Esta ação não pode ser desfeita. O espécime será eliminado do registro paleontológico.
            </p>
          </div>

          <div class="confirm-actions">
            <button class="btn-cancel" @click="closeDeleteModal" :disabled="deleteModal.isDeleting">
              Cancelar
            </button>
            <button 
              class="btn-delete" 
              @click="confirmDelete" 
              :disabled="deleteModal.isDeleting"
            >
              <span v-if="deleteModal.isDeleting" class="spinner"></span>
              <span v-else>🗑️ Remover Espécime</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;1,400&display=swap');

.page {
  padding: 40px 30px 60px;
  min-height: 100vh;
  color: #f5e6c8;
  background:
    radial-gradient(ellipse at top, rgba(212,175,55,0.06), transparent 60%),
    linear-gradient(180deg, #0b0a08, #14110c);
  font-family: 'Crimson Text', serif;
}

/* ===== HEADER ===== */
.page-header {
  max-width: 1100px;
  margin: 0 auto 35px;
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
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, #d4af37, transparent);
}
.header-emblem {
  width: 64px; height: 64px;
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
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
}
.header-text h1 {
  margin: 4px 0;
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
.header-stats { display: flex; gap: 12px; }
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

/* ===== FORM ===== */
.form-card {
  max-width: 900px;
  margin: 0 auto 50px;
  padding: 30px;
  border-radius: 18px;
  background: linear-gradient(160deg, #1a150e, #0b0a08);
  border: 1px solid rgba(212,175,55,0.2);
  box-shadow: 0 20px 60px rgba(0,0,0,0.6), inset 0 0 40px rgba(212,175,55,0.05);
  position: relative;
  overflow: hidden;
}
.form-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
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
  display: flex; align-items: center; justify-content: center;
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
  font-style: italic;
  font-size: 0.85rem;
  color: rgba(245,230,200,0.5);
}

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field.full { grid-column: 1 / -1; }
.field label {
  font-family: 'Cinzel', serif;
  font-size: 0.65rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(245,230,200,0.6);
}
.hint {
  font-family: 'Crimson Text', serif;
  font-style: italic;
  text-transform: none;
  letter-spacing: 0;
  font-size: 0.75rem;
  color: rgba(245,230,200,0.4);
  margin-left: 6px;
}
.field input, .field select {
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid rgba(212,175,55,0.2);
  background: rgba(0,0,0,0.5);
  color: #f5e6c8;
  font-family: 'Crimson Text', serif;
  font-size: 0.95rem;
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
  display: flex; align-items: center; justify-content: center;
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

/* ===== PERIOD SECTION ===== */
.period-section { max-width: 1100px; margin: 0 auto 50px; }
.period-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 20px;
  margin-bottom: 18px;
  border-radius: 14px;
  background: linear-gradient(90deg, rgba(212,175,55,0.1), transparent);
  border-left: 3px solid #d4af37;
}
.period-marker {
  width: 12px; height: 12px;
  border-radius: 50%;
  background: #d4af37;
  box-shadow: 0 0 12px #d4af37;
}
.period-titles { flex: 1; }
.period-eyebrow {
  font-family: 'Cinzel', serif;
  font-size: 0.6rem;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: rgba(212,175,55,0.7);
}
.period-titles h2 {
  margin: 2px 0 0;
  font-family: 'Cinzel', serif;
  font-size: 1.3rem;
  letter-spacing: 1.5px;
  color: #f5e6c8;
}
.period-count {
  padding: 6px 12px;
  border-radius: 20px;
  background: rgba(212,175,55,0.15);
  border: 1px solid rgba(212,175,55,0.3);
  font-family: 'Cinzel', serif;
  font-size: 0.7rem;
  letter-spacing: 1.5px;
  color: #d4af37;
}

/* ===== GRUPO ===== */
.group-block { margin-bottom: 20px; }
.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  margin-bottom: 14px;
  border-radius: 12px;
  background: rgba(0,0,0,0.4);
  border: 1px solid rgba(212,175,55,0.12);
  transition: all 0.2s ease;
}
.group-header:hover {
  background: rgba(212,175,55,0.08);
  border-color: rgba(212,175,55,0.25);
}
.group-titles { flex: 1; }
.group-era {
  font-family: 'Cinzel', serif;
  font-size: 0.55rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(212,175,55,0.6);
}
.group-titles h3 {
  margin: 4px 0 0;
  font-family: 'Cinzel', serif;
  font-size: 1.1rem;
  letter-spacing: 1px;
  color: #f5e6c8;
}
.group-count {
  padding: 5px 12px;
  border-radius: 20px;
  background: rgba(212,175,55,0.1);
  font-family: 'Cinzel', serif;
  font-size: 0.65rem;
  letter-spacing: 1.5px;
  color: #d4af37;
}

/* ===== GRID + CARD ===== */
.group-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  padding: 0 8px;
}
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
.card-media { position: relative; height: 170px; overflow: hidden; }
.image-wrap {
  width: 100%; height: 100%;
  transition: transform 0.5s ease;
}
.card:hover .image-wrap { transform: scale(1.08); }
.card-media img {
  width: 100%; height: 100%;
  object-fit: cover;
}
.placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
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
.card-body { padding: 16px 18px 12px; flex: 1; }
.card-body h3 {
  margin: 0 0 10px;
  font-family: 'Cinzel', serif;
  font-size: 1.1rem;
  letter-spacing: 1px;
  color: #f5e6c8;
}
.card-meta { display: flex; flex-wrap: wrap; gap: 6px; }
.meta-pill {
  padding: 4px 9px;
  border-radius: 8px;
  font-size: 0.72rem;
  letter-spacing: 0.5px;
  border: 1px solid rgba(212,175,55,0.2);
  background: rgba(0,0,0,0.4);
  color: rgba(245,230,200,0.75);
}
.meta-pill.diet { border-color: rgba(255,159,67,0.3); color: #ffb56b; background: rgba(255,159,67,0.08); }

.card-footer {
  display: flex;
  gap: 8px;
  padding: 12px 14px;
  border-top: 1px solid rgba(212,175,55,0.12);
  background: rgba(0,0,0,0.3);
}
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

/* ===== EMPTY ===== */
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

/* ===== MODAL MUSEU ===== */
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
  align-items: center; justify-content: center;
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
.museum-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.museum-field { display: flex; flex-direction: column; gap: 6px; }
.museum-field label {
  font-family: 'Cinzel', serif;
  font-size: 0.65rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(245,230,200,0.6);
}
.museum-field input, .museum-field select {
  padding: 11px 14px;
  border-radius: 10px;
  border: 1px solid rgba(212,175,55,0.2);
  background: rgba(0,0,0,0.5);
  color: #f5e6c8;
  font-family: 'Crimson Text', serif;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}
.museum-field input:focus, .museum-field select:focus {
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

/* =========================
   MODAL DE CONFIRMAÇÃO DE EXCLUSÃO - ESTILO MUSEU
========================= */
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
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
  from { transform: translateY(40px) scale(0.95); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

.confirm-header {
  padding: 28px 24px 18px;
  text-align: center;
  background: linear-gradient(180deg, rgba(255,80,80,0.08), transparent);
  border-bottom: 1px solid rgba(255,80,80,0.15);
}

.confirm-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  background: rgba(255,80,80,0.12);
  border: 2px solid rgba(255,80,80,0.3);
  box-shadow: 0 0 30px rgba(255,80,80,0.2);
  animation: pulseWarning 2s ease-in-out infinite;
}

@keyframes pulseWarning {
  0%, 100% { box-shadow: 0 0 30px rgba(255,80,80,0.2); }
  50% { box-shadow: 0 0 50px rgba(255,80,80,0.4); }
}

.confirm-header h3 {
  margin: 0;
  font-family: 'Cinzel', serif;
  font-size: 1.3rem;
  letter-spacing: 2px;
  color: #ff8a8a;
}

.confirm-body {
  padding: 24px 28px;
  text-align: center;
}

.confirm-message {
  margin: 0 0 16px;
  font-size: 0.95rem;
  color: rgba(245,230,200,0.7);
  line-height: 1.5;
}

.confirm-target {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 18px;
  margin: 0 0 16px;
  border-radius: 12px;
  background: rgba(212,175,55,0.08);
  border: 1px solid rgba(212,175,55,0.2);
}

.target-icon {
  font-size: 1.4rem;
}

.confirm-target strong {
  font-family: 'Cinzel', serif;
  font-size: 1.1rem;
  color: #d4af37;
  letter-spacing: 1px;
}

.confirm-warning {
  margin: 0;
  padding: 12px 16px;
  border-radius: 10px;
  background: rgba(255,80,80,0.06);
  border: 1px solid rgba(255,80,80,0.15);
  font-size: 0.8rem;
  font-style: italic;
  color: rgba(255,138,138,0.7);
  line-height: 1.4;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  padding: 0 24px 24px;
}

.btn-cancel {
  flex: 1;
  padding: 14px 20px;
  border-radius: 12px;
  background: transparent;
  border: 1px solid rgba(245,230,200,0.25);
  color: rgba(245,230,200,0.8);
  font-family: 'Cinzel', serif;
  font-size: 0.8rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.25s ease;
}

.btn-cancel:hover:not(:disabled) {
  background: rgba(245,230,200,0.08);
  border-color: rgba(245,230,200,0.4);
}

.btn-delete {
  flex: 1.3;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #ff5a5a, #c73e3e);
  color: #fff;
  font-family: 'Cinzel', serif;
  font-size: 0.8rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 6px 20px rgba(255,90,90,0.3);
}

.btn-delete:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(255,90,90,0.5);
}

.btn-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Transições Vue */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
  max-height: 1000px;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
}

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

/* RESPONSIVE */
@media (max-width: 800px) {
  .page-header { flex-direction: column; text-align: center; }
  .form-grid { grid-template-columns: 1fr; }
  .museum-body { grid-template-columns: 1fr; }
  .museum-preview { border-right: none; border-bottom: 1px solid rgba(212,175,55,0.15); }
  .preview-frame { aspect-ratio: 16/9; }
  .museum-row { grid-template-columns: 1fr; }
  .group-grid { grid-template-columns: 1fr; }
  .confirm-actions { flex-direction: column; }
  .btn-delete, .btn-cancel { flex: 1; }
}
</style>
