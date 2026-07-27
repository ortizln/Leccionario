package com.leccionario.backend.communication;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommunicationGroupMemberRepository extends JpaRepository<CommunicationGroupMember, Long> {
    List<CommunicationGroupMember> findByGroupId(Long groupId);
    List<CommunicationGroupMember> findByUserId(Long userId);
}
