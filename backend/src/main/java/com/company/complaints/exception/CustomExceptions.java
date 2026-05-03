package com.company.complaints.exception;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
/** Container for all domain-specific runtime exceptions. */
public class CustomExceptions {
// Thêm đoạn này để che (hide) constructor public ngầm định
    // và ném ra lỗi nếu ai đó cố tình dùng Reflection để khởi tạo
    
    public static class EmailAlreadyExistsException extends RuntimeException {
        public EmailAlreadyExistsException(String message) {
            super(message);
        }
    }

    public static class InvalidCredentialsException extends RuntimeException {
        public InvalidCredentialsException(String message) {
            super(message);
        }
    }

    public static class UserNotFoundException extends RuntimeException {
        public UserNotFoundException(String message) {
            super(message);
        }
    }

    public static class UnauthorizedException extends RuntimeException {
        public UnauthorizedException(String message) {
            super(message);
        }
    }

    public static class ResourceNotFoundException extends RuntimeException {
        public ResourceNotFoundException(String message) {
            super(message);
        }
    }

    public class ComplaintException extends RuntimeException {
    public ComplaintException(String message) {
        super(message);
    }
}
}
