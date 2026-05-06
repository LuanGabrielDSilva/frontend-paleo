<template>
  <div class="page">
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
          <router-link to="/animals" class="btn-primary">
            EXPLORAR COLEÇÃO
          </router-link>
       <router-link to="/saiba-mais" class="btn-secondary">
  SAIBA MAIS
</router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

import excavationImg from '@/assets/HomeImagem/excavation.jpg'
import museumImg from '@/assets/HomeImagem/museum.jpg'
import fossilChartImg from '@/assets/HomeImagem/GraficoFossil.jpg'
import animalsImg from '@/assets/HomeImagem/CenaAnimais.jpg'

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

.page {
  --bg: hsl(30, 20%, 5%);
  --fg: hsl(36, 50%, 88%);
  --gold: hsl(36, 60%, 50%);
  --gold-light: hsl(40, 70%, 70%);
 
  min-height: 100vh;
  background: var(--bg);
  color: var(--fg);
  font-family: 'Cormorant Garamond', serif;
  overflow-x: hidden;
  position: relative;
}

/* ====================== HERO ====================== */
.hero {
  position: relative;
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: url("/src/assets/hero-bg.jpg") center/cover no-repeat;
}

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
}

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

/* Conteúdo do Hero */
.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  padding: 20px;
  max-width: 820px;
}

.anim {
  opacity: 0;
  animation: reveal-up 0.8s ease-out forwards;
}

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

.hero-title {
  font-family: 'Cinzel Decorative', serif;
  font-size: clamp(2.8rem, 7vw, 5.5rem);
  font-weight: 700;
  line-height: 1.05;
  text-transform: uppercase;
  margin-bottom: 20px;
  letter-spacing: -0.02em;
}

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

.hero-sub-title {
  font-family: 'Cinzel', serif;
  font-size: clamp(1.2rem, 3vw, 2.2rem);
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: hsl(36, 40%, 82%);
}

.hero-desc {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.15rem;
  font-style: italic;
  max-width: 560px;
  margin: 0 auto 40px;
  line-height: 1.7;
  color: hsl(36, 20%, 65%);
}

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

/* ====================== ANIMAÇÕES ====================== */
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

/* ====================== RESPONSIVO ====================== */
@media (max-width: 640px) {
  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
}
</style>