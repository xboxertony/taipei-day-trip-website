function Carousel(){
    // //讓滾動的元素歸位   
    // timer = setInterval(()=>{
    //     //先讓所有圖片遮蔽，再顯示索引位置的圖片，播放到最後再從第一張顯示起
    //     num++;
    //     for (let i =0; i< allBoxes.length; i++){
    //         allBoxes[i].style.display= 'none';
    //     }
    //     if (num === allBoxes.length){
    //         num = 0
    //     }
    //     allBoxes[num].style.display ='block'
    // },2000)

    //小圓點切換圖片: 先獲取所有的小白圈

    // for (let i = 0; i < allBoxes.length; i++){
    //     //綁定圓點與圖片，點擊時圓點變黑，背景圖也要切換。圓點與背景圖索引序號需相同
    //     dot_list[i].addEventListener('click',function(){
    //         //1. 先隱藏所有背景圖，給所有小白圈去黑點
    //         for (let j = 0; j < allBoxes.length; j++){
    //             allBoxes[j].style.display = 'none'
    //             dot_list[j].className = 'not_current';
    //         }
    //         //2. 小圓圈變黑點，顯示對應之圖片
    //         this.className = 'current'
    //         Inow = parseInt(this.getAttribute('data'))
    //         allBoxes[Inow].style.display = 'block'
    //     })
    // }
}



//獲取標籤
let slider = document.getElementById('slider');
let slider_main = document.getElementById('slider_main')
let allBoxes = slider_main.children

let slider_index = document.getElementById('slider_index');
let dot_list = slider_index.children

let next = document.getElementById('next');
let prev = document.getElementById('prev');
let iNow
let num = 0, timer;
console.log('start carousel',allBoxes,dot_list)

//change是封裝一個函數，根據一個數字參數，顯示指定圖片
function change(n){
    //隱藏所有圖片
    //去掉所有圓圈黑點
    
    //根據參數n，顯示指定圖片
    //根據參數n，加黑點於圓點上
    
    for (let i = 0; i < allBoxes.length; i++){
        allBoxes[i].style.display = 'none'
        dot_list[i].className = 'not_current';}

    dot_list[n].className = 'current'
    allBoxes[n].style.display = 'block'
}

function setTimer(){
    timer = setInterval(()=>{
    //先讓所有圖片遮蔽，再顯示索引位置的圖片，播放到最後再從第一張顯示起
    num++;
    for (let i =0; i< allBoxes.length; i++){
        allBoxes[i].style.display= 'none';
    }
    if (num === allBoxes.length){
        num = 0
    }
    change(num)
    },3000)
}

setTimer()
//游標點擊事件: 獲取所有圓點，綁定事件
for (let i = 0; i < allBoxes.length; i++){
    //綁定圓點與圖片，點擊時圓點變黑，背景圖也要切換。圓點與背景圖索引序號需相同
    dot_list[i].addEventListener('click',function(){
        num = parseInt(this.getAttribute('data'))
        console.log('click',num)
        change(num)
    })
}

//游標點擊事件: 獲取右箭頭，綁定事件
next.addEventListener('click',function(){
    console.log('leave',num)
    num++;
    if (num === allBoxes.length){
        num = 0
    }
    console.log('to next',num)
    change(num)
})

//游標點擊事件: 獲取左箭頭，綁定事件
prev.addEventListener('click',function(){
    console.log('leave',num)
    num--;
    if (num === -1){
        num = allBoxes.length-1
    }
    console.log('to prev',num)
    change(num)
})


slider.addEventListener('mousemove',function(){
    this.style.cursor = 'grab';
    console.log('in',num)
    clearInterval(timer);
})
slider.addEventListener('mouseout',function(){
    console.log('out',num)
    setTimer()
})
