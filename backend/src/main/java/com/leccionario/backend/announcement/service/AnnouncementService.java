package com.leccionario.backend.announcement.service;

import com.leccionario.backend.academic.domain.Course;
import com.leccionario.backend.academic.repository.CourseRepository;
import com.leccionario.backend.announcement.domain.Announcement;
import com.leccionario.backend.announcement.domain.AnnouncementPriority;
import com.leccionario.backend.announcement.domain.AnnouncementRecipient;
import com.leccionario.backend.announcement.domain.AnnouncementSchedule;
import com.leccionario.backend.announcement.domain.AnnouncementType;
import com.leccionario.backend.announcement.dto.AnnouncementRequest;
import com.leccionario.backend.announcement.dto.AnnouncementResponse;
import com.leccionario.backend.announcement.dto.AnnouncementScheduleItem;
import com.leccionario.backend.announcement.repository.AnnouncementRecipientRepository;
import com.leccionario.backend.announcement.repository.AnnouncementRepository;
import com.leccionario.backend.announcement.repository.AnnouncementScheduleRepository;
import com.leccionario.backend.audit.service.AuditService;
import com.leccionario.backend.common.exception.BusinessException;
import com.leccionario.backend.schedule.domain.ScheduleBlock;
import com.leccionario.backend.schedule.repository.ScheduleBlockRepository;
import com.leccionario.backend.user.domain.User;
import com.leccionario.backend.user.repository.StudentRepository;
import com.leccionario.backend.user.repository.TeacherRepository;
import com.leccionario.backend.user.repository.UserRepository;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final AnnouncementRecipientRepository recipientRepository;
    private final AnnouncementScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final ScheduleBlockRepository scheduleBlockRepository;
    private final AuditService auditService;

    @Transactional
    public AnnouncementResponse createAnnouncement(AnnouncementRequest request, String username) {
        User creator = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Usuario no encontrado."));

        Announcement announcement = new Announcement();
        announcement.setTitle(request.title().trim());
        announcement.setDescription(request.description().trim());
        announcement.setAnnouncementType(AnnouncementType.valueOf(request.type()));
        announcement.setPriority(AnnouncementPriority.valueOf(
                request.priority() != null ? request.priority() : "NORMAL"));
        announcement.setEventDate(request.eventDate());
        announcement.setEventEndDate(request.eventEndDate());
        announcement.setCreatedBy(creator);

        if (request.courseId() != null) {
            Course course = courseRepository.findById(request.courseId())
                    .orElseThrow(() -> new BusinessException("El curso seleccionado no existe."));
            announcement.setCourse(course);
        }

        Announcement saved = announcementRepository.save(announcement);

        if (request.schedules() != null && !request.schedules().isEmpty()) {
            saveScheduleBlocks(saved, request.schedules());
        }

        createRecipients(saved, request.courseId());
        auditService.log(username, "CREATE_ANNOUNCEMENT", "ANNOUNCEMENT", saved.getTitle());
        return toResponse(saved, creator.getId());
    }

    @Transactional
    public AnnouncementResponse updateAnnouncement(Long id, AnnouncementRequest request, String username) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new BusinessException("El anuncio seleccionado no existe."));

        announcement.setTitle(request.title().trim());
        announcement.setDescription(request.description().trim());
        announcement.setAnnouncementType(AnnouncementType.valueOf(request.type()));
        announcement.setPriority(AnnouncementPriority.valueOf(
                request.priority() != null ? request.priority() : "NORMAL"));
        announcement.setEventDate(request.eventDate());
        announcement.setEventEndDate(request.eventEndDate());

        if (request.courseId() != null) {
            Course course = courseRepository.findById(request.courseId())
                    .orElseThrow(() -> new BusinessException("El curso seleccionado no existe."));
            announcement.setCourse(course);
        } else {
            announcement.setCourse(null);
        }

        announcement.getSchedules().clear();

        Announcement saved = announcementRepository.save(announcement);

        if (request.schedules() != null && !request.schedules().isEmpty()) {
            saveScheduleBlocks(saved, request.schedules());
        }

        auditService.log(username, "UPDATE_ANNOUNCEMENT", "ANNOUNCEMENT", saved.getTitle());
        return toResponse(saved, null);
    }

    @Transactional
    public void deleteAnnouncement(Long id, String username) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new BusinessException("El anuncio seleccionado no existe."));
        recipientRepository.deleteByAnnouncementId(id);
        scheduleRepository.deleteByAnnouncementId(id);
        announcementRepository.deleteByIdDirect(id);
        auditService.log(username, "DELETE_ANNOUNCEMENT", "ANNOUNCEMENT", announcement.getTitle());
    }

    @Transactional(readOnly = true)
    public List<AnnouncementResponse> listAll() {
        return announcementRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(a -> toResponse(a, null))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AnnouncementResponse> listMyAnnouncements(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Usuario no encontrado."));

        List<Announcement> announcements;
        var teacherOpt = teacherRepository.findByUserId(user.getId());
        var studentOpt = studentRepository.findByUserId(user.getId());

        if (teacherOpt.isPresent()) {
            announcements = announcementRepository.findForTeacher(teacherOpt.get().getId());
        } else if (studentOpt.isPresent()) {
            announcements = announcementRepository.findForStudent(studentOpt.get().getId());
        } else {
            announcements = announcementRepository.findAllByOrderByCreatedAtDesc();
        }

        return announcements.stream()
                .map(a -> toResponse(a, user.getId()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AnnouncementResponse> listCalendar(int month, int year) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.plusMonths(1).minusDays(1);
        return announcementRepository.findByEventDateBetween(start, end).stream()
                .map(a -> toResponse(a, null))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ScheduleBlock> listScheduleBlocks() {
        return scheduleBlockRepository.findAll().stream()
                .filter(ScheduleBlock::isActive)
                .filter(b -> b.getBlockType() == com.leccionario.backend.schedule.domain.ScheduleBlockType.CLASS)
                .sorted(Comparator.comparingInt(ScheduleBlock::getBlockOrder))
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Usuario no encontrado."));
        return recipientRepository.countByUserIdAndReadFalse(user.getId());
    }

    @Transactional
    public void markAsRead(Long announcementId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Usuario no encontrado."));
        AnnouncementRecipient recipient = recipientRepository
                .findByAnnouncementIdAndUserId(announcementId, user.getId())
                .orElse(null);
        if (recipient != null && !recipient.isRead()) {
            recipient.setRead(true);
            recipient.setReadAt(OffsetDateTime.now());
            recipientRepository.save(recipient);
        }
    }

    private void saveScheduleBlocks(Announcement announcement, List<AnnouncementRequest.ScheduleBlockRef> refs) {
        for (AnnouncementRequest.ScheduleBlockRef ref : refs) {
            ScheduleBlock block = scheduleBlockRepository.findById(ref.scheduleBlockId())
                    .orElseThrow(() -> new BusinessException(
                            "El bloque de horario con id " + ref.scheduleBlockId() + " no existe."));
            AnnouncementSchedule as = new AnnouncementSchedule();
            as.setAnnouncement(announcement);
            as.setWeekday(ref.weekday());
            as.setScheduleBlock(block);
            announcement.getSchedules().add(as);
        }
    }

    private void createRecipients(Announcement announcement, Long courseId) {
        List<User> targets;
        if (courseId != null) {
            targets = new ArrayList<>();
            studentRepository.findByCourseIdOrderByEnrollmentNumberAsc(courseId)
                    .forEach(s -> targets.add(s.getUser()));
        } else {
            targets = userRepository.findAll();
        }

        for (User target : targets) {
            AnnouncementRecipient recipient = new AnnouncementRecipient();
            recipient.setAnnouncement(announcement);
            recipient.setUser(target);
            recipientRepository.save(recipient);
        }
    }

    private AnnouncementResponse toResponse(Announcement a, Long currentUserId) {
        boolean isRead = false;
        if (currentUserId != null) {
            var recipient = recipientRepository.findByAnnouncementIdAndUserId(a.getId(), currentUserId);
            isRead = recipient.map(AnnouncementRecipient::isRead).orElse(false);
        }

        String courseName = a.getCourse() != null
                ? a.getCourse().getName() + " " + a.getCourse().getParallel()
                : null;

        long recipientCount = a.getCourse() != null
                ? studentRepository.countByCourseId(a.getCourse().getId())
                : userRepository.count();

        List<AnnouncementScheduleItem> scheduleItems = scheduleRepository
                .findByAnnouncementIdOrderByWeekdayAscScheduleBlock_BlockOrderAsc(a.getId())
                .stream()
                .map(as -> new AnnouncementScheduleItem(
                        as.getScheduleBlock().getId(),
                        as.getScheduleBlock().getLabel(),
                        as.getScheduleBlock().getStartTime().toString(),
                        as.getScheduleBlock().getEndTime().toString(),
                        as.getWeekday(),
                        AnnouncementScheduleItem.weekdayLabel(as.getWeekday())
                ))
                .toList();

        return new AnnouncementResponse(
                a.getId(),
                a.getTitle(),
                a.getDescription(),
                a.getAnnouncementType().name(),
                a.getPriority().name(),
                a.getEventDate(),
                a.getEventEndDate(),
                a.getCourse() != null ? a.getCourse().getId() : null,
                courseName,
                a.getCreatedBy().getFirstName() + " " + a.getCreatedBy().getLastName(),
                a.getCreatedAt(),
                (int) recipientCount,
                isRead,
                scheduleItems
        );
    }
}
