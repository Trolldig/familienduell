let counter = 0;

export function getStateId(prefix: string = "state") {
    return `${prefix}-${counter++}`;
}