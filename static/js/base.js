function clean(){
    for (let i = 0; i < form_list.length; i++){
        form_list[i].reset()
    }

    let label_len = document.getElementsByTagName('label').length
    for (let i = 0; i < label_len; i++) {
        document.querySelectorAll('.valid')[i].style.display ='none'
        document.querySelectorAll('.invalid')[i].style.display ='none'
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

function prompt(i){
    let email_str = document.querySelectorAll(".email")[i].value
    let password_str = document.querySelectorAll(".password")[i].value
    let name_str = document.querySelector(".name").value

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


    else if (i === 0 && email_str.match(pat_email) && password_str.match(pat_password)) { //登入

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

    else if (i === 1 && name_str.match(pat_name) && email_str.match(pat_email) && password_str.match(pat_password)) { //註冊
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
                    clean()
                    document.querySelectorAll(".email")[i].value = ''
                    document.querySelectorAll(".password")[i].value = ''
                    document.querySelector(".name").value = ''
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

function validate(target){
    let ta_name = target.name
    let at_i = parseInt(target.parentNode.getAttribute('data').substring('4'))

    console.log(at_i,`驗證 ${ta_name}`)
    if(ta_name == 'email'){
        if(target.value.match(pat_email)){
            document.querySelectorAll('.valid')[at_i].style.display ='block'
            document.querySelectorAll('.invalid')[at_i].style.display ='none'
        }
        else{
            if (target.value === ''){
                document.querySelectorAll('.valid')[at_i].style.display ='none'
                document.querySelectorAll('.invalid')[at_i].style.display ='none'
            }
            else{
                document.querySelectorAll('.valid')[at_i].style.display ='none'
                document.querySelectorAll('.invalid')[at_i].style.display ='block'
            }
        }
    }
    else if(ta_name == 'password'){
        if(target.value.match(pat_password)){
            document.querySelectorAll('.valid')[at_i].style.display ='block'
            document.querySelectorAll('.invalid')[at_i].style.display ='none'
        }
        else{
            if (target.value === ''){
                document.querySelectorAll('.valid')[at_i].style.display ='none'
                document.querySelectorAll('.invalid')[at_i].style.display ='none'
            }
            else{
                document.querySelectorAll('.valid')[at_i].style.display ='none'
                document.querySelectorAll('.invalid')[at_i].style.display ='block'
            }
        }
    }
    else if(ta_name == 'name'){
        if(target.value.match(pat_name)){
            document.querySelectorAll('.valid')[at_i].style.display ='block'
            document.querySelectorAll('.invalid')[at_i].style.display ='none'
        }
        else{
            if (target.value === ''){
                document.querySelectorAll('.valid')[at_i].style.display ='none'
                document.querySelectorAll('.invalid')[at_i].style.display ='none'
            }
            else{
                document.querySelectorAll('.valid')[at_i].style.display ='none'
                document.querySelectorAll('.invalid')[at_i].style.display ='block'
            }
        }
    }
}

function focus(){
    //清空所有警示
    document.querySelector(".login").style.height = '275px';
    document.querySelector(".register").style.height = '332px'
    for (let j = 0; j < form_list.length; j++) {
        prompt_list[j].style.display = 'none';
    }
    console.log('聚焦')
}


function fetchGet_in(para){
    fetch("/api/user",{
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
        console.error('GET token /api/user 錯誤 >>', error)
    })
    .then(function(dict){
        console.log('GET token /api/user 回傳值',dict)
        if (typeof(dict) === 'object'){
            if (dict['data'] === false || dict['data'] === null){
               document.getElementById("upright").innerHTML ='登入/註冊'  
               document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
               console.log('invalid token, clean cookie',document.cookie.length)
            }
            else{
                document.getElementById("upright").innerHTML ='登出系統' 
                userName = dict['data']['name'],  userEmail = dict['data']['email']

            }
        }
        else{
            console.log('!!!其他不明情況')
        }
    });
}

function fetchGet_out(){
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
            if (dict['data'] === false || dict['data'] === null){
               document.getElementById("upright").innerHTML ='登入/註冊' 
            }
        });  
}


let pat_email = /^([\w]+)@([\w]+)\.([a-z]{2,8})(\.[a-z]{2,8})?$/
let pat_password = /^[\w]{4,8}$/
let pat_name = /^([a-zA-Z0-9_]{3,8}|[\u4e00-\u9fa5]{2,8})$/

let form_list = document.querySelectorAll("form"), prompt_list = document.querySelectorAll(".prompt");

for (let i = 0; i < form_list.length; i++) {
    document.querySelectorAll(".email")[i].addEventListener("focus", focus);
    document.querySelectorAll(".email")[i].addEventListener("input", function(){
        validate(this);
    }, false);
    document.querySelectorAll(".password")[i].addEventListener("focus", focus);
    document.querySelectorAll(".password")[i].addEventListener("input", function(){
        validate(this);
    }, false);

    
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

if (1 === 1){
    document.getElementById("login").addEventListener('click',RegisterToLogin)
    document.getElementById("register").addEventListener('click',register)
    document.querySelector(".name").addEventListener("focus", focus);
    document.querySelector(".name").addEventListener("input", function(){
    validate(this);
    }, false);
}


if (document.cookie.includes('access_token')){
    document.getElementById("book").addEventListener('click',()=>{location.href='/booking'})
    document.getElementById("upright").addEventListener('click',logout) //已登入狀態點登出

    // take token out
    const myArray = document.cookie.split(";");
    console.log('Token Array',myArray)
    for (let i = 0 ;i < myArray.length; i++){
        if (myArray[i].includes('access_token')){
            access_token = myArray[i].replace('access_token=','').replace(/\s/g,'')
        }
    }
    fetchGet_in(access_token)
}

else{
    document.getElementById("book").addEventListener('click',login)
    document.getElementById("upright").addEventListener('click',login)

    console.log('no Token Array',document.cookie.split(";"))
    fetchGet_out()
}

var access_token, userName, userEmail;
