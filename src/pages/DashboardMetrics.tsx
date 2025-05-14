// // DashboardMetrics.tsx
// import React, { useState, useEffect } from 'react';

// function DashboardMetrics() {
// //   const [metrics, setMetrics] = useState({
// //     totalInvoices: 0,
// //     totalInvoiceValue: 0,
// //     activeCustomers: 0,
// //     inactiveCustomers: 0,
// //     newSubscriptions: 0,
// //   });

// //   useEffect(() => {
// //     // Substitua pelas suas chamadas de API
// //     fetch('/api/admin/metrics')
// //       .then((response) => response.json())
// //       .then((data) => setMetrics(data));
// //   }, []);

// //simulação
// const [metrics, setMetrics] = useState({
//     totalInvoices: 150, // Valor falso
//     totalInvoiceValue: 50000, // Valor falso
//     activeCustomers: 120, // Valor falso
//     inactiveCustomers: 30, // Valor falso
//     newSubscriptions: 15, // Valor falso
//   });


//   useEffect(() => {
//     // Simulação de chamada de API (remova quando a API estiver pronta)
//     setTimeout(() => {
//       setMetrics({
//         totalInvoices: 155, // Valores falsos atualizados
//         totalInvoiceValue: 52000,
//         activeCustomers: 125,
//         inactiveCustomers: 25,
//         newSubscriptions: 18,
//       });
//     }, 1000); // Simula um atraso de 1 segundo
//   }, []);

//   return (
//     // <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//     //   <div className="bg-gray-800 p-4 rounded-lg">
//     //     <h2 className="text-lg font-semibold">Total de Notas Emitidas</h2>
//     //     <p className="text-2xl">{metrics.totalInvoices}</p>
//     //   </div>
//     //   {/* Adicione outros cards para as outras métricas */}
//     // </div>

//     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//       <div className="bg-gray-800 p-4 rounded-lg">
//         <h2 className="text-lg font-semibold text-gray-200">Total de Notas Emitidas</h2>
//         <p className="text-2xl text-gray-200">{metrics.totalInvoices}</p>
//       </div>
//       <div className="bg-gray-800 p-4 rounded-lg">
//         <h2 className="text-lg font-semibold text-gray-200">Valor Total das Notas Emitidas</h2>
//         <p className="text-2xl text-gray-200">R$ {metrics.totalInvoiceValue.toFixed(2)}</p>
//       </div>
//       <div className="bg-gray-800 p-4 rounded-lg">
//         <h2 className="text-lg font-semibold text-gray-200">Clientes Ativos</h2>
//         <p className="text-2xl text-gray-200">{metrics.activeCustomers}</p>
//       </div>
//       <div className="bg-gray-800 p-4 rounded-lg">
//         <h2 className="text-lg font-semibold text-gray-200">Clientes Inativos</h2>
//         <p className="text-2xl text-gray-200">{metrics.inactiveCustomers}</p>
//       </div>
//       <div className="bg-gray-800 p-4 rounded-lg">
//         <h2 className="text-lg font-semibold text-gray-200">Novas Assinaturas</h2>
//         <p className="text-2xl text-gray-200">{metrics.newSubscriptions}</p>
//       </div>
//     </div>
//   );
// }

// export default DashboardMetrics;