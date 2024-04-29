import Alpine from "alpinejs";
import { revealDirective } from "./reveal-directive";
import { initGameState } from "./buildGameState";

// @ts-ignore
window["Alpine"] = Alpine;

Alpine.directive("reveal", revealDirective);

initGameState();

Alpine.start();