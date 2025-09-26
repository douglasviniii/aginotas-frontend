
const TermosDeUso = () => {
  return (
    <div
      style={{
        fontFamily: 'Montserrat, sans-serif',
        backgroundColor: '#161e2c',
        color: '#fff',
        margin: 0,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
      }}
    >
      <header
        style={{
          textAlign: 'center',
          marginBottom: '20px',
        }}
      >
        <h1
          style={{
            fontSize: '2.5rem',
            color: '#fff',
            marginBottom: '10px',
          }}
        >
          Termos de Uso
        </h1>
      </header>

      <div
        style={{
          backgroundColor: '#1f2a3a',
          padding: '30px',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '1200px',
          margin: '20px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        }}
      >
        <p
          style={{
            color: '#ddd',
            lineHeight: '1.6',
            fontSize: '1rem',
            marginBottom: '20px',
          }}
        >
          Ao acessar e utilizar o site Aginotas, você concorda com os termos e
          condições descritos nesta página. Estes Termos de Uso governam o uso dos
          nossos serviços e a relação entre o usuário e o Aginotas.
        </p>

        <h2
          style={{
            color: '#fff',
            fontWeight: 500,
            marginTop: '30px',
          }}
        >
          Contrato de Uso
        </h2>
        <p
          style={{
            color: '#ddd',
            lineHeight: '1.6',
            fontSize: '1rem',
            marginBottom: '20px',
          }}
        >
          O uso do Aginotas está sujeito ao cumprimento deste contrato. Ao
          continuar a usar nossos serviços, você concorda em obedecer às políticas
          e termos estabelecidos. Caso não concorde com qualquer uma das cláusulas,
          você não deve utilizar nossos serviços.
        </p>

        <h2
          style={{
            color: '#fff',
            fontWeight: 500,
            marginTop: '30px',
          }}
        >
          Assinatura Recorrente Mensal
        </h2>
        <p
          style={{
            color: '#ddd',
            lineHeight: '1.6',
            fontSize: '1rem',
            marginBottom: '20px',
          }}
        >
          O Aginotas oferece planos de assinatura recorrente mensal. Ao contratar uma
          assinatura, você concorda em pagar o valor especificado no momento da
          contratação, com a renovação automática a cada mês. Você poderá cancelar
          sua assinatura a qualquer momento, mas a cobrança continuará até o final do
          período de pagamento vigente.
        </p>

        <h2
          style={{
            color: '#fff',
            fontWeight: 500,
            marginTop: '30px',
          }}
        >
          Fornecimento de Dados Fiscais
        </h2>
        <p
          style={{
            color: '#ddd',
            lineHeight: '1.6',
            fontSize: '1rem',
            marginBottom: '20px',
          }}
        >
          Para fins de conformidade com as regulamentações fiscais, ao utilizar os
          serviços do Aginotas, você concorda em fornecer dados necessários para a
          emissão de NFSE (Nota Fiscal de Serviço Eletrônica) e outros dados
          tributários conforme os regimes federais e municipais.
        </p>
        <p
          style={{
            color: '#ddd',
            lineHeight: '1.6',
            fontSize: '1rem',
            marginBottom: '20px',
          }}
        >
          Estes dados serão utilizados exclusivamente para fins fiscais e para
          atender às obrigações legais perante a Receita Federal e a Receita
          Municipal, conforme exigido por lei. Ao fornecer essas informações, você
          autoriza o Aginotas a usá-las para a emissão de documentos fiscais e para o
          cumprimento de todas as obrigações tributárias aplicáveis.
        </p>

        <h2
          style={{
            color: '#fff',
            fontWeight: 500,
            marginTop: '30px',
          }}
        >
          Responsabilidades do Usuário
        </h2>
        <p
          style={{
            color: '#ddd',
            lineHeight: '1.6',
            fontSize: '1rem',
            marginBottom: '20px',
          }}
        >
          Como usuário, você se compromete a:
        </p>
        <ul
          style={{
            listStyleType: 'disc',
            marginLeft: '20px',
            color: '#ddd',
          }}
        >
          <li>Fornecer informações corretas e atualizadas durante o processo de cadastro e assinatura.</li>
          <li>Garantir que as informações fiscais fornecidas sejam verdadeiras e completas, para que possamos cumprir com as obrigações tributárias.</li>
          <li>Manter a confidencialidade de sua conta e informações de pagamento.</li>
        </ul>

        <h2
          style={{
            color: '#fff',
            fontWeight: 500,
            marginTop: '30px',
          }}
        >
          Alterações nos Termos de Uso
        </h2>
        <p
          style={{
            color: '#ddd',
            lineHeight: '1.6',
            fontSize: '1rem',
            marginBottom: '20px',
          }}
        >
          O Aginotas reserva-se o direito de modificar ou atualizar estes Termos de
          Uso a qualquer momento. Quaisquer mudanças serão publicadas nesta página e
          entrarão em vigor imediatamente após a publicação. Recomendamos que você
          revise esta página periodicamente para se manter informado sobre quaisquer
          alterações.
        </p>

        <footer
          style={{
            marginTop: '40px',
            textAlign: 'center',
            fontSize: '0.9rem',
            color: '#aaa',
          }}
        >
          <p>Última atualização: [23/04/2025]</p>
        </footer>
      </div>
    </div>
  );
};

export default TermosDeUso;
