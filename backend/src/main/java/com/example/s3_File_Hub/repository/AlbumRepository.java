package com.example.s3_File_Hub.repository;

import com.example.s3_File_Hub.model.Album;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AlbumRepository extends JpaRepository<Album, Long> {
    boolean existsByName(String name);

    Optional<Album> findByShareCode(String code);
}