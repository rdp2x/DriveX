package com.rdp.backenddrivex.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FileListResponse {
    
    private int page;
    private int size;
    private long total;
    private List<FileResponse> files;
}