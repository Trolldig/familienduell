import { playAudio } from "./audio";

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
        failCount: 0,
        async increase() {
            this.failCount = (this.failCount + 1) > 3 ? 0 : this.failCount + 1;
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
                fail.failCount = 0;
            });
        }
    }
}

export function buildGameState() {
    return () => ({
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
    })
}