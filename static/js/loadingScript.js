export const loading = (firstChildElement) => {
  const body = document.querySelector("body");
  const containerDiv = document.createElement("div");
  containerDiv.setAttribute("id", "container");
  containerDiv.style.display = "grid";
  containerDiv.style.placeItems = "center";
  containerDiv.style.width = "100%";
  const loadingDiv = document.createElement("div");
  loadingDiv.setAttribute("id", "spinner");
  containerDiv.appendChild(loadingDiv);
  body.insertBefore(containerDiv, firstChildElement);
  for (let i = 1; i < 4; i++) {
    let divItem = document.createElement("div");
    divItem.setAttribute("class", `bounce${i}`);
    loadingDiv.appendChild(divItem);
  }
};

export const removeLoading = () => {
  let loadingDiv = document.getElementById("spinner");
  loadingDiv.remove();
};
