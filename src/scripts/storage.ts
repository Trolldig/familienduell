type Change = {
    key: string;
    oldValue: string | null;
    newValue: string | null;
}

type OnChangeFunction = (this: unknown, change: Change) => any;

class StorageAPI {
    static #instance?: StorageAPI = undefined;

    #listeners = new Map<string, Set<OnChangeFunction>>();

    constructor() {
        if (StorageAPI.#instance) {
            return StorageAPI.#instance;
        }

        window.addEventListener("storage", this.#onChange.bind(this));

        StorageAPI.#instance = this;
        return this;
    }

    setItem(key: string, value: string) {
        localStorage.setItem(key, value);
    }

    getItem(key: string) {
        return localStorage.getItem(key);
    }

    listen(key: string, callback: OnChangeFunction) {
        if (this.#listeners.has(key)) {
            this.#listeners.get(key)?.add(callback);
        } else {
            this.#listeners.set(key, new Set([callback]));
        }
    }

    #onChange({ key, oldValue, newValue }: StorageEvent) {
        if (key === null) {
            return;
        }

        const listeners = this.#listeners.get(key);

        listeners?.forEach((callback) => {
            callback({ key, oldValue, newValue });
        });
    }
}

export const storage = new StorageAPI();