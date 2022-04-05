//未登入情況
console.log('正在booking...', userName , userEmail)



async function cancel(){
    let dict = await getFetch("/api/booking",'DELETE')
    console.log('DELETE token /api/booking 回傳值',dict)
    if ('ok' in dict){
        window.location.reload()
    }
    else{
        console.log('無法取消行程並重整頁面')
    }
}

async function getFetch(url,method){
    try{
            let res =  await fetch(url,{'method':method,headers: {Authorization: `Bearer ${access_token}`}})
            if (res.status === 200){
                let data = await res.json() 
                return data          
            }        
    }catch(e){console.log('GET token /api/booking 錯誤 >>', e)};
}

async function bookGet(){
    console.log('booking完畢', userName !== undefined, userEmail !== undefined)

    //清空form表單內容
    for (let i = 0; i < Bform_list.length; i++){
        Bform_list[i].reset()
    }

    if (!document.cookie.includes('access_token')){
        window.location.href = "/";
    }
    else if (userName === undefined || userEmail === undefined){
            let dict = await getFetch("/api/user",'GET')
            console.log('booking 重抓 !!! GET token /api/user 回傳值',dict)
            if (typeof(dict) === 'object'){
                if (dict['data'] === false || dict['data'] === null){
                   document.getElementById("upright").innerHTML ='登入/註冊'  
                   document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                   console.log('invalid token, clean cookie',document.cookie.length)
                }
                else if (typeof(dict['data'] === 'object') ){
                    document.getElementById("upright").innerHTML ='登出系統' 
                    userName = dict['data']['name'],  userEmail = dict['data']['email']
                }
                else{
                    console.log('!!!其他不明情況一', dict, typeof(dict))
                }
            }
            else{
                console.log('!!!其他不明情況二',dict, typeof(dict))
            }
    }
    ////
    let dict = await getFetch("/api/booking",'GET')
    console.log('GET token /api/booking 回傳值',dict)
    document.querySelector('.Bheader').innerHTML =`您好，${userName}，待預訂的行程如下：`

    if(dict['data'] === false){
       console.log('Token 已過期，必須回到首頁')
       window.location.href = "/"
    }

    else if(dict['data'] === null){
        document.getElementById("load").remove()
        document.querySelector('.whole').style.display = 'block'

        console.log(dict['data'],'無預定紀錄')
        document.querySelector('.noData').style.display = 'block'
        document.querySelector('.Bsection').style.display = 'none'
        document.querySelector('.Bconfirm').style.display = 'none'

        for (let i=0; i<whole.getElementsByTagName('hr').length; i++){
            whole.getElementsByTagName('hr')[i].style.display = 'none'
        }

        for (let i=0; i<whole.getElementsByTagName('form').length; i++){
            whole.getElementsByTagName('form')[i].style.display = 'none'
        }
        //footer change
        document.getElementsByTagName('body')[0].classList.add('body')
        document.getElementsByTagName('html')[0].classList.add('html')
        document.getElementById('footer').classList.add('full')
        document.getElementById('footer').classList.remove('notfull')
    }

    else if (typeof(dict['data'] === 'Object')){////主要程式碼
        document.getElementById("load").remove()
        document.querySelector('.whole').style.display = 'block'

        console.log(dict['data'],'有預定紀錄')
        document.querySelector('.noData').style.display = 'none'
        document.querySelector('.Bsection').style.display = 'flex'

        let item_img = document.createElement('img')
        item_img.src = dict['data']['attraction']['image']
        document.querySelector('.Bpicture').appendChild(item_img)

        let trash ='<div class="cancel"><img src="/static/img/icon_delete.jpg"></div>'
        document.querySelector('.item_t').innerHTML=`台北一日遊：${dict['data']['attraction']['name']}${trash}`

        whole.querySelector('.cancel').addEventListener('click',cancel)

        for(let i =0; i<whole.querySelectorAll('.item').length;i++){
            if (i === 0){
            whole.querySelectorAll('.item')[i].innerHTML=`<span>日期：</span>${dict['data']['date']}`
            }
            else if(i === 1){
            whole.querySelectorAll('.item')[i].innerHTML=`<span>時間：</span>${dict['data']['time']}`
            }
            else if(i === 2){
            whole.querySelectorAll('.item')[i].innerHTML=`<span>費用：</span>新台幣 ${dict['data']['price']} 元`
            }
            else if(i === 3) {
            whole.querySelectorAll('.item')[i].innerHTML=`<span>地點：</span>${dict['data']['attraction']['address']}`
            }

        }

        whole.querySelector('.name').value = `${userName}`
        whole.querySelector('.email').value = `${userEmail}`
        whole.querySelector('.confirmPrice').innerHTML = `總價：新台幣 ${dict['data']['price']} 元`

        //footer change
        document.getElementsByTagName('body')[0].classList.remove('body')
        document.getElementsByTagName('html')[0].classList.remove('html')
        document.getElementById('footer').classList.remove('full')
        document.getElementById('footer').classList.add('notfull')
    }////主要程式碼

    else{
        console.log('bookGet有不明情況')

    }
};


setTimeout(bookGet,800)


let whole = document.querySelector('.whole')
let Bform_list = whole.getElementsByTagName('form')
//點擊付款
document.querySelector('.confirmBtn').addEventListener('click',clickPay)

///等待載入頁面...
document.getElementsByTagName('body')[0].classList.add('body')
document.getElementsByTagName('html')[0].classList.add('html')
document.getElementById('footer').classList.add('full')
document.getElementById('footer').classList.remove('notfull')


// 設置好等等 GetPrime 所需要的金鑰
TPDirect.setupSDK(124024,'app_8PZWHViTnDMvcfP62JynEsRUVkoXu2Wf5R7tneWZtDtGJLjDbKkzFqka66fM', 'sandbox')
// 把 TapPay 內建輸入卡號的表單給植入到 div 中
let fields;
TPDirect.card.setup({
    // Display ccv field
    fields : {
        number: {
            // css selector
            element: '#card-number',
            placeholder: '**** **** **** ****'
        },
        expirationDate: {
            // DOM object
            element: document.getElementById('card-expiration-date'),
            placeholder: 'MM / YY'
        },
        ccv: {
            element: '#card-ccv',
            placeholder: 'CVV'
        }
    }
})


// call TPDirect.card.getPrime when user submit form to get tappay prime
function clickPay(event) {
    event.preventDefault()

    // 取得 TapPay Fields 的 status
    const tappayStatus = TPDirect.card.getTappayFieldsStatus()

    // 確認是否可以 getPrime
    if (tappayStatus.canGetPrime === false) {
        alert('can not get prime')
        return
    }

    // Get prime
    TPDirect.card.getPrime((result) => {
        if (result.status !== 0) {
            alert('get prime error ' + result.msg)
            return
        }
        alert('get prime 成功，prime: ' + result.card.prime)

        // send prime to your server, to pay with Pay by Prime API .
        // Pay By Prime Docs: https://docs.tappaysdk.com/tutorial/zh/back.html#pay-by-prime-api
    })
}
