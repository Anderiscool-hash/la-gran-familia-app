const TRANSLATIONS = {
  en: {
    // Nav
    dashboard:'Dashboard', revenue:'Revenue', expenses:'Expenses',
    merchandise:'Merchandise', employees:'Employees', orders:'Orders',
    reports:'Reports', settings:'Settings', sign_out:'Sign Out',
    // Common
    save:'Save', cancel:'Cancel', delete:'Delete', add:'Add',
    edit:'Edit', back:'Back', amount:'Amount', date:'Date',
    description:'Description', notes:'Notes', name:'Name',
    category:'Category', status:'Status', paid:'Paid', pending:'Pending',
    // Finance
    weekly_pay:'Weekly Pay', deductions:'Deductions', net_pay:'Net Pay',
    net_profit:'Net Profit', net_payroll:'Net Payroll',
    total_expenses:'Total Expenses', monthly_overhead:'Monthly Overhead',
    breakdown:'Weekly Breakdown', net_loss:'Net Loss',
    total_spent:'Total Spent', total_all_time:'Total All-Time',
    gross_pay:'Gross Pay', all_revenue:'All Revenue', all_expenses:'All Expenses',
    all_merch:'All Merchandise', weekly_report:'Weekly Report', all_time_totals:'All-Time Totals',
    // Revenue
    add_revenue:'+ Add Revenue', week_starting:'Week Starting (Monday)',
    save_revenue:'Save Revenue', no_revenue:'No revenue entries yet.',
    cash:'Cash', credit_card:'Credit Card', total:'Total',
    // Expenses
    add_expense:'+ Add Expense', type:'Type', one_time:'One-time expense',
    recurring:'Recurring (monthly overhead)', billing_day:'Billing Day (1–31)',
    save_expense:'Save Expense', no_expenses:'No expenses yet.',
    // Merchandise
    add_purchase:'+ Add Purchase', store_vendor:'Store / Vendor',
    select_store:'-- Select store --', receipt_photo:'Receipt Photo (required)',
    manage_stores:'Manage Stores', store_name:'Store name',
    no_purchases:'No purchases yet.', no_stores:'No stores yet.',
    add_store_first:'Add a store first below.',
    // Employees
    add_employee:'+ Add Employee', full_name:'Full name',
    no_employees:'No employees yet.', no_deductions:'No deductions yet.',
    del_employee:'Delete this employee and their deductions?',
    del_deduction:'Remove this deduction?',
    // Orders
    order_lists:'Order Lists', new_order:'+ New Order List',
    list_name:'List Name / Department', dept_placeholder:'e.g. Deli, Bakery, Produce',
    view_list:'View List', share_link:'Share Link', no_orders:'No order lists yet.',
    pending_of:'pending', item_name:'Item name', no_items:'List is empty. Add items above.',
    done:'Done',
    // Users
    user_accounts:'User Accounts', create_user:'+ Create User',
    username:'Username', password:'Password', role:'Role',
    worker:'Worker', admin:'Admin', change_password:'Change Password',
    new_password:'New Password', update_password:'Update Password',
    create_account:'Create Account',
    // Settings
    appearance:'Appearance', language:'Language', install_app:'Install as App',
    account:'Account', light:'Light', dark:'Dark',
    // Login
    sign_in:'Sign In',
  },
  es: {
    // Nav
    dashboard:'Panel', revenue:'Ingresos', expenses:'Gastos',
    merchandise:'Mercancía', employees:'Empleados', orders:'Pedidos',
    reports:'Informes', settings:'Ajustes', sign_out:'Cerrar Sesión',
    // Common
    save:'Guardar', cancel:'Cancelar', delete:'Eliminar', add:'Agregar',
    edit:'Editar', back:'Regresar', amount:'Total', date:'Fecha',
    description:'Descripción', notes:'Notas', name:'Nombre',
    category:'Categoría', status:'Estado', paid:'Pagado', pending:'Pendiente',
    // Finance
    weekly_pay:'Pago Semanal', deductions:'Deducciones', net_pay:'Pago Neto',
    net_profit:'Ganancia Neta', net_payroll:'Nómina Neta',
    total_expenses:'Gastos Totales', monthly_overhead:'Gastos Fijos',
    breakdown:'Resumen Semanal', net_loss:'Pérdida Neta',
    total_spent:'Total Gastado', total_all_time:'Total General',
    gross_pay:'Pago Bruto', all_revenue:'Todos los Ingresos', all_expenses:'Todos los Gastos',
    all_merch:'Toda la Mercancía', weekly_report:'Reporte Semanal', all_time_totals:'Totales Generales',
    // Revenue
    add_revenue:'+ Agregar Ingresos', week_starting:'Semana que Inicia (Lunes)',
    save_revenue:'Guardar Ingresos', no_revenue:'Sin ingresos registrados.',
    cash:'Efectivo', credit_card:'Tarjeta de Crédito', total:'Total',
    // Expenses
    add_expense:'+ Agregar Gasto', type:'Tipo', one_time:'Gasto único',
    recurring:'Recurrente (gasto fijo mensual)', billing_day:'Día de Cobro (1–31)',
    save_expense:'Guardar Gasto', no_expenses:'Sin gastos registrados.',
    // Merchandise
    add_purchase:'+ Agregar Compra', store_vendor:'Tienda / Proveedor',
    select_store:'-- Seleccionar tienda --', receipt_photo:'Foto del Recibo (requerida)',
    manage_stores:'Administrar Tiendas', store_name:'Nombre de tienda',
    no_purchases:'Sin compras registradas.', no_stores:'Sin tiendas registradas.',
    add_store_first:'Primero agrega una tienda abajo.',
    // Employees
    add_employee:'+ Agregar Empleado', full_name:'Nombre completo',
    no_employees:'Sin empleados registrados.', no_deductions:'Sin deducciones.',
    del_employee:'¿Eliminar este empleado y sus deducciones?',
    del_deduction:'¿Eliminar esta deducción?',
    // Orders
    order_lists:'Listas de Pedidos', new_order:'+ Nueva Lista',
    list_name:'Nombre / Departamento', dept_placeholder:'Ej. Deli, Panadería, Verduras',
    view_list:'Ver Lista', share_link:'Compartir', no_orders:'Sin listas de pedidos.',
    pending_of:'pendiente(s)', item_name:'Nombre del artículo', no_items:'Lista vacía. Agrega artículos arriba.',
    done:'Listo',
    // Users
    user_accounts:'Cuentas de Usuario', create_user:'+ Crear Usuario',
    username:'Usuario', password:'Contraseña', role:'Rol',
    worker:'Trabajador', admin:'Administrador', change_password:'Cambiar Contraseña',
    new_password:'Nueva Contraseña', update_password:'Actualizar Contraseña',
    create_account:'Crear Cuenta',
    // Settings
    appearance:'Apariencia', language:'Idioma', install_app:'Instalar como App',
    account:'Cuenta', light:'Claro', dark:'Oscuro',
    // Login
    sign_in:'Iniciar Sesión',
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
