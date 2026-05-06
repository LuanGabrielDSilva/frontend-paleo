<script setup lang="ts">
import { ref, computed } from "vue";
import moedaDoSite from "@/assets/moedaDoSite.png";

/* =========================================================
   API
========================================================= */
const API = import.meta.env.VITE_API_URL || "";

/* =========================================================
   TYPES
========================================================= */
type Question = {
  question: string;
  options: string[];
  correct: string;
};

/* =========================================================
   STATE
========================================================= */
const currentQuestion = ref(0);

const questions = ref<Question[]>([
  {
    question: "Qual era ficou conhecida como a era dos dinossauros?",
    options: ["Paleozoico", "Mesozoico", "Cenozoico", "Jurássico"],
    correct: "Mesozoico"
  },
  {
    question: "Qual criatura voadora viveu no período Cretáceo?",
    options: ["Tiranossauro", "Pterodáctilo", "Tricerátopo", "Mamute"],
    correct: "Pterodáctilo"
  },
  {
    question: "Qual destes animais era herbívoro?",
    options: ["Velociraptor", "Tiranossauro Rex", "Tricerátopo", "Megalodon"],
    correct: "Tricerátopo"
  },
  {
    question: "Em qual período surgiu o Tiranossauro Rex?",
    options: ["Triássico", "Jurássico", "Cretáceo", "Cambriano"],
    correct: "Cretáceo"
  }
]);

const score = ref(0);
const finished = ref(false);

const coinsEarned = ref(0);
const loadingReward = ref(false);

const selectedAnswer = ref<string | null>(null);
const answerState = ref<"correct" | "wrong" | null>(null);

const progress = computed(() => {
  return ((currentQuestion.value + 1) / questions.value.length) * 100;
});

/* =========================================================
   ANSWER
========================================================= */
async function answer(option: string) {
  if (selectedAnswer.value) return;

  selectedAnswer.value = option;

  const question = questions.value[currentQuestion.value];

  const correct = option === question.correct;

  if (correct) {
    score.value++;
    answerState.value = "correct";
  } else {
    answerState.value = "wrong";
  }

  await new Promise(resolve => setTimeout(resolve, 1200));

  selectedAnswer.value = null;
  answerState.value = null;

  if (currentQuestion.value < questions.value.length - 1) {
    currentQuestion.value++;
  } else {
    finished.value = true;
    finishQuiz();
  }
}

/* =========================================================
   FINISH QUIZ + REWARD
========================================================= */
async function finishQuiz() {
  const earned = score.value * 25;

  coinsEarned.value = earned;

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!user?.id || !API) return;

  try {
    loadingReward.value = true;

    await fetch(`${API}/reward`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: user.id,
        coins: earned
      })
    });

  } catch (err) {
    console.error("Erro ao recompensar quiz:", err);
  } finally {
    loadingReward.value = false;
  }
}

/* =========================================================
   RESTART
========================================================= */
function restartQuiz() {
  currentQuestion.value = 0;
  score.value = 0;
  coinsEarned.value = 0;
  finished.value = false;
  selectedAnswer.value = null;
  answerState.value = null;
}
</script>

<template>
  <div class="quiz-page">

    <!-- BACKGROUND -->
    <div class="bg-glow"></div>
    <div class="particles">
      <span v-for="n in 25" :key="n"></span>
    </div>

    <div class="quiz-container">

      <!-- HEADER -->
      <div class="header">
        <div class="logo-circle">🦖</div>

        <h1>Quiz Paleontológico</h1>

        <p>
          Descubra se você domina os mistérios das eras antigas.
        </p>
      </div>

      <!-- QUIZ -->
      <div v-if="!finished">

        <!-- PROGRESS -->
        <div class="top-progress">

          <div class="progress-info">
            <span>
              Pergunta {{ currentQuestion + 1 }}
            </span>

            <span>
              {{ questions.length }}
            </span>
          </div>

          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: progress + '%' }"
            ></div>
          </div>

        </div>

        <!-- QUESTION -->
        <Transition name="fade-slide" mode="out-in">

          <div :key="currentQuestion">

            <h2 class="question">
              {{ questions[currentQuestion].question }}
            </h2>

            <div class="options">

              <button
                v-for="option in questions[currentQuestion].options"
                :key="option"
                class="option-btn"
                :class="{
                  correct:
                    selectedAnswer &&
                    option === questions[currentQuestion].correct,

                  wrong:
                    selectedAnswer === option &&
                    option !== questions[currentQuestion].correct
                }"
                @click="answer(option)"
              >
                <span class="option-text">
                  {{ option }}
                </span>

                <span
                  v-if="
                    selectedAnswer &&
                    option === questions[currentQuestion].correct
                  "
                  class="feedback-icon"
                >
                  ✅
                </span>

                <span
                  v-if="
                    selectedAnswer === option &&
                    option !== questions[currentQuestion].correct
                  "
                  class="feedback-icon"
                >
                  ❌
                </span>
              </button>

            </div>

          </div>

        </Transition>

      </div>

      <!-- RESULT -->
      <Transition name="modal-pop">

        <div v-if="finished" class="result">

          <div class="victory-glow"></div>

          <div class="trophy">
            🏆
          </div>

          <h2 class="victory-title">
            Expedição Concluída!
          </h2>

          <p class="result-text">
            Você acertou
            <strong>{{ score }}</strong>
            de
            <strong>{{ questions.length }}</strong>
            perguntas.
          </p>

          <!-- SCORE RANK -->
          <div class="rank-box">

            <span v-if="score === questions.length">
              👑 Mestre dos Dinossauros
            </span>

            <span
              v-else-if="score >= questions.length / 2"
            >
              🦴 Explorador Experiente
            </span>

            <span v-else>
              🌋 Aprendiz Jurássico
            </span>

          </div>

          <!-- COINS -->
          <div class="coins-box">

            <img
              :src="moedaDoSite"
              alt="Moeda"
              class="coin-img"
            />

            <div class="coins-content">
              <strong>+{{ coinsEarned }}</strong>
              <span>moedas conquistadas</span>
            </div>

          </div>

          <p
            v-if="loadingReward"
            class="saving"
          >
            Salvando recompensas no cofre...
          </p>

          <!-- ACTIONS -->
          <div class="actions">

            <button
              class="restart-btn"
              @click="restartQuiz"
            >
              🔄 Jogar Novamente
            </button>

          </div>

        </div>

      </Transition>

    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

/* =========================================================
   PAGE
========================================================= */
.quiz-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  padding: 40px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at top, rgba(212,175,55,0.08), transparent 40%),
    linear-gradient(180deg, #0a0705 0%, #120905 100%);
  color: #f5e6c8;
  font-family: 'Inter', sans-serif;
}

.bg-glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at center,
      rgba(212,175,55,0.12),
      transparent 60%);
  pointer-events: none;
}

.particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.particles span {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(212,175,55,0.35);
  border-radius: 50%;
  animation: float 14s linear infinite;
}

.particles span:nth-child(odd) {
  width: 2px;
  height: 2px;
}

.particles span:nth-child(n) {
  left: calc(random() * 100%);
}

@keyframes float {
  from {
    transform: translateY(100vh);
    opacity: 0;
  }

  10% {
    opacity: 1;
  }

  to {
    transform: translateY(-10vh);
    opacity: 0;
  }
}

/* =========================================================
   CONTAINER
========================================================= */
.quiz-container {
  position: relative;
  width: 100%;
  max-width: 820px;
  padding: 40px;
  border-radius: 32px;
  overflow: hidden;
  backdrop-filter: blur(14px);
  background:
    linear-gradient(
      160deg,
      rgba(255,255,255,0.06),
      rgba(255,255,255,0.02)
    );

  border: 1px solid rgba(212,175,55,0.2);

  box-shadow:
    0 30px 80px rgba(0,0,0,0.6),
    inset 0 1px 0 rgba(255,255,255,0.06);
}

/* =========================================================
   HEADER
========================================================= */
.header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-circle {
  width: 90px;
  height: 90px;
  margin: 0 auto 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.6rem;

  background:
    radial-gradient(circle,
      rgba(212,175,55,0.25),
      rgba(212,175,55,0.06));

  border: 1px solid rgba(212,175,55,0.35);

  box-shadow:
    0 0 40px rgba(212,175,55,0.2);

  animation: floatLogo 3s ease-in-out infinite;
}

@keyframes floatLogo {
  0%,100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-8px);
  }
}

h1 {
  margin: 0 0 10px;
  font-size: clamp(2.2rem, 5vw, 3.5rem);
  font-family: 'Cinzel', serif;

  background:
    linear-gradient(
      180deg,
      #fff2b0,
      #d4af37,
      #8b6914
    );

  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.header p {
  color: rgba(255,255,255,0.7);
  font-size: 1rem;
}

/* =========================================================
   PROGRESS
========================================================= */
.top-progress {
  margin-bottom: 30px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;

  color: rgba(255,255,255,0.7);
  font-size: .85rem;
  text-transform: uppercase;
  letter-spacing: .12em;
}

.progress-bar {
  height: 12px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(212,175,55,0.15);
}

.progress-fill {
  height: 100%;
  border-radius: inherit;

  background:
    linear-gradient(
      90deg,
      #8b6914,
      #d4af37,
      #fff2b0
    );

  box-shadow:
    0 0 20px rgba(212,175,55,0.5);

  transition: width .4s ease;
}

/* =========================================================
   QUESTION
========================================================= */
.question {
  margin-bottom: 30px;
  text-align: center;
  line-height: 1.5;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-family: 'Cinzel', serif;
}

/* =========================================================
   OPTIONS
========================================================= */
.options {
  display: grid;
  gap: 16px;
}

.option-btn {
  position: relative;

  padding: 20px;
  border-radius: 20px;
  border: 1px solid rgba(212,175,55,0.15);

  background:
    linear-gradient(
      160deg,
      rgba(212,175,55,0.15),
      rgba(255,255,255,0.03)
    );

  color: #f5e6c8;

  cursor: pointer;

  transition:
    transform .25s ease,
    border-color .25s ease,
    box-shadow .25s ease;
}

.option-btn:hover {
  transform: translateY(-3px) scale(1.02);

  border-color: rgba(212,175,55,0.45);

  box-shadow:
    0 10px 30px rgba(212,175,55,0.15);
}

.option-btn.correct {
  background:
    linear-gradient(
      135deg,
      rgba(46, 204, 113, .25),
      rgba(39, 174, 96, .15)
    );

  border-color: rgba(46,204,113,.7);

  animation: correctPulse .5s ease;
}

.option-btn.wrong {
  background:
    linear-gradient(
      135deg,
      rgba(231, 76, 60, .25),
      rgba(192, 57, 43, .15)
    );

  border-color: rgba(231,76,60,.7);

  animation: shake .45s ease;
}

.option-text {
  font-size: 1rem;
  font-weight: 600;
}

.feedback-icon {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.3rem;
}

@keyframes correctPulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.03);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes shake {
  0%,100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-6px);
  }

  75% {
    transform: translateX(6px);
  }
}

/* =========================================================
   RESULT
========================================================= */
.result {
  position: relative;
  text-align: center;
  overflow: hidden;
}

.victory-glow {
  position: absolute;
  inset: -100px;

  background:
    radial-gradient(circle,
      rgba(212,175,55,0.18),
      transparent 60%);

  animation: rotateGlow 10s linear infinite;
}

@keyframes rotateGlow {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.trophy {
  position: relative;
  z-index: 2;

  font-size: 5rem;

  filter:
    drop-shadow(0 0 30px rgba(212,175,55,0.6));

  animation: trophyBounce 2s ease-in-out infinite;
}

@keyframes trophyBounce {
  0%,100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-12px);
  }
}

.victory-title {
  position: relative;
  z-index: 2;

  margin: 10px 0 12px;

  font-size: 2.4rem;
  font-family: 'Cinzel', serif;

  background:
    linear-gradient(
      180deg,
      #fff2b0,
      #d4af37
    );

  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.result-text {
  position: relative;
  z-index: 2;

  color: rgba(255,255,255,0.8);
  margin-bottom: 24px;
}

/* =========================================================
   RANK
========================================================= */
.rank-box {
  position: relative;
  z-index: 2;

  margin-bottom: 24px;

  padding: 16px 20px;

  border-radius: 18px;

  background:
    rgba(212,175,55,0.08);

  border:
    1px solid rgba(212,175,55,0.2);

  font-weight: 700;
}

/* =========================================================
   COINS
========================================================= */
.coins-box {
  position: relative;
  z-index: 2;

  display: inline-flex;
  align-items: center;
  gap: 18px;

  margin-bottom: 24px;

  padding: 20px 26px;

  border-radius: 24px;

  background:
    linear-gradient(
      160deg,
      rgba(212,175,55,0.18),
      rgba(212,175,55,0.05)
    );

  border:
    1px solid rgba(212,175,55,0.25);

  box-shadow:
    0 0 40px rgba(212,175,55,0.12);
}

.coin-img {
  width: 62px;
  height: 62px;
  object-fit: contain;

  filter:
    drop-shadow(0 0 14px rgba(212,175,55,0.45));

  animation: spinCoin 5s linear infinite;
}

@keyframes spinCoin {
  from {
    transform: rotateY(0deg);
  }

  to {
    transform: rotateY(360deg);
  }
}

.coins-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.coins-content strong {
  font-size: 2rem;
  color: #fff2b0;
}

.coins-content span {
  color: rgba(255,255,255,0.7);
  text-transform: uppercase;
  letter-spacing: .12em;
  font-size: .72rem;
}

/* =========================================================
   BUTTON
========================================================= */
.actions {
  margin-top: 10px;
}

.restart-btn {
  padding: 16px 28px;
  border: none;
  border-radius: 999px;

  cursor: pointer;

  font-size: 1rem;
  font-weight: 700;

  color: #1a1208;

  background:
    linear-gradient(
      135deg,
      #fff2b0,
      #d4af37,
      #8b6914
    );

  box-shadow:
    0 14px 34px rgba(212,175,55,0.25);

  transition:
    transform .25s ease,
    box-shadow .25s ease;
}

.restart-btn:hover {
  transform: translateY(-4px) scale(1.03);

  box-shadow:
    0 18px 44px rgba(212,175,55,0.4);
}

/* =========================================================
   TRANSITIONS
========================================================= */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity .35s ease,
    transform .35s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.modal-pop-enter-active {
  transition:
    opacity .4s ease,
    transform .4s ease;
}

.modal-pop-enter-from {
  opacity: 0;
  transform: scale(.85);
}

/* =========================================================
   RESPONSIVE
========================================================= */
@media (max-width: 700px) {

  .quiz-container {
    padding: 26px;
  }

  .question {
    font-size: 1.3rem;
  }

  .coins-box {
    flex-direction: column;
  }

}
</style>