// Your existing content...
interface CartItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface CartState {
  items: { items: CartItem[] };
  total: number;
}

interface Customer {
  billingAddress: {
    vatNumber?: string;
    country: string;
  };
}

interface Snipcart {
  api: {
    cart: {
      setShippingMethods: (
        methods: Array<{
          id: string;
          name: string;
          cost: number;
          minOrderAmount: number;
          countries: string[];
        }>,
      ) => void;
      setTaxes: (
        taxes: Array<{
          name: string;
          rate: number;
          appliesTo: { country: string };
        }>,
      ) => void;
      getCustomFieldValue: (name: string) => string | undefined;
      getBillingAddress: () => { country: string };
    };
  };
  events: {
    on: (event: string, callback: (...args: unknown[]) => unknown) => void;
  };
  store: {
    getState: () => CartState;
  };
}

declare global {
  interface Window {
    Snipcart?: Snipcart;
    SnipcartSettings?: {
      publicApiKey: string;
      loadStrategy?: string;
      modalStyle?: string;
      templatesUrl?: string;
      [key: string]: any;
    };
  }
}

export {}; // Important: keeps this as a module declaration
