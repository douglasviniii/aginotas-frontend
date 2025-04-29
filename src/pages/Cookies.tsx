const Cookies = () => {
  return (
    <div
      style={{
        fontFamily: 'Montserrat, sans-serif',
        backgroundColor: '#161e2c',
        color: '#fff',
        margin: 0,
        padding: 9,
      }}
    >
      {/* Banner */}
      <div
        style={{
          backgroundImage: 'linear-gradient(to right, #1e3c72, #2a5298)',
          padding: '60px 20px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '3rem',
            color: '#fff',
            margin: 0,
            fontWeight: 700,
          }}
        >
          Política de Cookies
        </h1>
        <p
          style={{
            fontSize: '1.2rem',
            color: '#d0d0d0',
            marginTop: '10px',
          }}
        >
          Saiba como usamos cookies para melhorar sua experiência
        </p>
      </div>

      {/* Conteúdo */}
      <div
        style={{
          backgroundColor: '#1f2a3a',
          padding: '30px',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '1200px',
          margin: '40px auto',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
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
          Esta Política de Cookies explica como utilizamos cookies no nosso
          site. Ao continuar a usar o nosso site, você concorda com a
          utilização de cookies conforme descrito nesta política.
        </p>

        <h2 style={{ color: '#fff', fontWeight: 500, marginTop: '30px' }}>
          O que são Cookies?
        </h2>
        <p style={paragraphStyle}>
          Cookies são pequenos arquivos de texto que são armazenados no seu
          dispositivo (computador, tablet, smartphone, etc.) quando você visita
          um site...
        </p>

        <h2 style={headingStyle}>Como utilizamos Cookies?</h2>
        <p style={paragraphStyle}>
          Utilizamos cookies para várias finalidades, incluindo:
        </p>
        <ul style={listStyle}>
          <li>
            <strong>Cookies essenciais:</strong> Necessários para o
            funcionamento básico do site...
          </li>
          <li>
            <strong>Cookies de desempenho:</strong> Nos ajudam a contar visitas
            e fontes de tráfego...
          </li>
          <li>
            <strong>Cookies de funcionalidade:</strong> Usados para lembrar suas
            preferências...
          </li>
        </ul>

        <h2 style={headingStyle}>Informações que Coletamos</h2>
        <p style={paragraphStyle}>
          O Aginotas pode coletar algumas informações pessoais e de navegação
          através de cookies...
        </p>
        <ul style={listStyle}>
          <li>
            <strong>Telefone:</strong> Pode ser coletado para comunicação e
            suporte.
          </li>
          <li>
            <strong>E-mail:</strong> Usado para envio de atualizações e
            notificações.
          </li>
          <li>
            <strong>Endereço IP:</strong> Identifica sua localização aproximada.
          </li>
          <li>
            <strong>Localização:</strong> Para oferecer conteúdo mais relevante.
          </li>
          <li>
            <strong>Dispositivos:</strong> Dados sobre o dispositivo e navegador.
          </li>
        </ul>

        <h2 style={headingStyle}>Controle de Cookies</h2>
        <p style={paragraphStyle}>
          Você pode configurar seu navegador para bloquear ou excluir cookies...
        </p>

        <h2 style={headingStyle}>Alterações nesta Política de Cookies</h2>
        <p style={paragraphStyle}>
          Podemos atualizar nossa Política de Cookies periodicamente. Recomendamos
          que você revise esta página regularmente...
        </p>

        <footer
          style={{
            marginTop: '40px',
            textAlign: 'center',
            fontSize: '0.9rem',
            color: '#db2020',
          }}
        >
          <p>Última atualização: 23/04/2025</p>
        </footer>
      </div>
    </div>
  );
};

// Estilos reutilizáveis
const paragraphStyle = {
  color: '#ffffff',
  lineHeight: '1.6',
  fontSize: '1rem',
  marginBottom: '20px',
};

const headingStyle = {
  color: '#ffffff',
  fontWeight: 500,
  marginTop: '30px',
};

const listStyle = {
  listStyleType: 'disc',
  marginLeft: '20px',
  color: '#ddd',
};

export default Cookies;
