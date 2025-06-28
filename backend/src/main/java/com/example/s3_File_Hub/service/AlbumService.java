package com.example.s3_File_Hub.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import java.util.UUID;

import com.example.s3_File_Hub.model.Album;
import com.example.s3_File_Hub.repository.AlbumRepository;

@Service
public class AlbumService {
    private final AlbumRepository albumRepository;

    public AlbumService(AlbumRepository albumRepository) {
        this.albumRepository = albumRepository;
    }


    public Album createAlbum(String name, List<String> fileKeys) {
        if (albumRepository.existsByName(name)) {
            throw new IllegalArgumentException("Album with this name already exists");
        }

        Album album = new Album(name, fileKeys);
        album.setShareCode(generateUniqueCode());
        album.setExpiresAt(LocalDateTime.now().plusDays(7));
        return albumRepository.save(album);
    }

    private String generateUniqueCode() {
        return UUID.randomUUID().toString().substring(0, 8); // or customize format/length here
    }

    public List<Album> listAlbums() {
        return albumRepository.findAll();
    }

    public void removeFileFromAlbums(String fileKey) {
        List<Album> albums = albumRepository.findAll();
        for (Album album : albums) {
            if (album.getFileKeys().remove(fileKey)) {
                albumRepository.save(album);
            }
        }
    }

    public Optional<Album> getAlbum(Long id) {
        return albumRepository.findById(id);
    }

    public void deleteAlbum(Long id) {
        albumRepository.deleteById(id);
    }

    public Optional<Album> getAlbumByShareCode(String code) {
        return albumRepository.findByShareCode(code)
                .filter(album -> album.getExpiresAt() == null || album.getExpiresAt().isAfter(LocalDateTime.now()));
    }
}