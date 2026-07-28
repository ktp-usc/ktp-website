import { readdirSync } from 'node:fs';
import path from 'node:path';

type LocalResume = {
  absolutePath: string;
  filename: string;
  extension: string;
  tokens: string[];
  compact: string;
};

type ResumeStudent = {
  firstName: string;
  lastName: string;
};

const LOCAL_RESUME_ROOT = path.join(process.cwd(), 'app/api/employers/resumes');
const SUPPORTED_EXTENSIONS = new Set(['.pdf', '.docx']);
const IGNORED_TOKENS = new Set([
  'resume',
  'resumes',
  'official',
  'updated',
  'update',
  'fall',
  'spr',
  'spring',
  'summer',
  'software',
  'engineer',
  'engineering',
  'intern',
  'technical',
  'tech',
  'ml',
  'u',
  't',
  's',
]);

let cachedLocalResumes: LocalResume[] | null = null;

function splitCamelCase(value: string) {
  return value.replace(/([a-z])([A-Z])/g, '$1 $2');
}

function tokenize(value: string) {
  const parsed = path.parse(value);

  return splitCamelCase(value)
    .replace(parsed.ext, '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[']/g, '')
    .replace(/[^a-zA-Z]+/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token && !IGNORED_TOKENS.has(token) && !/^\d+$/.test(token));
}

function localResumeFromPath(absolutePath: string): LocalResume {
  const filename = path.basename(absolutePath);
  const extension = path.extname(filename).toLowerCase();
  const tokens = tokenize(filename);

  return {
    absolutePath,
    filename,
    extension,
    tokens,
    compact: tokens.join(''),
  };
}

function findResumeFiles(directory: string): string[] {
  const entries = (() => {
    try {
      return readdirSync(directory, { withFileTypes: true });
    } catch {
      return null;
    }
  })();

  if (!entries) return [];

  return entries.flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    const extension = path.extname(entry.name).toLowerCase();

    if (entry.isDirectory()) return findResumeFiles(entryPath);
    if (entry.isFile() && SUPPORTED_EXTENSIONS.has(extension)) return [entryPath];

    return [];
  });
}

export function listLocalResumes() {
  if (!cachedLocalResumes) {
    cachedLocalResumes = findResumeFiles(LOCAL_RESUME_ROOT)
      .map(localResumeFromPath)
      .sort((a, b) => a.filename.localeCompare(b.filename));
  }

  return cachedLocalResumes;
}

function scoreResumeMatch(student: ResumeStudent, resume: LocalResume) {
  const nameTokens = tokenize(`${student.firstName} ${student.lastName}`);
  const [firstName, lastName] = nameTokens;

  if (!firstName || !lastName) return 0;

  const fullName = nameTokens.join(' ');
  const fullNameCompact = nameTokens.join('');
  const initialLastCompact = `${firstName[0]}${lastName}`;
  const resumeName = resume.tokens.join(' ');

  if (resumeName.includes(fullName)) return 100;
  if (resume.compact.includes(fullNameCompact)) return 90;
  if (resume.tokens.includes(firstName) && resume.tokens.includes(lastName)) return 80;
  if (resume.compact.includes(initialLastCompact)) return 60;

  return 0;
}

export function findLocalResumeForStudent(student: ResumeStudent) {
  const matches = listLocalResumes()
    .map((resume) => ({
      resume,
      score: scoreResumeMatch(student, resume),
    }))
    .filter((match) => match.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.resume.filename.length - b.resume.filename.length;
    });

  return matches[0]?.resume ?? null;
}
