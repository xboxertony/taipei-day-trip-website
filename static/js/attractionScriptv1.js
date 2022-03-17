let images = [
  "https://www.travel.taipei/d_upload_ttn/sceneadmin/image/A0/B0/C0/D11/E257/F345/546f42a1-cbfb-49fc-b4d8-c33f1c44190c.jpg",
  "https://www.travel.taipei/d_upload_ttn/sceneadmin/image/A0/B0/C0/D31/E337/F270/85f03be7-cd0c-4bde-812f-7b7f603d7281.jpg",
  "https://www.travel.taipei/d_upload_ttn/sceneadmin/image/A0/B0/C0/D5/E118/F202/2f1620b9-38b1-4c17-843b-5fed2a5ae31e.jpg",
  "https://www.travel.taipei/d_upload_ttn/sceneadmin/image/A0/B0/C0/D7/E895/F87/f3eb1428-6152-4c15-b328-575d59e4477c.jpg",
  "https://www.travel.taipei/d_upload_ttn/sceneadmin/image/A0/B0/C0/D12/E556/F480/9461764b-0049-480c-9f96-ca1c1fb2b9bc.jpg",
  "https://www.travel.taipei/d_upload_ttn/sceneadmin/image/A0/B0/C0/D18/E762/F342/78245221-888e-44d0-ad0c-72a8e3494538.jpg",
  "https://www.travel.taipei/d_upload_ttn/sceneadmin/image/A0/B0/C0/D22/E222/F927/dce66fe1-6277-422d-8537-e5cb8fe8aaa5.jpg",
  "https://www.travel.taipei/d_upload_ttn/sceneadmin/image/A0/B0/C0/D17/E672/F642/f4201ef7-2137-447c-b832-c1d699142675.jpg",
];

// let pic = images[5];

let pic = document.getElementById("spotPhoto");

pic.src = images[0];
const clickRightBtn = () => {
  let index = calIndex(1);
  replaceImgSrc(index);
};
const clickLeftBtn = () => {
  let index = calIndex(-1);
  replaceImgSrc(index);
};

const calIndex = (increment) => {
  let currentIndex = images.indexOf(pic.src);
  let arrayLength = images.length;
  let nextIndex = (currentIndex + increment + arrayLength) % arrayLength;
  // if (nextIndex > images.length - 1) {
  //   nextIndex = nextIndex - (images.length - 1);
  // }
  // if (nextIndex < 0) {
  //   nextIndex = images.length + nextIndex;
  // }
  return nextIndex;
};

const replaceImgSrc = (nextIndex) => {
  //0.外部傳入increment
  //1.get current index
  //2.cal nextindex
  //3.change eleImg.src
  pic.src = images[nextIndex];
  replaceDotIndex(nextIndex);
};

const replaceDotIndex = (nextIndex) => {
  dots[nextIndex].checked = true;
};

const addDot = () => {
  let dot = document
    .getElementById("pageDots")
    .appendChild(document.createElement("input"));
  dot.setAttribute("type", "radio");
  dot.setAttribute("class", "pageDot");
  dot.setAttribute("name", "dot");
};

const generateDots = () => {
  images.forEach((i) => addDot());
};
generateDots();

const checkDotIndex = (e) => {
  let index = Array.prototype.indexOf.call(dots, e.target);
  replaceImgSrc(index);
};

// const calDotShift = (event) => {
//   let currentIndex = Array.prototype.indexOf.call(dots, event.target);
//   console.log(typeof preIndex);
//   let increment = currentIndex - preIndex;
//   console.log(currentIndex - preIndex);
//   preIndex = currentIndex;
//   let index = calIndex(increment);
//   // replaceImgSrc(index);
//   console.log(
//     "curr:",
//     currentIndex,
//     "increment:",
//     increment,
//     "preindex:",
//     preIndex
//   );
// };

//the default value of checked dot when loading
let dots = document.getElementById("pageDots").children;
dots[0].checked = true;
//after generate dots add event listener
for (let i = 0; i < dots.length; i++) {
  dots[i].addEventListener("click", checkDotIndex);
}

//if images.length <= 11 generate dots.length = images.length
//right button + 1 leftbtn -1
//dot 的index 與img的index一致
//if images.length >11 dots.length =11
//indexof(images) < 8 就是dot 1~8移動 >8 就是維持在第八顆直到 images.length - 8 < 4 才往前
//反向移動 indexof(images)-8 > 4 維持第四顆到 <4 才往後移動
