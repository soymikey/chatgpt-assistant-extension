

console.log("I am contentscript");

//添加assistant-modal到document
const modalDiv = document.createElement("div");
modalDiv.setAttribute("id", "assistant-modal");
document.body.appendChild(modalDiv);
