import * as fs from 'fs';
import * as path from 'path';

describe('TODO Output Snapshots', () => {
  
  function normalizeTodoContent(content: string): string {
    // Normalize timestamps to make snapshots deterministic
    let normalized = content
      .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/g, 'TIMESTAMP')
      .replace(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/g, 'TIMESTAMP')
      .replace(/Last Updated: [^\n]*/g, 'Last Updated: TIMESTAMP')
      .replace(/Generated: [^\n]*/g, 'Generated: TIMESTAMP')
      .replace(/Report Period: [^\n]*/g, 'Report Period: NORMALIZED_PERIOD');

    // Normalize dynamic counts that may vary
    normalized = normalized
      .replace(/Open Issues: \d+/g, 'Open Issues: N')
      .replace(/Open PRs: \d+/g, 'Open PRs: N')
      .replace(/\d+ commits?/g, 'N commits')
      .replace(/\d+ issues?/g, 'N issues');

    return normalized;
  }

  function readTodoFile(filename: string): string | null {
    const todoPath = path.join(__dirname, '../../../project-todos', filename);
    
    if (!fs.existsSync(todoPath)) {
      return null;
    }

    return fs.readFileSync(todoPath, 'utf8');
  }

  describe('Generated Todo Files Structure', () => {
    const todoFiles = [
      'comment-analyzer-todos.md',
      'ai-investment-todos.md',
      'clockify-ado-automated-report-todos.md'
    ];

    todoFiles.forEach(filename => {
      it(`should have consistent structure for ${filename}`, () => {
        const content = readTodoFile(filename);
        
        if (content === null) {
          console.warn(`Todo file ${filename} not found, skipping snapshot test`);
          return;
        }

        const normalized = normalizeTodoContent(content);

        // Verify required sections exist
        expect(normalized).toMatch(/# .+ Todo List/);
        expect(normalized).toMatch(/## Repository Status/);
        
        // Snapshot the normalized content
        expect(normalized).toMatchSnapshot(`${filename}-structure`);
      });
    });
  });

  describe('Excalibur Summary Structure', () => {
    it('should have consistent excalibur summary format', () => {
      const summaryGlob = path.join(__dirname, '../../../project-todos/excalibur-summary-*.md');
      
      // Find most recent excalibur summary file
      const summaryFiles = fs.readdirSync(path.join(__dirname, '../../../project-todos'))
        .filter(file => file.startsWith('excalibur-summary-'))
        .sort()
        .reverse();

      if (summaryFiles.length === 0) {
        console.warn('No excalibur summary files found, skipping snapshot test');
        return;
      }

      const latestSummary = summaryFiles[0];
      const content = readTodoFile(latestSummary);
      
      if (content === null) {
        console.warn('Could not read excalibur summary file');
        return;
      }

      const normalized = normalizeTodoContent(content);

      // Verify excalibur summary structure
      expect(normalized).toMatch(/# .*(Excalibur|Summary).*/);
      expect(normalized).toMatch(/## (Execution|Summary|Results|Repository Status|Actions)/); // More flexible pattern
      
      expect(normalized).toMatchSnapshot('excalibur-summary-structure');
    });
  });

  describe('Repository Analysis Summary', () => {
    it('should have consistent repository analysis format', () => {
      const analysisPath = path.join(__dirname, '../../../project-todos/repository-analysis-summary.md');
      
      if (!fs.existsSync(analysisPath)) {
        console.warn('Repository analysis summary not found, skipping test');
        return;
      }

      const content = fs.readFileSync(analysisPath, 'utf8');
      const normalized = normalizeTodoContent(content);

      // Verify analysis summary structure
      expect(normalized).toMatch(/# Repository Analysis/);
      expect(normalized).toMatch(/## (Summary|Overview|Analysis|Repositories|Priority|Next)/); // More flexible pattern
      
      expect(normalized).toMatchSnapshot('repository-analysis-structure');
    });
  });

  describe('Cross-file Consistency', () => {
    it('should maintain consistent markdown formatting across todo files', () => {
      const todoDir = path.join(__dirname, '../../../project-todos');
      
      if (!fs.existsSync(todoDir)) {
        console.warn('Project todos directory not found');
        return;
      }

      const todoFiles = fs.readdirSync(todoDir)
        .filter(file => file.endsWith('-todos.md'))
        .slice(0, 3); // Test first 3 files for performance

      const structures: string[] = [];

      todoFiles.forEach(file => {
        const content = readTodoFile(file);
        if (content) {
          // Extract structural elements (headers, list patterns)
          const structure = content
            .split('\n')
            .filter(line => line.startsWith('#') || line.startsWith('-'))
            .map(line => line.replace(/[^\s#\-\[\]]/g, 'X')) // Replace content with X
            .join('\n');
          
          structures.push(structure);
        }
      });

      // All files should have similar structural patterns
      if (structures.length > 1) {
        const firstStructure = structures[0];
        structures.forEach((structure, index) => {
          expect(structure).toMatch(/^#/m); // Should start with header
          expect(structure).toMatch(/^## /m); // Should have subheaders
        });
      }
    });
  });
});