//------------------------signup/login-------------------------
const authBtnLogin = document.querySelector(".auth-btn-login");
const authBtnLogout = document.querySelector(".auth-btn-logout");

const username = document.querySelector(".username");

const overlay = document.querySelector(".overlay");
const authContainer = document.querySelector(".auth-container");

//--------------------------check status------------------------------
async function check() {
  const response = await fetch("http://13.208.55.153:3000/api/user", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const res = await response.json();
  if (res.data) {
    authBtnLogin.classList.add("none");
    authBtnLogout.classList.remove("none");
  } else {
    authBtnLogout.classList.add("none");
    authBtnLogin.classList.remove("none");
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", check());
} else {
  check();
}

//----------------------------open ---------------------------
authBtnLogin.addEventListener("click", (e) => {
  overlay.classList.remove("none");
  authContainer.classList.remove("none");
});

//-----------------------close and change--------------------------
const authClose = document.querySelectorAll(".auth-close");
authClose.forEach((v) => {
  v.addEventListener("click", (e) => {
    overlay.classList.add("none");
    authContainer.classList.add("none");
  });
});

const authChange = document.querySelectorAll(".auth-change");
authChange.forEach((v) => {
  v.addEventListener("click", (e) => {
    let thisInner = e.target.parentElement;
    let otherInner = thisInner.nextElementSibling
      ? thisInner.nextElementSibling
      : thisInner.previousElementSibling;

    otherInner.classList.toggle("none");
    thisInner.classList.toggle("none");
  });
});

//-----------------------login-----------------------------
const loginMessage = document.querySelector(".login-message");
const loginBtn = document.querySelector(".login-btn");
loginBtn.addEventListener("click", (e) => {
  let inputEmail = e.target.parentElement.children[3].value;
  let inputPassword = e.target.parentElement.children[4].value;

  if (inputEmail.length === 0) {
    e.target.parentElement.children[3].style =
      "background-color : rgba(255, 0, 0, 0.6)";
    loginMessage.classList.remove("none");
    loginMessage.textContent = "請輸入信箱";

    if (inputPassword.length === 0) {
      e.target.parentElement.children[4].style =
        "background-color : rgba(255, 0, 0, 0.6)";
      loginMessage.classList.remove("none");
      loginMessage.textContent = "請輸入信箱,密碼";
      return;
    } else {
      e.target.parentElement.children[4].style = "background-color : white";
      loginMessage.classList.remove("none");
    }

    return;
  } else {
    e.target.parentElement.children[3].style = "background-color : white";
    loginMessage.classList.remove("none");
  }

  if (inputPassword.length === 0) {
    e.target.parentElement.children[4].style =
      "background-color : rgba(255, 0, 0, 0.6)";
    loginMessage.classList.remove("none");
    loginMessage.textContent = "請輸入密碼";
    return;
  } else {
    e.target.parentElement.children[4].style = "background-color : white";
    loginMessage.classList.remove("none");
  }

  async function login() {
    const response = await fetch("http://13.208.55.153:3000/api/user", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: inputEmail,
        password: inputPassword,
      }),
    });
    const res = await response.json();
    if (res.ok) {
      overlay.classList.add("none");
      authContainer.classList.add("none");
      authBtnLogin.classList.toggle("none");
      authBtnLogout.classList.toggle("none");
      check();
      window.alert("登入成功");
      window.location.reload();
    } else if (res.error) {
      window.alert(res.message);
    }
  }
  login();
});

//----------------------------------logout-----------------------------------
authBtnLogout.addEventListener("click", (e) => {
  async function logout() {
    const response = await fetch("http://13.208.55.153:3000/api/user", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const res = await response.json();
    if (res.ok) {
      check();
      window.alert("登出成功");
      window.location.reload();
    } else if (res.error) {
      window.alert(res.message);
    }
  }
  logout();
});

//-----------------------------------signup----------------------------------
const signupMessage = document.querySelector(".signup-message");

const signupBtn = document.querySelector(".signup-btn");
signupBtn.addEventListener("click", (e) => {
  let inputName = e.target.parentElement.children[3].value;
  let inputEmail = e.target.parentElement.children[4].value;
  let inputPassword = e.target.parentElement.children[5].value;

  if (inputName.length === 0) {
    e.target.parentElement.children[3].style =
      "background-color : rgba(255, 0, 0, 0.6)";
    signupMessage.classList.remove("none");
    signupMessage.textContent = "請輸入姓名";

    return;
  } else {
    e.target.parentElement.children[3].style = "background-color : white";
    signupMessage.classList.remove("none");
  }

  if (inputName.length > 8) {
    e.target.parentElement.children[3].style =
      "background-color : rgba(255, 0, 0, 0.6)";
    signupMessage.classList.remove("none");
    signupMessage.textContent = "姓名過長，須少於9字符";
    return;
  } else {
    e.target.parentElement.children[3].style = "background-color : white";
    signupMessage.classList.remove("none");
  }

  if (inputEmail.length === 0) {
    e.target.parentElement.children[4].style =
      "background-color : rgba(255, 0, 0, 0.6)";
    signupMessage.classList.remove("none");
    signupMessage.textContent = "請輸入信箱";
    return;
  } else {
    e.target.parentElement.children[4].style = "background-color : white";
    signupMessage.classList.remove("none");
  }

  if (inputPassword.length === 0) {
    e.target.parentElement.children[5].style =
      "background-color : rgba(255, 0, 0, 0.6)";
    signupMessage.classList.remove("none");
    signupMessage.textContent = "請輸入密碼";
    return;
  } else {
    e.target.parentElement.children[3].style = "background-color : white";
    signupMessage.classList.remove("none");
  }

  if (inputPassword.length < 4 || inputPassword.length > 8) {
    e.target.parentElement.children[5].style =
      "background-color : rgba(255, 0, 0, 0.6)";
    signupMessage.classList.remove("none");
    signupMessage.textContent = "密碼字符須5-9字符";
    return;
  } else {
    e.target.parentElement.children[3].style = "background-color : white";
    signupMessage.classList.remove("none");
  }

  async function signup(ele) {
    const response = await fetch("http://13.208.55.153:3000/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: inputName,
        email: inputEmail,
        password: inputPassword,
      }),
    });
    const res = await response.json();
    if (res.ok) {
      ele.target.parentElement.classList.add("none");
      ele.target.parentElement.previousElementSibling.classList.remove("none");
      window.alert("註冊成功，請登入");
    } else if (res.error) {
      window.alert(res.message);
    }
  }

  signup(e);
});
