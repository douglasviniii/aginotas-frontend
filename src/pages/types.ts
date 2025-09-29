// types.ts
import { Timestamp } from "firebase/firestore";

export interface Document {
  type: "CNPJ" | "CPF";
  number: string;
}

export interface Address {
  street: string;
  neighborhood: string;
  number: string;
  city: string;
  state: string;
  zipCode: string;
  municipalCode: string;
}

export interface Contact {
  areaCode: string;
  numberPhone: string;
}

export type CustomerType = {
  id: string;
  corporateName: string;
  email: string;
  document: {
    type: "CNPJ" | "CPF";
    number: string;
  };
  municipalRegistration: string;
  stateRegistration: string;
  address: {
    street: string;
    neighborhood: string;
    number: string;
    city: string;
    state: string;
    zipCode: string;
    municipalCode: string;
  };
  contact: {
    areaCode: string;
    numberPhone: string;
  };
};

export type User = {
  id: string;
  name: string;
  corporateName?: string;
  email: string;
  role: string;
  contact: {
    areaCode: string;
    numberPhone: string;
  };
  password: string;
  address: {
    street: string;
    neighborhood: string;
    number: string;
    city: string;
    state: string;
    zipCode: string;
  };

  enterprise: {
    logoEnterprise: any;
    document: {
      type: string;
      number: string;
    };
    municipalRegistration: string;
    stateRegistration: string;
    homologation: boolean;
    passwordWebserviceInvoice: string;
    numberNfseIndentification: number;
    lotNumber: number;
    rpsIdentification: number;
    specialTaxRegime: number;
    aliquot: number;
    taxIncentive: number;
    annexToTheSimpleNationalSystem: number;
    accumulatedGrossRevenueRtb12: string;
    economicActivity: [
      {
        code: string;
        description: string;
      }
    ];
    Iss: {
      Aliquot: number;
      value: number;
      retained: boolean;
    };
    Cofins: {
      Aliquot: number;
      value: number;
      retained: boolean;
    };
    IR: {
      Aliquot: number;
      value: number;
      retained: boolean;
    };
    PIS: {
      Aliquot: number;
      value: number;
      retained: boolean;
    };
    INSS: {
      Aliquot: number;
      value: number;
      retained: boolean;
    };
    CSLL: {
      Aliquot: number;
      value: number;
      retained: boolean;
    };
    CPP: {
      Aliquot: number;
      value: number;
      retained: boolean;
    };
    OtherWithholdings: {
      Aliquot: number;
      value: number;
      retained: boolean;
    };
  };
  subscription: {
    stripeCustomerId: string;
    subscriptionId: string;
    subscriptionItemId: string;
    notesCountCurrentMonth: number;
    status: string;
  };
};

export interface SubscriptionResponse {
  id: string;
  status: string;
  billing_cycle_anchor: number;
  items: {
    data: {
      price: {
        unit_amount: number | null;
        recurring: {
          interval: string;
          interval_count: number;
        };
        product: {
          name: string;
          description: string | null;
        };
      };
    }[];
  };
}

export interface StripeInvoice {
  id: string;
  object: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  status: string;
  created: number;
  due_date: number | null;
  next_payment_attempt: number | null;
  period_start: number;
  period_end: number;
  lines: {
    data: Array<{
      description: string;
      amount: number;
      quantity: number;
    }>;
  };
  hosted_invoice_url?: string;
  invoice_pdf?: string;
  number?: string;
  status_transitions?: {
    paid_at?: number;
  };
}

export interface StripeSubscription {
  id: string;
  object: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  billing_cycle_anchor: number;
  items: {
    data: Array<{
      id: string;
      price: {
        id: string;
        product: {
          name: string;
          description: string;
        };
        recurring: {
          interval: string;
          interval_count: number;
        };
      };
    }>;
  };
}

export interface InvoiceListResponse {
  object: string;
  data: StripeInvoice[];
  has_more: boolean;
}

export interface Message {
  senderId: string;
  senderName: string;
  senderRole: "user" | "support";
  type: "text" | "image";
  content: string;
  timestamp?: number;
}

export interface Customer {
  id: string;
  corporateName: string;
  email: string;
  document: {
    type: string;
    number: string;
  };
  municipalRegistration: string;
  stateRegistration: string;
  address: {
    street: string;
    neighborhood: string;
    number: string;
    city: string;
    state: string;
    zipCode: string;
    municipalCode: string;
  };
  contact: {
    areaCode: string;
    numberPhone: string;
  };
}

export interface Recebivel {
  id?: string;
  serviceRecipient: string;
  value: number;
  type: string;
  status: string;
  description: string;
  observations?: string;
  attachment?: string;
  dueDate?: string;
  createdAt?: Timestamp;
}

export interface Agendamento {
  id?: string;
  serviceRecipient: string;
  value: number;
  type: string;
  status: string;
  description: string;
  observations?: string;
  attachment?: string;
  dueDate?: string;
  billingDay: number;
  createdAt?: Timestamp;
}

export interface UserData {
  email: string;
  name: string;
  role: string;
  sub: string;
  subscriptionId: string;
}
