import componentBCss from "./componentB.module.css";
console.log("componentBCss", componentBCss);
const div = document.createElement("div");

document.body.appendChild(div);

div.className=componentBCss.footer;