export type ExchangeDestination = {
  id: string;
  name: string;
  desc: string;
  icon: string;
  available: boolean;
  processingTime: string;
};

export const DESTINATIONS: ExchangeDestination[] = [
  {
    id: "yape",
    name: "Yape",
    desc: "Transferencia directa a tu billetera Yape",
    icon: "/icons/yape.png",
    available: true,
    processingTime: "1-2 días hábiles",
  },
  {
    id: "paypal",
    name: "PayPal",
    desc: "Próximamente",
    icon: "/icons/paypal.jpg",
    available: false,
    processingTime: "",
  },
];

export function getDestination(id: string) {
  return DESTINATIONS.find((d) => d.id === id);
}
