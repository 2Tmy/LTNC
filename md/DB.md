enabled (boolean): Rất nhiều người mới thiết kế hay thắc mắc "Tại sao không xóa user đi mà lại sinh ra cột này làm gì?". Thực tế, nếu một nhân viên (CS_STAFF) nghỉ việc, hoặc một khách hàng có hành vi phá hoại, nguyên tắc của hệ thống quản lý là tuyệt đối không được xóa cứng (hard-delete) dòng dữ liệu đó đi. Nếu xóa, toàn bộ những khiếu nại, bình luận mà họ từng tạo ra sẽ bị lỗi "mất kết nối" (orphan data). Thay vào đó, ta chỉ cần set enabled = false. Tài khoản đó sẽ lập tức bị chặn đăng nhập, nhưng lịch sử xử lý hồ sơ vẫn còn nguyên vẹn.

created_at dùng để bộ phận thống kê xem mỗi tháng có bao nhiêu khách hàng mới đăng ký. updated_at dùng để theo dõi xem tài khoản này bị thay đổi thông tin (ví dụ: đổi mật khẩu, bị khóa enabled)

# 📚 HƯỚNG DẪN TẠO ENTITY - BEST PRACTICES

## 🎯 NGUYÊN TẮC CƠ BẢN

### **1. Entity là gì?**
Entity = Đại diện của 1 bảng database trong Java code
- 1 Entity class = 1 Table
- 1 Field trong class = 1 Column trong table
- Quan hệ giữa tables → Annotations (@OneToMany, @ManyToOne, etc.)

### **2. Cấu trúc chuẩn của 1 Entity**

```java
@Entity                    // Đánh dấu đây là Entity
@Table(name = "users")     // Tên bảng trong DB
@Data                      // Lombok: auto-generate getters/setters
@NoArgsConstructor         // Constructor không tham số (bắt buộc)
@AllArgsConstructor        // Constructor đầy đủ tham số (tiện lợi)
public class User {
    
    @Id                              // Primary Key
    @GeneratedValue(strategy = IDENTITY)  // Auto-increment
    private Long id;
    
    @Column(nullable = false)        // NOT NULL constraint
    private String name;
    
    // Relationships
    @OneToMany(mappedBy = "customer")  // 1 User → nhiều Complaints
    private List<Complaint> complaints;
}
```

---

## 📋 THỨ TỰ TẠO ENTITY

**Luôn tạo theo thứ tự phụ thuộc:**

```
1. User (không phụ thuộc ai)
   ↓
2. Complaint (phụ thuộc User)
   ↓
3. ComplaintAttachment, ComplaintValidation, ... (phụ thuộc Complaint)
```

**Lý do:** Compile lỗi nếu reference class chưa tồn tại.

---

## 🔑 CÁC ANNOTATION QUAN TRỌNG

### **Class Level:**
```java
@Entity                  // Bắt buộc - đánh dấu JPA entity
@Table(name = "...")     // Tên bảng (nếu khác tên class)
@Data                    // Lombok - tạo getters/setters/toString/equals/hashCode
@NoArgsConstructor       // Bắt buộc cho JPA
@AllArgsConstructor      // Tiện lợi khi tạo object
@Builder                 // Optional - pattern Builder (rất tiện)
```

### **Field Level:**

#### **Primary Key:**
```java
@Id                                    // Đánh dấu PK
@GeneratedValue(strategy = IDENTITY)   // Auto-increment trong DB
private Long id;
```

#### **Columns:**
```java
@Column(
    nullable = false,     // NOT NULL
    length = 255,         // VARCHAR(255)
    unique = true,        // UNIQUE constraint
    name = "email_addr"   // Tên column (nếu khác tên field)
)
private String email;
```

#### **Enums:**
```java
@Enumerated(EnumType.STRING)  // Lưu "CUSTOMER", không phải số 0,1,2
private Role role;
```

#### **Timestamps:**
```java
@CreationTimestamp           // Auto-set khi INSERT
@Column(updatable = false)   // Không update sau khi tạo
private LocalDateTime createdAt;

@UpdateTimestamp             // Auto-update mỗi lần UPDATE
private LocalDateTime updatedAt;
```

---

## 🔗 RELATIONSHIPS

### **@ManyToOne (N-1):**
```java
// Nhiều Complaints → 1 Customer
@ManyToOne(fetch = LAZY)              // LAZY = load khi cần
@JoinColumn(name = "customer_id")     // Tên FK column trong DB
private User customer;
```

### **@OneToMany (1-N):**
```java
// 1 User → Nhiều Complaints
@OneToMany(
    mappedBy = "customer",       // Tên field trong Complaint class
    cascade = ALL,               // Xóa User → xóa luôn Complaints
    orphanRemoval = true         // Xóa complaint khỏi list → xóa trong DB
)
private List<Complaint> complaints = new ArrayList<>();
```

### **@OneToOne (1-1):**
```java
// 1 Complaint → 1 Validation
@OneToOne(mappedBy = "complaint", cascade = ALL)
private ComplaintValidation validation;
```

---

## ⚡ OPTIMIZATION TIPS

### **1. LAZY vs EAGER Loading**

```java
// ✅ ĐÚNG: Dùng LAZY (default là tốt nhất)
@ManyToOne(fetch = LAZY)
private User customer;

// ❌ SAI: EAGER load tất cả (chậm!)
@ManyToOne(fetch = EAGER)
private User customer;
```

**Lý do:** 
- LAZY: Chỉ load khi `.getCustomer()` được gọi
- EAGER: Load luôn ngay cả khi không cần → waste memory

### **2. Cascade Correctly**

```java
// ✅ ĐÚNG: Parent xóa → xóa children
@OneToMany(cascade = CascadeType.ALL)
private List<ComplaintAttachment> attachments;

// ❌ SAI: Xóa Complaint nhưng attachments vẫn còn (orphan records)
@OneToMany
private List<ComplaintAttachment> attachments;
```

### **3. Initialize Collections**

```java
// ✅ ĐÚNG: Tránh NullPointerException
private List<Complaint> complaints = new ArrayList<>();

// ❌ SAI: Null by default
private List<Complaint> complaints;
```

---

## 🎨 NAMING CONVENTIONS

### **Class Names:**
```java
User              // Singular, PascalCase
Complaint         // Singular
ComplaintAttachment  // Compound name
```

### **Field Names:**
```java
private Long id;           // camelCase
private String firstName;  // camelCase
private LocalDateTime createdAt;  // camelCase
```

### **Table Names:**
```sql
users                    -- Plural, snake_case
complaints               -- Plural
complaint_attachments    -- Plural with underscore
```

---

## 🛡️ BEST PRACTICES

### **1. Luôn có `@Data` từ Lombok**
```java
@Data  // Tự động tạo getters/setters/toString/equals/hashCode
```
**Lợi ích:** Giảm 100+ dòng boilerplate code

### **2. Timestamps tự động**
```java
@CreationTimestamp
private LocalDateTime createdAt;  // Auto-set khi tạo

@UpdateTimestamp
private LocalDateTime updatedAt;  // Auto-update khi sửa
```

### **3. Indexes trong @Table**
```java
@Table(
    name = "complaints",
    indexes = {
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_customer", columnList = "customer_id")
    }
)
```
**Lợi ích:** Query nhanh hơn

### **4. Validation ở Entity level**
```java
@Email  // Validate email format
@NotBlank  // Not null and not empty
@Size(min = 3, max = 50)  // Length validation
private String email;
```

### **5. Helper Methods**
```java
// Thêm attachment vào complaint
public void addAttachment(ComplaintAttachment attachment) {
    attachments.add(attachment);
    attachment.setComplaint(this);  // Đồng bộ 2 chiều
}
```

---

## 🚫 COMMON MISTAKES

### **1. Quên @NoArgsConstructor**
```java
// ❌ SAI: JPA sẽ lỗi
@AllArgsConstructor
public class User { }

// ✅ ĐÚNG: Phải có cả 2
@NoArgsConstructor
@AllArgsConstructor
public class User { }
```

### **2. Dùng EAGER loading**
```java
// ❌ SAI: Load tất cả mọi lúc
@OneToMany(fetch = EAGER)

// ✅ ĐÚNG: Chỉ load khi cần
@OneToMany(fetch = LAZY)
```

### **3. Quên initialize List**
```java
// ❌ SAI: NullPointerException khi .add()
private List<Complaint> complaints;

// ✅ ĐÚNG
private List<Complaint> complaints = new ArrayList<>();
```

### **4. Sai cascade type**
```java
// ❌ SAI: Xóa user không xóa complaints → orphan records
@OneToMany(mappedBy = "customer")

// ✅ ĐÚNG: Xóa user → xóa luôn complaints
@OneToMany(mappedBy = "customer", cascade = ALL, orphanRemoval = true)
```

---

## 📝 TEMPLATE ENTITY

```java
package com.company.complaints.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity mô tả [TABLE_NAME]
 * 
 * Relationships:
 * - [Mô tả quan hệ với các bảng khác]
 */
@Entity
@Table(
    name = "table_name",
    indexes = {
        @Index(name = "idx_field1", columnList = "field1"),
        @Index(name = "idx_field2", columnList = "field2")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EntityName {
    
    // ==================== PRIMARY KEY ====================
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // ==================== BASIC FIELDS ====================
    @Column(nullable = false, length = 255)
    private String field1;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EnumType enumField;
    
    // ==================== RELATIONSHIPS ====================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id", nullable = false)
    private ParentEntity parent;
    
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChildEntity> children = new ArrayList<>();
    
    // ==================== TIMESTAMPS ====================
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // ==================== HELPER METHODS ====================
    public void addChild(ChildEntity child) {
        children.add(child);
        child.setParent(this);
    }
    
    public void removeChild(ChildEntity child) {
        children.remove(child);
        child.setParent(null);
    }
}
```

---

## 🎯 CHECKLIST KHI TẠO ENTITY

```
[ ] @Entity annotation
[ ] @Table với tên bảng
[ ] @Data, @NoArgsConstructor, @AllArgsConstructor
[ ] @Id và @GeneratedValue cho PK
[ ] @Column với constraints phù hợp
[ ] @Enumerated(STRING) cho enums
[ ] @ManyToOne/@OneToMany với fetch = LAZY
[ ] @CreationTimestamp và @UpdateTimestamp
[ ] Initialize Lists = new ArrayList<>()
[ ] Indexes cho các column hay query
[ ] Helper methods cho relationships
[ ] Javadoc mô tả entity
```

---

Bây giờ tôi sẽ tạo các Entity theo schema của bạn! 🚀