var orderNumber = window.location.href.split('number=').at(-1)

console.log(orderNumber,'access_token:',access_token)

async function getFetch(headers){
    try{
            let res =  await fetch(`/api/orders?number=${orderNumber}`,{'headers': headers})
            if (res.status === 200){
                let data = await res.json() 
                return data          
            }        
    }catch(e){console.log('GET token /api/booking 錯誤 >>', e)};
}

async function thankyou(){
    headers={
        "Content-Type":"application/json; charset=UTF-8",
        'Accept': 'application/json',
        'Authorization': `Bearer ${access_token}`
    }
    let dict = await getFetch(headers)
    console.log('GET /api/orders 回傳值',dict)
    if ('data' in dict){

        if (dict['data'] === null){
            document.querySelector('.message').innerHTML= `沒有此筆訂單 ${orderNumber}`
        }
        else if (dict['data'] === false){
            window.location.href = "/";
        }
        else{
            console.log('感謝頁面有不明原因一',dict['data'])  
        }
    }
    else if('number' in dict){
        let userName = dict['contact']['name'], status = dict['status']

        if (status === 0){
            document.querySelector('.remind').style.display='block'
            document.querySelector('.message').innerHTML= `${userName}，您付款成功，訂單編號為${orderNumber}`
            document.querySelectorAll('.spot')[0].innerHTML= `地點: ${dict['trip']['attraction']['name']}`
            document.querySelectorAll('.spot')[1].innerHTML= `地址: ${dict['trip']['attraction']['address']}`
            document.querySelectorAll('.spot')[2].innerHTML= `日期: ${dict['trip']['date']}`
            document.querySelectorAll('.spot')[3].innerHTML= `時段: ${dict['trip']['time']}`
            

        }
        else{
            document.querySelector('.message').innerHTML= `${userName}，您付款失敗，訂單編號為${orderNumber}，請洽客服`
        } 

    }
    else{
        console.log('感謝頁面有不明原因二',dict)
        document.querySelector('.message').innerHTML= `${dict['message']}`
    }
    document.querySelector('.load').style.display = 'none'
    document.querySelector('.template').style.display = 'flex'
}

///等待載入頁面...
document.getElementsByTagName('body')[0].classList.add('body')
document.getElementsByTagName('html')[0].classList.add('html')


if (access_token){
    setTimeout(thankyou,700)
}
else{
    async function toHome(){
        headers ={
            "Content-Type":"application/json; charset=UTF-8",
            'Accept': 'application/json',
        }
        let dict = await getFetch(headers)
        console.log('GET /api/orders 回傳值',dict)   
        window.location.href = "/";
    }
    toHome()
}
