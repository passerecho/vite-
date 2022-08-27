import componentACss from  "./componentA.module.css";
import componentALess from "./index.module.less";

console.log("componentACss", componentACss, componentALess);

const div = document.createElement("div");

document.body.appendChild(div);

div.className = componentACss.footerContent;

console.log();