TPDirect.setupSDK(
  124015,
  "app_JlS8e2AO4Yza0XLE6d27gU073ScIr8MrFkJUDh5BpLMOIEaoOWb9htvaYUfB",
  "sandbox"
);

// Display ccv field
let fields = {
  number: {
    element: ".form-control.card-number",
    placeholder: "**** **** **** ****",
  },
  expirationDate: {
    element: document.getElementById("tappay-expiration-date"),
    placeholder: "MM / YY",
  },
  ccv: {
    element: ".form-control.cvc",
    placeholder: "後三碼",
  },
};
TPDirect.card.setup({
  fields: fields,
  styles: {
    // style valid state
    ".valid": {
      color: "green",
    },
    // style invalid state
    ".invalid": {
      color: "red",
    },
  },
});

const sendPayData = async (prime) => {
  const formData = new FormData(document.getElementById("paymentForm"));
  let contact = Object.fromEntries(formData.entries());
  let trip = await isReservation();
  let requestBody = {
    prime: prime,
    order: {
      price: trip.data.price,
      trip: {
        attraction: trip.data.attraction,
        date: trip.data.date,
        time: trip.data.time,
      },
      contact: {
        name: contact.contactPerson,
        email: contact.contactEmail,
        phone: contact.contactNumber,
      },
    },
  };
  let data = await fetch("api/orders", {
    method: "post",
    body: JSON.stringify(requestBody),
    headers: { "Content-Type": "application/json" },
  }).then((res) => res.json());
  return data;
};

const redirectThankyou = (response) => {
  window.location.href = `/thankyou?number=${response}`;
};

const bookingAndPay = async (event) => {
  event.preventDefault();
  const tappayStatus = TPDirect.card.getTappayFieldsStatus();
  //   console.log(tappayStatus);

  // Check TPDirect.card.getTappayFieldsStatus().canGetPrime before TPDirect.card.getPrime
  if (tappayStatus.canGetPrime === false) {
    alert("can not get prime");
    return;
  }

  // Get prime
  TPDirect.card.getPrime(async function (result) {
    try {
      let response = await sendPayData(result.card.prime);
      redirectThankyou(response);
    } catch (error) {
      console.log(error);
    }
    // if (data.status !== 0) {
    //   alert("get prime error " + result.msg);
    //   return;
    // }
  });

  //   console.log(p);
};
const payForm = document.getElementById("paymentForm");
payForm.addEventListener("submit", bookingAndPay);
