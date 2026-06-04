package com.company.complaints.service;

import com.company.complaints.dto.AnalysisResponseDto;
import com.company.complaints.dto.AnalysisStatsDto;
import com.company.complaints.dto.MonthlyTrendDto;
import com.company.complaints.enums.Category;
import com.company.complaints.enums.ComplaintStatus;
import com.company.complaints.repository.ComplaintRepository;
import com.company.complaints.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalysisService {

    private static final int SLA_DAYS = 15;
    private static final int WARNING_DAYS = 3;
    private static final DateTimeFormatter GENERATED_AT_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final OpenAiService openAiService;

    public AnalysisResponseDto generateAnalysis() {
        AnalysisStatsDto stats = aggregateStats();
        String prompt = buildPrompt(stats);
        String aiText;
        try {
            aiText = openAiService.call(prompt);
        } catch (RuntimeException e) {
            log.warn("OpenAI analysis failed, returning stats with fallback insights", e);
            aiText = """
                    HEALTH: WARNING

                    TREND_SUMMARY:
                    Không thể tải phân tích AI tại thời điểm này. Dữ liệu thống kê vẫn được cập nhật từ hệ thống.

                    ROOT_CAUSE:
                    Chưa thể xác định nguyên nhân gốc rễ bằng AI vì kết nối OpenAI không thành công.

                    PREDICTION:
                    Nếu chưa có phân tích AI, tháng tới cần theo dõi sát lượng khiếu nại và SLA dựa trên dữ liệu hiện tại.

                    IMMEDIATE:
                    - Kiểm tra cấu hình OpenAI API key và trạng thái kết nối.
                    SHORT_TERM:
                    - Thử tải lại AI insights sau khi xác nhận API hoạt động.
                    WEEKLY:
                    - Theo dõi độ ổn định của tích hợp AI trong báo cáo vận hành.
                    """;
        }
        return parseResponse(aiText, stats);
    }

    private AnalysisStatsDto aggregateStats() {
        Long totalComplaints = complaintRepository.count();

        Map<ComplaintStatus, Long> statusCounts = new EnumMap<>(ComplaintStatus.class);
        for (ComplaintStatus status : ComplaintStatus.values()) {
            statusCounts.put(status, 0L);
        }
        List<Object[]> statusRows = complaintRepository.countGroupByStatus();
        if (statusRows != null) {
            for (Object[] row : statusRows) {
                if (row != null && row.length >= 2 && row[0] instanceof ComplaintStatus status && row[1] instanceof Number count) {
                    statusCounts.put(status, count.longValue());
                }
            }
        }
        Map<String, Long> countByStatus = new LinkedHashMap<>();
        for (ComplaintStatus status : ComplaintStatus.values()) {
            countByStatus.put(status.name(), statusCounts.getOrDefault(status, 0L));
        }

        Map<Category, Long> categoryCounts = new EnumMap<>(Category.class);
        for (Category category : Category.values()) {
            categoryCounts.put(category, 0L);
        }
        List<Object[]> categoryRows = complaintRepository.countGroupByCategory();
        if (categoryRows != null) {
            for (Object[] row : categoryRows) {
                if (row != null && row.length >= 2 && row[0] instanceof Category category && row[1] instanceof Number count) {
                    categoryCounts.put(category, count.longValue());
                }
            }
        }
        Map<String, Long> countByCategory = new LinkedHashMap<>();
        for (Category category : Category.values()) {
            countByCategory.put(category.name(), categoryCounts.getOrDefault(category, 0L));
        }

        Double avgResolutionDays = complaintRepository.findAvgResolutionDays();
        if (avgResolutionDays == null) {
            avgResolutionDays = 0.0;
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime cutoff = now.minusDays(SLA_DAYS);
        LocalDateTime warningStart = now.minusDays(SLA_DAYS);
        LocalDateTime warningEnd = now.minusDays(SLA_DAYS - WARNING_DAYS);

        Long slaBreachCount = complaintRepository.countSlaBreached(cutoff);
        if (slaBreachCount == null) {
            slaBreachCount = 0L;
        }
        Long slaWarningCount = complaintRepository.countSlaWarning(warningStart, warningEnd);
        if (slaWarningCount == null) {
            slaWarningCount = 0L;
        }

        Long totalResolved = complaintRepository.countResolvedTotal();
        if (totalResolved == null) {
            totalResolved = 0L;
        }
        Long rejected = complaintRepository.countRejectedResolved();
        if (rejected == null) {
            rejected = 0L;
        }
        Double rejectionRate = totalResolved > 0 ? (rejected.doubleValue() / totalResolved.doubleValue()) * 100.0 : 0.0;

        Long totalCustomers = userRepository.countTotalCustomers();
        if (totalCustomers == null) {
            totalCustomers = 0L;
        }
        Long activeCustomers = userRepository.countActiveCustomers();
        if (activeCustomers == null) {
            activeCustomers = 0L;
        }
        Long customersWithComplaints = userRepository.countCustomersWithComplaints();
        if (customersWithComplaints == null) {
            customersWithComplaints = 0L;
        }
        Double avgComplaintsPerCustomer = totalCustomers > 0
                ? totalComplaints.doubleValue() / totalCustomers.doubleValue()
                : 0.0;

        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6)
                .withDayOfMonth(1)
                .withHour(0).withMinute(0).withSecond(0);

        Map<String, MonthlyTrendDto> trendByMonth = new LinkedHashMap<>();
        List<Object[]> monthlyCategoryRows = complaintRepository.monthlyStatsByCategory(sixMonthsAgo);
        if (monthlyCategoryRows != null) {
            for (Object[] row : monthlyCategoryRows) {
                if (row == null || row.length < 4 || !(row[0] instanceof Number yearValue)
                        || !(row[1] instanceof Number monthValue) || !(row[3] instanceof Number countValue)) {
                    continue;
                }

                int year = yearValue.intValue();
                int month = monthValue.intValue();
                long count = countValue.longValue();
                String key = year + "-" + month;
                String category = row[2] instanceof Category categoryValue
                        ? categoryValue.name()
                        : String.valueOf(row[2]);

                MonthlyTrendDto trend = trendByMonth.computeIfAbsent(key, ignored -> MonthlyTrendDto.builder()
                        .year(year)
                        .month(month)
                        .totalComplaints(0L)
                        .byCategory(defaultCategoryCounts())
                        .avgResolutionDays(0.0)
                        .slaBreachCount(0L)
                        .newCustomers(0L)
                        .build());
                trend.setTotalComplaints(trend.getTotalComplaints() + count);
                trend.getByCategory().put(category, trend.getByCategory().getOrDefault(category, 0L) + count);
            }
        }

        List<Object[]> monthlyAvgRows = complaintRepository.monthlyAvgResolutionDays(sixMonthsAgo);
        if (monthlyAvgRows != null) {
            for (Object[] row : monthlyAvgRows) {
                if (row == null || row.length < 3 || !(row[0] instanceof Number yearValue)
                        || !(row[1] instanceof Number monthValue)) {
                    continue;
                }

                int year = yearValue.intValue();
                int month = monthValue.intValue();
                String key = year + "-" + month;
                double monthlyAvgDays = row[2] instanceof Number avgValue ? avgValue.doubleValue() : 0.0;

                MonthlyTrendDto trend = trendByMonth.computeIfAbsent(key, ignored -> MonthlyTrendDto.builder()
                        .year(year)
                        .month(month)
                        .totalComplaints(0L)
                        .byCategory(defaultCategoryCounts())
                        .avgResolutionDays(0.0)
                        .slaBreachCount(0L)
                        .newCustomers(0L)
                        .build());
                trend.setAvgResolutionDays(monthlyAvgDays);
            }
        }

        List<Object[]> monthlyBreachRows = complaintRepository.monthlySlaBreachCount(sixMonthsAgo, cutoff);
        if (monthlyBreachRows != null) {
            for (Object[] row : monthlyBreachRows) {
                if (row == null || row.length < 3 || !(row[0] instanceof Number yearValue)
                        || !(row[1] instanceof Number monthValue) || !(row[2] instanceof Number countValue)) {
                    continue;
                }
                int year = yearValue.intValue();
                int month = monthValue.intValue();
                String key = year + "-" + month;
                MonthlyTrendDto trend = trendByMonth.computeIfAbsent(key, ignored -> MonthlyTrendDto.builder()
                        .year(year)
                        .month(month)
                        .totalComplaints(0L)
                        .byCategory(defaultCategoryCounts())
                        .avgResolutionDays(0.0)
                        .slaBreachCount(0L)
                        .newCustomers(0L)
                        .build());
                trend.setSlaBreachCount(countValue.longValue());
            }
        }

        List<Object[]> monthlyCustomerRows = userRepository.monthlyNewCustomers(sixMonthsAgo);
        if (monthlyCustomerRows != null) {
            for (Object[] row : monthlyCustomerRows) {
                if (row == null || row.length < 3 || !(row[0] instanceof Number yearValue)
                        || !(row[1] instanceof Number monthValue) || !(row[2] instanceof Number countValue)) {
                    continue;
                }

                int year = yearValue.intValue();
                int month = monthValue.intValue();
                String key = year + "-" + month;
                MonthlyTrendDto trend = trendByMonth.computeIfAbsent(key, ignored -> MonthlyTrendDto.builder()
                        .year(year)
                        .month(month)
                        .totalComplaints(0L)
                        .byCategory(defaultCategoryCounts())
                        .avgResolutionDays(0.0)
                        .slaBreachCount(0L)
                        .newCustomers(0L)
                        .build());
                trend.setNewCustomers(countValue.longValue());
            }
        }

        List<MonthlyTrendDto> monthlyTrend = trendByMonth.values().stream()
                .sorted(Comparator.comparingInt(MonthlyTrendDto::getYear)
                        .thenComparingInt(MonthlyTrendDto::getMonth))
                .toList();

        return AnalysisStatsDto.builder()
                .totalComplaints(totalComplaints)
                .countByStatus(countByStatus)
                .countByCategory(countByCategory)
                .avgResolutionDays(avgResolutionDays)
                .rejectionRate(rejectionRate)
                .slaBreachCount(slaBreachCount)
                .slaWarningCount(slaWarningCount)
                .totalCustomers(totalCustomers)
                .activeCustomers(activeCustomers)
                .customersWithComplaints(customersWithComplaints)
                .avgComplaintsPerCustomer(avgComplaintsPerCustomer)
                .monthlyTrend(monthlyTrend)
                .build();
    }

    private String buildPrompt(AnalysisStatsDto stats) {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        int nextMonth = LocalDate.now().plusMonths(1).getMonthValue();
        int nextYear = LocalDate.now().plusMonths(1).getYear();

        Map<String, Long> byStatus = stats.getCountByStatus() != null ? stats.getCountByStatus() : Map.of();
        Map<String, Long> byCategory = stats.getCountByCategory() != null ? stats.getCountByCategory() : Map.of();
        List<MonthlyTrendDto> monthlyTrend = stats.getMonthlyTrend() != null ? stats.getMonthlyTrend() : List.of();

        StringBuilder p = new StringBuilder(2048);
        p.append("Bạn là chuyên gia phân tích vận hành hệ thống quản lý khiếu nại khách hàng. Hôm nay: ").append(today).append(".\n\n");

        p.append("=== XU HƯỚNG 6 THÁNG ===\n");
        p.append("  tháng | tổng | PRODUCT | SERVICE | DELIVERY | BILLING | OTHER | avg_ngày | sla_breach\n");
        if (monthlyTrend.isEmpty()) {
            p.append("  (chưa có dữ liệu)\n");
        } else {
            for (MonthlyTrendDto t : monthlyTrend) {
                p.append("  ").append(t.getMonth()).append("/").append(t.getYear())
                        .append(" | ").append(t.getTotalComplaints())
                        .append(" | ").append(getCategoryCount(t, "PRODUCT"))
                        .append(" | ").append(getCategoryCount(t, "SERVICE"))
                        .append(" | ").append(getCategoryCount(t, "DELIVERY"))
                        .append(" | ").append(getCategoryCount(t, "BILLING"))
                        .append(" | ").append(getCategoryCount(t, "OTHER"))
                        .append(" | ").append(String.format("%.1f", t.getAvgResolutionDays()))
                        .append(" | ").append(t.getSlaBreachCount()).append("\n");
            }
        }

        p.append("\n=== SNAPSHOT HIỆN TẠI ===\n");
        p.append("Tổng khiếu nại: ").append(stats.getTotalComplaints()).append("\n");
        p.append("Theo trạng thái:\n");
        p.append("  PENDING (chờ tiếp nhận): ").append(byStatus.getOrDefault("PENDING", 0L)).append("\n");
        p.append("  VALIDATING (đang xem xét): ").append(byStatus.getOrDefault("VALIDATING", 0L)).append("\n");
        p.append("  RESOLVING (đang xử lý): ").append(byStatus.getOrDefault("RESOLVING", 0L)).append("\n");
        p.append("  RESOLVED (đã giải quyết): ").append(byStatus.getOrDefault("RESOLVED", 0L)).append("\n");
        p.append("Theo danh mục:\n");
        p.append("  PRODUCT (sản phẩm): ").append(byCategory.getOrDefault("PRODUCT", 0L)).append("\n");
        p.append("  SERVICE (dịch vụ): ").append(byCategory.getOrDefault("SERVICE", 0L)).append("\n");
        p.append("  DELIVERY (giao hàng): ").append(byCategory.getOrDefault("DELIVERY", 0L)).append("\n");
        p.append("  BILLING (thanh toán): ").append(byCategory.getOrDefault("BILLING", 0L)).append("\n");
        p.append("  OTHER (khác): ").append(byCategory.getOrDefault("OTHER", 0L)).append("\n");
        p.append("Hiệu suất SLA (giới hạn 15 ngày/khiếu nại):\n");
        p.append("  Avg resolution days: ").append(String.format("%.1f", stats.getAvgResolutionDays())).append(" ngày\n");
        p.append("  SLA đã vi phạm (>15 ngày, chưa giải quyết): ").append(stats.getSlaBreachCount()).append("\n");
        p.append("  SLA sắp hết hạn (12-15 ngày): ").append(stats.getSlaWarningCount()).append("\n");
        p.append("  Ty le tu choi / khong hop le: ").append(String.format("%.1f", stats.getRejectionRate())).append("%\n");
        p.append("Khách hàng:\n");
        p.append("  Tổng: ").append(stats.getTotalCustomers())
                .append(" | Đang hoạt động: ").append(stats.getActiveCustomers())
                .append(" | Có khiếu nại: ").append(stats.getCustomersWithComplaints())
                .append(" | Avg/khách: ").append(String.format("%.2f", stats.getAvgComplaintsPerCustomer())).append("\n");

        p.append("\n=== YÊU CẦU ===\n");
        p.append("Chi dung dung so tu du lieu tren. Khong bia so. Khong them text ngoai format.\n\n");
        p.append("HEALTH: [HEALTHY|WARNING|CRITICAL]\n");
        p.append("Quy tac:\n");
        p.append("  HEALTHY = slaBreachCount=0 VA avgDays<10\n");
        p.append("  WARNING = slaBreachCount 1-5 HOAC avgDays 10-15\n");
        p.append("  CRITICAL = slaBreachCount>5 HOAC avgDays>15\n\n");
        p.append("TREND_SUMMARY:\n");
        p.append("[4-5 cau, PHAI dung so cu the: thang cao nhat/thap nhat, phan tram thay doi thang gan nhat so voi thang truoc, danh muc nao tang/giam manh nhat.]\n\n");
        p.append("ROOT_CAUSE:\n");
        p.append("[3-4 cau: danh muc chiem ty le cao nhat la gi, co moi lien he giua danh muc tang va SLA breach khong, mau lap lai theo thang nao.]\n\n");
        p.append("PREDICTION:\n");
        p.append("[2 cau. Cau 1: du bao luong khieu nai thang ").append(nextMonth).append("/").append(nextYear)
                .append(" (neu con so uoc tinh). Cau 2: rui ro SLA neu khong can thiep.]\n\n");
        p.append("IMMEDIATE:\n");
        p.append("- [hanh dong uu tien voi so lieu cu the, vi du: xu ly ngay ").append(stats.getSlaBreachCount()).append(" khieu nai da vuot SLA]\n");
        p.append("- [hanh dong 2 neu can]\n\n");
        p.append("SHORT_TERM:\n");
        p.append("- [hanh dong trong 24-48h lien quan den ").append(stats.getSlaWarningCount()).append(" khieu nai sap het han SLA]\n\n");
        p.append("WEEKLY:\n");
        p.append("- [hanh dong tuan nay de cai thien avg resolution time tu ").append(String.format("%.1f", stats.getAvgResolutionDays())).append(" ngay]\n");

        return p.toString();
    }

    private AnalysisResponseDto parseResponse(String aiText, AnalysisStatsDto stats) {
        String health = "WARNING";
        String narrative = "";
        String trendSummary = "";
        String rootCause = "";
        String prediction = "";
        List<String> immediateActions = new ArrayList<>();
        List<String> shortTermActions = new ArrayList<>();
        List<String> weeklyActions = new ArrayList<>();

        try {
            String currentSection = "";
            StringBuilder narrativeBuilder = new StringBuilder();
            StringBuilder trendSummaryBuilder = new StringBuilder();
            StringBuilder rootCauseBuilder = new StringBuilder();
            StringBuilder predictionBuilder = new StringBuilder();

            for (String rawLine : aiText.split("\\R")) {
                String line = rawLine.trim().replace("**", "");
                if (line.isEmpty()) {
                    continue;
                }

                String upperLine = line.toUpperCase();
                if (upperLine.startsWith("HEALTH:")) {
                    String parsedHealth = line.substring(line.indexOf(':') + 1).trim().toUpperCase();
                    if ("HEALTHY".equals(parsedHealth) || "WARNING".equals(parsedHealth) || "CRITICAL".equals(parsedHealth)) {
                        health = parsedHealth;
                    }
                    currentSection = "HEALTH";
                } else if (upperLine.startsWith("NARRATIVE:")) {
                    currentSection = "NARRATIVE";
                    appendInlineSectionContent(line, narrativeBuilder);
                } else if (upperLine.startsWith("TREND_SUMMARY:") || upperLine.startsWith("TREND SUMMARY:")) {
                    currentSection = "TREND_SUMMARY";
                    appendInlineSectionContent(line, trendSummaryBuilder);
                } else if (upperLine.startsWith("ROOT_CAUSE:") || upperLine.startsWith("ROOT CAUSE:")) {
                    currentSection = "ROOT_CAUSE";
                    appendInlineSectionContent(line, rootCauseBuilder);
                } else if (upperLine.startsWith("PREDICTION:")) {
                    currentSection = "PREDICTION";
                    appendInlineSectionContent(line, predictionBuilder);
                } else if (upperLine.startsWith("IMMEDIATE:")) {
                    currentSection = "IMMEDIATE";
                    addInlineSectionItem(line, immediateActions);
                } else if (upperLine.startsWith("SHORT_TERM:") || upperLine.startsWith("SHORT TERM:")) {
                    currentSection = "SHORT_TERM";
                    addInlineSectionItem(line, shortTermActions);
                } else if (upperLine.startsWith("WEEKLY:")) {
                    currentSection = "WEEKLY";
                    addInlineSectionItem(line, weeklyActions);
                } else if (isActionLine(line)) {
                    String item = normalizeActionItem(line);
                    if (!item.isEmpty()) {
                        if ("IMMEDIATE".equals(currentSection)) {
                            immediateActions.add(item);
                        } else if ("SHORT_TERM".equals(currentSection)) {
                            shortTermActions.add(item);
                        } else if ("WEEKLY".equals(currentSection)) {
                            weeklyActions.add(item);
                        }
                    }
                } else if ("NARRATIVE".equals(currentSection)) {
                    appendSectionLine(narrativeBuilder, line);
                } else if ("TREND_SUMMARY".equals(currentSection)) {
                    appendSectionLine(trendSummaryBuilder, line);
                } else if ("ROOT_CAUSE".equals(currentSection)) {
                    appendSectionLine(rootCauseBuilder, line);
                } else if ("PREDICTION".equals(currentSection)) {
                    appendSectionLine(predictionBuilder, line);
                }
            }

            narrative = narrativeBuilder.toString();
            trendSummary = trendSummaryBuilder.toString();
            rootCause = rootCauseBuilder.toString();
            prediction = predictionBuilder.toString();
            if (narrative.isBlank()) {
                narrative = !trendSummary.isBlank() ? trendSummary : aiText;
            }
            if (trendSummary.isBlank()) {
                trendSummary = "Chưa có đủ nội dung xu hướng từ AI; vui lòng xem bảng dữ liệu 6 tháng trong stats.monthlyTrend.";
            }
            if (rootCause.isBlank()) {
                rootCause = "Chưa có đủ nội dung nguyên nhân gốc rễ từ AI; cần đối chiếu thêm pattern theo danh mục và SLA.";
            }
            if (prediction.isBlank()) {
                prediction = "Chưa có đủ nội dung dự đoán từ AI; cần theo dõi tháng kế tiếp dựa trên xu hướng hiện tại.";
            }
        } catch (Exception e) {
            log.warn("Failed to parse OpenAI analysis response", e);
            narrative = aiText;
            trendSummary = "Không thể parse phần xu hướng từ phản hồi AI.";
            rootCause = "Không thể parse phần nguyên nhân gốc rễ từ phản hồi AI.";
            prediction = "Không thể parse phần dự đoán từ phản hồi AI.";
            health = "WARNING";
            immediateActions = new ArrayList<>();
            shortTermActions = new ArrayList<>();
            weeklyActions = new ArrayList<>();
        }

        addFallbackActions(stats, immediateActions, shortTermActions, weeklyActions);

        return AnalysisResponseDto.builder()
                .stats(stats)
                .narrative(narrative)
                .trendSummary(trendSummary)
                .rootCause(rootCause)
                .prediction(prediction)
                .immediateActions(immediateActions)
                .shortTermActions(shortTermActions)
                .weeklyActions(weeklyActions)
                .systemHealth(health)
                .generatedAt(LocalDateTime.now().format(GENERATED_AT_FORMATTER))
                .build();
    }

    private Map<String, Long> defaultCategoryCounts() {
        Map<String, Long> byCategory = new LinkedHashMap<>();
        for (Category category : Category.values()) {
            byCategory.put(category.name(), 0L);
        }
        return byCategory;
    }

    private long getCategoryCount(MonthlyTrendDto trend, String category) {
        if (trend.getByCategory() == null) {
            return 0L;
        }
        return trend.getByCategory().getOrDefault(category, 0L);
    }

    private void appendInlineSectionContent(String line, StringBuilder builder) {
        int colonIndex = line.indexOf(':');
        if (colonIndex < 0 || colonIndex == line.length() - 1) {
            return;
        }
        String content = line.substring(colonIndex + 1).trim();
        if (!content.isEmpty() && !content.startsWith("[")) {
            appendSectionLine(builder, content);
        }
    }

    private void appendSectionLine(StringBuilder builder, String line) {
        if (!builder.isEmpty()) {
            builder.append(" ");
        }
        builder.append(line);
    }

    private boolean isActionLine(String line) {
        return line.startsWith("- ")
                || line.startsWith("* ")
                || line.startsWith("• ")
                || line.matches("\\d+[.)]\\s+.+");
    }

    private String normalizeActionItem(String line) {
        if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• ")) {
            return line.substring(2).trim();
        }
        return line.replaceFirst("^\\d+[.)]\\s+", "").trim();
    }

    private void addInlineSectionItem(String line, List<String> actions) {
        int colonIndex = line.indexOf(':');
        if (colonIndex < 0 || colonIndex == line.length() - 1) {
            return;
        }
        String item = line.substring(colonIndex + 1).trim();
        if (!item.isEmpty() && !item.startsWith("[") && !item.endsWith(":")) {
            actions.add(normalizeActionItem(item));
        }
    }

    private void addFallbackActions(AnalysisStatsDto stats,
                                    List<String> immediateActions,
                                    List<String> shortTermActions,
                                    List<String> weeklyActions) {
        if (immediateActions.isEmpty()) {
            if (stats.getSlaBreachCount() != null && stats.getSlaBreachCount() > 0) {
                immediateActions.add("Rà soát và ưu tiên xử lý ngay các khiếu nại đã quá hạn SLA.");
            } else {
                immediateActions.add("Kiểm tra hàng đợi khiếu nại đang chờ xử lý trong ngày.");
            }
        }
        if (shortTermActions.isEmpty()) {
            if (stats.getSlaWarningCount() != null && stats.getSlaWarningCount() > 0) {
                shortTermActions.add("Phân công nhân sự xử lý các khiếu nại sắp tới hạn trong 24 giờ.");
            } else {
                shortTermActions.add("Cập nhật trạng thái các khiếu nại đang VALIDATING và RESOLVING.");
            }
        }
        if (weeklyActions.isEmpty()) {
            weeklyActions.add("Tổng hợp nguyên nhân trễ SLA và điều chỉnh quy trình xử lý trong tuần.");
        }
    }
}
