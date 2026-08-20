import { applySort, applyFilters, getFilterOptions, toggleFilter, clearFilter, SortDir } from './table-utils';

describe('table-utils', () => {
  const items = [
    { id: 1, name: 'Bravo', age: 30, status: 'ACTIVE' },
    { id: 2, name: 'Alpha', age: 25, status: 'INACTIVE' },
    { id: 3, name: 'Charlie', age: 35, status: 'ACTIVE' },
    { id: 4, name: null, age: null, status: 'ACTIVE' },
  ];

  describe('applySort', () => {
    it('should return items unchanged when sort is null', () => {
      expect(applySort(items, null)).toEqual(items);
    });

    it('should sort strings ascending', () => {
      const sorted = applySort(items, { column: 'name', dir: 'asc' });
      expect(sorted.map(i => i.name)).toEqual([null, 'Alpha', 'Bravo', 'Charlie']);
    });

    it('should sort strings descending', () => {
      const sorted = applySort(items, { column: 'name', dir: 'desc' });
      expect(sorted.map(i => i.name)).toEqual(['Charlie', 'Bravo', 'Alpha', null]);
    });

    it('should sort numbers ascending', () => {
      const sorted = applySort(items, { column: 'age', dir: 'asc' });
      expect(sorted.map(i => i.age)).toEqual([null, 25, 30, 35]);
    });

    it('should sort numbers descending', () => {
      const sorted = applySort(items, { column: 'age', dir: 'desc' });
      expect(sorted.map(i => i.age)).toEqual([35, 30, 25, null]);
    });
  });

  describe('applyFilters', () => {
    it('should return all items when filters are empty', () => {
      expect(applyFilters(items, {})).toEqual(items);
    });

    it('should filter by single column', () => {
      const filters = { status: new Set(['ACTIVE']) };
      const result = applyFilters(items, filters);
      expect(result.length).toBe(3);
      expect(result.every(i => i.status === 'ACTIVE')).toBe(true);
    });

    it('should filter by multiple columns', () => {
      const filters = {
        status: new Set(['ACTIVE']),
        age: new Set(['30'])
      };
      const result = applyFilters(items, filters);
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Bravo');
    });

    it('should handle empty set in filter', () => {
      const filters = { status: new Set<string>() };
      expect(applyFilters(items, filters)).toEqual(items);
    });
  });

  describe('getFilterOptions', () => {
    it('should return unique non-empty values', () => {
      const options = getFilterOptions(items, 'status');
      expect(options).toEqual(['ACTIVE', 'INACTIVE']);
    });

    it('should exclude null/undefined values', () => {
      const options = getFilterOptions(items, 'name');
      expect(options).toEqual(['Alpha', 'Bravo', 'Charlie']);
    });

    it('should return sorted values', () => {
      const options = getFilterOptions(items, 'status');
      expect(options).toEqual([...options].sort());
    });
  });

  describe('toggleFilter', () => {
    it('should add value to filter', () => {
      const result = toggleFilter({}, 'status', 'ACTIVE');
      expect(result['status'].has('ACTIVE')).toBe(true);
    });

    it('should remove value from filter if exists', () => {
      const initial = { status: new Set(['ACTIVE']) };
      const result = toggleFilter(initial, 'status', 'ACTIVE');
      expect(result['status'].has('ACTIVE')).toBe(false);
    });

    it('should not mutate original filters', () => {
      const initial = { status: new Set(['ACTIVE']) };
      toggleFilter(initial, 'status', 'INACTIVE');
      expect(initial.status.has('INACTIVE')).toBe(false);
    });
  });

  describe('clearFilter', () => {
    it('should remove the specified column filter', () => {
      const initial = {
        status: new Set(['ACTIVE']),
        name: new Set(['Alpha'])
      };
      const result = clearFilter(initial, 'status');
      expect(result['status']).toBeUndefined();
      expect(result['name'].has('Alpha')).toBe(true);
    });

    it('should not mutate original filters', () => {
      const initial = { status: new Set(['ACTIVE']) };
      clearFilter(initial, 'status');
      expect(initial.status.has('ACTIVE')).toBe(true);
    });
  });
});
