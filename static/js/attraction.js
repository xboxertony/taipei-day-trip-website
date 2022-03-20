function makeDiv(name, cate, descp, address, transport, mrt,images){
    document.getElementsByClassName('title')[0].appendChild(document.createTextNode(name))
    document.getElementsByClassName('mrt_cat')[0].appendChild(document.createTextNode(`${cate} at ${mrt}`))
    document.getElementsByClassName('des')[0].appendChild(document.createTextNode(descp))
    document.getElementsByClassName('addr_des')[0].appendChild(document.createTextNode(address))
    document.getElementsByClassName('traf_des')[0].appendChild(document.createTextNode(transport))

    for (let i = 0; i < images.length; i++){
        let item = document.createElement('div')
        item.className = 'item'
        let item_img =document.createElement('img')
        item_img.src = images[i]
        item.appendChild(item_img)
        document.getElementById('slider_main').appendChild(item)

        let whiteDot = document.createElement('div')

        whiteDot.setAttribute('data',`${i}`)
        if (i === 0){
            whiteDot.className = 'current'
        }
        else{
            whiteDot.className = 'not_current'
        }
        document.getElementById('slider_index').appendChild(whiteDot)
    }
};
async function getValue(url){
    try{
        let res =  await fetch(url) // fetch(url) is a promise, so we should wait until fullfilled. res is a response object.
        if (res.status === 200){
            let data = await res.json() // res.json() is a promise so we should wait until fullfilled. data is the value we want.
            return data          
        }        
    }catch(e){console.log('產生錯誤',e)}
} 

async function loadItem(url){
    console.log('fetch',url)
    let ajaxBack = await getValue(url)
    let data = ajaxBack['data']
    let name = data['name'], cate = data['category'], descp = data['description'], address = data['address'], transport = data['transport']
    let mrt = data['mrt'],  images = data['images'].slice(0,3);

    document.title = name
    makeDiv(name, cate, descp, address, transport, mrt,images)
    console.log(`${name}, ${cate}, ${mrt}`, images)
    console.log('loadItem done')


};
function first (){
    if (!document.getElementById('A')&& !document.getElementById('B')){
        let _1span = document.createElement('span')
        _1span.className = 'choose'
        _1span.setAttribute('id','A');
        document.getElementById('_1pick').appendChild(_1span)
        document.getElementById('dollar').innerHTML  = '2,000'
    }

    else if (!document.getElementById('A')&& document.getElementById('B')){
        document.getElementById('B').remove()
        let _1span = document.createElement('span')
        _1span.className = 'choose'
        _1span.setAttribute('id','A');
        document.getElementById('_1pick').appendChild(_1span)
        document.getElementById('dollar').innerHTML  = '2,000'
    }
    else{

    }
}
function second(){
    if (document.getElementById('A')){
        document.getElementById('A').remove()
        let _2span = document.createElement('span')
        _2span.className = 'choose'
        _2span.setAttribute('id','B')
        document.getElementById('_2pick').appendChild(_2span)
        document.getElementById('dollar').innerHTML  = '2,500'
    }
    else{

    }
};


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
    },5000)
}

// 輪播函式
async function animation(){
    await loadItem(`/api/attraction/${window.location.href.substring(33)}`)
    allBoxes = slider_main.children
    dot_list = slider_index.children
    console.log("after",allBoxes,dot_list)
    //
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


    //電腦游標
    slider_main.addEventListener('mousemove',function(){
        this.style.cursor = 'grab';
        console.log('in',num)
        clearInterval(timer);
    })
    slider_main.addEventListener('mouseout',function(){
        console.log('out',num)
        setTimer()
    })
    //手機觸控
    slider_main.addEventListener('touchstart',function(){
        this.style.cursor = 'grab';
        console.log('in',num)
        clearInterval(timer);
    })
    slider_main.addEventListener('touchend',function(){
        console.log('out',num)
        setTimer()
    })




}

//選擇上半、下半天方案
console.log('GO !')
document.getElementById('_1pick').addEventListener('click',first)
document.getElementById('_2pick').addEventListener('click',second)
window.onload = first

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
console.log("before",allBoxes,dot_list)


//ajax
animation()



