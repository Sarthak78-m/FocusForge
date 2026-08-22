package com.mindsprint.exception;

public class SessionConflictException extends RuntimeException {

    public SessionConflictException(String message) {
        super(message);
    }
}
