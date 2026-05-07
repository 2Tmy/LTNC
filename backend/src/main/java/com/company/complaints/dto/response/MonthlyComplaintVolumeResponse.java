package com.company.complaints.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MonthlyComplaintVolumeResponse {
    private String month;
    private long count;
}