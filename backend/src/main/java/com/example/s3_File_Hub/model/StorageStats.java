package com.example.s3_File_Hub.model;

public class StorageStats {
    private final double totalMB;

    public StorageStats(double totalMB) {
        this.totalMB = totalMB;
    }

    public double getTotalMB() {
        return totalMB;
    }
}