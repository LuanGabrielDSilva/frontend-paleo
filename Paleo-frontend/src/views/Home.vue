<template>
  <div class="page">

    <button class="logout-btn" @click="logout">
    Sair
  </button>
    <!-- HERO -->
    <section class="hero">

      <!-- Partículas de poeira flutuantes -->
      <div class="particles">
        <span
          v-for="p in particles"
          :key="p.id"
          class="dust"
          :style="{
            width: p.size + 'px',
            height: p.size + 'px',
            left: p.left + '%',
            top: p.top + '%',
            animationDuration: p.duration + 's',
            animationDelay: p.delay + 's',
          }"
        />
      </div>

      <!-- Conteúdo do Hero -->
      <div class="hero-content">

        <div class="hero-pre-title anim" style="animation-delay: 0.2s">
          <span class="line-deco" />
          <span class="pre-label">DESDE OS PRIMÓRDIOS</span>
          <span class="line-deco" />
        </div>

        <h1 class="hero-title anim" style="animation-delay: 0.4s">
          <span class="gold-text">PALEONTOLOGIA</span><br />
          <span class="hero-sub-title">A ARTE DOS FÓSSEIS</span>
        </h1>

        <p class="hero-desc anim" style="animation-delay: 0.6s">
          Desvende os segredos de criaturas que caminharam sobre a Terra há milhões de anos.
          Uma jornada através do tempo, gravada em pedra e osso.
        </p>

        <div class="hero-buttons anim" style="animation-delay: 0.8s">
          <router-link to="/eras" class="btn-primary">
            EXPLORAR COLEÇÃO
          </router-link>
          <router-link to="/game" class="btn-secondary">
            SAIBA MAIS
          </router-link>
        </div>

      </div>
      
    </section>
    

    <!-- NAV -->
    <section class="quick-nav">
      <router-link to="/eras" class="nav-card">
        <span class="nav-icon">⏳</span>
        <span class="nav-label">Eras Geológicas</span>
      </router-link>
      <router-link to="/collection" class="nav-card">
        <span class="nav-icon">🦖</span>
        <span class="nav-label">Coleção</span>
      </router-link>
      <router-link to="/game" class="nav-card">
        <span class="nav-icon">🎮</span>
        <span class="nav-label">Jogo</span>
      </router-link>
    </section>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from "vue-router";

const router = useRouter();

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user"); // 🔥 ESSENCIAL

  router.push("/login");

  // força atualização do estado
  window.location.reload();
}

const particles = ref(
  Array.from({ length: 30 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 1,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 5,
  }))
)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&family=Cinzel+Decorative:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

/* ══════════════════════════════════════
   VARIÁVEIS — dentro de .page (NÃO :root)
   para funcionar com <style scoped>
   ══════════════════════════════════════ */
.page {
  --bg: hsl(30, 20%, 5%);
  --fg: hsl(36, 50%, 88%);
  --card-bg: hsl(30, 18%, 8%);
  --muted: hsl(36, 20%, 55%);
  --border-clr: hsl(36, 25%, 18%);
  --gold: hsl(36, 60%, 50%);
  --gold-light: hsl(40, 70%, 70%);
  --gold-dark: hsl(32, 50%, 30%);
  --bronze: hsl(25, 40%, 35%);
  --accent: hsl(36, 60%, 50%);

  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--fg);
  font-family: 'Cormorant Garamond', serif;
  overflow-x: hidden;
}

/* ══════════════════════════════════════
   GOLD TEXT — gradiente igual ao modelo
   ══════════════════════════════════════ */
.gold-text {
  background: linear-gradient(
    135deg,
    hsl(45, 50%, 55%) 0%,
    hsl(40, 60%, 45%) 25%,
    hsl(36, 50%, 35%) 50%,
    hsl(40, 55%, 45%) 75%,
    hsl(45, 50%, 55%) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
  font-weight: 900;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.7));
}

.line-deco {
  display: inline-block;
  width: 60px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  vertical-align: middle;
}

/* ══════════════════════════════════════
   HERO
   ══════════════════════════════════════ */
.hero {
  position: relative;
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: url("/src/assets/hero-bg.jpg") center/cover no-repeat;
}

/* Overlay de cima pra baixo — suave como no modelo */
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 2;
  background: linear-gradient(
    to bottom,
    hsla(30, 20%, 5%, 0.70) 0%,
    hsla(30, 20%, 5%, 0.35) 30%,
    hsla(30, 20%, 5%, 0.20) 50%,
    hsla(30, 20%, 5%, 0.50) 75%,
    hsla(30, 20%, 5%, 0.95) 100%
  );
  pointer-events: none;
}

/* Overlay lateral — escurece bordas */
.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 3;
  background: linear-gradient(
    to right,
    hsla(30, 20%, 5%, 0.70),
    transparent 30%,
    transparent 70%,
    hsla(30, 20%, 5%, 0.70)
  );
  pointer-events: none;
}

/* Partículas */
.particles {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
}

.dust {
  position: absolute;
  border-radius: 50%;
  background: hsla(36, 60%, 50%, 0.4);
  animation: dust-kf ease-in-out infinite;
}

/* Conteúdo */
.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  padding: 20px;
  max-width: 820px;
}

/* Animação reveal */
.anim {
  opacity: 0;
  animation: reveal-up 0.8s ease-out forwards;
}

/* "DESDE OS PRIMÓRDIOS" */
.hero-pre-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 28px;
}

.pre-label {
  font-family: 'Cinzel', serif;
  font-size: 0.8rem;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: hsla(36, 60%, 55%, 0.85);
}

/* Título principal */
.hero-title {
  font-family: 'Cinzel Decorative', serif;
  font-size: clamp(2.8rem, 7vw, 5.5rem);
  font-weight: 700;
  line-height: 1.05;
  text-transform: uppercase;
  margin-bottom: 20px;
  letter-spacing: -0.02em;
}

/* Subtítulo "A ARTE DOS FÓSSEIS" */
.hero-sub-title {
  font-family: 'Cinzel', serif;
  font-size: clamp(1.2rem, 3vw, 2.2rem);
  letter-spacing: 0.3em;
  text-transform: uppercase;
  -webkit-text-fill-color: initial;
  color: hsl(36, 40%, 82%);
}

/* Descrição */
.hero-desc {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.15rem;
  font-style: italic;
  max-width: 560px;
  margin: 0 auto 40px;
  line-height: 1.7;
  color: hsl(36, 20%, 65%);
}

/* Botões */
.hero-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  display: inline-block;
  padding: 16px 44px;
  font-family: 'Cinzel', serif;
  font-size: 0.85rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  text-decoration: none;
  border-radius: 2px;
  transition: all 0.4s;
  color: var(--fg);
}

.btn-primary {
  background: hsla(36, 60%, 50%, 0.12);
  border: 1px solid hsla(36, 60%, 50%, 0.5);
  animation: pulse-glow 3s ease-in-out infinite;
}

.btn-primary:hover {
  background: hsla(36, 60%, 50%, 0.25);
}

.btn-secondary {
  border: 1px solid hsla(36, 25%, 40%, 0.5);
  background: transparent;
}

.btn-secondary:hover {
  background: hsla(36, 60%, 50%, 0.1);
  border-color: hsla(36, 60%, 50%, 0.6);
}

/* ══════════════════════════════════════
   QUICK NAV
   ══════════════════════════════════════ */
.quick-nav {
  max-width: 900px;
  margin: 48px auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.nav-card {
  background: var(--card-bg);
  border: 1px solid var(--border-clr);
  border-radius: 8px;
  padding: 28px 16px;
  text-align: center;
  text-decoration: none;
  color: var(--fg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  transition: all 0.4s;
}

.nav-card:hover {
  border-color: hsla(36, 60%, 50%, 0.4);
  transform: translateY(-4px);
  box-shadow: 0 8px 30px hsla(36, 60%, 50%, 0.1);
}

.nav-icon {
  font-size: 2rem;
}

.nav-label {
  font-family: 'Cinzel', serif;
  font-size: 0.9rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.logout-btn {
  position: absolute;
  top: 20px;
  right: 30px;
  z-index: 20;

  background: transparent;
  border: 1px solid hsla(36, 60%, 50%, 0.5);
  color: var(--fg);

  padding: 10px 20px;
  font-family: 'Cinzel', serif;
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;

  cursor: pointer;
  transition: 0.3s;
}

.logout-btn:hover {
  background: hsla(36, 60%, 50%, 0.2);
  border-color: hsla(36, 60%, 50%, 0.8);
}

/* ══════════════════════════════════════
   KEYFRAMES
   ══════════════════════════════════════ */
@keyframes dust-kf {
  0%, 100% { opacity: 0; transform: translateY(0) scale(0); }
  50% { opacity: 1; transform: translateY(-100px) scale(1); }
}

@keyframes reveal-up {
  from { opacity: 0; transform: translateY(60px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px hsla(36, 60%, 50%, 0.1); }
  50% { box-shadow: 0 0 40px hsla(36, 60%, 50%, 0.3); }
}

/* ══════════════════════════════════════
   RESPONSIVE
   ══════════════════════════════════════ */
@media (max-width: 640px) {
  .hero-buttons { flex-direction: column; align-items: center; }
}
</style>
