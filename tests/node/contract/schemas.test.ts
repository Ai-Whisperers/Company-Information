import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import * as fs from 'fs';
import * as path from 'path';

describe('JSON Schema Validation', () => {
  let ajv: Ajv;

  beforeAll(() => {
    ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(ajv);
  });

  describe('MCP Configuration Schema', () => {
    let schema: any;

    beforeAll(() => {
      const schemaPath = path.join(__dirname, '../schemas/mcp-config.schema.json');
      schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    });

    it('should validate valid MCP configuration', () => {
      const fixturePath = path.join(__dirname, '../__fixtures__/mcp-config.sample.json');
      const config = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

      const validate = ajv.compile(schema);
      const valid = validate(config);

      if (!valid) {
        console.error('Validation errors:', validate.errors);
      }
      expect(valid).toBe(true);
    });

    it('should validate actual mcp-config.json', () => {
      const configPath = path.join(__dirname, '../../../mcp-config.json');
      
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const validate = ajv.compile(schema);
        const valid = validate(config);

        if (!valid) {
          console.error('Validation errors:', validate.errors);
        }
        expect(valid).toBe(true);
      } else {
        console.warn('mcp-config.json not found, skipping validation');
      }
    });

    it('should reject invalid server names', () => {
      const invalidConfig = {
        mcpServers: {
          "123-invalid-start": {
            command: "node"
          }
        }
      };

      const validate = ajv.compile(schema);
      const valid = validate(invalidConfig);

      expect(valid).toBe(false);
      expect(validate.errors).toContainEqual(
        expect.objectContaining({
          keyword: 'patternProperties'
        })
      );
    });

    it('should reject missing required command', () => {
      const invalidConfig = {
        mcpServers: {
          "valid-server": {
            args: ["some-arg"]
          }
        }
      };

      const validate = ajv.compile(schema);
      const valid = validate(invalidConfig);

      expect(valid).toBe(false);
      expect(validate.errors).toContainEqual(
        expect.objectContaining({
          keyword: 'required',
          missingProperty: 'command'
        })
      );
    });

    it('should reject invalid environment variable names', () => {
      const invalidConfig = {
        mcpServers: {
          "valid-server": {
            command: "node",
            env: {
              "invalid-env-var": "value"
            }
          }
        }
      };

      const validate = ajv.compile(schema);
      const valid = validate(invalidConfig);

      expect(valid).toBe(false);
    });
  });

  describe('Sync Configuration Schema', () => {
    let schema: any;

    beforeAll(() => {
      const schemaPath = path.join(__dirname, '../schemas/sync-config.schema.json');
      schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    });

    it('should validate actual sync-config.json', () => {
      const configPath = path.join(__dirname, '../../../sync-config.json');
      
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const validate = ajv.compile(schema);
        const valid = validate(config);

        if (!valid) {
          console.error('Validation errors:', validate.errors);
          console.error('Invalid data paths:', validate.errors?.map(e => e.instancePath));
        }
        expect(valid).toBe(true);
      } else {
        console.warn('sync-config.json not found, skipping validation');
      }
    });

    it('should require version, organization, and globalSettings', () => {
      const invalidConfig = {
        description: "Missing required fields"
      };

      const validate = ajv.compile(schema);
      const valid = validate(invalidConfig);

      expect(valid).toBe(false);
      
      const missingFields = validate.errors?.filter(e => e.keyword === 'required')
        .map(e => (e as any).missingProperty);
      
      expect(missingFields).toContain('version');
      expect(missingFields).toContain('organization'); 
      expect(missingFields).toContain('globalSettings');
    });

    it('should validate version format', () => {
      const invalidConfig = {
        version: "1.0.0.1", // Invalid: should be "1.0" format
        organization: "test",
        globalSettings: { enabled: true }
      };

      const validate = ajv.compile(schema);
      const valid = validate(invalidConfig);

      expect(valid).toBe(false);
      expect(validate.errors).toContainEqual(
        expect.objectContaining({
          keyword: 'pattern'
        })
      );
    });

    it('should validate globalSettings.maxConcurrentSyncs range', () => {
      const invalidConfig = {
        version: "1.0",
        organization: "test",
        globalSettings: { 
          enabled: true,
          maxConcurrentSyncs: 15 // Invalid: max is 10
        }
      };

      const validate = ajv.compile(schema);
      const valid = validate(invalidConfig);

      expect(valid).toBe(false);
      expect(validate.errors).toContainEqual(
        expect.objectContaining({
          keyword: 'maximum'
        })
      );
    });
  });
});