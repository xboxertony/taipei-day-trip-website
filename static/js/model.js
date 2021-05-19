let booking_btn = document.getElementById("booking")
let login_btn = document.getElementById("login");
let login_board = document.getElementsByClassName("block_page")[0];
let close_btn = document.getElementsByClassName("close");
let login_section = document;
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

fetch("/api/user", {
    method: "GET",
})
    .then((res) => {
        return res.json();
    })
    .then((res) => {
        if (res["data"]) {
            login_btn.innerHTML = "登出";
            if (window.location.href.split("/").includes("order")) {
                document.getElementById("order_name").value = res.data.name
                document.getElementById("order_email").value = res.data.email
            }
        } else {
        }
    });

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
                login_btn.innerHTML = "登出";
                login_board.classList.remove("open");
                document.getElementById("message_for_error_login").innerHTML = ""
                let rr = window.location.href.split("/");
                window.location.reload()
                // if (rr[rr.length - 1] !== "") {
                //   window.location.href = "/";
                // }
            } else {
                document.getElementById("message_for_error_login").innerHTML = d["message"]
            }
        });
});

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

login_btn.addEventListener("click", () => {
    if (login_btn.innerHTML === "登出") {
        fetch("/api/user", {
            method: "DELETE",
        })
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                console.log(data);
                if (data["ok"]) {
                    login_btn.innerHTML = "登入/註冊";
                    let rr = window.location.href.split("/");
                    window.location.reload()
                    // if (rr[rr.length - 1] !== "") {
                    //   window.location.href = "/";
                    // }
                }
            });
    } else {
        login_board.classList.add("open");
    }
});

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