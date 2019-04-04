import { GroupedPlugins, RegisterRoutePayload } from './daaas.types';

// Custom comparer for plugin objects, sorts keys by order (asc), then by name (asc)
export const comparePlugins = (
  a: RegisterRoutePayload,
  b: RegisterRoutePayload
): number =>
  a.order === b.order
    ? a.displayName.localeCompare(b.displayName)
    : a.order - b.order;

function buildMenuItemDictionary(
  plugins: RegisterRoutePayload[]
): GroupedPlugins {
  const dict: GroupedPlugins = {};

  plugins.forEach(p => {
    if (!(p.section in dict)) {
      dict[p.section] = [];
    }
    dict[p.section].push(p);
  });

  return dict;
}

// Convert the list of plugins into a structured dataset for rendering
export function structureMenuData(
  plugins: RegisterRoutePayload[]
): GroupedPlugins {
  const menuItems = buildMenuItemDictionary(plugins);

  Object.keys(menuItems).forEach(
    section => (menuItems[section] = menuItems[section].sort(comparePlugins))
  );
  return menuItems;
}
