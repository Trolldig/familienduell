interface WithID {
    id: string;
}

export interface StorableTeamState extends WithID {
    name: string;
    points: number;
}

export interface DynamicTeamState extends StorableTeamState {
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
    increase(): Promise<void>
}

export interface StorableQuestionState extends WithID {
    text: string;
    answers: StorableAnswerState[];
    fails: {
        teamA: StorableFailState;
        teamB: StorableFailState;
    },
}

export interface DynamicQuestionState extends StorableQuestionState {
    answers: DynamicAnswerState[];
    fails: {
        teamA: DynamicFailState;
        teamB: DynamicFailState;
    }
    readonly pointsToWin: number;
    readonly maximumPoints: number;
    clear(): void;
}

export interface StorableGameState extends WithID {
    activeQuestion: number;
    teams: StorableTeamState[];
    questions: StorableQuestionState[];
}

export interface DynamicGameState extends StorableGameState {
    prevQuestion(): void;
    nextQuestion(): void;
}