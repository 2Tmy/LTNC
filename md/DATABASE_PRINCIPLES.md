# 📚 NGUYÊN TẮC DATABASE CƠ BẢN

## 🎯 5 NGUYÊN TẮC VÀNG

### **1. FOREIGN KEY CHỈ TRỎ ĐẾN PRIMARY KEY**
```sql
-- ❌ SAI: FK trỏ đến column thường
validated_by BIGINT REFERENCES complaints.validated_by

-- ✅ ĐÚNG: FK trỏ đến PRIMARY KEY
validated_by BIGINT REFERENCES users.id
```

### **2. CASCADE ĐÚNG MỤC ĐÍCH**
```java
// Parent-child: Xóa complaint → xóa attachments
@OneToMany(cascade = ALL, orphanRemoval = true) ✅

// Reference: Xóa complaint KHÔNG xóa user
@ManyToOne(cascade = {PERSIST, MERGE})  ✅
```

### **3. LAZY LOADING MẶC ĐỊNH**
```java
@ManyToOne(fetch = LAZY)  ✅ // Load khi cần
@ManyToOne(fetch = EAGER) ❌ // Load luôn → chậm
```

### **4. TRÁNH N+1 QUERIES**
```java
// ❌ SAI
complaints.forEach(c -> c.getCustomer()); // N queries

// ✅ ĐÚNG
@Query("SELECT c FROM Complaint c JOIN FETCH c.customer")
```

### **5. INDEX CÁC COLUMN HAY QUERY**
```java
@Index(name = "idx_status", columnList = "status") ✅
// Vì hay: WHERE status = 'SUBMITTED'
```

## ✅ CHECKLIST
```
[ ] FK → PK?
[ ] Cascade phù hợp?
[ ] LAZY loading?
[ ] Index đủ?
[ ] 3NF?
```
