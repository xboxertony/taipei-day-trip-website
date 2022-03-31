//未登入情況
if (! document.cookie.includes('access_token')){
    window.location.href = "/";
}


function bookGet(para){
    fetch("/api/booking",{
        'method':'GET',
        headers: {
            Authorization: `Bearer ${para}`,
          }
    })
    .then(function(response){
        if(response.ok) {
            return response.json();
          }
        })
    .catch(error => {
        console.error('GET token /api/booking 錯誤 >>', error)
    })
    .then(function(dict){
        console.log('GET token /api/booking 回傳值',dict)
        
        document.querySelector('.bookHeader').innerHTML =`您好，${userName}，待預訂的行程如下：`

        if (typeof(dict) === 'object'){
            
            if (dict['data'] === null){
                console.log(dict['data'],'無預定紀錄')


            }
            else{
                console.log(dict['data'],'有預定紀錄')
            }
        }
        else{
            console.log('!!!其他不明情況')
        }
    });
}

console.log('導到booking頁面')

bookGet(access_token)



// document.querySelector('header').innerText=

