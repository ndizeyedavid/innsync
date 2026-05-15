export interface paymentOptions {
  id: number;
  icon: string;
  title: string;
  description: string;
}

export const paymentOptions = [
  {
    id: 0,
    icon: "card",
    title: "Credit / debit card",
    description: "Visa, Mastercard, Amex",
  },
  {
    id: 1,
    icon: "phone-portrait-outline",
    title: "Pay with phone",
    description: "MTN MOMO, Airtel Money, MPesa",
  },
  {
    id: 2,
    icon: "logo-apple",
    title: "Apple Pay",
    description: "Pay using Apple Pay",
  },
  {
    id: 3,
    icon: "logo-paypal",
    title: "PayPal",
    description: "Pay using PayPal",
  },
];
