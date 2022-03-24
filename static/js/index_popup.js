function login(){
    document.querySelector(".overlay").style.display = 'block';
    document.querySelector(".window").style.display = 'flex';
    document.querySelector(".register").style.display = 'none';
    document.querySelector(".login").style.display = 'block';
    document.querySelector(".login").style.height = '275px';
    prompt_list[0].style.display = 'none';
}
function close(){
    document.querySelector(".window").style.display = 'none';
    document.querySelector(".overlay").style.display = 'none';
}

function hover(i){
    another_list[i].style.fontWeight = 'bold';
    console.log(i,'hover')
}

function hoverout(i){
    another_list[i].style.fontWeight = 'normal';
    console.log(i,'hoverout')

}

let exist = 0
function prompt(i){
    if (exist > 0 && i === 0){}
    else if (exist > 0 && i === 1){}
    else if ( exist === 0 && i === 0){  
        console.log(i,'login')
        document.querySelector(".login").style.height = '307px';
        prompt_list[i].style.display = 'flex';
    }
    else if (exist === 0 && i === 1){
        console.log(i,'register')
        document.querySelector(".register").style.height = '364px';
        prompt_list[i].style.display = 'flex';
    } 
}

function register(){
    document.querySelector(".login").style.display = 'none';
    document.querySelector(".register").style.height = '332px'
    document.querySelector(".register").style.display = 'block';
    prompt_list[1].style.display = 'none';
}

function regstolog(){
    document.querySelector(".register").style.display = 'none';
    document.querySelector(".login").style.display = 'block';
    document.querySelector(".login").style.height = '275px';
    prompt_list[0].style.display = 'none';
}

let another_list = document.querySelectorAll(".another"), close_list = document.querySelectorAll(".close");
let form_list = document.querySelectorAll("form"), prompt_list = document.querySelectorAll(".prompt");

for (let i = 0; i < 2; i++) {
    another_list[i].addEventListener("mouseover", function(){
        hover(i);
    }, false);

    another_list[i].addEventListener("mouseout",  function(){
        hoverout(i);
    }, false);

    close_list[i].addEventListener("click", close);

    form_list[i].addEventListener("submit", function(e){
        e.preventDefault()
        prompt(i)
    }, false);
}

document.getElementById("logreg").addEventListener('click',login)
document.getElementById("toLog").addEventListener('click',regstolog)
document.getElementById("toReg").addEventListener('click',register)




