export type CourseModule = { id: string; title: string; lesson: string; practical: string; keywords: string[] };
export type DepartmentCourse = { department: string; title: string; description: string; modules: CourseModule[] };

const common = (department: string, titles: string[]): CourseModule[] =>
  titles.map((title, i) => ({
    id: `${department.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i + 1}`,
    title,
    lesson: `Learn the core concepts of ${title}, study examples, write your own code, and explain the idea in an interview.`,
    practical: `Write a practical program demonstrating ${title}. Include clear input handling, meaningful variable names, and a short explanation of your approach.`,
    keywords: title.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).slice(0, 4),
  }));

export const COURSES: DepartmentCourse[] = [
  { department: 'CSE', title: 'Computer Science & Engineering', description: 'Programming, DSA, databases, web development and software engineering.', modules: common('cse', ['Programming Fundamentals', 'Data Structures & Algorithms', 'DBMS & SQL', 'Operating Systems', 'Web & Software Engineering']) },
  { department: 'AIML', title: 'Artificial Intelligence & Machine Learning', description: 'Python, data preparation, machine learning, deep learning and AI applications.', modules: common('aiml', ['Python for AI', 'Data Preparation & Visualization', 'Machine Learning', 'Deep Learning', 'AI Applications & Deployment']) },
  { department: 'AI&DS', title: 'Artificial Intelligence & Data Science', description: 'Statistics, Python, analytics, machine learning and data-driven problem solving.', modules: common('aids', ['Python & Statistics', 'Data Analytics', 'SQL for Data Science', 'Machine Learning', 'Data Science Projects']) },
  { department: 'ECE', title: 'Electronics & Communication Engineering', description: 'Digital systems, microcontrollers, communication and embedded programming.', modules: common('ece', ['C Programming for Embedded Systems', 'Digital Electronics', 'Microcontrollers', 'Communication Systems', 'IoT & Embedded Projects']) },
  { department: 'EEE', title: 'Electrical & Electronics Engineering', description: 'Electrical fundamentals, machines, power electronics, control and automation.', modules: common('eee', ['Electrical Fundamentals', 'Electrical Machines', 'Power Electronics', 'Control Systems', 'Automation & PLC']) },
  { department: 'MECH', title: 'Mechanical Engineering', description: 'Engineering mechanics, CAD, manufacturing, thermal systems and automation.', modules: common('mech', ['Engineering Mechanics', 'CAD & Design', 'Manufacturing Processes', 'Thermal Engineering', 'Industrial Automation']) },
  { department: 'CIVIL', title: 'Civil Engineering', description: 'Structures, surveying, construction, materials and sustainable engineering.', modules: common('civil', ['Engineering Materials', 'Surveying', 'Structural Fundamentals', 'Construction Management', 'Sustainable Civil Engineering']) },
  { department: 'IT', title: 'Information Technology', description: 'Programming, networking, cloud, databases and modern IT operations.', modules: common('it', ['Programming & Problem Solving', 'Networking', 'Database Systems', 'Cloud Computing', 'DevOps & IT Operations']) },
  { department: 'CYS', title: 'Cyber Security', description: 'Security fundamentals, networks, ethical security and secure programming.', modules: common('cys', ['Cyber Security Fundamentals', 'Network Security', 'Secure Programming', 'Ethical Security', 'Security Operations']) },
  { department: 'EIE', title: 'Electronics & Instrumentation Engineering', description: 'Sensors, measurements, control, industrial instrumentation and automation.', modules: common('eie', ['Sensors & Measurements', 'Instrumentation Systems', 'Control Engineering', 'Industrial Automation', 'Instrumentation Projects']) },
];

export function getCourse(department: string) {
  return COURSES.find((c) => c.department === department) || COURSES[0];
}
