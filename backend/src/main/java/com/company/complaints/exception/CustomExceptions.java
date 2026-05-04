package com.company.complaints.exception;

/** Container for all domain-specific runtime exceptions. */
public class CustomExceptions {

    public static class EmailAlreadyExistsException extends RuntimeException {
        public EmailAlreadyExistsException(String message) { super(message); }
    }

    public static class InvalidCredentialsException extends RuntimeException {
        public InvalidCredentialsException(String message) { super(message); }
    }

    public static class UserNotFoundException extends RuntimeException {
        public UserNotFoundException(String message) { super(message); }
    }

    public static class UnauthorizedException extends RuntimeException {
        public UnauthorizedException(String message) { super(message); }
    }

    public static class ComplaintNotFoundException extends RuntimeException {
        public ComplaintNotFoundException(String message) { super(message); }
    }

    /** Thrown when an action is invalid for the complaint's current status. */
    public static class ComplaintStateException extends RuntimeException {
        public ComplaintStateException(String message) { super(message); }
    }
}
