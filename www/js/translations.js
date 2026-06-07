const TRANSLATIONS = {
  en: {
    // Nav
    dashboard:'Dashboard', revenue:'Revenue', expenses:'Expenses',
    merchandise:'Merchandise', employees:'Employees', orders:'Orders',
    reports:'Reports', settings:'Settings', users:'Users', sign_out:'Sign Out',
    home:'Home', more:'More',
    // Common
    save:'Save', cancel:'Cancel', delete:'Delete', add:'Add',
    edit:'Edit', back:'Back', amount:'Amount', date:'Date',
    description:'Description', notes:'Notes', name:'Name',
    category:'Category', status:'Status', paid:'Paid', pending:'Pending',
    all:'All', day:'Day', items:'items', members:'members',
    quick_add:'Quick Add', view_all:'View all',
    // Finance
    weekly_pay:'Weekly Pay', deductions:'Deductions', net_pay:'Net Pay',
    net_profit:'Net Profit', net_payroll:'Net Payroll',
    total_expenses:'Expenses', monthly_overhead:'Monthly Overhead',
    breakdown:'Weekly Breakdown', net_loss:'Net Loss',
    total_spent:'Total Spent', total_all_time:'All-Time',
    gross_pay:'Gross Pay', all_revenue:'All Revenue', all_expenses:'All Expenses',
    all_merch:'All Merchandise', weekly_report:'Weekly Report', all_time_totals:'All-Time Totals',
    money_in:'Money in', money_out:'Money out', profit_margin:'Profit margin',
    where_money_goes:'Where the money goes', recent_activity:'Recent activity',
    cash_split:'Cash vs Card', this_week:'This Week', week_of:'Week of',
    log_revenue:'Log revenue', log_expense:'Log expense', vs_last:'vs last week',
    avg_week:'Avg / week', selected_week_revenue:'Selected Week Revenue',
    payroll_left_next:'Payroll Left for Next Week',
    // Revenue
    add_revenue:'Add Revenue', week_starting:'Week starting (Monday)',
    save_revenue:'Save Revenue', no_revenue:'No revenue entries yet.',
    cash:'Cash', credit_card:'Card', card:'Card', total:'Total',
    // Expenses
    add_expense:'Add Expense', type:'Type', one_time:'One-time',
    recurring:'Recurring', billing_day:'Billing day',
    save_expense:'Save Expense', no_expenses:'No expenses yet.',
    // Merchandise
    add_purchase:'Add Purchase', store_vendor:'Store / Vendor',
    select_store:'Select store', receipt_photo:'Receipt photo',
    manage_stores:'Manage stores', store_name:'Store name',
    no_purchases:'No purchases yet.', no_stores:'No stores yet.',
    add_store_first:'Add a store first below.', receipt:'Receipt', add_store:'Add store',
    // Employees
    add_employee:'Add Employee', full_name:'Full name',
    no_employees:'No employees yet.', no_deductions:'No deductions yet.',
    del_employee:'Delete this employee and their deductions?',
    del_deduction:'Remove this deduction?', add_deduction:'Add deduction',
    // Orders
    order_lists:'Order Lists', new_order:'New list', new_list:'New list',
    list_name:'Department', dept_placeholder:'e.g. Deli, Bakery, Produce',
    view_list:'Open', share_link:'Share', share_list:'Share list', no_orders:'No order lists yet.',
    pending_of:'pending', item_name:'Item', no_items:'List is empty. Add items above.',
    done:'Done', qty:'Qty', add_item:'Add item', copied:'List copied to clipboard',
    // Users
    user_accounts:'User Accounts', create_user:'Create User', add_user:'Add user',
    username:'Username', password:'Password', role:'Role', manage_users:'Manage Users',
    worker:'Worker', admin:'Admin', change_password:'Change Password',
    new_password:'New password', update_password:'Update Password',
    create_account:'Create Account', you:'you', admins:'Admins', created:'Created',
    role_perms:'Role permissions',
    admin_perm:'Full access to every section.',
    worker_perm:'Order lists only — view and check off items.',
    // Settings
    appearance:'Appearance', language:'Language', install_app:'Install as App',
    account:'Account', light:'Light', dark:'Dark', theme:'Theme',
    signed_in_as:'Signed in as', version:'Version', accent:'Accent color',
    data:'Data', load_sample:'Load sample data', reset_data:'Reset all data',
    reset_confirm:'Erase ALL data on this device? This cannot be undone.',
    sample_loaded:'Sample data loaded', data_reset:'All data cleared',
    // Login
    sign_in:'Sign In', sign_in_sub:'Sign in to continue',
    firebase_setup_needed:'Firebase setup is needed before cloud login can start.',
    invalid_login:'Username or password is incorrect.',
    export_csv:'Export CSV',
    password_reset_note:'Password resets need a secure Firebase Admin function.',
    app_name:'La Gran Familia', app_sub:'Grocery Corp.',
  },
  es: {
    // Nav
    dashboard:'Panel', revenue:'Ingresos', expenses:'Gastos',
    merchandise:'Mercancía', employees:'Empleados', orders:'Pedidos',
    reports:'Informes', settings:'Ajustes', users:'Usuarios', sign_out:'Cerrar Sesión',
    home:'Inicio', more:'Más',
    // Common
    save:'Guardar', cancel:'Cancelar', delete:'Eliminar', add:'Agregar',
    edit:'Editar', back:'Regresar', amount:'Total', date:'Fecha',
    description:'Descripción', notes:'Notas', name:'Nombre',
    category:'Categoría', status:'Estado', paid:'Pagado', pending:'Pendiente',
    all:'Todos', day:'Día', items:'artículos', members:'miembros',
    quick_add:'Agregar', view_all:'Ver todo',
    // Finance
    weekly_pay:'Pago Semanal', deductions:'Deducciones', net_pay:'Pago Neto',
    net_profit:'Ganancia Neta', net_payroll:'Nómina Neta',
    total_expenses:'Gastos', monthly_overhead:'Gastos Fijos',
    breakdown:'Resumen Semanal', net_loss:'Pérdida Neta',
    total_spent:'Total Gastado', total_all_time:'Histórico',
    gross_pay:'Pago Bruto', all_revenue:'Todos los Ingresos', all_expenses:'Todos los Gastos',
    all_merch:'Toda la Mercancía', weekly_report:'Reporte Semanal', all_time_totals:'Totales Generales',
    money_in:'Entradas', money_out:'Salidas', profit_margin:'Margen',
    where_money_goes:'A dónde va el dinero', recent_activity:'Actividad reciente',
    cash_split:'Efectivo vs Tarjeta', this_week:'Esta Semana', week_of:'Semana del',
    log_revenue:'Registrar ingreso', log_expense:'Registrar gasto', vs_last:'vs semana pasada',
    avg_week:'Prom. / semana', selected_week_revenue:'Ingresos de la Semana',
    payroll_left_next:'Nómina Restante para la Próxima Semana',
    // Revenue
    add_revenue:'Agregar Ingresos', week_starting:'Semana que inicia (lunes)',
    save_revenue:'Guardar Ingresos', no_revenue:'Sin ingresos registrados.',
    cash:'Efectivo', credit_card:'Tarjeta', card:'Tarjeta', total:'Total',
    // Expenses
    add_expense:'Agregar Gasto', type:'Tipo', one_time:'Único',
    recurring:'Recurrente', billing_day:'Día de cobro',
    save_expense:'Guardar Gasto', no_expenses:'Sin gastos registrados.',
    // Merchandise
    add_purchase:'Agregar Compra', store_vendor:'Tienda / Proveedor',
    select_store:'Seleccionar tienda', receipt_photo:'Foto del recibo',
    manage_stores:'Administrar tiendas', store_name:'Nombre de tienda',
    no_purchases:'Sin compras registradas.', no_stores:'Sin tiendas registradas.',
    add_store_first:'Primero agrega una tienda abajo.', receipt:'Recibo', add_store:'Agregar tienda',
    // Employees
    add_employee:'Agregar Empleado', full_name:'Nombre completo',
    no_employees:'Sin empleados registrados.', no_deductions:'Sin deducciones.',
    del_employee:'¿Eliminar este empleado y sus deducciones?',
    del_deduction:'¿Eliminar esta deducción?', add_deduction:'Agregar deducción',
    // Orders
    order_lists:'Listas de Pedidos', new_order:'Nueva lista', new_list:'Nueva lista',
    list_name:'Departamento', dept_placeholder:'Ej. Deli, Panadería, Verduras',
    view_list:'Abrir', share_link:'Compartir', share_list:'Compartir lista', no_orders:'Sin listas de pedidos.',
    pending_of:'pendiente(s)', item_name:'Artículo', no_items:'Lista vacía. Agrega artículos arriba.',
    done:'Listo', qty:'Cant.', add_item:'Agregar artículo', copied:'Lista copiada al portapapeles',
    // Users
    user_accounts:'Cuentas de Usuario', create_user:'Crear Usuario', add_user:'Agregar usuario',
    username:'Usuario', password:'Contraseña', role:'Rol', manage_users:'Administrar Usuarios',
    worker:'Trabajador', admin:'Administrador', change_password:'Cambiar Contraseña',
    new_password:'Nueva contraseña', update_password:'Actualizar Contraseña',
    create_account:'Crear Cuenta', you:'tú', admins:'Administradores', created:'Creado',
    role_perms:'Permisos por rol',
    admin_perm:'Acceso completo a todas las secciones.',
    worker_perm:'Solo listas de pedidos — ver y marcar artículos.',
    // Settings
    appearance:'Apariencia', language:'Idioma', install_app:'Instalar como App',
    account:'Cuenta', light:'Claro', dark:'Oscuro', theme:'Tema',
    signed_in_as:'Sesión iniciada como', version:'Versión', accent:'Color de acento',
    data:'Datos', load_sample:'Cargar datos de ejemplo', reset_data:'Borrar todos los datos',
    reset_confirm:'¿Borrar TODOS los datos de este dispositivo? No se puede deshacer.',
    sample_loaded:'Datos de ejemplo cargados', data_reset:'Datos borrados',
    // Login
    sign_in:'Iniciar Sesión', sign_in_sub:'Inicia sesión para continuar',
    firebase_setup_needed:'Se necesita configurar Firebase antes de iniciar sesión en la nube.',
    invalid_login:'Usuario o contraseña incorrectos.',
    export_csv:'Exportar CSV',
    password_reset_note:'Restablecer contraseñas requiere una función segura de Firebase Admin.',
    app_name:'La Gran Familia', app_sub:'Grocery Corp.',
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
