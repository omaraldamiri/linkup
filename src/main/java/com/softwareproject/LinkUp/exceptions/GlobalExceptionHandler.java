package com.softwareproject.LinkUp.exceptions;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<String> handleEmailException(EmailAlreadyExistsException e){

        return ResponseEntity.status(400).body(e.getMessage());

    }
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<String> handleBadCredentials(BadCredentialsException e){
        return ResponseEntity.status(401).body("Username or password are invalid , try signing in using google!");

    }
    @ExceptionHandler(SlugAlreadyExistsException.class)
    public ResponseEntity<String> handleSlugException(SlugAlreadyExistsException e){
        return ResponseEntity.status(400).body(e.getMessage());
    }
    @ExceptionHandler(WorkspaceNameExistsException.class)
    public ResponseEntity<String> handleWorkspaceNameException(WorkspaceNameExistsException e){
        return ResponseEntity.status(400).body(e.getMessage());
    }
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<String> handleUserNotFoundException(UserNotFoundException e){
        return ResponseEntity.status(400).body(e.getMessage());
    }
    @ExceptionHandler(UnAuthorizedException.class)
    public ResponseEntity<String> handleUnAuthorizedException(UnAuthorizedException e){
        return ResponseEntity.status(401).body(e.getMessage());
    }
    @ExceptionHandler(UserAlreadyExistsInWorkspace.class)
    public ResponseEntity<String> handleUserAlreadyExistsInWorkspaceException(UserAlreadyExistsInWorkspace e){
        return ResponseEntity.status(400).body(e.getMessage());
    }
    @ExceptionHandler(UserAlreadyHasRoleException.class)
    public ResponseEntity<String> handleUserAlreadyHasRoleException(UserAlreadyHasRoleException e){
        return ResponseEntity.status(400).body(e.getMessage());
    }
}
