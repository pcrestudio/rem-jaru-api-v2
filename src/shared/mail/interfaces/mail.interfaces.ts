export interface RecipientAddresses {
  to: Address[];
  cc: Address[];
  bcc: Address[];
}

export interface Address {
  address: string;
  name: string;
}
