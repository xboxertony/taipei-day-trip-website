function clean(){
    for (let i = 0; i < form_list.length; i++){
        form_list[i].reset()
    }
}

function login(){
    clean()
    document.getElementsByTagName('form')[0].reset();
    document.querySelector(".overlay").style.display = 'block';
    document.querySelector(".window").style.display = 'flex';
    document.querySelector(".register").style.display = 'none';
    document.querySelector(".login").style.display = 'block';
    document.querySelector(".login").style.height = '275px';
    prompt_list[0].style.display = 'none';
}

function logout(){
    fetch('/api/user', {method: 'DELETE'})
      .then(response => response.json()) // 輸出成 json
      .catch(error => console.error('Error:', error))
      .then(function(dict){
        console.log('DELETE /api/user 回傳值',dict)
        window.location.reload() 
    });

}

function close(){
    document.querySelector(".window").style.display = 'none';
    document.querySelector(".overlay").style.display = 'none';
}

function hover(i){
    document.querySelectorAll(".another")[i].style.fontWeight = 'bold';
    console.log(i,'hover')
}

function hoverout(i){
    document.querySelectorAll(".another")[i].style.fontWeight = 'normal';
    console.log(i,'hoverout')
}


let account = 0
function prompt(i){
    let email_str = document.querySelectorAll(".email")[i].value
    let password_str = document.querySelectorAll(".password")[i].value
    let name_str = document.querySelectorAll(".name")[0].value

    if (i === 0 &&(email_str === "" || password_str === "")){  //登入資料不全
        document.querySelector(".login").style.height = '307px';
        prompt_list[i].style.display = 'flex';
        prompt_list[i].innerHTML = '資料輸入不齊全'
    }
    else if (i === 1 && (name_str === "" || email_str === "" || password_str === "")){  //註冊資料不全
        document.querySelector(".register").style.height = '364px';
        prompt_list[i].style.display = 'flex';
        prompt_list[i].innerHTML = '資料輸入不齊全'
    }

    else if (i === 0 && email_str !== "" && password_str !== "") { //登入

        fetch("/api/user",{
            'method':'PATCH',
            body:JSON.stringify({"email": email_str,"password": password_str}),
            headers:{
                "Content-Type":"application/json; charset=UTF-8",
                'Accept': 'application/json'
            }
            })
            .then(function(response){
                return response.json();
                })
            .catch(error => console.error('Error:', error))
            .then(function(dict){
                console.log('PATCH /api/user 回傳值',dict)
                if ('ok' in dict){
                    window.location.reload()
                }
                else{
                    document.querySelector(".login").style.height = '307px';
                    prompt_list[i].style.display = 'flex';
                    prompt_list[i].innerHTML = dict['message']
                }

            }); 
        
    }

    else if (i === 1 && name_str !== "" && email_str !== "" && password_str !== "") { //註冊
        let data = {"name": name_str,"email": email_str,"password": password_str}

        fetch("/api/user",{
            'method':'POST',
            body:JSON.stringify(data),
            headers:{
                "Content-Type":"application/json; charset=UTF-8",
                'Accept': 'application/json'
            }
            })
            .then(function(response){
                return response.json();
                })
            .catch(error => console.error('Error:', error))
            .then(function(dict){
                console.log('POST /api/user 回傳值',dict)
                document.querySelector(".register").style.height = '364px';
                prompt_list[i].style.display = 'flex';
                if ('ok' in dict){
                    prompt_list[i].innerHTML = `${name_str} 註冊成功`
                    document.querySelectorAll(".email")[i].value = ''
                    document.querySelectorAll(".password")[i].value = ''
                    document.querySelectorAll(".name")[0].value = ''
                }
                else{
                    prompt_list[i].innerHTML = dict['message']
                }
            });      
    }
}

function register(){
    clean()
    document.querySelector(".login").style.display = 'none';
    document.querySelector(".register").style.height = '332px'
    document.querySelector(".register").style.display = 'block';
    prompt_list[1].style.display = 'none';
}

function RegisterToLogin(){
    clean()
    document.querySelector(".register").style.display = 'none';
    document.querySelector(".login").style.display = 'block';
    document.querySelector(".login").style.height = '275px';
    prompt_list[0].style.display = 'none';
}


function fucus(){
    document.querySelector(".login").style.height = '275px';
    document.querySelector(".register").style.height = '332px'
    for (let i = 0; i < form_list.length; i++) {
        prompt_list[i].style.display = 'none';
    }
}


let form_list = document.querySelectorAll("form"), prompt_list = document.querySelectorAll(".prompt");

for (let i = 0; i < form_list.length; i++) {
    document.querySelectorAll(".email")[i].addEventListener("focus", function(){
        fucus();
    }, false);
    document.querySelectorAll(".password")[i].addEventListener("focus",  function(){
        fucus();
    }, false);
    document.querySelectorAll(".name")[0].addEventListener("focus",  function(){
        fucus();
    }, false);
}

for (let i = 0; i < form_list.length; i++) {
    document.querySelectorAll(".another")[i].addEventListener("mouseover", function(){
        hover(i);
    }, false);

    document.querySelectorAll(".another")[i].addEventListener("mouseout",  function(){
        hoverout(i);
    }, false);

    document.querySelectorAll(".close")[i].addEventListener("click", close);

    form_list[i].addEventListener("submit", function(e){
        e.preventDefault()
        prompt(i)
    }, false);
}


document.getElementById("login").addEventListener('click',RegisterToLogin)
document.getElementById("register").addEventListener('click',register)

console.log("Now cookie's length",document.cookie.length)

if (document.cookie.length === 0){
    console.log('access_token >>', '無')
    document.getElementById("upright").addEventListener('click',login)    
    fetch("/api/user",{'method':'GET'})
        .then(function(response){
            if(response.ok) {
                return response.json();
              }
            })
        .catch(error => {
            console.error('GET /api/user Error:', error)
        })
        .then(function(dict){
            console.log('GET /api/user 回傳值',dict)
            if (dict['data'] === null){
               document.getElementById("upright").innerHTML ='登入/註冊' 
            }
        }); 
    
}
else{
    document.getElementById("upright").addEventListener('click',logout) 
    let access_token = document.cookie.replace('access_token=','')

    console.log('access_token >>', access_token)


    fetch("/api/user",{
        'method':'GET',
        headers: {
            Authorization: `Bearer ${access_token}`,
          }
    })
    .then(function(response){
        if(response.ok) {
            return response.json();
          }
        })
    .catch(error => {
        console.error('GET token /api/user 錯誤 >>', error)
    })
    .then(function(dict){
        console.log('GET token /api/user 回傳值',dict)
        if (typeof(dict) === 'object'){
            if (dict['data'] === null){
               document.getElementById("upright").innerHTML ='登入/註冊'  
               document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
               console.log('invalid token, clean cookie',document.cookie.length)
            }
            else{
                document.getElementById("upright").innerHTML ='登出系統' 
            }
        }
        else{
            console.log('!!!其他不明情況')
        }
    }); 
}