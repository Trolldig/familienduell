import { playAudio } from "./audio";
import { getStateId } from "./stateIdGenerator";

function buildAnswer(solution: string, points: number) {
    const placeholder = "_________________________________________";
    const maxLength = placeholder.length;
    let trimmedSolution = placeholder;

    if (solution.length > maxLength - 1) {
        trimmedSolution = solution.substring(0, maxLength);
    } else {
        trimmedSolution = solution + " " + placeholder.substring(solution.length + 1);
    }

    let trimmedPoints = points < 10 ? "0" + points.toString() : points.toString();

    return {
        id: getStateId("answer"),
        solution,
        trimmedSolution,
        points,
        open: false,
        get text() {
            return this.open ? this.trimmedSolution : placeholder;
        },
        get pts() {
            return this.open ? trimmedPoints : "**";
        },
        async reveal() {
            (this as unknown as ReturnType<typeof buildQuestion>).addPoints(this.open ? this.points * -1 : this.points);
            this.open = !this.open;
            await playAudio("reveal.mp3");
        },
        reset() {
            this.open = false;
        }
    }
}

function buildFailsCount() {
    return {
        id: getStateId("fails"),
        failCount: 0,
        async increase() {
            this.failCount = (this.failCount + 1) > 3 ? 0 : this.failCount + 1;
            await playAudio("fail.mp3");
        }
    }
}

function buildQuestion(extend: { text: string, answers: ReturnType<typeof buildAnswer>[] }) {
    return {
        id: getStateId("question"),
        ...extend,
        fails: {
            teamA: buildFailsCount(),
            teamB: buildFailsCount()
        },
        get maximumPoints(): number {
            return this.answers.reduce((accumulator, { points }) => accumulator + points, 0);
        },
        pointsToWin: 0,
        get pointsToWinAsString(): string {
            const maxLength = this.maximumPoints.toString().length;
            const pointsToWinLength = this.pointsToWin.toString().length;
            const prefix = "0";

            return prefix.repeat(maxLength - pointsToWinLength) + this.pointsToWin.toString();
        },
        addPoints(amount: number) {
            this.pointsToWin = this.pointsToWin + amount;
        },
        clear() {
            this.pointsToWin = 0;
            this.answers.forEach(answer => {
                answer.reset();
            });
            Object.values(this.fails).forEach(fail => {
                fail.failCount = 0;
            });
        }
    }
}

function buildTeam(name: string) {
    return {
        id: getStateId("team"),
        name,
        points: 0,
        addPoints(amount: number) {
            this.points = this.points + amount;
        }
    }
}

export function buildGameState() {
    return () => ({
        id: getStateId("game"),
        activeQuestion: 0,
        teams: [
            buildTeam("Schiller"),
            buildTeam("Goethe"),
            buildTeam("Heine")
        ],
        questions: [
            buildQuestion({
                text: "Nennen Sie ein Fortbewegungsmittel ohne Räder",
                answers: [
                    buildAnswer("Boot", 99),
                    buildAnswer("Helikopter", 98),
                    buildAnswer("Schlitten", 97),
                    buildAnswer("Pferd", 96),
                    buildAnswer("Jetpack mit Raketenantrieb mit Festbrennstoff", 95)
                ],
            }),
            buildQuestion({
                text: "Nennen Sie etwas, das man im Homeoffice tut",
                answers: [
                    buildAnswer("Schlafen", 45),
                    buildAnswer("Arbeiten", 30),
                    buildAnswer("Ohne Hose rumlaufen", 25),
                    buildAnswer("Wäsche machen / Putzen", 13)
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