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

let pro = document.getElementById("profile")
let FB_BTN = document.getElementById("FB_BTN")

let up_page = document.getElementById("up_page")

// 前端驗證

let regex = /.+@.+/g
let error_name = document.getElementById("error_name")
let error_email = document.getElementById("error_email")
let error_password = document.getElementById("error_password")
let error_input = document.getElementsByClassName("error")

function add_event(item, act, f) {
    item.addEventListener(act, f)
}

function email_check() {
    let em = this.value
    let ma = em.match(regex)
    if (!(ma && em === ma[0])) {
        error_email.classList.add("open")
        error_email.innerHTML = "請輸入正確的email格式，例：xxx@xxx.com"
    } else {
        error_email.classList.remove("open")
    }
    check_all_input()
}
function password_check() {
    let em = this.value
    if (!em) {
        error_password.classList.add("open")
        error_password.innerHTML = "密碼不可為空"
    } else {
        error_password.classList.remove("open")
    }
    check_all_input()
}
function name_check() {
    let em = this.value
    if (!em) {
        error_name.classList.add("open")
        error_name.innerHTML = "姓名不可為空"
    } else {
        error_name.classList.remove("open")
    }
    check_all_input()
}

add_event(create_email, "blur", email_check)
add_event(create_password, "blur", password_check)
add_event(create_name, "blur", name_check)

function check_all_input() {
    let a = Array.from(error_input).every((item) => {
        if (!item.classList.contains("open")) {
            return true
        }
        return false
    })
    if (a) {
        create_act_btn.disabled = false
    } else {
        create_act_btn.disabled = true
    }
}





// FB登入

function statusChangeCallback(response) {
    // Called with the results from FB.getLoginStatus().
    // console.log("statusChangeCallback");
    // console.log(response); // The current login status of the person.
    if (response.status === "connected") {
        // Logged into your webpage and Facebook.
    } else {
        testAPI();
        // Not logged into your webpage or we are unable to tell.
        // document.getElementById("status").innerHTML =
        //     "Please log " + "into this webpage.";
    }
}

FB_BTN.addEventListener("click", function (e) {
    e.preventDefault()
    checkLoginState()
})



function checkLoginState() {
    // Called when a person is finished with the Login Button.
    FB.getLoginStatus(function (response) {
        // See the onlogin handler
        statusChangeCallback(response);
    });
}

window.fbAsyncInit = function () {
    FB.init({
        appId: "234985047958856",
        cookie: true, // Enable cookies to allow the server to access the session.
        xfbml: true, // Parse social plugins on this webpage.
        version: "v10.0", // Use this Graph API version for this call.
    });
    FB.getLoginStatus(function (response) {
        // console.log(response);
    });
    // FB_logout()
};

// window.fbAsyncInit = function () {
//     FB.init({
//         // appId: "361104395011889",
//         appId:"234985047958856",
//         cookie: true, // Enable cookies to allow the server to access the session.
//         xfbml: true, // Parse social plugins on this webpage.
//         version: "v10.0", // Use this Graph API version for this call.
//     });

//     FB.getLoginStatus(function (response) {
//         // Called after the JS SDK has been initialized.
//         statusChangeCallback(response); // Returns the login status.
//     });
// };

function testAPI() {
    // Testing Graph API after login.  See statusChangeCallback() for when this call is made.
    // console.log("Welcome!  Fetching your information.... ");
    FB.login(
        function (response) {
            // console.log(response);
            FB.api("/me", "GET", { fields: "name,id,email,picture" },
                function (user) {
                    //user物件的欄位：https://developers.facebook.com/docs/graph-api/reference/user
                    if (user.error) {
                    } else {
                        pro.src = user.picture.data.url
                        window.localStorage["url"] = user.picture.data.url
                        fetch("/api/FB/user", {
                            headers: { "Content-Type": "application/json" },
                            method: "PATCH",
                            body: JSON.stringify({
                                "name": user.name,
                                "FB_ID": user.id,
                                "email": user.email,
                                "url": user.picture.data.url
                            })
                        }).then((res) => {
                            return res.json()
                        }).then((data) => {
                            if (data["ok"]) {
                                login_board.classList.remove("open");
                                document.getElementById("message_for_error_login").innerHTML = ""
                                get_user()
                                // after_login()
                            }
                        })
                    }
                }
            );
        },
        { scope: "public_profile,email" }
    );
    // FB.api("/me",function (response) {
    //     console.log(response)
    //         // Logged into your webpage and Facebook.
    //         fetch("/api/FB/user", {
    //             headers: { "Content-Type": "application/json" },
    //             method: "PATCH",
    //             body: JSON.stringify({
    //                 "name": response.name,
    //                 "FB_ID": response.id
    //             })
    //         }).then((res) => {
    //             return res.json()
    //         }).then((data) => {
    //             if (data["ok"]) {
    //                 login_board.classList.remove("open");
    //                 document.getElementById("message_for_error_login").innerHTML = ""
    //                 get_user()
    //                 // after_login()
    //             }
    //         })
    //     // console.log("Successful login for: " + response.name);
    //     // document.getElementById("status").innerHTML =
    //     //     "Thanks for logging in, " + response.name + "!";
    // });
}

function FB_logout() {
    FB.logout(function (response) {
        // Person is now logged out
        // console.log("logout!!!!");
        window.localStorage.removeItem("url");
    });
}

// google登入

// function onFailure(error) {
//     console.log(error);
// }

// function renderButton() {
//     gapi.signin2.render('my-signin2', {
//         'scope': 'profile email',
//         'width': 240,
//         'height': 50,
//         'longtitle': true,
//         'theme': 'dark',
//         'onsuccess': google_onSignIn,
//         'onfailure': onFailure
//     });
// }

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

var googleUser = {};
var startApp = function () {
    gapi.load("auth2", function () {
        // Retrieve the singleton for the GoogleAuth library and set up the client.
        auth2 = gapi.auth2.init({
            client_id:
                "731192245120-c6pofopqhql356ft91tfleobqnkrg5pa.apps.googleusercontent.com",
            cookiepolicy: "single_host_origin",
            'scope': 'profile email'
            // Request scopes in addition to 'profile' and 'email'
            //scope: 'additional_scope'
        });
        attachSignin(document.getElementById("customBtn"));
    });
};

document.getElementById("customBtn").addEventListener("click",function(e){
    e.preventDefault()
})

function attachSignin(element) {
    auth2.attachClickHandler(
        element,
        {},
        function (googleUser) {
            var profile = googleUser.getBasicProfile();
            // document.getElementById("name").innerText =
            //     "Signed in: " + googleUser.getBasicProfile().getName();
            window.localStorage["url"] = profile.getImageUrl();
            fetch("/api/google/user", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "name": profile.getName(),
                    "email": profile.getEmail()
                })
            }).then((res) => {
                return res.json()
            }).then((data) => {
                if (data["ok"]) {
                    login_board.classList.remove("open");
                    document.getElementById("message_for_error_login").innerHTML = ""
                    get_user()
                    // after_login()
                }
            })
        },
        function (error) {
            alert(JSON.stringify(error, undefined, 2));
        }
    );
}
startApp();

// function google_onSignIn(googleUser) {
//     var profile = googleUser.getBasicProfile();
//     // console.log("ID: " + profile.getId()); // Do not send to your backend! Use an ID token instead.
//     console.log("Name: " + profile.getName());
//     // console.log("Image URL: " + profile.getImageUrl());
//     console.log("Email: " + profile.getEmail()); // This is null if the 'email' scope is not present.
//     // after_login()
// }
function signOut() {
    window.localStorage.removeItem("url");
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        // console.log("User signed out.");
    });
}

// signOut()

let order_problem = null;

async function get_collection(){
    if(window.location.href!==window.location.origin+"/")return
    let res = await fetch("/api/collect_user")
    let data = await res.json()
    if(data["data"]){
        let arr = data["data"]
        let collect_icon = document.getElementsByClassName("icon_fav")
        Array.from(collect_icon).forEach((item)=>{
            if(arr.includes(parseInt(item.dataset.attrid))){
                item.classList.remove("close")
            }
        })
        let close_icon = document.getElementsByClassName("icon_close")
        Array.from(close_icon).forEach((item)=>{
            if(arr.includes(parseInt(item.dataset.attrid))){
                item.classList.add("close")
            }
        })
    }
}

let btn_more_his = document.getElementById("btn_more_msg")

function get_msg(page) {
    let url = location.href;
    let l = url.split("/");
    let idx = l[l.length - 1];
    fetch(`/api/message?attid=${idx}&page=${page}`).then((res) => {
        return res.json()
    }).then((data) => {
        // console.log(data)
        if(page===0)msg_history.innerHTML=""
        Array.from(data.data).forEach((item) => {
            create_msg(item)
        })
        if (!data["nextpage"]) {
            btn_more_his.classList.add("close")
        }
    })
}


function get_user() {
    fetch("/api/user", {
        method: "GET",
    })
        .then((res) => {
            return res.json();
        })
        .then((res) => {
            document.getElementById("booking").style.display = "inline";
            if (res["data"]) {
                pro.src = window.localStorage["url"]
                if (!window.localStorage["url"]) {
                    pro.src = "../static/unknow.png"
                }
                document.getElementById("logout").style.display = "inline";
                document.getElementById("login").style.display = "none";
                get_collection()
                if(window.location.href.includes("attraction")){
                    get_msg(0)
                }
                order_problem = () => {
                    let name = res.data.name
                    let email = res.data.email
                    return {
                        "name": name,
                        "email": email
                    }
                }
            } else {
                // console.log("ok")
                document.getElementById("login").style.display = "inline";
                document.getElementById("logout").style.display = "none";
            }
        });
}

get_user()

// pro.onerror = function (obj){
//     console.log(obj.target)
//     obj.target.style.display = "none";
// }



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

function after_login() {
    login_board.classList.remove("open");
    document.getElementById("message_for_error_login").innerHTML = ""
    let rr = window.location.href.split("/");
    if(window.location.href.includes("reset_password")){
        window.location.href="/"
        return
    }
    // localStorage.setItem("login","ok")
    window.location.reload()
}

create_act_btn.addEventListener("click", (e) => {
    e.preventDefault();
    check_all_input()
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
            if (data["ok"]) {
                signOut()
                FB_logout()
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



up_page.addEventListener("click", function () {
    document.body.scrollTop = 0;
})