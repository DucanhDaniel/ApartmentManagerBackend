package com.example.demoapi.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "apartment")
public class Apartment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer houseid;

    private String building;
    private Integer floor;
    private String apartmentstatus;
    private Double area;
    private String type;

}
