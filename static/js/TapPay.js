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
    placeholder: "CVV",
  },
};
TPDirect.card.setup({
  fields: fields,
  styles: {
    ":focus": {
      color: "#666666",
    },

    ".valid": {
      color: "#448899",
    },
    ".invalid": {
      color: "red",
    },
  },
});

const getBodyDataForPayment = (prime, contact, trip) => {
  let data = {
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
  return data;
};

const sendPaymentData = async (prime) => {
  const formData = new FormData(document.getElementById("paymentForm"));
  let contact = Object.fromEntries(formData.entries());
  let trip = await isReservation();
  let requestBody = getBodyDataForPayment(prime, contact, trip);
  let orderResponse = await fetch("api/orders", {
    method: "post",
    body: JSON.stringify(requestBody),
    headers: { "Content-Type": "application/json" },
  }).then((res) => res.json());
  return orderResponse;
};

const deleteBooking = async () => {
  await fetch("/api/booking", { method: "DELETE" });
};
const redirectThankyou = (response) => {
  window.location.href = `/thankyou?number=${response}`;
};

const bookingAndPay = async (event) => {
  event.preventDefault();
  const tappayStatus = TPDirect.card.getTappayFieldsStatus();

  TPDirect.card.getPrime(async function (result) {
    try {
      let response = await sendPaymentData(result.card.prime);
      redirectThankyou(response);
      deleteBooking();
    } catch (error) {
      console.log(error);
    }
  });
};
const payForm = document.getElementById("paymentForm");
payForm.addEventListener("submit", bookingAndPay);
