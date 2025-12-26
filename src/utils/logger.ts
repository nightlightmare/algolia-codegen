import chalk from 'chalk';
import ora, { type Ora } from 'ora';

export interface LoggerOptions {
  verbose?: boolean;
  dryRun?: boolean;
}

class Logger {
  private _verbose: boolean;
  private _dryRun: boolean;

  constructor(options: LoggerOptions = {}) {
    this._verbose = options.verbose ?? false;
    this._dryRun = options.dryRun ?? false;
  }

  /**
   * Check if verbose mode is enabled
   */
  get isVerbose(): boolean {
    return this._verbose;
  }

  /**
   * Check if dry-run mode is enabled
   */
  get isDryRun(): boolean {
    return this._dryRun;
  }

  /**
   * Log info message (always shown)
   */
  info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }

  /**
   * Log success message (always shown)
   */
  success(message: string): void {
    console.log(chalk.green('✓'), message);
  }

  /**
   * Log warning message (always shown)
   */
  warn(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  }

  /**
   * Log error message (always shown)
   */
  error(message: string): void {
    console.error(chalk.red('✗'), message);
  }

  /**
   * Log verbose message (only shown in verbose mode)
   */
  verbose(message: string): void {
    if (this._verbose) {
      console.log(chalk.gray('→'), message);
    }
  }

  /**
   * Log dry-run message (only shown in dry-run mode)
   */
  dryRun(message: string): void {
    if (this._dryRun) {
      console.log(chalk.cyan('[DRY-RUN]'), message);
    }
  }

  /**
   * Create a spinner for long-running operations
   */
  spinner(text: string): Ora {
    return ora({
      text,
      color: 'cyan',
      spinner: 'dots',
    });
  }

  /**
   * Log file operation (respects dry-run)
   */
  fileOperation(action: string, filePath: string): void {
    if (this._dryRun) {
      this.dryRun(`Would ${action}: ${chalk.underline(filePath)}`);
    } else {
      this.verbose(`${action}: ${filePath}`);
    }
  }

  /**
   * Format error with context
   */
  formatError(error: unknown, context?: string): string {
    let errorMessage = '';

    if (error instanceof Error) {
      errorMessage = error.message;
      if (this._verbose && error.stack) {
        errorMessage += `\n${chalk.gray(error.stack)}`;
      }
    } else if (error && typeof error === 'object') {
      const errorObj = error as Record<string, unknown>;
      if (errorObj.message) {
        errorMessage = String(errorObj.message);
      } else if (errorObj.status) {
        errorMessage = `HTTP ${errorObj.status}: ${errorObj.statusText || 'Unknown error'}`;
      } else {
        try {
          errorMessage = JSON.stringify(error, null, 2);
        } catch {
          errorMessage = String(error);
        }
      }
    } else {
      errorMessage = String(error);
    }

    if (context) {
      return `${chalk.red(context)}\n${errorMessage}`;
    }

    return errorMessage;
  }
}

export default Logger;
