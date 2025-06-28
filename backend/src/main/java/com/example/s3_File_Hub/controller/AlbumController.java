package com.example.s3_File_Hub.controller;

import com.example.s3_File_Hub.model.Album;
import com.example.s3_File_Hub.service.AlbumService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/albums")
public class AlbumController {

    private final AlbumService albumService;

    public AlbumController(AlbumService albumService) {
        this.albumService = albumService;
    }

    @PostMapping
    public ResponseEntity<Album> createAlbum(@RequestBody Album album) {
        Album created = albumService.createAlbum(album.getName(), album.getFileKeys());
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<Album>> listAlbums() {
        return ResponseEntity.ok(albumService.listAlbums());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Album> getAlbum(@PathVariable Long id) {
        return albumService.getAlbum(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlbum(@PathVariable Long id) {
        if (albumService.getAlbum(id).isPresent()) {
            albumService.deleteAlbum(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/shared/{shareCode}")
    public ResponseEntity<Album> getSharedAlbum(@PathVariable("shareCode") String shareCode) {
        return albumService.getAlbumByShareCode(shareCode)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}