export type AcademicOverview = {
  courses: AcademicCourse[];
  subjects: Array<{ id: number; name: string; code: string; curriculumArea: string }>;
  periods: Array<{ id: number; name: string; startDate: string; endDate: string; active: boolean }>;
  students: AcademicStudent[];
  teachers: AcademicTeacher[];
};

export type AcademicCourse = {
  id: number;
  name: string;
  parallel: string;
  level: string;
  section: string | null;
  subLevel: string | null;
  grade: number | null;
  weekStudentId: number | null;
  weekStudentName: string | null;
};

export type AcademicStudent = {
  id: number;
  userId: number;
  username: string;
  identification: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  enabled: boolean;
  courseId: number;
  courseName: string;
  enrollmentNumber: string;
  birthDate: string | null;
  gender: string | null;
};

export type AcademicTeacher = {
  id: number;
  userId: number;
  username: string;
  email: string;
  identification: string;
  firstName: string;
  lastName: string;
  fullName: string;
  specialization: string;
  enabled: boolean;
  weeklyBlocks: number;
  subjects: string[];
  courses: string[];
};

export type ScheduleOverview = {
  blocks: ScheduleBlockItem[];
  schedules: CourseScheduleItem[];
  courses: Array<{ id: number; name: string; parallel: string; level: string; section: string | null; subLevel: string | null; grade: number | null }>;
  periods: Array<{ id: number; name: string; startDate: string; endDate: string; active: boolean }>;
  subjects: Array<{ id: number; name: string; code: string; curriculumArea: string }>;
  teachers: Array<{ id: number; name: string; specialization: string; subjectIds: number[] }>;
};

export type ScheduleBlockItem = {
  id: number;
  label: string;
  startTime: string;
  endTime: string;
  blockOrder: number;
  blockType: 'CLASS' | 'RECESS';
  active: boolean;
};

export type CourseScheduleItem = {
  id: number;
  courseId: number;
  courseName: string;
  periodId: number;
  periodName: string;
  scheduleBlockId: number;
  scheduleLabel: string;
  subjectId: number;
  subjectName: string;
  teacherId: number;
  teacherName: string;
  weekday: number;
  startTime: string;
  endTime: string;
  classroom: string | null;
};

export type WeekStudentAssignment = {
  id: number;
  courseId: number;
  studentId: number;
  studentName: string;
  enrollmentNumber: string;
  startDate: string;
  endDate: string | null;
};

export type ImportSummaryResult = {
  module: string;
  total: number;
  imported: number;
  failed: number;
  message: string;
  errors: string[];
};
