let url = `${windowUrl.protocol}//${windowUrl.host}/api/user`;

const isLogin = (data) => {
  if (data != null) {
    document.getElementById("loginOrSignup").textContent = "登出系統";
  }
};

const init = async () => {
  fetch(url)
    .then((res) => res.json)
    .then();
};
