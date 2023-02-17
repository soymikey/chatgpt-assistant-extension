
var modalDiv = document.createElement("div");
modalDiv.innerHTML = `
      <div class="modal">
        <div class="modal-content">
          <span class="close">&times;</span>
          <textarea class="selected-text">${window.getSelection().toString()}</textarea>
        </div>
      </div>
    `;

var modalStyle = document.createElement("style");
modalStyle.innerHTML = `
      .modal {
        display: block;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0, 0, 0, 0.4);
      }
  
      .modal-content {
        background-color: #fefefe;
        margin: 15% auto;
        padding: 20px;
        border: 1px solid #888;
        width: 50%;
      }
  
      .close {
        float: right;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
      }
  
      .close:hover,
      .close:focus {
        color: #000;
        text-decoration: none;
        cursor: pointer;
      }
  
      .selected-text {
        width: 100%;
        height: 200px;
      }
    `;

document.body.appendChild(modalDiv);
document.head.appendChild(modalStyle);

var closeButton = document.querySelector(".close");
closeButton.addEventListener("click", function () {
  modalDiv.remove();
});

