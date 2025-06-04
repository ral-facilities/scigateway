import {
  buildNavDrawerPluginList,
  buildPluginConfig,
  comparePlugins,
  structureMenuData,
} from './pluginhelper';
import { PluginConfig, RegisterRoutePayload } from './scigateway.types';

describe('pluginhelper', () => {
  function buildPlugin(
    order: number,
    displayName: string,
    section: string,
    link = 'link',
    admin?: boolean,
    hideFromMenu?: boolean
  ): PluginConfig {
    return {
      order,
      displayName,
      section,
      link,
      plugin: 'plugin',
      admin,
      hideFromMenu,
    };
  }

  describe('buildPluginConfig', () => {
    it('returns a PluginConfig object containing all fields from a Request', () => {
      const request: RegisterRoutePayload = {
        order: 99,
        plugin: 'requesting_plugin',
        link: '/path/to/page',
        section: 'REQUEST_SECTION',
        displayName: 'new plugin page',
      };

      const expected: PluginConfig = {
        order: 99,
        plugin: 'requesting_plugin',
        link: '/path/to/page',
        section: 'REQUEST_SECTION',
        displayName: 'new plugin page',
      };

      expect(buildPluginConfig(request)).toEqual(expected);
    });
  });

  describe('comparer', () => {
    it('returns zero if order and displayName are equal', () => {
      const p1 = buildPlugin(1, 'pluginName', 'section');
      const p2 = buildPlugin(1, 'pluginName', 'section');

      expect(comparePlugins(p1, p2)).toBe(0);
    });

    it('returns positive if a.order is greater than b.order', () => {
      const a = buildPlugin(100, 'pluginName', 'section');
      const b = buildPlugin(0, 'pluginName', 'section');

      expect(comparePlugins(a, b)).toBeGreaterThan(0);
    });

    it('returns negative if a.order is less than b.order', () => {
      const a = buildPlugin(1, 'pluginName', 'section');
      const b = buildPlugin(2, 'pluginName', 'section');

      expect(comparePlugins(a, b)).toBeLessThan(0);
    });

    it('returns positive if order is equal and a.displayName precedes b.displayName', () => {
      const a = buildPlugin(100, 'before name', 'section');
      const b = buildPlugin(100, 'later name', 'section');

      expect(comparePlugins(a, b)).toBeLessThan(0);
    });

    it('returns negative if order is equal and a.displayName follows b.displayName', () => {
      const a = buildPlugin(100, 'later name', 'section');
      const b = buildPlugin(100, 'earlierName', 'section');

      expect(comparePlugins(a, b)).toBeGreaterThan(0);
    });
  });

  describe('structureMenuData', () => {
    const testPluginList: PluginConfig[] = [
      buildPlugin(10, 'firstName', 'Data'),
      buildPlugin(10, 'aName', 'Analysis'),
      buildPlugin(5, 'firstName', 'Data'),
      buildPlugin(10, 'bName', 'Analysis'),
      buildPlugin(10, 'zName', 'Analysis'),
      buildPlugin(20, 'lastName', 'Data'),
      buildPlugin(20, 'firstName', 'Data'),
    ];

    it('separates plugin list into object keyed by section', () => {
      const structuredData = structureMenuData(testPluginList);
      expect(structuredData['Analysis']).toHaveLength(3);
      expect(structuredData['Data']).toHaveLength(4);
    });

    it('correctly assigns plugin to section list', () => {
      const structuredData = structureMenuData(testPluginList);
      structuredData['Analysis'].forEach((plugin) =>
        expect(plugin.section).toEqual('Analysis')
      );
    });

    it('sorts plugins with comparer', () => {
      const structuredData = structureMenuData(testPluginList);
      const sortedData = structuredData['Data'].sort(comparePlugins);
      expect(structuredData['Data']).toEqual(sortedData);
    });
  });

  describe('buildNavDrawerPluginList', () => {
    const testPluginList: PluginConfig[] = [
      buildPlugin(1, 'one', 'Data'),
      buildPlugin(2, 'two', 'Analysis', 'link', true),
      buildPlugin(3, 'three', 'Data', 'link', false, true),
      buildPlugin(4, 'four', 'Analysis', 'homepage'),
    ];

    it('filters out plugins which should not appear in the menu', () => {
      const filteredPlugins = buildNavDrawerPluginList(
        testPluginList,
        'homepage'
      );
      expect(filteredPlugins).toHaveLength(1);
      expect(filteredPlugins[0].displayName).toEqual('one');
    });

    it('works fine if homepage is undefined', () => {
      const filteredPlugins = buildNavDrawerPluginList(
        testPluginList,
        undefined
      );
      expect(filteredPlugins).toHaveLength(2);
    });
  });
});
