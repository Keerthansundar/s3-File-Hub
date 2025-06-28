package com.example.s3_File_Hub.controller;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.s3_File_Hub.model.StorageStats;
import com.example.s3_File_Hub.service.AlbumService;
import com.example.s3_File_Hub.service.S3Service;

@RestController
@RequestMapping("/api/files")
public class FilesController {

    private final S3Service s3Service;
    private final AlbumService albumService;

    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp",
            "video/mp4", "video/quicktime", "video/x-matroska", "video/webm", "video/avi"
    );

    public FilesController(S3Service s3Service, AlbumService albumService) {
        this.s3Service = s3Service;
        this.albumService = albumService;
    }

    @PostMapping("/upload")
    public ResponseEntity<String> upload(@RequestParam("file") MultipartFile file) throws IOException {
        String key = s3Service.uploadFile(file);
        return ResponseEntity.ok("File uploaded with key: " + key);
    }

    @GetMapping("/download/{key:.+}")
    public ResponseEntity<byte[]> download(
            @PathVariable String key,
            @RequestParam(value = "token", required = false) String token,
            HttpServletRequest request) {
        // If token is present, manually authenticate the user (for direct <img src="...">)
        if (token != null) {
            // TODO: Validate the token and set authentication context if needed
            // Example:
            // Authentication auth = jwtProvider.getAuthentication(token);
            // SecurityContextHolder.getContext().setAuthentication(auth);
        }
        byte[] data = s3Service.downloadFile(key);
        String encodedFileName = URLEncoder.encode(key, StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodedFileName + "\"")
                .body(data);
    }

    @GetMapping("/preview-url/{key:.+}")
    public ResponseEntity<String> previewUrl(@PathVariable String key) {
        String url = s3Service.getPresignedUrl(key, Duration.ofMinutes(10));
        return ResponseEntity.ok(url);
    }

    @DeleteMapping("/delete/{key:.+}")
    public ResponseEntity<String> delete(@PathVariable String key) {
        s3Service.deleteFileWithThumbnail(key);
        albumService.removeFileFromAlbums(key);
        return ResponseEntity.ok("Deleted file and its thumbnail: " + key);
    }

    @GetMapping("/list")
    public ResponseEntity<List<String>> listFiles() {
        return ResponseEntity.ok(s3Service.listFiles());
    }

    @GetMapping("/thumbnails")
    public ResponseEntity<List<String>> listThumbnails() {
        return ResponseEntity.ok(s3Service.listThumbnails());
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        StorageStats stats = s3Service.getStorageStats();
        Map<String, Object> response = new HashMap<>();
        response.put("totalMB", stats.getTotalMB());
        return response;
    }

    @PostMapping("/presign-upload")
    public ResponseEntity<Map<String, String>> getPresignedUploadUrl(
            @RequestParam String filename,
            @RequestParam String type) {
        String key = UUID.randomUUID() + "_" + filename;
        String url = s3Service.generatePresignedUploadUrl(key, type);
        Map<String, String> response = new HashMap<>();
        response.put("url", url);
        response.put("key", key);
        return ResponseEntity.ok(response);
    }
}
