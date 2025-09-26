// mockCustomers.ts
import { CustomerType } from './types';

export const mockCustomers: CustomerType[] = [
  {
    corporateName: 'Empresa Exemplo 1',
    email: 'contato@empresa1.com',
    document: {
      type: 'CNPJ',
      number: '12.345.678/0001-90'
    },
    municipalRegistration: '123456',
    stateRegistration: '654321',
    address: {
      street: 'Rua Exemplo 1',
      neighborhood: 'Bairro Exemplo',
      number: '100',
      city: 'Cidade Exemplo',
      state: 'SP',
      zipCode: '12345000',
      municipalCode: '1234567'
    },
    contact: {
      areaCode: '11',
      numberPhone: '99999-9999'
    },
    status: 'active'
  },
  {
    corporateName: 'Empresa Exemplo 2',
    email: 'contato@empresa2.com',
    document: {
      type: 'CPF',
      number: '123.456.789-00'
    },
    municipalRegistration: '654321',
    stateRegistration: '123456',
    address: {
      street: 'Rua Exemplo 2',
      neighborhood: 'Bairro Teste',
      number: '200',
      city: 'Cidade Teste',
      state: 'RJ',
      zipCode: '98765000',
      municipalCode: '7654321'
    },
    contact: {
      areaCode: '21',
      numberPhone: '98888-8888'
    },
    status: 'inactive'
  }
];
