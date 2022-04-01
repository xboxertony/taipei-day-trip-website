//------------------------signup/login-------------------------
const authBtnLogin = document.querySelector(".auth-btn-login");
const authBtnLogout = document.querySelector(".auth-btn-logout");

const username = document.querySelector(".username");

const overlay = document.querySelector(".overlay");
const authContainer = document.querySelector(".auth-container");

const messageInner = document.querySelector(".message-inner");
const alertMessage = document.querySelector(".alert");

const loginInner = document.querySelector(".login-inner");
const returnBtn = document.querySelector(".return");
let isLogin = false;

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
    isLogin = true;
  } else {
    authBtnLogout.classList.add("none");
    authBtnLogin.classList.remove("none");
    isLogin = false;
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
  loginInner.classList.remove("none");
  signupInner.classList.add("none");
  messageInner.classList.add("none");
});

//-----------------------close and change--------------------------
const authClose = document.querySelectorAll(".auth-close");
authClose.forEach((v) => {
  v.addEventListener("click", (e) => {
    overlay.classList.add("none");
    authContainer.classList.add("none");
    alertMessage.innerHTML = "";

    // location.reload();
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

loginPassed.email = inputLoginEmail.value.length > 0;
loginPassed.password = inputLoginPassword.value.length > 0;

loginBtn.disabled = Object.values(loginPassed).includes(false);
loginBtn.style.cursor = loginBtn.disabled ? "not-allowed" : "pointer";

inputLoginEmail.addEventListener("input", (e) => {
  loginPassed.email = e.target.value.length > 0;
  if (!loginPassed.email) {
    loginEmailMessage.classList.remove("none");
    loginEmailMessage.textContent = "請輸入信箱";
  } else {
    loginEmailMessage.classList.add("none");
  }
  loginBtn.disabled = Object.values(loginPassed).includes(false);
  loginBtn.style.cursor = loginBtn.disabled ? "not-allowed" : "pointer";
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
  loginBtn.style.cursor = loginBtn.disabled ? "not-allowed" : "pointer";
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
      check();

      loginInner.classList.add("none");
      messageInner.classList.remove("none");
      alertMessage.innerHTML = "<h3>登入成功</h3>";
      authClose[0].classList.remove("none");
      signupInner.classList.add("none");
      returnBtn.classList.add("none");
    } else if (res.error) {
      loginInner.classList.add("none");
      messageInner.classList.remove("none");
      alertMessage.innerHTML = res.message;
      authClose[0].classList.add("none");
      signupInner.classList.add("none");
      returnBtn.classList.remove("none");

      function backToLogin() {
        console.log("123");
        signupInner.classList.add("none");
        messageInner.classList.add("none");
        loginInner.classList.remove("none");
      }
      returnBtn.addEventListener("click", backToLogin);
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
      returnBtn.classList.add("none");
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
const signupInner = document.querySelector(".signup-inner");

const signupBtn = document.querySelector(".signup-btn");

let signupPassed = {
  name: false,
  email: false,
  password: false,
};
signupPassed.name =
  inputSignupName.value.length < 8 && inputSignupName.value.length > 0;
signupPassed.email = inputSignupEmail.value.includes("@");
signupPassed.password =
  inputSignupPassword.value.length < 10 &&
  inputSignupPassword.value.length >= 5;

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
    e.target.value.length < 10 && e.target.value.length >= 5;
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
      signupInner.classList.add("none");
      messageInner.classList.remove("none");
      alertMessage.textContent = "註冊成功，請登入。";
      authClose[0].classList.add("none");
      loginInner.classList.add("none");
      function goToLogin() {
        console.log("123");
        signupInner.classList.add("none");
        messageInner.classList.add("none");
        loginInner.classList.remove("none");
      }
      returnBtn.addEventListener("click", goToLogin);
    } else if (res.error) {
      loginInner.classList.add("none");
      signupInner.classList.add("none");
      messageInner.classList.remove("none");
      alertMessage.innerHTML = res.message;
      authClose[0].classList.add("none");
      function backToSignup() {
        console.log("123");
        messageInner.classList.add("none");
        loginInner.classList.add("none");
        signupInner.classList.remove("none");
      }
      returnBtn.addEventListener("click", backToSignup);
    }
  }

  signup(e);
});

//-------------go booking--------------------------------
const bookingBtn = document.querySelector(".booking");
bookingBtn.addEventListener("click", () => {
  if (isLogin) {
    location.href = "/booking";
  } else {
    overlay.classList.remove("none");
    authContainer.classList.remove("none");
    loginInner.classList.remove("none");
    signupInner.classList.add("none");
    messageInner.classList.add("none");
  }
});
