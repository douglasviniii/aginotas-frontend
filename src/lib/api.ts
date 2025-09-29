const API_URL = import.meta.env.VITE_API_URL;
import Cookies from "js-cookie";

export const api = {
  async login(data: any) {
    const response = await fetch(`${API_URL}/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Falha ao autenticar usuário");
    }

    return response.json();
  },

  async getSubscriptionById(id: string) {
    const response = await fetch(`${API_URL}/payment/subscription/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.json();
  },

  async create_user(data: any) {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getUserById() {
    const response = await fetch(`${API_URL}/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    return response.json();
  },

  async updateUser(data: any, file?: File) {
    const formData = new FormData();
    formData.append("userBody", JSON.stringify(data));
    if (file) {
      formData.append("userBody[enterprise][logoEnterprise]", file);
    }

    const response = await fetch(`${API_URL}/user/update`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
      body: formData,
    });

    return response.json();
  },

  async create_checkout(data: any) {
    const response = await fetch(`${API_URL}/payment/checkout-subscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async receitaWs(cnpj: string) {
    const response = await fetch(`${API_URL}/user/receitaws/${cnpj}`, {
      method: "GET",
    });
    return response.json();
  },

  async serviceByCnae(id: string) {
    const response = await fetch(`${API_URL}/user/servicebycnae/${id}`, {
      method: "GET",
    });
    return response.json();
  },

  async generateInvoice(data: any) {
    const response = await fetch(`${API_URL}/invoice/generate/medianeira-pr`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async scheduleInvoice(data: any) {
    const response = await fetch(`${API_URL}/invoice/scheduling`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async createCustomer(data: any) {
    const response = await fetch(`${API_URL}/user/customer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getAllCustomers() {
    const response = await fetch(`${API_URL}/user/customers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    return response.json();
  },

  async getCustomerById(customerId: string) {
    const response = await fetch(`${API_URL}/user/customer/${customerId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    return response.json();
  },

  async updateCustomer(data: any, id: string) {
    const response = await fetch(`${API_URL}/user/customer/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteCustomer(id: string) {
    const response = await fetch(`${API_URL}/user/customer/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    return response.json();
  },

  async getInvoicesByCustomer(id: string) {
    const response = await fetch(`${API_URL}/invoice/customer/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    return response.json();
  },

  async getSchedulingsByCustomer(id: string) {
    const response = await fetch(`${API_URL}/invoice/scheduling/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    return response.json();
  },

  async deletescheduling(id: string) {
    const response = await fetch(`${API_URL}/invoice/scheduling/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    return response.json();
  },

  async generateInvoicePdf(invoiceXml: string, id: string) {
    const response = await fetch(`${API_URL}/invoice/generate/pdf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
      body: JSON.stringify({ invoiceXml: invoiceXml, serviceRecipient: id }),
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    return await response.blob();
  },

  async cancelInvoice(data: any) {
    const response = await fetch(`${API_URL}/invoice/cancel/medianeira-pr`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getSubscription(id: string) {
    const response = await fetch(`${API_URL}/payment/subscription/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    return response.json();
  },

  async getNextInvoice(id: string) {
    const response = await fetch(`${API_URL}/payment/next/invoice/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    return response.json();
  },

  async getInvoicesByCustomerId(customerId: string) {
    const response = await fetch(`${API_URL}/payment/invoices/${customerId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    return response.json();
  },

  async createChat(data: any) {
    const response = await fetch(`${API_URL}/chat/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getMessages(chatId: string) {
    const response = await fetch(`${API_URL}/chat/${chatId}/messages`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    return response.json();
  },

  async getAllChats() {
    const response = await fetch(`${API_URL}/chat`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    return response.json();
  },

  async sendMessage(data: any) {
    const isFormData = data instanceof FormData;

    const response = await fetch(`${API_URL}/chat/message`, {
      method: "POST",
      headers: isFormData
        ? {
            Authorization: `Bearer ${Cookies.get("token")}`,
          }
        : {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
      body: isFormData ? data : JSON.stringify(data),
    });

    return response.json();
  },

  async deleteChat(id: string) {
    const response = await fetch(`${API_URL}/chat/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    return response.json();
  },

  async getInvoices() {
    const response = await fetch(`${API_URL}/invoice`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    return response.json();
  },

  async getInvoicesForCustomer() {
    const response = await fetch(`${API_URL}/invoice/customer`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    return response.json();
  },

  async recoverSendCode(email: string) {
    const response = await fetch(`${API_URL}/user/recover/code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    return response.json();
  },

  async recoverPassword(password: string, id: string) {
    const response = await fetch(`${API_URL}/user/recover/password/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });
    return response.json();
  },

  async createReceivable(data: any) {
    const response = await fetch(`${API_URL}/financial/receivable`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async createSchedulingReceivable(data: any) {
    const response = await fetch(`${API_URL}/financial/scheduling/receivable`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getAllReceivables() {
    const response = await fetch(`${API_URL}/financial/receivables`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    return response.json();
  },

  async getAllSchedulingReceivables() {
    const response = await fetch(
      `${API_URL}/financial/scheduling/receivables`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      }
    );
    return response.json();
  },

  async deleteReceivable(id: string) {
    const response = await fetch(`${API_URL}/financial/receivable/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    return response.json();
  },

  async deleteSchedulingReceivable(id: string) {
    const response = await fetch(
      `${API_URL}/financial/scheduling/receivable/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      }
    );
    return response.json();
  },

  async updateStatusReceivable(id: string, data: any) {
    const response = await fetch(`${API_URL}/financial/receivable/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  //--------------------------------

  async create_subscription_user(data: any) {
    const response = await fetch(`${API_URL}/pagarme/create-subscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Falha ao criar assinatura do usuário");
    }

    return response.json();
  },

  async update_user(data: any) {
    const response = await fetch(`${API_URL}/user/update`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Falha ao atualizar dados");
    }

    return response.json();
  },

  async update_admin(id: string, data: any) {
    const response = await fetch(`${API_URL}/admin/update/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("admin_token")}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Falha ao atualizar dados");
    }

    return response.json();
  },

  async update_user_byID(id: string, data: any) {
    const response = await fetch(`${API_URL}/user/update/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Falha ao atualizar dados");
    }

    return response.json();
  },

  async update_customer(id: string, data: any) {
    const response = await fetch(`${API_URL}/customer/update/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Falha ao atualizar cliente");
    }

    return response.json();
  },

  async find_user(data: any) {
    const response = await fetch(`${API_URL}/user/find`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Falha ao buscar usuário");
    }

    return response.json();
  },

  async find_all_users() {
    const response = await fetch(`${API_URL}/user/findall`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Falha ao buscar usuários");
    }

    return response.json();
  },

  async recover_send_email_user(data: any) {
    const response = await fetch(`${API_URL}/user/recover/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Falha ao enviar código no email do cliente");
    }

    return response.json();
  },

  async recover_password_user(data: any) {
    const response = await fetch(`${API_URL}/user/recover/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Falha ao atualizar a senha");
    }

    return response.json();
  },

  async create_customer(data: any) {
    const response = await fetch(`${API_URL}/customer/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Falha ao cadastrar cliente");
    }

    return response.json();
  },

  async find_customers() {
    const response = await fetch(`${API_URL}/customer/find`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Falha ao buscar clientes");
    }

    return response.json();
  },

  async find_customers_user() {
    const response = await fetch(`${API_URL}/customer/findbyuser`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Falha ao buscar clientes");
    }

    return response.json();
  },

  async find_subscription(id: string) {
    const response = await fetch(`${API_URL}/pagarme/get-subscription/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Assinatura inexistente");
    }

    return response.json();
  },

  async find_customers_actives() {
    const response = await fetch(`${API_URL}/customer/actives`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Falha ao buscar clientes ativos");
    }

    return response.json();
  },

  async delete_customer(id: String) {
    const response = await fetch(`${API_URL}/customer/delete/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Falha ao excluir cliente");
    }

    return response.json();
  },

  async delete_schedule(id: String) {
    const response = await fetch(`${API_URL}/scheduling/delete/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Falha ao excluir agendamento");
    }

    return response.json();
  },

  async delete_schedule_ById(id: String) {
    const response = await fetch(`${API_URL}/scheduling/deletebyid/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Falha ao excluir agendamento");
    }

    return response.json();
  },

  async changestatus_customer(id: String, status: String) {
    const data = {
      status,
    };
    const response = await fetch(`${API_URL}/customer/changestatus/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Falha ao cadastrar cliente");
    }

    return response.json();
  },

  async save_ondatabase_invoice(id: string, data: any) {
    const response = await fetch(`${API_URL}/invoice/create/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Falha ao salvar nota fiscal");
    }

    return response.json();
  },

  async find_invoices() {
    const response = await fetch(`${API_URL}/invoice/findinvoices`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Falha ao buscar notas fiscais");
    }

    return response.json();
  },

  async find_all_invoices() {
    const response = await fetch(`${API_URL}/invoice/find`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Falha ao buscar notas fiscais");
    }

    return response.json();
  },

  async find_schedulings(id: string) {
    const response = await fetch(`${API_URL}/scheduling/find/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Falha ao buscar agendamentos");
    }

    return response.json();
  },

  async find_schedulings_byUserId(id: string) {
    const response = await fetch(`${API_URL}/scheduling/find-user/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Falha ao buscar agendamentos");
    }

    return response.json();
  },

  async create_scheduling(data: any) {
    const response = await fetch(`${API_URL}/scheduling/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Falha ao criar agendamento");
    }

    return response.json();
  },

  async create_scheduling_admin(data: any) {
    const response = await fetch(`${API_URL}/scheduling/create-admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("admin_token")}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Falha ao criar agendamento");
    }

    return response.json();
  },

  async create_invoice(data: any) {
    const response = await fetch(`${API_URL}/invoice/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Falha ao criar nota fiscal");
    }

    return response.json();
  },

  async create_invoice_admin(data: any) {
    const response = await fetch(`${API_URL}/invoice/create-admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("admin_token")}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Falha ao criar nota fiscal");
    }

    return response.json();
  },

  async login_admin(data: any) {
    const response = await fetch(`${API_URL}/admin/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Falha ao autenticar usuário");
    }

    return response.json();
  },

  async find_all_invoices_customer(id: string) {
    const response = await fetch(
      `${API_URL}/invoice/findinvoicescustomer/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Falha ao buscar notas fiscais geradas no sistema");
    }

    return response.json();
  },

  async find_all_invoices_customer_admin(id: string) {
    const response = await fetch(
      `${API_URL}/invoice/findinvoicescustomeradmin/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Falha ao buscar notas fiscais geradas no sistema");
    }

    return response.json();
  },

  async find_all_invoices_admin(id: string) {
    const response = await fetch(`${API_URL}/invoice/findinvoicesadmin/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Falha ao buscar notas fiscais geradas no sistema");
    }

    return response.json();
  },

  async cancel_invoice(data: any) {
    const response = await fetch(`${API_URL}/invoice/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Falha ao cancelar nota fiscal");
    }

    return response.json();
  },

  async cancel_invoice_admin(data: any) {
    const response = await fetch(`${API_URL}/invoice/cancel-admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Falha ao cancelar nota fiscal");
    }

    return response.json();
  },

  async replace_invoice(data: any) {
    const response = await fetch(`${API_URL}/invoice/replace`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Falha ao cancelar nota fiscal");
    }

    return response.json();
  },

  async find_plans() {
    const response = await fetch(`${API_URL}/pagarme/plans`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Falha ao buscar planos cadastrados no sistema");
    }

    return response.json();
  },

  async Edit_Plan(data: any) {
    const response = await fetch(`${API_URL}/pagarme/edit-item-plan`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Server error");
    }

    return response.json();
  },

  async Find_All_Subscriptions() {
    const response = await fetch(`${API_URL}/pagarme/get-all-subscriptions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Server error");
    }

    return response.json();
  },

  async Cancel_Subscription(id: String) {
    const response = await fetch(
      `${API_URL}/pagarme/cancel-subscription/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Falha ao cancelar assinatura");
    }

    return response.json();
  },

  async Find_CNAES_ELOTECH() {
    const response = await fetch(`${API_URL}/elotech/cnaes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Server error");
    }

    return response.json();
  },

  async Find_SERVICOS_ELOTECH() {
    const response = await fetch(`${API_URL}/elotech/servicos`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Server error");
    }

    return response.json();
  },

  async Find_SERVICO_POR_CNAE(id: string) {
    const response = await fetch(`${API_URL}/elotech/servicosporcnae/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Server error");
    }

    return response.json();
  },

  async Find_Invoice_ByID(id: string) {
    const response = await fetch(`${API_URL}/invoice/find/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Server error");
    }

    return response.json();
  },

  async Export_Invoice_PDF(customer: any) {
    try {
      const response = await fetch(`${API_URL}/invoice/nfsepdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify(customer),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Falha ao gerar PDF");
      }

      // Verifica se é um PDF
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/pdf")) {
        const responseData = await response.text();
        console.error("Resposta inesperada:", responseData);
        throw new Error("Resposta não é um PDF válido");
      }

      const blob = await response.blob();

      // Verificação adicional
      if (blob.size === 0) {
        throw new Error("PDF recebido está vazio");
      }

      // Cria URL temporária para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `NFSe_${customer.numero || Date.now()}.pdf`;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();

      // Limpeza
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Erro no download:", error);
      throw new Error(`Falha no download`);
    }
  },

  async Export_Invoice_PDF_ADMIN(customer: any) {
    try {
      const response = await fetch(`${API_URL}/invoice/nfsepdf-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify(customer),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Falha ao gerar PDF");
      }

      // Verifica se é um PDF
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/pdf")) {
        const responseData = await response.text();
        console.error("Resposta inesperada:", responseData);
        throw new Error("Resposta não é um PDF válido");
      }

      const blob = await response.blob();

      // Verificação adicional
      if (blob.size === 0) {
        throw new Error("PDF recebido está vazio");
      }

      // Cria URL temporária para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `NFSe_${customer.numero || Date.now()}.pdf`;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();

      // Limpeza
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Erro no download:", error);
      throw new Error(`Falha no download`);
    }
  },

  async Find_Receipts() {
    const response = await fetch(`${API_URL}/financial/receipts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Falha ao buscar recebimentos");
    }

    return response.json();
  },

  async Create_Receive(data: any) {
    const response = await fetch(`${API_URL}/financial/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Falha ao criar recebimento");
    }

    return response.json();
  },

  async Update_Receive(id: string, status: string) {
    const response = await fetch(`${API_URL}/financial/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error("Falha ao dar baixa no recibo");
    }

    return response.json();
  },

  async Update_IsDesactivated(id: string, value: boolean) {
    const response = await fetch(`${API_URL}/financial/isdesactivated/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
      body: JSON.stringify({ isDesactivated: value }),
    });

    if (!response.ok) {
      throw new Error("Falha ao dar baixa no recibo");
    }

    return response.json();
  },

  async LastMonthPaid(id: string) {
    const response = await fetch(`${API_URL}/financial/lastmonthpaid/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Falha");
    }

    return response.json();
  },

  async Delete_Receive(id: string) {
    const response = await fetch(`${API_URL}/financial/delete/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Falha ao dar excluir recibo");
    }

    return response.json();
  },

  async Calculate_Taxation(data: any) {
    try {
      const response = await fetch(`${API_URL}/user/calcular-tributos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error when calculate");
      }
      return response.json();
    } catch (error) {
      console.error("Error when calculate:", error);
    }
  },
};
