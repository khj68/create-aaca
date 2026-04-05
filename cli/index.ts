#!/usr/bin/env node

/**
 * AACA CLI - AI-Agent Centric Architecture scaffolding and validation tool
 *
 * Commands:
 *   create-aaca <name> --lang <language>   Create a new AACA project
 *   aaca validate                          Validate project structure
 *   aaca add-operation <name>              Add a new operation
 *   aaca add-capability <name>             Add a new capability
 */

import { Command } from 'commander';
import { scaffold } from './scaffold.js';
import { validate } from './validate.js';
import chalk from 'chalk';

const program = new Command();

program
  .name('aaca')
  .description('AI-Agent Centric Architecture - CLI tools')
  .version('0.1.0');

program
  .command('init <name>')
  .description('Create a new AACA project')
  .option('-l, --lang <language>', 'Programming language', 'typescript')
  .option('-d, --dir <directory>', 'Target directory', '.')
  .action(async (name: string, options: { lang: string; dir: string }) => {
    console.log(chalk.blue(`\n  Creating AACA project: ${name}\n`));
    try {
      await scaffold({
        name,
        language: options.lang,
        targetDir: options.dir === '.' ? `./${name}` : options.dir,
      });
      console.log(chalk.green(`\n  Project ${name} created successfully!\n`));
      console.log(`  Next steps:`);
      console.log(`    cd ${name}`);
      console.log(`    npm install`);
      console.log(`    npx aaca validate\n`);
    } catch (err) {
      console.error(chalk.red(`\n  Error: ${(err as Error).message}\n`));
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate AACA project structure')
  .option('-p, --path <path>', 'Project root path', '.')
  .action(async (options: { path: string }) => {
    console.log(chalk.blue('\n  Validating AACA project structure...\n'));
    const result = await validate(options.path);
    if (result.valid) {
      console.log(chalk.green('  All checks passed!\n'));
    } else {
      console.log(chalk.red('  Validation failed:\n'));
      result.errors.forEach((err) => {
        console.log(chalk.red(`    - ${err}`));
      });
      console.log('');
      process.exit(1);
    }
    if (result.warnings.length > 0) {
      console.log(chalk.yellow('  Warnings:\n'));
      result.warnings.forEach((warn) => {
        console.log(chalk.yellow(`    - ${warn}`));
      });
      console.log('');
    }
  });

program
  .command('add-operation <name>')
  .description('Add a new operation to the project')
  .option('-p, --path <path>', 'Project root path', '.')
  .action(async (name: string, options: { path: string }) => {
    console.log(chalk.blue(`\n  Adding operation: ${name}\n`));
    try {
      await scaffold({
        name,
        language: 'typescript',
        targetDir: options.path,
        mode: 'add-operation',
      });
      console.log(chalk.green(`\n  Operation ${name} added successfully!\n`));
      console.log(`  Don't forget to:`);
      console.log(`    1. Define the contract in contracts/${name}.contract.yaml`);
      console.log(`    2. Register in SYSTEM.manifest.yaml`);
      console.log(`    3. Add routes in entry-points/http/routes.manifest.yaml\n`);
    } catch (err) {
      console.error(chalk.red(`\n  Error: ${(err as Error).message}\n`));
      process.exit(1);
    }
  });

program
  .command('install-skill')
  .description('Install AACA skill for Claude Code')
  .action(async () => {
    const os = await import('node:os');
    const fs = await import('node:fs');
    const path = await import('node:path');
    const url = await import('node:url');

    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
    const skillSource = path.join(__dirname, '..', 'skill', 'SKILL.md');
    const claudeSkillsDir = path.join(os.homedir(), '.claude', 'skills');
    const skillDest = path.join(claudeSkillsDir, 'aaca.md');

    try {
      fs.mkdirSync(claudeSkillsDir, { recursive: true });

      // Try reading from installed package location first, then local
      let content: string;
      if (fs.existsSync(skillSource)) {
        content = fs.readFileSync(skillSource, 'utf-8');
      } else {
        // When running from npx, skill file is bundled in the package
        const packageSkill = path.join(__dirname, '..', '..', 'skill', 'SKILL.md');
        content = fs.readFileSync(packageSkill, 'utf-8');
      }

      fs.writeFileSync(skillDest, content, 'utf-8');
      console.log(chalk.green('\n  AACA skill installed successfully!\n'));
      console.log(`  Location: ${skillDest}`);
      console.log(`  Usage: Type /aaca in Claude Code\n`);
    } catch (err) {
      console.error(chalk.red(`\n  Error: ${(err as Error).message}\n`));
      process.exit(1);
    }
  });

program.parse();
