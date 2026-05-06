<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import api from "../services/api";

const animals = ref<any[]>([]);
const eras = ref<any[]>([]);
const periodos = ref<any[]>([]);

const search = ref("");
const selectedEra = ref("");
const selectedPeriodo = ref("");
const selectedDieta = ref("");
const loading = ref(true);

/* NORMALIZADOR */
const normalize = (v: string) =>
  (v || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

/* LOAD */
onMounted(async () => {
  try {
    const [aRes, eRes, pRes] = await Promise.all([
      api.get("/animals"),
      api.get("/eras"),
      api.get("/periodos"),
    ]);
    animals.value = aRes.data;
    eras.value = eRes.data;
    periodos.value = pRes.data;
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
  } finally {
    loading.value = false;
  }
});

const totalAnimals = computed(() => animals.value.length);
const totalEras = computed(() => eras.value.length);
const totalPeriodos = computed(() => periodos.value.length);

const filteredPeriodos = computed(() => {
  if (!selectedEra.value) return periodos.value;
  return periodos.value.filter((p) => p.eraId === selectedEra.value);
});

const dietasDisponiveis = computed(() => {
  const set = new Set(
    animals.value.map((a) => normalize(a.dieta)).filter(Boolean)
  );
  return Array.from(set);
});

const filteredAnimals = computed(() => {
  return animals.value.filter((a) => {
    const matchSearch = normalize(a.name).includes(normalize(search.value));
    const matchEra =
      !selectedEra.value ||
      String(a.periodo?.eraId) === String(selectedEra.value);
    const matchPeriodo =
      !selectedPeriodo.value ||
      String(a.periodoId) === String(selectedPeriodo.value);
    const matchDieta =
      !selectedDieta.value ||
      normalize(a.dieta) === normalize(selectedDieta.value);
    return matchSearch && matchEra && matchPeriodo && matchDieta;
  });
});

const grouped = computed(() => {
  const map: any = {};
  filteredAnimals.value
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((a) => {
      const eraName =
        eras.value.find((e) => e.id === a.periodo?.eraId)?.name ||
        "Era desconhecida";
      const periodoName = a.periodo?.name || "Período desconhecido";
      if (!map[eraName]) map[eraName] = {};
      if (!map[eraName][periodoName]) map[eraName][periodoName] = [];
      map[eraName][periodoName].push(a);
    });
  return map;
});

const dietIcon = (d: string) => {
  const n = normalize(d);
  if (n.includes("carn")) return "🦴";
  if (n.includes("herb")) return "🌿";
  if (n.includes("oni")) return "🍖";
  if (n.includes("pisc")) return "🐟";
  if (n.includes("inset")) return "🐛";
  return "✦";
};

const clearFilters = () => {
  search.value = "";
  selectedEra.value = "";
  selectedPeriodo.value = "";
  selectedDieta.value = "";
};

const hasFilters = computed(
  () =>
    search.value ||
    selectedEra.value ||
    selectedPeriodo.value ||
    selectedDieta.value
);

/* =========================
   MODAL — NOVO VISUAL
========================= */
const selectedAnimal = ref<any | null>(null);
const activeTab = ref<"ficha" | "habitat" | "descoberta">("ficha");

const openAnimal = (animal: any) => {
  selectedAnimal.value = animal;
  activeTab.value = "ficha";
};
const closeAnimal = () => {
  selectedAnimal.value = null;
};

const fossilCode = (id: any) => {
  const base = String(id ?? Math.random())
    .replace(/\D/g, "")
    .padStart(4, "0")
    .slice(-4);
  return `FSL-${base}`;
};

const eraOf = (a: any) =>
  eras.value.find((e) => e.id === a?.periodo?.eraId)?.name || "Era desconhecida";
</script>

<template>
  <div class="page">
    <!-- AURORA / FUNDO ANIMADO -->
    <div class="aurora">
      <span class="blob blob-a"></span>
      <span class="blob blob-b"></span>
      <span class="blob blob-c"></span>
      <div class="grain"></div>
    </div>

    <!-- HEADER -->
    <header class="header">
      <div class="brand">
        <div class="crest">ᛝ</div>
        <div>
          <p class="eyebrow">Coleção Permanente</p>
          <h1>Museu dos Animais</h1>
          <p class="tagline">
            Uma travessia pelas eras pré-históricas — espécies, períodos e
            dietas reunidos em um só acervo.
          </p>
        </div>
      </div>

      <div class="stats">
        <div class="stat">
          <span class="stat-num">{{ totalAnimals }}</span>
          <span class="stat-label">Espécies</span>
        </div>
        <div class="divider"></div>
        <div class="stat">
          <span class="stat-num">{{ totalEras }}</span>
          <span class="stat-label">Eras</span>
        </div>
        <div class="divider"></div>
        <div class="stat">
          <span class="stat-num">{{ totalPeriodos }}</span>
          <span class="stat-label">Períodos</span>
        </div>
      </div>
    </header>

    <!-- CONTROLES -->
    <section class="controls-card">
      <div class="search-wrap">
        <span class="search-icon">⌕</span>
        <input v-model="search" placeholder="Buscar espécie pelo nome..." />
      </div>

      <div class="selects">
        <label class="select">
          <span>Era</span>
          <select v-model="selectedEra">
            <option value="">Todas</option>
            <option v-for="e in eras" :key="e.id" :value="e.id">
              {{ e.name }}
            </option>
          </select>
        </label>

        <label class="select" :class="{ disabled: !selectedEra }">
          <span>Período</span>
          <select v-model="selectedPeriodo" :disabled="!selectedEra">
            <option value="">Todos</option>
            <option v-for="p in filteredPeriodos" :key="p.id" :value="p.id">
              {{ p.name }}
            </option>
          </select>
        </label>

        <label class="select">
          <span>Dieta</span>
          <select v-model="selectedDieta">
            <option value="">Todas</option>
            <option v-for="d in dietasDisponiveis" :key="d" :value="d">
              {{ d }}
            </option>
          </select>
        </label>

        <button class="clear" :disabled="!hasFilters" @click="clearFilters">
          Limpar
        </button>
      </div>

      <div class="result-line">
        <span class="dot"></span>
        <strong>{{ filteredAnimals.length }}</strong>
        de {{ totalAnimals }} espécies em exibição
      </div>
    </section>

    <!-- LOADING -->
    <div v-if="loading" class="state">
      <div class="loader"></div>
      <p>Abrindo as vitrines...</p>
    </div>

    <!-- VAZIO -->
    <div v-else-if="filteredAnimals.length === 0" class="state">
      <div class="empty-icon">𓃥</div>
      <h3>Nenhuma espécie encontrada</h3>
      <p>Ajuste os filtros ou limpe a busca para reabrir o acervo.</p>
      <button class="clear ghost" @click="clearFilters">Limpar filtros</button>
    </div>

    <!-- ACERVO -->
    <div v-else class="acervo">
      <div
        v-for="(periodosMap, era, eraIndex) in grouped"
        :key="era"
        class="era"
      >
        <div class="era-head">
          <div class="era-mark">
            {{ String(eraIndex + 1).padStart(2, "0") }}
          </div>
          <div>
            <p class="eyebrow small">Era</p>
            <h2 class="era-title">{{ era }}</h2>
          </div>
          <div class="era-line"></div>
          <div class="era-count">
            {{
              Object.values(periodosMap).reduce(
                (acc: number, l: any) => acc + l.length,
                0
              )
            }}
            espécies
          </div>
        </div>

        <div
          v-for="(animalsList, periodo) in periodosMap"
          :key="periodo"
          class="periodo"
        >
          <div class="periodo-head">
            <span class="bullet"></span>
            <h3 class="periodo-title">{{ periodo }}</h3>
            <span class="periodo-count">{{ animalsList.length }}</span>
          </div>

          <div class="grid">
            <article
              v-for="animal in animalsList"
              :key="animal.id"
              class="card clickable"
              @click="openAnimal(animal)"
            >
              <span class="card-glow"></span>
              <div class="card-media">
                <img
                  v-if="animal.image"
                  :src="animal.image"
                  :alt="animal.name"
                />
                <div v-else class="no-image">𓆉</div>
                <span class="card-tag">{{ periodo }}</span>
              </div>

              <div class="card-body">
                <h4>{{ animal.name }}</h4>
                <div class="card-meta">
                  <span class="chip">
                    {{ dietIcon(animal.dieta) }}
                    {{ animal.dieta || "Dieta desconhecida" }}
                  </span>
                  <span class="chip ghost">
                    ⇲ {{ animal.size || "Tamanho —" }}
                  </span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>

    <!-- =========================================================
         MODAL — NOVO VISUAL "FICHA DE EXPEDIÇÃO"
    ========================================================= -->
    <transition name="fade">
      <div v-if="selectedAnimal" class="xmodal-overlay" @click="closeAnimal">
        <div class="xmodal" @click.stop>
          <span class="corner tl"></span>
          <span class="corner tr"></span>
          <span class="corner bl"></span>
          <span class="corner br"></span>

          <button class="xclose" @click="closeAnimal" aria-label="Fechar">
            ✕
          </button>

          <div class="xmodal-grid">
            <!-- LADO ESQUERDO: VITRINE -->
            <aside class="xmedia">
              <div class="xmedia-frame">
                <img
                  v-if="selectedAnimal.image"
                  :src="selectedAnimal.image"
                  :alt="selectedAnimal.name"
                />
                <div v-else class="xmedia-empty">𓆉</div>

                <div class="stamp">
                  <span class="stamp-ring">
                    PALEO · ARCHIVE · {{ new Date().getFullYear() }}
                  </span>
                  <span class="stamp-core">CATALOGADO</span>
                </div>

                <div class="catalog">
                  <span class="catalog-dot"></span>
                  N.º {{ fossilCode(selectedAnimal.id) }}
                </div>
              </div>

              <ul class="quick-specs">
                <li>
                  <span>Era</span>
                  <strong>{{ eraOf(selectedAnimal) }}</strong>
                </li>
                <li>
                  <span>Período</span>
                  <strong>{{ selectedAnimal.periodo?.name || "—" }}</strong>
                </li>
                <li>
                  <span>Dieta</span>
                  <strong>
                    {{ dietIcon(selectedAnimal.dieta) }}
                    {{ selectedAnimal.dieta || "—" }}
                  </strong>
                </li>
              </ul>
            </aside>

            <!-- LADO DIREITO: FICHA -->
            <section class="xinfo">
              <header class="xhead">
                <p class="xeyebrow">
                  <span class="line"></span>
                  Ficha de Expedição
                  <span class="line"></span>
                </p>

                <h2 class="xname">{{ selectedAnimal.name }}</h2>
                <p class="xlatin">
                  <em>
                    {{
                      selectedAnimal.scientificName || selectedAnimal.name
                    }}
                  </em>
                </p>

                <div class="xchips">
                  <span class="xchip gold">
                    {{ dietIcon(selectedAnimal.dieta) }}
                    {{ selectedAnimal.dieta || "Dieta desconhecida" }}
                  </span>
                  <span class="xchip">
                    ⇲ {{ selectedAnimal.size || "Tamanho —" }}
                  </span>
                  <span class="xchip ghost">{{ eraOf(selectedAnimal) }}</span>
                </div>
              </header>

              <nav class="xtabs">
                <button
                  :class="['xtab', { active: activeTab === 'ficha' }]"
                  @click="activeTab = 'ficha'"
                >
                  ◆ Ficha
                </button>
                <button
                  :class="['xtab', { active: activeTab === 'habitat' }]"
                  @click="activeTab = 'habitat'"
                >
                  ❖ Habitat
                </button>
                <button
                  :class="['xtab', { active: activeTab === 'descoberta' }]"
                  @click="activeTab = 'descoberta'"
                >
                  ✦ Descoberta
                </button>
              </nav>

              <div class="xtab-body">
                <!-- FICHA -->
                <div v-if="activeTab === 'ficha'" class="tab-pane">
                  <div class="data-list">
                    <div class="data-row">
                      <span class="k">Nome</span>
                      <span class="v">{{ selectedAnimal.name }}</span>
                    </div>
                    <div class="data-row">
                      <span class="k">Período</span>
                      <span class="v">
                        {{ selectedAnimal.periodo?.name || "—" }}
                      </span>
                    </div>
                    <div class="data-row">
                      <span class="k">Era Geológica</span>
                      <span class="v">{{ eraOf(selectedAnimal) }}</span>
                    </div>
                    <div class="data-row">
                      <span class="k">Dieta</span>
                      <span class="v">{{ selectedAnimal.dieta || "—" }}</span>
                    </div>
                    <div class="data-row">
                      <span class="k">Tamanho estimado</span>
                      <span class="v">
                        {{ selectedAnimal.size || "Não informado" }}
                      </span>
                    </div>
                    <div class="data-row">
                      <span class="k">Catálogo</span>
                      <span class="v mono">
                        {{ fossilCode(selectedAnimal.id) }}
                      </span>
                    </div>
                  </div>

                  <div class="scroll-block">
                    <h4>⌘ Notas do curador</h4>
                    <p>
                      {{
                        selectedAnimal.description ||
                        "Espécime registrado pelo acervo paleontológico digital. Notas adicionais ainda não foram catalogadas pelo curador responsável."
                      }}
                    </p>
                  </div>
                </div>

                <!-- HABITAT -->
                <div v-else-if="activeTab === 'habitat'" class="tab-pane">
                  <div class="habitat-card">
                    <div class="habitat-icon">🌍</div>
                    <div>
                      <h4>Ambiente predominante</h4>
                      <p>
                        {{
                          selectedAnimal.habitat ||
                          "Habitat não documentado. Estima-se que vivia em ecossistemas típicos do " +
                            (selectedAnimal.periodo?.name || "seu período") +
                            ", com vegetação e clima compatíveis com a fauna da época."
                        }}
                      </p>
                    </div>
                  </div>

                  <div class="habitat-card">
                    <div class="habitat-icon">🌡️</div>
                    <div>
                      <h4>Clima</h4>
                      <p>
                        {{
                          selectedAnimal.clima ||
                          "Variações climáticas próprias da era " +
                            eraOf(selectedAnimal) +
                            "."
                        }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- DESCOBERTA -->
                <div v-else class="tab-pane">
                  <div class="discover">
                    <div class="discover-line">
                      <span class="dot-g"></span>
                      <div>
                        <strong>Primeira descrição</strong>
                        <p>
                          {{
                            selectedAnimal.descoberta ||
                            "Registro fóssil em estudo."
                          }}
                        </p>
                      </div>
                    </div>
                    <div class="discover-line">
                      <span class="dot-g"></span>
                      <div>
                        <strong>Local de origem</strong>
                        <p>
                          {{
                            selectedAnimal.local ||
                            "Localização não catalogada."
                          }}
                        </p>
                      </div>
                    </div>
                    <div class="discover-line">
                      <span class="dot-g"></span>
                      <div>
                        <strong>Status do acervo</strong>
                        <p>Disponível para consulta pública no acervo digital.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <footer class="xfoot">
                <span>✦ Acervo Digital Paleontológico ✦</span>
                <button class="xfoot-btn" @click="closeAnimal">
                  Fechar ficha
                </button>
              </footer>
            </section>
          </div>
        </div>
      </div>
    </transition>

    <!-- FOOTER -->
    <footer class="foot">
      <span>✦</span>
      <p>Acervo digital — explorando o tempo profundo</p>
      <span>✦</span>
    </footer>
  </div>
</template>

<style scoped>
/* =========================
   PAGE
========================= */
.page {
  position: relative;
  min-height: 100vh;
  padding: 60px 6vw 40px;
  color: #f5e6c8;
  font-family: "Crimson Text", Georgia, serif;
  background: #0c0907;
  overflow: hidden;
}

/* AURORA */
.aurora {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.blob {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.25;
  animation: float 18s ease-in-out infinite;
}
.blob-a { background: #d4af37; top: -150px; left: -120px; }
.blob-b { background: #6b4d12; bottom: -200px; right: -100px; animation-delay: -6s; }
.blob-c { background: #8a6a1f; top: 40%; left: 50%; animation-delay: -12s; }

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(40px, -30px) scale(1.1); }
}
.grain {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 3px 3px;
  opacity: 0.5;
}

.header,
.controls-card,
.acervo,
.state,
.foot { position: relative; z-index: 1; }

/* HEADER */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 40px;
  flex-wrap: wrap;
  padding-bottom: 32px;
  border-bottom: 1px solid rgba(212,175,55,0.18);
  margin-bottom: 32px;
}
.brand { display: flex; gap: 22px; align-items: flex-start; max-width: 720px; }
.crest {
  font-size: 2.4rem;
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.05));
  border: 1px solid rgba(212,175,55,0.35);
  color: #f1d98a;
  box-shadow: inset 0 0 30px rgba(212,175,55,0.15);
}
.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.35em;
  font-size: 0.7rem;
  color: #d4af37;
  opacity: 0.85;
  margin-bottom: 6px;
}
.eyebrow.small { font-size: 0.6rem; letter-spacing: 0.3em; margin: 0; }
.header h1 {
  font-family: "Cinzel", "Playfair Display", Georgia, serif;
  font-size: clamp(2.2rem, 4vw, 3.4rem);
  line-height: 1.05;
  font-weight: 600;
  background: linear-gradient(180deg, #f6e7b6 0%, #d4af37 60%, #8a6a1f 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 0 0 10px;
}
.tagline { color: #c9b37a; opacity: 0.8; max-width: 520px; line-height: 1.6; }

.stats {
  display: flex;
  align-items: center;
  gap: 22px;
  padding: 18px 24px;
  border: 1px solid rgba(212,175,55,0.25);
  border-radius: 18px;
  background: rgba(20, 12, 6, 0.55);
  backdrop-filter: blur(10px);
}
.stat { display: flex; flex-direction: column; align-items: center; min-width: 64px; }
.stat-num { font-family: "Cinzel", serif; font-size: 1.7rem; color: #f1d98a; line-height: 1; }
.stat-label {
  font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase;
  color: #c9b37a; opacity: 0.7; margin-top: 6px;
}
.divider {
  width: 1px; height: 32px;
  background: linear-gradient(180deg, transparent, rgba(212,175,55,0.5), transparent);
}

/* CONTROLES */
.controls-card {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 22px;
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(26,18,8,0.85), rgba(12,9,6,0.85));
  border: 1px solid rgba(212,175,55,0.2);
  box-shadow: 0 30px 60px -30px rgba(0,0,0,0.8);
  margin-bottom: 40px;
}
.search-wrap { position: relative; width: 100%; max-width: 100%; overflow: hidden; }
.search-icon {
  position: absolute; left: 18px; top: 50%;
  transform: translateY(-50%); color: #d4af37; font-size: 1.1rem;
}
.search-wrap input {
  width: 100%;
  box-sizing: border-box;
  padding: 14px 18px 14px 46px;
  border-radius: 14px;
  border: 1px solid rgba(212,175,55,0.2);
  background: rgba(0,0,0,0.4);
  color: #f5e6c8;
  font-size: 1rem;
  transition: 0.25s;
}
.search-wrap input:focus {
  outline: none;
  border-color: #d4af37;
  box-shadow: 0 0 0 4px rgba(212,175,55,0.12);
}

.selects {
  display: grid;
  grid-template-columns: repeat(3, 1fr) auto;
  gap: 12px;
}
.select { display: flex; flex-direction: column; gap: 4px; position: relative; }
.select span {
  font-size: 0.65rem; letter-spacing: 0.25em; text-transform: uppercase;
  color: #d4af37; opacity: 0.75; padding-left: 4px;
}
.select select {
  appearance: none;
  padding: 12px 36px 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(212,175,55,0.18);
  background:
    linear-gradient(135deg, rgba(212,175,55,0.04), transparent),
    rgba(0,0,0,0.4);
  color: #f5e6c8;
  font-size: 0.95rem;
  cursor: pointer;
  transition: 0.25s;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'><path d='M1 1l5 5 5-5' stroke='%23d4af37' stroke-width='1.5' stroke-linecap='round'/></svg>");
  background-repeat: no-repeat;
  background-position: right 14px center;
}
.select select:focus {
  outline: none; border-color: #d4af37;
  box-shadow: 0 0 0 4px rgba(212,175,55,0.12);
}
.select.disabled select { opacity: 0.4; cursor: not-allowed; }

.clear {
  align-self: end;
  padding: 12px 20px;
  border-radius: 12px;
  border: 1px solid rgba(212,175,55,0.4);
  background: linear-gradient(135deg, rgba(212,175,55,0.18), rgba(212,175,55,0.05));
  color: #f1d98a;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: 0.2s;
}
.clear:hover:not(:disabled) {
  background: linear-gradient(135deg, #d4af37, #a07c1c);
  color: #1a1208;
}
.clear:disabled { opacity: 0.35; cursor: not-allowed; }
.clear.ghost { background: transparent; }

.result-line {
  display: flex; align-items: center; gap: 10px;
  font-size: 0.85rem; color: #c9b37a;
  padding-top: 6px; border-top: 1px dashed rgba(212,175,55,0.15);
}
.result-line strong { color: #f1d98a; }
.dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #d4af37; box-shadow: 0 0 12px #d4af37;
  animation: pulse 1.6s ease-in-out infinite;
}
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }

/* STATES */
.state { text-align: center; padding: 80px 20px; color: #c9b37a; }
.state h3 { color: #f1d98a; margin: 12px 0 8px; font-family: "Cinzel", serif; }
.empty-icon { font-size: 3rem; color: #d4af37; opacity: 0.7; }
.loader {
  width: 42px; height: 42px; border-radius: 50%;
  border: 3px solid rgba(212,175,55,0.2);
  border-top-color: #d4af37;
  margin: 0 auto 16px;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ACERVO */
.acervo { display: flex; flex-direction: column; gap: 56px; }
.era { animation: fadeUp 0.6s ease both; }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.era-head { display: flex; align-items: center; gap: 18px; margin-bottom: 26px; }
.era-mark {
  width: 54px; height: 54px;
  border-radius: 14px;
  display: grid; place-items: center;
  background: linear-gradient(135deg, #d4af37, #6b4d12);
  color: #1a1208;
  font-family: "Cinzel", serif;
  font-weight: 700;
  font-size: 1.1rem;
  box-shadow: 0 10px 30px -10px rgba(212,175,55,0.5);
}
.era-title {
  font-family: "Cinzel", serif;
  font-size: 1.8rem;
  color: #f1d98a;
  margin: 2px 0 0;
  letter-spacing: 0.02em;
}
.era-line { flex: 1; height: 1px; background: linear-gradient(90deg, rgba(212,175,55,0.4), transparent); }
.era-count {
  font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase;
  color: #c9b37a;
  padding: 6px 12px;
  border: 1px solid rgba(212,175,55,0.25);
  border-radius: 20px;
}

.periodo { margin-bottom: 32px; }
.periodo-head { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding-left: 6px; }
.bullet {
  width: 10px; height: 10px; border-radius: 50%;
  background: radial-gradient(circle, #f1d98a, #6b4d12);
  box-shadow: 0 0 12px rgba(212,175,55,0.6);
}
.periodo-title {
  font-family: "Cinzel", serif;
  font-size: 1.05rem;
  color: #f5e6c8;
  margin: 0;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.periodo-count {
  font-size: 0.7rem; color: #c9b37a;
  background: rgba(212,175,55,0.1);
  padding: 3px 10px; border-radius: 20px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 22px;
}

/* CARD */
.card {
  position: relative;
  background: linear-gradient(180deg, rgba(40,26,12,0.7), rgba(12,9,6,0.85));
  border: 1px solid rgba(212,175,55,0.18);
  border-radius: 18px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.4s cubic-bezier(.2,.8,.2,1),
              border-color 0.3s, box-shadow 0.4s;
  animation: fadeUp 0.5s ease both;
  isolation: isolate;
}
.card:hover {
  transform: translateY(-8px);
  border-color: rgba(212,175,55,0.55);
  box-shadow: 0 25px 50px -20px rgba(0,0,0,0.9),
              0 0 30px -10px rgba(212,175,55,0.3);
}
.card-glow {
  position: absolute; inset: -2px;
  border-radius: inherit;
  background: radial-gradient(400px circle at var(--x,50%) var(--y,0%),
              rgba(212,175,55,0.15), transparent 40%);
  opacity: 0;
  transition: opacity 0.4s;
  pointer-events: none;
  z-index: -1;
}
.card:hover .card-glow { opacity: 1; }
.clickable { cursor: pointer; }

.card-media {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: #1a1208;
}
.card-media img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.6s cubic-bezier(.2,.8,.2,1);
  filter: saturate(0.9) contrast(1.05);
}
.card:hover .card-media img { transform: scale(1.08); }
.no-image {
  display: grid; place-items: center; height: 100%;
  font-size: 3rem; color: rgba(212,175,55,0.4);
}
.card-tag {
  position: absolute; top: 12px; left: 12px;
  padding: 4px 10px;
  font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase;
  color: #f1d98a;
  background: rgba(0,0,0,0.65);
  border: 1px solid rgba(212,175,55,0.3);
  border-radius: 20px;
  backdrop-filter: blur(6px);
}

.card-body {
  padding: 16px 18px 20px;
  display: flex; flex-direction: column; gap: 12px;
  flex: 1;
}
.card h4 {
  font-family: "Cinzel", serif;
  font-size: 1.15rem;
  color: #f5e6c8;
  margin: 0;
  letter-spacing: 0.02em;
}
.card-meta { display: flex; flex-wrap: wrap; gap: 6px; }
.chip {
  font-size: 0.72rem;
  padding: 5px 10px;
  border-radius: 20px;
  background: rgba(212,175,55,0.12);
  color: #f1d98a;
  border: 1px solid rgba(212,175,55,0.2);
  letter-spacing: 0.03em;
}
.chip.ghost { background: transparent; color: #c9b37a; }

/* FOOT */
.foot {
  margin-top: 80px;
  padding-top: 30px;
  border-top: 1px solid rgba(212,175,55,0.15);
  display: flex;
  justify-content: center;
  gap: 14px;
  align-items: center;
  color: #c9b37a;
  opacity: 0.7;
  font-size: 0.85rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
.foot span { color: #d4af37; }

/* RESPONSIVO BASE */
@media (max-width: 720px) {
  .header { flex-direction: column; align-items: flex-start; }
  .stats { width: 100%; justify-content: space-between; }
  .selects { grid-template-columns: 1fr 1fr; }
  .clear { grid-column: 1 / -1; }
}

/* =========================================================
   MODAL — "FICHA DE EXPEDIÇÃO"
========================================================= */
.xmodal-overlay {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse at center, rgba(60,40,15,0.35), rgba(0,0,0,0.85) 70%);
  backdrop-filter: blur(12px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 28px;
  z-index: 9999;
}

.xmodal {
  position: relative;
  width: min(100%, 1100px);
  max-height: 92vh;
  overflow: hidden;
  border-radius: 24px;
  background:
    repeating-linear-gradient(
      0deg,
      rgba(212,175,55,0.025) 0px,
      rgba(212,175,55,0.025) 1px,
      transparent 1px,
      transparent 4px
    ),
    linear-gradient(180deg, #1c140a 0%, #0c0907 100%);
  border: 1px solid rgba(212,175,55,0.28);
  box-shadow:
    0 50px 120px rgba(0,0,0,0.95),
    0 0 80px rgba(212,175,55,0.08),
    inset 0 0 100px rgba(0,0,0,0.4);
  animation: xmodalIn .45s cubic-bezier(.2,.9,.25,1);
}

@keyframes xmodalIn {
  from { opacity: 0; transform: scale(.92) translateY(30px) rotateX(8deg); }
  to   { opacity: 1; transform: scale(1) translateY(0) rotateX(0); }
}

.corner {
  position: absolute;
  width: 28px; height: 28px;
  border: 2px solid #d4af37;
  opacity: 0.7;
  pointer-events: none;
}
.corner.tl { top: 14px; left: 14px; border-right: none; border-bottom: none; border-top-left-radius: 8px; }
.corner.tr { top: 14px; right: 14px; border-left: none; border-bottom: none; border-top-right-radius: 8px; }
.corner.bl { bottom: 14px; left: 14px; border-right: none; border-top: none; border-bottom-left-radius: 8px; }
.corner.br { bottom: 14px; right: 14px; border-left: none; border-top: none; border-bottom-right-radius: 8px; }

.xclose {
  position: absolute;
  top: 22px; right: 22px;
  width: 40px; height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(212,175,55,0.4);
  background: rgba(0,0,0,0.5);
  color: #f5e6c8;
  cursor: pointer;
  z-index: 10;
  transition: .25s;
  font-size: .9rem;
}
.xclose:hover {
  background: #d4af37;
  color: #1a1208;
  transform: rotate(90deg);
}

.xmodal-grid {
  display: grid;
  grid-template-columns: 0.95fr 1.1fr;
  max-height: 92vh;
  overflow: hidden;
}

/* LADO ESQUERDO */
.xmedia {
  position: relative;
  padding: 36px 28px;
  background:
    radial-gradient(circle at 30% 20%, rgba(212,175,55,0.12), transparent 60%),
    linear-gradient(180deg, rgba(40,28,12,0.5), rgba(10,8,6,0.7));
  border-right: 1px solid rgba(212,175,55,0.18);
  display: flex;
  flex-direction: column;
  gap: 22px;
  overflow-y: auto;
}

.xmedia-frame {
  position: relative;
  aspect-ratio: 4/5;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(212,175,55,0.35);
  box-shadow:
    0 30px 60px rgba(0,0,0,0.6),
    inset 0 0 60px rgba(0,0,0,0.5);
  background: #1a1208;
}
.xmedia-frame img {
  width: 100%; height: 100%; object-fit: cover;
  filter: saturate(0.95) contrast(1.05);
}
.xmedia-empty {
  height: 100%; display: grid; place-items: center;
  font-size: 7rem; color: rgba(212,175,55,0.35);
}

.stamp {
  position: absolute;
  bottom: 18px; right: 18px;
  width: 110px; height: 110px;
  border-radius: 50%;
  border: 2px dashed rgba(212,175,55,0.6);
  background: rgba(20,12,6,0.7);
  display: grid; place-items: center;
  text-align: center;
  color: #d4af37;
  transform: rotate(-12deg);
  animation: stampSpin 24s linear infinite;
  box-shadow: 0 0 30px rgba(0,0,0,0.6);
}
@keyframes stampSpin { to { transform: rotate(348deg); } }
.stamp-ring {
  position: absolute; inset: 6px;
  border-radius: 50%;
  font-size: 0.55rem;
  letter-spacing: 0.18em;
  color: rgba(212,175,55,0.8);
  display: grid; place-items: center;
}
.stamp-core {
  font-family: "Cinzel", serif;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.catalog {
  position: absolute;
  top: 14px; left: 14px;
  display: flex; align-items: center; gap: 8px;
  padding: 6px 12px;
  background: rgba(0,0,0,0.65);
  border: 1px solid rgba(212,175,55,0.3);
  border-radius: 20px;
  font-family: "JetBrains Mono", "Courier New", monospace;
  font-size: 0.7rem;
  color: #f1d98a;
  letter-spacing: 0.1em;
  backdrop-filter: blur(6px);
}
.catalog-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #6dffa1;
  box-shadow: 0 0 8px #6dffa1;
}

.quick-specs {
  list-style: none;
  margin: 0; padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.quick-specs li {
  padding: 12px 10px;
  border-radius: 12px;
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(212,175,55,0.12);
  text-align: center;
  display: flex; flex-direction: column; gap: 4px;
}
.quick-specs span {
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #c9b37a;
  opacity: 0.7;
}
.quick-specs strong {
  color: #f5e6c8;
  font-size: 0.8rem;
  line-height: 1.2;
}

/* LADO DIREITO */
.xinfo {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 36px 38px 24px;
}

.xhead { padding-bottom: 22px; }

.xeyebrow {
  display: flex; align-items: center; gap: 12px;
  font-size: 0.65rem;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: #d4af37;
  opacity: 0.85;
  margin: 0 0 16px;
}
.xeyebrow .line {
  flex: 0 0 36px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #d4af37, transparent);
}

.xname {
  font-family: "Cinzel", serif;
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: 600;
  margin: 0;
  line-height: 1.1;
  background: linear-gradient(180deg, #f6e7b6 0%, #d4af37 60%, #8a6a1f 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.xlatin {
  margin: 6px 0 18px;
  color: #c9b37a;
  font-style: italic;
  opacity: 0.85;
  font-size: 0.95rem;
}

.xchips { display: flex; flex-wrap: wrap; gap: 8px; }
.xchip {
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(212,175,55,0.2);
  color: #f1d98a;
  font-size: 0.78rem;
  letter-spacing: 0.04em;
}
.xchip.gold {
  background: linear-gradient(135deg, rgba(212,175,55,0.22), rgba(212,175,55,0.08));
  border-color: rgba(212,175,55,0.45);
}
.xchip.ghost { background: transparent; color: #c9b37a; }

/* TABS */
.xtabs {
  display: flex;
  gap: 4px;
  margin-top: 22px;
  padding: 4px;
  border-radius: 14px;
  background: rgba(0,0,0,0.4);
  border: 1px solid rgba(212,175,55,0.15);
}
.xtab {
  flex: 1;
  padding: 10px 12px;
  border: none;
  background: transparent;
  color: #c9b37a;
  font-family: "Cinzel", serif;
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.25s;
}
.xtab:hover { color: #f5e6c8; }
.xtab.active {
  background: linear-gradient(135deg, #d4af37, #8a6a1f);
  color: #1a1208;
  box-shadow: 0 6px 18px -6px rgba(212,175,55,0.6);
}

.xtab-body {
  flex: 1;
  padding: 22px 0 12px;
  animation: fadeUp 0.35s ease;
}
.tab-pane { display: flex; flex-direction: column; gap: 22px; }

/* DATA LIST */
.data-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(212,175,55,0.15);
}
.data-row {
  padding: 12px 14px;
  background: rgba(255,255,255,0.02);
  border-bottom: 1px solid rgba(212,175,55,0.08);
  border-right: 1px solid rgba(212,175,55,0.08);
  display: flex; flex-direction: column; gap: 4px;
}
.data-row:nth-child(2n) { border-right: none; }
.data-row .k {
  font-size: 0.62rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #c9b37a;
  opacity: 0.75;
}
.data-row .v { color: #f5e6c8; font-size: 0.95rem; }
.data-row .v.mono {
  font-family: "JetBrains Mono", "Courier New", monospace;
  color: #f1d98a;
  letter-spacing: 0.08em;
}

/* SCROLL BLOCK */
.scroll-block {
  position: relative;
  padding: 22px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(212,175,55,0.06), rgba(212,175,55,0.02));
  border-left: 3px solid #d4af37;
  border-top: 1px solid rgba(212,175,55,0.18);
  border-right: 1px solid rgba(212,175,55,0.1);
  border-bottom: 1px solid rgba(212,175,55,0.1);
}
.scroll-block h4 {
  margin: 0 0 10px;
  color: #f1d98a;
  font-family: "Cinzel", serif;
  font-size: 0.95rem;
  letter-spacing: 0.1em;
}
.scroll-block p {
  margin: 0;
  color: #d8c8a5;
  line-height: 1.75;
  font-size: 0.95rem;
}

/* HABITAT */
.habitat-card {
  display: flex;
  gap: 16px;
  padding: 18px;
  border-radius: 14px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(212,175,55,0.15);
  align-items: flex-start;
}
.habitat-icon {
  font-size: 2rem;
  width: 52px; height: 52px;
  display: grid; place-items: center;
  border-radius: 12px;
  background: rgba(212,175,55,0.1);
  border: 1px solid rgba(212,175,55,0.2);
  flex-shrink: 0;
}
.habitat-card h4 {
  margin: 0 0 6px;
  color: #f1d98a;
  font-family: "Cinzel", serif;
  font-size: 0.95rem;
}
.habitat-card p {
  margin: 0;
  color: #d8c8a5;
  line-height: 1.6;
  font-size: 0.9rem;
}

/* DISCOVER */
.discover { display: flex; flex-direction: column; gap: 4px; }
.discover-line {
  display: flex; gap: 16px;
  padding: 16px 8px;
  border-bottom: 1px dashed rgba(212,175,55,0.15);
  align-items: flex-start;
}
.discover-line:last-child { border-bottom: none; }
.dot-g {
  width: 12px; height: 12px;
  border-radius: 50%;
  background: radial-gradient(circle, #f1d98a, #6b4d12);
  box-shadow: 0 0 14px rgba(212,175,55,0.6);
  margin-top: 5px;
  flex-shrink: 0;
}
.discover-line strong {
  display: block;
  color: #f5e6c8;
  font-family: "Cinzel", serif;
  font-size: 0.9rem;
  letter-spacing: 0.06em;
  margin-bottom: 4px;
}
.discover-line p {
  margin: 0;
  color: #d8c8a5;
  line-height: 1.6;
  font-size: 0.88rem;
}

/* FOOTER do modal */
.xfoot {
  margin-top: 22px;
  padding-top: 16px;
  border-top: 1px solid rgba(212,175,55,0.18);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #c9b37a;
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.xfoot-btn {
  padding: 10px 22px;
  border-radius: 10px;
  border: 1px solid rgba(212,175,55,0.4);
  background: linear-gradient(135deg, rgba(212,175,55,0.18), rgba(212,175,55,0.04));
  color: #f1d98a;
  font-family: "Cinzel", serif;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  cursor: pointer;
  transition: 0.25s;
}
.xfoot-btn:hover {
  background: linear-gradient(135deg, #d4af37, #a07c1c);
  color: #1a1208;
}

/* RESPONSIVO MODAL */
@media (max-width: 880px) {
  .xmodal-grid { grid-template-columns: 1fr; }
  .xmedia { border-right: none; border-bottom: 1px solid rgba(212,175,55,0.18); }
  .xmedia-frame { aspect-ratio: 16/10; }
  .data-list { grid-template-columns: 1fr; }
  .data-row { border-right: none; }
}

.fade-enter-active,
.fade-leave-active { transition: opacity .25s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>
