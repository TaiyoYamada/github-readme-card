/**
 * Domain types for the stats card. The `github` layer produces these,
 * the `card` layer consumes them. Nothing in here knows about SVG or
 * the GitHub API shape.
 */

export interface LanguageStat {
  readonly name: string;
  readonly bytes: number;
  /** GitHub's canonical language color, e.g. "#3178c6". `null` for languages without one. */
  readonly color: string | null;
}

export interface Stats {
  readonly username: string;
  readonly totalCommits: number;
  readonly totalPRs: number;
  readonly totalIssues: number;
  readonly totalStars: number;
  /** Top languages, descending by bytes. Trimmed to a manageable count by the aggregator. */
  readonly languages: ReadonlyArray<LanguageStat>;
}
