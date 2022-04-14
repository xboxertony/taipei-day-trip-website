const toMemberPage = () => {
  location.href = "/member";
};

const popupModal = () => {
  document.getElementById("modal").style.display = "block";
};

const closeModal = () => {
  document.getElementById("modal").style.display = "none";
};

const showSignupResult = (data) => {
  const PTags = document.getElementsByClassName("showResult");
  if (data.ok) {
    Array.prototype.forEach.call(PTags, (p) => {
      p.style.display = "block";
      p.textContent = "註冊成功";
    });
  } else {
    showResult(data, PTags);
  }
};

const showResult = (data, PTags) => {
  Array.prototype.forEach.call(PTags, (p) => {
    p.style.display = "block";
    p.textContent = data.message;
  });
};

const reloadPage = () => {
  window.location.reload();
};

const showLoginResult = (data) => {
  const PTags = document.getElementsByClassName("showResult");
  if (data.ok) {
    reloadPage();
  } else {
    showResult(data, PTags);
  }
};

const toggleAuthTable = () => {
  if (document.getElementById("loginBody").style.display == "block") {
    document.getElementById("signupBody").style.display = "block";
    document.getElementById("loginBody").style.display = "none";
  } else {
    document.getElementById("loginBody").style.display = "block";
    document.getElementById("signupBody").style.display = "none";
  }
};

const login = async (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  await fetch(event.currentTarget.action, {
    body: JSON.stringify(Object.fromEntries(formData.entries())),
    headers: { "Content-Type": "application/json" },
    method: "PATCH",
  })
    .then((res) => res.json())
    .then(showLoginResult)
    .catch(console.log);
};
const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", login);

const signUp = async (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  await fetch(event.currentTarget.action, {
    body: JSON.stringify(Object.fromEntries(formData.entries())),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  })
    .then((res) => res.json())
    .then(showSignupResult)
    .catch(console.log);
};
const signUpForm = document.getElementById("signupForm");
signUpForm.addEventListener("submit", signUp);

const logout = () => {
  fetch("/api/user", { method: "DELETE" }).then(reloadPage);
};

const isLogin = async () => {
  let data = await fetch("/api/user").then((res) => res.json());
  if (data == null) {
    return false;
  } else {
    return data;
  }
};

const showLoginOrSignup = (data) => {
  const loginOrSignup = document.getElementById("loginOrSignup");
  if (data == null) {
    loginOrSignup.textContent = "登入/註冊";
    loginOrSignup.addEventListener("click", popupModal);
    loginOrSignup.removeEventListener("click", logout);
  } else {
    document.getElementById("loginOrSignup").textContent = "登出系統";
    loginOrSignup.addEventListener("click", logout);
    loginOrSignup.removeEventListener("click", popupModal);
  }
};
const loginOrBooking = async () => {
  const bookinBtn = document.getElementById("bookingTour");
  if (!(await isLogin())) {
    popupModal();
  } else {
    location.href = "/booking";
  }
};

// init
fetch("/api/user")
  .then((res) => res.json())
  .then(showLoginOrSignup);
