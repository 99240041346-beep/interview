import { ENGINEERING_PROGRAMS, ENGINEERING_PROGRAM_MAP } from './engineering-catalog';

export type CourseModule = { id: string; title: string; lesson: string; practical: string; keywords: string[] };
export type DepartmentCourse = { department: string; title: string; description: string; modules: CourseModule[] };

export const COURSES: DepartmentCourse[] = ENGINEERING_PROGRAMS.map(program => ({
  department: program.code,
  title: program.title,
  description: `${program.family} learning path with ${program.tracks.length} specialization track(s), practical coding, quizzes, projects and AI assistance.`,
  modules: program.tracks.flatMap(t => t.modules.map(m => ({
    id: m.id,
    title: `${t.title} — ${m.title}`,
    lesson: m.lesson,
    practical: m.practical,
    keywords: m.title.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).slice(0, 6),
  }))),
})) ;

export { ENGINEERING_PROGRAMS, ENGINEERING_PROGRAM_MAP };

export function getCourse(department: string) {
  return COURSES.find(c => c.department === department) || COURSES[0];
}
