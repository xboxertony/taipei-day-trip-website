let booking_btn = document.getElementById("booking")
let login_btn = document.getElementById("login");
let login_board = document.getElementsByClassName("block_page")[0];
let close_btn = document.getElementsByClassName("close");
let message = document.getElementsByClassName("message");

let login_btn_a = document.getElementById("login_account");
let create_btn_a = document.getElementById("create_account");

let login_board_b = document.getElementById("login_board");
let create_board_b = document.getElementById("create_board");

let login_create = document.getElementById("login_create");

let create_act_btn = document.getElementById("create_account_btn");
let create_name = document.getElementById("create_name");
let create_password = document.getElementById("create_password");
let create_email = document.getElementById("create_email");

let login_act_btn = document.getElementById("login_btn");
let login_email = document.getElementById("login_email");
let login_password = document.getElementById("login_password");

let local = window.location.href.split("/")[2];
let logout = document.getElementById("logout");

booking_btn.addEventListener("click", function (e) {
    e.preventDefault()

    fetch("/api/user", {
        method: "GET"
    }).then((res) => {
        return res.json()
    }).then((data) => {
        if (data["data"]) {
            window.location.href = "/booking"
        } else {
            login_board.classList.add("open");
        }
    })
})

// if(localStorage.getItem('login')==="ok"){
//     login_btn.innerHTML = "登出";
// }

// if(document.cookie){
//     console.log(document.cookie,1)
//     login_btn.innerHTML = "登出";
// }

function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    // console.log("ID: " + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log("Name: " + profile.getName());
    // console.log("Image URL: " + profile.getImageUrl());
    console.log("Email: " + profile.getEmail()); // This is null if the 'email' scope is not present.
    // after_login()
    fetch("/api/google/user",{
        method:"PATCH",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            "name":profile.getName(),
            "email":profile.getEmail()
        })
    }).then((res)=>{
        return res.json()
    }).then((data)=>{
        if(data["ok"]){
            login_board.classList.remove("open");
            document.getElementById("message_for_error_login").innerHTML = ""
            get_user()
            // after_login()
        }
    })
}
function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log("User signed out.");
    });
}

// signOut()

let order_problem = null;


function get_user(){
    fetch("/api/user", {
        method: "GET",
    })
        .then((res) => {
            return res.json();
        })
        .then((res) => {
            document.getElementById("booking").style.display = "inline";
            if (res["data"]) {
                document.getElementById("logout").style.display = "inline";
                document.getElementById("login").style.display = "none";
                order_problem = () => {
                    let name = res.data.name
                    let email = res.data.email
                    return {
                        "name": name,
                        "email": email
                    }
                }
            } else {
                console.log("ok")
                document.getElementById("login").style.display = "inline";
                document.getElementById("logout").style.display = "none";
            }
        });
}

get_user()



// function order_problem(){
//     if (window.location.href.split("/").includes("order")) {
//         document.getElementById("order_name").value = res.data.name
//         document.getElementById("order_email").value = res.data.email
//     }
// }

login_act_btn.addEventListener("click", (e) => {
    e.preventDefault();
    let data = {
        email: document.getElementById("login_email").value,
        password: document.getElementById("login_password").value,
    };
    fetch("/api/user", {
        method: "PATCH",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify(data),
    })
        .then((res) => {
            return res.json();
        })
        .then((d) => {
            if (d["ok"]) {
                after_login()
                // login_btn.innerHTML = "登出";
                // login_board.classList.remove("open");
                // document.getElementById("message_for_error_login").innerHTML = ""
                // let rr = window.location.href.split("/");
                // // localStorage.setItem("login","ok")
                // window.location.reload()
                // if (rr[rr.length - 1] !== "") {
                //   window.location.href = "/";
                // }
                // document.cookie = "login=login;max-age=2592000;path=/"
            } else {
                document.getElementById("message_for_error_login").innerHTML = d["message"]
            }
        });
});

function after_login(){
    login_board.classList.remove("open");
    document.getElementById("message_for_error_login").innerHTML = ""
    let rr = window.location.href.split("/");
    // localStorage.setItem("login","ok")
    window.location.reload()
}

create_act_btn.addEventListener("click", (e) => {
    e.preventDefault();
    let data = {
        name: create_name.value,
        email: create_email.value,
        password: create_password.value,
    };
    fetch("/api/user", {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify(data),
    })
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            if (data["ok"]) {
                document.getElementById("message_for_error_create").innerHTML = "註冊成功!!!"
            } else {
                document.getElementById("message_for_error_create").innerHTML = data["message"];
            }
        });
});

create_btn_a.addEventListener("click", (e) => {
    e.preventDefault();
    login_process()
});

login_btn_a.addEventListener("click", (e) => {
    e.preventDefault();
    login_process()
});

function login_process() {
    login_board_b.classList.toggle("not_you");
    create_board_b.classList.toggle("not_you");
    document.getElementById("message_for_error_create").innerHTML = ""
}


function login_procedure() {
    login_board.classList.add("open");
}

function logout_procedure() {
    fetch("/api/user", {
        method: "DELETE",
    })
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            console.log(data);
            if (data["ok"]) {
                signOut()
                // login_btn.innerHTML = "登入/註冊";
                // localStorage.removeItem("login")
                let rr = window.location.href.split("/");
                // document.cookie = "login=; expires=Thu, 01 Jan 1970 00:00:01 GMT"
                window.location.reload()
                // if (rr[rr.length - 1] !== "") {
                //   window.location.href = "/";
                // }
            }
        });
}

login_btn.addEventListener("click", () => {
    login_procedure()
});

logout.addEventListener("click", function () {
    logout_procedure()
})

Array.from(close_btn).forEach((ele) => {
    ele.addEventListener("click", () => {
        login_board.classList.toggle("open");
        default_setting();
    });
});

function default_setting() {
    if (login_board_b.classList.contains("not_you")) {
        login_board_b.classList.remove("not_you");
    }
    if (!create_board_b.classList.contains("not_you")) {
        create_board_b.classList.add("not_you");
    }
}

document.addEventListener("click", (e) => {
    if (
        login_create !== e.target &&
        !login_create.contains(e.target) &&
        e.target !== login_btn
    ) {
        login_board.classList.remove("open");
        default_setting();
    }
});