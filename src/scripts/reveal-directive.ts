import { DirectiveCallback } from "alpinejs";

export const revealDirective: DirectiveCallback = (el, { expression }, { evaluate, evaluateLater, effect }) => {
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
}