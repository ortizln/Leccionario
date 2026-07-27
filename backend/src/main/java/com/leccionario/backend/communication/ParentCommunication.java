package com.leccionario.backend.communication;

import com.leccionario.backend.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "parent_communications")
public class ParentCommunication extends BaseEntity {

    @Column(name = "institution_id", nullable = false)
    private Long institutionId;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "representative_id")
    private Long representativeId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "communication_type", nullable = false, length = 30)
    private String communicationType;

    @Column(nullable = false, length = 200)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false, length = 20)
    private String channel = "IN_APP";

    @Column(nullable = false, length = 15)
    private String status = "ENVIADO";

    @Column(columnDefinition = "TEXT")
    private String response;

    @Column(name = "responded_at")
    private Instant respondedAt;

    public Long getInstitutionId() { return institutionId; }
    public void setInstitutionId(Long institutionId) { this.institutionId = institutionId; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public Long getRepresentativeId() { return representativeId; }
    public void setRepresentativeId(Long representativeId) { this.representativeId = representativeId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getCommunicationType() { return communicationType; }
    public void setCommunicationType(String communicationType) { this.communicationType = communicationType; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }
    public Instant getRespondedAt() { return respondedAt; }
    public void setRespondedAt(Instant respondedAt) { this.respondedAt = respondedAt; }
}
