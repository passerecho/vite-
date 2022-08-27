import svgIcon from "./assets/svgs/fullScreen.svg?url";
import svgRaw from "./assets/svgs/fullScreen.svg?raw";


console.log("svgIcon", svgIcon, svgRaw);

document.body.innerHTML = svgRaw;

const svgElement = document.getElementsByTagName("svg")[0];

svgElement.onmouseenter = function() {
    // 不是去改他的background 也不是color
    // 而是fill属性
    this.style.fill = "red";
}

// 第一种使用svg的方式
// const img = document.createElement("img");

// img.src = svgIcon;

// document.body.appendChild(img);

// 第二种加载svg的方式