package com.example.s3_File_Hub.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
}