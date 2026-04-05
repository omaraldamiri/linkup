package com.softwareproject.LinkUp.exceptions;

public class UserAlreadyExistsInWorkspace extends RuntimeException {
    public UserAlreadyExistsInWorkspace(String message) {
        super(message);
    }
}
