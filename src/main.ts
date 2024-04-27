import Alpine from "alpinejs";

// @ts-ignore
window["Alpine"] = Alpine;
const audioCtx = new AudioContext();

function answer(solution: string, points: number) {
  const placeholder = "______________________________";
  const maxLength = placeholder.length;
  let trimmedSolution = placeholder;

  if (solution.length > maxLength - 1) {
    trimmedSolution = solution.substring(0, maxLength);
  } else {
    trimmedSolution = solution + " " + placeholder.substring(solution.length + 1);
  }

  let trimmedPoints = points < 10 ? "0" + points.toString() : points.toString();

  return {
    solution: trimmedSolution,
    points,
    open: false,
    get text() {
      return this.open ? this.solution : placeholder;
    },
    get pts() {
      return this.open ? trimmedPoints : "**";
    },
    async reveal() {
      this.open = !this.open;
      await playAudio("reveal.mp3");
    },
    reset() {
      this.open = false;
    }
  }
}

function failsCount() {
  return {
    fails: 0,
    async increase() {
      this.fails = (this.fails + 1) > 3 ? 0 : this.fails + 1;
      await playAudio("fail.mp3");
    }
  }
}

function question(extend: { text: string, answers: ReturnType<typeof answer>[] }) {
  return {
    ...extend,
    fails: {
      teamA: failsCount(),
      teamB: failsCount()
    },
    clear() {
      this.answers.forEach(answer => {
        answer.reset();
      });
      Object.values(this.fails).forEach(fail => {
        fail.fails = 0;
      });
    }
  }
}

async function loadAudio(fileName: string) {
  const response = await fetch(`sounds/${fileName}`);

  return await audioCtx.decodeAudioData(await response.arrayBuffer());
}

async function playAudio(fileName: string) {
  const buffer = await loadAudio(fileName);
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(audioCtx.destination);
  source.start();
}

Alpine.store("game", () => ({
  activeQuestion: 0,
  questions: [
    question({
      text: "Nennen Sie ein Fortbewegungsmittel ohne Räder",
      answers: [
        answer("Boot", 50),
        answer("Helikopter", 30),
        answer("Schlitten", 20),
        answer("Pferd", 10),
        answer("Jetpack mit Raketenantrieb mit Festbrennstoff", 5)
      ],
    }),
    question({
      text: "Nennen Sie etwas, das man im Homeoffice tut",
      answers: [
        answer("Schlafen", 45),
        answer("Arbeiten", 30),
        answer("Ohne Hose rumlaufen", 25),
        answer("Wäsche machen / Putzen", 13)
      ],
    }),
  ],
  prevQuestion() {
    this.questions[this.activeQuestion].clear();
    this.activeQuestion = this.activeQuestion <= 0 ? 0 : this.activeQuestion - 1;
  },
  nextQuestion() {
    this.questions[this.activeQuestion].clear();
    this.activeQuestion = this.activeQuestion >= this.questions.length - 1 ? this.questions.length - 1 : this.activeQuestion + 1;
  }
}));

Alpine.directive("reveal", (el, { expression }, { evaluate, evaluateLater, effect }) => {
  const durationPerFrame = Math.round(2000 / 70);
  let { text: oldContent } = evaluate<{ text: string | number, delay: number }>(expression);
  oldContent = oldContent.toString();
  const getContent = evaluateLater<{ text: string | number, delay: number }>(expression);
  let interval: number;

  el.textContent = oldContent;

  function reveal(newContent: string, delay: number = 0) {
    let currentIndex = 0;

    interval = setInterval(() => {
      if (currentIndex < delay) {
        currentIndex++;
        return;
      }

      if (currentIndex - delay > newContent.length - 1) {
        clearInterval(interval);
      }

      el.textContent = newContent.substring(0, currentIndex - delay + 1) + (oldContent as string).substring(currentIndex - delay + 1);
      oldContent = el.textContent;
      currentIndex++;
    }, durationPerFrame);
  }

  effect(() => {
    getContent(({ text: newContent, delay }) => {
      clearInterval(interval);
      reveal(newContent.toString(), delay);
    });
  })
});

Alpine.start();