import Alpine from "alpinejs";
import { revealDirective } from "./reveal-directive";
import { getGameState } from "./buildGameState";

// @ts-ignore
window["Alpine"] = Alpine;

Alpine.store("game", getGameState());

Alpine.directive("reveal", revealDirective);

Alpine.start();