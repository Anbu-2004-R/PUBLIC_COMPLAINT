package com.civicconnect.notification;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        return ResponseEntity.ok(notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId));
    }

    @PatchMapping("/{id}/read")
    @Transactional
    public ResponseEntity<Void> markAsRead(@PathVariable String id, Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        notificationRepository.findById(id).ifPresent(n -> {
            if (n.getRecipientId().equals(userId)) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/read-all")
    @Transactional
    public ResponseEntity<Map<String, String>> markAllAsRead(Authentication authentication) {
        String userId = (String) authentication.getPrincipal();
        List<Notification> userNotifs = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
        for (Notification n : userNotifs) {
            n.setRead(true);
        }
        notificationRepository.saveAll(userNotifs);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
}
