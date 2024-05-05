import { storage } from "./storage";
import { DynamicGameState, DynamicQuestionState } from "./types";
import Alpine from "alpinejs";

export function initControllerData() {
    Alpine.data("controller", (state: DynamicGameState) => {
        return {
            get view() {
                return state.currentView;
            },
            set view(view: DynamicGameState["currentView"]) {
                state.changeView(view);
            },
            progress: {
                questions: {
                    get max() {
                        return state.questions.length;
                    },
                    get value() {
                        return state.activeQuestion + 1;
                    }
                },
                points: {
                    total: {
                        get max() {
                            return state.questions.reduce((accumulator, { maximumPoints }) => accumulator + maximumPoints, 0);
                        },
                        get value() {
                            return state.teams.reduce((accumulator, { points }) => accumulator + points, 0);
                        }
                    }
                }
            },
            get currentQuestion() {
                return state.questions[state.activeQuestion];
            },
            get plan() {
                return state.questions.map((question: DynamicQuestionState) => {
                    return {
                        get teamA() {
                            return {
                                get id() {
                                    return question._teamA;
                                },
                                set id(value) {
                                    question._teamA = value;
                                },
                                get name() {
                                    return question.teamA?.name;
                                }
                            }
                        },
                        get teamB() {
                            return {
                                get id() {
                                    return question._teamB;
                                },
                                set id(value) {
                                    question._teamB = value;
                                },
                                get name() {
                                    return question.teamB?.name;
                                }
                            }
                        }
                    }
                })
            },
            get teams() {
                return state.teams.map(({ id, name, points }) => {
                    return {
                        id,
                        name,
                        points
                    }
                });
            },
            get rankedTeams() {
                return this.teams.toSorted((a, b) => b.points - a.points);
            },
            deleteGame() {
                return () => {
                    const shouldDelete = confirm("Do you really wish to delete the entire game state, including teams, questions and given answers and points?");
                    if (shouldDelete) {
                        storage.delete("game");
                        location.reload();
                    }
                }
            },
            nextQuestion() {
                state.nextQuestion();
            },
            prevQuestion() {
                state.prevQuestion();
            }
        }
    });
}