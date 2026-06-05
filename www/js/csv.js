const CSV = (() => {
  const STORES = ['revenue', 'expenses', 'merchandise', 'vendors', 'employees', 'deductions', 'orders', 'users'];

  function flatten(row) {
    const out = {};
    Object.entries(row || {}).forEach(([key, val]) => {
      out[key] = Array.isArray(val) || (val && typeof val === 'object') ? JSON.stringify(val) : val;
    });
    return out;
  }

  function escapeCell(value) {
    const s = value == null ? '' : String(value);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }

  async function exportStore(store) {
    const rows = (await DB.getAll(store)).map(flatten);
    if (!rows.length) {
      App.toast('No data to export');
      return;
    }
    const headers = Array.from(rows.reduce((set, row) => {
      Object.keys(row).forEach(k => set.add(k));
      return set;
    }, new Set()));
    const csv = [headers.join(','), ...rows.map(row => headers.map(h => escapeCell(row[h])).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `la-gran-familia-${store}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function buttons(stores) {
    return (stores || STORES).map(store => `
      <button class="btn btn-ghost btn-sm" onclick="CSV.exportStore('${store}')">${icon('download', { size: 15 })}${store}</button>
    `).join('');
  }

  return { exportStore, buttons, STORES };
})();
