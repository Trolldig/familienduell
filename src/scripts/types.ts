export interface WithID {
    id: string;
}

export interface StorableTeamState extends WithID {
    name: string;
    points: number;
}

export interface DynamicTeamState extends StorableTeamState {
    readonly pts: string;
    readonly highscoreName: string;
    addPoints(amount: number): void;
}

export interface StorableAnswerState extends WithID {
    solution: string;
    points: number;
    open: boolean;
}

export interface DynamicAnswerState extends StorableAnswerState {
    readonly trimmedSolution: string;
    readonly trimmedPoints: string;
    readonly text: string;
    readonly pts: string;
    reveal(): Promise<void>;
    reset(): void;
}

export interface StorableFailState extends WithID {
    failCount: number;
}

export interface DynamicFailState extends StorableFailState {
    increase(): Promise<void>;
    decrease(): void;
}

export interface StorableQuestionState extends WithID {
    text: string;
    answers: StorableAnswerState[];
    fails: {
        teamA: StorableFailState;
        teamB: StorableFailState;
    };
    _teamA: WithID["id"];
    _teamB: WithID["id"];
    _winnerTeam: WithID["id"] | null;
    pointsWon: number;
}

export interface DynamicQuestionState extends StorableQuestionState {
    answers: DynamicAnswerState[];
    fails: {
        teamA: DynamicFailState;
        teamB: DynamicFailState;
    };
    readonly pointsToWin: number;
    readonly maximumPoints: number;
    readonly teamA?: DynamicTeamState;
    readonly teamB?: DynamicTeamState;
    readonly winnerTeam: DynamicTeamState | null;
    readonly closed: boolean;
    clear(): void;
    win(teamId: WithID["id"], points: number): void;
}

export interface StorableGameState extends WithID {
    currentView: "questions" | "highscore";
    activeQuestion: number;
    teams: StorableTeamState[];
    questions: StorableQuestionState[];
}

export interface DynamicGameState extends StorableGameState {
    questions: DynamicQuestionState[];
    readonly ranking: StorableTeamState[];
    prevQuestion(): void;
    nextQuestion(): void;
    getById<T extends WithID>(id: WithID["id"]): T | undefined;
    changeView(view: this["currentView"]): void;
}