# 📚 SERVICE LAYER - TẠI SAO VÀ LÀM THẾ NÀO?

## 🎯 TẠI SAO CẦN SERVICE LAYER?

### **3-Layer Architecture**
```
Controller (API)    → Nhận request, gọi Service, trả response
    ↓
Service (Logic)     → Business logic, validation, orchestration
    ↓
Repository (Data)   → Truy cập database
```

### **Tại sao không gọi Repository trực tiếp từ Controller?**

```java
// ❌ SAI: Controller gọi Repository trực tiếp
@RestController
public class ComplaintController {
    @Autowired
    private ComplaintRepository repo;
    
    @PostMapping("/complaints")
    public Complaint create(@RequestBody Complaint complaint) {
        return repo.save(complaint);  // ← Không validation, không business logic
    }
}
```

**Vấn đề:**
- ❌ Không validation (email format, required fields, etc.)
- ❌ Không business logic (status transitions, permissions, etc.)
- ❌ Không transactions (nếu cần save nhiều tables)
- ❌ Không reusable (code trùng lặp ở nhiều controller)
- ❌ Khó test (phải mock Controller + Repository cùng lúc)

```java
// ✅ ĐÚNG: Controller → Service → Repository
@RestController
public class ComplaintController {
    @Autowired
    private ComplaintService service;
    
    @PostMapping("/complaints")
    public ComplaintResponse create(@RequestBody CreateComplaintRequest request) {
        return service.createComplaint(request);  // ← Service xử lý mọi logic
    }
}

@Service
public class ComplaintService {
    @Autowired
    private ComplaintRepository complaintRepo;
    
    @Transactional
    public ComplaintResponse createComplaint(CreateComplaintRequest request) {
        // 1. Validation
        validateRequest(request);
        
        // 2. Business logic
        Complaint complaint = new Complaint();
        complaint.setTitle(request.getTitle());
        complaint.setStatus(ComplaintStatus.SUBMITTED);
        // ... set other fields
        
        // 3. Save
        Complaint saved = complaintRepo.save(complaint);
        
        // 4. Send notification
        notificationService.sendComplaintReceived(saved);
        
        // 5. Convert to DTO
        return ComplaintResponse.from(saved);
    }
}
```

---

## 🏗️ SERVICE LAYER PATTERN

### **Single Responsibility Principle**

Mỗi Service chỉ làm 1 việc:

```
ComplaintService      → CRUD complaints, status transitions
ValidationService     → Validate complaints (Function 2)
NotificationService   → Send notifications
FileService           → Upload/download files
```

### **Dependency Injection**

```java
@Service
public class ComplaintService {
    
    private final ComplaintRepository complaintRepo;
    private final UserRepository userRepo;
    private final NotificationService notificationService;
    
    // Constructor injection (khuyến nghị)
    public ComplaintService(
        ComplaintRepository complaintRepo,
        UserRepository userRepo,
        NotificationService notificationService
    ) {
        this.complaintRepo = complaintRepo;
        this.userRepo = userRepo;
        this.notificationService = notificationService;
    }
}
```

**Tại sao dùng Constructor Injection?**
- ✅ Required dependencies rõ ràng
- ✅ Immutable (final fields)
- ✅ Dễ test (mock dependencies trong constructor)
- ✅ Tránh NullPointerException

---

## 💼 BUSINESS LOGIC EXAMPLES

### **1. Validation**
```java
private void validateCreateComplaint(CreateComplaintRequest request) {
    // Required fields
    if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
        throw new ValidationException("Title is required");
    }
    
    // Length
    if (request.getTitle().length() < 10) {
        throw new ValidationException("Title must be at least 10 characters");
    }
    
    // Business rule
    if (request.getPriority() == ComplaintPriority.URGENT) {
        // Urgent complaints require evidence
        if (request.getAttachments() == null || request.getAttachments().isEmpty()) {
            throw new ValidationException("Urgent complaints require evidence");
        }
    }
}
```

### **2. Status Transition**
```java
public void updateStatus(Long complaintId, ComplaintStatus newStatus, Long userId) {
    Complaint complaint = findById(complaintId);
    
    // Check permission
    User user = userRepo.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User", userId));
    
    if (!user.canChangeStatus(complaint, newStatus)) {
        throw new UnauthorizedException("You cannot change status to " + newStatus);
    }
    
    // Check valid transition
    if (!complaint.getStatus().canTransitionTo(newStatus)) {
        throw new InvalidStatusTransitionException(
            complaint.getStatus().name(), 
            newStatus.name()
        );
    }
    
    // Update
    complaint.updateStatus(newStatus);
    complaintRepo.save(complaint);
    
    // Create audit trail
    createStatusHistory(complaint, newStatus, user);
}
```

### **3. Transaction Management**
```java
@Transactional  // Tất cả hoặc không (atomicity)
public ComplaintResponse submitComplaint(CreateComplaintRequest request, Long customerId) {
    // 1. Create complaint
    Complaint complaint = createComplaint(request, customerId);
    
    // 2. Upload attachments
    for (MultipartFile file : request.getFiles()) {
        AttachmentDto attachment = fileService.upload(file, complaint.getId());
        complaint.addAttachment(attachment.toEntity());
    }
    
    // 3. Send notification
    notificationService.notifyComplaintReceived(complaint);
    
    // 4. Create SLA tracker
    slaService.createTracker(complaint);
    
    return ComplaintResponse.from(complaint);
    
    // Nếu bất kỳ step nào fail → rollback tất cả
}
```

---

## 🎯 SERVICE METHOD NAMING

### **Convention:**
```java
// CRUD
create()           // Tạo mới
update()           // Update
delete()           // Xóa
findById()         // Tìm theo ID
findAll()          // Lấy tất cả

// Business operations
submit()           // Submit complaint
validate()         // Validate complaint
assign()           // Assign to staff
approve()          // Approve resolution

// Queries
getComplaintsByCustomer()
getPendingValidation()
getOverdueComplaints()
```

---

## ✅ SERVICE CHECKLIST

```
[ ] @Service annotation
[ ] Constructor injection (không dùng @Autowired)
[ ] Private methods cho validation
[ ] @Transactional cho multi-step operations
[ ] Throw custom exceptions (ResourceNotFoundException, etc.)
[ ] Return DTOs, không return Entities
[ ] Log important operations
[ ] Handle nulls safely
```

---

## 🚫 ANTI-PATTERNS

### **1. Service gọi Service khác quá nhiều**
```java
// ❌ SAI: Spaghetti dependencies
@Service
class ComplaintService {
    @Autowired ValidationService validationService;
    @Autowired NotificationService notificationService;
    @Autowired FileService fileService;
    @Autowired SLAService slaService;
    @Autowired EmailService emailService;
    @Autowired SMSService smsService;
    // ... 10 services khác
}
```

**Giải pháp:** Tách nhỏ, hoặc dùng Events/Message Queue

### **2. Return Entities từ Service**
```java
// ❌ SAI: Expose entity
public Complaint getComplaint(Long id) {
    return complaintRepo.findById(id).orElseThrow();
}

// ✅ ĐÚNG: Return DTO
public ComplaintResponse getComplaint(Long id) {
    Complaint complaint = complaintRepo.findById(id).orElseThrow();
    return ComplaintResponse.from(complaint);
}
```

**Lý do:** Entity có thể lazy load → lỗi khi serialize JSON

---

Bây giờ tôi sẽ tạo Service implementations! 🚀
