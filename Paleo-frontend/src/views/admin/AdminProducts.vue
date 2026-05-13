<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import api from "../../services/api";

/* =========================================================
   TYPES
========================================================= */
type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
};

/* =========================================================
   STATE
========================================================= */
const products = ref<Product[]>([]);
const loading = ref(true);
const search = ref("");

const name = ref("");
const price = ref<number | string>("");
const description = ref("");
const file = ref<File | null>(null);
const preview = ref<string>("");
const submitting = ref(false);

/* MODAIS */
const showDeleteModal = ref(false);
const showEditModal = ref(false);
const targetProduct = ref<Product | null>(null);

const editName = ref("");
const editPrice = ref<number | string>("");
const editDescription = ref("");

/* TOASTS */
const toasts = ref<{ id: number; text: string; type: "success" | "error" | "info" }[]>([]);
let toastSeed = 0;

function pushToast(text: string, type: "success" | "error" | "info" = "success") {
  const id = ++toastSeed;
  toasts.value.push({ id, text, type });
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, 3200);
}

/* =========================================================
   COMPUTED
========================================================= */
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return products.value;
  return products.value.filter(p =>
    p.name?.toLowerCase().includes(q) ||
    p.description?.toLowerCase().includes(q)
  );
});

const totalValue = computed(() =>
  products.value.reduce((acc, p) => acc + (Number(p.price) || 0), 0)
);

function fossilCode(id: string) {
  const h = (id || "").toString().slice(-4).toUpperCase().padStart(4, "0");
  return `ACH-${h}`;
}

function formatPrice(v: number | string) {
  const n = Number(v) || 0;
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* =========================================================
   API
========================================================= */
async function loadProducts() {
  try {
    loading.value = true;
    const { data } = await api.get("/products");
    products.value = data;
  } catch {
    pushToast("Falha ao carregar o acervo", "error");
  } finally {
    loading.value = false;
  }
}

function handleFile(event: any) {
  const selected = event.target.files?.[0];
  if (!selected) return;
  file.value = selected;
  preview.value = URL.createObjectURL(selected);
}

function clearForm() {
  name.value = "";
  price.value = "";
  description.value = "";
  file.value = null;
  preview.value = "";
}

async function createProduct() {
  if (!name.value || !price.value) {
    pushToast("Preencha nome e preço", "error");
    return;
  }

  try {
    submitting.value = true;
    let imageUrl = "";

    if (file.value) {
      const formData = new FormData();
      formData.append("file", file.value);
      const uploadResponse = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      imageUrl = uploadResponse.data.imageUrl;
    }

    await api.post("/products", {
      name: name.value,
      price: Number(price.value),
      description: description.value,
      image: imageUrl
    });

    clearForm();
    await loadProducts();
    pushToast("Peça catalogada no acervo!", "success");
  } catch {
    pushToast("Erro ao catalogar a peça", "error");
  } finally {
    submitting.value = false;
  }
}

/* DELETE FLOW */
function askDelete(product: Product) {
  targetProduct.value = product;
  showDeleteModal.value = true;
}

async function confirmDelete() {
  if (!targetProduct.value) return;
  try {
    await api.delete(`/products/${targetProduct.value.id}`);
    pushToast("Peça removida do acervo", "info");
    await loadProducts();
  } catch {
    pushToast("Erro ao remover a peça", "error");
  } finally {
    showDeleteModal.value = false;
    targetProduct.value = null;
  }
}

function cancelDelete() {
  showDeleteModal.value = false;
  targetProduct.value = null;
}

/* EDIT FLOW */
function askEdit(product: Product) {
  targetProduct.value = product;
  editName.value = product.name;
  editPrice.value = product.price;
  editDescription.value = product.description;
  showEditModal.value = true;
}

async function confirmEdit() {
  if (!targetProduct.value) return;
  if (!editName.value || !editPrice.value) {
    pushToast("Nome e preço são obrigatórios", "error");
    return;
  }
  try {
    await api.put(`/products/${targetProduct.value.id}`, {
      name: editName.value,
      price: Number(editPrice.value),
      description: editDescription.value,
      image: targetProduct.value.image
    });
    pushToast("Registro atualizado", "success");
    showEditModal.value = false;
    targetProduct.value = null;
    await loadProducts();
  } catch {
    pushToast("Erro ao atualizar registro", "error");
  }
}

function cancelEdit() {
  showEditModal.value = false;
  targetProduct.value = null;
}

onMounted(loadProducts);
</script>

<template>
  <div class="page">
    <!-- BACKGROUND DECORATIVO -->
    <div class="bg-grain"></div>
    <div class="bg-glow"></div>

    <!-- HEADER -->
    <header class="hero">
      <div class="hero-tag">⚱ Curadoria · Acervo</div>
      <h1 class="hero-title">
        Catálogo de <span class="accent">Achados</span>
      </h1>
      <p class="hero-sub">
        Registre, examine e cataloge cada peça do museu pré-histórico.
      </p>

      <div class="stats">
        <div class="stat">
          <span class="stat-num">{{ products.length }}</span>
          <span class="stat-label">Peças no acervo</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <span class="stat-num">R$ {{ formatPrice(totalValue) }}</span>
          <span class="stat-label">Valor estimado</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <span class="stat-num">{{ filtered.length }}</span>
          <span class="stat-label">Em exibição</span>
        </div>
      </div>
    </header>

    <!-- FORMULÁRIO -->
    <section class="panel form-panel">
      <div class="panel-head">
        <span class="panel-icon">🦴</span>
        <div>
          <h2>Nova Peça</h2>
          <p>Catalogue um novo item para o acervo</p>
        </div>
      </div>

      <div class="form-grid">
        <!-- UPLOAD -->
        <label class="dropzone" :class="{ filled: preview }">
          <input type="file" accept="image/*" @change="handleFile" hidden />
          <div v-if="!preview" class="dz-empty">
            <div class="dz-icon">📷</div>
            <strong>Imagem da peça</strong>
            <span>Clique para selecionar uma foto</span>
          </div>
          <div v-else class="dz-preview">
            <img :src="preview" alt="Pré-visualização" />
            <span class="dz-replace">Trocar imagem</span>
          </div>
        </label>

        <div class="form-fields">
          <div class="field">
            <label>Nome da peça</label>
            <input v-model="name" placeholder="Ex: Crânio de Tyrannosaurus" />
          </div>

          <div class="field">
            <label>Preço (R$)</label>
            <input v-model="price" type="number" placeholder="0,00" />
          </div>

          <div class="field">
            <label>Descrição</label>
            <textarea
              v-model="description"
              rows="4"
              placeholder="Detalhes, era, origem da peça..."
            ></textarea>
          </div>

          <button
            class="btn-primary"
            :disabled="submitting"
            @click="createProduct"
          >
            <span v-if="!submitting">✦ Catalogar Peça</span>
            <span v-else>Registrando...</span>
          </button>
        </div>
      </div>
    </section>

    <!-- BUSCA -->
    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input v-model="search" placeholder="Buscar no acervo..." />
      <span class="search-count">{{ filtered.length }} resultado(s)</span>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="loading">
      <div class="bone-loader">🦴</div>
      <p>Escavando o acervo...</p>
    </div>

    <!-- VAZIO -->
    <div v-else-if="!filtered.length" class="empty">
      <div class="empty-icon">🏺</div>
      <h3>Nenhuma peça encontrada</h3>
      <p>O acervo está aguardando novas descobertas.</p>
    </div>

    <!-- GRID -->
    <section v-else class="products">
      <article
        v-for="(p, i) in filtered"
        :key="p.id"
        class="card"
        :style="{ animationDelay: `${i * 60}ms` }"
      >
        <div class="card-frame">
          <span class="corner tl"></span>
          <span class="corner tr"></span>
          <span class="corner bl"></span>
          <span class="corner br"></span>

          <div class="card-media">
            <img v-if="p.image" :src="p.image" :alt="p.name" />
            <div v-else class="card-placeholder">🦖</div>
            <span class="card-code">{{ fossilCode(p.id) }}</span>
          </div>

          <div class="card-body">
            <h3 class="card-title">{{ p.name }}</h3>
            <p class="card-desc">{{ p.description || "Sem descrição registrada." }}</p>

            <div class="card-foot">
              <span class="price">
                <small>R$</small> {{ formatPrice(p.price) }}
              </span>
              <div class="actions">
                <button class="ico edit" @click="askEdit(p)" title="Editar">✎</button>
                <button class="ico delete" @click="askDelete(p)" title="Remover">✕</button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </section>

    <!-- MODAL DELETE -->
    <Teleport to="body">
      <Transition name="pop">
        <div v-if="showDeleteModal" class="overlay" @click.self="cancelDelete">
          <div class="modal danger-modal">
            <span class="corner tl"></span>
            <span class="corner tr"></span>
            <span class="corner bl"></span>
            <span class="corner br"></span>

            <div class="seal danger-seal">⚠</div>
            <h3>Remover do Acervo</h3>
            <div class="ornament"></div>
            <p>
              Tem certeza que deseja remover
              <strong>{{ targetProduct?.name }}</strong>
              permanentemente do catálogo?
            </p>
            <div class="modal-actions">
              <button class="btn-ghost" @click="cancelDelete">Cancelar</button>
              <button class="btn-danger" @click="confirmDelete">Remover</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- MODAL EDIT -->
    <Teleport to="body">
      <Transition name="pop">
        <div v-if="showEditModal" class="overlay" @click.self="cancelEdit">
          <div class="modal edit-modal">
            <span class="corner tl"></span>
            <span class="corner tr"></span>
            <span class="corner bl"></span>
            <span class="corner br"></span>

            <div class="seal">✎</div>
            <h3>Revisar Registro</h3>
            <div class="ornament"></div>

            <div class="field">
              <label>Nome</label>
              <input v-model="editName" />
            </div>
            <div class="field">
              <label>Preço</label>
              <input v-model="editPrice" type="number" />
            </div>
            <div class="field">
              <label>Descrição</label>
              <textarea v-model="editDescription" rows="3"></textarea>
            </div>

            <div class="modal-actions">
              <button class="btn-ghost" @click="cancelEdit">Cancelar</button>
              <button class="btn-primary" @click="confirmEdit">Salvar alterações</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- TOASTS -->
    <Teleport to="body">
      <div class="toasts">
        <TransitionGroup name="toast">
          <div
            v-for="t in toasts"
            :key="t.id"
            class="toast"
            :class="t.type"
          >
            <span class="toast-icon">
              {{ t.type === 'success' ? '✦' : t.type === 'error' ? '⚠' : '◆' }}
            </span>
            <span>{{ t.text }}</span>
          </div>
        </TransitionGroup>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* =========================================================
   BASE
========================================================= */
.page {
  position: relative;
  min-height: 100vh;
  padding: 60px 40px 80px;
  color: #f1d98a;
  font-family: 'Crimson Text', serif;
  background:
    radial-gradient(circle at 20% 0%, rgba(212,175,55,.10), transparent 50%),
    radial-gradient(circle at 100% 100%, rgba(168,50,50,.08), transparent 50%),
    linear-gradient(180deg, #14100b 0%, #1a130c 50%, #0f0a06 100%);
  overflow: hidden;
}

.bg-grain {
  position: absolute; inset: 0;
  background-image: radial-gradient(rgba(212,175,55,.05) 1px, transparent 1px);
  background-size: 22px 22px;
  pointer-events: none;
  opacity: .5;
}

.bg-glow {
  position: absolute;
  top: -200px; left: 50%;
  transform: translateX(-50%);
  width: 800px; height: 400px;
  background: radial-gradient(ellipse, rgba(212,175,55,.18), transparent 70%);
  filter: blur(40px);
  pointer-events: none;
}

/* =========================================================
   HERO
========================================================= */
.hero {
  position: relative;
  text-align: center;
  margin-bottom: 50px;
  animation: fadeUp .8s ease both;
}

.hero-tag {
  display: inline-block;
  padding: 6px 18px;
  border: 1px solid rgba(212,175,55,.4);
  border-radius: 100px;
  font-family: 'Cinzel', serif;
  font-size: .75rem;
  letter-spacing: 4px;
  color: #d4af37;
  text-transform: uppercase;
  margin-bottom: 18px;
  background: rgba(212,175,55,.05);
}

.hero-title {
  font-family: 'Cinzel', serif;
  font-size: clamp(2rem, 5vw, 3.4rem);
  font-weight: 700;
  margin: 0 0 14px;
  letter-spacing: 3px;
  color: #f1d98a;
}

.hero-title .accent {
  background: linear-gradient(135deg, #d4af37, #f1d98a, #b8860b);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-sub {
  color: #c8b388;
  font-style: italic;
  font-size: 1.05rem;
  margin-bottom: 30px;
}

.stats {
  display: inline-flex;
  align-items: center;
  gap: 30px;
  padding: 18px 30px;
  border: 1px solid rgba(212,175,55,.2);
  border-radius: 12px;
  background: rgba(20,14,8,.6);
  backdrop-filter: blur(8px);
}

.stat { display: flex; flex-direction: column; gap: 4px; }

.stat-num {
  font-family: 'Cinzel', serif;
  font-size: 1.4rem;
  color: #d4af37;
  font-weight: 600;
}

.stat-label {
  font-size: .75rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #8a7551;
}

.stat-divider {
  width: 1px; height: 36px;
  background: linear-gradient(to bottom, transparent, rgba(212,175,55,.4), transparent);
}

/* =========================================================
   PANEL / FORM
========================================================= */
.panel {
  position: relative;
  background: linear-gradient(145deg, rgba(26,19,12,.95), rgba(20,14,8,.95));
  border: 1px solid rgba(212,175,55,.18);
  border-radius: 18px;
  padding: 32px;
  margin-bottom: 40px;
  box-shadow: 0 20px 60px rgba(0,0,0,.5), inset 0 1px 0 rgba(212,175,55,.05);
  animation: fadeUp .8s .15s ease both;
}

.panel-head {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(212,175,55,.12);
}

.panel-icon {
  font-size: 2rem;
  filter: drop-shadow(0 0 8px rgba(212,175,55,.4));
}

.panel-head h2 {
  font-family: 'Cinzel', serif;
  font-size: 1.4rem;
  margin: 0;
  color: #f1d98a;
  letter-spacing: 2px;
}

.panel-head p {
  margin: 4px 0 0;
  color: #8a7551;
  font-size: .9rem;
  font-style: italic;
}

.form-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 28px;
}

/* DROPZONE */
.dropzone {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed rgba(212,175,55,.35);
  border-radius: 14px;
  background: rgba(0,0,0,.25);
  cursor: pointer;
  transition: all .3s ease;
  min-height: 280px;
  overflow: hidden;
}

.dropzone:hover {
  border-color: #d4af37;
  background: rgba(212,175,55,.05);
}

.dropzone.filled { border-style: solid; }

.dz-empty {
  text-align: center;
  color: #8a7551;
  padding: 20px;
}

.dz-icon { font-size: 2.6rem; margin-bottom: 10px; }

.dz-empty strong {
  display: block;
  font-family: 'Cinzel', serif;
  color: #d4af37;
  letter-spacing: 2px;
  margin-bottom: 6px;
}

.dz-empty span { font-size: .85rem; }

.dz-preview {
  position: relative;
  width: 100%; height: 100%;
}

.dz-preview img {
  width: 100%; height: 100%;
  object-fit: cover;
  min-height: 280px;
}

.dz-replace {
  position: absolute;
  bottom: 12px; left: 12px;
  background: rgba(0,0,0,.7);
  color: #d4af37;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: .8rem;
  letter-spacing: 1px;
  font-family: 'Cinzel', serif;
}

/* FIELDS */
.form-fields { display: flex; flex-direction: column; gap: 14px; }

.field { display: flex; flex-direction: column; gap: 6px; }

.field label {
  font-family: 'Cinzel', serif;
  font-size: .75rem;
  letter-spacing: 3px;
  color: #d4af37;
  text-transform: uppercase;
}

.field input,
.field textarea {
  padding: 12px 14px;
  background: rgba(0,0,0,.35);
  border: 1px solid rgba(212,175,55,.2);
  border-radius: 8px;
  color: #f1d98a;
  font-family: 'Crimson Text', serif;
  font-size: 1rem;
  transition: all .25s ease;
  resize: vertical;
}

.field input:focus,
.field textarea:focus {
  outline: none;
  border-color: #d4af37;
  background: rgba(212,175,55,.05);
  box-shadow: 0 0 0 3px rgba(212,175,55,.1);
}

/* BUTTONS */
.btn-primary {
  margin-top: 6px;
  padding: 14px;
  background: linear-gradient(135deg, #d4af37, #b8860b);
  color: #1a130c;
  border: none;
  border-radius: 10px;
  font-family: 'Cinzel', serif;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  font-size: .9rem;
  cursor: pointer;
  transition: all .3s ease;
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent, rgba(255,255,255,.3), transparent);
  transform: translateX(-100%);
  transition: transform .6s ease;
}

.btn-primary:hover::before { transform: translateX(100%); }

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(212,175,55,.4);
}

.btn-primary:disabled {
  opacity: .5;
  cursor: not-allowed;
}

.btn-ghost {
  padding: 12px 24px;
  background: transparent;
  border: 1px solid rgba(212,175,55,.3);
  color: #d4af37;
  border-radius: 8px;
  font-family: 'Cinzel', serif;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: .8rem;
  cursor: pointer;
  transition: all .25s ease;
}

.btn-ghost:hover {
  background: rgba(212,175,55,.08);
  border-color: #d4af37;
}

.btn-danger {
  padding: 12px 24px;
  background: linear-gradient(135deg, #a83232, #6e1f1f);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-family: 'Cinzel', serif;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: .8rem;
  cursor: pointer;
  transition: all .25s ease;
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(168,50,50,.4);
}

/* =========================================================
   SEARCH BAR
========================================================= */
.search-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  background: rgba(20,14,8,.7);
  border: 1px solid rgba(212,175,55,.18);
  border-radius: 12px;
  margin-bottom: 30px;
  backdrop-filter: blur(6px);
}

.search-icon { font-size: 1.1rem; opacity: .6; }

.search-bar input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #f1d98a;
  font-family: 'Crimson Text', serif;
  font-size: 1.05rem;
}

.search-bar input::placeholder { color: #6e5a3f; font-style: italic; }

.search-count {
  font-family: 'Cinzel', serif;
  font-size: .75rem;
  color: #8a7551;
  letter-spacing: 2px;
  text-transform: uppercase;
}

/* =========================================================
   GRID DE PRODUTOS
========================================================= */
.products {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 28px;
}

.card {
  animation: fadeUp .6s ease both;
  perspective: 1000px;
}

.card-frame {
  position: relative;
  background: linear-gradient(160deg, #1f1710 0%, #15100a 100%);
  border: 1px solid rgba(212,175,55,.2);
  border-radius: 16px;
  overflow: hidden;
  transition: all .4s cubic-bezier(.2,.8,.2,1);
  box-shadow: 0 10px 30px rgba(0,0,0,.4);
}

.card-frame:hover {
  transform: translateY(-8px) rotateX(2deg);
  border-color: rgba(212,175,55,.5);
  box-shadow: 0 25px 60px rgba(0,0,0,.6), 0 0 30px rgba(212,175,55,.2);
}

/* CORNERS */
.corner {
  position: absolute;
  width: 18px; height: 18px;
  border: 2px solid #d4af37;
  opacity: .6;
  pointer-events: none;
  z-index: 2;
}

.corner.tl { top: 8px; left: 8px; border-right: none; border-bottom: none; }
.corner.tr { top: 8px; right: 8px; border-left: none; border-bottom: none; }
.corner.bl { bottom: 8px; left: 8px; border-right: none; border-top: none; }
.corner.br { bottom: 8px; right: 8px; border-left: none; border-top: none; }

.card-media {
  position: relative;
  height: 220px;
  background: #0a0704;
  overflow: hidden;
}

.card-media img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform .8s ease;
  filter: sepia(15%) saturate(110%);
}

.card-frame:hover .card-media img {
  transform: scale(1.08);
  filter: sepia(0%) saturate(120%);
}

.card-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 4rem;
  opacity: .3;
}

.card-code {
  position: absolute;
  top: 14px; right: 14px;
  background: rgba(0,0,0,.75);
  border: 1px solid rgba(212,175,55,.4);
  padding: 4px 10px;
  border-radius: 4px;
  font-family: 'Cinzel', serif;
  font-size: .7rem;
  letter-spacing: 2px;
  color: #d4af37;
  backdrop-filter: blur(4px);
}

.card-body { padding: 20px; }

.card-title {
  font-family: 'Cinzel', serif;
  font-size: 1.15rem;
  margin: 0 0 8px;
  color: #f1d98a;
  letter-spacing: 1px;
}

.card-desc {
  color: #b8a378;
  font-size: .9rem;
  line-height: 1.5;
  margin: 0 0 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 14px;
  border-top: 1px solid rgba(212,175,55,.12);
}

.price {
  font-family: 'Cinzel', serif;
  font-size: 1.3rem;
  color: #d4af37;
  font-weight: 600;
}

.price small {
  font-size: .7rem;
  opacity: .7;
  margin-right: 2px;
}

.actions { display: flex; gap: 8px; }

.ico {
  width: 36px; height: 36px;
  border: 1px solid rgba(212,175,55,.3);
  border-radius: 8px;
  background: rgba(0,0,0,.3);
  color: #d4af37;
  cursor: pointer;
  font-size: 1rem;
  transition: all .25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ico.edit:hover {
  background: #d4af37;
  color: #1a130c;
  transform: rotate(-8deg);
}

.ico.delete:hover {
  background: #a83232;
  color: #fff;
  border-color: #a83232;
  transform: rotate(8deg);
}

/* =========================================================
   LOADING / EMPTY
========================================================= */
.loading, .empty {
  text-align: center;
  padding: 80px 20px;
  color: #8a7551;
}

.bone-loader, .empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  animation: bob 2s ease-in-out infinite;
}

.empty h3 {
  font-family: 'Cinzel', serif;
  color: #d4af37;
  letter-spacing: 2px;
  margin: 0 0 8px;
}

/* =========================================================
   MODAIS
========================================================= */
.overlay {
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(60,30,10,.6), rgba(0,0,0,.85));
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  position: relative;
  background: linear-gradient(145deg, #1f1710, #14100a);
  border: 1px solid rgba(212,175,55,.3);
  border-radius: 18px;
  padding: 40px 36px;
  max-width: 460px;
  width: 100%;
  text-align: center;
  box-shadow: 0 30px 80px rgba(0,0,0,.7), 0 0 60px rgba(212,175,55,.15);
}

.edit-modal { max-width: 520px; text-align: left; }

.seal {
  width: 64px; height: 64px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: radial-gradient(circle, #d4af37, #8b6914);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: #1a130c;
  animation: pulseSeal 2s ease-in-out infinite;
  box-shadow: 0 0 30px rgba(212,175,55,.5);
}

.danger-seal {
  background: radial-gradient(circle, #d4af37, #a83232);
  color: #fff;
}

.modal h3 {
  font-family: 'Cinzel', serif;
  font-size: 1.4rem;
  letter-spacing: 3px;
  color: #f1d98a;
  margin: 0 0 14px;
  text-transform: uppercase;
}

.edit-modal h3 { text-align: center; }

.ornament {
  width: 60%;
  height: 1px;
  margin: 0 auto 20px;
  background: linear-gradient(to right, transparent, #d4af37, transparent);
  position: relative;
}

.ornament::after {
  content: '◆';
  position: absolute;
  top: -10px; left: 50%;
  transform: translateX(-50%);
  color: #d4af37;
  background: #1a130c;
  padding: 0 8px;
  font-size: .7rem;
}

.modal p {
  color: #c8b388;
  font-style: italic;
  line-height: 1.6;
  margin: 0 0 24px;
}

.modal p strong { color: #d4af37; font-style: normal; }

.modal .field { margin-bottom: 14px; }

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 22px;
}

/* =========================================================
   TOASTS
========================================================= */
.toasts {
  position: fixed;
  top: 24px; right: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 2000;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: linear-gradient(145deg, #1f1710, #14100a);
  border: 1px solid rgba(212,175,55,.4);
  border-radius: 10px;
  color: #f1d98a;
  font-family: 'Cinzel', serif;
  font-size: .9rem;
  letter-spacing: 1px;
  box-shadow: 0 10px 30px rgba(0,0,0,.5);
  min-width: 260px;
}

.toast.success { border-left: 4px solid #d4af37; }
.toast.error   { border-left: 4px solid #a83232; }
.toast.info    { border-left: 4px solid #6db7d4; }

.toast-icon {
  font-size: 1.1rem;
  color: #d4af37;
}

.toast.error .toast-icon { color: #ff6b6b; }
.toast.info .toast-icon { color: #6db7d4; }

/* =========================================================
   TRANSITIONS
========================================================= */
.pop-enter-active, .pop-leave-active {
  transition: all .35s cubic-bezier(.2,.8,.2,1);
}
.pop-enter-from, .pop-leave-to {
  opacity: 0;
  transform: scale(.92) translateY(20px) rotateX(8deg);
}

.toast-enter-active, .toast-leave-active {
  transition: all .35s ease;
}
.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translateX(80px);
}

/* =========================================================
   ANIMATIONS
========================================================= */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes bob {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-10px); }
}

@keyframes pulseSeal {
  0%, 100% { transform: scale(1); box-shadow: 0 0 30px rgba(212,175,55,.5); }
  50%      { transform: scale(1.05); box-shadow: 0 0 45px rgba(212,175,55,.8); }
}

/* =========================================================
   RESPONSIVE
========================================================= */
@media (max-width: 768px) {
  .page { padding: 30px 16px 60px; }
  .form-grid { grid-template-columns: 1fr; }
  .stats { flex-direction: column; gap: 14px; padding: 16px 24px; }
  .stat-divider { width: 60px; height: 1px; }
}
</style>
