import { playAudio } from "./audio";
import { getStateId } from "./stateIdGenerator";
import Alpine from "alpinejs";
import type { DynamicAnswerState, DynamicFailState, DynamicGameState, DynamicQuestionState, DynamicTeamState, StorableAnswerState, StorableFailState, StorableGameState, StorableQuestionState, StorableTeamState } from "./types";

function buildAnswer(answer: StorableAnswerState): DynamicAnswerState {
    const placeholder = "_________________________________________";

    return {
        ...answer,
        get trimmedSolution() {
            let trimmedSolution = placeholder;
            const maxLength = placeholder.length;

            if (this.solution.length > maxLength - 1) {
                trimmedSolution = this.solution.substring(0, maxLength);
            } else {
                trimmedSolution = this.solution + " " + placeholder.substring(this.solution.length + 1);
            }

            return trimmedSolution;
        },
        get trimmedPoints() {
            return this.points < 10 ? "0" + this.points.toString() : this.points.toString();
        },
        get text() {
            return this.open ? this.trimmedSolution : placeholder;
        },
        get pts() {
            return this.open ? this.trimmedPoints : "**";
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

function buildFailsCount(failsCount: StorableFailState): DynamicFailState {
    return {
        ...failsCount,
        async increase() {
            this.failCount = (this.failCount + 1) > 3 ? 0 : this.failCount + 1;
            await playAudio("fail.mp3");
        }
    }
}

function buildQuestion(question: StorableQuestionState): DynamicQuestionState {
    return {
        ...question,
        answers: question.answers.map(answer => buildAnswer(answer)),
        fails: {
            teamA: buildFailsCount(question.fails.teamA),
            teamB: buildFailsCount(question.fails.teamB)
        },
        get maximumPoints(): number {
            return this.answers.reduce((accumulator, { points }) => accumulator + points, 0);
        },
        get pointsToWin(): number {
            return this.answers.map(({ points, open }) => open ? points : 0).reduce((accumulator, points) => accumulator + points, 0);
        },
        get pointsToWinAsString(): string {
            const maxLength = this.maximumPoints.toString().length;
            const pointsToWinLength = this.pointsToWin.toString().length;
            const prefix = "0";

            return prefix.repeat(maxLength - pointsToWinLength) + this.pointsToWin.toString();
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

function buildTeam(team: StorableTeamState): DynamicTeamState {
    return {
        ...team,
        addPoints(amount: number) {
            this.points = this.points + amount;
        }
    }
}

function loadGameStateFromStorage(id: string): StorableGameState | null {
    const savedValue = localStorage.getItem(id);

    try {
        return JSON.parse(savedValue as string);
    } catch (e) {
        console.warn("reading game state from localStorage not possible", e);

        return null;
    }
}

function saveGameStateToStorage(id: string, state: string) {
    localStorage.setItem(id, state);
}

function buildGameStateFromJSON(inputState: StorableGameState): DynamicGameState {
    return {
        ...inputState,
        teams: inputState.teams.map(team => buildTeam(team)),
        questions: inputState.questions.map(question => buildQuestion(question)),
        prevQuestion() {
            (this.questions[this.activeQuestion] as DynamicQuestionState).clear();
            this.activeQuestion = this.activeQuestion <= 0 ? 0 : this.activeQuestion - 1;
        },
        nextQuestion() {
            (this.questions[this.activeQuestion] as DynamicQuestionState).clear();
            this.activeQuestion = this.activeQuestion >= this.questions.length - 1 ? this.questions.length - 1 : this.activeQuestion + 1;
        }
    }
}

function buildDefaultGameState(): DynamicGameState {
    return buildGameStateFromJSON({
        id: getStateId("game"),
        activeQuestion: 0,
        teams: [
            { id: getStateId("team"), name: "Schiller", points: 0 },
            { id: getStateId("team"), name: "Goethe", points: 0 },
            { id: getStateId("team"), name: "Heine", points: 0 }
        ],
        questions: [
            {
                id: getStateId("question"),
                text: "Nennen Sie ein Fortbewegungsmittel ohne Räder",
                fails: {
                    teamA: {
                        id: getStateId("fail"),
                        failCount: 0
                    },
                    teamB: {
                        id: getStateId("fail"),
                        failCount: 0
                    }
                },
                answers: [
                    { id: getStateId("answer"), solution: "Boot", points: 99, open: false },
                    { id: getStateId("answer"), solution: "Helikopter", points: 89, open: false },
                    { id: getStateId("answer"), solution: "Schlitten", points: 79, open: false },
                    { id: getStateId("answer"), solution: "Pferd", points: 69, open: true },
                    { id: getStateId("answer"), solution: "Jetpack mit Festbrennstoffraketen-Antrieb", points: 59, open: false }
                ]
            },
            {
                id: getStateId("question"),
                text: "Nennen Sie etwas, das man im Homeoffice tut",
                fails: {
                    teamA: {
                        id: getStateId("fail"),
                        failCount: 0
                    },
                    teamB: {
                        id: getStateId("fail"),
                        failCount: 0
                    }
                },
                answers: [
                    { id: getStateId("answer"), solution: "Schlafen", points: 60, open: false },
                    { id: getStateId("answer"), solution: "Arbeiten", points: 51, open: false },
                    { id: getStateId("answer"), solution: "Ohne Hose rumlaufen", points: 42, open: false },
                    { id: getStateId("answer"), solution: "Pferd", points: 33, open: false },
                    { id: getStateId("answer"), solution: "Wäsche machen / Putzen", points: 24, open: false }
                ]
            }
        ]
    });
}

function getGameState(id: string): DynamicGameState {
    const savedState = loadGameStateFromStorage(id);
    let dynamicState = buildDefaultGameState();

    if (savedState !== null) {
        try {
            dynamicState = buildGameStateFromJSON(savedState);
        } catch (e) {
            console.error("rebuilding dynamic game state from localStorage failed, using default game state", e);
        }
    }

    return dynamicState;
}

export function initGameState(id: string = "gameState") {
    const state = getGameState(id);
    Alpine.store(id, state);
    Alpine.effect(() => {
        saveGameStateToStorage(id, JSON.stringify(Alpine.store(id)));
    })
}