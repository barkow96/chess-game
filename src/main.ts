import { Engine } from "./engine/Engine";

const containerDiv = document.querySelector(".container") as HTMLDivElement;
const headerDiv = document.querySelector(".header") as HTMLDivElement;
const talesDivs = document.querySelectorAll(
  ".tale",
) as NodeListOf<HTMLDivElement>;
const resultDiv = document.querySelector(".result") as HTMLDivElement;
const infoDiv = document.querySelector(".info") as HTMLDivElement;

const engine = new Engine(containerDiv, resultDiv, infoDiv, talesDivs);

export default function performAction(event: Event): void {
  engine.performAction(event);
}

headerDiv.addEventListener("click", () => engine.init());
