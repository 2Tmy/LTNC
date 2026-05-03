# 📚 REPOSITORY GUIDE - NGUYÊN TẮC VÀ PATTERN

## 🎯 Repository là gì?

Repository = Lớp truy cập database
- Kế thừa `JpaRepository<Entity, ID>`
- Spring Data JPA tự động implement methods
- Custom queries bằng `@Query` hoặc method naming

## 🔑 BUILT-IN METHODS (không cần viết)

```java
public interface UserRepository extends JpaRepository<User, Long> {
    // ✅ Tự động có sẵn:
    save(user)              // INSERT hoặc UPDATE
    findById(id)            // SELECT WHERE id = ?
    findAll()               // SELECT * FROM users
    deleteById(id)          // DELETE WHERE id = ?
    count()                 // SELECT COUNT(*)
    existsById(id)          // Check tồn tại
}
```

## 📝 QUERY METHODS - Naming Pattern

Spring tự động parse tên method → SQL:

```java
// Pattern: findBy + FieldName + Condition
findByEmail(String email)                     // WHERE email = ?
findByRole(Role role)                         // WHERE role = ?
findByEnabledTrue()                           // WHERE enabled = true
findByEmailAndEnabled(String email, Boolean)  // WHERE email = ? AND enabled = ?
findByIdIn(List<Long> ids)                    // WHERE id IN (?)
findByCreatedAtAfter(LocalDateTime date)      // WHERE created_at > ?
findByNameContaining(String keyword)          // WHERE name LIKE %keyword%
```

**Quy tắc đặt tên:**
- `findBy`: SELECT
- `countBy`: COUNT
- `deleteBy`: DELETE
- `existsBy`: EXISTS

## 💪 CUSTOM QUERIES - @Query

Khi nào dùng:
- Query phức tạp (JOIN, GROUP BY, sub-query)
- Performance optimization
- Naming pattern không đủ

```java
@Query("SELECT u FROM User u WHERE u.email = :email")
Optional<User> findByEmailCustom(@Param("email") String email);

// Native SQL
@Query(value = "SELECT * FROM users WHERE email = ?1", nativeQuery = true)
User findByEmailNative(String email);
```

## ⚡ PERFORMANCE TIPS

### **1. JOIN FETCH - Tránh N+1**
```java
@Query("SELECT c FROM Complaint c JOIN FETCH c.customer WHERE c.id = :id")
Optional<Complaint> findByIdWithCustomer(@Param("id") Long id);
```

### **2. Projection - Chỉ lấy cần thiết**
```java
interface ComplaintSummary {
    Long getId();
    String getTitle();
    String getStatus();
}

List<ComplaintSummary> findAllBy();  // Chỉ lấy 3 fields
```

### **3. @EntityGraph - Alternative cho JOIN FETCH**
```java
@EntityGraph(attributePaths = {"customer", "attachments"})
List<Complaint> findAll();
```

---

Bây giờ tạo repositories...
