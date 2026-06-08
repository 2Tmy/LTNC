package com.company.complaints.analysis;

import com.company.complaints.dto.AnalysisStatsDto;
import com.company.complaints.dto.AnalysisResponseDto;
import com.company.complaints.enums.Category;
import com.company.complaints.enums.ComplaintStatus;
import com.company.complaints.repository.ComplaintFeedbackRepository;
import com.company.complaints.repository.ComplaintRepository;
import com.company.complaints.repository.UserRepository;
import com.company.complaints.service.AnalysisService;
import com.company.complaints.service.OpenAiService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalysisServiceTest {

    @Mock private ComplaintRepository complaintRepository;
    @Mock private ComplaintFeedbackRepository feedbackRepository;
    @Mock private UserRepository userRepository;
    @Mock private OpenAiService openAiService;

    @InjectMocks
    private AnalysisService analysisService;

    @Test
    void loadingStatsIncludesFeedbackMetricsWithoutCallingOpenAi() {
        when(complaintRepository.count()).thenReturn(10L);
        when(complaintRepository.countGroupByStatus())
                .thenReturn(List.<Object[]>of(new Object[]{ComplaintStatus.RESOLVED, 5L}));
        when(complaintRepository.countGroupByCategory())
                .thenReturn(List.<Object[]>of(new Object[]{Category.SERVICE, 10L}));
        when(complaintRepository.findAvgResolutionDays()).thenReturn(2.5);
        when(complaintRepository.countSlaBreached(org.mockito.ArgumentMatchers.any())).thenReturn(0L);
        when(complaintRepository.countSlaWarning(
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any())).thenReturn(0L);
        when(complaintRepository.countResolvedTotal()).thenReturn(5L);
        when(complaintRepository.countRejectedResolved()).thenReturn(1L);
        when(complaintRepository.monthlyStatsByCategory(org.mockito.ArgumentMatchers.any()))
                .thenReturn(List.of());
        when(complaintRepository.monthlyAvgResolutionDays(org.mockito.ArgumentMatchers.any()))
                .thenReturn(List.of());
        when(complaintRepository.monthlySlaBreachCount(
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any()))
                .thenReturn(List.of());

        when(userRepository.countTotalCustomers()).thenReturn(8L);
        when(userRepository.countActiveCustomers()).thenReturn(8L);
        when(userRepository.countCustomersWithComplaints()).thenReturn(6L);
        when(userRepository.monthlyNewCustomers(org.mockito.ArgumentMatchers.any()))
                .thenReturn(List.of());

        when(feedbackRepository.count()).thenReturn(2L);
        when(feedbackRepository.findAverageRating()).thenReturn(3.5);
        when(feedbackRepository.countByRatingLessThanEqual(2)).thenReturn(1L);
        when(feedbackRepository.countGroupByRating()).thenReturn(List.of(
                new Object[]{2, 1L},
                new Object[]{5, 1L}
        ));

        AnalysisStatsDto stats = analysisService.getStats();

        assertThat(stats.getTotalFeedback()).isEqualTo(2L);
        assertThat(stats.getAverageRating()).isEqualTo(3.5);
        assertThat(stats.getFeedbackRate()).isEqualTo(50.0);
        assertThat(stats.getLowRatingCount()).isEqualTo(1L);
        assertThat(stats.getRatingDistribution())
                .containsEntry(2, 1L)
                .containsEntry(5, 1L);
        verifyNoInteractions(openAiService);
    }

    @Test
    void systemHealthIsCalculatedFromSlaDataInsteadOfAiResponse() {
        stubAnalysisStats(8L, 7.97);
        when(openAiService.call(org.mockito.ArgumentMatchers.anyString()))
                .thenReturn("""
                        HEALTH: HEALTHY
                        TREND_SUMMARY:
                        Test trend.
                        ROOT_CAUSE:
                        Test cause.
                        PREDICTION:
                        Test prediction.
                        IMMEDIATE:
                        - Test action.
                        SHORT_TERM:
                        - Test action.
                        WEEKLY:
                        - Test action.
                        """);

        AnalysisResponseDto analysis = analysisService.generateAiAnalysis();

        assertThat(analysis.getSystemHealth()).isEqualTo("CRITICAL");
    }

    private void stubAnalysisStats(long slaBreaches, double avgResolutionDays) {
        when(complaintRepository.count()).thenReturn(10L);
        when(complaintRepository.countGroupByStatus()).thenReturn(List.of());
        when(complaintRepository.countGroupByCategory()).thenReturn(List.of());
        when(complaintRepository.findAvgResolutionDays()).thenReturn(avgResolutionDays);
        when(complaintRepository.countSlaBreached(org.mockito.ArgumentMatchers.any()))
                .thenReturn(slaBreaches);
        when(complaintRepository.countSlaWarning(
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any())).thenReturn(0L);
        when(complaintRepository.countResolvedTotal()).thenReturn(0L);
        when(complaintRepository.countRejectedResolved()).thenReturn(0L);
        when(complaintRepository.monthlyStatsByCategory(org.mockito.ArgumentMatchers.any()))
                .thenReturn(List.of());
        when(complaintRepository.monthlyAvgResolutionDays(org.mockito.ArgumentMatchers.any()))
                .thenReturn(List.of());
        when(complaintRepository.monthlySlaBreachCount(
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any()))
                .thenReturn(List.of());
        when(userRepository.countTotalCustomers()).thenReturn(0L);
        when(userRepository.countActiveCustomers()).thenReturn(0L);
        when(userRepository.countCustomersWithComplaints()).thenReturn(0L);
        when(userRepository.monthlyNewCustomers(org.mockito.ArgumentMatchers.any()))
                .thenReturn(List.of());
        when(feedbackRepository.count()).thenReturn(0L);
        when(feedbackRepository.findAverageRating()).thenReturn(null);
        when(feedbackRepository.countByRatingLessThanEqual(2)).thenReturn(0L);
        when(feedbackRepository.countGroupByRating()).thenReturn(List.of());
    }
}
