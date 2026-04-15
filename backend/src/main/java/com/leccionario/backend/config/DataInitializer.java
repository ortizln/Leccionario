package com.leccionario.backend.config;

import com.leccionario.backend.academic.domain.AcademicPeriod;
import com.leccionario.backend.academic.domain.Course;
import com.leccionario.backend.academic.domain.Subject;
import com.leccionario.backend.academic.repository.AcademicPeriodRepository;
import com.leccionario.backend.academic.repository.CourseRepository;
import com.leccionario.backend.academic.repository.SubjectRepository;
import com.leccionario.backend.demerit.domain.Demerit;
import com.leccionario.backend.demerit.repository.DemeritRepository;
import com.leccionario.backend.institution.domain.Institution;
import com.leccionario.backend.institution.repository.InstitutionRepository;
import com.leccionario.backend.schedule.domain.CourseSchedule;
import com.leccionario.backend.schedule.domain.ScheduleBlock;
import com.leccionario.backend.schedule.domain.ScheduleBlockType;
import com.leccionario.backend.schedule.repository.CourseScheduleRepository;
import com.leccionario.backend.schedule.repository.ScheduleBlockRepository;
import com.leccionario.backend.user.domain.Role;
import com.leccionario.backend.user.domain.RoleDefaults;
import com.leccionario.backend.user.domain.Student;
import com.leccionario.backend.user.domain.Teacher;
import com.leccionario.backend.user.domain.User;
import com.leccionario.backend.user.repository.RoleRepository;
import com.leccionario.backend.user.repository.StudentRepository;
import com.leccionario.backend.user.repository.TeacherRepository;
import com.leccionario.backend.user.repository.UserRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final InstitutionRepository institutionRepository;
    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final AcademicPeriodRepository academicPeriodRepository;
    private final CourseRepository courseRepository;
    private final SubjectRepository subjectRepository;
    private final DemeritRepository demeritRepository;
    private final ScheduleBlockRepository scheduleBlockRepository;
    private final CourseScheduleRepository courseScheduleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        for (String roleName : RoleDefaults.defaultRoles()) {
            roleRepository.findByName(roleName).orElseGet(() -> {
                Role role = new Role();
                role.setName(roleName);
                role.setDescription(RoleDefaults.description(roleName));
                role.setPermissions(RoleDefaults.permissions(roleName));
                return roleRepository.save(role);
            });
        }

        roleRepository.findAll().forEach(role -> {
            role.setDescription(RoleDefaults.description(role.getName()));
            role.setPermissions(RoleDefaults.permissions(role.getName()));
            roleRepository.save(role);
        });

        Institution institution = institutionRepository.findAll().stream().findFirst().orElseGet(() -> {
            Institution newInstitution = new Institution();
            newInstitution.setName("Unidad Educativa Fiscal Demo");
            newInstitution.setCode("1799999999001");
            newInstitution.setDistrict("Distrito 17D01");
            newInstitution.setCircuit("Circuito C01");
            newInstitution.setAddress("Quito, Ecuador");
            return institutionRepository.save(newInstitution);
        });

        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@leccionario.local");
            admin.setPassword(passwordEncoder.encode("Admin123*"));
            admin.setIdentification("0102030405");
            admin.setFirstName("Administrador");
            admin.setLastName("Sistema");
            admin.setInstitution(institution);
            admin.setRoles(Set.of(roleRepository.findByName(RoleDefaults.ADMINISTRADOR).orElseThrow()));
            userRepository.save(admin);
        }

        User teacherUser = userRepository.findByUsername("docente.demo").orElseGet(() -> {
            User teacher = new User();
            teacher.setUsername("docente.demo");
            teacher.setEmail("docente.demo@leccionario.local");
            teacher.setPassword(passwordEncoder.encode("Docente123*"));
            teacher.setIdentification("1102030405");
            teacher.setFirstName("Docente");
            teacher.setLastName("Demo");
            teacher.setInstitution(institution);
            teacher.setRoles(Set.of(roleRepository.findByName(RoleDefaults.DOCENTE).orElseThrow()));
            return userRepository.save(teacher);
        });

        if (teacherRepository.findAll().stream().noneMatch(teacher -> teacher.getUser().getId().equals(teacherUser.getId()))) {
            Teacher teacher = new Teacher();
            teacher.setUser(teacherUser);
            teacher.setSpecialization("Matemática");
            teacherRepository.save(teacher);
        }

        if (academicPeriodRepository.findAll().isEmpty()) {
            AcademicPeriod period = new AcademicPeriod();
            period.setName("Periodo Lectivo 2026");
            period.setStartDate(LocalDate.of(2026, 4, 1));
            period.setEndDate(LocalDate.of(2027, 1, 31));
            period.setActive(true);
            academicPeriodRepository.save(period);
        }

        if (courseRepository.findAll().isEmpty()) {
            Course first = new Course();
            first.setName("Primero BGU");
            first.setParallel("A");
            first.setLevel("Bachillerato");
            courseRepository.save(first);

            Course second = new Course();
            second.setName("Segundo BGU");
            second.setParallel("B");
            second.setLevel("Bachillerato");
            courseRepository.save(second);

            Course third = new Course();
            third.setName("Octavo EGB");
            third.setParallel("C");
            third.setLevel("Basica Superior");
            courseRepository.save(third);
        }

        if (subjectRepository.findAll().isEmpty()) {
            Subject mathematics = new Subject();
            mathematics.setName("Matematica");
            mathematics.setCode("MAT-01");
            mathematics.setCurriculumArea("Ciencias Exactas");
            subjectRepository.save(mathematics);

            Subject language = new Subject();
            language.setName("Lengua y Literatura");
            language.setCode("LEN-01");
            language.setCurriculumArea("Comunicacion");
            subjectRepository.save(language);

            Subject science = new Subject();
            science.setName("Ciencias Naturales");
            science.setCode("CNA-01");
            science.setCurriculumArea("Ciencias");
            subjectRepository.save(science);
        }

        seedStudents(institution);
        seedScheduleData();
        seedDemerits();
    }

    private void seedStudents(Institution institution) {
        Course course = courseRepository.findAll().stream().findFirst().orElse(null);
        if (course == null || studentRepository.count() > 0) {
            return;
        }

        createStudent(institution, course, "cadete.001", "Cadete", "Uno", "1001");
        createStudent(institution, course, "cadete.002", "Cadete", "Dos", "1002");
        createStudent(institution, course, "cadete.003", "Cadete", "Tres", "1003");
        createStudent(institution, course, "cadete.004", "Cadete", "Cuatro", "1004");
    }

    private void createStudent(Institution institution, Course course, String username, String firstName, String lastName, String enrollmentNumber) {
        User user = userRepository.findByUsername(username).orElseGet(() -> {
            User created = new User();
            created.setUsername(username);
            created.setEmail(username + "@leccionario.local");
            created.setPassword(passwordEncoder.encode("Cadete123*"));
            created.setIdentification("ID-" + enrollmentNumber);
            created.setFirstName(firstName);
            created.setLastName(lastName);
            created.setInstitution(institution);
            created.setRoles(Set.of(roleRepository.findByName(RoleDefaults.ESTUDIANTE).orElseThrow()));
            return userRepository.save(created);
        });

        boolean exists = studentRepository.findByCourseIdOrderByEnrollmentNumberAsc(course.getId()).stream()
                .anyMatch(student -> student.getUser().getId().equals(user.getId()));
        if (exists) {
            return;
        }

        Student student = new Student();
        student.setUser(user);
        student.setCourse(course);
        student.setEnrollmentNumber(enrollmentNumber);
        studentRepository.save(student);
    }

    private void seedScheduleData() {
        seedBlock("07H00-07H40", LocalTime.of(7, 0), LocalTime.of(7, 40), 1, ScheduleBlockType.CLASS);
        seedBlock("07H40-08H20", LocalTime.of(7, 40), LocalTime.of(8, 20), 2, ScheduleBlockType.CLASS);
        seedBlock("08H20-09H00", LocalTime.of(8, 20), LocalTime.of(9, 0), 3, ScheduleBlockType.CLASS);
        seedBlock("09H00-09H40", LocalTime.of(9, 0), LocalTime.of(9, 40), 4, ScheduleBlockType.CLASS);
        seedBlock("09H40-10H10", LocalTime.of(9, 40), LocalTime.of(10, 10), 5, ScheduleBlockType.RECESS);
        seedBlock("10H10-10H50", LocalTime.of(10, 10), LocalTime.of(10, 50), 6, ScheduleBlockType.CLASS);
        seedBlock("10H50-11H30", LocalTime.of(10, 50), LocalTime.of(11, 30), 7, ScheduleBlockType.CLASS);
        seedBlock("11H30-11H50", LocalTime.of(11, 30), LocalTime.of(11, 50), 8, ScheduleBlockType.RECESS);
        seedBlock("11H50-12H30", LocalTime.of(11, 50), LocalTime.of(12, 30), 9, ScheduleBlockType.CLASS);
        seedBlock("12H30-13H10", LocalTime.of(12, 30), LocalTime.of(13, 10), 10, ScheduleBlockType.CLASS);

        Course course = courseRepository.findAll().stream().findFirst().orElse(null);
        AcademicPeriod period = academicPeriodRepository.findAll().stream().findFirst().orElse(null);
        Teacher teacher = teacherRepository.findAll().stream().findFirst().orElse(null);
        Subject math = subjectRepository.findAll().stream().filter(subject -> "MAT-01".equals(subject.getCode())).findFirst().orElse(null);
        Subject language = subjectRepository.findAll().stream().filter(subject -> "LEN-01".equals(subject.getCode())).findFirst().orElse(null);
        Subject science = subjectRepository.findAll().stream().filter(subject -> "CNA-01".equals(subject.getCode())).findFirst().orElse(null);

        if (course == null || period == null || teacher == null || math == null || language == null || science == null) {
            return;
        }

        for (short weekday = 1; weekday <= 5; weekday++) {
            assignSchedule(course, period, teacher, math, "07H00-07H40", weekday, "Aula 1");
            assignSchedule(course, period, teacher, language, "07H40-08H20", weekday, "Aula 1");
            assignSchedule(course, period, teacher, science, "08H20-09H00", weekday, "Laboratorio");
            assignSchedule(course, period, teacher, math, "09H00-09H40", weekday, "Aula 1");
            assignSchedule(course, period, teacher, language, "10H10-10H50", weekday, "Aula 1");
            assignSchedule(course, period, teacher, science, "10H50-11H30", weekday, "Laboratorio");
            assignSchedule(course, period, teacher, math, "11H50-12H30", weekday, "Aula 1");
            assignSchedule(course, period, teacher, language, "12H30-13H10", weekday, "Aula 1");
        }
    }

    private void seedBlock(String label, LocalTime start, LocalTime end, int order, ScheduleBlockType type) {
        scheduleBlockRepository.findByLabel(label).orElseGet(() -> {
            ScheduleBlock block = new ScheduleBlock();
            block.setLabel(label);
            block.setStartTime(start);
            block.setEndTime(end);
            block.setBlockOrder(order);
            block.setBlockType(type);
            block.setActive(true);
            return scheduleBlockRepository.save(block);
        });
    }

    private void assignSchedule(
            Course course,
            AcademicPeriod period,
            Teacher teacher,
            Subject subject,
            String blockLabel,
            short weekday,
            String classroom) {
        ScheduleBlock block = scheduleBlockRepository.findByLabel(blockLabel).orElse(null);
        if (block == null) {
            return;
        }

        boolean exists = courseScheduleRepository.findByCourseIdAndPeriodIdOrderByWeekdayAscScheduleBlock_BlockOrderAsc(course.getId(), period.getId()).stream()
                .anyMatch(existing -> existing.getTeacher().getId().equals(teacher.getId())
                        && existing.getSubject().getId().equals(subject.getId())
                        && existing.getScheduleBlock().getId().equals(block.getId())
                        && existing.getWeekday() == weekday);
        if (exists) {
            return;
        }

        CourseSchedule schedule = new CourseSchedule();
        schedule.setCourse(course);
        schedule.setPeriod(period);
        schedule.setTeacher(teacher);
        schedule.setSubject(subject);
        schedule.setScheduleBlock(block);
        schedule.setWeekday(weekday);
        schedule.setClassroom(classroom);
        courseScheduleRepository.save(schedule);
    }

    private void seedDemerits() {
        seedDemerit("A", "Disciplina y convivencia", "Usar lenguaje ofensivo o irrespetuoso dentro del aula.", (short) 2);
        seedDemerit("B", "Puntualidad y asistencia", "Salir de clase sin autorización del docente.", (short) 5);
        seedDemerit("C", "Presentación personal", "Presentarse con accesorios no autorizados por la institución.", (short) 2);
        seedDemerit("D", "Cuidado de bienes", "Rayar o deteriorar pupitres, paredes o mobiliario escolar.", (short) 10);
        seedDemerit("E", "Uso de tecnología", "Utilizar el celular durante la clase sin autorización.", (short) 5);
    }

    private void seedDemerit(String code, String category, String description, short score) {
        demeritRepository.findByCodeIgnoreCase(code).orElseGet(() -> {
            Demerit demerit = new Demerit();
            demerit.setCode(code);
            demerit.setCategory(category);
            demerit.setDescription(description);
            demerit.setScore(score);
            demerit.setActive(true);
            return demeritRepository.save(demerit);
        });
    }
}
