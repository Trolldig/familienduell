import Alpine from "alpinejs";
import { revealDirective } from "./reveal-directive";
import { initGameState } from "./gameState";
import { initControllerData } from "./controller";

// @ts-ignore
window["Alpine"] = Alpine;

Alpine.directive("reveal", revealDirective);

initGameState();
initControllerData();

Alpine.start();