export const filterMenuItemsByRole = (items, role) =>
  items
    .map((item) => {
      if (item.roles && !item.roles.includes(role)) return null;
      if (!item.submenu) return item;
      return { ...item, submenu: filterMenuItemsByRole(item.submenu, role) };
    })
    .filter(Boolean);
