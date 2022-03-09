//------------------------signup/login-------------------------
const authBtnLogin = document.querySelector(".auth-btn-login");
const authBtnLogout = document.querySelector(".auth-btn-logout");

const username = document.querySelector(".username");

const overlay = document.querySelector(".overlay");
const authContainer = document.querySelector(".auth-container");

//--------------------------check status------------------------------
async function check() {
  const response = await fetch("/api/user", {
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
  document.addEventListener("DOMContentLoaded", check);
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

const inputLoginEmail = document.querySelector(".input-login-email");
const inputLoginPassword = document.querySelector(".input-login-password");

const loginBtn = document.querySelector(".login-btn");

let loginPassed = {
  email: false,
  password: false,
};

loginBtn.disabled = Object.values(loginPassed).includes(false);

inputLoginEmail.addEventListener("input", (e) => {
  loginPassed.email = e.target.value.length > 0;
  if (!loginPassed.email) {
    loginMessage.classList.remove("none");
    loginMessage.textContent = "請輸入信箱";
  } else {
    loginMessage.classList.add("none");
  }
  loginBtn.disabled = Object.values(loginPassed).includes(false);
});

inputLoginPassword.addEventListener("input", (e) => {
  loginPassed.password = e.target.value.length > 0;
  if (!loginPassed.password) {
    loginMessage.classList.remove("none");
    loginMessage.textContent = "請輸入密碼";
  } else {
    loginMessage.classList.add("none");
  }
  loginBtn.disabled = Object.values(loginPassed).includes(false);
});

loginBtn.addEventListener("click", (e) => {
  let inputEmail = e.target.parentElement.children[3].value;
  let inputPassword = e.target.parentElement.children[4].value;

  async function login() {
    const response = await fetch("/api/user", {
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
    const response = await fetch("/api/user", {
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

const inputSignupName = document.querySelector(".input-signup-name");
const inputSignupEmail = document.querySelector(".input-signup-email");
const inputSignupPassword = document.querySelector(".input-signup-password");

const signupBtn = document.querySelector(".signup-btn");

let signupPassed = {
  name: false,
  email: false,
  password: false,
};

signupBtn.disabled = Object.values(signupPassed).includes(false);

inputSignupName.addEventListener("input", (e) => {
  signupPassed.name = e.target.value.length < 8 && e.target.value.length > 0;
  if (!signupPassed.name) {
    signupMessage.classList.remove("none");
    signupMessage.textContent = "姓名長度須介於1到7字元";
  } else {
    signupMessage.classList.add("none");
  }
  signupBtn.disabled = Object.values(signupPassed).includes(false);
});

inputSignupEmail.addEventListener("input", (e) => {
  signupPassed.email = e.target.value.includes("@");
  if (!signupPassed.email) {
    signupMessage.classList.remove("none");
    signupMessage.textContent = "信箱格式錯誤";
  } else {
    signupMessage.classList.add("none");
  }
  signupBtn.disabled = Object.values(signupPassed).includes(false);
});

inputSignupPassword.addEventListener("input", (e) => {
  signupPassed.password =
    e.target.value.length < 10 && e.target.value.length > 5;
  if (!signupPassed.password) {
    signupMessage.classList.remove("none");
    signupMessage.textContent = "密碼長度須介於5到10字元";
  } else {
    signupMessage.classList.add("none");
  }
  signupBtn.disabled = Object.values(signupPassed).includes(false);
});

signupBtn.addEventListener("click", (e) => {
  let inputName = e.target.parentElement.children[3];
  let inputEmail = e.target.parentElement.children[4];
  let inputPassword = e.target.parentElement.children[5];

  async function signup(ele) {
    const response = await fetch("/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: inputName.value,
        email: inputEmail.value,
        password: inputPassword.value,
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
