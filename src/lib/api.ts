import { saveAs } from 'file-saver';
import logomedianeira from '../public/medianeira.jpg';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { writeFile } from "fs/promises";
import puppeteer from "puppeteer";
const API_URL = import.meta.env.VITE_API_URL;
import Cookies from "js-cookie";

export const api = {

  async create_user(data: any) {
    const response = await fetch(`${API_URL}/user/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao criar usuário');
    }

    return response.json();
  },

  async create_subscription_user(data: any) {
    const response = await fetch(`${API_URL}/pagarme/create-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao criar assinatura do usuário');
    }

    return response.json();
  },

  async update_user(data: any) {
    const response = await fetch(`${API_URL}/user/update`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao atualizar dados');
    }

    return response.json();
  },  

  async update_admin(id: string, data: any) {
    const response = await fetch(`${API_URL}/admin/update/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('admin_token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao atualizar dados');
    }

    return response.json();
  }, 

  async update_user_byID(id: string, data: any) {
    const response = await fetch(`${API_URL}/user/update/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao atualizar dados');
    }

    return response.json();
  }, 

  async update_customer(id: string, data: any) {
    const response = await fetch(`${API_URL}/customer/update/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao atualizar cliente');
    }

    return response.json();
  }, 

  async login_user(data: any) {
    const response = await fetch(`${API_URL}/user/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao autenticar usuário');
    }

    return response.json();
  }, 

  async find_user(data: any) {
    const response = await fetch(`${API_URL}/user/find`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar usuário');
    }

    return response.json();
  },

  async find_all_users() {
    const response = await fetch(`${API_URL}/user/findall`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Falha ao buscar usuários');
    }

    return response.json();
  },

  async recover_send_email_user(data: any) {
    const response = await fetch(`${API_URL}/user/recover/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao enviar código no email do cliente');
    }

    return response.json();
  },

  async recover_password_user(data: any) {
    const response = await fetch(`${API_URL}/user/recover/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao atualizar a senha');
    }

    return response.json();
  },

  async create_customer(data: any) {
    const response = await fetch(`${API_URL}/customer/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao cadastrar cliente');
    }

    return response.json();
  },

  async find_customers() {
    const response = await fetch(`${API_URL}/customer/find`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar clientes');
    }

    return response.json();
  },

  async find_customers_user() {
    const response = await fetch(`${API_URL}/customer/findbyuser`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar clientes');
    }

    return response.json();
  },
  
  async find_subscription(id: string) {
    const response = await fetch(`${API_URL}/pagarme/get-subscription/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao assinatura');
    }

    return response.json();
  },
  
  async find_customers_actives() {
    const response = await fetch(`${API_URL}/customer/actives`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar clientes ativos');
    }

    return response.json();
  },

  async delete_customer(id: String) {
    const response = await fetch(`${API_URL}/customer/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao excluir cliente');
    }

    return response.json();
  },

  async delete_schedule(id: String) {
    const response = await fetch(`${API_URL}/scheduling/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao excluir agendamento');
    }

    return response.json();
  },

  async delete_schedule_ById(id: String) {
    const response = await fetch(`${API_URL}/scheduling/deletebyid/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao excluir agendamento');
    }

    return response.json();
  },

  async changestatus_customer(id: String, status: String) {
    const data = {
      status
    }
    const response = await fetch(`${API_URL}/customer/changestatus/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao cadastrar cliente');
    }

    return response.json();
  },

  async save_ondatabase_invoice(id: string, data: any) {
    const response = await fetch(`${API_URL}/invoice/create/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao salvar nota fiscal');
    }

    return response.json();
  },

  async find_invoices(){
    const response = await fetch(`${API_URL}/invoice/findinvoices`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar notas fiscais');
    }

    return response.json();
  },

  async find_all_invoices(){
    const response = await fetch(`${API_URL}/invoice/find`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar notas fiscais');
    }

    return response.json();
  },

  async find_schedulings(id: string){
    const response = await fetch(`${API_URL}/scheduling/find/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar agendamentos');
    }

    return response.json();
  },

  async find_schedulings_byUserId(id: string){
    const response = await fetch(`${API_URL}/scheduling/find-user/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar agendamentos');
    }

    return response.json();
  },  

  async create_scheduling(data: any) {
    const response = await fetch(`${API_URL}/scheduling/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao criar agendamento');
    }

    return response.json();
  },

  async create_scheduling_admin(data: any) {
    const response = await fetch(`${API_URL}/scheduling/create-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('admin_token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao criar agendamento');
    }

    return response.json();
  },  

  async create_invoice(data: any) {
    const response = await fetch(`${API_URL}/invoice/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao criar nota fiscal');
    }

    return response.json();
  },

  async create_invoice_admin(data: any) {
    const response = await fetch(`${API_URL}/invoice/create-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('admin_token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao criar nota fiscal');
    }

    return response.json();
  },

  async login_admin(data: any){
    const response = await fetch(`${API_URL}/admin/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao autenticar usuário');
    }

    return response.json();
  },

  async find_all_invoices_customer(id:string){
    const response = await fetch(`${API_URL}/invoice/findinvoicescustomer/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar notas fiscais geradas no sistema');
    }

    return response.json();
  },

  async find_all_invoices_customer_admin(id:string){
    const response = await fetch(`${API_URL}/invoice/findinvoicescustomeradmin/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar notas fiscais geradas no sistema');
    }

    return response.json();
  },  

  async find_all_invoices_admin(id:string){
    const response = await fetch(`${API_URL}/invoice/findinvoicesadmin/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar notas fiscais geradas no sistema');
    }

    return response.json();
  },

  async cancel_invoice(data: any){
    const response = await fetch(`${API_URL}/invoice/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao cancelar nota fiscal');
    }

    return response.json();
  },

  async cancel_invoice_admin(data: any){
    const response = await fetch(`${API_URL}/invoice/cancel-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao cancelar nota fiscal');
    }

    return response.json();
  },

  async replace_invoice(data: any){
    const response = await fetch(`${API_URL}/invoice/replace`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao cancelar nota fiscal');
    }

    return response.json();
  },

  async find_plans(){
    const response = await fetch(`${API_URL}/pagarme/plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar planos cadastrados no sistema');
    }

    return response.json();
  }, 
  
  async Edit_Plan(data: any){
    const response = await fetch(`${API_URL}/pagarme/edit-item-plan`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Server error');
    }

    return response.json();
  },

  async Find_All_Subscriptions(){
    const response = await fetch(`${API_URL}/pagarme/get-all-subscriptions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Server error');
    }

    return response.json();
  }, 

  async Cancel_Subscription(id: String) {
    const response = await fetch(`${API_URL}/pagarme/cancel-subscription/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao cancelar assinatura');
    }

    return response.json();
  },

  async Find_CNAES_ELOTECH(){
    const response = await fetch(`${API_URL}/elotech/cnaes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Server error');
    }

    return response.json();
  }, 

  async Find_SERVICOS_ELOTECH(){
    const response = await fetch(`${API_URL}/elotech/servicos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Server error');
    }

    return response.json();
  },

  async Find_SERVICO_POR_CNAE(id: string){
    const response = await fetch(`${API_URL}/elotech/servicosporcnae/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Server error');
    }

    return response.json();
  },

  async Find_Invoice_ByID(id: string){
    const response = await fetch(`${API_URL}/invoice/find/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Server error');
    }

    return response.json();
  },

  async Export_Invoice_PDF(customer: any){
    try {
      const response = await fetch(`${API_URL}/invoice/nfsepdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('token')}`,
        },
        body: JSON.stringify(customer),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Falha ao gerar PDF');
      }
  
      // Verifica se é um PDF
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/pdf')) {
        const responseData = await response.text();
        console.error('Resposta inesperada:', responseData);
        throw new Error('Resposta não é um PDF válido');
      }
  
      const blob = await response.blob();
      
      // Verificação adicional
      if (blob.size === 0) {
        throw new Error('PDF recebido está vazio');
      }
  
      // Cria URL temporária para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `NFSe_${customer.numero || Date.now()}.pdf`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
  
      // Limpeza
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
  
    } catch (error) {
      console.error('Erro no download:', error);
      throw new Error(`Falha no download`);
    }
  },

  async Export_Invoice_PDF_ADMIN(customer: any){
    try {
      const response = await fetch(`${API_URL}/invoice/nfsepdf-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('token')}`,
        },
        body: JSON.stringify(customer),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Falha ao gerar PDF');
      }
  
      // Verifica se é um PDF
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/pdf')) {
        const responseData = await response.text();
        console.error('Resposta inesperada:', responseData);
        throw new Error('Resposta não é um PDF válido');
      }
  
      const blob = await response.blob();
      
      // Verificação adicional
      if (blob.size === 0) {
        throw new Error('PDF recebido está vazio');
      }
  
      // Cria URL temporária para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `NFSe_${customer.numero || Date.now()}.pdf`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
  
      // Limpeza
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
  
    } catch (error) {
      console.error('Erro no download:', error);
      throw new Error(`Falha no download`);
    }
  },
  
  async Find_Receipts(){
    const response = await fetch(`${API_URL}/financial/receipts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar recebimentos');
    }

    return response.json();
  },

  async Create_Receive(data: any) {
    const response = await fetch(`${API_URL}/financial/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Falha ao criar recebimento');
    }

    return response.json();
  },

  async Update_Receive(id: string, status: string) {
    const response = await fetch(`${API_URL}/financial/update/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
      body: JSON.stringify({status}),
    });

    if (!response.ok) {
      throw new Error('Falha ao dar baixa no recibo');
    }

    return response.json();
  },

  async Update_IsDesactivated(id: string, value: boolean) {
    const response = await fetch(`${API_URL}/financial/isdesactivated/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
      body: JSON.stringify({isDesactivated:value}),
    });

    if (!response.ok) {
      throw new Error('Falha ao dar baixa no recibo');
    }

    return response.json();
  },

  async LastMonthPaid(id: string) {
    const response = await fetch(`${API_URL}/financial/lastmonthpaid/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha');
    }

    return response.json();
  },  

  async Delete_Receive(id: string) {
    const response = await fetch(`${API_URL}/financial/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao dar excluir recibo');
    }

    return response.json();
  },

  async Calculate_Taxation(data: any){
    try {
      const response = await fetch(`${API_URL}/user/calcular-tributos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error when calculate');
      }
      return response.json();

    } catch (error) {
      console.error('Error when calculate:', error);
    }
  },


};
