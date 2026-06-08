package com.company.complaints.feedback;

import com.company.complaints.dto.request.SubmitFeedbackRequest;
import com.company.complaints.dto.response.ComplaintFeedbackResponse;
import com.company.complaints.entity.Complaint;
import com.company.complaints.entity.ComplaintFeedback;
import com.company.complaints.entity.User;
import com.company.complaints.enums.ComplaintStatus;
import com.company.complaints.enums.Role;
import com.company.complaints.exception.CustomExceptions.ComplaintStateException;
import com.company.complaints.repository.ComplaintAttachmentRepository;
import com.company.complaints.repository.ComplaintFeedbackRepository;
import com.company.complaints.repository.ComplaintRepository;
import com.company.complaints.repository.ComplaintValidationRepository;
import com.company.complaints.repository.UserRepository;
import com.company.complaints.service.ComplaintService;
import com.company.complaints.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ComplaintFeedbackServiceTest {

    @Mock private ComplaintRepository complaintRepository;
    @Mock private ComplaintAttachmentRepository attachmentRepository;
    @Mock private ComplaintFeedbackRepository feedbackRepository;
    @Mock private ComplaintValidationRepository validationRepository;
    @Mock private UserRepository userRepository;
    @Mock private NotificationService notificationService;
    @Mock private Authentication authentication;

    @InjectMocks
    private ComplaintService complaintService;

    @Test
    void resolvedComplaintOwnerCanSubmitFeedback() {
        User customer = customer();
        Complaint complaint = resolvedComplaint(customer);
        SubmitFeedbackRequest request = request(5, "Handled clearly.");

        when(authentication.getName()).thenReturn(customer.getEmail());
        when(userRepository.findByEmail(customer.getEmail())).thenReturn(Optional.of(customer));
        when(complaintRepository.findByComplaintCode("RC-TEST-0001"))
                .thenReturn(Optional.of(complaint));
        when(validationRepository.findByComplaintId(10L)).thenReturn(Optional.empty());
        when(feedbackRepository.findByComplaintId(10L)).thenReturn(Optional.empty());
        when(feedbackRepository.save(any(ComplaintFeedback.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ComplaintFeedbackResponse response = complaintService.submitFeedback(
                "RC-TEST-0001", request, authentication);

        assertThat(response.getRating()).isEqualTo(5);
        assertThat(response.getComment()).isEqualTo("Handled clearly.");
        assertThat(response.getCustomerName()).isEqualTo("Customer");
        verify(notificationService).notifyHandlingAdmin(
                any(Complaint.class), any(), any(), any());
    }

    @Test
    void feedbackIsRejectedBeforeAdminSendsResolution() {
        User customer = customer();
        Complaint complaint = resolvedComplaint(customer);
        complaint.setStatus(ComplaintStatus.RESOLVING);

        when(authentication.getName()).thenReturn(customer.getEmail());
        when(userRepository.findByEmail(customer.getEmail())).thenReturn(Optional.of(customer));
        when(complaintRepository.findByComplaintCode("RC-TEST-0001"))
                .thenReturn(Optional.of(complaint));

        assertThatThrownBy(() -> complaintService.submitFeedback(
                "RC-TEST-0001", request(4, null), authentication))
                .isInstanceOf(ComplaintStateException.class)
                .hasMessageContaining("after the admin sends a resolution");
    }

    private User customer() {
        return User.builder()
                .id(1L)
                .name("Customer")
                .email("customer@test.com")
                .role(Role.CUSTOMER)
                .enabled(true)
                .build();
    }

    private Complaint resolvedComplaint(User customer) {
        return Complaint.builder()
                .id(10L)
                .complaintCode("RC-TEST-0001")
                .customer(customer)
                .title("Test complaint")
                .description("Description")
                .status(ComplaintStatus.RESOLVED)
                .resolution("Replacement arranged.")
                .build();
    }

    private SubmitFeedbackRequest request(int rating, String comment) {
        SubmitFeedbackRequest request = new SubmitFeedbackRequest();
        request.setRating(rating);
        request.setComment(comment);
        return request;
    }
}
