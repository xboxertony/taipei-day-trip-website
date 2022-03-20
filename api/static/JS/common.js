//------------------------signup/login-------------------------
const authBtnLogin = document.querySelector(".auth-btn-login");
const authBtnLogout = document.querySelector(".auth-btn-logout");

const username = document.querySelector(".username");

const overlay = document.querySelector(".overlay");
const authContainer = document.querySelector(".auth-container");

const messageInner = document.querySelector(".message-inner");
const alertMessage = document.querySelector(".alert");

const loginInner = document.querySelector(".login-inner");

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
    location.reload();
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
const loginEmailMessage = document.querySelector(".login-email-message");
const loginPasswordMessage = document.querySelector(".login-password-message");

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
    loginEmailMessage.classList.remove("none");
    loginEmailMessage.textContent = "請輸入信箱";
  } else {
    loginEmailMessage.classList.add("none");
  }
  loginBtn.disabled = Object.values(loginPassed).includes(false);
});

inputLoginPassword.addEventListener("input", (e) => {
  loginPassed.password = e.target.value.length > 0;
  if (!loginPassed.password) {
    loginPasswordMessage.classList.remove("none");
    loginPasswordMessage.textContent = "請輸入密碼";
  } else {
    loginPasswordMessage.classList.add("none");
  }
  loginBtn.disabled = Object.values(loginPassed).includes(false);
});

loginBtn.addEventListener("click", (e) => {
  let inputEmail = e.target.parentElement.children[2].value;
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
      loginInner.classList.add("none");

      check();
      overlay.classList.remove("none");
      authContainer.classList.remove("none");
      messageInner.classList.remove("none");
      alertMessage.innerHTML = "<h3>登入成功</h3>";
    } else if (res.error) {
      loginInner.classList.add("none");

      overlay.classList.remove("none");
      authContainer.classList.remove("none");
      messageInner.classList.remove("none");
      alertMessage.textContent = "<h3>登入失敗</h3>";
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
      loginInner.classList.add("none");
      overlay.classList.remove("none");
      authContainer.classList.remove("none");
      messageInner.classList.remove("none");
      alertMessage.innerHTML = "<h3>登出成功</h3>";
    } else if (res.error) {
      loginInner.classList.add("none");
      overlay.classList.remove("none");
      authContainer.classList.remove("none");
      messageInner.classList.remove("none");
      alertMessage.textContent = res.error;
    }
  }
  logout();
});

//-----------------------------------signup----------------------------------
const signupNameMessage = document.querySelector(".signup-name-message");
const signupEmailMessage = document.querySelector(".signup-email-message");
const signupPasswordMessage = document.querySelector(
  ".signup-password-message"
);

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
signupBtn.style.cursor = signupBtn.disabled ? "not-allowed" : "pointer";

inputSignupName.addEventListener("input", (e) => {
  signupPassed.name = e.target.value.length < 8 && e.target.value.length > 0;
  if (!signupPassed.name) {
    signupNameMessage.classList.remove("none");
    signupNameMessage.textContent = "姓名長度須介於1到7字元";
  } else {
    signupNameMessage.classList.add("none");
  }
  signupBtn.disabled = Object.values(signupPassed).includes(false);
  signupBtn.style.cursor = signupBtn.disabled ? "not-allowed" : "pointer";
});

inputSignupEmail.addEventListener("input", (e) => {
  signupPassed.email = e.target.value.includes("@");
  if (!signupPassed.email) {
    signupEmailMessage.classList.remove("none");
    signupEmailMessage.textContent = "信箱格式錯誤";
  } else {
    signupEmailMessage.classList.add("none");
  }
  signupBtn.disabled = Object.values(signupPassed).includes(false);
  signupBtn.style.cursor = signupBtn.disabled ? "not-allowed" : "pointer";
});

inputSignupPassword.addEventListener("input", (e) => {
  signupPassed.password =
    e.target.value.length < 10 && e.target.value.length > 5;
  if (!signupPassed.password) {
    signupPasswordMessage.classList.remove("none");
    signupPasswordMessage.textContent = "密碼長度須介於5到10字元";
  } else {
    signupPasswordMessage.classList.add("none");
  }
  signupBtn.disabled = Object.values(signupPassed).includes(false);
  signupBtn.style.cursor = signupBtn.disabled ? "not-allowed" : "pointer";
});

signupBtn.addEventListener("click", (e) => {
  let inputName = e.target.parentElement.children[2];
  let inputEmail = e.target.parentElement.children[4];
  let inputPassword = e.target.parentElement.children[6];

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
