// import { useLocation, useNavigate } from "react-router-dom";
// import { useState } from "react";

// export default function QrPaymentPage() {
//   const { state } = useLocation();
//   const navigate = useNavigate();
//   const [paid, setPaid] = useState(false);

//   const amount = state?.amount || 0;

//   return (
//     <div style={{ textAlign: "center", padding: "40px" }}>
//       <h2>Scan & Pay (GPay / UPI)</h2>

//       <h3>Amount: ₹{amount}</h3>

//       {/* YOUR QR IMAGE */}
//       <img
//         src="/qr.png"   // 👉 public folder ma mukvu
//         alt="QR Code"
//         style={{ width: "250px", margin: "20px 0" }}
//       />

//       <p>Scan this QR using GPay / PhonePe / Paytm</p>

//       {!paid ? (
//         <button onClick={() => setPaid(true)}>
//           I Have Paid
//         </button>
//       ) : (
//         <button
//           onClick={() => navigate("/success")}
//           style={{ background: "green", color: "white" }}
//         >
//           Confirm Order
//         </button>
//       )}
//     </div>
//   );
// }



import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function QrPaymentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const amount = state?.amount;
  const orderId = state?.orderId;

const confirmPayment = async () => {
  try {
    console.log("Clicked");  // debug

    await api.put(`/orders/${orderId}/pay`);

    alert("Payment confirmed successfully! ✅");

    navigate(`/orders/${orderId}`);
  } catch (err) {
    console.log(err);
    alert("Error while confirming payment ❌");
  }
};

  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <h2>Scan & Pay</h2>

      <h3>Amount: ₹{amount}</h3>

      <img
        src="/qr.png"
        alt="QR"
        style={{ width: "250px", margin: "20px" }}
      />

      <p>Scan this QR using GPay / PhonePe</p>

      <button onClick={confirmPayment}>
        I Have Paid
      </button>
    </div>
  );
}