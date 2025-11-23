import { describe, it, expect } from 'vitest';
import { createToolResponse, createErrorResponse } from '../../src/types/common.js';

describe('common types', () => {
  describe('createToolResponse', () => {
    it('should create a valid tool response with object data', () => {
      const data = { key: 'value', count: 42 };
      const response = createToolResponse(data);

      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe('text');
      expect(response.isError).toBeUndefined();

      const parsed = JSON.parse(response.content[0].text);
      expect(parsed).toEqual(data);
    });

    it('should create a valid tool response with array data', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const response = createToolResponse(data);

      expect(response.content).toHaveLength(1);
      const parsed = JSON.parse(response.content[0].text);
      expect(parsed).toEqual(data);
    });

    it('should create a valid tool response with null data', () => {
      const response = createToolResponse(null);

      expect(response.content).toHaveLength(1);
      expect(response.content[0].text).toBe('null');
    });

    it('should format JSON as compact single-line for LLM optimization', () => {
      const data = { a: 1 };
      const response = createToolResponse(data);

      expect(response.content[0].text).toBe('{"a":1}');
      expect(response.content[0].text).not.toContain('\n');
    });
  });

  describe('createErrorResponse', () => {
    it('should create an error response with message', () => {
      const message = 'Something went wrong';
      const response = createErrorResponse(message);

      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe('text');
      expect(response.content[0].text).toBe(message);
      expect(response.isError).toBe(true);
    });

    it('should handle empty error message', () => {
      const response = createErrorResponse('');

      expect(response.content[0].text).toBe('');
      expect(response.isError).toBe(true);
    });
  });
});
