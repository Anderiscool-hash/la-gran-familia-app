const TRANSLATIONS = {
  en: {
    dashboard:'Dashboard', revenue:'Revenue', expenses:'Expenses',
    merchandise:'Merchandise', employees:'Employees', orders:'Orders',
    reports:'Reports', settings:'Settings', sign_out:'Sign Out',
    save:'Save', cancel:'Cancel', delete:'Delete', add:'Add',
    edit:'Edit', back:'Back', amount:'Amount', date:'Date',
    description:'Description', notes:'Notes', name:'Name',
    category:'Category', status:'Status', paid:'Paid', pending:'Pending',
    weekly_pay:'Weekly Pay', deductions:'Deductions', net_pay:'Net Pay',
    net_profit:'Net Profit', net_payroll:'Net Payroll',
    total_expenses:'Total Expenses', monthly_overhead:'Monthly Overhead',
  },
  es: {
    dashboard:'Panel', revenue:'Ingresos', expenses:'Gastos',
    merchandise:'Mercancía', employees:'Empleados', orders:'Pedidos',
    reports:'Informes', settings:'Ajustes', sign_out:'Cerrar Sesión',
    save:'Guardar', cancel:'Cancelar', delete:'Eliminar', add:'Agregar',
    edit:'Editar', back:'Regresar', amount:'Total', date:'Fecha',
    description:'Descripción', notes:'Notas', name:'Nombre',
    category:'Categoría', status:'Estado', paid:'Pagado', pending:'Pendiente',
    weekly_pay:'Pago Semanal', deductions:'Deducciones', net_pay:'Pago Neto',
    net_profit:'Ganancia Neta', net_payroll:'Nómina Neta',
    total_expenses:'Gastos Totales', monthly_overhead:'Gastos Fijos',
  }
};

function t(key) {
  const lang = localStorage.getItem('lang') || 'en';
  return (TRANSLATIONS[lang] || TRANSLATIONS.en)[key] || key;
}

function applyTranslations() {
  document.querySelectorAll('[data-t]').forEach(el => {
    el.textContent = t(el.dataset.t);
  });
}
