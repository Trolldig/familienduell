import Alpine from "alpinejs";
import { revealDirective } from "./reveal-directive";
import { buildGameState } from "./buildGameState";

// @ts-ignore
window["Alpine"] = Alpine;

Alpine.store("game", buildGameState());

Alpine.directive("reveal", revealDirective);

Alpine.start();